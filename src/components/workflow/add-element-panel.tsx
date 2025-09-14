import { useState } from 'react';
import { X, Sparkles, Layers, Settings, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/stores/workflow-store';
import { getSmartPosition } from '@/utils/node-positioning';
import { NodeDetails } from './node-details';
import { toast } from 'sonner';

interface AddElementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSelection?: () => void;
  selectedNode?: any;
}

export function AddElementPanel({ isOpen, onClose, onClearSelection, selectedNode }: AddElementPanelProps) {
  const { frameworks, nodes, addNode, selectFramework, addEdge } = useWorkflowStore();
  const [activeSection, setActiveSection] = useState<'main' | 'frameworks' | 'stages' | 'tools'>('main');
  const [selectedFramework, setSelectedFramework] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<any>(null);

  if (!isOpen) return null;

  // Helper functions to find parent nodes
  const findFrameworkNodes = () => {
    return nodes.filter(node => node.type === 'framework');
  };

  const findStageNodesForFramework = (frameworkId: string) => {
    return nodes.filter(node => 
      node.type === 'stage' && 
      node.data.framework?.id === frameworkId
    );
  };

  const getAvailableFrameworksForStages = () => {
    const frameworkNodes = findFrameworkNodes();
    return frameworks.filter(framework => 
      frameworkNodes.some(node => node.data.framework?.id === framework.id)
    );
  };

  const getAvailableStagesForTools = () => {
    const stageNodes = nodes.filter(node => node.type === 'stage');
    const availableStages: any[] = [];
    
    stageNodes.forEach(stageNode => {
      if (stageNode.data.stage && stageNode.data.framework) {
        availableStages.push({
          stage: stageNode.data.stage,
          framework: stageNode.data.framework,
          nodeId: stageNode.id
        });
      }
    });
    
    return availableStages;
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
    onClose();
  };

  const handleStageSelection = (stage: any, framework: any) => {
    // Find the parent framework node
    const parentFrameworkNode = nodes.find(node => 
      node.type === 'framework' && 
      node.data.framework?.id === framework.id
    );

    if (!parentFrameworkNode) {
      toast.error(`You need to add the ${framework.name} framework first before adding its stages.`);
      return;
    }

    const position = getSmartPosition('stage', nodes);
    const newStageNode = {
      id: `stage-${stage.id}-${Date.now()}`,
      type: 'stage' as const,
      position,
      data: {
        stage,
        framework,
        isActive: false,
        isDone: false,
      },
    };
    
    addNode(newStageNode);
    
    // Create edge from framework to stage
    const newEdge = {
      id: `edge-${parentFrameworkNode.id}-${newStageNode.id}`,
      source: parentFrameworkNode.id,
      target: newStageNode.id,
      type: 'default'
    };
    addEdge(newEdge);
    
    onClearSelection?.();
    onClose();
  };

  const handleToolSelection = (tool: any, framework: any, stage: any) => {
    // Find the parent stage node
    const parentStageNode = nodes.find(node => 
      node.type === 'stage' && 
      node.data.stage?.id === stage.id &&
      node.data.framework?.id === framework.id
    );

    if (!parentStageNode) {
      toast.error(`You need to add the ${stage.name} stage from ${framework.name} framework first before adding its tools.`);
      return;
    }

    const position = getSmartPosition('tool', nodes);
    const newToolNode = {
      id: `tool-${tool.id}-${Date.now()}`,
      type: 'tool' as const,
      position,
      data: {
        tool,
        framework,
        stage,
        isActive: false,
        isDone: false,
      },
    };
    
    addNode(newToolNode);
    
    // Create edge from stage to tool
    const newEdge = {
      id: `edge-${parentStageNode.id}-${newToolNode.id}`,
      source: parentStageNode.id,
      target: newToolNode.id,
      type: 'default'
    };
    addEdge(newEdge);
    
    onClearSelection?.();
    onClose();
  };

  const renderMainView = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto"
        onClick={() => setActiveSection('frameworks')}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-medium">Add UX Framework</div>
            <div className="text-xs text-muted-foreground">
              Choose from {frameworks.length} available frameworks
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto"
        onClick={() => setActiveSection('stages')}
      >
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-blue-500" />
          <div className="text-left">
            <div className="font-medium">Add UX Stage</div>
            <div className="text-xs text-muted-foreground">
              Add stages from any framework
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto"
        onClick={() => setActiveSection('tools')}
      >
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-green-500" />
          <div className="text-left">
            <div className="font-medium">Add UX Tool</div>
            <div className="text-xs text-muted-foreground">
              Browse tools by framework and stage
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderFrameworksView = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveSection('main')}
        className="mb-2"
      >
        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
        Back
      </Button>
      <div className="space-y-1">
        {frameworks.map((framework) => (
          <Button
            key={framework.id}
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
            onClick={() => handleFrameworkSelection(framework)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: framework.color }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium">{framework.name}</div>
                <div className="text-xs text-muted-foreground">
                  {framework.stages.length} stages
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStagesView = () => {
    const availableFrameworks = getAvailableFrameworksForStages();
    
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveSection('main')}
          className="mb-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Back
        </Button>
        
        {availableFrameworks.length === 0 ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No frameworks available</p>
            <p className="text-xs text-muted-foreground">
              Add a UX Framework first to enable stage selection
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableFrameworks.map((framework) => {
              const hasFrameworkOnCanvas = findFrameworkNodes().some(node => 
                node.data.framework?.id === framework.id
              );
              
              return (
                <div key={framework.id} className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: framework.color }}
                    />
                    {framework.name}
                    <Badge variant="outline" className="text-xs">
                      On Canvas
                    </Badge>
                  </div>
                  {framework.stages.map((stage) => (
                    <Button
                      key={`${framework.id}-${stage.id}`}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto ml-2"
                      onClick={() => handleStageSelection(stage, framework)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: framework.color }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm">{stage.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {stage.tools.length} tools
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderToolsView = () => {
    const availableStages = getAvailableStagesForTools();
    
    if (selectedFramework && selectedStage) {
      // Check if the selected stage exists on canvas
      const hasStageOnCanvas = availableStages.some(item => 
        item.stage.id === selectedStage.id && 
        item.framework.id === selectedFramework.id
      );
      
      if (!hasStageOnCanvas) {
        return (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStage(null);
                setSelectedFramework(null);
              }}
              className="mb-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back to Frameworks
            </Button>
            <div className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Stage not available</p>
              <p className="text-xs text-muted-foreground">
                Add the {selectedStage.name} stage to the canvas first
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStage(null);
              setSelectedFramework(null);
            }}
            className="mb-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Frameworks
          </Button>
          <div className="mb-3">
            <div className="text-sm font-medium">{selectedFramework.name}</div>
            <div className="text-xs text-muted-foreground">{selectedStage.name}</div>
          </div>
          <div className="space-y-1">
            {selectedStage.tools.map((tool: any) => (
              <Button
                key={tool.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => handleToolSelection(tool, selectedFramework, selectedStage)}
              >
                <div className="flex items-center space-x-2 w-full">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: selectedFramework.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tool.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (selectedFramework) {
      // Filter stages that are available on canvas for this framework
      const frameworkStagesOnCanvas = availableStages.filter(item => 
        item.framework.id === selectedFramework.id
      );

      if (frameworkStagesOnCanvas.length === 0) {
        return (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFramework(null)}
              className="mb-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back to Frameworks
            </Button>
            <div className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No stages available</p>
              <p className="text-xs text-muted-foreground">
                Add stages from {selectedFramework.name} framework first
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFramework(null)}
            className="mb-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Frameworks
          </Button>
          <div className="mb-3">
            <div className="text-sm font-medium">{selectedFramework.name}</div>
            <div className="text-xs text-muted-foreground">Choose a stage</div>
          </div>
          <div className="space-y-1">
            {frameworkStagesOnCanvas.map((item) => (
              <Button
                key={item.stage.id}
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => setSelectedStage(item.stage)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: selectedFramework.color }}
                  />
                  <div className="text-left">
                    <div className="text-sm">{item.stage.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.stage.tools.length} tools
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs ml-auto mr-2">
                    On Canvas
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveSection('main')}
          className="mb-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Back
        </Button>
        
        {availableStages.length === 0 ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No stages available</p>
            <p className="text-xs text-muted-foreground">
              Add UX Frameworks and Stages to the canvas first
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group stages by framework */}
            {Object.entries(
              availableStages.reduce((acc: any, item) => {
                const frameworkId = item.framework.id;
                if (!acc[frameworkId]) {
                  acc[frameworkId] = {
                    framework: item.framework,
                    stages: []
                  };
                }
                acc[frameworkId].stages.push(item);
                return acc;
              }, {})
            ).map(([frameworkId, data]: [string, any]) => (
              <Button
                key={frameworkId}
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => setSelectedFramework(data.framework)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: data.framework.color }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{data.framework.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {data.stages.length} stages available
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedNodeView = () => {
    if (!selectedNode) return null;

    // If framework node is selected, show its stages
    if (selectedNode.type === 'framework') {
      const framework = selectedNode.data.framework;
      return (
        <div className="space-y-4">
          {/* Node Details Section */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: framework.color }}
              />
              <span className="font-medium text-sm">{framework.name}</span>
              <Badge variant="outline" className="text-xs">Selected</Badge>
            </div>
            <NodeDetails node={selectedNode} />
          </div>

          {/* Children Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Add Stages</h4>
            <div className="space-y-1">
              {framework.stages.map((stage: any) => (
                <Button
                  key={stage.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => handleStageSelection(stage, framework)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: framework.color }}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm">{stage.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {stage.tools.length} tools
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // If stage node is selected, show its tools
    if (selectedNode.type === 'stage') {
      const stage = selectedNode.data.stage;
      const framework = selectedNode.data.framework;
      return (
        <div className="space-y-4">
          {/* Node Details Section */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: framework.color }}
              />
              <span className="font-medium text-sm">{framework.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-sm">{stage.name}</span>
              <Badge variant="outline" className="text-xs">Selected</Badge>
            </div>
            <NodeDetails node={selectedNode} />
          </div>

          {/* Children Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Add Tools</h4>
            <div className="space-y-1">
              {stage.tools.map((tool: any) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => handleToolSelection(tool, framework, stage)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: framework.color }}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm">{tool.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // If tool node is selected, show message (tools have no children)
    if (selectedNode.type === 'tool') {
      const tool = selectedNode.data.tool;
      const framework = selectedNode.data.framework;
      const stage = selectedNode.data.stage;
      return (
        <div className="space-y-4">
          {/* Node Details Section */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: framework.color }}
              />
              <span className="font-medium text-sm">{framework.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm">{stage.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-sm">{tool.name}</span>
              <Badge variant="outline" className="text-xs">Selected</Badge>
            </div>
            <NodeDetails node={selectedNode} />
          </div>

          {/* No Children Message */}
          <div className="p-4 text-center">
            <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Tool Selected</p>
            <p className="text-xs text-muted-foreground">
              This tool has no child elements to add. You can interact with it directly on the canvas.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    // If a node is selected, show its children
    if (selectedNode) {
      return renderSelectedNodeView();
    }

    // Otherwise, show the normal navigation
    switch (activeSection) {
      case 'frameworks':
        return renderFrameworksView();
      case 'stages':
        return renderStagesView();
      case 'tools':
        return renderToolsView();
      default:
        return renderMainView();
    }
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-l border-border shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Add Elements</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {renderContent()}
      </ScrollArea>
    </div>
  );
}