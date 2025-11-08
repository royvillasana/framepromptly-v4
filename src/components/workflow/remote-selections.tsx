import { motion, AnimatePresence } from 'framer-motion';
import type { CollaboratorPresence } from '@/hooks/use-canvas-presence';
import type { Node } from '@xyflow/react';

interface RemoteSelectionsProps {
  collaborators: CollaboratorPresence[];
  nodes: Node[];
}

export function RemoteSelections({ collaborators, nodes }: RemoteSelectionsProps) {
  return (
    <>
      <AnimatePresence>
        {collaborators.map((collaborator) => {
          if (!collaborator.selectedNodeIds || collaborator.selectedNodeIds.length === 0) {
            return null;
          }

          return collaborator.selectedNodeIds.map((nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
            if (!node) return null;

            // Get node dimensions and position
            const width = node.width || 200;
            const height = node.height || 100;
            const x = node.position.x;
            const y = node.position.y;

            return (
              <motion.div
                key={`${collaborator.userId}-${nodeId}`}
                className="absolute pointer-events-none"
                style={{
                  left: x,
                  top: y,
                  width,
                  height,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Selection border */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    border: `2px solid ${collaborator.color}`,
                    boxShadow: `0 0 0 4px ${collaborator.color}33`,
                  }}
                />

                {/* User badge */}
                <div
                  className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.displayName || 'User'} is editing
                </div>
              </motion.div>
            );
          });
        })}
      </AnimatePresence>
    </>
  );
}
