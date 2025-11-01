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
      knowledgeContext,
      executeAsNewPrompt
    } = await req.json();

    console.log('AI Conversation request:', { 
      projectId, 
      hasInitialPrompt: !!initialPrompt,
      hasKnowledge: !!knowledgeContext?.length,
      conversationLength: conversationHistory?.length || 0,
      executeAsNewPrompt: !!executeAsNewPrompt
    });

    // Check if this is a stress test request (allow anonymous access)
    const isStressTest = projectId && projectId.toString().startsWith('ai-stress-test-');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let user = null;
    
    if (!isStressTest) {
      // Regular requests require authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      // Get user from JWT
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser(jwt);
      
      if (authError || !authenticatedUser) {
        throw new Error('Invalid authentication');
      }
      
      user = authenticatedUser;
    } else {
      // Stress test mode: Allow anonymous access
      console.log('🧪 Conversation stress test mode: Allowing anonymous access');
      const authHeader = req.headers.get('Authorization');
      const apikeyHeader = req.headers.get('apikey');
      
      if (authHeader && authHeader.includes('Bearer ')) {
        // Try to get user if there's a valid JWT, but don't fail if it doesn't work
        try {
          const jwt = authHeader.replace('Bearer ', '');
          const { data: { user: possibleUser } } = await supabase.auth.getUser(jwt);
          if (possibleUser) {
            user = possibleUser;
            console.log('🧪 Conversation stress test found authenticated user:', user.id);
          }
        } catch (e) {
          console.log('🧪 Conversation stress test: No valid user token, proceeding anonymously');
        }
      }
      
      // Verify we have at least the apikey header for basic validation
      if (!apikeyHeader && !authHeader) {
        throw new Error('Stress test requires at least apikey header');
      }
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
        content: executeAsNewPrompt ?
          `You are a professional AI assistant executing prompts and instructions for UX practitioners. The user is providing you with a detailed prompt that they want you to execute.

CRITICAL INSTRUCTIONS:
- Respond ONLY with the actual deliverable content requested
- Do NOT include conversational introductions like "Sure! Here is..." or "Here's what you need..."
- Do NOT include closing remarks like "Feel free to copy..." or "Let me know if..."
- Do NOT explain what you're about to do - just do it
- Start immediately with the actual content they requested
- End immediately when the content is complete
- Be direct, professional, and get straight to the deliverable

TASK EXECUTION GUIDELINES:
- If they provide a task list, complete each task directly
- If they ask questions, answer them without preamble
- If they give you a scenario to analyze, provide the analysis immediately
- If they want you to create something, create it without announcing it
- If they want you to explain something, provide the explanation directly
- Do NOT repeat or restate their prompt - execute it

${contextString ? `KNOWLEDGE BASE CONTEXT:\n${contextString}\n\n` : ''}Execute their request and provide ONLY the actual deliverable content.` :
          `You are a professional UX methodology expert and AI assistant helping with design and workflow optimization. Generate comprehensive, practical responses for UX practitioners.

CRITICAL RESPONSE FORMAT:
- Respond with ONLY the actual content requested
- Do NOT include conversational wrappers like "Sure!" or "Here you go!"
- Do NOT add closing remarks or sign-offs
- Start directly with the deliverable content
- End when the content is complete

Your response should be:
- Professional and actionable
- Well-structured with clear sections
- Include specific steps, methods, and deliverables
- Provide concrete examples when helpful
- Include success criteria and validation methods
- Be ready for immediate use by UX teams
- FREE of conversational fluff or meta-commentary

${initialPrompt ? `INITIAL PROMPT CONTEXT:\n${initialPrompt}\n\n` : ''}${contextString ? `KNOWLEDGE BASE CONTEXT:\n${contextString}\n\n` : ''}Respond to the user's questions and requests based on this context.`
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
    const finalUserMessage = executeAsNewPrompt 
      ? `Please execute the following prompt/instruction and provide the actual results:\n\n${userMessage}`
      : userMessage;
      
    messages.push({
      role: 'user',
      content: finalUserMessage
    });

    console.log('Final messages being sent to OpenAI:', {
      systemPromptLength: messages[0].content.length,
      userMessageLength: finalUserMessage.length,
      executeAsNewPrompt,
      totalMessages: messages.length
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
          max_tokens: 4000, // Increased from 800 to allow much longer, complete responses
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
          
          // Handle quota exceeded error specifically
          if (errorData?.error?.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please add credits to your OpenAI account at https://platform.openai.com/billing or contact your administrator.');
          }
          
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