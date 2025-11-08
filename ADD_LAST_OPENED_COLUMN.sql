-- Add the missing last_opened column to projects table
-- This column tracks when a user last opened a project

-- Add the column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_opened TIMESTAMPTZ;

-- Create index for better query performance on last_opened
CREATE INDEX IF NOT EXISTS idx_projects_last_opened ON public.projects(last_opened DESC);

-- Set initial values for existing projects (optional - sets to updated_at)
UPDATE public.projects
SET last_opened = updated_at
WHERE last_opened IS NULL;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

-- Verify the column was created
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name = 'last_opened';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ last_opened column has been added to projects table';
  RAISE NOTICE '✅ Schema cache has been reloaded';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now refresh your browser and access projects!';
END $$;
