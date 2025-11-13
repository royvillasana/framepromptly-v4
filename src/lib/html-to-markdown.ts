/**
 * HTML to Markdown Converter
 *
 * Converts HTML content to clean Markdown format for storage and processing.
 * This utility handles common HTML elements and preserves document structure.
 */

/**
 * Convert HTML string to Markdown
 */
export function htmlToMarkdown(html: string): string {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  return processNode(tempDiv);
}

/**
 * Process a DOM node and convert it to Markdown
 */
function processNode(node: Node): string {
  let markdown = '';

  // Handle text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    // Clean up excessive whitespace but preserve single spaces
    return text.replace(/\s+/g, ' ');
  }

  // Handle element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes);

    switch (tagName) {
      case 'h1':
        markdown = `# ${processChildren(children)}\n\n`;
        break;

      case 'h2':
        markdown = `## ${processChildren(children)}\n\n`;
        break;

      case 'h3':
        markdown = `### ${processChildren(children)}\n\n`;
        break;

      case 'h4':
        markdown = `#### ${processChildren(children)}\n\n`;
        break;

      case 'h5':
        markdown = `##### ${processChildren(children)}\n\n`;
        break;

      case 'h6':
        markdown = `###### ${processChildren(children)}\n\n`;
        break;

      case 'p':
        const pContent = processChildren(children).trim();
        if (pContent) {
          markdown = `${pContent}\n\n`;
        }
        break;

      case 'strong':
      case 'b':
        markdown = `**${processChildren(children)}**`;
        break;

      case 'em':
      case 'i':
        markdown = `*${processChildren(children)}*`;
        break;

      case 'u':
        // Markdown doesn't have native underline, so we'll use emphasis
        markdown = `*${processChildren(children)}*`;
        break;

      case 'a':
        const href = element.getAttribute('href') || '#';
        const linkText = processChildren(children);
        markdown = `[${linkText}](${href})`;
        break;

      case 'br':
        markdown = '\n';
        break;

      case 'ul':
        markdown = processListItems(children, '- ') + '\n';
        break;

      case 'ol':
        markdown = processListItems(children, null, true) + '\n';
        break;

      case 'li':
        // Li elements are handled by their parent ul/ol
        markdown = processChildren(children);
        break;

      case 'blockquote':
        const quoteLines = processChildren(children).trim().split('\n');
        markdown = quoteLines.map(line => `> ${line}`).join('\n') + '\n\n';
        break;

      case 'code':
        // Check if it's inside a pre tag for block code
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          markdown = processChildren(children);
        } else {
          // Inline code
          markdown = `\`${processChildren(children)}\``;
        }
        break;

      case 'pre':
        markdown = `\n\`\`\`\n${processChildren(children)}\n\`\`\`\n\n`;
        break;

      case 'hr':
        markdown = '\n---\n\n';
        break;

      case 'table':
        markdown = processTable(element) + '\n\n';
        break;

      case 'img':
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || 'image';
        markdown = `![${alt}](${src})`;
        break;

      case 'div':
      case 'span':
      case 'section':
      case 'article':
      case 'main':
        // Generic containers - just process children
        markdown = processChildren(children);
        break;

      default:
        // For unknown tags, just process children
        markdown = processChildren(children);
    }
  }

  return markdown;
}

/**
 * Process child nodes
 */
function processChildren(children: Node[]): string {
  return children.map(child => processNode(child)).join('');
}

/**
 * Process list items
 */
function processListItems(children: Node[], bullet: string | null, ordered: boolean = false): string {
  let markdown = '';
  let itemNumber = 1;

  children.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      if (element.tagName.toLowerCase() === 'li') {
        const content = processNode(child).trim();
        if (content) {
          const prefix = ordered ? `${itemNumber}. ` : bullet;
          markdown += `${prefix}${content}\n`;
          if (ordered) itemNumber++;
        }
      }
    }
  });

  return markdown;
}

/**
 * Process table elements
 */
function processTable(table: HTMLElement): string {
  const rows: string[][] = [];

  // Process table rows
  const tableRows = table.querySelectorAll('tr');
  tableRows.forEach(row => {
    const cells: string[] = [];
    const tableCells = row.querySelectorAll('td, th');
    tableCells.forEach(cell => {
      cells.push(processNode(cell).trim());
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  if (rows.length === 0) return '';

  // Build markdown table
  let markdown = '';

  // Header row
  if (rows.length > 0) {
    markdown += '| ' + rows[0].join(' | ') + ' |\n';
    markdown += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
  }

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    markdown += '| ' + rows[i].join(' | ') + ' |\n';
  }

  return markdown;
}

/**
 * Convert plain text with simple patterns to Markdown
 */
export function plainTextToMarkdown(text: string): string {
  let markdown = text;

  // Detect headings (lines that are ALL CAPS or start with numbers like "1.")
  const lines = markdown.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) return line;

    // Check if line is ALL CAPS (potential heading)
    if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /^[A-Z\s]+$/.test(trimmed)) {
      return `## ${trimmed}\n`;
    }

    // Check for numbered headings like "1. Introduction" or "1) Introduction"
    const numberedHeading = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberedHeading) {
      return `### ${numberedHeading[2]}\n`;
    }

    return line;
  });

  return processedLines.join('\n');
}

/**
 * Clean and normalize Markdown
 */
export function cleanMarkdown(markdown: string): string {
  return markdown
    // Remove excessive blank lines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    // Trim start and end
    .trim();
}

/**
 * Main export: Convert HTML or plain text to clean Markdown
 */
export function convertToMarkdown(content: string, isHtml: boolean = true): string {
  let markdown: string;

  if (isHtml) {
    markdown = htmlToMarkdown(content);
  } else {
    markdown = plainTextToMarkdown(content);
  }

  return cleanMarkdown(markdown);
}

export default {
  htmlToMarkdown,
  plainTextToMarkdown,
  cleanMarkdown,
  convertToMarkdown,
};
