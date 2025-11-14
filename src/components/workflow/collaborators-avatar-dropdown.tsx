/**
 * Collaborators Avatar Dropdown
 *
 * Figma-style dropdown showing all active collaborators
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { CollaboratorInfo } from '@/hooks/use-yjs-collaboration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users } from 'lucide-react';

interface CollaboratorsAvatarDropdownProps {
  collaborators: CollaboratorInfo[];
  currentUserColor: string;
  isConnected: boolean;
}

export function CollaboratorsAvatarDropdown({
  collaborators,
  currentUserColor,
  isConnected,
}: CollaboratorsAvatarDropdownProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Get current user info
  const currentUserName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  // Calculate total users (you + collaborators)
  const totalUsers = collaborators.length + 1;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 hover:bg-gray-100 rounded-lg p-1 transition-colors">
          {/* Avatar stack (first 3 users) */}
          <div className="flex -space-x-2">
            {/* Current user avatar */}
            <div
              className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10"
              style={{
                backgroundColor: currentUserColor,
              }}
              title="You"
            >
              {currentUserName.charAt(0).toUpperCase()}
            </div>

            {/* Other collaborators (max 2 more) */}
            {collaborators.slice(0, 2).map((collaborator) => (
              <div
                key={collaborator.userId}
                className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 hover:z-10"
                style={{
                  backgroundColor: collaborator.color,
                }}
                title={collaborator.userName}
              >
                {collaborator.userName.charAt(0).toUpperCase()}
              </div>
            ))}

            {/* Show "+X" if more than 3 users */}
            {totalUsers > 3 && (
              <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gray-500 text-white text-xs font-semibold">
                +{totalUsers - 3}
              </div>
            )}
          </div>

          {/* Connection status indicator */}
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Users ({totalUsers})
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Current user */}
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
            style={{
              backgroundColor: currentUserColor,
            }}
          >
            {currentUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{currentUserName}</div>
            <div className="text-xs text-gray-500">{user?.email || 'You'}</div>
          </div>
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            You
          </div>
        </DropdownMenuItem>

        {/* Other collaborators */}
        {collaborators.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {collaborators.map((collaborator) => (
              <DropdownMenuItem
                key={collaborator.userId}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm relative"
                  style={{
                    backgroundColor: collaborator.color,
                  }}
                >
                  {collaborator.userName.charAt(0).toUpperCase()}
                  {/* Active indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{collaborator.userName}</div>
                  <div className="text-xs text-gray-500">{collaborator.userEmail}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* No other users */}
        {collaborators.length === 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              No other users online
              <div className="text-xs mt-1">Share this project to collaborate</div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
