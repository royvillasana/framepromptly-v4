import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { 
      promptContent, 
      variables, 
      projectId, 
      frameworkName, 
      stageName, 
      toolName 
    } = await req.json();

    console.log('Generating AI prompt for:', { frameworkName, stageName, toolName, projectId });

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Replace variables in prompt content
    let processedPrompt = promptContent;
    Object.entries(variables || {}).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedPrompt = processedPrompt.replace(regex, value as string);
    });

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate AI response using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a UX design expert assistant. Generate comprehensive, actionable outputs for the ${toolName} tool in the ${stageName} stage of the ${frameworkName} framework. Provide practical, detailed responses that practitioners can immediately use.`
          },
          {
            role: 'user',
            content: processedPrompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    console.log('AI response generated successfully');

    // Save prompt to database
    const { data: promptData, error: insertError } = await supabase
      .from('prompts')
      .insert({
        project_id: projectId,
        user_id: user.id,
        framework_name: frameworkName,
        stage_name: stageName,
        tool_name: toolName,
        prompt_content: processedPrompt,
        ai_response: aiResponse,
        variables: variables || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving prompt:', insertError);
      throw new Error('Failed to save prompt to database');
    }

    console.log('Prompt saved to database with ID:', promptData.id);

    return new Response(JSON.stringify({
      id: promptData.id,
      prompt: processedPrompt,
      aiResponse: aiResponse,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-prompt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});