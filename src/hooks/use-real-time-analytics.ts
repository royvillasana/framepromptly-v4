/**
 * @fileoverview React Hook for Real-time Analytics
 * Provides easy-to-use interface for tracking user actions and getting metrics
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { 
  realTimeAnalytics, 
  UserActionType, 
  ActionCategory, 
  RealTimeMetrics 
} from '@/lib/analytics/real-time-analytics';

export interface UseRealTimeAnalyticsReturn {
  // Metrics data
  metrics: RealTimeMetrics | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Tracking functions
  trackAction: (action: UserActionType, category: ActionCategory, data?: Record<string, any>, duration?: number) => void;
  trackPageView: (page?: string) => void;
  trackWorkflowCreate: (frameworkId: string, projectId: string) => void;
  trackAIPromptGenerate: (toolId: string, frameworkId: string, promptLength: number) => void;
  trackAIPromptExecute: (promptId: string, responseTime: number, success: boolean) => void;
  trackProjectCreate: (projectName: string) => void;
  trackKnowledgeAdd: (documentType: string, size: number) => void;
  trackError: (error: string, context: string, stack?: string) => void;
  trackFeatureUsage: (featureName: string, context?: string) => void;
  
  // Control functions
  refreshMetrics: () => Promise<void>;
  enableAutoRefresh: (interval?: number) => void;
  disableAutoRefresh: () => void;
}

export const useRealTimeAnalytics = (
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseRealTimeAnalyticsReturn => {
  const { user } = useAuth();
  const location = useLocation();
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef<string>('');

  // Track page views automatically
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // Track page view if path changed
    if (currentPath !== previousPath && previousPath !== '') {
      realTimeAnalytics.trackPageView(currentPath);
    }
    
    previousPathRef.current = currentPath;
  }, [location.pathname]);

  // Initial page view tracking
  useEffect(() => {
    realTimeAnalytics.trackPageView(location.pathname);
  }, []);

  // Setup auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh) {
      enableAutoRefresh(refreshInterval);
    } else {
      disableAutoRefresh();
    }

    return () => {
      disableAutoRefresh();
    };
  }, [autoRefresh, refreshInterval]);

  // Refresh metrics function
  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const newMetrics = await realTimeAnalytics.getRealTimeMetrics();
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      realTimeAnalytics.trackError(
        'Failed to refresh metrics',
        'useRealTimeAnalytics',
        error instanceof Error ? error.stack : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enable auto-refresh
  const enableAutoRefresh = useCallback((interval: number = 30000) => {
    disableAutoRefresh(); // Clear any existing interval
    
    // Initial load
    refreshMetrics();
    
    // Setup interval
    refreshIntervalRef.current = setInterval(refreshMetrics, interval);
  }, [refreshMetrics]);

  // Disable auto-refresh
  const disableAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Tracking functions with error handling
  const trackAction = useCallback((
    action: UserActionType, 
    category: ActionCategory, 
    data: Record<string, any> = {},
    duration?: number
  ) => {
    try {
      realTimeAnalytics.trackAction(action, category, {
        ...data,
        userId: user?.id || null,
        userEmail: user?.email || null
      }, duration);
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }, [user]);

  const trackPageView = useCallback((page?: string) => {
    try {
      realTimeAnalytics.trackPageView(page);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, []);

  const trackWorkflowCreate = useCallback((frameworkId: string, projectId: string) => {
    try {
      realTimeAnalytics.trackWorkflowCreate(frameworkId, projectId);
    } catch (error) {
      console.error('Failed to track workflow creation:', error);
    }
  }, []);

  const trackAIPromptGenerate = useCallback((toolId: string, frameworkId: string, promptLength: number) => {
    try {
      realTimeAnalytics.trackAIPromptGenerate(toolId, frameworkId, promptLength);
    } catch (error) {
      console.error('Failed to track AI prompt generation:', error);
    }
  }, []);

  const trackAIPromptExecute = useCallback((promptId: string, responseTime: number, success: boolean) => {
    try {
      realTimeAnalytics.trackAIPromptExecute(promptId, responseTime, success);
    } catch (error) {
      console.error('Failed to track AI prompt execution:', error);
    }
  }, []);

  const trackProjectCreate = useCallback((projectName: string) => {
    try {
      realTimeAnalytics.trackProjectCreate(projectName);
    } catch (error) {
      console.error('Failed to track project creation:', error);
    }
  }, []);

  const trackKnowledgeAdd = useCallback((documentType: string, size: number) => {
    try {
      realTimeAnalytics.trackKnowledgeAdd(documentType, size);
    } catch (error) {
      console.error('Failed to track knowledge addition:', error);
    }
  }, []);

  const trackError = useCallback((error: string, context: string, stack?: string) => {
    try {
      realTimeAnalytics.trackError(error, context, stack);
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }, []);

  const trackFeatureUsage = useCallback((featureName: string, context?: string) => {
    try {
      realTimeAnalytics.trackFeatureUsage(featureName, context);
    } catch (error) {
      console.error('Failed to track feature usage:', error);
    }
  }, []);

  // Performance tracking helper
  const trackPerformance = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        trackAction(UserActionType.PAGE_VIEW, ActionCategory.SYSTEM, {
          performanceMetrics: {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            firstPaint: entry.responseEnd - entry.requestStart,
            transferSize: entry.transferSize,
            page: location.pathname
          }
        });
      }
    }
  }, [trackAction, location.pathname]);

  // Track performance on mount
  useEffect(() => {
    const timer = setTimeout(trackPerformance, 1000);
    return () => clearTimeout(timer);
  }, [trackPerformance]);

  // Error boundary integration
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(
        event.message,
        'Global Error Handler',
        event.error?.stack
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        event.reason?.message || 'Unhandled Promise Rejection',
        'Promise Rejection Handler',
        event.reason?.stack
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    metrics,
    isLoading,
    lastUpdated,
    trackAction,
    trackPageView,
    trackWorkflowCreate,
    trackAIPromptGenerate,
    trackAIPromptExecute,
    trackProjectCreate,
    trackKnowledgeAdd,
    trackError,
    trackFeatureUsage,
    refreshMetrics,
    enableAutoRefresh,
    disableAutoRefresh
  };
};

// Performance monitoring hook for specific features
export const usePerformanceTracking = (featureName: string) => {
  const { trackAction } = useRealTimeAnalytics();
  const startTimeRef = useRef<number>(Date.now());

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTracking = useCallback((success: boolean = true, additionalData?: Record<string, any>) => {
    const duration = Date.now() - startTimeRef.current;
    trackAction(
      UserActionType.FEATURE_USED,
      ActionCategory.SYSTEM,
      {
        featureName,
        success,
        ...additionalData
      },
      duration
    );
  }, [featureName, trackAction]);

  return { startTracking, endTracking };
};