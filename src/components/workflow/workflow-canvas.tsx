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
import { CanvasToolbar } from './canvas-toolbar';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';

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

export function WorkflowCanvas({ onSwitchToPromptTab }: { onSwitchToPromptTab?: () => void }) {
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    addEdge: addStoreEdge, 
    selectNode, 
    selectedNode,
    updateNodePosition,
    updateNodeDimensions,
    saveWorkflowToStorage 
  } = useWorkflowStore();
  
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

  // Create stable nodeTypes - tool node will get onSwitchToPromptTab via context or props
  const nodeTypes = useMemo(() => ({
    ...staticNodeTypes,
    tool: ToolNode,
  }), []);
  
  // Add onSwitchToPromptTab to tool nodes - let React Flow handle selection
  const enhancedNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      data: { 
        ...node.data, 
        ...(node.type === 'tool' ? { onSwitchToPromptTab } : {})
      }
    })), [nodes, onSwitchToPromptTab]
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(enhancedNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Sync store nodes with flow nodes when store nodes change
  useEffect(() => {
    if (updateRef.current) {
      updateRef.current = false;
      return;
    }
    // console.log('Store nodes changed, updating flow nodes:', enhancedNodes.length);
    setFlowNodes(enhancedNodes);
  }, [enhancedNodes, setFlowNodes]);

  // Sync store edges with flow edges when store edges change
  useEffect(() => {
    // console.log('Store edges changed, updating flow edges:', edges.length);
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

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
        type: 'smoothstep',
        animated: true,
        style: isKnowledgeToTool 
          ? { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '5,5' } // Amber dashed line
          : { stroke: 'white', strokeWidth: 2 },
        label: isKnowledgeToTool ? 'Knowledge' : undefined,
        labelStyle: isKnowledgeToTool 
          ? { fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' } 
          : undefined,
      } as Edge;
      
      console.log('Creating new edge:', {
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle
      });
      
      setFlowEdges((eds) => addEdge(newEdge, eds));
      addStoreEdge(newEdge);
    },
    [setFlowEdges, addStoreEdge, flowNodes]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      updateRef.current = true;
      onNodesChange(changes);
      
      // Handle position and dimension changes with auto-save
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id) {
          // Update position in store and auto-save
          updateNodePosition(change.id, change.position);
        }
        if (change.type === 'dimensions' && change.dimensions && change.id) {
          // Update dimensions in store and auto-save
          updateNodeDimensions(change.id, change.dimensions);
        }
      });
    },
    [onNodesChange, updateNodePosition, updateNodeDimensions]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);
      
      // Auto-save when edges change
      saveWorkflowToStorage();
    },
    [onEdgesChange, saveWorkflowToStorage]
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
      setSelectedNodes(selectedReactFlowNodes.map(node => node.id));
      
      // Update store selection for compatibility with existing components
      if (selectedReactFlowNodes.length === 1) {
        selectNode(selectedReactFlowNodes[0]);
      } else if (selectedReactFlowNodes.length === 0) {
        selectNode(null);
      }
      // For multi-selection (length > 1), don't update store selection
    },
    [selectNode]
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
    if (isDrawing && marqueeRect && isMarqueeMode) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;
      
      setMarqueeRect({
        ...marqueeRect,
        currentX,
        currentY,
      });
    }
  }, [isDrawing, marqueeRect, isMarqueeMode]);

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
            type: 'smoothstep',
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
        </ReactFlow>
      </div>

      {/* Zoom Indicator */}
      <div className="fixed bottom-4 left-4 bg-card border border-border rounded-md px-3 py-2 shadow-lg text-sm font-medium z-20">
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
        selectedNode={selectedNode}
      />
    </motion.div>
  );
}