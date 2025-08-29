/**
 * @fileoverview OAuth Manager for Destination Integrations
 * Handles secure OAuth flows for Miro, FigJam, and Figma integrations
 */

import { supabase } from '@/integrations/supabase/client';
import { DeliveryDestination, OAuthConnection } from '@/stores/delivery-store';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
}

export interface OAuthUserInfo {
  id: string;
  name: string;
  email: string;
  workspaces?: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Secure OAuth Manager with token encryption and refresh handling
 */
export class OAuthManager {
  private static instance: OAuthManager;
  private encryptionKey: string;
  
  // OAuth configurations for each destination
  private configs: Record<DeliveryDestination, OAuthConfig> = {
    miro: {
      clientId: import.meta.env.VITE_MIRO_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_MIRO_CLIENT_SECRET || '',
      redirectUri: `${import.meta.env.VITE_APP_URL || window.location.origin}/api/oauth/miro/callback`,
      scopes: ['boards:read', 'boards:write'],
      authUrl: 'https://miro.com/oauth/authorize',
      tokenUrl: 'https://api.miro.com/v1/oauth/token'
    },
    figjam: {
      clientId: '', // Plugin-based, no OAuth needed
      clientSecret: '',
      redirectUri: '',
      scopes: [],
      authUrl: '',
      tokenUrl: ''
    },
    figma: {
      clientId: '', // Plugin-based, no OAuth needed  
      clientSecret: '',
      redirectUri: '',
      scopes: [],
      authUrl: '',
      tokenUrl: ''
    }
  };

  static getInstance(): OAuthManager {
    if (!this.instance) {
      this.instance = new OAuthManager();
    }
    return this.instance;
  }

  private constructor() {
    this.encryptionKey = import.meta.env.VITE_OAUTH_ENCRYPTION_KEY || 'default-key-please-change';
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(destination: DeliveryDestination, state?: string): string {
    const config = this.configs[destination];
    
    if (!config.authUrl) {
      throw new Error(`OAuth not supported for ${destination}`);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state: state || this.generateState()
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(
    destination: DeliveryDestination,
    code: string,
    state?: string
  ): Promise<OAuthTokens> {
    const config = this.configs[destination];
    
    if (!config.tokenUrl) {
      throw new Error(`Token exchange not supported for ${destination}`);
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.redirectUri
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${error}`);
      }

      const tokenData = await response.json();
      
      const tokens: OAuthTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type || 'Bearer',
        expiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined
      };

      return tokens;

    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(destination: DeliveryDestination, accessToken: string): Promise<OAuthUserInfo> {
    const userInfo: Record<DeliveryDestination, () => Promise<OAuthUserInfo>> = {
      miro: () => this.getMiroUserInfo(accessToken),
      figjam: () => Promise.reject(new Error('FigJam uses plugin-based access')),
      figma: () => Promise.reject(new Error('Figma uses plugin-based access'))
    };

    return await userInfo[destination]();
  }

  /**
   * Store OAuth connection securely
   */
  async storeConnection(
    destination: DeliveryDestination,
    tokens: OAuthTokens,
    userInfo: OAuthUserInfo
  ): Promise<OAuthConnection> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Encrypt tokens before storage
      const encryptedAccessToken = await this.encryptToken(tokens.accessToken);
      const encryptedRefreshToken = tokens.refreshToken 
        ? await this.encryptToken(tokens.refreshToken)
        : undefined;

      const connection: OAuthConnection = {
        id: `${destination}-${Date.now()}`,
        destination,
        userId: user.id,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        scopes: this.configs[destination].scopes,
        expiresAt: tokens.expiresAt,
        metadata: {
          username: userInfo.name,
          workspaces: userInfo.workspaces
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in database (would need oauth_connections table)
      const { error } = await supabase
        .from('oauth_connections')
        .upsert({
          id: connection.id,
          user_id: connection.userId,
          destination: connection.destination,
          access_token_encrypted: connection.accessToken,
          refresh_token_encrypted: connection.refreshToken,
          scopes: connection.scopes,
          expires_at: connection.expiresAt?.toISOString(),
          metadata: connection.metadata,
          is_active: connection.isActive,
          created_at: connection.createdAt.toISOString(),
          updated_at: connection.updatedAt.toISOString()
        });

      if (error) throw error;

      return connection;

    } catch (error) {
      console.error('Failed to store OAuth connection:', error);
      throw new Error(`Connection storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve and decrypt stored connection
   */
  async getConnection(destination: DeliveryDestination): Promise<OAuthConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('oauth_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination', destination)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      // Decrypt tokens
      const accessToken = await this.decryptToken(data.access_token_encrypted);
      const refreshToken = data.refresh_token_encrypted
        ? await this.decryptToken(data.refresh_token_encrypted)
        : undefined;

      const connection: OAuthConnection = {
        id: data.id,
        destination: data.destination as DeliveryDestination,
        userId: data.user_id,
        accessToken,
        refreshToken,
        scopes: data.scopes || [],
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        metadata: data.metadata,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return connection;

    } catch (error) {
      console.error('Failed to retrieve OAuth connection:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(connection: OAuthConnection): Promise<OAuthConnection> {
    const config = this.configs[connection.destination];
    
    if (!config.tokenUrl || !connection.refreshToken) {
      throw new Error('Token refresh not supported');
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: connection.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData = await response.json();
      
      // Update connection with new tokens
      const encryptedAccessToken = await this.encryptToken(tokenData.access_token);
      const encryptedRefreshToken = tokenData.refresh_token 
        ? await this.encryptToken(tokenData.refresh_token)
        : connection.refreshToken;

      const updatedConnection: OAuthConnection = {
        ...connection,
        accessToken: tokenData.access_token, // Store decrypted for return
        refreshToken: tokenData.refresh_token || connection.refreshToken,
        expiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        updatedAt: new Date()
      };

      // Update database
      await supabase
        .from('oauth_connections')
        .update({
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          expires_at: updatedConnection.expiresAt?.toISOString(),
          updated_at: updatedConnection.updatedAt.toISOString()
        })
        .eq('id', connection.id);

      return updatedConnection;

    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Revoke OAuth connection
   */
  async revokeConnection(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('oauth_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

    } catch (error) {
      console.error('Failed to revoke connection:', error);
      throw new Error(`Connection revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if token is expired and needs refresh
   */
  isTokenExpired(connection: OAuthConnection): boolean {
    if (!connection.expiresAt) return false;
    
    // Consider token expired if it expires within 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return connection.expiresAt.getTime() - Date.now() < fiveMinutes;
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidAccessToken(destination: DeliveryDestination): Promise<string> {
    let connection = await this.getConnection(destination);
    
    if (!connection) {
      throw new Error(`No ${destination} connection found`);
    }

    if (this.isTokenExpired(connection)) {
      connection = await this.refreshToken(connection);
    }

    return connection.accessToken;
  }

  // Private helper methods

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async getMiroUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      const response = await fetch('https://api.miro.com/v2/oauth-token', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.user?.id || '',
        name: data.user?.name || '',
        email: data.user?.email || '',
        workspaces: data.team ? [{
          id: data.team.id,
          name: data.team.name
        }] : []
      };

    } catch (error) {
      console.error('Failed to get Miro user info:', error);
      throw error;
    }
  }

  // Token encryption methods (simplified - use proper encryption in production)
  
  private async encryptToken(token: string): Promise<string> {
    // This is a simplified encryption - use proper crypto in production
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const key = encoder.encode(this.encryptionKey.padEnd(32, '0').slice(0, 32));
    
    // Simple XOR encryption (replace with AES in production)
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ key[i % key.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }

  private async decryptToken(encryptedToken: string): Promise<string> {
    // This is a simplified decryption - use proper crypto in production
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encrypted = new Uint8Array(atob(encryptedToken).split('').map(c => c.charCodeAt(0)));
    const key = encoder.encode(this.encryptionKey.padEnd(32, '0').slice(0, 32));
    
    // Simple XOR decryption (replace with AES in production)
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }
    
    return decoder.decode(decrypted);
  }

  /**
   * Validate OAuth configuration
   */
  validateConfig(destination: DeliveryDestination): { isValid: boolean; errors: string[] } {
    const config = this.configs[destination];
    const errors: string[] = [];

    if (destination === 'miro') {
      if (!config.clientId) errors.push('Miro client ID not configured');
      if (!config.clientSecret) errors.push('Miro client secret not configured');
      if (!config.redirectUri) errors.push('Miro redirect URI not configured');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test OAuth connection
   */
  async testConnection(destination: DeliveryDestination): Promise<{ isValid: boolean; userInfo?: OAuthUserInfo; error?: string }> {
    try {
      const accessToken = await this.getValidAccessToken(destination);
      const userInfo = await this.getUserInfo(destination, accessToken);
      
      return {
        isValid: true,
        userInfo
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const oauthManager = OAuthManager.getInstance();