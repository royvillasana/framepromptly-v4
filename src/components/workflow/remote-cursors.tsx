import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import type { CollaboratorPresence } from '@/hooks/use-canvas-presence';

interface RemoteCursorsProps {
  collaborators: CollaboratorPresence[];
  viewport: { x: number; y: number; zoom: number };
}

export function RemoteCursors({ collaborators, viewport }: RemoteCursorsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <AnimatePresence>
        {collaborators.map((collaborator) => {
          // Don't render cursor if we don't have position data
          if (
            collaborator.cursorX === undefined ||
            collaborator.cursorY === undefined
          ) {
            return null;
          }

          // Check if cursor is active (moved in last 5 seconds)
          const isActive = Date.now() - collaborator.lastActive < 5000;
          if (!isActive) return null;

          // Convert canvas coordinates to screen coordinates
          const screenX = collaborator.cursorX * viewport.zoom + viewport.x;
          const screenY = collaborator.cursorY * viewport.zoom + viewport.y;

          return (
            <motion.div
              key={collaborator.userId}
              className="absolute"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: screenX,
                y: screenY,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              style={{
                left: 0,
                top: 0,
              }}
            >
              {/* Cursor icon */}
              <MousePointer2
                className="w-5 h-5"
                style={{ color: collaborator.color }}
                fill={collaborator.color}
              />

              {/* User label */}
              <motion.div
                className="absolute top-6 left-2 whitespace-nowrap px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
                style={{ backgroundColor: collaborator.color }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {collaborator.displayName || collaborator.email || 'Anonymous'}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
