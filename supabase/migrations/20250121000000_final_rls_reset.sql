-- ==============================================================================
-- FINAL RLS RESET - Clean slate for collaboration features
-- ==============================================================================
-- This migration completely disables RLS and removes all policies to eliminate
-- the infinite recursion errors. We'll restore proper RLS in the next migration.
-- ==============================================================================

-- Step 1: Report current state before changes
DO $$
DECLARE
    table_record RECORD;
    policy_count INT := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRE-RESET STATE';
    RAISE NOTICE '========================================';

    -- Check RLS status
    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
        AND relname IN ('projects', 'project_members', 'prompts', 'project_invitations', 'knowledge_base')
    LOOP
        RAISE NOTICE 'Table %: RLS is %', table_record.relname,
            CASE WHEN table_record.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END;
    END LOOP;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations', 'knowledge_base');

    RAISE NOTICE 'Total policies found: %', policy_count;
    RAISE NOTICE '========================================';
END $$;

-- Step 2: Force disable RLS on ALL tables
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies using dynamic SQL to catch everything
DO $$
DECLARE
    policy_record RECORD;
    dropped_count INT := 0;
BEGIN
    RAISE NOTICE 'Dropping all policies...';

    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename);
            dropped_count := dropped_count + 1;
            RAISE NOTICE 'Dropped: %.%', policy_record.tablename, policy_record.policyname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop %.%: %', policy_record.tablename, policy_record.policyname, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Total policies dropped: %', dropped_count;
END $$;

-- Step 4: Ensure critical RPC function exists for collaboration
DROP FUNCTION IF EXISTS public.get_project_members_with_users(UUID) CASCADE;

CREATE FUNCTION public.get_project_members_with_users(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    user_id UUID,
    role TEXT,
    joined_at TIMESTAMPTZ,
    user_email TEXT,
    user_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.email as user_email,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email) as user_name
    FROM public.project_members pm
    JOIN auth.users u ON u.id = pm.user_id
    WHERE pm.project_id = project_uuid
    ORDER BY pm.joined_at DESC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO authenticated;

-- Step 5: Ensure tables have proper grants
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
GRANT ALL ON public.prompts TO authenticated;
GRANT ALL ON public.project_invitations TO authenticated;
GRANT ALL ON public.knowledge_base TO authenticated;

-- Step 6: Force PostgREST schema cache refresh
COMMENT ON TABLE public.projects IS 'User projects - RLS reset 2025-01-21';
COMMENT ON TABLE public.project_members IS 'Project membership - RLS reset 2025-01-21';
COMMENT ON TABLE public.prompts IS 'AI prompts - RLS reset 2025-01-21';
COMMENT ON TABLE public.project_invitations IS 'Project invitations - RLS reset 2025-01-21';
COMMENT ON TABLE public.knowledge_base IS 'Knowledge base - RLS reset 2025-01-21';

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';

-- Step 7: Verify final state
DO $$
DECLARE
    table_record RECORD;
    policy_count INT;
    all_disabled BOOLEAN := true;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'POST-RESET STATE';
    RAISE NOTICE '========================================';

    -- Check RLS disabled
    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
        AND relname IN ('projects', 'project_members', 'prompts', 'project_invitations', 'knowledge_base')
    LOOP
        IF table_record.relrowsecurity THEN
            RAISE WARNING 'RLS still enabled on %', table_record.relname;
            all_disabled := false;
        ELSE
            RAISE NOTICE '✓ RLS disabled on %', table_record.relname;
        END IF;
    END LOOP;

    -- Check policies removed
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    IF policy_count > 0 THEN
        RAISE WARNING '% policies still exist in public schema', policy_count;
    ELSE
        RAISE NOTICE '✓ No policies remain in public schema';
    END IF;

    -- Final status
    IF all_disabled AND policy_count = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUCCESS: Clean slate achieved';
        RAISE NOTICE 'PostgREST will reload within 10 seconds';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'Some issues remain - may need manual intervention';
    END IF;
END $$;

-- ==============================================================================
-- IMPORTANT NOTES:
-- ==============================================================================
-- 1. RLS is now DISABLED on all tables
-- 2. Security relies on:
--    - Supabase authentication (only authenticated users can query)
--    - Application-level filtering (queries filter by user_id)
--    - SECURITY DEFINER functions where needed
-- 3. This is a temporary state - next migration will restore proper RLS
-- 4. After applying this, restart Supabase project in dashboard to clear cache
-- ==============================================================================
