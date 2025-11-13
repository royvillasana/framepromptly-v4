-- Fix RLS policies for project_invitations to use auth.jwt() instead of querying auth.users
-- This fixes "permission denied for table users" error when declining invitations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON public.project_invitations;

-- Recreate SELECT policy using auth.jwt() to get email
CREATE POLICY "Users can view invitations for their projects or sent to them" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = auth.jwt()->>'email' OR
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Recreate UPDATE policy using auth.jwt() to get email
CREATE POLICY "Users can update their invitations" ON public.project_invitations
    FOR UPDATE USING (
        invited_by = auth.uid() OR
        invited_email = auth.jwt()->>'email'
    );

-- Verify the policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'project_invitations'
ORDER BY policyname;
