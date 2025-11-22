-- FORCE disable RLS on project_members - more aggressive approach

-- First, drop ALL policies (use CASCADE to drop dependencies)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on project_members
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'project_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_members CASCADE', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Force disable RLS
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (this will show in migration output)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class
        WHERE relname = 'project_members'
        AND relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is still enabled on project_members!';
    ELSE
        RAISE NOTICE 'SUCCESS: RLS is disabled on project_members';
    END IF;
END $$;

-- Also fix project_invitations to completely remove the auth.users reference issue
-- The problem is the foreign key itself might be causing the permission error
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;

CREATE POLICY "view_invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = COALESCE((auth.jwt() ->> 'email'), '') OR
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );
