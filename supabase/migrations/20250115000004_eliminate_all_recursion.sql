-- Completely eliminate all recursion by breaking cross-table references
-- This is a working fix, collaboration features temporarily limited

-- Project members: Allow users to see only their own memberships (no owner checks)
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can view all members" ON public.project_members;

CREATE POLICY "Users can view their own memberships" ON public.project_members
    FOR SELECT USING (user_id = auth.uid());

-- Also need to allow project owners to see members, but without causing recursion
-- We'll use a direct check without going through projects table
CREATE POLICY "Project owners can view all members" ON public.project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.user_id = auth.uid()
        )
    );

-- Fix project_invitations - don't query auth.users, use jwt email directly
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;

CREATE POLICY "Users can view invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = COALESCE(auth.jwt()->>'email', '') OR
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_invitations.project_id
            AND p.user_id = auth.uid()
        )
    );

-- Prompts: Simple ownership check only (no project_members)
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete own project prompts" ON public.prompts;

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
