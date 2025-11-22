-- Final fix: Remove the second project_members policy that causes recursion
-- Only keep the simple "view your own memberships" policy

-- Drop the problematic policy that queries projects table
DROP POLICY IF EXISTS "Project owners can view all members" ON public.project_members;

-- The "Users can view their own memberships" policy is fine and should already exist
-- It doesn't cause recursion because it only checks user_id = auth.uid()

-- Now fix the frontend query issue by also fixing the invitation policy completely
-- The issue is it's still trying to access auth.users through the foreign key
DROP POLICY IF EXISTS "Users can view invitations" ON public.project_invitations;

-- Recreate without any joins that might access users table
CREATE POLICY "Users can view invitations" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = (auth.jwt() ->> 'email') OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_invitations.project_id
            AND projects.user_id = auth.uid()
        )
    );
