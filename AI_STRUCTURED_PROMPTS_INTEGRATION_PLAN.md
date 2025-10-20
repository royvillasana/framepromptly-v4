# AI-to-Structured Prompts Integration Plan

## 📋 Executive Summary

**Goal**: Automatically save AI-generated prompts from the workflow canvas as structured prompts in the new library system, enabling card-based editing and reuse.

**Current State**:
- AI prompts are generated in `ToolNode` → sent to Supabase function → saved to flat `prompts` table
- Structured prompts system exists but is separate from AI generation flow

**Desired State**:
- AI prompts automatically parsed into 6 sections and saved as structured prompts
- Users can edit AI-generated prompts using the card-based interface
- Seamless integration between canvas workflow and library

---

## 🔍 Current Architecture Analysis

### How AI Prompt Generation Works Now

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Generate Prompt" on ToolNode                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ToolNode.handleGeneratePrompt()                              │
│    - Gets knowledge context                                      │
│    - Gets project settings                                       │
│    - Calls generatePrompt() from prompt-store                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. prompt-store.generatePrompt()                                │
│    - Builds prompt from template                                 │
│    - Uses dynamic-prompt-builder for project customization       │
│    - Returns complete prompt text                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Supabase Function: generate-ai-prompt                        │
│    - Receives: promptContent, variables, project info           │
│    - Processes variables                                         │
│    - Saves to "prompts" table (flat text)                       │
│    - Returns: { id, prompt, aiResponse }                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. ToolNode creates PromptNode on canvas                        │
│    - Displays prompt in workflow                                 │
│    - Can view/copy but NOT edit in structured way               │
└─────────────────────────────────────────────────────────────────┘
```

### Current Database Schema

**Old Table: `prompts`** (flat text)
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  project_id UUID,
  user_id UUID,
  framework_name TEXT,
  stage_name TEXT,
  tool_name TEXT,
  prompt_content TEXT,        -- Full flat text
  ai_response TEXT,
  variables JSONB,
  created_at TIMESTAMPTZ
);
```

**New Table: `structured_prompts`** (card-based)
```sql
CREATE TABLE structured_prompts (
  id UUID PRIMARY KEY,
  project_id UUID,
  user_id UUID,
  framework_name TEXT,
  stage_name TEXT,
  tool_name TEXT,

  -- 6 structured sections
  role_section JSONB,
  context_section JSONB,
  task_section JSONB,
  constraints_section JSONB,
  format_section JSONB,
  examples_section JSONB,

  compiled_prompt TEXT,       -- Auto-compiled from sections

  created_at TIMESTAMPTZ
);
```

---

## 🎯 Integration Strategy

### Option A: Parse After Generation (Recommended)

**Pros**:
- Minimal changes to existing code
- Works with current prompt templates
- Easy to test and debug
- Backwards compatible

**Cons**:
- Requires parsing logic to extract sections
- May not be 100% accurate if templates vary

**Flow**:
```
AI Generation → Parse into sections → Save as structured → Display in library
```

### Option B: Generate Structured from Start

**Pros**:
- More accurate section division
- No parsing needed

**Cons**:
- Major refactoring of template system
- Breaking change to existing flow
- Complex migration

**Decision**: **Option A** - Parse after generation for easier implementation

---

## 📐 Detailed Implementation Plan

### Phase 1: Parser Implementation

**File**: `src/lib/ai-prompt-parser.ts`

Create a parser that extracts 6 sections from AI-generated flat prompts:

```typescript
interface ParsedPrompt {
  role_section: PromptSection;
  context_section: PromptSection;
  task_section: PromptSection;
  constraints_section: PromptSection;
  format_section: PromptSection;
  examples_section: PromptSection | null;
}

export function parseAIPromptToStructured(
  flatPromptText: string,
  toolName: string
): ParsedPrompt {
  // Parse sections based on markdown headers
  // # Role & Expertise → role_section
  // ## Project Context → context_section
  // ## Specific Task → task_section
  // ## Quality Standards & Constraints → constraints_section
  // ## Output Format → format_section
  // ## Examples (optional) → examples_section
}
```

**Parsing Strategy**:
1. Split by markdown headers (`#`, `##`)
2. Map headers to section types
3. Extract content between headers
4. Create PromptSection objects with proper metadata

**Edge Cases**:
- Missing sections → Use sensible defaults
- Extra content → Map to most appropriate section
- No headers → Use heuristics (first paragraph = role, etc.)

---

### Phase 2: Supabase Function Update

**File**: `supabase/functions/generate-ai-prompt/index.ts`

Add structured prompt saving alongside flat prompt:

```typescript
// After saving to "prompts" table (keep for backwards compatibility)
if (!isStressTest && user) {
  // 1. Save to old prompts table (existing code)
  const { data: savedPrompt } = await supabase
    .from('prompts')
    .insert({ /* existing fields */ })
    .select()
    .single();

  // 2. NEW: Parse and save to structured_prompts table
  const parsedSections = parseAIPromptToStructured(
    processedPrompt,
    toolName
  );

  const { data: structuredPrompt } = await supabase
    .from('structured_prompts')
    .insert({
      user_id: user.id,
      project_id: projectId,
      framework_name: frameworkName,
      stage_name: stageName,
      tool_name: toolName,
      title: `${toolName} Prompt`,
      description: `AI-generated prompt for ${toolName}`,
      ...parsedSections,  // role_section, context_section, etc.
      compiled_prompt: processedPrompt,
      is_library_prompt: true
    })
    .select()
    .single();

  // 3. Return both IDs
  promptData = {
    ...savedPrompt,
    structured_prompt_id: structuredPrompt.id
  };
}
```

---

### Phase 3: Frontend Integration

#### 3.1 Update ToolNode to Link Structured Prompts

**File**: `src/components/workflow/tool-node.tsx`

```typescript
// After AI generation completes
const generatedPrompt = {
  id: data.id,
  structured_prompt_id: data.structured_prompt_id, // NEW
  workflowId: `workflow-${framework.id}-${stage.id}-${tool.id}`,
  projectId: currentProject.id,
  content: data.prompt,
  context: { framework, stage, tool },
  variables: {},
  timestamp: Date.now(),
  output: data.aiResponse
};
```

#### 3.2 Add "Edit in Library" Button to PromptNode

**File**: `src/components/workflow/prompt-node.tsx`

```typescript
// Add new action button
<Button
  variant="outline"
  size="sm"
  onClick={() => handleEditInLibrary()}
  className="flex items-center gap-2"
>
  <Edit className="w-4 h-4" />
  Edit in Library
</Button>

const handleEditInLibrary = () => {
  if (prompt.structured_prompt_id) {
    // Navigate to library editor
    window.location.href = `/library/${prompt.structured_prompt_id}`;
  } else {
    toast.error('This prompt does not have a structured version');
  }
};
```

#### 3.3 Add Badge to Library Cards

**File**: `src/components/prompt-library/prompt-library-page.tsx`

```typescript
// In PromptCard component
{prompt.framework_name && (
  <Badge variant="secondary" className="text-xs bg-blue-100">
    From Canvas: {prompt.framework_name}
  </Badge>
)}
```

---

### Phase 4: Parser Logic Details

**Header Mapping Strategy**:

```typescript
const SECTION_PATTERNS = {
  role: [
    /^#\s*(?:AI\s*)?Role\s*(?:&|and)?\s*Expertise/i,
    /^#\s*Role/i,
    /^#\s*Expertise/i
  ],
  context: [
    /^##\s*Project\s*Context/i,
    /^##\s*Context/i,
    /^##\s*Background/i
  ],
  task: [
    /^##\s*Specific\s*Task/i,
    /^##\s*Task/i,
    /^##\s*Objective/i,
    /^##\s*Goal/i
  ],
  constraints: [
    /^##\s*Quality\s*Standards?\s*(?:&|and)?\s*Constraints?/i,
    /^##\s*Constraints?/i,
    /^##\s*Quality/i,
    /^##\s*Requirements?/i
  ],
  format: [
    /^##\s*Output\s*Format/i,
    /^##\s*Format/i,
    /^##\s*Structure/i
  ],
  examples: [
    /^##\s*Examples?(?:\s*(?:&|and)?\s*Guidance)?/i,
    /^##\s*Sample/i
  ]
};
```

**Fallback Strategy**:

If headers not found, use content analysis:
1. **Role**: First 2-3 paragraphs mentioning "you are", "expert", "knowledge"
2. **Context**: Paragraphs with project info, variables, brackets
3. **Task**: Paragraphs starting with action verbs (create, analyze, design)
4. **Constraints**: Paragraphs with "ensure", "must", "should", "quality"
5. **Format**: Paragraphs with "format", "structure", "output"
6. **Examples**: Code blocks, bulleted lists at end

---

## 🔄 Migration Strategy

### Handling Existing Prompts

**Option 1: Lazy Migration** (Recommended)
- Keep old prompts in `prompts` table
- Only new prompts go to both tables
- Add "Convert to Structured" button in UI for old prompts

**Option 2: Bulk Migration**
- Create migration script to convert all existing prompts
- Run once during deployment
- May have parsing errors for unusual formats

**Decision**: **Option 1** - Lazy migration for safety

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test parser with various inputs
describe('parseAIPromptToStructured', () => {
  it('should parse standard 6-section prompt', () => {
    const input = `# Role & Expertise\nYou are...\n\n## Project Context\n...`;
    const result = parseAIPromptToStructured(input, 'User Personas');
    expect(result.role_section.content).toContain('You are');
  });

  it('should handle missing examples section', () => {
    const input = `# Role\n...\n## Context\n...\n## Task\n...`;
    const result = parseAIPromptToStructured(input, 'Journey Maps');
    expect(result.examples_section).toBeNull();
  });

  it('should use fallback for headerless content', () => {
    const input = `You are an expert. Working on project...`;
    const result = parseAIPromptToStructured(input, 'Wireframes');
    expect(result.role_section.content).toBeTruthy();
  });
});
```

### Integration Tests

1. **End-to-End Flow**:
   - Generate prompt on canvas
   - Verify saved to both tables
   - Check structured_prompt_id is returned
   - Open in library and verify sections

2. **Edge Cases**:
   - Generate with minimal knowledge context
   - Generate with complex templates
   - Generate with unusual tool names

---

## 📊 Implementation Timeline

### Week 1: Parser & Foundation
- **Day 1-2**: Create `ai-prompt-parser.ts` with tests
- **Day 3**: Update TypeScript types
- **Day 4-5**: Test parser with various prompt formats

### Week 2: Backend Integration
- **Day 1-2**: Update Supabase function
- **Day 3**: Add structured prompt saving logic
- **Day 4**: Test dual-save mechanism
- **Day 5**: Deploy and monitor

### Week 3: Frontend Integration
- **Day 1-2**: Update ToolNode and PromptNode
- **Day 3**: Add "Edit in Library" button
- **Day 4**: Add canvas badges to library cards
- **Day 5**: End-to-end testing

### Week 4: Polish & Documentation
- **Day 1-2**: Handle edge cases
- **Day 3**: Add migration UI for old prompts
- **Day 4**: Write user documentation
- **Day 5**: Final testing and deployment

---

## 🚨 Risks & Mitigation

### Risk 1: Parsing Accuracy
**Issue**: Parser might not correctly identify sections
**Mitigation**:
- Comprehensive test suite with real examples
- Fallback to manual section assignment
- User can edit sections after generation

### Risk 2: Template Variation
**Issue**: Different tools use different header formats
**Mitigation**:
- Flexible regex patterns
- Multiple pattern matching per section
- Content-based fallback logic

### Risk 3: Database Migration
**Issue**: Converting existing prompts may fail
**Mitigation**:
- Lazy migration (only new prompts)
- Optional "Convert" button for users
- Keep old prompts as backup

### Risk 4: Performance
**Issue**: Parsing adds processing time
**Mitigation**:
- Parse in background (async)
- Cache parsed results
- Optimize regex patterns

---

## 🎯 Success Metrics

### Functionality
- ✅ 95%+ of generated prompts correctly parsed
- ✅ All 6 sections populated (or null for examples)
- ✅ "Edit in Library" works seamlessly
- ✅ No duplicate prompts created

### Performance
- ✅ Parsing adds <100ms to generation time
- ✅ Database inserts complete in <500ms
- ✅ No degradation to canvas performance

### User Experience
- ✅ Users can find AI-generated prompts in library
- ✅ Sections are editable and make sense
- ✅ Preview shows compiled prompt correctly
- ✅ Canvas → Library flow is intuitive

---

## 📚 Files to Create/Modify

### New Files
1. `src/lib/ai-prompt-parser.ts` - Parser logic
2. `src/lib/ai-prompt-parser.test.ts` - Unit tests
3. `docs/AI_PROMPT_INTEGRATION.md` - User documentation

### Modified Files
1. `supabase/functions/generate-ai-prompt/index.ts` - Add structured saving
2. `src/components/workflow/tool-node.tsx` - Handle structured_prompt_id
3. `src/components/workflow/prompt-node.tsx` - Add "Edit in Library" button
4. `src/components/prompt-library/prompt-library-page.tsx` - Add canvas badges
5. `src/stores/prompt-store.ts` - Update types for structured_prompt_id
6. `src/types/structured-prompt.ts` - Add AI-generated metadata

---

## 🔧 Configuration

### Environment Variables
No new environment variables needed.

### Feature Flags (Optional)
```typescript
// In project settings
const ENABLE_STRUCTURED_PROMPT_AUTO_SAVE = true;

// Allow users to opt-in/out
if (projectSettings.features.autoSaveStructured) {
  // Save to structured_prompts table
}
```

---

## 📖 User Documentation

### For End Users

**"AI-Generated Prompts in Your Library"**

When you generate a prompt on the canvas, it's automatically saved to your Prompt Library with structured sections:

1. **Generate as usual**: Click "Generate Prompt" on any tool
2. **Find in Library**: Navigate to `/library` to see your prompt
3. **Edit sections**: Click on the prompt to edit each section independently
4. **Reuse anywhere**: Mark as template for other projects

**"Edit in Library" Button**

On any prompt node in the canvas, click "Edit in Library" to:
- Open the structured editor
- Modify individual sections
- See real-time preview
- Save changes

### For Developers

**Parser API**:
```typescript
import { parseAIPromptToStructured } from '@/lib/ai-prompt-parser';

const sections = parseAIPromptToStructured(flatText, toolName);
// Returns: { role_section, context_section, ... }
```

**Type Definitions**:
```typescript
interface GeneratedPrompt {
  id: string;
  structured_prompt_id?: string; // NEW: Link to structured version
  content: string;
  // ... other fields
}
```

---

## 🎉 Benefits

### For Users
1. **Editable AI Prompts**: Can modify sections instead of full text
2. **Better Organization**: Find prompts by section content
3. **Reusability**: Convert AI prompts to templates
4. **Visual Clarity**: Color-coded sections make structure clear

### For System
1. **Unified Library**: One place for all prompts (manual + AI)
2. **Better Search**: Can search within sections
3. **Analytics**: Track which sections users modify most
4. **Future AI**: Can fine-tune AI based on section usage

---

## 🚀 Future Enhancements

### Phase 2 Features (Post-MVP)
1. **AI Section Suggestions**: Suggest improvements to specific sections
2. **Section Templates**: Reuse role/context across prompts
3. **Diff View**: Compare AI-generated vs manually edited sections
4. **Batch Operations**: Convert multiple old prompts at once
5. **Section Analytics**: Track which sections perform best

### Phase 3 Features (Advanced)
1. **Collaborative Editing**: Multiple users edit sections
2. **Version Control**: Track section changes over time
3. **A/B Testing**: Test different section variations
4. **Smart Parsing**: ML-based section extraction
5. **Export/Import**: Share structured prompts as JSON

---

## ✅ Pre-Implementation Checklist

Before starting implementation:

- [ ] Review current prompt templates for consistency
- [ ] Confirm database migration strategy with team
- [ ] Set up test environment with sample prompts
- [ ] Create backup of production prompts table
- [ ] Document current prompt generation flow
- [ ] Get stakeholder approval on parsing strategy
- [ ] Set up monitoring for parsing errors
- [ ] Create rollback plan if issues arise

---

## 📞 Support & Questions

**Technical Questions**: Check `STRUCTURED_PROMPTS_README.md`
**Implementation Issues**: See unit tests in `ai-prompt-parser.test.ts`
**User Guidance**: Refer to `AI_PROMPT_INTEGRATION.md`

---

**Status**: 📋 Plan Ready for Review
**Next Step**: Analyze plan and implement Phase 1 (Parser)
