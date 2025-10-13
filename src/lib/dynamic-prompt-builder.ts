/**
 * @fileoverview Dynamic Prompt Builder - Project-Level Prompt Customization
 *
 * This module builds dynamic Quality Standards and Output Format sections based on
 * project-level settings while maintaining comprehensive defaults.
 *
 * IMPORTANT: All projects get high-quality, comprehensive prompts by default.
 * Custom settings allow fine-tuning to match specific project needs.
 */

export interface ProjectSettings {
  projectContext?: {
    primaryGoals?: string;
    targetAudience?: string;
    keyConstraints?: string;
    successMetrics?: string;
    teamComposition?: string;
    timeline?: string;
  };
  qualitySettings?: {
    methodologyDepth?: 'basic' | 'intermediate' | 'advanced';
    outputDetail?: 'brief' | 'moderate' | 'comprehensive';
    timeConstraints?: 'urgent' | 'standard' | 'extended';
    industryCompliance?: boolean;
    accessibilityFocus?: boolean;
  };
  aiMethodSettings?: {
    promptStructure?: 'framework-guided' | 'open-ended' | 'structured-templates';
    creativityLevel?: 'conservative' | 'balanced' | 'creative' | 'experimental';
    reasoning?: 'step-by-step' | 'direct' | 'exploratory';
    adaptability?: 'static' | 'context-aware' | 'dynamic-learning';
    validation?: 'none' | 'basic' | 'built-in' | 'comprehensive';
  };
}

/**
 * Standard default values for all projects
 * These ensure high-quality, comprehensive prompts out-of-the-box
 */
export const STANDARD_DEFAULTS = {
  qualitySettings: {
    methodologyDepth: 'intermediate' as const,
    outputDetail: 'comprehensive' as const,
    timeConstraints: 'standard' as const,
    industryCompliance: false,
    accessibilityFocus: true,
  },
  aiMethodSettings: {
    promptStructure: 'framework-guided' as const,
    creativityLevel: 'balanced' as const,
    reasoning: 'step-by-step' as const,
    adaptability: 'context-aware' as const,
    validation: 'built-in' as const,
  },
};

/**
 * Build Quality Standards section based on project settings
 * Falls back to comprehensive defaults if no settings provided
 */
export function buildQualityStandards(
  settings?: ProjectSettings['qualitySettings']
): string {
  // Apply defaults for any missing settings
  const qualitySettings = {
    ...STANDARD_DEFAULTS.qualitySettings,
    ...settings,
  };

  const standards: string[] = [];

  // Always include Evidence-Based as first standard
  standards.push('- **Evidence-Based**: Every element must be backed by specific research findings from the Project Context');

  // Methodology Depth
  switch (qualitySettings.methodologyDepth) {
    case 'basic':
      standards.push('- **Clear & Simple**: Use straightforward explanations and avoid unnecessary jargon');
      break;
    case 'intermediate':
      standards.push('- **Balanced Detail**: Provide clear explanations with appropriate methodology context');
      break;
    case 'advanced':
      standards.push('- **Comprehensive Analysis**: Include detailed methodology, research citations, and advanced frameworks');
      break;
  }

  // Output Detail Level
  switch (qualitySettings.outputDetail) {
    case 'brief':
      standards.push('- **Concise**: Focus on key insights and essential actionable recommendations only');
      break;
    case 'moderate':
      standards.push('- **Balanced**: Provide sufficient detail with clear structure and explanations');
      break;
    case 'comprehensive':
      standards.push('- **Thorough**: Include detailed analysis, examples, supporting documentation, and complete coverage');
      break;
  }

  // Time Constraints
  switch (qualitySettings.timeConstraints) {
    case 'urgent':
      standards.push('- **Rapid Delivery**: Prioritize speed while maintaining essential quality and actionable insights');
      break;
    case 'standard':
      standards.push('- **Balanced Approach**: Balance quality, depth, and efficiency appropriately');
      break;
    case 'extended':
      standards.push('- **Thorough Exploration**: Take time for deep analysis, multiple iterations, and comprehensive documentation');
      break;
  }

  // Industry Compliance (optional enhancement)
  if (qualitySettings.industryCompliance) {
    standards.push('- **Compliance-Aware**: Consider industry-specific regulations, standards, and compliance requirements');
  }

  // Accessibility Focus (recommended by default)
  if (qualitySettings.accessibilityFocus) {
    standards.push('- **Accessibility-First**: Prioritize WCAG guidelines, inclusive design principles, and universal usability');
  }

  // Always include Professional standard
  standards.push('- **Professional**: Use proper UX methodology, terminology, and industry best practices');

  return `## Quality Standards:\n${standards.join('\n')}`;
}

/**
 * Build Output Format section based on project settings
 * Falls back to comprehensive defaults if no settings provided
 */
export function buildOutputFormat(
  settings?: ProjectSettings['aiMethodSettings'],
  toolType?: string
): string {
  // Apply defaults for any missing settings
  const aiSettings = {
    ...STANDARD_DEFAULTS.aiMethodSettings,
    ...settings,
  };

  const formatParts: string[] = [];

  // Prompt Structure
  switch (aiSettings.promptStructure) {
    case 'framework-guided':
      formatParts.push('Structure your response following established UX methodology frameworks. Use clear sections, systematic progression, and actionable insights.');
      break;
    case 'open-ended':
      formatParts.push('Provide a flexible, exploratory response that encourages creative thinking and multiple perspectives. Allow for innovation while maintaining structure.');
      break;
    case 'structured-templates':
      formatParts.push('Use a consistent, repeatable template format with predefined sections and standardized layouts for easy comparison and implementation.');
      break;
  }

  // Creativity Level
  switch (aiSettings.creativityLevel) {
    case 'conservative':
      formatParts.push('Focus on proven, well-established approaches and industry best practices. Prioritize reliability and tested methods.');
      break;
    case 'balanced':
      formatParts.push('Balance proven methodologies with appropriate innovation. Include both established practices and thoughtful new approaches.');
      break;
    case 'creative':
      formatParts.push('Include innovative approaches and creative suggestions alongside proven methods. Encourage fresh perspectives and novel solutions.');
      break;
    case 'experimental':
      formatParts.push('Explore cutting-edge methods, experimental approaches, and forward-thinking solutions. Push boundaries while maintaining practicality.');
      break;
  }

  // Reasoning Style
  switch (aiSettings.reasoning) {
    case 'step-by-step':
      formatParts.push('Provide step-by-step explanations with clear reasoning and justification at each stage. Show your thinking process.');
      break;
    case 'direct':
      formatParts.push('Present direct, confident recommendations with concise justification. Focus on clarity and actionability.');
      break;
    case 'exploratory':
      formatParts.push('Explore multiple approaches, reasoning paths, and alternative perspectives. Present options with trade-offs.');
      break;
  }

  // Validation Level
  switch (aiSettings.validation) {
    case 'comprehensive':
      formatParts.push('Include comprehensive validation methods, testing criteria, quality assurance checks, and success metrics.');
      break;
    case 'built-in':
      formatParts.push('Incorporate validation checkpoints, quality indicators, and verification methods throughout.');
      break;
    case 'basic':
      formatParts.push('Include basic validation guidelines and quality checkpoints.');
      break;
    case 'none':
      // Don't add validation requirements
      break;
  }

  // Adaptability (always include for context-aware or better)
  if (aiSettings.adaptability === 'context-aware' || aiSettings.adaptability === 'dynamic-learning') {
    formatParts.push('Adapt recommendations based on the specific project context, constraints, and user needs documented in the Project Context.');
  }

  // Add standard formatting requirements
  formatParts.push('Use clear section headers, proper formatting, and professional presentation throughout.');

  return `## Output Format:\n${formatParts.join(' ')}`;
}

/**
 * Build enhanced Instructions section with project context integration
 */
export function buildInstructions(
  baseInstructions: string,
  projectSettings?: ProjectSettings
): string {
  let instructions = baseInstructions;

  // Add project context specifics if available
  if (projectSettings?.projectContext) {
    const { targetAudience, primaryGoals, keyConstraints, successMetrics } = projectSettings.projectContext;

    const contextGuidance: string[] = [];

    if (targetAudience) {
      contextGuidance.push(`- **Target Audience Focus**: ${targetAudience}`);
    }
    if (primaryGoals) {
      contextGuidance.push(`- **Primary Goals**: ${primaryGoals}`);
    }
    if (keyConstraints) {
      contextGuidance.push(`- **Key Constraints**: ${keyConstraints}`);
    }
    if (successMetrics) {
      contextGuidance.push(`- **Success Metrics**: ${successMetrics}`);
    }

    if (contextGuidance.length > 0) {
      instructions += `\n\n**Project Specifics to Prioritize:**\n${contextGuidance.join('\n')}`;
    }
  }

  return instructions;
}

/**
 * Main function: Build complete dynamic prompt from base template
 *
 * @param baseTemplate - The base template with placeholder sections
 * @param projectSettings - Optional project-specific settings (uses defaults if not provided)
 * @param knowledgeBase - Knowledge base content to inject
 * @returns Complete prompt with dynamic sections
 */
export function buildDynamicPrompt(
  baseTemplate: string,
  projectSettings?: ProjectSettings,
  knowledgeBase?: string
): string {
  let prompt = baseTemplate;

  // 1. Replace Knowledge Base placeholder
  if (knowledgeBase) {
    prompt = prompt.replace(
      /\$\{'\{knowledgeBase\}'\}/g,
      knowledgeBase
    );
  }

  // 2. Enhance Instructions section with project context
  const instructionsMatch = prompt.match(/(## Instructions:[\s\S]*?)(?=\n---|\n##)/);
  if (instructionsMatch) {
    const originalInstructions = instructionsMatch[1];
    const enhancedInstructions = buildInstructions(originalInstructions, projectSettings);
    prompt = prompt.replace(originalInstructions, enhancedInstructions);
  }

  // 3. Replace Quality Standards section
  const qualityStandards = buildQualityStandards(projectSettings?.qualitySettings);
  const qualityMatch = prompt.match(/## Quality Standards:[\s\S]*?(?=\n---|\n##|$)/);
  if (qualityMatch) {
    prompt = prompt.replace(qualityMatch[0], qualityStandards);
  } else {
    // If no Quality Standards section exists, add it before Output Format
    const outputFormatIndex = prompt.indexOf('## Output Format:');
    if (outputFormatIndex > -1) {
      prompt = prompt.slice(0, outputFormatIndex) + qualityStandards + '\n\n---\n\n' + prompt.slice(outputFormatIndex);
    }
  }

  // 4. Replace Output Format section
  const outputFormat = buildOutputFormat(projectSettings?.aiMethodSettings);
  const formatMatch = prompt.match(/## Output Format:[\s\S]*?(?=\n---|\n##|$)/);
  if (formatMatch) {
    prompt = prompt.replace(formatMatch[0], outputFormat);
  } else {
    // If no Output Format section exists, add it after Quality Standards
    const qualityIndex = prompt.lastIndexOf('---\n\n## Quality Standards:');
    if (qualityIndex > -1) {
      const nextSectionIndex = prompt.indexOf('\n---\n', qualityIndex + 10);
      if (nextSectionIndex > -1) {
        prompt = prompt.slice(0, nextSectionIndex + 1) + '\n' + outputFormat + '\n' + prompt.slice(nextSectionIndex + 1);
      }
    }
  }

  return prompt;
}

/**
 * Validate project settings have reasonable values
 */
export function validateProjectSettings(settings?: ProjectSettings): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!settings) {
    return { isValid: true, errors: [] }; // No settings is valid (will use defaults)
  }

  // Validate quality settings
  if (settings.qualitySettings) {
    const { methodologyDepth, outputDetail, timeConstraints } = settings.qualitySettings;

    if (methodologyDepth && !['basic', 'intermediate', 'advanced'].includes(methodologyDepth)) {
      errors.push(`Invalid methodologyDepth: ${methodologyDepth}`);
    }
    if (outputDetail && !['brief', 'moderate', 'comprehensive'].includes(outputDetail)) {
      errors.push(`Invalid outputDetail: ${outputDetail}`);
    }
    if (timeConstraints && !['urgent', 'standard', 'extended'].includes(timeConstraints)) {
      errors.push(`Invalid timeConstraints: ${timeConstraints}`);
    }
  }

  // Validate AI method settings
  if (settings.aiMethodSettings) {
    const { promptStructure, creativityLevel, reasoning, adaptability, validation } = settings.aiMethodSettings;

    if (promptStructure && !['framework-guided', 'open-ended', 'structured-templates'].includes(promptStructure)) {
      errors.push(`Invalid promptStructure: ${promptStructure}`);
    }
    if (creativityLevel && !['conservative', 'balanced', 'creative', 'experimental'].includes(creativityLevel)) {
      errors.push(`Invalid creativityLevel: ${creativityLevel}`);
    }
    if (reasoning && !['step-by-step', 'direct', 'exploratory'].includes(reasoning)) {
      errors.push(`Invalid reasoning: ${reasoning}`);
    }
    if (adaptability && !['static', 'context-aware', 'dynamic-learning'].includes(adaptability)) {
      errors.push(`Invalid adaptability: ${adaptability}`);
    }
    if (validation && !['none', 'basic', 'built-in', 'comprehensive'].includes(validation)) {
      errors.push(`Invalid validation: ${validation}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get human-readable description of settings for preview
 */
export function getSettingsDescription(settings?: ProjectSettings): string {
  const quality = { ...STANDARD_DEFAULTS.qualitySettings, ...settings?.qualitySettings };
  const aiMethod = { ...STANDARD_DEFAULTS.aiMethodSettings, ...settings?.aiMethodSettings };

  const descriptions: string[] = [];

  descriptions.push(`Methodology: ${quality.methodologyDepth}`);
  descriptions.push(`Detail Level: ${quality.outputDetail}`);
  descriptions.push(`Structure: ${aiMethod.promptStructure}`);
  descriptions.push(`Creativity: ${aiMethod.creativityLevel}`);

  if (quality.accessibilityFocus) {
    descriptions.push('Accessibility-focused');
  }
  if (quality.industryCompliance) {
    descriptions.push('Compliance-aware');
  }

  return descriptions.join(' • ');
}
