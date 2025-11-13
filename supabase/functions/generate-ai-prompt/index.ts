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
      knowledgeContext,
      existingPromptId
    } = await req.json();

    console.log('🚀 Generating AI prompt for:', { frameworkName, stageName, toolName, projectId, hasKnowledge: !!knowledgeContext, existingPromptId });

    // Validate required parameters
    if (!promptContent || !projectId || !frameworkName || !stageName || !toolName) {
      throw new Error('Missing required parameters: promptContent, projectId, frameworkName, stageName, or toolName');
    }

    // Check if this is a stress test request (allow anonymous access)
    const isStressTest = projectId && projectId.toString().startsWith('ai-stress-test-');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables:', { hasUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey });
      throw new Error('Missing Supabase environment variables');
    }

    console.log('✅ Environment variables found');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created');

    // Load project AI settings
    const aiSettings = await loadProjectAISettings(supabase, projectId);

    let user = null;

    if (!isStressTest) {
      // Regular requests require authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('❌ No authorization header found');
        throw new Error('No authorization header');
      }

      // Get user from JWT - use anon key client for auth validation
      const jwt = authHeader.replace('Bearer ', '');
      console.log('🔐 Validating user JWT...');

      try {
        // Use service role key for JWT validation - it can validate all JWTs
        const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser(jwt);

        if (authError) {
          console.error('❌ Auth error:', authError.message);
          console.error('❌ Auth error code:', authError.code);
          console.error('❌ Auth error status:', authError.status);
          throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (!authenticatedUser) {
          console.error('❌ No user found in JWT');
          throw new Error('Invalid authentication - no user found');
        }

        user = authenticatedUser;
        console.log('✅ User authenticated:', user.id);
      } catch (err) {
        console.error('❌ Exception during auth:', err);
        console.error('❌ Exception details:', err.message);
        console.error('❌ Exception stack:', err.stack);
        throw err;
      }
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

    // Process knowledge context into formatted string
    let knowledgeBaseContent = '';
    if (knowledgeContext && Array.isArray(knowledgeContext) && knowledgeContext.length > 0) {
      console.log('📚 Processing knowledge context:', knowledgeContext.length, 'entries');
      knowledgeBaseContent = knowledgeContext
        .map((entry: any) => {
          if (entry && entry.title && entry.content) {
            return `### ${entry.title}\n\n${entry.content}`;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n\n---\n\n');
      console.log('📚 Formatted knowledge base length:', knowledgeBaseContent.length);
    } else {
      console.log('📚 No knowledge context provided');
      knowledgeBaseContent = 'No project context available. Please add knowledge base documents to provide context for this tool.';
    }

    // Add knowledgeBase to variables for replacement
    const allVariables = {
      ...variables,
      knowledgeBase: knowledgeBaseContent
    };

    // Replace variables in prompt content
    let processedPrompt = promptContent;
    Object.entries(allVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedPrompt = processedPrompt.replace(regex, value as string);
    });

    console.log('✅ Knowledge context integrated via template variables');
    console.log('📊 Final prompt length:', processedPrompt.length);
    console.log('📊 Knowledge base content length:', knowledgeBaseContent.length);

    // Return the processed prompt directly - no AI call needed
    // The prompt is already complete with instructions, context, and brackets
    const aiResponse = processedPrompt;

    console.log('✅ Returning complete prompt template (bypassing AI call)');

    // Save prompt to database (skip for anonymous stress tests)
    let promptData = null;
    let structuredPromptId = null;

    console.log('💾 Database save check:', { isStressTest, hasUser: !!user, userId: user?.id });

    if (!isStressTest && user) {
      console.log('✅ Proceeding with database save for user:', user.id);
      // Check if we should create a version instead of a new prompt
      // Version tracking is now enabled with proper trigger timing
      const versioningEnabled = true;

      if (existingPromptId && versioningEnabled) {
        console.log('📝 Creating new version for existing prompt:', existingPromptId);

        // Get the existing prompt to find the current version number
        const { data: existingPrompt, error: fetchError } = await supabase
          .from('prompts')
          .select('current_version, total_versions')
          .eq('id', existingPromptId)
          .single();

        if (fetchError) {
          console.error('Error fetching existing prompt:', fetchError);
          throw new Error(`Failed to fetch existing prompt: ${fetchError.message}`);
        }

        const newVersionNumber = (existingPrompt.total_versions || 0) + 1;

        // Create a new version
        const { data: newVersion, error: versionError } = await supabase
          .from('prompt_versions')
          .insert({
            prompt_id: existingPromptId,
            user_id: user.id,
            version_number: newVersionNumber,
            version_title: `Version ${newVersionNumber}`,
            is_active: true,
            prompt_content: processedPrompt,
            variables: variables || {},
            conversation: [],
            ai_response: aiResponse,
            change_summary: 'Regenerated from tool node'
          })
          .select()
          .single();

        if (versionError) {
          console.error('Error creating version:', versionError);
          throw new Error(`Failed to create version: ${versionError.message}`);
        }

        // Update the prompt's version counters and make this the active version
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            current_version: newVersionNumber,
            total_versions: newVersionNumber,
            prompt_content: processedPrompt,
            ai_response: aiResponse
          })
          .eq('id', existingPromptId);

        if (updateError) {
          console.error('Error updating prompt version counters:', updateError);
          throw new Error(`Failed to update version counters: ${updateError.message}`);
        }

        // Deactivate all other versions
        await supabase
          .from('prompt_versions')
          .update({ is_active: false })
          .eq('prompt_id', existingPromptId)
          .neq('id', newVersion.id);

        promptData = { id: existingPromptId };
        console.log('✅ New version created:', newVersionNumber);
      } else {
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
          console.error('Error details:', JSON.stringify(insertError, null, 2));
          throw new Error(`Failed to save prompt to database: ${insertError.message || insertError.code || 'Unknown error'}`);
        }

        if (!savedPrompt) {
          console.error('❌ No data returned from prompt insert');
          throw new Error('Failed to save prompt: No data returned from database');
        }

        promptData = savedPrompt;
        console.log('✅ Flat prompt saved to database with ID:', promptData.id);
      }

      // Step 2: Parse and save to "structured_prompts" table
      try {
        console.log('🔄 Parsing prompt into structured sections...');
        console.log('🔄 Parse input:', { promptLength: processedPrompt.length, toolName, hasUser: !!user, userId: user?.id });
        const parseResult = parseAIPromptToStructured(processedPrompt, toolName);
        console.log('✅ Parse completed successfully');

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

      console.log('✅ Final prompt data ready with ID:', promptData.id);
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
    console.error('❌ Error in generate-ai-prompt function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error occurred',
      details: error.toString(),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});