/**
 * @fileoverview Workflow Continuity Manager
 * Manages workflow continuity, tracks previous outputs, and maintains consistency across UX process stages
 */

import { GeneratedPrompt, ConversationMessage } from '@/stores/prompt-store';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowSession {
  id: string;
  projectId: string;
  frameworkId: string;
  startedAt: Date;
  lastActivityAt: Date;
  currentStageId?: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  metadata: {
    participantCount: number;
    sessionType: 'individual' | 'team' | 'stakeholder';
    qualityLevel: 'basic' | 'enhanced' | 'comprehensive';
    accessibilityFocus: boolean;
  };
}

export interface StageTransition {
  id: string;
  sessionId: string;
  fromStageId: string | null;
  toStageId: string;
  transitionedAt: Date;
  outputs: GeneratedPrompt[];
  decisions: Decision[];
  insights: string[];
  carryForwardItems: CarryForwardItem[];
  validationStatus: 'pending' | 'validated' | 'needs_revision';
}

export interface Decision {
  id: string;
  timestamp: Date;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: 'low' | 'medium' | 'high';
  reversible: boolean;
  stakeholders: string[];
  evidence: string[];
  followUpRequired: boolean;
}

export interface CarryForwardItem {
  id: string;
  type: 'insight' | 'constraint' | 'requirement' | 'assumption' | 'risk';
  content: string;
  source: string; // Which stage/tool generated this
  targetStages: string[]; // Which stages should consider this
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'outdated';
  validation: {
    validated: boolean;
    validatedBy: string[];
    validatedAt?: Date;
    validationNotes?: string;
  };
}

export interface WorkflowContinuityContext {
  session: WorkflowSession;
  previousStageOutputs: GeneratedPrompt[];
  relevantDecisions: Decision[];
  carryForwardItems: CarryForwardItem[];
  consistencyChecks: ConsistencyCheck[];
  suggestedNextSteps: NextStep[];
  contextualConnections: ContextualConnection[];
}

export interface ConsistencyCheck {
  id: string;
  type: 'terminology' | 'user_needs' | 'constraints' | 'goals' | 'assumptions';
  description: string;
  currentValue: string;
  previousValues: { stageId: string; value: string; timestamp: Date }[];
  status: 'consistent' | 'inconsistent' | 'unclear';
  recommendation: string;
}

export interface NextStep {
  id: string;
  description: string;
  rationale: string;
  dependencies: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  suggestedTools: string[];
  accessibility_considerations: string[];
}

export interface ContextualConnection {
  id: string;
  fromOutput: string; // Output ID
  toStage: string; // Target stage ID
  connectionType: 'dependency' | 'validation' | 'iteration' | 'refinement';
  description: string;
  strength: number; // 0-1 relevance score
}

/**
 * Workflow Continuity Manager for maintaining context across UX process stages
 */
export class WorkflowContinuityManager {
  private activeSessions: Map<string, WorkflowSession> = new Map();
  private stageTransitions: Map<string, StageTransition[]> = new Map();
  private carryForwardItems: Map<string, CarryForwardItem[]> = new Map();

  constructor() {
    this.initializeManager();
  }

  private initializeManager(): void {
    console.log('Workflow Continuity Manager initialized');
  }

  /**
   * Start a new workflow session
   */
  async startWorkflowSession(
    projectId: string,
    frameworkId: string,
    metadata: WorkflowSession['metadata']
  ): Promise<WorkflowSession> {
    const session: WorkflowSession = {
      id: this.generateSessionId(),
      projectId,
      frameworkId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      status: 'active',
      metadata
    };

    // Save to database
    await this.saveSession(session);

    // Cache locally
    this.activeSessions.set(session.id, session);

    return session;
  }

  /**
   * Transition between workflow stages
   */
  async transitionToStage(
    sessionId: string,
    toStageId: string,
    outputs: GeneratedPrompt[],
    decisions: Decision[] = []
  ): Promise<StageTransition> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const fromStageId = session.currentStageId || null;

    // Analyze outputs for insights and carry-forward items
    const insights = await this.extractInsights(outputs);
    const carryForwardItems = await this.generateCarryForwardItems(
      outputs,
      decisions,
      toStageId
    );

    const transition: StageTransition = {
      id: this.generateTransitionId(),
      sessionId,
      fromStageId,
      toStageId,
      transitionedAt: new Date(),
      outputs,
      decisions,
      insights,
      carryForwardItems,
      validationStatus: 'pending'
    };

    // Update session
    session.currentStageId = toStageId;
    session.lastActivityAt = new Date();

    // Store transition
    const transitions = this.stageTransitions.get(sessionId) || [];
    transitions.push(transition);
    this.stageTransitions.set(sessionId, transitions);

    // Update carry-forward items
    const existingItems = this.carryForwardItems.get(sessionId) || [];
    this.carryForwardItems.set(sessionId, [...existingItems, ...carryForwardItems]);

    // Save to database
    await this.saveTransition(transition);
    await this.saveSession(session);

    return transition;
  }

  /**
   * Get workflow continuity context for current stage
   */
  async getWorkflowContinuity(
    sessionId: string,
    currentStageId: string,
    currentTool: UXTool
  ): Promise<WorkflowContinuityContext> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const transitions = this.stageTransitions.get(sessionId) || [];
    const carryForwardItems = this.getRelevantCarryForwardItems(sessionId, currentStageId);

    // Get previous stage outputs
    const previousStageOutputs = this.getPreviousStageOutputs(transitions, currentStageId);

    // Get relevant decisions
    const relevantDecisions = this.getRelevantDecisions(transitions, currentStageId);

    // Generate consistency checks
    const consistencyChecks = await this.generateConsistencyChecks(
      previousStageOutputs,
      currentStageId
    );

    // Suggest next steps
    const suggestedNextSteps = await this.generateNextSteps(
      session,
      currentStageId,
      currentTool,
      previousStageOutputs
    );

    // Generate contextual connections
    const contextualConnections = await this.generateContextualConnections(
      previousStageOutputs,
      currentStageId
    );

    return {
      session,
      previousStageOutputs,
      relevantDecisions,
      carryForwardItems,
      consistencyChecks,
      suggestedNextSteps,
      contextualConnections
    };
  }

  /**
   * Record a decision during the workflow
   */
  async recordDecision(
    sessionId: string,
    decision: Omit<Decision, 'id' | 'timestamp'>
  ): Promise<Decision> {
    const fullDecision: Decision = {
      id: this.generateDecisionId(),
      timestamp: new Date(),
      ...decision
    };

    // Add to current transition or create pending decision
    await this.saveDecision(sessionId, fullDecision);

    return fullDecision;
  }

  /**
   * Add carry-forward item
   */
  async addCarryForwardItem(
    sessionId: string,
    item: Omit<CarryForwardItem, 'id'>
  ): Promise<CarryForwardItem> {
    const fullItem: CarryForwardItem = {
      id: this.generateCarryForwardId(),
      ...item
    };

    const existingItems = this.carryForwardItems.get(sessionId) || [];
    existingItems.push(fullItem);
    this.carryForwardItems.set(sessionId, existingItems);

    await this.saveCarryForwardItem(sessionId, fullItem);

    return fullItem;
  }

  /**
   * Update carry-forward item status
   */
  async updateCarryForwardItem(
    sessionId: string,
    itemId: string,
    updates: Partial<CarryForwardItem>
  ): Promise<CarryForwardItem | null> {
    const items = this.carryForwardItems.get(sessionId) || [];
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return null;
    }

    const updatedItem = { ...items[itemIndex], ...updates };
    items[itemIndex] = updatedItem;
    this.carryForwardItems.set(sessionId, items);

    await this.updateCarryForwardItemInDB(sessionId, updatedItem);

    return updatedItem;
  }

  /**
   * Validate stage transition
   */
  async validateStageTransition(
    sessionId: string,
    transitionId: string,
    validatedBy: string,
    notes?: string
  ): Promise<void> {
    const transitions = this.stageTransitions.get(sessionId) || [];
    const transition = transitions.find(t => t.id === transitionId);

    if (transition) {
      transition.validationStatus = 'validated';
      await this.saveTransition(transition);
    }
  }

  /**
   * Get session history and analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<{
    duration: number;
    stagesCompleted: number;
    decisionsCount: number;
    outputsGenerated: number;
    carryForwardItemsActive: number;
    consistencyScore: number;
  }> {
    const session = await this.getSession(sessionId);
    const transitions = this.stageTransitions.get(sessionId) || [];
    const carryForwardItems = this.carryForwardItems.get(sessionId) || [];

    const duration = session ? Date.now() - session.startedAt.getTime() : 0;
    const stagesCompleted = transitions.length;
    const decisionsCount = transitions.reduce((sum, t) => sum + t.decisions.length, 0);
    const outputsGenerated = transitions.reduce((sum, t) => sum + t.outputs.length, 0);
    const carryForwardItemsActive = carryForwardItems.filter(item => item.status === 'active').length;

    // Simple consistency score based on resolved vs active carry-forward items
    const totalItems = carryForwardItems.length;
    const resolvedItems = carryForwardItems.filter(item => item.status === 'resolved').length;
    const consistencyScore = totalItems > 0 ? (resolvedItems / totalItems) * 100 : 100;

    return {
      duration,
      stagesCompleted,
      decisionsCount,
      outputsGenerated,
      carryForwardItemsActive,
      consistencyScore
    };
  }

  // Private helper methods

  private async extractInsights(outputs: GeneratedPrompt[]): Promise<string[]> {
    const insights: string[] = [];

    outputs.forEach(output => {
      // Extract key insights from output content
      const sentences = output.content.split(/[.!?]+/).filter(s => s.trim().length > 30);
      const insightWords = ['insight', 'finding', 'discovered', 'learned', 'important', 'key', 'significant'];
      
      const insightSentences = sentences.filter(sentence =>
        insightWords.some(word => sentence.toLowerCase().includes(word))
      );

      insights.push(...insightSentences.slice(0, 2));
    });

    return insights;
  }

  private async generateCarryForwardItems(
    outputs: GeneratedPrompt[],
    decisions: Decision[],
    toStageId: string
  ): Promise<CarryForwardItem[]> {
    const items: CarryForwardItem[] = [];

    // Generate carry-forward items from outputs
    outputs.forEach(output => {
      // Look for constraints mentioned in outputs
      const constraintKeywords = ['constraint', 'limitation', 'requirement', 'must', 'cannot'];
      const sentences = output.content.split(/[.!?]+/);
      
      sentences.forEach(sentence => {
        constraintKeywords.forEach(keyword => {
          if (sentence.toLowerCase().includes(keyword) && sentence.length > 20) {
            items.push({
              id: this.generateCarryForwardId(),
              type: sentence.includes('requirement') ? 'requirement' : 'constraint',
              content: sentence.trim(),
              source: `${output.context.stage.name} - ${output.context.tool.name}`,
              targetStages: [toStageId],
              priority: 'medium',
              status: 'active',
              validation: {
                validated: false,
                validatedBy: []
              }
            });
          }
        });
      });
    });

    // Generate carry-forward items from decisions
    decisions.forEach(decision => {
      if (decision.impact === 'high' || decision.impact === 'medium') {
        items.push({
          id: this.generateCarryForwardId(),
          type: 'requirement',
          content: `Decision: ${decision.decision}. Rationale: ${decision.rationale}`,
          source: 'Decision Record',
          targetStages: [toStageId],
          priority: decision.impact === 'high' ? 'high' : 'medium',
          status: 'active',
          validation: {
            validated: true,
            validatedBy: decision.stakeholders,
            validatedAt: decision.timestamp
          }
        });
      }
    });

    return items;
  }

  private getRelevantCarryForwardItems(sessionId: string, currentStageId: string): CarryForwardItem[] {
    const allItems = this.carryForwardItems.get(sessionId) || [];
    return allItems.filter(item =>
      item.status === 'active' &&
      (item.targetStages.includes(currentStageId) || item.targetStages.includes('all'))
    );
  }

  private getPreviousStageOutputs(transitions: StageTransition[], currentStageId: string): GeneratedPrompt[] {
    return transitions
      .filter(t => t.toStageId !== currentStageId)
      .flatMap(t => t.outputs)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  private getRelevantDecisions(transitions: StageTransition[], currentStageId: string): Decision[] {
    return transitions
      .flatMap(t => t.decisions)
      .filter(d => d.followUpRequired || d.impact === 'high')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async generateConsistencyChecks(
    previousOutputs: GeneratedPrompt[],
    currentStageId: string
  ): Promise<ConsistencyCheck[]> {
    const checks: ConsistencyCheck[] = [];

    // Check terminology consistency
    const terminologyUsage = this.extractTerminology(previousOutputs);
    if (terminologyUsage.size > 0) {
      terminologyUsage.forEach((usage, term) => {
        if (usage.length > 1) {
          const uniqueUsages = [...new Set(usage.map(u => u.value))];
          if (uniqueUsages.length > 1) {
            checks.push({
              id: this.generateCheckId(),
              type: 'terminology',
              description: `Inconsistent usage of term "${term}"`,
              currentValue: uniqueUsages[0],
              previousValues: usage,
              status: 'inconsistent',
              recommendation: `Standardize usage of "${term}" across all stages`
            });
          }
        }
      });
    }

    return checks;
  }

  private async generateNextSteps(
    session: WorkflowSession,
    currentStageId: string,
    currentTool: UXTool,
    previousOutputs: GeneratedPrompt[]
  ): Promise<NextStep[]> {
    const steps: NextStep[] = [];

    // Basic next step suggestions based on current tool
    if (currentTool.category === 'Research') {
      steps.push({
        id: this.generateNextStepId(),
        description: 'Synthesize research findings into actionable insights',
        rationale: 'Research data needs to be analyzed and converted into design implications',
        dependencies: [],
        estimatedEffort: 'medium',
        priority: 'high',
        suggestedTools: ['affinity-mapping', 'personas'],
        accessibility_considerations: ['Ensure diverse participant representation in synthesis']
      });
    }

    if (session.metadata.accessibilityFocus) {
      steps.push({
        id: this.generateNextStepId(),
        description: 'Conduct accessibility review of current outputs',
        rationale: 'Accessibility focus requires regular checkpoint reviews',
        dependencies: [],
        estimatedEffort: 'low',
        priority: 'high',
        suggestedTools: ['accessibility-audit'],
        accessibility_considerations: ['Review with assistive technology users', 'Validate WCAG compliance']
      });
    }

    return steps;
  }

  private async generateContextualConnections(
    previousOutputs: GeneratedPrompt[],
    currentStageId: string
  ): Promise<ContextualConnection[]> {
    const connections: ContextualConnection[] = [];

    previousOutputs.forEach((output, index) => {
      // Simple heuristic for connection strength based on content similarity
      const strength = Math.max(0.3, 1 - (index * 0.1)); // Decay based on recency

      connections.push({
        id: this.generateConnectionId(),
        fromOutput: output.id,
        toStage: currentStageId,
        connectionType: index === 0 ? 'dependency' : 'validation',
        description: `Output from ${output.context.stage.name} provides context for current stage work`,
        strength
      });
    });

    return connections;
  }

  private extractTerminology(outputs: GeneratedPrompt[]): Map<string, { stageId: string; value: string; timestamp: Date }[]> {
    const terminology = new Map();

    // Simple keyword extraction - could be enhanced
    const importantTerms = ['user', 'customer', 'stakeholder', 'requirement', 'constraint', 'goal'];

    outputs.forEach(output => {
      const content = output.content.toLowerCase();
      importantTerms.forEach(term => {
        if (content.includes(term)) {
          const existing = terminology.get(term) || [];
          existing.push({
            stageId: output.context.stage.id,
            value: term,
            timestamp: new Date(output.timestamp)
          });
          terminology.set(term, existing);
        }
      });
    });

    return terminology;
  }

  // Database operations
  private async saveSession(session: WorkflowSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_sessions')
        .upsert({
          id: session.id,
          project_id: session.projectId,
          framework_id: session.frameworkId,
          started_at: session.startedAt.toISOString(),
          last_activity_at: session.lastActivityAt.toISOString(),
          current_stage_id: session.currentStageId,
          status: session.status,
          metadata: session.metadata
        });

      if (error) {
        console.error('Error saving session:', error);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  private async saveTransition(transition: StageTransition): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_transitions')
        .upsert({
          id: transition.id,
          session_id: transition.sessionId,
          from_stage_id: transition.fromStageId,
          to_stage_id: transition.toStageId,
          transitioned_at: transition.transitionedAt.toISOString(),
          outputs: transition.outputs,
          decisions: transition.decisions,
          insights: transition.insights,
          carry_forward_items: transition.carryForwardItems,
          validation_status: transition.validationStatus
        });

      if (error) {
        console.error('Error saving transition:', error);
      }
    } catch (error) {
      console.error('Error saving transition:', error);
    }
  }

  private async saveDecision(sessionId: string, decision: Decision): Promise<void> {
    // Implementation would save decision to database
  }

  private async saveCarryForwardItem(sessionId: string, item: CarryForwardItem): Promise<void> {
    // Implementation would save carry-forward item to database
  }

  private async updateCarryForwardItemInDB(sessionId: string, item: CarryForwardItem): Promise<void> {
    // Implementation would update carry-forward item in database
  }

  private async getSession(sessionId: string): Promise<WorkflowSession | null> {
    // Check cache first
    const cached = this.activeSessions.get(sessionId);
    if (cached) return cached;

    // Load from database
    try {
      const { data, error } = await supabase
        .from('workflow_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) return null;

      const session: WorkflowSession = {
        id: data.id,
        projectId: data.project_id,
        frameworkId: data.framework_id,
        startedAt: new Date(data.started_at),
        lastActivityAt: new Date(data.last_activity_at),
        currentStageId: data.current_stage_id,
        status: data.status,
        metadata: data.metadata
      };

      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // ID generators
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransitionId(): string {
    return `transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDecisionId(): string {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCarryForwardId(): string {
    return `carryforward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCheckId(): string {
    return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNextStepId(): string {
    return `nextstep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConnectionId(): string {
    return `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const workflowContinuityManager = new WorkflowContinuityManager();