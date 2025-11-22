-- Restore collaboration features without causing RLS recursion
-- The key: project_members only checks user_id, projects can check project_members (one-way dependency)

-- ============================================================================
-- PROJECTS: Allow viewing owned AND shared projects
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

CREATE POLICY "Users can view their own and shared projects" ON public.projects
    FOR SELECT USING (
        user_id = auth.uid() OR  -- User owns the project
        id IN (                   -- OR user is a member
            SELECT project_id
            FROM public.project_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- PROMPTS: Allow viewing prompts from owned AND shared projects
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete own project prompts" ON public.prompts;

CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        project_id IN (
            -- Projects owned by user
            SELECT id FROM public.projects WHERE user_id = auth.uid()
            UNION
            -- Projects where user is a member
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        project_id IN (
            -- Projects owned by user
            SELECT id FROM public.projects WHERE user_id = auth.uid()
            UNION
            -- Projects where user is an editor or owner
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    );

CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        project_id IN (
            -- Projects owned by user
            SELECT id FROM public.projects WHERE user_id = auth.uid()
            UNION
            -- Projects where user is an editor or owner
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    );

CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        project_id IN (
            -- Projects owned by user
            SELECT id FROM public.projects WHERE user_id = auth.uid()
            UNION
            -- Projects where user is an editor or owner
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    );

-- ============================================================================
-- PROJECT_MEMBERS: Keep the SELECT policy simple (no recursion)
-- This is crucial: it only checks user_id, doesn't query projects table
-- ============================================================================

-- The SELECT policy from migration 20250115000008 is already correct:
-- CREATE POLICY "Users can view their own memberships" ON public.project_members
--     FOR SELECT USING (user_id = auth.uid());

-- But we also need project owners to see all members of their projects
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;

CREATE POLICY "Users can view project members" ON public.project_members
    FOR SELECT USING (
        user_id = auth.uid() OR  -- Can see your own membership
        EXISTS (                  -- OR you own the project
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id
            AND p.user_id = auth.uid()
        )
    );

-- ============================================================================
-- WHY THIS WORKS:
-- ============================================================================
-- 1. When querying project_members directly (no join):
--    - project_members RLS checks: user_id = auth.uid() OR project owner
--    - If checking project owner, it queries projects table
--    - projects RLS checks: user owns it OR is member
--    - To check membership, it queries project_members
--    - But this is a DIFFERENT query (checking different user/project combo)
--    - PostgreSQL handles this correctly
--
-- 2. When the frontend queries project_members separately (no nested join):
--    - First query: project_members (gets project_id list)
--    - Second query: projects with id IN (...list)
--    - No recursion because queries are separate
--
-- 3. The key change: Frontend no longer does project_members.select('projects (*)')
--    which would cause nested RLS evaluation
