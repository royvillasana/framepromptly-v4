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
import { getFrameworkColors } from '@/lib/framework-colors';

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
  const colors = getFrameworkColors(framework.id);

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
      width: 250,
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
        width: 250,
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
      nodeType="framework"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
      <Card className={`
        w-full h-full p-6 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col overflow-hidden
        ${selected || isSelected ? 'ring-2 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: colors.background.tertiary,
        borderTopWidth: '2px',
        borderRightWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '6px',
        borderTopColor: selected || isSelected ? colors.border.primary : colors.border.secondary,
        borderRightColor: selected || isSelected ? colors.border.primary : colors.border.secondary,
        borderBottomColor: selected || isSelected ? colors.border.primary : colors.border.secondary,
        borderLeftColor: colors.border.primary,
        borderStyle: 'solid',
        ...(selected || isSelected && {
          '--tw-ring-color': colors.border.primary,
          '--tw-ring-offset-shadow': `0 0 0 2px ${colors.background.tertiary}`,
          '--tw-ring-shadow': `0 0 0 calc(2px + 2px) ${colors.border.primary}`
        })
      }}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.background.primary }}
            >
              <Layers className="w-5 h-5" style={{ color: colors.text.primary }} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: colors.text.secondary }}>{framework.name}</h3>
              <p className="text-sm" style={{ color: colors.text.light }}>
                {framework.stages.length} stages
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-shrink-0 mb-4 max-h-20 overflow-hidden">
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: colors.text.light }}>
            {framework.description}
          </p>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between text-sm mb-3 flex-shrink-0">
            <span style={{ color: colors.text.light }}>Stages</span>
            <Badge 
              className="font-medium" 
              style={{ 
                backgroundColor: colors.background.primary, 
                color: colors.text.primary,
                borderColor: colors.border.primary
              }}
            >
              {framework.stages.length}
            </Badge>
          </div>
          <div className="flex-1 space-y-2 p-1">
            {framework.stages.map((stage) => (
              <div 
                key={stage.id}
                className="p-2 rounded-md text-xs transition-colors cursor-pointer group flex-shrink-0"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderLeft: `3px solid ${colors.border.secondary}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.hover;
                  // Update text colors for a11y compliance
                  const stageTitle = e.currentTarget.querySelector('[data-stage-item-title]');
                  const stageTools = e.currentTarget.querySelector('[data-stage-item-tools]');
                  if (stageTitle) stageTitle.style.color = colors.text.hover;
                  if (stageTools) stageTools.style.color = colors.text.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary;
                  // Restore original text colors
                  const stageTitle = e.currentTarget.querySelector('[data-stage-item-title]');
                  const stageTools = e.currentTarget.querySelector('[data-stage-item-tools]');
                  if (stageTitle) stageTitle.style.color = colors.text.secondary;
                  if (stageTools) stageTools.style.color = colors.text.light;
                }}
                onClick={() => handleAddStage(stage)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div data-stage-item-title className="font-medium" style={{ color: colors.text.secondary }}>{stage.name}</div>
                    <div data-stage-item-tools style={{ color: colors.text.light }}>
                      {stage.tools.length} tools
                    </div>
                  </div>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.text.secondary }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 flex-shrink-0">
          <Button 
            variant="gradient-primary-subtle"
            className="flex-1 text-sm h-8" 
            onClick={handleUseFramework}
          >
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