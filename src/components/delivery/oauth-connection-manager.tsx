import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Link, Unlink, CheckCircle, AlertCircle, XCircle, ExternalLink,
  Settings, RefreshCw, Trash2, Eye, EyeOff, Copy, Shield, Clock,
  Key, Users, Loader2, ArrowUpRight, Info
} from 'lucide-react';
import { useDeliveryStore } from '@/stores/delivery-store';
import { DeliveryDestination, OAuthConnection } from '@/stores/delivery-store';
import { oauthManager } from '@/lib/oauth-manager';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OAuthConnectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConnectionTestResult {
  isValid: boolean;
  userInfo?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

const getDestinationInfo = (destination: DeliveryDestination) => {
  switch (destination) {
    case 'miro':
      return {
        name: 'Miro',
        icon: <div className="w-8 h-8 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold text-sm">M</div>,
        color: '#FFD02F',
        description: 'Connect to Miro for direct board delivery',
        scopes: ['boards:read', 'boards:write'],
        authRequired: true
      };
    case 'figjam':
      return {
        name: 'FigJam',
        icon: <div className="w-8 h-8 bg-[#0C8CE9] rounded-full flex items-center justify-center text-white font-bold text-sm">F</div>,
        color: '#0C8CE9', 
        description: 'Plugin-based import, no OAuth required',
        scopes: [],
        authRequired: false
      };
    case 'figma':
      return {
        name: 'Figma',
        icon: <div className="w-8 h-8 bg-[#F24E1E] rounded-full flex items-center justify-center text-white font-bold text-sm">F</div>,
        color: '#F24E1E',
        description: 'Plugin-based import, no OAuth required',
        scopes: [],
        authRequired: false
      };
  }
};

function ConnectionCard({ 
  destination, 
  connection, 
  onConnect, 
  onDisconnect, 
  onTest, 
  onRefresh,
  isConnecting, 
  isTesting,
  testResult 
}: {
  destination: DeliveryDestination;
  connection?: OAuthConnection;
  onConnect: (destination: DeliveryDestination) => void;
  onDisconnect: (connectionId: string) => void;
  onTest: (destination: DeliveryDestination) => void;
  onRefresh: (connectionId: string) => void;
  isConnecting: boolean;
  isTesting: boolean;
  testResult?: ConnectionTestResult;
}) {
  const info = getDestinationInfo(destination);
  const [showDetails, setShowDetails] = useState(false);
  
  const isConnected = !!connection?.isActive;
  const isExpiring = connection?.expiresAt && new Date(connection.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24 hours

  if (!info.authRequired) {
    return (
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {info.icon}
              <div>
                <CardTitle className="text-lg">{info.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-300">
              Plugin-based
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              {info.name} uses plugin-based import. No OAuth connection required.
              Install the FramePromptly plugin in {info.name} to import content.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative transition-all", isConnected && "border-green-300 bg-green-50/50")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {info.icon}
            <div>
              <CardTitle className="text-lg">{info.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                {isExpiring && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Token expires soon
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </>
            ) : (
              <Badge variant="outline" className="text-gray-600">
                <XCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Details */}
        {isConnected && connection && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connected Account</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 px-2"
              >
                {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
            
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 text-sm"
              >
                {connection.metadata?.username && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-mono">{connection.metadata.username}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scopes:</span>
                  <span className="font-mono text-xs">
                    {connection.scopes.join(', ') || 'None'}
                  </span>
                </div>
                
                {connection.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className={cn(
                      "font-mono text-xs",
                      isExpiring && "text-yellow-600 font-semibold"
                    )}>
                      {new Date(connection.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected:</span>
                  <span className="font-mono text-xs">
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className={testResult.isValid ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
                {testResult.isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResult.isValid ? (
                    <div>
                      <strong>Connection verified!</strong>
                      {testResult.userInfo && (
                        <div className="mt-1 text-sm">
                          Connected as: {testResult.userInfo.name} ({testResult.userInfo.email})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <strong>Connection failed</strong>
                      <div className="mt-1 text-sm">{testResult.error}</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Required Scopes */}
        {info.scopes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Required Permissions</Label>
            <div className="flex flex-wrap gap-1">
              {info.scopes.map((scope) => (
                <Badge key={scope} variant="secondary" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(destination)}
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Shield className="w-3 h-3 mr-1" />
                )}
                Test
              </Button>
              
              {isExpiring && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRefresh(connection.id)}
                  className="flex-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDisconnect(connection.id)}
                className="flex-1"
              >
                <Unlink className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onConnect(destination)}
              disabled={isConnecting}
              className="flex-1"
              style={{ backgroundColor: info.color }}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              Connect to {info.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OAuthConnectionManager({ isOpen, onClose }: OAuthConnectionManagerProps) {
  const {
    connections,
    isConnecting,
    loadConnections,
    initiateOAuth,
    completeOAuth,
    refreshConnection,
    revokeConnection
  } = useDeliveryStore();

  const [testResults, setTestResults] = useState<Map<DeliveryDestination, ConnectionTestResult>>(new Map());
  const [testingDestination, setTestingDestination] = useState<DeliveryDestination | null>(null);
  const [oauthWindow, setOauthWindow] = useState<Window | null>(null);
  const [pendingDestination, setPendingDestination] = useState<DeliveryDestination | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen, loadConnections]);

  // Monitor OAuth window
  useEffect(() => {
    if (!oauthWindow || !pendingDestination) return;

    const checkWindow = setInterval(() => {
      if (oauthWindow.closed) {
        clearInterval(checkWindow);
        setOauthWindow(null);
        setPendingDestination(null);
        toast.error('OAuth process cancelled');
      }
    }, 1000);

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS' && event.data.destination === pendingDestination) {
        clearInterval(checkWindow);
        oauthWindow.close();
        setOauthWindow(null);
        
        handleOAuthCallback(pendingDestination, event.data.code);
        setPendingDestination(null);
      } else if (event.data.type === 'OAUTH_ERROR') {
        clearInterval(checkWindow);
        oauthWindow.close();
        setOauthWindow(null);
        setPendingDestination(null);
        
        toast.error('OAuth failed', {
          description: event.data.error
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      clearInterval(checkWindow);
      window.removeEventListener('message', handleMessage);
    };
  }, [oauthWindow, pendingDestination]);

  const handleConnect = async (destination: DeliveryDestination) => {
    try {
      const authUrl = await initiateOAuth(destination);
      
      // Open OAuth window
      const width = 500;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        authUrl,
        `oauth-${destination}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        throw new Error('Failed to open OAuth window. Please allow popups for this site.');
      }
      
      setOauthWindow(popup);
      setPendingDestination(destination);
      
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      toast.error('Failed to start OAuth process', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleOAuthCallback = async (destination: DeliveryDestination, code: string) => {
    try {
      await completeOAuth(destination, code);
      
      toast.success(`Successfully connected to ${destination}!`, {
        description: 'You can now deliver content directly'
      });
      
      // Reload connections
      loadConnections();
      
    } catch (error) {
      console.error('OAuth completion failed:', error);
      toast.error('Failed to complete OAuth', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await revokeConnection(connectionId);
      
      toast.success('Connection removed');
      
      // Clear test results for this connection
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        setTestResults(prev => {
          const updated = new Map(prev);
          updated.delete(connection.destination);
          return updated;
        });
      }
      
      loadConnections();
      
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleTest = async (destination: DeliveryDestination) => {
    setTestingDestination(destination);
    
    try {
      const result = await oauthManager.testConnection(destination);
      
      setTestResults(prev => new Map(prev.set(destination, result)));
      
      if (result.isValid) {
        toast.success(`${destination} connection verified!`);
      } else {
        toast.error(`${destination} connection test failed`);
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      
      const errorResult: ConnectionTestResult = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Test failed'
      };
      
      setTestResults(prev => new Map(prev.set(destination, errorResult)));
      
    } finally {
      setTestingDestination(null);
    }
  };

  const handleRefresh = async (connectionId: string) => {
    try {
      await refreshConnection(connectionId);
      
      toast.success('Connection refreshed');
      loadConnections();
      
    } catch (error) {
      console.error('Failed to refresh connection:', error);
      toast.error('Failed to refresh connection');
    }
  };

  const destinations: DeliveryDestination[] = ['miro', 'figjam', 'figma'];
  
  const getConnectionForDestination = (destination: DeliveryDestination) => {
    return connections.find(c => c.destination === destination && c.isActive);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto p-6 h-full flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Connection Manager</h1>
              <p className="text-sm text-muted-foreground">
                Manage your integrations and API connections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadConnections}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <Alert className="mb-6">
          <Shield className="w-4 h-4" />
          <AlertDescription>
            <strong>Security:</strong> All OAuth tokens are encrypted and stored securely. 
            We only request the minimum permissions needed for delivery functionality.
          </AlertDescription>
        </Alert>

        {/* Connection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">
          {destinations.map((destination) => (
            <ConnectionCard
              key={destination}
              destination={destination}
              connection={getConnectionForDestination(destination)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onTest={handleTest}
              onRefresh={handleRefresh}
              isConnecting={isConnecting && pendingDestination === destination}
              isTesting={testingDestination === destination}
              testResult={testResults.get(destination)}
            />
          ))}
        </div>

        {/* Connection Statistics */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Connection Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Active Connections:</span>
              <span className="ml-2 font-semibold">
                {connections.filter(c => c.isActive).length}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Expiring Soon:</span>
              <span className="ml-2 font-semibold text-yellow-600">
                {connections.filter(c => {
                  if (!c.expiresAt) return false;
                  return new Date(c.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;
                }).length}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Total Destinations:</span>
              <span className="ml-2 font-semibold">
                {destinations.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}