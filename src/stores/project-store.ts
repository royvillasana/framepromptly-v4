import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  canvas_data: any;
  created_at: string;
  updated_at: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  saveCanvasData: (projectId: string, nodes: any[], edges: any[]) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      set({ projects: (data || []) as Project[], isLoading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false 
      });
    }
  },

  createProject: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name,
          description,
          canvas_data: { nodes: [], edges: [] },
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newProject = data as Project;
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false 
      }));

      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProject = data as Project;
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating project:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false 
      });
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false 
      });
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  saveCanvasData: async (projectId: string, nodes: any[], edges: any[]) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          canvas_data: { nodes, edges }
        })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, canvas_data: { nodes, edges } }
            : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, canvas_data: { nodes, edges } }
          : state.currentProject
      }));
    } catch (error) {
      console.error('Error saving canvas data:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save canvas data' });
    }
  },

  clearError: () => set({ error: null })
}));