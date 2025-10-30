import { Node } from '@xyflow/react';

export interface NodeSpacing {
  horizontal: number;
  vertical: number;
  framework: { width: number; height: number };
  stage: { width: number; height: number };
  tool: { width: number; height: number };
  prompt: { width: number; height: number };
  'custom-prompt': { width: number; height: number };
  'ai-builder': { width: number; height: number };
}

export const DEFAULT_SPACING: NodeSpacing = {
  horizontal: 420,
  vertical: 280,
  framework: { width: 320, height: 200 },
  stage: { width: 280, height: 180 },
  tool: { width: 280, height: 160 },
  prompt: { width: 800, height: 300 },
  'custom-prompt': { width: 320, height: 200 },
  'ai-builder': { width: 600, height: 400 }
};

export interface PositionCalculator {
  getNextPosition: (nodeType: string, existingNodes: Node[], preferredX?: number, preferredY?: number) => { x: number; y: number };
  getGridPosition: (row: number, col: number, nodeType: string) => { x: number; y: number };
  getConnectedPosition: (sourceNode: Node, targetNodeType: string, existingNodes: Node[]) => { x: number; y: number };
  getAvailablePosition: (nodeType: string, existingNodes: Node[], startX?: number, startY?: number) => { x: number; y: number };
}

export function createPositionCalculator(spacing: NodeSpacing = DEFAULT_SPACING): PositionCalculator {
  
  const getNodeDimensions = (nodeType: string) => {
    switch (nodeType) {
      case 'framework': return spacing.framework;
      case 'stage': return spacing.stage;
      case 'tool': return spacing.tool;
      case 'prompt': return spacing.prompt;
      case 'custom-prompt': return spacing['custom-prompt'];
      case 'ai-builder': return spacing['ai-builder'];
      default: return spacing.tool;
    }
  };

  const isPositionOccupied = (x: number, y: number, nodeType: string, existingNodes: Node[], buffer = 80) => {
    const dimensions = getNodeDimensions(nodeType);
    
    return existingNodes.some(node => {
      const nodeDimensions = getNodeDimensions(node.type || 'tool');
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      
      // Check for overlap with increased buffer for better spacing
      const overlapX = x < nodeX + nodeDimensions.width + buffer && x + dimensions.width + buffer > nodeX;
      const overlapY = y < nodeY + nodeDimensions.height + buffer && y + dimensions.height + buffer > nodeY;
      
      return overlapX && overlapY;
    });
  };

  const getGridPosition = (row: number, col: number, nodeType: string) => {
    return {
      x: col * spacing.horizontal,
      y: row * spacing.vertical
    };
  };

  const getNextPosition = (nodeType: string, existingNodes: Node[], preferredX = 0, preferredY = 0) => {
    // If no preferred position, start from origin
    let x = preferredX;
    let y = preferredY;
    
    // If position is occupied, find the next available position
    if (isPositionOccupied(x, y, nodeType, existingNodes)) {
      return getAvailablePosition(nodeType, existingNodes, x, y);
    }
    
    return { x, y };
  };

  const getConnectedPosition = (sourceNode: Node, targetNodeType: string, existingNodes: Node[]) => {
    const sourceDimensions = getNodeDimensions(sourceNode.type || 'tool');
    const targetDimensions = getNodeDimensions(targetNodeType);
    
    // For prompt nodes, check if there are existing prompts connected to this tool
    if (targetNodeType === 'prompt') {
      const connectedPrompts = existingNodes.filter(node => 
        node.type === 'prompt' && 
        node.data?.sourceToolId === sourceNode.id
      );
      
      // If there are existing prompts, stack them vertically
      if (connectedPrompts.length > 0) {
        const baseY = sourceNode.position.y + (sourceDimensions.height - targetDimensions.height) / 2;
        const stackedY = baseY + (connectedPrompts.length * (targetDimensions.height + 80));
        
        const stackedPosition = {
          x: sourceNode.position.x + sourceDimensions.width + spacing.horizontal * 0.8,
          y: stackedY
        };
        
        if (!isPositionOccupied(stackedPosition.x, stackedPosition.y, targetNodeType, existingNodes)) {
          return stackedPosition;
        }
      }
    }
    
    // Try multiple positions around the source node with better spacing
    const positions = [
      // Right of source
      {
        x: sourceNode.position.x + sourceDimensions.width + spacing.horizontal * 0.8,
        y: sourceNode.position.y + (sourceDimensions.height - targetDimensions.height) / 2
      },
      // Below source
      {
        x: sourceNode.position.x + (sourceDimensions.width - targetDimensions.width) / 2,
        y: sourceNode.position.y + sourceDimensions.height + spacing.vertical * 0.6
      },
      // Above source
      {
        x: sourceNode.position.x + (sourceDimensions.width - targetDimensions.width) / 2,
        y: sourceNode.position.y - targetDimensions.height - spacing.vertical * 0.6
      },
      // Left of source
      {
        x: sourceNode.position.x - targetDimensions.width - spacing.horizontal * 0.8,
        y: sourceNode.position.y + (sourceDimensions.height - targetDimensions.height) / 2
      }
    ];
    
    // Try each position and return the first available one
    for (const pos of positions) {
      const x = Math.max(pos.x, 0);
      const y = Math.max(pos.y, 0);
      
      if (!isPositionOccupied(x, y, targetNodeType, existingNodes)) {
        return { x, y };
      }
    }
    
    // Fallback to grid-based positioning if all preferred positions are occupied
    return getAvailablePosition(targetNodeType, existingNodes, sourceNode.position.x, sourceNode.position.y);
  };

  const getAvailablePosition = (nodeType: string, existingNodes: Node[], startX = 0, startY = 0) => {
    const maxCols = 15;
    const maxRows = 25;
    
    // Start from a clean grid position if no preferred start position
    const gridStartX = startX || 100;
    const gridStartY = startY || 100;
    
    // Grid search with improved spacing
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        const x = gridStartX + (col * spacing.horizontal);
        const y = gridStartY + (row * spacing.vertical);
        
        if (!isPositionOccupied(x, y, nodeType, existingNodes)) {
          return { x, y };
        }
      }
    }
    
    // If grid is full, use a spiral pattern outward
    const spiralRadius = Math.max(spacing.horizontal, spacing.vertical);
    for (let radius = 1; radius <= 10; radius++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const x = gridStartX + Math.cos(angle * Math.PI / 180) * radius * spiralRadius;
        const y = gridStartY + Math.sin(angle * Math.PI / 180) * radius * spiralRadius;
        
        if (x >= 0 && y >= 0 && !isPositionOccupied(x, y, nodeType, existingNodes)) {
          return { x: Math.round(x), y: Math.round(y) };
        }
      }
    }
    
    // Ultimate fallback
    return { 
      x: Math.max(100, existingNodes.length * 200), 
      y: Math.max(100, existingNodes.length * 150) 
    };
  };

  return {
    getNextPosition,
    getGridPosition,
    getConnectedPosition,
    getAvailablePosition
  };
}

// Utility function to auto-layout existing nodes with hierarchical workflow layout
export function autoLayoutNodes(nodes: Node[], spacing: NodeSpacing = DEFAULT_SPACING): Node[] {
  // Phase 1: Analyze canvas nodes and detect relationships
  const nodeAnalysis = analyzeNodeRelationships(nodes);
  
  // Phase 2: Create hierarchical layout based on workflow structure
  return createHierarchicalLayout(nodeAnalysis, spacing);
}

// Analyze nodes and their relationships for hierarchical layout
function analyzeNodeRelationships(nodes: Node[]) {
  const frameworks = nodes.filter(n => n.type === 'framework');
  const stages = nodes.filter(n => n.type === 'stage');
  const tools = nodes.filter(n => n.type === 'tool');
  const prompts = nodes.filter(n => n.type === 'prompt');
  
  // Map stages to their related frameworks
  const stageToFramework = new Map<string, Node>();
  stages.forEach(stage => {
    // Find framework this stage belongs to based on data.framework or closest framework
    const relatedFramework = frameworks.find(fw => 
      stage.data?.framework?.id === fw.data?.framework?.id ||
      stage.data?.frameworkId === fw.id
    ) || frameworks[0]; // Fallback to first framework if no explicit relationship
    
    if (relatedFramework) {
      stageToFramework.set(stage.id, relatedFramework);
    }
  });
  
  // Map tools to their related stages
  const toolToStage = new Map<string, Node>();
  tools.forEach(tool => {
    // Find stage this tool belongs to based on data relationships
    const relatedStage = stages.find(stage => 
      tool.data?.stageId === stage.id ||
      tool.data?.stage?.id === stage.data?.stage?.id ||
      (tool.data?.tool?.stageId && stage.data?.stage?.id === tool.data.tool.stageId)
    ) || stages[0]; // Fallback to first stage if no explicit relationship
    
    if (relatedStage) {
      toolToStage.set(tool.id, relatedStage);
    }
  });
  
  // Map prompts to their related tools
  const promptToTool = new Map<string, Node>();
  prompts.forEach(prompt => {
    // Find tool this prompt belongs to based on data relationships
    const relatedTool = tools.find(tool => 
      prompt.data?.sourceToolId === tool.id ||
      prompt.data?.toolId === tool.id
    ) || tools[0]; // Fallback to first tool if no explicit relationship
    
    if (relatedTool) {
      promptToTool.set(prompt.id, relatedTool);
    }
  });
  
  // Group stages by framework
  const frameworkToStages = new Map<string, Node[]>();
  frameworks.forEach(fw => {
    const relatedStages = stages.filter(stage => stageToFramework.get(stage.id)?.id === fw.id);
    frameworkToStages.set(fw.id, relatedStages);
  });
  
  // Group tools by stage
  const stageToTools = new Map<string, Node[]>();
  stages.forEach(stage => {
    const relatedTools = tools.filter(tool => toolToStage.get(tool.id)?.id === stage.id);
    stageToTools.set(stage.id, relatedTools);
  });
  
  // Group prompts by tool
  const toolToPrompts = new Map<string, Node[]>();
  tools.forEach(tool => {
    const relatedPrompts = prompts.filter(prompt => promptToTool.get(prompt.id)?.id === tool.id);
    toolToPrompts.set(tool.id, relatedPrompts);
  });
  
  return {
    frameworks,
    stages,
    tools,
    prompts,
    stageToFramework,
    toolToStage,
    promptToTool,
    frameworkToStages,
    stageToTools,
    toolToPrompts,
    orphanedNodes: nodes.filter(n => !['framework', 'stage', 'tool', 'prompt'].includes(n.type || ''))
  };
}

// Create hierarchical layout: Framework → Stages → Tools → Prompts
function createHierarchicalLayout(analysis: any, spacing: NodeSpacing) {
  const positionedNodes: Node[] = [];
  const { frameworks, frameworkToStages, stageToTools, toolToPrompts, orphanedNodes } = analysis;
  const calculator = createPositionCalculator(spacing);
  
  const startX = 100; // Start with padding from left
  const startY = 100; // Start with padding from top
  
  // Helper function to get node dimensions
  const getNodeDimensions = (nodeType: string) => {
    switch (nodeType) {
      case 'framework': return spacing.framework;
      case 'stage': return spacing.stage;
      case 'tool': return spacing.tool;
      case 'prompt': return spacing.prompt;
      case 'custom-prompt': return spacing['custom-prompt'];
      case 'ai-builder': return spacing['ai-builder'];
      default: return spacing.tool;
    }
  };
  
  // Helper function to find safe position without overlaps
  const findSafePosition = (nodeType: string, preferredX: number, preferredY: number): { x: number; y: number } => {
    const dimensions = getNodeDimensions(nodeType);
    const buffer = 80; // Minimum buffer between nodes
    
    // Check if preferred position conflicts with existing nodes
    const hasConflict = positionedNodes.some(existingNode => {
      const existingDimensions = getNodeDimensions(existingNode.type || 'tool');
      const existingX = existingNode.position.x;
      const existingY = existingNode.position.y;
      
      // Check for overlap with buffer
      const overlapX = preferredX < existingX + existingDimensions.width + buffer && 
                      preferredX + dimensions.width + buffer > existingX;
      const overlapY = preferredY < existingY + existingDimensions.height + buffer && 
                      preferredY + dimensions.height + buffer > existingY;
      
      return overlapX && overlapY;
    });
    
    if (!hasConflict) {
      return { x: preferredX, y: preferredY };
    }
    
    // If there's a conflict, find next available position
    return calculator.getAvailablePosition(nodeType, positionedNodes, preferredX, preferredY);
  };
  
  // Track column positions for each hierarchy level
  const columnPositions = {
    framework: startX,
    stage: 0, // Will be calculated based on framework positions
    tool: 0,  // Will be calculated based on stage positions
    prompt: 0 // Will be calculated based on tool positions
  };
  
  // Phase 1: Position frameworks on the left with proper vertical distribution
  let currentFrameworkY = startY;
  frameworks.forEach((framework, fwIndex) => {
    const safePosition = findSafePosition('framework', columnPositions.framework, currentFrameworkY);
    
    positionedNodes.push({
      ...framework,
      position: safePosition
    });
    
    currentFrameworkY = safePosition.y + spacing.framework.height + spacing.vertical;
  });
  
  // Update stage column position based on frameworks
  const maxFrameworkWidth = Math.max(...positionedNodes
    .filter(n => n.type === 'framework')
    .map(n => n.position.x + spacing.framework.width), columnPositions.framework);
  columnPositions.stage = maxFrameworkWidth + spacing.horizontal;
  
  // Phase 2: Position stages next to their frameworks
  frameworks.forEach((framework) => {
    const frameworkNode = positionedNodes.find(n => n.id === framework.id);
    if (!frameworkNode) return;
    
    const relatedStages = frameworkToStages.get(framework.id) || [];
    let currentStageY = frameworkNode.position.y;
    
    relatedStages.forEach((stage, stageIndex) => {
      const preferredStageY = currentStageY + (stageIndex * (spacing.stage.height + spacing.vertical * 0.7));
      const safePosition = findSafePosition('stage', columnPositions.stage, preferredStageY);
      
      positionedNodes.push({
        ...stage,
        position: safePosition
      });
      
      // Update current Y for next stage to avoid overlap
      currentStageY = Math.max(currentStageY, safePosition.y + spacing.stage.height + spacing.vertical * 0.7);
    });
  });
  
  // Update tool column position based on stages
  const maxStageWidth = Math.max(...positionedNodes
    .filter(n => n.type === 'stage')
    .map(n => n.position.x + spacing.stage.width), columnPositions.stage);
  columnPositions.tool = maxStageWidth + spacing.horizontal;
  
  // Phase 3: Position tools next to their stages
  positionedNodes.filter(n => n.type === 'stage').forEach((stageNode) => {
    const relatedTools = stageToTools.get(stageNode.id) || [];
    let currentToolY = stageNode.position.y;
    
    relatedTools.forEach((tool, toolIndex) => {
      const preferredToolY = currentToolY + (toolIndex * (spacing.tool.height + spacing.vertical * 0.5));
      const safePosition = findSafePosition('tool', columnPositions.tool, preferredToolY);
      
      positionedNodes.push({
        ...tool,
        position: safePosition
      });
      
      // Update current Y for next tool to avoid overlap
      currentToolY = Math.max(currentToolY, safePosition.y + spacing.tool.height + spacing.vertical * 0.5);
    });
  });
  
  // Update prompt column position based on tools
  const maxToolWidth = Math.max(...positionedNodes
    .filter(n => n.type === 'tool')
    .map(n => n.position.x + spacing.tool.width), columnPositions.tool);
  columnPositions.prompt = maxToolWidth + spacing.horizontal;
  
  // Phase 4: Position prompts to the right of their tools
  positionedNodes.filter(n => n.type === 'tool').forEach((toolNode) => {
    const relatedPrompts = toolToPrompts.get(toolNode.id) || [];
    let currentPromptY = toolNode.position.y;
    
    relatedPrompts.forEach((prompt, promptIndex) => {
      const preferredPromptY = currentPromptY + (promptIndex * (spacing.prompt.height + spacing.vertical * 0.4));
      const safePosition = findSafePosition('prompt', columnPositions.prompt, preferredPromptY);
      
      positionedNodes.push({
        ...prompt,
        position: safePosition
      });
      
      // Update current Y for next prompt to avoid overlap
      currentPromptY = Math.max(currentPromptY, safePosition.y + spacing.prompt.height + spacing.vertical * 0.4);
    });
  });
  
  // Phase 5: Handle orphaned nodes (nodes without clear relationships)
  orphanedNodes.forEach(node => {
    const { x, y } = calculator.getAvailablePosition(node.type || 'tool', positionedNodes);
    positionedNodes.push({
      ...node,
      position: { x, y }
    });
  });
  
  return positionedNodes;
}

// Utility to get smart positioning for new nodes based on workflow context
export function getSmartPosition(
  nodeType: string,
  existingNodes: Node[],
  context?: { sourceNodeId?: string; workflowType?: string }
): { x: number; y: number } {
  const calculator = createPositionCalculator();

  if (context?.sourceNodeId) {
    const sourceNode = existingNodes.find(n => n.id === context.sourceNodeId);
    if (sourceNode) {
      return calculator.getConnectedPosition(sourceNode, nodeType, existingNodes);
    }
  }

  // Special positioning for AI Builder nodes - place at bottom-left of canvas
  if (nodeType === 'ai-builder') {
    if (existingNodes.length === 0) {
      // If no nodes exist, position at top-left
      return { x: 100, y: 100 };
    }

    // Find the bottommost node position
    const getNodeHeight = (type: string) => {
      switch (type) {
        case 'framework': return DEFAULT_SPACING.framework.height;
        case 'stage': return DEFAULT_SPACING.stage.height;
        case 'tool': return DEFAULT_SPACING.tool.height;
        case 'prompt': return DEFAULT_SPACING.prompt.height;
        case 'custom-prompt': return DEFAULT_SPACING['custom-prompt'].height;
        case 'ai-builder': return DEFAULT_SPACING['ai-builder'].height;
        default: return DEFAULT_SPACING.framework.height;
      }
    };

    let maxBottomY = 0;
    existingNodes.forEach(node => {
      const nodeHeight = getNodeHeight(node.type || 'framework');
      const bottomY = node.position.y + nodeHeight;
      if (bottomY > maxBottomY) {
        maxBottomY = bottomY;
      }
    });

    // Position at bottom-left with vertical spacing
    const verticalSpacing = 100;
    return {
      x: 100,
      y: maxBottomY + verticalSpacing
    };
  }

  // Default positioning based on node type and existing nodes
  const nodesOfType = existingNodes.filter(n => n.type === nodeType);
  const row = Math.floor(nodesOfType.length / 3);
  const col = nodesOfType.length % 3;

  return calculator.getGridPosition(row, col, nodeType);
}