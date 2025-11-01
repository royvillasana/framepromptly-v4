-- Migration: Add version tracking to prompts table
-- Description: Add version fields and auto-create initial versions for all prompts

-- Add version tracking fields to prompts table
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_versions INTEGER DEFAULT 1;

-- Create function to auto-create initial version when prompt is created
CREATE OR REPLACE FUNCTION public.create_initial_prompt_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create version 1 for the newly created prompt
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

  -- Ensure the prompts table has correct version numbers
  NEW.current_version := 1;
  NEW.total_versions := 1;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-create version when prompt is inserted
DROP TRIGGER IF EXISTS trigger_create_initial_prompt_version ON public.prompts;
CREATE TRIGGER trigger_create_initial_prompt_version
BEFORE INSERT ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_prompt_version();

-- Create function to update version counters when new version is created
CREATE OR REPLACE FUNCTION public.update_prompt_version_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update total_versions count on the parent prompt
  UPDATE public.prompts
  SET total_versions = (
    SELECT COUNT(*)
    FROM public.prompt_versions
    WHERE prompt_id = NEW.prompt_id
  )
  WHERE id = NEW.prompt_id;

  -- If this version is set as active, update current_version and deactivate others
  IF NEW.is_active THEN
    -- Deactivate all other versions for this prompt
    UPDATE public.prompt_versions
    SET is_active = false
    WHERE prompt_id = NEW.prompt_id AND id != NEW.id;

    -- Update current_version on the parent prompt
    UPDATE public.prompts
    SET current_version = NEW.version_number
    WHERE id = NEW.prompt_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to update counters when version is created or updated
DROP TRIGGER IF EXISTS trigger_update_prompt_version_counters ON public.prompt_versions;
CREATE TRIGGER trigger_update_prompt_version_counters
AFTER INSERT OR UPDATE ON public.prompt_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_prompt_version_counters();

-- Create function to get next version number for a prompt
CREATE OR REPLACE FUNCTION public.get_next_version_number(p_prompt_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.prompt_versions
  WHERE prompt_id = p_prompt_id;

  RETURN next_version;
END;
$$;

-- Add comments
COMMENT ON COLUMN public.prompts.current_version IS 'The currently active version number';
COMMENT ON COLUMN public.prompts.total_versions IS 'Total number of versions for this prompt';
COMMENT ON FUNCTION public.create_initial_prompt_version() IS 'Auto-creates version 1 when a new prompt is generated';
COMMENT ON FUNCTION public.update_prompt_version_counters() IS 'Updates version counters and active status when versions change';
COMMENT ON FUNCTION public.get_next_version_number(UUID) IS 'Returns the next available version number for a prompt';

-- Backfill existing prompts with version 1 (for prompts created before this migration)
DO $$
DECLARE
  prompt_record RECORD;
BEGIN
  -- For each existing prompt that doesn't have a version yet
  FOR prompt_record IN
    SELECT p.id, p.user_id, p.prompt_content, p.variables, p.ai_response
    FROM public.prompts p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.prompt_versions pv WHERE pv.prompt_id = p.id
    )
  LOOP
    -- Create initial version
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
      prompt_record.id,
      prompt_record.user_id,
      1,
      'Original',
      true,
      prompt_record.prompt_content,
      COALESCE(prompt_record.variables, '{}'::jsonb),
      '[]'::jsonb,
      prompt_record.ai_response,
      'Migrated from existing prompt'
    );
  END LOOP;
END $$;
