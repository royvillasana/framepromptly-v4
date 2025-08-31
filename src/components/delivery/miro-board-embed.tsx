import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Settings, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiroApiClient, MiroBoard } from '@/lib/miro-api-client';
import { useProjectStore } from '@/stores/project-store';
import { toast } from 'sonner';

interface MiroBoardEmbedProps {
  boardId: string;
  accessToken?: string;
  projectId?: string; // Add project ID to get token from project
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
  autoResize?: boolean;
  showControls?: boolean;
}

interface EmbedState {
  isLoading: boolean;
  isFullscreen: boolean;
  boardInfo?: MiroBoard;
  error?: string;
  embedUrl?: string;
}

export function MiroBoardEmbed({
  boardId,
  accessToken,
  projectId,
  isVisible = true,
  onClose,
  className,
  autoResize = true,
  showControls = true
}: MiroBoardEmbedProps) {
  const { currentProject, getMiroToken, addConnectedBoard } = useProjectStore();
  const [embedState, setEmbedState] = useState<EmbedState>({
    isLoading: true,
    isFullscreen: false
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize board embedding
  useEffect(() => {
    if (boardId && isVisible) {
      initializeBoardEmbed();
    }
  }, [boardId, isVisible]);

  const initializeBoardEmbed = async () => {
    setEmbedState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Get access token from props, project settings, localStorage, or environment
      const activeProjectId = projectId || currentProject?.id;
      const projectToken = activeProjectId ? getMiroToken(activeProjectId) : null;
      
      const token = accessToken || 
                   projectToken ||
                   localStorage.getItem('miro_access_token') || 
                   import.meta.env.VITE_MIRO_ACCESS_TOKEN;
      
      if (!token) {
        throw new Error('No Miro access token available. Please connect your Miro account in the delivery dashboard settings.');
      }

      const miroClient = new MiroApiClient(token);
      
      // Validate board access and get board info
      const validation = await miroClient.validateBoardAccess(boardId);
      
      if (!validation.canRead) {
        throw new Error(validation.errors.join(', '));
      }

      // Get full board information
      const boardInfo = await miroClient.getBoard(boardId);
      
      // Generate embed URL with appropriate permissions
      const embedUrl = miroClient.getBoardEmbedUrl(boardId, {
        embedMode: validation.canWrite ? 'live_embed' : 'view_only',
        autoplay: true
      });

      setEmbedState({
        isLoading: false,
        isFullscreen: false,
        boardInfo,
        embedUrl,
        error: undefined
      });

      toast.success(`Connected to "${boardInfo.name}"`, {
        description: validation.canWrite ? 'Full edit access' : 'View-only access'
      });

      // Save board to project's connected boards list
      if (activeProjectId) {
        try {
          await addConnectedBoard(activeProjectId, boardId, boardInfo.name);
        } catch (error) {
          console.warn('Failed to save connected board to project:', error);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to board';
      
      setEmbedState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast.error('Board connection failed', {
        description: errorMessage
      });
    }
  };

  const toggleFullscreen = () => {
    if (!embedState.isFullscreen && containerRef.current) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setEmbedState(prev => ({ 
      ...prev, 
      isFullscreen: !prev.isFullscreen 
    }));
  };

  const refreshBoard = () => {
    if (iframeRef.current) {
      iframeRef.current.src = embedState.embedUrl || '';
    }
  };

  const openInMiro = () => {
    if (embedState.boardInfo?.viewLink) {
      window.open(embedState.boardInfo.viewLink, '_blank');
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setEmbedState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative bg-background rounded-lg border shadow-lg overflow-hidden",
          embedState.isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full h-full",
          className
        )}
      >
        {/* Header Controls */}
        {showControls && (
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold text-xs">
                M
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-sm truncate max-w-[200px]">
                  {embedState.boardInfo?.name || 'Miro Board'}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={embedState.error ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    {embedState.isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Connecting...
                      </>
                    ) : embedState.error ? (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    )}
                  </Badge>
                  {embedState.boardInfo && (
                    <span className="text-xs text-muted-foreground">
                      ID: {boardId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshBoard}
                disabled={embedState.isLoading || !!embedState.error}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={openInMiro}
                disabled={!embedState.boardInfo?.viewLink}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                disabled={embedState.isLoading || !!embedState.error}
              >
                {embedState.isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Board Content */}
        <div className={cn(
          "relative w-full",
          embedState.isFullscreen ? "h-[calc(100vh-60px)]" : "h-[600px]",
          autoResize && "min-h-[400px]"
        )}>
          {embedState.isLoading ? (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-medium">Connecting to Miro board...</p>
                  <p className="text-sm text-muted-foreground">Validating access and loading content</p>
                </div>
              </div>
            </div>
          ) : embedState.error ? (
            <div className="flex items-center justify-center h-full p-6">
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p><strong>Failed to load Miro board:</strong></p>
                    <p className="text-sm">{embedState.error}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={initializeBoardEmbed} className="flex-1">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        window.open(`https://miro.com/app/board/${boardId}/`, '_blank');
                      }}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in Miro
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          ) : embedState.embedUrl ? (
            <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-[#FFD02F]/10 to-[#FFD02F]/5">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-[#FFD02F] rounded-full flex items-center justify-center text-black font-bold text-2xl mx-auto">
                  M
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Board Ready to View</h3>
                  <p className="text-sm text-muted-foreground">
                    For security reasons, Miro boards must be opened in a new window or tab.
                  </p>
                  {embedState.boardInfo && (
                    <p className="text-xs text-muted-foreground font-medium">
                      "{embedState.boardInfo.name}"
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => window.open(embedState.embedUrl, '_blank')}
                    className="bg-[#FFD02F] hover:bg-[#FFD02F]/90 text-black"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Miro
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={refreshBoard}
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Why can't I see the board here?</p>
                      <p>Miro uses security policies that prevent embedding boards in other websites. This keeps your data safe!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Info */}
        {showControls && embedState.boardInfo && !embedState.isFullscreen && (
          <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Last modified: {new Date(embedState.boardInfo.modifiedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {embedState.boardInfo.type}
                </Badge>
                <button
                  onClick={openInMiro}
                  className="hover:text-primary transition-colors"
                >
                  View in Miro →
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing multiple board embeds
export function useMiroBoardEmbed() {
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isEmbedVisible, setIsEmbedVisible] = useState(false);

  const showBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setIsEmbedVisible(true);
  };

  const hideBoard = () => {
    setIsEmbedVisible(false);
    // Keep boardId for potential re-opening
  };

  const closeBoard = () => {
    setActiveBoardId(null);
    setIsEmbedVisible(false);
  };

  return {
    activeBoardId,
    isEmbedVisible,
    showBoard,
    hideBoard,
    closeBoard
  };
}