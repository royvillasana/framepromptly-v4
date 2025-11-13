import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface RemoteCanvasUpdate {
  canvasData: any;
  modifiedBy: string;
  modifiedAt: string;
  projectId: string;
}

interface UseCanvasUpdatesReturn {
  hasRemoteChanges: boolean;
  remoteUpdate: RemoteCanvasUpdate | null;
  applyRemoteChanges: () => void;
  dismissRemoteChanges: () => void;
  isSubscribed: boolean;
}

/**
 * Hook to detect remote canvas updates via Supabase Realtime
 * Shows notifications when other users save changes
 * Allows manual refresh to pull changes
 */
export function useCanvasUpdates(
  projectId: string | undefined,
  onRemoteUpdate?: (update: RemoteCanvasUpdate) => void,
  hasLocalChanges: boolean = false
): UseCanvasUpdatesReturn {
  const { user } = useAuth();
  const [hasRemoteChanges, setHasRemoteChanges] = useState(false);
  const [remoteUpdate, setRemoteUpdate] = useState<RemoteCanvasUpdate | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const lastModifiedAtRef = useRef<string | null>(null);
  const hasLocalChangesRef = useRef<boolean>(hasLocalChanges);

  // Update ref when hasLocalChanges changes (without triggering re-subscription)
  useEffect(() => {
    hasLocalChangesRef.current = hasLocalChanges;
  }, [hasLocalChanges]);

  // Subscribe to database changes for this project
  useEffect(() => {
    if (!projectId || !user) {
      setHasRemoteChanges(false);
      setRemoteUpdate(null);
      setIsSubscribed(false);
      return;
    }

    console.log('🔌 Subscribing to canvas updates for project:', projectId);

    // Create channel for database changes
    const dbChannel = supabase
      .channel(`db-changes:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log('📡 Received database change:', payload);

          // Ignore if this is our own update
          if (payload.new.last_modified_by === user.id) {
            console.log('⏭️ Ignoring own update');
            return;
          }

          // Check if canvas_data actually changed
          if (
            payload.old?.canvas_data &&
            payload.new?.canvas_data &&
            JSON.stringify(payload.old.canvas_data) === JSON.stringify(payload.new.canvas_data)
          ) {
            console.log('⏭️ Canvas data unchanged, ignoring');
            return;
          }

          const newUpdate: RemoteCanvasUpdate = {
            canvasData: payload.new.canvas_data,
            modifiedBy: payload.new.last_modified_by,
            modifiedAt: payload.new.last_modified_at,
            projectId: payload.new.id,
          };

          console.log('🔔 Remote canvas update detected:', {
            modifiedBy: newUpdate.modifiedBy,
            modifiedAt: newUpdate.modifiedAt,
            hasLocalChanges: hasLocalChangesRef.current,
          });

          // Store the update
          setRemoteUpdate(newUpdate);
          lastModifiedAtRef.current = newUpdate.modifiedAt;

          // Auto-apply changes if no local edits (Phase 3 - Automatic Synchronization)
          if (!hasLocalChangesRef.current && onRemoteUpdate) {
            console.log('✅ Auto-applying remote changes (no local changes detected)');
            onRemoteUpdate(newUpdate);
            // Don't show banner for auto-applied changes
            setHasRemoteChanges(false);
          } else if (hasLocalChangesRef.current) {
            // Show banner with warning if user has local changes
            console.log('⚠️ Local changes detected, showing manual refresh option with warning');
            setHasRemoteChanges(true);
          } else {
            // No callback provided, just show banner
            console.log('📢 Remote changes detected, showing manual refresh option');
            setHasRemoteChanges(true);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Database channel status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    setChannel(dbChannel);

    // Cleanup
    return () => {
      console.log('🔌 Unsubscribing from canvas updates');
      dbChannel.unsubscribe();
      setChannel(null);
      setIsSubscribed(false);
    };
  }, [projectId, user]);

  // Apply remote changes
  const applyRemoteChanges = useCallback(() => {
    if (remoteUpdate && onRemoteUpdate) {
      console.log('✅ Applying remote changes manually');
      onRemoteUpdate(remoteUpdate);
      setHasRemoteChanges(false);
      setRemoteUpdate(null);
    }
  }, [remoteUpdate, onRemoteUpdate]);

  // Dismiss notification without applying changes
  const dismissRemoteChanges = useCallback(() => {
    console.log('❌ Dismissing remote changes notification');
    setHasRemoteChanges(false);
    // Keep remoteUpdate in case user changes mind
  }, []);

  return {
    hasRemoteChanges,
    remoteUpdate,
    applyRemoteChanges,
    dismissRemoteChanges,
    isSubscribed,
  };
}
