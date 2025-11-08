-- Test RLS policies
-- Run this in the SQL editor while authenticated as a user

-- 1. Check if the policy exists and its definition
SELECT policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
  AND policyname = 'Users can view their own and shared projects';

-- 2. Test the subquery that's causing issues
-- This checks if there are any records in project_members
SELECT COUNT(*) as member_count
FROM public.project_members;

-- 3. Check if the projects table has the correct structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects';

-- 4. Try a simple select on projects (this will use RLS)
-- If this fails, the policy has an issue
SELECT COUNT(*) as project_count
FROM public.projects;
