-- =============================================================================
-- STRUCTURED PROMPTS MIGRATION
-- =============================================================================
-- Copy this entire file and paste it into the Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/drfaomantrtmtydbelxe/sql
-- =============================================================================

-- Create structured_prompts table
CREATE TABLE IF NOT EXISTS public.structured_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- Metadata
  title TEXT NOT NULL,
  description TEXT,
  framework_name TEXT,
  stage_name TEXT,
  tool_name TEXT,
  is_template BOOLEAN DEFAULT false,
  is_library_prompt BOOLEAN DEFAULT true,

  -- Structured Sections stored as JSONB
  -- Each section has: {id, type, title, content, icon, color, isExpanded, isEditable}
  role_section JSONB NOT NULL,
  context_section JSONB NOT NULL,
  task_section JSONB NOT NULL,
  constraints_section JSONB NOT NULL,
  format_section JSONB NOT NULL,
  examples_section JSONB,

  -- Compiled prompt for backward compatibility and easy execution
  compiled_prompt TEXT NOT NULL,

  -- Execution tracking
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,

  -- Version control
  version INTEGER DEFAULT 1,
  parent_prompt_id UUID REFERENCES public.structured_prompts(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_structured_prompts_user_id ON public.structured_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_structured_prompts_project_id ON public.structured_prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_structured_prompts_library ON public.structured_prompts(is_library_prompt) WHERE is_library_prompt = true;
CREATE INDEX IF NOT EXISTS idx_structured_prompts_template ON public.structured_prompts(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_structured_prompts_tool ON public.structured_prompts(tool_name);
CREATE INDEX IF NOT EXISTS idx_structured_prompts_created_at ON public.structured_prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.structured_prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own structured prompts" ON public.structured_prompts;
DROP POLICY IF EXISTS "Users can create their own structured prompts" ON public.structured_prompts;
DROP POLICY IF EXISTS "Users can update their own structured prompts" ON public.structured_prompts;
DROP POLICY IF EXISTS "Users can delete their own structured prompts" ON public.structured_prompts;

-- RLS Policies: Users can only access their own structured prompts
CREATE POLICY "Users can view their own structured prompts"
ON public.structured_prompts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own structured prompts"
ON public.structured_prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own structured prompts"
ON public.structured_prompts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own structured prompts"
ON public.structured_prompts
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp
-- First, check if the trigger function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_structured_prompts_updated_at ON public.structured_prompts;

CREATE TRIGGER update_structured_prompts_updated_at
BEFORE UPDATE ON public.structured_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to compile prompt from sections
CREATE OR REPLACE FUNCTION public.compile_structured_prompt(
  p_role_section JSONB,
  p_context_section JSONB,
  p_task_section JSONB,
  p_constraints_section JSONB,
  p_format_section JSONB,
  p_examples_section JSONB DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  compiled_text TEXT := '';
BEGIN
  -- Compile all sections into a single prompt text

  -- Role Section
  IF p_role_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '# ' || (p_role_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_role_section->>'content') || E'\n\n';
    compiled_text := compiled_text || '---' || E'\n\n';
  END IF;

  -- Context Section
  IF p_context_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '## ' || (p_context_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_context_section->>'content') || E'\n\n';
    compiled_text := compiled_text || '---' || E'\n\n';
  END IF;

  -- Task Section
  IF p_task_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '## ' || (p_task_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_task_section->>'content') || E'\n\n';
    compiled_text := compiled_text || '---' || E'\n\n';
  END IF;

  -- Constraints Section
  IF p_constraints_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '## ' || (p_constraints_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_constraints_section->>'content') || E'\n\n';
    compiled_text := compiled_text || '---' || E'\n\n';
  END IF;

  -- Format Section
  IF p_format_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '## ' || (p_format_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_format_section->>'content') || E'\n\n';
    compiled_text := compiled_text || '---' || E'\n\n';
  END IF;

  -- Examples Section (optional)
  IF p_examples_section->>'content' IS NOT NULL THEN
    compiled_text := compiled_text || '## ' || (p_examples_section->>'title') || E'\n\n';
    compiled_text := compiled_text || (p_examples_section->>'content') || E'\n\n';
  END IF;

  RETURN compiled_text;
END;
$$;

-- Add trigger to auto-compile prompt on insert/update
CREATE OR REPLACE FUNCTION public.auto_compile_structured_prompt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-compile the prompt from sections if not manually provided
  IF NEW.compiled_prompt IS NULL OR NEW.compiled_prompt = '' THEN
    NEW.compiled_prompt := public.compile_structured_prompt(
      NEW.role_section,
      NEW.context_section,
      NEW.task_section,
      NEW.constraints_section,
      NEW.format_section,
      NEW.examples_section
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_auto_compile_structured_prompt ON public.structured_prompts;

CREATE TRIGGER trigger_auto_compile_structured_prompt
BEFORE INSERT OR UPDATE ON public.structured_prompts
FOR EACH ROW
EXECUTE FUNCTION public.auto_compile_structured_prompt();

-- Add comments for documentation
COMMENT ON TABLE public.structured_prompts IS 'Stores prompts as structured sections for card-based editing in the prompt library';
COMMENT ON COLUMN public.structured_prompts.role_section IS 'AI Role & Expertise section with role description and expertise level';
COMMENT ON COLUMN public.structured_prompts.context_section IS 'Project Context section with variables and contextual information';
COMMENT ON COLUMN public.structured_prompts.task_section IS 'Specific Task section describing what the AI should do';
COMMENT ON COLUMN public.structured_prompts.constraints_section IS 'Quality & Constraints section with quality standards and limitations';
COMMENT ON COLUMN public.structured_prompts.format_section IS 'Output Format section specifying desired output structure';
COMMENT ON COLUMN public.structured_prompts.examples_section IS 'Examples & Guidance section with sample outputs (optional)';
COMMENT ON COLUMN public.structured_prompts.compiled_prompt IS 'Full compiled prompt text from all sections for execution';
COMMENT ON COLUMN public.structured_prompts.is_template IS 'True if this prompt is a reusable template';
COMMENT ON COLUMN public.structured_prompts.is_library_prompt IS 'True if this prompt should appear in the library';
COMMENT ON COLUMN public.structured_prompts.parent_prompt_id IS 'References parent prompt if this is a version/fork';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.structured_prompts TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- You should see "Success. No rows returned" if everything worked correctly.
-- The structured_prompts table is now ready for use!
-- =============================================================================
