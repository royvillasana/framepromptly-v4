# Structured Prompts System - Phase 1 Complete

## Overview

The Structured Prompts system enables card-based editing of AI prompts in the library. Prompts are stored as structured sections (Role, Context, Task, Constraints, Format, Examples) rather than flat text.

---

## What's Been Built (Phase 1)

### ✅ Database Schema

**File:** `supabase/migrations/20250113000000_create_structured_prompts_table.sql`

**Table:** `structured_prompts`

#### Columns:
- `id` - UUID primary key
- `user_id` - References auth.users (RLS enabled)
- `project_id` - Optional reference to projects
- `title` - Prompt name (required)
- `description` - Optional description
- `framework_name`, `stage_name`, `tool_name` - Metadata
- `is_template` - True for reusable templates
- `is_library_prompt` - True for library visibility
- **`role_section`** - JSONB: AI Role & Expertise
- **`context_section`** - JSONB: Project Context
- **`task_section`** - JSONB: Specific Task
- **`constraints_section`** - JSONB: Quality & Constraints
- **`format_section`** - JSONB: Output Format
- **`examples_section`** - JSONB: Examples (optional)
- `compiled_prompt` - Full prompt text (auto-generated)
- `last_run_at`, `run_count` - Execution tracking
- `version`, `parent_prompt_id` - Version control
- `created_at`, `updated_at` - Timestamps

#### Features:
- **Row Level Security (RLS)**: Users can only access their own prompts
- **Auto-compilation**: Trigger automatically compiles sections into `compiled_prompt`
- **Indexes**: Optimized queries for user_id, project_id, tool_name, created_at
- **Version Control**: Parent/child relationships for prompt versions

#### Helper Functions:
- `compile_structured_prompt()` - Compiles sections into full prompt text
- `auto_compile_structured_prompt()` - Trigger function for auto-compilation

---

### ✅ TypeScript Types

**File:** `src/types/structured-prompt.ts`

#### Key Types:

**`PromptSection`** - Individual section structure:
```typescript
{
  id: string;
  type: 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples';
  title: string;
  content: string;
  icon: 'Brain' | 'User' | 'Target' | 'Settings' | 'FileText' | 'Lightbulb';
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  isExpanded: boolean;
  isEditable: boolean;
  order?: number;
}
```

**`StructuredPrompt`** - Complete prompt:
```typescript
{
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;

  // Sections
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;

  // Compiled
  compiled_prompt: string;

  // Metadata
  framework_name: string | null;
  stage_name: string | null;
  tool_name: string | null;
  is_template: boolean;
  is_library_prompt: boolean;

  // Tracking
  last_run_at: string | null;
  run_count: number;
  version: number;
  parent_prompt_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}
```

**`CreateStructuredPromptInput`** - For creating new prompts

**`UpdateStructuredPromptInput`** - For updating prompts

**`DEFAULT_SECTION_CONFIG`** - Default configuration for each section type

---

### ✅ Helper Functions

**File:** `src/lib/structured-prompt-helpers.ts`

#### Key Functions:

**Section Creation:**
- `createSection(type, content, partial?)` - Create a complete section with defaults
- `createDefaultSections(toolName?)` - Generate all 6 default sections

**Compilation:**
- `compileSectionsToPrompt(sections)` - Compile sections into full prompt string
- `parsePromptIntoSections(text)` - Parse flat prompt into sections (for migration)

**Validation:**
- `validateSection(section)` - Validate individual section
- `validateStructuredPrompt(input)` - Validate complete prompt input

**Variables:**
- `extractPromptVariables(content)` - Find {{variable}} patterns
- `replacePromptVariables(content, vars)` - Replace variables with values

**Versioning:**
- `createPromptVersion(original, title?)` - Create a new version/fork

**Utilities:**
- `getSection(prompt, type)` - Get section by type
- `countWords(content)` - Word count
- `estimateReadingTime(content)` - Reading time estimate

---

## Section Structure Details

### Section Types & Defaults

| Type | Title | Icon | Color | Order |
|------|-------|------|-------|-------|
| **role** | AI Role & Expertise | Brain | Purple | 1 |
| **context** | Project Context | User | Blue | 2 |
| **task** | Specific Task | Target | Green | 3 |
| **constraints** | Quality & Constraints | Settings | Orange | 4 |
| **format** | Output Format | FileText | Red | 5 |
| **examples** | Examples & Guidance | Lightbulb | Yellow | 6 |

### Example Section JSON

```json
{
  "id": "role-1234567890-abc123",
  "type": "role",
  "title": "AI Role & Expertise",
  "content": "You are a senior UX researcher with 15+ years...",
  "icon": "Brain",
  "color": "purple",
  "isExpanded": true,
  "isEditable": true,
  "order": 1
}
```

---

## How To Use

### 1. Create a New Structured Prompt

```typescript
import { createDefaultSections, compileSectionsToPrompt } from '@/lib/structured-prompt-helpers';
import { supabase } from '@/integrations/supabase/client';

// Create default sections
const sections = createDefaultSections('User Personas');

// Customize content
sections.task_section.content = "Create 3 evidence-based personas...";

// Compile (optional - database trigger does this automatically)
const compiled = compileSectionsToPrompt(sections);

// Insert into database
const { data, error } = await supabase
  .from('structured_prompts')
  .insert({
    title: 'User Personas - FlowPay',
    description: 'Persona generation for payment app',
    tool_name: 'User Personas',
    ...sections,
    compiled_prompt: compiled, // Optional
  })
  .select()
  .single();
```

### 2. Update a Section

```typescript
const { error } = await supabase
  .from('structured_prompts')
  .update({
    role_section: {
      ...existingPrompt.role_section,
      content: 'Updated role description...',
    }
  })
  .eq('id', promptId);

// compiled_prompt will auto-update via trigger
```

### 3. Query Library Prompts

```typescript
const { data: prompts } = await supabase
  .from('structured_prompts')
  .select('*')
  .eq('is_library_prompt', true)
  .order('created_at', { ascending: false });
```

### 4. Parse Existing Flat Prompt

```typescript
import { parsePromptIntoSections } from '@/lib/structured-prompt-helpers';

const flatPrompt = "# AI Expert\n\nYou are...\n\n---\n\n## Project Context...";
const sections = parsePromptIntoSections(flatPrompt);

// Now save as structured prompt
```

---

## Migration Strategy

### For Existing Prompts

**Option 1: On-Demand Migration** (Recommended)
- Keep existing `prompts` table as-is
- When user edits a prompt, convert it to structured format
- Store in `structured_prompts` table
- Mark as migrated to avoid double-processing

**Option 2: Batch Migration**
- Run migration script to convert all existing prompts
- Parse flat text into sections
- Bulk insert into `structured_prompts`

### Example Migration Code

```typescript
async function migratePromptToStructured(legacyPromptId: string) {
  // Fetch legacy prompt
  const { data: legacy } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', legacyPromptId)
    .single();

  // Parse into sections
  const sections = parsePromptIntoSections(legacy.prompt_content);

  // Create structured version
  const { data: structured } = await supabase
    .from('structured_prompts')
    .insert({
      title: `${legacy.tool_name} - Migrated`,
      description: `Migrated from legacy prompt`,
      framework_name: legacy.framework_name,
      stage_name: legacy.stage_name,
      tool_name: legacy.tool_name,
      project_id: legacy.project_id,
      ...sections,
    })
    .select()
    .single();

  return structured;
}
```

---

## Next Steps (Phase 2)

### UI Components to Build:

1. **`PromptSectionCard.tsx`** - Individual editable section card
2. **`PromptCardEditor.tsx`** - Full editor with all 6 cards
3. **`PromptPreviewPanel.tsx`** - Read-only compiled preview
4. **`CreatePromptDialog.tsx`** - Wizard for creating new prompts
5. **`PromptLibraryPage.tsx`** - Main library page with grid view

### Store to Build:

**`structured-prompt-store.ts`** - Zustand store for:
- Fetching library prompts
- Creating/updating/deleting prompts
- Updating individual sections
- Compiling prompts
- Versioning/forking

### Integration Points:

- **Tool Node**: Save generated prompts as structured format
- **Prompt Builder**: Use structured sections instead of flat text
- **Library Page**: Display and edit prompts as cards

---

## Database Schema Diagram

```
┌────────────────────────────────────┐
│     structured_prompts             │
├────────────────────────────────────┤
│ id (PK)                            │
│ user_id (FK → auth.users)         │
│ project_id (FK → projects)        │
│ title                              │
│ description                        │
│                                    │
│ ┌─── Structured Sections ───┐    │
│ │ role_section (JSONB)      │    │
│ │ context_section (JSONB)   │    │
│ │ task_section (JSONB)      │    │
│ │ constraints_section (JSONB)│   │
│ │ format_section (JSONB)    │    │
│ │ examples_section (JSONB)  │    │
│ └───────────────────────────┘    │
│                                    │
│ compiled_prompt (TEXT)            │
│                                    │
│ framework_name, stage_name        │
│ tool_name                         │
│ is_template, is_library_prompt   │
│ run_count, last_run_at            │
│ version, parent_prompt_id         │
│ created_at, updated_at            │
└────────────────────────────────────┘
```

---

## Testing the Migration

### 1. Apply Migration

```bash
# If using Supabase CLI
supabase db push

# Or apply via Supabase Dashboard:
# Project > Database > Migrations > New Migration
# Copy/paste the SQL file contents
```

### 2. Verify Tables

```sql
-- Check table exists
SELECT * FROM structured_prompts LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'structured_prompts';

-- Test compilation function
SELECT compile_structured_prompt(
  '{"content": "You are..."}'::jsonb,
  '{"content": "Context..."}'::jsonb,
  '{"content": "Task..."}'::jsonb,
  '{"content": "Constraints..."}'::jsonb,
  '{"content": "Format..."}'::jsonb,
  NULL
);
```

### 3. Test CRUD Operations

```typescript
// Create
const { data: newPrompt } = await supabase
  .from('structured_prompts')
  .insert({ title: 'Test', ...sections })
  .select()
  .single();

// Read
const { data: prompts } = await supabase
  .from('structured_prompts')
  .select('*');

// Update
await supabase
  .from('structured_prompts')
  .update({ title: 'Updated' })
  .eq('id', promptId);

// Delete
await supabase
  .from('structured_prompts')
  .delete()
  .eq('id', promptId);
```

---

## Summary

✅ **Database schema created** with structured sections and auto-compilation
✅ **TypeScript types defined** for type-safe development
✅ **Helper functions built** for section management and validation
✅ **RLS policies configured** for secure multi-tenant access
✅ **Version control supported** with parent/child relationships
✅ **Migration path planned** for existing flat prompts

**Ready for Phase 2:** UI component development and store implementation.
