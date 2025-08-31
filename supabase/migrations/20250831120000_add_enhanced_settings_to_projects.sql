-- Add enhanced_settings column to projects table
ALTER TABLE projects ADD COLUMN enhanced_settings JSONB;

-- Add comment for documentation
COMMENT ON COLUMN projects.enhanced_settings IS 'Stores enhanced prompt settings including industry context, project context, and quality settings for centralized knowledge management';

-- Create index for enhanced_settings queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_projects_enhanced_settings 
ON projects USING GIN (enhanced_settings);