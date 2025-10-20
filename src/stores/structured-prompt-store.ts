/**
 * @fileoverview Zustand store for structured prompts
 * Manages CRUD operations for structured prompts with card-based editing
 */

import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import {
  StructuredPrompt,
  StructuredPromptRow,
  CreateStructuredPromptInput,
  UpdateStructuredPromptInput,
  SectionType,
  PromptLibraryQuery,
  PromptSortBy,
} from '@/types/structured-prompt';
import {
  createSection,
  compileSectionsToPrompt,
  validateStructuredPrompt,
  normalizeSectionInput,
  createPromptVersion,
} from '@/lib/structured-prompt-helpers';
import { toast } from 'sonner';

interface StructuredPromptStore {
  // State
  prompts: StructuredPrompt[];
  currentPrompt: StructuredPrompt | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchLibraryPrompts: (query?: PromptLibraryQuery) => Promise<void>;
  fetchPromptById: (id: string) => Promise<StructuredPrompt | null>;
  createPrompt: (input: CreateStructuredPromptInput) => Promise<string>;
  updatePrompt: (id: string, input: UpdateStructuredPromptInput) => Promise<void>;
  updateSection: (id: string, sectionType: SectionType, content: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string, newTitle?: string) => Promise<string>;
  setCurrentPrompt: (prompt: StructuredPrompt | null) => void;
  incrementRunCount: (id: string) => Promise<void>;
}

/**
 * Convert database row to StructuredPrompt
 */
function rowToPrompt(row: StructuredPromptRow): StructuredPrompt {
  return {
    id: row.id,
    user_id: row.user_id,
    project_id: row.project_id,
    title: row.title,
    description: row.description,
    framework_name: row.framework_name,
    stage_name: row.stage_name,
    tool_name: row.tool_name,
    is_template: row.is_template,
    is_library_prompt: row.is_library_prompt,
    role_section: row.role_section as any,
    context_section: row.context_section as any,
    task_section: row.task_section as any,
    constraints_section: row.constraints_section as any,
    format_section: row.format_section as any,
    examples_section: row.examples_section as any,
    compiled_prompt: row.compiled_prompt,
    last_run_at: row.last_run_at,
    run_count: row.run_count,
    version: row.version,
    parent_prompt_id: row.parent_prompt_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const useStructuredPromptStore = create<StructuredPromptStore>((set, get) => ({
  // Initial state
  prompts: [],
  currentPrompt: null,
  loading: false,
  error: null,

  // Fetch library prompts with filters and sorting
  fetchLibraryPrompts: async (query?: PromptLibraryQuery) => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let queryBuilder = supabase
        .from('structured_prompts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_library_prompt', true);

      // Apply filters
      if (query?.filters) {
        const { searchQuery, framework, stage, tool, isTemplate, projectId } = query.filters;

        if (searchQuery) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tool_name.ilike.%${searchQuery}%`
          );
        }

        if (framework) {
          queryBuilder = queryBuilder.eq('framework_name', framework);
        }

        if (stage) {
          queryBuilder = queryBuilder.eq('stage_name', stage);
        }

        if (tool) {
          queryBuilder = queryBuilder.eq('tool_name', tool);
        }

        if (isTemplate !== undefined) {
          queryBuilder = queryBuilder.eq('is_template', isTemplate);
        }

        if (projectId) {
          queryBuilder = queryBuilder.eq('project_id', projectId);
        }
      }

      // Apply sorting
      const sortBy = query?.sortBy || 'created_at_desc';
      switch (sortBy) {
        case 'created_at_desc':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'created_at_asc':
          queryBuilder = queryBuilder.order('created_at', { ascending: true });
          break;
        case 'updated_at_desc':
          queryBuilder = queryBuilder.order('updated_at', { ascending: false });
          break;
        case 'updated_at_asc':
          queryBuilder = queryBuilder.order('updated_at', { ascending: true });
          break;
        case 'title_asc':
          queryBuilder = queryBuilder.order('title', { ascending: true });
          break;
        case 'title_desc':
          queryBuilder = queryBuilder.order('title', { ascending: false });
          break;
        case 'run_count_desc':
          queryBuilder = queryBuilder.order('run_count', { ascending: false });
          break;
      }

      // Apply pagination
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      if (query?.offset) {
        queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 50) - 1);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const prompts = (data as StructuredPromptRow[]).map(rowToPrompt);
      set({ prompts, loading: false });
    } catch (error) {
      console.error('Error fetching library prompts:', error);
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to load prompts');
    }
  },

  // Fetch single prompt by ID
  fetchPromptById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('structured_prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const prompt = rowToPrompt(data as StructuredPromptRow);
      return prompt;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load prompt');
      return null;
    }
  },

  // Create new structured prompt
  createPrompt: async (input: CreateStructuredPromptInput) => {
    try {
      set({ loading: true, error: null });

      // Validate input
      const validation = validateStructuredPrompt(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Normalize sections
      const normalizedInput = {
        user_id: user.id,
        project_id: input.project_id || null,
        title: input.title,
        description: input.description || null,
        framework_name: input.framework_name || null,
        stage_name: input.stage_name || null,
        tool_name: input.tool_name || null,
        is_template: input.is_template || false,
        is_library_prompt: input.is_library_prompt ?? true,
        role_section: normalizeSectionInput('role', input.role_section),
        context_section: normalizeSectionInput('context', input.context_section),
        task_section: normalizeSectionInput('task', input.task_section),
        constraints_section: normalizeSectionInput('constraints', input.constraints_section),
        format_section: normalizeSectionInput('format', input.format_section),
        examples_section: input.examples_section
          ? normalizeSectionInput('examples', input.examples_section)
          : null,
        compiled_prompt: input.compiled_prompt || '', // Database will auto-compile if empty
      };

      const { data, error } = await supabase
        .from('structured_prompts')
        .insert(normalizedInput)
        .select()
        .single();

      if (error) throw error;

      const newPrompt = rowToPrompt(data as StructuredPromptRow);

      // Add to store
      set((state) => ({
        prompts: [newPrompt, ...state.prompts],
        loading: false,
      }));

      toast.success('Prompt created successfully');
      return newPrompt.id;
    } catch (error) {
      console.error('Error creating prompt:', error);
      set({ error: (error as Error).message, loading: false });
      toast.error(`Failed to create prompt: ${(error as Error).message}`);
      throw error;
    }
  },

  // Update existing prompt
  updatePrompt: async (id: string, input: UpdateStructuredPromptInput) => {
    try {
      set({ loading: true, error: null });

      const updates: any = {};

      // Build update object with only provided fields
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.framework_name !== undefined) updates.framework_name = input.framework_name;
      if (input.stage_name !== undefined) updates.stage_name = input.stage_name;
      if (input.tool_name !== undefined) updates.tool_name = input.tool_name;
      if (input.is_template !== undefined) updates.is_template = input.is_template;
      if (input.is_library_prompt !== undefined) updates.is_library_prompt = input.is_library_prompt;

      // Update sections if provided
      if (input.role_section) updates.role_section = input.role_section;
      if (input.context_section) updates.context_section = input.context_section;
      if (input.task_section) updates.task_section = input.task_section;
      if (input.constraints_section) updates.constraints_section = input.constraints_section;
      if (input.format_section) updates.format_section = input.format_section;
      if (input.examples_section !== undefined) updates.examples_section = input.examples_section;

      if (input.compiled_prompt !== undefined) updates.compiled_prompt = input.compiled_prompt;

      const { data, error } = await supabase
        .from('structured_prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPrompt = rowToPrompt(data as StructuredPromptRow);

      // Update in store
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? updatedPrompt : p)),
        currentPrompt: state.currentPrompt?.id === id ? updatedPrompt : state.currentPrompt,
        loading: false,
      }));

      toast.success('Prompt updated successfully');
    } catch (error) {
      console.error('Error updating prompt:', error);
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to update prompt');
      throw error;
    }
  },

  // Update specific section
  updateSection: async (id: string, sectionType: SectionType, content: string) => {
    try {
      // Get current prompt
      const currentPrompt = get().prompts.find((p) => p.id === id) || get().currentPrompt;
      if (!currentPrompt) throw new Error('Prompt not found');

      // Get the section
      const sectionKey = `${sectionType}_section` as keyof StructuredPrompt;
      const currentSection = currentPrompt[sectionKey];
      if (!currentSection || typeof currentSection !== 'object') {
        throw new Error('Section not found');
      }

      // Update section content
      const updatedSection = {
        ...currentSection,
        content,
      };

      // Update in database
      const { error } = await supabase
        .from('structured_prompts')
        .update({ [sectionKey]: updatedSection })
        .eq('id', id);

      if (error) throw error;

      // Update in store
      set((state) => ({
        prompts: state.prompts.map((p) =>
          p.id === id
            ? { ...p, [sectionKey]: updatedSection }
            : p
        ),
        currentPrompt:
          state.currentPrompt?.id === id
            ? { ...state.currentPrompt, [sectionKey]: updatedSection }
            : state.currentPrompt,
      }));

      console.log(`Section ${sectionType} updated for prompt ${id}`);
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
      throw error;
    }
  },

  // Delete prompt
  deletePrompt: async (id: string) => {
    try {
      const { error } = await supabase
        .from('structured_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from store
      set((state) => ({
        prompts: state.prompts.filter((p) => p.id !== id),
        currentPrompt: state.currentPrompt?.id === id ? null : state.currentPrompt,
      }));

      toast.success('Prompt deleted successfully');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
      throw error;
    }
  },

  // Duplicate/fork prompt
  duplicatePrompt: async (id: string, newTitle?: string) => {
    try {
      const original = await get().fetchPromptById(id);
      if (!original) throw new Error('Original prompt not found');

      const versionInput = createPromptVersion(original, newTitle);
      const newId = await get().createPrompt(versionInput);

      toast.success('Prompt duplicated successfully');
      return newId;
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      toast.error('Failed to duplicate prompt');
      throw error;
    }
  },

  // Set current prompt for editing
  setCurrentPrompt: (prompt: StructuredPrompt | null) => {
    set({ currentPrompt: prompt });
  },

  // Increment run count
  incrementRunCount: async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_prompt_run_count', {
        prompt_id: id,
      });

      if (error) {
        // Fallback if RPC doesn't exist
        const prompt = get().prompts.find((p) => p.id === id);
        if (prompt) {
          await supabase
            .from('structured_prompts')
            .update({
              run_count: prompt.run_count + 1,
              last_run_at: new Date().toISOString(),
            })
            .eq('id', id);
        }
      }

      // Update in store
      set((state) => ({
        prompts: state.prompts.map((p) =>
          p.id === id
            ? { ...p, run_count: p.run_count + 1, last_run_at: new Date().toISOString() }
            : p
        ),
      }));
    } catch (error) {
      console.error('Error incrementing run count:', error);
    }
  },
}));
