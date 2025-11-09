import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Circle, Edit3, Eye, Wifi, WifiOff } from 'lucide-react';
import { Collaborator } from '@/hooks/use-project-presence';
import { formatDistanceToNow } from 'date-fns';

interface CollaboratorsPanelProps {
  collaborators: Collaborator[];
  isConnected: boolean;
  compact?: boolean;
}

/**
 * Panel to display active collaborators in the project
 * Shows avatars, online status, and editing indicators
 */
export function CollaboratorsPanel({ collaborators, isConnected, compact = false }: CollaboratorsPanelProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (userId: string) => {
    // Generate consistent color based on user ID
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (compact) {
    // Compact view: Just show avatars in a row
    return (
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-3 h-3 text-green-600" />
          ) : (
            <WifiOff className="w-3 h-3 text-gray-400" />
          )}
        </div>

        {/* Collaborators */}
        {collaborators.length > 0 ? (
          <TooltipProvider>
            <div className="flex -space-x-2">
              {collaborators.slice(0, 5).map((collaborator) => (
                <Tooltip key={collaborator.user_id}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className={`w-8 h-8 border-2 border-white ${getAvatarColor(collaborator.user_id)}`}>
                        <AvatarFallback className="text-white text-xs font-semibold">
                          {getInitials(collaborator.user_name || collaborator.user_email)}
                        </AvatarFallback>
                      </Avatar>
                      {collaborator.is_editing && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">{collaborator.user_name || collaborator.user_email}</div>
                      <div className="text-xs text-muted-foreground">
                        {collaborator.is_editing ? 'Editing' : 'Viewing'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active {formatDistanceToNow(new Date(collaborator.online_at), { addSuffix: true })}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {collaborators.length > 5 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="w-8 h-8 border-2 border-white bg-gray-200">
                      <AvatarFallback className="text-gray-600 text-xs font-semibold">
                        +{collaborators.length - 5}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">{collaborators.length - 5} more collaborators</div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        ) : (
          <div className="text-xs text-muted-foreground">No active collaborators</div>
        )}
      </div>
    );
  }

  // Full panel view
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Active Collaborators</h3>
            <Badge variant="secondary">{collaborators.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span className="text-xs text-green-600">Connected</span>
              </>
            ) : (
              <>
                <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                <span className="text-xs text-gray-500">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Collaborators list */}
        {collaborators.length > 0 ? (
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.user_id} className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className={`w-10 h-10 ${getAvatarColor(collaborator.user_id)}`}>
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(collaborator.user_name || collaborator.user_email)}
                    </AvatarFallback>
                  </Avatar>
                  {collaborator.is_editing && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500" />
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {collaborator.user_name || collaborator.user_email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {collaborator.is_editing ? (
                      <>
                        <Edit3 className="w-3 h-3" />
                        <span>Editing</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Viewing</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(collaborator.online_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No other collaborators online</p>
            <p className="text-xs mt-1">Invite teammates to collaborate in real-time</p>
          </div>
        )}
      </div>
    </Card>
  );
}
