# Hocuspocus WebSocket Server

Real-time collaboration server for FramePromptly using Yjs + Hocuspocus.

## Features

- ✅ **Yjs CRDT** - Conflict-free collaborative editing
- ✅ **Supabase Auth** - JWT authentication
- ✅ **Postgres Persistence** - Document state stored in Supabase
- ✅ **Awareness** - Real-time user presence (cursors, selections)
- ✅ **Auto-reconnection** - Handles network interruptions

## Setup

1. Copy environment variables from the main project:

```bash
cp ../.env.local .env
```

2. Install dependencies (already done):

```bash
npm install
```

3. Start the server:

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

## Environment Variables

The server uses the same Supabase credentials as the main app:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## How It Works

1. **Client connects** with Supabase JWT token
2. **Server authenticates** the token with Supabase
3. **Document loads** from `projects.yjs_state` column
4. **Changes sync** in real-time between all connected clients
5. **Document saves** automatically to database

## Port

Default: `1234`

Override with `PORT` environment variable if needed.

## Database Schema

The server requires a `yjs_state` column in the `projects` table:

```sql
ALTER TABLE public.projects
ADD COLUMN yjs_state TEXT;
```

This migration is already created in `/supabase/migrations/`.

## Production Deployment

For production, you can deploy this server to:

- **Heroku** - Simple Node.js deployment
- **Railway** - Modern platform with free tier
- **Render** - Easy WebSocket support
- **DigitalOcean App Platform** - Managed Node.js hosting
- **Your own VPS** - Run with PM2 or systemd

Make sure to:
1. Set environment variables
2. Enable WebSocket support
3. Use HTTPS/WSS in production
4. Configure CORS if needed

## Troubleshooting

### Connection Issues

Check that:
- Server is running (`npm start`)
- Client has correct `VITE_HOCUSPOCUS_URL` (default: `ws://localhost:1234`)
- Firewall allows WebSocket connections

### Authentication Failures

Verify:
- Supabase credentials are correct
- JWT token is being sent from client
- Token hasn't expired

### Document Not Persisting

Ensure:
- `yjs_state` column exists in `projects` table
- RLS policies allow updates
- Supabase credentials have write access
