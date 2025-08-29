// FigJam Plugin for FramePromptly Import
// This plugin imports workshop content from FramePromptly's ephemeral URLs
// Color mapping for different categories
const CATEGORY_COLORS = {
    'idea': '#FFE066', // Yellow
    'hmw': '#FF6B66', // Red  
    'insight': '#66D9FF', // Blue
    'action': '#66FF66', // Green
    'question': '#FF9B66', // Orange
    'default': '#E6E6E6' // Gray
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
    }
    catch (error) {
        console.error('Plugin error:', error);
        figma.ui.postMessage({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};
async function handleImportFromUrl(url) {
    if (!url || !url.trim()) {
        throw new Error('Import URL is required');
    }
    figma.ui.postMessage({ type: 'status', message: 'Fetching content...' });
    try {
        // Fetch the payload from the ephemeral URL
        const response = await fetch(url.trim(), {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZmFvbWFudHJ0bXR5ZGJlbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTczNTAsImV4cCI6MjA3MTEzMzM1MH0.6oQtHv6OcLkdHvmBPkTnTHEIuF0_GudFxhebVg9atq0',
                'Content-Type': 'application/json'
            }
        });
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
            }
            catch (e) {
                // Use default error message
            }
            throw new Error(errorMessage);
        }
        const importResponse = await response.json();
        if (!importResponse.success) {
            throw new Error(importResponse.error || 'Import failed');
        }
        if (!importResponse.data) {
            throw new Error('No data received from import URL');
        }
        await processImportData(importResponse.data);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Unable to connect to FramePromptly. Please check your internet connection.');
            }
        }
        throw error;
    }
}
async function handleImportFromJson(jsonString) {
    if (!jsonString || !jsonString.trim()) {
        throw new Error('JSON content is required');
    }
    figma.ui.postMessage({ type: 'status', message: 'Processing JSON...' });
    try {
        const importResponse = JSON.parse(jsonString.trim());
        if (!importResponse.success) {
            throw new Error(importResponse.error || 'Import failed');
        }
        if (!importResponse.data) {
            throw new Error('No data found in JSON');
        }
        await processImportData(importResponse.data);
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid JSON format. Please check your content.');
        }
        throw error;
    }
}
async function processImportData(data) {
    const { payload, instructions } = data;
    
    // Validate payload structure
    if (!payload) {
        throw new Error('No payload provided in import data');
    }
    if (!payload.items || !Array.isArray(payload.items)) {
        throw new Error('Payload must contain an items array');
    }
    if (payload.items.length === 0) {
        throw new Error('Payload contains no items to import');
    }
    
    figma.ui.postMessage({
        type: 'status',
        message: `Creating ${payload.workshopTitle || 'workshop'} with ${payload.items.length} items...`
    });
    
    // Clear current selection
    figma.currentPage.selection = [];
    const createdNodes = [];
    let processedCount = 0;
    
    try {
        // Create workshop sections first if available
        if (payload.sections && Array.isArray(payload.sections)) {
            for (const section of payload.sections) {
                const sectionNodes = await createWorkshopSection(section);
                createdNodes.push(...sectionNodes);
                figma.ui.postMessage({
                    type: 'progress',
                    current: processedCount,
                    total: payload.items.length + payload.sections.length
                });
            }
        }
        
        // Group items by cluster if available
        const clusters = new Map();
        const ungroupedItems = [];
        payload.items.forEach(item => {
            if (item.clusterId) {
                if (!clusters.has(item.clusterId)) {
                    clusters.set(item.clusterId, []);
                }
                clusters.get(item.clusterId).push(item);
            }
            else {
                ungroupedItems.push(item);
            }
        });
        
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
        
        // Add workshop title if provided
        if (payload.workshopTitle) {
            const titleNode = await createWorkshopTitle(payload.workshopTitle);
            if (titleNode) {
                createdNodes.unshift(titleNode); // Add at beginning
            }
        }
        
        // Position nodes according to enhanced layout hints
        if (payload.layoutHints) {
            if (payload.layoutHints.arrangement === 'sectioned') {
                // Items are already positioned by sections, no additional positioning needed
                console.log('Using sectioned layout from AI-generated positions');
            }
            else if (payload.layoutHints.arrangement === 'grid') {
                arrangeInGrid(createdNodes, payload.layoutHints);
            }
            else if (payload.layoutHints.arrangement === 'flow') {
                arrangeInFlow(createdNodes, payload.layoutHints);
            }
        }
        
        // Select all created nodes
        figma.currentPage.selection = createdNodes;
        
        // Center viewport on created content
        if (createdNodes.length > 0) {
            figma.viewport.scrollAndZoomIntoView(createdNodes);
        }
        
        figma.ui.postMessage({
            type: 'success',
            message: `Successfully imported workshop "${payload.workshopTitle || 'Untitled'}" with ${createdNodes.length} elements!`,
            details: {
                total: payload.items.length,
                created: createdNodes.length,
                sections: (payload.sections && payload.sections.length) ? payload.sections.length : 0,
                clusters: clusters.size,
                workshopTitle: payload.workshopTitle
            }
        });
    }
    catch (error) {
        throw new Error(`Failed to create workshop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function createItemsForCluster(items, clusterId) {
    const clusterNodes = [];
    // Create a cluster header if we have multiple items
    if (items.length > 1) {
        const headerItem = {
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
async function createFigJamNode(item) {
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
    }
    catch (error) {
        console.error(`Failed to create ${item.type} node:`, error);
        return null;
    }
}
function createStickyNote(item) {
    const sticky = figma.createSticky();
    sticky.text.characters = item.text || '';
    sticky.x = item.x || 0;
    sticky.y = item.y || 0;
    // Set size
    if (item.width && item.height) {
        sticky.resize(item.width, item.height);
    }
    else {
        sticky.resize(160, 160); // Default FigJam sticky size
    }
    // Set color based on cluster or style
    const color = getItemColor(item);
    if (color) {
        sticky.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
    }
    return sticky;
}
function createTextNode(item) {
    const textNode = figma.createText();
    textNode.characters = item.text || '';
    textNode.x = item.x || 0;
    textNode.y = item.y || 0;
    // Set font size
    const fontSize = (item.style && item.style.fontSize) ? item.style.fontSize : 14;
    textNode.fontSize = fontSize;
    // Set color
    const color = (item.style && item.style.color) ? item.style.color : '#000000';
    textNode.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
    // Auto-resize
    textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
    return textNode;
}
function createShapeNode(item) {
    const shape = figma.createRectangle();
    shape.x = item.x || 0;
    shape.y = item.y || 0;
    shape.resize(item.width || 200, item.height || 100);
    // Set background color
    const bgColor = (item.style && item.style.backgroundColor) ? item.style.backgroundColor : '#F0F0F0';
    shape.fills = [{ type: 'SOLID', color: hexToRgb(bgColor) }];
    // Add stroke
    shape.strokes = [{ type: 'SOLID', color: hexToRgb('#CCCCCC') }];
    shape.strokeWeight = 2;
    // Add text if provided
    if (item.text) {
        const textNode = figma.createText();
        textNode.characters = item.text;
        textNode.fontSize = (item.style && item.style.fontSize) ? item.style.fontSize : 12;
        textNode.textAlignHorizontal = 'CENTER';
        textNode.textAlignVertical = 'CENTER';
        textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
        // Center text on shape
        textNode.x = shape.x + (shape.width - textNode.width) / 2;
        textNode.y = shape.y + (shape.height - textNode.height) / 2;
    }
    return shape;
}
function getItemColor(item) {
    // Priority order: explicit style color > cluster-based color > category color > default
    if (item.style && item.style.backgroundColor) {
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
function arrangeInGrid(nodes, layoutHints) {
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
function arrangeInFlow(nodes, layoutHints) {
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
// Workshop section creation functions
async function createWorkshopSection(section) {
    const sectionNodes = [];
    
    // Create section background rectangle
    const background = figma.createRectangle();
    background.name = section.name;
    background.x = section.x;
    background.y = section.y;
    background.resize(section.width, section.height);
    background.fills = [{ 
        type: 'SOLID', 
        color: hexToRgb(section.backgroundColor || '#F5F5F5') 
    }];
    background.strokes = [{ type: 'SOLID', color: hexToRgb('#DDDDDD') }];
    background.strokeWeight = 1;
    background.cornerRadius = 8;
    sectionNodes.push(background);
    
    // Create section title
    const titleText = figma.createText();
    titleText.name = `${section.name} - Title`;
    titleText.characters = section.name;
    titleText.fontSize = 18;
    titleText.fontWeight = 600;
    titleText.x = section.x + 20;
    titleText.y = section.y + 20;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    sectionNodes.push(titleText);
    
    // Add section elements based on type
    if (section.elements && Array.isArray(section.elements)) {
        let elementY = section.y + 60;
        
        for (const elementType of section.elements) {
            const elementNode = await createSectionElement(elementType, section.x + 20, elementY, section.width - 40);
            if (elementNode) {
                sectionNodes.push(elementNode);
                elementY += elementNode.height + 10;
            }
        }
    }
    
    return sectionNodes;
}

async function createSectionElement(elementType, x, y, maxWidth) {
    switch (elementType) {
        case 'timer':
            return createTimerElement(x, y);
        case 'instructions':
            return createInstructionElement(x, y, maxWidth);
        case 'voting':
            return createVotingArea(x, y);
        case 'examples':
            return createExampleArea(x, y, maxWidth);
        default:
            return createPlaceholderElement(elementType, x, y);
    }
}

function createTimerElement(x, y) {
    const timer = figma.createEllipse();
    timer.name = 'Workshop Timer';
    timer.x = x;
    timer.y = y;
    timer.resize(60, 60);
    timer.fills = [{ type: 'SOLID', color: hexToRgb('#FFE066') }];
    timer.strokes = [{ type: 'SOLID', color: hexToRgb('#FFA500') }];
    timer.strokeWeight = 2;
    
    // Add timer text
    const timerText = figma.createText();
    timerText.characters = '⏰';
    timerText.fontSize = 24;
    timerText.x = x + 18;
    timerText.y = y + 18;
    timerText.textAutoResize = 'WIDTH_AND_HEIGHT';
    
    return timer;
}

function createInstructionElement(x, y, maxWidth) {
    const instruction = figma.createRectangle();
    instruction.name = 'Instructions Area';
    instruction.x = x;
    instruction.y = y;
    instruction.resize(maxWidth, 80);
    instruction.fills = [{ type: 'SOLID', color: hexToRgb('#E3F2FD') }];
    instruction.strokes = [{ type: 'SOLID', color: hexToRgb('#2196F3') }];
    instruction.strokeWeight = 1;
    instruction.strokeDashes = [4, 4];
    instruction.cornerRadius = 4;
    
    return instruction;
}

function createVotingArea(x, y) {
    const voting = figma.createRectangle();
    voting.name = 'Voting Area';
    voting.x = x;
    voting.y = y;
    voting.resize(150, 100);
    voting.fills = [{ type: 'SOLID', color: hexToRgb('#FFF3E0') }];
    voting.strokes = [{ type: 'SOLID', color: hexToRgb('#FF9800') }];
    voting.strokeWeight = 2;
    voting.cornerRadius = 8;
    
    return voting;
}

function createExampleArea(x, y, maxWidth) {
    const example = figma.createRectangle();
    example.name = 'Example Area';
    example.x = x;
    example.y = y;
    example.resize(Math.min(maxWidth, 300), 120);
    example.fills = [{ type: 'SOLID', color: hexToRgb('#F3E5F5') }];
    example.strokes = [{ type: 'SOLID', color: hexToRgb('#9C27B0') }];
    example.strokeWeight = 1;
    example.cornerRadius = 6;
    
    return example;
}

function createPlaceholderElement(elementType, x, y) {
    const placeholder = figma.createRectangle();
    placeholder.name = `${elementType} Element`;
    placeholder.x = x;
    placeholder.y = y;
    placeholder.resize(200, 60);
    placeholder.fills = [{ type: 'SOLID', color: hexToRgb('#F5F5F5') }];
    placeholder.strokes = [{ type: 'SOLID', color: hexToRgb('#CCCCCC') }];
    placeholder.strokeWeight = 1;
    placeholder.cornerRadius = 4;
    
    return placeholder;
}

async function createWorkshopTitle(title) {
    const titleNode = figma.createText();
    titleNode.name = 'Workshop Title';
    titleNode.characters = title;
    titleNode.fontSize = 28;
    titleNode.fontWeight = 700;
    titleNode.x = 100;
    titleNode.y = 50;
    titleNode.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    titleNode.textAutoResize = 'WIDTH_AND_HEIGHT';
    
    // Add decorative underline
    const underline = figma.createRectangle();
    underline.name = 'Title Underline';
    underline.x = 100;
    underline.y = titleNode.y + titleNode.height + 5;
    underline.resize(titleNode.width, 3);
    underline.fills = [{ type: 'SOLID', color: hexToRgb('#2196F3') }];
    underline.cornerRadius = 2;
    
    return titleNode;
}

// Utility functions
function hexToRgb(hex) {
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
