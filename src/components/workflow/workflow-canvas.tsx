import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflow-store';
import { StageNode } from './stage-node';
import { FrameworkNode } from './framework-node';
import { ToolNode } from './tool-node';
import { PromptNode } from './prompt-node';
import { ProjectNode } from './project-node';
import { CanvasToolbar } from './canvas-toolbar';
import { motion } from 'framer-motion';

export function WorkflowCanvas({ onSwitchToPromptTab }: { onSwitchToPromptTab?: () => void }) {
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    addEdge: addStoreEdge, 
    selectNode, 
    updateNodePosition,
    saveWorkflowToStorage 
  } = useWorkflowStore();

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isMarqueeMode, setIsMarqueeMode] = useState(false);
  const [marqueeRect, setMarqueeRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const nodeTypes = {
    stage: StageNode,
    framework: FrameworkNode,
    tool: (props: any) => <ToolNode {...props} onSwitchToPromptTab={onSwitchToPromptTab} />,
    prompt: PromptNode,
    project: ProjectNode,
  };
  
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Sync with store
  useMemo(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))' },
      } as Edge;
      
      setFlowEdges((eds) => addEdge(newEdge, eds));
      addStoreEdge(newEdge);
    },
    [setFlowEdges, addStoreEdge]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);
      
      // Handle position changes and auto-save
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id) {
          // Update position in store and auto-save
          updateNodePosition(change.id, change.position);
        }
      });
      
      // Also sync the current state to store for other types of changes
      setFlowNodes((currentNodes) => {
        const updatedNodes = [...currentNodes];
        setNodes(updatedNodes);
        return updatedNodes;
      });
    },
    [onNodesChange, updateNodePosition, setNodes, setFlowNodes]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);
      
      // Auto-save edges when they change
      setFlowEdges((currentEdges) => {
        const updatedEdges = [...currentEdges];
        setEdges(updatedEdges);
        saveWorkflowToStorage();
        return updatedEdges;
      });
    },
    [onEdgesChange, setEdges, setFlowEdges, saveWorkflowToStorage]
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
    },
    []
  );

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
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
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
      
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        selectionMode={isMarqueeMode ? SelectionMode.Full : SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        fitView
        style={{ backgroundColor: '#333446' }}
        colorMode="system"
      >
        <Background
          color="rgba(255, 255, 255, 0.3)"
          gap={20}
          size={2}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="bg-card border border-border shadow-lg"
        />
        <MiniMap
          className="bg-card border border-border shadow-lg"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--muted))"
        />
      </ReactFlow>
    </motion.div>
  );
}