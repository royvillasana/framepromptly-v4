-- Simplify RLS policies to avoid auth.users permission issues
-- This creates more permissive policies that don't cross schema boundaries

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can create invitations for their projects" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can delete invitations for their projects" ON public.project_invitations;

-- Create simpler policies for project_invitations
-- Allow authenticated users to view invitations they sent or for projects they own
CREATE POLICY "Allow authenticated users to view their invitations" ON public.project_invitations
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            invited_by = auth.uid() OR
            project_id IN (
                SELECT id FROM public.projects WHERE user_id = auth.uid()
            )
        )
    );

-- Allow authenticated users to create invitations for projects they own
CREATE POLICY "Allow project owners to create invitations" ON public.project_invitations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Allow users to update invitations they sent
CREATE POLICY "Allow users to update their own invitations" ON public.project_invitations
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        invited_by = auth.uid()
    );

-- Allow users to delete invitations they sent or for projects they own
CREATE POLICY "Allow users to delete their invitations" ON public.project_invitations
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND (
            invited_by = auth.uid() OR
            project_id IN (
                SELECT id FROM public.projects WHERE user_id = auth.uid()
            )
        )
    );

-- Also create an RPC function for deleting invitations safely
CREATE OR REPLACE FUNCTION public.delete_project_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    invitation_record RECORD;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get the invitation record
    SELECT * INTO invitation_record 
    FROM public.project_invitations 
    WHERE id = invitation_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has permission (either sent the invitation or owns the project)
    IF invitation_record.invited_by = current_user_id THEN
        has_permission := TRUE;
    ELSE
        -- Check if user owns the project
        SELECT EXISTS(
            SELECT 1 FROM public.projects 
            WHERE id = invitation_record.project_id AND user_id = current_user_id
        ) INTO has_permission;
    END IF;
    
    -- Delete if has permission
    IF has_permission THEN
        DELETE FROM public.project_invitations WHERE id = invitation_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Grant access to the delete function
GRANT EXECUTE ON FUNCTION public.delete_project_invitation(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_project_invitation(UUID) TO authenticated;