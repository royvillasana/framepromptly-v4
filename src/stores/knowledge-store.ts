import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeEntry {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: 'text' | 'document' | 'image';
  file_name?: string;
  file_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface KnowledgeState {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEntries: (projectId: string) => Promise<void>;
  addTextEntry: (projectId: string, title: string, content: string) => Promise<void>;
  uploadFile: (projectId: string, file: File, title?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<KnowledgeEntry>) => Promise<void>;
  clearError: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ entries: (data || []) as KnowledgeEntry[], isLoading: false });
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch knowledge entries',
        isLoading: false 
      });
    }
  },

  addTextEntry: async (projectId: string, title: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          project_id: projectId,
          title,
          content,
          type: 'text',
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = data as KnowledgeEntry;
      set(state => ({ 
        entries: [newEntry, ...state.entries],
        isLoading: false 
      }));

      console.log('Successfully added text entry:', newEntry);
      return newEntry;
    } catch (error) {
      console.error('Error adding text entry:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add text entry',
        isLoading: false 
      });
      throw error;
    }
  },

  uploadFile: async (projectId: string, file: File, title?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('knowledge-base')
        .getPublicUrl(filePath);

      // Determine if it's an image or document
      const isImage = file.type.startsWith('image/');
      const isDocument = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'].includes(file.type);

      if (!isImage && !isDocument) {
        throw new Error('Unsupported file type. Please upload images (jpg, png, jpeg) or documents (pdf, docx, txt, md).');
      }

      // Process the file
      const processFunctionName = isImage ? 'process-image' : 'process-document';
      
      const { data: processData, error: processError } = await supabase.functions.invoke(processFunctionName, {
        body: {
          fileUrl: publicUrl,
          storagePath: filePath,
          fileName: file.name,
          projectId,
          title: title || file.name
        }
      });

      if (processError) throw processError;

      if (!processData.success) {
        throw new Error(processData.error || 'Failed to process file');
      }

      // Add to local state
      const newEntry = processData.knowledgeEntry as KnowledgeEntry;
      set(state => ({ 
        entries: [newEntry, ...state.entries],
        isLoading: false 
      }));

    } catch (error) {
      console.error('Error uploading file:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload file',
        isLoading: false 
      });
    }
  },

  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting entry:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false 
      });
    }
  },

  updateEntry: async (id: string, updates: Partial<KnowledgeEntry>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry = data as KnowledgeEntry;
      set(state => ({
        entries: state.entries.map(entry => 
          entry.id === id ? updatedEntry : entry
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating entry:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update entry',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));