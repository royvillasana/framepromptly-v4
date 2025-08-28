/**
 * @fileoverview Destination Tailoring Service
 * Main orchestrator for the destination-driven prompt tailoring system
 */

import {
  DestinationType,
  DestinationContext,
  TailoringRequest,
  TailoringResponse,
  TailoredOutput,
  AIProviderType,
  DestinationTailoringError,
  ValidationError,
  isValidDestination
} from './destination-driven-tailoring';

import {
  getDestinationTailor,
  validateDestinationOutput
} from './destination-tailors';

import { GeneratedPrompt } from '@/stores/prompt-store';

/**
 * Main Destination Tailoring Service
 * Orchestrates the entire tailoring process with validation and error handling
 */
export class DestinationTailoringService {
  private static instance: DestinationTailoringService;
  
  static getInstance(): DestinationTailoringService {
    if (!this.instance) {
      this.instance = new DestinationTailoringService();
    }
    return this.instance;
  }

  /**
   * Main tailoring method - MANDATORY before any prompt execution
   */
  async tailorPromptForDestination(request: TailoringRequest): Promise<TailoringResponse> {
    try {
      // Validate destination
      if (!isValidDestination(request.context.destination)) {
        throw new DestinationTailoringError(
          `Invalid destination: ${request.context.destination}`,
          request.context.destination as DestinationType
        );
      }

      // Get the appropriate tailor
      const tailor = getDestinationTailor(request.context.destination);
      
      // Generate the tailored prompt
      const tailoredPrompt = tailor.tailorPrompt(request.context);
      
      // Create expected output template
      const expectedOutput = tailor.getOutputTemplate();
      
      // Validate if requested
      let validationErrors: string[] = [];
      if (request.enforceValidation) {
        const validation = tailor.validateOutput(expectedOutput);
        validationErrors = validation.errors;
      }

      // Generate clarifying questions if user input was ambiguous
      const clarifyingQuestions = this.generateClarifyingQuestions(request.context);

      return {
        success: true,
        tailoredPrompt,
        expectedOutput,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
        clarifyingQuestions: clarifyingQuestions.length > 0 ? clarifyingQuestions : undefined
      };

    } catch (error) {
      console.error('Destination tailoring failed:', error);
      
      if (error instanceof DestinationTailoringError) {
        throw error;
      }
      
      throw new DestinationTailoringError(
        `Tailoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        request.context.destination
      );
    }
  }

  /**
   * Create destination context from GeneratedPrompt
   */
  createContextFromPrompt(
    prompt: GeneratedPrompt,
    destination: DestinationType,
    aiProvider?: AIProviderType,
    userIntent?: string
  ): DestinationContext {
    return {
      destination,
      aiProvider,
      userIntent: userIntent || `Generate insights for ${prompt.context.tool.name}`,
      originalPrompt: prompt.content,
      variables: prompt.variables,
      metadata: {
        framework: prompt.context.framework.name,
        stage: prompt.context.stage.name,
        tool: prompt.context.tool.name,
        industry: prompt.industry,
        teamSize: prompt.context.enhancedContext?.teamSize,
        timeConstraints: prompt.context.enhancedContext?.timeConstraints,
        experience: prompt.context.enhancedContext?.experience
      }
    };
  }

  /**
   * Validate tailored output against destination requirements
   */
  validateTailoredOutput(
    output: TailoredOutput,
    destination: DestinationType,
    maxRetries: number = 3
  ): { valid: boolean; errors: string[]; shouldRetry: boolean } {
    const validation = validateDestinationOutput(output, destination);
    
    // Determine if we should retry based on error types
    const retryableErrors = [
      'exceeds word limit',
      'missing required section', 
      'incorrect format',
      'validation failed'
    ];
    
    const shouldRetry = maxRetries > 0 && validation.errors.some(error =>
      retryableErrors.some(retryable => error.toLowerCase().includes(retryable))
    );

    return {
      valid: validation.valid,
      errors: validation.errors,
      shouldRetry
    };
  }

  /**
   * Route output to appropriate handler based on destination
   */
  routeOutput(output: TailoredOutput): {
    displayContent: string;
    actionableData?: any;
    integrationPayload?: any;
  } {
    switch (output.type) {
      case 'ai-provider':
        return this.routeAIProviderOutput(output);
      case 'miro':
        return this.routeMiroOutput(output);
      case 'figjam':
        return this.routeFigJamOutput(output);
      case 'figma':
        return this.routeFigmaOutput(output);
      default:
        throw new DestinationTailoringError(
          `Unknown output type for routing: ${(output as any).type}`,
          'AI Provider'
        );
    }
  }

  /**
   * Get supported destinations
   */
  getSupportedDestinations(): DestinationType[] {
    return ['AI Provider', 'Miro', 'FigJam', 'Figma'];
  }

  /**
   * Get AI provider options
   */
  getSupportedAIProviders(): AIProviderType[] {
    return ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Other'];
  }

  /**
   * Check if destination requires additional setup
   */
  requiresIntegration(destination: DestinationType): boolean {
    return ['Miro', 'FigJam', 'Figma'].includes(destination);
  }

  // Private helper methods

  private generateClarifyingQuestions(context: DestinationContext): string[] {
    const questions: string[] = [];
    
    // Check for ambiguous user intent
    if (!context.userIntent || context.userIntent.length < 20) {
      questions.push('What specific outcome are you hoping to achieve?');
    }
    
    // Check for missing context
    if (!context.metadata?.industry) {
      questions.push('What industry or domain is this for?');
    }
    
    if (!context.metadata?.teamSize) {
      questions.push('How large is your team or target audience?');
    }
    
    if (!context.variables || Object.keys(context.variables).length === 0) {
      questions.push('Are there any specific constraints or requirements we should consider?');
    }
    
    // Destination-specific questions
    if (context.destination === 'Miro' && !context.metadata?.teamSize) {
      questions.push('How many people will be collaborating on this Miro board?');
    }
    
    if (context.destination === 'FigJam' && !context.metadata?.timeConstraints) {
      questions.push('How much time do you have for the workshop session?');
    }
    
    if (context.destination === 'Figma' && !context.metadata?.experience) {
      questions.push('What is the technical expertise level of your target users?');
    }

    return questions.slice(0, 5); // Max 5 questions as specified
  }

  private routeAIProviderOutput(output: TailoredOutput) {
    const aiOutput = output as any; // Type assertion for AI provider output
    
    const displayContent = `
# ${aiOutput.content.summary}

## Analysis Results
${aiOutput.content.structuredResult.sections.map((section: any) => 
  `### ${section.title} (${section.priority})
${section.content}`
).join('\n\n')}

## Key Artifacts
${aiOutput.content.structuredResult.artifacts.map((artifact: any) => 
  `- **${artifact.title}**: ${artifact.description} (Priority: ${artifact.priority})`
).join('\n')}

## Next Steps
${aiOutput.content.structuredResult.nextSteps.map((step: any, index: number) => 
  `${index + 1}. ${step}`
).join('\n')}

## Validation Notes
**Assumptions**: ${aiOutput.content.structuredResult.validation.assumptions.join(', ')}
**Risks**: ${aiOutput.content.structuredResult.validation.risks.join(', ')}
**Evidence Required**: ${aiOutput.content.structuredResult.validation.evidenceRequired.join(', ')}
`;

    return {
      displayContent,
      actionableData: aiOutput.content.structuredResult,
      integrationPayload: null
    };
  }

  private routeMiroOutput(output: TailoredOutput) {
    const miroOutput = output as any; // Type assertion for Miro output
    
    const displayContent = `
# Miro Board: ${miroOutput.content.boardSummary}

## Board Items (${miroOutput.content.items.length})
${miroOutput.content.items.map((item: any) => 
  `- ${item.type.toUpperCase()}: "${item.text}" (${item.theme}, Cluster: ${item.cluster})`
).join('\n')}

## Clusters
${miroOutput.content.clusters.map((cluster: any) => 
  `### ${cluster.name}
${cluster.description} (${cluster.itemIds.length} items)`
).join('\n\n')}

## Layout Instructions
- **Columns**: ${miroOutput.content.layout.columns}
- **Spacing**: ${miroOutput.content.layout.spacing}px
- **Reading**: ${miroOutput.content.layout.readingInstructions}
`;

    return {
      displayContent,
      actionableData: miroOutput.content,
      integrationPayload: {
        type: 'miro',
        items: miroOutput.content.items,
        clusters: miroOutput.content.clusters,
        layout: miroOutput.content.layout
      }
    };
  }

  private routeFigJamOutput(output: TailoredOutput) {
    const figJamOutput = output as any; // Type assertion for FigJam output
    
    const displayContent = `
# Workshop: ${figJamOutput.content.workshopTitle}

## Facilitation Script
${figJamOutput.content.facilitationScript.map((step: any) => 
  `### Step ${step.step} (${step.duration})
${step.instruction}
*Materials: ${step.materials.join(', ')}*`
).join('\n\n')}

## Workshop Items (${figJamOutput.content.items.length})
${figJamOutput.content.items.map((item: any) => 
  `- ${item.type.toUpperCase()}: "${item.text}" (${item.category})`
).join('\n')}

## Clustering Framework
${figJamOutput.content.clusters.map((cluster: any) => 
  `### ${cluster.name}
Criteria: ${cluster.criteria} (${cluster.itemIds.length} items)`
).join('\n\n')}

${figJamOutput.content.assumptions.length > 0 ? `
## Assumptions
${figJamOutput.content.assumptions.map((assumption: any) => `- ${assumption}`).join('\n')}
` : ''}
`;

    return {
      displayContent,
      actionableData: figJamOutput.content,
      integrationPayload: {
        type: 'figjam',
        workshopTitle: figJamOutput.content.workshopTitle,
        items: figJamOutput.content.items,
        script: figJamOutput.content.facilitationScript,
        clusters: figJamOutput.content.clusters
      }
    };
  }

  private routeFigmaOutput(output: TailoredOutput) {
    const figmaOutput = output as any; // Type assertion for Figma output
    
    const displayContent = `
# Design System: ${figmaOutput.content.designSystem}

## UI Components (${figmaOutput.content.uiBlocks.length})
${figmaOutput.content.uiBlocks.map((block: any) => 
  `### ${block.title} (${block.type}, Priority: ${block.priority})
${block.description}
**Size**: ${block.sizing.preferredWidth}x${block.sizing.preferredHeight}px
**Copy**: ${Object.entries(block.copy).map(([key, value]) => `${key}: "${value}"`).join(', ')}`
).join('\n\n')}

## Layout Specifications
- **Columns**: ${figmaOutput.content.layout.columns}
- **Spacing**: ${figmaOutput.content.layout.spacing}px
- **Order**: ${figmaOutput.content.layout.ordering.join(' → ')}

## Content Style Guide
- **Tone**: ${figmaOutput.content.contentStyle.tone}
- **Reading Level**: ${figmaOutput.content.contentStyle.readingLevel}
- **Accessibility**: ${figmaOutput.content.contentStyle.accessibility.contrastRequirements}
`;

    return {
      displayContent,
      actionableData: figmaOutput.content,
      integrationPayload: {
        type: 'figma',
        designSystem: figmaOutput.content.designSystem,
        components: figmaOutput.content.uiBlocks,
        layout: figmaOutput.content.layout,
        style: figmaOutput.content.contentStyle
      }
    };
  }
}

// Export singleton instance
export const destinationTailoringService = DestinationTailoringService.getInstance();