# Structured Prompts - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you deploy and test the new structured prompts system.

---

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed
- Supabase CLI installed
- Git repository cloned

---

## Step 1: Start Docker and Supabase (1 min)

```bash
# 1. Open Docker Desktop application
# Wait for Docker to fully start

# 2. Navigate to project directory
cd /Users/royvillasana/Desktop/Roy\ Villasana/FramePromptly/4.0/framepromptly-v4

# 3. Start Supabase local development
supabase start

# Wait for Supabase to initialize (may take 30-60 seconds)
```

Expected output:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbG...
service_role key: eyJhbG...
```

---

## Step 2: Apply Database Migration (30 seconds)

```bash
# Apply all pending migrations
supabase db reset

# Or just apply the structured prompts migration
supabase migration up
```

This will create:
- `structured_prompts` table with JSONB sections
- Auto-compilation trigger
- RLS policies
- Indexes

Verify migration:
```bash
# Check if table exists
supabase db remote commit

# Or open Supabase Studio
open http://localhost:54323
# Navigate to Table Editor → structured_prompts
```

---

## Step 3: Start Development Server (10 seconds)

```bash
# Start Vite dev server
npm run dev
```

Expected output:
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser to: **http://localhost:8080**

---

## Step 4: Test the System (3 minutes)

### Test 1: View Library (10 seconds)
1. Navigate to **http://localhost:8080/library**
2. You should see the prompt library page with empty state
3. Verify "New Prompt" button is visible

### Test 2: Create a Prompt (1 minute)

1. Click **"New Prompt"** button
2. **Step 1 - Info**:
   - Title: `My First User Persona Prompt`
   - Description: `Creates detailed user personas`
   - Tool: Select **"User Personas"** (this auto-populates sections!)
   - Click **"Next"**

3. **Step 2 - Role**:
   - Content is pre-filled from tool preset
   - Modify if desired or click **"Next"**

4. **Step 3 - Context**:
   - Review pre-filled content
   - Click **"Next"**

5. **Step 4 - Task**:
   - Review pre-filled content
   - Click **"Next"**

6. **Step 5 - Constraints**:
   - Review pre-filled content
   - Click **"Next"**

7. **Step 6 - Format**:
   - Review pre-filled content
   - Click **"Next"**

8. **Step 7 - Review**:
   - Review the compiled prompt
   - Click **"Create Prompt"**

9. You should see a success toast and be returned to the library grid

### Test 3: Edit a Prompt (1 minute)

1. In the library grid, click on the prompt card you just created
2. You should navigate to `/library/{prompt-id}` and see the editor
3. Verify you see:
   - **Left side**: 6 section cards (purple, blue, green, orange, red, yellow)
   - **Right side**: Preview panel with compiled prompt
4. Click **"Edit"** on the Role section (purple card)
5. Modify the text
6. Click **"Save"** or click outside the card
7. Verify the preview panel updates on the right

### Test 4: Search and Filter (30 seconds)

1. Click **"Back to Library"**
2. In the search bar, type part of your prompt title
3. Verify the prompt appears in results
4. Clear search
5. Use the tool filter dropdown
6. Select "User Personas"
7. Verify your prompt appears

---

## Verification Checklist

After testing, verify:

- [ ] Library page loads without errors
- [ ] Create prompt dialog opens and progresses through steps
- [ ] Tool preset auto-populates sections
- [ ] Prompt saves successfully to database
- [ ] Prompt appears in library grid
- [ ] Clicking prompt card opens editor
- [ ] Editor shows 6 section cards + preview panel
- [ ] Editing sections updates preview in real-time
- [ ] Auto-save works (check after 500ms)
- [ ] Search filters prompts correctly
- [ ] Tool filter works
- [ ] Sort options work

---

## Common Issues and Solutions

### Issue: Docker not running
**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# 1. Open Docker Desktop
# 2. Wait for it to fully start
# 3. Retry: supabase start
```

### Issue: Migration fails
**Error**: `migration failed: table already exists`

**Solution**:
```bash
# Reset database to clean state
supabase db reset

# Or drop table manually in Supabase Studio
# Then re-run migration
```

### Issue: Port already in use
**Error**: `Port 8080 is already allocated`

**Solution**:
```bash
# Find and kill process using port
lsof -ti:8080 | xargs kill -9

# Or change port in vite.config.ts
# server: { port: 3000 }
```

### Issue: Page shows 404
**Error**: Navigating to `/library` shows Not Found

**Solution**:
```bash
# Verify routing is correct in App.tsx
# Should have:
# <Route path="/library" element={<PromptLibraryPage />} />
# <Route path="/library/:promptId" element={<PromptLibraryPage />} />

# Restart dev server
npm run dev
```

### Issue: Prompts not saving
**Error**: Nothing happens when clicking "Create Prompt"

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify Supabase is running: `supabase status`
4. Check RLS policies in Supabase Studio
5. Verify user is authenticated

### Issue: Sections not auto-compiling
**Error**: Preview panel doesn't update

**Solution**:
1. Check database trigger is installed:
   ```sql
   SELECT * FROM pg_trigger
   WHERE tgname = 'compile_prompt_sections_trigger';
   ```
2. Manually trigger compilation by saving section
3. Check `compiled_prompt` column in database

---

## Database Inspection

To inspect data:

```bash
# Connect to local database
supabase db remote commit

# Or use Supabase Studio
open http://localhost:54323

# Navigate to: Table Editor → structured_prompts
```

SQL queries for inspection:
```sql
-- View all prompts
SELECT id, title, tool_name, created_at
FROM structured_prompts
ORDER BY created_at DESC;

-- View a specific prompt's sections
SELECT
  title,
  role_section->>'content' as role,
  context_section->>'content' as context,
  compiled_prompt
FROM structured_prompts
WHERE id = 'YOUR_PROMPT_ID';

-- Check compilation trigger
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'structured_prompts'::regclass;
```

---

## Next Steps After Successful Test

Once everything is working:

1. **Create More Prompts**:
   - Test different tool presets
   - Create prompts from scratch (no tool preset)
   - Test with and without examples section

2. **Test Edge Cases**:
   - Very long content in sections
   - Empty sections
   - Special characters in content
   - Multiple prompts with same name

3. **Test CRUD Operations**:
   - Duplicate prompts
   - Delete prompts
   - Toggle template status
   - Edit metadata

4. **Performance Testing**:
   - Create 50+ prompts
   - Test search performance
   - Test filter speed
   - Check pagination needs

5. **Integration**:
   - Connect to workflow canvas
   - Link to knowledge base
   - Test with project settings
   - Add to navigation menu

---

## Development Workflow

For ongoing development:

```bash
# 1. Start Supabase (once)
supabase start

# 2. Start dev server (in separate terminal)
npm run dev

# 3. Make changes to code
# Files auto-reload on save

# 4. Test changes in browser
# Check console for errors

# 5. When done:
# Stop dev server: Ctrl+C
# Stop Supabase: supabase stop
```

---

## Useful Commands

```bash
# Database
supabase status                    # Check if running
supabase db reset                  # Reset database
supabase migration list            # List migrations
supabase db diff                   # Show schema changes

# Development
npm run dev                        # Start dev server
npm run build                      # Production build
npm run lint                       # Check code quality

# Docker
docker ps                          # List running containers
docker stop $(docker ps -aq)       # Stop all containers

# Logs
supabase db logs                   # Database logs
supabase functions logs            # Edge function logs
```

---

## Support Resources

- **Technical Documentation**: `STRUCTURED_PROMPTS_README.md`
- **Deployment Guide**: `STRUCTURED_PROMPTS_DEPLOYMENT.md`
- **Implementation Summary**: `STRUCTURED_PROMPTS_SUMMARY.md`
- **UI Visual Guide**: `STRUCTURED_PROMPTS_UI_GUIDE.md`
- **This Guide**: `STRUCTURED_PROMPTS_QUICKSTART.md`

---

## Success Criteria

You'll know the system is working when:

✅ Library page loads and shows prompts grid
✅ Can create new prompts through wizard
✅ Prompts save to database
✅ Can edit sections with auto-save
✅ Preview updates in real-time
✅ Search and filters work
✅ Can duplicate and delete prompts
✅ No console errors
✅ Database trigger compiles sections

---

## Time Estimate

- **Initial Setup**: 2 minutes
- **First Test**: 3 minutes
- **Full Testing**: 10-15 minutes
- **Total**: ~20 minutes

---

## What's Next?

After successful deployment:

1. **User Testing**: Get feedback from team
2. **Bug Fixes**: Address any issues found
3. **Performance**: Optimize for larger datasets
4. **Integration**: Connect to other features
5. **Documentation**: Update user guides
6. **Migration**: Move existing prompts to new system

---

Ready to start? Begin with **Step 1** above! 🚀
