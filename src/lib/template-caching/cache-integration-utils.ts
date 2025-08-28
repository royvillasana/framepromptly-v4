/**
 * @fileoverview Template Cache Integration Utilities
 * Utilities for integrating template caching with existing services and components
 */

import { templateCacheService, CacheStatistics } from './template-cache-service';
import { enhancedVariableHandler } from '@/lib/enhanced-variable-handler';
import { EnhancedToolPromptTemplate } from '@/lib/tool-templates-enhanced';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { errorHandler } from '@/lib/error-handling/error-handler';
import { 
  TemplateProcessingError,
  SystemError 
} from '@/lib/error-handling/error-types';

export interface CachedProcessingOptions {
  enableCaching: boolean;
  forceCacheRefresh: boolean;
  cacheProcessedResults: boolean;
  optimizationLevel: 'none' | 'basic' | 'aggressive';
}

export interface ProcessingResult {
  template: EnhancedToolPromptTemplate;
  fromCache: boolean;
  cacheHit: boolean;
  processingTime: number;
  cacheKey: string;
  statistics?: {
    validationScore: number;
    optimizationApplied: boolean;
    compressionRatio?: number;
  };
}

export interface CacheHealthReport {
  overall: 'healthy' | 'warning' | 'critical';
  statistics: CacheStatistics;
  recommendations: string[];
  issues: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  memoryPressure: {
    level: 'low' | 'medium' | 'high';
    recommendedAction?: string;
  };
}

/**
 * Template Cache Integration Utilities
 */
export class CacheIntegrationUtils {
  private static instance: CacheIntegrationUtils;
  private performanceMonitor: Map<string, number[]> = new Map();
  private healthCheckInterval?: number;

  private constructor() {
    this.initializeHealthMonitoring();
  }

  public static getInstance(): CacheIntegrationUtils {
    if (!CacheIntegrationUtils.instance) {
      CacheIntegrationUtils.instance = new CacheIntegrationUtils();
    }
    return CacheIntegrationUtils.instance;
  }

  /**
   * Enhanced template processing with caching integration
   */
  async processTemplateWithCaching(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userInputs: Record<string, any>,
    options: Partial<CachedProcessingOptions> = {}
  ): Promise<ProcessingResult> {
    const startTime = performance.now();
    const opts: CachedProcessingOptions = {
      enableCaching: true,
      forceCacheRefresh: false,
      cacheProcessedResults: true,
      optimizationLevel: 'basic',
      ...options
    };

    try {
      let template: EnhancedToolPromptTemplate | null = null;
      let fromCache = false;
      let cacheHit = false;
      const cacheKey = this.generateCacheKey(templateId, framework.id, stage.id, tool.id);

      // Try to get from cache first (if caching enabled and not forcing refresh)
      if (opts.enableCaching && !opts.forceCacheRefresh) {
        template = await templateCacheService.getTemplate(templateId, framework, stage, tool);
        if (template) {
          fromCache = true;
          cacheHit = true;
        }
      }

      // If not in cache, we would typically fetch from template service
      // For now, this is a placeholder for the actual template fetching logic
      if (!template) {
        // This would be replaced with actual template service call
        template = await this.fetchTemplateFromService(templateId, framework, stage, tool);
        
        if (template && opts.enableCaching) {
          // Store in cache for future use
          await templateCacheService.storeTemplate(templateId, template, framework, stage, tool);
        }
      }

      if (!template) {
        throw new TemplateProcessingError(
          'Template not found',
          { templateId, frameworkId: framework.id, stageId: stage.id, toolId: tool.id },
          templateId
        );
      }

      const processingTime = performance.now() - startTime;
      this.recordPerformanceMetric(cacheKey, processingTime);

      // Get validation score from cache
      const cacheEntry = opts.enableCaching 
        ? await templateCacheService.getTemplate(templateId, framework, stage, tool)
        : null;

      const result: ProcessingResult = {
        template,
        fromCache,
        cacheHit,
        processingTime,
        cacheKey,
        statistics: cacheEntry ? {
          validationScore: 0, // Would be extracted from cache entry
          optimizationApplied: true,
          compressionRatio: 0.8 // Would be extracted from cache entry
        } : undefined
      };

      return result;
    } catch (error) {
      const processingTime = performance.now() - startTime;
      
      await errorHandler.handleError(error, {
        templateId,
        frameworkId: framework.id,
        stageId: stage.id,
        toolId: tool.id,
        processingTime,
        additionalData: { cachingEnabled: opts.enableCaching }
      });

      throw error;
    }
  }

  /**
   * Process template variables with caching support
   */
  async processTemplateVariablesWithCaching(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool,
    userInputs: Record<string, any>,
    options: Partial<CachedProcessingOptions> = {}
  ): Promise<any> {
    const opts: CachedProcessingOptions = {
      enableCaching: true,
      forceCacheRefresh: false,
      cacheProcessedResults: true,
      optimizationLevel: 'basic',
      ...options
    };

    try {
      // Check for processed template in cache
      if (opts.enableCaching && opts.cacheProcessedResults && !opts.forceCacheRefresh) {
        const processedTemplate = await templateCacheService.getProcessedTemplate(
          templateId,
          framework,
          stage,
          tool,
          userInputs
        );

        if (processedTemplate) {
          return {
            ...processedTemplate,
            fromCache: true
          };
        }
      }

      // Get template (potentially from cache)
      const templateResult = await this.processTemplateWithCaching(
        templateId,
        framework,
        stage,
        tool,
        userInputs,
        opts
      );

      // Process variables using enhanced variable handler
      const variableContext = {
        framework,
        stage,
        tool,
        projectContext: {
          domain: 'general',
          targetAudience: [],
          constraints: [],
          goals: []
        },
        knowledgeBase: [],
        previousOutputs: [],
        userPreferences: {
          accessibilityLevel: 'basic' as const,
          outputDetailLevel: 'moderate' as const,
          includeResearchBacking: false,
          includeExamples: true,
          communicationStyle: 'conversational' as const
        }
      };

      const processedTemplate = await enhancedVariableHandler.processTemplate(
        templateResult.template.template,
        userInputs,
        [],
        variableContext
      );

      // Cache the processed result if enabled
      if (opts.enableCaching && opts.cacheProcessedResults) {
        await templateCacheService.storeProcessedTemplate(
          templateId,
          framework,
          stage,
          tool,
          userInputs,
          processedTemplate
        );
      }

      return {
        ...processedTemplate,
        fromCache: false,
        originalFromCache: templateResult.fromCache
      };
    } catch (error) {
      await errorHandler.handleError(error, {
        templateId,
        frameworkId: framework.id,
        stageId: stage.id,
        toolId: tool.id,
        additionalData: { operation: 'variable_processing' }
      });
      throw error;
    }
  }

  /**
   * Batch process multiple templates with caching
   */
  async batchProcessTemplates(
    requests: Array<{
      templateId: string;
      framework: UXFramework;
      stage: UXStage;
      tool: UXTool;
      userInputs: Record<string, any>;
    }>,
    options: Partial<CachedProcessingOptions> = {}
  ): Promise<ProcessingResult[]> {
    try {
      const results = await Promise.allSettled(
        requests.map(request =>
          this.processTemplateWithCaching(
            request.templateId,
            request.framework,
            request.stage,
            request.tool,
            request.userInputs,
            options
          )
        )
      );

      const processedResults: ProcessingResult[] = [];
      const errors: Error[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          processedResults.push(result.value);
        } else {
          errors.push(new Error(`Batch processing failed for request ${index}: ${result.reason}`));
        }
      });

      if (errors.length > 0) {
        console.warn(`Batch processing completed with ${errors.length} errors:`, errors);
      }

      return processedResults;
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { 
          operation: 'batch_processing',
          requestCount: requests.length
        }
      });
      throw error;
    }
  }

  /**
   * Warm up cache with frequently used templates
   */
  async warmUpCache(
    templateIds: string[],
    frameworks: UXFramework[],
    stages: UXStage[],
    tools: UXTool[]
  ): Promise<void> {
    try {
      console.log('Starting cache warm-up...');
      
      const warmupRequests: Array<{
        templateId: string;
        framework: UXFramework;
        stage: UXStage;
        tool: UXTool;
        userInputs: Record<string, any>;
      }> = [];

      // Generate all combinations for warm-up
      for (const templateId of templateIds) {
        for (const framework of frameworks) {
          for (const stage of framework.stages.filter(s => stages.some(stage => stage.id === s.id))) {
            for (const tool of stage.tools.filter(t => tools.some(tool => tool.id === t.id))) {
              warmupRequests.push({
                templateId,
                framework,
                stage,
                tool,
                userInputs: {} // Empty inputs for warm-up
              });
            }
          }
        }
      }

      // Process in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < warmupRequests.length; i += batchSize) {
        const batch = warmupRequests.slice(i, i + batchSize);
        await this.batchProcessTemplates(batch, {
          enableCaching: true,
          forceCacheRefresh: false,
          cacheProcessedResults: false, // Don't cache empty results
          optimizationLevel: 'basic'
        });

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Cache warm-up completed for ${warmupRequests.length} template combinations`);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { 
          operation: 'cache_warmup',
          templateCount: templateIds.length
        }
      });
    }
  }

  /**
   * Get comprehensive cache health report
   */
  async getCacheHealthReport(): Promise<CacheHealthReport> {
    try {
      const statistics = templateCacheService.getStatistics();
      const recommendations: string[] = [];
      const issues: Array<{
        severity: 'low' | 'medium' | 'high';
        message: string;
        suggestion: string;
      }> = [];

      // Analyze hit rate
      if (statistics.hitRate < 0.3) {
        issues.push({
          severity: 'high',
          message: 'Low cache hit rate detected',
          suggestion: 'Consider preloading frequently used templates or adjusting cache size'
        });
        recommendations.push('Implement cache warm-up strategy for frequently accessed templates');
      } else if (statistics.hitRate < 0.6) {
        issues.push({
          severity: 'medium',
          message: 'Moderate cache hit rate',
          suggestion: 'Review template access patterns and consider cache optimization'
        });
      }

      // Analyze memory usage
      const memoryUsagePercent = statistics.memoryUsage.total / (100 * 1024 * 1024); // Assume 100MB limit
      let memoryPressureLevel: 'low' | 'medium' | 'high' = 'low';
      let recommendedAction: string | undefined;

      if (memoryUsagePercent > 0.9) {
        memoryPressureLevel = 'high';
        recommendedAction = 'Increase cache size or implement more aggressive eviction policies';
        issues.push({
          severity: 'high',
          message: 'High memory pressure detected',
          suggestion: recommendedAction
        });
      } else if (memoryUsagePercent > 0.7) {
        memoryPressureLevel = 'medium';
        recommendedAction = 'Monitor memory usage and consider optimization';
        issues.push({
          severity: 'medium',
          message: 'Moderate memory usage',
          suggestion: recommendedAction
        });
      }

      // Analyze validation success rate
      if (statistics.validationSuccessRate < 0.8) {
        issues.push({
          severity: 'high',
          message: 'Low template validation success rate',
          suggestion: 'Review template quality and validation rules'
        });
        recommendations.push('Implement stricter template validation during storage');
      }

      // Generate overall health status
      const criticalIssues = issues.filter(issue => issue.severity === 'high').length;
      const moderateIssues = issues.filter(issue => issue.severity === 'medium').length;

      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalIssues > 0) {
        overall = 'critical';
      } else if (moderateIssues > 2) {
        overall = 'warning';
      }

      // Add general recommendations
      if (statistics.totalEntries === 0) {
        recommendations.push('Cache appears to be empty - consider implementing cache warm-up');
      }

      if (statistics.averageProcessingTime > 100) {
        recommendations.push('High processing times detected - consider template optimization');
      }

      return {
        overall,
        statistics,
        recommendations,
        issues,
        memoryPressure: {
          level: memoryPressureLevel,
          recommendedAction
        }
      };
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'cache_health_check' }
      });

      // Return a minimal health report on error
      return {
        overall: 'critical',
        statistics: templateCacheService.getStatistics(),
        recommendations: ['Unable to perform complete health check - investigate cache service'],
        issues: [{
          severity: 'high',
          message: 'Cache health check failed',
          suggestion: 'Check cache service logs and restart if necessary'
        }],
        memoryPressure: {
          level: 'high',
          recommendedAction: 'Restart cache service'
        }
      };
    }
  }

  /**
   * Optimize cache performance based on usage patterns
   */
  async optimizeCachePerformance(): Promise<{
    optimizationsApplied: string[];
    performanceImprovement: number;
  }> {
    try {
      const startTime = performance.now();
      const optimizationsApplied: string[] = [];

      // Perform cache optimization
      await templateCacheService.optimizeCache();
      optimizationsApplied.push('Cache optimization and cleanup completed');

      // Analyze performance patterns
      const performanceData = Array.from(this.performanceMonitor.entries());
      const slowOperations = performanceData.filter(([key, times]) => {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        return avgTime > 100; // 100ms threshold
      });

      if (slowOperations.length > 0) {
        optimizationsApplied.push(`Identified ${slowOperations.length} slow operations for optimization`);
      }

      // Clear old performance data
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      for (const [key, times] of this.performanceMonitor.entries()) {
        const recentTimes = times.filter(time => time > cutoffTime);
        if (recentTimes.length === 0) {
          this.performanceMonitor.delete(key);
        } else {
          this.performanceMonitor.set(key, recentTimes);
        }
      }
      optimizationsApplied.push('Performance monitoring data cleanup completed');

      const totalTime = performance.now() - startTime;
      const performanceImprovement = Math.max(0, 100 - totalTime); // Simplified calculation

      return {
        optimizationsApplied,
        performanceImprovement
      };
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'cache_performance_optimization' }
      });

      return {
        optimizationsApplied: ['Optimization failed - check error logs'],
        performanceImprovement: 0
      };
    }
  }

  /**
   * Export cache data for backup or analysis
   */
  exportCacheData(): any {
    return templateCacheService.exportCacheData();
  }

  /**
   * Import cache data from backup
   */
  async importCacheData(data: any): Promise<boolean> {
    return await templateCacheService.importCacheData(data);
  }

  /**
   * Clear cache with options
   */
  async clearCache(options: {
    templateId?: string;
    frameworkId?: string;
    stageId?: string;
    toolId?: string;
    clearPerformanceData?: boolean;
  } = {}): Promise<void> {
    try {
      await templateCacheService.invalidate(
        options.templateId,
        options.frameworkId,
        options.stageId,
        options.toolId
      );

      if (options.clearPerformanceData) {
        this.performanceMonitor.clear();
      }

      console.log('Cache cleared successfully', options);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'cache_clear', options }
      });
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.performanceMonitor.clear();
    templateCacheService.destroy();
  }

  // Private helper methods

  private async fetchTemplateFromService(
    templateId: string,
    framework: UXFramework,
    stage: UXStage,
    tool: UXTool
  ): Promise<EnhancedToolPromptTemplate | null> {
    // This would be replaced with actual template service call
    // For now, return a placeholder template
    return {
      id: templateId,
      name: `${tool.name} Template`,
      description: `Enhanced template for ${tool.name} in ${stage.name} stage`,
      template: `Generate a ${tool.name.toLowerCase()} for the ${stage.name.toLowerCase()} stage.\n\n{prompt}`,
      variables: [
        {
          id: 'prompt',
          name: 'Prompt',
          description: 'Main prompt content',
          type: 'textarea',
          required: true,
          placeholder: 'Enter your prompt here...'
        }
      ],
      version: '1.0.0',
      category: 'ux-methodology',
      accessibility: {
        wcagLevel: 'AA',
        screenReaderOptimized: true,
        keyboardNavigable: true,
        colorContrastCompliant: true
      },
      researchBacking: {
        sources: [],
        methodology: framework.name,
        evidenceLevel: 'moderate'
      },
      qualityMetrics: {
        completeness: 0.8,
        clarity: 0.9,
        actionability: 0.85,
        accessibility: 0.9
      },
      accessibilityInstructions: [
        'Ensure all outputs include proper heading structure',
        'Provide alternative text for any visual elements',
        'Use clear, concise language'
      ],
      enhancedInstructions: {
        contextAwareness: 'Consider the user\'s previous inputs and project context',
        adaptiveGuidance: 'Adjust recommendations based on user expertise level',
        qualityAssurance: 'Include validation checkpoints in your response'
      }
    };
  }

  private generateCacheKey(templateId: string, frameworkId: string, stageId: string, toolId: string): string {
    return `${templateId}:${frameworkId}:${stageId}:${toolId}`;
  }

  private recordPerformanceMetric(key: string, time: number): void {
    if (!this.performanceMonitor.has(key)) {
      this.performanceMonitor.set(key, []);
    }
    
    const times = this.performanceMonitor.get(key)!;
    times.push(time);
    
    // Keep only recent measurements (last 100)
    if (times.length > 100) {
      times.splice(0, times.length - 100);
    }
  }

  private initializeHealthMonitoring(): void {
    // Set up periodic health checks (every 5 minutes)
    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthReport = await this.getCacheHealthReport();
        
        if (healthReport.overall === 'critical') {
          console.warn('Critical cache health issues detected:', healthReport.issues);
        }
        
        // Auto-optimize if needed
        if (healthReport.overall !== 'healthy') {
          await this.optimizeCachePerformance();
        }
      } catch (error) {
        console.error('Health monitoring failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Export singleton instance
export const cacheIntegrationUtils = CacheIntegrationUtils.getInstance();