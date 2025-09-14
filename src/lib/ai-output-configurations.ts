/**
 * AI Output-Specific Prompt Configurations
 * 
 * This file contains customized instruction variations for different AI platforms
 * and design tools, optimized based on research of each platform's capabilities
 * and best practices as of 2024.
 */

export interface AIOutputOption {
  id: string;
  name: string;
  description: string;
  category: 'ai-assistant' | 'design-tool';
  icon?: string;
  color?: string;
}

export interface AIOutputConfiguration {
  id: string;
  prefixInstructions: string;
  suffixInstructions: string;
  structureModifications: {
    useMinimalPrompts?: boolean;
    includeExamples?: boolean;
    requireExplicitSteps?: boolean;
    emphasizeContext?: boolean;
    useNaturalLanguage?: boolean;
    includeCitations?: boolean;
  };
  tokenOptimization: {
    preferConcise?: boolean;
    encourageThinking?: boolean;
    limitLength?: boolean;
    maxCharacters?: number;
  };
}

export const AI_OUTPUT_OPTIONS: AIOutputOption[] = [
  {
    id: 'none',
    name: 'None',
    description: 'Standard prompt without AI-specific optimizations',
    category: 'ai-assistant',
    color: '#6B7280'
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    description: 'Optimized for web search-powered AI with real-time information',
    category: 'ai-assistant',
    color: '#3B82F6'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    description: 'Optimized for reasoning models with thinking patterns',
    category: 'ai-assistant',
    color: '#8B5CF6'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'Optimized for GPT-4 with clear instructions and context',
    category: 'ai-assistant',
    color: '#10B981'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Optimized for natural language with context and specificity',
    category: 'ai-assistant',
    color: '#F59E0B'
  },
  {
    id: 'miro',
    name: 'Miro AI',
    description: 'Optimized for visual collaboration and intelligent canvas',
    category: 'design-tool',
    color: '#FFD60A'
  },
  {
    id: 'figma',
    name: 'Figma AI',
    description: 'Optimized for design workflows and Dev Mode integration',
    category: 'design-tool',
    color: '#F24E1E'
  },
  {
    id: 'figjam',
    name: 'FigJam AI',
    description: 'Optimized for brainstorming and collaborative ideation',
    category: 'design-tool',
    color: '#A259FF'
  }
];

export const AI_OUTPUT_CONFIGURATIONS: Record<string, AIOutputConfiguration> = {
  none: {
    id: 'none',
    prefixInstructions: '',
    suffixInstructions: '',
    structureModifications: {},
    tokenOptimization: {}
  },

  perplexity: {
    id: 'perplexity',
    prefixInstructions: `PERPLEXITY AI OPTIMIZATION:
This prompt is optimized for Perplexity AI's web search capabilities. Please:
- Use specific, searchable terminology rather than general terms
- Include relevant timeframes when current information is needed
- Structure the response to leverage real-time web search results
- Focus on factual, well-sourced information

`,
    suffixInstructions: `

PERPLEXITY SEARCH GUIDANCE:
- If current/recent information is needed, specify the timeframe (e.g., "as of 2024")
- Use precise terminology that will yield quality search results
- Request citations from credible sources when applicable
- Structure the query to optimize web search retrieval`,
    structureModifications: {
      useMinimalPrompts: false,
      includeExamples: false,
      requireExplicitSteps: true,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: true
    },
    tokenOptimization: {
      preferConcise: false,
      encourageThinking: false,
      limitLength: false
    }
  },

  deepseek: {
    id: 'deepseek',
    prefixInstructions: `DEEPSEEK R1 OPTIMIZATION:
This prompt is optimized for DeepSeek R1's reasoning capabilities. 
Take your time and think carefully about this complex problem.
Start with the <think> tag to activate your thinking process.

`,
    suffixInstructions: `

DEEPSEEK REASONING GUIDANCE:
- Use minimal, clear instructions without forcing specific reasoning paths
- Allow the model's native reasoning to work without interference
- Focus on the problem description and desired output format
- Encourage thorough thinking for complex problems`,
    structureModifications: {
      useMinimalPrompts: true,
      includeExamples: false,
      requireExplicitSteps: false,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: true,
      encourageThinking: true,
      limitLength: false
    }
  },

  chatgpt: {
    id: 'chatgpt',
    prefixInstructions: `CHATGPT/GPT-4 OPTIMIZATION:
This prompt follows OpenAI's best practices for clear, specific instructions.
Context and detailed requirements are provided for optimal performance.

`,
    suffixInstructions: `

GPT-4 GUIDANCE:
- Be specific about context, outcome, length, format, and style
- Use delimiters to structure input clearly
- Provide explicit instructions without assuming intent
- Include relevant context and background information`,
    structureModifications: {
      useMinimalPrompts: false,
      includeExamples: true,
      requireExplicitSteps: true,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: false,
      encourageThinking: false,
      limitLength: false
    }
  },

  gemini: {
    id: 'gemini',
    prefixInstructions: `GOOGLE GEMINI OPTIMIZATION:
This prompt uses natural language and provides comprehensive context for Gemini.
Written as if speaking to a knowledgeable collaborator.

`,
    suffixInstructions: `

GEMINI GUIDANCE:
- Express complete thoughts in full sentences using natural language
- Provide specific context and relevant keywords
- Include expertise level and background for the task
- Break complex problems into manageable components if needed`,
    structureModifications: {
      useMinimalPrompts: false,
      includeExamples: true,
      requireExplicitSteps: false,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: false,
      encourageThinking: false,
      limitLength: true,
      maxCharacters: 4000
    }
  },

  miro: {
    id: 'miro',
    prefixInstructions: `MIRO AI OPTIMIZATION:
This content is designed for Miro's Intelligent Canvas where visual context drives AI understanding.
Focus on clear, action-oriented instructions that work with visual collaboration.

`,
    suffixInstructions: `

MIRO CANVAS GUIDANCE:
- Structure content for visual organization and sticky note format
- Design for collaborative team workflows and brainstorming
- Include clear action items and visual elements
- Consider the intelligent canvas will provide additional context`,
    structureModifications: {
      useMinimalPrompts: true,
      includeExamples: false,
      requireExplicitSteps: false,
      emphasizeContext: false,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: true,
      encourageThinking: false,
      limitLength: true,
      maxCharacters: 2000
    }
  },

  figma: {
    id: 'figma',
    prefixInstructions: `FIGMA AI OPTIMIZATION:
This content is optimized for Figma's design workflow and Dev Mode integration.
Focus on design-to-development handoff and creative iteration.

`,
    suffixInstructions: `

FIGMA DESIGN GUIDANCE:
- Structure for design system consistency and component reusability
- Include considerations for responsive design and accessibility
- Provide clear specifications for developer handoff
- Support iterative design exploration and First Draft capabilities`,
    structureModifications: {
      useMinimalPrompts: false,
      includeExamples: true,
      requireExplicitSteps: true,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: false,
      encourageThinking: false,
      limitLength: false
    }
  },

  figjam: {
    id: 'figjam',
    prefixInstructions: `FIGJAM AI OPTIMIZATION:
This content is designed for FigJam's brainstorming and collaborative ideation features.
Structure for team workshops, sticky note organization, and creative exploration.

`,
    suffixInstructions: `

FIGJAM BRAINSTORMING GUIDANCE:
- Format for sticky note organization and grouping
- Design for team collaboration and workshop facilitation
- Include icebreakers and conversation starters
- Support rapid ideation and synthesis of concepts`,
    structureModifications: {
      useMinimalPrompts: false,
      includeExamples: false,
      requireExplicitSteps: false,
      emphasizeContext: true,
      useNaturalLanguage: true,
      includeCitations: false
    },
    tokenOptimization: {
      preferConcise: true,
      encourageThinking: false,
      limitLength: true,
      maxCharacters: 1500
    }
  }
};

/**
 * Applies AI output-specific optimizations to a base prompt
 */
export function optimizePromptForOutput(
  basePrompt: string, 
  outputId: string
): string {
  if (outputId === 'none' || !AI_OUTPUT_CONFIGURATIONS[outputId]) {
    return basePrompt;
  }

  const config = AI_OUTPUT_CONFIGURATIONS[outputId];
  
  let optimizedPrompt = basePrompt;

  // Apply prefix instructions
  if (config.prefixInstructions) {
    optimizedPrompt = config.prefixInstructions + optimizedPrompt;
  }

  // Apply suffix instructions
  if (config.suffixInstructions) {
    optimizedPrompt = optimizedPrompt + config.suffixInstructions;
  }

  // Apply token optimization
  if (config.tokenOptimization.limitLength && config.tokenOptimization.maxCharacters) {
    const maxChars = config.tokenOptimization.maxCharacters;
    if (optimizedPrompt.length > maxChars) {
      // Trim while preserving the structure
      const prefixLength = config.prefixInstructions?.length || 0;
      const suffixLength = config.suffixInstructions?.length || 0;
      const availableForBase = maxChars - prefixLength - suffixLength;
      
      if (availableForBase > 100) {
        const trimmedBase = basePrompt.substring(0, availableForBase - 3) + '...';
        optimizedPrompt = (config.prefixInstructions || '') + trimmedBase + (config.suffixInstructions || '');
      }
    }
  }

  return optimizedPrompt;
}

/**
 * Gets the display configuration for an AI output option
 */
export function getAIOutputOption(outputId: string): AIOutputOption | undefined {
  return AI_OUTPUT_OPTIONS.find(option => option.id === outputId);
}

/**
 * Groups AI output options by category
 */
export function getGroupedAIOutputOptions(): Record<string, AIOutputOption[]> {
  return AI_OUTPUT_OPTIONS.reduce((groups, option) => {
    if (!groups[option.category]) {
      groups[option.category] = [];
    }
    groups[option.category].push(option);
    return groups;
  }, {} as Record<string, AIOutputOption[]>);
}