# Copy with Style Feature - Documentation

## Overview

The Knowledge Base document editor now includes a powerful **Copy with Style** feature that preserves all formatting, styles, and structure when copying content to external applications like Google Docs, Notion, email clients, and more.

## Features

### 1. **Full CSS Inlining**
- All computed styles are converted to inline `style=""` attributes
- Preserves colors, fonts, spacing, alignment, and more
- Works across different paste destinations

### 2. **Semantic HTML Preservation**
- Maintains proper tag hierarchy (paragraphs, headings, lists)
- Preserves text formatting (`<strong>`, `<em>`, `<u>`)
- Keeps document structure intact

### 3. **Two Copy Modes**

#### a) Copy Selection
- Copies only the selected text/content with all formatting
- Button appears when text is selected: **"Copy Selection"**
- Ideal for copying specific paragraphs or sections

#### b) Copy Entire Document
- Copies the full document with all styles preserved
- Button visible when no text is selected: **"Copy Document"**
- Perfect for sharing complete documents

## How to Use

### Basic Usage

1. **Open a Knowledge Base document** in the editor
2. To copy a selection:
   - Select the text you want to copy
   - Click the **"Copy Selection"** button (purple, with Copy icon)
   - Paste into any external app
3. To copy entire document:
   - Ensure no text is selected
   - Click the **"Copy Document"** button (purple, with Clipboard icon)
   - Paste into any external app

### Supported Content Types

The copy feature preserves:
- ✅ **Headings** (H1-H6) with proper sizing and styling
- ✅ **Paragraphs** with correct spacing and indentation
- ✅ **Bold, Italic, Underline** text
- ✅ **Lists** (bulleted and numbered) with proper formatting
- ✅ **Line breaks** and paragraph spacing
- ✅ **Colors** and **background colors**
- ✅ **Font families** and **font sizes**
- ✅ **Text alignment** (left, center, right)
- ✅ **Margins and padding**

### Compatible Applications

The copied content maintains formatting in:
- Google Docs
- Microsoft Word
- Notion
- Email clients (Gmail, Outlook, Apple Mail)
- Confluence
- Slack (with rich text support)
- And many more!

## Technical Implementation

### Architecture

```
src/lib/copy-with-style.ts
├── Core Functions
│   ├── getComputedStyleString()   # Extracts all CSS properties
│   ├── cloneWithInlinedStyles()   # Recursively processes DOM
│   ├── getSelectionAsStyledHTML() # Captures selection
│   └── getElementAsStyledHTML()   # Captures entire element
│
└── Public API
    ├── copyWithStyle.selection()   # Copy selected content
    ├── copyWithStyle.element()     # Copy entire element
    ├── copyWithStyle.getSelectionHTML() # Get HTML without copying
    └── copyWithStyle.getElementHTML()   # Get element HTML
```

### Key Algorithms

#### 1. **Style Computation**
```typescript
const computedStyle = window.getComputedStyle(element);
// Extracts: color, font-family, font-size, margins, padding, etc.
```

#### 2. **Recursive DOM Processing**
```typescript
function cloneWithInlinedStyles(element: Node): Node {
  // 1. Clone the node
  // 2. Inline all computed styles
  // 3. Recursively process children
  // 4. Return styled clone
}
```

#### 3. **Clipboard API Integration**
```typescript
const clipboardItem = new ClipboardItem({
  'text/html': new Blob([styledHTML], { type: 'text/html' }),
  'text/plain': new Blob([plainText], { type: 'text/plain' }),
});
await navigator.clipboard.write([clipboardItem]);
```

## Options

The copy functions accept an options object:

```typescript
interface CopyOptions {
  mode?: 'attribute' | 'inline';  // Default: 'attribute'
  includeImages?: boolean;         // Default: true
  sanitize?: boolean;              // Default: true
}
```

### Option Details

- **mode**:
  - `'attribute'`: Inlines all styles (recommended for cross-platform compatibility)
  - `'inline'`: Preserves style tags (less compatible)

- **includeImages**:
  - `true`: Includes images in the copied content
  - `false`: Replaces images with `[Image]` placeholder

- **sanitize**:
  - `true`: Removes potentially problematic attributes
  - `false`: Keeps all attributes (may cause issues in some apps)

## Integration Example

### Using the Utility Directly

```typescript
import { copyWithStyle } from '@/lib/copy-with-style';

// Copy selected content
await copyWithStyle.selection({ mode: 'attribute', sanitize: true });

// Copy entire element
const element = document.getElementById('my-content');
await copyWithStyle.element(element, { mode: 'attribute' });

// Get HTML without copying
const html = copyWithStyle.getSelectionHTML();
console.log(html); // Styled HTML string
```

### React Component Integration

```tsx
import { copyWithStyle } from '@/lib/copy-with-style';

function MyEditor() {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (editorRef.current) {
      await copyWithStyle.element(editorRef.current, {
        mode: 'attribute',
        sanitize: true
      });
    }
  };

  return (
    <div>
      <button onClick={handleCopy}>Copy Document</button>
      <div ref={editorRef}>
        {/* Your content here */}
      </div>
    </div>
  );
}
```

## Troubleshooting

### Issue: Formatting not preserved in Google Docs
**Solution**: Ensure you're using `mode: 'attribute'` which provides the best compatibility.

### Issue: Some styles missing
**Solution**: The utility focuses on the most important CSS properties. Check `getComputedStyleString()` to add more properties if needed.

### Issue: Copy fails silently
**Solution**: Check browser console for errors. The feature requires HTTPS and clipboard permissions.

### Issue: Images not copying
**Solution**: Some applications don't support pasted images. Set `includeImages: false` to use placeholders instead.

## Browser Compatibility

- ✅ Chrome 66+ (Recommended)
- ✅ Firefox 63+
- ✅ Safari 13.1+
- ✅ Edge 79+

**Note**: The Clipboard API requires HTTPS in production (works on localhost without HTTPS).

## Performance Considerations

- **Large Documents**: Copying very large documents (>100 sections) may take a few seconds
- **Complex Styling**: Heavy inline styling increases clipboard data size
- **Memory Usage**: The utility creates temporary DOM clones that are garbage collected after copying

## Future Enhancements

Potential improvements for future versions:

1. **Table Support**: Enhanced handling of HTML tables
2. **Image Embedding**: Base64 encode images for better portability
3. **Custom Style Maps**: User-defined style transformations
4. **Format Presets**: Pre-configured copy modes for specific applications
5. **Undo/Redo Integration**: Track copied content history

## Credits

Created using native Web APIs:
- `window.getComputedStyle()` for style extraction
- Clipboard API for cross-platform copying
- DOM manipulation for structure preservation

## License

This feature is part of the FramePromptly application.

---

**Questions or Issues?**
Contact the development team or file an issue in the project repository.
