import { useState } from 'react';
import { Plus, Grid3x3, Layers, MousePointer2, ZoomIn, ZoomOut, Maximize, Sparkles, Settings, Square, HelpCircle } from 'lucide-react';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '@/components/ui/toolbar';
import { useWorkflowStore } from '@/stores/workflow-store';
import { autoLayoutNodes, getSmartPosition } from '@/utils/node-positioning';
import { ToolbarCenteredAIBuilder } from './ai-builder-input-toolbar-centered';
import { AddElementPanel } from './add-element-panel';
import { Button } from '@/components/ui/button';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';

interface CanvasToolbarProps {
  onClearSelection?: () => void;
  isMarqueeMode?: boolean;
  onToggleMarqueeMode?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onApplyLayout?: () => void;
  selectedNode?: any;
  addNodeToCanvas?: (node: any) => void;
}

export function CanvasToolbar({
  onClearSelection,
  isMarqueeMode,
  onToggleMarqueeMode,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onApplyLayout,
  selectedNode,
  addNodeToCanvas
}: CanvasToolbarProps) {
  const { nodes, setNodes, addNode, addEdge, frameworks, selectFramework } = useWorkflowStore();
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleRearrangeNodes = () => {
    // Use the new Dagre-based layout if available, otherwise fallback to old layout
    if (onApplyLayout) {
      onApplyLayout();
    } else {
      const rearrangedNodes = autoLayoutNodes(nodes);
      setNodes(rearrangedNodes);
    }
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

  const handleAIWorkflowGenerated = (nodes: any[], edges: any[]) => {
    // The nodes and edges are already added to the workflow store by the AI Builder
    // We could add additional logic here if needed (e.g., auto-arrange, notifications, etc.)
    onClearSelection?.();
  };

  const handleFrameworkSelection = (framework: any) => {
    selectFramework(framework);
    const position = getSmartPosition('framework', nodes);
    const newNode = {
      id: `framework-${framework.id}`,
      type: 'framework' as const,
      position,
      data: { framework, isSelected: true },
    };
    addNode(newNode);
    onClearSelection?.();
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <Toolbar className="bg-card/95 backdrop-blur-sm border shadow-lg">
          {/* Fit View Control */}
          <ToolbarButton
            onClick={onFitView}
            title="Fit view"
          >
            <Maximize className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={handleRearrangeNodes}
            title="Rearrange nodes automatically"
          >
            <Grid3x3 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={onToggleMarqueeMode}
            title={isMarqueeMode ? "Exit drag selection mode" : "Enable drag selection mode"}
            className={isMarqueeMode ? "bg-primary text-primary-foreground" : ""}
          >
            {isMarqueeMode ? (
              <Square className="h-4 w-4" />
            ) : (
              <MousePointer2 className="h-4 w-4" />
            )}
          </ToolbarButton>
          
          <ToolbarSeparator />
          
          {/* AI Builder Input - Toolbar Centered */}
          <ToolbarCenteredAIBuilder onWorkflowGenerated={handleAIWorkflowGenerated} />
          
          <ToolbarSeparator />
          
          <ToolbarButton
            onClick={() => setIsAddPanelOpen(true)}
            title="Add new element to canvas"
            className={isAddPanelOpen ? "bg-primary text-primary-foreground" : ""}
          >
            <Plus className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Help / Keyboard Shortcuts */}
          <ToolbarButton
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </ToolbarButton>
        </Toolbar>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsDialog
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {/* Add Element Panel */}
      <AddElementPanel
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        onClearSelection={onClearSelection}
        selectedNode={selectedNode}
        addNodeToCanvas={addNodeToCanvas}
      />
    </>
  );
}