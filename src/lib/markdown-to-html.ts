/**
 * Markdown to HTML Converter
 *
 * Converts Markdown content to clean HTML for display in the contentEditable editor.
 * This utility provides a lightweight conversion for common Markdown syntax.
 */

/**
 * Convert Markdown string to HTML
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Process block elements first (order matters!)

  // Code blocks (must be before inline code)
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = processUnorderedLists(html);

  // Ordered lists
  html = processOrderedLists(html);

  // Now process inline elements

  // Images (must be before links)
  html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

  // Bold (must be before italic)
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Paragraphs - wrap text that isn't already in a block element
  html = processIntoParagraphs(html);

  return html;
}

/**
 * Process unordered lists
 */
function processUnorderedLists(text: string): string {
  const lines = text.split('\n');
  let result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^[\-\*]\s+(.+)$/.test(line);

    if (isListItem) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const content = line.replace(/^[\-\*]\s+/, '');
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

/**
 * Process ordered lists
 */
function processOrderedLists(text: string): string {
  const lines = text.split('\n');
  let result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^\d+\.\s+(.+)$/.test(line);

    if (isListItem) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      const content = line.replace(/^\d+\.\s+/, '');
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ol>');
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('</ol>');
  }

  return result.join('\n');
}

/**
 * Wrap text content in paragraph tags
 */
function processIntoParagraphs(html: string): string {
  const lines = html.split('\n');
  let result: string[] = [];
  let inParagraph = false;
  let paragraphBuffer: string[] = [];

  // Block-level tags that shouldn't be wrapped in <p>
  const blockTags = /^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|div)/;
  const closingBlockTags = /^<\/(h[1-6]|ul|ol|blockquote|pre|table|div)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - close paragraph if open
    if (!line) {
      if (inParagraph && paragraphBuffer.length > 0) {
        result.push(`<p>${paragraphBuffer.join(' ')}</p>`);
        paragraphBuffer = [];
        inParagraph = false;
      }
      continue;
    }

    // Block element - close paragraph if open, add block element
    if (blockTags.test(line) || closingBlockTags.test(line)) {
      if (inParagraph && paragraphBuffer.length > 0) {
        result.push(`<p>${paragraphBuffer.join(' ')}</p>`);
        paragraphBuffer = [];
        inParagraph = false;
      }
      result.push(line);
      continue;
    }

    // Regular text - add to paragraph buffer
    inParagraph = true;
    paragraphBuffer.push(line);
  }

  // Close any remaining open paragraph
  if (inParagraph && paragraphBuffer.length > 0) {
    result.push(`<p>${paragraphBuffer.join(' ')}</p>`);
  }

  return result.join('\n');
}

/**
 * Create DOM elements from HTML string with inline styles
 */
export function htmlToStyledDomElements(html: string): DocumentFragment {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const fragment = document.createDocumentFragment();

  // Apply inline styles to make the content look good in the editor
  const applyStyles = (element: Element) => {
    if (element.nodeType === Node.ELEMENT_NODE) {
      const el = element as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Apply default styles based on tag
      switch (tagName) {
        case 'h1':
          el.style.fontSize = '24px';
          el.style.fontWeight = 'bold';
          el.style.marginTop = '24px';
          el.style.marginBottom = '12px';
          break;
        case 'h2':
          el.style.fontSize = '20px';
          el.style.fontWeight = 'bold';
          el.style.marginTop = '20px';
          el.style.marginBottom = '10px';
          break;
        case 'h3':
          el.style.fontSize = '18px';
          el.style.fontWeight = 'bold';
          el.style.marginTop = '16px';
          el.style.marginBottom = '8px';
          break;
        case 'h4':
        case 'h5':
        case 'h6':
          el.style.fontSize = '16px';
          el.style.fontWeight = 'bold';
          el.style.marginTop = '12px';
          el.style.marginBottom = '6px';
          break;
        case 'p':
          el.style.marginBottom = '12px';
          el.style.lineHeight = '1.6';
          break;
        case 'ul':
        case 'ol':
          el.style.marginLeft = '20px';
          el.style.marginBottom = '12px';
          break;
        case 'li':
          el.style.marginBottom = '4px';
          break;
        case 'blockquote':
          el.style.borderLeft = '4px solid #e5e7eb';
          el.style.paddingLeft = '16px';
          el.style.marginLeft = '0';
          el.style.marginBottom = '12px';
          el.style.color = '#6b7280';
          break;
        case 'code':
          if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
            el.style.backgroundColor = '#f3f4f6';
            el.style.padding = '2px 6px';
            el.style.borderRadius = '4px';
            el.style.fontFamily = 'monospace';
            el.style.fontSize = '14px';
          }
          break;
        case 'pre':
          el.style.backgroundColor = '#f3f4f6';
          el.style.padding = '12px';
          el.style.borderRadius = '6px';
          el.style.marginBottom = '12px';
          el.style.overflowX = 'auto';
          if (el.querySelector('code')) {
            const code = el.querySelector('code') as HTMLElement;
            code.style.fontFamily = 'monospace';
            code.style.fontSize = '14px';
          }
          break;
        case 'strong':
        case 'b':
          el.style.fontWeight = 'bold';
          break;
        case 'em':
        case 'i':
          el.style.fontStyle = 'italic';
          break;
        case 'a':
          el.style.color = '#3b82f6';
          el.style.textDecoration = 'underline';
          break;
        case 'hr':
          el.style.border = 'none';
          el.style.borderTop = '1px solid #e5e7eb';
          el.style.margin = '20px 0';
          break;
      }

      // Recursively apply styles to children
      Array.from(el.children).forEach(child => applyStyles(child));
    }
  };

  // Move all children from temp div to fragment with styles
  while (tempDiv.firstChild) {
    const child = tempDiv.firstChild;
    if (child.nodeType === Node.ELEMENT_NODE) {
      applyStyles(child as Element);
    }
    fragment.appendChild(child);
  }

  return fragment;
}

/**
 * Convert Markdown to styled HTML DOM fragment ready for insertion
 */
export function markdownToStyledDom(markdown: string): DocumentFragment {
  const html = markdownToHtml(markdown);
  return htmlToStyledDomElements(html);
}

export default {
  markdownToHtml,
  htmlToStyledDomElements,
  markdownToStyledDom,
};
