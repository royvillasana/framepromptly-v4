import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { CollaboratorPresence } from '@/hooks/use-canvas-presence';

interface CollaboratorsPanelProps {
  collaborators: CollaboratorPresence[];
  isConnected: boolean;
  myColor: string;
  currentUserName?: string;
}

const Avatar = ({ user, size = 'sm' }: { user: Partial<CollaboratorPresence>; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName || 'User'}
        className={`${sizeClass} rounded-full ring-2`}
        style={{ ringColor: user.color }}
      />
    );
  }

  // Fallback to initials
  const initials = (user.displayName || user.email || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white ring-2`}
      style={{ backgroundColor: user.color, ringColor: user.color }}
    >
      {initials}
    </div>
  );
};

export function CollaboratorsPanel({
  collaborators,
  isConnected,
  myColor,
  currentUserName = 'You',
}: CollaboratorsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCollaborators = collaborators.length + 1; // +1 for current user

  return (
    <div className="absolute top-4 right-4 z-10">
      <Popover open={isExpanded} onOpenChange={setIsExpanded}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Connection indicator */}
            <div className="flex items-center gap-2">
              <Circle
                className={`w-2 h-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
              />
              <Users className="w-4 h-4" />
            </div>

            {/* Collaborator avatars */}
            <div className="flex -space-x-2">
              {/* Current user */}
              <Avatar
                user={{
                  displayName: currentUserName,
                  color: myColor,
                }}
                size="sm"
              />

              {/* Other collaborators (show max 3) */}
              {collaborators.slice(0, 3).map((collaborator) => (
                <Avatar
                  key={collaborator.userId}
                  user={collaborator}
                  size="sm"
                />
              ))}
            </div>

            {/* Count badge */}
            {totalCollaborators > 1 && (
              <Badge variant="secondary" className="ml-1">
                {totalCollaborators}
              </Badge>
            )}

            {/* Expand icon */}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Active Collaborators</h3>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {/* Collaborator list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Current user */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
              >
                <Avatar
                  user={{
                    displayName: currentUserName,
                    color: myColor,
                  }}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {currentUserName} (You)
                  </p>
                  <p className="text-xs text-muted-foreground">Editing</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: myColor }}
                />
              </motion.div>

              {/* Other collaborators */}
              <AnimatePresence>
                {collaborators.map((collaborator, index) => {
                  const isActive = Date.now() - collaborator.lastActive < 5000; // Active in last 5 seconds

                  return (
                    <motion.div
                      key={collaborator.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-2 rounded-lg ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
                    >
                      <Avatar user={collaborator} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {collaborator.displayName || collaborator.email || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isActive ? 'Editing' : 'Viewing'}
                        </p>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: collaborator.color }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* No other collaborators */}
              {collaborators.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>You're the only one here</p>
                  <p className="text-xs mt-1">
                    Share this project to collaborate
                  </p>
                </div>
              )}
            </div>

            {/* Info footer */}
            {isConnected && collaborators.length > 0 && (
              <div className="pt-3 border-t text-xs text-muted-foreground">
                <p>
                  Collaborators can see your cursor and selections in real-time
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
