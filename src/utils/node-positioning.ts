import { Node } from '@xyflow/react';

export interface NodeSpacing {
  horizontal: number;
  vertical: number;
  framework: { width: number; height: number };
  stage: { width: number; height: number };
  tool: { width: number; height: number };
  prompt: { width: number; height: number };
}

export const DEFAULT_SPACING: NodeSpacing = {
  horizontal: 420,
  vertical: 280,
  framework: { width: 320, height: 200 },
  stage: { width: 280, height: 180 },
  tool: { width: 280, height: 160 },
  prompt: { width: 400, height: 220 }
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

// Utility function to auto-layout existing nodes with proper spacing
export function autoLayoutNodes(nodes: Node[], spacing: NodeSpacing = DEFAULT_SPACING): Node[] {
  const calculator = createPositionCalculator(spacing);
  const nodesByType = nodes.reduce((acc, node) => {
    const type = node.type || 'tool';
    if (!acc[type]) acc[type] = [];
    acc[type].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  const layoutOrder = ['framework', 'stage', 'tool', 'prompt'];
  const positionedNodes: Node[] = [];
  
  layoutOrder.forEach((nodeType, typeIndex) => {
    const nodesOfType = nodesByType[nodeType] || [];
    
    nodesOfType.forEach((node, nodeIndex) => {
      const { x, y } = calculator.getGridPosition(
        Math.floor(nodeIndex / 3), // 3 nodes per row
        (nodeIndex % 3) + (typeIndex * 4), // Offset by type
        nodeType
      );
      
      positionedNodes.push({
        ...node,
        position: { x, y }
      });
    });
  });

  // Add any nodes not in the layout order
  const processedTypes = new Set(layoutOrder);
  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    if (!processedTypes.has(type)) {
      typeNodes.forEach((node, index) => {
        const { x, y } = calculator.getAvailablePosition(type, positionedNodes);
        positionedNodes.push({
          ...node,
          position: { x, y }
        });
      });
    }
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
  
  // Default positioning based on node type and existing nodes
  const nodesOfType = existingNodes.filter(n => n.type === nodeType);
  const row = Math.floor(nodesOfType.length / 3);
  const col = nodesOfType.length % 3;
  
  return calculator.getGridPosition(row, col, nodeType);
}