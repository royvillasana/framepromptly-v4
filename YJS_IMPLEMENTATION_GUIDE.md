# Yjs Real-Time Collaboration Implementation Guide

## 🎉 What's Been Implemented

### 1. **Hocuspocus WebSocket Server** ✅
- **Location**: `/server/index.js`
- **Features**:
  - Supabase JWT authentication
  - Postgres persistence (stores in `projects.yjs_state`)
  - Automatic document loading and saving
  - Awareness for user presence
  - Connection management and reconnection

### 2. **Yjs Collaboration Hook** ✅
- **Location**: `/src/hooks/use-yjs-collaboration.ts`
- **Provides**:
  - Real-time document synchronization
  - User presence tracking (cursors, selections)
  - Conflict-free concurrent editing (CRDT)
  - Methods to update nodes/edges
  - Collaborator list management

### 3. **Collaborator Display Components** ✅
- **Location**: `/src/components/workflow/collaborators-cursors.tsx`
- **Components**:
  - `CollaboratorsCursors` - Real-time cursor display (Figma-style)
  - `CollaboratorsList` - Avatar list of active users
  - `SelectionIndicators` - Shows selected nodes by others

### 4. **Database Migration** ✅
- **Location**: `/supabase/migrations/20250113000000_add_yjs_state_to_projects.sql`
- Adds `yjs_state` column to store Yjs document state

---

## 🚀 Getting Started

### Step 1: Run the Database Migration

```bash
# Apply the migration to add yjs_state column
npx supabase db push
```

### Step 2: Start the Hocuspocus Server

```bash
# Navigate to server directory
cd server

# Copy environment variables (if not done)
cp ../.env.local .env

# Start the server
npm start
```

The server will run on `ws://localhost:1234` by default.

### Step 3: Add Environment Variable (Optional)

In your `.env.local` file, add:

```
VITE_HOCUSPOCUS_URL=ws://localhost:1234
```

(This is optional as it defaults to `ws://localhost:1234`)

---

## 📝 Remaining Integration Tasks

### Task 1: Integrate Yjs into Workflow Page

You need to update `/src/pages/Workflow.tsx` to use the Yjs collaboration hook instead of the old sync mechanism.

**Changes needed**:

1. Import the hook and components:

```typescript
import { useYjsCollaboration } from '@/hooks/use-yjs-collaboration';
import {
  CollaboratorsCursors,
  CollaboratorsList,
  SelectionIndicators,
} from '@/components/workflow/collaborators-cursors';
```

2. Replace the old canvas updates hook with Yjs:

```typescript
// Remove or comment out:
// const { hasRemoteChanges, applyRemoteChanges, dismissRemoteChanges } = useCanvasUpdates(...);

// Add Yjs collaboration:
const {
  isConnected,
  isSynced,
  collaborators,
  updateCursor,
  updateSelection,
  setNodes,
  setEdges,
  getNodes,
  getEdges,
} = useYjsCollaboration({
  projectId: currentProject?.id,
  onNodesChange: (newNodes) => {
    // Update React Flow
    setNodes(newNodes);
  },
  onEdgesChange: (newEdges) => {
    // Update React Flow
    setEdges(newEdges);
  },
});
```

3. Update the save mechanism to use Yjs:

```typescript
// Instead of calling saveCanvasData directly, update Yjs document:
const handleNodesChange = useCallback((changes) => {
  // Apply changes to local state first
  const updatedNodes = applyNodeChanges(changes, nodes);

  // Sync to Yjs (which will sync to all clients)
  setNodes(updatedNodes);
}, [nodes, setNodes]);
```

4. Add cursor tracking:

```typescript
// In your canvas component or where mouse moves are tracked:
const handleMouseMove = (event) => {
  updateCursor(event.clientX, event.clientY);
};
```

5. Add collaborator UI to the canvas:

```typescript
return (
  <div className="relative w-full h-full">
    {/* Connection status indicator */}
    {isConnected && (
      <div className="absolute top-4 right-4 z-10">
        <CollaboratorsList collaborators={collaborators} />
        {isSynced && <span className="text-green-500 text-sm ml-2">● Synced</span>}
      </div>
    )}

    {/* React Flow */}
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      // ... other props
    >
      {/* Add collaborator cursors overlay */}
      <CollaboratorsCursors collaborators={collaborators} />
      <SelectionIndicators collaborators={collaborators} />
    </ReactFlow>
  </div>
);
```

### Task 2: Clean Up Old Code

Once Yjs is working, you can remove or deprecate:

1. **`/src/hooks/use-canvas-updates.ts`** - No longer needed (Yjs handles sync)
2. **`/src/hooks/use-project-presence.ts`** - Replaced by Yjs Awareness
3. **Old auto-save logic** - Yjs handles persistence automatically
4. **`canvas_data` column** - Can migrate to `yjs_state` over time

Optional: Keep these files for backward compatibility during transition.

### Task 3: Handle Selection Changes

Update node selection to notify other users:

```typescript
const handleSelectionChange = useCallback((selectedNodes) => {
  const selectedIds = selectedNodes.map(node => node.id);
  updateSelection(selectedIds);
}, [updateSelection]);
```

---

## 🧪 Testing

### Test with Multiple Users

1. Open the app in two different browsers (or incognito + regular)
2. Log in as different users
3. Open the same project
4. Try:
   - Moving nodes → Should sync instantly
   - Adding/removing nodes → Should appear for both users
   - Cursor movement → Should see each other's cursors
   - Node selection → Should see selection indicators

### What to Verify

- ✅ Nodes sync in real-time
- ✅ No conflicts when editing simultaneously
- ✅ Cursors appear with correct colors and names
- ✅ Selection indicators show when others select nodes
- ✅ Connection status updates correctly
- ✅ Reconnection works after network interruption
- ✅ Data persists when all users disconnect

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to WebSocket"

**Solution**: Make sure the Hocuspocus server is running (`cd server && npm start`)

### Issue: "Authentication failed"

**Solution**:
- Verify Supabase credentials in server `.env`
- Check that JWT token is being sent from client
- Ensure user is logged in

### Issue: "Changes not syncing"

**Solution**:
- Check browser console for errors
- Verify `isConnected` and `isSynced` are true
- Check server logs for errors
- Ensure `yjs_state` column exists in database

### Issue: "Cursors not showing"

**Solution**:
- Verify `updateCursor()` is being called on mouse move
- Check that `CollaboratorsCursors` component is rendered
- Ensure React Flow viewport is correctly transforming cursor positions

---

## 📚 Key Concepts

### CRDTs (Conflict-Free Replicated Data Types)
Yjs uses CRDTs to automatically merge concurrent changes without conflicts. This means multiple users can edit the same document simultaneously without overwriting each other's work.

### Awareness
Yjs Awareness is a separate layer for ephemeral data like cursors and selections. This data is not persisted and disappears when users disconnect.

### Document Structure
The Yjs document has two main maps:
- `nodes` - Y.Map of all React Flow nodes
- `edges` - Y.Map of all React Flow edges

### Persistence
The Hocuspocus server automatically:
1. Loads document state from `projects.yjs_state` on first connection
2. Saves updates periodically and when last user disconnects
3. Handles binary format (base64) for efficient storage

---

##  💡 Advanced Features (Future)

Once basic collaboration works, you can add:

1. **Undo/Redo** - Yjs has built-in undo manager
2. **Comments** - Add another Y.Map for comments
3. **Version History** - Store Yjs snapshots
4. **Permissions** - Read-only mode for viewers
5. **Offline Support** - Yjs handles offline edits
6. **Cursor Chat** - Add messages to awareness
7. **Follow Mode** - Auto-follow another user's viewport

---

## 🎯 Summary

**Completed**:
- ✅ Hocuspocus server with Supabase integration
- ✅ Yjs collaboration hook
- ✅ Presence/cursor components
- ✅ Database migration

**To Do**:
- 🔲 Integrate Yjs hook into Workflow page
- 🔲 Update React Flow handlers to use Yjs
- 🔲 Add collaborator UI to canvas
- 🔲 Clean up old sync code
- 🔲 Test with multiple users

**Estimated Time**: 2-4 hours for integration + testing

---

## 📞 Support

For questions about the implementation, refer to:
- [Yjs Documentation](https://docs.yjs.dev/)
- [Hocuspocus Documentation](https://tiptap.dev/hocuspocus)
- [React Flow Documentation](https://reactflow.dev/)
- The research document provided (REALTIME_COLLABORATION_RESEARCH.md)
