-- Fix the projects RLS policy to be more efficient and avoid potential issues
-- Run this in Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;

-- Create a more efficient policy that checks ownership first
CREATE POLICY "Users can view their own and shared projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = user_id OR  -- User is the owner (checked first for efficiency)
  EXISTS (  -- OR user is a member (using EXISTS is more efficient than IN with subquery)
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
  )
);

-- Verify the policy was created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
  AND policyname = 'Users can view their own and shared projects';
