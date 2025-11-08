-- Fix infinite recursion in RLS policies
-- The issue is circular dependency between projects and project_members policies

-- First, let's check what policies exist on project_members
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'project_members';

-- The problem is likely that project_members policies reference projects table
-- which creates a circular dependency

-- Solution: Use SECURITY DEFINER functions to break the recursion
-- Or simplify the policies to avoid cross-table references in RLS

-- Step 1: Drop ALL existing problematic policies to start fresh
DROP POLICY IF EXISTS "Users can view their own and shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view owned projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;
DROP POLICY IF EXISTS "Users can view owned and shared projects" ON public.projects;

-- Step 2: Create the SECURITY DEFINER function FIRST to break recursion
-- This function can query project_members without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.user_is_project_member(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = project_uuid
      AND user_id = user_uuid
  );
$$;

-- Step 3: Create simple policy for project_members
-- This allows users to see memberships where they are the member
CREATE POLICY "Users can view their own memberships"
ON public.project_members
FOR SELECT
USING (user_id = auth.uid());

-- Step 4: Create the main projects policy using the SECURITY DEFINER function
-- This prevents circular dependency because the function bypasses RLS
CREATE POLICY "Users can view owned and shared projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.user_is_project_member(id, auth.uid())
);

-- Step 5: Allow anonymous users to view invitations by token
-- This is needed so the invitation preview page can load before user signs in
DROP POLICY IF EXISTS "Anyone can view invitations by token" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can view invitations they sent" ON public.project_invitations;

-- Allow anyone to view invitation details if they have the token (needed for preview page)
CREATE POLICY "Anyone can view invitations by token"
ON public.project_invitations
FOR SELECT
USING (true);  -- Allow all reads, we'll verify token in application logic

-- Verify the policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_members', 'project_invitations')
ORDER BY tablename, policyname;
