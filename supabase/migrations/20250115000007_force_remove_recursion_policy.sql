-- Force remove the problematic "Project owners can view all members" policy
-- This policy queries the projects table, which creates infinite recursion

DROP POLICY IF EXISTS "Project owners can view all members" ON public.project_members;

-- Ensure ONLY the simple membership policy exists
-- This one doesn't cause recursion because it only checks user_id
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.project_members;

CREATE POLICY "Users can view their own memberships" ON public.project_members
    FOR SELECT USING (user_id = auth.uid());
