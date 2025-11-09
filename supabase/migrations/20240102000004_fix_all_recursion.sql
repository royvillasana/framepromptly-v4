-- Comprehensive fix for all infinite recursion errors
-- The root cause: circular dependencies between projects, project_members, prompts, and knowledge_base

-- Step 1: Drop all problematic policies
DROP POLICY IF EXISTS "Users can view prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their projects" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their projects" ON public.prompts;

DROP POLICY IF EXISTS "Users can view knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete knowledge base for their projects" ON public.knowledge_base;

DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update member roles" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON public.project_members;

-- Step 2: Create helper functions that bypass RLS (SECURITY DEFINER)

-- Check if user owns a project (direct ownership, no joins)
CREATE OR REPLACE FUNCTION public.user_owns_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = user_owns_project.project_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can edit project (owner or editor member)
CREATE OR REPLACE FUNCTION public.user_can_edit_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check direct ownership
  IF EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = user_can_edit_project.project_id
    AND user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is editor member
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = user_can_edit_project.project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has any access to project (owner, editor, or viewer)
CREATE OR REPLACE FUNCTION public.user_has_project_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check direct ownership
  IF EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = user_has_project_access.project_id
    AND user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is any kind of member
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = user_has_project_access.project_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Recreate policies using helper functions (no recursion)

-- Prompts policies
CREATE POLICY "Users can view prompts for their projects" ON public.prompts
    FOR SELECT USING (
        public.user_has_project_access(project_id)
    );

CREATE POLICY "Users can create prompts for their projects" ON public.prompts
    FOR INSERT WITH CHECK (
        public.user_can_edit_project(project_id)
    );

CREATE POLICY "Users can update prompts for their projects" ON public.prompts
    FOR UPDATE USING (
        public.user_can_edit_project(project_id)
    );

CREATE POLICY "Users can delete prompts for their projects" ON public.prompts
    FOR DELETE USING (
        public.user_can_edit_project(project_id)
    );

-- Knowledge base policies
CREATE POLICY "Users can view knowledge base for their projects" ON public.knowledge_base
    FOR SELECT USING (
        public.user_has_project_access(project_id)
    );

CREATE POLICY "Users can create knowledge base for their projects" ON public.knowledge_base
    FOR INSERT WITH CHECK (
        public.user_can_edit_project(project_id)
    );

CREATE POLICY "Users can update knowledge base for their projects" ON public.knowledge_base
    FOR UPDATE USING (
        public.user_can_edit_project(project_id)
    );

CREATE POLICY "Users can delete knowledge base for their projects" ON public.knowledge_base
    FOR DELETE USING (
        public.user_can_edit_project(project_id)
    );

-- Project members policies (no recursion - just check direct project ownership)
CREATE POLICY "Users can view members of their projects" ON public.project_members
    FOR SELECT USING (
        -- User is project owner OR user is a member of the project
        public.user_owns_project(project_id) OR
        user_id = auth.uid()
    );

CREATE POLICY "Project owners can add members" ON public.project_members
    FOR INSERT WITH CHECK (
        public.user_owns_project(project_id)
    );

CREATE POLICY "Project owners can update member roles" ON public.project_members
    FOR UPDATE USING (
        public.user_owns_project(project_id)
    );

CREATE POLICY "Project owners can remove members" ON public.project_members
    FOR DELETE USING (
        public.user_owns_project(project_id)
    );

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_owns_project(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_edit_project(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_project_access(UUID) TO authenticated;
