-- Check existing RLS policies for projects, project_members, and project_invitations
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
  AND tablename IN ('projects', 'project_members', 'project_invitations', 'prompts', 'knowledge_base')
ORDER BY tablename, policyname;
