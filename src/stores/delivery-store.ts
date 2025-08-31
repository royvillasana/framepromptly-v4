import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { DestinationType } from '@/lib/destination-driven-tailoring';

export type DeliveryStatus = 'pending' | 'processing' | 'success' | 'error' | 'cancelled';
export type DeliveryDestination = 'miro' | 'figjam' | 'figma';

export interface DeliveryTarget {
  destination: DeliveryDestination;
  targetId: string; // boardId for Miro, fileId for FigJam/Figma
  metadata?: {
    boardName?: string;
    fileName?: string;
    workspaceId?: string;
    teamId?: string;
    permissions?: string[];
  };
}

export interface DeliveryItem {
  id: string;
  type: 'sticky' | 'text' | 'shape' | 'frame' | 'group';
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    theme?: string;
  };
  clusterId?: string;
  groupId?: string;
  metadata?: Record<string, any>;
}

export interface DeliveryPayload {
  id: string;
  destination: DeliveryDestination;
  targetId: string;
  sourcePrompt: string;
  items: DeliveryItem[];
  layoutHints: {
    columns?: number;
    spacing?: number;
    maxItems?: number;
    arrangement?: 'grid' | 'flow' | 'clusters';
  };
  summary: string;
  itemCount: number;
  createdAt: Date;
}

export interface DeliveryResult {
  id: string;
  status: DeliveryStatus;
  destination: DeliveryDestination;
  targetId: string;
  payloadId: string;
  deliveredItems: number;
  totalItems: number;
  embedUrl?: string;
  importUrl?: string;
  expiresAt?: Date;
  error?: string;
  warnings?: string[];
  metadata?: {
    processingTime?: number;
    retryCount?: number;
    truncated?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthConnection {
  id: string;
  destination: DeliveryDestination;
  userId: string;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  scopes: string[];
  expiresAt?: Date;
  metadata?: {
    username?: string;
    workspaces?: Array<{
      id: string;
      name: string;
    }>;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EphemeralImport {
  id: string;
  payloadId: string;
  signedUrl: string;
  expiresAt: Date;
  usageCount: number;
  maxUsage: number;
  destination: 'figjam' | 'figma';
  createdAt: Date;
}

export interface DeliveryState {
  // Data
  deliveries: DeliveryResult[];
  payloads: DeliveryPayload[];
  connections: OAuthConnection[];
  ephemeralImports: EphemeralImport[];
  currentDelivery: DeliveryResult | null;
  
  // UI State
  isDelivering: boolean;
  isGeneratingPayload: boolean;
  isConnecting: boolean;
  deliveryProgress: number;
  
  // Actions - Delivery Management
  initiateDelivery: (promptId: string, target: DeliveryTarget) => Promise<DeliveryResult>;
  cancelDelivery: (deliveryId: string) => Promise<void>;
  retryDelivery: (deliveryId: string) => Promise<DeliveryResult>;
  getDeliveryStatus: (deliveryId: string) => DeliveryResult | null;
  loadProjectDeliveries: (projectId: string) => Promise<void>;
  addDelivery: (delivery: DeliveryResult) => void;
  clearDeliveries: () => void;
  
  // Actions - Payload Generation
  generatePayload: (promptId: string, destination: DeliveryDestination, options?: any) => Promise<DeliveryPayload>;
  validatePayload: (payloadId: string) => Promise<{ isValid: boolean; errors: string[] }>;
  optimizePayload: (payloadId: string, constraints: any) => Promise<DeliveryPayload>;
  
  // Actions - OAuth Management
  initiateOAuth: (destination: DeliveryDestination) => Promise<string>; // Returns auth URL
  completeOAuth: (destination: DeliveryDestination, code: string) => Promise<OAuthConnection>;
  refreshConnection: (connectionId: string) => Promise<OAuthConnection>;
  revokeConnection: (connectionId: string) => Promise<void>;
  getActiveConnection: (destination: DeliveryDestination) => OAuthConnection | null;
  loadConnections: () => Promise<void>;
  
  // Actions - Ephemeral Import Management
  createEphemeralImport: (payloadId: string, destination: 'figjam' | 'figma') => Promise<EphemeralImport>;
  validateEphemeralImport: (importId: string) => Promise<{ isValid: boolean; payload?: DeliveryPayload }>;
  trackImportUsage: (importId: string) => Promise<void>;
  
  // Actions - Target Management
  validateTarget: (target: DeliveryTarget) => Promise<{ isValid: boolean; errors: string[] }>;
  loadTargetOptions: (destination: DeliveryDestination) => Promise<any[]>;
  
  // Actions - Progress & Status
  updateDeliveryProgress: (deliveryId: string, progress: number, status?: DeliveryStatus) => void;
  subscribeToDeliveryUpdates: (deliveryId: string, callback: (result: DeliveryResult) => void) => () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // Initial state
  deliveries: [],
  payloads: [],
  connections: [],
  ephemeralImports: [],
  currentDelivery: null,
  isDelivering: false,
  isGeneratingPayload: false,
  isConnecting: false,
  deliveryProgress: 0,

  // Delivery Management
  initiateDelivery: async (promptId: string, target: DeliveryTarget) => {
    set({ isDelivering: true, deliveryProgress: 0 });
    
    try {
      // Validate target first
      const targetValidation = await get().validateTarget(target);
      if (!targetValidation.isValid) {
        throw new Error(`Invalid target: ${targetValidation.errors.join(', ')}`);
      }

      // Check OAuth connection
      const connection = get().getActiveConnection(target.destination);
      if (!connection && target.destination === 'miro') {
        throw new Error(`No active ${target.destination} connection. Please connect first.`);
      }

      set({ deliveryProgress: 20 });

      // Generate payload
      const payload = await get().generatePayload(promptId, target.destination);
      set({ deliveryProgress: 60 });

      // Create delivery record
      const delivery: DeliveryResult = {
        id: `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'processing',
        destination: target.destination,
        targetId: target.targetId,
        payloadId: payload.id,
        deliveredItems: 0,
        totalItems: payload.items.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        deliveries: [...state.deliveries, delivery],
        currentDelivery: delivery,
        deliveryProgress: 80
      }));

      // Route to appropriate delivery method
      if (target.destination === 'miro') {
        // Direct Miro API delivery
        await get().deliverToMiro(delivery, payload, connection!);
      } else {
        // Create ephemeral import for FigJam/Figma
        const ephemeralImport = await get().createEphemeralImport(payload.id, target.destination);
        
        // Update delivery with import URL
        const updatedDelivery = {
          ...delivery,
          status: 'success' as DeliveryStatus,
          importUrl: ephemeralImport.signedUrl,
          expiresAt: ephemeralImport.expiresAt,
          deliveredItems: payload.items.length,
          updatedAt: new Date()
        };

        set(state => ({
          deliveries: state.deliveries.map(d => d.id === delivery.id ? updatedDelivery : d),
          currentDelivery: updatedDelivery,
          deliveryProgress: 100,
          isDelivering: false
        }));

        return updatedDelivery;
      }

      set({ deliveryProgress: 100, isDelivering: false });
      return delivery;

    } catch (error) {
      console.error('Delivery initiation failed:', error);
      
      const failedDelivery: DeliveryResult = {
        id: `failed-delivery-${Date.now()}`,
        status: 'error',
        destination: target.destination,
        targetId: target.targetId,
        payloadId: '',
        deliveredItems: 0,
        totalItems: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        deliveries: [...state.deliveries, failedDelivery],
        currentDelivery: failedDelivery,
        isDelivering: false,
        deliveryProgress: 0
      }));

      throw error;
    }
  },

  // Private method for Miro delivery
  deliverToMiro: async (delivery: DeliveryResult, payload: DeliveryPayload, connection: OAuthConnection) => {
    // This would integrate with Miro REST API
    // For now, simulate the process
    
    try {
      // Simulate API calls to create items on Miro board
      for (let i = 0; i < payload.items.length; i++) {
        // Create each item via Miro API
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
        
        // Update progress
        const progress = Math.round(((i + 1) / payload.items.length) * 20) + 80; // 80-100%
        set(state => ({
          deliveryProgress: progress,
          deliveries: state.deliveries.map(d => 
            d.id === delivery.id 
              ? { ...d, deliveredItems: i + 1, updatedAt: new Date() }
              : d
          )
        }));
      }

      // Generate embed URL
      const embedUrl = `https://miro.com/app/live-embed/${delivery.targetId}`;

      // Update delivery as complete
      const completedDelivery = {
        ...delivery,
        status: 'success' as DeliveryStatus,
        deliveredItems: payload.items.length,
        embedUrl,
        updatedAt: new Date()
      };

      set(state => ({
        deliveries: state.deliveries.map(d => d.id === delivery.id ? completedDelivery : d),
        currentDelivery: completedDelivery
      }));

    } catch (error) {
      console.error('Miro delivery failed:', error);
      
      const failedDelivery = {
        ...delivery,
        status: 'error' as DeliveryStatus,
        error: error instanceof Error ? error.message : 'Miro delivery failed',
        updatedAt: new Date()
      };

      set(state => ({
        deliveries: state.deliveries.map(d => d.id === delivery.id ? failedDelivery : d),
        currentDelivery: failedDelivery
      }));

      throw error;
    }
  },

  cancelDelivery: async (deliveryId: string) => {
    set(state => ({
      deliveries: state.deliveries.map(d =>
        d.id === deliveryId
          ? { ...d, status: 'cancelled' as DeliveryStatus, updatedAt: new Date() }
          : d
      )
    }));
  },

  retryDelivery: async (deliveryId: string) => {
    const delivery = get().deliveries.find(d => d.id === deliveryId);
    if (!delivery) throw new Error('Delivery not found');

    // Reset status and retry
    set(state => ({
      deliveries: state.deliveries.map(d =>
        d.id === deliveryId
          ? { ...d, status: 'processing' as DeliveryStatus, error: undefined, updatedAt: new Date() }
          : d
      )
    }));

    // Implement retry logic here
    return delivery;
  },

  getDeliveryStatus: (deliveryId: string) => {
    return get().deliveries.find(d => d.id === deliveryId) || null;
  },

  loadProjectDeliveries: async (projectId: string) => {
    try {
      // Load deliveries from database
      // For now, use mock data
      const mockDeliveries: DeliveryResult[] = [];
      set({ deliveries: mockDeliveries });
    } catch (error) {
      console.error('Error loading project deliveries:', error);
    }
  },

  addDelivery: (delivery: DeliveryResult) => {
    set(state => ({
      deliveries: [delivery, ...state.deliveries], // Add to beginning of array
      currentDelivery: delivery
    }));
    console.log('✅ Added delivery to store:', {
      id: delivery.id,
      destination: delivery.destination,
      status: delivery.status,
      deliveredItems: delivery.deliveredItems,
      hasImportUrl: !!delivery.importUrl,
      hasEmbedUrl: !!delivery.embedUrl
    });
  },

  clearDeliveries: () => {
    set({ deliveries: [], currentDelivery: null });
  },

  // Payload Generation
  generatePayload: async (promptId: string, destination: DeliveryDestination, options?: any) => {
    set({ isGeneratingPayload: true });

    try {
      // This would integrate with the AI generation and normalization pipeline
      // For now, generate mock payload
      
      const mockItems: DeliveryItem[] = Array.from({ length: 12 }, (_, i) => ({
        id: `item-${i + 1}`,
        type: 'sticky',
        text: `Generated item ${i + 1} for ${destination}`,
        x: (i % 4) * 200 + 100,
        y: Math.floor(i / 4) * 150 + 100,
        width: 180,
        height: 120,
        style: {
          backgroundColor: ['#FFE066', '#FF6B66', '#66D9FF', '#66FF66'][i % 4],
          fontSize: 14
        }
      }));

      const payload: DeliveryPayload = {
        id: `payload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        destination,
        targetId: 'mock-target-id',
        sourcePrompt: `Mock prompt for ${destination}`,
        items: mockItems,
        layoutHints: {
          columns: 4,
          spacing: 20,
          maxItems: 50,
          arrangement: 'grid'
        },
        summary: `Generated ${mockItems.length} items for ${destination} delivery`,
        itemCount: mockItems.length,
        createdAt: new Date()
      };

      set(state => ({
        payloads: [...state.payloads, payload],
        isGeneratingPayload: false
      }));

      return payload;

    } catch (error) {
      set({ isGeneratingPayload: false });
      throw error;
    }
  },

  validatePayload: async (payloadId: string) => {
    const payload = get().payloads.find(p => p.id === payloadId);
    if (!payload) {
      return { isValid: false, errors: ['Payload not found'] };
    }

    const errors: string[] = [];

    // Basic validation
    if (!payload.items || payload.items.length === 0) {
      errors.push('Payload contains no items');
    }

    if (payload.items.length > 100) {
      errors.push('Payload exceeds maximum items (100)');
    }

    // Item validation
    payload.items.forEach((item, index) => {
      if (!item.id) errors.push(`Item ${index} missing ID`);
      if (!item.type) errors.push(`Item ${index} missing type`);
      if (typeof item.x !== 'number') errors.push(`Item ${index} missing x position`);
      if (typeof item.y !== 'number') errors.push(`Item ${index} missing y position`);
    });

    return { isValid: errors.length === 0, errors };
  },

  optimizePayload: async (payloadId: string, constraints: any) => {
    const payload = get().payloads.find(p => p.id === payloadId);
    if (!payload) throw new Error('Payload not found');

    // Apply optimization logic
    const optimizedPayload = { ...payload };
    
    // Limit items if needed
    if (constraints.maxItems && payload.items.length > constraints.maxItems) {
      optimizedPayload.items = payload.items.slice(0, constraints.maxItems);
      optimizedPayload.itemCount = constraints.maxItems;
    }

    set(state => ({
      payloads: state.payloads.map(p => p.id === payloadId ? optimizedPayload : p)
    }));

    return optimizedPayload;
  },

  // OAuth Management
  initiateOAuth: async (destination: DeliveryDestination) => {
    set({ isConnecting: true });
    
    // Generate OAuth URL based on destination  
    const clientId = import.meta.env.VITE_MIRO_CLIENT_ID || '';
    const redirectUri = import.meta.env.VITE_APP_URL + '/oauth/callback' || '';
    
    const oauthUrls = {
      miro: clientId 
        ? `https://miro.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=boards:read boards:write`
        : '', // Return empty string if no client ID is configured
      figjam: '#', // Plugin-based, no OAuth needed
      figma: '#'   // Plugin-based, no OAuth needed
    };

    const authUrl = oauthUrls[destination];
    
    if (authUrl === '#' || authUrl === '') {
      set({ isConnecting: false });
      if (destination === 'miro' && !clientId) {
        throw new Error('Miro OAuth not configured. Please use the simple access token connection method or set up OAuth credentials.');
      }
      throw new Error(`OAuth not required for ${destination}`);
    }

    set({ isConnecting: false });
    return authUrl;
  },

  completeOAuth: async (destination: DeliveryDestination, code: string) => {
    set({ isConnecting: true });

    try {
      // Exchange code for tokens (would call backend)
      const mockConnection: OAuthConnection = {
        id: `conn-${Date.now()}`,
        destination,
        userId: 'current-user',
        accessToken: 'encrypted-access-token',
        refreshToken: 'encrypted-refresh-token',
        scopes: ['boards:read', 'boards:write'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        connections: [...state.connections.filter(c => c.destination !== destination), mockConnection],
        isConnecting: false
      }));

      return mockConnection;

    } catch (error) {
      set({ isConnecting: false });
      throw error;
    }
  },

  refreshConnection: async (connectionId: string) => {
    const connection = get().connections.find(c => c.id === connectionId);
    if (!connection) throw new Error('Connection not found');

    // Refresh token logic would go here
    const refreshedConnection = {
      ...connection,
      updatedAt: new Date()
    };

    set(state => ({
      connections: state.connections.map(c => c.id === connectionId ? refreshedConnection : c)
    }));

    return refreshedConnection;
  },

  revokeConnection: async (connectionId: string) => {
    set(state => ({
      connections: state.connections.filter(c => c.id !== connectionId)
    }));
  },

  getActiveConnection: (destination: DeliveryDestination) => {
    return get().connections.find(c => c.destination === destination && c.isActive) || null;
  },

  loadConnections: async () => {
    try {
      // Load from database
      const mockConnections: OAuthConnection[] = [];
      set({ connections: mockConnections });
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  },

  // Ephemeral Import Management
  createEphemeralImport: async (payloadId: string, destination: 'figjam' | 'figma') => {
    const payload = get().payloads.find(p => p.id === payloadId);
    if (!payload) throw new Error('Payload not found');

    // Create signed URL with expiration
    const ephemeralImport: EphemeralImport = {
      id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      payloadId,
      signedUrl: `https://api.framepromptly.com/import/${payloadId}.json?sig=signed-token-here`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      usageCount: 0,
      maxUsage: 5,
      destination,
      createdAt: new Date()
    };

    set(state => ({
      ephemeralImports: [...state.ephemeralImports, ephemeralImport]
    }));

    return ephemeralImport;
  },

  validateEphemeralImport: async (importId: string) => {
    const ephemeralImport = get().ephemeralImports.find(i => i.id === importId);
    if (!ephemeralImport) {
      return { isValid: false };
    }

    if (ephemeralImport.expiresAt < new Date()) {
      return { isValid: false };
    }

    if (ephemeralImport.usageCount >= ephemeralImport.maxUsage) {
      return { isValid: false };
    }

    const payload = get().payloads.find(p => p.id === ephemeralImport.payloadId);
    return { isValid: true, payload };
  },

  trackImportUsage: async (importId: string) => {
    set(state => ({
      ephemeralImports: state.ephemeralImports.map(i =>
        i.id === importId
          ? { ...i, usageCount: i.usageCount + 1 }
          : i
      )
    }));
  },

  // Target Management
  validateTarget: async (target: DeliveryTarget) => {
    const errors: string[] = [];

    if (!target.destination) {
      errors.push('Destination is required');
    }

    if (!target.targetId) {
      errors.push('Target ID is required');
    }

    // Destination-specific validation
    if (target.destination === 'miro') {
      // Validate Miro board ID format
      if (!/^[a-zA-Z0-9_-]+$/.test(target.targetId)) {
        errors.push('Invalid Miro board ID format');
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  loadTargetOptions: async (destination: DeliveryDestination) => {
    const connection = get().getActiveConnection(destination);
    if (!connection) return [];

    // Load boards/files from destination API
    // For now, return mock data
    return [
      { id: 'board-1', name: 'Project Board', type: 'board' },
      { id: 'board-2', name: 'User Research Board', type: 'board' }
    ];
  },

  // Progress & Status
  updateDeliveryProgress: (deliveryId: string, progress: number, status?: DeliveryStatus) => {
    set(state => ({
      deliveries: state.deliveries.map(d =>
        d.id === deliveryId
          ? { 
              ...d, 
              ...(status && { status }),
              updatedAt: new Date()
            }
          : d
      ),
      deliveryProgress: progress
    }));
  },

  subscribeToDeliveryUpdates: (deliveryId: string, callback: (result: DeliveryResult) => void) => {
    // This would set up a real-time subscription
    // For now, return a cleanup function
    return () => {};
  }
}));