-- Fix the ambiguous column reference error in the RPC functions

CREATE OR REPLACE FUNCTION public.get_project_members_with_users(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    user_id UUID,
    role TEXT,
    joined_at TIMESTAMPTZ,
    added_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    has_access BOOLEAN := FALSE;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- Check if user has access to this project
    IF current_user_id IS NOT NULL THEN
        -- Check if user owns the project (fix ambiguous reference)
        SELECT EXISTS(
            SELECT 1 FROM public.projects p
            WHERE p.id = project_uuid AND p.user_id = current_user_id
        ) INTO has_access;
        
        -- If not owner, check if user is a member
        IF NOT has_access THEN
            SELECT EXISTS(
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_uuid AND pm.user_id = current_user_id
            ) INTO has_access;
        END IF;
    END IF;
    
    -- Only return data if user has access
    IF has_access THEN
        RETURN QUERY
        SELECT 
            pm.id,
            pm.project_id,
            pm.user_id,
            pm.role,
            pm.joined_at,
            pm.added_by,
            pm.created_at,
            pm.updated_at,
            COALESCE(au.email, 'Unknown User')::TEXT as user_email
        FROM public.project_members pm
        LEFT JOIN auth.users au ON pm.user_id = au.id
        WHERE pm.project_id = project_uuid
        ORDER BY pm.joined_at DESC;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_project_invitations(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    invited_email TEXT,
    role TEXT,
    status TEXT,
    invited_by UUID,
    invitation_token UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    has_access BOOLEAN := FALSE;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- Check if user has access to this project
    IF current_user_id IS NOT NULL THEN
        -- Check if user owns the project (fix ambiguous reference)
        SELECT EXISTS(
            SELECT 1 FROM public.projects p
            WHERE p.id = project_uuid AND p.user_id = current_user_id
        ) INTO has_access;
        
        -- If not owner, check if user is a member
        IF NOT has_access THEN
            SELECT EXISTS(
                SELECT 1 FROM public.project_members pm
                WHERE pm.project_id = project_uuid AND pm.user_id = current_user_id
            ) INTO has_access;
        END IF;
    END IF;
    
    -- Only return data if user has access
    IF has_access THEN
        RETURN QUERY
        SELECT 
            pi.id,
            pi.project_id,
            pi.invited_email,
            pi.role,
            pi.status,
            pi.invited_by,
            pi.invitation_token,
            pi.expires_at,
            pi.created_at,
            pi.updated_at,
            pi.accepted_at,
            pi.accepted_by
        FROM public.project_invitations pi
        WHERE pi.project_id = project_uuid
        ORDER BY pi.created_at DESC;
    END IF;
END;
$$;

-- Grant access to the updated functions
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_invitations(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_project_invitations(UUID) TO authenticated;