-- Update knowledge_base table RLS policies to include project_members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete knowledge base for their projects" ON public.knowledge_base;

-- Recreate policies with project_members support

-- SELECT: Users can view knowledge base for projects they own or are members of
CREATE POLICY "Users can view knowledge base for their projects" ON public.knowledge_base
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can create knowledge base for projects they own or are editors of
CREATE POLICY "Users can create knowledge base for their projects" ON public.knowledge_base
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- UPDATE: Users can update knowledge base for projects they own or are editors of
CREATE POLICY "Users can update knowledge base for their projects" ON public.knowledge_base
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- DELETE: Users can delete knowledge base for projects they own or are editors of
CREATE POLICY "Users can delete knowledge base for their projects" ON public.knowledge_base
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );
