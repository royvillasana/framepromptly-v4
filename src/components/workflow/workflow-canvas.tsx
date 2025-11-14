import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  NodeResizer,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  BackgroundVariant,
  SelectionMode,
  ViewportChangeEvent,
  PanOnScrollMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflow-store';
import { StageNode } from './stage-node';
import { FrameworkNode } from './framework-node';
import { ToolNode } from './tool-node';
import { PromptNode } from './prompt-node';
import { ProjectNode } from './project-node';
import { ContextNode } from './context-node';
import { KnowledgeDocumentNode } from './knowledge-document-node';
import { CustomPromptNode } from './custom-prompt-node';
import { AIBuilderNode } from './ai-builder-node';
import { CanvasToolbar } from './canvas-toolbar';
import { useYjsCollaboration } from '@/hooks/use-yjs-collaboration';
import { CollaboratorsCursors, SelectionIndicators } from './collaborators-cursors';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useCanvasKeyboardControls } from '@/hooks/use-canvas-keyboard-controls';
import { useToast } from '@/hooks/use-toast';
import { useAutoLayout } from '@/hooks/use-auto-layout';

// Define nodeTypes outside the component to prevent recreation on each render
const staticNodeTypes = {
  stage: StageNode,
  framework: FrameworkNode,
  tool: ToolNode,
  prompt: PromptNode,
  project: ProjectNode,
  context: ContextNode,
  'knowledge-document': KnowledgeDocumentNode,
  'custom-prompt': CustomPromptNode,
  'ai-builder': AIBuilderNode,
};

// Connection validation function
const isValidConnection = (connection: Connection, nodes: Node[]) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Knowledge documents can connect TO tools OR custom-prompts
  if (sourceNode.type === 'knowledge-document') {
    return targetNode.type === 'tool' || targetNode.type === 'custom-prompt';
  }

  // Prevent nodes from connecting to knowledge documents
  if (targetNode.type === 'knowledge-document') {
    return false;
  }

  // Allow all other connection types (existing workflow logic)
  return true;
};

interface WorkflowCanvasProps {
  onSwitchToPromptTab?: () => void;
  initialNodes?: any[];
  initialEdges?: any[];
  projectId?: string;
  onAddNodeCallback?: (addNodeFn: (node: any) => void) => void;
}

export function WorkflowCanvas({
  onSwitchToPromptTab,
  initialNodes = [],
  initialEdges = [],
  projectId,
  onAddNodeCallback
}: WorkflowCanvasProps) {

  const {
    setNodes,
    setEdges,
    addEdge: addStoreEdge,
    selectNode,
    selectedNode,
    saveWorkflowToStorage
  } = useWorkflowStore();

  const { toast } = useToast();

  // We'll get the ReactFlow instance after the component mounts
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const updateRef = useRef(false);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isMarqueeMode, setIsMarqueeMode] = useState(false);
  const [isDraggingNodes, setIsDraggingNodes] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [marqueeRect, setMarqueeRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Yjs collaboration hook - replaces old useCanvasUpdates
  const {
    isConnected,
    isSynced,
    collaborators,
    updateCursor,
    updateSelection,
    setNodes: setYjsNodes,
    setEdges: setYjsEdges,
  } = useYjsCollaboration({
    projectId,
    initialNodes,
    initialEdges,
    onNodesChange: (newNodes) => {
      console.log('🔄 [Yjs] Remote nodes changed:', newNodes.length);
      setFlowNodes(newNodes);
      setNodes(newNodes);
    },
    onEdgesChange: (newEdges) => {
      console.log('🔄 [Yjs] Remote edges changed:', newEdges.length);
      setFlowEdges(newEdges);
      setEdges(newEdges);
    },
  });

  // Create stable nodeTypes - tool node will get onSwitchToPromptTab via context or props
  const nodeTypes = useMemo(() => ({
    ...staticNodeTypes,
    tool: ToolNode,
  }), []);

  // Forward reference for addNodeToCanvas that will be set after definition
  const addNodeToCanvasRef = useRef<((node: any) => void) | null>(null);
  const addEdgeToCanvasRef = useRef<((edge: any) => void) | null>(null);

  // Add callbacks to nodes based on type
  const enhancedNodes = useMemo(() =>
    initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        ...(node.type === 'tool' ? { onSwitchToPromptTab, addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {}),
        ...(node.type === 'framework' ? { addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {}),
        ...(node.type === 'stage' ? { addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {})
      }
    })), [initialNodes, onSwitchToPromptTab]
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(enhancedNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Debug: Log initial state
  useEffect(() => {
    console.log('🎨 [WorkflowCanvas] Initial render with:', {
      initialNodes: initialNodes.length,
      initialEdges: initialEdges.length,
      flowNodes: flowNodes.length,
      flowEdges: flowEdges.length
    });
  }, []);

  // Keep refs to latest flow state for saving on unmount
  const flowNodesRef = useRef(flowNodes);
  const flowEdgesRef = useRef(flowEdges);

  useEffect(() => {
    flowNodesRef.current = flowNodes;
    flowEdgesRef.current = flowEdges;
  }, [flowNodes, flowEdges]);

  // Track flowNodes changes to understand what's causing empty nodes
  useEffect(() => {
    console.log('🔄 [WorkflowCanvas] flowNodes changed:', {
      count: flowNodes.length,
      projectId,
      firstNode: flowNodes[0] ? { id: flowNodes[0].id, type: flowNodes[0].type } : null,
      stackTrace: new Error().stack?.split('\n').slice(2, 5).join('\n')
    });
  }, [flowNodes, projectId]);

  // Track initialNodes changes
  useEffect(() => {
    console.log('📥 [WorkflowCanvas] initialNodes prop changed:', {
      count: initialNodes.length,
      projectId,
      firstNode: initialNodes[0] ? { id: initialNodes[0].id, type: initialNodes[0].type } : null
    });
  }, [initialNodes, projectId]);

  // DON'T automatically sync from store - this causes infinite loops
  // Instead, React Flow manages its own state and we save back to store on unmount
  // The key prop on WorkflowCanvas ensures component remounts when project changes

  // Expose addNode function to parent component via callback
  const addNodeToCanvas = useCallback((node: any) => {
    console.log('➕ [WorkflowCanvas] addNodeToCanvas called with node:', node.id, node.type);
    console.log('📊 [WorkflowCanvas] Current flowNodes count before add:', flowNodes.length);

    // Enhance the node with necessary props based on node type
    const enhancedNode = {
      ...node,
      data: {
        ...node.data,
        ...(node.type === 'tool' ? { onSwitchToPromptTab, addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {}),
        ...(node.type === 'framework' ? { addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {}),
        ...(node.type === 'stage' ? { addNodeToCanvas: addNodeToCanvasRef.current, addEdgeToCanvas: addEdgeToCanvasRef.current } : {})
      }
    };

    setFlowNodes((nodes) => {
      console.log('➕ [WorkflowCanvas] Adding node to flowNodes. Current count:', nodes.length);
      const newNodes = [...nodes, enhancedNode];
      console.log('➕ [WorkflowCanvas] New flowNodes count after add:', newNodes.length);
      return newNodes;
    });
  }, [setFlowNodes, onSwitchToPromptTab]);

  // Expose addEdge function to nodes
  const addEdgeToCanvas = useCallback((edge: any) => {
    console.log('🔗 [WorkflowCanvas] addEdgeToCanvas called:', edge.id);
    setFlowEdges((edges) => [...edges, edge]);
  }, [setFlowEdges]);

  // Store stable references
  useEffect(() => {
    addNodeToCanvasRef.current = addNodeToCanvas;
    addEdgeToCanvasRef.current = addEdgeToCanvas;
  }, [addNodeToCanvas, addEdgeToCanvas]);

  // Update existing framework, stage, and tool nodes with the callbacks after they're defined
  useEffect(() => {
    if (addNodeToCanvas && addEdgeToCanvas) {
      setFlowNodes((nodes) =>
        nodes.map((node) => {
          if (node.type === 'framework' || node.type === 'stage' || node.type === 'tool') {
            return {
              ...node,
              data: {
                ...node.data,
                addNodeToCanvas: addNodeToCanvasRef.current,
                addEdgeToCanvas: addEdgeToCanvasRef.current,
              },
            };
          }
          return node;
        })
      );
    }
  }, [addNodeToCanvas, addEdgeToCanvas, setFlowNodes]);

  // Call the callback prop to expose addNode function to parent
  useEffect(() => {
    console.log('🔗 [WorkflowCanvas] Setting up callback, onAddNodeCallback exists?', !!onAddNodeCallback);
    if (onAddNodeCallback) {
      console.log('🔗 [WorkflowCanvas] Calling onAddNodeCallback to expose addNodeToCanvas');
      onAddNodeCallback(addNodeToCanvas);
    }
  }, [onAddNodeCallback, addNodeToCanvas]);

  // Handle node double-click to open details
  const handleNodeDoubleClick = useCallback((node: Node) => {
    toast({
      title: 'Opening Node',
      description: `Double-clicked on ${node.data?.label || node.type}`,
    });
    // You can add custom logic here to open node details panel
    selectNode(node);
  }, [toast, selectNode]);

  // Handle add sticky note
  const handleAddStickyNote = useCallback(() => {
    toast({
      title: 'Add Sticky Note',
      description: 'Sticky note feature coming soon!',
    });
  }, [toast]);

  // Handle rename node
  const handleRenameNode = useCallback((nodeId: string) => {
    toast({
      title: 'Rename Node',
      description: 'Rename feature coming soon!',
    });
  }, [toast]);

  // Initialize keyboard controls
  useCanvasKeyboardControls({
    reactFlowInstance,
    nodes: flowNodes,
    edges: flowEdges,
    selectedNodes,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
    onNodeDoubleClick: handleNodeDoubleClick,
    onAddStickyNote: handleAddStickyNote,
    onRenameNode: handleRenameNode,
    onDeleteNodes: (nodeIds) => {
      saveWorkflowToStorage();
    },
  });

  // Initialize auto-layout (manual only - disabled automatic layout on node changes)
  const { applyLayout } = useAutoLayout(
    reactFlowInstance,
    flowNodes,
    flowEdges,
    setFlowNodes,
    {
      enabled: true,
      layoutOnMount: false, // Don't auto-layout on mount
      layoutOnNodesChange: false, // Don't auto-layout when new nodes are added
      debounceMs: 300,
      layoutOptions: {
        direction: 'LR', // Left-to-right for workflow progression
        nodeSpacing: 100,
        rankSpacing: 250,
      },
    }
  );

  // Save to Zustand on unmount only (prevents infinite loop)
  useEffect(() => {
    return () => {
      const nodes = flowNodesRef.current;
      const edges = flowEdgesRef.current;

      // Save to Zustand
      setNodes(nodes);
      setEdges(edges);

      // Trigger auto-save (workflow store will save to Supabase via Workflow.tsx effect)
      saveWorkflowToStorage();
    };
  }, [setNodes, setEdges, saveWorkflowToStorage]);

  // Define handleClearSelection function first
  const handleClearSelection = useCallback(() => {
    setSelectedNodes([]);
    // Let React Flow handle clearing selection - use the instance method
    if (reactFlowInstance) {
      reactFlowInstance.getNodes().forEach(node => {
        reactFlowInstance.updateNode(node.id, { selected: false });
      });
    }
    // Clear store selection if not in marquee mode
    if (!isMarqueeMode) {
      selectNode(null);
    }
  }, [isMarqueeMode, reactFlowInstance, selectNode]);

  // Add keyboard shortcuts for marquee mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to exit marquee mode
      if (event.key === 'Escape' && isMarqueeMode) {
        setIsMarqueeMode(false);
        handleClearSelection();
        event.preventDefault();
      }
      
      // Delete key to delete selected nodes in marquee mode
      if (event.key === 'Delete' && isMarqueeMode && selectedNodes.length > 0) {
        const remainingNodes = flowNodes.filter(node => !selectedNodes.includes(node.id));
        const remainingEdges = flowEdges.filter(edge => 
          !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        );
        
        setNodes(remainingNodes);
        setEdges(remainingEdges);
        setSelectedNodes([]);
        event.preventDefault();
      }
      
      // Cmd/Ctrl+A to select all nodes
      if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        if (reactFlowInstance && flowNodes.length > 0) {
          // Select all nodes
          flowNodes.forEach(node => {
            reactFlowInstance.updateNode(node.id, { selected: true });
          });
          setSelectedNodes(flowNodes.map(node => node.id));
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMarqueeMode, selectedNodes, flowNodes, flowEdges, handleClearSelection, setNodes, setEdges, reactFlowInstance]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Ensure we have valid source and target before creating edge
      if (!params.source || !params.target) {
        console.warn('Cannot create edge: missing source or target', params);
        return;
      }

      // Validate the connection
      if (!isValidConnection(params, flowNodes)) {
        console.log('Connection rejected - invalid node types:', params);
        return;
      }

      // Create unique edge ID with timestamp to avoid duplicates
      const edgeId = `edge-${params.source}-${params.target}-${Date.now()}`;
      
      // Get source and target nodes to determine edge styling
      const sourceNode = flowNodes.find(n => n.id === params.source);
      const targetNode = flowNodes.find(n => n.id === params.target);
      
      // Special styling for knowledge-to-tool connections
      const isKnowledgeToTool = sourceNode?.type === 'knowledge-document' && targetNode?.type === 'tool';
      
      const newEdge = {
        ...params,
        id: edgeId,
        type: 'default',
        animated: true,
        style: isKnowledgeToTool
          ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' } // Amber dashed line
          : { stroke: 'white', strokeWidth: 2 },
        label: isKnowledgeToTool ? 'Knowledge' : undefined,
        labelStyle: isKnowledgeToTool
          ? { fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }
          : undefined,
      } as Edge;

      setFlowEdges((eds) => addEdge(newEdge, eds));
      addStoreEdge(newEdge);
    },
    [setFlowEdges, addStoreEdge, flowNodes]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      updateRef.current = true;
      onNodesChange(changes);

      // Check if we have editing changes
      const hasEditingChange = changes.some(
        (change) => change.type === 'position' || change.type === 'dimensions' || change.type === 'add' || change.type === 'remove'
      );

      if (hasEditingChange) {
        // Sync to Yjs after React Flow state updates
        setTimeout(() => {
          const currentNodes = flowNodesRef.current;
          console.log('📤 [Yjs] Syncing nodes to Yjs:', currentNodes.length);
          setYjsNodes(currentNodes);
        }, 0);
      }

      // DON'T update Zustand store here - React Flow manages its own state
      // Store updates only happen on unmount to prevent infinite loops
    },
    [onNodesChange, setYjsNodes]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);

      // Check if we have editing changes
      const hasEditingChange = changes.some(
        (change) => change.type === 'add' || change.type === 'remove'
      );

      if (hasEditingChange) {
        // Sync to Yjs after React Flow state updates
        setTimeout(() => {
          const currentEdges = flowEdgesRef.current;
          console.log('📤 [Yjs] Syncing edges to Yjs:', currentEdges.length);
          setYjsEdges(currentEdges);
        }, 0);
      }

      // DON'T update Zustand store here - React Flow manages its own state
      // Store updates only happen on unmount to prevent infinite loops
    },
    [onEdgesChange, setYjsEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // In normal mode, set single node selection in store for compatibility
      if (!isMarqueeMode) {
        selectNode(node);
      }
      // Let React Flow handle multi-selection automatically
    },
    [selectNode, isMarqueeMode]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedReactFlowNodes }: { nodes: Node[] }) => {
      const selectedIds = selectedReactFlowNodes.map(node => node.id);
      setSelectedNodes(selectedIds);

      // Sync selection to Yjs for real-time collaboration
      updateSelection(selectedIds);

      // Update store selection for compatibility with existing components
      if (selectedReactFlowNodes.length === 1) {
        selectNode(selectedReactFlowNodes[0]);
      } else if (selectedReactFlowNodes.length === 0) {
        selectNode(null);
      }
      // For multi-selection (length > 1), don't update store selection
    },
    [selectNode, updateSelection]
  );

  const onViewportChange = useCallback(
    (viewport: ViewportChangeEvent) => {
      setZoom(viewport.zoom);
    },
    []
  );

  const onInit = useCallback((reactFlowInstance: any) => {
    setReactFlowInstance(reactFlowInstance);
  }, []);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView();
  }, [reactFlowInstance]);

  const toggleMarqueeMode = useCallback(() => {
    const newMarqueeMode = !isMarqueeMode;
    setIsMarqueeMode(newMarqueeMode);
    setMarqueeRect(null);
    setIsDrawing(false);
    
    // Clear selections when toggling modes using React Flow instance
    setSelectedNodes([]);
    if (reactFlowInstance) {
      reactFlowInstance.getNodes().forEach(node => {
        reactFlowInstance.updateNode(node.id, { selected: false });
      });
    }
    if (!newMarqueeMode) {
      selectNode(null);
    }
  }, [isMarqueeMode, reactFlowInstance, selectNode]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    if (isMarqueeMode && event.button === 0) {
      // Check if we're clicking on empty space (not on a node)
      const target = event.target as HTMLElement;
      const isNodeClick = target.closest('.react-flow__node');
      
      if (!isNodeClick) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;
        
        setMarqueeRect({
          startX,
          startY,
          currentX: startX,
          currentY: startY,
        });
        setIsDrawing(true);
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, [isMarqueeMode]);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    // Update cursor position for real-time collaboration
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    updateCursor(x, y);

    // Handle marquee selection drawing
    if (isDrawing && marqueeRect && isMarqueeMode) {
      setMarqueeRect({
        ...marqueeRect,
        currentX: x,
        currentY: y,
      });
    }
  }, [isDrawing, marqueeRect, isMarqueeMode, updateCursor]);

  const onMouseUp = useCallback((event: React.MouseEvent) => {
    if (isDrawing && marqueeRect && isMarqueeMode && reactFlowInstance) {
      const { startX, startY, currentX, currentY } = marqueeRect;
      
      // Calculate selection bounds in screen coordinates
      const minX = Math.min(startX, currentX);
      const minY = Math.min(startY, currentY);
      const maxX = Math.max(startX, currentX);
      const maxY = Math.max(startY, currentY);
      
      // Convert screen coordinates to flow coordinates
      const startFlow = reactFlowInstance.screenToFlowPosition({ x: minX, y: minY });
      const endFlow = reactFlowInstance.screenToFlowPosition({ x: maxX, y: maxY });
      
      // Find nodes within selection bounds
      const selectedNodeIds = flowNodes
        .filter(node => {
          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = (node.measured?.width || node.width || 280);
          const nodeHeight = (node.measured?.height || node.height || 200);
          
          // Check if node overlaps with selection rectangle
          const nodeLeft = nodeX;
          const nodeTop = nodeY;
          const nodeRight = nodeX + nodeWidth;
          const nodeBottom = nodeY + nodeHeight;
          
          const selectionLeft = startFlow.x;
          const selectionTop = startFlow.y;
          const selectionRight = endFlow.x;
          const selectionBottom = endFlow.y;
          
          // Check for overlap
          return !(nodeRight < selectionLeft || 
                   nodeLeft > selectionRight || 
                   nodeBottom < selectionTop || 
                   nodeTop > selectionBottom);
        })
        .map(node => node.id);
      
      // Update selected nodes in React Flow using the instance
      setSelectedNodes(selectedNodeIds);
      
      // Use React Flow's built-in selection API
      if (reactFlowInstance && selectedNodeIds.length > 0) {
        reactFlowInstance.getNodes().forEach(node => {
          reactFlowInstance.updateNode(node.id, { 
            selected: selectedNodeIds.includes(node.id) 
          });
        });
      }
      
      setIsDrawing(false);
      setMarqueeRect(null);
    }
  }, [isDrawing, marqueeRect, isMarqueeMode, flowNodes, reactFlowInstance, setFlowNodes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full relative"
      style={{ backgroundColor: '#333446' }}
    >
      {/* Yjs Connection Status Indicator */}
      {isConnected && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-md px-3 py-2 shadow-lg text-sm">
          <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="font-medium">
            {isSynced ? 'Synced' : 'Syncing...'}
          </span>
          {collaborators.length > 0 && (
            <span className="text-muted-foreground">
              · {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
            </span>
          )}
        </div>
      )}

      {/* Marquee Selection Rectangle */}
      {marqueeRect && isDrawing && (
        <div
          className="absolute pointer-events-none border-2 border-primary bg-primary/20 z-20"
          style={{
            left: Math.min(marqueeRect.startX, marqueeRect.currentX),
            top: Math.min(marqueeRect.startY, marqueeRect.currentY),
            width: Math.abs(marqueeRect.currentX - marqueeRect.startX),
            height: Math.abs(marqueeRect.currentY - marqueeRect.startY),
          }}
        />
      )}
      
      <div
        className={`h-full w-full ${isMarqueeMode ? 'cursor-crosshair' : ''}`}
        {...(isMarqueeMode ? {
          onMouseDown,
          onMouseMove,
          onMouseUp
        } : {})}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={(event, node) => handleNodeDoubleClick(node)}
          onPaneClick={() => {
            if (isMarqueeMode) {
              handleClearSelection();
            } else {
              selectNode(null);
            }
          }}
          onSelectionChange={onSelectionChange}
          onViewportChange={onViewportChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          selectionMode={isMarqueeMode ? SelectionMode.Full : SelectionMode.Partial}
          multiSelectionKeyCode={["Meta", "Control", "Shift"]}
          panActivationKeyCode={["Space", "Control"]}
          panOnDrag={[1, 2]} // Middle mouse (1) and right mouse (2)
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={true}
          nodeOrigin={[0, 0]}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={true}
          selectionOnDrag={isMarqueeMode}
          minZoom={0.1}
          maxZoom={4}
          fitView
          style={{ backgroundColor: '#333446' }}
          colorMode="system"
          defaultEdgeOptions={{
            type: 'default',
            animated: true,
            style: { stroke: 'white', strokeWidth: 2 }
          }}
        >
          <Background
            color="rgba(255, 255, 255, 0.3)"
            gap={20}
            size={2}
            variant={BackgroundVariant.Dots}
          />

          {/* Yjs Collaboration UI - Figma-style cursors and selection indicators */}
          <CollaboratorsCursors collaborators={collaborators} />
          <SelectionIndicators collaborators={collaborators} />
        </ReactFlow>
      </div>

      {/* Zoom Indicator - Bottom Right */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-md px-3 py-2 shadow-lg text-sm font-medium z-20">
        {Math.round(zoom * 100)}%
      </div>

      {/* Marquee Mode Indicator */}
      {isMarqueeMode && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg text-sm font-medium z-20">
          <div className="flex items-center gap-2 mb-1">
            <Square className="h-4 w-4" />
            Drag Selection Mode
            {selectedNodes.length > 0 && (
              <span className="bg-primary-foreground text-primary px-2 py-0.5 rounded text-xs">
                {selectedNodes.length} selected
              </span>
            )}
          </div>
          <div className="text-xs opacity-90">
            Drag to select • Cmd/Ctrl+Click multi-select • Cmd/Ctrl+A select all • ESC to exit
            {selectedNodes.length > 0 && " • DEL to delete"}
          </div>
        </div>
      )}

      <CanvasToolbar
        onClearSelection={handleClearSelection}
        isMarqueeMode={isMarqueeMode}
        onToggleMarqueeMode={toggleMarqueeMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onApplyLayout={applyLayout}
        selectedNode={selectedNode}
        addNodeToCanvas={addNodeToCanvas}
      />
    </motion.div>
  );
}