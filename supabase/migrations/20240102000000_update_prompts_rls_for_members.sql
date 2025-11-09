-- Update prompts table RLS policies to include project_members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

-- Recreate policies with project_members support

-- SELECT: Users can view prompts for projects they own or are members of
CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can create prompts for projects they own or are editors of
CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- UPDATE: Users can update prompts for projects they own or are editors of
CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- DELETE: Users can delete prompts for projects they own or are editors of
CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );
