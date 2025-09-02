-- Complete database setup for FramePromptly
-- Run this SQL in your Supabase SQL Editor to enable all features

-- 1. Add enhanced_settings column to projects table (if not already added)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS enhanced_settings JSONB;

-- Add comment for documentation
COMMENT ON COLUMN projects.enhanced_settings IS 'Stores enhanced prompt settings including industry context, project context, and quality settings for centralized knowledge management';

-- Create index for enhanced_settings queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_projects_enhanced_settings 
ON projects USING GIN (enhanced_settings);

-- 2. Create project invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    invited_email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('viewer', 'editor')) NOT NULL DEFAULT 'viewer',
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) NOT NULL DEFAULT 'pending',
    invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create project members table  
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(project_id, user_id)
);

-- 4. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for project_invitations
CREATE POLICY IF NOT EXISTS "Users can view invitations they sent or received" ON project_invitations
FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = auth.email()
);

CREATE POLICY IF NOT EXISTS "Users can create invitations for their projects" ON project_invitations
FOR INSERT WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can update their own invitations" ON project_invitations
FOR UPDATE USING (invited_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own invitations" ON project_invitations
FOR DELETE USING (invited_by = auth.uid());

-- 6. Create RLS policies for project_members
CREATE POLICY IF NOT EXISTS "Users can view members of their projects" ON project_members
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM project_members pm2
        WHERE pm2.project_id = project_members.project_id 
        AND pm2.user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Project owners can add members" ON project_members
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Project owners can update member roles" ON project_members
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Project owners and members themselves can remove membership" ON project_members
FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);

-- 7. Create RLS policies for avatars storage bucket
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Create function to automatically add project owner as member
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role, added_by)
    VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to automatically add project owner as member
DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION add_project_owner_as_member();

-- 10. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_project_invitations_updated_at BEFORE UPDATE ON project_invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify setup
SELECT 'Enhanced settings column' as feature, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'projects' AND column_name = 'enhanced_settings'
       ) THEN '✅ Enabled' ELSE '❌ Missing' END as status

UNION ALL

SELECT 'Project invitations table' as feature,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'project_invitations'
       ) THEN '✅ Enabled' ELSE '❌ Missing' END as status

UNION ALL

SELECT 'Project members table' as feature,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'project_members'
       ) THEN '✅ Enabled' ELSE '❌ Missing' END as status

UNION ALL

SELECT 'Avatars storage bucket' as feature,
       CASE WHEN EXISTS (
           SELECT 1 FROM storage.buckets 
           WHERE id = 'avatars'
       ) THEN '✅ Enabled' ELSE '❌ Missing' END as status;