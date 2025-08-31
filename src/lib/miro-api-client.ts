/**
 * @fileoverview Miro REST API Client
 * Handles all Miro board operations with rate limiting and error handling
 */

import { DeliveryItem } from '@/stores/delivery-store';

export interface MiroBoard {
  id: string;
  name: string;
  type: string;
  policy: {
    permissionsPolicy: {
      collaborationToolsStartAccess: string;
      copyAccess: string;
      sharingAccess: string;
    };
    sharingPolicy: {
      access: string;
      inviteToAccountAndBoardLinkAccess: string;
      organizationAccess: string;
      teamAccess: string;
    };
  };
  viewLink: string;
  createdAt: string;
  modifiedAt: string;
}

export interface MiroItem {
  id: string;
  type: 'sticky_note' | 'shape' | 'text';
  position: {
    x: number;
    y: number;
    origin?: string;
  };
  geometry: {
    width: number;
    height: number;
  };
  style?: {
    fillColor?: string;
    textAlign?: string;
    textAlignVertical?: string;
  };
  data: {
    content: string;
    shape?: string;
  };
}

export interface MiroApiError {
  status: number;
  code: string;
  message: string;
  context?: any;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Miro API Client with comprehensive error handling and rate limiting
 */
export class MiroApiClient {
  private baseUrl = 'https://api.miro.com/v2';
  private rateLimitInfo: RateLimitInfo = { remaining: 100, reset: 0, limit: 100 };
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get board information
   */
  async getBoard(boardId: string): Promise<MiroBoard> {
    await this.checkRateLimit();

    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);

    try {
      const response = await this.makeRequest(`/boards/${cleanBoardId}`, 'GET');
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Failed to get board ${cleanBoardId}`);
    }
  }

  /**
   * List user's boards
   */
  async getBoards(limit = 20): Promise<{ data: MiroBoard[]; total: number }> {
    await this.checkRateLimit();

    try {
      const response = await this.makeRequest(`/boards?limit=${limit}`, 'GET');
      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get boards');
    }
  }

  /**
   * Create sticky note on board
   */
  async createStickyNote(boardId: string, item: DeliveryItem): Promise<MiroItem> {
    await this.checkRateLimit();

    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);

    // Validate and sanitize input data
    const sanitizedItem = this.validateAndSanitizeDeliveryItem(item);

    // Ensure content is not empty and properly formatted
    const content = (sanitizedItem.text || '').trim();
    if (!content) {
      throw new Error('Sticky note content cannot be empty');
    }

    // Miro API specific payload structure
    const payload = {
      data: {
        content: content,
        shape: 'square'
      },
      style: {
        fillColor: sanitizedItem.style?.backgroundColor || '#fff9b1',
        textAlign: 'center',
        textAlignVertical: 'middle'
      },
      position: {
        x: Number(sanitizedItem.x) || 0,
        y: Number(sanitizedItem.y) || 0,
        origin: 'center'
      },
      geometry: {
        width: Number(sanitizedItem.width) || 180,
        height: Number(sanitizedItem.height) || 120
      }
    };

    console.log('📝 Creating sticky note with payload:', {
      boardId: cleanBoardId,
      content: content.substring(0, 30) + '...',
      position: payload.position,
      geometry: payload.geometry,
      style: payload.style
    });

    try {
      const response = await this.makeRequest(`/boards/${cleanBoardId}/sticky_notes`, 'POST', payload);
      return response;
    } catch (error) {
      console.error('❌ Sticky note creation failed:', {
        boardId: cleanBoardId,
        content: content.substring(0, 30) + '...',
        error: error.message || error,
        payload
      });
      throw this.handleApiError(error, `Failed to create sticky note: ${content.substring(0, 30)}...`);
    }
  }

  /**
   * Create text item on board
   */
  async createText(boardId: string, item: DeliveryItem): Promise<MiroItem> {
    await this.checkRateLimit();

    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);

    // Validate and sanitize input data
    const sanitizedItem = this.validateAndSanitizeDeliveryItem(item);

    // Ensure content is not empty and properly formatted
    const content = (sanitizedItem.text || '').trim();
    if (!content) {
      throw new Error('Text content cannot be empty');
    }

    // Miro API specific payload structure for text items
    const payload = {
      data: {
        content: content
      },
      style: {
        color: sanitizedItem.style?.color || '#1a1a1a',
        fillColor: 'transparent',
        fontFamily: 'arial',
        fontSize: Math.max(8, Math.min(72, sanitizedItem.style?.fontSize || 14)), // Clamp font size
        textAlign: 'left'
      },
      position: {
        x: Number(sanitizedItem.x) || 0,
        y: Number(sanitizedItem.y) || 0,
        origin: 'center'
      },
      geometry: {
        width: Number(sanitizedItem.width) || 200,
        height: Number(sanitizedItem.height) || 50
      }
    };

    console.log('📝 Creating text item with payload:', {
      boardId: cleanBoardId,
      content: content.substring(0, 30) + '...',
      position: payload.position,
      geometry: payload.geometry,
      fontSize: payload.style.fontSize
    });

    try {
      const response = await this.makeRequest(`/boards/${cleanBoardId}/texts`, 'POST', payload);
      return response;
    } catch (error) {
      console.error('❌ Text creation failed:', {
        boardId: cleanBoardId,
        content: content.substring(0, 30) + '...',
        error: error.message || error,
        payload
      });
      throw this.handleApiError(error, `Failed to create text: ${content.substring(0, 30)}...`);
    }
  }

  /**
   * Create shape on board
   */
  async createShape(boardId: string, item: DeliveryItem): Promise<MiroItem> {
    await this.checkRateLimit();

    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);

    // Validate and sanitize input data
    const sanitizedItem = this.validateAndSanitizeDeliveryItem(item);

    const payload = {
      data: {
        content: sanitizedItem.text,
        shape: 'rectangle'
      },
      style: {
        fillColor: sanitizedItem.style?.backgroundColor || '#f0f0f0',
        borderColor: '#333333',
        borderWidth: 2,
        textAlign: 'center',
        textAlignVertical: 'middle'
      },
      position: {
        x: sanitizedItem.x,
        y: sanitizedItem.y,
        origin: 'center'
      },
      geometry: {
        width: sanitizedItem.width,
        height: sanitizedItem.height
      }
    };

    try {
      const response = await this.makeRequest(`/boards/${cleanBoardId}/shapes`, 'POST', payload);
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Failed to create shape: ${item.text?.substring(0, 30)}...`);
    }
  }

  /**
   * Create multiple items in batch with error handling
   */
  async createItems(boardId: string, items: DeliveryItem[]): Promise<{
    success: MiroItem[];
    failed: Array<{ item: DeliveryItem; error: string }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const success: MiroItem[] = [];
    const failed: Array<{ item: DeliveryItem; error: string }> = [];

    for (const item of items) {
      try {
        let miroItem: MiroItem;

        switch (item.type) {
          case 'sticky':
            miroItem = await this.createStickyNote(boardId, item);
            break;
          case 'text':
            miroItem = await this.createText(boardId, item);
            break;
          case 'shape':
            miroItem = await this.createShape(boardId, item);
            break;
          default:
            miroItem = await this.createStickyNote(boardId, item); // Default to sticky
        }

        success.push(miroItem);

        // Add small delay to avoid overwhelming the API
        await this.delay(100);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({ item, error: errorMessage });
        
        // Continue with remaining items unless we hit a critical error
        if (errorMessage.includes('401') || errorMessage.includes('403')) {
          throw new Error('Authentication failed - stopping batch creation');
        }
      }
    }

    return {
      success,
      failed,
      summary: {
        total: items.length,
        successful: success.length,
        failed: failed.length
      }
    };
  }

  /**
   * Get board embed URL - Note: Miro restricts iframe embedding
   * Returns the standard board URL which should be opened in a new window
   */
  getBoardEmbedUrl(boardId: string, options?: {
    autoplay?: boolean;
    embedMode?: 'live_embed' | 'view_only';
  }): string {
    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);
    
    // Miro has strict iframe security policies that block most embed attempts
    // Instead, return the standard board URL for opening in new window/tab
    return `https://miro.com/app/board/${cleanBoardId}/`;
  }

  /**
   * Get board view URL that works in new window/tab
   */
  getBoardViewUrl(boardId: string): string {
    const cleanBoardId = this.sanitizeBoardId(boardId);
    return `https://miro.com/app/board/${cleanBoardId}/`;
  }

  /**
   * Validate board access and permissions
   */
  async validateBoardAccess(boardId: string): Promise<{
    canRead: boolean;
    canWrite: boolean;
    boardName: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let canRead = false;
    let canWrite = false;
    let boardName = '';

    // Clean and validate board ID
    const cleanBoardId = this.sanitizeBoardId(boardId);

    try {
      const board = await this.getBoard(cleanBoardId);
      canRead = true;
      boardName = board.name;

      // Check write permissions by attempting to get items (read-only operation)
      // In a real scenario, you'd check the board's permission policy
      const collaborationAccess = board.policy?.permissionsPolicy?.collaborationToolsStartAccess;
      canWrite = collaborationAccess !== 'board_owners_and_admins';

    } catch (error) {
      const apiError = error as MiroApiError;
      
      if (apiError.status === 404) {
        errors.push(`Miro board "${cleanBoardId}" not found. Please check the board ID and ensure you have access to this board.`);
      } else if (apiError.status === 403) {
        errors.push(`You don't have permission to edit board "${cleanBoardId}". Please ask the board owner to grant you edit access.`);
      } else if (apiError.status === 401) {
        errors.push('Your Miro access token has expired. Please reconnect your Miro account.');
      } else {
        errors.push(`Unable to access Miro board: ${apiError.message || 'Unknown error'}`);
      }
    }

    return { canRead, canWrite, boardName, errors };
  }

  /**
   * Test API connection and token validity
   */
  async testConnection(): Promise<{
    isValid: boolean;
    userInfo?: {
      id: string;
      name: string;
      email: string;
    };
    error?: string;
  }> {
    try {
      // Use the /boards endpoint to test connection - it's a valid Miro API endpoint
      const response = await this.makeRequest('/boards?limit=1', 'GET');
      
      return {
        isValid: true,
        userInfo: {
          id: 'miro-user',
          name: 'Miro User',
          email: 'Connection successful!'
        }
      };

    } catch (error) {
      const apiError = error as MiroApiError;
      let errorMessage = `Connection test failed: ${apiError.message}`;
      
      // Handle specific error cases
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        errorMessage = 'Invalid access token. Please check your Miro access token.';
      } else if (errorMessage.includes('YOUR_CLIENT_ID')) {
        errorMessage = 'Invalid access token format. Please provide a valid Miro access token.';
      }
      
      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  // Private helper methods

  private async makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    // Update rate limit info from headers
    this.updateRateLimitInfo(response);

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        code: errorData.code || 'API_ERROR',
        message: errorData.message || response.statusText,
        context: errorData
      } as MiroApiError;
    }

    return await response.json();
  }

  private updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const limit = response.headers.get('X-RateLimit-Limit');

    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining);
    if (reset) this.rateLimitInfo.reset = parseInt(reset);
    if (limit) this.rateLimitInfo.limit = parseInt(limit);
  }

  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitInfo.remaining <= 5) { // Buffer of 5 requests
      const now = Date.now() / 1000;
      const waitTime = Math.max(0, this.rateLimitInfo.reset - now);
      
      if (waitTime > 0) {
        console.warn(`Rate limit approaching. Waiting ${waitTime}s...`);
        await this.delay(waitTime * 1000);
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleApiError(error: any, context: string): MiroApiError {
    if (error.status && error.code) {
      // Already a MiroApiError
      return { ...error, message: `${context}: ${error.message}` };
    }

    // Convert generic error to MiroApiError
    return {
      status: 500,
      code: 'UNKNOWN_ERROR',
      message: `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      context: error
    };
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  /**
   * Update access token
   */
  updateAccessToken(newToken: string): void {
    this.accessToken = newToken;
  }

  /**
   * Validate and sanitize delivery item data for Miro API
   */
  private validateAndSanitizeDeliveryItem(item: DeliveryItem): DeliveryItem {
    // Ensure text content exists and is valid
    let text = item.text || '';
    if (typeof text !== 'string') {
      text = String(text);
    }
    // Miro API has content length limits
    text = text.substring(0, 5000);

    // Validate and sanitize coordinates
    let x = item.x || 0;
    let y = item.y || 0;
    
    // Ensure coordinates are numbers and within reasonable bounds
    x = isNaN(Number(x)) ? 0 : Number(x);
    y = isNaN(Number(y)) ? 0 : Number(y);
    
    // Clamp coordinates to reasonable ranges to avoid Miro API errors
    x = Math.max(-100000, Math.min(100000, x));
    y = Math.max(-100000, Math.min(100000, y));

    // Validate and sanitize dimensions
    let width = item.width || 180;
    let height = item.height || 120;
    
    width = isNaN(Number(width)) ? 180 : Number(width);
    height = isNaN(Number(height)) ? 120 : Number(height);
    
    // Ensure minimum dimensions for Miro API
    width = Math.max(10, Math.min(2000, width));
    height = Math.max(10, Math.min(2000, height));

    // Validate style colors if present
    const style = item.style ? {
      ...item.style,
      backgroundColor: this.validateHexColor(item.style.backgroundColor),
      color: this.validateHexColor(item.style.color),
      fontSize: item.style.fontSize ? Math.max(8, Math.min(72, item.style.fontSize)) : undefined
    } : undefined;

    return {
      ...item,
      text,
      x,
      y,
      width,
      height,
      style
    };
  }

  /**
   * Validate hex color format for Miro API
   */
  private validateHexColor(color?: string): string | undefined {
    if (!color) return undefined;
    
    // Basic hex color validation
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(color)) {
      return color;
    }
    
    // Try to normalize common color formats
    if (color.startsWith('rgb')) {
      // For now, just return undefined for RGB colors
      // Could implement RGB to hex conversion here
      return undefined;
    }
    
    // Return undefined for invalid colors - let Miro API use defaults
    return undefined;
  }

  /**
   * Sanitize board ID to ensure valid URL construction
   */
  private sanitizeBoardId(boardId: string): string {
    if (!boardId || typeof boardId !== 'string') {
      throw new Error('Board ID is required and must be a string');
    }

    // Trim whitespace and remove any extra slashes
    let cleanId = boardId.trim().replace(/\/+/g, '');
    
    // Remove protocol and domain if full URL was provided
    if (cleanId.includes('miro.com/app/board/')) {
      const match = cleanId.match(/miro\.com\/app\/board\/([^\/]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    // Validate that we have a reasonable board ID
    if (!cleanId || cleanId.length < 3) {
      throw new Error('Invalid board ID format');
    }

    console.log(`🧹 Sanitized board ID: "${boardId}" → "${cleanId}"`);
    return cleanId;
  }
}