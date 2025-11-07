-- Update RLS policy for projects to include shared projects
-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Create new SELECT policy that includes both owned and shared projects
CREATE POLICY "Users can view their own and shared projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = user_id OR  -- User is the owner
  id IN (  -- OR user is a member
    SELECT project_id
    FROM public.project_members
    WHERE user_id = auth.uid()
  )
);

-- Update knowledge_base policies to include shared projects
DROP POLICY IF EXISTS "Users can view knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update knowledge base for their projects" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete knowledge base for their projects" ON public.knowledge_base;

CREATE POLICY "Users can view knowledge base for their projects"
ON public.knowledge_base
FOR SELECT
USING (
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create knowledge base for their projects"
ON public.knowledge_base
FOR INSERT
WITH CHECK (
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);

CREATE POLICY "Users can update knowledge base for their projects"
ON public.knowledge_base
FOR UPDATE
USING (
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);

CREATE POLICY "Users can delete knowledge base for their projects"
ON public.knowledge_base
FOR DELETE
USING (
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);

-- Update prompts table policies to include shared projects
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can create their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;

CREATE POLICY "Users can view prompts for their projects"
ON public.prompts
FOR SELECT
USING (
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is a member
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create prompts for their projects"
ON public.prompts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);

CREATE POLICY "Users can update their own prompts in accessible projects"
ON public.prompts
FOR UPDATE
USING (
  auth.uid() = user_id AND
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);

CREATE POLICY "Users can delete their own prompts in accessible projects"
ON public.prompts
FOR DELETE
USING (
  auth.uid() = user_id AND
  project_id IN (
    -- Projects owned by user
    SELECT id FROM projects WHERE user_id = auth.uid()
    UNION
    -- Projects where user is an editor or owner
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
  )
);
