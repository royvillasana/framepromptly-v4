export const DELIVERY_CONFIG = {
  // Ephemeral URL settings
  EPHEMERAL_TTL: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // API endpoints
  ENDPOINTS: {
    GENERATE: '/api/delivery/generate',
    IMPORT: '/api/delivery/import',
    MIRO_AUTH: '/api/delivery/miro/auth',
    MIRO_CALLBACK: '/api/delivery/miro/callback'
  },
  
  // Miro OAuth settings
  MIRO: {
    SCOPES: ['boards:read', 'boards:write'],
    REDIRECT_URI: process.env.VITE_MIRO_REDIRECT_URI || 'http://localhost:8080/api/delivery/miro/callback'
  },
  
  // Content limits
  LIMITS: {
    MAX_ITEMS: 100,
    MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB
    MAX_TEXT_LENGTH_MIRO: 12,
    MAX_TEXT_LENGTH_FIGJAM: 25,
    MAX_TEXT_LENGTH_FIGMA: 50
  },
  
  // Layout defaults
  LAYOUT: {
    DEFAULT_SPACING: 120,
    DEFAULT_COLUMNS: 3,
    GRID_SIZE: 20,
    DEFAULT_ITEM_WIDTH: 160,
    DEFAULT_ITEM_HEIGHT: 80
  },
  
  // Error codes
  ERROR_CODES: {
    INVALID_DESTINATION: 'INVALID_DESTINATION',
    MISSING_TARGET_ID: 'MISSING_TARGET_ID',
    INVALID_PROMPT: 'INVALID_PROMPT',
    PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
    MIRO_AUTH_FAILED: 'MIRO_AUTH_FAILED',
    MIRO_API_ERROR: 'MIRO_API_ERROR',
    EXPIRED_URL: 'EXPIRED_URL',
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
  }
} as const

export type ErrorCode = keyof typeof DELIVERY_CONFIG.ERROR_CODES