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
import { CanvasToolbar } from './canvas-toolbar';
import { motion } from 'framer-motion';

// Define nodeTypes outside the component to prevent recreation on each render
const staticNodeTypes = {
  stage: StageNode,
  framework: FrameworkNode,
  prompt: PromptNode,
  project: ProjectNode,
  context: ContextNode,
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
  
  // Add onSwitchToPromptTab to tool nodes and selected state to all nodes
  const enhancedNodes = useMemo(() => 
    nodes.map(node => {
      const isSelected = selectedNode?.id === node.id;
      return {
        ...node,
        selected: isSelected,
        data: { 
          ...node.data, 
          ...(node.type === 'tool' ? { onSwitchToPromptTab } : {})
        }
      };
    }), [nodes, onSwitchToPromptTab, selectedNode]
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
    console.log('Store edges changed, updating flow edges:', edges.length);
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2 },
      } as Edge;
      
      setFlowEdges((eds) => addEdge(newEdge, eds));
      addStoreEdge(newEdge);
    },
    [setFlowEdges, addStoreEdge]
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
      selectNode(node);
    },
    [selectNode]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodes(selectedNodes.map(node => node.id));
      
      // Clear selectedNode in store if no nodes are selected
      if (selectedNodes.length === 0) {
        selectNode(null);
      }
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

  const handleClearSelection = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  const toggleMarqueeMode = useCallback(() => {
    setIsMarqueeMode(!isMarqueeMode);
    setMarqueeRect(null);
    setIsDrawing(false);
  }, [isMarqueeMode]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    if (isMarqueeMode && event.button === 0) {
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
    if (isDrawing && marqueeRect && isMarqueeMode) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const { startX, startY, currentX, currentY } = marqueeRect;
      
      // Calculate selection bounds
      const minX = Math.min(startX, currentX);
      const minY = Math.min(startY, currentY);
      const maxX = Math.max(startX, currentX);
      const maxY = Math.max(startY, currentY);
      
      // Find nodes within selection bounds
      const selectedNodeIds = flowNodes
        .filter(node => {
          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = (node.measured?.width || 100);
          const nodeHeight = (node.measured?.height || 100);
          
          return (
            nodeX >= minX - nodeWidth/2 &&
            nodeX <= maxX + nodeWidth/2 &&
            nodeY >= minY - nodeHeight/2 &&
            nodeY <= maxY + nodeHeight/2
          );
        })
        .map(node => node.id);
      
      setSelectedNodes(selectedNodeIds);
      setIsDrawing(false);
      setMarqueeRect(null);
    }
  }, [isDrawing, marqueeRect, isMarqueeMode, flowNodes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full relative"
      style={{ backgroundColor: '#333446' }}
    >
      <CanvasToolbar 
        onClearSelection={handleClearSelection}
        isMarqueeMode={isMarqueeMode}
        onToggleMarqueeMode={toggleMarqueeMode}
      />
      
      {/* Marquee Selection Rectangle */}
      {marqueeRect && isDrawing && (
        <div
          className="absolute pointer-events-none border-2 border-primary bg-primary/20 z-50"
          style={{
            left: Math.min(marqueeRect.startX, marqueeRect.currentX),
            top: Math.min(marqueeRect.startY, marqueeRect.currentY),
            width: Math.abs(marqueeRect.currentX - marqueeRect.startX),
            height: Math.abs(marqueeRect.currentY - marqueeRect.startY),
          }}
        />
      )}
      
      <div 
        className="h-full w-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => selectNode(null)}
          onSelectionChange={onSelectionChange}
          onViewportChange={onViewportChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          selectionMode={isMarqueeMode ? SelectionMode.Full : SelectionMode.Partial}
          multiSelectionKeyCode="Shift"
          nodeOrigin={[0, 0]}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
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
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-md px-3 py-2 shadow-lg text-sm font-medium">
        {Math.round(zoom * 100)}%
      </div>

      <CanvasToolbar
        onClearSelection={handleClearSelection}
        isMarqueeMode={isMarqueeMode}
        onToggleMarqueeMode={toggleMarqueeMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
      />
    </motion.div>
  );
}