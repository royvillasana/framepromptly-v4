import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle, AlertCircle, ExternalLink, Loader2, Eye, EyeOff,
  Info, Key, Copy, RefreshCw, Save
} from 'lucide-react';
import { MiroApiClient } from '@/lib/miro-api-client';
import { useProjectStore } from '@/stores/project-store';
import { toast } from 'sonner';

interface MiroConnectionSimpleProps {
  projectId?: string; // Add project ID to save token to project
  onConnectionSuccess: (accessToken: string) => void;
  onConnectionFailed: (error: string) => void;
}

interface ConnectionTest {
  isValid: boolean;
  userInfo?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export function MiroConnectionSimple({ projectId, onConnectionSuccess, onConnectionFailed }: MiroConnectionSimpleProps) {
  const { currentProject, saveMiroToken, getMiroToken } = useProjectStore();
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Load existing token from project on mount
  useEffect(() => {
    const activeProjectId = projectId || currentProject?.id;
    if (activeProjectId) {
      const savedToken = getMiroToken(activeProjectId);
      if (savedToken) {
        setAccessToken(savedToken);
        setIsConnected(true);
      }
    }
  }, [projectId, currentProject, getMiroToken]);

  const testConnection = async (token: string) => {
    if (!token.trim()) {
      toast.error('Please enter an access token');
      return;
    }

    setIsTesting(true);
    try {
      const client = new MiroApiClient(token);
      const result = await client.testConnection();
      
      setConnectionTest(result);
      
      if (result.isValid) {
        toast.success('Miro connection successful!');
        setIsConnected(true);
        
        // Save token to project if project ID is available
        const activeProjectId = projectId || currentProject?.id;
        if (activeProjectId) {
          try {
            await saveMiroToken(activeProjectId, token);
            toast.success('Access token saved to project', {
              description: 'Token will be reused for future connections in this project'
            });
          } catch (error) {
            console.warn('Failed to save token to project:', error);
            // Still continue with connection success even if saving fails
          }
        }
        
        onConnectionSuccess(token);
      } else {
        toast.error('Connection failed: ' + result.error);
        onConnectionFailed(result.error || 'Unknown error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionTest({ isValid: false, error: errorMessage });
      toast.error('Connection failed: ' + errorMessage);
      onConnectionFailed(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await testConnection(accessToken);
    setIsConnecting(false);
  };

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(accessToken);
    toast.success('Access token copied to clipboard');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold">
            M
          </div>
          <div>
            <CardTitle className="text-lg">Connect to Miro</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your Miro API access token
            </p>
          </div>
          {isConnected && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">How to get your Miro access token:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                <li>Go to <a href="https://miro.com/app/settings/user-profile" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Miro Settings</a></li>
                <li>Navigate to "Your apps" section</li>
                <li>Click "Create new app"</li>
                <li>Fill in app details and create</li>
                <li>Copy the access token from your app settings</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Token Input */}
        <div className="space-y-2">
          <Label htmlFor="access-token">Miro Access Token</Label>
          <div className="relative">
            <Input
              id="access-token"
              type={showToken ? "text" : "password"}
              placeholder="Enter your Miro access token..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="pr-20"
              disabled={isConnecting || isTesting}
            />
            <div className="absolute right-1 top-1 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowToken(!showToken)}
                      className="h-6 w-6 p-0"
                    >
                      {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showToken ? 'Hide' : 'Show'} token</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {accessToken && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyTokenToClipboard}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy token</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Connection Results */}
        {connectionTest && (
          <Alert variant={connectionTest.isValid ? "default" : "destructive"}>
            {connectionTest.isValid ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertDescription>
              {connectionTest.isValid ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-700">Connection successful!</p>
                  {connectionTest.userInfo && (
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {connectionTest.userInfo.name}</p>
                      <p><strong>Email:</strong> {connectionTest.userInfo.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">Connection failed</p>
                  <p className="text-sm mt-1">{connectionTest.error}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={!accessToken.trim() || isConnecting || isTesting}
            className="flex-1"
          >
            {isConnecting || isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isConnecting ? 'Connecting...' : 'Testing...'}
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </Button>

          {isConnected && (
            <Button
              variant="outline"
              onClick={() => testConnection(accessToken)}
              disabled={isTesting || isConnecting}
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Help Links */}
        <div className="flex items-center justify-between pt-2 border-t">
          <a
            href="https://developers.miro.com/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Miro API Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://miro.com/app/settings/user-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Get Access Token
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}