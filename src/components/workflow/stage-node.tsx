import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Settings, MoreVertical, Plus } from 'lucide-react';
import { UXStage, UXTool, UXFramework, useWorkflowStore } from '@/stores/workflow-store';
import { NodeActionsMenu } from './node-actions-menu';
import { getSmartPosition } from '@/utils/node-positioning';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { getFrameworkColors } from '@/lib/framework-colors';

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
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);
  
  // Get framework colors, fallback to design-thinking if no framework
  const colors = getFrameworkColors(framework?.id || 'design-thinking');

  const handleAddTool = (tool: UXTool) => {
    // Use smart positioning to avoid overlaps
    const newPosition = getSmartPosition('tool', nodes, { 
      sourceNodeId: id,
      workflowType: 'stage-to-tool' 
    });
    
    const toolNode = {
      id: `tool-${tool.id}-${Date.now()}`,
      type: 'tool',
      position: newPosition,
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
    if (existingToolNodes.length === 0 && stage.tools) {
      stage.tools.forEach((tool, index) => {
        // Use smart positioning for each tool
        const newPosition = getSmartPosition('tool', nodes, { 
          sourceNodeId: id,
          workflowType: 'stage-to-tool' 
        });
        
        const toolNode = {
          id: `tool-${tool.id}-${Date.now()}-${index}`,
          type: 'tool',
          position: newPosition,
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
      className="w-72"
    >
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
      
      <Card 
        className={`w-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col ${selected ? 'ring-2 ring-offset-2' : ''}`}
        style={{
          backgroundColor: isActive ? colors.background.hover : colors.background.secondary,
          borderTopWidth: '2px',
          borderRightWidth: '2px',
          borderBottomWidth: '2px',
          borderLeftWidth: '4px',
          borderTopColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderRightColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderBottomColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderLeftColor: colors.border.secondary,
          borderStyle: 'solid',
          ...(selected && {
            '--tw-ring-color': colors.border.primary,
            '--tw-ring-offset-shadow': `0 0 0 2px ${colors.background.secondary}`,
            '--tw-ring-shadow': `0 0 0 calc(2px + 2px) ${colors.border.primary}`
          })
        }}
      >
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: isCompleted ? '#10B981' : isActive ? colors.background.primary : colors.border.tertiary
              }}
            />
            <h3 className="font-semibold text-sm" style={{ color: colors.text.secondary }}>{stage.name}</h3>
          </div>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex-shrink-0 mb-3 max-h-12 overflow-hidden">
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: colors.text.light }}>
            {stage.description}
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between text-xs mb-2 flex-shrink-0">
            <span style={{ color: colors.text.light }}>Tools</span>
            <Badge 
              className="text-xs font-medium" 
              style={{ 
                backgroundColor: colors.background.primary, 
                color: colors.text.primary,
                borderColor: colors.border.primary
              }}
            >
              {stage.tools?.length || 0}
            </Badge>
          </div>
          <div className="space-y-1">
            {(stage.tools || []).map((tool) => (
              <div 
                key={tool.id}
                className="flex items-center justify-between p-1 rounded cursor-pointer group text-xs flex-shrink-0 transition-colors duration-200"
                style={{
                  backgroundColor: colors.background.tertiary,
                  borderLeft: `2px solid ${colors.border.tertiary}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.hover;
                  // Update text colors for a11y compliance
                  const toolTitle = e.currentTarget.querySelector('[data-tool-item-title]');
                  if (toolTitle) toolTitle.style.color = colors.text.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.tertiary;
                  // Restore original text colors
                  const toolTitle = e.currentTarget.querySelector('[data-tool-item-title]');
                  if (toolTitle) toolTitle.style.color = colors.text.secondary;
                }}
                onClick={() => handleAddTool(tool)}
              >
                <span data-tool-item-title className="font-medium" style={{ color: colors.text.secondary }}>{tool.name}</span>
                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.text.secondary }} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-3 flex-shrink-0">
          <Button 
            size="sm" 
            className="flex-1 text-xs h-7" 
            style={{
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              borderColor: colors.border.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.hover;
              e.currentTarget.style.color = colors.text.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.primary;
              e.currentTarget.style.color = colors.text.primary;
            }}
            onClick={handleRunStage}
          >
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
  );
});

StageNode.displayName = 'StageNode';