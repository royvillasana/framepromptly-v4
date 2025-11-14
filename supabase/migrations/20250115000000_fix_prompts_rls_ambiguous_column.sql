-- Fix ambiguous column reference in prompts RLS policies
-- The issue: "project_id" is ambiguous between prompts table and subquery

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

-- Recreate policies with properly qualified column names

-- SELECT: Users can view prompts for projects they own or are members of
CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        prompts.project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        prompts.project_id IN (
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can create prompts for projects they own or are editors of
CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        prompts.project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        prompts.project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- UPDATE: Users can update prompts for projects they own or are editors of
CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        prompts.project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        prompts.project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- DELETE: Users can delete prompts for projects they own or are editors of
CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        prompts.project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        prompts.project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );
