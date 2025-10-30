import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing?: number;
  rankSpacing?: number;
  edgeSpacing?: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR'; // Upper-Left, Upper-Right, Down-Left, Down-Right
}

const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 180;

// Node type specific dimensions
const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  framework: { width: 320, height: 200 },
  stage: { width: 280, height: 180 },
  tool: { width: 280, height: 160 },
  prompt: { width: 800, height: 300 },
  'custom-prompt': { width: 320, height: 200 },
  'knowledge-document': { width: 240, height: 140 },
  context: { width: 280, height: 160 },
  project: { width: 300, height: 180 },
};

/**
 * Get dimensions for a node based on its type
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  const nodeType = node.type || 'default';

  // Use explicitly set dimensions if available
  if (node.width && node.height) {
    return { width: node.width, height: node.height };
  }

  // Use measured dimensions if available
  if (node.measured?.width && node.measured?.height) {
    return { width: node.measured.width, height: node.measured.height };
  }

  // Use type-specific defaults
  return NODE_DIMENSIONS[nodeType] || { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
}

/**
 * Apply Dagre layout algorithm to nodes and edges
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const {
    direction = 'LR',
    nodeSpacing = 100,
    rankSpacing = 200,
    edgeSpacing = 50,
    align = 'UL',
  } = options;

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();

  // Set graph layout options
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    edgesep: edgeSpacing,
    align: align,
    ranker: 'longest-path', // Use longest-path ranker for better hierarchy
  });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node);
    dagreGraph.setNode(node.id, dimensions);
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Determine if layout is horizontal or vertical
  const isHorizontal = direction === 'LR' || direction === 'RL';

  // Apply calculated positions back to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = getNodeDimensions(node);

    // Dagre positions nodes at their center, but React Flow expects top-left
    // Adjust by subtracting half the dimensions
    const position = {
      x: nodeWithPosition.x - dimensions.width / 2,
      y: nodeWithPosition.y - dimensions.height / 2,
    };

    return {
      ...node,
      position,
      // Set handle positions based on layout direction
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Auto-layout with workflow hierarchy awareness
 * This function analyzes the node types and creates optimal hierarchy
 */
export function getWorkflowLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  // Detect workflow hierarchy
  const hasFrameworks = nodes.some((n) => n.type === 'framework');
  const hasStages = nodes.some((n) => n.type === 'stage');
  const hasTools = nodes.some((n) => n.type === 'tool');
  const hasPrompts = nodes.some((n) => n.type === 'prompt');

  // Adjust layout options based on workflow structure
  const workflowOptions: LayoutOptions = {
    direction: 'LR', // Left-to-right for workflow progression
    nodeSpacing: 80,
    rankSpacing: hasPrompts ? 350 : 250, // More space if prompts are present
    edgeSpacing: 40,
    ...options,
  };

  // If it's a hierarchical workflow (framework → stage → tool → prompt)
  if (hasFrameworks || hasStages) {
    workflowOptions.rankSpacing = 300;
    workflowOptions.nodeSpacing = 100;
  }

  return getLayoutedElements(nodes, edges, workflowOptions);
}

/**
 * Smart layout that tries to maintain existing positions when possible
 * Only repositions new or overlapping nodes
 */
export function getIncrementalLayout(
  nodes: Node[],
  edges: Edge[],
  newNodeIds: string[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  // If there are only a few new nodes, use simple positioning
  if (newNodeIds.length <= 2) {
    // Just return the nodes as-is, let the existing positioning logic handle it
    return { nodes, edges };
  }

  // If there are many new nodes or the canvas is getting crowded, do a full layout
  if (newNodeIds.length > 2 || nodes.length > 10) {
    return getWorkflowLayoutedElements(nodes, edges, options);
  }

  return { nodes, edges };
}

/**
 * Calculate optimal layout direction based on node types and count
 */
export function detectOptimalDirection(nodes: Node[]): 'TB' | 'LR' {
  const frameworks = nodes.filter((n) => n.type === 'framework');
  const stages = nodes.filter((n) => n.type === 'stage');
  const tools = nodes.filter((n) => n.type === 'tool');
  const prompts = nodes.filter((n) => n.type === 'prompt');

  // If there are frameworks and stages, use left-to-right for workflow progression
  if (frameworks.length > 0 || stages.length > 0) {
    return 'LR';
  }

  // If there are many tools with prompts, use left-to-right
  if (tools.length > 0 && prompts.length > 0) {
    return 'LR';
  }

  // For simple node structures or small graphs, use top-to-bottom
  if (nodes.length < 5) {
    return 'TB';
  }

  // Default to left-to-right for workflow-style layouts
  return 'LR';
}

/**
 * Apply layout with animation-friendly transition
 */
export function applyLayoutWithTransition(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const layouted = getWorkflowLayoutedElements(nodes, edges, options);

  // Add a small random offset to trigger React Flow's animation
  const nodesWithTransition = layouted.nodes.map((node) => ({
    ...node,
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
  }));

  return { nodes: nodesWithTransition, edges: layouted.edges };
}
