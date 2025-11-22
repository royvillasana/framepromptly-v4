-- Create the missing RPC function for getting project members with user details

-- Drop the old function first
DROP FUNCTION IF EXISTS public.get_project_members_with_users(UUID) CASCADE;

CREATE FUNCTION public.get_project_members_with_users(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    user_id UUID,
    role TEXT,
    joined_at TIMESTAMPTZ,
    user_email TEXT,
    user_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.email as user_email,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email) as user_name
    FROM public.project_members pm
    JOIN auth.users u ON u.id = pm.user_id
    WHERE pm.project_id = project_uuid
    ORDER BY pm.joined_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_project_members_with_users(UUID) TO authenticated;

-- Also ensure project_invitations table has proper grants
GRANT ALL ON public.project_invitations TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.prompts TO authenticated;
