-- Fix RLS recursion by ensuring SECURITY DEFINER functions truly bypass RLS
-- Add explicit permissions and ensure no RLS is applied within the functions

-- Revoke and regrant to ensure clean state
REVOKE ALL ON public.projects FROM authenticated;
REVOKE ALL ON public.project_members FROM authenticated;
REVOKE ALL ON public.prompts FROM authenticated;

GRANT SELECT ON public.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.project_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompts TO authenticated;

-- Now update the helper functions to use SECURITY DEFINER with STABLE (allows caching)
-- These will bypass RLS when querying

DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID, TEXT[]) CASCADE;

CREATE OR REPLACE FUNCTION public.is_project_owner(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.projects
    WHERE id = check_project_id AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID, required_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE
    WHEN required_roles IS NULL THEN
      EXISTS(
        SELECT 1 FROM public.project_members
        WHERE project_id = check_project_id AND user_id = check_user_id
      )
    ELSE
      EXISTS(
        SELECT 1 FROM public.project_members
        WHERE project_id = check_project_id
          AND user_id = check_user_id
          AND role = ANY(required_roles)
      )
  END;
$$;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID, TEXT[]) TO authenticated;

-- Recreate all RLS policies

-- Projects table policies
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view their own and shared projects" ON public.projects
    FOR SELECT USING (
        public.is_project_owner(id, auth.uid()) OR
        public.is_project_member(id, auth.uid())
    );

CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (
        public.is_project_owner(id, auth.uid()) OR
        public.is_project_member(id, auth.uid(), ARRAY['owner', 'editor'])
    );

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (public.is_project_owner(id, auth.uid()));

-- Project members policies - simplified to avoid recursion
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update member roles" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON public.project_members;

CREATE POLICY "Users can view members of their projects" ON public.project_members
    FOR SELECT USING (
        public.is_project_owner(project_id, auth.uid()) OR
        user_id = auth.uid()
    );

CREATE POLICY "Project owners can add members" ON public.project_members
    FOR INSERT WITH CHECK (
        public.is_project_owner(project_id, auth.uid())
    );

CREATE POLICY "Project owners can update member roles" ON public.project_members
    FOR UPDATE USING (
        public.is_project_owner(project_id, auth.uid())
    );

CREATE POLICY "Project owners can remove members" ON public.project_members
    FOR DELETE USING (
        public.is_project_owner(project_id, auth.uid())
    );

-- Prompts table policies
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid())
    );

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );

CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );

CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );
