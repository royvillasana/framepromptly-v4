import { KnowledgeEntry } from '@/stores/knowledge-store';
import { EnhancedToolPromptTemplate } from '@/lib/tool-templates-enhanced';

/**
 * Enhanced Project Context Integration
 * Integrates project-level knowledge base and settings with enhanced prompt generation
 */

export interface ProjectEnhancedContext {
  // Industry and domain context
  industry: string;
  domainSpecific: boolean;
  
  // Project-specific context
  projectGoals: string[];
  targetAudience: string;
  constraints: string[];
  successMetrics: string[];
  teamComposition: string;
  timeline: string;
  
  // Quality settings
  methodologyDepth: 'basic' | 'intermediate' | 'advanced';
  outputDetail: 'brief' | 'moderate' | 'comprehensive';
  timeConstraints: 'urgent' | 'standard' | 'extended';
  industryCompliance: boolean;
  accessibilityFocus: boolean;
  
  // Knowledge base entries
  knowledgeEntries: KnowledgeEntry[];
  knowledgeBaseSummary: string;
}

export interface EnhancedPromptGenerationRequest {
  template: EnhancedToolPromptTemplate;
  variables: Record<string, any>;
  projectContext: ProjectEnhancedContext;
  toolId: string;
  toolName: string;
}

/**
 * Generates project-specific knowledge base context string
 */
export const generateKnowledgeBaseContext = (entries: KnowledgeEntry[]): string => {
  if (entries.length === 0) {
    return '';
  }

  const contextSections = entries.map(entry => {
    const cleanContent = cleanContentForPrompt(entry.content);
    return `### ${entry.title}\n${cleanContent}\n`;
  }).join('\n');

  return `=== PROJECT KNOWLEDGE BASE ===\n\n${contextSections}\n=== END KNOWLEDGE BASE ===\n\nBased on the above project knowledge, generate customized instructions for:`;
};

/**
 * Clean and format content for prompt inclusion
 */
const cleanContentForPrompt = (content: string): string => {
  if (!content) return '';
  
  return content
    .replace(/[%&<>{}\\\/[\]@#$^*+=|~`]/g, ' ') // Remove special characters
    .replace(/[^\w\s.,!?()-]/g, ' ') // Keep only basic punctuation
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/^\s*[\d\s]*obj\s*/gi, '') // Remove PDF artifacts
    .replace(/endstream|endobj|stream/gi, '') // Remove PDF keywords
    .trim()
    .substring(0, 2000); // Limit length to prevent prompt bloat
};

/**
 * Generates enhanced prompt context combining project settings and knowledge base
 */
export const generateEnhancedProjectPromptContext = (
  request: EnhancedPromptGenerationRequest
): string => {
  const { template, variables, projectContext, toolName } = request;
  
  // Start with base template
  let promptContent = processTemplateVariables(template.template, variables);
  
  // Add project context if available
  if (projectContext.projectGoals.length > 0 || projectContext.targetAudience) {
    promptContent += '\n\n### PROJECT CONTEXT:\n';
    
    if (projectContext.projectGoals.length > 0) {
      promptContent += `**Goals:** ${projectContext.projectGoals.join(', ')}\n`;
    }
    
    if (projectContext.targetAudience) {
      promptContent += `**Target Audience:** ${projectContext.targetAudience}\n`;
    }
    
    if (projectContext.constraints.length > 0) {
      promptContent += `**Constraints:** ${projectContext.constraints.join(', ')}\n`;
    }
    
    if (projectContext.timeline) {
      promptContent += `**Timeline:** ${projectContext.timeline}\n`;
    }
  }
  
  // Add quality and methodology context
  const qualityContext = generateQualityContext(projectContext);
  if (qualityContext) {
    promptContent += `\n\n### QUALITY & METHODOLOGY REQUIREMENTS:\n${qualityContext}`;
  }
  
  // Add industry-specific adaptations
  if (projectContext.industry !== 'general') {
    const industryContext = generateIndustryContext(projectContext.industry, toolName);
    if (industryContext) {
      promptContent += `\n\n### INDUSTRY-SPECIFIC CONSIDERATIONS:\n${industryContext}`;
    }
  }
  
  // Add knowledge base context
  if (projectContext.knowledgeEntries.length > 0) {
    const knowledgeContext = generateKnowledgeBaseContext(projectContext.knowledgeEntries);
    promptContent = knowledgeContext + '\n\n' + promptContent;
  }
  
  return promptContent;
};

/**
 * Process template variables
 */
const processTemplateVariables = (template: string, variables: Record<string, any>): string => {
  let processed = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, String(value));
  });
  return processed;
};

/**
 * Generate quality and methodology context
 */
const generateQualityContext = (context: ProjectEnhancedContext): string => {
  const requirements = [];
  
  // Methodology depth
  const depthMap = {
    basic: 'Keep methodology straightforward and actionable',
    intermediate: 'Provide balanced depth with practical considerations',
    advanced: 'Include comprehensive methodology with detailed frameworks'
  };
  requirements.push(depthMap[context.methodologyDepth]);
  
  // Output detail
  const detailMap = {
    brief: 'Provide concise, focused outputs',
    moderate: 'Balance detail with clarity',
    comprehensive: 'Include thorough, detailed outputs with examples'
  };
  requirements.push(detailMap[context.outputDetail]);
  
  // Time constraints
  const timeMap = {
    urgent: 'Prioritize quick, actionable results',
    standard: 'Balance thoroughness with reasonable timelines',
    extended: 'Allow for comprehensive exploration and iteration'
  };
  requirements.push(timeMap[context.timeConstraints]);
  
  // Additional considerations
  if (context.industryCompliance) {
    requirements.push('Include relevant compliance and regulatory considerations');
  }
  
  if (context.accessibilityFocus) {
    requirements.push('Emphasize accessibility, inclusion, and universal design principles');
  }
  
  return requirements.map(req => `• ${req}`).join('\n');
};

/**
 * Generate industry-specific context
 */
const generateIndustryContext = (industry: string, toolName: string): string => {
  const industryAdaptations: Record<string, string[]> = {
    fintech: [
      'Consider financial regulations and compliance requirements',
      'Address security, privacy, and fraud prevention concerns',
      'Account for complex financial workflows and decision-making processes'
    ],
    healthcare: [
      'Ensure HIPAA compliance and patient privacy protection',
      'Consider clinical workflows and medical professional needs',
      'Address accessibility for diverse patient populations'
    ],
    ecommerce: [
      'Focus on conversion optimization and user purchase intent',
      'Consider mobile commerce and cross-platform experiences',
      'Address inventory, pricing, and checkout flow considerations'
    ],
    saas: [
      'Consider subscription models and user onboarding flows',
      'Address integration needs and API considerations',
      'Focus on user adoption, engagement, and retention metrics'
    ],
    education: [
      'Consider diverse learning styles and accessibility needs',
      'Address age-appropriate design and safety considerations',
      'Account for institutional requirements and pedagogical approaches'
    ],
    government: [
      'Ensure compliance with accessibility standards (Section 508, WCAG)',
      'Consider public service delivery and citizen-centered design',
      'Address transparency, accountability, and multilingual needs'
    ],
    nonprofit: [
      'Consider resource constraints and volunteer-driven operations',
      'Focus on mission alignment and social impact measurement',
      'Address donor engagement and community outreach needs'
    ]
  };
  
  const adaptations = industryAdaptations[industry];
  if (!adaptations) return '';
  
  return adaptations.map(adaptation => `• ${adaptation}`).join('\n');
};

/**
 * Create enhanced context object from project data
 */
export const createProjectEnhancedContext = (
  projectData: {
    industry?: string;
    projectContext?: any;
    qualitySettings?: any;
    knowledgeEntries?: KnowledgeEntry[];
  }
): ProjectEnhancedContext => {
  const { industry = 'general', projectContext = {}, qualitySettings = {}, knowledgeEntries = [] } = projectData;
  
  return {
    industry,
    domainSpecific: industry !== 'general',
    projectGoals: projectContext.primaryGoals ? projectContext.primaryGoals.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    targetAudience: projectContext.targetAudience || '',
    constraints: projectContext.keyConstraints ? projectContext.keyConstraints.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
    successMetrics: projectContext.successMetrics ? projectContext.successMetrics.split(',').map((m: string) => m.trim()).filter(Boolean) : [],
    teamComposition: projectContext.teamComposition || '',
    timeline: projectContext.timeline || '',
    methodologyDepth: qualitySettings.methodologyDepth || 'intermediate',
    outputDetail: qualitySettings.outputDetail || 'moderate',
    timeConstraints: qualitySettings.timeConstraints || 'standard',
    industryCompliance: qualitySettings.industryCompliance || false,
    accessibilityFocus: qualitySettings.accessibilityFocus || false,
    knowledgeEntries,
    knowledgeBaseSummary: knowledgeEntries.length > 0 
      ? `This project has ${knowledgeEntries.length} knowledge base entries covering: ${knowledgeEntries.map(e => e.title).join(', ')}`
      : 'No knowledge base entries available'
  };
};

/**
 * Validate enhanced context for completeness
 */
export const validateEnhancedContext = (context: ProjectEnhancedContext): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} => {
  const warnings = [];
  const suggestions = [];
  
  // Check for missing core context
  if (!context.projectGoals.length) {
    warnings.push('No project goals defined');
    suggestions.push('Consider adding project goals to improve prompt relevance');
  }
  
  if (!context.targetAudience) {
    warnings.push('No target audience defined');
    suggestions.push('Define target audience for more focused outputs');
  }
  
  if (context.knowledgeEntries.length === 0) {
    suggestions.push('Add knowledge base entries for more contextual prompts');
  }
  
  // Industry-specific validations
  if (context.industry === 'general') {
    suggestions.push('Consider selecting a specific industry for specialized adaptations');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
};