import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default AI method settings for fallback
const DEFAULT_AI_SETTINGS = {
  promptStructure: 'framework-guided',
  creativityLevel: 'balanced',
  reasoning: 'step-by-step',
  adaptability: 'context-aware',
  validation: 'built-in',
  personalization: 'user-preferences',
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
};

// Helper function to load project AI settings
async function loadProjectAISettings(supabase: any, projectId: string) {
  try {
    if (!projectId || projectId.toString().startsWith('ai-stress-test-')) {
      console.log('🔧 Using default settings for stress test or missing project ID');
      return DEFAULT_AI_SETTINGS;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select('enhanced_settings')
      .eq('id', projectId)
      .single();

    if (error) {
      console.warn('Failed to load project settings, using defaults:', error.message);
      return DEFAULT_AI_SETTINGS;
    }

    const enhancedSettings = project?.enhanced_settings;
    const aiMethodSettings = enhancedSettings?.aiMethodSettings;

    if (!aiMethodSettings) {
      console.log('🔧 No AI method settings found, using defaults');
      return DEFAULT_AI_SETTINGS;
    }

    // Validate and sanitize parameters
    const validatedSettings = {
      promptStructure: aiMethodSettings.promptStructure || DEFAULT_AI_SETTINGS.promptStructure,
      creativityLevel: aiMethodSettings.creativityLevel || DEFAULT_AI_SETTINGS.creativityLevel,
      reasoning: aiMethodSettings.reasoning || DEFAULT_AI_SETTINGS.reasoning,
      adaptability: aiMethodSettings.adaptability || DEFAULT_AI_SETTINGS.adaptability,
      validation: aiMethodSettings.validation || DEFAULT_AI_SETTINGS.validation,
      personalization: aiMethodSettings.personalization || DEFAULT_AI_SETTINGS.personalization,
      temperature: Math.max(0.1, Math.min(2.0, aiMethodSettings.temperature || DEFAULT_AI_SETTINGS.temperature)),
      topP: Math.max(0.1, Math.min(1.0, aiMethodSettings.topP || DEFAULT_AI_SETTINGS.topP)),
      topK: Math.max(1, Math.min(100, aiMethodSettings.topK || DEFAULT_AI_SETTINGS.topK)),
    };

    console.log('🔧 Loaded AI settings:', validatedSettings);
    return validatedSettings;
  } catch (error) {
    console.error('Error loading AI settings:', error);
    return DEFAULT_AI_SETTINGS;
  }
}

// Dynamic system prompt builder based on AI settings
function buildSystemPrompt(aiSettings: any, toolName: string, stageName: string, frameworkName: string) {
  let basePrompt = "You are a professional UX methodology expert. Generate comprehensive, practical instructions for UX practitioners.";
  
  // Apply creativity level modifications
  const creativityInstructions = {
    conservative: `
Your response should be methodical and based on proven methodologies:
- Focus on well-established UX practices and documented best practices
- Minimize experimental or unproven techniques
- Emphasize reliable, time-tested approaches
- Include references to established frameworks and standards`,
    
    balanced: `
Your response should balance proven methodologies with innovative approaches:
- Include both established practices and emerging techniques
- Provide a mix of traditional and modern UX approaches
- Balance innovation with practical considerations
- Reference both classic and contemporary methodologies`,
    
    creative: `
Your response should explore innovative UX approaches and creative solutions:
- Include emerging methodologies and experimental techniques
- Encourage creative problem-solving approaches
- Suggest novel applications of established practices
- Explore cutting-edge UX research and methodologies`,
    
    experimental: `
Your response should prioritize cutting-edge, experimental UX approaches:
- Generate innovative and speculative methodologies
- Include the latest research-backed techniques
- Encourage boundary-pushing experimental practices
- Suggest novel, untested but promising approaches`
  };

  // Apply reasoning style modifications
  const reasoningInstructions = {
    'step-by-step': `
Structure your response with clear, numbered steps and logical progression:
- Use numbered steps and sub-steps
- Include decision trees and flowcharts where helpful
- Provide detailed methodology with clear sequences
- Break complex processes into manageable phases`,
    
    direct: `
Provide concise, actionable instructions with minimal explanation:
- Focus on immediate, actionable tasks
- Minimize background theory and explanation
- Use bullet points and brief, clear statements
- Prioritize what to do over why to do it`,
    
    exploratory: `
Present multiple approaches and encourage experimentation:
- Offer several alternative methodology options
- Include comparative analysis of different approaches
- Encourage adaptation and customization
- Provide framework for choosing between options`
  };

  // Apply validation level modifications
  const validationInstructions = {
    none: "",
    basic: `
Include basic success indicators:
- Provide simple completion criteria
- Include basic quality checkpoints`,
    
    'built-in': `
Include comprehensive validation and success criteria:
- Provide detailed success metrics and measurement methods
- Include validation checkpoints throughout the process
- Add quality assurance steps and review criteria
- Specify expected outcomes and deliverables`,
    
    comprehensive: `
Include extensive validation, measurement, and optimization:
- Provide multiple validation approaches and success metrics
- Include detailed quality assurance and review processes
- Add risk assessment and mitigation strategies
- Specify measurement methods, KPIs, and optimization opportunities
- Include post-completion evaluation and improvement recommendations`
  };

  // Combine all instructions
  const creativityInstruction = creativityInstructions[aiSettings.creativityLevel] || creativityInstructions.balanced;
  const reasoningInstruction = reasoningInstructions[aiSettings.reasoning] || reasoningInstructions['step-by-step'];
  const validationInstruction = validationInstructions[aiSettings.validation] || validationInstructions['built-in'];

  const fullSystemPrompt = `${basePrompt}

${creativityInstruction}

${reasoningInstruction}

${validationInstruction}

Your response should be:
- Professional and actionable
- Well-structured with clear sections
- Include specific steps, methods, and deliverables
- Provide concrete examples when helpful
- Be ready for immediate use by UX teams

When a Project Knowledge Base is provided, integrate that context into your instructions.

Generate detailed professional instructions for ${toolName} in the ${stageName} stage of the ${frameworkName} framework.`;

  return fullSystemPrompt;
}

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

    // Check if this is a stress test request (allow anonymous access)
    const isStressTest = projectId && projectId.toString().startsWith('ai-stress-test-');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Load project AI settings
    const aiSettings = await loadProjectAISettings(supabase, projectId);

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
      console.log('🧪 Stress test mode: Allowing anonymous access');
      const authHeader = req.headers.get('Authorization');
      const apikeyHeader = req.headers.get('apikey');
      
      if (authHeader && authHeader.includes('Bearer ')) {
        // Try to get user if there's a valid JWT, but don't fail if it doesn't work
        try {
          const jwt = authHeader.replace('Bearer ', '');
          const { data: { user: possibleUser } } = await supabase.auth.getUser(jwt);
          if (possibleUser) {
            user = possibleUser;
            console.log('🧪 Stress test found authenticated user:', user.id);
          }
        } catch (e) {
          console.log('🧪 Stress test: No valid user token, proceeding anonymously');
        }
      }
      
      // Verify we have at least the apikey header for basic validation
      if (!apikeyHeader && !authHeader) {
        throw new Error('Stress test requires at least apikey header');
      }
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
        console.log('🎛️ Using AI settings:', {
          temperature: aiSettings.temperature,
          topP: aiSettings.topP,
          creativityLevel: aiSettings.creativityLevel,
          reasoning: aiSettings.reasoning,
          validation: aiSettings.validation
        });

        // Build dynamic system prompt based on user settings
        const dynamicSystemPrompt = buildSystemPrompt(aiSettings, toolName, stageName, frameworkName);

        const payload: Record<string, unknown> = {
          model,
          messages: [
            {
              role: 'system',
              content: dynamicSystemPrompt
            },
            { role: 'user', content: processedPrompt }
          ],
          temperature: aiSettings.temperature,
          max_tokens: 1500,
          top_p: aiSettings.topP,
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

    // Save prompt to database (skip for anonymous stress tests)
    let promptData = null;
    
    if (!isStressTest && user) {
      const { data: savedPrompt, error: insertError } = await supabase
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

      promptData = savedPrompt;
      console.log('Prompt saved to database with ID:', promptData.id);
    } else {
      console.log('🧪 Stress test mode: Skipping database save');
      promptData = {
        id: `stress-test-${Date.now()}`,
        project_id: projectId,
        framework_name: frameworkName,
        stage_name: stageName,
        tool_name: toolName,
        prompt_content: processedPrompt,
        ai_response: aiResponse,
        variables: variables || {}
      };
    }

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