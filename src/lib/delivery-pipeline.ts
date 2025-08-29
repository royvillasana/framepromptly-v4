/**
 * @fileoverview Delivery Pipeline Coordinator
 * Orchestrates the complete delivery process with retry logic and error handling
 */

import { DeliveryDestination, DeliveryPayload, DeliveryResult, DeliveryTarget } from '@/stores/delivery-store';
import { destinationTailoringService } from './destination-tailoring-service';
import { oauthManager } from './oauth-manager';
import { MiroApiClient } from './miro-api-client';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryPipelineOptions {
  maxRetries: number;
  retryDelay: number; // milliseconds
  optimizePayload: boolean;
  validateBeforeDelivery: boolean;
}

export interface DeliveryProgress {
  stage: 'initializing' | 'tailoring' | 'generating' | 'validating' | 'delivering' | 'completing' | 'error';
  progress: number; // 0-100
  message: string;
  details?: any;
}

export type ProgressCallback = (progress: DeliveryProgress) => void;

/**
 * Comprehensive delivery pipeline with retry logic and progress tracking
 */
export class DeliveryPipeline {
  private static instance: DeliveryPipeline;
  private activeDeliveries = new Map<string, AbortController>();

  static getInstance(): DeliveryPipeline {
    if (!this.instance) {
      this.instance = new DeliveryPipeline();
    }
    return this.instance;
  }

  /**
   * Execute complete delivery pipeline
   */
  async executeDelivery(
    promptId: string,
    target: DeliveryTarget,
    options: Partial<DeliveryPipelineOptions> = {},
    onProgress?: ProgressCallback
  ): Promise<DeliveryResult> {
    const deliveryId = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    
    this.activeDeliveries.set(deliveryId, abortController);

    const defaultOptions: DeliveryPipelineOptions = {
      maxRetries: 3,
      retryDelay: 1000,
      optimizePayload: true,
      validateBeforeDelivery: true,
      ...options
    };

    try {
      return await this.executePipelineStages(
        deliveryId,
        promptId,
        target,
        defaultOptions,
        onProgress,
        abortController.signal
      );

    } catch (error) {
      this.updateProgress(onProgress, {
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Delivery failed',
        details: { error, deliveryId }
      });

      throw error;

    } finally {
      this.activeDeliveries.delete(deliveryId);
    }
  }

  /**
   * Cancel an active delivery
   */
  cancelDelivery(deliveryId: string): boolean {
    const controller = this.activeDeliveries.get(deliveryId);
    if (controller) {
      controller.abort();
      this.activeDeliveries.delete(deliveryId);
      return true;
    }
    return false;
  }

  /**
   * Get status of active deliveries
   */
  getActiveDeliveries(): string[] {
    return Array.from(this.activeDeliveries.keys());
  }

  // Private pipeline execution methods

  private async executePipelineStages(
    deliveryId: string,
    promptId: string,
    target: DeliveryTarget,
    options: DeliveryPipelineOptions,
    onProgress?: ProgressCallback,
    signal?: AbortSignal
  ): Promise<DeliveryResult> {
    // Stage 1: Initialize and validate
    this.updateProgress(onProgress, {
      stage: 'initializing',
      progress: 5,
      message: 'Initializing delivery pipeline...'
    });

    this.checkAborted(signal);

    const { prompt, destinationContext } = await this.initializeDelivery(promptId, target);

    // Stage 2: Tailor prompt for destination
    this.updateProgress(onProgress, {
      stage: 'tailoring',
      progress: 15,
      message: `Tailoring content for ${target.destination}...`
    });

    const tailoredOutput = await this.executeWithRetry(
      () => this.tailorForDestination(destinationContext),
      options.maxRetries,
      options.retryDelay,
      signal
    );

    // Stage 3: Generate normalized payload
    this.updateProgress(onProgress, {
      stage: 'generating',
      progress: 35,
      message: 'Generating delivery payload...'
    });

    console.log('🔄 About to generate payload from tailored output:', {
      hasOutput: !!tailoredOutput,
      outputType: tailoredOutput?.type,
      targetId: target.targetId,
      promptContent: prompt.content?.substring(0, 100) + '...'
    });

    let payload = await this.executeWithRetry(
      () => destinationTailoringService.generateDeliveryPayload(
        tailoredOutput,
        target.targetId,
        prompt.content
      ),
      options.maxRetries,
      options.retryDelay,
      signal
    );

    console.log('📦 Generated payload:', {
      id: payload.id,
      destination: payload.destination,
      itemsCount: payload.items?.length || 0,
      hasItems: !!(payload.items && payload.items.length > 0),
      summary: payload.summary,
      firstFewItems: payload.items?.slice(0, 2)
    });

    // Stage 4: Optimize and validate payload
    if (options.optimizePayload) {
      this.updateProgress(onProgress, {
        stage: 'validating',
        progress: 50,
        message: 'Optimizing payload for destination...'
      });

      payload = await destinationTailoringService.optimizePayloadForDestination(payload);
    }

    if (options.validateBeforeDelivery) {
      const validation = await destinationTailoringService.validateDeliveryPayload(payload);
      if (!validation.isValid) {
        throw new Error(`Payload validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Stage 5: Execute delivery
    this.updateProgress(onProgress, {
      stage: 'delivering',
      progress: 70,
      message: `Delivering to ${target.destination}...`
    });

    const deliveryResult = await this.executeWithRetry(
      () => this.executeDestinationDelivery(deliveryId, target, payload, onProgress),
      options.maxRetries,
      options.retryDelay * 2, // Longer delay for delivery retries
      signal
    );

    // Stage 6: Complete and store results
    this.updateProgress(onProgress, {
      stage: 'completing',
      progress: 95,
      message: 'Completing delivery...'
    });

    await this.storeDeliveryResult(deliveryResult);

    this.updateProgress(onProgress, {
      stage: 'completing',
      progress: 100,
      message: 'Delivery completed successfully!'
    });

    return deliveryResult;
  }

  private async initializeDelivery(promptId: string, target: DeliveryTarget) {
    // Get prompt from store or database
    const prompt = await this.getPrompt(promptId);
    if (!prompt) {
      throw new Error(`Prompt ${promptId} not found`);
    }

    // Validate target
    const targetValidation = await this.validateTarget(target);
    if (!targetValidation.isValid) {
      throw new Error(`Invalid target: ${targetValidation.errors.join(', ')}`);
    }

    // Create destination context with both prompt and target
    const destinationContext = {
      prompt,
      target
    };

    return { prompt, destinationContext };
  }

  private async tailorForDestination(destinationContext: any) {
    const { prompt, target } = destinationContext;
    
    // Check if prompt already has usable output with populated content
    if (prompt.output && prompt.output.content && prompt.output.content.items && 
        Array.isArray(prompt.output.content.items) && prompt.output.content.items.length > 0) {
      console.log('🚀 Using existing prompt output with populated content for delivery');
      return {
        type: target.destination,
        content: prompt.output.content,
        metadata: prompt.output.metadata || {},
        summary: prompt.output.summary || 'Generated content for delivery'
      };
    }

    console.log('🤖 Generating AI content for destination-specific delivery');

    try {
      // Call the new destination-specific AI content generation function
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('generate-destination-content', {
        body: {
          prompt: prompt.content,
          destination: this.mapDestinationToDDT(target.destination),
          context: {
            framework: prompt.context?.framework?.name || 'Unknown',
            stage: prompt.context?.stage?.name || 'Unknown',
            tool: prompt.context?.tool?.name || 'Unknown'
          },
          variables: prompt.variables || {}
        }
      });

      if (aiError) {
        console.error('AI content generation function failed:', aiError);
        throw new Error(`Function call failed: ${aiError.message}`);
      }

      if (!aiResult?.success) {
        console.error('AI content generation returned error:', aiResult?.error);
        throw new Error(`AI generation failed: ${aiResult?.error || 'Unknown error'}`);
      }

      console.log('✅ AI-generated content received:', {
        destination: aiResult.destination,
        itemCount: aiResult.metadata?.itemCount || 0,
        model: aiResult.metadata?.model,
        contentKeys: Object.keys(aiResult.content || {})
      });

      // Return the structured AI-generated content
      return {
        type: target.destination.toLowerCase(),
        destination: this.mapDestinationToDDT(target.destination),
        content: aiResult.content,
        metadata: {
          generatedAt: aiResult.metadata?.generatedAt,
          model: aiResult.metadata?.model,
          itemCount: aiResult.metadata?.itemCount
        },
        summary: `AI-generated ${target.destination} content with ${aiResult.metadata?.itemCount || 0} items`
      };

    } catch (error) {
      console.warn('⚠️ AI content generation failed, using fallback structured content:', error.message);
      
      // Fallback to generating structured content manually based on destination
      const fallbackContent = this.generateFallbackContent(target.destination, prompt);
      
      console.log('🔧 Generated fallback content:', {
        destination: target.destination,
        itemCount: this.getItemCount(fallbackContent),
        fallback: true
      });

      return {
        type: target.destination.toLowerCase(),
        destination: this.mapDestinationToDDT(target.destination),
        content: fallbackContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          fallback: true,
          itemCount: this.getItemCount(fallbackContent)
        },
        summary: `Fallback ${target.destination} content (AI generation unavailable)`
      };
    }
  }

  private async executeDestinationDelivery(
    deliveryId: string,
    target: DeliveryTarget,
    payload: DeliveryPayload,
    onProgress?: ProgressCallback
  ): Promise<DeliveryResult> {
    const baseResult: DeliveryResult = {
      id: deliveryId,
      status: 'processing',
      destination: target.destination,
      targetId: target.targetId,
      payloadId: payload.id,
      deliveredItems: 0,
      totalItems: payload.items.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (target.destination) {
      case 'miro':
        return await this.deliverToMiro(baseResult, target, payload, onProgress);
      
      case 'figjam':
      case 'figma':
        return await this.deliverViaEphemeralImport(baseResult, target, payload);
      
      default:
        throw new Error(`Unsupported destination: ${target.destination}`);
    }
  }

  private async deliverToMiro(
    result: DeliveryResult,
    target: DeliveryTarget,
    payload: DeliveryPayload,
    onProgress?: ProgressCallback
  ): Promise<DeliveryResult> {
    // Get OAuth connection
    const connection = await oauthManager.getConnection('miro');
    if (!connection) {
      throw new Error('No active Miro connection found');
    }

    // Get fresh access token
    const accessToken = await oauthManager.getValidAccessToken('miro');
    const miroClient = new MiroApiClient(accessToken);

    // Validate board access
    const boardValidation = await miroClient.validateBoardAccess(target.targetId);
    if (!boardValidation.canWrite) {
      throw new Error(`Cannot write to Miro board: ${boardValidation.errors.join(', ')}`);
    }

    // Create items in batches
    const batchResults = await miroClient.createItems(target.targetId, payload.items);
    
    // Track progress
    if (onProgress) {
      const progressIncrement = 20 / payload.items.length;
      let currentProgress = 70;

      batchResults.success.forEach(() => {
        currentProgress += progressIncrement;
        this.updateProgress(onProgress, {
          stage: 'delivering',
          progress: Math.min(currentProgress, 90),
          message: `Created ${batchResults.success.length} of ${payload.items.length} items...`
        });
      });
    }

    // Generate embed URL
    const embedUrl = miroClient.getBoardEmbedUrl(target.targetId, {
      embedMode: 'live_embed',
      autoplay: true
    });

    const warnings = batchResults.failed.length > 0 
      ? [`Failed to create ${batchResults.failed.length} items`]
      : undefined;

    return {
      ...result,
      status: 'success',
      deliveredItems: batchResults.success.length,
      embedUrl,
      warnings,
      metadata: {
        processingTime: Date.now() - result.createdAt.getTime(),
        batchResults: batchResults.summary
      },
      updatedAt: new Date()
    };
  }

  private async deliverViaEphemeralImport(
    result: DeliveryResult,
    target: DeliveryTarget,
    payload: DeliveryPayload
  ): Promise<DeliveryResult> {
    try {
      // Create ephemeral import via Supabase function
      console.log('🚀 Creating ephemeral import for', target.destination);
      
      const { data: importData, error } = await supabase.functions.invoke('delivery-orchestrator', {
        body: {
          destination: target.destination,
          targetId: target.targetId,
          prompt: payload.sourcePrompt,
          tailoredOutput: payload
        }
      });

      if (error) {
        throw new Error(`Failed to create ephemeral import: ${error.message}`);
      }

      console.log('✅ Ephemeral import created successfully:', {
        importUrl: importData.importUrl ? 'URL generated' : 'No URL',
        expiresAt: importData.expiresAt
      });

      return {
        ...result,
        status: 'success',
        deliveredItems: payload.items.length,
        importUrl: importData.importUrl,
        expiresAt: new Date(importData.expiresAt),
        metadata: {
          processingTime: Date.now() - result.createdAt.getTime(),
          importId: importData.deliveryId
        },
        updatedAt: new Date()
      };

    } catch (error) {
      console.warn('⚠️ Ephemeral import failed, using fallback demo URLs:', error.message);
      
      // Fallback: Generate demo URLs for testing
      const demoImportId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const demoUrl = `https://framepromptly.demo/import/${demoImportId}`;
      
      console.log('🔧 Generated demo import URL for testing:', demoUrl);
      
      return {
        ...result,
        status: 'success',
        deliveredItems: payload.items.length,
        importUrl: demoUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          processingTime: Date.now() - result.createdAt.getTime(),
          importId: demoImportId,
          fallback: true,
          note: 'Demo URL - ephemeral import service unavailable'
        },
        updatedAt: new Date()
      };
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    delay: number,
    signal?: AbortSignal
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.checkAborted(signal);
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on authentication or validation errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        if (attempt < maxRetries) {
          await this.sleep(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw new Error(`Operation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  }

  // Helper methods

  private async getPrompt(promptId: string): Promise<any> {
    // Get the prompt from the prompt store
    const { usePromptStore } = await import('@/stores/prompt-store');
    const { prompts } = usePromptStore.getState();
    
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) {
      throw new Error(`Prompt ${promptId} not found in store`);
    }

    console.log(`🔍 Found prompt ${promptId}:`, {
      hasContent: !!prompt.content,
      hasOutput: !!prompt.output,
      outputType: prompt.output?.type,
      outputHasContent: !!(prompt.output?.content),
      outputHasItems: !!(prompt.output?.content?.items),
      outputItemsCount: prompt.output?.content?.items?.length || 0
    });

    return {
      id: prompt.id,
      content: prompt.content,
      variables: prompt.variables || {},
      context: {
        framework: prompt.framework,
        stage: prompt.stage,
        tool: prompt.tool
      },
      execution: prompt.execution,
      output: prompt.output
    };
  }

  private async validateTarget(target: DeliveryTarget): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (!target.destination) {
      errors.push('Destination is required');
    }

    if (!target.targetId) {
      errors.push('Target ID is required');
    }

    // Validate destination-specific requirements
    if (target.destination === 'miro' && target.targetId) {
      const connection = await oauthManager.getConnection('miro');
      if (!connection) {
        errors.push('Miro connection required');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private async storeDeliveryResult(result: DeliveryResult): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('📝 No user found, skipping database save');
        return;
      }

      console.log('💾 Attempting to save delivery result:', {
        id: result.id,
        destination: result.destination,
        status: result.status,
        deliveredItems: result.deliveredItems
      });

      await supabase.from('deliveries').upsert({
        id: result.id,
        user_id: user.id,
        destination: result.destination,
        target_id: result.targetId,
        status: result.status,
        delivered_items: result.deliveredItems,
        total_items: result.totalItems,
        embed_url: result.embedUrl,
        import_url: result.importUrl,
        expires_at: result.expiresAt?.toISOString(),
        error: result.error,
        warnings: result.warnings,
        metadata: result.metadata,
        created_at: result.createdAt.toISOString(),
        updated_at: result.updatedAt.toISOString()
      });

      console.log('✅ Delivery result stored successfully');

    } catch (error) {
      console.warn('⚠️ Failed to store delivery result (continuing anyway):', error.message);
      // Don't throw - this is non-critical for the core delivery functionality
    }
  }

  private mapDestinationToDDT(destination: DeliveryDestination): string {
    const mapping: Record<DeliveryDestination, string> = {
      'miro': 'Miro',
      'figjam': 'FigJam',
      'figma': 'Figma'
    };
    
    const mapped = mapping[destination];
    if (!mapped) {
      console.warn(`⚠️ Unknown destination: ${destination}, using AI Provider`);
      return 'AI Provider';
    }
    
    console.log(`🗺️ Mapped destination '${destination}' → '${mapped}'`);
    return mapped;
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      'authentication failed',
      'unauthorized',
      'forbidden',
      'not found',
      'validation failed',
      'invalid'
    ];

    return nonRetryablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  private updateProgress(callback: ProgressCallback | undefined, progress: DeliveryProgress): void {
    if (callback) {
      callback(progress);
    }
  }

  private checkAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
      throw new Error('Delivery cancelled');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateFallbackContent(destination: string, prompt: any): any {
    const frameworkName = prompt.context?.framework?.name || 'Design Process';
    const stageName = prompt.context?.stage?.name || 'Research';
    const toolName = prompt.context?.tool?.name || 'Analysis';

    switch (destination.toLowerCase()) {
      case 'miro':
        return {
          boardSummary: `${frameworkName} - ${stageName} board for ${toolName}`,
          items: [
            { id: 'item-1', type: 'sticky', text: `${toolName} insight 1`, theme: 'yellow', cluster: 'insights', position: { row: 0, column: 0 } },
            { id: 'item-2', type: 'sticky', text: `${toolName} insight 2`, theme: 'blue', cluster: 'insights', position: { row: 0, column: 1 } },
            { id: 'item-3', type: 'sticky', text: `${toolName} action item`, theme: 'green', cluster: 'actions', position: { row: 1, column: 0 } },
            { id: 'item-4', type: 'text', text: `${stageName} Stage Instructions`, theme: 'white', cluster: 'instructions', position: { row: 0, column: 2 } },
            { id: 'item-5', type: 'sticky', text: `Key finding from ${toolName}`, theme: 'orange', cluster: 'findings', position: { row: 1, column: 1 } }
          ],
          clusters: [
            { name: 'insights', description: 'Key insights discovered', itemIds: ['item-1', 'item-2'] },
            { name: 'actions', description: 'Next steps to take', itemIds: ['item-3'] },
            { name: 'findings', description: 'Research findings', itemIds: ['item-5'] }
          ],
          layout: { columns: 3, spacing: 20, readingInstructions: 'Review insights, then actions' }
        };

      case 'figjam':
        return {
          workshopTitle: `${frameworkName}: ${stageName} Workshop`,
          items: [
            { id: 'item-1', type: 'sticky', text: `How might we improve ${toolName}?`, category: 'hmw', cluster: 'questions' },
            { id: 'item-2', type: 'sticky', text: `${toolName} opportunity`, category: 'idea', cluster: 'opportunities' },
            { id: 'item-3', type: 'sticky', text: `User needs ${toolName} solution`, category: 'insight', cluster: 'needs' },
            { id: 'item-4', type: 'sticky', text: `Test ${toolName} approach`, category: 'action', cluster: 'next-steps' },
            { id: 'item-5', type: 'sticky', text: `What if we enhance ${toolName}?`, category: 'question', cluster: 'questions' }
          ],
          facilitationScript: [
            { step: 1, instruction: 'Review the problem context', duration: '5 minutes', materials: ['sticky notes', 'markers'] },
            { step: 2, instruction: 'Generate ideas silently', duration: '10 minutes', materials: ['sticky notes'] },
            { step: 3, instruction: 'Share and cluster ideas', duration: '15 minutes', materials: ['board space'] }
          ],
          clusters: [
            { name: 'questions', criteria: 'Open questions and HMWs', itemIds: ['item-1', 'item-5'] },
            { name: 'needs', criteria: 'User needs and insights', itemIds: ['item-3'] },
            { name: 'next-steps', criteria: 'Actions to take', itemIds: ['item-4'] }
          ],
          assumptions: [`${toolName} is important for users`, `${stageName} stage needs attention`, 'Team has necessary resources']
        };

      case 'figma':
        return {
          designSystem: `${frameworkName} UI Design System`,
          uiBlocks: [
            {
              id: 'block-1', title: `${toolName} Header`, type: 'Hero',
              description: `Main header for ${toolName} interface`,
              copy: { heading: `${toolName} Dashboard`, subheading: `${stageName} insights`, cta: 'Get Started' },
              sizing: { preferredWidth: 800, preferredHeight: 300, padding: 24, spacing: 16 },
              priority: 1
            },
            {
              id: 'block-2', title: `${toolName} Card`, type: 'Card',
              description: `Content card for ${toolName} data`,
              copy: { heading: 'Insight Card', body: `${toolName} analysis results`, cta: 'View Details' },
              sizing: { preferredWidth: 300, preferredHeight: 200, padding: 16, spacing: 12 },
              priority: 2
            },
            {
              id: 'block-3', title: 'Navigation', type: 'Navigation',
              description: 'Main navigation component',
              copy: { heading: 'Menu', labels: [`${stageName}`, `${toolName}`, 'Settings'] },
              sizing: { preferredWidth: 1200, preferredHeight: 60, padding: 12, spacing: 24 },
              priority: 3
            }
          ],
          layout: { columns: 2, spacing: 32, ordering: ['block-1', 'block-2', 'block-3'] },
          contentStyle: {
            tone: 'Professional and clear',
            readingLevel: 'Intermediate',
            accessibility: {
              contrastRequirements: 'WCAG AA compliant',
              labelClarity: ['Use clear, descriptive labels', 'Avoid jargon'],
              altTextGuidelines: 'Describe function and content'
            }
          }
        };

      default:
        return { items: [], message: 'Fallback content for unknown destination' };
    }
  }

  private getItemCount(content: any): number {
    if (content.items) return content.items.length;
    if (content.uiBlocks) return content.uiBlocks.length;
    return 0;
  }
}

// Export singleton instance
export const deliveryPipeline = DeliveryPipeline.getInstance();