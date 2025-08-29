export type DeliveryDestination = 'miro' | 'figjam' | 'figma'

export interface DeliveryRequest {
  destination: DeliveryDestination
  targetId: string
  prompt: string
  projectId?: string
}

export interface DeliveryItem {
  type: 'sticky' | 'text' | 'shape' | 'frame' | 'group'
  text?: string
  x: number
  y: number
  width?: number
  height?: number
  style?: {
    color?: string
    backgroundColor?: string
    fontSize?: number
    fontFamily?: string
  }
  clusterId?: string
}

export interface DeliveryPayload {
  destination: DeliveryDestination
  targetId: string
  sourcePrompt: string
  items: DeliveryItem[]
  layoutHints?: {
    columns?: number
    spacing?: number
    maxItems?: number
  }
  meta: {
    generatedAt: string
    itemCount: number
    summary?: string
  }
}

export interface MiroDeliveryResponse {
  status: 'success' | 'error'
  boardId: string
  embedUrl?: string
  itemCount: number
  warnings?: string[]
  error?: string
}

export interface EphemeralDeliveryResponse {
  status: 'success' | 'error'
  fileId: string
  importUrl: string
  expiresAt: string
  itemCount: number
  usageNote: string
  error?: string
}

export type DeliveryResponse = MiroDeliveryResponse | EphemeralDeliveryResponse

export interface DeliveryLog {
  id: string
  projectId: string
  destination: DeliveryDestination
  targetId: string
  status: 'pending' | 'processing' | 'success' | 'error'
  itemCount?: number
  error?: string
  createdAt: string
  completedAt?: string
}

export interface PromptTailoringConfig {
  destination: DeliveryDestination
  maxTextLength: number
  preferredItemTypes: DeliveryItem['type'][]
  layoutDefaults: {
    columns: number
    spacing: number
    maxItems: number
  }
  validationRules: {
    enforceTextLimits: boolean
    requirePositions: boolean
    allowEmptyText: boolean
  }
}

export const DELIVERY_CONFIGS: Record<DeliveryDestination, PromptTailoringConfig> = {
  miro: {
    destination: 'miro',
    maxTextLength: 12,
    preferredItemTypes: ['sticky', 'shape', 'text'],
    layoutDefaults: {
      columns: 4,
      spacing: 120,
      maxItems: 50
    },
    validationRules: {
      enforceTextLimits: true,
      requirePositions: true,
      allowEmptyText: false
    }
  },
  figjam: {
    destination: 'figjam',
    maxTextLength: 25,
    preferredItemTypes: ['sticky', 'text', 'shape'],
    layoutDefaults: {
      columns: 3,
      spacing: 150,
      maxItems: 40
    },
    validationRules: {
      enforceTextLimits: true,
      requirePositions: true,
      allowEmptyText: false
    }
  },
  figma: {
    destination: 'figma',
    maxTextLength: 50,
    preferredItemTypes: ['frame', 'text', 'shape'],
    layoutDefaults: {
      columns: 2,
      spacing: 200,
      maxItems: 30
    },
    validationRules: {
      enforceTextLimits: false,
      requirePositions: true,
      allowEmptyText: false
    }
  }
}