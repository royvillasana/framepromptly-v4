/**
 * Yjs Collaboration Hook
 *
 * Provides real-time collaboration using Yjs + Hocuspocus with:
 * - Conflict-free concurrent editing (CRDT)
 * - User presence tracking (Awareness)
 * - Automatic synchronization with React Flow
 * - Supabase authentication integration
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useAuth } from '@/hooks/use-auth';
import type { Node, Edge } from '@xyflow/react';

const HOCUSPOCUS_URL = import.meta.env.VITE_HOCUSPOCUS_URL || 'ws://localhost:1234';

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  userEmail: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: string[]; // Array of selected node IDs
}

interface UseYjsCollaborationProps {
  projectId: string | undefined;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

interface UseYjsCollaborationReturn {
  yDoc: Y.Doc | null;
  provider: HocuspocusProvider | null;
  isConnected: boolean;
  isSynced: boolean;
  collaborators: CollaboratorInfo[];
  currentUserColor: string;
  updateCursor: (x: number, y: number) => void;
  updateSelection: (nodeIds: string[]) => void;
  // Methods to update Yjs document
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  getNodes: () => Node[];
  getEdges: () => Edge[];
}

// Generate a random color for each user
const generateUserColor = (userId: string): string => {
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

  // Use user ID to consistently assign color
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export function useYjsCollaboration({
  projectId,
  onNodesChange,
  onEdgesChange,
  initialNodes = [],
  initialEdges = [],
}: UseYjsCollaborationProps): UseYjsCollaborationReturn {
  const { user, session } = useAuth();

  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [currentUserColor, setCurrentUserColor] = useState<string>('#4ECDC4');

  // Use refs to avoid stale closures in callbacks
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  const initialNodesRef = useRef(initialNodes);
  const initialEdgesRef = useRef(initialEdges);

  useEffect(() => {
    onNodesChangeRef.current = onNodesChange;
    onEdgesChangeRef.current = onEdgesChange;
    initialNodesRef.current = initialNodes;
    initialEdgesRef.current = initialEdges;
  }, [onNodesChange, onEdgesChange, initialNodes, initialEdges]);

  // Initialize Yjs document and provider
  useEffect(() => {
    if (!projectId || !user || !session?.access_token) {
      console.log('⏭️ [Yjs] Skipping initialization - missing project, user, or token');
      return;
    }

    console.log('🚀 [Yjs] Initializing collaboration for project:', projectId);

    // Create Yjs document
    const doc = new Y.Doc();
    setYDoc(doc);

    // Create Hocuspocus provider
    const hocuspocusProvider = new HocuspocusProvider({
      url: HOCUSPOCUS_URL,
      name: projectId, // Document name = project ID
      document: doc,
      token: session.access_token, // Supabase JWT for authentication

      // Reconnection settings
      connect: true,
      preserveConnection: true,
      maxReconnectTimeout: 10000,

      // Callbacks
      onConnect: () => {
        console.log('✅ [Yjs] Connected to Hocuspocus');
        setIsConnected(true);
      },

      onDisconnect: ({ event }) => {
        console.log('🚪 [Yjs] Disconnected from Hocuspocus', event);
        setIsConnected(false);
        setIsSynced(false);
      },

      onSynced: () => {
        console.log('🔄 [Yjs] Document synced');
        setIsSynced(true);

        const nodesMap = doc.getMap('nodes');
        const edgesMap = doc.getMap('edges');

        // Check if Yjs document is empty and we have initial data
        // This prevents data loss when connecting to a new document
        const isYjsEmpty = nodesMap.size === 0 && edgesMap.size === 0;
        const hasInitialData =
          initialNodesRef.current.length > 0 ||
          initialEdgesRef.current.length > 0;

        if (isYjsEmpty && hasInitialData) {
          console.log('🔧 [Yjs] Empty document detected - initializing with existing data');
          console.log('  Initial nodes:', initialNodesRef.current.length);
          console.log('  Initial edges:', initialEdgesRef.current.length);

          // Populate Yjs document with initial data in a single transaction
          doc.transact(() => {
            initialNodesRef.current.forEach(node => {
              nodesMap.set(node.id, node);
            });

            initialEdgesRef.current.forEach(edge => {
              edgesMap.set(edge.id, edge);
            });
          });

          console.log('✅ [Yjs] Document initialized with existing data');
        }

        // Notify React Flow of current state
        if (onNodesChangeRef.current) {
          const nodes = Array.from(nodesMap.values()) as Node[];
          console.log('📥 [Yjs] Synced nodes:', nodes.length);
          onNodesChangeRef.current(nodes);
        }

        if (onEdgesChangeRef.current) {
          const edges = Array.from(edgesMap.values()) as Edge[];
          console.log('📥 [Yjs] Synced edges:', edges.length);
          onEdgesChangeRef.current(edges);
        }
      },

      onAuthenticationFailed: ({ reason }) => {
        console.error('❌ [Yjs] Authentication failed:', reason);
      },

      onStatus: ({ status }) => {
        console.log('📡 [Yjs] Status:', status);
      },
    });

    setProvider(hocuspocusProvider);

    // Set up awareness for presence
    const awareness = hocuspocusProvider.awareness;

    if (user) {
      // Generate and store current user color
      const userColor = generateUserColor(user.id);
      setCurrentUserColor(userColor);

      // Set local user info
      awareness.setLocalState({
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email || '',
        color: userColor,
        cursor: null,
        selection: [],
      });
    }

    // Listen to awareness changes (other users)
    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const others: CollaboratorInfo[] = [];

      states.forEach((state, clientId) => {
        // Don't include self
        if (clientId !== awareness.clientID && state.userId) {
          others.push(state as CollaboratorInfo);
        }
      });

      console.log('👥 [Yjs] Collaborators updated:', others.length);
      setCollaborators(others);
    };

    awareness.on('change', handleAwarenessChange);

    // Listen to document changes (nodes and edges)
    const nodesMap = doc.getMap('nodes');
    const edgesMap = doc.getMap('edges');

    const handleNodesObserve = () => {
      if (onNodesChangeRef.current) {
        const nodes = Array.from(nodesMap.values()) as Node[];
        console.log('🔄 [Yjs] Nodes changed:', nodes.length);
        onNodesChangeRef.current(nodes);
      }
    };

    const handleEdgesObserve = () => {
      if (onEdgesChangeRef.current) {
        const edges = Array.from(edgesMap.values()) as Edge[];
        console.log('🔄 [Yjs] Edges changed:', edges.length);
        onEdgesChangeRef.current(edges);
      }
    };

    nodesMap.observe(handleNodesObserve);
    edgesMap.observe(handleEdgesObserve);

    // Cleanup
    return () => {
      console.log('🧹 [Yjs] Cleaning up collaboration');
      awareness.off('change', handleAwarenessChange);
      nodesMap.unobserve(handleNodesObserve);
      edgesMap.unobserve(handleEdgesObserve);
      hocuspocusProvider.destroy();
      doc.destroy();
      setProvider(null);
      setYDoc(null);
      setIsConnected(false);
      setIsSynced(false);
      setCollaborators([]);
    };
  }, [projectId, user, session?.access_token]);

  // Update cursor position in awareness
  const updateCursor = useCallback((x: number, y: number) => {
    if (!provider) return;

    const awareness = provider.awareness;
    const currentState = awareness.getLocalState();

    awareness.setLocalState({
      ...currentState,
      cursor: { x, y },
    });
  }, [provider]);

  // Update selected nodes in awareness
  const updateSelection = useCallback((nodeIds: string[]) => {
    if (!provider) return;

    const awareness = provider.awareness;
    const currentState = awareness.getLocalState();

    awareness.setLocalState({
      ...currentState,
      selection: nodeIds,
    });
  }, [provider]);

  // Set nodes in Yjs document
  const setNodes = useCallback((nodes: Node[]) => {
    if (!yDoc) return;

    const nodesMap = yDoc.getMap('nodes');

    // Clear existing nodes
    yDoc.transact(() => {
      nodesMap.clear();

      // Add new nodes
      nodes.forEach(node => {
        nodesMap.set(node.id, node);
      });
    });

    console.log('💾 [Yjs] Nodes updated:', nodes.length);
  }, [yDoc]);

  // Set edges in Yjs document
  const setEdges = useCallback((edges: Edge[]) => {
    if (!yDoc) return;

    const edgesMap = yDoc.getMap('edges');

    // Clear existing edges
    yDoc.transact(() => {
      edgesMap.clear();

      // Add new edges
      edges.forEach(edge => {
        edgesMap.set(edge.id, edge);
      });
    });

    console.log('💾 [Yjs] Edges updated:', edges.length);
  }, [yDoc]);

  // Get current nodes from Yjs document
  const getNodes = useCallback((): Node[] => {
    if (!yDoc) return [];

    const nodesMap = yDoc.getMap('nodes');
    return Array.from(nodesMap.values()) as Node[];
  }, [yDoc]);

  // Get current edges from Yjs document
  const getEdges = useCallback((): Edge[] => {
    if (!yDoc) return [];

    const edgesMap = yDoc.getMap('edges');
    return Array.from(edgesMap.values()) as Edge[];
  }, [yDoc]);

  return {
    yDoc,
    provider,
    isConnected,
    isSynced,
    collaborators,
    currentUserColor,
    updateCursor,
    updateSelection,
    setNodes,
    setEdges,
    getNodes,
    getEdges,
  };
}
