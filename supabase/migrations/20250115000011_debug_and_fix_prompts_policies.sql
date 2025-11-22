-- Debug and fix prompts RLS policies
-- Drop ALL possible prompts policies to ensure clean slate

-- First, get a list of all policies on prompts table (for debugging)
-- This will show up in the migration output

-- Drop every possible prompts policy name we've used
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can view own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete own project prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts in accessible projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts in accessible projects" ON public.prompts;

-- Also check if there are any other policies and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'prompts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.prompts', policy_record.policyname);
    END LOOP;
END $$;

-- Now create ONE simple SELECT policy for testing
-- If this works, we'll know the functions work and we can add the rest
CREATE POLICY "prompts_select_policy" ON public.prompts
    FOR SELECT USING (
        -- Direct ownership check (no function call)
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

-- Create other operation policies
CREATE POLICY "prompts_insert_policy" ON public.prompts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "prompts_update_policy" ON public.prompts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "prompts_delete_policy" ON public.prompts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = prompts.project_id
            AND p.user_id = auth.uid()
        )
    );

-- ============================================================================
-- WHY THIS SHOULD WORK:
-- ============================================================================
-- The prompts policies now ONLY check the projects table.
-- The projects table has a policy that uses the SECURITY DEFINER function
-- user_is_project_member(), which bypasses RLS when checking project_members.
--
-- Flow:
-- 1. Query prompts → prompts RLS checks projects table
-- 2. projects table RLS calls user_is_project_member()
-- 3. user_is_project_member() queries project_members WITHOUT RLS
-- 4. No recursion!
