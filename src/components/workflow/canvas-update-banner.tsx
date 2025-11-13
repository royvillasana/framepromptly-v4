import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, AlertCircle, Users } from 'lucide-react';
import { RemoteCanvasUpdate } from '@/hooks/use-canvas-updates';
import { formatDistanceToNow } from 'date-fns';

interface CanvasUpdateBannerProps {
  show: boolean;
  remoteUpdate: RemoteCanvasUpdate | null;
  onRefresh: () => void;
  onDismiss: () => void;
  hasLocalChanges?: boolean;
}

/**
 * Banner to notify users of remote canvas updates
 * Shows who made changes and when
 * Provides options to refresh or dismiss
 */
export function CanvasUpdateBanner({
  show,
  remoteUpdate,
  onRefresh,
  onDismiss,
  hasLocalChanges = false,
}: CanvasUpdateBannerProps) {
  if (!show || !remoteUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <Alert className="border-blue-200 bg-blue-50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 flex-shrink-0">
              {hasLocalChanges ? (
                <AlertCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <Users className="w-5 h-5 text-blue-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <AlertDescription className="text-sm">
                <div className="font-semibold text-blue-900 mb-1">
                  {hasLocalChanges ? 'Remote changes available' : 'Canvas updated remotely'}
                </div>
                <div className="text-blue-700">
                  Someone made changes to this canvas{' '}
                  {formatDistanceToNow(new Date(remoteUpdate.modifiedAt), { addSuffix: true })}
                  {hasLocalChanges && (
                    <span className="block mt-1 text-xs">
                      You have unsaved local changes. Refreshing will overwrite them.
                    </span>
                  )}
                </div>
              </AlertDescription>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={onRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refresh Canvas
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
