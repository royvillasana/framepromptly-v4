-- COMPLETE RLS RESET: Drop ALL old policies and create simple non-recursive ones
-- Root cause: Original "Users can view members of their projects" policy has self-recursion

-- ============================================================================
-- STEP 1: Drop ALL existing policies on these tables
-- ============================================================================

-- Drop ALL project_members policies
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update member roles" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON public.project_members;

-- Drop ALL projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Drop ALL prompts policies
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts in accessible projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts in accessible projects" ON public.prompts;

-- Drop ALL project_invitations policies
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their projects" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can delete invitations for their projects" ON public.project_invitations;

-- ============================================================================
-- STEP 2: Create simple, non-recursive policies
-- ============================================================================

-- PROJECT_MEMBERS: Only allow viewing your own memberships
-- NO cross-table references = NO recursion
CREATE POLICY "Users can view their own memberships" ON public.project_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Project owners can add members" ON public.project_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can update members" ON public.project_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can remove members" ON public.project_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.user_id = auth.uid()
        )
    );

-- PROJECTS: Only check direct ownership
-- NO reference to project_members = NO recursion with project_members
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- PROMPTS: Only check project ownership through projects table
-- Direct check, no complex joins
CREATE POLICY "Users can view own project prompts" ON public.prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own project prompts" ON public.prompts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own project prompts" ON public.prompts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own project prompts" ON public.prompts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

-- PROJECT_INVITATIONS: Use JWT email directly, no auth.users access
CREATE POLICY "Users can view invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = (auth.jwt() ->> 'email') OR
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_invitations.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create invitations" ON public.project_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_invitations.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invitations" ON public.project_invitations
    FOR UPDATE USING (
        invited_by = auth.uid() OR
        invited_email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Users can delete invitations" ON public.project_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_invitations.project_id
            AND p.user_id = auth.uid()
        )
    );

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This configuration temporarily disables collaboration features.
-- Users can only see:
--   - Projects they own (not shared projects they're members of)
--   - Their own project_members entries
--   - Prompts for projects they own
--
-- To re-enable collaboration, we'll need a different approach that doesn't
-- create circular dependencies between projects and project_members tables.
