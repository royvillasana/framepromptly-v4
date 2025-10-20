/**
 * AI Prompt Parser
 *
 * Parses flat AI-generated prompts into structured sections for card-based editing.
 * Supports markdown header parsing with fallback content-based detection.
 */

import { PromptSection } from '@/types/structured-prompt';
import { createSection } from './structured-prompt-helpers';

export interface ParseResult {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;
  confidence: number; // 0-1 score indicating parsing confidence
  warnings: string[]; // List of issues encountered during parsing
  parser_version: string;
}

// Parser version for tracking and future migrations
const PARSER_VERSION = '1.0.0';

// Section header patterns (multiple patterns per section for flexibility)
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
    /^##\s*Project\s*Background/im,
  ],
  task: [
    /^##\s*Specific\s*Task/im,
    /^##\s*Task/im,
    /^##\s*Objective/im,
    /^##\s*Goal/im,
    /^##\s*Assignment/im,
  ],
  constraints: [
    /^##\s*Quality\s*Standards?\s*(?:&|and)?\s*Constraints?/im,
    /^##\s*Constraints?/im,
    /^##\s*Quality\s*Standards?/im,
    /^##\s*Requirements?/im,
    /^##\s*Guidelines?/im,
  ],
  format: [
    /^##\s*Output\s*Format/im,
    /^##\s*Format/im,
    /^##\s*Output\s*Structure/im,
    /^##\s*Structure/im,
    /^##\s*Deliverable\s*Format/im,
  ],
  examples: [
    /^##\s*Examples?(?:\s*(?:&|and)?\s*Guidance)?/im,
    /^##\s*Sample\s*(?:Output|Response)?/im,
    /^##\s*Reference\s*Examples?/im,
  ],
};

/**
 * Main parsing function - converts flat prompt text into structured sections
 */
export function parseAIPromptToStructured(
  flatPromptText: string,
  toolName: string = 'Unknown Tool'
): ParseResult {
  const warnings: string[] = [];
  let confidence = 1.0;

  // Step 1: Try to extract sections by markdown headers
  const headerBasedSections = extractSectionsByHeaders(flatPromptText);

  // Step 2: Check which sections were successfully extracted
  const extractedSections = Object.keys(headerBasedSections).filter(
    key => headerBasedSections[key as keyof typeof headerBasedSections] !== null
  );

  // Step 3: Calculate initial confidence based on sections found
  const requiredSectionsCount = 5; // All except examples (which is optional)
  const foundRequiredSections = extractedSections.filter(s => s !== 'examples').length;
  confidence = foundRequiredSections / requiredSectionsCount;

  // Step 4: Use fallback detection for missing sections
  const fallbackSections = extractedSections.length < requiredSectionsCount
    ? extractSectionsByContent(flatPromptText, headerBasedSections)
    : headerBasedSections;

  // Step 5: Create PromptSection objects with proper structure
  const role_section = createPromptSection(
    'role',
    fallbackSections.role || `Expert UX professional for ${toolName}`,
    !headerBasedSections.role
  );

  const context_section = createPromptSection(
    'context',
    fallbackSections.context || 'Project context will be provided by the user.',
    !headerBasedSections.context
  );

  const task_section = createPromptSection(
    'task',
    fallbackSections.task || `Perform ${toolName} methodology tasks.`,
    !headerBasedSections.task
  );

  const constraints_section = createPromptSection(
    'constraints',
    fallbackSections.constraints || 'Ensure high quality and professional standards.',
    !headerBasedSections.constraints
  );

  const format_section = createPromptSection(
    'format',
    fallbackSections.format || 'Provide clear, well-structured output.',
    !headerBasedSections.format
  );

  const examples_section = fallbackSections.examples
    ? createPromptSection('examples', fallbackSections.examples, !headerBasedSections.examples)
    : null;

  // Step 6: Add warnings for fallback sections
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

/**
 * Extract sections based on markdown headers
 */
function extractSectionsByHeaders(text: string): Record<string, string | null> {
  const sections: Record<string, string | null> = {
    role: null,
    context: null,
    task: null,
    constraints: null,
    format: null,
    examples: null,
  };

  // Split text into lines for processing
  const lines = text.split('\n');

  // Track current section being processed
  let currentSection: string | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matchedSection: string | null = null;

    // Check if line matches any section header pattern
    for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(line))) {
        matchedSection = sectionKey;
        break;
      }
    }

    if (matchedSection) {
      // Save previous section content
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = cleanSectionContent(currentContent.join('\n'));
      }

      // Start new section
      currentSection = matchedSection;
      currentContent = [];
    } else if (currentSection) {
      // Add line to current section content
      currentContent.push(line);
    }
  }

  // Save final section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = cleanSectionContent(currentContent.join('\n'));
  }

  return sections;
}

/**
 * Fallback: Extract sections based on content analysis (when headers not found)
 */
function extractSectionsByContent(
  text: string,
  existingSections: Record<string, string | null>
): Record<string, string | null> {
  const sections = { ...existingSections };

  // Split into paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return sections;
  }

  // Heuristic 1: First paragraph is often the role
  if (!sections.role && paragraphs.length > 0) {
    const firstPara = paragraphs[0];
    if (
      firstPara.match(/you\s+are/i) ||
      firstPara.match(/expert/i) ||
      firstPara.match(/professional/i) ||
      firstPara.match(/specialist/i)
    ) {
      sections.role = firstPara;
    }
  }

  // Heuristic 2: Look for context indicators
  if (!sections.context) {
    const contextPara = paragraphs.find(p =>
      p.match(/working\s+on/i) ||
      p.match(/project/i) ||
      p.match(/context/i) ||
      p.match(/\[.*?\]/g) // Contains variables/brackets
    );
    if (contextPara) {
      sections.context = contextPara;
    }
  }

  // Heuristic 3: Look for task with action verbs
  if (!sections.task) {
    const taskPara = paragraphs.find(p =>
      p.match(/^(create|develop|design|analyze|build|generate|provide|conduct)/i)
    );
    if (taskPara) {
      sections.task = taskPara;
    }
  }

  // Heuristic 4: Look for constraints keywords
  if (!sections.constraints) {
    const constraintPara = paragraphs.find(p =>
      p.match(/ensure|must|should|quality|standard|requirement/i)
    );
    if (constraintPara) {
      sections.constraints = constraintPara;
    }
  }

  // Heuristic 5: Look for format keywords
  if (!sections.format) {
    const formatPara = paragraphs.find(p =>
      p.match(/format|structure|output|deliver|present/i)
    );
    if (formatPara) {
      sections.format = formatPara;
    }
  }

  // Heuristic 6: Look for examples (code blocks, lists at end)
  if (!sections.examples) {
    // Check for code blocks
    const codeBlockMatch = text.match(/```[\s\S]*?```/g);
    if (codeBlockMatch && codeBlockMatch.length > 0) {
      sections.examples = codeBlockMatch.join('\n\n');
    } else {
      // Check for bullet lists near the end
      const lastParagraphs = paragraphs.slice(-2);
      const listPara = lastParagraphs.find(p => p.match(/^[\s-*•]/m));
      if (listPara) {
        sections.examples = listPara;
      }
    }
  }

  return sections;
}

/**
 * Clean section content (remove extra whitespace, separators, etc.)
 */
function cleanSectionContent(content: string): string {
  return content
    .replace(/^---+\s*/gm, '') // Remove horizontal rules
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
}

/**
 * Create a PromptSection object with proper structure
 */
function createPromptSection(
  type: 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples',
  content: string,
  isFallback: boolean = false
): PromptSection {
  // Use the helper from structured-prompt-helpers but override content
  const defaultSection = createSection(type, '');

  return {
    ...defaultSection,
    content: content,
    // Mark as expanded if it's a fallback (user should review)
    isExpanded: isFallback,
  };
}

/**
 * Utility: Check if a prompt has standard structure
 */
export function hasStandardStructure(text: string): boolean {
  const headerCount = Object.values(SECTION_PATTERNS)
    .flat()
    .filter(pattern => pattern.test(text))
    .length;

  return headerCount >= 4; // At least 4 out of 6 sections found
}

/**
 * Utility: Get parsing confidence for a given text
 */
export function estimateParsingConfidence(text: string): number {
  let score = 0;

  // Check for markdown headers
  if (text.match(/^#\s/m)) score += 0.3;
  if (text.match(/^##\s/m)) score += 0.3;

  // Check for section keywords
  const sectionKeywords = ['role', 'context', 'task', 'constraint', 'format', 'example'];
  const foundKeywords = sectionKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  ).length;
  score += (foundKeywords / sectionKeywords.length) * 0.4;

  return Math.min(1, score);
}
