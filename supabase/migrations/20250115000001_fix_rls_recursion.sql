-- Fix RLS recursion issues by creating helper functions with SECURITY DEFINER
-- This allows RLS policies to check membership without triggering recursive RLS checks

-- Drop any existing versions of these functions (CASCADE to drop dependent policies)
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.user_has_project_access(UUID, UUID, TEXT[]) CASCADE;

-- Step 1: Create helper function to check if user is project owner
CREATE OR REPLACE FUNCTION public.is_project_owner(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.projects
    WHERE id = check_project_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Create helper function to check if user is project member with optional role check
CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID, required_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF required_roles IS NULL THEN
    RETURN EXISTS(
      SELECT 1 FROM public.project_members
      WHERE project_id = check_project_id AND user_id = check_user_id
    );
  ELSE
    RETURN EXISTS(
      SELECT 1 FROM public.project_members
      WHERE project_id = check_project_id
        AND user_id = check_user_id
        AND role = ANY(required_roles)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Fix project_members RLS policies to avoid self-reference
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;

CREATE POLICY "Users can view members of their projects" ON public.project_members
    FOR SELECT USING (
        -- User owns the project
        public.is_project_owner(project_id, auth.uid()) OR
        -- User is the member being viewed
        user_id = auth.uid()
    );

-- Step 4: Fix prompts RLS policies using the helper functions
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

-- SELECT: Users can view prompts for projects they own or are members of
CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid())
    );

-- INSERT: Users can create prompts for projects they own or are editors of
CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );

-- UPDATE: Users can update prompts for projects they own or are editors of
CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );

-- DELETE: Users can delete prompts for projects they own or are editors of
CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        public.is_project_owner(project_id, auth.uid()) OR
        public.is_project_member(project_id, auth.uid(), ARRAY['owner', 'editor'])
    );

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID, TEXT[]) TO authenticated;

-- Step 5: Recreate projects table policies (in case they were dropped by CASCADE)
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- SELECT: Users can view projects they own or are members of
CREATE POLICY "Users can view their own and shared projects" ON public.projects
    FOR SELECT USING (
        public.is_project_owner(id, auth.uid()) OR
        public.is_project_member(id, auth.uid())
    );

-- INSERT: Users can create their own projects
CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update projects they own or are editors of
CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (
        public.is_project_owner(id, auth.uid()) OR
        public.is_project_member(id, auth.uid(), ARRAY['owner', 'editor'])
    );

-- DELETE: Only project owners can delete projects
CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (public.is_project_owner(id, auth.uid()));
