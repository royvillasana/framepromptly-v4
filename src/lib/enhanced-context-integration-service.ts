/**
 * @fileoverview Enhanced Context Integration Service
 * Main service that orchestrates enhanced context processing, workflow continuity, and variable handling
 */

import { 
  enhancedContextProcessor, 
  ContextSources, 
  ProcessedContext,
  ContextProcessingOptions 
} from './enhanced-context-processor';
import { 
  workflowContinuityManager, 
  WorkflowContinuityContext 
} from './workflow-continuity-manager';
import { 
  enhancedVariableHandler, 
  EnhancedVariable, 
  VariableContext,
  ProcessedTemplate 
} from './enhanced-variable-handler';
import { frameworkIntegrationService } from './framework-integration-service';

import { KnowledgeEntry, useKnowledgeStore } from '@/stores/knowledge-store';
import { GeneratedPrompt, usePromptStore } from '@/stores/prompt-store';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { EnhancedToolPromptTemplate, PromptVariable } from '@/lib/tool-templates-enhanced';

export interface IntegratedContextRequest {
  projectId: string;
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  template: EnhancedToolPromptTemplate;
  userInputs: Record<string, any>;
  userPreferences: {
    accessibilityLevel: 'basic' | 'enhanced' | 'comprehensive';
    outputDetailLevel: 'brief' | 'moderate' | 'comprehensive';
    includeResearchBacking: boolean;
    includeExamples: boolean;
    communicationStyle: 'formal' | 'conversational' | 'technical';
    industryFocus?: string;
  };
  processingOptions?: ContextProcessingOptions;
}

export interface IntegratedContextResponse {
  processedContext: ProcessedContext;
  workflowContinuity: WorkflowContinuityContext;
  enhancedVariables: EnhancedVariable[];
  processedTemplate: ProcessedTemplate;
  synthesizedPrompt: string;
  qualityMetrics: QualityMetrics;
  recommendations: string[];
  warnings: string[];
}

export interface QualityMetrics {
  contextRichness: number; // 0-1
  variableCompleteness: number; // 0-1
  workflowConsistency: number; // 0-1
  accessibilityCompliance: number; // 0-1
  overallQuality: number; // 0-1
  confidenceScore: number; // 0-1
}

/**
 * Enhanced Context Integration Service
 * Main orchestrator for all context processing capabilities
 */
export class EnhancedContextIntegrationService {
  private activeWorkflowSessions: Map<string, string> = new Map(); // projectId -> sessionId
  private contextCache: Map<string, IntegratedContextResponse> = new Map();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    console.log('Enhanced Context Integration Service initialized');
  }

  /**
   * Main method to process integrated context
   */
  async processIntegratedContext(
    request: IntegratedContextRequest
  ): Promise<IntegratedContextResponse> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    try {
      // 1. Gather all context sources
      const contextSources = await this.gatherContextSources(request);

      // 2. Process enhanced context
      const processedContext = await enhancedContextProcessor.processContext(
        contextSources,
        request.framework,
        request.stage,
        request.tool,
        request.processingOptions
      );

      // 3. Get or create workflow session
      const sessionId = await this.getOrCreateWorkflowSession(request);

      // 4. Process workflow continuity
      const workflowContinuity = await workflowContinuityManager.getWorkflowContinuity(
        sessionId,
        request.stage.id,
        request.tool
      );

      // 5. Enhance variables with context
      const variableContext = this.buildVariableContext(request, contextSources);
      const enhancedVariables = await enhancedVariableHandler.enhanceVariables(
        request.template.variables,
        variableContext
      );

      // 6. Process template with enhanced variables
      const processedTemplate = await enhancedVariableHandler.processTemplate(
        request.template.template,
        request.userInputs,
        enhancedVariables,
        variableContext
      );

      // 7. Synthesize final prompt
      const synthesizedPrompt = await this.synthesizeFinalPrompt(
        processedTemplate,
        processedContext,
        workflowContinuity,
        request
      );

      // 8. Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(
        processedContext,
        workflowContinuity,
        processedTemplate,
        request
      );

      // 9. Generate recommendations and warnings
      const { recommendations, warnings } = await this.generateRecommendationsAndWarnings(
        processedContext,
        workflowContinuity,
        processedTemplate,
        qualityMetrics,
        request
      );

      const response: IntegratedContextResponse = {
        processedContext,
        workflowContinuity,
        enhancedVariables,
        processedTemplate,
        synthesizedPrompt,
        qualityMetrics,
        recommendations,
        warnings
      };

      // Cache the response
      this.contextCache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error('Error processing integrated context:', error);
      throw new Error(`Context processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record workflow output and transition to next stage if applicable
   */
  async recordWorkflowOutput(
    projectId: string,
    output: GeneratedPrompt,
    decisions: any[] = [],
    nextStageId?: string
  ): Promise<void> {
    const sessionId = this.activeWorkflowSessions.get(projectId);
    if (!sessionId) return;

    if (nextStageId) {
      await workflowContinuityManager.transitionToStage(
        sessionId,
        nextStageId,
        [output],
        decisions
      );
    }

    // Clear relevant caches
    this.clearProjectCache(projectId);
  }

  /**
   * Get workflow analytics for a project
   */
  async getWorkflowAnalytics(projectId: string): Promise<any> {
    const sessionId = this.activeWorkflowSessions.get(projectId);
    if (!sessionId) return null;

    return await workflowContinuityManager.getSessionAnalytics(sessionId);
  }

  /**
   * Update user preferences and clear relevant caches
   */
  updateUserPreferences(projectId: string, preferences: any): void {
    this.clearProjectCache(projectId);
  }

  /**
   * Clear all caches (useful for development/debugging)
   */
  clearAllCaches(): void {
    this.contextCache.clear();
    enhancedContextProcessor.clearCache();
    enhancedVariableHandler.clearCaches();
  }

  // Private helper methods

  private async gatherContextSources(request: IntegratedContextRequest): Promise<ContextSources> {
    // Get knowledge base entries for the project
    const knowledgeStore = useKnowledgeStore.getState();
    await knowledgeStore.fetchEntries(request.projectId);
    const knowledgeBase = knowledgeStore.entries;

    // Get previous outputs for the project
    const promptStore = usePromptStore.getState();
    await promptStore.loadProjectPrompts(request.projectId);
    const previousOutputs = promptStore.prompts;

    // Build workflow history from previous outputs
    const workflowHistory = previousOutputs.map(output => ({
      id: output.id,
      timestamp: new Date(output.timestamp),
      framework: output.context.framework,
      stage: output.context.stage,
      tool: output.context.tool,
      variables: output.variables,
      output: output.content,
      conversation: output.conversation,
      insights: [], // Could be extracted from conversation
      decisions: [] // Could be extracted from metadata
    }));

    // Build project context (this would typically come from project store)
    const projectContext = {
      id: request.projectId,
      name: 'Current Project', // Would get from project store
      description: 'Project description', // Would get from project store
      domain: request.userPreferences.industryFocus || 'general',
      targetAudience: [], // Would get from project store
      constraints: [], // Would get from project store
      goals: [], // Would get from project store
      timeline: 'ongoing',
      stakeholders: [],
      currentPhase: request.stage.name,
      accessibility_requirements: request.userPreferences.accessibilityLevel === 'comprehensive' 
        ? ['WCAG 2.1 AA compliance', 'Screen reader compatibility', 'Keyboard navigation']
        : []
    };

    return {
      knowledgeBase,
      previousOutputs,
      workflowHistory,
      projectContext,
      userPreferences: request.userPreferences
    };
  }

  private async getOrCreateWorkflowSession(request: IntegratedContextRequest): Promise<string> {
    const existingSessionId = this.activeWorkflowSessions.get(request.projectId);
    
    if (existingSessionId) {
      return existingSessionId;
    }

    // Create new workflow session
    const session = await workflowContinuityManager.startWorkflowSession(
      request.projectId,
      request.framework.id,
      {
        participantCount: 1, // Would be determined from context
        sessionType: 'individual',
        qualityLevel: request.userPreferences.outputDetailLevel as any,
        accessibilityFocus: request.userPreferences.accessibilityLevel !== 'basic'
      }
    );

    this.activeWorkflowSessions.set(request.projectId, session.id);
    return session.id;
  }

  private buildVariableContext(
    request: IntegratedContextRequest,
    contextSources: ContextSources
  ): VariableContext {
    return {
      framework: request.framework,
      stage: request.stage,
      tool: request.tool,
      projectContext: {
        domain: contextSources.projectContext.domain,
        targetAudience: contextSources.projectContext.targetAudience,
        constraints: contextSources.projectContext.constraints,
        goals: contextSources.projectContext.goals
      },
      knowledgeBase: contextSources.knowledgeBase,
      previousOutputs: contextSources.previousOutputs,
      userPreferences: request.userPreferences
    };
  }

  private async synthesizeFinalPrompt(
    processedTemplate: ProcessedTemplate,
    processedContext: ProcessedContext,
    workflowContinuity: WorkflowContinuityContext,
    request: IntegratedContextRequest
  ): Promise<string> {
    let synthesizedPrompt = processedTemplate.processedTemplate;

    // Skip adding research-backed context wrapper for deliverable tools
    // Deliverable tools should generate artifacts directly, not facilitation guides
    const deliverableTools = ['personas', 'empathy-maps', 'problem-statements', 'journey-maps', 'wireframes', 'affinity-mapping', 'job-statements', 'outcome-statements'];
    const isDeliverableTool = deliverableTools.includes(request.tool.id);

    if (!isDeliverableTool && request.userPreferences.includeResearchBacking) {
      const researchContext = frameworkIntegrationService.generateEnhancedPromptContext(
        request.framework.id,
        request.stage.id,
        request.tool.id,
        {
          includeAccessibilityProtocols: request.userPreferences.accessibilityLevel !== 'basic',
          includeResearchBacking: true,
          includeComprehensiveInstructions: request.userPreferences.outputDetailLevel === 'comprehensive',
          accessibilityLevel: request.userPreferences.accessibilityLevel
        }
      );

      if (researchContext) {
        synthesizedPrompt = `${researchContext}\n\n## Task\n${synthesizedPrompt}`;
      }
    }

    // Skip all wrapper sections for deliverable tools - they should generate artifacts directly
    if (!isDeliverableTool) {
      // Add synthesized context
      if (processedContext.synthesizedContext) {
        synthesizedPrompt = `${processedContext.synthesizedContext}\n\n## Generated Prompt\n${synthesizedPrompt}`;
      }

      // Add workflow continuity context
      if (workflowContinuity.previousStageOutputs.length > 0) {
        const continuityContext = `\n\n## Previous Stage Context\n`;
        const recentOutputs = workflowContinuity.previousStageOutputs.slice(0, 2);
        const outputSummaries = recentOutputs.map(output =>
          `**${output.context.stage.name}:** ${output.content.substring(0, 200)}...`
        ).join('\n');

        synthesizedPrompt = `${synthesizedPrompt}${continuityContext}${outputSummaries}`;
      }

      // Add contextual insights
      if (processedContext.contextualInsights.length > 0) {
        const insightsSection = `\n\n## Key Insights\n${processedContext.contextualInsights.slice(0, 5).join('\n')}`;
        synthesizedPrompt = `${synthesizedPrompt}${insightsSection}`;
      }

      // Add recommended actions
      if (processedContext.recommendedActions.length > 0) {
        const actionsSection = `\n\n## Recommended Actions\n${processedContext.recommendedActions.slice(0, 3).map((action, i) => `${i + 1}. ${action}`).join('\n')}`;
        synthesizedPrompt = `${synthesizedPrompt}${actionsSection}`;
      }

      // Add quality checkpoints
      if (processedContext.qualityCheckpoints.length > 0) {
        const qualitySection = `\n\n## Quality Checkpoints\n${processedContext.qualityCheckpoints.slice(0, 3).map(checkpoint => `• ${checkpoint}`).join('\n')}`;
        synthesizedPrompt = `${synthesizedPrompt}${qualitySection}`;
      }
    }

    // Skip tone adjustments for deliverable tools - use the direct prompt as-is
    if (!isDeliverableTool) {
      // Adjust tone based on communication style
      if (request.userPreferences.communicationStyle === 'conversational') {
        synthesizedPrompt = `Hey there! Let's work together on this UX challenge.\n\n${synthesizedPrompt}`;
      } else if (request.userPreferences.communicationStyle === 'formal') {
        synthesizedPrompt = `Please provide a comprehensive response to the following UX methodology request:\n\n${synthesizedPrompt}`;
      }
    }

    return synthesizedPrompt;
  }

  private calculateQualityMetrics(
    processedContext: ProcessedContext,
    workflowContinuity: WorkflowContinuityContext,
    processedTemplate: ProcessedTemplate,
    request: IntegratedContextRequest
  ): QualityMetrics {
    // Context richness (0-1)
    const knowledgeScore = Math.min(processedContext.relevantKnowledge.length / 5, 1);
    const insightsScore = Math.min(processedContext.contextualInsights.length / 5, 1);
    const contextRichness = (knowledgeScore + insightsScore) / 2;

    // Variable completeness from processed template
    const variableCompleteness = processedTemplate.qualityScore.completeness;

    // Workflow consistency based on carry-forward items and consistency checks
    const continuityItemsHandled = workflowContinuity.consistencyChecks.filter(check => check.status === 'consistent').length;
    const totalContinuityItems = workflowContinuity.consistencyChecks.length;
    const workflowConsistency = totalContinuityItems > 0 ? continuityItemsHandled / totalContinuityItems : 1;

    // Accessibility compliance based on user preferences and enhancements
    const accessibilityCompliance = processedTemplate.qualityScore.accessibility;

    // Overall quality (weighted average)
    const overallQuality = (
      contextRichness * 0.25 +
      variableCompleteness * 0.25 +
      workflowConsistency * 0.25 +
      accessibilityCompliance * 0.25
    );

    // Confidence score based on data availability
    const hasKnowledge = processedContext.relevantKnowledge.length > 0;
    const hasContinuity = workflowContinuity.previousStageOutputs.length > 0;
    const hasCompleteVariables = processedTemplate.unresolvedVariables.length === 0;
    const confidenceFactors = [hasKnowledge, hasContinuity, hasCompleteVariables];
    const confidenceScore = confidenceFactors.filter(Boolean).length / confidenceFactors.length;

    return {
      contextRichness,
      variableCompleteness,
      workflowConsistency,
      accessibilityCompliance,
      overallQuality,
      confidenceScore
    };
  }

  private async generateRecommendationsAndWarnings(
    processedContext: ProcessedContext,
    workflowContinuity: WorkflowContinuityContext,
    processedTemplate: ProcessedTemplate,
    qualityMetrics: QualityMetrics,
    request: IntegratedContextRequest
  ): Promise<{ recommendations: string[]; warnings: string[] }> {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Quality-based recommendations
    if (qualityMetrics.contextRichness < 0.5) {
      recommendations.push('Consider adding more knowledge base entries to provide richer context');
    }

    if (qualityMetrics.variableCompleteness < 0.8) {
      recommendations.push('Complete all required variables for optimal prompt quality');
    }

    if (qualityMetrics.accessibilityCompliance < 0.7 && request.userPreferences.accessibilityLevel !== 'basic') {
      recommendations.push('Review accessibility considerations for inclusive outcomes');
    }

    // Workflow continuity recommendations
    if (workflowContinuity.consistencyChecks.some(check => check.status === 'inconsistent')) {
      warnings.push('Inconsistencies detected with previous stage outputs - review for alignment');
    }

    if (workflowContinuity.carryForwardItems.filter(item => item.status === 'active').length > 5) {
      recommendations.push('Consider resolving some carry-forward items to maintain workflow clarity');
    }

    // Template processing warnings
    if (processedTemplate.unresolvedVariables.length > 0) {
      warnings.push(`Unresolved variables: ${processedTemplate.unresolvedVariables.join(', ')}`);
    }

    // Context-specific recommendations
    if (processedContext.recommendedActions.length > 0) {
      recommendations.push(`Consider: ${processedContext.recommendedActions[0]}`);
    }

    return { recommendations, warnings };
  }

  private generateCacheKey(request: IntegratedContextRequest): string {
    const inputsHash = JSON.stringify(request.userInputs);
    const prefsHash = JSON.stringify(request.userPreferences);
    return `${request.projectId}_${request.framework.id}_${request.stage.id}_${request.tool.id}_${inputsHash}_${prefsHash}`;
  }

  private clearProjectCache(projectId: string): void {
    // Remove all cache entries for this project
    Array.from(this.contextCache.keys()).forEach(key => {
      if (key.startsWith(projectId)) {
        this.contextCache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const enhancedContextIntegrationService = new EnhancedContextIntegrationService();