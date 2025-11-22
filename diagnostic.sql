-- Check current RLS policies
SELECT
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('prompts', 'project_invitations', 'project_members')
ORDER BY tablename, policyname;
