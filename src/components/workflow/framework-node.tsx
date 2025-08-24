import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Layers, Settings, MoreVertical, Plus } from 'lucide-react';
import { UXFramework, UXStage, useWorkflowStore } from '@/stores/workflow-store';
import { NodeActionsMenu } from './node-actions-menu';
import { getSmartPosition } from '@/utils/node-positioning';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { ResizableNode } from './resizable-node';

interface FrameworkNodeData {
  framework: UXFramework;
  isSelected?: boolean;
}

interface FrameworkNodeProps {
  data: FrameworkNodeData;
  selected?: boolean;
}

export const FrameworkNode = memo(({ data, selected, id }: FrameworkNodeProps & { id?: string }) => {
  const { framework, isSelected } = data;
  const { addNode, addEdge, nodes } = useWorkflowStore();
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);

  const handleAddStage = (stage: UXStage) => {
    // Use smart positioning to avoid overlaps
    const newPosition = getSmartPosition('stage', nodes, { 
      sourceNodeId: id,
      workflowType: 'framework-to-stage' 
    });
    
    const stageNode = {
      id: `stage-${stage.id}-${Date.now()}`,
      type: 'stage',
      position: newPosition,
      data: {
        stage,
        framework
      }
    };
    
    addNode(stageNode);
    
    // Create edge from framework to stage
    if (id) {
      const edge = {
        id: `edge-${id}-${stageNode.id}`,
        source: id,
        target: stageNode.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))' }
      };
      addEdge(edge);
    }
  };

  const handleUseFramework = () => {
    // Create all stages at once with smart positioning
    framework.stages.forEach((stage, index) => {
      // For multiple stages, use smart positioning with some variety
      const newPosition = getSmartPosition('stage', nodes, { 
        sourceNodeId: id,
        workflowType: 'framework-to-stage' 
      });
      
      const stageNode = {
        id: `stage-${stage.id}-${Date.now()}-${index}`,
        type: 'stage',
        position: newPosition,
        data: {
          stage,
          framework
        }
      };
      
      addNode(stageNode);
      
      // Create edge from framework to stage
      if (id) {
        const edge = {
          id: `edge-${id}-${stageNode.id}`,
          source: id,
          target: stageNode.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))' }
        };
        addEdge(edge);
      }
    });
  };

  return (
    <ResizableNode 
      selected={selected || isSelected} 
      minWidth={300} 
      minHeight={250}
      maxWidth={500}
      maxHeight={600}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={selected || isSelected ? {} : { scale: 1.02 }}
      >
      <Card className={`
        w-full h-full p-6 transition-all duration-300 shadow-lg hover:shadow-xl
        ${selected || isSelected ? 'ring-2 ring-primary ring-offset-2 border-2 border-primary' : 'border'}
        bg-gradient-to-br from-card to-primary-light/10
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: framework.color }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{framework.name}</h3>
              <p className="text-sm text-muted-foreground">
                {framework.stages.length} stages
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {framework.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stages</span>
            <Badge variant="secondary">
              {framework.stages.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {framework.stages.map((stage) => (
              <div 
                key={stage.id}
                className="p-2 bg-secondary/50 rounded-md text-xs hover:bg-secondary/70 transition-colors cursor-pointer group"
                onClick={() => handleAddStage(stage)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{stage.name}</div>
                    <div className="text-muted-foreground">
                      {stage.tools.length} tools
                    </div>
                  </div>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="flex-1 text-sm h-8" onClick={handleUseFramework}>
            <Layers className="w-4 h-4 mr-2" />
            Use Framework
          </Button>
          <NodeActionsMenu
            nodeId={id || ''}
            nodeType="framework"
            nodeData={data}
            position={{ x: 0, y: 0 }}
          />
        </div>
      </Card>

      {/* Draggable Connection Handles */}
      <DraggableHandle
        id="target-1"
        type="target"
        initialPosition={handlePositions['target-1'] || 'top'}
        onPositionChange={(position) => updateHandlePosition('target-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="target-2"
        type="target"
        initialPosition={handlePositions['target-2'] || 'left'}
        onPositionChange={(position) => updateHandlePosition('target-2', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="source-1"
        type="source"
        initialPosition={handlePositions['source-1'] || 'right'}
        onPositionChange={(position) => updateHandlePosition('source-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="source-2"
        type="source"
        initialPosition={handlePositions['source-2'] || 'bottom'}
        onPositionChange={(position) => updateHandlePosition('source-2', position)}
        nodeId={id}
      />
    </motion.div>
    </ResizableNode>
  );
});

FrameworkNode.displayName = 'FrameworkNode';