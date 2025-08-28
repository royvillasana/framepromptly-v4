/**
 * @fileoverview Metrics Dashboard Component
 * Real-time dashboard for monitoring FramePromptly metrics and quality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  LineChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Shield,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  Target,
  Gauge,
  Timer
} from 'lucide-react';

import { metricsService, QualityMetrics, PerformanceMetrics, UsageMetrics, AccessibilityMetrics } from '@/lib/metrics/metrics-service';
import { templateCacheService, CacheStatistics } from '@/lib/template-caching/template-cache-service';
import { cacheIntegrationUtils, CacheHealthReport } from '@/lib/template-caching/cache-integration-utils';

interface DashboardData {
  quality: {
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    components: {
      templateQuality: number;
      contextRichness: number;
      accessibilityCompliance: number;
      userExperience: number;
      performance: number;
      reliability: number;
    };
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
  };
  activity: Array<{
    timestamp: Date;
    type: string;
    category: string;
    value: number;
    metadata: any;
  }>;
  alerts: Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    title: string;
    description: string;
  }>;
}

export const MetricsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStatistics | null>(null);
  const [cacheHealth, setCacheHealth] = useState<CacheHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    const interval = autoRefresh ? setInterval(() => {
      loadDashboardData();
    }, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [dashboard, stats, health] = await Promise.all([
        metricsService.getDashboardData(),
        templateCacheService.getStatistics(),
        cacheIntegrationUtils.getCacheHealthReport()
      ]);

      setDashboardData(dashboard);
      setCacheStats(stats);
      setCacheHealth(health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMetrics = async (format: 'json' | 'csv' | 'prometheus') => {
    try {
      const data = await metricsService.exportMetrics(format, {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      });
      
      // Create and download file
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (score >= 70) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    if (score >= 50) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable', changeRate?: number) => {
    const rate = changeRate || 0;
    switch (trend) {
      case 'improving':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-xs font-medium">+{rate.toFixed(1)}%</span>
          </div>
        );
      case 'declining':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800">
            <ArrowDownRight className="w-3 h-3" />
            <span className="text-xs font-medium">-{rate.toFixed(1)}%</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            <Minus className="w-3 h-3" />
            <span className="text-xs font-medium">0%</span>
          </div>
        );
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    trend?: 'improving' | 'declining' | 'stable';
    changeRate?: number;
    icon: React.ReactNode;
    description?: string;
    color?: 'default' | 'green' | 'red' | 'blue' | 'yellow';
  }> = ({ title, value, trend, changeRate, icon, description, color = 'default' }) => {
    const colorClasses = {
      default: 'text-gray-600',
      green: 'text-green-600',
      red: 'text-red-600', 
      blue: 'text-blue-600',
      yellow: 'text-yellow-600'
    };

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${colorClasses[color]}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">{value}</p>
                {trend && getTrendIcon(trend, changeRate)}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };


  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded"></div>
            <div className="h-9 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights into your FramePromptly performance and quality metrics
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Quality Score"
          value={`${Math.round(dashboardData?.quality.score || 0)}%`}
          trend={dashboardData?.quality.trend || 'stable'}
          changeRate={5.2}
          icon={<Gauge className="w-5 h-5" />}
          color="blue"
          description="Overall system quality"
        />
        
        <MetricCard
          title="Response Time"
          value={`${dashboardData?.performance.avgResponseTime.toFixed(0) || 0}ms`}
          trend="improving"
          changeRate={12.3}
          icon={<Timer className="w-5 h-5" />}
          color="green"
          description="Average processing time"
        />
        
        <MetricCard
          title="Cache Hit Rate"
          value={`${dashboardData?.performance.cacheHitRate.toFixed(1) || 0}%`}
          trend="improving"
          changeRate={8.1}
          icon={<Zap className="w-5 h-5" />}
          color="yellow"
          description="Template cache efficiency"
        />
        
        <MetricCard
          title="Error Rate"
          value={`${dashboardData?.performance.errorRate.toFixed(2) || 0}%`}
          trend={dashboardData?.performance.errorRate > 2 ? "declining" : "stable"}
          changeRate={2.1}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={dashboardData?.performance.errorRate > 2 ? "red" : "green"}
          description="System reliability"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quality Components Chart */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Quality Components
            </CardTitle>
            <CardDescription>
              Breakdown of quality metrics across different system components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.quality.components && Object.entries(dashboardData.quality.components).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
                    <div className={`w-2 h-2 rounded-full ${
                      value >= 90 ? 'bg-green-500' :
                      value >= 70 ? 'bg-blue-500' :
                      value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${
                cacheHealth?.overall === 'healthy' ? 'text-green-600' :
                cacheHealth?.overall === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              System Health
            </CardTitle>
            <CardDescription>Current system status and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Overall Status</p>
                <p className="text-xs text-muted-foreground">System operational</p>
              </div>
              <Badge variant={cacheHealth?.overall === 'healthy' ? 'default' : 'destructive'} className="capitalize">
                {cacheHealth?.overall || 'Unknown'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache Entries</span>
                <span className="text-sm font-medium">{cacheHealth?.statistics.totalEntries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">
                  {((cacheHealth?.statistics.totalSize || 0) / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm font-medium">{dashboardData?.activity?.length || 0}</span>
              </div>
            </div>

            {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Active Alerts</h4>
                <div className="space-y-2">
                  {dashboardData.alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className={`w-3 h-3 mt-0.5 ${
                        alert.priority === 'critical' ? 'text-red-500' :
                        alert.priority === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system events and template generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.activity && dashboardData.activity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.activity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-muted last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {activity.type.replace('_', ' ')} · {activity.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.metadata?.templateId ? `Template: ${activity.metadata.templateId}` : 'System event'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Activity will appear as you use the system</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsDashboard;