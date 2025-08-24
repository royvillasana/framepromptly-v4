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
      userMessage, 
      initialPrompt,
      conversationHistory,
      projectId,
      knowledgeContext
    } = await req.json();

    console.log('AI Conversation request:', { 
      projectId, 
      hasInitialPrompt: !!initialPrompt,
      hasKnowledge: !!knowledgeContext?.length,
      conversationLength: conversationHistory?.length || 0
    });

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

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build context from knowledge base
    let contextString = '';
    if (knowledgeContext && knowledgeContext.length > 0) {
      contextString = knowledgeContext
        .map((item: any) => `${item.title}: ${item.content}`)
        .join('\n\n');
    }

    // Build conversation messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant helping with UX design and workflow optimization. You have access to the user's initial prompt context and project knowledge base.

CONVERSATION GUIDELINES:
- Provide concise, actionable responses
- Reference the initial prompt context when relevant
- Use knowledge base information to provide specific, contextual advice
- Be conversational but focused
- Ask clarifying questions when needed
- Suggest practical next steps

INITIAL PROMPT CONTEXT:
${initialPrompt || 'No initial prompt provided'}

${contextString ? `KNOWLEDGE BASE CONTEXT:\n${contextString}` : 'No additional knowledge base context available'}

Respond to the user's questions and requests based on this context. Keep responses concise and actionable.`
      }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Generate AI response using OpenAI with model fallback
    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    let aiResponse: string | null = null;
    let usedModel = '';

    for (const model of models) {
      try {
        console.log('Attempting OpenAI conversation with model:', model);
        const payload = {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 1,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        };

        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          let errorData: any;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: { message: errorText } };
          }
          console.error(`OpenAI API error (${openAIResponse.status}):`, errorData);
          
          // Try next model on specific errors
          if (errorData?.error?.code === 'model_not_found' || 
              errorData?.error?.type === 'invalid_request_error' ||
              openAIResponse.status === 404) {
            console.log(`Model ${model} not available, trying next model`);
            continue;
          }
          
          // For other errors, continue to next model
          continue;
        }

        const aiData = await openAIResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (!content || content.trim().length === 0) {
          console.error('Empty response from OpenAI for model:', model);
          continue;
        }
        
        aiResponse = content.trim();
        usedModel = model;
        console.log(`Successfully generated conversation response with model: ${model}`);
        break;
      } catch (modelErr) {
        console.error('Error with model', model, modelErr);
        continue;
      }
    }

    if (!aiResponse) {
      throw new Error('OpenAI API error: All model attempts failed');
    }

    console.log('AI conversation response generated successfully using model:', usedModel);

    return new Response(JSON.stringify({
      response: aiResponse,
      model: usedModel,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-conversation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});