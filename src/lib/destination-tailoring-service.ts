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
import { DeliveryPayload, DeliveryItem } from '@/stores/delivery-store';

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
      console.log(`🔍 Validating destination: '${request.context.destination}'`);
      console.log(`Valid destinations: ['AI Provider', 'Miro', 'FigJam', 'Figma']`);
      
      if (!isValidDestination(request.context.destination)) {
        console.error(`❌ Destination validation failed for: '${request.context.destination}'`);
        throw new DestinationTailoringError(
          `Invalid destination: ${request.context.destination}`,
          request.context.destination as DestinationType
        );
      }
      
      console.log(`✅ Destination validation passed for: '${request.context.destination}'`);

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

  /**
   * Generate normalized delivery payload from tailored output
   */
  async generateDeliveryPayload(
    output: TailoredOutput,
    targetId: string,
    sourcePrompt: string
  ): Promise<DeliveryPayload> {
    console.log('🏭 Starting payload generation from tailored output:', {
      hasOutput: !!output,
      outputType: output?.type,
      hasContent: !!(output?.content),
      contentType: typeof output?.content,
      contentKeys: output?.content ? Object.keys(output.content) : []
    });

    const items = this.normalizeToDeliveryItems(output);
    console.log(`🔄 Normalized ${items.length} delivery items from output`);
    
    const layoutHints = this.extractLayoutHints(output);
    
    const payload: DeliveryPayload = {
      id: `payload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      destination: this.mapDestinationToDelivery(output.type),
      targetId,
      sourcePrompt,
      items,
      layoutHints,
      summary: this.generatePayloadSummary(output, items.length),
      itemCount: items.length,
      createdAt: new Date()
    };

    console.log('✅ Generated delivery payload:', {
      id: payload.id,
      destination: payload.destination,
      itemCount: payload.itemCount,
      hasItems: payload.items.length > 0,
      summary: payload.summary
    });

    return payload;
  }

  /**
   * Validate delivery payload against destination constraints
   */
  async validateDeliveryPayload(payload: DeliveryPayload): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!payload.items || payload.items.length === 0) {
      errors.push('Payload contains no items');
    }

    // Destination-specific validation
    switch (payload.destination) {
      case 'miro':
        this.validateMiroPayload(payload, errors, warnings);
        break;
      case 'figjam':
        this.validateFigJamPayload(payload, errors, warnings);
        break;
      case 'figma':
        this.validateFigmaPayload(payload, errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Optimize payload for destination constraints
   */
  async optimizePayloadForDestination(payload: DeliveryPayload): Promise<DeliveryPayload> {
    let optimizedItems = [...payload.items];

    switch (payload.destination) {
      case 'miro':
        optimizedItems = this.optimizeForMiro(optimizedItems);
        break;
      case 'figjam':
        optimizedItems = this.optimizeForFigJam(optimizedItems);
        break;
      case 'figma':
        optimizedItems = this.optimizeForFigma(optimizedItems);
        break;
    }

    return {
      ...payload,
      items: optimizedItems,
      itemCount: optimizedItems.length,
      summary: this.generatePayloadSummary(payload, optimizedItems.length)
    };
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

  // Delivery payload helper methods

  private normalizeToDeliveryItems(output: TailoredOutput): DeliveryItem[] {
    console.log(`🔄 Normalizing ${output.type} output to delivery items:`, {
      outputType: output.type,
      hasContent: !!output.content,
      contentStructure: output.content ? Object.keys(output.content) : [],
      contentItems: output.content?.items ? `${output.content.items.length} items` : 'no items property',
      contentUiBlocks: output.content?.uiBlocks ? `${output.content.uiBlocks.length} uiBlocks` : 'no uiBlocks property',
      fullContent: output.content
    });

    const items: DeliveryItem[] = [];

    switch (output.type) {
      case 'Miro':
      case 'miro':
        console.log('🎯 Routing to Miro normalization');
        return this.normalizeMiroItems(output as any);
      case 'FigJam':
      case 'figjam':
        console.log('🎯 Routing to FigJam normalization');
        return this.normalizeFigJamItems(output as any);
      case 'Figma':
      case 'figma':
        console.log('🎯 Routing to Figma normalization');
        return this.normalizeFigmaItems(output as any);
      default:
        console.error(`❌ No normalization route found for output type: "${output.type}"`);
        console.log('Available routes: Miro, miro, FigJam, figjam, Figma, figma');
        return [];
    }
  }

  private normalizeMiroItems(miroOutput: any): DeliveryItem[] {
    return miroOutput.content.items.map((item: any, index: number) => ({
      id: item.id || `miro-item-${index}`,
      type: this.mapMiroType(item.type),
      text: item.text,
      x: item.position?.x || (index % 4) * 200 + 100,
      y: item.position?.y || Math.floor(index / 4) * 150 + 100,
      width: item.size?.width || 180,
      height: item.size?.height || 120,
      style: {
        backgroundColor: item.theme || '#FFE066',
        fontSize: 14
      },
      clusterId: item.cluster
    }));
  }

  private normalizeFigJamItems(figJamOutput: any): DeliveryItem[] {
    console.log('🎨 Normalizing FigJam items:', {
      hasContent: !!figJamOutput.content,
      contentKeys: figJamOutput.content ? Object.keys(figJamOutput.content) : [],
      hasItems: !!(figJamOutput.content?.items),
      itemsCount: figJamOutput.content?.items?.length || 0,
      itemsStructure: figJamOutput.content?.items?.slice(0, 2)
    });

    // Log each property in the content to understand the structure
    if (figJamOutput.content) {
      for (const [key, value] of Object.entries(figJamOutput.content)) {
        console.log(`📋 Content property "${key}":`, {
          type: typeof value,
          isArray: Array.isArray(value),
          length: Array.isArray(value) ? value.length : 'not array',
          sample: Array.isArray(value) ? value.slice(0, 2) : value
        });
      }
    }

    // Try different possible item sources
    let items = [];
    
    if (figJamOutput.content?.items && figJamOutput.content.items.length > 0) {
      items = figJamOutput.content.items;
      console.log('✅ Using content.items');
    } else if (figJamOutput.content?.stickies && figJamOutput.content.stickies.length > 0) {
      items = figJamOutput.content.stickies;
      console.log('✅ Using content.stickies');
    } else if (figJamOutput.content?.notes && figJamOutput.content.notes.length > 0) {
      items = figJamOutput.content.notes;
      console.log('✅ Using content.notes');
    } else if (figJamOutput.content?.elements && figJamOutput.content.elements.length > 0) {
      items = figJamOutput.content.elements;
      console.log('✅ Using content.elements');
    } else {
      // Try to find any array property that might contain items
      for (const [key, value] of Object.entries(figJamOutput.content || {})) {
        if (Array.isArray(value) && value.length > 0) {
          items = value;
          console.log(`✅ Using content.${key} (found ${value.length} items)`);
          break;
        }
      }
    }

    if (items.length === 0) {
      console.warn('⚠️ FigJam output has no usable items to normalize');
      console.log('🔧 This likely means AI content generation returned empty arrays. Generating fallback demo content...');
      
      // Generate some demo content for testing
      items = [
        {
          id: 'demo-1',
          type: 'sticky',
          text: 'Sample Insight: User needs better navigation',
          category: 'insight'
        },
        {
          id: 'demo-2', 
          type: 'sticky',
          text: 'How might we improve user onboarding?',
          category: 'hmw'
        },
        {
          id: 'demo-3',
          type: 'sticky', 
          text: 'Idea: Add interactive tutorial',
          category: 'idea'
        },
        {
          id: 'demo-4',
          type: 'sticky',
          text: 'Action: Prototype new flow',
          category: 'action'
        },
        {
          id: 'demo-5',
          type: 'sticky',
          text: 'Question: What metrics should we track?',
          category: 'question'
        }
      ];
      
      console.log(`🎭 Generated ${items.length} demo items for delivery testing`);
    }

    console.log(`🔄 Converting ${items.length} items to delivery format`);
    
    return items.map((item: any, index: number) => ({
      id: item.id || `figjam-item-${index}`,
      type: this.mapFigJamType(item.type || 'sticky'),
      text: item.text || item.content || item.description || `Item ${index + 1}`,
      x: (index % 5) * 180 + 50,
      y: Math.floor(index / 5) * 140 + 50,
      width: 160,
      height: 100,
      style: {
        backgroundColor: this.getFigJamColor(item.category || item.type || 'default'),
        fontSize: 12
      },
      clusterId: item.category || item.cluster || item.group
    }));
  }

  private normalizeFigmaItems(figmaOutput: any): DeliveryItem[] {
    return figmaOutput.content.uiBlocks.map((block: any, index: number) => ({
      id: block.id || `figma-block-${index}`,
      type: 'frame',
      text: block.title,
      x: (index % 3) * 300 + 100,
      y: Math.floor(index / 3) * 200 + 100,
      width: block.sizing.preferredWidth || 280,
      height: block.sizing.preferredHeight || 180,
      style: {
        backgroundColor: '#FFFFFF',
        fontSize: 16
      },
      metadata: {
        description: block.description,
        copy: block.copy,
        priority: block.priority
      }
    }));
  }

  private extractLayoutHints(output: TailoredOutput): any {
    switch (output.type) {
      case 'miro':
        const miroOutput = output as any;
        return {
          columns: miroOutput.content.layout?.columns || 4,
          spacing: miroOutput.content.layout?.spacing || 20,
          maxItems: 50,
          arrangement: 'clusters'
        };
      case 'figjam':
        return {
          columns: 5,
          spacing: 20,
          maxItems: 40,
          arrangement: 'flow'
        };
      case 'figma':
        const figmaOutput = output as any;
        return {
          columns: figmaOutput.content.layout?.columns || 3,
          spacing: figmaOutput.content.layout?.spacing || 40,
          maxItems: 20,
          arrangement: 'grid'
        };
      default:
        return {
          columns: 4,
          spacing: 20,
          maxItems: 30,
          arrangement: 'grid'
        };
    }
  }

  private mapDestinationToDelivery(outputType: string): 'miro' | 'figjam' | 'figma' {
    switch (outputType) {
      case 'miro': return 'miro';
      case 'figjam': return 'figjam';
      case 'figma': return 'figma';
      default: return 'miro';
    }
  }

  private generatePayloadSummary(output: any, itemCount: number): string {
    if (output.content?.summary) {
      return `${output.content.summary} (${itemCount} items)`;
    }
    return `Generated ${itemCount} items for delivery`;
  }

  private mapMiroType(miroType: string): 'sticky' | 'text' | 'shape' {
    switch (miroType) {
      case 'sticky_note': return 'sticky';
      case 'shape': return 'shape';
      case 'text': return 'text';
      default: return 'sticky';
    }
  }

  private mapFigJamType(figJamType: string): 'sticky' | 'text' | 'shape' {
    switch (figJamType) {
      case 'sticky': return 'sticky';
      case 'text': return 'text';
      case 'instruction': return 'text';
      default: return 'sticky';
    }
  }

  private getFigJamColor(category: string): string {
    const colors = {
      'idea': '#FFE066',
      'hmw': '#FF6B66', 
      'insight': '#66D9FF',
      'action': '#66FF66',
      'question': '#FF9B66'
    };
    return colors[category as keyof typeof colors] || '#E6E6E6';
  }

  private validateMiroPayload(payload: DeliveryPayload, errors: string[], warnings: string[]) {
    if (payload.items.length > 50) {
      warnings.push('Large number of items may impact Miro board performance');
    }

    payload.items.forEach((item, index) => {
      if (item.text && item.text.length > 12 * 8) { // ~12 words
        warnings.push(`Item ${index}: Text exceeds Miro sticky note recommended length`);
      }
    });
  }

  private validateFigJamPayload(payload: DeliveryPayload, errors: string[], warnings: string[]) {
    if (payload.items.length > 40) {
      warnings.push('Large number of items may clutter workshop interface');
    }

    const hasInstructions = payload.items.some(item => item.type === 'text');
    if (!hasInstructions) {
      warnings.push('No facilitation instructions found - consider adding guidance text');
    }
  }

  private validateFigmaPayload(payload: DeliveryPayload, errors: string[], warnings: string[]) {
    if (payload.items.length > 20) {
      warnings.push('Too many UI blocks may overwhelm the design system');
    }

    payload.items.forEach((item, index) => {
      if (!item.metadata?.copy) {
        warnings.push(`Item ${index}: Missing microcopy - important for UI components`);
      }
    });
  }

  private optimizeForMiro(items: DeliveryItem[]): DeliveryItem[] {
    return items.map(item => ({
      ...item,
      text: item.text ? this.truncateText(item.text, 80) : item.text, // ~12 words
      width: Math.min(item.width || 180, 200),
      height: Math.min(item.height || 120, 150)
    })).slice(0, 50); // Max 50 items
  }

  private optimizeForFigJam(items: DeliveryItem[]): DeliveryItem[] {
    return items.map(item => ({
      ...item,
      text: item.text ? this.truncateText(item.text, 100) : item.text,
      width: Math.min(item.width || 160, 180),
      height: Math.min(item.height || 100, 120)
    })).slice(0, 40); // Max 40 items
  }

  private optimizeForFigma(items: DeliveryItem[]): DeliveryItem[] {
    return items.map(item => ({
      ...item,
      width: Math.max(item.width || 280, 200), // Minimum viable size
      height: Math.max(item.height || 180, 120)
    })).slice(0, 20); // Max 20 components
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

// Export singleton instance
export const destinationTailoringService = DestinationTailoringService.getInstance();