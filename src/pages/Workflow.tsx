import { useEffect, useState, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Plus, Save, Play, Share, Sparkles, Layers, ChevronDown, BookOpen, ArrowLeft, Copy, Download, ChevronRight, X } from 'lucide-react';
import { NodeDetails } from '@/components/workflow/node-details';
import { KnowledgeTabPanel } from '@/components/knowledge/knowledge-tab-panel';
import { ProjectSidebar } from '@/components/workflow/project-sidebar';
import { toast } from 'sonner';

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
  const {
    selectedFramework,
    selectedStage,
    selectedNode,
    expandedPromptId,
    selectFramework,
    selectStage,
    frameworks,
    initializeFrameworks,
    addNode,
    loadWorkflowFromStorage
  } = useWorkflowStore();
  const { initializeTemplates, loadProjectPrompts, clearProjectPrompts, currentPrompt, setCurrentPrompt, executePrompt, isGenerating, updatePromptVariables } = usePromptStore();
  const { currentProject, saveCanvasData } = useProjectStore();
  const [activePanel, setActivePanel] = useState<'canvas' | 'prompts' | 'knowledge'>('canvas');
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    initializeFrameworks();
    initializeTemplates();

    // Load workflow from localStorage if no current project
    if (!currentProject) {
      loadWorkflowFromStorage();
    }
  }, [currentProject]); // Removed Zustand functions from deps - they're stable

  // Load project-specific data when project changes
  useEffect(() => {
    if (!currentProject) return;

    // Load prompts for this project
    loadProjectPrompts(currentProject.id);

    return () => {
      // Clear project-specific data when project changes
      clearProjectPrompts();
    };
  }, [currentProject?.id, loadProjectPrompts, clearProjectPrompts]);

  // Initialize variables when current prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setVariables(currentPrompt.variables || {});
    }
  }, [currentPrompt]);

  const handleFrameworkSelection = (framework: any) => {
    console.log('Handling framework selection:', framework);
    selectFramework(framework);
    const newNode = {
      id: `framework-${framework.id}`,
      type: 'framework',
      position: { x: 100, y: 100 },
      data: { framework, isSelected: true },
    };
    console.log('Creating framework node:', newNode);
    addNode(newNode);
    console.log('Current nodes after adding framework:', nodes);
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

  const handleVariableChange = (key: string, value: string) => {
    const newVariables = { ...variables, [key]: value };
    setVariables(newVariables);
    if (currentPrompt) {
      updatePromptVariables(currentPrompt.id, newVariables);
    }
  };

  const handleExecutePrompt = async () => {
    if (!currentPrompt) return;
    
    try {
      await executePrompt(currentPrompt.id);
    } catch (error) {
      console.error('Failed to execute prompt:', error);
    }
  };

  const handleCopyPrompt = () => {
    if (!currentPrompt) return;
    
    let content = currentPrompt.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard');
  };


  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{(\w+)}}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  return (
    <div className="h-screen bg-background flex flex-col w-full">
      <Navigation />
      
      <div className="flex-1 flex w-full">
        {/* Project Sidebar - Hidden when prompt is expanded */}
        {!expandedPromptId && (
          <ProjectSidebar 
            activePanel={activePanel} 
            onPanelChange={setActivePanel}
          >
            
            <TabsContent value="canvas" className="m-0 h-[calc(100vh-380px)]">
              <div className="p-4 space-y-4 h-full overflow-y-auto">
                {currentPrompt ? (
                  // Prompt Details View
                  <div className="space-y-4">
                    {/* Header with back button */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPrompt(null)}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-medium text-sm">Prompt Details</h3>
                    </div>

                    {/* Context Info */}
                    <div className="p-3 border border-border bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Badge variant="outline">{currentPrompt.context.framework.name}</Badge>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline">{currentPrompt.context.stage.name}</Badge>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="default">{currentPrompt.context.tool.name}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(currentPrompt.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* Variables Section */}
                    {extractVariables(currentPrompt.content).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Customize Variables</h4>
                        <div className="grid gap-3">
                          {extractVariables(currentPrompt.content).map((variable) => (
                            <div key={variable} className="space-y-1">
                              <Label className="text-xs capitalize">
                                {variable.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <Input
                                placeholder={`Enter ${variable}`}
                                value={variables[variable] || ''}
                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompt Content */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Generated Prompt</h4>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleExecutePrompt}
                            disabled={isGenerating}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {isGenerating ? 'Generating...' : 'Execute'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Prompt Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{currentPrompt.content.length} characters</span>
                        <span>{currentPrompt.content.split('\n').length} lines</span>
                        <span>{currentPrompt.content.split(' ').length} words</span>
                      </div>
                      
                      <ScrollArea className="max-h-64">
                        <div className="p-3 bg-muted/50 rounded-md border">
                          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                            {currentPrompt.content}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Output Section */}
                    {currentPrompt.output && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">AI Output</h4>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                        <ScrollArea className="max-h-48">
                          <div className="p-3 bg-card rounded-md border">
                            <div className="text-sm whitespace-pre-wrap">
                              {currentPrompt.output}
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : !selectedFramework ? (
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
                       <h4 className="font-medium text-sm">Framework Stages</h4>
                       <p className="text-xs text-muted-foreground">
                         Add stages to your workflow to access their tools
                       </p>
                       <div className="space-y-2">
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
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="prompts" className="m-0 h-[calc(100vh-380px)]">
              <PromptPanel onPromptView={() => setActivePanel('canvas')} />
            </TabsContent>
            
            <TabsContent value="knowledge" className="m-0 h-[calc(100vh-380px)]">
              <KnowledgeTabPanel />
            </TabsContent>
          </ProjectSidebar>
        )}
        
        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas
            onSwitchToPromptTab={() => setActivePanel('prompts')}
            initialNodes={currentProject.canvas_data?.nodes || []}
            initialEdges={currentProject.canvas_data?.edges || []}
            projectId={currentProject.id}
          />
        </div>
      </div>
    </div>
  );
}