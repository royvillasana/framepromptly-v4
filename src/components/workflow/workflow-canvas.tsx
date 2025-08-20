import { useCallback, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflow-store';
import { StageNode } from './stage-node';
import { FrameworkNode } from './framework-node';
import { ToolNode } from './tool-node';
import { PromptNode } from './prompt-node';
import { ProjectNode } from './project-node';
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
      style={{ backgroundColor: '#333446' }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
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