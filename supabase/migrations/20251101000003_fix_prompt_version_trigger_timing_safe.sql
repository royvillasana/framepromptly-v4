-- Fix: Split trigger into BEFORE (for setting fields) and AFTER (for creating version)
-- This ensures the prompt exists in the table before trying to create its version
-- Safe version that drops all existing triggers first

-- Drop ALL existing triggers that might conflict
DROP TRIGGER IF EXISTS trigger_create_initial_prompt_version ON public.prompts;
DROP TRIGGER IF EXISTS trigger_set_initial_version_fields ON public.prompts;
DROP TRIGGER IF EXISTS trigger_create_initial_prompt_version_entry ON public.prompts;

-- Create BEFORE INSERT function to set version fields on the prompt
CREATE OR REPLACE FUNCTION public.set_initial_version_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set initial version numbers on the prompt being inserted
  NEW.current_version := 1;
  NEW.total_versions := 1;
  RETURN NEW;
END;
$$;

-- Create AFTER INSERT function to create the initial version entry
CREATE OR REPLACE FUNCTION public.create_initial_prompt_version_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create version 1 for the newly created prompt
  -- This runs AFTER the prompt is inserted, so NEW.id exists in the prompts table
  INSERT INTO public.prompt_versions (
    prompt_id,
    user_id,
    version_number,
    version_title,
    is_active,
    prompt_content,
    variables,
    conversation,
    ai_response,
    change_summary
  ) VALUES (
    NEW.id,
    NEW.user_id,
    1,
    'Original',
    true,
    NEW.prompt_content,
    COALESCE(NEW.variables, '{}'::jsonb),
    '[]'::jsonb,
    NEW.ai_response,
    'Initial prompt generation'
  );

  RETURN NEW;
END;
$$;

-- Create BEFORE INSERT trigger to set version fields
CREATE TRIGGER trigger_set_initial_version_fields
BEFORE INSERT ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.set_initial_version_fields();

-- Create AFTER INSERT trigger to create version entry
CREATE TRIGGER trigger_create_initial_prompt_version_entry
AFTER INSERT ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_prompt_version_entry();

COMMENT ON FUNCTION public.set_initial_version_fields() IS 'Sets current_version and total_versions to 1 on new prompts';
COMMENT ON FUNCTION public.create_initial_prompt_version_entry() IS 'Creates the initial version entry after prompt is inserted';
