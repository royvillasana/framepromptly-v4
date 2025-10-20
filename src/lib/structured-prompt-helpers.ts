/**
 * @fileoverview Helper functions for structured prompt management
 * Utilities for creating, updating, and compiling structured prompts
 */

import {
  PromptSection,
  SectionType,
  CreateStructuredPromptInput,
  DEFAULT_SECTION_CONFIG,
  StructuredPrompt,
} from '@/types/structured-prompt';

/**
 * Generate a unique section ID
 */
export function generateSectionId(type: SectionType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a complete section with defaults
 */
export function createSection(
  type: SectionType,
  content: string,
  partial?: Partial<PromptSection>
): PromptSection {
  const defaults = DEFAULT_SECTION_CONFIG[type];

  return {
    id: generateSectionId(type),
    ...defaults,
    content,
    ...partial,
  };
}

/**
 * Create default sections for a new prompt
 */
export function createDefaultSections(toolName?: string): {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;
} {
  const isResearchTool =
    toolName?.toLowerCase().includes('interview') ||
    toolName?.toLowerCase().includes('survey') ||
    toolName?.toLowerCase().includes('study') ||
    toolName?.toLowerCase().includes('research');

  return {
    role_section: createSection(
      'role',
      `You are a senior UX ${
        isResearchTool ? 'researcher' : 'designer'
      } with 15+ years of experience in user-centered design. You excel at ${
        toolName || 'UX methodology'
      } and have deep knowledge of best practices.`
    ),
    context_section: createSection(
      'context',
      `## Project Context:
{{knowledgeBase}}

---

Working on a project with the following specifics:
- Target Audience: {{targetAudience}}
- Primary Goals: {{primaryGoals}}
- Key Constraints: {{keyConstraints}}
- Success Metrics: {{successMetrics}}`
    ),
    task_section: createSection(
      'task',
      `Create a comprehensive ${toolName || 'deliverable'} that addresses the project goals and user needs documented in the Project Context.

Your deliverable should:
- Be grounded in the research data and insights provided
- Include specific, actionable recommendations
- Follow industry best practices and methodology
- Be immediately useful for the product team`
    ),
    constraints_section: createSection(
      'constraints',
      `## Quality Standards:
- **Evidence-Based**: Every element must be backed by specific research findings from the Project Context
- **Balanced Detail**: Provide clear explanations with appropriate methodology context
- **Thorough**: Include detailed analysis, examples, and complete coverage
- **Professional**: Use proper UX methodology, terminology, and best practices`
    ),
    format_section: createSection(
      'format',
      `## Output Format:
Structure your response following established UX methodology frameworks. Use clear sections, systematic progression, and actionable insights. Provide step-by-step explanations with clear reasoning. Include validation checkpoints and quality indicators throughout.`
    ),
    examples_section: null, // Optional
  };
}

/**
 * Compile sections into a single prompt string
 */
export function compileSectionsToPrompt(sections: {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section?: PromptSection | null;
}): string {
  let compiled = '';

  // Helper to add section
  const addSection = (section: PromptSection, includeTitle = true) => {
    if (!section.content?.trim()) return;

    if (includeTitle) {
      // Role section gets H1, others get H2
      const headerLevel = section.type === 'role' ? '#' : '##';
      compiled += `${headerLevel} ${section.title}\n\n`;
    }

    compiled += `${section.content}\n\n`;
    compiled += '---\n\n';
  };

  // Add sections in order
  addSection(sections.role_section);
  addSection(sections.context_section);
  addSection(sections.task_section);
  addSection(sections.constraints_section);
  addSection(sections.format_section);

  if (sections.examples_section?.content?.trim()) {
    addSection(sections.examples_section);
  }

  return compiled.trim();
}

/**
 * Parse a flat prompt string into sections
 * Attempts to extract sections based on markdown headers and separators
 */
export function parsePromptIntoSections(promptText: string): {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;
} {
  const sections = createDefaultSections();

  // Split by --- separators
  const parts = promptText.split(/\n---\n/);

  // Try to identify sections by headers
  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    // Check for role section (# header or "You are" pattern)
    if (trimmed.match(/^#\s+AI.*Expert/i) || trimmed.match(/^You are a/i)) {
      sections.role_section.content = trimmed.replace(/^#\s+[^\n]+\n\n/, '');
    }
    // Check for context section
    else if (trimmed.match(/^##\s+Project Context/i)) {
      sections.context_section.content = trimmed.replace(/^##\s+[^\n]+\n\n/, '');
    }
    // Check for task/instructions section
    else if (trimmed.match(/^##\s+(Instructions|Specific Task|Task|Your Task)/i)) {
      sections.task_section.content = trimmed.replace(/^##\s+[^\n]+\n\n/, '');
    }
    // Check for constraints/quality section
    else if (trimmed.match(/^##\s+(Quality Standards|Constraints|Quality & Constraints)/i)) {
      sections.constraints_section.content = trimmed.replace(/^##\s+[^\n]+\n\n/, '');
    }
    // Check for format section
    else if (trimmed.match(/^##\s+Output Format/i)) {
      sections.format_section.content = trimmed.replace(/^##\s+[^\n]+\n\n/, '');
    }
    // Check for examples section
    else if (trimmed.match(/^##\s+(Examples|Examples & Guidance)/i)) {
      if (!sections.examples_section) {
        sections.examples_section = createSection('examples', '');
      }
      sections.examples_section.content = trimmed.replace(/^##\s+[^\n]+\n\n/, '');
    }
  });

  return sections;
}

/**
 * Normalize section input (fill in defaults)
 */
export function normalizeSectionInput(
  type: SectionType,
  input: Partial<PromptSection> & { content: string }
): PromptSection {
  return createSection(type, input.content, input);
}

/**
 * Validate section content
 */
export function validateSection(section: PromptSection): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!section.content?.trim()) {
    errors.push(`${section.title} content cannot be empty`);
  }

  if (section.content.length > 10000) {
    errors.push(`${section.title} content exceeds maximum length (10000 characters)`);
  }

  if (!section.title?.trim()) {
    errors.push('Section title cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete structured prompt
 */
export function validateStructuredPrompt(input: CreateStructuredPromptInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate required fields
  if (!input.title?.trim()) {
    errors.push('Prompt title is required');
  }

  if (input.title && input.title.length > 200) {
    errors.push('Prompt title cannot exceed 200 characters');
  }

  // Validate each section
  const sections = [
    { type: 'role' as const, data: input.role_section },
    { type: 'context' as const, data: input.context_section },
    { type: 'task' as const, data: input.task_section },
    { type: 'constraints' as const, data: input.constraints_section },
    { type: 'format' as const, data: input.format_section },
  ];

  sections.forEach(({ type, data }) => {
    const section = normalizeSectionInput(type, data);
    const validation = validateSection(section);
    errors.push(...validation.errors);
  });

  // Validate examples section if provided
  if (input.examples_section) {
    const section = normalizeSectionInput('examples', input.examples_section);
    const validation = validateSection(section);
    errors.push(...validation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Replace variables in prompt content
 */
export function replacePromptVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;

  Object.entries(variables).forEach(([key, value]) => {
    // Replace {{variable}} format
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);

    // Also replace [variable] format
    const bracketRegex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(bracketRegex, value);
  });

  return result;
}

/**
 * Extract variables from prompt content
 * Finds {{variable}} and [variable] patterns
 */
export function extractPromptVariables(content: string): string[] {
  const variables = new Set<string>();

  // Find {{variable}} patterns
  const doubleRegex = /\{\{([^}]+)\}\}/g;
  let match;
  while ((match = doubleRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  // Find [variable] patterns (but not [Write ...] placeholders)
  const bracketRegex = /\[([a-z_][a-z0-9_]*)\]/gi;
  while ((match = bracketRegex.exec(content)) !== null) {
    const varName = match[1];
    // Only include if it looks like a variable (lowercase, underscores)
    if (!varName.match(/^[A-Z]/)) {
      variables.add(varName);
    }
  }

  return Array.from(variables).sort();
}

/**
 * Create a version/fork of an existing prompt
 */
export function createPromptVersion(
  original: StructuredPrompt,
  versionTitle?: string
): CreateStructuredPromptInput {
  return {
    project_id: original.project_id || undefined,
    title: versionTitle || `${original.title} (Version ${original.version + 1})`,
    description: original.description || undefined,
    framework_name: original.framework_name || undefined,
    stage_name: original.stage_name || undefined,
    tool_name: original.tool_name || undefined,
    is_template: false,
    is_library_prompt: true,
    role_section: { ...original.role_section },
    context_section: { ...original.context_section },
    task_section: { ...original.task_section },
    constraints_section: { ...original.constraints_section },
    format_section: { ...original.format_section },
    examples_section: original.examples_section
      ? { ...original.examples_section }
      : undefined,
  };
}

/**
 * Get section by type from structured prompt
 */
export function getSection(
  prompt: StructuredPrompt,
  type: SectionType
): PromptSection | null {
  switch (type) {
    case 'role':
      return prompt.role_section;
    case 'context':
      return prompt.context_section;
    case 'task':
      return prompt.task_section;
    case 'constraints':
      return prompt.constraints_section;
    case 'format':
      return prompt.format_section;
    case 'examples':
      return prompt.examples_section;
    default:
      return null;
  }
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(content: string): number {
  const words = countWords(content);
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
