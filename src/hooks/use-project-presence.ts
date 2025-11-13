import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Collaborator {
  user_id: string;
  user_email: string;
  user_name?: string;
  online_at: string;
  is_editing: boolean;
  cursor_position?: { x: number; y: number };
  selected_nodes?: string[];
}

interface UseProjectPresenceReturn {
  collaborators: Collaborator[];
  isConnected: boolean;
  broadcastEditing: (isEditing: boolean) => void;
  broadcastCursor: (x: number, y: number) => void;
  broadcastSelection: (nodeIds: string[]) => void;
}

/**
 * Hook to manage real-time presence for project collaboration
 * Shows who is currently viewing/editing the project
 */
export function useProjectPresence(projectId: string | undefined): UseProjectPresenceReturn {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize presence channel
  useEffect(() => {
    if (!projectId || !user) {
      setCollaborators([]);
      setIsConnected(false);
      return;
    }

    console.log('🔌 Initializing presence channel for project:', projectId);

    // Create a unique channel for this project
    const presenceChannel = supabase.channel(`project:${projectId}:presence`, {
      config: {
        presence: {
          key: user.id, // Use user ID as unique key
        },
      },
    });

    // Listen for presence sync events
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('👥 Presence synced:', state);

        // Convert presence state to collaborators array and deduplicate by user_id
        const collaboratorMap = new Map<string, Collaborator>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            // Don't include current user in collaborators list
            if (presence.user_id !== user.id) {
              // Only keep the latest presence for each user
              collaboratorMap.set(presence.user_id, presence as Collaborator);
            }
          });
        });

        const allCollaborators = Array.from(collaboratorMap.values());
        setCollaborators(allCollaborators);
        console.log('✅ Active collaborators:', allCollaborators.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🚪 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Presence channel status:', status);

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);

          // Track our presence
          const presenceState = {
            user_id: user.id,
            user_email: user.email || 'Unknown',
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
            online_at: new Date().toISOString(),
            is_editing: false,
          };

          console.log('📤 Broadcasting presence:', presenceState);
          await presenceChannel.track(presenceState);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          console.error('❌ Presence channel error:', status);
        }
      });

    setChannel(presenceChannel);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up presence channel');
      presenceChannel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
      setCollaborators([]);
    };
  }, [projectId, user]);

  // Broadcast editing state
  const broadcastEditing = useCallback(
    async (isEditing: boolean) => {
      if (!channel || !isConnected) return;

      try {
        await channel.track({
          user_id: user!.id,
          user_email: user!.email || 'Unknown',
          user_name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'Anonymous',
          online_at: new Date().toISOString(),
          is_editing: isEditing,
        });
      } catch (error) {
        console.error('❌ Error broadcasting editing state:', error);
      }
    },
    [channel, isConnected, user]
  );

  // Broadcast cursor position (for future Phase 4)
  const broadcastCursor = useCallback(
    async (x: number, y: number) => {
      if (!channel || !isConnected) return;

      try {
        await channel.track({
          user_id: user!.id,
          user_email: user!.email || 'Unknown',
          user_name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'Anonymous',
          online_at: new Date().toISOString(),
          is_editing: true,
          cursor_position: { x, y },
        });
      } catch (error) {
        console.error('❌ Error broadcasting cursor:', error);
      }
    },
    [channel, isConnected, user]
  );

  // Broadcast selected nodes (for future Phase 4)
  const broadcastSelection = useCallback(
    async (nodeIds: string[]) => {
      if (!channel || !isConnected) return;

      try {
        await channel.track({
          user_id: user!.id,
          user_email: user!.email || 'Unknown',
          user_name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'Anonymous',
          online_at: new Date().toISOString(),
          is_editing: true,
          selected_nodes: nodeIds,
        });
      } catch (error) {
        console.error('❌ Error broadcasting selection:', error);
      }
    },
    [channel, isConnected, user]
  );

  return {
    collaborators,
    isConnected,
    broadcastEditing,
    broadcastCursor,
    broadcastSelection,
  };
}
