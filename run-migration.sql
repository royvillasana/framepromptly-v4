-- Run this SQL query in your Supabase SQL Editor to add the missing enhanced_settings column

-- Add enhanced_settings column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS enhanced_settings JSONB;

-- Add comment for documentation
COMMENT ON COLUMN projects.enhanced_settings IS 'Stores enhanced prompt settings including industry context, project context, and quality settings for centralized knowledge management';

-- Create index for enhanced_settings queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_projects_enhanced_settings 
ON projects USING GIN (enhanced_settings);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'enhanced_settings';