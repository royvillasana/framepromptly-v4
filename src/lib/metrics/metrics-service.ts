/**
 * @fileoverview Metrics and Quality Tracking Service
 * Comprehensive metrics collection, analysis, and quality tracking for FramePromptly
 */

import { errorHandler } from '@/lib/error-handling/error-handler';
import { SystemError } from '@/lib/error-handling/error-types';

// Browser-compatible EventEmitter
class SimpleEventEmitter {
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export interface MetricEvent {
  id: string;
  timestamp: Date;
  type: MetricType;
  category: MetricCategory;
  value: number;
  metadata: Record<string, any>;
  tags: string[];
  sessionId?: string;
  userId?: string;
  projectId?: string;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

export enum MetricCategory {
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
  USAGE = 'usage',
  ERROR = 'error',
  CACHE = 'cache',
  TEMPLATE = 'template',
  WORKFLOW = 'workflow',
  ACCESSIBILITY = 'accessibility',
  USER_EXPERIENCE = 'user_experience'
}

export interface QualityMetrics {
  overall: number; // 0-100
  components: {
    templateQuality: number;
    contextRichness: number;
    accessibilityCompliance: number;
    userExperience: number;
    performance: number;
    reliability: number;
  };
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    changeRate: number; // percentage change
    confidence: number; // 0-1
  };
  recommendations: QualityRecommendation[];
}

export interface QualityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
  estimatedImprovement: number; // expected quality score improvement
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    templatesProcessedPerMinute: number;
  };
  resourceUsage: {
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
    cacheHitRate: number; // percentage
  };
  errorRate: number; // percentage
  availability: number; // percentage
}

export interface UsageMetrics {
  totalSessions: number;
  activeUsers: number;
  templatesGenerated: number;
  frameworkUsage: Record<string, number>;
  stageUsage: Record<string, number>;
  toolUsage: Record<string, number>;
  averageSessionDuration: number; // minutes
  bounceRate: number; // percentage
  conversionRate: number; // percentage (successful completions)
}

export interface AccessibilityMetrics {
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA';
    score: number; // 0-100
    violations: number;
    warnings: number;
  };
  screenReaderCompatibility: number; // 0-100
  keyboardNavigation: number; // 0-100
  colorContrast: number; // 0-100
  alternativeText: number; // 0-100
  semanticStructure: number; // 0-100
}

export interface MetricsConfiguration {
  enableCollection: boolean;
  enableAggregation: boolean;
  enableExport: boolean;
  retentionDays: number;
  samplingRate: number; // 0-1
  batchSize: number;
  flushInterval: number; // ms
  exportEndpoint?: string;
  enableRealTimeAnalytics: boolean;
  qualityThresholds: {
    excellent: number; // 90+
    good: number; // 70-89
    fair: number; // 50-69
    poor: number; // <50
  };
}

export interface MetricsReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    quality: QualityMetrics;
    performance: PerformanceMetrics;
    usage: UsageMetrics;
    accessibility: AccessibilityMetrics;
  };
  insights: string[];
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    recommendation: string;
  }>;
  exportUrl?: string;
}

/**
 * Comprehensive Metrics and Quality Tracking Service
 */
export class MetricsService extends SimpleEventEmitter {
  private config: MetricsConfiguration;
  private metrics: Map<string, MetricEvent[]> = new Map();
  private aggregatedMetrics: Map<string, any> = new Map();
  private flushInterval?: number;
  private qualityAnalysisCache: Map<string, QualityMetrics> = new Map();
  private performanceBuffer: MetricEvent[] = [];
  private isCollecting: boolean = true;

  constructor(config: Partial<MetricsConfiguration> = {}) {
    super();
    
    this.config = {
      enableCollection: true,
      enableAggregation: true,
      enableExport: false,
      retentionDays: 30,
      samplingRate: 1.0,
      batchSize: 100,
      flushInterval: 30000, // 30 seconds
      enableRealTimeAnalytics: true,
      qualityThresholds: {
        excellent: 90,
        good: 70,
        fair: 50,
        poor: 0
      },
      ...config
    };

    this.initializeService();
  }

  /**
   * Record a metric event
   */
  async recordMetric(
    name: string,
    type: MetricType,
    category: MetricCategory,
    value: number,
    metadata: Record<string, any> = {},
    tags: string[] = []
  ): Promise<void> {
    if (!this.isCollecting || !this.config.enableCollection) {
      return;
    }

    try {
      // Apply sampling rate
      if (Math.random() > this.config.samplingRate) {
        return;
      }

      const event: MetricEvent = {
        id: this.generateEventId(),
        timestamp: new Date(),
        type,
        category,
        value,
        metadata,
        tags,
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        projectId: metadata.projectId
      };

      // Store event
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const events = this.metrics.get(name)!;
      events.push(event);

      // Maintain retention policy
      this.enforceRetentionPolicy(events);

      // Add to performance buffer for real-time processing
      if (this.config.enableRealTimeAnalytics && category === MetricCategory.PERFORMANCE) {
        this.performanceBuffer.push(event);
      }

      // Emit event for real-time listeners
      this.emit('metric', event);

      // Trigger aggregation if buffer is full
      if (events.length % this.config.batchSize === 0) {
        await this.aggregateMetrics(name);
      }
    } catch (error) {
      await errorHandler.handleError(error, {
        metricName: name,
        metricType: type,
        category,
        additionalData: { value, metadata, tags }
      });
    }
  }

  /**
   * Record template generation metrics
   */
  async recordTemplateGeneration(
    templateId: string,
    frameworkId: string,
    stageId: string,
    toolId: string,
    processingTime: number,
    qualityScore: number,
    fromCache: boolean = false
  ): Promise<void> {
    const baseMetadata = {
      templateId,
      frameworkId,
      stageId,
      toolId,
      fromCache
    };

    await Promise.all([
      this.recordMetric('template.generation.count', MetricType.COUNTER, MetricCategory.TEMPLATE, 1, baseMetadata),
      this.recordMetric('template.generation.time', MetricType.TIMER, MetricCategory.PERFORMANCE, processingTime, baseMetadata),
      this.recordMetric('template.quality.score', MetricType.GAUGE, MetricCategory.QUALITY, qualityScore, baseMetadata),
      this.recordMetric(`framework.${frameworkId}.usage`, MetricType.COUNTER, MetricCategory.USAGE, 1, baseMetadata),
      this.recordMetric(`stage.${stageId}.usage`, MetricType.COUNTER, MetricCategory.USAGE, 1, baseMetadata),
      this.recordMetric(`tool.${toolId}.usage`, MetricType.COUNTER, MetricCategory.USAGE, 1, baseMetadata)
    ]);

    if (fromCache) {
      await this.recordMetric('cache.hit', MetricType.COUNTER, MetricCategory.CACHE, 1, baseMetadata);
    } else {
      await this.recordMetric('cache.miss', MetricType.COUNTER, MetricCategory.CACHE, 1, baseMetadata);
    }
  }

  /**
   * Record accessibility metrics
   */
  async recordAccessibilityMetrics(
    componentId: string,
    wcagLevel: 'A' | 'AA' | 'AAA',
    complianceScore: number,
    violations: number,
    warnings: number
  ): Promise<void> {
    const metadata = { componentId, wcagLevel };

    await Promise.all([
      this.recordMetric('accessibility.compliance.score', MetricType.GAUGE, MetricCategory.ACCESSIBILITY, complianceScore, metadata),
      this.recordMetric('accessibility.violations', MetricType.COUNTER, MetricCategory.ACCESSIBILITY, violations, metadata),
      this.recordMetric('accessibility.warnings', MetricType.COUNTER, MetricCategory.ACCESSIBILITY, warnings, metadata)
    ]);
  }

  /**
   * Record user experience metrics
   */
  async recordUserExperienceMetrics(
    sessionId: string,
    userId: string,
    projectId: string,
    timeToFirstInteraction: number,
    completionRate: number,
    satisfactionScore: number
  ): Promise<void> {
    const metadata = { sessionId, userId, projectId };

    await Promise.all([
      this.recordMetric('ux.time_to_first_interaction', MetricType.TIMER, MetricCategory.USER_EXPERIENCE, timeToFirstInteraction, metadata),
      this.recordMetric('ux.completion_rate', MetricType.GAUGE, MetricCategory.USER_EXPERIENCE, completionRate, metadata),
      this.recordMetric('ux.satisfaction_score', MetricType.GAUGE, MetricCategory.USER_EXPERIENCE, satisfactionScore, metadata)
    ]);
  }

  /**
   * Analyze overall quality metrics
   */
  async analyzeQualityMetrics(timeRange?: { start: Date; end: Date }): Promise<QualityMetrics> {
    try {
      const cacheKey = timeRange 
        ? `quality_${timeRange.start.getTime()}_${timeRange.end.getTime()}`
        : 'quality_current';

      // Check cache first
      if (this.qualityAnalysisCache.has(cacheKey)) {
        const cached = this.qualityAnalysisCache.get(cacheKey)!;
        const cacheAge = Date.now() - cached.trends.changeRate; // Reusing field for cache timestamp
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          return cached;
        }
      }

      const templateQuality = await this.calculateAverageMetric('template.quality.score', timeRange);
      const contextRichness = await this.calculateAverageMetric('context.richness', timeRange);
      const accessibilityCompliance = await this.calculateAverageMetric('accessibility.compliance.score', timeRange);
      const userExperience = await this.calculateAverageMetric('ux.satisfaction_score', timeRange);
      const performance = await this.calculatePerformanceScore(timeRange);
      const reliability = await this.calculateReliabilityScore(timeRange);

      const overall = (
        templateQuality * 0.2 +
        contextRichness * 0.15 +
        accessibilityCompliance * 0.2 +
        userExperience * 0.2 +
        performance * 0.15 +
        reliability * 0.1
      );

      const trends = await this.calculateTrends('quality.overall', overall);
      const recommendations = await this.generateQualityRecommendations({
        templateQuality,
        contextRichness,
        accessibilityCompliance,
        userExperience,
        performance,
        reliability
      });

      const qualityMetrics: QualityMetrics = {
        overall,
        components: {
          templateQuality,
          contextRichness,
          accessibilityCompliance,
          userExperience,
          performance,
          reliability
        },
        trends,
        recommendations
      };

      // Cache the result
      this.qualityAnalysisCache.set(cacheKey, qualityMetrics);

      return qualityMetrics;
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'quality_analysis', timeRange }
      });

      // Return fallback quality metrics
      return {
        overall: 50,
        components: {
          templateQuality: 50,
          contextRichness: 50,
          accessibilityCompliance: 50,
          userExperience: 50,
          performance: 50,
          reliability: 50
        },
        trends: {
          direction: 'stable',
          changeRate: 0,
          confidence: 0.1
        },
        recommendations: []
      };
    }
  }

  /**
   * Generate comprehensive metrics report
   */
  async generateReport(
    period: { start: Date; end: Date },
    includeInsights: boolean = true
  ): Promise<MetricsReport> {
    try {
      const reportId = this.generateReportId();

      const [quality, performance, usage, accessibility] = await Promise.all([
        this.analyzeQualityMetrics(period),
        this.calculatePerformanceMetrics(period),
        this.calculateUsageMetrics(period),
        this.calculateAccessibilityMetrics(period)
      ]);

      const insights = includeInsights ? await this.generateInsights(quality, performance, usage, accessibility) : [];
      const alerts = await this.generateAlerts(quality, performance, usage, accessibility);

      const report: MetricsReport = {
        id: reportId,
        generatedAt: new Date(),
        period,
        summary: {
          quality,
          performance,
          usage,
          accessibility
        },
        insights,
        alerts
      };

      this.emit('report:generated', report);
      return report;
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'report_generation', period }
      });
      throw error;
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(): Promise<any> {
    const last24Hours = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    };

    const [quality, performance, recentActivity] = await Promise.all([
      this.analyzeQualityMetrics(last24Hours),
      this.calculatePerformanceMetrics(last24Hours),
      this.getRecentActivity(50)
    ]);

    return {
      quality: {
        score: quality.overall,
        trend: quality.trends.direction,
        components: quality.components
      },
      performance: {
        avgResponseTime: performance.responseTime.avg,
        throughput: performance.throughput.requestsPerSecond,
        errorRate: performance.errorRate,
        cacheHitRate: performance.resourceUsage.cacheHitRate
      },
      activity: recentActivity,
      alerts: quality.recommendations
        .filter(r => r.priority === 'high' || r.priority === 'critical')
        .slice(0, 5)
    };
  }

  /**
   * Export metrics data
   */
  async exportMetrics(
    format: 'json' | 'csv' | 'prometheus',
    timeRange?: { start: Date; end: Date }
  ): Promise<string> {
    try {
      const filteredMetrics = timeRange 
        ? this.filterMetricsByTimeRange(timeRange)
        : this.metrics;

      switch (format) {
        case 'json':
          return JSON.stringify(Array.from(filteredMetrics.entries()), null, 2);
        
        case 'csv':
          return this.convertToCSV(filteredMetrics);
        
        case 'prometheus':
          return this.convertToPrometheusFormat(filteredMetrics);
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'metrics_export', format, timeRange }
      });
      throw error;
    }
  }

  /**
   * Clear old metrics data
   */
  async cleanup(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
      let totalRemoved = 0;

      for (const [name, events] of this.metrics.entries()) {
        const initialLength = events.length;
        this.metrics.set(name, events.filter(event => event.timestamp > cutoffDate));
        totalRemoved += initialLength - events.length;
      }

      // Clear cache
      this.qualityAnalysisCache.clear();
      this.performanceBuffer = this.performanceBuffer.filter(event => event.timestamp > cutoffDate);

      console.log(`Metrics cleanup completed. Removed ${totalRemoved} old events.`);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'metrics_cleanup' }
      });
    }
  }

  /**
   * Start metrics collection
   */
  startCollection(): void {
    this.isCollecting = true;
    this.emit('collection:started');
  }

  /**
   * Stop metrics collection
   */
  stopCollection(): void {
    this.isCollecting = false;
    this.emit('collection:stopped');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.metrics.clear();
    this.aggregatedMetrics.clear();
    this.qualityAnalysisCache.clear();
    this.performanceBuffer = [];
    this.removeAllListeners();
  }

  // Private helper methods

  private initializeService(): void {
    // Set up periodic aggregation
    if (this.config.enableAggregation && this.config.flushInterval > 0) {
      this.flushInterval = setInterval(() => {
        this.aggregateAllMetrics();
      }, this.config.flushInterval);
    }

    console.log('Metrics Service initialized with config:', this.config);
  }

  private generateEventId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private enforceRetentionPolicy(events: MetricEvent[]): void {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    const validEvents = events.filter(event => event.timestamp > cutoffDate);
    
    if (validEvents.length !== events.length) {
      events.splice(0, events.length, ...validEvents);
    }
  }

  private async aggregateMetrics(metricName: string): Promise<void> {
    try {
      const events = this.metrics.get(metricName);
      if (!events || events.length === 0) return;

      const aggregation = {
        count: events.length,
        sum: events.reduce((sum, event) => sum + event.value, 0),
        avg: events.reduce((sum, event) => sum + event.value, 0) / events.length,
        min: Math.min(...events.map(event => event.value)),
        max: Math.max(...events.map(event => event.value)),
        lastUpdated: new Date()
      };

      this.aggregatedMetrics.set(metricName, aggregation);
    } catch (error) {
      await errorHandler.handleError(error, {
        additionalData: { operation: 'metric_aggregation', metricName }
      });
    }
  }

  private async aggregateAllMetrics(): Promise<void> {
    for (const metricName of this.metrics.keys()) {
      await this.aggregateMetrics(metricName);
    }
  }

  private async calculateAverageMetric(metricName: string, timeRange?: { start: Date; end: Date }): Promise<number> {
    const events = this.metrics.get(metricName) || [];
    const filteredEvents = timeRange 
      ? events.filter(event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end)
      : events;

    if (filteredEvents.length === 0) return 50; // Default value

    const sum = filteredEvents.reduce((total, event) => total + event.value, 0);
    return sum / filteredEvents.length;
  }

  private async calculatePerformanceScore(timeRange?: { start: Date; end: Date }): Promise<number> {
    const responseTime = await this.calculateAverageMetric('template.generation.time', timeRange);
    const errorRate = await this.calculateAverageMetric('error.rate', timeRange);
    const cacheHitRate = await this.calculateAverageMetric('cache.hit_rate', timeRange);

    // Score based on response time (lower is better), error rate (lower is better), and cache hit rate (higher is better)
    const responseTimeScore = Math.max(0, 100 - (responseTime / 10)); // Assume 1000ms = 0 score
    const errorRateScore = Math.max(0, 100 - errorRate * 10);
    const cacheScore = cacheHitRate;

    return (responseTimeScore + errorRateScore + cacheScore) / 3;
  }

  private async calculateReliabilityScore(timeRange?: { start: Date; end: Date }): Promise<number> {
    const errorCount = await this.calculateAverageMetric('error.count', timeRange);
    const totalRequests = await this.calculateAverageMetric('requests.total', timeRange);

    if (totalRequests === 0) return 100;

    const reliability = Math.max(0, 100 - (errorCount / totalRequests * 100));
    return reliability;
  }

  private async calculateTrends(metricName: string, currentValue: number): Promise<any> {
    // This is a simplified trend calculation
    // In a real implementation, you'd analyze historical data patterns
    
    const pastWeekAvg = await this.calculateAverageMetric(metricName, {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    const changeRate = pastWeekAvg > 0 ? ((currentValue - pastWeekAvg) / pastWeekAvg) * 100 : 0;
    
    let direction: 'improving' | 'declining' | 'stable' = 'stable';
    if (Math.abs(changeRate) > 5) {
      direction = changeRate > 0 ? 'improving' : 'declining';
    }

    return {
      direction,
      changeRate: Math.abs(changeRate),
      confidence: Math.min(1, Math.max(0.1, 1 - Math.abs(changeRate) / 100))
    };
  }

  private async generateQualityRecommendations(components: any): Promise<QualityRecommendation[]> {
    const recommendations: QualityRecommendation[] = [];

    if (components.templateQuality < this.config.qualityThresholds.good) {
      recommendations.push({
        id: 'template-quality-improvement',
        priority: 'high',
        category: 'Template Quality',
        title: 'Improve Template Quality',
        description: 'Template quality scores are below acceptable thresholds',
        impact: 'Better templates lead to more accurate and useful outputs',
        effort: 'medium',
        actionItems: [
          'Review and update template validation rules',
          'Implement template optimization suggestions',
          'Enhance variable processing logic'
        ],
        estimatedImprovement: 15
      });
    }

    if (components.accessibilityCompliance < this.config.qualityThresholds.good) {
      recommendations.push({
        id: 'accessibility-compliance',
        priority: 'critical',
        category: 'Accessibility',
        title: 'Improve Accessibility Compliance',
        description: 'Accessibility scores need immediate attention',
        impact: 'Ensures the application is usable by all users',
        effort: 'high',
        actionItems: [
          'Conduct accessibility audit',
          'Fix WCAG violations',
          'Implement screen reader optimizations'
        ],
        estimatedImprovement: 25
      });
    }

    if (components.performance < this.config.qualityThresholds.good) {
      recommendations.push({
        id: 'performance-optimization',
        priority: 'medium',
        category: 'Performance',
        title: 'Optimize Performance',
        description: 'System performance could be improved',
        impact: 'Faster response times improve user experience',
        effort: 'medium',
        actionItems: [
          'Optimize cache configuration',
          'Review slow queries',
          'Implement request batching'
        ],
        estimatedImprovement: 10
      });
    }

    return recommendations;
  }

  private async calculatePerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<PerformanceMetrics> {
    const responseTimeEvents = this.getEventsInRange('template.generation.time', timeRange);
    const times = responseTimeEvents.map(event => event.value).sort((a, b) => a - b);

    return {
      responseTime: {
        avg: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
        p50: times.length > 0 ? times[Math.floor(times.length * 0.5)] : 0,
        p95: times.length > 0 ? times[Math.floor(times.length * 0.95)] : 0,
        p99: times.length > 0 ? times[Math.floor(times.length * 0.99)] : 0
      },
      throughput: {
        requestsPerSecond: await this.calculateThroughput('requests.total', timeRange),
        templatesProcessedPerMinute: await this.calculateThroughput('template.generation.count', timeRange) * 60
      },
      resourceUsage: {
        memoryUsage: await this.calculateAverageMetric('system.memory.usage', timeRange),
        cpuUsage: await this.calculateAverageMetric('system.cpu.usage', timeRange),
        cacheHitRate: await this.calculateCacheHitRate(timeRange)
      },
      errorRate: await this.calculateErrorRate(timeRange),
      availability: await this.calculateAvailability(timeRange)
    };
  }

  private async calculateUsageMetrics(timeRange: { start: Date; end: Date }): Promise<UsageMetrics> {
    const sessionEvents = this.getEventsInRange('session.count', timeRange);
    const templateEvents = this.getEventsInRange('template.generation.count', timeRange);

    // Extract framework, stage, and tool usage
    const frameworkUsage: Record<string, number> = {};
    const stageUsage: Record<string, number> = {};
    const toolUsage: Record<string, number> = {};

    for (const event of templateEvents) {
      const { frameworkId, stageId, toolId } = event.metadata;
      frameworkUsage[frameworkId] = (frameworkUsage[frameworkId] || 0) + 1;
      stageUsage[stageId] = (stageUsage[stageId] || 0) + 1;
      toolUsage[toolId] = (toolUsage[toolId] || 0) + 1;
    }

    return {
      totalSessions: sessionEvents.length,
      activeUsers: new Set(sessionEvents.map(event => event.metadata.userId)).size,
      templatesGenerated: templateEvents.length,
      frameworkUsage,
      stageUsage,
      toolUsage,
      averageSessionDuration: await this.calculateAverageMetric('session.duration', timeRange),
      bounceRate: await this.calculateBounceRate(timeRange),
      conversionRate: await this.calculateConversionRate(timeRange)
    };
  }

  private async calculateAccessibilityMetrics(timeRange: { start: Date; end: Date }): Promise<AccessibilityMetrics> {
    return {
      wcagCompliance: {
        level: 'AA',
        score: await this.calculateAverageMetric('accessibility.compliance.score', timeRange),
        violations: await this.calculateAverageMetric('accessibility.violations', timeRange),
        warnings: await this.calculateAverageMetric('accessibility.warnings', timeRange)
      },
      screenReaderCompatibility: await this.calculateAverageMetric('accessibility.screen_reader', timeRange),
      keyboardNavigation: await this.calculateAverageMetric('accessibility.keyboard_nav', timeRange),
      colorContrast: await this.calculateAverageMetric('accessibility.color_contrast', timeRange),
      alternativeText: await this.calculateAverageMetric('accessibility.alt_text', timeRange),
      semanticStructure: await this.calculateAverageMetric('accessibility.semantic_structure', timeRange)
    };
  }

  private getEventsInRange(metricName: string, timeRange: { start: Date; end: Date }): MetricEvent[] {
    const events = this.metrics.get(metricName) || [];
    return events.filter(event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end);
  }

  private async calculateThroughput(metricName: string, timeRange: { start: Date; end: Date }): Promise<number> {
    const events = this.getEventsInRange(metricName, timeRange);
    const durationSeconds = (timeRange.end.getTime() - timeRange.start.getTime()) / 1000;
    return durationSeconds > 0 ? events.length / durationSeconds : 0;
  }

  private async calculateCacheHitRate(timeRange: { start: Date; end: Date }): Promise<number> {
    const hits = this.getEventsInRange('cache.hit', timeRange).length;
    const misses = this.getEventsInRange('cache.miss', timeRange).length;
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  private async calculateErrorRate(timeRange: { start: Date; end: Date }): Promise<number> {
    const errors = this.getEventsInRange('error.count', timeRange).length;
    const requests = this.getEventsInRange('requests.total', timeRange).length;
    return requests > 0 ? (errors / requests) * 100 : 0;
  }

  private async calculateAvailability(timeRange: { start: Date; end: Date }): Promise<number> {
    // Simplified availability calculation
    // In a real implementation, this would track uptime/downtime
    const errorRate = await this.calculateErrorRate(timeRange);
    return Math.max(0, 100 - errorRate);
  }

  private async calculateBounceRate(timeRange: { start: Date; end: Date }): Promise<number> {
    // Placeholder implementation
    return 25; // 25% bounce rate
  }

  private async calculateConversionRate(timeRange: { start: Date; end: Date }): Promise<number> {
    const completions = this.getEventsInRange('workflow.completion', timeRange).length;
    const sessions = this.getEventsInRange('session.count', timeRange).length;
    return sessions > 0 ? (completions / sessions) * 100 : 0;
  }

  private async generateInsights(
    quality: QualityMetrics,
    performance: PerformanceMetrics,
    usage: UsageMetrics,
    accessibility: AccessibilityMetrics
  ): Promise<string[]> {
    const insights: string[] = [];

    if (quality.trends.direction === 'improving') {
      insights.push('Overall quality is improving, indicating successful optimization efforts');
    }

    if (performance.responseTime.avg < 100) {
      insights.push('Excellent response times are contributing to positive user experience');
    }

    if (usage.conversionRate > 80) {
      insights.push('High conversion rate suggests users are successfully completing their workflows');
    }

    if (accessibility.wcagCompliance.score > 90) {
      insights.push('Strong accessibility compliance ensures inclusive user experience');
    }

    // Add trend-based insights
    const mostUsedFramework = Object.entries(usage.frameworkUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostUsedFramework) {
      insights.push(`${mostUsedFramework[0]} is the most popular framework with ${mostUsedFramework[1]} uses`);
    }

    return insights;
  }

  private async generateAlerts(
    quality: QualityMetrics,
    performance: PerformanceMetrics,
    usage: UsageMetrics,
    accessibility: AccessibilityMetrics
  ): Promise<Array<{severity: 'info' | 'warning' | 'critical'; message: string; recommendation: string;}>> {
    const alerts: Array<{severity: 'info' | 'warning' | 'critical'; message: string; recommendation: string;}> = [];

    if (quality.overall < this.config.qualityThresholds.fair) {
      alerts.push({
        severity: 'critical',
        message: 'Overall quality score is critically low',
        recommendation: 'Immediate attention required to improve template quality and user experience'
      });
    }

    if (performance.responseTime.avg > 2000) {
      alerts.push({
        severity: 'warning',
        message: 'Response times are above acceptable thresholds',
        recommendation: 'Consider optimizing templates and improving cache hit rates'
      });
    }

    if (accessibility.wcagCompliance.score < 60) {
      alerts.push({
        severity: 'critical',
        message: 'Accessibility compliance is below minimum standards',
        recommendation: 'Conduct immediate accessibility audit and remediation'
      });
    }

    if (performance.errorRate > 5) {
      alerts.push({
        severity: 'warning',
        message: 'Error rate is higher than expected',
        recommendation: 'Investigate recent errors and implement additional error handling'
      });
    }

    return alerts;
  }

  private async getRecentActivity(limit: number): Promise<any[]> {
    const allEvents: MetricEvent[] = [];
    
    for (const events of this.metrics.values()) {
      allEvents.push(...events);
    }

    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(event => ({
        timestamp: event.timestamp,
        type: event.type,
        category: event.category,
        value: event.value,
        metadata: event.metadata
      }));
  }

  private filterMetricsByTimeRange(timeRange: { start: Date; end: Date }): Map<string, MetricEvent[]> {
    const filteredMetrics = new Map<string, MetricEvent[]>();

    for (const [name, events] of this.metrics.entries()) {
      const filteredEvents = events.filter(
        event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
      if (filteredEvents.length > 0) {
        filteredMetrics.set(name, filteredEvents);
      }
    }

    return filteredMetrics;
  }

  private convertToCSV(metrics: Map<string, MetricEvent[]>): string {
    const headers = ['metric_name', 'timestamp', 'type', 'category', 'value', 'tags', 'metadata'];
    const rows = [headers.join(',')];

    for (const [name, events] of metrics.entries()) {
      for (const event of events) {
        const row = [
          name,
          event.timestamp.toISOString(),
          event.type,
          event.category,
          event.value.toString(),
          event.tags.join(';'),
          JSON.stringify(event.metadata).replace(/"/g, '""')
        ];
        rows.push(row.join(','));
      }
    }

    return rows.join('\n');
  }

  private convertToPrometheusFormat(metrics: Map<string, MetricEvent[]>): string {
    const lines: string[] = [];

    for (const [name, events] of metrics.entries()) {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      for (const event of events) {
        const labels = Object.entries(event.metadata)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        
        const labelsStr = labels ? `{${labels}}` : '';
        lines.push(`${sanitizedName}${labelsStr} ${event.value} ${event.timestamp.getTime()}`);
      }
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const metricsService = new MetricsService({
  enableCollection: true,
  enableAggregation: true,
  enableExport: false,
  retentionDays: 30,
  samplingRate: 1.0,
  batchSize: 100,
  flushInterval: 30000,
  enableRealTimeAnalytics: true,
  qualityThresholds: {
    excellent: 90,
    good: 70,
    fair: 50,
    poor: 0
  }
});