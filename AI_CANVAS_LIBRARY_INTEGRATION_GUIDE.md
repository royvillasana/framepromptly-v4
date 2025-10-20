# Canvas → Library Integration Guide

## Overview

This guide explains how AI-generated prompts from the workflow canvas are automatically saved to the Structured Prompts Library with card-based editing capabilities.

## User Workflow

### 1. Generate AI Prompt on Canvas

**Location**: Workflow Builder (`/workflow`)

1. Add a **Framework** to your canvas (e.g., "Design Thinking")
2. Add a **Stage** from that framework (e.g., "Empathize")
3. Add a **Tool** from that stage (e.g., "User Interviews")
4. Click **"Generate AI Prompt"** on the Tool node

**What Happens Behind the Scenes**:
- Tool sends request to Supabase Edge Function `generate-ai-prompt`
- AI generates a contextual prompt based on the UX methodology
- Backend **dual-saves** the prompt:
  - **Flat version** → `prompts` table (backwards compatible)
  - **Structured version** → `structured_prompts` table (6 sections)
- Returns `structured_prompt_id` to the frontend
- Prompt appears as a **PromptNode** on the canvas

### 2. Edit in Library

**Location**: PromptNode on canvas

Once the AI prompt is generated, you'll see a purple **"Edit in Library"** button on the PromptNode.

**Button Behavior**:
- ✅ **Appears**: When prompt has a `structured_prompt_id` (AI-generated prompts)
- ❌ **Hidden**: For old prompts or manually created prompts without structured versions

**Clicking "Edit in Library"**:
1. Navigates to `/library/{structured_prompt_id}`
2. Opens card-based editor with 6 sections:
   - **Role Section** (Purple) - Who is the AI
   - **Context Section** (Blue) - Background information
   - **Task Section** (Green) - What to accomplish
   - **Constraints Section** (Orange) - Limitations and rules
   - **Format Section** (Red) - Output structure
   - **Examples Section** (Yellow) - Optional reference examples

### 3. Identify Canvas-Generated Prompts

**Location**: Prompt Library (`/library`)

Canvas-generated prompts display a **blue badge** with the framework name:

```
[🔄 From Canvas: Design Thinking]
```

**Badge Logic**:
- Shows when `framework_name` field is populated (indicates AI generation)
- Blue styling (`bg-blue-50 border-blue-200 text-blue-700`)
- Helps users distinguish AI-generated vs. manually created prompts

---

## Technical Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER GENERATES PROMPT ON CANVAS                              │
│    (ToolNode → Click "Generate AI Prompt")                      │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND PROCESSING (Supabase Edge Function)                  │
│    File: supabase/functions/generate-ai-prompt/index.ts         │
│                                                                  │
│    a) Generate AI prompt using context                          │
│    b) Save to "prompts" table (flat)                            │
│    c) Parse with ai-prompt-parser.ts                            │
│    d) Save to "structured_prompts" table (6 sections)           │
│    e) Return { id, prompt, structured_prompt_id }               │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND RECEIVES RESPONSE                                   │
│    File: src/components/workflow/tool-node.tsx                  │
│                                                                  │
│    Store in prompt-store with structured_prompt_id              │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. PROMPT DISPLAYED ON CANVAS                                   │
│    File: src/components/workflow/prompt-node.tsx                │
│                                                                  │
│    Shows "Edit in Library" button (purple)                      │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. USER CLICKS "EDIT IN LIBRARY"                                │
│    Navigates to /library/{structured_prompt_id}                 │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. CARD-BASED EDITOR OPENS                                      │
│    File: src/components/prompt-library/prompt-card-editor.tsx   │
│                                                                  │
│    User edits sections individually with live preview           │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

#### `prompts` Table (Legacy/Flat)
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  project_id UUID REFERENCES projects,
  framework_name TEXT,
  stage_name TEXT,
  tool_name TEXT,
  prompt_text TEXT,           -- Flat markdown text
  variables JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `structured_prompts` Table (New/Structured)
```sql
CREATE TABLE structured_prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  project_id UUID REFERENCES projects,
  framework_name TEXT,        -- e.g., "Design Thinking"
  stage_name TEXT,           -- e.g., "Empathize"
  tool_name TEXT,            -- e.g., "User Interviews"
  title TEXT,
  description TEXT,

  -- 6 Structured Sections (JSONB)
  role_section JSONB,        -- { content, variables }
  context_section JSONB,
  task_section JSONB,
  constraints_section JSONB,
  format_section JSONB,
  examples_section JSONB,    -- Optional

  compiled_prompt TEXT,      -- Combined output
  is_library_prompt BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  run_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Key Files Modified

#### 1. **Parser Implementation**
- `src/lib/ai-prompt-parser.ts` (Frontend version, 400 lines)
- `supabase/functions/_shared/ai-prompt-parser.ts` (Deno version, 320 lines)

**Purpose**: Parse flat AI-generated prompts into 6 structured sections

**Algorithm**:
1. **Header-based extraction**: Look for markdown headers (`## Role`, `## Context`, etc.)
2. **Content-based fallback**: If headers missing, use heuristics (keywords, position)
3. **Confidence scoring**: Calculate 0-1 score indicating parsing quality
4. **Warnings**: Track missing or low-confidence sections

**Example Parsing**:
```typescript
const result = parseAIPromptToStructured(flatPrompt, "User Interviews");

// Result:
{
  role_section: {
    content: "You are a UX researcher specializing in user interviews...",
    variables: []
  },
  context_section: {
    content: "The Design Thinking Empathize stage focuses on...",
    variables: []
  },
  // ... other sections
  confidence: 0.95,
  warnings: [],
  parser_version: "1.0.0"
}
```

#### 2. **Backend Integration**
- `supabase/functions/generate-ai-prompt/index.ts`

**Dual-Save Mechanism** (lines 185-230):
```typescript
// Step 1: Save to old "prompts" table (backwards compatible)
const { data: savedPrompt } = await supabase
  .from('prompts')
  .insert({ /* ... */ })
  .select()
  .single();

// Step 2: Parse and save to "structured_prompts" table
let structuredPromptId = null;
try {
  const parseResult = parseAIPromptToStructured(processedPrompt, toolName);

  const { data: structuredPrompt } = await supabase
    .from('structured_prompts')
    .insert({
      user_id: user.id,
      framework_name: frameworkName,
      stage_name: stageName,
      tool_name: toolName,
      role_section: parseResult.role_section,
      context_section: parseResult.context_section,
      task_section: parseResult.task_section,
      constraints_section: parseResult.constraints_section,
      format_section: parseResult.format_section,
      examples_section: parseResult.examples_section,
      compiled_prompt: processedPrompt,
      is_library_prompt: true,
    })
    .select('id')
    .single();

  structuredPromptId = structuredPrompt.id;
} catch (parseError) {
  // Graceful degradation - continue with flat prompt only
  console.error('⚠️  Structured save failed, continuing with flat prompt');
}

// Return both IDs to frontend
return { id: savedPrompt.id, structured_prompt_id: structuredPromptId };
```

#### 3. **Frontend Types**
- `src/stores/prompt-store.ts`

**Added Field**:
```typescript
export interface GeneratedPrompt {
  id: string;
  structured_prompt_id?: string; // NEW: Link to structured_prompts table
  workflowId: string;
  projectId: string;
  content: string;
  // ... other fields
}
```

#### 4. **PromptNode Component**
- `src/components/workflow/prompt-node.tsx`

**Edit in Library Button** (lines 288-299):
```typescript
const handleEditInLibrary = (event: React.MouseEvent) => {
  event.stopPropagation();

  if (prompt.structured_prompt_id) {
    navigate(`/library/${prompt.structured_prompt_id}`);
    toast({
      title: "Opening in Library",
      description: "Edit your prompt with card-based sections."
    });
  } else {
    toast({
      title: "Not Available",
      description: "Only AI-generated prompts can be edited in the library.",
      variant: "destructive"
    });
  }
};

// Conditional rendering
{prompt.structured_prompt_id && (
  <Button
    size="sm"
    variant="outline"
    onClick={handleEditInLibrary}
    className="bg-purple-50 border-purple-200 text-purple-700"
  >
    <Edit3 className="w-3 h-3 mr-1" />
    Edit in Library
  </Button>
)}
```

#### 5. **Library Page**
- `src/components/prompt-library/prompt-library-page.tsx`

**Canvas Origin Badge** (lines 272-277):
```typescript
{prompt.framework_name && (
  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
    <Workflow className="w-3 h-3 mr-1" />
    From Canvas: {prompt.framework_name}
  </Badge>
)}
```

---

## Error Handling

### Graceful Degradation

The system is designed to **never break** even if parsing fails:

1. **Primary save always succeeds**: Flat prompt saved to `prompts` table
2. **Structured save wrapped in try-catch**: If parsing fails, logs warning but continues
3. **Frontend checks for `structured_prompt_id`**: Only shows "Edit in Library" if available
4. **Old prompts still work**: Legacy prompts without structured versions continue functioning

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Parsing fails completely | Saves flat prompt only, no "Edit in Library" button |
| Low confidence parse (< 0.5) | Saves both but logs warning with confidence score |
| Missing sections | Uses empty defaults, tracks in `warnings` array |
| Database connection error | Returns error to frontend, user can retry |
| Frontend navigation error | Shows error toast, stays on canvas |

### Debugging

**Backend Logs** (Check Supabase Edge Function logs):
```
✅ Successfully saved flat prompt: {id}
🔍 Parsing prompt with confidence: 0.85
✅ Successfully saved structured prompt: {id}
⚠️  Low confidence parse (0.45) - sections may be incomplete
❌ Error during parsing/saving structured prompt: {error}
```

**Frontend Console**:
```javascript
// Check if structured_prompt_id was returned
console.log(generatedPrompt.structured_prompt_id); // UUID or undefined

// Check prompt store state
import { usePromptStore } from '@/stores/prompt-store';
const { generatedPrompts } = usePromptStore();
console.log(generatedPrompts.map(p => p.structured_prompt_id));
```

---

## Testing Checklist

### Manual QA Steps

#### ✅ **Test 1: End-to-End Happy Path**
1. Open workflow builder (`/workflow`)
2. Create new project or select existing
3. Add Framework → Stage → Tool to canvas
4. Click "Generate AI Prompt" on ToolNode
5. Wait for PromptNode to appear
6. **Verify**: Purple "Edit in Library" button is visible
7. Click "Edit in Library"
8. **Verify**: Navigates to `/library/{id}`
9. **Verify**: Card-based editor opens with 6 sections populated
10. **Verify**: Each section has content (not empty)

#### ✅ **Test 2: Library Badge Display**
1. Navigate to Prompt Library (`/library`)
2. **Verify**: AI-generated prompts show blue "From Canvas: {framework}" badge
3. **Verify**: Manually created prompts do NOT show this badge
4. Filter by tool name
5. **Verify**: Filtering works correctly

#### ✅ **Test 3: Edit and Save**
1. Open AI-generated prompt in library editor
2. Edit Role section content
3. Click "Save Changes"
4. **Verify**: Success toast appears
5. Refresh page
6. **Verify**: Changes persisted
7. Check compiled preview
8. **Verify**: Preview updates with new content

#### ✅ **Test 4: Edge Case - Old Prompts**
1. Find old prompt without `structured_prompt_id` (created before integration)
2. **Verify**: "Edit in Library" button does NOT appear
3. Click prompt to view details
4. **Verify**: Old flat view still works

#### ✅ **Test 5: Error Handling**
1. Disconnect internet
2. Try generating AI prompt
3. **Verify**: Error message displays
4. Reconnect internet
5. Retry
6. **Verify**: Works correctly after reconnection

#### ✅ **Test 6: Multiple Frameworks**
Test with different frameworks to ensure parsing works across all:
- Design Thinking
- Double Diamond
- Google Design Sprint
- Lean UX
- Agile UX

#### ✅ **Test 7: Section Quality**
1. Generate prompts for 5 different tools
2. Open each in library editor
3. **Verify**: All 6 sections have meaningful content
4. Check console for confidence scores
5. **Verify**: Confidence > 0.7 for most prompts

---

## User Benefits

### Before Integration
❌ AI prompts were flat text blobs
❌ Hard to edit specific parts
❌ No reusability across projects
❌ Difficult to create variations

### After Integration
✅ **Card-based editing**: Edit sections independently
✅ **Visual organization**: Color-coded 6-section structure
✅ **Reusability**: Save as templates for future use
✅ **Version control**: Track changes with version numbers
✅ **Searchable**: Filter by framework, stage, tool
✅ **Context preservation**: See where prompts originated (canvas badge)

---

## Future Enhancements

### Planned Improvements
1. **Batch export**: Export multiple library prompts to PDF/Markdown
2. **Prompt comparison**: Compare two versions side-by-side
3. **AI re-parsing**: If user is unhappy with parsing, trigger re-parse with different algorithm
4. **Confidence threshold**: Auto-flag prompts with confidence < 0.6 for manual review
5. **Analytics**: Track which tools generate highest-quality prompts
6. **Collaboration**: Share prompts with team members
7. **Version history**: Show changelog of edits over time

### Potential Issues & Solutions
| Issue | Solution |
|-------|----------|
| Parser misidentifies section boundaries | Add manual override UI to let users re-assign content |
| Low confidence for specific tool types | Add tool-specific parsing rules |
| Examples section often empty | Enhance AI prompt templates to include examples |
| Long prompts slow down editor | Add lazy loading for large sections |

---

## Support

### Common Questions

**Q: Why doesn't my old prompt have an "Edit in Library" button?**
A: Only prompts generated after this feature was deployed have structured versions. Old prompts remain as flat text.

**Q: Can I convert an old prompt to structured format?**
A: Not yet - this is a planned feature. For now, you can copy the content and create a new structured prompt manually.

**Q: What if parsing gets a section wrong?**
A: You can edit it directly in the library editor. The card-based interface lets you fix any section independently.

**Q: Will this slow down prompt generation?**
A: No - parsing happens in the background and typically takes < 100ms. The dual-save mechanism is asynchronous.

**Q: Can I disable structured prompts and use flat text only?**
A: Yes - the system is backwards compatible. If parsing fails, it falls back to flat text automatically.

---

## Conclusion

The Canvas → Library integration seamlessly connects AI-generated workflow prompts with the structured library editor, providing users with:

- **Automatic parsing** of AI prompts into reusable 6-section cards
- **One-click navigation** from canvas to library editor
- **Visual identification** of canvas-generated prompts
- **Graceful error handling** to ensure system reliability
- **Backwards compatibility** with existing flat prompts

This integration enhances the FramePromptly workflow by making AI-generated prompts editable, reusable, and organizationally superior.
