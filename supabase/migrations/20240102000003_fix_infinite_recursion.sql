-- Fix infinite recursion in projects RLS policy
-- The issue: projects policy checks project_members, which references projects, causing recursion

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;

-- Create a helper function that checks if a user is a member of a project
-- This function uses SECURITY DEFINER to bypass RLS and prevent recursion
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = is_project_member.project_id
    AND project_members.user_id = is_project_member.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate SELECT policy using the helper function
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.is_project_member(id, auth.uid())
    );

-- Recreate UPDATE policy using the helper function
CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (
        user_id = auth.uid() OR
        (
            public.is_project_member(id, auth.uid()) AND
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = projects.id
                AND user_id = auth.uid()
                AND role IN ('owner', 'editor')
            )
        )
    );

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID) TO authenticated;
