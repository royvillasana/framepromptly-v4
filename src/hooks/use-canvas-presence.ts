import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaboratorPresence {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  color: string;
  cursorX?: number;
  cursorY?: number;
  selectedNodeIds?: string[];
  lastActive: number;
}

interface PresenceState {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  color: string;
  cursorX?: number;
  cursorY?: number;
  selectedNodeIds?: string[];
  lastActive: number;
}

// Generate a consistent color for a user based on their ID
const getUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
    '#ABEBC6', // Light Green
  ];

  // Use userId to deterministically pick a color
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export function useCanvasPresence(projectId: string | undefined) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [myPresence, setMyPresence] = useState<Partial<PresenceState>>({});

  useEffect(() => {
    if (!projectId || !user) {
      setCollaborators([]);
      setIsConnected(false);
      return;
    }

    console.log('🔗 Connecting to presence channel for project:', projectId);

    // Create a unique channel for this project
    const channel = supabase.channel(`project:${projectId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence state
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        console.log('👥 Presence synced:', Object.keys(state).length, 'collaborators');

        // Convert presence state to collaborator list
        const collaboratorsList: CollaboratorPresence[] = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            const presence = presences[0];

            // Don't include current user in collaborators list
            if (presence.userId !== user.id) {
              collaboratorsList.push({
                userId: presence.userId,
                email: presence.email,
                displayName: presence.displayName,
                avatarUrl: presence.avatarUrl,
                color: presence.color || getUserColor(presence.userId),
                cursorX: presence.cursorX,
                cursorY: presence.cursorY,
                selectedNodeIds: presence.selectedNodeIds,
                lastActive: presence.lastActive,
              });
            }
          }
        });

        setCollaborators(collaboratorsList);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('✅ User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Channel status:', status);

        if (status === 'SUBSCRIBED') {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, email')
            .eq('user_id', user.id)
            .single();

          // Send initial presence
          const initialPresence: PresenceState = {
            userId: user.id,
            email: profile?.email || user.email || '',
            displayName: profile?.display_name || user.email?.split('@')[0] || 'Anonymous',
            avatarUrl: profile?.avatar_url || undefined,
            color: getUserColor(user.id),
            lastActive: Date.now(),
          };

          await channel.track(initialPresence);
          console.log('📍 Initial presence sent:', initialPresence);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting from presence channel');
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
      setCollaborators([]);
    };
  }, [projectId, user]);

  // Function to update cursor position
  const updateCursor = async (x: number | undefined, y: number | undefined) => {
    if (!channelRef.current || !isConnected) return;

    const updates = {
      cursorX: x,
      cursorY: y,
      lastActive: Date.now(),
    };

    setMyPresence(prev => ({ ...prev, ...updates }));
    await channelRef.current.track(updates);
  };

  // Function to update selected nodes
  const updateSelection = async (nodeIds: string[]) => {
    if (!channelRef.current || !isConnected) return;

    const updates = {
      selectedNodeIds: nodeIds,
      lastActive: Date.now(),
    };

    setMyPresence(prev => ({ ...prev, ...updates }));
    await channelRef.current.track(updates);
  };

  return {
    collaborators,
    isConnected,
    updateCursor,
    updateSelection,
    myColor: user ? getUserColor(user.id) : '#666666',
  };
}
