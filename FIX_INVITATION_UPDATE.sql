-- Fix: Allow users to update (decline/accept) invitations sent to their email
-- The issue is that we only have a SELECT policy, but no UPDATE policy

-- First, check existing policies on project_invitations
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'project_invitations';

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Users can update invitations for their email" ON public.project_invitations;

-- Create a SECURITY DEFINER function to check if the user's email matches the invitation
CREATE OR REPLACE FUNCTION public.user_can_update_invitation(invitation_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email = invitation_email
  );
$$;

-- Add UPDATE policy using the SECURITY DEFINER function
CREATE POLICY "Users can update invitations for their email"
ON public.project_invitations
FOR UPDATE
USING (
  public.user_can_update_invitation(invited_email)
)
WITH CHECK (
  public.user_can_update_invitation(invited_email)
);

-- Verify the new policy was created
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'project_invitations'
ORDER BY cmd, policyname;
