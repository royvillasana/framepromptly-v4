import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Home, 
  Settings,
  Maximize,
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  Truck
} from 'lucide-react';
import { MiroBoardEmbed } from '@/components/delivery/miro-board-embed';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function Board() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [boardId, setBoardId] = useState(searchParams.get('id') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Auto-connect if board ID is in URL
  useEffect(() => {
    const urlBoardId = searchParams.get('id');
    if (urlBoardId && !isConnected) {
      setBoardId(urlBoardId);
      handleConnect(urlBoardId);
    }
  }, [searchParams]);

  const handleConnect = async (targetBoardId?: string) => {
    const id = targetBoardId || boardId;
    
    if (!id.trim()) {
      toast.error('Please enter a Miro board ID');
      return;
    }

    setIsLoading(true);
    
    try {
      // Update URL with board ID
      setSearchParams({ id: id.trim() });
      
      // Set connected state (the MiroBoardEmbed component will handle validation)
      setIsConnected(true);
      setBoardId(id.trim());
      
      toast.success('Connecting to Miro board...', {
        description: 'Board will appear below once validated'
      });

    } catch (error) {
      console.error('Board connection error:', error);
      toast.error('Failed to connect to board');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setBoardId('');
    setSearchParams({});
    toast.success('Disconnected from Miro board');
  };

  const goToWorkflow = () => {
    navigate('/');
  };

  const goToDeliveryDashboard = () => {
    navigate('/', { state: { openDeliveryDashboard: true } });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToWorkflow}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workflow
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFD02F] rounded-lg flex items-center justify-center text-black font-bold text-sm">
                  M
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Miro Board Workspace</h1>
                  <p className="text-sm text-muted-foreground">
                    {isConnected && boardId ? `Board: ${boardId}` : 'Connect to a Miro board'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToDeliveryDashboard}
                className="flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Delivery Dashboard
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        {!isConnected ? (
          /* Connection Setup */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold">
                    M
                  </div>
                  Connect to Miro Board
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter your Miro board ID to embed and interact with your board directly in FramePromptly
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="board-id">Miro Board ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="board-id"
                      placeholder="Enter board ID (e.g., uXjVKMeWJv4=)"
                      value={boardId}
                      onChange={(e) => setBoardId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          handleConnect();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleConnect()}
                      disabled={isLoading || !boardId.trim()}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Find the board ID in your Miro board URL:</p>
                    <p className="font-mono bg-muted px-3 py-2 rounded border">
                      miro.com/app/board/<span className="text-primary font-bold">uXjVKMeWJv4=</span>/
                    </p>
                    <p>
                      <strong>Note:</strong> You need edit permissions on the board to deliver content. 
                      View-only access will allow board previewing but not content delivery.
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>First time connecting?</strong> Make sure you've connected your Miro account 
                    in the Delivery Dashboard connection settings.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={goToDeliveryDashboard}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Settings className="w-4 h-4" />
                    Connection Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToWorkflow}
                    className="flex items-center gap-2 flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Connected Board Display */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Board Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Board Workspace</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Connected to:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                    {boardId}
                  </code>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(`https://miro.com/app/board/${boardId}/`, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Miro
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Embedded Board */}
            <div className="rounded-lg border-2 border-primary/10 overflow-hidden">
              <MiroBoardEmbed
                boardId={boardId}
                projectId={user?.id} // Use user ID as fallback since Board.tsx doesn't have project context
                isVisible={true}
                showControls={true}
                autoResize={false}
                className="min-h-[80vh]"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}