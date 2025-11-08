import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Node, Edge } from '@xyflow/react';

interface CanvasData {
  nodes: Node[];
  edges: Edge[];
  toolToPromptIdMapping?: Record<string, string>;
}

interface CanvasSyncOptions {
  projectId: string | undefined;
  onRemoteUpdate: (data: CanvasData) => void;
  enabled?: boolean;
}

export function useCanvasSync({
  projectId,
  onRemoteUpdate,
  enabled = true,
}: CanvasSyncOptions) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateRef = useRef<string | null>(null);
  const isLocalUpdateRef = useRef(false);

  // Mark that the next update is from a local save (to prevent sync loops)
  const markLocalUpdate = useCallback((signature: string) => {
    isLocalUpdateRef.current = true;
    lastUpdateRef.current = signature;

    // Reset after a short delay to allow the update to propagate
    setTimeout(() => {
      isLocalUpdateRef.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    if (!projectId || !user || !enabled) {
      return;
    }

    console.log('🔄 Setting up canvas sync for project:', projectId);

    // Subscribe to database changes for this project
    const channel = supabase
      .channel(`canvas-sync:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log('📥 Received canvas update:', payload);

          // Skip if this is our own update
          if (isLocalUpdateRef.current) {
            console.log('⏭️  Skipping own update');
            return;
          }

          // Extract canvas data from the payload
          const newRecord = payload.new as any;
          const canvasData = newRecord.canvas_data;

          if (!canvasData) {
            console.log('⚠️  No canvas data in update');
            return;
          }

          // Check if this update is different from what we last saw
          const signature = JSON.stringify({
            nodes: canvasData.nodes,
            edges: canvasData.edges,
          });

          if (signature === lastUpdateRef.current) {
            console.log('⏭️  Skipping duplicate update');
            return;
          }

          lastUpdateRef.current = signature;

          // Get the user who made the change
          const modifiedBy = newRecord.last_modified_by;
          const modifiedByMe = modifiedBy === user.id;

          if (modifiedByMe) {
            console.log('⏭️  Skipping update made by current user');
            return;
          }

          console.log('✅ Applying remote canvas update from user:', modifiedBy);

          // Apply the remote update
          onRemoteUpdate({
            nodes: canvasData.nodes || [],
            edges: canvasData.edges || [],
            toolToPromptIdMapping: canvasData.toolToPromptIdMapping || {},
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Canvas sync channel status:', status);
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting canvas sync');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [projectId, user, enabled, onRemoteUpdate]);

  return {
    markLocalUpdate,
  };
}
