import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Settings, MoreVertical, Plus } from 'lucide-react';
import { UXStage, UXTool, UXFramework, useWorkflowStore } from '@/stores/workflow-store';
import { NodeActionsMenu } from './node-actions-menu';

interface StageNodeData {
  stage: UXStage;
  framework?: UXFramework;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface StageNodeProps {
  data: StageNodeData;
  selected?: boolean;
}

export const StageNode = memo(({ data, selected, id }: StageNodeProps & { id?: string }) => {
  const { stage, framework, isActive, isCompleted } = data;
  const { addNode, addEdge, nodes } = useWorkflowStore();

  const handleAddTool = (tool: UXTool) => {
    // Get the current stage node position
    const stageNode = nodes.find(node => node.id === id);
    const baseX = stageNode ? stageNode.position.x + 350 : 850;
    const baseY = stageNode ? stageNode.position.y : 100;
    
    // Find existing tool nodes for this stage to calculate offset
    const existingToolNodes = nodes.filter(node => 
      node.type === 'tool' && 
      node.data &&
      (node.data as any).stage?.id === stage.id
    );
    
    const yOffset = existingToolNodes.length * 100;
    
    const toolNode = {
      id: `tool-${tool.id}-${Date.now()}`,
      type: 'tool',
      position: { x: baseX, y: baseY + yOffset },
      data: {
        tool,
        stage,
        framework
      }
    };
    
    addNode(toolNode);
    
    // Create edge from stage to tool
    if (id) {
      const edge = {
        id: `edge-${id}-${toolNode.id}`,
        source: id,
        target: toolNode.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))' }
      };
      addEdge(edge);
    }
  };

  const handleRunStage = () => {
    // Check if there are already tools for this stage
    const existingToolNodes = nodes.filter(node => 
      node.type === 'tool' && 
      node.data &&
      (node.data as any).stage?.id === stage.id
    );
    
    // If no tools exist, create all tools for this stage
    if (existingToolNodes.length === 0) {
      // Get the current stage node position
      const stageNode = nodes.find(node => node.id === id);
      const baseX = stageNode ? stageNode.position.x + 350 : 850;
      const baseY = stageNode ? stageNode.position.y : 100;
      
      stage.tools.forEach((tool, index) => {
        const yOffset = index * 100;
        
        const toolNode = {
          id: `tool-${tool.id}-${Date.now()}-${index}`,
          type: 'tool',
          position: { x: baseX, y: baseY + yOffset },
          data: {
            tool,
            stage,
            framework
          }
        };
        
        addNode(toolNode);
        
        // Create edge from stage to tool
        if (id) {
          const edge = {
            id: `edge-${id}-${toolNode.id}`,
            source: id,
            target: toolNode.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--primary))' }
          };
          addEdge(edge);
        }
      });
    }
    // If tools already exist, just run the stage (existing behavior)
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Connection Handles - 4 points */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <Card className={`
        w-64 p-4 border transition-all duration-300 shadow-lg hover:shadow-xl
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isActive ? 'border-primary bg-primary-light' : 'border-border'}
        ${isCompleted ? 'border-success bg-success/5' : ''}
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`
              w-3 h-3 rounded-full
              ${isCompleted ? 'bg-success' : isActive ? 'bg-primary' : 'bg-muted'}
            `} />
            <h3 className="font-semibold text-sm">{stage.name}</h3>
          </div>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {stage.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tools</span>
            <Badge variant="secondary" className="text-xs">
              {stage.tools.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {stage.tools.slice(0, 4).map((tool) => (
              <div 
                key={tool.id}
                className="flex items-center justify-between p-1 hover:bg-secondary/50 rounded cursor-pointer group text-xs"
                onClick={() => handleAddTool(tool)}
              >
                <span className="font-medium">{tool.name}</span>
                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {stage.tools.length > 4 && (
              <div className="text-xs text-muted-foreground p-1">
                +{stage.tools.length - 4} more tools
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" className="flex-1 text-xs h-7" onClick={handleRunStage}>
            <Play className="w-3 h-3 mr-1" />
            Run Stage
          </Button>
          <NodeActionsMenu
            nodeId={id || ''}
            nodeType="stage"
            nodeData={data}
            position={{ x: 0, y: 0 }}
          />
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </motion.div>
  );
});

StageNode.displayName = 'StageNode';