# Structured Prompts - UI Visual Guide

## 🎨 User Interface Overview

This guide provides a visual description of each UI component in the structured prompts system.

---

## 1. Library Grid View (`/library`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navigation Bar                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📚 Prompt Library                              [+ New Prompt]       │
│  Manage and edit your structured AI prompts                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [🔍 Search prompts...]  [Filter: All Tools ▾]  [Sort: ▾]  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ ✨ Prompt 1  │  │ ✨ Prompt 2  │  │ ✨ Prompt 3  │              │
│  │              │  │              │  │              │              │
│  │ User Persona │  │ Journey Map  │  │ Wireframes   │              │
│  │ Description  │  │ Description  │  │ Description  │              │
│  │              │  │              │  │              │              │
│  │ [Tool Badge] │  │ [Tool Badge] │  │ [Tool Badge] │              │
│  │ ●●●●●●       │  │ ●●●●●●       │  │ ●●●●●●       │  ← Sections │
│  │ (indicators) │  │ (indicators) │  │ (indicators) │              │
│  │              │  │              │  │              │              │
│  │ Updated: ... │  │ Updated: ... │  │ Updated: ... │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ ✨ Prompt 4  │  │ ✨ Prompt 5  │  │ ✨ Prompt 6  │              │
│  │ ...          │  │ ...          │  │ ...          │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features:
- **Header**: Title, description, and "New Prompt" button
- **Filter Bar**: Search, tool filter, and sort dropdown
- **Grid Layout**: Responsive 1-3 columns
- **Prompt Cards**: Clickable cards with:
  - Title and description
  - Tool badge
  - Run count badge (if >0)
  - Template badge (if template)
  - Colored section indicators (6 colored bars)
  - Last updated date
  - Version number

### Empty State:
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│                         ✨                                │
│                                                           │
│                   No prompts yet                          │
│                                                           │
│    Create your first structured prompt with card-based   │
│    editing for better organization and reusability.      │
│                                                           │
│               [+ Create First Prompt]                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Prompt Editor View (`/library/:promptId`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [← Back to Library]  │  Prompt Title  [Tool] [Template] v1.0            │
│                                         [Edit Info]  [⋮ Actions ▾]        │
├────────────────────────────┬────────────────────────────────────────────┤
│ PROMPT SECTIONS            │  COMPILED PREVIEW                          │
│                            │                                            │
│ ┌────────────────────────┐ │  ┌────────────────────────────────────┐  │
│ │ 🧠 Role & Expertise    │ │  │ [Formatted] [Raw]    [Copy] [Run]  │  │
│ │ PURPLE HEADER          │ │  │                                    │  │
│ │ ────────────────────── │ │  │ # Compiled Prompt                  │  │
│ │ You are a senior UX    │ │  │                                    │  │
│ │ researcher...          │ │  │ ## Role & Expertise                │  │
│ │ [Edit] [Copy] [↕]     │ │  │ You are a senior UX researcher...  │  │
│ └────────────────────────┘ │  │                                    │  │
│                            │  │ ## Project Context                 │  │
│ ┌────────────────────────┐ │  │ Working on a mobile app for...    │  │
│ │ 👤 Project Context     │ │  │                                    │  │
│ │ BLUE HEADER            │ │  │ ## Specific Task                   │  │
│ │ ────────────────────── │ │  │ Create detailed user personas...  │  │
│ │ Working on a mobile    │ │  │                                    │  │
│ │ app for...             │ │  │ ## Quality Standards & Constraints │  │
│ │ [Edit] [Copy] [↕]     │ │  │ Ensure methodologies are...        │  │
│ └────────────────────────┘ │  │                                    │  │
│                            │  │ ## Output Format                   │  │
│ ┌────────────────────────┐ │  │ Structure the output as...         │  │
│ │ 🎯 Specific Task       │ │  │                                    │  │
│ │ GREEN HEADER           │ │  └────────────────────────────────────┘  │
│ │ ────────────────────── │ │                                          │
│ │ Create detailed user   │ │  ┌────────────────────────────────────┐  │
│ │ personas for...        │ │  │ 📊 Statistics                      │  │
│ │ [Edit] [Copy] [↕]     │ │  │ • Reading time: 5 min              │  │
│ └────────────────────────┘ │  │ • Word count: 1,234                │  │
│                            │  │ • Character count: 8,456           │  │
│ ┌────────────────────────┐ │  │ • Run count: 12 times              │  │
│ │ ⚙️ Constraints         │ │  └────────────────────────────────────┘  │
│ │ ORANGE HEADER          │ │                                          │
│ │ ────────────────────── │ │                                          │
│ │ ...                    │ │                                          │
│ └────────────────────────┘ │                                          │
│                            │                                          │
│ ┌────────────────────────┐ │                                          │
│ │ 📄 Output Format       │ │                                          │
│ │ RED HEADER             │ │                                          │
│ │ ────────────────────── │ │                                          │
│ │ ...                    │ │                                          │
│ └────────────────────────┘ │                                          │
│                            │                                          │
│ ┌────────────────────────┐ │                                          │
│ │ 💡 Examples (optional) │ │                                          │
│ │ YELLOW HEADER          │ │                                          │
│ │ ────────────────────── │ │                                          │
│ │ ...                    │ │                                          │
│ └────────────────────────┘ │                                          │
│                            │                                          │
└────────────────────────────┴────────────────────────────────────────────┘
```

### Features:

#### Header Area:
- **Back button**: Returns to library grid
- **Title**: Editable when in metadata edit mode
- **Badges**: Tool name, template status, version number
- **Edit Info button**: Opens metadata editing form
- **Actions dropdown**:
  - Duplicate prompt
  - Save as template / Remove from templates
  - Delete prompt

#### Metadata Edit Mode (expanded):
```
┌────────────────────────────────────────────────────────┐
│  Description: [Textarea]                               │
│                                                         │
│  Framework: [Input]        Stage: [Input]              │
│  Tool: [Input]                                         │
│                                                         │
│                          [Cancel]  [💾 Save]           │
└────────────────────────────────────────────────────────┘
```

#### Left Panel - Section Cards:
Each card has:
- **Colored header** with icon and section name
- **Collapsible** with expand/collapse animation
- **Content area** with formatted text
- **Action buttons**:
  - Edit (pencil icon)
  - Copy (clipboard icon)
  - Expand/collapse toggle (chevron icon)
- **Word count** at bottom when collapsed
- **Edit mode** with textarea when editing

#### Right Panel - Preview:
- **View toggle**: Formatted (with markdown) or Raw (plain text)
- **Metadata stats**: Reading time, word count, character count, run count
- **Action buttons**: Copy to clipboard, Execute prompt
- **Auto-updates** as sections are edited

---

## 3. Create Prompt Dialog (`CreatePromptDialog`)

### Step 1: Info
```
┌──────────────────────────────────────────────────────────┐
│  ◉─○─○─○─○─○─○  Step 1 of 7: Basic Information          │
│                                                           │
│  Title:                                                   │
│  [Input field]                                            │
│                                                           │
│  Description: (optional)                                  │
│  [Textarea]                                               │
│                                                           │
│  Select Tool: (optional - auto-populates sections)       │
│  [Dropdown: None, User Personas, Journey Maps, ...]      │
│                                                           │
│  Framework: (optional)  Stage: (optional)                │
│  [Input]                 [Input]                          │
│                                                           │
│                                      [Cancel]  [Next →]   │
└──────────────────────────────────────────────────────────┘
```

### Step 2-6: Section Editing
```
┌──────────────────────────────────────────────────────────┐
│  ○─◉─○─○─○─○─○  Step 2 of 7: Role & Expertise           │
│                                                           │
│  Define the AI's role and area of expertise:             │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ You are a senior UX researcher with expertise in...│  │
│  │                                                    │  │
│  │                                                    │  │
│  │                                                    │  │
│  │                                                    │  │
│  │                                                    │  │
│  │                                                    │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Words: 45 / 2000                                         │
│                                                           │
│                                [← Back]  [Next →]         │
└──────────────────────────────────────────────────────────┘
```

Each section step (2-6) follows the same pattern:
- **Step 2**: Role & Expertise (Purple)
- **Step 3**: Project Context (Blue)
- **Step 4**: Specific Task (Green)
- **Step 5**: Constraints (Orange)
- **Step 6**: Output Format (Red)

### Step 7: Review
```
┌──────────────────────────────────────────────────────────┐
│  ○─○─○─○─○─○─◉  Step 7 of 7: Review & Create            │
│                                                           │
│  Review your prompt:                                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ # My User Persona Prompt                          │  │
│  │                                                    │  │
│  │ ## Role & Expertise                               │  │
│  │ You are a senior UX researcher...                 │  │
│  │                                                    │  │
│  │ ## Project Context                                │  │
│  │ Working on a mobile app...                        │  │
│  │                                                    │  │
│  │ ## Specific Task                                  │  │
│  │ Create detailed user personas...                  │  │
│  │                                                    │  │
│  │ [... continues ...]                               │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  📊 Stats: 1,234 words • 5 min read                      │
│                                                           │
│                          [← Back]  [Create Prompt ✓]     │
└──────────────────────────────────────────────────────────┘
```

### Progress Indicator:
```
Step 1: ◉─○─○─○─○─○─○  (Current: filled circle)
Step 2: ○─◉─○─○─○─○─○  (Completed: filled line)
Step 3: ○─○─◉─○─○─○─○  (Upcoming: outlined)
```

---

## 4. Section Card States

### Collapsed (Default):
```
┌────────────────────────────────────────────────────┐
│ 🧠 Role & Expertise                   [Edit] [Copy] │ Purple header
│ ──────────────────────────────────────────────────  │
│ You are a senior UX researcher with expertise in... │
│ (truncated preview - first 2 lines)                 │
│ 145 words                                      [↓]  │
└────────────────────────────────────────────────────┘
```

### Expanded (View):
```
┌────────────────────────────────────────────────────┐
│ 🧠 Role & Expertise                   [Edit] [Copy] │ Purple header
│ ──────────────────────────────────────────────────  │
│                                                      │
│ You are a senior UX researcher with expertise in    │
│ user research methodologies, persona development,   │
│ and qualitative data analysis. You have worked on   │
│ numerous mobile app projects and understand the     │
│ importance of creating detailed, actionable user    │
│ personas that drive design decisions.               │
│                                                      │
│ 145 words                                      [↑]  │
└────────────────────────────────────────────────────┘
```

### Edit Mode:
```
┌────────────────────────────────────────────────────┐
│ 🧠 Role & Expertise              [Cancel] [💾 Save] │ Purple header
│ ──────────────────────────────────────────────────  │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ You are a senior UX researcher with expertise │ │
│ │ in user research methodologies, persona       │ │
│ │ development, and qualitative data analysis.   │ │
│ │ You have worked on numerous mobile app        │ │
│ │ projects and understand the importance of     │ │
│ │ creating detailed, actionable user personas   │ │
│ │ that drive design decisions.                  │ │
│ │ █                                             │ │ ← Cursor
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ 145 words • Auto-saving...                     [↑]  │
└────────────────────────────────────────────────────┘
```

---

## 5. Color Coding System

```
🟣 Purple   - Role & Expertise        (Brain icon)
🔵 Blue     - Project Context         (User icon)
🟢 Green    - Specific Task           (Target icon)
🟠 Orange   - Quality & Constraints   (Settings icon)
🔴 Red      - Output Format           (FileText icon)
🟡 Yellow   - Examples (optional)     (Lightbulb icon)
```

### Section Indicators on Cards:
```
┌──────────────┐
│ ✨ Prompt    │
│              │
│ ●●●●●●       │ ← Six colored bars showing sections present
│ PURPLE BLUE GREEN ORANGE RED YELLOW
│              │
└──────────────┘
```

---

## 6. Actions Dropdown Menu

```
┌─────────────────────────┐
│ 📋 Duplicate            │
│ 📄 Save as Template     │ ← Or "Remove from Templates"
│ ──────────────────────  │
│ 🗑️  Delete              │ ← Red text (destructive)
└─────────────────────────┘
```

---

## 7. Delete Confirmation Dialog

```
┌─────────────────────────────────────────────┐
│  Delete Prompt?                             │
│                                             │
│  Are you sure you want to delete           │
│  "User Persona Prompt"? This action        │
│  cannot be undone.                         │
│                                             │
│                   [Cancel]  [Delete] ← Red  │
└─────────────────────────────────────────────┘
```

---

## 8. Toast Notifications

Success:
```
✅ Prompt created successfully
✅ Section updated
✅ Prompt duplicated
✅ Metadata updated
```

Error:
```
❌ Failed to load prompt
❌ Failed to save changes
❌ Failed to delete prompt
```

Info:
```
ℹ️  Auto-saving...
ℹ️  Loading prompts...
```

---

## 9. Loading States

### Library Grid Loading:
```
┌─────────────────────────────────┐
│                                 │
│          ⟳ (spinning)           │
│                                 │
│    Loading your prompt          │
│    library...                   │
│                                 │
└─────────────────────────────────┘
```

### Editor Loading:
```
┌─────────────────────────────────┐
│                                 │
│          ⟳ (spinning)           │
│                                 │
│    Loading prompt...            │
│                                 │
└─────────────────────────────────┘
```

### Section Auto-Save:
```
┌────────────────────────────────────────┐
│ 🧠 Role & Expertise    [Cancel] [Save] │
│ ────────────────────────────────────── │
│ [Content...]                           │
│                                        │
│ 145 words • Auto-saving... ⟳          │
└────────────────────────────────────────┘
```

---

## 10. Responsive Behavior

### Desktop (>1024px):
- Grid: 3 columns
- Editor: Split view (50/50)
- Full navigation visible

### Tablet (768px-1024px):
- Grid: 2 columns
- Editor: Split view (adjustable)
- Condensed navigation

### Mobile (<768px):
- Grid: 1 column
- Editor: Stacked (sections above, preview below)
- Hamburger menu navigation

---

## 11. Keyboard Shortcuts (Potential)

While not explicitly implemented, these could be added:

```
Ctrl/Cmd + S  - Save current section
Ctrl/Cmd + E  - Toggle edit mode
Ctrl/Cmd + C  - Copy content
Escape        - Cancel editing / Close dialog
Enter         - Save (when in single-line input)
Ctrl/Cmd + /  - Focus search
```

---

## 12. Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: ARIA labels on all controls
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant
- **Alt Text**: Descriptive labels for icons
- **Error Messages**: Clear, actionable error states

---

This visual guide provides a comprehensive overview of the UI components and their states. The actual implementation includes smooth animations, hover effects, and responsive layouts that enhance the user experience beyond what can be described in ASCII art!
