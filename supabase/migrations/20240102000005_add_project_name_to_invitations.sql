-- Add project_name to project_invitations table
-- This allows invited users to see the project name before accepting
-- without needing access to the projects table via RLS

ALTER TABLE public.project_invitations
ADD COLUMN IF NOT EXISTS project_name TEXT;

-- Backfill existing invitations with project names
UPDATE public.project_invitations
SET project_name = (
  SELECT name FROM public.projects WHERE id = project_invitations.project_id
)
WHERE project_name IS NULL;

-- Make project_name NOT NULL for future rows
ALTER TABLE public.project_invitations
ALTER COLUMN project_name SET NOT NULL;
