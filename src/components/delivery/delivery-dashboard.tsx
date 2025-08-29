import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Truck, Target, CheckCircle, AlertCircle, XCircle, Clock, ExternalLink,
  Copy, Download, RefreshCw, Eye, Zap, Send, Settings, MoreHorizontal,
  Loader2, ArrowRight, ArrowUpRight, Calendar, Timer, Users, Gauge, Link
} from 'lucide-react';
import { useDeliveryStore } from '@/stores/delivery-store';
import { DeliveryResult, DeliveryDestination } from '@/stores/delivery-store';
import { deliveryPipeline, DeliveryProgress, ProgressCallback } from '@/lib/delivery-pipeline';
import { GeneratedPrompt } from '@/stores/prompt-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeliveryDashboardProps {
  prompt: GeneratedPrompt;
  isOpen: boolean;
  onClose: () => void;
}

interface ActiveDelivery {
  id: string;
  progress: DeliveryProgress;
}

const getStatusIcon = (status: DeliveryResult['status']) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: DeliveryResult['status']) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'yellow';
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

const getDestinationIcon = (destination: DeliveryDestination) => {
  switch (destination) {
    case 'miro':
      return <div className="w-6 h-6 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold text-xs">M</div>;
    case 'figjam':
      return <div className="w-6 h-6 bg-[#0C8CE9] rounded-full flex items-center justify-center text-white font-bold text-xs">F</div>;
    case 'figma':
      return <div className="w-6 h-6 bg-[#F24E1E] rounded-full flex items-center justify-center text-white font-bold text-xs">F</div>;
  }
};

export function DeliveryDashboard({ prompt, isOpen, onClose }: DeliveryDashboardProps) {
  const {
    deliveries,
    currentDelivery,
    isDelivering,
    deliveryProgress,
    loadProjectDeliveries,
    clearDeliveries,
    cancelDelivery,
    addDelivery
  } = useDeliveryStore();

  const [activeDeliveries, setActiveDeliveries] = useState<Map<string, ActiveDelivery>>(new Map());
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryResult | null>(null);

  // Load deliveries on component mount
  useEffect(() => {
    if (isOpen && prompt.projectId) {
      loadProjectDeliveries(prompt.projectId);
    }
  }, [isOpen, prompt.projectId, loadProjectDeliveries]);

  // Handle delivery initiation with progress tracking
  const handleDeliverToDestination = async (destination: DeliveryDestination, targetId: string) => {
    if (!targetId.trim()) {
      toast.error('Please provide a target ID');
      return;
    }

    const target = {
      destination,
      targetId: targetId.trim(),
      metadata: {}
    };

    const progressCallback: ProgressCallback = (progress) => {
      setActiveDeliveries(prev => new Map(prev.set(progress.details?.deliveryId || 'current', {
        id: progress.details?.deliveryId || 'current',
        progress
      })));
    };

    try {
      const result = await deliveryPipeline.executeDelivery(
        prompt.id,
        target,
        {
          maxRetries: 3,
          retryDelay: 1000,
          optimizePayload: true,
          validateBeforeDelivery: true
        },
        progressCallback
      );

      // Remove from active deliveries
      setActiveDeliveries(prev => {
        const updated = new Map(prev);
        updated.delete(result.id);
        return updated;
      });

      if (result.status === 'success') {
        // Add the successful delivery to the store immediately
        addDelivery(result);
        
        toast.success(`Successfully delivered to ${destination}!`, {
          description: `${result.deliveredItems} items delivered`,
          action: result.embedUrl || result.importUrl ? {
            label: 'View Result',
            onClick: () => handleViewResult(result)
          } : undefined
        });
        
        console.log('✅ Delivery completed and added to store:', {
          id: result.id,
          destination: result.destination,
          status: result.status,
          deliveredItems: result.deliveredItems,
          hasImportUrl: !!result.importUrl,
          hasEmbedUrl: !!result.embedUrl,
          importUrl: result.importUrl ? 'URL present' : 'No URL'
        });
      }

      // Also refresh deliveries list from database (if available)
      if (prompt.projectId) {
        try {
          await loadProjectDeliveries(prompt.projectId);
        } catch (error) {
          console.warn('Could not load deliveries from database (expected if tables not created yet):', error);
        }
      }

    } catch (error) {
      console.error('Delivery failed:', error);
      toast.error('Delivery failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });

      // Remove from active deliveries on error
      setActiveDeliveries(prev => {
        const updated = new Map(prev);
        updated.delete('current');
        return updated;
      });
    }
  };

  const handleCancelDelivery = async (deliveryId: string) => {
    try {
      await cancelDelivery(deliveryId);
      
      // Remove from active deliveries
      setActiveDeliveries(prev => {
        const updated = new Map(prev);
        updated.delete(deliveryId);
        return updated;
      });

      toast.success('Delivery cancelled');
    } catch (error) {
      toast.error('Failed to cancel delivery');
    }
  };

  const handleViewResult = (delivery: DeliveryResult) => {
    console.log('🔗 Viewing result for delivery:', {
      id: delivery.id,
      hasEmbedUrl: !!delivery.embedUrl,
      hasImportUrl: !!delivery.importUrl,
      embedUrl: delivery.embedUrl || 'None',
      importUrl: delivery.importUrl || 'None'
    });

    if (delivery.embedUrl) {
      console.log('🌐 Opening embed URL in new tab');
      window.open(delivery.embedUrl, '_blank');
    } else if (delivery.importUrl) {
      console.log('📋 Copying import URL to clipboard');
      navigator.clipboard.writeText(delivery.importUrl);
      toast.success('Import URL copied!', {
        description: 'Paste this URL into your FigJam/Figma plugin'
      });
    } else {
      console.warn('⚠️ No URL available for this delivery');
      toast.error('No URL available for this delivery');
    }
  };

  const handleCopyImportUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Import URL copied to clipboard');
  };

  const handleDownloadJSON = async (delivery: DeliveryResult) => {
    try {
      console.log('📥 Downloading JSON for delivery:', delivery.id);
      
      // If we have an import URL, fetch the payload directly
      if (delivery.importUrl) {
        try {
          const response = await fetch(delivery.importUrl);
          const data = await response.json();
          
          if (data.success && data.data) {
            const jsonContent = {
              ...data.data.payload,
              metadata: {
                ...data.data.metadata,
                downloadedAt: new Date().toISOString(),
                deliveryId: delivery.id,
                destination: delivery.destination
              },
              instructions: data.instructions
            };
            
            downloadJSONFile(jsonContent, `framepromptly-${delivery.destination}-${delivery.id.split('-')[1]}.json`);
            toast.success('JSON file downloaded successfully');
            return;
          }
        } catch (error) {
          console.warn('Failed to fetch from import URL, using fallback:', error);
        }
      }
      
      // Fallback: Create a basic JSON structure
      const fallbackContent = {
        id: delivery.id,
        destination: delivery.destination,
        targetId: delivery.targetId,
        summary: `Delivery to ${delivery.destination}`,
        itemCount: delivery.deliveredItems,
        metadata: {
          deliveredAt: delivery.createdAt,
          downloadedAt: new Date().toISOString(),
          fallback: true,
          note: 'This is a basic export. Import URL was not accessible.'
        }
      };
      
      downloadJSONFile(fallbackContent, `framepromptly-fallback-${delivery.destination}-${delivery.id.split('-')[1]}.json`);
      toast.success('Fallback JSON file downloaded');
      
    } catch (error) {
      console.error('Failed to download JSON:', error);
      toast.error('Failed to download JSON file');
    }
  };

  const downloadJSONFile = (content: any, filename: string) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const recentDeliveries = deliveries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const successfulDeliveries = deliveries.filter(d => d.status === 'success').length;
  const totalDeliveries = deliveries.length;
  const successRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto p-6 h-full flex flex-col max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track your content deliveries
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => prompt.projectId && loadProjectDeliveries(prompt.projectId)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                  <p className="text-2xl font-bold">{totalDeliveries}</p>
                </div>
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                </div>
                <Gauge className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {deliveries.filter(d => d.status === 'processing').length + activeDeliveries.size}
                  </p>
                </div>
                <Loader2 className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {deliveries.filter(d => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(d.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prompt.destination ? (
                <Alert>
                  <Target className="w-4 h-4" />
                  <AlertDescription>
                    This prompt is optimized for <strong>{prompt.destination.type}</strong>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Select a destination in the prompt panel to optimize content for delivery.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    {getDestinationIcon('miro')}
                    <div>
                      <h4 className="font-semibold">Miro Board</h4>
                      <p className="text-sm text-muted-foreground">Direct API delivery with live embed</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeliverToDestination('miro', 'demo-board-123')}
                      disabled={isDelivering}
                      className="flex-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Deliver
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    {getDestinationIcon('figjam')}
                    <div>
                      <h4 className="font-semibold">FigJam</h4>
                      <p className="text-sm text-muted-foreground">Plugin import for workshop content</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeliverToDestination('figjam', 'demo-file-456')}
                      disabled={isDelivering}
                      className="flex-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Generate Import
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    {getDestinationIcon('figma')}
                    <div>
                      <h4 className="font-semibold">Figma</h4>
                      <p className="text-sm text-muted-foreground">UI components and design system</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeliverToDestination('figma', 'demo-file-789')}
                      disabled={isDelivering}
                      className="flex-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Generate Import
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Deliveries
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDeliveries}
                  disabled={deliveries.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-3">
                  {/* Active Deliveries */}
                  <AnimatePresence>
                    {Array.from(activeDeliveries.values()).map((activeDelivery) => (
                      <motion.div
                        key={activeDelivery.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <div>
                              <h4 className="font-semibold text-sm">
                                {activeDelivery.progress.stage} - {activeDelivery.progress.message}
                              </h4>
                              <p className="text-xs text-muted-foreground">In progress</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelDelivery(activeDelivery.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                        <Progress value={activeDelivery.progress.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{activeDelivery.progress.progress.toFixed(0)}% complete</span>
                          <span>{activeDelivery.progress.stage}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Historical Deliveries */}
                  {recentDeliveries.length === 0 && activeDeliveries.size === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No deliveries yet</p>
                      <p className="text-sm">Start by choosing a destination above</p>
                    </div>
                  ) : (
                    recentDeliveries.map((delivery) => (
                      <motion.div
                        key={delivery.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                          selectedDelivery?.id === delivery.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(delivery.status)}
                            {getDestinationIcon(delivery.destination)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm capitalize">
                                  {delivery.destination}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {delivery.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Target: {delivery.targetId}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {delivery.status === 'success' && (
                              <TooltipProvider>
                                {/* Primary action button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewResult(delivery);
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      {delivery.embedUrl ? (
                                        <ExternalLink className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {delivery.embedUrl ? 'Open in new tab' : 'Copy import URL'}
                                  </TooltipContent>
                                </Tooltip>
                                
                                {/* Import URL button - for FigJam/Figma */}
                                {delivery.importUrl && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(delivery.importUrl!);
                                          toast.success('Import URL copied!', {
                                            description: 'Paste this into your plugin'
                                          });
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Link className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Copy import URL for plugin
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                
                                {/* Download JSON button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadJSON(delivery);
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Download JSON for manual import
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(new Date(delivery.createdAt))}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {delivery.deliveredItems}/{delivery.totalItems} items
                            </span>
                            {delivery.metadata?.processingTime && (
                              <span className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {Math.round(delivery.metadata.processingTime / 1000)}s
                              </span>
                            )}
                          </div>

                          {delivery.warnings && delivery.warnings.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {delivery.warnings.length} warning{delivery.warnings.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        {delivery.error && (
                          <Alert className="mt-2">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription className="text-xs">
                              {delivery.error}
                            </AlertDescription>
                          </Alert>
                        )}

                        {delivery.importUrl && delivery.expiresAt && (
                          <div className="mt-2 p-3 bg-muted rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                Import expires: {new Date(delivery.expiresAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyImportUrl(delivery.importUrl!);
                                }}
                                className="flex-1 h-8"
                              >
                                <Link className="w-3 h-3 mr-2" />
                                Copy Import URL
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadJSON(delivery);
                                }}
                                className="h-8"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                JSON
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}