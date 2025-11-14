-- ============================================
-- Add yjs_state column to projects table
-- For real-time collaboration with Yjs + Hocuspocus
-- ============================================

-- Step 1: Add the yjs_state column
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS yjs_state TEXT;

-- Step 2: Add a helpful comment
COMMENT ON COLUMN public.projects.yjs_state IS
'Base64-encoded Yjs document state for real-time collaboration. Used by Hocuspocus server for persistence. Contains the entire CRDT document state including nodes and edges.';

-- Step 3: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_yjs_state_not_null
ON public.projects (id)
WHERE yjs_state IS NOT NULL;

-- Step 4: Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'yjs_state'
    ) THEN
        RAISE NOTICE '✅ SUCCESS: yjs_state column added to projects table';
    ELSE
        RAISE EXCEPTION '❌ ERROR: Failed to add yjs_state column';
    END IF;
END $$;

-- Step 5: Show the updated table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'projects'
ORDER BY ordinal_position;
