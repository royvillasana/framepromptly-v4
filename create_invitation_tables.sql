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
DROP POLICY IF EXISTS "Users can view invitations for their projects or sent to them" ON public.project_invitations;
CREATE POLICY "Users can view invitations for their projects or sent to them" ON public.project_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR 
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Users can create invitations for projects they own
DROP POLICY IF EXISTS "Users can create invitations for their projects" ON public.project_invitations;
CREATE POLICY "Users can create invitations for their projects" ON public.project_invitations
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Users can update invitations they sent or that were sent to them
DROP POLICY IF EXISTS "Users can update their invitations" ON public.project_invitations;
CREATE POLICY "Users can update their invitations" ON public.project_invitations
    FOR UPDATE USING (
        invited_by = auth.uid() OR 
        invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Users can delete invitations for projects they own
DROP POLICY IF EXISTS "Users can delete invitations for their projects" ON public.project_invitations;
CREATE POLICY "Users can delete invitations for their projects" ON public.project_invitations
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- RLS policies for project_members
-- Users can view members of projects they own or are members of
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
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
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
CREATE POLICY "Project owners can add members" ON public.project_members
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Project owners can update member roles
DROP POLICY IF EXISTS "Project owners can update member roles" ON public.project_members;
CREATE POLICY "Project owners can update member roles" ON public.project_members
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Project owners can remove members
DROP POLICY IF EXISTS "Project owners can remove members" ON public.project_members;
CREATE POLICY "Project owners can remove members" ON public.project_members
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );