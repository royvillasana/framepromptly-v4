-- FINAL FIX: Break ALL cross-table references in RLS policies
-- Projects can only be viewed directly by owners
-- If you want to see a project you're a member of, query through project_members table

-- 1. Fix PROJECTS table - remove all project_members checks
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());

-- The INSERT policy is fine as-is

-- 2. PROJECT_MEMBERS policies remain simple (no changes needed)
-- They already only check user_id = auth.uid() which doesn't cause recursion

-- 3. PROMPTS table - same issue, don't check project_members
-- Already fixed in previous migration, just ensuring they're correct

-- 4. Fix INVITATIONS - ensure it doesn't access auth.users
-- The query is trying to join with projects which might have invited_by as foreign key to auth.users
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;

CREATE POLICY "Users can view invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = (auth.jwt() ->> 'email') OR
        EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_invitations.project_id AND projects.user_id = auth.uid())
    );
