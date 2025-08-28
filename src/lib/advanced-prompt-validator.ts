/**
 * @fileoverview Advanced Prompt Quality Validation System
 * Enhanced validation for sophisticated prompt engineering methods
 */

import { PromptEngineeringMethod, PromptMethodProcessor, promptMethodProcessor } from './prompt-engineering-methods';
import { QualityValidationResult, QualityScore, QualityMetric } from './prompt-quality-validator';

export interface AdvancedValidationCriteria {
  methodSpecific: {
    [method in PromptEngineeringMethod]?: {
      requiredElements: string[];
      qualityMetrics: QualityMetric[];
      scoreWeights: Record<string, number>;
    };
  };
  coherence: {
    weight: number;
    criteria: string[];
  };
  effectiveness: {
    weight: number;
    criteria: string[];
  };
  methodAppropriateness: {
    weight: number;
    criteria: string[];
  };
}

export interface MethodValidationResult extends QualityValidationResult {
  methodSpecific: {
    methodUsed: PromptEngineeringMethod;
    methodAppropriate: boolean;
    methodEffectiveness: number; // 0-100
    coherenceScore: number; // 0-100
    complexityHandling: number; // 0-100
  };
  improvements: {
    methodSuggestions: string[];
    structuralImprovements: string[];
    contentEnhancements: string[];
  };
}

/**
 * Method-specific quality metrics
 */
const METHOD_SPECIFIC_METRICS: AdvancedValidationCriteria['methodSpecific'] = {
  'zero-shot': {
    requiredElements: ['clear task definition', 'context information', 'expected output format'],
    qualityMetrics: [
      {
        id: 'clarity',
        name: 'Task Clarity',
        description: 'Clear and unambiguous task definition',
        weight: 0.3,
        category: 'structure'
      },
      {
        id: 'context_sufficiency',
        name: 'Context Sufficiency',
        description: 'Adequate context for task completion',
        weight: 0.2,
        category: 'content'
      },
      {
        id: 'output_specification',
        name: 'Output Specification',
        description: 'Clear specification of expected output format',
        weight: 0.2,
        category: 'usability'
      }
    ],
    scoreWeights: { clarity: 0.4, context: 0.3, format: 0.3 }
  },

  'few-shot': {
    requiredElements: ['example patterns', 'consistent formatting', 'example variety', 'clear task'],
    qualityMetrics: [
      {
        id: 'example_quality',
        name: 'Example Quality',
        description: 'High-quality, relevant examples that demonstrate the pattern',
        weight: 0.35,
        category: 'content'
      },
      {
        id: 'pattern_consistency',
        name: 'Pattern Consistency',
        description: 'Consistent format and structure across examples',
        weight: 0.25,
        category: 'structure'
      },
      {
        id: 'example_diversity',
        name: 'Example Diversity',
        description: 'Sufficient variety in examples to cover different scenarios',
        weight: 0.2,
        category: 'content'
      }
    ],
    scoreWeights: { examples: 0.5, consistency: 0.3, diversity: 0.2 }
  },

  'chain-of-thought': {
    requiredElements: ['reasoning steps', 'logical progression', 'step validation', 'clear conclusion'],
    qualityMetrics: [
      {
        id: 'reasoning_structure',
        name: 'Reasoning Structure',
        description: 'Clear, logical progression of reasoning steps',
        weight: 0.3,
        category: 'methodology'
      },
      {
        id: 'step_quality',
        name: 'Step Quality',
        description: 'Each reasoning step is clear and contributes to the solution',
        weight: 0.25,
        category: 'content'
      },
      {
        id: 'logical_coherence',
        name: 'Logical Coherence',
        description: 'Steps follow logically and build upon each other',
        weight: 0.25,
        category: 'methodology'
      }
    ],
    scoreWeights: { structure: 0.4, logic: 0.35, clarity: 0.25 }
  },

  'tree-of-thought': {
    requiredElements: ['multiple branches', 'branch evaluation', 'decision criteria', 'final selection'],
    qualityMetrics: [
      {
        id: 'branch_diversity',
        name: 'Branch Diversity',
        description: 'Multiple distinct approaches explored',
        weight: 0.25,
        category: 'methodology'
      },
      {
        id: 'evaluation_rigor',
        name: 'Evaluation Rigor',
        description: 'Systematic evaluation of different approaches',
        weight: 0.3,
        category: 'methodology'
      },
      {
        id: 'decision_justification',
        name: 'Decision Justification',
        description: 'Clear reasoning for final approach selection',
        weight: 0.25,
        category: 'content'
      }
    ],
    scoreWeights: { diversity: 0.3, evaluation: 0.4, justification: 0.3 }
  },

  'role-playing': {
    requiredElements: ['role definition', 'domain expertise', 'perspective consistency', 'authentic voice'],
    qualityMetrics: [
      {
        id: 'role_authenticity',
        name: 'Role Authenticity',
        description: 'Authentic representation of the specified professional role',
        weight: 0.3,
        category: 'content'
      },
      {
        id: 'expertise_demonstration',
        name: 'Expertise Demonstration',
        description: 'Clear demonstration of domain-specific knowledge',
        weight: 0.25,
        category: 'content'
      },
      {
        id: 'perspective_consistency',
        name: 'Perspective Consistency',
        description: 'Consistent perspective throughout the response',
        weight: 0.2,
        category: 'structure'
      }
    ],
    scoreWeights: { authenticity: 0.4, expertise: 0.35, consistency: 0.25 }
  },

  'instruction-tuning': {
    requiredElements: ['precise instructions', 'format requirements', 'constraint specification', 'output criteria'],
    qualityMetrics: [
      {
        id: 'instruction_precision',
        name: 'Instruction Precision',
        description: 'Clear, unambiguous, and detailed instructions',
        weight: 0.35,
        category: 'structure'
      },
      {
        id: 'format_specification',
        name: 'Format Specification',
        description: 'Detailed formatting requirements and constraints',
        weight: 0.25,
        category: 'usability'
      },
      {
        id: 'completeness',
        name: 'Instruction Completeness',
        description: 'All necessary instructions and requirements provided',
        weight: 0.2,
        category: 'content'
      }
    ],
    scoreWeights: { precision: 0.4, format: 0.3, completeness: 0.3 }
  },

  'step-by-step': {
    requiredElements: ['sequential steps', 'clear progression', 'actionable items', 'completion criteria'],
    qualityMetrics: [
      {
        id: 'step_clarity',
        name: 'Step Clarity',
        description: 'Each step is clear and actionable',
        weight: 0.3,
        category: 'usability'
      },
      {
        id: 'logical_sequence',
        name: 'Logical Sequence',
        description: 'Steps follow a logical, executable sequence',
        weight: 0.25,
        category: 'structure'
      },
      {
        id: 'completeness',
        name: 'Process Completeness',
        description: 'All necessary steps included for task completion',
        weight: 0.25,
        category: 'content'
      }
    ],
    scoreWeights: { clarity: 0.4, sequence: 0.35, completeness: 0.25 }
  },

  'socratic': {
    requiredElements: ['guiding questions', 'progressive inquiry', 'discovery process', 'insight generation'],
    qualityMetrics: [
      {
        id: 'question_quality',
        name: 'Question Quality',
        description: 'Questions guide thinking and promote discovery',
        weight: 0.35,
        category: 'methodology'
      },
      {
        id: 'inquiry_progression',
        name: 'Inquiry Progression',
        description: 'Questions build progressively toward insight',
        weight: 0.25,
        category: 'structure'
      },
      {
        id: 'discovery_facilitation',
        name: 'Discovery Facilitation',
        description: 'Process facilitates genuine discovery and understanding',
        weight: 0.2,
        category: 'content'
      }
    ],
    scoreWeights: { questions: 0.4, progression: 0.3, discovery: 0.3 }
  },

  'multi-perspective': {
    requiredElements: ['multiple viewpoints', 'stakeholder analysis', 'perspective integration', 'balanced synthesis'],
    qualityMetrics: [
      {
        id: 'perspective_completeness',
        name: 'Perspective Completeness',
        description: 'All relevant perspectives adequately represented',
        weight: 0.3,
        category: 'content'
      },
      {
        id: 'viewpoint_accuracy',
        name: 'Viewpoint Accuracy',
        description: 'Each perspective authentically represented',
        weight: 0.25,
        category: 'content'
      },
      {
        id: 'synthesis_quality',
        name: 'Synthesis Quality',
        description: 'Effective integration of different perspectives',
        weight: 0.25,
        category: 'methodology'
      }
    ],
    scoreWeights: { completeness: 0.35, accuracy: 0.35, synthesis: 0.3 }
  },

  'retrieval-augmented': {
    requiredElements: ['knowledge integration', 'source citation', 'synthesis quality', 'accuracy verification'],
    qualityMetrics: [
      {
        id: 'knowledge_integration',
        name: 'Knowledge Integration',
        description: 'Effective integration of retrieved knowledge with generated content',
        weight: 0.3,
        category: 'content'
      },
      {
        id: 'source_accuracy',
        name: 'Source Accuracy',
        description: 'Accurate representation and citation of source material',
        weight: 0.25,
        category: 'content'
      },
      {
        id: 'synthesis_coherence',
        name: 'Synthesis Coherence',
        description: 'Coherent synthesis of multiple knowledge sources',
        weight: 0.25,
        category: 'methodology'
      }
    ],
    scoreWeights: { integration: 0.4, accuracy: 0.35, coherence: 0.25 }
  }
};

/**
 * Advanced Prompt Quality Validator
 */
export class AdvancedPromptValidator {
  private methodProcessor: PromptMethodProcessor;
  private criteria: AdvancedValidationCriteria;

  constructor() {
    this.methodProcessor = promptMethodProcessor;
    this.criteria = {
      methodSpecific: METHOD_SPECIFIC_METRICS,
      coherence: {
        weight: 0.25,
        criteria: ['logical flow', 'internal consistency', 'clear connections']
      },
      effectiveness: {
        weight: 0.3,
        criteria: ['achieves stated goals', 'actionable outputs', 'practical value']
      },
      methodAppropriateness: {
        weight: 0.2,
        criteria: ['method fits task complexity', 'method suits context', 'optimal method selection']
      }
    };
  }

  /**
   * Validate prompt with advanced method-specific analysis
   */
  async validateAdvancedPrompt(
    prompt: string,
    method: PromptEngineeringMethod,
    context?: {
      taskComplexity?: 'simple' | 'moderate' | 'complex';
      domainSpecific?: boolean;
      expectedOutputType?: string;
      targetAudience?: string;
    }
  ): Promise<MethodValidationResult> {
    // Get method-specific validation criteria
    const methodCriteria = this.criteria.methodSpecific[method];
    if (!methodCriteria) {
      throw new Error(`No validation criteria found for method: ${method}`);
    }

    // Perform basic structural analysis
    const structuralAnalysis = this.analyzePromptStructure(prompt, method);
    
    // Evaluate method-specific quality
    const methodSpecificScores = await this.evaluateMethodSpecificQuality(
      prompt, 
      method, 
      methodCriteria
    );
    
    // Assess method appropriateness
    const appropriatenessScore = this.assessMethodAppropriateness(
      method,
      context
    );

    // Calculate coherence score
    const coherenceScore = this.calculateCoherenceScore(prompt, method);

    // Calculate effectiveness score
    const effectivenessScore = this.calculateEffectivenessScore(prompt, method, context);

    // Calculate overall score
    const overallScore = this.calculateOverallAdvancedScore({
      methodSpecific: methodSpecificScores,
      coherence: coherenceScore,
      effectiveness: effectivenessScore,
      appropriateness: appropriatenessScore
    });

    // Generate improvement suggestions
    const improvements = this.generateImprovementSuggestions(
      prompt,
      method,
      methodSpecificScores,
      coherenceScore,
      effectivenessScore,
      appropriatenessScore
    );

    // Determine quality category
    let category: MethodValidationResult['category'];
    if (overallScore >= 85) category = 'excellent';
    else if (overallScore >= 70) category = 'good';
    else if (overallScore >= 55) category = 'fair';
    else category = 'poor';

    return {
      overallScore,
      category,
      scores: methodSpecificScores,
      summary: {
        strengths: this.identifyStrengths(methodSpecificScores, coherenceScore, effectivenessScore),
        weaknesses: this.identifyWeaknesses(methodSpecificScores, coherenceScore, effectivenessScore),
        criticalIssues: this.identifyCriticalIssues(methodSpecificScores, appropriatenessScore),
        recommendations: improvements.methodSuggestions.concat(improvements.structuralImprovements).slice(0, 6)
      },
      methodSpecific: {
        methodUsed: method,
        methodAppropriate: appropriatenessScore >= 70,
        methodEffectiveness: Math.round(methodSpecificScores.reduce((sum, score) => sum + score.score, 0) / methodSpecificScores.length),
        coherenceScore: Math.round(coherenceScore),
        complexityHandling: this.assessComplexityHandling(prompt, method, context?.taskComplexity)
      },
      improvements,
      validationTimestamp: Date.now()
    };
  }

  /**
   * Recommend optimal method for given context
   */
  recommendOptimalMethod(
    task: string,
    context: {
      complexity: 'simple' | 'moderate' | 'complex';
      requiresExamples: boolean;
      needsMultiplePerspectives: boolean;
      domainExpertise: boolean;
      stepByStepNeeded: boolean;
      hasKnowledgeBase: boolean;
    }
  ): {
    primaryRecommendation: PromptEngineeringMethod;
    alternatives: PromptEngineeringMethod[];
    reasoning: string;
  } {
    const scores: { method: PromptEngineeringMethod; score: number; reasons: string[] }[] = [];

    // Score each method based on context
    Object.keys(this.criteria.methodSpecific).forEach(methodKey => {
      const method = methodKey as PromptEngineeringMethod;
      const methodConfig = this.methodProcessor.getMethodConfig(method);
      if (!methodConfig) return;

      let score = 50; // Base score
      const reasons: string[] = [];

      // Complexity matching
      if (context.complexity === 'simple' && methodConfig.complexity === 'basic') {
        score += 20;
        reasons.push('Matches simple task complexity');
      } else if (context.complexity === 'moderate' && methodConfig.complexity === 'intermediate') {
        score += 15;
        reasons.push('Matches moderate task complexity');
      } else if (context.complexity === 'complex' && methodConfig.complexity === 'advanced') {
        score += 15;
        reasons.push('Handles complex task requirements');
      }

      // Specific feature requirements
      if (context.requiresExamples && ['few-shot', 'instruction-tuning'].includes(method)) {
        score += 15;
        reasons.push('Provides example-based learning');
      }

      if (context.needsMultiplePerspectives && method === 'multi-perspective') {
        score += 20;
        reasons.push('Handles multiple stakeholder viewpoints');
      }

      if (context.domainExpertise && method === 'role-playing') {
        score += 15;
        reasons.push('Leverages domain-specific expertise');
      }

      if (context.stepByStepNeeded && ['step-by-step', 'chain-of-thought'].includes(method)) {
        score += 15;
        reasons.push('Provides structured step-by-step guidance');
      }

      if (context.hasKnowledgeBase && method === 'retrieval-augmented') {
        score += 20;
        reasons.push('Effectively utilizes available knowledge base');
      }

      // Penalize mismatched complexity
      if (context.complexity === 'simple' && methodConfig.complexity === 'advanced') {
        score -= 15;
        reasons.push('May be overly complex for simple tasks');
      }

      scores.push({ method, score: Math.max(0, Math.min(100, score)), reasons });
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    const primary = scores[0];
    const alternatives = scores.slice(1, 4).map(s => s.method);

    return {
      primaryRecommendation: primary.method,
      alternatives,
      reasoning: `Recommended ${primary.method} (score: ${primary.score}) because: ${primary.reasons.join(', ')}.`
    };
  }

  /**
   * Compare multiple methods for effectiveness
   */
  compareMethodsForTask(
    task: string,
    methods: PromptEngineeringMethod[],
    context?: Record<string, any>
  ): {
    method: PromptEngineeringMethod;
    effectiveness: number;
    pros: string[];
    cons: string[];
  }[] {
    return methods.map(method => {
      const config = this.methodProcessor.getMethodConfig(method);
      if (!config) {
        return {
          method,
          effectiveness: 0,
          pros: [],
          cons: ['Method configuration not found']
        };
      }

      // Calculate effectiveness based on method characteristics and task context
      let effectiveness = 60; // Base effectiveness

      // Analyze pros and cons
      const pros: string[] = [...config.bestFor];
      const cons: string[] = [];

      // Adjust effectiveness based on context
      if (context) {
        if (context.complexity === 'complex' && config.complexity === 'advanced') {
          effectiveness += 15;
          pros.push('Handles complex reasoning well');
        } else if (context.complexity === 'simple' && config.complexity === 'basic') {
          effectiveness += 10;
          pros.push('Efficient for simple tasks');
        } else if (context.complexity === 'simple' && config.complexity === 'advanced') {
          effectiveness -= 10;
          cons.push('May be unnecessarily complex');
        }

        if (context.needsExamples && method === 'few-shot') {
          effectiveness += 15;
          pros.push('Excels with example-based learning');
        }

        if (context.needsReasoning && ['chain-of-thought', 'tree-of-thought'].includes(method)) {
          effectiveness += 12;
          pros.push('Provides transparent reasoning process');
        }
      }

      return {
        method,
        effectiveness: Math.max(0, Math.min(100, effectiveness)),
        pros,
        cons
      };
    }).sort((a, b) => b.effectiveness - a.effectiveness);
  }

  // Private helper methods

  private analyzePromptStructure(prompt: string, method: PromptEngineeringMethod): {
    hasRequiredElements: boolean;
    missingElements: string[];
    structureScore: number;
  } {
    const methodCriteria = this.criteria.methodSpecific[method];
    if (!methodCriteria) {
      return { hasRequiredElements: false, missingElements: [], structureScore: 0 };
    }

    const missingElements: string[] = [];
    const requiredElements = methodCriteria.requiredElements;

    requiredElements.forEach(element => {
      // Simple keyword-based checking (in a real implementation, this would be more sophisticated)
      const keywords = element.toLowerCase().split(' ');
      const hasElement = keywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );

      if (!hasElement) {
        missingElements.push(element);
      }
    });

    const structureScore = Math.max(0, 100 - (missingElements.length / requiredElements.length) * 100);

    return {
      hasRequiredElements: missingElements.length === 0,
      missingElements,
      structureScore
    };
  }

  private async evaluateMethodSpecificQuality(
    prompt: string,
    method: PromptEngineeringMethod,
    criteria: NonNullable<AdvancedValidationCriteria['methodSpecific'][PromptEngineeringMethod]>
  ): Promise<QualityScore[]> {
    const scores: QualityScore[] = [];

    for (const metric of criteria.qualityMetrics) {
      const score = await this.evaluateSpecificMetric(prompt, method, metric);
      scores.push({
        metricId: metric.id,
        score,
        feedback: this.generateMetricFeedback(metric, score),
        suggestions: this.generateMetricSuggestions(metric, score)
      });
    }

    return scores;
  }

  private async evaluateSpecificMetric(
    prompt: string,
    method: PromptEngineeringMethod,
    metric: QualityMetric
  ): Promise<number> {
    // This is a simplified version - in production, this would use more sophisticated analysis
    let score = 50; // Base score

    switch (metric.id) {
      case 'clarity':
      case 'task_clarity':
        score = this.assessClarity(prompt);
        break;
      case 'example_quality':
        score = this.assessExampleQuality(prompt);
        break;
      case 'reasoning_structure':
        score = this.assessReasoningStructure(prompt);
        break;
      case 'role_authenticity':
        score = this.assessRoleAuthenticity(prompt);
        break;
      case 'instruction_precision':
        score = this.assessInstructionPrecision(prompt);
        break;
      case 'step_clarity':
        score = this.assessStepClarity(prompt);
        break;
      case 'question_quality':
        score = this.assessQuestionQuality(prompt);
        break;
      case 'perspective_completeness':
        score = this.assessPerspectiveCompleteness(prompt);
        break;
      case 'knowledge_integration':
        score = this.assessKnowledgeIntegration(prompt);
        break;
      default:
        score = this.assessGenericQuality(prompt, metric);
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessClarity(prompt: string): number {
    let score = 50;
    
    // Check for clear task definition
    if (/task:|objective:|goal:/gi.test(prompt)) score += 15;
    
    // Check for structured format
    if (prompt.includes('##') || prompt.includes('**')) score += 10;
    
    // Check for specific language
    const specificWords = ['specifically', 'exactly', 'precisely', 'clearly', 'must', 'should'];
    const specificCount = specificWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(15, specificCount * 3);

    return score;
  }

  private assessExampleQuality(prompt: string): number {
    let score = 30;
    
    // Check for examples
    const exampleCount = (prompt.match(/example\s+\d+:|example:|input:|output:/gi) || []).length;
    score += Math.min(30, exampleCount * 10);
    
    // Check for consistent formatting
    if (prompt.includes('Input:') && prompt.includes('Output:')) score += 20;
    
    // Check for variety indicators
    if (prompt.includes('different') || prompt.includes('various') || prompt.includes('multiple')) score += 10;

    return score;
  }

  private assessReasoningStructure(prompt: string): number {
    let score = 40;
    
    // Check for step indicators
    const stepCount = (prompt.match(/step\s+\d+|first|second|third|then|next|finally/gi) || []).length;
    score += Math.min(25, stepCount * 3);
    
    // Check for logical connectors
    const logicalWords = ['because', 'therefore', 'consequently', 'as a result', 'leads to'];
    const logicalCount = logicalWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, logicalCount * 5);
    
    // Check for analysis structure
    if (prompt.includes('analyze') || prompt.includes('examine') || prompt.includes('consider')) score += 15;

    return score;
  }

  private assessRoleAuthenticity(prompt: string): number {
    let score = 45;
    
    // Check for role definition
    if (/I am a|as a|from my experience|in my role/gi.test(prompt)) score += 20;
    
    // Check for domain-specific terminology
    const domainTerms = ['methodology', 'framework', 'best practices', 'industry standards', 'expertise'];
    const termCount = domainTerms.filter(term => 
      new RegExp(`\\b${term}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(25, termCount * 5);
    
    // Check for professional perspective
    if (/professional|expert|practitioner|specialist/gi.test(prompt)) score += 10;

    return score;
  }

  private assessInstructionPrecision(prompt: string): number {
    let score = 40;
    
    // Check for specific instructions
    const instructionWords = ['must', 'should', 'ensure', 'include', 'follow', 'use', 'avoid'];
    const instructionCount = instructionWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(25, instructionCount * 3);
    
    // Check for format requirements
    if (/format|structure|organize|arrange|present/gi.test(prompt)) score += 15;
    
    // Check for constraints
    if (prompt.includes('constraints') || prompt.includes('limitations') || prompt.includes('requirements')) score += 10;
    
    // Check for measurable criteria
    if (/\d+|maximum|minimum|at least|no more than/g.test(prompt)) score += 10;

    return score;
  }

  private assessStepClarity(prompt: string): number {
    let score = 35;
    
    // Check for numbered steps
    const numberedSteps = (prompt.match(/\d+\./g) || []).length;
    score += Math.min(30, numberedSteps * 5);
    
    // Check for action verbs
    const actionVerbs = ['create', 'analyze', 'develop', 'implement', 'design', 'conduct', 'evaluate'];
    const verbCount = actionVerbs.filter(verb => 
      new RegExp(`\\b${verb}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, verbCount * 3);
    
    // Check for sequential indicators
    if (/first|then|next|after|finally|subsequently/gi.test(prompt)) score += 15;

    return score;
  }

  private assessQuestionQuality(prompt: string): number {
    let score = 40;
    
    // Count questions
    const questionCount = (prompt.match(/\?/g) || []).length;
    score += Math.min(25, questionCount * 3);
    
    // Check for open-ended questions
    const openEnded = ['what', 'how', 'why', 'when', 'where', 'which'];
    const openCount = openEnded.filter(word => 
      new RegExp(`\\b${word}\\b.*\\?`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, openCount * 4);
    
    // Check for progressive questioning
    if (/deeper|further|more specific|elaborate/gi.test(prompt)) score += 15;

    return score;
  }

  private assessPerspectiveCompleteness(prompt: string): number {
    let score = 30;
    
    // Check for perspective indicators
    const perspectives = ['user', 'business', 'technical', 'stakeholder', 'customer', 'team', 'management'];
    const perspectiveCount = perspectives.filter(perspective => 
      new RegExp(`\\b${perspective}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(35, perspectiveCount * 7);
    
    // Check for viewpoint language
    if (/perspective|viewpoint|from the standpoint|from.*point of view/gi.test(prompt)) score += 20;
    
    // Check for synthesis language
    if (/integrate|combine|balance|consider all/gi.test(prompt)) score += 15;

    return score;
  }

  private assessKnowledgeIntegration(prompt: string): number {
    let score = 35;
    
    // Check for knowledge references
    if (/based on|according to|research shows|evidence suggests|studies indicate/gi.test(prompt)) score += 20;
    
    // Check for source integration
    if (/combine|synthesize|integrate|draw from|leverage/gi.test(prompt)) score += 15;
    
    // Check for context utilization
    if (/available.*knowledge|provided.*information|given.*context/gi.test(prompt)) score += 15;
    
    // Check for accuracy emphasis
    if (/accurate|verify|validate|confirm|evidence/gi.test(prompt)) score += 15;

    return score;
  }

  private assessGenericQuality(prompt: string, metric: QualityMetric): number {
    // Fallback assessment based on metric category
    let score = 50;
    
    switch (metric.category) {
      case 'structure':
        score = this.assessClarity(prompt);
        break;
      case 'content':
        // Check for content richness
        if (prompt.length > 500) score += 10;
        if (prompt.includes('specific') || prompt.includes('detailed')) score += 10;
        break;
      case 'methodology':
        score = this.assessReasoningStructure(prompt);
        break;
      case 'usability':
        score = this.assessStepClarity(prompt);
        break;
    }
    
    return score;
  }

  private assessMethodAppropriateness(
    method: PromptEngineeringMethod,
    context?: Record<string, any>
  ): number {
    let score = 70; // Default appropriateness

    if (!context) return score;

    const methodConfig = this.methodProcessor.getMethodConfig(method);
    if (!methodConfig) return score;

    // Task complexity matching
    if (context.taskComplexity) {
      if (context.taskComplexity === 'simple' && methodConfig.complexity === 'basic') {
        score += 15;
      } else if (context.taskComplexity === 'moderate' && methodConfig.complexity === 'intermediate') {
        score += 10;
      } else if (context.taskComplexity === 'complex' && methodConfig.complexity === 'advanced') {
        score += 10;
      } else if (context.taskComplexity === 'simple' && methodConfig.complexity === 'advanced') {
        score -= 20; // Overkill for simple tasks
      }
    }

    // Domain-specific requirements
    if (context.domainSpecific && method === 'role-playing') {
      score += 15;
    }

    // Output type matching
    if (context.expectedOutputType === 'structured' && 
        ['instruction-tuning', 'step-by-step'].includes(method)) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateCoherenceScore(prompt: string, method: PromptEngineeringMethod): number {
    let score = 60; // Base coherence

    // Check for logical flow
    const flowIndicators = ['first', 'then', 'next', 'finally', 'therefore', 'consequently'];
    const flowCount = flowIndicators.filter(indicator => 
      new RegExp(`\\b${indicator}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, flowCount * 3);

    // Check for consistent terminology
    const sentences = prompt.split(/[.!?]+/);
    if (sentences.length > 3) {
      // Simple consistency check - in practice, this would be more sophisticated
      score += 10;
    }

    // Check for clear connections
    if (/because|since|due to|as a result|leads to/gi.test(prompt)) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateEffectivenessScore(
    prompt: string,
    method: PromptEngineeringMethod,
    context?: Record<string, any>
  ): number {
    let score = 55; // Base effectiveness

    // Check for actionable elements
    const actionWords = ['create', 'develop', 'analyze', 'implement', 'design', 'conduct'];
    const actionCount = actionWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'gi').test(prompt)
    ).length;
    score += Math.min(20, actionCount * 4);

    // Check for specific outcomes
    if (/result|outcome|deliverable|output|produce/gi.test(prompt)) {
      score += 15;
    }

    // Check for practical value
    if (/practical|applicable|usable|implementable/gi.test(prompt)) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessComplexityHandling(
    prompt: string,
    method: PromptEngineeringMethod,
    complexity?: 'simple' | 'moderate' | 'complex'
  ): number {
    const methodConfig = this.methodProcessor.getMethodConfig(method);
    if (!methodConfig) return 50;

    let score = 60;

    // Match complexity appropriately
    if (complexity && methodConfig.complexity) {
      const complexityMap = { simple: 'basic', moderate: 'intermediate', complex: 'advanced' };
      if (complexityMap[complexity] === methodConfig.complexity) {
        score += 25;
      } else if (complexity === 'simple' && methodConfig.complexity === 'advanced') {
        score -= 15; // Overkill
      } else if (complexity === 'complex' && methodConfig.complexity === 'basic') {
        score -= 20; // Insufficient
      }
    }

    // Check for complexity-handling elements
    if (complexity === 'complex') {
      if (['chain-of-thought', 'tree-of-thought', 'multi-perspective'].includes(method)) {
        score += 15;
      }
      if (prompt.includes('step') || prompt.includes('approach') || prompt.includes('analysis')) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallAdvancedScore(components: {
    methodSpecific: QualityScore[];
    coherence: number;
    effectiveness: number;
    appropriateness: number;
  }): number {
    const methodAvg = components.methodSpecific.reduce((sum, score) => sum + score.score, 0) / 
                     components.methodSpecific.length;

    const weights = {
      methodSpecific: 0.4,
      coherence: 0.2,
      effectiveness: 0.25,
      appropriateness: 0.15
    };

    return Math.round(
      methodAvg * weights.methodSpecific +
      components.coherence * weights.coherence +
      components.effectiveness * weights.effectiveness +
      components.appropriateness * weights.appropriateness
    );
  }

  private generateImprovementSuggestions(
    prompt: string,
    method: PromptEngineeringMethod,
    methodScores: QualityScore[],
    coherence: number,
    effectiveness: number,
    appropriateness: number
  ): MethodValidationResult['improvements'] {
    const methodSuggestions: string[] = [];
    const structuralImprovements: string[] = [];
    const contentEnhancements: string[] = [];

    // Method-specific suggestions
    const lowScores = methodScores.filter(score => score.score < 70);
    lowScores.forEach(score => {
      methodSuggestions.push(...score.suggestions);
    });

    // Coherence improvements
    if (coherence < 70) {
      structuralImprovements.push('Improve logical flow with better transition phrases');
      structuralImprovements.push('Add clear connections between different sections');
    }

    // Effectiveness improvements
    if (effectiveness < 70) {
      contentEnhancements.push('Include more specific, actionable guidance');
      contentEnhancements.push('Clarify expected outcomes and deliverables');
    }

    // Appropriateness suggestions
    if (appropriateness < 70) {
      methodSuggestions.push(`Consider using a different method more suited to this task complexity`);
    }

    return {
      methodSuggestions: [...new Set(methodSuggestions)].slice(0, 5),
      structuralImprovements: [...new Set(structuralImprovements)].slice(0, 4),
      contentEnhancements: [...new Set(contentEnhancements)].slice(0, 4)
    };
  }

  private generateMetricFeedback(metric: QualityMetric, score: number): string {
    if (score >= 80) {
      return `Excellent ${metric.name.toLowerCase()} - meets high quality standards`;
    } else if (score >= 70) {
      return `Good ${metric.name.toLowerCase()} - minor improvements possible`;
    } else if (score >= 55) {
      return `Adequate ${metric.name.toLowerCase()} - several areas for improvement`;
    } else {
      return `Poor ${metric.name.toLowerCase()} - significant improvements needed`;
    }
  }

  private generateMetricSuggestions(metric: QualityMetric, score: number): string[] {
    if (score >= 80) return ['Maintain current high quality'];

    const suggestions: string[] = [];
    
    switch (metric.id) {
      case 'clarity':
        suggestions.push('Use more specific and unambiguous language');
        suggestions.push('Add clear section headers and structure');
        break;
      case 'example_quality':
        suggestions.push('Provide more diverse and realistic examples');
        suggestions.push('Ensure examples follow consistent format');
        break;
      case 'reasoning_structure':
        suggestions.push('Add explicit reasoning steps');
        suggestions.push('Use logical connectors between ideas');
        break;
      default:
        suggestions.push(`Improve ${metric.name.toLowerCase()} based on methodology requirements`);
    }

    return suggestions;
  }

  private identifyStrengths(
    methodScores: QualityScore[],
    coherence: number,
    effectiveness: number
  ): string[] {
    const strengths: string[] = [];
    
    methodScores.forEach(score => {
      if (score.score >= 80) {
        strengths.push(`Strong ${score.metricId.replace('_', ' ')}`);
      }
    });

    if (coherence >= 80) strengths.push('Excellent logical coherence');
    if (effectiveness >= 80) strengths.push('Highly effective approach');

    return strengths.slice(0, 5);
  }

  private identifyWeaknesses(
    methodScores: QualityScore[],
    coherence: number,
    effectiveness: number
  ): string[] {
    const weaknesses: string[] = [];
    
    methodScores.forEach(score => {
      if (score.score < 60) {
        weaknesses.push(`Weak ${score.metricId.replace('_', ' ')}`);
      }
    });

    if (coherence < 60) weaknesses.push('Poor logical coherence');
    if (effectiveness < 60) weaknesses.push('Low effectiveness');

    return weaknesses.slice(0, 5);
  }

  private identifyCriticalIssues(
    methodScores: QualityScore[],
    appropriateness: number
  ): string[] {
    const critical: string[] = [];
    
    methodScores.forEach(score => {
      if (score.score < 40) {
        critical.push(`Critical issue with ${score.metricId.replace('_', ' ')}`);
      }
    });

    if (appropriateness < 50) {
      critical.push('Method may not be appropriate for this task');
    }

    return critical.slice(0, 3);
  }
}

// Export singleton instance
export const advancedPromptValidator = new AdvancedPromptValidator();