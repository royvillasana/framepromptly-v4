// Figma Plugin for FramePromptly Import
// This plugin imports UI components and design system elements from FramePromptly

interface DeliveryItem {
  id: string;
  type: 'frame' | 'text' | 'sticky' | 'shape';
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: {
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
  };
  metadata?: {
    description?: string;
    copy?: Record<string, string>;
    priority?: string;
  };
}

interface DeliveryPayload {
  id: string;
  destination: 'figma';
  items: DeliveryItem[];
  layoutHints: {
    columns?: number;
    spacing?: number;
    arrangement?: 'grid' | 'flow';
  };
  summary: string;
  itemCount: number;
  designSystem?: string;
  contentStyle?: {
    tone: string;
    readingLevel: string;
    accessibility: any;
  };
}

interface ImportResponse {
  success: boolean;
  data?: {
    payload: DeliveryPayload;
    instructions: any;
  };
  error?: string;
  code?: string;
}

// Default styling constants
const DEFAULT_STYLES = {
  frame: {
    fill: '#FFFFFF',
    stroke: '#E5E5E5',
    strokeWeight: 1,
    cornerRadius: 8
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 14,
    fill: '#1A1A1A',
    lineHeight: 1.4
  },
  component: {
    padding: 16,
    gap: 8
  }
};

// Plugin main function
figma.showUI(__html__, { 
  width: 320, 
  height: 520,
  title: 'FramePromptly Import'
});

// Load fonts
async function loadFonts() {
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  } catch (error) {
    console.warn('Could not load Inter font, using default');
  }
}

// Initialize fonts
loadFonts();

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'import-url':
        await handleImportFromUrl(msg.url);
        break;
        
      case 'import-json':
        await handleImportFromJson(msg.json);
        break;
        
      case 'close':
        figma.closePlugin();
        break;
        
      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

async function handleImportFromUrl(url: string) {
  if (!url || !url.trim()) {
    throw new Error('Import URL is required');
  }

  figma.ui.postMessage({ type: 'status', message: 'Fetching design components...' });

  try {
    const response = await fetch(url.trim());
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch content (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.code === 'EXPIRED_URL' || errorData.code === 'EXPIRED_IMPORT') {
          errorMessage = 'Import link has expired. Please generate a new one.';
        }
      } catch (e) {
        // Use default error message
      }
      
      throw new Error(errorMessage);
    }

    const importResponse: ImportResponse = await response.json();
    
    if (!importResponse.success) {
      throw new Error(importResponse.error || 'Import failed');
    }

    if (!importResponse.data) {
      throw new Error('No data received from import URL');
    }

    await processImportData(importResponse.data);
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to FramePromptly. Please check your internet connection.');
      }
    }
    throw error;
  }
}

async function handleImportFromJson(jsonString: string) {
  if (!jsonString || !jsonString.trim()) {
    throw new Error('JSON content is required');
  }

  figma.ui.postMessage({ type: 'status', message: 'Processing design data...' });

  try {
    const importResponse: ImportResponse = JSON.parse(jsonString.trim());
    
    if (!importResponse.success) {
      throw new Error(importResponse.error || 'Import failed');
    }

    if (!importResponse.data) {
      throw new Error('No data found in JSON');
    }

    await processImportData(importResponse.data);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check your content.');
    }
    throw error;
  }
}

async function processImportData(data: { payload: DeliveryPayload; instructions: any }) {
  const { payload, instructions } = data;
  
  figma.ui.postMessage({ 
    type: 'status', 
    message: `Creating ${payload.items.length} UI components...` 
  });

  // Clear current selection
  figma.currentPage.selection = [];

  const createdNodes: SceneNode[] = [];
  let processedCount = 0;

  // Create a master frame to contain all components
  const masterFrame = figma.createFrame();
  masterFrame.name = payload.designSystem || 'FramePromptly Import';
  masterFrame.fills = []; // Transparent background
  
  try {
    // Process each item
    for (const item of payload.items) {
      const node = await createFigmaComponent(item, payload);
      if (node) {
        masterFrame.appendChild(node);
        createdNodes.push(node);
      }
      
      processedCount++;
      figma.ui.postMessage({ 
        type: 'progress', 
        current: processedCount, 
        total: payload.items.length 
      });
    }

    // Arrange components according to layout hints
    if (payload.layoutHints.arrangement === 'grid') {
      arrangeInGrid(createdNodes, payload.layoutHints);
    } else {
      arrangeInFlow(createdNodes, payload.layoutHints);
    }

    // Resize master frame to fit content
    masterFrame.resize(
      Math.max(...createdNodes.map(n => n.x + n.width)) + 40,
      Math.max(...createdNodes.map(n => n.y + n.height)) + 40
    );

    // Select the master frame
    figma.currentPage.selection = [masterFrame];

    // Center viewport on created content
    figma.viewport.scrollAndZoomIntoView([masterFrame]);

    figma.ui.postMessage({
      type: 'success',
      message: `Successfully imported ${createdNodes.length} components!`,
      details: {
        total: payload.items.length,
        created: createdNodes.length,
        designSystem: payload.designSystem,
        summary: payload.summary
      }
    });

  } catch (error) {
    // Clean up master frame if error occurs
    masterFrame.remove();
    throw new Error(`Failed to create components: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createFigmaComponent(item: DeliveryItem, payload: DeliveryPayload): Promise<SceneNode | null> {
  try {
    switch (item.type) {
      case 'frame':
        return await createUIFrame(item);
      
      case 'text':
        return await createTextComponent(item);
        
      case 'sticky':
        // Convert sticky to frame-based component for Figma
        return await createStickyAsFrame(item);
        
      case 'shape':
        return await createShapeComponent(item);
        
      default:
        console.warn(`Unsupported item type: ${item.type}`);
        return await createUIFrame(item); // Fallback to frame
    }
  } catch (error) {
    console.error(`Failed to create ${item.type} component:`, error);
    return null;
  }
}

async function createUIFrame(item: DeliveryItem): Promise<FrameNode> {
  const frame = figma.createFrame();
  
  frame.name = item.text || `Component ${item.id}`;
  frame.x = item.x || 0;
  frame.y = item.y || 0;
  frame.resize(item.width || 280, item.height || 180);
  
  // Set frame styling
  frame.fills = [{
    type: 'SOLID',
    color: hexToRgb(item.style?.backgroundColor || DEFAULT_STYLES.frame.fill)
  }];
  
  frame.strokes = [{
    type: 'SOLID',
    color: hexToRgb(DEFAULT_STYLES.frame.stroke)
  }];
  frame.strokeWeight = DEFAULT_STYLES.frame.strokeWeight;
  frame.cornerRadius = item.style?.borderRadius || DEFAULT_STYLES.frame.cornerRadius;

  // Add auto layout
  frame.layoutMode = 'VERTICAL';
  frame.paddingTop = frame.paddingBottom = DEFAULT_STYLES.component.padding;
  frame.paddingLeft = frame.paddingRight = DEFAULT_STYLES.component.padding;
  frame.itemSpacing = DEFAULT_STYLES.component.gap;

  // Add title if provided
  if (item.text) {
    const title = figma.createText();
    title.name = 'Title';
    title.characters = item.text;
    title.fontSize = item.style?.fontSize || 16;
    title.fontName = { family: "Inter", style: "Semi Bold" };
    title.fills = [{ type: 'SOLID', color: hexToRgb('#1A1A1A') }];
    frame.appendChild(title);
  }

  // Add description if available in metadata
  if (item.metadata?.description) {
    const description = figma.createText();
    description.name = 'Description';
    description.characters = item.metadata.description;
    description.fontSize = 14;
    description.fontName = { family: "Inter", style: "Regular" };
    description.fills = [{ type: 'SOLID', color: hexToRgb('#666666') }];
    description.textAutoResize = 'WIDTH_AND_HEIGHT';
    frame.appendChild(description);
  }

  // Add copy elements if available
  if (item.metadata?.copy) {
    for (const [key, value] of Object.entries(item.metadata.copy)) {
      const copyText = figma.createText();
      copyText.name = key;
      copyText.characters = value;
      copyText.fontSize = 12;
      copyText.fontName = { family: "Inter", style: "Regular" };
      copyText.fills = [{ type: 'SOLID', color: hexToRgb('#333333') }];
      copyText.textAutoResize = 'WIDTH_AND_HEIGHT';
      frame.appendChild(copyText);
    }
  }

  return frame;
}

async function createTextComponent(item: DeliveryItem): Promise<TextNode> {
  const textNode = figma.createText();
  
  textNode.name = 'Text Component';
  textNode.characters = item.text || 'Text content';
  textNode.x = item.x || 0;
  textNode.y = item.y || 0;
  
  // Set text styling
  textNode.fontSize = item.style?.fontSize || DEFAULT_STYLES.text.fontSize;
  textNode.fontName = { 
    family: "Inter", 
    style: item.style?.fontWeight === 'bold' ? "Semi Bold" : "Regular" 
  };
  textNode.fills = [{ type: 'SOLID', color: hexToRgb('#1A1A1A') }];
  
  // Set line height
  textNode.lineHeight = {
    value: DEFAULT_STYLES.text.lineHeight,
    unit: 'PERCENT'
  };
  
  // Auto-resize
  textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  return textNode;
}

async function createStickyAsFrame(item: DeliveryItem): Promise<FrameNode> {
  const frame = figma.createFrame();
  
  frame.name = `Sticky: ${item.text?.slice(0, 20) || 'Note'}`;
  frame.x = item.x || 0;
  frame.y = item.y || 0;
  frame.resize(item.width || 200, item.height || 120);
  
  // Sticky-like styling
  frame.fills = [{
    type: 'SOLID',
    color: hexToRgb(item.style?.backgroundColor || '#FFF9C4') // Light yellow
  }];
  
  frame.strokes = [{
    type: 'SOLID',
    color: hexToRgb('#E6E6E6')
  }];
  frame.strokeWeight = 1;
  frame.cornerRadius = 4;

  // Add auto layout
  frame.layoutMode = 'VERTICAL';
  frame.paddingTop = frame.paddingBottom = 12;
  frame.paddingLeft = frame.paddingRight = 12;
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';

  // Add text content
  if (item.text) {
    const text = figma.createText();
    text.name = 'Note Text';
    text.characters = item.text;
    text.fontSize = 12;
    text.fontName = { family: "Inter", style: "Regular" };
    text.fills = [{ type: 'SOLID', color: hexToRgb('#333333') }];
    text.textAlignHorizontal = 'CENTER';
    text.textAlignVertical = 'CENTER';
    text.textAutoResize = 'WIDTH_AND_HEIGHT';
    frame.appendChild(text);
  }

  return frame;
}

async function createShapeComponent(item: DeliveryItem): Promise<RectangleNode> {
  const shape = figma.createRectangle();
  
  shape.name = `Shape: ${item.text || 'Rectangle'}`;
  shape.x = item.x || 0;
  shape.y = item.y || 0;
  shape.resize(item.width || 200, item.height || 100);
  
  // Set shape styling
  shape.fills = [{
    type: 'SOLID',
    color: hexToRgb(item.style?.backgroundColor || '#F0F0F0')
  }];
  
  shape.strokes = [{
    type: 'SOLID',
    color: hexToRgb('#CCCCCC')
  }];
  shape.strokeWeight = 2;
  shape.cornerRadius = item.style?.borderRadius || 8;
  
  return shape;
}

function arrangeInGrid(nodes: SceneNode[], layoutHints: any) {
  const columns = layoutHints.columns || 3;
  const spacing = layoutHints.spacing || 40;
  const startX = 20;
  const startY = 20;
  
  nodes.forEach((node, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    node.x = startX + col * (300 + spacing);
    node.y = startY + row * (200 + spacing);
  });
}

function arrangeInFlow(nodes: SceneNode[], layoutHints: any) {
  const spacing = layoutHints.spacing || 40;
  let currentX = 20;
  let currentY = 20;
  let maxHeight = 0;
  const maxWidth = 1200; // Max width for flow layout
  
  nodes.forEach((node) => {
    // Check if we need to wrap to next row
    if (currentX + node.width > maxWidth) {
      currentX = 20;
      currentY += maxHeight + spacing;
      maxHeight = 0;
    }
    
    node.x = currentX;
    node.y = currentY;
    
    currentX += node.width + spacing;
    maxHeight = Math.max(maxHeight, node.height);
  });
}

// Utility functions
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0, g: 0, b: 0 };
}

// Initialize plugin
figma.ui.postMessage({ 
  type: 'ready',
  message: 'FramePromptly Import plugin is ready for UI components!'
});