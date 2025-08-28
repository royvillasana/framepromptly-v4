/**
 * @fileoverview Destination-Driven Prompt Tailoring System
 * Core system for tailoring prompts specifically for different destination tools
 */

import { GeneratedPrompt } from '@/stores/prompt-store';

// Valid destination types (exact values as specified)
export type DestinationType = 
  | 'AI Provider' 
  | 'Miro' 
  | 'FigJam' 
  | 'Figma';

// AI Provider sub-types for more specific tailoring
export type AIProviderType = 
  | 'ChatGPT' 
  | 'Claude' 
  | 'Gemini' 
  | 'DeepSeek' 
  | 'Other';

export interface DestinationContext {
  destination: DestinationType;
  aiProvider?: AIProviderType;
  userIntent: string;
  originalPrompt: string;
  variables?: Record<string, string>;
  metadata?: {
    framework?: string;
    stage?: string;
    tool?: string;
    industry?: string;
    teamSize?: number;
    timeConstraints?: 'flexible' | 'standard' | 'tight';
    experience?: 'beginner' | 'intermediate' | 'expert';
  };
}

// Tailored output structures for each destination
export interface AIProviderOutput {
  type: 'ai-provider';
  destination: DestinationType;
  aiProvider?: AIProviderType;
  content: {
    summary: string;
    structuredResult: {
      sections: Array<{
        title: string;
        content: string;
        priority: 'high' | 'medium' | 'low';
      }>;
      artifacts: Array<{
        type: string;
        title: string;
        description: string;
        priority: number;
      }>;
      nextSteps: string[];
      validation: {
        assumptions: string[];
        risks: string[];
        evidenceRequired: string[];
      };
    };
    metadata: {
      clarifyingQuestions?: string[];
      inferredDefaults?: Record<string, any>;
    };
  };
}

export interface MiroOutput {
  type: 'miro';
  destination: 'Miro';
  content: {
    boardSummary: string;
    items: Array<{
      id: string;
      type: 'sticky' | 'text' | 'shape';
      text: string; // ≤12 words for stickies
      theme: string;
      cluster: string;
      width?: number;
      height?: number;
      position: {
        row: number;
        column: number;
      };
    }>;
    clusters: Array<{
      name: string;
      description: string;
      itemIds: string[];
    }>;
    layout: {
      columns: number;
      spacing: number;
      readingInstructions: string;
    };
  };
}

export interface FigJamOutput {
  type: 'figjam';
  destination: 'FigJam';
  content: {
    workshopTitle: string;
    items: Array<{
      id: string;
      type: 'sticky' | 'text' | 'shape';
      text: string; // ≤10 words for stickies
      category: string;
      cluster: string;
      affinityMapping?: {
        impact: 'low' | 'medium' | 'high';
        effort: 'low' | 'medium' | 'high';
      };
    }>;
    facilitationScript: Array<{
      step: number;
      instruction: string;
      duration: string;
      materials: string[];
    }>;
    clusters: Array<{
      name: string;
      criteria: string;
      itemIds: string[];
    }>;
    assumptions: string[];
  };
}

export interface FigmaOutput {
  type: 'figma';
  destination: 'Figma';
  content: {
    designSystem: string;
    uiBlocks: Array<{
      id: string;
      title: string;
      type: 'Hero' | 'Card' | 'Form Row' | 'Navigation' | 'Footer' | 'Content Block';
      description: string;
      copy: {
        heading?: string;
        subheading?: string;
        body?: string;
        cta?: string;
        labels?: string[];
        helperText?: string[];
      };
      sizing: {
        preferredWidth: number;
        preferredHeight: number;
        padding: number;
        spacing: number;
      };
      priority: number;
    }>;
    layout: {
      columns: number;
      spacing: number;
      ordering: string[];
    };
    contentStyle: {
      tone: string;
      readingLevel: string;
      accessibility: {
        contrastRequirements: string;
        labelClarity: string[];
        altTextGuidelines: string;
      };
    };
  };
}

export type TailoredOutput = AIProviderOutput | MiroOutput | FigJamOutput | FigmaOutput;

// Tailoring request and response interfaces
export interface TailoringRequest {
  context: DestinationContext;
  enforceValidation?: boolean;
  maxRetries?: number;
}

export interface TailoringResponse {
  success: boolean;
  tailoredPrompt: string;
  expectedOutput: TailoredOutput;
  validationErrors?: string[];
  clarifyingQuestions?: string[];
}

// Validation rules for each destination
export interface ValidationRule {
  destination: DestinationType;
  rules: Array<{
    field: string;
    constraint: string;
    errorMessage: string;
    validate: (output: TailoredOutput) => boolean;
  }>;
}

// Base class for destination-specific tailors
export abstract class DestinationTailor {
  abstract destination: DestinationType;
  
  abstract tailorPrompt(context: DestinationContext): string;
  abstract validateOutput(output: TailoredOutput): { valid: boolean; errors: string[] };
  abstract getOutputTemplate(): TailoredOutput;
  
  protected buildBasePrompt(context: DestinationContext): string {
    return `
DESTINATION: ${context.destination}${context.aiProvider ? ` (${context.aiProvider})` : ''}
USER INTENT: ${context.userIntent}

ORIGINAL PROMPT CONTEXT:
${context.originalPrompt}

${context.metadata ? `
METADATA:
- Framework: ${context.metadata.framework || 'Not specified'}
- Stage: ${context.metadata.stage || 'Not specified'}  
- Tool: ${context.metadata.tool || 'Not specified'}
- Industry: ${context.metadata.industry || 'General'}
- Team Size: ${context.metadata.teamSize || 'Not specified'}
- Experience Level: ${context.metadata.experience || 'intermediate'}
- Time Constraints: ${context.metadata.timeConstraints || 'standard'}
` : ''}

${context.variables && Object.keys(context.variables).length > 0 ? `
VARIABLES PROVIDED:
${Object.entries(context.variables).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
` : ''}`;
  }

  protected addQualityGuards(prompt: string): string {
    return prompt + `

QUALITY GUARDS:
- If the user input is too short or ambiguous, infer reasonable defaults and clearly mark them as [INFERRED]
- Include validation checks for key assumptions
- Provide fallbacks for ambiguous inputs
- Ensure all outputs are structured and ready for downstream use
- Flag any risks or missing information that could impact quality

VALIDATION REQUIREMENTS:
- All outputs must be well-structured and actionable
- Include metadata about assumptions, risks, and evidence requirements
- Provide clear next steps where applicable
- Ensure content is appropriate for the target destination's workflow`;
  }
}

// Error classes for destination tailoring
export class DestinationTailoringError extends Error {
  constructor(
    message: string,
    public destination: DestinationType,
    public validationErrors?: string[]
  ) {
    super(message);
    this.name = 'DestinationTailoringError';
  }
}

export class ValidationError extends DestinationTailoringError {
  constructor(destination: DestinationType, errors: string[]) {
    super(`Validation failed for ${destination}`, destination, errors);
    this.name = 'ValidationError';
  }
}

// Utility functions
export function isValidDestination(destination: string): destination is DestinationType {
  return ['AI Provider', 'Miro', 'FigJam', 'Figma'].includes(destination);
}

export function getDestinationIcon(destination: DestinationType): string {
  const icons = {
    'AI Provider': '🤖',
    'Miro': '📋',
    'FigJam': '🎨', 
    'Figma': '🎯'
  };
  return icons[destination];
}

export function getDestinationDescription(destination: DestinationType): string {
  const descriptions = {
    'AI Provider': 'Structured AI response for analysis and insights',
    'Miro': 'Board-ready sticky notes and visual elements',
    'FigJam': 'Workshop-oriented brainstorming and collaboration',
    'Figma': 'UI-focused design blocks and components'
  };
  return descriptions[destination];
}