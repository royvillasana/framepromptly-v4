/**
 * @fileoverview TypeScript types for structured prompts
 * Defines the structure for card-based prompt editing in the library
 */

/**
 * Section types correspond to the card types in the prompt builder
 */
export type SectionType = 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples';

/**
 * Icon names that correspond to Lucide React icons
 */
export type SectionIcon = 'Brain' | 'User' | 'Target' | 'Settings' | 'FileText' | 'Lightbulb';

/**
 * Color themes for each section card
 */
export type SectionColor =
  | 'purple'  // Role
  | 'blue'    // Context
  | 'green'   // Task
  | 'orange'  // Constraints
  | 'red'     // Format
  | 'yellow'; // Examples

/**
 * Individual section structure
 * This is stored as JSONB in the database
 */
export interface PromptSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  icon: SectionIcon;
  color: SectionColor;
  isExpanded: boolean;
  isEditable: boolean;
  order?: number; // For custom ordering
}

/**
 * Complete structured prompt
 * Maps to the structured_prompts database table
 */
export interface StructuredPrompt {
  id: string;
  user_id: string;
  project_id: string | null;

  // Metadata
  title: string;
  description: string | null;
  framework_name: string | null;
  stage_name: string | null;
  tool_name: string | null;
  is_template: boolean;
  is_library_prompt: boolean;

  // Structured sections
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;

  // Compiled output
  compiled_prompt: string;

  // Execution tracking
  last_run_at: string | null;
  run_count: number;

  // Version control
  version: number;
  parent_prompt_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new structured prompt
 */
export interface CreateStructuredPromptInput {
  project_id?: string;
  title: string;
  description?: string;
  framework_name?: string;
  stage_name?: string;
  tool_name?: string;
  is_template?: boolean;
  is_library_prompt?: boolean;

  // Sections - can provide partial and get defaults
  role_section: Partial<PromptSection> & { content: string };
  context_section: Partial<PromptSection> & { content: string };
  task_section: Partial<PromptSection> & { content: string };
  constraints_section: Partial<PromptSection> & { content: string };
  format_section: Partial<PromptSection> & { content: string };
  examples_section?: Partial<PromptSection> & { content: string };

  // Optional: provide pre-compiled prompt
  compiled_prompt?: string;
}

/**
 * Input for updating a structured prompt
 */
export interface UpdateStructuredPromptInput {
  title?: string;
  description?: string;
  framework_name?: string;
  stage_name?: string;
  tool_name?: string;
  is_template?: boolean;
  is_library_prompt?: boolean;

  role_section?: Partial<PromptSection>;
  context_section?: Partial<PromptSection>;
  task_section?: Partial<PromptSection>;
  constraints_section?: Partial<PromptSection>;
  format_section?: Partial<PromptSection>;
  examples_section?: Partial<PromptSection> | null;

  compiled_prompt?: string;
}

/**
 * Input for updating a single section
 */
export interface UpdateSectionInput {
  sectionType: SectionType;
  content?: string;
  title?: string;
  isExpanded?: boolean;
  order?: number;
}

/**
 * Database row type (matches Supabase response)
 */
export interface StructuredPromptRow {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  framework_name: string | null;
  stage_name: string | null;
  tool_name: string | null;
  is_template: boolean;
  is_library_prompt: boolean;
  role_section: Record<string, any>;
  context_section: Record<string, any>;
  task_section: Record<string, any>;
  constraints_section: Record<string, any>;
  format_section: Record<string, any>;
  examples_section: Record<string, any> | null;
  compiled_prompt: string;
  last_run_at: string | null;
  run_count: number;
  version: number;
  parent_prompt_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Section template presets
 */
export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  type: SectionType;
  content: string;
  category: 'researcher' | 'designer' | 'strategist' | 'standard' | 'custom';
}

/**
 * Section defaults by type
 */
export const DEFAULT_SECTION_CONFIG: Record<SectionType, Omit<PromptSection, 'id' | 'content'>> = {
  role: {
    type: 'role',
    title: 'AI Role & Expertise',
    icon: 'Brain',
    color: 'purple',
    isExpanded: true,
    isEditable: true,
    order: 1,
  },
  context: {
    type: 'context',
    title: 'Project Context',
    icon: 'User',
    color: 'blue',
    isExpanded: true,
    isEditable: true,
    order: 2,
  },
  task: {
    type: 'task',
    title: 'Specific Task',
    icon: 'Target',
    color: 'green',
    isExpanded: true,
    isEditable: true,
    order: 3,
  },
  constraints: {
    type: 'constraints',
    title: 'Quality & Constraints',
    icon: 'Settings',
    color: 'orange',
    isExpanded: true,
    isEditable: true,
    order: 4,
  },
  format: {
    type: 'format',
    title: 'Output Format',
    icon: 'FileText',
    color: 'red',
    isExpanded: true,
    isEditable: true,
    order: 5,
  },
  examples: {
    type: 'examples',
    title: 'Examples & Guidance',
    icon: 'Lightbulb',
    color: 'yellow',
    isExpanded: false,
    isEditable: true,
    order: 6,
  },
};

/**
 * Filter options for prompt library
 */
export interface PromptLibraryFilters {
  searchQuery?: string;
  framework?: string;
  stage?: string;
  tool?: string;
  isTemplate?: boolean;
  userId?: string;
  projectId?: string;
}

/**
 * Sort options for prompt library
 */
export type PromptSortBy =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'updated_at_desc'
  | 'updated_at_asc'
  | 'title_asc'
  | 'title_desc'
  | 'run_count_desc';

/**
 * Prompt library query options
 */
export interface PromptLibraryQuery {
  filters?: PromptLibraryFilters;
  sortBy?: PromptSortBy;
  limit?: number;
  offset?: number;
}
