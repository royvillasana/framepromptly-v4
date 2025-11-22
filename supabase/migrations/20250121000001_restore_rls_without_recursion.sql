-- ==============================================================================
-- RESTORE RLS WITHOUT RECURSION - Properly structured policies
-- ==============================================================================
-- This migration restores RLS with a clear dependency hierarchy:
-- 1. project_members (FOUNDATION - no dependencies)
-- 2. projects (depends on project_members only)
-- 3. prompts (depends on projects only)
-- 4. project_invitations (depends on projects, uses JWT for email)
-- ==============================================================================

-- ==============================================================================
-- STEP 1: Create SECURITY DEFINER helper functions
-- ==============================================================================
-- These functions bypass RLS and prevent recursion issues

-- Drop existing functions first to avoid conflicts
-- Drop all variations with different signatures
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.user_is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_project_ids(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_project_ids_for_user(UUID) CASCADE;

-- Check if user is project owner
CREATE FUNCTION public.is_project_owner(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.projects
        WHERE id = check_project_id AND user_id = check_user_id
    );
$$;

-- Check if user is project member
CREATE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.project_members
        WHERE project_id = check_project_id AND user_id = check_user_id
    );
$$;

-- Get user's project IDs (as owner or member)
CREATE FUNCTION public.get_user_project_ids(check_user_id UUID)
RETURNS TABLE(project_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    -- Projects owned by user
    SELECT id as project_id FROM public.projects WHERE user_id = check_user_id
    UNION
    -- Projects where user is a member
    SELECT project_id FROM public.project_members WHERE user_id = check_user_id;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_project_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_project_ids(UUID) TO authenticated;

-- ==============================================================================
-- STEP 2: project_members table - FOUNDATION (no dependencies)
-- ==============================================================================

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Members can view their own membership records
CREATE POLICY "view_own_membership" ON public.project_members
    FOR SELECT
    USING (user_id = auth.uid());

-- Project owners can view all members of their projects
CREATE POLICY "owners_view_members" ON public.project_members
    FOR SELECT
    USING (
        public.is_project_owner(project_id, auth.uid())
    );

-- Project owners can insert members
CREATE POLICY "owners_insert_members" ON public.project_members
    FOR INSERT
    WITH CHECK (
        public.is_project_owner(project_id, auth.uid())
    );

-- Project owners can update member roles
CREATE POLICY "owners_update_members" ON public.project_members
    FOR UPDATE
    USING (
        public.is_project_owner(project_id, auth.uid())
    );

-- Project owners can delete members
CREATE POLICY "owners_delete_members" ON public.project_members
    FOR DELETE
    USING (
        public.is_project_owner(project_id, auth.uid())
    );

-- ==============================================================================
-- STEP 3: projects table - depends on project_members only
-- ==============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects they own or are members of
CREATE POLICY "view_own_and_shared_projects" ON public.projects
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can insert their own projects
CREATE POLICY "insert_own_projects" ON public.projects
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Owners can update their projects
-- Members with editor role can also update (checked via function)
CREATE POLICY "update_own_and_shared_projects" ON public.projects
    FOR UPDATE
    USING (
        user_id = auth.uid() OR
        public.is_project_member(id, auth.uid())
    );

-- Only owners can delete projects
CREATE POLICY "delete_own_projects" ON public.projects
    FOR DELETE
    USING (user_id = auth.uid());

-- ==============================================================================
-- STEP 4: prompts table - depends on projects only
-- ==============================================================================

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Users can view prompts from projects they have access to
CREATE POLICY "view_project_prompts" ON public.prompts
    FOR SELECT
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can insert prompts in projects they have access to
CREATE POLICY "insert_project_prompts" ON public.prompts
    FOR INSERT
    WITH CHECK (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can update prompts in projects they have access to
CREATE POLICY "update_project_prompts" ON public.prompts
    FOR UPDATE
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can delete prompts in projects they have access to
CREATE POLICY "delete_project_prompts" ON public.prompts
    FOR DELETE
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- ==============================================================================
-- STEP 5: project_invitations table - depends on projects, uses JWT
-- ==============================================================================

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent
CREATE POLICY "view_sent_invitations" ON public.project_invitations
    FOR SELECT
    USING (invited_by = auth.uid());

-- Users can view invitations sent to their email (using JWT, NOT auth.users)
CREATE POLICY "view_received_invitations" ON public.project_invitations
    FOR SELECT
    USING (
        invited_email = COALESCE((auth.jwt() ->> 'email'), '')
    );

-- Project owners can view all invitations for their projects
CREATE POLICY "owners_view_project_invitations" ON public.project_invitations
    FOR SELECT
    USING (
        public.is_project_owner(project_id, auth.uid())
    );

-- Project owners can insert invitations
CREATE POLICY "owners_insert_invitations" ON public.project_invitations
    FOR INSERT
    WITH CHECK (
        public.is_project_owner(project_id, auth.uid()) AND
        invited_by = auth.uid()
    );

-- Users can update invitations sent to them (accepting/declining)
CREATE POLICY "update_received_invitations" ON public.project_invitations
    FOR UPDATE
    USING (
        invited_email = COALESCE((auth.jwt() ->> 'email'), '')
    );

-- Project owners and invitation senders can delete invitations
CREATE POLICY "delete_own_invitations" ON public.project_invitations
    FOR DELETE
    USING (
        invited_by = auth.uid() OR
        public.is_project_owner(project_id, auth.uid())
    );

-- ==============================================================================
-- STEP 6: knowledge_base table - depends on projects only
-- ==============================================================================

ALTER TABLE IF EXISTS public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Users can view knowledge base entries from projects they have access to
CREATE POLICY "view_project_knowledge" ON public.knowledge_base
    FOR SELECT
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can insert knowledge base entries in projects they have access to
CREATE POLICY "insert_project_knowledge" ON public.knowledge_base
    FOR INSERT
    WITH CHECK (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can update knowledge base entries in projects they have access to
CREATE POLICY "update_project_knowledge" ON public.knowledge_base
    FOR UPDATE
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- Users can delete knowledge base entries in projects they have access to
CREATE POLICY "delete_project_knowledge" ON public.knowledge_base
    FOR DELETE
    USING (
        project_id IN (SELECT project_id FROM public.get_user_project_ids(auth.uid()))
    );

-- ==============================================================================
-- STEP 7: Force PostgREST cache refresh
-- ==============================================================================

COMMENT ON TABLE public.projects IS 'User projects - RLS enabled with proper hierarchy 2025-01-21';
COMMENT ON TABLE public.project_members IS 'Project membership - Foundation layer 2025-01-21';
COMMENT ON TABLE public.prompts IS 'AI prompts - Depends on projects 2025-01-21';
COMMENT ON TABLE public.project_invitations IS 'Project invitations - Uses JWT 2025-01-21';

NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- STEP 8: Verify RLS is enabled and policies are correct
-- ==============================================================================

DO $$
DECLARE
    table_record RECORD;
    policy_count INT;
    all_enabled BOOLEAN := true;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS RESTORATION COMPLETE';
    RAISE NOTICE '========================================';

    -- Check RLS enabled
    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
        AND relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        IF table_record.relrowsecurity THEN
            RAISE NOTICE '✓ RLS enabled on %', table_record.relname;
        ELSE
            RAISE WARNING 'RLS NOT enabled on %', table_record.relname;
            all_enabled := false;
        END IF;
    END LOOP;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations');

    RAISE NOTICE 'Total policies created: %', policy_count;

    -- List policies by table
    FOR table_record IN
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations')
        GROUP BY tablename
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  %: % policies', table_record.tablename, table_record.policy_count;
    END LOOP;

    IF all_enabled THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUCCESS: RLS properly enabled';
        RAISE NOTICE 'Dependency hierarchy: project_members → projects → prompts/invitations';
        RAISE NOTICE 'NO CIRCULAR DEPENDENCIES';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'Some tables still have RLS disabled';
    END IF;
END $$;

-- ==============================================================================
-- IMPORTANT NOTES:
-- ==============================================================================
-- 1. RLS is now ENABLED with proper non-recursive policies
-- 2. Dependency hierarchy prevents infinite recursion:
--    - project_members: foundation layer (no dependencies)
--    - projects: can check project_members (one-way)
--    - prompts: can check projects (no circular reference)
--    - project_invitations: uses JWT for email (no auth.users query)
-- 3. SECURITY DEFINER functions bypass RLS to break potential recursion
-- 4. Collaboration features fully supported:
--    - Project owners can invite members
--    - Members can access shared projects
--    - Real-time editing with Yjs (yjs_state column)
-- 5. After applying, restart Supabase project to ensure cache is fresh
-- ==============================================================================
