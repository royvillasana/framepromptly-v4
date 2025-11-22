/**
 * Hocuspocus WebSocket Server for Real-Time Collaboration
 *
 * This server provides Yjs-based real-time collaboration with:
 * - Supabase authentication
 * - Postgres persistence
 * - User presence tracking (Awareness)
 * - Conflict-free concurrent editing
 */

import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { createClient } from '@supabase/supabase-js';
import * as Y from 'yjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from server directory with override
dotenv.config({ path: join(__dirname, '.env'), override: true });

const PORT = process.env.PORT || 1234;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim().replace(/^["']|["']$/g, '');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, '');

console.log('📝 Environment Variables:');
console.log('  SUPABASE_URL:', SUPABASE_URL);
console.log('  ANON_KEY length:', SUPABASE_ANON_KEY?.length);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('  SUPABASE_URL:', SUPABASE_URL);
  console.error('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'exists but may be invalid' : 'missing');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Initializing Hocuspocus server...');

const server = new Server({
  port: PORT,

  // Authentication hook - Validates JWT tokens from Supabase
  async onAuthenticate(data) {
    const { token } = data;

    console.log('🔐 [Auth] Authenticating connection...');

    // If no token provided, reject connection
    if (!token) {
      console.log('❌ [Auth] No token provided - rejecting connection');
      throw new Error('Authentication required');
    }

    try {
      // Validate JWT with Supabase
      const { data: userData, error } = await supabase.auth.getUser(token);

      if (error || !userData?.user) {
        console.log('❌ [Auth] Invalid token - rejecting connection');
        throw new Error('Invalid authentication token');
      }

      console.log(`✅ [Auth] User authenticated: ${userData.user.email}`);

      // Return user context for authorization checks
      return {
        user: {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata?.full_name || userData.user.email,
        }
      };
    } catch (error) {
      console.error('❌ [Auth] Authentication error:', error.message);
      throw new Error('Authentication failed');
    }
  },

  // Database extension for persistence
  extensions: [
    new Database({
      // Fetch document from Supabase
      fetch: async ({ documentName }) => {
        console.log('📥 [DB] Fetching document:', documentName);

        try {
          const { data, error } = await supabase
            .from('projects')
            .select('yjs_state')
            .eq('id', documentName)
            .single();

          if (error) {
            console.log('⚠️  [DB] Document not found or error:', error.message);
            return null;
          }

          if (data?.yjs_state) {
            console.log('✅ [DB] Document loaded from database');
            // Convert base64 or buffer to Uint8Array
            const stateBuffer = typeof data.yjs_state === 'string'
              ? Buffer.from(data.yjs_state, 'base64')
              : Buffer.from(data.yjs_state);
            return new Uint8Array(stateBuffer);
          }

          console.log('ℹ️  [DB] No existing document state');
          return null;
        } catch (error) {
          console.error('❌ [DB] Error fetching document:', error);
          return null;
        }
      },

      // Store document to Supabase
      store: async ({ documentName, state }) => {
        console.log('💾 [DB] Storing document:', documentName);

        try {
          // Convert Uint8Array to base64 for storage
          const stateBase64 = Buffer.from(state).toString('base64');

          const { error } = await supabase
            .from('projects')
            .update({
              yjs_state: stateBase64,
              updated_at: new Date().toISOString()
            })
            .eq('id', documentName);

          if (error) {
            console.error('❌ [DB] Error storing document:', error);
            throw error;
          }

          console.log('✅ [DB] Document stored successfully');
        } catch (error) {
          console.error('❌ [DB] Error in store operation:', error);
          throw error;
        }
      },
    }),
  ],

  // Called when a client connects
  async onConnect(data) {
    const { documentName, context } = data;
    console.log(`👋 [Connect] User ${context.user?.email} connected to document: ${documentName}`);
  },

  // Called when a client disconnects
  async onDisconnect(data) {
    const { documentName, context } = data;
    console.log(`🚪 [Disconnect] User ${context.user?.email} disconnected from document: ${documentName}`);
  },

  // Called before applying an update - Authorization check
  async beforeHandleMessage(data) {
    const { documentName, context } = data;
    const userId = context.user?.id;

    console.log(`📝 [Message] Update from ${context.user?.email} to document: ${documentName}`);

    // Check if user has permission to edit this project
    try {
      // Query will fail if user doesn't have access (RLS policies will block it)
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', documentName)
        .single();

      if (error || !project) {
        console.log(`❌ [Auth] User ${context.user?.email} does not have access to project ${documentName}`);
        throw new Error('Unauthorized: You do not have permission to edit this project');
      }

      // Check if user is owner or member
      const isOwner = project.user_id === userId;

      if (!isOwner) {
        // Check if user is a member with edit permissions
        const { data: membership, error: memberError } = await supabase
          .from('project_members')
          .select('role')
          .eq('project_id', documentName)
          .eq('user_id', userId)
          .single();

        if (memberError || !membership) {
          console.log(`❌ [Auth] User ${context.user?.email} is not a member of project ${documentName}`);
          throw new Error('Unauthorized: You must be a project member to edit');
        }

        // Viewers can't edit, only owners and editors
        if (membership.role === 'viewer') {
          console.log(`❌ [Auth] User ${context.user?.email} is a viewer and cannot edit project ${documentName}`);
          throw new Error('Unauthorized: Viewers cannot edit projects');
        }
      }

      console.log(`✅ [Auth] User ${context.user?.email} authorized to edit project ${documentName}`);
    } catch (error) {
      console.error(`❌ [Auth] Authorization error:`, error.message);
      throw error;
    }
  },

  // Called when document is changed
  async onChange(data) {
    const { documentName } = data;
    console.log(`🔄 [Change] Document changed: ${documentName}`);
  },
});

server.listen();

console.log(`✅ Hocuspocus server running on port ${PORT}`);
console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
console.log('');
console.log('Features enabled:');
console.log('  ✓ Supabase JWT Authentication (ENABLED)');
console.log('  ✓ Role-based Authorization (owner/editor/viewer)');
console.log('  ✓ Postgres Persistence');
console.log('  ✓ Awareness (Presence)');
console.log('  ✓ CRDT Conflict Resolution');
console.log('');
console.log('Security:');
console.log('  ✓ RLS policies enforced on all tables');
console.log('  ✓ JWT validation for all connections');
console.log('  ✓ Project access control per message');
console.log('');
console.log('Ready for secure collaboration! 🚀');
