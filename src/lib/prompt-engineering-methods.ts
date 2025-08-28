/**
 * @fileoverview Advanced Prompt Engineering Methods
 * Implements sophisticated prompt engineering techniques for enhanced AI interactions
 */

export type PromptEngineeringMethod = 
  | 'zero-shot'
  | 'few-shot' 
  | 'chain-of-thought'
  | 'tree-of-thought'
  | 'role-playing'
  | 'instruction-tuning'
  | 'step-by-step'
  | 'socratic'
  | 'multi-perspective'
  | 'retrieval-augmented';

export interface PromptMethodConfig {
  id: PromptEngineeringMethod;
  name: string;
  description: string;
  category: 'reasoning' | 'instruction' | 'context' | 'creative';
  complexity: 'basic' | 'intermediate' | 'advanced';
  bestFor: string[];
  parameters: {
    [key: string]: {
      type: 'number' | 'string' | 'boolean' | 'array';
      default?: any;
      description: string;
      required?: boolean;
    };
  };
  template: string;
  examples?: {
    context: string;
    input: string;
    output: string;
  }[];
}

export interface PromptExecutionContext {
  method: PromptEngineeringMethod;
  parameters: Record<string, any>;
  basePrompt: string;
  variables: Record<string, any>;
  examples?: any[];
  context?: string;
  systemRole?: string;
  constraints?: string[];
}

/**
 * Advanced prompt engineering method configurations
 */
export const PROMPT_ENGINEERING_METHODS: Record<PromptEngineeringMethod, PromptMethodConfig> = {
  'zero-shot': {
    id: 'zero-shot',
    name: 'Zero-Shot',
    description: 'Direct task execution without examples or training',
    category: 'instruction',
    complexity: 'basic',
    bestFor: ['simple tasks', 'clear instructions', 'well-defined problems'],
    parameters: {
      temperature: {
        type: 'number',
        default: 0.7,
        description: 'Controls randomness in responses (0.0-1.0)'
      },
      maxTokens: {
        type: 'number',
        default: 1000,
        description: 'Maximum response length'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

{basePrompt}

{constraints}

Please provide a comprehensive response.`,
    examples: [
      {
        context: 'UX Research Planning',
        input: 'Create a user interview guide for a mobile banking app',
        output: 'Comprehensive interview guide with structured questions'
      }
    ]
  },

  'few-shot': {
    id: 'few-shot',
    name: 'Few-Shot Learning',
    description: 'Learning from a few examples to understand the pattern',
    category: 'context',
    complexity: 'intermediate',
    bestFor: ['pattern recognition', 'specific formats', 'consistent outputs'],
    parameters: {
      exampleCount: {
        type: 'number',
        default: 3,
        description: 'Number of examples to provide',
        required: true
      },
      temperature: {
        type: 'number',
        default: 0.5,
        description: 'Lower temperature for more consistent pattern following'
      },
      shuffleExamples: {
        type: 'boolean',
        default: false,
        description: 'Randomize example order to reduce bias'
      }
    },
    template: `{systemRole}

Task: {task}

Here are some examples of how to approach this task:

{examples}

{context}

Now, please apply the same approach to:
{basePrompt}

{constraints}

Follow the pattern demonstrated in the examples above.`,
    examples: [
      {
        context: 'Persona Creation',
        input: 'Create personas based on user research data',
        output: 'Structured personas following established format'
      }
    ]
  },

  'chain-of-thought': {
    id: 'chain-of-thought',
    name: 'Chain-of-Thought',
    description: 'Step-by-step reasoning process for complex problem solving',
    category: 'reasoning',
    complexity: 'advanced',
    bestFor: ['complex analysis', 'multi-step processes', 'logical reasoning'],
    parameters: {
      reasoning_steps: {
        type: 'number',
        default: 5,
        description: 'Number of reasoning steps to include'
      },
      show_work: {
        type: 'boolean',
        default: true,
        description: 'Show detailed reasoning process'
      },
      verify_logic: {
        type: 'boolean',
        default: true,
        description: 'Include logic verification steps'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

{basePrompt}

Let's approach this step by step:

1. **Analysis**: First, I'll analyze the problem and identify key components
2. **Planning**: Next, I'll develop a structured approach 
3. **Execution**: Then, I'll work through each component systematically
4. **Synthesis**: After that, I'll combine the results into a coherent solution
5. **Validation**: Finally, I'll verify the solution meets requirements

{constraints}

Please work through this systematically, showing your reasoning at each step.`,
    examples: [
      {
        context: 'Usability Testing Design',
        input: 'Design a comprehensive usability testing protocol',
        output: 'Step-by-step protocol with detailed reasoning'
      }
    ]
  },

  'tree-of-thought': {
    id: 'tree-of-thought',
    name: 'Tree-of-Thought',
    description: 'Explores multiple reasoning paths and selects the best approach',
    category: 'reasoning',
    complexity: 'advanced',
    bestFor: ['complex decisions', 'multiple solutions', 'strategic thinking'],
    parameters: {
      branches: {
        type: 'number',
        default: 3,
        description: 'Number of reasoning branches to explore'
      },
      depth: {
        type: 'number',
        default: 3,
        description: 'Depth of exploration for each branch'
      },
      evaluation_criteria: {
        type: 'array',
        default: ['feasibility', 'effectiveness', 'efficiency'],
        description: 'Criteria for evaluating different approaches'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

{basePrompt}

I'll explore multiple approaches to solve this problem:

**Approach 1**: [First reasoning path]
- Step 1.1: [Initial consideration]
- Step 1.2: [Development]
- Step 1.3: [Conclusion]
- Evaluation: [Pros/Cons based on criteria]

**Approach 2**: [Second reasoning path]
- Step 2.1: [Initial consideration]
- Step 2.2: [Development] 
- Step 2.3: [Conclusion]
- Evaluation: [Pros/Cons based on criteria]

**Approach 3**: [Third reasoning path]
- Step 3.1: [Initial consideration]
- Step 3.2: [Development]
- Step 3.3: [Conclusion]
- Evaluation: [Pros/Cons based on criteria]

**Final Decision**: Based on the evaluation criteria ({evaluation_criteria}), I recommend [chosen approach] because [reasoning].

{constraints}`,
    examples: [
      {
        context: 'UX Strategy Planning',
        input: 'Develop UX strategy for a new product launch',
        output: 'Multiple strategic approaches with evaluation and recommendation'
      }
    ]
  },

  'role-playing': {
    id: 'role-playing',
    name: 'Role-Playing',
    description: 'Adopts specific professional personas with domain expertise',
    category: 'creative',
    complexity: 'intermediate',
    bestFor: ['domain expertise', 'perspective-taking', 'specialized knowledge'],
    parameters: {
      role: {
        type: 'string',
        default: 'Senior UX Researcher',
        description: 'Professional role to adopt',
        required: true
      },
      experience_level: {
        type: 'string',
        default: '10+ years',
        description: 'Level of experience for the role'
      },
      industry_focus: {
        type: 'string',
        default: 'technology',
        description: 'Industry specialization'
      },
      personality_traits: {
        type: 'array',
        default: ['analytical', 'detail-oriented', 'user-focused'],
        description: 'Key personality characteristics'
      }
    },
    template: `I am a {role} with {experience_level} of experience in {industry_focus}. My approach is characterized by being {personality_traits}.

Given my expertise and background, I'll address this task:

Task: {task}

{context}

{basePrompt}

Drawing from my professional experience, here's how I would approach this:

[Perspective from the adopted role]

{constraints}

*Responding as a {role} with deep expertise in {industry_focus}*`,
    examples: [
      {
        context: 'Research Planning',
        input: 'Plan user research for a healthcare application',
        output: 'Expert perspective with healthcare-specific considerations'
      }
    ]
  },

  'instruction-tuning': {
    id: 'instruction-tuning',
    name: 'Instruction Tuning',
    description: 'Highly structured instructions with specific formatting requirements',
    category: 'instruction',
    complexity: 'intermediate',
    bestFor: ['precise outputs', 'consistent formatting', 'specific requirements'],
    parameters: {
      format_requirements: {
        type: 'array',
        default: ['structured sections', 'bullet points', 'clear headings'],
        description: 'Specific formatting requirements'
      },
      output_length: {
        type: 'string',
        default: 'comprehensive',
        description: 'Expected output length (brief, moderate, comprehensive, detailed)'
      },
      include_examples: {
        type: 'boolean',
        default: true,
        description: 'Include practical examples in output'
      }
    },
    template: `{systemRole}

**INSTRUCTIONS**: Follow these precise guidelines:

1. **Task**: {task}
2. **Context**: {context}
3. **Requirements**: {format_requirements}
4. **Output Length**: {output_length}
5. **Include Examples**: {include_examples}

**SPECIFIC REQUEST**:
{basePrompt}

**FORMAT REQUIREMENTS**:
- Use clear section headers
- Include bullet points for key items
- Provide specific, actionable guidance
- {include_examples ? 'Include practical examples' : 'Focus on principles without examples'}

**CONSTRAINTS**:
{constraints}

**OUTPUT**: Provide a {output_length} response following all specified requirements.`,
    examples: [
      {
        context: 'Documentation Creation',
        input: 'Create UX process documentation',
        output: 'Structured documentation with specific formatting'
      }
    ]
  },

  'step-by-step': {
    id: 'step-by-step',
    name: 'Step-by-Step',
    description: 'Sequential process breakdown with clear progression',
    category: 'instruction',
    complexity: 'basic',
    bestFor: ['process documentation', 'tutorials', 'implementation guides'],
    parameters: {
      step_numbering: {
        type: 'boolean',
        default: true,
        description: 'Use numbered steps'
      },
      include_substeps: {
        type: 'boolean',
        default: true,
        description: 'Break down complex steps into sub-steps'
      },
      time_estimates: {
        type: 'boolean',
        default: false,
        description: 'Include time estimates for each step'
      },
      prerequisites: {
        type: 'boolean',
        default: true,
        description: 'List prerequisites before steps'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

{prerequisites ? '**Prerequisites**: [List any requirements before starting]' : ''}

**Step-by-Step Process**:

{basePrompt}

Please break this down into clear, sequential steps:

Step 1: [First action]
{include_substeps ? '  1.1: [Sub-step if needed]\n  1.2: [Sub-step if needed]' : ''}
{time_estimates ? '  ⏱️ Estimated time: [X minutes/hours]' : ''}

Step 2: [Second action]
{include_substeps ? '  2.1: [Sub-step if needed]\n  2.2: [Sub-step if needed]' : ''}
{time_estimates ? '  ⏱️ Estimated time: [X minutes/hours]' : ''}

[Continue for all necessary steps]

{constraints}`,
    examples: [
      {
        context: 'User Testing Setup',
        input: 'Set up a usability testing session',
        output: 'Sequential steps for testing session preparation'
      }
    ]
  },

  'socratic': {
    id: 'socratic',
    name: 'Socratic Method',
    description: 'Question-driven approach to guide thinking and discovery',
    category: 'reasoning',
    complexity: 'advanced',
    bestFor: ['problem exploration', 'critical thinking', 'assumption challenging'],
    parameters: {
      question_depth: {
        type: 'number',
        default: 3,
        description: 'Levels of questioning depth'
      },
      focus_area: {
        type: 'string',
        default: 'assumptions',
        description: 'Primary focus for questioning (assumptions, goals, methods, outcomes)'
      },
      guidance_level: {
        type: 'string',
        default: 'moderate',
        description: 'Level of guidance provided (minimal, moderate, substantial)'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

Instead of directly solving this, let me guide you through a discovery process:

**Initial Question**: {basePrompt}

**Exploratory Questions**:
1. What assumptions are we making about [key aspect]?
2. How might we verify these assumptions?
3. What alternative approaches could we consider?

**Deeper Analysis**:
- What evidence supports our current thinking?
- What evidence might contradict it?
- How do different stakeholders view this problem?

**Synthesis Questions**:
- What patterns emerge from this analysis?
- What are the implications of these insights?
- How should this influence our approach?

**Action Planning**:
- Based on this exploration, what should we do next?
- What additional information do we need?
- How will we measure success?

{constraints}

*This approach encourages critical thinking and thorough exploration rather than quick answers.*`,
    examples: [
      {
        context: 'Problem Definition',
        input: 'Define the core UX problem for a struggling product',
        output: 'Question-driven exploration leading to problem clarity'
      }
    ]
  },

  'multi-perspective': {
    id: 'multi-perspective',
    name: 'Multi-Perspective',
    description: 'Examines issues from multiple stakeholder viewpoints',
    category: 'creative',
    complexity: 'advanced',
    bestFor: ['stakeholder analysis', 'comprehensive solutions', 'conflict resolution'],
    parameters: {
      perspectives: {
        type: 'array',
        default: ['user', 'business', 'technical', 'stakeholder'],
        description: 'Different viewpoints to consider'
      },
      perspective_depth: {
        type: 'string',
        default: 'detailed',
        description: 'Depth of analysis for each perspective (brief, moderate, detailed)'
      },
      synthesis_approach: {
        type: 'string',
        default: 'integrated',
        description: 'How to combine perspectives (integrated, comparative, prioritized)'
      }
    },
    template: `{systemRole}

Task: {task}

{context}

I'll examine this from multiple perspectives:

**User Perspective**:
- Needs: [What users need and want]
- Pain Points: [Current frustrations and barriers]
- Goals: [What users are trying to achieve]
- Success Metrics: [How users measure success]

**Business Perspective**:
- Objectives: [Business goals and KPIs]
- Constraints: [Budget, time, resource limitations]
- Opportunities: [Potential business benefits]
- Risks: [Business risks and concerns]

**Technical Perspective**:
- Feasibility: [Technical implementation considerations]
- Constraints: [Technical limitations and requirements]
- Architecture: [System and platform implications]
- Maintenance: [Long-term technical considerations]

**Stakeholder Perspective**:
- Internal Stakeholders: [Team, management, departments]
- External Stakeholders: [Partners, vendors, regulators]
- Influence: [Who has decision-making power]
- Concerns: [Stakeholder-specific issues]

**Integrated Solution**:
{basePrompt}

Considering all perspectives, here's a balanced approach:
[Synthesis of all viewpoints into actionable solution]

{constraints}`,
    examples: [
      {
        context: 'Feature Planning',
        input: 'Plan a new feature for a collaborative platform',
        output: 'Multi-stakeholder analysis with integrated recommendations'
      }
    ]
  },

  'retrieval-augmented': {
    id: 'retrieval-augmented',
    name: 'Retrieval-Augmented Generation',
    description: 'Combines external knowledge sources with generation',
    category: 'context',
    complexity: 'advanced',
    bestFor: ['research-backed outputs', 'knowledge synthesis', 'evidence-based recommendations'],
    parameters: {
      knowledge_sources: {
        type: 'array',
        default: ['project_knowledge', 'industry_standards', 'best_practices'],
        description: 'Types of knowledge sources to incorporate'
      },
      citation_style: {
        type: 'string',
        default: 'integrated',
        description: 'How to reference sources (integrated, footnotes, inline)'
      },
      knowledge_weight: {
        type: 'number',
        default: 0.7,
        description: 'Weight given to retrieved knowledge vs. generated content'
      }
    },
    template: `{systemRole}

Task: {task}

**Available Knowledge Sources**:
{context}

**Knowledge Integration**:
Based on the available knowledge sources ({knowledge_sources}), I'll provide a response that combines:
- Relevant information from project documentation
- Industry best practices and standards  
- Research-backed methodologies
- Contextual insights from similar projects

**Request**:
{basePrompt}

**Evidence-Based Response**:
[Drawing from available knowledge sources while generating new insights]

**Sources Referenced**:
- Project Knowledge: [Relevant project information used]
- Industry Standards: [Applicable standards and guidelines]
- Best Practices: [Proven methodologies applied]
- Additional Context: [Other relevant information]

{constraints}

*This response integrates retrieved knowledge with generated insights for maximum accuracy and relevance.*`,
    examples: [
      {
        context: 'Research Planning',
        input: 'Plan user research using project knowledge and industry standards',
        output: 'Knowledge-augmented research plan with cited sources'
      }
    ]
  }
};

/**
 * Prompt Engineering Method Processor
 */
export class PromptMethodProcessor {
  private methods: Record<PromptEngineeringMethod, PromptMethodConfig>;

  constructor() {
    this.methods = PROMPT_ENGINEERING_METHODS;
  }

  /**
   * Process a prompt using a specific engineering method
   */
  processPrompt(context: PromptExecutionContext): string {
    const method = this.methods[context.method];
    if (!method) {
      throw new Error(`Unknown prompt engineering method: ${context.method}`);
    }

    // Start with the method template
    let processedPrompt = method.template;

    // Replace template variables
    const replacements: Record<string, string> = {
      systemRole: context.systemRole || this.getDefaultSystemRole(context.method),
      task: String(context.variables.task || ''),
      context: context.context || '',
      basePrompt: context.basePrompt,
      constraints: context.constraints?.map(c => `- ${c}`).join('\n') || '',
      ...this.processMethodParameters(method, context.parameters),
      ...this.convertVariablesToStrings(context.variables)
    };

    // Handle examples for few-shot and similar methods
    if (context.examples && ['few-shot', 'retrieval-augmented'].includes(context.method)) {
      replacements.examples = this.formatExamples(context.examples, context.method);
    }

    // Replace all variables in the template
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processedPrompt = processedPrompt.replace(regex, value);
    });

    // Clean up any remaining template variables
    processedPrompt = processedPrompt.replace(/{[^}]+}/g, '');

    // Clean up extra whitespace
    processedPrompt = processedPrompt
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return processedPrompt;
  }

  /**
   * Get available methods filtered by criteria
   */
  getMethodsByCategory(category: PromptMethodConfig['category']): PromptMethodConfig[] {
    return Object.values(this.methods).filter(method => method.category === category);
  }

  /**
   * Get methods by complexity level
   */
  getMethodsByComplexity(complexity: PromptMethodConfig['complexity']): PromptMethodConfig[] {
    return Object.values(this.methods).filter(method => method.complexity === complexity);
  }

  /**
   * Get recommended method for a specific use case
   */
  getRecommendedMethod(useCase: string): PromptMethodConfig[] {
    return Object.values(this.methods).filter(method => 
      method.bestFor.some(scenario => 
        scenario.toLowerCase().includes(useCase.toLowerCase()) ||
        useCase.toLowerCase().includes(scenario.toLowerCase())
      )
    );
  }

  /**
   * Validate method parameters
   */
  validateParameters(method: PromptEngineeringMethod, parameters: Record<string, any>): {
    isValid: boolean;
    errors: string[];
  } {
    const methodConfig = this.methods[method];
    if (!methodConfig) {
      return { isValid: false, errors: [`Unknown method: ${method}`] };
    }

    const errors: string[] = [];

    Object.entries(methodConfig.parameters).forEach(([paramName, paramConfig]) => {
      const value = parameters[paramName];

      // Check required parameters
      if (paramConfig.required && (value === undefined || value === null)) {
        errors.push(`Parameter '${paramName}' is required`);
        return;
      }

      // Skip validation for optional missing parameters
      if (value === undefined || value === null) return;

      // Type validation
      switch (paramConfig.type) {
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Parameter '${paramName}' must be a number`);
          }
          break;
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Parameter '${paramName}' must be a string`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Parameter '${paramName}' must be a boolean`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Parameter '${paramName}' must be an array`);
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get method configuration
   */
  getMethodConfig(method: PromptEngineeringMethod): PromptMethodConfig | undefined {
    return this.methods[method];
  }

  /**
   * Get all available methods
   */
  getAllMethods(): PromptMethodConfig[] {
    return Object.values(this.methods);
  }

  // Private helper methods

  private getDefaultSystemRole(method: PromptEngineeringMethod): string {
    const roleMap: Record<PromptEngineeringMethod, string> = {
      'zero-shot': 'You are an expert UX professional.',
      'few-shot': 'You are an expert UX professional who learns from examples.',
      'chain-of-thought': 'You are an analytical UX expert who thinks step-by-step.',
      'tree-of-thought': 'You are a strategic UX expert who explores multiple approaches.',
      'role-playing': 'You are a specialized UX professional.',
      'instruction-tuning': 'You are a precise UX professional who follows detailed instructions.',
      'step-by-step': 'You are a methodical UX professional who creates clear processes.',
      'socratic': 'You are a thoughtful UX mentor who guides through questioning.',
      'multi-perspective': 'You are a comprehensive UX strategist who considers all viewpoints.',
      'retrieval-augmented': 'You are a research-driven UX professional who synthesizes knowledge.'
    };

    return roleMap[method] || 'You are an expert UX professional.';
  }

  private processMethodParameters(method: PromptMethodConfig, parameters: Record<string, any>): Record<string, string> {
    const processed: Record<string, string> = {};

    Object.entries(method.parameters).forEach(([key, config]) => {
      const value = parameters[key] !== undefined ? parameters[key] : config.default;
      
      if (Array.isArray(value)) {
        processed[key] = value.join(', ');
      } else {
        processed[key] = String(value);
      }
    });

    return processed;
  }

  private formatExamples(examples: any[], method: PromptEngineeringMethod): string {
    if (!examples || examples.length === 0) return '';

    return examples.map((example, index) => {
      if (typeof example === 'string') {
        return `Example ${index + 1}: ${example}`;
      }
      
      if (typeof example === 'object' && example.input && example.output) {
        return `Example ${index + 1}:
Input: ${example.input}
Output: ${example.output}`;
      }

      return `Example ${index + 1}: ${JSON.stringify(example)}`;
    }).join('\n\n');
  }

  private convertVariablesToStrings(variables: Record<string, any>): Record<string, string> {
    const stringVars: Record<string, string> = {};
    
    Object.entries(variables).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        stringVars[key] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        stringVars[key] = JSON.stringify(value);
      } else {
        stringVars[key] = String(value ?? '');
      }
    });

    return stringVars;
  }
}

// Export singleton instance
export const promptMethodProcessor = new PromptMethodProcessor();