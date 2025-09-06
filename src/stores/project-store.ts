import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface MiroSettings {
  accessToken?: string;
  connectedBoards?: Array<{
    id: string;
    name: string;
    lastUsed: string;
  }>;
  defaultBoardId?: string;
  autoConnect?: boolean;
}

export interface ProjectEnhancedSettings {
  industry: string;
  projectContext: {
    primaryGoals: string;
    targetAudience: string;
    keyConstraints: string;
    successMetrics: string;
    teamComposition: string;
    timeline: string;
  };
  qualitySettings: {
    methodologyDepth: 'basic' | 'intermediate' | 'advanced';
    outputDetail: 'brief' | 'moderate' | 'comprehensive';
    timeConstraints: 'urgent' | 'standard' | 'extended';
    industryCompliance: boolean;
    accessibilityFocus: boolean;
  };
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  canvas_data: any;
  node_contexts?: Record<string, string>;
  miro_settings?: MiroSettings;
  enhanced_settings?: ProjectEnhancedSettings;
  created_at: string;
  updated_at: string;
  last_opened?: string;
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
  setCurrentProject: (project: Project | null) => Promise<void>;
  saveCanvasData: (projectId: string, nodes: any[], edges: any[]) => Promise<void>;
  
  // Miro Settings Actions
  saveMiroToken: (projectId: string, accessToken: string) => Promise<void>;
  addConnectedBoard: (projectId: string, boardId: string, boardName: string) => Promise<void>;
  setDefaultBoard: (projectId: string, boardId: string) => Promise<void>;
  getMiroToken: (projectId: string) => string | null;
  getConnectedBoards: (projectId: string) => Array<{id: string; name: string; lastUsed: string}>;
  
  // Enhanced Settings Actions
  saveEnhancedSettings: (projectId: string, settings: ProjectEnhancedSettings) => Promise<void>;
  getEnhancedSettings: (projectId: string) => ProjectEnhancedSettings | null;
  
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

  setCurrentProject: async (project: Project | null) => {
    set({ currentProject: project });
    
    // Update last_opened timestamp when a project is set as current
    if (project) {
      try {
        const now = new Date().toISOString();
        await supabase
          .from('projects')
          .update({ last_opened: now })
          .eq('id', project.id);
        
        // Update the project in local state with new timestamp
        const updatedProject = { ...project, last_opened: now };
        set((state) => ({
          currentProject: updatedProject,
          projects: state.projects.map(p => 
            p.id === project.id ? updatedProject : p
          )
        }));
      } catch (error) {
        console.error('Failed to update last_opened timestamp:', error);
      }
    }
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

  // Miro Settings Methods
  saveMiroToken: async (projectId: string, accessToken: string) => {
    try {
      const state = get();
      const project = state.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const updatedMiroSettings: MiroSettings = {
        ...project.miro_settings,
        accessToken
      };

      const { error } = await supabase
        .from('projects')
        .update({ miro_settings: updatedMiroSettings })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, miro_settings: updatedMiroSettings }
            : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, miro_settings: updatedMiroSettings }
          : state.currentProject
      }));
    } catch (error) {
      console.error('Error saving Miro token:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save Miro token' });
      throw error;
    }
  },

  addConnectedBoard: async (projectId: string, boardId: string, boardName: string) => {
    try {
      const state = get();
      const project = state.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const currentBoards = project.miro_settings?.connectedBoards || [];
      const existingBoardIndex = currentBoards.findIndex(b => b.id === boardId);
      
      let updatedBoards;
      if (existingBoardIndex >= 0) {
        // Update existing board
        updatedBoards = [...currentBoards];
        updatedBoards[existingBoardIndex] = {
          id: boardId,
          name: boardName,
          lastUsed: new Date().toISOString()
        };
      } else {
        // Add new board
        updatedBoards = [
          {
            id: boardId,
            name: boardName,
            lastUsed: new Date().toISOString()
          },
          ...currentBoards
        ];
      }

      const updatedMiroSettings: MiroSettings = {
        ...project.miro_settings,
        connectedBoards: updatedBoards.slice(0, 10) // Keep only last 10 boards
      };

      const { error } = await supabase
        .from('projects')
        .update({ miro_settings: updatedMiroSettings })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, miro_settings: updatedMiroSettings }
            : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, miro_settings: updatedMiroSettings }
          : state.currentProject
      }));
    } catch (error) {
      console.error('Error adding connected board:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save connected board' });
      throw error;
    }
  },

  setDefaultBoard: async (projectId: string, boardId: string) => {
    try {
      const state = get();
      const project = state.projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const updatedMiroSettings: MiroSettings = {
        ...project.miro_settings,
        defaultBoardId: boardId
      };

      const { error } = await supabase
        .from('projects')
        .update({ miro_settings: updatedMiroSettings })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, miro_settings: updatedMiroSettings }
            : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, miro_settings: updatedMiroSettings }
          : state.currentProject
      }));
    } catch (error) {
      console.error('Error setting default board:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to set default board' });
      throw error;
    }
  },

  getMiroToken: (projectId: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === projectId) || state.currentProject;
    return project?.miro_settings?.accessToken || null;
  },

  getConnectedBoards: (projectId: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === projectId) || state.currentProject;
    return project?.miro_settings?.connectedBoards || [];
  },

  // Enhanced Settings Actions Implementation
  saveEnhancedSettings: async (projectId: string, settings: ProjectEnhancedSettings) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ enhanced_settings: settings })
        .eq('id', projectId);

      if (error) {
        // If column doesn't exist yet, store in localStorage as fallback
        if (error.code === 'PGRST204' && error.message.includes("enhanced_settings")) {
          console.warn('Enhanced settings column not found, using localStorage fallback');
          localStorage.setItem(`enhanced_settings_${projectId}`, JSON.stringify(settings));
          
          // Update local state only
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, enhanced_settings: settings }
                : p
            ),
            currentProject: state.currentProject?.id === projectId 
              ? { ...state.currentProject, enhanced_settings: settings }
              : state.currentProject
          }));
          return;
        }
        throw error;
      }

      // Update local state
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, enhanced_settings: settings }
            : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, enhanced_settings: settings }
          : state.currentProject
      }));
    } catch (error) {
      console.error('Error saving enhanced settings:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save enhanced settings' });
      throw error;
    }
  },

  getEnhancedSettings: (projectId: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === projectId) || state.currentProject;
    
    // First try to get from project data
    if (project?.enhanced_settings) {
      return project.enhanced_settings;
    }
    
    // Fallback to localStorage if database column doesn't exist yet
    try {
      const stored = localStorage.getItem(`enhanced_settings_${projectId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearError: () => set({ error: null })
}));