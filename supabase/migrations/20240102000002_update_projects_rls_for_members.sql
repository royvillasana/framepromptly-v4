-- Update projects table RLS policies to include project_members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Recreate policies with project_members support

-- SELECT: Users can view projects they own or are members of
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (
        user_id = auth.uid() OR
        id IN (
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can create their own projects
CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update projects they own or are editors of
CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (
        user_id = auth.uid() OR
        id IN (
            SELECT project_id FROM public.project_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
        )
    );

-- DELETE: Only project owners can delete projects
CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (user_id = auth.uid());
