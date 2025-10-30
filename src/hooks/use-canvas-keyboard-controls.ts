import { useEffect, useCallback, useRef } from 'react';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';
import { useToast } from './use-toast';

interface UseCanvasKeyboardControlsProps {
  reactFlowInstance: ReactFlowInstance | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onCopyNodes?: (nodes: Node[]) => void;
  onPasteNodes?: () => void;
  onCutNodes?: (nodes: Node[]) => void;
  onDeleteNodes?: (nodeIds: string[]) => void;
  onRenameNode?: (nodeId: string) => void;
  onAddStickyNote?: () => void;
}

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

export function useCanvasKeyboardControls({
  reactFlowInstance,
  nodes,
  edges,
  selectedNodes,
  onNodesChange,
  onEdgesChange,
  onNodeDoubleClick,
  onCopyNodes,
  onPasteNodes,
  onCutNodes,
  onDeleteNodes,
  onRenameNode,
  onAddStickyNote,
}: UseCanvasKeyboardControlsProps) {
  const { toast } = useToast();
  const clipboardRef = useRef<ClipboardData | null>(null);
  const panSpeedRef = useRef(20); // pixels per keypress

  // Get selected node objects
  const getSelectedNodeObjects = useCallback(() => {
    return nodes.filter(node => selectedNodes.includes(node.id));
  }, [nodes, selectedNodes]);

  // Find sibling nodes (same parent or same level)
  const findSiblingNodes = useCallback((currentNode: Node, direction: 'up' | 'down' | 'left' | 'right') => {
    const currentX = currentNode.position.x;
    const currentY = currentNode.position.y;

    let candidates: Node[] = [];

    switch (direction) {
      case 'up':
        candidates = nodes.filter(n => n.id !== currentNode.id && n.position.y < currentY);
        candidates.sort((a, b) => b.position.y - a.position.y); // Closest first
        break;
      case 'down':
        candidates = nodes.filter(n => n.id !== currentNode.id && n.position.y > currentY);
        candidates.sort((a, b) => a.position.y - b.position.y); // Closest first
        break;
      case 'left':
        candidates = nodes.filter(n => n.id !== currentNode.id && n.position.x < currentX);
        candidates.sort((a, b) => b.position.x - a.position.x); // Closest first
        break;
      case 'right':
        candidates = nodes.filter(n => n.id !== currentNode.id && n.position.x > currentX);
        candidates.sort((a, b) => a.position.x - b.position.x); // Closest first
        break;
    }

    return candidates[0] || null;
  }, [nodes]);

  // Select nodes in direction (with Shift)
  const selectNodesInDirection = useCallback((currentNode: Node, direction: 'left' | 'right') => {
    const currentX = currentNode.position.x;
    let nodesToSelect: Node[] = [];

    if (direction === 'left') {
      nodesToSelect = nodes.filter(n => n.position.x < currentX);
    } else {
      nodesToSelect = nodes.filter(n => n.position.x > currentX);
    }

    return [...selectedNodes, ...nodesToSelect.map(n => n.id)];
  }, [nodes, selectedNodes]);

  // Copy selected nodes
  const copyNodes = useCallback(() => {
    const nodesToCopy = getSelectedNodeObjects();
    if (nodesToCopy.length === 0) return;

    // Get edges between selected nodes
    const selectedNodeIds = new Set(selectedNodes);
    const edgesToCopy = edges.filter(
      edge => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    clipboardRef.current = {
      nodes: nodesToCopy,
      edges: edgesToCopy,
    };

    toast({
      title: 'Copied',
      description: `${nodesToCopy.length} node(s) copied to clipboard`,
    });

    onCopyNodes?.(nodesToCopy);
  }, [getSelectedNodeObjects, selectedNodes, edges, toast, onCopyNodes]);

  // Paste nodes
  const pasteNodes = useCallback(() => {
    if (!clipboardRef.current || !reactFlowInstance) return;

    const { nodes: copiedNodes, edges: copiedEdges } = clipboardRef.current;
    const viewport = reactFlowInstance.getViewport();

    // Calculate offset for pasted nodes (paste at center of viewport)
    const viewportCenter = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    // Calculate the bounding box of copied nodes
    const minX = Math.min(...copiedNodes.map(n => n.position.x));
    const minY = Math.min(...copiedNodes.map(n => n.position.y));

    // Create new nodes with offset positions
    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x - minX + viewportCenter.x - 100,
        y: node.position.y - minY + viewportCenter.y - 100,
      },
      selected: true,
    }));

    // Create ID mapping for edges
    const idMap = new Map(
      copiedNodes.map((oldNode, idx) => [oldNode.id, newNodes[idx].id])
    );

    // Create new edges with updated node IDs
    const newEdges = copiedEdges
      .filter(edge => idMap.has(edge.source) && idMap.has(edge.target))
      .map(edge => ({
        ...edge,
        id: `${edge.id}-copy-${Date.now()}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
      }));

    onNodesChange([...nodes, ...newNodes]);
    onEdgesChange([...edges, ...newEdges]);

    toast({
      title: 'Pasted',
      description: `${newNodes.length} node(s) pasted`,
    });

    onPasteNodes?.();
  }, [reactFlowInstance, nodes, edges, onNodesChange, onEdgesChange, toast, onPasteNodes]);

  // Cut nodes
  const cutNodes = useCallback(() => {
    copyNodes();
    const nodesToDelete = selectedNodes;

    if (nodesToDelete.length === 0) return;

    const remainingNodes = nodes.filter(n => !nodesToDelete.includes(n.id));
    const remainingEdges = edges.filter(
      e => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target)
    );

    onNodesChange(remainingNodes);
    onEdgesChange(remainingEdges);

    toast({
      title: 'Cut',
      description: `${nodesToDelete.length} node(s) cut`,
    });

    onCutNodes?.(getSelectedNodeObjects());
  }, [copyNodes, selectedNodes, nodes, edges, onNodesChange, onEdgesChange, toast, onCutNodes, getSelectedNodeObjects]);

  // Delete nodes
  const deleteNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const remainingNodes = nodes.filter(n => !selectedNodes.includes(n.id));
    const remainingEdges = edges.filter(
      e => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    );

    onNodesChange(remainingNodes);
    onEdgesChange(remainingEdges);

    toast({
      title: 'Deleted',
      description: `${selectedNodes.length} node(s) deleted`,
    });

    onDeleteNodes?.(selectedNodes);
  }, [selectedNodes, nodes, edges, onNodesChange, onEdgesChange, toast, onDeleteNodes]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 200 });
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 200 });
  }, [reactFlowInstance]);

  const resetZoom = useCallback(() => {
    reactFlowInstance?.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    reactFlowInstance?.fitView({ duration: 200, padding: 0.2 });
  }, [reactFlowInstance]);

  // Select all nodes
  const selectAllNodes = useCallback(() => {
    if (!reactFlowInstance) return;

    reactFlowInstance.getNodes().forEach(node => {
      reactFlowInstance.setNodes(prev =>
        prev.map(n => ({ ...n, selected: true }))
      );
    });

    toast({
      title: 'Selected All',
      description: `${nodes.length} node(s) selected`,
    });
  }, [reactFlowInstance, nodes.length, toast]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMeta = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      // Zoom controls
      if ((event.key === '+' || event.key === '=') && !isMeta) {
        event.preventDefault();
        zoomIn();
        return;
      }

      if ((event.key === '-' || event.key === '_') && !isMeta) {
        event.preventDefault();
        zoomOut();
        return;
      }

      if (event.key === '0' && !isMeta) {
        event.preventDefault();
        resetZoom();
        return;
      }

      if (event.key === '1' && !isMeta) {
        event.preventDefault();
        fitView();
        return;
      }

      // Select all (Ctrl/Cmd + A)
      if (isMeta && event.key === 'a') {
        event.preventDefault();
        selectAllNodes();
        return;
      }

      // Copy (Ctrl/Cmd + C)
      if (isMeta && event.key === 'c' && selectedNodes.length > 0) {
        event.preventDefault();
        copyNodes();
        return;
      }

      // Paste (Ctrl/Cmd + V)
      if (isMeta && event.key === 'v') {
        event.preventDefault();
        pasteNodes();
        return;
      }

      // Cut (Ctrl/Cmd + X)
      if (isMeta && event.key === 'x' && selectedNodes.length > 0) {
        event.preventDefault();
        cutNodes();
        return;
      }

      // Delete
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodes.length > 0) {
        event.preventDefault();
        deleteNodes();
        return;
      }

      // Add sticky note (Shift + S)
      if (isShift && event.key === 'S' && !isMeta) {
        event.preventDefault();
        onAddStickyNote?.();
        return;
      }

      // Rename (F2)
      if (event.key === 'F2' && selectedNodes.length === 1) {
        event.preventDefault();
        onRenameNode?.(selectedNodes[0]);
        return;
      }

      // Open node (Enter)
      if (event.key === 'Enter' && selectedNodes.length === 1) {
        event.preventDefault();
        const node = nodes.find(n => n.id === selectedNodes[0]);
        if (node && onNodeDoubleClick) {
          onNodeDoubleClick(node);
        }
        return;
      }

      // Arrow key navigation (when a single node is selected)
      if (selectedNodes.length === 1 && !isMeta) {
        const currentNode = nodes.find(n => n.id === selectedNodes[0]);
        if (!currentNode) return;

        let nextNode: Node | null = null;
        let nodesToSelect: string[] = [];

        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            if (isShift) {
              // Shift+Arrow not implemented for up/down
              return;
            }
            nextNode = findSiblingNodes(currentNode, 'up');
            break;

          case 'ArrowDown':
            event.preventDefault();
            if (isShift) {
              // Shift+Arrow not implemented for up/down
              return;
            }
            nextNode = findSiblingNodes(currentNode, 'down');
            break;

          case 'ArrowLeft':
            event.preventDefault();
            if (isShift) {
              nodesToSelect = selectNodesInDirection(currentNode, 'left');
              reactFlowInstance?.setNodes(prev =>
                prev.map(n => ({ ...n, selected: nodesToSelect.includes(n.id) }))
              );
              return;
            }
            nextNode = findSiblingNodes(currentNode, 'left');
            break;

          case 'ArrowRight':
            event.preventDefault();
            if (isShift) {
              nodesToSelect = selectNodesInDirection(currentNode, 'right');
              reactFlowInstance?.setNodes(prev =>
                prev.map(n => ({ ...n, selected: nodesToSelect.includes(n.id) }))
              );
              return;
            }
            nextNode = findSiblingNodes(currentNode, 'right');
            break;
        }

        if (nextNode) {
          // Deselect current, select next
          reactFlowInstance?.setNodes(prev =>
            prev.map(n => ({
              ...n,
              selected: n.id === nextNode!.id,
            }))
          );

          // Center on the new node
          reactFlowInstance?.fitView({
            nodes: [nextNode],
            duration: 200,
            padding: 0.5,
          });
        }
      }
    };

    // Mouse wheel zoom (Ctrl + wheel)
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        if (event.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [
    reactFlowInstance,
    nodes,
    edges,
    selectedNodes,
    getSelectedNodeObjects,
    findSiblingNodes,
    selectNodesInDirection,
    copyNodes,
    pasteNodes,
    cutNodes,
    deleteNodes,
    zoomIn,
    zoomOut,
    resetZoom,
    fitView,
    selectAllNodes,
    onNodeDoubleClick,
    onRenameNode,
    onAddStickyNote,
    toast,
  ]);

  return {
    copyNodes,
    pasteNodes,
    cutNodes,
    deleteNodes,
    zoomIn,
    zoomOut,
    resetZoom,
    fitView,
    selectAllNodes,
  };
}
