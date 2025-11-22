-- DIAGNOSTIC + NUCLEAR FIX
-- Check what policies/RLS actually exist, then force disable everything

-- Step 1: Report current state
DO $$
DECLARE
    table_record RECORD;
    policy_record RECORD;
    policy_count INT := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC REPORT';
    RAISE NOTICE '========================================';

    -- Check RLS status
    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
        AND relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        RAISE NOTICE 'Table %: RLS is %', table_record.relname,
            CASE WHEN table_record.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END;
    END LOOP;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations');

    RAISE NOTICE 'Total policies found: %', policy_count;

    -- List all policies
    IF policy_count > 0 THEN
        FOR policy_record IN
            SELECT tablename, policyname
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations')
            ORDER BY tablename, policyname
        LOOP
            RAISE NOTICE 'Policy: %.%', policy_record.tablename, policy_record.policyname;
        END LOOP;
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- Step 2: FORCE disable RLS (even if already disabled)
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_invitations DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies using dynamic SQL
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename);
        RAISE NOTICE 'Dropped policy: %.%', policy_record.tablename, policy_record.policyname;
    END LOOP;
END $$;

-- Step 4: Verify final state
DO $$
DECLARE
    table_record RECORD;
    policy_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL STATE';
    RAISE NOTICE '========================================';

    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
        AND relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        IF table_record.relrowsecurity THEN
            RAISE EXCEPTION 'FAILED: RLS still enabled on %', table_record.relname;
        ELSE
            RAISE NOTICE 'SUCCESS: RLS disabled on %', table_record.relname;
        END IF;
    END LOOP;

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('projects', 'project_members', 'prompts', 'project_invitations');

    IF policy_count > 0 THEN
        RAISE EXCEPTION 'FAILED: % policies still exist', policy_count;
    ELSE
        RAISE NOTICE 'SUCCESS: No policies remain';
    END IF;

    RAISE NOTICE '========================================';
END $$;
