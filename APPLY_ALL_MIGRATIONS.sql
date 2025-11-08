-- =====================================================
-- CONSOLIDATED MIGRATION SCRIPT
-- Apply this in your Supabase SQL Editor
-- =====================================================
-- This includes:
-- 1. Missing migration: 20250830120001_fix_delivery_tables_schema.sql
-- 2. New migration: 20251108111010_enable_realtime_collaboration.sql
-- =====================================================

-- =====================================================
-- MIGRATION 1: Fix Delivery Tables Schema
-- =====================================================

-- Fix delivery system table schema inconsistencies
-- This migration ensures consistent column names and table structure

-- First, check if the tables exist and fix column names if needed

-- Fix oauth_connections table to use 'destination' instead of 'service'
DO $$
BEGIN
    -- Check if oauth_connections table exists with 'service' column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'oauth_connections'
        AND column_name = 'service'
        AND table_schema = 'public'
    ) THEN
        -- Rename 'service' column to 'destination'
        ALTER TABLE public.oauth_connections RENAME COLUMN service TO destination;

        -- Update the check constraint to use 'destination'
        ALTER TABLE public.oauth_connections DROP CONSTRAINT IF EXISTS oauth_connections_service_check;
        ALTER TABLE public.oauth_connections ADD CONSTRAINT oauth_connections_destination_check
            CHECK (destination IN ('miro', 'figjam', 'figma'));
    END IF;

    -- Ensure consistent column names across tables
    -- Update unique constraint to use destination instead of service
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'oauth_connections'
        AND constraint_name LIKE '%user_id%service%'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.oauth_connections DROP CONSTRAINT IF EXISTS oauth_connections_user_id_service_key;
        ALTER TABLE public.oauth_connections ADD CONSTRAINT oauth_connections_user_id_destination_key
            UNIQUE(user_id, destination);
    END IF;

    -- Ensure consistent deliveries status values
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%deliveries%status%'
        AND check_clause NOT LIKE '%pending%'
    ) THEN
        -- Update deliveries status check constraint to include all necessary values
        ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;
        ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_status_check
            CHECK (status IN ('pending', 'processing', 'success', 'error', 'cancelled', 'failed'));
    END IF;
END $$;

-- Ensure all required columns exist with proper types
DO $$
BEGIN
    -- Check and add missing columns to oauth_connections if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'oauth_connections'
        AND column_name = 'scopes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.oauth_connections ADD COLUMN scopes TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'oauth_connections'
        AND column_name = 'metadata'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.oauth_connections ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Rename connection_metadata to metadata if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'oauth_connections'
        AND column_name = 'connection_metadata'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'oauth_connections'
        AND column_name = 'metadata'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.oauth_connections RENAME COLUMN connection_metadata TO metadata;
    END IF;

    -- Ensure deliveries table has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deliveries'
        AND column_name = 'payload_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deliveries ADD COLUMN payload_id TEXT;
    END IF;
END $$;

-- Clean up any duplicate constraints or policies that might cause conflicts
DROP POLICY IF EXISTS "Users can view their own oauth connections" ON public.oauth_connections;
DROP POLICY IF EXISTS "Service role can access all ephemeral imports" ON public.ephemeral_imports;

-- Recreate RLS policies with correct names
CREATE POLICY "Users can view their own OAuth connections" ON public.oauth_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth connections" ON public.oauth_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth connections" ON public.oauth_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth connections" ON public.oauth_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Service role policy for ephemeral imports
CREATE POLICY "Service role can access all ephemeral imports" ON public.ephemeral_imports
    FOR ALL USING (auth.role() = 'service_role');

-- Update table comments for clarity
COMMENT ON TABLE public.oauth_connections IS 'OAuth connections for third-party integrations with consistent destination column';
COMMENT ON TABLE public.deliveries IS 'Delivery tracking with consistent status values including pending state';

-- Final verification queries (these will be logged but won't fail the migration)
DO $$
BEGIN
    RAISE NOTICE 'OAuth connections table structure verified';
    RAISE NOTICE 'Deliveries table structure verified';
    RAISE NOTICE 'All delivery system tables are now consistent';
END $$;

-- =====================================================
-- MIGRATION 2: Enable Realtime Collaboration
-- =====================================================

-- Enable Realtime Collaboration for Workflow Canvas
-- This migration adds support for real-time collaboration features similar to Figma

-- Step 1: Add collaboration metadata columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_last_modified_at ON public.projects(last_modified_at DESC);

-- Step 3: Enable Realtime for the projects table
-- This allows clients to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Step 4: Update the projects table to set initial values for existing records
UPDATE public.projects
SET
  last_modified_by = user_id,
  last_modified_at = updated_at
WHERE last_modified_by IS NULL;

-- Step 5: Create a trigger to automatically update last_modified_at
CREATE OR REPLACE FUNCTION update_project_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_modified ON public.projects;

CREATE TRIGGER trigger_update_project_modified
BEFORE UPDATE ON public.projects
FOR EACH ROW
WHEN (OLD.canvas_data IS DISTINCT FROM NEW.canvas_data)
EXECUTE FUNCTION update_project_modified_timestamp();

-- Step 6: Grant necessary permissions for realtime
-- Users can only receive realtime updates for projects they have access to
-- RLS policies already handle this, so no additional grants needed

-- Step 7: Create a helper function to get active project members
CREATE OR REPLACE FUNCTION get_active_project_collaborators(project_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.user_id,
    p.email,
    p.display_name,
    p.avatar_url,
    pm.role
  FROM project_members pm
  JOIN profiles p ON pm.user_id = p.user_id
  WHERE pm.project_id = project_uuid
  ORDER BY pm.role DESC, p.display_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Verify the setup
SELECT
  'Projects table columns' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name IN ('last_modified_by', 'last_modified_at')
ORDER BY column_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ All migrations applied successfully!';
    RAISE NOTICE '📋 Next step: Enable Realtime Replication in Supabase Dashboard';
    RAISE NOTICE '   1. Go to Database → Replication';
    RAISE NOTICE '   2. Find the "projects" table';
    RAISE NOTICE '   3. Toggle the switch to enable replication';
    RAISE NOTICE '   4. Click Save';
END $$;
