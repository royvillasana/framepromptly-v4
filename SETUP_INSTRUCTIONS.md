# Yjs Real-Time Collaboration - Final Setup Steps

## ✅ What's Already Done

I've successfully integrated Yjs real-time collaboration into your React Flow canvas:

1. **✅ Hocuspocus Server Created** - [server/index.js](server/index.js)
   - WebSocket server with Supabase authentication
   - Database persistence to `projects.yjs_state`
   - Awareness for user presence

2. **✅ Yjs React Hook** - [src/hooks/use-yjs-collaboration.ts](src/hooks/use-yjs-collaboration.ts)
   - Document synchronization
   - Cursor and selection tracking
   - Real-time updates

3. **✅ Collaborator UI Components** - [src/components/workflow/collaborators-cursors.tsx](src/components/workflow/collaborators-cursors.tsx)
   - Figma-style live cursors
   - Selection indicators
   - Avatar display

4. **✅ WorkflowCanvas Integration**
   - Removed old `useCanvasUpdates` hook
   - Integrated Yjs collaboration
   - Added cursor tracking on mouse move
   - Added selection synchronization
   - Connection status indicator

5. **✅ Server Environment Setup**
   - Created `server/.env` file
   - Installed server dependencies

---

## 🔧 What You Need to Do

### Step 1: Configure Supabase Credentials

Your `.env.local` currently has placeholder values. You need to add your actual Supabase credentials.

**Edit both files**:
1. `/.env.local` (root directory)
2. `/server/.env` (server directory)

**Replace placeholder values with your actual Supabase credentials:**

```bash
# .env.local and server/.env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Where to find your Supabase credentials:**
1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

### Step 2: Add yjs_state Column to Database

Due to migration conflicts with older migrations, you need to manually add the `yjs_state` column.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to **Database** > **SQL Editor**
4. Run this SQL:

```sql
-- Add yjs_state column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS yjs_state TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.projects.yjs_state IS 'Base64-encoded Yjs document state for real-time collaboration';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_yjs_state_not_null
ON public.projects (id)
WHERE yjs_state IS NOT NULL;
```

5. Click **Run**

**Option B: Using Table Editor**

1. Go to **Database** > **Tables** > `projects`
2. Click **Add Column**
3. Name: `yjs_state`
4. Type: `text`
5. Click **Save**

---

### Step 3: Start the Hocuspocus Server

Once you've configured the Supabase credentials:

```bash
cd server
npm start
```

**Expected Output:**
```
> hocuspocus-server@1.0.0 start
> node index.js

Hocuspocus server listening on port 1234
```

**Note**: Keep this running in a separate terminal window while testing.

---

### Step 4: Test Real-Time Collaboration

1. **Open the app in your main browser:**
   - Go to http://localhost:8081/ (or your dev server URL)
   - Log in and create/open a project

2. **Open in a second browser (incognito or different browser):**
   - Go to the same URL
   - Log in (can be same or different user)
   - Open the SAME project

3. **Test Features:**

   ✅ **Node Movement**:
   - Move a node in Browser 1
   - Should see it move instantly in Browser 2

   ✅ **Live Cursors**:
   - Move your mouse in Browser 1
   - Should see your cursor appear in Browser 2 with your name

   ✅ **Selection Indicators**:
   - Select a node in Browser 1
   - Should see a colored border in Browser 2

   ✅ **Add/Delete Nodes**:
   - Add a framework/stage/tool in Browser 1
   - Should appear immediately in Browser 2

   ✅ **Connection Status**:
   - Look for "Synced" indicator in top-left
   - Should show number of collaborators

   ✅ **Persistence**:
   - Make changes, close both browsers
   - Reopen - changes should be saved

---

## 🎯 Expected Behavior

### When Connected:
- Top-left corner shows: `● Synced · X collaborators`
- Other users' cursors appear with their names
- Selected nodes show colored borders indicating who's editing
- All changes sync instantly (< 100ms)

### Console Logs to Watch For:

**Client (Browser Console):**
```
🚀 [Yjs] Initializing collaboration for project: <project-id>
✅ [Yjs] Connected to Hocuspocus
🔄 [Yjs] Document synced
📥 [Yjs] Initial nodes: X
📤 [Yjs] Syncing nodes to Yjs: X
```

**Server (Terminal):**
```
Hocuspocus server listening on port 1234
✅ User authenticated: <user-id>
📄 Loading document: <project-id>
💾 Saving document: <project-id>
```

---

## 🐛 Troubleshooting

### Issue: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**Solution**: You haven't configured Supabase credentials yet.
- Edit `.env.local` and `server/.env`
- Add your actual Supabase URL and anon key

---

### Issue: Server won't start / Authentication errors

**Solution**:
1. Verify Supabase credentials are correct
2. Make sure both `.env.local` AND `server/.env` have the same values
3. Restart the server after updating `.env`

---

###Issue: "Cannot connect to WebSocket"

**Check**:
1. Is Hocuspocus server running? (`cd server && npm start`)
2. Check browser console for connection errors
3. Verify server is listening on port 1234

---

### Issue: Changes not syncing between users

**Check**:
1. Both users on the same project?
2. Both browser consoles show "Synced" status?
3. Server logs show both users connected?
4. `yjs_state` column exists in database?

---

### Issue: "Column yjs_state does not exist"

**Solution**: You skipped Step 2. Run the SQL in Supabase dashboard to add the column.

---

## 📁 File Structure

```
framepromptly-v4/
├── server/
│   ├── index.js              # Hocuspocus WebSocket server
│   ├── package.json          # Server dependencies
│   ├── .env                  # ⚠️ NEEDS YOUR SUPABASE CREDENTIALS
│   └── README.md             # Server documentation
│
├── src/
│   ├── hooks/
│   │   └── use-yjs-collaboration.ts  # Yjs React hook
│   ├── components/
│   │   └── workflow/
│   │       ├── workflow-canvas.tsx        # Integrated with Yjs
│   │       └── collaborators-cursors.tsx  # Figma-style UI
│   └── pages/
│       └── Workflow.tsx      # Updated to use Yjs
│
├── supabase/
│   └── migrations/
│       └── 20250113000001_add_yjs_state_to_projects.sql
│
├── .env.local                # ⚠️ NEEDS YOUR SUPABASE CREDENTIALS
├── YJS_IMPLEMENTATION_GUIDE.md
├── YJS_INTEGRATION_COMPLETE.md
└── SETUP_INSTRUCTIONS.md     # ← You are here
```

---

## 🎨 UI Elements Added

### Connection Status (Top-Left Corner)
```
● Synced · 2 collaborators
```
- Green dot = synced
- Yellow dot = syncing
- Shows collaborator count

### Live Cursors
- Figma-style cursor pointers
- User name displayed next to cursor
- Each user has a unique color

### Selection Indicators
- Colored border around selected nodes
- User name badge shows who's selecting
- Different color for each collaborator

---

## ✨ Features Enabled

✅ **Real-time synchronization** - Instant updates across all users
✅ **Conflict-free editing** - Yjs CRDT handles concurrent changes
✅ **Live cursors** - See where others are working
✅ **Selection tracking** - Know who's editing what
✅ **Automatic persistence** - Changes saved to database
✅ **Auto-reconnection** - Handles network interruptions
✅ **Offline support** - Yjs queues changes when offline

---

## 🚀 Quick Start Checklist

- [ ] Configure Supabase credentials in `.env.local` and `server/.env`
- [ ] Add `yjs_state` column to database (run SQL in Supabase dashboard)
- [ ] Start Hocuspocus server (`cd server && npm start`)
- [ ] Open app in two browsers
- [ ] Open same project in both browsers
- [ ] Test: move nodes, see cursors, watch changes sync

**Estimated Time**: 10-15 minutes

---

## 📚 Documentation

- **Implementation Details**: [YJS_INTEGRATION_COMPLETE.md](YJS_INTEGRATION_COMPLETE.md)
- **Original Implementation Guide**: [YJS_IMPLEMENTATION_GUIDE.md](YJS_IMPLEMENTATION_GUIDE.md)
- **Server Documentation**: [server/README.md](server/README.md)

---

## 💡 Tips

1. **Testing with one user**: Open same browser in normal + incognito mode
2. **Debugging**: Check both browser console AND server terminal for logs
3. **Performance**: Cursor updates throttled to prevent excessive network traffic
4. **Security**: Supabase JWT authentication ensures only authorized users can edit

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Top-left shows "Synced" with green dot
- ✅ You see other user's cursor moving around
- ✅ Changes appear instantly in both browsers
- ✅ Selected nodes show colored borders
- ✅ Server logs show both users connected

---

## ⚡ Next Steps After Setup

Once basic collaboration is working, you can add advanced features:

1. **Undo/Redo** - Yjs has built-in `Y.UndoManager`
2. **Comments** - Add another Y.Map for node comments
3. **Version History** - Store Yjs snapshots for time travel
4. **Permissions** - Read-only mode for viewers
5. **Cursor Chat** - Add messages to awareness state
6. **Follow Mode** - Auto-follow another user's viewport
7. **Activity Feed** - Show who changed what and when

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review console logs (browser + server)
3. Verify Supabase credentials are correct
4. Ensure `yjs_state` column exists
5. Confirm server is running on port 1234

**Common Gotchas:**
- Forgot to configure `.env` files ← Most common!
- Didn't add `yjs_state` column to database
- Server not running
- Opening same browser window instead of two different windows/browsers

---

**You're almost there! Just complete the 4 steps above and you'll have Figma-like real-time collaboration working! 🚀**
