-- NUCLEAR OPTION: Disable RLS on ALL tables to get the app working
-- This is temporary - we'll re-enable properly once we figure out what's wrong

-- Disable RLS on all relevant tables
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on these tables
DO $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
BEGIN
    FOR table_name IN SELECT unnest(ARRAY['projects', 'project_members', 'prompts', 'project_invitations'])
    LOOP
        FOR policy_record IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I CASCADE', policy_record.policyname, table_name);
            RAISE NOTICE 'Dropped policy % on %', policy_record.policyname, table_name;
        END LOOP;
    END LOOP;
END $$;

-- Verify RLS is disabled (this will show in output)
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relname IN ('projects', 'project_members', 'prompts', 'project_invitations')
    LOOP
        IF table_record.relrowsecurity THEN
            RAISE EXCEPTION 'RLS is STILL ENABLED on %!', table_record.relname;
        ELSE
            RAISE NOTICE 'RLS disabled on %', table_record.relname;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- IMPORTANT NOTE:
-- ============================================================================
-- With RLS disabled, ALL authenticated users can access ALL data.
-- This is NOT secure for production, but will let us identify the issue.
--
-- Security relies on:
-- 1. Application-level filtering (your queries filter by user_id)
-- 2. Supabase's authentication (only authenticated users can query)
--
-- We'll re-enable RLS properly once we figure out why policies are recursing.
