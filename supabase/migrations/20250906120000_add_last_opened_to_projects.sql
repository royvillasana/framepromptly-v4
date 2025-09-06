-- Add last_opened column to projects table to track when a project was last accessed
ALTER TABLE public.projects 
ADD COLUMN last_opened TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.last_opened IS 'Timestamp when the project was last opened/accessed by the user';

-- Create index for better performance when ordering by last_opened
CREATE INDEX IF NOT EXISTS idx_projects_last_opened 
ON public.projects (last_opened DESC NULLS LAST);