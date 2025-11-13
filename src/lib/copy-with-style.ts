/**
 * Copy with Style Utility
 *
 * This utility provides functionality to copy HTML content with full CSS styling inlined.
 * It captures the DOM structure, computes all styles, and creates clipboard-ready HTML
 * that maintains visual fidelity when pasted into external applications.
 */

interface CopyOptions {
  mode?: 'attribute' | 'inline'; // 'attribute' inlines all styles, 'inline' preserves style tags
  includeImages?: boolean;
  sanitize?: boolean;
}

/**
 * Get all computed styles for an element and return as inline style string
 */
function getComputedStyleString(element: HTMLElement): string {
  const computedStyle = window.getComputedStyle(element);
  const styleProperties: string[] = [];

  // Important CSS properties to preserve
  const importantProperties = [
    'color',
    'background-color',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'text-decoration',
    'text-align',
    'line-height',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'padding',
    'padding-top',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'border',
    'border-top',
    'border-bottom',
    'border-left',
    'border-right',
    'width',
    'height',
    'display',
    'list-style-type',
    'list-style-position',
    'text-indent',
    'letter-spacing',
    'word-spacing',
    'white-space',
  ];

  importantProperties.forEach(property => {
    const value = computedStyle.getPropertyValue(property);
    if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
      // Skip default values that don't need to be inlined
      if (
        (property === 'color' && value === 'rgb(0, 0, 0)') ||
        (property === 'background-color' && (value === 'rgba(0, 0, 0, 0)' || value === 'transparent'))
      ) {
        return;
      }
      styleProperties.push(`${property}: ${value}`);
    }
  });

  return styleProperties.join('; ');
}

/**
 * Clone an element and inline all computed styles
 */
function cloneWithInlinedStyles(element: Node, options: CopyOptions = {}): Node {
  const { mode = 'attribute', includeImages = true, sanitize = true } = options;

  if (element.nodeType === Node.TEXT_NODE) {
    return element.cloneNode(true);
  }

  if (element.nodeType === Node.ELEMENT_NODE) {
    const el = element as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Skip script and style tags
    if (tagName === 'script' || tagName === 'style') {
      return document.createTextNode('');
    }

    // Skip images if not included
    if (tagName === 'img' && !includeImages) {
      return document.createTextNode('[Image]');
    }

    // Create a clone of the element
    const clone = el.cloneNode(false) as HTMLElement;

    // Get computed styles and inline them
    const inlineStyle = getComputedStyleString(el);
    if (inlineStyle) {
      // Merge with existing inline styles
      const existingStyle = clone.getAttribute('style') || '';
      clone.setAttribute('style', existingStyle + '; ' + inlineStyle);
    }

    // Remove unwanted attributes if sanitizing
    if (sanitize) {
      const allowedAttributes = ['style', 'href', 'src', 'alt', 'title', 'colspan', 'rowspan'];
      const attributes = Array.from(clone.attributes);
      attributes.forEach(attr => {
        if (!allowedAttributes.includes(attr.name)) {
          clone.removeAttribute(attr.name);
        }
      });
    }

    // Recursively process children
    Array.from(el.childNodes).forEach(child => {
      const clonedChild = cloneWithInlinedStyles(child, options);
      if (clonedChild) {
        clone.appendChild(clonedChild);
      }
    });

    return clone;
  }

  return element.cloneNode(true);
}

/**
 * Get selected content as styled HTML
 */
export function getSelectionAsStyledHTML(options: CopyOptions = {}): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return '';
  }

  // Get the range
  const range = selection.getRangeAt(0);

  // Clone the range contents
  const fragment = range.cloneContents();

  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(fragment);

  // Process the container to inline styles
  const styledContainer = cloneWithInlinedStyles(tempDiv, options) as HTMLElement;

  // Get the HTML
  return styledContainer.innerHTML;
}

/**
 * Get entire element as styled HTML
 */
export function getElementAsStyledHTML(element: HTMLElement, options: CopyOptions = {}): string {
  const styledElement = cloneWithInlinedStyles(element, options) as HTMLElement;
  return styledElement.innerHTML;
}

/**
 * Copy selection to clipboard with styles
 */
export async function copySelectionWithStyle(options: CopyOptions = {}): Promise<boolean> {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.warn('No selection to copy');
      return false;
    }

    // Get styled HTML
    const styledHTML = getSelectionAsStyledHTML(options);

    // Also get plain text as fallback
    const plainText = selection.toString();

    // Copy to clipboard with multiple formats
    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([styledHTML], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
    });

    await navigator.clipboard.write([clipboardItem]);
    console.log('✅ Copied with styles successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy with styles:', error);

    // Fallback: try the old method
    try {
      const selection = window.getSelection();
      if (selection) {
        document.execCommand('copy');
        return true;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback copy also failed:', fallbackError);
    }

    return false;
  }
}

/**
 * Copy entire element to clipboard with styles
 */
export async function copyElementWithStyle(
  element: HTMLElement,
  options: CopyOptions = {}
): Promise<boolean> {
  try {
    // Get styled HTML
    const styledHTML = getElementAsStyledHTML(element, options);

    // Get plain text
    const plainText = element.textContent || '';

    // Copy to clipboard
    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([styledHTML], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
    });

    await navigator.clipboard.write([clipboardItem]);
    console.log('✅ Copied element with styles successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy element with styles:', error);
    return false;
  }
}

/**
 * Create a wrapper for easy integration with React components
 */
export const copyWithStyle = {
  selection: (options?: CopyOptions) => copySelectionWithStyle(options),
  element: (element: HTMLElement, options?: CopyOptions) => copyElementWithStyle(element, options),
  getSelectionHTML: (options?: CopyOptions) => getSelectionAsStyledHTML(options),
  getElementHTML: (element: HTMLElement, options?: CopyOptions) => getElementAsStyledHTML(element, options),
};

export default copyWithStyle;
