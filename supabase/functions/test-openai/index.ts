import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('OpenAI API key exists:', !!openAIApiKey);
    console.log('OpenAI API key prefix:', openAIApiKey.substring(0, 8) + '...');

    // Test OpenAI API with a simple call
    const testPayload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "API test successful" and nothing else.'
        }
      ],
      max_tokens: 10,
      temperature: 0
    };

    console.log('Making test request to OpenAI...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI error response:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API error: ${openAIResponse.status} - ${errorText}`,
        keyExists: !!openAIApiKey
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await openAIResponse.json();
    console.log('OpenAI response:', aiData);

    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI API is working correctly',
      response: aiData.choices?.[0]?.message?.content || 'No response',
      keyExists: !!openAIApiKey,
      model: 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing OpenAI:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});