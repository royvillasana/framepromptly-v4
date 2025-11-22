-- ==============================================================================
-- NUCLEAR CLEANUP - Remove ALL database objects that could cause issues
-- ==============================================================================

-- Step 1: Drop all triggers on the problem tables
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE 'Dropping all triggers...';

    FOR trigger_record IN
        SELECT t.tgname, c.relname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
        AND NOT t.tgisinternal
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE',
            trigger_record.tgname, trigger_record.relname);
        RAISE NOTICE 'Dropped trigger: %.%', trigger_record.relname, trigger_record.tgname;
    END LOOP;
END $$;

-- Step 2: Disable RLS again (just to be absolutely sure)
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_invitations DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies again
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename);
    END LOOP;
END $$;

-- Step 4: Drop SECURITY DEFINER functions that might be causing issues
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_project_ids(UUID) CASCADE;

-- Step 5: Ensure tables have proper grants
GRANT ALL ON public.projects TO authenticated, anon;
GRANT ALL ON public.project_members TO authenticated, anon;
GRANT ALL ON public.prompts TO authenticated, anon;
GRANT ALL ON public.project_invitations TO authenticated, anon;

-- Step 6: Force PostgREST reload
DO $$
BEGIN
    EXECUTE format('COMMENT ON TABLE public.projects IS ''Nuclear cleanup - %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.project_members IS ''Nuclear cleanup - %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.prompts IS ''Nuclear cleanup - %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.project_invitations IS ''Nuclear cleanup - %s''', NOW()::text);
END $$;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Step 7: Verify state
DO $$
DECLARE
    obj_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION REPORT';
    RAISE NOTICE '========================================';

    -- Check policies
    SELECT COUNT(*) INTO obj_count
    FROM pg_policies
    WHERE schemaname = 'public';
    RAISE NOTICE 'Policies remaining: %', obj_count;

    -- Check triggers
    SELECT COUNT(*) INTO obj_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    AND NOT t.tgisinternal;
    RAISE NOTICE 'Triggers remaining: %', obj_count;

    RAISE NOTICE '========================================';
END $$;
