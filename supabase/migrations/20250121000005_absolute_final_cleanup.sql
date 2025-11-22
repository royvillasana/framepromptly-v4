-- ==============================================================================
-- ABSOLUTE FINAL CLEANUP - Verify and force complete removal
-- ==============================================================================

-- Step 1: Show EVERYTHING that exists
DO $$
DECLARE
    policy_rec RECORD;
    trigger_rec RECORD;
    func_rec RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETE DATABASE STATE AUDIT';
    RAISE NOTICE '========================================';

    -- List ALL policies
    RAISE NOTICE 'ALL RLS POLICIES:';
    FOR policy_rec IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '  Table: %, Policy: %', policy_rec.tablename, policy_rec.policyname;
    END LOOP;

    -- List ALL triggers
    RAISE NOTICE '';
    RAISE NOTICE 'ALL TRIGGERS:';
    FOR trigger_rec IN
        SELECT c.relname as table_name, t.tgname as trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
        ORDER BY c.relname, t.tgname
    LOOP
        RAISE NOTICE '  Table: %, Trigger: %', trigger_rec.table_name, trigger_rec.trigger_name;
    END LOOP;

    -- List ALL security definer functions
    RAISE NOTICE '';
    RAISE NOTICE 'SECURITY DEFINER FUNCTIONS:';
    FOR func_rec IN
        SELECT n.nspname as schema_name, p.proname as function_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true
        ORDER BY p.proname
    LOOP
        RAISE NOTICE '  Function: %.%', func_rec.schema_name, func_rec.function_name;
    END LOOP;
END $$;

-- Step 2: Drop EVERYTHING aggressively
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DROPPING ALL POLICIES';
    RAISE NOTICE '========================================';

    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped: %.%.%', r.schemaname, r.tablename, r.policyname;
    END LOOP;
END $$;

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DROPPING ALL TRIGGERS';
    RAISE NOTICE '========================================';

    FOR r IN
        SELECT c.relname as table_name, t.tgname as trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE',
            r.trigger_name, r.table_name);
        RAISE NOTICE 'Dropped: %.%', r.table_name, r.trigger_name;
    END LOOP;
END $$;

-- Step 3: Disable RLS on EVERY table
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DISABLING RLS ON ALL TABLES';
    RAISE NOTICE '========================================';

    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'RLS disabled on: %', r.tablename;
    END LOOP;
END $$;

-- Step 4: Ensure grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Step 5: Update table metadata with NEW timestamp
DO $$
BEGIN
    EXECUTE format('COMMENT ON TABLE public.projects IS ''FINAL cleanup %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.project_members IS ''FINAL cleanup %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.prompts IS ''FINAL cleanup %s''', NOW()::text);
    EXECUTE format('COMMENT ON TABLE public.project_invitations IS ''FINAL cleanup %s''', NOW()::text);
END $$;

-- Step 6: Force notifications
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
    PERFORM pg_notify('pgrst', 'reload config');
END $$;

-- Step 7: Final verification
DO $$
DECLARE
    policy_count INT;
    trigger_count INT;
    rls_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL STATE';
    RAISE NOTICE '========================================';

    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND NOT t.tgisinternal;

    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relrowsecurity = true;

    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE 'Total triggers: %', trigger_count;
    RAISE NOTICE 'Tables with RLS enabled: %', rls_count;

    IF policy_count = 0 AND trigger_count = 0 AND rls_count = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'DATABASE IS COMPLETELY CLEAN';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'DATABASE STILL HAS OBJECTS!';
    END IF;
END $$;
