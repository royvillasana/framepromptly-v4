-- Comprehensive fix for project updates with realtime columns
-- This ensures users can update last_opened, last_modified_by, and last_modified_at

-- First, let's check what the current UPDATE policies look like
SELECT
  tablename,
  policyname,
  cmd,
  SUBSTRING(qual::text, 1, 100) as using_clause,
  SUBSTRING(with_check::text, 1, 100) as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Drop and recreate the main project owner UPDATE policy to ensure it works
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure project members can also update (for collaboration)
DROP POLICY IF EXISTS "Project members can update projects" ON public.projects;

CREATE POLICY "Project members can update projects"
ON public.projects
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id
    FROM project_members
    WHERE project_id = projects.id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id
    FROM project_members
    WHERE project_id = projects.id
  )
);

-- Verify the policies were created
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Grant UPDATE permission to authenticated users
GRANT UPDATE ON public.projects TO authenticated;

-- Verification message
DO $$
BEGIN
  RAISE NOTICE '✅ Project UPDATE policies have been fixed';
  RAISE NOTICE '';
  RAISE NOTICE 'Users can now update:';
  RAISE NOTICE '  - Their own projects (user_id match)';
  RAISE NOTICE '  - Projects they are members of (via project_members)';
  RAISE NOTICE '  - Including last_opened, last_modified_by, last_modified_at columns';
END $$;
