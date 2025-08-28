/**
 * @fileoverview Template Variable Validation System
 * Comprehensive validation for template variables and prompt engineering parameters
 */

import { PromptEngineeringMethod, PromptMethodConfig, promptMethodProcessor } from './prompt-engineering-methods';
import { EnhancedToolPromptTemplate, PromptVariable } from './tool-templates-enhanced';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validator: (value: any, context?: ValidationContext) => ValidationResult;
  applicableTo: string[]; // Variable types this rule applies to
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationContext {
  templateId?: string;
  methodId?: PromptEngineeringMethod;
  otherVariables?: Record<string, any>;
  industry?: string;
  userExperience?: 'beginner' | 'intermediate' | 'expert';
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    variableId: string;
    variableName: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
  }>;
  warnings: Array<{
    variableId: string;
    variableName: string;
    message: string;
    suggestion?: string;
  }>;
  suggestions: Array<{
    variableId: string;
    variableName: string;
    message: string;
    autoFixValue?: any;
  }>;
  overallScore: number; // 0-100 quality score
}

export interface MethodParameterValidationResult {
  isValid: boolean;
  errors: Array<{
    parameterId: string;
    parameterName: string;
    message: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    parameterId: string;
    parameterName: string;
    message: string;
    suggestion?: string;
  }>;
  optimizations: Array<{
    parameterId: string;
    parameterName: string;
    currentValue: any;
    suggestedValue: any;
    reasoning: string;
  }>;
}

/**
 * Comprehensive validation rules for different variable types
 */
export const VALIDATION_RULES: ValidationRule[] = [
  // Text validation rules
  {
    id: 'text_min_length',
    name: 'Minimum Text Length',
    description: 'Ensures text fields have sufficient content',
    applicableTo: ['text', 'textarea'],
    validator: (value: string, context?: ValidationContext): ValidationResult => {
      if (typeof value !== 'string') {
        return { isValid: false, message: 'Value must be text', severity: 'error' };
      }
      
      const minLength = context?.templateId?.includes('interview') ? 10 : 5;
      
      if (value.trim().length < minLength) {
        return {
          isValid: false,
          message: `Text must be at least ${minLength} characters`,
          severity: 'error',
          suggestion: `Provide more detailed input (currently ${value.length} characters)`
        };
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  {
    id: 'text_max_length',
    name: 'Maximum Text Length',
    description: 'Prevents excessively long text input',
    applicableTo: ['text', 'textarea'],
    validator: (value: string, context?: ValidationContext): ValidationResult => {
      if (typeof value !== 'string') {
        return { isValid: true, severity: 'info' };
      }
      
      const maxLength = context?.templateId?.includes('interview') ? 1000 : 500;
      
      if (value.length > maxLength) {
        return {
          isValid: false,
          message: `Text is too long (${value.length} characters, max ${maxLength})`,
          severity: 'warning',
          suggestion: 'Consider breaking into smaller, more focused sections'
        };
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  {
    id: 'meaningful_content',
    name: 'Meaningful Content',
    description: 'Ensures content provides meaningful information',
    applicableTo: ['text', 'textarea'],
    validator: (value: string, context?: ValidationContext): ValidationResult => {
      if (typeof value !== 'string') {
        return { isValid: false, message: 'Value must be text', severity: 'error' };
      }
      
      const meaninglessPatterns = [
        /^(test|example|placeholder|todo|tbd|n\/a|none|null)$/i,
        /^(.)\1{3,}$/, // Repeated characters like "aaaa"
        /^\d+$/, // Just numbers
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/ // Just special characters
      ];
      
      if (meaninglessPatterns.some(pattern => pattern.test(value.trim()))) {
        return {
          isValid: false,
          message: 'Please provide meaningful, specific content',
          severity: 'error',
          suggestion: 'Replace placeholder text with actual project-specific information'
        };
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  // Number validation rules
  {
    id: 'number_range',
    name: 'Number Range',
    description: 'Validates numbers are within acceptable ranges',
    applicableTo: ['number'],
    validator: (value: number, context?: ValidationContext): ValidationResult => {
      if (typeof value !== 'number' || isNaN(value)) {
        return { isValid: false, message: 'Value must be a valid number', severity: 'error' };
      }
      
      // Context-specific range validation
      if (context?.templateId?.includes('sample') || context?.templateId?.includes('participant')) {
        if (value < 1) {
          return {
            isValid: false,
            message: 'Sample size must be at least 1',
            severity: 'error',
            suggestion: 'Enter a positive number of participants'
          };
        }
        
        if (value > 1000) {
          return {
            isValid: false,
            message: 'Sample size seems unrealistically large',
            severity: 'warning',
            suggestion: 'Consider if you really need more than 1000 participants'
          };
        }
        
        // Optimal ranges based on research type
        if (value < 5 && context.templateId?.includes('interview')) {
          return {
            isValid: true,
            message: 'Consider 5-8 participants for interview-based research',
            severity: 'info',
            suggestion: '5-8 participants typically achieve thematic saturation'
          };
        }
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  {
    id: 'realistic_time_estimate',
    name: 'Realistic Time Estimate',
    description: 'Validates time estimates are realistic',
    applicableTo: ['number', 'select'],
    validator: (value: any, context?: ValidationContext): ValidationResult => {
      if (context?.templateId?.includes('duration') || context?.templateId?.includes('time')) {
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        
        if (typeof numValue !== 'number' || isNaN(numValue)) {
          return { isValid: false, message: 'Time must be a valid number', severity: 'error' };
        }
        
        // Interview duration validation
        if (context.templateId?.includes('interview')) {
          if (numValue < 15) {
            return {
              isValid: false,
              message: 'Interview duration too short for meaningful insights',
              severity: 'warning',
              suggestion: 'Consider 30-60 minutes for most interviews'
            };
          }
          
          if (numValue > 120) {
            return {
              isValid: false,
              message: 'Interview duration may cause participant fatigue',
              severity: 'warning',
              suggestion: 'Consider breaking into multiple sessions or reducing scope'
            };
          }
        }
        
        // Testing duration validation
        if (context.templateId?.includes('testing')) {
          if (numValue < 15) {
            return {
              isValid: false,
              message: 'Testing session too short for meaningful results',
              severity: 'warning',
              suggestion: 'Most usability tests require 20-60 minutes'
            };
          }
        }
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  // Select validation rules
  {
    id: 'required_selection',
    name: 'Required Selection',
    description: 'Ensures required select fields have values',
    applicableTo: ['select', 'multiselect'],
    validator: (value: any, context?: ValidationContext): ValidationResult => {
      if (value === undefined || value === null || value === '') {
        return {
          isValid: false,
          message: 'Please make a selection',
          severity: 'error',
          suggestion: 'Choose an appropriate option from the list'
        };
      }
      
      if (Array.isArray(value) && value.length === 0) {
        return {
          isValid: false,
          message: 'Please select at least one option',
          severity: 'error',
          suggestion: 'Multiple selections are available for this field'
        };
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  {
    id: 'optimal_selection',
    name: 'Optimal Selection',
    description: 'Provides guidance on optimal selections',
    applicableTo: ['select', 'multiselect'],
    validator: (value: any, context?: ValidationContext): ValidationResult => {
      // Confidence level optimization
      if (context?.templateId?.includes('confidence')) {
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        if (numValue < 80) {
          return {
            isValid: true,
            message: 'Consider increasing confidence level for more reliable results',
            severity: 'info',
            suggestion: '80-90% confidence levels are typically recommended for UX research'
          };
        }
      }
      
      // Difficulty level guidance
      if (context?.templateId?.includes('difficulty') || context?.templateId?.includes('methodology')) {
        if (value === 'advanced' && context.userExperience === 'beginner') {
          return {
            isValid: true,
            message: 'Advanced methods may be challenging for beginners',
            severity: 'info',
            suggestion: 'Consider starting with intermediate-level approaches'
          };
        }
        
        if (value === 'basic' && context.userExperience === 'expert') {
          return {
            isValid: true,
            message: 'Basic approaches may not utilize your full expertise',
            severity: 'info',
            suggestion: 'Consider intermediate or advanced methods for richer insights'
          };
        }
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  // Industry-specific validation
  {
    id: 'industry_compatibility',
    name: 'Industry Compatibility',
    description: 'Validates variables are appropriate for selected industry',
    applicableTo: ['text', 'textarea', 'select'],
    validator: (value: any, context?: ValidationContext): ValidationResult => {
      if (!context?.industry) return { isValid: true, severity: 'info' };
      
      const industryRequirements: Record<string, string[]> = {
        healthcare: ['HIPAA', 'patient', 'clinical', 'medical', 'care'],
        fintech: ['regulatory', 'compliance', 'security', 'financial', 'PCI'],
        education: ['learning', 'student', 'institutional', 'accessibility', 'FERPA']
      };
      
      const requirements = industryRequirements[context.industry];
      if (!requirements) return { isValid: true, severity: 'info' };
      
      const valueStr = String(value).toLowerCase();
      const hasIndustryConsiderations = requirements.some(req => valueStr.includes(req.toLowerCase()));
      
      if (!hasIndustryConsiderations && typeof value === 'string' && value.length > 50) {
        return {
          isValid: true,
          message: `Consider ${context.industry}-specific requirements`,
          severity: 'info',
          suggestion: `Include considerations for ${requirements.slice(0, 2).join(', ')} in ${context.industry}`
        };
      }
      
      return { isValid: true, severity: 'info' };
    }
  },

  // Consistency validation
  {
    id: 'variable_consistency',
    name: 'Variable Consistency',
    description: 'Ensures related variables are consistent',
    applicableTo: ['text', 'textarea', 'number', 'select'],
    validator: (value: any, context?: ValidationContext): ValidationResult => {
      if (!context?.otherVariables) return { isValid: true, severity: 'info' };
      
      // Sample size vs duration consistency
      const sampleSize = context.otherVariables.sampleSize;
      const duration = context.otherVariables.duration || context.otherVariables.testingDuration;
      
      if (typeof sampleSize === 'number' && typeof duration === 'number') {
        const totalTime = sampleSize * duration;
        
        if (totalTime > 2400) { // More than 40 hours total
          return {
            isValid: true,
            message: 'Large time commitment detected',
            severity: 'warning',
            suggestion: `${sampleSize} participants × ${duration} minutes = ${Math.round(totalTime/60)} hours total. Consider reducing scope or extending timeline.`
          };
        }
      }
      
      // Target vs sample consistency
      const targetUsers = String(context.otherVariables.targetUsers || context.otherVariables.targetUserSegment || '').toLowerCase();
      const valueStr = String(value).toLowerCase();
      
      if (targetUsers && valueStr && targetUsers.length > 10 && valueStr.length > 10) {
        const commonWords = ['user', 'customer', 'client', 'participant'];
        const targetWordsUsed = commonWords.filter(word => targetUsers.includes(word));
        const valueWordsUsed = commonWords.filter(word => valueStr.includes(word));
        
        if (targetWordsUsed.length > 0 && valueWordsUsed.length === 0) {
          return {
            isValid: true,
            message: 'Consider consistency with target user description',
            severity: 'info',
            suggestion: 'Ensure this aligns with your target user segment definition'
          };
        }
      }
      
      return { isValid: true, severity: 'info' };
    }
  }
];

/**
 * Template Variable Validator Class
 */
export class TemplateVariableValidator {
  private rules: ValidationRule[];
  private methodProcessor: any;

  constructor() {
    this.rules = VALIDATION_RULES;
    this.methodProcessor = promptMethodProcessor;
  }

  /**
   * Validate all variables in a template
   */
  validateTemplate(
    templateId: string,
    template: EnhancedToolPromptTemplate,
    variables: Record<string, any>,
    context?: ValidationContext
  ): TemplateValidationResult {
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: TemplateValidationResult['warnings'] = [];
    const suggestions: TemplateValidationResult['suggestions'] = [];
    
    let totalScore = 0;
    let validatedCount = 0;

    // Validate each template variable
    template.variables.forEach(variable => {
      const value = variables[variable.id];
      const variableContext: ValidationContext = {
        ...context,
        templateId,
        otherVariables: variables
      };

      // Check required fields
      if (variable.required && (value === undefined || value === null || value === '')) {
        errors.push({
          variableId: variable.id,
          variableName: variable.name,
          message: 'This field is required',
          severity: 'error',
          suggestion: 'Please provide a value for this required field'
        });
        validatedCount++;
        continue; // Skip further validation for empty required fields
      }

      // Skip validation for empty optional fields
      if (!variable.required && (value === undefined || value === null || value === '')) {
        validatedCount++;
        totalScore += 80; // Give decent score for optional empty fields
        continue;
      }

      // Apply validation rules
      const applicableRules = this.rules.filter(rule => 
        rule.applicableTo.includes(variable.type)
      );

      let variableScore = 100;
      let hasErrors = false;

      applicableRules.forEach(rule => {
        const result = rule.validator(value, variableContext);
        
        if (!result.isValid) {
          if (result.severity === 'error') {
            errors.push({
              variableId: variable.id,
              variableName: variable.name,
              message: result.message || 'Validation failed',
              severity: result.severity,
              suggestion: result.suggestion
            });
            hasErrors = true;
            variableScore -= 30; // Major penalty for errors
          } else if (result.severity === 'warning') {
            warnings.push({
              variableId: variable.id,
              variableName: variable.name,
              message: result.message || 'Validation warning',
              suggestion: result.suggestion
            });
            variableScore -= 15; // Minor penalty for warnings
          }
        } else if (result.message && result.severity === 'info') {
          suggestions.push({
            variableId: variable.id,
            variableName: variable.name,
            message: result.message,
            autoFixValue: this.generateAutoFix(variable, value, result.suggestion)
          });
        }
      });

      // Apply variable-specific validation
      const specificValidation = this.validateVariableSpecific(variable, value, variableContext);
      if (!specificValidation.isValid) {
        if (specificValidation.severity === 'error') {
          errors.push({
            variableId: variable.id,
            variableName: variable.name,
            message: specificValidation.message || 'Specific validation failed',
            severity: specificValidation.severity,
            suggestion: specificValidation.suggestion
          });
          hasErrors = true;
          variableScore -= 25;
        }
      }

      totalScore += Math.max(0, variableScore);
      validatedCount++;
    });

    const overallScore = validatedCount > 0 ? Math.round(totalScore / validatedCount) : 0;
    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      suggestions,
      overallScore
    };
  }

  /**
   * Validate prompt engineering method parameters
   */
  validateMethodParameters(
    method: PromptEngineeringMethod,
    parameters: Record<string, any>,
    context?: ValidationContext
  ): MethodParameterValidationResult {
    const methodConfig = this.methodProcessor.getMethodConfig(method);
    if (!methodConfig) {
      return {
        isValid: false,
        errors: [{ parameterId: 'method', parameterName: 'Method', message: 'Unknown method', suggestion: 'Select a valid prompt engineering method' }],
        warnings: [],
        optimizations: []
      };
    }

    const errors: MethodParameterValidationResult['errors'] = [];
    const warnings: MethodParameterValidationResult['warnings'] = [];
    const optimizations: MethodParameterValidationResult['optimizations'] = [];

    // Validate each parameter
    Object.entries(methodConfig.parameters).forEach(([paramId, paramConfig]) => {
      const value = parameters[paramId];

      // Check required parameters
      if (paramConfig.required && (value === undefined || value === null)) {
        errors.push({
          parameterId: paramId,
          parameterName: paramConfig.description.split(' ')[0], // Use first word as name
          message: 'This parameter is required',
          suggestion: 'Provide a value for this required parameter'
        });
        return;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const typeValidation = this.validateParameterType(value, paramConfig.type);
        if (!typeValidation.isValid) {
          errors.push({
            parameterId: paramId,
            parameterName: paramId,
            message: typeValidation.message || 'Invalid parameter type',
            suggestion: typeValidation.suggestion
          });
        }
      }

      // Generate optimizations
      const optimization = this.generateParameterOptimization(
        method,
        paramId,
        paramConfig,
        value,
        context
      );
      
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    // Method-specific optimizations
    const methodOptimizations = this.generateMethodSpecificOptimizations(
      method,
      parameters,
      context
    );
    optimizations.push(...methodOptimizations);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      optimizations
    };
  }

  /**
   * Suggest optimal parameter values for a method
   */
  suggestOptimalParameters(
    method: PromptEngineeringMethod,
    context: {
      taskComplexity?: 'simple' | 'moderate' | 'complex';
      domainSpecific?: boolean;
      targetAudience?: 'practitioners' | 'stakeholders' | 'mixed';
      outputLength?: 'brief' | 'moderate' | 'comprehensive';
      userExperience?: 'beginner' | 'intermediate' | 'expert';
    }
  ): Record<string, any> {
    const methodConfig = this.methodProcessor.getMethodConfig(method);
    if (!methodConfig) return {};

    const suggestions: Record<string, any> = {};

    // Apply method-specific optimizations
    switch (method) {
      case 'few-shot':
        suggestions.exampleCount = context.taskComplexity === 'complex' ? 4 : 3;
        suggestions.temperature = context.domainSpecific ? 0.3 : 0.5;
        suggestions.shuffleExamples = context.userExperience === 'expert';
        break;

      case 'chain-of-thought':
        suggestions.reasoning_steps = context.taskComplexity === 'complex' ? 7 : 5;
        suggestions.show_work = true;
        suggestions.verify_logic = context.taskComplexity !== 'simple';
        break;

      case 'tree-of-thought':
        suggestions.branches = context.taskComplexity === 'complex' ? 4 : 3;
        suggestions.depth = context.targetAudience === 'practitioners' ? 3 : 2;
        suggestions.evaluation_criteria = ['feasibility', 'effectiveness', 'efficiency'];
        break;

      case 'role-playing':
        suggestions.experience_level = context.userExperience === 'expert' ? '15+ years' : '8-12 years';
        suggestions.industry_focus = context.domainSpecific ? 'specialized domain' : 'technology';
        suggestions.personality_traits = ['analytical', 'user-focused', 'systematic'];
        break;

      case 'instruction-tuning':
        suggestions.format_requirements = context.outputLength === 'brief' ? 
          ['bullet points', 'clear headings'] : 
          ['structured sections', 'bullet points', 'clear headings', 'examples'];
        suggestions.output_length = context.outputLength || 'comprehensive';
        suggestions.include_examples = context.userExperience !== 'expert';
        break;

      case 'step-by-step':
        suggestions.step_numbering = true;
        suggestions.include_substeps = context.taskComplexity !== 'simple';
        suggestions.time_estimates = context.targetAudience === 'practitioners';
        suggestions.prerequisites = true;
        break;

      case 'socratic':
        suggestions.question_depth = context.taskComplexity === 'complex' ? 4 : 3;
        suggestions.focus_area = 'assumptions';
        suggestions.guidance_level = context.userExperience === 'beginner' ? 'substantial' : 'moderate';
        break;

      case 'multi-perspective':
        suggestions.perspectives = ['user', 'business', 'technical', 'stakeholder'];
        suggestions.perspective_depth = context.outputLength === 'brief' ? 'moderate' : 'detailed';
        suggestions.synthesis_approach = 'integrated';
        break;

      case 'retrieval-augmented':
        suggestions.knowledge_sources = ['project_knowledge', 'industry_standards', 'best_practices'];
        suggestions.citation_style = 'integrated';
        suggestions.knowledge_weight = context.domainSpecific ? 0.8 : 0.7;
        break;
    }

    return suggestions;
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Get validation rules by type
   */
  getValidationRules(applicableTo?: string): ValidationRule[] {
    if (!applicableTo) return this.rules;
    return this.rules.filter(rule => rule.applicableTo.includes(applicableTo));
  }

  // Private helper methods

  private validateVariableSpecific(
    variable: PromptVariable,
    value: any,
    context: ValidationContext
  ): ValidationResult {
    // Apply variable-specific validation rules from the variable definition
    if (variable.validation) {
      const validation = variable.validation;
      
      // Min/max validation for numbers
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return {
            isValid: false,
            message: validation.message || `Value must be at least ${validation.min}`,
            severity: 'error',
            suggestion: `Enter a value of ${validation.min} or greater`
          };
        }
        
        if (validation.max !== undefined && value > validation.max) {
          return {
            isValid: false,
            message: validation.message || `Value must be at most ${validation.max}`,
            severity: 'error',
            suggestion: `Enter a value of ${validation.max} or less`
          };
        }
      }
      
      // Pattern validation for strings
      if (typeof value === 'string' && validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return {
            isValid: false,
            message: validation.message || 'Value format is invalid',
            severity: 'error',
            suggestion: 'Check the format requirements for this field'
          };
        }
      }
    }

    // Options validation for select fields
    if (variable.options && value !== undefined && value !== null) {
      if (variable.type === 'multiselect') {
        if (!Array.isArray(value)) {
          return {
            isValid: false,
            message: 'Multiple selections must be an array',
            severity: 'error'
          };
        }
        
        const invalidOptions = value.filter(v => !variable.options!.includes(v));
        if (invalidOptions.length > 0) {
          return {
            isValid: false,
            message: `Invalid selections: ${invalidOptions.join(', ')}`,
            severity: 'error',
            suggestion: `Choose from: ${variable.options.join(', ')}`
          };
        }
      } else if (variable.type === 'select') {
        if (!variable.options.includes(value)) {
          return {
            isValid: false,
            message: `Invalid selection: ${value}`,
            severity: 'error',
            suggestion: `Choose from: ${variable.options.join(', ')}`
          };
        }
      }
    }

    return { isValid: true, severity: 'info' };
  }

  private validateParameterType(value: any, expectedType: string): ValidationResult {
    switch (expectedType) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            isValid: false,
            message: 'Value must be a number',
            severity: 'error',
            suggestion: 'Enter a numeric value'
          };
        }
        break;
      
      case 'string':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            message: 'Value must be text',
            severity: 'error',
            suggestion: 'Enter a text value'
          };
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            isValid: false,
            message: 'Value must be true or false',
            severity: 'error',
            suggestion: 'Select a boolean value'
          };
        }
        break;
      
      case 'array':
        if (!Array.isArray(value)) {
          return {
            isValid: false,
            message: 'Value must be an array',
            severity: 'error',
            suggestion: 'Provide multiple values as an array'
          };
        }
        break;
    }

    return { isValid: true, severity: 'info' };
  }

  private generateParameterOptimization(
    method: PromptEngineeringMethod,
    paramId: string,
    paramConfig: any,
    currentValue: any,
    context?: ValidationContext
  ): MethodParameterValidationResult['optimizations'][0] | null {
    // Generate context-aware parameter optimizations
    if (paramId === 'temperature' && typeof currentValue === 'number') {
      if (context?.templateId?.includes('creative') && currentValue < 0.7) {
        return {
          parameterId: paramId,
          parameterName: 'Temperature',
          currentValue,
          suggestedValue: 0.8,
          reasoning: 'Higher temperature recommended for creative tasks'
        };
      }
      
      if (context?.templateId?.includes('analysis') && currentValue > 0.3) {
        return {
          parameterId: paramId,
          parameterName: 'Temperature',
          currentValue,
          suggestedValue: 0.2,
          reasoning: 'Lower temperature recommended for analytical tasks'
        };
      }
    }

    if (paramId === 'exampleCount' && method === 'few-shot') {
      if (typeof currentValue === 'number' && currentValue > 5) {
        return {
          parameterId: paramId,
          parameterName: 'Example Count',
          currentValue,
          suggestedValue: 4,
          reasoning: 'Too many examples may confuse the model; 3-4 examples are typically optimal'
        };
      }
    }

    return null;
  }

  private generateMethodSpecificOptimizations(
    method: PromptEngineeringMethod,
    parameters: Record<string, any>,
    context?: ValidationContext
  ): MethodParameterValidationResult['optimizations'] {
    const optimizations: MethodParameterValidationResult['optimizations'] = [];

    // Add method-specific optimization logic here
    if (method === 'chain-of-thought' && parameters.reasoning_steps > 8) {
      optimizations.push({
        parameterId: 'reasoning_steps',
        parameterName: 'Reasoning Steps',
        currentValue: parameters.reasoning_steps,
        suggestedValue: 6,
        reasoning: 'Too many reasoning steps can reduce clarity; 5-6 steps are typically optimal'
      });
    }

    return optimizations;
  }

  private generateAutoFix(
    variable: PromptVariable,
    currentValue: any,
    suggestion?: string
  ): any {
    // Generate automatic fixes for common issues
    if (variable.type === 'text' || variable.type === 'textarea') {
      if (typeof currentValue === 'string') {
        // Fix common formatting issues
        if (currentValue.includes('  ')) {
          return currentValue.replace(/\s+/g, ' ').trim();
        }
        
        // Capitalize first letter if it's all lowercase
        if (currentValue === currentValue.toLowerCase() && currentValue.length > 0) {
          return currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
        }
      }
    }

    if (variable.type === 'number' && variable.validation) {
      const numValue = Number(currentValue);
      if (!isNaN(numValue)) {
        if (variable.validation.min !== undefined && numValue < variable.validation.min) {
          return variable.validation.min;
        }
        if (variable.validation.max !== undefined && numValue > variable.validation.max) {
          return variable.validation.max;
        }
      }
    }

    return undefined;
  }
}

// Export singleton instance
export const templateVariableValidator = new TemplateVariableValidator();