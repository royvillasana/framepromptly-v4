-- Add yjs_state column to projects table for Yjs document persistence
-- This stores the binary state of the Yjs document for real-time collaboration

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS yjs_state TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.projects.yjs_state IS 'Base64-encoded Yjs document state for real-time collaboration. Used by Hocuspocus server for persistence.';

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_projects_yjs_state_not_null
ON public.projects (id)
WHERE yjs_state IS NOT NULL;

-- Grant necessary permissions (if needed)
-- The yjs_state column inherits RLS policies from the projects table
