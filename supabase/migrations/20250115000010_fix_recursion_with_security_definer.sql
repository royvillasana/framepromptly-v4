-- Fix RLS recursion using SECURITY DEFINER functions
-- These functions bypass RLS to break circular dependencies

-- ============================================================================
-- STEP 1: Drop dependent policies first, then old functions
-- ============================================================================

-- Drop all policies that might depend on the old functions
DROP POLICY IF EXISTS "Users can view owned and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;

-- Now drop the old functions
DROP FUNCTION IF EXISTS public.user_is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.user_owns_project(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;

-- ============================================================================
-- STEP 2: Create helper functions that bypass RLS
-- ============================================================================

-- Function to check if a user is a member of a project (bypasses RLS)
CREATE FUNCTION public.user_is_project_member(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = check_project_id
    AND user_id = check_user_id
  );
$$;

-- Function to check if a user owns a project (bypasses RLS)
CREATE FUNCTION public.user_owns_project(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = check_project_id
    AND user_id = check_user_id
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.user_is_project_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_project(UUID, UUID) TO authenticated;

-- ============================================================================
-- STEP 3: Create RLS policies using helper functions (no recursion!)
-- ============================================================================

-- PROJECT_MEMBERS: Simple check using helper function
CREATE POLICY "Users can view project members" ON public.project_members
    FOR SELECT USING (
        user_id = auth.uid() OR  -- Can see your own membership
        public.user_owns_project(project_id, auth.uid())  -- OR you own the project (no recursion!)
    );

-- PROJECTS: Use helper function to check membership
CREATE POLICY "Users can view their own and shared projects" ON public.projects
    FOR SELECT USING (
        user_id = auth.uid() OR  -- User owns the project
        public.user_is_project_member(id, auth.uid())  -- OR user is a member (no recursion!)
    );

-- PROMPTS: Use helper functions for checks
CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        public.user_owns_project(project_id, auth.uid()) OR
        public.user_is_project_member(project_id, auth.uid())
    );

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        public.user_owns_project(project_id, auth.uid()) OR
        (
            public.user_is_project_member(project_id, auth.uid()) AND
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = prompts.project_id
                AND user_id = auth.uid()
                AND role IN ('editor', 'owner')
            )
        )
    );

CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        public.user_owns_project(project_id, auth.uid()) OR
        (
            public.user_is_project_member(project_id, auth.uid()) AND
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = prompts.project_id
                AND user_id = auth.uid()
                AND role IN ('editor', 'owner')
            )
        )
    );

CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        public.user_owns_project(project_id, auth.uid()) OR
        (
            public.user_is_project_member(project_id, auth.uid()) AND
            EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = prompts.project_id
                AND user_id = auth.uid()
                AND role IN ('editor', 'owner')
            )
        )
    );

-- ============================================================================
-- PROJECT_INVITATIONS: Fix the auth.users access issue
-- ============================================================================

-- The invited_by column references auth.users, which causes permission errors
-- Solution: Use helper function and don't try to expand the foreign key
CREATE POLICY "Users can view invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = (auth.jwt() ->> 'email') OR
        public.user_owns_project(project_id, auth.uid())
    );

-- ============================================================================
-- WHY THIS WORKS:
-- ============================================================================
-- SECURITY DEFINER functions run with the privileges of the function owner
-- (usually the superuser), so they bypass RLS entirely. This breaks the
-- circular dependency:
--
-- Before:
--   projects RLS → checks project_members → project_members RLS → checks projects → RECURSION
--
-- After:
--   projects RLS → user_is_project_member() → directly queries project_members (no RLS) → DONE
--   project_members RLS → user_owns_project() → directly queries projects (no RLS) → DONE
--
-- No circular dependency, no recursion!
