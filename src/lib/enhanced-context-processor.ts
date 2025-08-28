/**
 * @fileoverview Enhanced Context Processing System
 * Advanced context integration with knowledge base, workflow continuity, and intelligent variable handling
 */

import { KnowledgeEntry } from '@/stores/knowledge-store';
import { GeneratedPrompt, ConversationMessage } from '@/stores/prompt-store';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { frameworkIntegrationService } from './framework-integration-service';

export interface ContextSources {
  knowledgeBase: KnowledgeEntry[];
  previousOutputs: GeneratedPrompt[];
  workflowHistory: WorkflowHistoryEntry[];
  projectContext: ProjectContext;
  userPreferences: UserPreferences;
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: Date;
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  variables: Record<string, any>;
  output: string;
  conversation?: ConversationMessage[];
  insights: string[];
  decisions: DecisionPoint[];
}

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  domain: string;
  targetAudience: string[];
  constraints: string[];
  goals: string[];
  timeline: string;
  stakeholders: string[];
  currentPhase: string;
  accessibility_requirements: string[];
  brand_guidelines?: string;
  technical_constraints?: string[];
}

export interface UserPreferences {
  preferredFrameworks: string[];
  accessibilityLevel: 'basic' | 'enhanced' | 'comprehensive';
  outputDetailLevel: 'brief' | 'moderate' | 'comprehensive';
  includeResearchBacking: boolean;
  includeExamples: boolean;
  communicationStyle: 'formal' | 'conversational' | 'technical';
  industryFocus?: string;
}

export interface DecisionPoint {
  id: string;
  timestamp: Date;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: 'low' | 'medium' | 'high';
  reversible: boolean;
}

export interface ContextProcessingOptions {
  maxKnowledgeEntries: number;
  includePreviousOutputs: boolean;
  includeWorkflowHistory: boolean;
  includeResearchBacking: boolean;
  contextRelevanceThreshold: number;
  summarizeContext: boolean;
  prioritizeRecent: boolean;
}

export interface ProcessedContext {
  relevantKnowledge: EnrichedKnowledgeEntry[];
  workflowContinuity: WorkflowContinuityContext;
  enhancedVariables: Record<string, any>;
  contextualInsights: string[];
  recommendedActions: string[];
  qualityCheckpoints: string[];
  synthesizedContext: string;
}

export interface EnrichedKnowledgeEntry extends KnowledgeEntry {
  relevanceScore: number;
  contextualTags: string[];
  extractedInsights: string[];
  connectionToCurrentTask: string;
}

export interface WorkflowContinuityContext {
  previousStageOutputs: GeneratedPrompt[];
  relatedDecisions: DecisionPoint[];
  identifiedPatterns: string[];
  upcomingDependencies: string[];
  consistencyChecks: string[];
  iterationOpportunities: string[];
}

/**
 * Enhanced Context Processor for intelligent context integration
 */
export class EnhancedContextProcessor {
  private contextCache: Map<string, ProcessedContext> = new Map();
  private vectorSimilarityThreshold = 0.7;

  constructor() {
    this.initializeProcessor();
  }

  private initializeProcessor(): void {
    // Initialize any required services or configurations
    console.log('Enhanced Context Processor initialized');
  }

  /**
   * Main context processing method
   */
  async processContext(
    sources: ContextSources,
    currentFramework: UXFramework,
    currentStage: UXStage,
    currentTool: UXTool,
    options: ContextProcessingOptions = this.getDefaultOptions()
  ): Promise<ProcessedContext> {
    const cacheKey = this.generateCacheKey(sources, currentFramework, currentStage, currentTool);
    
    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    // Process different context sources
    const relevantKnowledge = await this.processKnowledgeBase(
      sources.knowledgeBase,
      currentFramework,
      currentStage,
      currentTool,
      options
    );

    const workflowContinuity = await this.processWorkflowContinuity(
      sources.previousOutputs,
      sources.workflowHistory,
      currentFramework,
      currentStage,
      currentTool,
      options
    );

    const enhancedVariables = await this.processVariableEnhancement(
      sources,
      currentFramework,
      currentStage,
      currentTool
    );

    const contextualInsights = await this.generateContextualInsights(
      relevantKnowledge,
      workflowContinuity,
      sources.projectContext
    );

    const recommendedActions = await this.generateRecommendedActions(
      contextualInsights,
      currentFramework,
      currentStage,
      currentTool,
      sources.userPreferences
    );

    const qualityCheckpoints = await this.generateQualityCheckpoints(
      currentFramework,
      currentStage,
      currentTool,
      sources.userPreferences
    );

    const synthesizedContext = await this.synthesizeContext(
      relevantKnowledge,
      workflowContinuity,
      enhancedVariables,
      contextualInsights,
      recommendedActions,
      sources.projectContext,
      options
    );

    const processedContext: ProcessedContext = {
      relevantKnowledge,
      workflowContinuity,
      enhancedVariables,
      contextualInsights,
      recommendedActions,
      qualityCheckpoints,
      synthesizedContext
    };

    // Cache the result
    this.contextCache.set(cacheKey, processedContext);

    return processedContext;
  }

  /**
   * Process knowledge base entries for relevance and enrichment
   */
  private async processKnowledgeBase(
    knowledgeEntries: KnowledgeEntry[],
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    options: ContextProcessingOptions
  ): Promise<EnrichedKnowledgeEntry[]> {
    if (!knowledgeEntries || knowledgeEntries.length === 0) {
      return [];
    }

    const enrichedEntries: EnrichedKnowledgeEntry[] = [];

    for (const entry of knowledgeEntries.slice(0, options.maxKnowledgeEntries)) {
      const relevanceScore = await this.calculateRelevanceScore(
        entry,
        framework,
        stage,
        tool
      );

      if (relevanceScore >= options.contextRelevanceThreshold) {
        const contextualTags = await this.generateContextualTags(entry, framework, stage, tool);
        const extractedInsights = await this.extractInsights(entry, framework, stage, tool);
        const connectionToCurrentTask = await this.generateConnectionDescription(
          entry,
          framework,
          stage,
          tool
        );

        enrichedEntries.push({
          ...entry,
          relevanceScore,
          contextualTags,
          extractedInsights,
          connectionToCurrentTask
        });
      }
    }

    // Sort by relevance score and recency if prioritizeRecent is true
    return enrichedEntries.sort((a, b) => {
      if (options.prioritizeRecent) {
        const timeWeight = 0.3;
        const relevanceWeight = 0.7;
        
        const aScore = (a.relevanceScore * relevanceWeight) + 
                      (this.getRecencyScore(a.created_at) * timeWeight);
        const bScore = (b.relevanceScore * relevanceWeight) + 
                      (this.getRecencyScore(b.created_at) * timeWeight);
        
        return bScore - aScore;
      }
      return b.relevanceScore - a.relevanceScore;
    });
  }

  /**
   * Process workflow continuity and previous outputs
   */
  private async processWorkflowContinuity(
    previousOutputs: GeneratedPrompt[],
    workflowHistory: WorkflowHistoryEntry[],
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    options: ContextProcessingOptions
  ): Promise<WorkflowContinuityContext> {
    const previousStageOutputs = this.filterPreviousStageOutputs(
      previousOutputs,
      framework,
      stage
    );

    const relatedDecisions = this.extractRelatedDecisions(
      workflowHistory,
      framework,
      stage,
      tool
    );

    const identifiedPatterns = await this.identifyWorkflowPatterns(
      workflowHistory,
      framework
    );

    const upcomingDependencies = await this.identifyUpcomingDependencies(
      framework,
      stage,
      tool,
      workflowHistory
    );

    const consistencyChecks = await this.generateConsistencyChecks(
      previousStageOutputs,
      framework,
      stage
    );

    const iterationOpportunities = await this.identifyIterationOpportunities(
      previousOutputs,
      workflowHistory,
      framework,
      stage,
      tool
    );

    return {
      previousStageOutputs,
      relatedDecisions,
      identifiedPatterns,
      upcomingDependencies,
      consistencyChecks,
      iterationOpportunities
    };
  }

  /**
   * Enhanced variable processing with context-aware suggestions
   */
  private async processVariableEnhancement(
    sources: ContextSources,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<Record<string, any>> {
    const baseVariables = this.extractBaseVariables(sources);
    const contextualVariables = await this.generateContextualVariables(
      sources,
      framework,
      stage,
      tool
    );
    const smartDefaults = await this.generateSmartDefaults(
      sources,
      framework,
      stage,
      tool
    );
    const validationRules = await this.generateValidationRules(
      framework,
      stage,
      tool
    );

    return {
      ...baseVariables,
      ...contextualVariables,
      _smartDefaults: smartDefaults,
      _validationRules: validationRules,
      _contextMetadata: {
        framework: framework.name,
        stage: stage.name,
        tool: tool.name,
        projectDomain: sources.projectContext.domain,
        accessibilityLevel: sources.userPreferences.accessibilityLevel,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  /**
   * Generate contextual insights from processed data
   */
  private async generateContextualInsights(
    knowledgeEntries: EnrichedKnowledgeEntry[],
    workflowContinuity: WorkflowContinuityContext,
    projectContext: ProjectContext
  ): Promise<string[]> {
    const insights: string[] = [];

    // Knowledge-based insights
    if (knowledgeEntries.length > 0) {
      const topInsights = knowledgeEntries
        .flatMap(entry => entry.extractedInsights)
        .slice(0, 5);
      insights.push(...topInsights.map(insight => `📚 Knowledge: ${insight}`));
    }

    // Workflow continuity insights
    if (workflowContinuity.identifiedPatterns.length > 0) {
      insights.push(...workflowContinuity.identifiedPatterns.map(
        pattern => `🔄 Pattern: ${pattern}`
      ));
    }

    // Project-specific insights
    if (projectContext.constraints.length > 0) {
      insights.push(`⚠️ Constraints: Consider project constraints including ${projectContext.constraints.slice(0, 2).join(', ')}`);
    }

    if (projectContext.accessibility_requirements.length > 0) {
      insights.push(`♿ Accessibility: Ensure compliance with ${projectContext.accessibility_requirements.join(', ')}`);
    }

    // Consistency insights
    if (workflowContinuity.consistencyChecks.length > 0) {
      insights.push(...workflowContinuity.consistencyChecks.map(
        check => `✅ Consistency: ${check}`
      ));
    }

    return insights.slice(0, 10); // Limit to top 10 insights
  }

  /**
   * Generate recommended actions based on context
   */
  private async generateRecommendedActions(
    insights: string[],
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userPreferences: UserPreferences
  ): Promise<string[]> {
    const actions: string[] = [];

    // Framework-specific recommendations
    if (frameworkIntegrationService.hasEnhancedVersion(framework.id)) {
      const researchBacking = frameworkIntegrationService.getFrameworkResearchBacking(framework.id);
      if (researchBacking) {
        actions.push(...researchBacking.bestPractices.preparation.slice(0, 2));
      }
    }

    // Accessibility-focused actions
    if (userPreferences.accessibilityLevel === 'comprehensive') {
      actions.push('Conduct accessibility audit of current approach');
      actions.push('Include diverse user perspectives in validation');
    }

    // Tool-specific recommendations
    const toolGuidance = frameworkIntegrationService.generateAccessibleToolGuidance(tool.id);
    if (toolGuidance) {
      actions.push('Apply enhanced tool guidance for inclusive outcomes');
    }

    // Context-based recommendations
    if (insights.some(insight => insight.includes('Pattern'))) {
      actions.push('Build on identified workflow patterns for consistency');
    }

    return actions.slice(0, 8);
  }

  /**
   * Generate quality checkpoints
   */
  private async generateQualityCheckpoints(
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userPreferences: UserPreferences
  ): Promise<string[]> {
    const checkpoints: string[] = [];

    // Framework quality checks
    const qualityChecklist = frameworkIntegrationService.getQualityAssuranceChecklist(framework.id);
    if (qualityChecklist.length > 0) {
      checkpoints.push(...qualityChecklist.slice(0, 5));
    }

    // Accessibility checkpoints
    if (userPreferences.accessibilityLevel !== 'basic') {
      checkpoints.push('Verify accessibility compliance at each step');
      checkpoints.push('Test with assistive technologies');
      checkpoints.push('Validate with diverse user groups');
    }

    // General quality checkpoints
    checkpoints.push('Document decision rationale');
    checkpoints.push('Review alignment with project goals');
    checkpoints.push('Validate outputs with stakeholders');

    return checkpoints;
  }

  /**
   * Synthesize all context into comprehensive context string
   */
  private async synthesizeContext(
    knowledgeEntries: EnrichedKnowledgeEntry[],
    workflowContinuity: WorkflowContinuityContext,
    enhancedVariables: Record<string, any>,
    insights: string[],
    actions: string[],
    projectContext: ProjectContext,
    options: ContextProcessingOptions
  ): Promise<string> {
    let synthesizedContext = '';

    // Project context
    synthesizedContext += `## Project Context\n`;
    synthesizedContext += `**Project:** ${projectContext.name}\n`;
    synthesizedContext += `**Domain:** ${projectContext.domain}\n`;
    synthesizedContext += `**Current Phase:** ${projectContext.currentPhase}\n`;
    synthesizedContext += `**Target Audience:** ${projectContext.targetAudience.join(', ')}\n`;
    synthesizedContext += `**Goals:** ${projectContext.goals.slice(0, 3).join(', ')}\n\n`;

    // Relevant knowledge
    if (knowledgeEntries.length > 0) {
      synthesizedContext += `## Relevant Knowledge Base\n`;
      for (const entry of knowledgeEntries.slice(0, 3)) {
        synthesizedContext += `**${entry.title}** (${entry.relevanceScore.toFixed(2)} relevance)\n`;
        synthesizedContext += `${entry.connectionToCurrentTask}\n`;
        if (entry.extractedInsights.length > 0) {
          synthesizedContext += `Key insights: ${entry.extractedInsights.slice(0, 2).join(', ')}\n\n`;
        }
      }
    }

    // Workflow continuity
    if (workflowContinuity.previousStageOutputs.length > 0) {
      synthesizedContext += `## Previous Stage Outputs\n`;
      for (const output of workflowContinuity.previousStageOutputs.slice(0, 2)) {
        synthesizedContext += `**${output.context.stage.name}:** ${output.content.substring(0, 200)}...\n\n`;
      }
    }

    // Contextual insights
    if (insights.length > 0) {
      synthesizedContext += `## Key Insights\n`;
      insights.slice(0, 5).forEach(insight => {
        synthesizedContext += `${insight}\n`;
      });
      synthesizedContext += `\n`;
    }

    // Recommended actions
    if (actions.length > 0) {
      synthesizedContext += `## Recommended Actions\n`;
      actions.slice(0, 5).forEach((action, index) => {
        synthesizedContext += `${index + 1}. ${action}\n`;
      });
      synthesizedContext += `\n`;
    }

    // Accessibility requirements
    if (projectContext.accessibility_requirements.length > 0) {
      synthesizedContext += `## Accessibility Requirements\n`;
      synthesizedContext += `${projectContext.accessibility_requirements.join('\n')}\n\n`;
    }

    // Constraints
    if (projectContext.constraints.length > 0) {
      synthesizedContext += `## Project Constraints\n`;
      synthesizedContext += `${projectContext.constraints.join('\n')}\n\n`;
    }

    if (options.summarizeContext && synthesizedContext.length > 5000) {
      synthesizedContext = this.summarizeContext(synthesizedContext);
    }

    return synthesizedContext;
  }

  // Helper methods
  private getDefaultOptions(): ContextProcessingOptions {
    return {
      maxKnowledgeEntries: 10,
      includePreviousOutputs: true,
      includeWorkflowHistory: true,
      includeResearchBacking: true,
      contextRelevanceThreshold: 0.5,
      summarizeContext: true,
      prioritizeRecent: true
    };
  }

  private generateCacheKey(
    sources: ContextSources,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): string {
    const knowledgeHash = sources.knowledgeBase.map(k => k.id).join('|');
    const outputsHash = sources.previousOutputs.map(p => p.id).join('|');
    return `${framework.id}-${stage.id}-${tool.id}-${knowledgeHash}-${outputsHash}`;
  }

  private async calculateRelevanceScore(
    entry: KnowledgeEntry,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<number> {
    let score = 0.0;

    // Simple keyword matching for now (could be enhanced with vector similarity)
    const keywords = [framework.name, stage.name, tool.name, tool.category].map(k => k.toLowerCase());
    const contentLower = `${entry.title} ${entry.content}`.toLowerCase();

    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 0.25;
      }
    });

    // Boost score based on metadata relevance
    if (entry.metadata) {
      if (entry.metadata.tags) {
        const tags = Array.isArray(entry.metadata.tags) ? entry.metadata.tags : [entry.metadata.tags];
        tags.forEach((tag: string) => {
          if (keywords.some(keyword => tag.toLowerCase().includes(keyword))) {
            score += 0.1;
          }
        });
      }
    }

    // Recent entries get slight boost
    const daysSinceCreated = (Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private async generateContextualTags(
    entry: KnowledgeEntry,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<string[]> {
    const tags: string[] = [];
    
    tags.push(`framework:${framework.id}`);
    tags.push(`stage:${stage.id}`);
    tags.push(`tool:${tool.id}`);
    tags.push(`type:${entry.type}`);

    return tags;
  }

  private async extractInsights(
    entry: KnowledgeEntry,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<string[]> {
    const insights: string[] = [];

    // Extract key sentences or bullet points as insights
    const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return [framework.name, stage.name, tool.name].some(term => 
        lowerSentence.includes(term.toLowerCase())
      );
    });

    insights.push(...relevantSentences.slice(0, 3).map(s => s.trim()));

    return insights;
  }

  private async generateConnectionDescription(
    entry: KnowledgeEntry,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<string> {
    return `This knowledge entry relates to your current ${tool.name} work in the ${stage.name} stage of ${framework.name}. It provides relevant context and insights that can inform your approach.`;
  }

  private getRecencyScore(createdAt: string): number {
    const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceCreated / 30)); // Decay over 30 days
  }

  private filterPreviousStageOutputs(
    outputs: GeneratedPrompt[],
    framework: UXFramework,
    currentStage: UXStage
  ): GeneratedPrompt[] {
    return outputs.filter(output => 
      output.context.framework.id === framework.id &&
      output.context.stage.id !== currentStage.id
    );
  }

  private extractRelatedDecisions(
    history: WorkflowHistoryEntry[],
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): DecisionPoint[] {
    return history
      .filter(entry => entry.framework.id === framework.id)
      .flatMap(entry => entry.decisions || []);
  }

  private async identifyWorkflowPatterns(
    history: WorkflowHistoryEntry[],
    framework: UXFramework
  ): Promise<string[]> {
    const patterns: string[] = [];

    // Look for repeated tool usage
    const toolUsage = new Map<string, number>();
    history.forEach(entry => {
      const count = toolUsage.get(entry.tool.id) || 0;
      toolUsage.set(entry.tool.id, count + 1);
    });

    toolUsage.forEach((count, toolId) => {
      if (count > 2) {
        patterns.push(`Frequent use of ${toolId} suggests this is a key methodology for your project`);
      }
    });

    return patterns;
  }

  private async identifyUpcomingDependencies(
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    history: WorkflowHistoryEntry[]
  ): Promise<string[]> {
    const dependencies: string[] = [];

    // Basic stage dependency logic
    const stageIndex = framework.stages.findIndex(s => s.id === stage.id);
    if (stageIndex < framework.stages.length - 1) {
      const nextStage = framework.stages[stageIndex + 1];
      dependencies.push(`Next stage "${nextStage.name}" will depend on outputs from current ${tool.name} work`);
    }

    return dependencies;
  }

  private async generateConsistencyChecks(
    previousOutputs: GeneratedPrompt[],
    framework: UXFramework,
    stage: UXStage
  ): Promise<string[]> {
    const checks: string[] = [];

    if (previousOutputs.length > 0) {
      checks.push('Ensure current outputs align with previous stage findings');
      checks.push('Maintain consistent terminology and definitions');
      checks.push('Validate that user needs identified earlier are being addressed');
    }

    return checks;
  }

  private async identifyIterationOpportunities(
    previousOutputs: GeneratedPrompt[],
    history: WorkflowHistoryEntry[],
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<string[]> {
    const opportunities: string[] = [];

    // Look for areas that might benefit from iteration
    const relatedOutputs = previousOutputs.filter(output => 
      output.context.framework.id === framework.id
    );

    if (relatedOutputs.length > 1) {
      opportunities.push('Consider iterating on previous findings with new insights');
    }

    return opportunities;
  }

  private extractBaseVariables(sources: ContextSources): Record<string, any> {
    return {
      projectName: sources.projectContext.name,
      projectDomain: sources.projectContext.domain,
      targetAudience: sources.projectContext.targetAudience.join(', '),
      projectGoals: sources.projectContext.goals.join(', '),
      timeline: sources.projectContext.timeline,
      constraints: sources.projectContext.constraints.join(', ')
    };
  }

  private async generateContextualVariables(
    sources: ContextSources,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<Record<string, any>> {
    return {
      contextualBackground: `Working within ${framework.name} framework, specifically in ${stage.name} stage using ${tool.name}`,
      accessibilityLevel: sources.userPreferences.accessibilityLevel,
      industryFocus: sources.userPreferences.industryFocus || sources.projectContext.domain,
      outputDetailLevel: sources.userPreferences.outputDetailLevel,
      stakeholderContext: sources.projectContext.stakeholders.join(', ')
    };
  }

  private async generateSmartDefaults(
    sources: ContextSources,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<Record<string, any>> {
    return {
      suggestedParticipants: this.suggestParticipants(stage, tool, sources.projectContext),
      recommendedDuration: this.suggestDuration(tool, sources.userPreferences),
      suggestedDeliverables: this.suggestDeliverables(stage, tool)
    };
  }

  private async generateValidationRules(
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<Record<string, any>> {
    return {
      requiredFields: ['projectName', 'targetAudience'],
      minimumLength: {
        description: 50,
        rationale: 25
      },
      accessibilityRequirements: ['keyboard navigation', 'screen reader compatibility']
    };
  }

  private suggestParticipants(stage: UXStage, tool: UXTool, projectContext: ProjectContext): string {
    const baseParticipants = stage.characteristics.participants;
    const additionalSuggestions = [];

    if (projectContext.accessibility_requirements.length > 0) {
      additionalSuggestions.push('accessibility specialist');
    }

    if (tool.category === 'Research') {
      additionalSuggestions.push('diverse user representatives');
    }

    return [baseParticipants, ...additionalSuggestions].join(', ');
  }

  private suggestDuration(tool: UXTool, preferences: UserPreferences): string {
    const baseDuration = tool.characteristics.effort === 'High' ? '2-3 hours' : '1-2 hours';
    
    if (preferences.accessibilityLevel === 'comprehensive') {
      return `${baseDuration} (additional 30 minutes for accessibility review)`;
    }

    return baseDuration;
  }

  private suggestDeliverables(stage: UXStage, tool: UXTool): string {
    const baseDeliverables = stage.characteristics.deliverables;
    return `${baseDeliverables}, accessibility considerations document`;
  }

  private summarizeContext(context: string): string {
    // Simple summarization - could be enhanced with AI
    const sections = context.split('##').filter(s => s.trim());
    const summarized = sections.slice(0, 5).map(section => {
      const lines = section.split('\n').filter(l => l.trim());
      return `##${lines.slice(0, 3).join('\n')}`;
    }).join('\n\n');

    return summarized + '\n\n*Context has been summarized for brevity*';
  }

  /**
   * Clear cache when context sources change significantly
   */
  clearCache(): void {
    this.contextCache.clear();
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): { cacheSize: number; cacheHitRate: number } {
    return {
      cacheSize: this.contextCache.size,
      cacheHitRate: 0 // Would need to track this
    };
  }
}

// Export singleton instance
export const enhancedContextProcessor = new EnhancedContextProcessor();