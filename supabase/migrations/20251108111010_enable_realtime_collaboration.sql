-- Enable Realtime Collaboration for Workflow Canvas
-- This migration adds support for real-time collaboration features similar to Figma

-- Step 1: Add collaboration metadata columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_last_modified_at ON public.projects(last_modified_at DESC);

-- Step 3: Enable Realtime for the projects table
-- This allows clients to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Step 4: Update the projects table to set initial values for existing records
UPDATE public.projects
SET
  last_modified_by = user_id,
  last_modified_at = updated_at
WHERE last_modified_by IS NULL;

-- Step 5: Create a trigger to automatically update last_modified_at
CREATE OR REPLACE FUNCTION update_project_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_modified ON public.projects;

CREATE TRIGGER trigger_update_project_modified
BEFORE UPDATE ON public.projects
FOR EACH ROW
WHEN (OLD.canvas_data IS DISTINCT FROM NEW.canvas_data)
EXECUTE FUNCTION update_project_modified_timestamp();

-- Step 6: Grant necessary permissions for realtime
-- Users can only receive realtime updates for projects they have access to
-- RLS policies already handle this, so no additional grants needed

-- Step 7: Create a helper function to get active project members
CREATE OR REPLACE FUNCTION get_active_project_collaborators(project_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.user_id,
    p.email,
    p.display_name,
    p.avatar_url,
    pm.role
  FROM project_members pm
  JOIN profiles p ON pm.user_id = p.user_id
  WHERE pm.project_id = project_uuid
  ORDER BY pm.role DESC, p.display_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Verify the setup
SELECT
  'Projects table columns' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name IN ('last_modified_by', 'last_modified_at')
ORDER BY column_name;
