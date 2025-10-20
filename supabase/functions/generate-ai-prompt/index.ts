import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseAIPromptToStructured } from '../_shared/ai-prompt-parser.ts';

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
  // System prompt that returns the template AS-IS without modification
  const fullSystemPrompt = `You are a helpful assistant that outputs content exactly as requested.

CRITICAL INSTRUCTIONS:
- Return the user's prompt EXACTLY as provided
- Do NOT modify, enhance, or add any content
- Do NOT remove any brackets or placeholder text
- Do NOT fill in any bracketed placeholders
- Do NOT add explanations, headers, or additional formatting
- Simply return the exact text provided by the user

Your only job is to echo back the prompt content unchanged.`;

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

    // Knowledge context is already integrated in the template via {{knowledgeBase}} variable
    // No additional wrapping needed - the template already has "## Project Context:" section
    console.log('Knowledge context integrated via template variables');
    console.log('Final prompt length:', processedPrompt.length);

    // Return the processed prompt directly - no AI call needed
    // The prompt is already complete with instructions, context, and brackets
    const aiResponse = processedPrompt;

    console.log('✅ Returning complete prompt template (bypassing AI call)');

    // Save prompt to database (skip for anonymous stress tests)
    let promptData = null;
    let structuredPromptId = null;

    if (!isStressTest && user) {
      // Step 1: Save to old "prompts" table (backwards compatibility)
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
      console.log('✅ Flat prompt saved to database with ID:', promptData.id);

      // Step 2: Parse and save to "structured_prompts" table
      try {
        console.log('🔄 Parsing prompt into structured sections...');
        const parseResult = parseAIPromptToStructured(processedPrompt, toolName);

        console.log('📊 Parse result:', {
          confidence: parseResult.confidence,
          warnings: parseResult.warnings,
          parser_version: parseResult.parser_version
        });

        // Save structured prompt
        const { data: structuredPrompt, error: structuredError } = await supabase
          .from('structured_prompts')
          .insert({
            user_id: user.id,
            project_id: projectId,
            framework_name: frameworkName,
            stage_name: stageName,
            tool_name: toolName,
            title: `${toolName} - AI Generated`,
            description: `AI-generated prompt for ${toolName} in ${frameworkName}`,
            role_section: parseResult.role_section,
            context_section: parseResult.context_section,
            task_section: parseResult.task_section,
            constraints_section: parseResult.constraints_section,
            format_section: parseResult.format_section,
            examples_section: parseResult.examples_section,
            compiled_prompt: processedPrompt,
            is_library_prompt: true,
            // Store parsing metadata for debugging
            // metadata: {
            //   parse_confidence: parseResult.confidence,
            //   parse_warnings: parseResult.warnings,
            //   parser_version: parseResult.parser_version
            // }
          })
          .select('id')
          .single();

        if (structuredError) {
          console.error('⚠️  Error saving structured prompt:', structuredError);
          // Don't fail the request - flat prompt is already saved
        } else {
          structuredPromptId = structuredPrompt.id;
          console.log('✅ Structured prompt saved with ID:', structuredPromptId);
          console.log(`   Confidence: ${(parseResult.confidence * 100).toFixed(0)}%`);
          if (parseResult.warnings.length > 0) {
            console.log('   Warnings:', parseResult.warnings.join(', '));
          }
        }
      } catch (parseError) {
        console.error('⚠️  Error during parsing/saving structured prompt:', parseError);
        // Continue - flat prompt is already saved
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
      structured_prompt_id: structuredPromptId, // NEW: Link to structured version
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