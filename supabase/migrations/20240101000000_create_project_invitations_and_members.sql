-- Create project_invitations table to track pending invitations
CREATE TABLE IF NOT EXISTS public.project_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES auth.users(id)
);

-- Create project_members table to track actual project members (registered users with access)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON public.project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON public.project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON public.project_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_invitations
-- Users can see invitations for projects they own or invitations sent to their email
CREATE POLICY "Users can view invitations for their projects or sent to them" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR 
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Users can create invitations for projects they own
CREATE POLICY "Users can create invitations for their projects" ON public.project_invitations
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Users can update invitations they sent or that were sent to them
CREATE POLICY "Users can update their invitations" ON public.project_invitations
    FOR UPDATE USING (
        invited_by = auth.uid() OR 
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Users can delete invitations for projects they own
CREATE POLICY "Users can delete invitations for their projects" ON public.project_invitations
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- RLS policies for project_members
-- Users can view members of projects they own or are members of
CREATE POLICY "Users can view members of their projects" ON public.project_members
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        ) OR
        project_id IN (
            SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
        )
    );

-- Project owners can add members
CREATE POLICY "Project owners can add members" ON public.project_members
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Project owners can update member roles
CREATE POLICY "Project owners can update member roles" ON public.project_members
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Project owners can remove members
CREATE POLICY "Project owners can remove members" ON public.project_members
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Create function to automatically add project owner as member when project is created
CREATE OR REPLACE FUNCTION add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_members (project_id, user_id, role, added_by)
    VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add project owner as member
DROP TRIGGER IF EXISTS add_project_owner_trigger ON public.projects;
CREATE TRIGGER add_project_owner_trigger
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION add_project_owner_as_member();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
CREATE TRIGGER update_project_invitations_updated_at
    BEFORE UPDATE ON public.project_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at
    BEFORE UPDATE ON public.project_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop the old project_shares table if it exists (we're replacing it with the new structure)
-- Uncomment these lines if you want to migrate from the old structure
-- DROP TABLE IF EXISTS public.project_shares;

-- Grant necessary permissions
GRANT ALL ON public.project_invitations TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;