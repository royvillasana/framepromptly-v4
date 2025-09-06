-- Create a view that joins project_members with auth.users to get email information
-- This solves the cross-schema relationship issue

CREATE OR REPLACE VIEW public.project_members_with_users AS
SELECT 
    pm.*,
    au.email as user_email,
    au.created_at as user_created_at
FROM public.project_members pm
LEFT JOIN auth.users au ON pm.user_id = au.id;

-- Grant access to the view
GRANT SELECT ON public.project_members_with_users TO anon;
GRANT SELECT ON public.project_members_with_users TO authenticated;

-- Enable RLS on the view
ALTER VIEW public.project_members_with_users SET (security_invoker = true);

-- Create a simple RPC function to get project members with user details
-- as an alternative approach
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
BEGIN
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
        au.email::TEXT as user_email
    FROM public.project_members pm
    LEFT JOIN auth.users au ON pm.user_id = au.id
    WHERE pm.project_id = project_uuid
    ORDER BY pm.joined_at DESC;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO authenticated;