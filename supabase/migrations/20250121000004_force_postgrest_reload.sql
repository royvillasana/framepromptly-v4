-- ==============================================================================
-- FORCE POSTGREST SCHEMA RELOAD - Aggressive cache invalidation
-- ==============================================================================
-- PostgREST still serving old schema after database cleanup
-- This migration forces a hard reload by modifying table metadata
-- ==============================================================================

-- Step 1: Verify current state (should be clean)
DO $$
DECLARE
    policy_count INT;
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND NOT t.tgisinternal;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PRE-RELOAD STATE CHECK';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Policies: %', policy_count;
    RAISE NOTICE 'Triggers: %', trigger_count;

    IF policy_count > 0 THEN
        RAISE WARNING 'Found % policies - database not clean!', policy_count;
    END IF;
END $$;

-- Step 2: Ensure grants are correct (PostgREST needs these)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 3: Modify table metadata to force cache invalidation
-- Adding/updating comments forces PostgREST to recognize changes
DO $$
BEGIN
    EXECUTE format(
        'COMMENT ON TABLE public.projects IS ''PostgREST reload forced - RLS disabled - %s''',
        NOW()::text
    );

    EXECUTE format(
        'COMMENT ON TABLE public.project_members IS ''PostgREST reload forced - RLS disabled - %s''',
        NOW()::text
    );

    EXECUTE format(
        'COMMENT ON TABLE public.prompts IS ''PostgREST reload forced - RLS disabled - %s''',
        NOW()::text
    );

    EXECUTE format(
        'COMMENT ON TABLE public.project_invitations IS ''PostgREST reload forced - RLS disabled - %s''',
        NOW()::text
    );

    RAISE NOTICE 'Table comments updated with timestamp';
END $$;

-- Step 4: Multiple NOTIFY attempts
-- Different channels to ensure PostgREST receives the message
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Alternative notification method
DO $$
BEGIN
    PERFORM pg_notify('pgrst', 'reload schema');
    PERFORM pg_notify('pgrst', 'reload config');
    RAISE NOTICE 'NOTIFY commands sent';
END $$;

-- Step 5: Verify RLS is still disabled
DO $$
DECLARE
    table_rec RECORD;
    any_enabled BOOLEAN := false;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS STATUS VERIFICATION';
    RAISE NOTICE '========================================';

    FOR table_rec IN
        SELECT
            c.relname,
            c.relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        IF table_rec.relrowsecurity THEN
            RAISE WARNING 'RLS ENABLED on %', table_rec.relname;
            any_enabled := true;
        ELSE
            RAISE NOTICE 'RLS disabled on %', table_rec.relname;
        END IF;
    END LOOP;

    IF any_enabled THEN
        RAISE EXCEPTION 'RLS should be disabled but is enabled on some tables!';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUCCESS: All tables have RLS disabled';
    RAISE NOTICE '========================================';
END $$;

-- Step 6: Final verification report
DO $$
DECLARE
    policy_count INT;
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND NOT t.tgisinternal;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL STATE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Policies: %', policy_count;
    RAISE NOTICE 'Triggers: %', trigger_count;
    RAISE NOTICE 'RLS: DISABLED on all tables';
    RAISE NOTICE 'Grants: UPDATED for anon and authenticated';
    RAISE NOTICE 'Comments: UPDATED with timestamp';
    RAISE NOTICE 'NOTIFY: SENT to PostgREST';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'If API still returns 500 errors:';
    RAISE NOTICE '1. Restart PostgREST service via Supabase Dashboard';
    RAISE NOTICE '2. Settings → Infrastructure → Restart PostgREST';
    RAISE NOTICE '3. Wait 2-3 minutes';
    RAISE NOTICE '4. Hard refresh browser (Cmd+Shift+R)';
    RAISE NOTICE '========================================';
END $$;
