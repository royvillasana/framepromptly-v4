/**
 * @fileoverview Real-time Analytics and User Usage Tracking
 * Tracks real user interactions, workflow creation, AI prompt usage, and system performance
 */

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface UserAction {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: UserActionType;
  category: ActionCategory;
  data: Record<string, any>;
  page?: string;
  userAgent?: string;
  duration?: number;
}

export enum UserActionType {
  PAGE_VIEW = 'page_view',
  PROJECT_CREATE = 'project_create',
  PROJECT_OPEN = 'project_open',
  WORKFLOW_CREATE = 'workflow_create',
  FRAMEWORK_SELECT = 'framework_select',
  STAGE_ADD = 'stage_add',
  TOOL_ADD = 'tool_add',
  AI_PROMPT_GENERATE = 'ai_prompt_generate',
  AI_PROMPT_EXECUTE = 'ai_prompt_execute',
  CONVERSATION_START = 'conversation_start',
  KNOWLEDGE_ADD = 'knowledge_add',
  EXPORT_DATA = 'export_data',
  SEARCH = 'search',
  ERROR_OCCURRED = 'error_occurred',
  FEATURE_USED = 'feature_used'
}

export enum ActionCategory {
  NAVIGATION = 'navigation',
  WORKFLOW = 'workflow',
  AI_INTERACTION = 'ai_interaction',
  PROJECT_MANAGEMENT = 'project_management',
  KNOWLEDGE_MANAGEMENT = 'knowledge_management',
  SYSTEM = 'system',
  ERROR = 'error'
}

export interface RealTimeMetrics {
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  pageViews: number;
  workflowsCreated: number;
  aiPromptsGenerated: number;
  aiPromptsExecuted: number;
  projectsCreated: number;
  knowledgeItemsAdded: number;
  errorRate: number;
  topPages: Array<{ page: string; views: number; avgDuration: number }>;
  topFrameworks: Array<{ framework: string; usage: number }>;
  topTools: Array<{ tool: string; usage: number }>;
  hourlyActivity: Array<{ hour: number; actions: number }>;
  userFlow: Array<{ step: string; users: number; dropoff: number }>;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  actionsCount: number;
  duration?: number;
  deviceInfo: {
    userAgent: string;
    screenResolution?: string;
    browserName?: string;
    osName?: string;
  };
  lastActivity: Date;
  isActive: boolean;
}

class RealTimeAnalytics {
  private currentSession: UserSession | null = null;
  private actionBuffer: UserAction[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private pageStartTime: Date = new Date();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSession();
    this.setupPeriodicFlush();
    this.setupPageLifecycleHandlers();
  }

  /**
   * Initialize user session
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    const userId = this.getCurrentUserId();
    
    if (!userId) return;

    this.currentSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      actionsCount: 0,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        browserName: this.getBrowserName(),
        osName: this.getOSName()
      },
      lastActivity: new Date(),
      isActive: true
    };

    // Track session start
    this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
      page: window.location.pathname,
      referrer: document.referrer,
      sessionStart: true
    });
  }

  /**
   * Track user action
   */
  public trackAction(
    action: UserActionType, 
    category: ActionCategory, 
    data: Record<string, any> = {},
    duration?: number
  ): void {
    if (!this.currentSession) return;

    const actionRecord: UserAction = {
      id: this.generateActionId(),
      userId: this.currentSession.userId,
      sessionId: this.currentSession.id,
      timestamp: new Date(),
      action,
      category,
      data: {
        ...data,
        url: window.location.href,
        pathname: window.location.pathname
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      duration
    };

    this.actionBuffer.push(actionRecord);
    this.currentSession.actionsCount++;
    this.currentSession.lastActivity = new Date();

    // Emit event for real-time listeners
    this.emit('action', actionRecord);

    // Auto-flush if buffer is getting large
    if (this.actionBuffer.length >= 10) {
      this.flushActions();
    }
  }

  /**
   * Track page view with timing
   */
  public trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname;
    const duration = Date.now() - this.pageStartTime.getTime();
    
    // Track previous page duration if > 1 second
    if (duration > 1000 && this.currentSession?.pageViews > 0) {
      this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
        page: currentPage,
        duration,
        previousPage: true
      }, duration);
    }

    // Track new page view
    this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
      page: currentPage,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });

    if (this.currentSession) {
      this.currentSession.pageViews++;
    }

    this.pageStartTime = new Date();
  }

  /**
   * Track workflow creation
   */
  public trackWorkflowCreate(frameworkId: string, projectId: string): void {
    this.trackAction(UserActionType.WORKFLOW_CREATE, ActionCategory.WORKFLOW, {
      frameworkId,
      projectId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track AI prompt usage
   */
  public trackAIPromptGenerate(toolId: string, frameworkId: string, promptLength: number): void {
    this.trackAction(UserActionType.AI_PROMPT_GENERATE, ActionCategory.AI_INTERACTION, {
      toolId,
      frameworkId,
      promptLength,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track AI prompt execution
   */
  public trackAIPromptExecute(promptId: string, responseTime: number, success: boolean): void {
    this.trackAction(UserActionType.AI_PROMPT_EXECUTE, ActionCategory.AI_INTERACTION, {
      promptId,
      responseTime,
      success,
      timestamp: new Date().toISOString()
    }, responseTime);
  }

  /**
   * Track project creation
   */
  public trackProjectCreate(projectName: string): void {
    this.trackAction(UserActionType.PROJECT_CREATE, ActionCategory.PROJECT_MANAGEMENT, {
      projectName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track knowledge base additions
   */
  public trackKnowledgeAdd(documentType: string, size: number): void {
    this.trackAction(UserActionType.KNOWLEDGE_ADD, ActionCategory.KNOWLEDGE_MANAGEMENT, {
      documentType,
      size,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track errors
   */
  public trackError(error: string, context: string, stack?: string): void {
    this.trackAction(UserActionType.ERROR_OCCURRED, ActionCategory.ERROR, {
      error,
      context,
      stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(featureName: string, context?: string): void {
    this.trackAction(UserActionType.FEATURE_USED, ActionCategory.SYSTEM, {
      featureName,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get real-time metrics for the dashboard
   */
  public async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      // Flush pending actions first
      await this.flushActions();

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get data from Supabase
      const { data: actions, error } = await supabase
        .from('user_actions')
        .select('*')
        .gte('timestamp', last24Hours.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching user actions:', error);
        return this.getDefaultMetrics();
      }

      return this.calculateMetrics(actions || []);
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calculate metrics from action data
   */
  private calculateMetrics(actions: any[]): RealTimeMetrics {
    const sessions = new Set(actions.map(a => a.session_id));
    const users = new Set(actions.map(a => a.user_id));
    
    const pageViews = actions.filter(a => a.action === UserActionType.PAGE_VIEW).length;
    const workflowsCreated = actions.filter(a => a.action === UserActionType.WORKFLOW_CREATE).length;
    const aiPromptsGenerated = actions.filter(a => a.action === UserActionType.AI_PROMPT_GENERATE).length;
    const aiPromptsExecuted = actions.filter(a => a.action === UserActionType.AI_PROMPT_EXECUTE).length;
    const projectsCreated = actions.filter(a => a.action === UserActionType.PROJECT_CREATE).length;
    const knowledgeItemsAdded = actions.filter(a => a.action === UserActionType.KNOWLEDGE_ADD).length;
    const errors = actions.filter(a => a.action === UserActionType.ERROR_OCCURRED).length;

    // Calculate top pages
    const pageStats: Record<string, { views: number; durations: number[] }> = {};
    actions.filter(a => a.action === UserActionType.PAGE_VIEW).forEach(action => {
      const page = action.data.page || action.page || 'unknown';
      if (!pageStats[page]) {
        pageStats[page] = { views: 0, durations: [] };
      }
      pageStats[page].views++;
      if (action.duration) {
        pageStats[page].durations.push(action.duration);
      }
    });

    const topPages = Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        views: stats.views,
        avgDuration: stats.durations.length > 0 
          ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length 
          : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate framework usage
    const frameworkStats: Record<string, number> = {};
    actions.filter(a => a.action === UserActionType.FRAMEWORK_SELECT || a.action === UserActionType.WORKFLOW_CREATE)
      .forEach(action => {
        const framework = action.data.frameworkId || 'unknown';
        frameworkStats[framework] = (frameworkStats[framework] || 0) + 1;
      });

    const topFrameworks = Object.entries(frameworkStats)
      .map(([framework, usage]) => ({ framework, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Calculate tool usage
    const toolStats: Record<string, number> = {};
    actions.filter(a => a.action === UserActionType.TOOL_ADD || a.action === UserActionType.AI_PROMPT_GENERATE)
      .forEach(action => {
        const tool = action.data.toolId || 'unknown';
        toolStats[tool] = (toolStats[tool] || 0) + 1;
      });

    const topTools = Object.entries(toolStats)
      .map(([tool, usage]) => ({ tool, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Calculate hourly activity
    const hourlyStats: Record<number, number> = {};
    actions.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    });

    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      actions: hourlyStats[hour] || 0
    }));

    // Calculate session duration
    const sessionDurations: number[] = [];
    // This would require session end times to be properly calculated

    return {
      activeUsers: users.size,
      totalSessions: sessions.size,
      avgSessionDuration: sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0,
      pageViews,
      workflowsCreated,
      aiPromptsGenerated,
      aiPromptsExecuted,
      projectsCreated,
      knowledgeItemsAdded,
      errorRate: actions.length > 0 ? (errors / actions.length) * 100 : 0,
      topPages,
      topFrameworks,
      topTools,
      hourlyActivity,
      userFlow: [] // Would need to implement user flow analysis
    };
  }

  /**
   * Flush buffered actions to database
   */
  private async flushActions(): Promise<void> {
    if (this.actionBuffer.length === 0) return;

    try {
      const actionsToFlush = [...this.actionBuffer];
      this.actionBuffer = [];

      // Convert to database format
      const dbActions = actionsToFlush.map(action => ({
        id: action.id,
        user_id: action.userId,
        session_id: action.sessionId,
        timestamp: action.timestamp.toISOString(),
        action: action.action,
        category: action.category,
        data: action.data,
        page: action.page,
        user_agent: action.userAgent,
        duration: action.duration
      }));

      const { error } = await supabase
        .from('user_actions')
        .insert(dbActions);

      if (error) {
        console.error('Error saving user actions:', error);
        // Put actions back in buffer for retry
        this.actionBuffer.unshift(...actionsToFlush);
      }
    } catch (error) {
      console.error('Error flushing actions:', error);
    }
  }

  /**
   * Setup periodic flush of actions
   */
  private setupPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushActions();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Setup page lifecycle handlers
   */
  private setupPageLifecycleHandlers(): void {
    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
      this.flushActions();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
          visibility: 'hidden',
          timestamp: new Date().toISOString()
        });
      } else {
        this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
          visibility: 'visible',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * End current session
   */
  private endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
      this.currentSession.isActive = false;

      // Track session end
      this.trackAction(UserActionType.PAGE_VIEW, ActionCategory.NAVIGATION, {
        sessionEnd: true,
        duration: this.currentSession.duration,
        actionsCount: this.currentSession.actionsCount,
        pageViews: this.currentSession.pageViews
      });
    }
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | null {
    // This would integrate with your auth system
    return localStorage.getItem('supabase.auth.token') ? 'current_user' : null;
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDefaultMetrics(): RealTimeMetrics {
    return {
      activeUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      pageViews: 0,
      workflowsCreated: 0,
      aiPromptsGenerated: 0,
      aiPromptsExecuted: 0,
      projectsCreated: 0,
      knowledgeItemsAdded: 0,
      errorRate: 0,
      topPages: [],
      topFrameworks: [],
      topTools: [],
      hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, actions: 0 })),
      userFlow: []
    };
  }

  /**
   * Event emitter methods
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    this.endSession();
    this.flushActions();
  }
}

// Export singleton instance
export const realTimeAnalytics = new RealTimeAnalytics();