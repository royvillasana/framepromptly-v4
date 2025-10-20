# AI Canvas → Library Integration Testing Checklist

## Pre-Testing Setup

### Environment Requirements
- [ ] Supabase project configured with valid credentials
- [ ] `structured_prompts` table exists (run migration: `supabase/migrations/20250113000000_create_structured_prompts_table.sql`)
- [ ] Edge Function `generate-ai-prompt` deployed with latest parser code
- [ ] Frontend dev server running (`npm run dev`)
- [ ] User account created and authenticated

### Test Data Preparation
- [ ] At least one project created
- [ ] Mix of old prompts (pre-integration) and new prompts (post-integration)
- [ ] Test with multiple UX frameworks (Design Thinking, Double Diamond, etc.)

---

## Test Suite 1: Core Functionality

### TC-001: Generate AI Prompt with Structured Save
**Objective**: Verify AI prompt generation creates both flat and structured versions

**Steps**:
1. Navigate to `/workflow`
2. Select or create a project
3. Add Framework: "Design Thinking"
4. Add Stage: "Empathize"
5. Add Tool: "User Interviews"
6. Click "Generate AI Prompt" button
7. Wait for prompt generation (loading indicator should appear)

**Expected Results**:
- ✅ PromptNode appears on canvas
- ✅ Prompt content is displayed
- ✅ Purple "Edit in Library" button is visible
- ✅ No error messages in console
- ✅ Backend logs show: "Successfully saved structured prompt: {id}"

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-002: Navigate to Library Editor
**Objective**: Verify "Edit in Library" button navigates correctly

**Prerequisite**: Complete TC-001

**Steps**:
1. Click purple "Edit in Library" button on PromptNode
2. Observe navigation

**Expected Results**:
- ✅ URL changes to `/library/{structured_prompt_id}`
- ✅ Toast notification: "Opening in Library"
- ✅ Card-based editor loads
- ✅ Editor shows 6 colored section cards

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-003: Verify Parsed Sections
**Objective**: Confirm all 6 sections have meaningful content

**Prerequisite**: Complete TC-002

**Steps**:
1. In library editor, expand each section card
2. Read content of each section

**Expected Results**:
- ✅ **Role Section** (Purple): Contains role description (e.g., "You are a UX researcher...")
- ✅ **Context Section** (Blue): Contains background info about the framework/stage
- ✅ **Task Section** (Green): Contains specific task instructions
- ✅ **Constraints Section** (Orange): Contains guidelines or limitations
- ✅ **Format Section** (Red): Contains output structure requirements
- ✅ **Examples Section** (Yellow): Either has examples OR is marked optional/empty
- ✅ No sections contain placeholder text like "Lorem ipsum" or "TODO"

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-004: Edit and Save Sections
**Objective**: Verify section editing and persistence

**Prerequisite**: Complete TC-003

**Steps**:
1. Click "Edit" on Role Section card
2. Modify content (add a sentence at the end)
3. Click "Save"
4. Observe success toast
5. Refresh page (F5)
6. Re-open the same prompt

**Expected Results**:
- ✅ Changes saved successfully
- ✅ Toast: "Prompt updated successfully"
- ✅ After refresh, edited content persists
- ✅ Version number incremented
- ✅ "Updated at" timestamp changed

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-005: Compiled Preview Updates
**Objective**: Verify live preview reflects section changes

**Prerequisite**: Complete TC-004

**Steps**:
1. Edit Task Section content
2. Click "Save"
3. Scroll to "Compiled Preview" section
4. Review full prompt

**Expected Results**:
- ✅ Preview shows updated Task Section content
- ✅ All sections combined in correct order
- ✅ Markdown formatting preserved
- ✅ Preview is readable and well-formatted

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 2: Library Display

### TC-006: Canvas Origin Badge
**Objective**: Verify AI-generated prompts show "From Canvas" badge

**Steps**:
1. Navigate to `/library`
2. Locate the prompt generated in TC-001
3. Observe badge display

**Expected Results**:
- ✅ Blue badge visible: "From Canvas: Design Thinking"
- ✅ Badge positioned before tool name badge
- ✅ Blue styling (`bg-blue-50 border-blue-200 text-blue-700`)
- ✅ Workflow icon (🔄) displayed

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-007: Filter and Search
**Objective**: Verify library filtering includes AI-generated prompts

**Steps**:
1. In library page, use search box: type "User Interviews"
2. Use tool filter dropdown: select "User Interviews"
3. Verify AI-generated prompt appears in results

**Expected Results**:
- ✅ Search finds the prompt
- ✅ Filter includes the prompt
- ✅ Card displays correctly in grid
- ✅ Clicking card opens editor

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 3: Edge Cases

### TC-008: Old Prompts Without structured_prompt_id
**Objective**: Verify backwards compatibility with legacy prompts

**Setup**: Find or create an old prompt without structured version

**Steps**:
1. Locate old PromptNode on canvas (if none exist, manually add one to store without structured_prompt_id)
2. Observe button display

**Expected Results**:
- ✅ "Edit in Library" button is NOT visible
- ✅ Other prompt actions still work (copy, download, expand)
- ✅ Prompt content displays correctly
- ✅ No errors in console

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-009: Button Click on Old Prompts
**Objective**: Verify error handling when structured_prompt_id is missing

**Prerequisite**: TC-008

**Steps**:
1. Modify code temporarily to show button even without structured_prompt_id
2. Click "Edit in Library" button
3. Observe behavior

**Expected Results**:
- ✅ Error toast appears: "Not Available"
- ✅ Description: "This prompt doesn't have a structured version yet..."
- ✅ Stays on canvas (doesn't navigate)
- ✅ No console errors

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-010: Network Error Handling
**Objective**: Verify graceful handling of network failures

**Steps**:
1. Open browser DevTools → Network tab
2. Set throttling to "Offline"
3. Try generating AI prompt
4. Restore network
5. Retry

**Expected Results**:
- ✅ Error toast displays: "Failed to generate prompt"
- ✅ Loading state stops
- ✅ User can retry
- ✅ After restoring network, retry succeeds
- ✅ No permanent state corruption

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-011: Parsing Failure Graceful Degradation
**Objective**: Verify system works even if structured save fails

**Setup**: Temporarily break parsing by modifying parser to throw error

**Steps**:
1. Generate AI prompt (will save flat version but fail structured)
2. Check PromptNode display
3. Check backend logs

**Expected Results**:
- ✅ Flat prompt saved successfully
- ✅ PromptNode appears on canvas
- ✅ "Edit in Library" button does NOT appear (no structured_prompt_id)
- ✅ Backend log: "⚠️  Error during parsing/saving structured prompt"
- ✅ User can still use flat prompt normally

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 4: Multi-Framework Coverage

### TC-012: Test Parsing Across Frameworks
**Objective**: Ensure parser works for all 9 frameworks

**Frameworks to Test**:
- [ ] Design Thinking
- [ ] Double Diamond
- [ ] Google Design Sprint
- [ ] Human-Centered Design
- [ ] Jobs-to-Be-Done
- [ ] Lean UX
- [ ] Agile UX
- [ ] HEART Framework
- [ ] Hooked Model

**Steps** (repeat for each framework):
1. Generate AI prompt for a tool in the framework
2. Check "Edit in Library" button appears
3. Open in library editor
4. Verify all sections have content
5. Check console for confidence score (should be > 0.7)

**Expected Results**:
- ✅ All frameworks parse successfully
- ✅ Confidence scores mostly > 0.7
- ✅ Section quality is consistent

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 5: Performance & UX

### TC-013: Generation Speed
**Objective**: Verify parsing doesn't slow down prompt generation

**Steps**:
1. Generate 5 AI prompts in succession
2. Record time from button click to PromptNode appearance
3. Calculate average time

**Expected Results**:
- ✅ Average generation time < 3 seconds (network dependent)
- ✅ Parsing adds < 200ms overhead
- ✅ No noticeable lag in UI

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-014: Editor Load Performance
**Objective**: Verify library editor loads quickly

**Steps**:
1. Navigate to library editor for a complex prompt (> 2000 chars)
2. Measure time from navigation to full render
3. Interact with sections (expand/collapse)

**Expected Results**:
- ✅ Editor loads in < 1 second
- ✅ Section interactions are smooth (no lag)
- ✅ Preview updates within 500ms of edit

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-015: Toast Notifications
**Objective**: Verify all user feedback is clear and helpful

**Steps**:
1. Trigger each toast scenario:
   - Generate prompt success
   - Edit in library click
   - Save changes success
   - Error: no structured_prompt_id
   - Network error

**Expected Results**:
- ✅ All toasts appear at correct timing
- ✅ Messages are clear and actionable
- ✅ Toasts auto-dismiss after 3-5 seconds
- ✅ Error toasts use `variant="destructive"` (red)

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 6: Data Integrity

### TC-016: Dual-Save Consistency
**Objective**: Verify both flat and structured versions are saved

**Steps**:
1. Generate AI prompt
2. Query database directly (or use Supabase dashboard)
3. Check both `prompts` and `structured_prompts` tables

**Expected Results**:
- ✅ Record exists in `prompts` table with correct `id`
- ✅ Record exists in `structured_prompts` table with matching `user_id`, `project_id`, `framework_name`, `tool_name`
- ✅ Both have same `created_at` timestamp (within 1 second)
- ✅ `compiled_prompt` in structured table matches `prompt_text` in flat table

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

### TC-017: Foreign Key Relationships
**Objective**: Verify database relationships are correct

**Steps**:
1. Check `structured_prompts` table foreign keys
2. Verify user_id matches authenticated user
3. Verify project_id matches current project

**Expected Results**:
- ✅ `user_id` references `auth.users`
- ✅ `project_id` references `projects`
- ✅ Row Level Security (RLS) enforced
- ✅ User can only see their own prompts

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 7: Security & Permissions

### TC-018: Row Level Security
**Objective**: Verify users can only access their own prompts

**Setup**: Create two user accounts

**Steps**:
1. User A generates AI prompt
2. Note `structured_prompt_id`
3. Log out, log in as User B
4. Try navigating to `/library/{structured_prompt_id}` from User A

**Expected Results**:
- ✅ User B cannot access User A's prompt
- ✅ 404 or permission error displayed
- ✅ No data leaked in error message
- ✅ User B's library shows only their prompts

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 8: Regression Testing

### TC-019: Existing Canvas Features Still Work
**Objective**: Ensure integration didn't break existing functionality

**Features to Test**:
- [ ] Framework node creation
- [ ] Stage node creation
- [ ] Tool node creation
- [ ] Node connections (edges)
- [ ] Node dragging and positioning
- [ ] Auto-save canvas state
- [ ] Marquee selection
- [ ] Zoom and pan
- [ ] Copy/paste nodes
- [ ] Delete nodes
- [ ] Undo/redo (if available)

**Expected Results**:
- ✅ All existing features work as before
- ✅ No new console errors
- ✅ No visual regressions

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Suite 9: Browser Compatibility

### TC-020: Cross-Browser Testing
**Objective**: Verify integration works across browsers

**Browsers to Test**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Steps** (repeat for each browser):
1. Run TC-001 through TC-005 (core functionality)
2. Check for browser-specific issues

**Expected Results**:
- ✅ All browsers render correctly
- ✅ Buttons appear and function
- ✅ Navigation works
- ✅ No browser console errors

**Actual Results**: _______________

**Status**: [ ] Pass [ ] Fail

**Notes**: _______________

---

## Test Summary

### Overall Statistics
- **Total Test Cases**: 20
- **Passed**: _____ / 20
- **Failed**: _____ / 20
- **Pass Rate**: _____ %

### Critical Issues Found
1. _____________________________
2. _____________________________
3. _____________________________

### Non-Critical Issues Found
1. _____________________________
2. _____________________________
3. _____________________________

### Recommendations
1. _____________________________
2. _____________________________
3. _____________________________

---

## Sign-Off

**Tester Name**: _____________________________

**Date**: _____________________________

**Version Tested**: _____________________________

**Environment**: [ ] Development [ ] Staging [ ] Production

**Approval**: [ ] Approved [ ] Approved with Conditions [ ] Rejected

**Notes**:
_____________________________
_____________________________
_____________________________
