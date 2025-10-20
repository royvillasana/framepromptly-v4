# Structured Prompts System - Deployment Guide

## Overview

The structured prompts system has been fully implemented with card-based editing, allowing users to create and manage prompts with 6 distinct sections (Role, Context, Task, Constraints, Format, Examples).

## What's Been Completed

### Phase 1: Database Foundation ✅
- Database migration file created
- TypeScript types defined
- Helper functions implemented
- Zustand store created

### Phase 2: UI Components ✅
- PromptSectionCard component (265 lines)
- PromptPreviewPanel component (185 lines)
- StructuredPromptStore (380 lines)
- PromptCardEditor component (430 lines)
- CreatePromptDialog component (540 lines)
- PromptLibraryPage component (340 lines)

### Phase 3: Integration ✅
- Routing configured in App.tsx
- New routes: `/library` (grid view) and `/library/:promptId` (editor view)
- Old library preserved at `/library-old`

## Deployment Steps

### Step 1: Start Docker and Supabase

```bash
# 1. Start Docker Desktop
# (Open Docker Desktop application)

# 2. Start Supabase local development
cd /Users/royvillasana/Desktop/Roy\ Villasana/FramePromptly/4.0/framepromptly-v4
supabase start
```

### Step 2: Apply Database Migration

```bash
# Apply the structured_prompts migration
supabase db reset

# Or apply specific migration
supabase migration up
```

The migration file is located at:
`supabase/migrations/20250113000000_create_structured_prompts_table.sql`

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Step 4: Test the System

#### 4.1 Test Library Grid View
1. Navigate to `http://localhost:8080/library`
2. Verify you see the prompt library grid interface
3. Click "New Prompt" button to test dialog opening

#### 4.2 Test Prompt Creation
1. Click "New Prompt" button
2. Fill in the Info step (title, description, tool selection)
3. Progress through the 7 steps:
   - Info
   - Role
   - Context
   - Task
   - Constraints
   - Format
   - Review
4. Click "Create Prompt" to save
5. Verify prompt appears in grid

#### 4.3 Test Prompt Editor
1. Click on any prompt card in the grid
2. Verify editor opens with all 6 section cards on the left
3. Verify preview panel on the right shows compiled prompt
4. Test editing a section:
   - Click edit button on a card
   - Modify the content
   - Verify auto-save works
   - Check preview panel updates
5. Test metadata editing:
   - Click "Edit Info" button
   - Modify title, description, or tool
   - Save changes
6. Test other actions:
   - Duplicate prompt
   - Toggle template status
   - Delete prompt

#### 4.4 Test Search and Filters
1. Use search bar to find prompts by title/description
2. Filter by tool name
3. Sort by different criteria (recently updated, created, most used)

## Database Schema

The new `structured_prompts` table includes:

```sql
CREATE TABLE public.structured_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT,

  -- Metadata
  framework_name TEXT,
  stage_name TEXT,
  tool_name TEXT,

  -- Structured sections (JSONB)
  role_section JSONB NOT NULL,
  context_section JSONB NOT NULL,
  task_section JSONB NOT NULL,
  constraints_section JSONB NOT NULL,
  format_section JSONB NOT NULL,
  examples_section JSONB,

  -- Auto-compiled prompt
  compiled_prompt TEXT NOT NULL,

  -- Metadata
  is_template BOOLEAN DEFAULT FALSE,
  run_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  parent_prompt_id UUID REFERENCES public.structured_prompts(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Features

### Card-Based Editing
Each prompt is broken into 6 independently editable cards:
- **Role** (Purple): AI's role and expertise
- **Context** (Blue): Project and domain context
- **Task** (Green): Specific objectives
- **Constraints** (Orange): Quality standards and limitations
- **Format** (Red): Output structure requirements
- **Examples** (Yellow): Optional reference examples

### Auto-Compilation
A PostgreSQL trigger automatically compiles all sections into a full prompt text when any section is updated.

### Version Control
Prompts can be duplicated with `parent_prompt_id` linking to create version history.

### Template System
Prompts can be marked as templates for reuse across projects.

### Tool Presets
When creating a new prompt, selecting a tool auto-populates sections with sensible defaults.

## File Structure

```
src/
├── components/
│   └── prompt-library/
│       ├── prompt-section-card.tsx          # Individual section card
│       ├── prompt-preview-panel.tsx         # Compiled preview
│       ├── prompt-card-editor.tsx           # Full editor interface
│       ├── create-prompt-dialog.tsx         # Multi-step wizard
│       └── prompt-library-page.tsx          # Main library page
├── stores/
│   └── structured-prompt-store.ts           # State management
├── types/
│   └── structured-prompt.ts                 # TypeScript types
└── lib/
    └── structured-prompt-helpers.ts         # Helper functions

supabase/
└── migrations/
    └── 20250113000000_create_structured_prompts_table.sql
```

## Troubleshooting

### Migration Fails
If the migration fails:
1. Check if Docker is running
2. Verify Supabase is started: `supabase status`
3. Check for syntax errors in migration file
4. Try: `supabase db reset --debug`

### Prompts Not Appearing
1. Check browser console for errors
2. Verify RLS policies allow access
3. Check user authentication status
4. Verify `user_id` matches authenticated user

### Auto-Save Not Working
1. Check network tab for API calls
2. Verify database trigger is installed
3. Check console for store errors
4. Ensure debounce timing is appropriate

### Compilation Not Updating
1. The PostgreSQL trigger should auto-compile
2. If not, check trigger installation
3. Manually trigger: call `updateSection()` in store
4. Check `compiled_prompt` column updates

## Next Steps

After successful deployment and testing:

1. **Migration Strategy**: Create a script to migrate existing flat prompts to structured format
2. **Integration**: Connect structured prompts to workflow canvas nodes
3. **AI Generation**: Update AI prompt generation to create structured prompts
4. **Collaboration**: Add real-time multi-user editing
5. **Export/Import**: Add JSON export/import functionality
6. **Analytics**: Track prompt usage and effectiveness

## Support

For issues or questions:
1. Check this guide first
2. Review console logs and network tab
3. Check database logs: `supabase db logs`
4. Verify migration status: `supabase migration list`

## Notes

- The old library remains at `/library-old` for backward compatibility
- Tool presets are defined in `createDefaultSections()` helper
- Section colors and icons are hardcoded in type definitions
- Auto-save debounce is set to 500ms for sections
- Preview panel updates in real-time as sections are edited
