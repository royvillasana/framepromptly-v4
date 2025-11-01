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
    personalization?: 'none' | 'basic-profile' | 'user-preferences' | 'adaptive-learning';
    temperature?: number;
    topP?: number;
    topK?: number;
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
    personalization: 'user-preferences' as const,
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
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
 * Build LLM Configuration block in XML format for LLM consumption
 * This goes at the very beginning of the prompt to configure the AI's behavior
 */
export function buildLLMConfig(projectSettings?: ProjectSettings): string {
  // Merge with defaults
  const ai = { ...STANDARD_DEFAULTS.aiMethodSettings, ...(projectSettings?.aiMethodSettings || {}) };

  // Map creativity level to temperature if not explicitly set
  let temperature = ai.temperature;
  if (temperature === undefined) {
    const creativityToTemp = {
      'conservative': 0.3,
      'balanced': 0.7,
      'creative': 0.85,
      'experimental': 1.0
    };
    temperature = creativityToTemp[ai.creativityLevel] || 0.7;
  }

  // Map creativity level to top_p if not explicitly set
  let topP = ai.topP;
  if (topP === undefined) {
    const creativityToTopP = {
      'conservative': 0.7,
      'balanced': 0.9,
      'creative': 0.95,
      'experimental': 1.0
    };
    topP = creativityToTopP[ai.creativityLevel] || 0.9;
  }

  // Map creativity level to top_k if not explicitly set
  let topK = ai.topK;
  if (topK === undefined) {
    const creativityToTopK = {
      'conservative': 20,
      'balanced': 50,
      'creative': 80,
      'experimental': 100
    };
    topK = creativityToTopK[ai.creativityLevel] || 50;
  }

  // Calculate max_tokens based on output detail
  const quality = { ...STANDARD_DEFAULTS.qualitySettings, ...(projectSettings?.qualitySettings || {}) };
  const maxTokensMap = {
    'brief': 800,
    'moderate': 1500,
    'comprehensive': 3000
  };
  const maxTokens = maxTokensMap[quality.outputDetail] || 1500;

  // Map reasoning style to mode
  const modeMap = {
    'step-by-step': 'analytical_reasoning',
    'direct': 'direct_response',
    'exploratory': 'creative_reasoning'
  };
  const mode = modeMap[ai.reasoning] || 'analytical_reasoning';

  // Map prompt structure to response_style
  const responseStyleMap = {
    'framework-guided': 'structured',
    'open-ended': 'conversational',
    'structured-templates': 'templated'
  };
  const responseStyle = responseStyleMap[ai.promptStructure] || 'structured';

  // Map reasoning style to reasoning_depth
  const reasoningDepthMap = {
    'step-by-step': 'deep',
    'direct': 'shallow',
    'exploratory': 'mid'
  };
  const reasoningDepth = reasoningDepthMap[ai.reasoning] || 'mid';

  // Build the XML config block
  const config = `<LLM_CONFIG>
temperature=${temperature}
top_p=${topP}
top_k=${topK}
max_tokens=${maxTokens}
mode=${mode}
response_style=${responseStyle}
reasoning_depth=${reasoningDepth}
</LLM_CONFIG>`;

  return config;
}

/**
 * Build AI Generation Parameters section to display settings visibly in the prompt
 * Shows all configuration details including advanced parameters
 */
export function buildAIGenerationParameters(projectSettings?: ProjectSettings): string {
  // Always show AI parameters, using defaults if no settings provided
  const sections: string[] = [];
  sections.push('# AI GENERATION PARAMETERS');
  sections.push('');
  sections.push('*These parameters influence how this prompt is structured and executed:*');
  sections.push('');

  // Project Context
  if (projectSettings?.projectContext) {
    const ctx = projectSettings.projectContext;
    const contextParts: string[] = [];

    if (ctx.primaryGoals) contextParts.push(`**Primary Goals:** ${ctx.primaryGoals}`);
    if (ctx.targetAudience) contextParts.push(`**Target Audience:** ${ctx.targetAudience}`);
    if (ctx.keyConstraints) contextParts.push(`**Key Constraints:** ${ctx.keyConstraints}`);
    if (ctx.successMetrics) contextParts.push(`**Success Metrics:** ${ctx.successMetrics}`);
    if (ctx.teamComposition) contextParts.push(`**Team Composition:** ${ctx.teamComposition}`);
    if (ctx.timeline) contextParts.push(`**Timeline:** ${ctx.timeline}`);

    if (contextParts.length > 0) {
      sections.push('## Project Context');
      contextParts.forEach(part => sections.push(`- ${part}`));
      sections.push('');
    }
  }

  // Quality Preferences - Always show, using defaults if not configured
  const quality = { ...STANDARD_DEFAULTS.qualitySettings, ...(projectSettings?.qualitySettings || {}) };
  sections.push('## Quality Preferences');

    // Methodology Depth
    sections.push(`- **Methodology Depth:** ${quality.methodologyDepth.toUpperCase()}`);
    const depthDescriptions = {
      'basic': 'Simple explanations without unnecessary jargon',
      'intermediate': 'Balanced detail with appropriate methodology context',
      'advanced': 'Comprehensive analysis with detailed methodology and research citations'
    };
    sections.push(`  _${depthDescriptions[quality.methodologyDepth]}_`);

    // Output Detail Level
    sections.push(`- **Output Detail Level:** ${quality.outputDetail.toUpperCase()}`);
    const detailDescriptions = {
      'brief': 'Focus on key insights and essential recommendations',
      'moderate': 'Sufficient detail with clear structure and explanations',
      'comprehensive': 'Detailed analysis with examples and complete coverage'
    };
    sections.push(`  _${detailDescriptions[quality.outputDetail]}_`);

    // Time Constraints
    sections.push(`- **Time Constraints:** ${quality.timeConstraints.toUpperCase()}`);
    const timeDescriptions = {
      'urgent': 'Quick solutions with immediate actionability',
      'standard': 'Balanced approach with reasonable depth',
      'extended': 'Thorough exploration with comprehensive details'
    };
    sections.push(`  _${timeDescriptions[quality.timeConstraints]}_`);

    sections.push(`- **Industry Compliance Required:** ${quality.industryCompliance ? 'YES' : 'NO'}`);
    sections.push(`- **Accessibility Focus:** ${quality.accessibilityFocus ? 'YES (WCAG guidelines applied)' : 'NO'}`);
    sections.push('');

  // AI Method Settings - Comprehensive Display (always show, using defaults if not configured)
  const ai = { ...STANDARD_DEFAULTS.aiMethodSettings, ...(projectSettings?.aiMethodSettings || {}) };

    // Prompt Structure Method
    sections.push('## Prompt Structure Method');
    sections.push(`- **Selected Method:** ${ai.promptStructure.toUpperCase()}`);
    const structureDescriptions = {
      'framework-guided': 'Follows UX methodology structure with stage-based organization and systematic progression',
      'open-ended': 'Flexible exploratory prompts that encourage creative thinking and diverse approaches',
      'structured-templates': 'Consistent format patterns with predefined sections and standardized layouts'
    };
    sections.push(`  _${structureDescriptions[ai.promptStructure]}_`);
    sections.push('');

    // AI Creativity Level - Check for advanced parameters
    const hasAdvancedParams = ai.temperature !== undefined || ai.topP !== undefined || ai.topK !== undefined;
    sections.push('## AI Creativity Level');

    if (hasAdvancedParams) {
      sections.push(`- **Mode:** ADVANCED PARAMETERS (overrides creativity level)`);
      if (ai.temperature !== undefined) {
        sections.push(`- **Temperature:** ${ai.temperature}`);
        sections.push(`  _Controls randomness: ${ai.temperature < 0.3 ? 'Very focused' : ai.temperature < 0.7 ? 'Balanced' : ai.temperature < 1.0 ? 'Creative' : 'Highly experimental'}_`);
      }
      if (ai.topP !== undefined) {
        sections.push(`- **Top P (Nucleus Sampling):** ${ai.topP}`);
        sections.push(`  _Diversity control: ${ai.topP < 0.5 ? 'Narrow choices' : ai.topP < 0.9 ? 'Balanced diversity' : 'Maximum diversity'}_`);
      }
      if (ai.topK !== undefined) {
        sections.push(`- **Top K:** ${ai.topK}`);
        sections.push(`  _Consider top ${ai.topK} most likely tokens_`);
      }
    } else {
      sections.push(`- **Creativity Level:** ${ai.creativityLevel.toUpperCase()}`);
      const creativityDescriptions = {
        'conservative': 'Proven, well-established approaches and industry best practices',
        'balanced': 'Mix of proven methodologies with appropriate innovation',
        'creative': 'Innovative approaches and creative suggestions alongside proven methods',
        'experimental': 'Cutting-edge methods and forward-thinking solutions'
      };
      sections.push(`  _${creativityDescriptions[ai.creativityLevel]}_`);
    }
    sections.push('');

    // Reasoning Approach
    sections.push('## Reasoning Approach');
    sections.push(`- **Reasoning Style:** ${ai.reasoning.toUpperCase()}`);
    const reasoningDescriptions = {
      'step-by-step': 'Clear step-by-step explanations with reasoning at each stage',
      'direct': 'Direct confident recommendations with concise justification',
      'exploratory': 'Multiple approaches and alternative perspectives with trade-offs'
    };
    sections.push(`  _${reasoningDescriptions[ai.reasoning]}_`);
    sections.push('');

    // Adaptability Method
    sections.push('## Adaptability Method');
    sections.push(`- **Adaptability Level:** ${ai.adaptability.toUpperCase()}`);
    const adaptabilityDescriptions = {
      'static': 'Consistent approach following fixed patterns',
      'context-aware': 'Adapts based on specific project context and constraints',
      'dynamic-learning': 'Continuously adjusts based on patterns and user feedback'
    };
    sections.push(`  _${adaptabilityDescriptions[ai.adaptability]}_`);
    sections.push('');

    // Validation & Quality Control
    sections.push('## Validation & Quality Control');
    sections.push(`- **Validation Level:** ${ai.validation.toUpperCase()}`);
    const validationDescriptions = {
      'none': 'No validation requirements - rapid output focused',
      'basic': 'Basic validation guidelines and quality checkpoints',
      'built-in': 'Validation checkpoints and verification methods throughout',
      'comprehensive': 'Comprehensive validation methods, testing criteria, and success metrics'
    };
    sections.push(`  _${validationDescriptions[ai.validation]}_`);
    sections.push('');

    // Personalization Levels
    if (ai.personalization) {
      sections.push('## Personalization Level');
      sections.push(`- **Personalization:** ${ai.personalization.toUpperCase()}`);
      const personalizationDescriptions = {
        'none': 'Generic responses without personalization',
        'basic-profile': 'Uses basic user profile information',
        'user-preferences': 'Adapts to documented user preferences and project settings',
        'adaptive-learning': 'Learns from interactions and continuously improves recommendations'
      };
      sections.push(`  _${personalizationDescriptions[ai.personalization]}_`);
      sections.push('');
    }

  sections.push('---');
  sections.push('');

  return sections.join('\n');
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

  // 1. Insert AI Generation Parameters at the very top (right after the title if exists)
  const aiParameters = buildAIGenerationParameters(projectSettings);
  console.log('[buildDynamicPrompt] AI Parameters:', aiParameters?.substring(0, 200));
  console.log('[buildDynamicPrompt] Project Settings:', projectSettings);
  if (aiParameters) {
    // Find the first markdown header (# Title) if it exists
    const titleMatch = prompt.match(/^#\s+.+\n\n/);
    if (titleMatch) {
      // Insert after the title
      const insertIndex = titleMatch[0].length;
      prompt = prompt.slice(0, insertIndex) + '\n\n' + aiParameters + '\n\n' + prompt.slice(insertIndex);
      console.log('[buildDynamicPrompt] Inserted after title');
    } else {
      // Insert at the very beginning
      prompt = aiParameters + '\n\n' + prompt;
      console.log('[buildDynamicPrompt] Inserted at beginning');
    }
  }
  console.log('[buildDynamicPrompt] Final prompt preview:', prompt.substring(0, 400));

  // 2. Replace Knowledge Base placeholder
  if (knowledgeBase) {
    prompt = prompt.replace(
      /\$\{'\{knowledgeBase\}'\}/g,
      knowledgeBase
    );
  }

  // 3. Enhance Instructions section with project context
  const instructionsMatch = prompt.match(/(## Instructions:[\s\S]*?)(?=\n---|\n##)/);
  if (instructionsMatch) {
    const originalInstructions = instructionsMatch[1];
    const enhancedInstructions = buildInstructions(originalInstructions, projectSettings);
    prompt = prompt.replace(originalInstructions, enhancedInstructions);
  }

  // 4. Replace Quality Standards section
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

  // 5. Replace Output Format section
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
