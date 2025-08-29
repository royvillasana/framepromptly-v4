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

    try {
      const response = await this.makeRequest(`/boards/${boardId}`, 'GET');
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Failed to get board ${boardId}`);
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

    const payload = {
      data: {
        content: item.text || '',
        shape: 'square'
      },
      style: {
        fillColor: item.style?.backgroundColor || '#fff9b1',
        textAlign: 'center',
        textAlignVertical: 'middle'
      },
      position: {
        x: item.x,
        y: item.y,
        origin: 'center'
      },
      geometry: {
        width: item.width || 180,
        height: item.height || 120
      }
    };

    try {
      const response = await this.makeRequest(`/boards/${boardId}/sticky_notes`, 'POST', payload);
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Failed to create sticky note: ${item.text?.substring(0, 30)}...`);
    }
  }

  /**
   * Create text item on board
   */
  async createText(boardId: string, item: DeliveryItem): Promise<MiroItem> {
    await this.checkRateLimit();

    const payload = {
      data: {
        content: item.text || ''
      },
      style: {
        color: item.style?.color || '#1a1a1a',
        fillColor: 'transparent',
        fontFamily: 'arial',
        fontSize: item.style?.fontSize || 14,
        textAlign: 'left'
      },
      position: {
        x: item.x,
        y: item.y,
        origin: 'center'
      },
      geometry: {
        width: item.width || 200,
        height: item.height || 50
      }
    };

    try {
      const response = await this.makeRequest(`/boards/${boardId}/texts`, 'POST', payload);
      return response;
    } catch (error) {
      throw this.handleApiError(error, `Failed to create text: ${item.text?.substring(0, 30)}...`);
    }
  }

  /**
   * Create shape on board
   */
  async createShape(boardId: string, item: DeliveryItem): Promise<MiroItem> {
    await this.checkRateLimit();

    const payload = {
      data: {
        content: item.text || '',
        shape: 'rectangle'
      },
      style: {
        fillColor: item.style?.backgroundColor || '#f0f0f0',
        borderColor: '#333333',
        borderWidth: 2,
        textAlign: 'center',
        textAlignVertical: 'middle'
      },
      position: {
        x: item.x,
        y: item.y,
        origin: 'center'
      },
      geometry: {
        width: item.width || 200,
        height: item.height || 100
      }
    };

    try {
      const response = await this.makeRequest(`/boards/${boardId}/shapes`, 'POST', payload);
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
   * Get board embed URL
   */
  getBoardEmbedUrl(boardId: string, options?: {
    autoplay?: boolean;
    embedMode?: 'live_embed' | 'view_only';
  }): string {
    const embedMode = options?.embedMode || 'live_embed';
    const params = new URLSearchParams();
    
    if (options?.autoplay !== undefined) {
      params.set('autoplay', options.autoplay.toString());
    }

    const paramString = params.toString();
    const queryString = paramString ? `?${paramString}` : '';

    return `https://miro.com/app/${embedMode}/${boardId}${queryString}`;
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

    try {
      const board = await this.getBoard(boardId);
      canRead = true;
      boardName = board.name;

      // Check write permissions by attempting to get items (read-only operation)
      // In a real scenario, you'd check the board's permission policy
      const collaborationAccess = board.policy?.permissionsPolicy?.collaborationToolsStartAccess;
      canWrite = collaborationAccess !== 'board_owners_and_admins';

    } catch (error) {
      const apiError = error as MiroApiError;
      
      if (apiError.status === 404) {
        errors.push('Board not found or no access');
      } else if (apiError.status === 403) {
        errors.push('Insufficient permissions to access board');
      } else if (apiError.status === 401) {
        errors.push('Authentication failed - token may be expired');
      } else {
        errors.push(`Board access validation failed: ${apiError.message}`);
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
      const response = await this.makeRequest('/oauth-token', 'GET');
      
      return {
        isValid: true,
        userInfo: {
          id: response.user?.id || '',
          name: response.user?.name || '',
          email: response.user?.email || ''
        }
      };

    } catch (error) {
      const apiError = error as MiroApiError;
      return {
        isValid: false,
        error: `Connection test failed: ${apiError.message}`
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
}