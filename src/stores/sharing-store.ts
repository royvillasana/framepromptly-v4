import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectShare {
  id: string;
  project_id: string;
  shared_with_email: string;
  role: 'viewer' | 'editor';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  shared_by: string;
  shared_at: string;
  updated_at: string;
  invitation_token?: string;
  expires_at?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  added_by: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface SharingState {
  shares: ProjectShare[];
  members: ProjectMember[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  shareProject: (projectId: string, email: string, role: 'viewer' | 'editor', projectName?: string) => Promise<void>;
  updateShareRole: (shareId: string, role: 'viewer' | 'editor') => Promise<void>;
  removeShare: (shareId: string) => Promise<void>;
  fetchProjectShares: (projectId: string) => Promise<void>;
  fetchProjectMembers: (projectId: string) => Promise<void>;
  fetchAllUserShares: () => Promise<void>;
  acceptShare: (shareId: string) => Promise<void>;
  declineShare: (shareId: string) => Promise<void>;
}

export const useSharingStore = create<SharingState>((set, get) => ({
  shares: [],
  members: [],
  isLoading: false,
  error: null,

  shareProject: async (projectId: string, email: string, role: 'viewer' | 'editor', projectName?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Send invitation email which will create the invitation record
      const emailResponse = await supabase.functions.invoke('send-project-invitation', {
        body: {
          projectId,
          projectName: projectName || 'Untitled Project',
          invitedEmail: email,
          role,
          inviterName: '', // Will be filled by the function
          inviterEmail: '' // Will be filled by the function
        }
      });

      if (emailResponse.error) {
        throw new Error(emailResponse.error.message || 'Failed to send invitation');
      }

      // Refresh the invitations list
      await get().fetchProjectShares(projectId);

      console.log(`Successfully sent invitation for project ${projectId} to ${email} as ${role}`);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to share project',
        isLoading: false 
      });
      throw error;
    }
  },

  updateShareRole: async (shareId: string, role: 'viewer' | 'editor') => {
    set({ isLoading: true, error: null });
    
    try {
      // Update invitation role in database
      const { error: updateError } = await supabase
        .from('project_invitations')
        .update({ role })
        .eq('id', shareId);

      if (updateError) throw updateError;

      // Update local state
      set(state => ({
        shares: state.shares.map(share => 
          share.id === shareId 
            ? { ...share, role, updated_at: new Date().toISOString() }
            : share
        ),
        isLoading: false
      }));
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update role',
        isLoading: false 
      });
      throw error;
    }
  },

  removeShare: async (shareId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Delete invitation from database
      const { error: deleteError } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', shareId);

      if (deleteError) throw deleteError;

      // Update local state
      set(state => ({
        shares: state.shares.filter(share => share.id !== shareId),
        isLoading: false
      }));
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove share',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchProjectShares: async (projectId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch invitations for the project
      const { data: invitations, error: invitationError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId);

      if (invitationError) {
        // If project_invitations table doesn't exist, return empty shares
        if (invitationError.code === 'PGRST205' && invitationError.message?.includes('project_invitations')) {
          console.warn('Project invitations table not configured yet. Project sharing features are disabled.');
          set({ shares: [], isLoading: false });
          return;
        }
        throw invitationError;
      }

      // Transform invitations to ProjectShare format
      const shares: ProjectShare[] = (invitations || []).map(invitation => ({
        id: invitation.id,
        project_id: invitation.project_id,
        shared_with_email: invitation.invited_email,
        role: invitation.role,
        status: invitation.status,
        shared_by: invitation.invited_by,
        shared_at: invitation.created_at,
        updated_at: invitation.updated_at,
        invitation_token: invitation.invitation_token,
        expires_at: invitation.expires_at
      }));

      set({ 
        shares,
        isLoading: false 
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch shares',
        isLoading: false 
      });
    }
  },

  fetchProjectMembers: async (projectId: string) => {
    try {
      // Fetch actual members (users who have accepted invitations)
      const { data: members, error: memberError } = await supabase
        .from('project_members')
        .select(`
          *,
          user:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('project_id', projectId);

      if (memberError) {
        // If project_members table doesn't exist, return empty members
        if (memberError.code === 'PGRST205' && memberError.message?.includes('project_members')) {
          console.warn('Project members table not configured yet. Project sharing features are disabled.');
          set(state => ({ ...state, members: [] }));
          return;
        }
        throw memberError;
      }

      // Transform to ProjectMember format
      const projectMembers: ProjectMember[] = (members || []).map(member => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        added_by: member.added_by,
        user: {
          email: member.user?.email || '',
          full_name: member.user?.raw_user_meta_data?.full_name || ''
        }
      }));

      set(state => ({ 
        ...state,
        members: projectMembers
      }));
      
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  },

  acceptShare: async (shareId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      set(state => ({
        shares: state.shares.map(share => 
          share.id === shareId 
            ? { ...share, status: 'accepted' as const, updated_at: new Date().toISOString() }
            : share
        ),
        isLoading: false
      }));

      // API call would update the share status
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to accept share',
        isLoading: false 
      });
      throw error;
    }
  },

  declineShare: async (shareId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      set(state => ({
        shares: state.shares.map(share => 
          share.id === shareId 
            ? { ...share, status: 'declined' as const, updated_at: new Date().toISOString() }
            : share
        ),
        isLoading: false
      }));

      // API call would update the share status
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to decline share',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchAllUserShares: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all invitations sent by the current user
      const { data: invitations, error: invitationError } = await supabase
        .from('project_invitations')
        .select(`
          *,
          projects (
            name
          )
        `)
        .eq('invited_by', user.id);

      if (invitationError) {
        // If project_invitations table doesn't exist, return empty shares
        if (invitationError.code === 'PGRST205' && invitationError.message?.includes('project_invitations')) {
          console.warn('Project invitations table not configured yet. Project sharing features are disabled.');
          set({ shares: [], isLoading: false });
          return;
        }
        throw invitationError;
      }

      // Transform invitations to ProjectShare format
      const shares: ProjectShare[] = (invitations || []).map(invitation => ({
        id: invitation.id,
        project_id: invitation.project_id,
        shared_with_email: invitation.invited_email,
        role: invitation.role,
        status: invitation.status,
        shared_by: invitation.invited_by,
        shared_at: invitation.created_at,
        updated_at: invitation.updated_at,
        invitation_token: invitation.invitation_token,
        expires_at: invitation.expires_at
      }));

      set({ 
        shares,
        isLoading: false 
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch shares',
        isLoading: false 
      });
      throw error;
    }
  },
}));