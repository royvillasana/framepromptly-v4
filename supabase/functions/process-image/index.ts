import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { fileUrl, fileName, projectId, title } = await req.json();

    console.log('Processing image:', { fileUrl, fileName, projectId, title });

    // Use OpenAI Vision API to analyze the image
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image and provide a detailed description of what you see. Include any text, objects, people, settings, colors, and any other relevant details that would be useful for context in a UX project knowledge base.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: fileUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const imageDescription = openAIData.choices[0]?.message?.content;

    if (!imageDescription) {
      throw new Error('Failed to get image description from OpenAI');
    }

    console.log('Image analyzed successfully, description length:', imageDescription.length);

    // Save to knowledge base
    const { data: knowledgeEntry, error: insertError } = await supabase
      .from('knowledge_base')
      .insert({
        project_id: projectId,
        title: title || `Image: ${fileName}`,
        content: imageDescription,
        type: 'image',
        file_name: fileName,
        file_url: fileUrl,
        metadata: {
          analyzed_at: new Date().toISOString(),
          model_used: 'gpt-4o'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving to knowledge base:', insertError);
      throw insertError;
    }

    console.log('Image processed successfully:', knowledgeEntry.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        knowledgeEntry,
        description: imageDescription 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process image' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});