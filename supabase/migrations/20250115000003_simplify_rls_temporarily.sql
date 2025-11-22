-- Temporarily simplify RLS policies to only check project ownership
-- This will fix the 500 errors, but collaboration features won't work until we fix properly

-- Prompts: Only allow access to projects you own (temporary)
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

-- Projects: Only allow access to projects you own (temporary)
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view their own and shared projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- Project members: Simple access (no recursion)
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;

CREATE POLICY "Users can view members of their projects" ON public.project_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

-- Fix project_invitations - it's trying to query auth.users
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;

CREATE POLICY "Users can view invitations for their projects or sent to them" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = auth.jwt()->>'email' OR
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );
