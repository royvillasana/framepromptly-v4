// FigJam Plugin for FramePromptly Import
// This plugin imports workshop content from FramePromptly's ephemeral URLs

interface DeliveryItem {
  id: string;
  type: 'sticky' | 'text' | 'shape';
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
  };
  clusterId?: string;
  metadata?: Record<string, any>;
}

interface DeliveryPayload {
  id: string;
  destination: 'figjam';
  items: DeliveryItem[];
  layoutHints: {
    columns?: number;
    spacing?: number;
    arrangement?: 'grid' | 'flow' | 'clusters';
  };
  summary: string;
  itemCount: number;
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

// Color mapping for different categories
const CATEGORY_COLORS = {
  'idea': '#FFE066',      // Yellow
  'hmw': '#FF6B66',       // Red  
  'insight': '#66D9FF',   // Blue
  'action': '#66FF66',    // Green
  'question': '#FF9B66',  // Orange
  'default': '#E6E6E6'    // Gray
};

// Plugin main function
figma.showUI(__html__, { 
  width: 320, 
  height: 480,
  title: 'FramePromptly Import'
});

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

  figma.ui.postMessage({ type: 'status', message: 'Fetching content...' });

  try {
    // Fetch the payload from the ephemeral URL
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

  figma.ui.postMessage({ type: 'status', message: 'Processing JSON...' });

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
    message: `Creating ${payload.items.length} workshop items...` 
  });

  // Clear current selection
  figma.currentPage.selection = [];

  const createdNodes: SceneNode[] = [];
  let processedCount = 0;

  // Group items by cluster if available
  const clusters = new Map<string, DeliveryItem[]>();
  const ungroupedItems: DeliveryItem[] = [];

  payload.items.forEach(item => {
    if (item.clusterId) {
      if (!clusters.has(item.clusterId)) {
        clusters.set(item.clusterId, []);
      }
      clusters.get(item.clusterId)!.push(item);
    } else {
      ungroupedItems.push(item);
    }
  });

  try {
    // Create clustered items
    for (const [clusterId, clusterItems] of clusters.entries()) {
      const clusterNodes = await createItemsForCluster(clusterItems, clusterId);
      createdNodes.push(...clusterNodes);
      
      processedCount += clusterItems.length;
      figma.ui.postMessage({ 
        type: 'progress', 
        current: processedCount, 
        total: payload.items.length 
      });
    }

    // Create ungrouped items
    for (const item of ungroupedItems) {
      const node = await createFigJamNode(item);
      if (node) {
        createdNodes.push(node);
      }
      
      processedCount++;
      figma.ui.postMessage({ 
        type: 'progress', 
        current: processedCount, 
        total: payload.items.length 
      });
    }

    // Position nodes according to layout hints
    if (payload.layoutHints.arrangement === 'grid') {
      arrangeInGrid(createdNodes, payload.layoutHints);
    } else if (payload.layoutHints.arrangement === 'flow') {
      arrangeInFlow(createdNodes, payload.layoutHints);
    }

    // Select all created nodes
    figma.currentPage.selection = createdNodes;

    // Center viewport on created content
    if (createdNodes.length > 0) {
      figma.viewport.scrollAndZoomIntoView(createdNodes);
    }

    figma.ui.postMessage({
      type: 'success',
      message: `Successfully imported ${createdNodes.length} items!`,
      details: {
        total: payload.items.length,
        created: createdNodes.length,
        clusters: clusters.size,
        summary: payload.summary
      }
    });

  } catch (error) {
    throw new Error(`Failed to create items: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createItemsForCluster(items: DeliveryItem[], clusterId: string): Promise<SceneNode[]> {
  const clusterNodes: SceneNode[] = [];
  
  // Create a cluster header if we have multiple items
  if (items.length > 1) {
    const headerItem: DeliveryItem = {
      id: `${clusterId}-header`,
      type: 'text',
      text: clusterId.replace(/[-_]/g, ' ').toUpperCase(),
      x: items[0].x,
      y: items[0].y - 60,
      style: {
        fontSize: 16,
        color: '#333333'
      }
    };
    
    const headerNode = await createFigJamNode(headerItem);
    if (headerNode) {
      clusterNodes.push(headerNode);
    }
  }

  // Create cluster items
  for (const item of items) {
    const node = await createFigJamNode(item);
    if (node) {
      clusterNodes.push(node);
    }
  }

  return clusterNodes;
}

async function createFigJamNode(item: DeliveryItem): Promise<SceneNode | null> {
  try {
    switch (item.type) {
      case 'sticky':
        return createStickyNote(item);
      
      case 'text':
        return createTextNode(item);
        
      case 'shape':
        return createShapeNode(item);
        
      default:
        console.warn(`Unsupported item type: ${item.type}`);
        return createStickyNote(item); // Fallback to sticky
    }
  } catch (error) {
    console.error(`Failed to create ${item.type} node:`, error);
    return null;
  }
}

function createStickyNote(item: DeliveryItem): StickyNode {
  const sticky = figma.createSticky();
  
  sticky.text.characters = item.text || '';
  sticky.x = item.x || 0;
  sticky.y = item.y || 0;
  
  // Set size
  if (item.width && item.height) {
    sticky.resize(item.width, item.height);
  } else {
    sticky.resize(160, 160); // Default FigJam sticky size
  }
  
  // Set color based on cluster or style
  const color = getItemColor(item);
  if (color) {
    sticky.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
  }
  
  return sticky;
}

function createTextNode(item: DeliveryItem): TextNode {
  const textNode = figma.createText();
  
  textNode.characters = item.text || '';
  textNode.x = item.x || 0;
  textNode.y = item.y || 0;
  
  // Set font size
  const fontSize = item.style?.fontSize || 14;
  textNode.fontSize = fontSize;
  
  // Set color
  const color = item.style?.color || '#000000';
  textNode.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
  
  // Auto-resize
  textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
  
  return textNode;
}

function createShapeNode(item: DeliveryItem): RectangleNode {
  const shape = figma.createRectangle();
  
  shape.x = item.x || 0;
  shape.y = item.y || 0;
  shape.resize(item.width || 200, item.height || 100);
  
  // Set background color
  const bgColor = item.style?.backgroundColor || '#F0F0F0';
  shape.fills = [{ type: 'SOLID', color: hexToRgb(bgColor) }];
  
  // Add stroke
  shape.strokes = [{ type: 'SOLID', color: hexToRgb('#CCCCCC') }];
  shape.strokeWeight = 2;
  
  // Add text if provided
  if (item.text) {
    const textNode = figma.createText();
    textNode.characters = item.text;
    textNode.fontSize = item.style?.fontSize || 12;
    textNode.textAlignHorizontal = 'CENTER';
    textNode.textAlignVertical = 'CENTER';
    textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
    
    // Center text on shape
    textNode.x = shape.x + (shape.width - textNode.width) / 2;
    textNode.y = shape.y + (shape.height - textNode.height) / 2;
  }
  
  return shape;
}

function getItemColor(item: DeliveryItem): string {
  // Priority order: explicit style color > cluster-based color > category color > default
  
  if (item.style?.backgroundColor) {
    return item.style.backgroundColor;
  }
  
  if (item.clusterId) {
    // Use cluster ID to determine color
    const clusterId = item.clusterId.toLowerCase();
    
    for (const [category, color] of Object.entries(CATEGORY_COLORS)) {
      if (clusterId.includes(category)) {
        return color;
      }
    }
  }
  
  return CATEGORY_COLORS.default;
}

function arrangeInGrid(nodes: SceneNode[], layoutHints: any) {
  const columns = layoutHints.columns || 4;
  const spacing = layoutHints.spacing || 20;
  const startX = 100;
  const startY = 100;
  
  nodes.forEach((node, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    node.x = startX + col * (200 + spacing);
    node.y = startY + row * (160 + spacing);
  });
}

function arrangeInFlow(nodes: SceneNode[], layoutHints: any) {
  const spacing = layoutHints.spacing || 20;
  let currentX = 100;
  let currentY = 100;
  let maxHeight = 0;
  const maxWidth = figma.viewport.bounds.width - 200;
  
  nodes.forEach((node) => {
    // Check if we need to wrap to next row
    if (currentX + node.width > maxWidth) {
      currentX = 100;
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
  message: 'FramePromptly Import plugin is ready!'
});