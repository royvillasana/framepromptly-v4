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
      toolName,
      knowledgeContext 
    } = await req.json();

    console.log('Generating AI prompt for:', { frameworkName, stageName, toolName, projectId, hasKnowledge: !!knowledgeContext });

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

    // Add knowledge context if provided
    if (knowledgeContext && knowledgeContext.length > 0) {
      console.log('Processing knowledge context:', knowledgeContext.length, 'entries');
      const contextContent = knowledgeContext
        .map((item: any) => `**${item.title}:**\n${item.content}`)
        .join('\n\n---\n\n');
      processedPrompt = `=== PROJECT KNOWLEDGE BASE ===
The following knowledge base contains critical project context. You MUST integrate this information into your instructions:

${contextContent}

=== END KNOWLEDGE BASE ===

Based on the above project knowledge, generate customized instructions for:

${processedPrompt}`;
      console.log('Final prompt length with context:', processedPrompt.length);
    } else {
      console.log('No knowledge context provided');
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate AI response using OpenAI with model fallback
    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    let aiResponse: string | null = null;
    let usedModel = '';

    for (const model of models) {
      try {
        console.log('Attempting OpenAI call with model:', model);
        const payload: Record<string, unknown> = {
          model,
          messages: [
            {
              role: 'system',
              content: `You are an AI instruction generator optimized for conversational chat interfaces. Your responses will be analyzed and split into coherent chat bubbles for better user comprehension.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
- Structure responses in logical, digestible sections
- Use clear paragraph breaks to separate different concepts
- Start each major section with action words: Create, Generate, Build, Design, List, Define
- Include brief explanations to provide context for each instruction
- Use numbered steps or bullet points for actionable items
- Add examples where helpful for clarity
- Include transitional phrases to connect related concepts

OPTIMAL BUBBLE DISSECTION FORMAT:
Structure your response with these elements in order:

1. INTRODUCTION (1-2 sentences)
Brief context about what will be accomplished and why it's valuable.

2. MAIN INSTRUCTIONS (separate paragraphs for each major step)
Each step should be 2-4 sentences with:
- Clear action statement
- Brief rationale or context
- Specific deliverable description

3. EXAMPLES (when applicable)
Concrete examples that illustrate the concepts with "For example:" or "Such as:"

4. ADDITIONAL CONSIDERATIONS (if needed)
Important notes, tips, or variations in a separate paragraph

5. EXPECTED OUTCOMES (1-2 sentences)
What the user should have accomplished after following the instructions

ENHANCED BUBBLE-FRIENDLY PATTERNS:
- Use "First," "Next," "Then," "Finally" for sequential steps
- Include questions like "What should you focus on?" to create engagement
- Add emphasis markers for important concepts: "Remember:" "Key point:" "Important:"
- Use specific numbers and timeframes: "15-20 questions" "45-60 minutes"
- Include validation checkpoints: "You'll know this is working when..."

FORBIDDEN PATTERNS FOR CHAT BUBBLES:
- Long unbroken paragraphs (>100 words)
- Dense technical blocks without breaks
- Repetitive introductory phrases
- Overly formal or academic language
- Run-on sentences that can't be easily split

KNOWLEDGE BASE INTEGRATION:
When a Project Knowledge Base is provided:
- Reference specific project details in separate paragraphs
- Create custom examples based on the project context
- Adapt generic instructions to the project's domain
- Include project-specific success criteria
- Make connections between different knowledge base elements

Generate comprehensive, bubble-friendly instructions for ${toolName} in ${stageName} stage of ${frameworkName} framework. Structure your response to flow naturally when split into conversation bubbles, with each paragraph serving as a coherent, self-contained piece of guidance.`
            },
            { role: 'user', content: processedPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        };

        // Remove max_tokens as it's already set in payload above

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
        console.log(`Successfully generated response with model: ${model}`);
        break;
      } catch (modelErr) {
        console.error('Error with model', model, modelErr);
        continue;
      }
    }

    if (!aiResponse) {
      throw new Error('OpenAI API error: All model attempts failed');
    }

    console.log('AI response generated successfully using model:', usedModel);

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