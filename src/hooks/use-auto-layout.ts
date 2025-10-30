import { useEffect, useRef, useCallback } from 'react';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';
import { getWorkflowLayoutedElements, LayoutOptions } from '@/utils/dagre-layout';

interface UseAutoLayoutOptions {
  enabled?: boolean;
  layoutOnMount?: boolean;
  layoutOnNodesChange?: boolean;
  debounceMs?: number;
  layoutOptions?: LayoutOptions;
}

/**
 * Hook to automatically layout nodes when they're added or changed
 */
export function useAutoLayout(
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node[],
  edges: Edge[],
  onNodesChange: (nodes: Node[]) => void,
  options: UseAutoLayoutOptions = {}
) {
  const {
    enabled = true,
    layoutOnMount = false,
    layoutOnNodesChange = true,
    debounceMs = 500,
    layoutOptions = {},
  } = options;

  const previousNodeCountRef = useRef(nodes.length);
  const layoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLayoutedRef = useRef(false);

  /**
   * Apply layout to current nodes and edges
   */
  const applyLayout = useCallback(() => {
    if (!enabled || !reactFlowInstance) return;

    // Don't layout if there are no nodes
    if (nodes.length === 0) return;

    console.log('Applying auto-layout to', nodes.length, 'nodes');

    // Get layouted elements
    const { nodes: layoutedNodes } = getWorkflowLayoutedElements(
      nodes,
      edges,
      layoutOptions
    );

    // Update nodes with new positions
    onNodesChange(layoutedNodes);

    // Fit view after layout with a small delay to ensure nodes are positioned
    setTimeout(() => {
      reactFlowInstance?.fitView({
        padding: 0.2,
        duration: 300,
      });
    }, 100);
  }, [enabled, reactFlowInstance, nodes, edges, onNodesChange, layoutOptions]);

  /**
   * Debounced layout application
   */
  const debouncedLayout = useCallback(() => {
    if (layoutTimeoutRef.current) {
      clearTimeout(layoutTimeoutRef.current);
    }

    layoutTimeoutRef.current = setTimeout(() => {
      applyLayout();
    }, debounceMs);
  }, [applyLayout, debounceMs]);

  /**
   * Layout on mount if enabled
   */
  useEffect(() => {
    if (layoutOnMount && !hasLayoutedRef.current && nodes.length > 0) {
      hasLayoutedRef.current = true;
      applyLayout();
    }
  }, [layoutOnMount, applyLayout, nodes.length]);

  /**
   * Layout when nodes are added
   */
  useEffect(() => {
    if (!layoutOnNodesChange) return;

    const currentNodeCount = nodes.length;
    const previousNodeCount = previousNodeCountRef.current;

    // Only layout when nodes are added (not when they're moved or removed)
    if (currentNodeCount > previousNodeCount) {
      console.log('New nodes detected, applying layout');
      debouncedLayout();
    }

    previousNodeCountRef.current = currentNodeCount;
  }, [nodes.length, layoutOnNodesChange, debouncedLayout]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
    };
  }, []);

  return {
    applyLayout,
    isEnabled: enabled,
  };
}

/**
 * Simpler hook that only provides a manual layout function
 */
export function useManualLayout(
  reactFlowInstance: ReactFlowInstance | null,
  nodes: Node[],
  edges: Edge[],
  onNodesChange: (nodes: Node[]) => void,
  layoutOptions: LayoutOptions = {}
) {
  const applyLayout = useCallback(() => {
    if (!reactFlowInstance || nodes.length === 0) return;

    const { nodes: layoutedNodes } = getWorkflowLayoutedElements(
      nodes,
      edges,
      layoutOptions
    );

    onNodesChange(layoutedNodes);

    setTimeout(() => {
      reactFlowInstance?.fitView({
        padding: 0.2,
        duration: 300,
      });
    }, 100);
  }, [reactFlowInstance, nodes, edges, onNodesChange, layoutOptions]);

  return { applyLayout };
}
