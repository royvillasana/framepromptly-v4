/**
 * AI Prompt Parser for Deno/Supabase Edge Functions
 *
 * Simplified version without external dependencies for use in Edge Functions
 */

interface PromptSection {
  id: string;
  type: 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples';
  title: string;
  content: string;
  icon: string;
  color: string;
  isExpanded: boolean;
  isEditable: boolean;
}

export interface ParseResult {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;
  confidence: number;
  warnings: string[];
  parser_version: string;
}

const PARSER_VERSION = '1.0.0';

// Section metadata
const SECTION_METADATA: Record<string, { title: string; icon: string; color: string }> = {
  role: { title: 'Role & Expertise', icon: 'Brain', color: 'purple' },
  context: { title: 'Project Context', icon: 'User', color: 'blue' },
  task: { title: 'Specific Task', icon: 'Target', color: 'green' },
  constraints: { title: 'Quality Standards & Constraints', icon: 'Settings', color: 'orange' },
  format: { title: 'Output Format', icon: 'FileText', color: 'red' },
  examples: { title: 'Examples & Guidance', icon: 'Lightbulb', color: 'yellow' },
};

// Section header patterns
const SECTION_PATTERNS = {
  role: [
    /^#\s*(?:AI\s*)?Role\s*(?:&|and)?\s*Expertise/im,
    /^#\s*Role\s*(?:&|and)?\s*Expertise/im,
    /^#\s*Role/im,
    /^#\s*AI\s*Expertise/im,
  ],
  context: [
    /^##\s*Project\s*Context/im,
    /^##\s*Context/im,
    /^##\s*Background/im,
  ],
  task: [
    /^##\s*Specific\s*Task/im,
    /^##\s*Task/im,
    /^##\s*Objective/im,
    /^##\s*Goal/im,
  ],
  constraints: [
    /^##\s*Quality\s*Standards?\s*(?:&|and)?\s*Constraints?/im,
    /^##\s*Constraints?/im,
    /^##\s*Quality\s*Standards?/im,
    /^##\s*Requirements?/im,
  ],
  format: [
    /^##\s*Output\s*Format/im,
    /^##\s*Format/im,
    /^##\s*Structure/im,
  ],
  examples: [
    /^##\s*Examples?(?:\s*(?:&|and)?\s*Guidance)?/im,
    /^##\s*Sample/im,
  ],
};

/**
 * Main parsing function
 */
export function parseAIPromptToStructured(
  flatPromptText: string,
  toolName: string = 'Unknown Tool'
): ParseResult {
  const warnings: string[] = [];
  let confidence = 1.0;

  // Extract sections by headers
  const headerBasedSections = extractSectionsByHeaders(flatPromptText);

  // Calculate confidence
  const requiredSectionsCount = 5;
  const foundRequiredSections = Object.keys(headerBasedSections)
    .filter(key => key !== 'examples' && headerBasedSections[key as keyof typeof headerBasedSections] !== null)
    .length;
  confidence = foundRequiredSections / requiredSectionsCount;

  // Use fallback for missing sections
  const fallbackSections = foundRequiredSections < requiredSectionsCount
    ? extractSectionsByContent(flatPromptText, headerBasedSections)
    : headerBasedSections;

  // Create sections
  const role_section = createSection(
    'role',
    fallbackSections.role || `Expert UX professional for ${toolName}`,
    !headerBasedSections.role
  );

  const context_section = createSection(
    'context',
    fallbackSections.context || 'Project context will be provided by the user.',
    !headerBasedSections.context
  );

  const task_section = createSection(
    'task',
    fallbackSections.task || `Perform ${toolName} methodology tasks.`,
    !headerBasedSections.task
  );

  const constraints_section = createSection(
    'constraints',
    fallbackSections.constraints || 'Ensure high quality and professional standards.',
    !headerBasedSections.constraints
  );

  const format_section = createSection(
    'format',
    fallbackSections.format || 'Provide clear, well-structured output.',
    !headerBasedSections.format
  );

  const examples_section = fallbackSections.examples
    ? createSection('examples', fallbackSections.examples, !headerBasedSections.examples)
    : null;

  // Add warnings
  if (!headerBasedSections.role) {
    warnings.push('Role section not found - used fallback');
    confidence *= 0.8;
  }
  if (!headerBasedSections.context) {
    warnings.push('Context section not found - used fallback');
    confidence *= 0.8;
  }
  if (!headerBasedSections.task) {
    warnings.push('Task section not found - used fallback');
    confidence *= 0.8;
  }
  if (!headerBasedSections.constraints) {
    warnings.push('Constraints section not found - used fallback');
    confidence *= 0.9;
  }
  if (!headerBasedSections.format) {
    warnings.push('Format section not found - used fallback');
    confidence *= 0.9;
  }

  return {
    role_section,
    context_section,
    task_section,
    constraints_section,
    format_section,
    examples_section,
    confidence: Math.max(0, Math.min(1, confidence)),
    warnings,
    parser_version: PARSER_VERSION,
  };
}

function extractSectionsByHeaders(text: string): Record<string, string | null> {
  const sections: Record<string, string | null> = {
    role: null,
    context: null,
    task: null,
    constraints: null,
    format: null,
    examples: null,
  };

  const lines = text.split('\n');
  let currentSection: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    let matchedSection: string | null = null;

    for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(line))) {
        matchedSection = sectionKey;
        break;
      }
    }

    if (matchedSection) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = cleanContent(currentContent.join('\n'));
      }
      currentSection = matchedSection;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = cleanContent(currentContent.join('\n'));
  }

  return sections;
}

function extractSectionsByContent(
  text: string,
  existingSections: Record<string, string | null>
): Record<string, string | null> {
  const sections = { ...existingSections };
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

  if (paragraphs.length === 0) return sections;

  // Detect role
  if (!sections.role && paragraphs.length > 0) {
    const firstPara = paragraphs[0];
    if (firstPara.match(/you\s+are|expert|professional|specialist/i)) {
      sections.role = firstPara;
    }
  }

  // Detect context (has variables/brackets)
  if (!sections.context) {
    const contextPara = paragraphs.find(p =>
      p.match(/working\s+on|project|context|\[.*?\]/gi)
    );
    if (contextPara) sections.context = contextPara;
  }

  // Detect task (action verbs)
  if (!sections.task) {
    const taskPara = paragraphs.find(p =>
      p.match(/^(create|develop|design|analyze|build|generate|provide|conduct)/i)
    );
    if (taskPara) sections.task = taskPara;
  }

  // Detect constraints
  if (!sections.constraints) {
    const constraintPara = paragraphs.find(p =>
      p.match(/ensure|must|should|quality|standard|requirement/i)
    );
    if (constraintPara) sections.constraints = constraintPara;
  }

  // Detect format
  if (!sections.format) {
    const formatPara = paragraphs.find(p =>
      p.match(/format|structure|output|deliver|present/i)
    );
    if (formatPara) sections.format = formatPara;
  }

  // Detect examples (code blocks)
  if (!sections.examples) {
    const codeBlockMatch = text.match(/```[\s\S]*?```/g);
    if (codeBlockMatch) {
      sections.examples = codeBlockMatch.join('\n\n');
    }
  }

  return sections;
}

function cleanContent(content: string): string {
  return content
    .replace(/^---+\s*/gm, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createSection(
  type: 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples',
  content: string,
  isFallback: boolean = false
): PromptSection {
  const metadata = SECTION_METADATA[type];

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: metadata.title,
    content,
    icon: metadata.icon,
    color: metadata.color,
    isExpanded: isFallback,
    isEditable: true,
  };
}
