import { create } from 'zustand';

export interface ProjectShare {
  id: string;
  project_id: string;
  shared_with_email: string;
  role: 'viewer' | 'editor';
  status: 'pending' | 'accepted' | 'declined';
  shared_by: string;
  shared_at: string;
  updated_at: string;
}

export interface SharingState {
  shares: ProjectShare[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  shareProject: (projectId: string, email: string, role: 'viewer' | 'editor') => Promise<void>;
  updateShareRole: (shareId: string, role: 'viewer' | 'editor') => Promise<void>;
  removeShare: (shareId: string) => Promise<void>;
  fetchProjectShares: (projectId: string) => Promise<void>;
  acceptShare: (shareId: string) => Promise<void>;
  declineShare: (shareId: string) => Promise<void>;
}

export const useSharingStore = create<SharingState>((set, get) => ({
  shares: [],
  isLoading: false,
  error: null,

  shareProject: async (projectId: string, email: string, role: 'viewer' | 'editor') => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call to share project
      const newShare: ProjectShare = {
        id: Date.now().toString(),
        project_id: projectId,
        shared_with_email: email,
        role,
        status: 'pending',
        shared_by: 'current-user-id', // This would come from auth
        shared_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to local state
      set(state => ({
        shares: [...state.shares, newShare],
        isLoading: false
      }));

      // Here you would make actual API call:
      // const response = await supabase
      //   .from('project_shares')
      //   .insert([{
      //     project_id: projectId,
      //     shared_with_email: email,
      //     role,
      //     status: 'pending'
      //   }]);
      
      // Send email notification would also happen here
      console.log(`Shared project ${projectId} with ${email} as ${role}`);
      
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
      set(state => ({
        shares: state.shares.map(share => 
          share.id === shareId 
            ? { ...share, role, updated_at: new Date().toISOString() }
            : share
        ),
        isLoading: false
      }));

      // API call would be:
      // await supabase
      //   .from('project_shares')
      //   .update({ role })
      //   .eq('id', shareId);
      
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
      set(state => ({
        shares: state.shares.filter(share => share.id !== shareId),
        isLoading: false
      }));

      // API call would be:
      // await supabase
      //   .from('project_shares')
      //   .delete()
      //   .eq('id', shareId);
      
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
      // Simulate fetching shares for a project
      // In real implementation, this would be:
      // const { data } = await supabase
      //   .from('project_shares')
      //   .select('*')
      //   .eq('project_id', projectId);
      
      const mockShares: ProjectShare[] = [
        {
          id: '1',
          project_id: projectId,
          shared_with_email: 'john@example.com',
          role: 'editor',
          status: 'accepted',
          shared_by: 'owner-id',
          shared_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          project_id: projectId,
          shared_with_email: 'jane@example.com',
          role: 'viewer',
          status: 'pending',
          shared_by: 'owner-id',
          shared_at: '2024-01-16T14:30:00Z',
          updated_at: '2024-01-16T14:30:00Z'
        }
      ];

      set({ 
        shares: mockShares,
        isLoading: false 
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch shares',
        isLoading: false 
      });
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
}));