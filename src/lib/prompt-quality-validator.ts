/**
 * @fileoverview Prompt Quality Validation System
 * Provides comprehensive quality assessment and validation for generated prompts
 */

export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, importance of this metric
  category: 'structure' | 'content' | 'usability' | 'methodology';
}

export interface QualityScore {
  metricId: string;
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
  examples?: string[];
}

export interface QualityValidationResult {
  overallScore: number; // 0-100
  category: 'excellent' | 'good' | 'fair' | 'poor';
  scores: QualityScore[];
  summary: {
    strengths: string[];
    weaknesses: string[];
    criticalIssues: string[];
    recommendations: string[];
  };
  validationTimestamp: number;
  templateId?: string;
  industry?: string;
}

export interface ValidationCriteria {
  templateId: string;
  requiredElements: string[];
  qualityMetrics: QualityMetric[];
  industrySpecific?: {
    [industry: string]: {
      additionalMetrics: QualityMetric[];
      requirementModifications: string[];
    };
  };
}

/**
 * Core quality metrics for UX tool prompts
 */
export const CORE_QUALITY_METRICS: QualityMetric[] = [
  // Structure Metrics
  {
    id: 'clarity_structure',
    name: 'Structural Clarity',
    description: 'Clear organization, logical flow, and proper formatting',
    weight: 0.2,
    category: 'structure'
  },
  {
    id: 'completeness',
    name: 'Completeness',
    description: 'All necessary elements and sections are present',
    weight: 0.15,
    category: 'structure'
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Consistent terminology, format, and style throughout',
    weight: 0.1,
    category: 'structure'
  },

  // Content Metrics
  {
    id: 'actionability',
    name: 'Actionability',
    description: 'Provides clear, specific actions and guidance',
    weight: 0.2,
    category: 'content'
  },
  {
    id: 'methodology_rigor',
    name: 'Methodological Rigor',
    description: 'Based on established UX research and design methodologies',
    weight: 0.15,
    category: 'methodology'
  },
  {
    id: 'context_relevance',
    name: 'Context Relevance',
    description: 'Relevant to specified context, users, and objectives',
    weight: 0.1,
    category: 'content'
  },

  // Usability Metrics
  {
    id: 'practitioner_usability',
    name: 'Practitioner Usability',
    description: 'Easy for UX practitioners to understand and implement',
    weight: 0.15,
    category: 'usability'
  },
  {
    id: 'accessibility_inclusion',
    name: 'Accessibility & Inclusion',
    description: 'Considers diverse users and accessibility requirements',
    weight: 0.1,
    category: 'usability'
  }
];

/**
 * Industry-specific quality metric extensions
 */
export const INDUSTRY_QUALITY_METRICS: Record<string, QualityMetric[]> = {
  fintech: [
    {
      id: 'regulatory_compliance',
      name: 'Regulatory Compliance',
      description: 'Addresses financial services regulations and compliance requirements',
      weight: 0.15,
      category: 'methodology'
    },
    {
      id: 'security_considerations',
      name: 'Security Considerations',
      description: 'Includes appropriate security and trust-building elements',
      weight: 0.1,
      category: 'content'
    }
  ],
  healthcare: [
    {
      id: 'hipaa_compliance',
      name: 'HIPAA Compliance',
      description: 'Addresses healthcare privacy and data protection requirements',
      weight: 0.15,
      category: 'methodology'
    },
    {
      id: 'clinical_accuracy',
      name: 'Clinical Accuracy',
      description: 'Considers clinical workflows and healthcare-specific needs',
      weight: 0.1,
      category: 'content'
    }
  ],
  ecommerce: [
    {
      id: 'conversion_focus',
      name: 'Conversion Focus',
      description: 'Addresses conversion optimization and customer journey considerations',
      weight: 0.1,
      category: 'content'
    },
    {
      id: 'multichannel_consideration',
      name: 'Multichannel Consideration',
      description: 'Considers cross-device and omnichannel user experiences',
      weight: 0.1,
      category: 'methodology'
    }
  ],
  saas: [
    {
      id: 'integration_awareness',
      name: 'Integration Awareness',
      description: 'Considers workflow integration and tool ecosystem needs',
      weight: 0.1,
      category: 'content'
    },
    {
      id: 'organizational_context',
      name: 'Organizational Context',
      description: 'Addresses team collaboration and organizational decision-making',
      weight: 0.1,
      category: 'methodology'
    }
  ],
  education: [
    {
      id: 'learning_accessibility',
      name: 'Learning Accessibility',
      description: 'Considers diverse learning styles and accessibility needs',
      weight: 0.1,
      category: 'usability'
    },
    {
      id: 'institutional_constraints',
      name: 'Institutional Constraints',
      description: 'Addresses educational institutional requirements and limitations',
      weight: 0.1,
      category: 'methodology'
    }
  ]
};

/**
 * Template-specific validation criteria
 */
export const TEMPLATE_VALIDATION_CRITERIA: Record<string, ValidationCriteria> = {
  'user-interviews': {
    templateId: 'user-interviews',
    requiredElements: [
      'research objectives',
      'participant criteria',
      'interview structure',
      'question types',
      'analysis framework',
      'quality assurance measures'
    ],
    qualityMetrics: [
      ...CORE_QUALITY_METRICS,
      {
        id: 'question_quality',
        name: 'Question Quality',
        description: 'Questions are open-ended, unbiased, and encourage storytelling',
        weight: 0.15,
        category: 'methodology'
      },
      {
        id: 'funnel_technique',
        name: 'Funnel Technique Implementation',
        description: 'Proper implementation of broad-to-specific questioning approach',
        weight: 0.1,
        category: 'methodology'
      }
    ]
  },
  'personas': {
    templateId: 'personas',
    requiredElements: [
      'research backing',
      'behavioral patterns',
      'goals and motivations',
      'pain points',
      'design implications',
      'validation framework'
    ],
    qualityMetrics: [
      ...CORE_QUALITY_METRICS,
      {
        id: 'research_foundation',
        name: 'Research Foundation',
        description: 'Personas are clearly based on actual research data and evidence',
        weight: 0.15,
        category: 'methodology'
      },
      {
        id: 'behavioral_focus',
        name: 'Behavioral Focus',
        description: 'Emphasizes behaviors and goals over demographic details',
        weight: 0.1,
        category: 'content'
      }
    ]
  },
  'usability-tests': {
    templateId: 'usability-tests',
    requiredElements: [
      'testing objectives',
      'participant strategy',
      'task scenarios',
      'success metrics',
      'analysis framework',
      'quality assurance',
      'reporting structure'
    ],
    qualityMetrics: [
      ...CORE_QUALITY_METRICS,
      {
        id: 'statistical_rigor',
        name: 'Statistical Rigor',
        description: 'Appropriate sample sizes and statistical considerations',
        weight: 0.15,
        category: 'methodology'
      },
      {
        id: 'task_realism',
        name: 'Task Realism',
        description: 'Tasks reflect realistic user goals and contexts',
        weight: 0.1,
        category: 'content'
      }
    ]
  }
};

/**
 * Prompt Quality Validator Class
 */
export class PromptQualityValidator {
  private industryMetrics: Record<string, QualityMetric[]>;
  private templateCriteria: Record<string, ValidationCriteria>;

  constructor() {
    this.industryMetrics = INDUSTRY_QUALITY_METRICS;
    this.templateCriteria = TEMPLATE_VALIDATION_CRITERIA;
  }

  /**
   * Validate prompt quality comprehensively
   */
  async validatePrompt(
    prompt: string,
    templateId?: string,
    industry?: string,
    context?: Record<string, any>
  ): Promise<QualityValidationResult> {
    const criteria = templateId ? this.templateCriteria[templateId] : null;
    const baseMetrics = criteria?.qualityMetrics || CORE_QUALITY_METRICS;
    const industrySpecificMetrics = industry ? this.industryMetrics[industry] || [] : [];
    const allMetrics = [...baseMetrics, ...industrySpecificMetrics];

    const scores: QualityScore[] = [];

    // Evaluate each metric
    for (const metric of allMetrics) {
      const score = await this.evaluateMetric(prompt, metric, templateId, industry, context);
      scores.push(score);
    }

    // Calculate overall score
    const weightedScore = scores.reduce((sum, score) => {
      const metric = allMetrics.find(m => m.id === score.metricId);
      return sum + (score.score * (metric?.weight || 0.1));
    }, 0);

    const overallScore = Math.round(weightedScore);

    // Categorize quality level
    let category: QualityValidationResult['category'];
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 55) category = 'fair';
    else category = 'poor';

    // Generate summary
    const summary = this.generateSummary(scores, allMetrics, overallScore);

    return {
      overallScore,
      category,
      scores,
      summary,
      validationTimestamp: Date.now(),
      templateId,
      industry
    };
  }

  /**
   * Evaluate a specific quality metric
   */
  private async evaluateMetric(
    prompt: string,
    metric: QualityMetric,
    templateId?: string,
    industry?: string,
    context?: Record<string, any>
  ): Promise<QualityScore> {
    // This would typically use AI or more sophisticated analysis
    // For now, implementing rule-based evaluation
    let score = 50; // Base score
    const feedback: string[] = [];
    const suggestions: string[] = [];

    switch (metric.id) {
      case 'clarity_structure':
        score = this.evaluateStructuralClarity(prompt);
        if (score < 70) {
          suggestions.push('Improve section organization and use clear headers');
          suggestions.push('Add logical flow between different sections');
        }
        break;

      case 'completeness':
        score = this.evaluateCompleteness(prompt, templateId);
        if (score < 70) {
          suggestions.push('Ensure all required sections are present');
          suggestions.push('Add missing methodology or analysis components');
        }
        break;

      case 'actionability':
        score = this.evaluateActionability(prompt);
        if (score < 70) {
          suggestions.push('Add more specific, step-by-step guidance');
          suggestions.push('Include concrete examples and templates');
        }
        break;

      case 'methodology_rigor':
        score = this.evaluateMethodologicalRigor(prompt, templateId);
        if (score < 70) {
          suggestions.push('Reference established UX research methodologies');
          suggestions.push('Include validation and quality assurance measures');
        }
        break;

      case 'accessibility_inclusion':
        score = this.evaluateAccessibilityConsideration(prompt);
        if (score < 70) {
          suggestions.push('Add accessibility considerations and inclusive design practices');
          suggestions.push('Consider diverse user abilities and needs');
        }
        break;

      default:
        // Industry-specific or custom metrics
        score = this.evaluateGenericMetric(prompt, metric, industry);
        if (score < 70) {
          suggestions.push(`Improve ${metric.name.toLowerCase()} considerations`);
        }
        break;
    }

    return {
      metricId: metric.id,
      score: Math.max(0, Math.min(100, score)),
      feedback: feedback.join('. '),
      suggestions
    };
  }

  /**
   * Evaluate structural clarity
   */
  private evaluateStructuralClarity(prompt: string): number {
    let score = 50;
    
    // Check for headers and organization
    const headerCount = (prompt.match(/^#+\s/gm) || []).length;
    score += Math.min(20, headerCount * 5);
    
    // Check for logical sections
    const hasLogicalSections = /(?:objective|method|analysis|result)/gi.test(prompt);
    if (hasLogicalSections) score += 15;
    
    // Check for consistent formatting
    const hasConsistentFormatting = prompt.includes('**') || prompt.includes('*');
    if (hasConsistentFormatting) score += 10;
    
    // Check for numbered lists or structure
    const hasLists = /^\d+\.|^-\s|^\*\s/gm.test(prompt);
    if (hasLists) score += 5;

    return Math.min(100, score);
  }

  /**
   * Evaluate completeness based on template requirements
   */
  private evaluateCompleteness(prompt: string, templateId?: string): number {
    let score = 60;
    
    if (!templateId) return score;
    
    const criteria = this.templateCriteria[templateId];
    if (!criteria) return score;
    
    const requiredElements = criteria.requiredElements;
    const presentElements = requiredElements.filter(element => {
      const regex = new RegExp(element.replace(/\s+/g, '\\s+'), 'gi');
      return regex.test(prompt);
    });
    
    const completionRate = presentElements.length / requiredElements.length;
    score = 20 + (completionRate * 80);
    
    return Math.min(100, score);
  }

  /**
   * Evaluate actionability
   */
  private evaluateActionability(prompt: string): number {
    let score = 40;
    
    // Check for action verbs
    const actionWords = ['create', 'design', 'conduct', 'analyze', 'implement', 'test', 'validate'];
    const actionWordCount = actionWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, actionWordCount * 3);
    
    // Check for specific instructions
    const hasSpecificInstructions = /step-by-step|follow these|instructions|protocol/gi.test(prompt);
    if (hasSpecificInstructions) score += 15;
    
    // Check for examples or templates
    const hasExamples = /example|template|sample|format/gi.test(prompt);
    if (hasExamples) score += 10;
    
    // Check for time estimates or practical guidance
    const hasPracticalGuidance = /minutes|hours|duration|timeline/gi.test(prompt);
    if (hasPracticalGuidance) score += 10;
    
    // Check for tools or resources mentioned
    const hasResources = /tool|resource|material|equipment/gi.test(prompt);
    if (hasResources) score += 5;

    return Math.min(100, score);
  }

  /**
   * Evaluate methodological rigor
   */
  private evaluateMethodologicalRigor(prompt: string, templateId?: string): number {
    let score = 50;
    
    // Check for research methodology references
    const methodologyTerms = ['methodology', 'framework', 'analysis', 'validation', 'research'];
    const methodTermCount = methodologyTerms.filter(term => 
      new RegExp(`\\b${term}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, methodTermCount * 4);
    
    // Check for quality assurance measures
    const hasQualityMeasures = /quality|validation|reliability|validity|bias|saturation/gi.test(prompt);
    if (hasQualityMeasures) score += 15;
    
    // Check for established techniques or frameworks
    const hasEstablishedTechniques = /technique|framework|model|standard|principle/gi.test(prompt);
    if (hasEstablishedTechniques) score += 10;
    
    // Template-specific methodology checks
    if (templateId === 'user-interviews') {
      const hasInterviewTechniques = /funnel|open-ended|5 whys|think-aloud/gi.test(prompt);
      if (hasInterviewTechniques) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Evaluate accessibility consideration
   */
  private evaluateAccessibilityConsideration(prompt: string): number {
    let score = 30;
    
    // Check for accessibility terminology
    const accessibilityTerms = ['accessibility', 'inclusive', 'assistive', 'diverse', 'accommodation'];
    const accessTermCount = accessibilityTerms.filter(term => 
      new RegExp(`\\b${term}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(30, accessTermCount * 6);
    
    // Check for specific accessibility considerations
    const hasSpecificConsiderations = /screen reader|WCAG|disability|impairment|barrier/gi.test(prompt);
    if (hasSpecificConsiderations) score += 20;
    
    // Check for inclusive language
    const hasInclusiveLanguage = /all users|diverse|everyone|various abilities/gi.test(prompt);
    if (hasInclusiveLanguage) score += 10;
    
    // Check for cultural sensitivity
    const hasCulturalConsideration = /cultural|sensitivity|diverse background/gi.test(prompt);
    if (hasCulturalConsideration) score += 10;

    return Math.min(100, score);
  }

  /**
   * Evaluate generic metrics (fallback)
   */
  private evaluateGenericMetric(prompt: string, metric: QualityMetric, industry?: string): number {
    let score = 60;
    
    // Basic content analysis based on metric category
    switch (metric.category) {
      case 'structure':
        score = this.evaluateStructuralClarity(prompt);
        break;
      case 'content':
        score = this.evaluateActionability(prompt);
        break;
      case 'methodology':
        score = this.evaluateMethodologicalRigor(prompt);
        break;
      case 'usability':
        score = this.evaluateAccessibilityConsideration(prompt);
        break;
    }
    
    return score;
  }

  /**
   * Generate quality summary
   */
  private generateSummary(
    scores: QualityScore[],
    metrics: QualityMetric[],
    overallScore: number
  ): QualityValidationResult['summary'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    scores.forEach(score => {
      const metric = metrics.find(m => m.id === score.metricId);
      if (!metric) return;

      if (score.score >= 80) {
        strengths.push(`Strong ${metric.name.toLowerCase()}`);
      } else if (score.score < 50) {
        criticalIssues.push(`Critical issue with ${metric.name.toLowerCase()}`);
        recommendations.push(...score.suggestions);
      } else if (score.score < 70) {
        weaknesses.push(`Needs improvement in ${metric.name.toLowerCase()}`);
        recommendations.push(...score.suggestions.slice(0, 1)); // Limit suggestions
      }
    });

    return {
      strengths: [...new Set(strengths)].slice(0, 5),
      weaknesses: [...new Set(weaknesses)].slice(0, 5),
      criticalIssues: [...new Set(criticalIssues)].slice(0, 3),
      recommendations: [...new Set(recommendations)].slice(0, 8)
    };
  }

  /**
   * Get validation criteria for a template
   */
  getValidationCriteria(templateId: string): ValidationCriteria | null {
    return this.templateCriteria[templateId] || null;
  }

  /**
   * Add custom quality metric
   */
  addCustomMetric(metric: QualityMetric): void {
    // This would be used to extend metrics for specific use cases
  }
}

// Export singleton instance
export const promptQualityValidator = new PromptQualityValidator();