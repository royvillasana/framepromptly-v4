import { useState } from 'react';
import { Plus, Grid3x3, Layers, MousePointer2 } from 'lucide-react';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '@/components/ui/toolbar';
import { useWorkflowStore } from '@/stores/workflow-store';
import { autoLayoutNodes, getSmartPosition } from '@/utils/node-positioning';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface CanvasToolbarProps {
  onClearSelection?: () => void;
  isMarqueeMode?: boolean;
  onToggleMarqueeMode?: () => void;
}

export function CanvasToolbar({ onClearSelection, isMarqueeMode, onToggleMarqueeMode }: CanvasToolbarProps) {
  const { nodes, setNodes, addNode, frameworks } = useWorkflowStore();

  const handleRearrangeNodes = () => {
    const rearrangedNodes = autoLayoutNodes(nodes);
    setNodes(rearrangedNodes);
    onClearSelection?.();
  };

  const handleAddStageNode = () => {
    // Get a sample stage from the first framework for demo purposes
    const sampleFramework = frameworks[0];
    const sampleStage = sampleFramework?.stages[0];
    
    if (sampleStage) {
      const position = getSmartPosition('stage', nodes);
      const newNode = {
        id: `stage-${Date.now()}`,
        type: 'stage' as const,
        position,
        data: {
          stage: sampleStage,
          framework: sampleFramework,
          isActive: false,
          isDone: false,
        },
      };
      addNode(newNode);
    }
  };

  const handleAddToolNode = () => {
    // Get a sample tool from the first stage of the first framework
    const sampleTool = frameworks[0]?.stages[0]?.tools[0];
    
    if (sampleTool) {
      const position = getSmartPosition('tool', nodes);
      const newNode = {
        id: `tool-${Date.now()}`,
        type: 'tool' as const,
        position,
        data: {
          tool: sampleTool,
          isActive: false,
          isDone: false,
        },
      };
      addNode(newNode);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <Toolbar className="bg-card/95 backdrop-blur-sm">
        <ToolbarButton
          onClick={handleRearrangeNodes}
          title="Rearrange nodes automatically"
        >
          <Grid3x3 className="h-4 w-4" />
          Rearrange
        </ToolbarButton>
        
        <ToolbarButton
          onClick={onToggleMarqueeMode}
          title="Toggle marquee selection mode"
          className={isMarqueeMode ? "bg-primary text-primary-foreground" : ""}
        >
          <MousePointer2 className="h-4 w-4" />
          Marquee
        </ToolbarButton>
        
        <ToolbarSeparator />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton title="Add new node">
              <Plus className="h-4 w-4" />
              Add Node
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleAddStageNode}>
              <Layers className="h-4 w-4 mr-2" />
              Add UX Stage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToolNode}>
              <Plus className="h-4 w-4 mr-2" />
              Add UX Tool
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
    </div>
  );
}