/**
 * @fileoverview Enhanced Variable Handler
 * Intelligent variable processing with context-aware suggestions, validation, and template processing
 */

import { KnowledgeEntry } from '@/stores/knowledge-store';
import { GeneratedPrompt } from '@/stores/prompt-store';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { EnhancedToolPromptTemplate, PromptVariable } from '@/lib/tool-templates-enhanced';

export interface VariableContext {
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  projectContext: {
    domain: string;
    targetAudience: string[];
    constraints: string[];
    goals: string[];
  };
  knowledgeBase: KnowledgeEntry[];
  previousOutputs: GeneratedPrompt[];
  userPreferences: {
    accessibilityLevel: 'basic' | 'enhanced' | 'comprehensive';
    outputDetailLevel: 'brief' | 'moderate' | 'comprehensive';
    includeExamples: boolean;
  };
}

export interface EnhancedVariable extends PromptVariable {
  contextualSuggestions: string[];
  smartDefaults: {
    value: any;
    confidence: number; // 0-1 confidence score
    rationale: string;
  };
  validationRules: VariableValidationRule[];
  dependencies: VariableDependency[];
  accessibility: {
    label: string;
    description: string;
    requirements: string[];
    examples: string[];
  };
  knowledgeConnections: KnowledgeConnection[];
}

export interface VariableValidationRule {
  id: string;
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom' | 'accessibility';
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context: string;
}

export interface VariableDependency {
  dependsOn: string; // Variable ID
  condition: string; // Condition expression
  effect: 'required' | 'optional' | 'hidden' | 'readonly';
  message?: string;
}

export interface KnowledgeConnection {
  knowledgeEntryId: string;
  relevanceScore: number;
  extractedValue: string;
  confidence: number;
  context: string;
}

export interface VariableValidationResult {
  variableId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  accessibilityIssues: AccessibilityIssue[];
}

export interface ValidationError {
  ruleId: string;
  message: string;
  severity: 'error';
  suggestion?: string;
}

export interface ValidationWarning {
  ruleId: string;
  message: string;
  severity: 'warning';
  suggestion?: string;
}

export interface AccessibilityIssue {
  type: 'missing_label' | 'unclear_description' | 'missing_example' | 'insufficient_guidance';
  message: string;
  recommendation: string;
}

export interface ProcessedTemplate {
  originalTemplate: string;
  processedTemplate: string;
  variableMappings: Map<string, any>;
  unresolvedVariables: string[];
  contextualEnhancements: string[];
  accessibilityEnhancements: string[];
  qualityScore: {
    completeness: number; // 0-1
    clarity: number; // 0-1
    accessibility: number; // 0-1
    overall: number; // 0-1
  };
}

/**
 * Enhanced Variable Handler for intelligent variable processing
 */
export class EnhancedVariableHandler {
  private variableCache: Map<string, EnhancedVariable> = new Map();
  private suggestionCache: Map<string, string[]> = new Map();

  constructor() {
    this.initializeHandler();
  }

  private initializeHandler(): void {
    console.log('Enhanced Variable Handler initialized');
  }

  /**
   * Enhance variables with context-aware processing
   */
  async enhanceVariables(
    baseVariables: PromptVariable[],
    context: VariableContext
  ): Promise<EnhancedVariable[]> {
    const enhancedVariables: EnhancedVariable[] = [];

    for (const variable of baseVariables) {
      const cacheKey = this.generateCacheKey(variable, context);
      
      // Check cache first
      if (this.variableCache.has(cacheKey)) {
        enhancedVariables.push(this.variableCache.get(cacheKey)!);
        continue;
      }

      const enhanced = await this.enhanceSingleVariable(variable, context);
      
      // Cache the result
      this.variableCache.set(cacheKey, enhanced);
      enhancedVariables.push(enhanced);
    }

    return enhancedVariables;
  }

  /**
   * Generate contextual suggestions for a variable
   */
  async generateContextualSuggestions(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<string[]> {
    const cacheKey = `suggestions_${variable.id}_${context.framework.id}_${context.stage.id}`;
    
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey)!;
    }

    const suggestions: string[] = [];

    // Knowledge-based suggestions
    const knowledgeSuggestions = await this.extractKnowledgeBasedSuggestions(variable, context);
    suggestions.push(...knowledgeSuggestions);

    // Previous output suggestions
    const outputSuggestions = await this.extractOutputBasedSuggestions(variable, context);
    suggestions.push(...outputSuggestions);

    // Context-based suggestions
    const contextSuggestions = await this.generateContextBasedSuggestions(variable, context);
    suggestions.push(...contextSuggestions);

    // Accessibility suggestions
    const accessibilitySuggestions = await this.generateAccessibilitySuggestions(variable, context);
    suggestions.push(...accessibilitySuggestions);

    // Remove duplicates and limit
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);
    
    this.suggestionCache.set(cacheKey, uniqueSuggestions);
    return uniqueSuggestions;
  }

  /**
   * Validate variables with enhanced rules
   */
  async validateVariables(
    variables: Record<string, any>,
    enhancedVariables: EnhancedVariable[],
    context: VariableContext
  ): Promise<Map<string, VariableValidationResult>> {
    const results = new Map<string, VariableValidationResult>();

    for (const enhancedVar of enhancedVariables) {
      const value = variables[enhancedVar.id];
      const result = await this.validateSingleVariable(enhancedVar, value, variables, context);
      results.set(enhancedVar.id, result);
    }

    return results;
  }

  /**
   * Process template with enhanced variable handling
   */
  async processTemplate(
    template: string,
    variables: Record<string, any>,
    enhancedVariables: EnhancedVariable[],
    context: VariableContext
  ): Promise<ProcessedTemplate> {
    const variableMappings = new Map<string, any>();
    const unresolvedVariables: string[] = [];
    const contextualEnhancements: string[] = [];
    const accessibilityEnhancements: string[] = [];

    let processedTemplate = template;

    // Process each variable
    for (const enhancedVar of enhancedVariables) {
      const variableName = enhancedVar.id;
      const value = variables[variableName];

      if (value !== undefined && value !== null && value !== '') {
        // Process the value
        const processedValue = await this.processVariableValue(
          value,
          enhancedVar,
          context
        );

        // Replace in template
        const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
        processedTemplate = processedTemplate.replace(regex, processedValue);
        variableMappings.set(variableName, processedValue);

        // Add contextual enhancements
        if (enhancedVar.contextualSuggestions.length > 0) {
          contextualEnhancements.push(
            `${enhancedVar.name}: Consider ${enhancedVar.contextualSuggestions[0]}`
          );
        }

        // Add accessibility enhancements
        if (enhancedVar.accessibility.requirements.length > 0) {
          accessibilityEnhancements.push(
            `${enhancedVar.name}: ${enhancedVar.accessibility.requirements[0]}`
          );
        }
      } else {
        // Check if variable is required
        if (enhancedVar.required) {
          unresolvedVariables.push(variableName);
        } else if (enhancedVar.smartDefaults.confidence > 0.7) {
          // Use smart default
          const defaultValue = enhancedVar.smartDefaults.value;
          const regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
          processedTemplate = processedTemplate.replace(regex, defaultValue);
          variableMappings.set(variableName, defaultValue);
          contextualEnhancements.push(
            `${enhancedVar.name}: Used smart default - ${enhancedVar.smartDefaults.rationale}`
          );
        } else {
          unresolvedVariables.push(variableName);
        }
      }
    }

    // Calculate quality scores
    const qualityScore = this.calculateQualityScore(
      template,
      processedTemplate,
      variableMappings,
      unresolvedVariables,
      accessibilityEnhancements
    );

    return {
      originalTemplate: template,
      processedTemplate,
      variableMappings,
      unresolvedVariables,
      contextualEnhancements,
      accessibilityEnhancements,
      qualityScore
    };
  }

  /**
   * Get smart defaults for variables
   */
  async generateSmartDefaults(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<{ value: any; confidence: number; rationale: string }> {
    let defaultValue: any = '';
    let confidence = 0;
    let rationale = 'No context available for smart default';

    // Extract from knowledge base
    const knowledgeDefault = await this.extractKnowledgeDefault(variable, context);
    if (knowledgeDefault.confidence > confidence) {
      defaultValue = knowledgeDefault.value;
      confidence = knowledgeDefault.confidence;
      rationale = knowledgeDefault.rationale;
    }

    // Extract from previous outputs
    const outputDefault = await this.extractOutputDefault(variable, context);
    if (outputDefault.confidence > confidence) {
      defaultValue = outputDefault.value;
      confidence = outputDefault.confidence;
      rationale = outputDefault.rationale;
    }

    // Extract from project context
    const projectDefault = await this.extractProjectDefault(variable, context);
    if (projectDefault.confidence > confidence) {
      defaultValue = projectDefault.value;
      confidence = projectDefault.confidence;
      rationale = projectDefault.rationale;
    }

    // Framework-specific defaults
    const frameworkDefault = await this.extractFrameworkDefault(variable, context);
    if (frameworkDefault.confidence > confidence) {
      defaultValue = frameworkDefault.value;
      confidence = frameworkDefault.confidence;
      rationale = frameworkDefault.rationale;
    }

    return { value: defaultValue, confidence, rationale };
  }

  // Private helper methods

  private async enhanceSingleVariable(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<EnhancedVariable> {
    const contextualSuggestions = await this.generateContextualSuggestions(variable, context);
    const smartDefaults = await this.generateSmartDefaults(variable, context);
    const validationRules = await this.generateValidationRules(variable, context);
    const dependencies = await this.generateDependencies(variable, context);
    const accessibility = await this.generateAccessibilityInfo(variable, context);
    const knowledgeConnections = await this.generateKnowledgeConnections(variable, context);

    return {
      ...variable,
      contextualSuggestions,
      smartDefaults,
      validationRules,
      dependencies,
      accessibility,
      knowledgeConnections
    };
  }

  private async extractKnowledgeBasedSuggestions(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    for (const entry of context.knowledgeBase) {
      const content = entry.content.toLowerCase();
      const variableName = variable.name.toLowerCase();

      // Look for content related to this variable
      if (content.includes(variableName) || 
          variable.description.toLowerCase().split(' ').some(word => content.includes(word))) {
        
        // Extract relevant sentences
        const sentences = entry.content.split(/[.!?]+/);
        const relevantSentences = sentences.filter(sentence => 
          sentence.toLowerCase().includes(variableName) ||
          variable.description.toLowerCase().split(' ').some(word => 
            sentence.toLowerCase().includes(word) && word.length > 3
          )
        );

        suggestions.push(...relevantSentences.slice(0, 2));
      }
    }

    return suggestions.slice(0, 3);
  }

  private async extractOutputBasedSuggestions(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    for (const output of context.previousOutputs) {
      // Look for patterns in previous outputs that match this variable
      const variablePattern = new RegExp(`${variable.name}[:\\s]*([^.!?\\n]+)`, 'gi');
      const matches = output.content.match(variablePattern);

      if (matches) {
        suggestions.push(...matches.slice(0, 2));
      }
    }

    return suggestions.slice(0, 2);
  }

  private async generateContextBasedSuggestions(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Framework-specific suggestions
    if (variable.id === 'target_audience' || variable.name.toLowerCase().includes('audience')) {
      suggestions.push(...context.projectContext.targetAudience);
    }

    if (variable.id === 'project_goals' || variable.name.toLowerCase().includes('goal')) {
      suggestions.push(...context.projectContext.goals);
    }

    if (variable.id === 'constraints' || variable.name.toLowerCase().includes('constraint')) {
      suggestions.push(...context.projectContext.constraints);
    }

    // Stage-specific suggestions
    if (context.stage.id === 'empathize' && variable.name.toLowerCase().includes('user')) {
      suggestions.push('Focus on understanding user emotions and motivations');
    }

    if (context.stage.id === 'define' && variable.name.toLowerCase().includes('problem')) {
      suggestions.push('Frame the problem from the user perspective');
    }

    return suggestions;
  }

  private async generateAccessibilitySuggestions(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (context.userPreferences.accessibilityLevel !== 'basic') {
      if (variable.name.toLowerCase().includes('user') || 
          variable.name.toLowerCase().includes('participant')) {
        suggestions.push('Include users with diverse abilities and disabilities');
        suggestions.push('Consider assistive technology users');
      }

      if (variable.name.toLowerCase().includes('method') || 
          variable.name.toLowerCase().includes('approach')) {
        suggestions.push('Ensure method is accessible to all participants');
        suggestions.push('Provide multiple ways to participate');
      }
    }

    return suggestions;
  }

  private async validateSingleVariable(
    enhancedVar: EnhancedVariable,
    value: any,
    allVariables: Record<string, any>,
    context: VariableContext
  ): Promise<VariableValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    const accessibilityIssues: AccessibilityIssue[] = [];

    // Run validation rules
    for (const rule of enhancedVar.validationRules) {
      const ruleResult = this.executeValidationRule(rule, value, allVariables);
      
      if (!ruleResult.passed) {
        if (rule.severity === 'error') {
          errors.push({
            ruleId: rule.id,
            message: rule.message,
            severity: 'error',
            suggestion: ruleResult.suggestion
          });
        } else if (rule.severity === 'warning') {
          warnings.push({
            ruleId: rule.id,
            message: rule.message,
            severity: 'warning',
            suggestion: ruleResult.suggestion
          });
        }
      }
    }

    // Check accessibility
    if (context.userPreferences.accessibilityLevel !== 'basic') {
      const accessibilityCheck = this.checkAccessibility(enhancedVar, value, context);
      accessibilityIssues.push(...accessibilityCheck);
    }

    // Generate suggestions
    if (value && typeof value === 'string' && value.length < 10) {
      suggestions.push('Consider providing more detail for better AI prompt quality');
    }

    if (enhancedVar.contextualSuggestions.length > 0) {
      suggestions.push(`Consider: ${enhancedVar.contextualSuggestions[0]}`);
    }

    return {
      variableId: enhancedVar.id,
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      accessibilityIssues
    };
  }

  private executeValidationRule(
    rule: VariableValidationRule,
    value: any,
    allVariables: Record<string, any>
  ): { passed: boolean; suggestion?: string } {
    switch (rule.type) {
      case 'required':
        return {
          passed: value !== undefined && value !== null && value !== '',
          suggestion: 'This field is required for quality prompt generation'
        };

      case 'min_length':
        return {
          passed: typeof value === 'string' && value.length >= rule.value,
          suggestion: `Provide at least ${rule.value} characters for better context`
        };

      case 'max_length':
        return {
          passed: typeof value === 'string' && value.length <= rule.value,
          suggestion: `Keep under ${rule.value} characters for optimal processing`
        };

      case 'pattern':
        const regex = new RegExp(rule.value);
        return {
          passed: typeof value === 'string' && regex.test(value),
          suggestion: 'Please match the expected format'
        };

      case 'accessibility':
        return this.validateAccessibilityRule(rule, value, allVariables);

      default:
        return { passed: true };
    }
  }

  private validateAccessibilityRule(
    rule: VariableValidationRule,
    value: any,
    allVariables: Record<string, any>
  ): { passed: boolean; suggestion?: string } {
    // Custom accessibility validation logic
    if (rule.value === 'inclusive_language') {
      const exclusiveTerms = ['disabled', 'handicapped', 'normal user', 'able-bodied'];
      const hasExclusiveTerm = exclusiveTerms.some(term => 
        typeof value === 'string' && value.toLowerCase().includes(term.toLowerCase())
      );
      
      return {
        passed: !hasExclusiveTerm,
        suggestion: 'Use person-first language and avoid ableist terminology'
      };
    }

    return { passed: true };
  }

  private checkAccessibility(
    variable: EnhancedVariable,
    value: any,
    context: VariableContext
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (!variable.accessibility.label || variable.accessibility.label.length < 3) {
      issues.push({
        type: 'missing_label',
        message: 'Variable lacks clear accessibility label',
        recommendation: 'Provide descriptive label for screen readers'
      });
    }

    if (!variable.accessibility.description || variable.accessibility.description.length < 10) {
      issues.push({
        type: 'unclear_description',
        message: 'Variable description insufficient for accessibility',
        recommendation: 'Add detailed description for assistive technologies'
      });
    }

    return issues;
  }

  private async processVariableValue(
    value: any,
    variable: EnhancedVariable,
    context: VariableContext
  ): Promise<string> {
    let processedValue = String(value);

    // Apply contextual processing
    if (variable.type === 'textarea' && context.userPreferences.outputDetailLevel === 'comprehensive') {
      // Add more context for comprehensive output
      processedValue = `${processedValue}\n\n[Context: ${context.framework.name} - ${context.stage.name}]`;
    }

    // Apply accessibility processing
    if (context.userPreferences.accessibilityLevel === 'comprehensive') {
      if (variable.accessibility.requirements.length > 0) {
        processedValue = `${processedValue}\n\nAccessibility considerations: ${variable.accessibility.requirements.join(', ')}`;
      }
    }

    return processedValue;
  }

  private calculateQualityScore(
    originalTemplate: string,
    processedTemplate: string,
    variableMappings: Map<string, any>,
    unresolvedVariables: string[],
    accessibilityEnhancements: string[]
  ): { completeness: number; clarity: number; accessibility: number; overall: number } {
    // Calculate completeness based on resolved variables
    const totalVariables = (originalTemplate.match(/\{\{[^}]+\}\}/g) || []).length;
    const resolvedVariables = totalVariables - unresolvedVariables.length;
    const completeness = totalVariables > 0 ? resolvedVariables / totalVariables : 1;

    // Calculate clarity based on content quality
    const hasDetailedContent = Array.from(variableMappings.values())
      .some(value => typeof value === 'string' && value.length > 20);
    const clarity = hasDetailedContent ? 0.8 : 0.5;

    // Calculate accessibility based on enhancements
    const accessibility = accessibilityEnhancements.length > 0 ? 0.9 : 0.6;

    // Overall score
    const overall = (completeness * 0.4 + clarity * 0.3 + accessibility * 0.3);

    return {
      completeness,
      clarity,
      accessibility,
      overall
    };
  }

  // Smart default extraction methods
  private async extractKnowledgeDefault(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<{ value: any; confidence: number; rationale: string }> {
    // Extract defaults from knowledge base entries
    for (const entry of context.knowledgeBase) {
      const relevantSentence = this.findRelevantSentence(entry.content, variable);
      if (relevantSentence) {
        return {
          value: relevantSentence,
          confidence: 0.6,
          rationale: `Extracted from knowledge base entry: ${entry.title}`
        };
      }
    }

    return { value: '', confidence: 0, rationale: 'No relevant knowledge found' };
  }

  private async extractOutputDefault(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<{ value: any; confidence: number; rationale: string }> {
    // Extract defaults from previous outputs
    for (const output of context.previousOutputs) {
      const relevantContent = this.findRelevantContent(output.content, variable);
      if (relevantContent) {
        return {
          value: relevantContent,
          confidence: 0.7,
          rationale: `Based on previous ${output.context.stage.name} output`
        };
      }
    }

    return { value: '', confidence: 0, rationale: 'No relevant previous outputs' };
  }

  private async extractProjectDefault(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<{ value: any; confidence: number; rationale: string }> {
    // Extract from project context
    if (variable.id === 'target_audience' && context.projectContext.targetAudience.length > 0) {
      return {
        value: context.projectContext.targetAudience.join(', '),
        confidence: 0.9,
        rationale: 'From project target audience definition'
      };
    }

    if (variable.id === 'project_goals' && context.projectContext.goals.length > 0) {
      return {
        value: context.projectContext.goals.join(', '),
        confidence: 0.9,
        rationale: 'From project goals definition'
      };
    }

    return { value: '', confidence: 0, rationale: 'No matching project context' };
  }

  private async extractFrameworkDefault(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<{ value: any; confidence: number; rationale: string }> {
    // Framework-specific defaults
    if (context.framework.id === 'design-thinking') {
      if (variable.name.toLowerCase().includes('empathy')) {
        return {
          value: 'Focus on understanding user emotions, needs, and context through direct observation and engagement',
          confidence: 0.8,
          rationale: 'Design Thinking empathy stage best practice'
        };
      }
    }

    return { value: '', confidence: 0, rationale: 'No framework-specific default' };
  }

  // Helper methods
  private generateCacheKey(variable: PromptVariable, context: VariableContext): string {
    return `${variable.id}_${context.framework.id}_${context.stage.id}_${context.tool.id}`;
  }

  private findRelevantSentence(content: string, variable: PromptVariable): string | null {
    const sentences = content.split(/[.!?]+/);
    const relevantSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(variable.name.toLowerCase()) ||
      variable.description.toLowerCase().split(' ').some(word => 
        word.length > 3 && sentence.toLowerCase().includes(word)
      )
    );
    
    return relevantSentence ? relevantSentence.trim() : null;
  }

  private findRelevantContent(content: string, variable: PromptVariable): string | null {
    // Find content relevant to the variable
    const paragraphs = content.split('\n\n');
    const relevantParagraph = paragraphs.find(para =>
      para.toLowerCase().includes(variable.name.toLowerCase()) ||
      variable.description.toLowerCase().split(' ').some(word =>
        word.length > 3 && para.toLowerCase().includes(word)
      )
    );

    return relevantParagraph ? relevantParagraph.trim().substring(0, 200) : null;
  }

  private async generateValidationRules(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<VariableValidationRule[]> {
    const rules: VariableValidationRule[] = [];

    // Basic required rule
    if (variable.required) {
      rules.push({
        id: `${variable.id}_required`,
        type: 'required',
        value: true,
        message: `${variable.name} is required`,
        severity: 'error',
        context: 'Basic validation'
      });
    }

    // Length validation for text inputs
    if (variable.type === 'text' || variable.type === 'textarea') {
      rules.push({
        id: `${variable.id}_min_length`,
        type: 'min_length',
        value: variable.type === 'textarea' ? 20 : 5,
        message: `${variable.name} should be at least ${variable.type === 'textarea' ? 20 : 5} characters`,
        severity: 'warning',
        context: 'Quality assurance'
      });
    }

    // Accessibility rules
    if (context.userPreferences.accessibilityLevel !== 'basic') {
      rules.push({
        id: `${variable.id}_inclusive_language`,
        type: 'accessibility',
        value: 'inclusive_language',
        message: 'Use inclusive, person-first language',
        severity: 'warning',
        context: 'Accessibility compliance'
      });
    }

    return rules;
  }

  private async generateDependencies(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<VariableDependency[]> {
    const dependencies: VariableDependency[] = [];

    // Example: If research method is selected, participants become required
    if (variable.id === 'participants' && context.tool.category === 'Research') {
      dependencies.push({
        dependsOn: 'research_method',
        condition: 'value !== ""',
        effect: 'required',
        message: 'Participants are required when research method is specified'
      });
    }

    return dependencies;
  }

  private async generateAccessibilityInfo(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<EnhancedVariable['accessibility']> {
    return {
      label: variable.name,
      description: variable.description,
      requirements: context.userPreferences.accessibilityLevel === 'comprehensive' ? [
        'Consider diverse user abilities',
        'Use inclusive language',
        'Ensure clear instructions'
      ] : [],
      examples: [
        `Example for ${variable.name}: [context-appropriate example]`
      ]
    };
  }

  private async generateKnowledgeConnections(
    variable: PromptVariable,
    context: VariableContext
  ): Promise<KnowledgeConnection[]> {
    const connections: KnowledgeConnection[] = [];

    for (const entry of context.knowledgeBase) {
      const relevanceScore = this.calculateKnowledgeRelevance(entry, variable);
      if (relevanceScore > 0.5) {
        const extractedValue = this.findRelevantSentence(entry.content, variable) || '';
        connections.push({
          knowledgeEntryId: entry.id,
          relevanceScore,
          extractedValue,
          confidence: relevanceScore * 0.8,
          context: `From ${entry.title}`
        });
      }
    }

    return connections.slice(0, 3); // Limit to top 3 connections
  }

  private calculateKnowledgeRelevance(entry: KnowledgeEntry, variable: PromptVariable): number {
    const entryContent = entry.content.toLowerCase();
    const variableName = variable.name.toLowerCase();
    const variableWords = variable.description.toLowerCase().split(' ').filter(word => word.length > 3);

    let relevance = 0;

    // Exact name match
    if (entryContent.includes(variableName)) {
      relevance += 0.5;
    }

    // Description word matches
    variableWords.forEach(word => {
      if (entryContent.includes(word)) {
        relevance += 0.1;
      }
    });

    return Math.min(relevance, 1.0);
  }

  /**
   * Clear caches when context changes
   */
  clearCaches(): void {
    this.variableCache.clear();
    this.suggestionCache.clear();
  }
}

// Export singleton instance
export const enhancedVariableHandler = new EnhancedVariableHandler();