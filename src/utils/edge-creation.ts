import { Edge } from '@xyflow/react';

/**
 * Creates an edge with proper source and target handle connections.
 * By default, connects from the right side of the source node to the left side of the target node.
 *
 * @param sourceNodeId - ID of the source node
 * @param targetNodeId - ID of the target node
 * @param options - Optional edge configuration
 * @returns Edge object with proper handle connections
 */
export function createConnectedEdge(
  sourceNodeId: string,
  targetNodeId: string,
  options: {
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
    animated?: boolean;
    style?: React.CSSProperties;
    id?: string;
  } = {}
): Edge {
  const {
    sourceHandle = `${sourceNodeId}-source-1`, // Right side by default
    targetHandle = `${targetNodeId}-target-1`, // Left side by default
    type = 'default',
    animated = true,
    style = { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    id = `edge-${sourceNodeId}-${targetNodeId}`,
  } = options;

  return {
    id,
    source: sourceNodeId,
    sourceHandle,
    target: targetNodeId,
    targetHandle,
    type,
    animated,
    style,
  };
}

/**
 * Creates an edge connecting from the bottom of the source node to the top of the target node.
 * Useful for vertical workflows.
 */
export function createVerticalConnectedEdge(
  sourceNodeId: string,
  targetNodeId: string,
  options: {
    type?: string;
    animated?: boolean;
    style?: React.CSSProperties;
    id?: string;
  } = {}
): Edge {
  return createConnectedEdge(sourceNodeId, targetNodeId, {
    ...options,
    sourceHandle: `${sourceNodeId}-source-2`, // Bottom side
    targetHandle: `${targetNodeId}-target-2`, // Top side
  });
}

/**
 * Creates multiple edges from a source node to multiple target nodes.
 * All edges will connect from the right side of the source to the left side of targets.
 */
export function createMultipleConnectedEdges(
  sourceNodeId: string,
  targetNodeIds: string[],
  options: Omit<Parameters<typeof createConnectedEdge>[2], 'id'> = {}
): Edge[] {
  return targetNodeIds.map((targetId) =>
    createConnectedEdge(sourceNodeId, targetId, options)
  );
}
