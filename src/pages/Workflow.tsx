import { useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { PromptPanel } from '@/components/workflow/prompt-panel';
import { ProjectList } from '@/components/project/project-list';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Share, Sparkles, Layers, ChevronDown } from 'lucide-react';

export default function Workflow() {
  const { currentProject, fetchProjects } = useProjectStore();

  // If no current project is selected, show project selection
  if (!currentProject) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 p-6">
          <ProjectList />
        </div>
      </div>
    );
  }

  // Only call other hooks after we know we have a project
  return <WorkflowWithProject />;
}

function WorkflowWithProject() {
  const { initializeFrameworks, frameworks, selectedFramework, selectFramework, addNode, loadCanvasData } = useWorkflowStore();
  const { initializeTemplates } = usePromptStore();
  const { currentProject } = useProjectStore();
  const [rightPanel, setRightPanel] = useState<'canvas' | 'prompts'>('canvas');

  useEffect(() => {
    initializeFrameworks();
    initializeTemplates();
  }, [initializeFrameworks, initializeTemplates]);

  // Load canvas data when project changes
  useEffect(() => {
    if (currentProject?.canvas_data) {
      loadCanvasData(currentProject.canvas_data);
    }
  }, [currentProject, loadCanvasData]);

  const handleAddFramework = (framework: any) => {
    selectFramework(framework);
    const newNode = {
      id: `framework-${framework.id}`,
      type: 'framework',
      position: { x: 100, y: 100 },
      data: { framework, isSelected: true },
    };
    addNode(newNode);
  };

  const handleAddStage = (stage: any) => {
    const newNode = {
      id: `stage-${stage.id}-${Date.now()}`,
      type: 'stage',
      position: { x: 300, y: 200 },
      data: { stage, isActive: true },
    };
    addNode(newNode);
  };

  const handleAddTool = (tool: any, framework?: any, stage?: any) => {
    const newNode = {
      id: `tool-${tool.id}-${Date.now()}`,
      type: 'tool',
      position: { x: 500, y: 300 },
      data: { tool, framework, stage, isActive: true },
    };
    addNode(newNode);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas onSwitchToPromptTab={() => setRightPanel('prompts')} />
        </div>
        
        {/* Right Panel */}
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-96 border-l border-border bg-card"
        >
          {/* Framework Selector Header */}
          <div className="border-b border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Workflow Builder</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Select UX Framework</h3>
              <Select onValueChange={(value) => {
                const framework = frameworks.find(f => f.id === value);
                if (framework) selectFramework(framework);
              }}>
                <SelectTrigger className="w-full bg-background border border-border shadow-sm hover:bg-accent/50 transition-colors">
                  <SelectValue placeholder="Choose a framework..." />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
                  {frameworks.map((framework) => (
                    <SelectItem 
                      key={framework.id} 
                      value={framework.id}
                      className="cursor-pointer hover:bg-accent focus:bg-accent"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: framework.color }}
                        />
                        <div>
                          <div className="font-medium">{framework.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {framework.stages.length} stages
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={rightPanel} onValueChange={(value: any) => setRightPanel(value)}>
            <div className="border-b border-border p-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="canvas" className="text-xs">
                  <Layers className="w-3 h-3 mr-1" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="prompts" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Prompts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="canvas" className="m-0 h-[calc(100vh-280px)]">
              <div className="p-4 space-y-4 h-full overflow-y-auto">
                {!selectedFramework ? (
                  <div className="text-center py-8">
                    <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Framework</h3>
                    <p className="text-muted-foreground text-sm">
                      Choose a UX framework from the dropdown above to see its details and add tools to your workflow
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: selectedFramework.color }}
                      >
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold">{selectedFramework.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedFramework.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Framework Characteristics</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedFramework.characteristics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => handleAddFramework(selectedFramework)}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Add Framework to Canvas
                        </Button>
                        {selectedFramework.stages.map((stage) => (
                          <Button
                            key={stage.id}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleAddStage(stage)}
                          >
                            <Plus className="w-3 h-3 mr-2" />
                            Add {stage.name} Stage
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Available Tools by Stage</h4>
                      <div className="space-y-3">
                        {selectedFramework.stages.map((stage) => (
                          <div key={stage.id} className="space-y-2">
                            <div className="bg-accent/30 rounded-lg p-2 border-l-2 border-primary">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <h5 className="font-semibold text-xs">{stage.name}</h5>
                                  <Badge variant="secondary" className="text-xs h-4 px-1">
                                    {stage.tools.length}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{stage.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-1 ml-3">
                              {stage.tools.map((tool) => (
                                <Button
                                  key={`${stage.id}-${tool.id}`}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start h-auto p-2 text-left"
                                  onClick={() => handleAddTool(tool, selectedFramework, stage)}
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <div className="w-3 h-3 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                                      <Plus className="w-2 h-2 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-xs truncate">{tool.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {tool.category} • {tool.characteristics.effort}
                                      </div>
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="prompts" className="m-0 h-[calc(100vh-280px)]">
              <PromptPanel />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}