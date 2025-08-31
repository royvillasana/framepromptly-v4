-- Add Miro connection settings to projects table
-- This allows each project to store its own Miro access token and settings
ALTER TABLE public.projects 
ADD COLUMN miro_settings JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.projects.miro_settings IS 'Stores Miro connection settings including access token, connected boards, and preferences. Structure: {"accessToken": "string", "connectedBoards": [{"id": "string", "name": "string", "lastUsed": "timestamp"}], "defaultBoardId": "string", "autoConnect": boolean}';

-- Update existing projects to have empty miro_settings
UPDATE public.projects SET miro_settings = '{}'::jsonb WHERE miro_settings IS NULL;