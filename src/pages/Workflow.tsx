import { useEffect, useState } from 'react';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { PromptPanel } from '@/components/workflow/prompt-panel';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Share, Sparkles, Layers } from 'lucide-react';

export default function Workflow() {
  const { initializeFrameworks, frameworks, selectFramework, addNode } = useWorkflowStore();
  const { initializeTemplates } = usePromptStore();
  const [rightPanel, setRightPanel] = useState<'canvas' | 'prompts'>('canvas');

  useEffect(() => {
    initializeFrameworks();
    initializeTemplates();
  }, [initializeFrameworks, initializeTemplates]);

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
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-card border-r border-border p-6 overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Toolbar */}
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

            {/* Frameworks */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">UX Frameworks</h3>
              <div className="space-y-2">
                {frameworks.map((framework) => (
                  <Card
                    key={framework.id}
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                    onClick={() => handleAddFramework(framework)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: framework.color }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{framework.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {framework.stages.length} stages
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sample Stages */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Sample Stages</h3>
              <div className="space-y-2">
                {frameworks[0]?.stages.map((stage) => (
                  <Card
                    key={stage.id}
                    className="p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                    onClick={() => handleAddStage(stage)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-xs">{stage.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {stage.tools.length} tools
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1">
            <WorkflowCanvas />
          </div>
          
          {/* Right Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-96 border-l border-border bg-card"
          >
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
              
              <TabsContent value="canvas" className="m-0 h-[calc(100vh-200px)]">
                <div className="p-4 space-y-4 h-full overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Available Tools</h3>
                    <div className="space-y-2">
                      {frameworks[0]?.stages.flatMap(stage => 
                        stage.tools.map(tool => (
                          <Card
                            key={`${stage.id}-${tool.id}`}
                            className="p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                            onClick={() => handleAddTool(tool, frameworks[0], stage)}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-xs">{tool.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {stage.name} • {tool.category}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="prompts" className="m-0 h-[calc(100vh-200px)]">
                <PromptPanel />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}