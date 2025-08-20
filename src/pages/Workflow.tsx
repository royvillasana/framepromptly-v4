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
import { Plus, Save, Play, Share, Sparkles, Layers, ChevronDown, BookOpen, ArrowLeft, Copy, Download, ChevronRight } from 'lucide-react';
import { KnowledgeBasePanel } from '@/components/knowledge/knowledge-base-panel';
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
  const { initializeFrameworks, frameworks, selectedFramework, selectFramework, addNode, loadCanvasData, nodes, edges } = useWorkflowStore();
  const { initializeTemplates, loadProjectPrompts, clearProjectPrompts, currentPrompt, setCurrentPrompt, executePrompt, isGenerating, updatePromptVariables } = usePromptStore();
  const { currentProject, saveCanvasData } = useProjectStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'canvas' | 'prompts' | 'knowledge'>('canvas');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const lastAppliedRef = useRef<string>('');
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    initializeFrameworks();
    initializeTemplates();
  }, [initializeFrameworks, initializeTemplates]);

  // Load project-specific data when project changes
  useEffect(() => {
    if (!currentProject) return;
    
    // Load prompts for this project
    loadProjectPrompts(currentProject.id);
    
    // Load canvas data
    const canvas = currentProject.canvas_data || { nodes: [], edges: [] };
    loadCanvasData(canvas);
    const payload = JSON.stringify(canvas);
    lastAppliedRef.current = payload;
    lastSavedRef.current = payload; // prevent immediate save loop after load
    
    return () => {
      // Clear project-specific data when project changes
      clearProjectPrompts();
    };
  }, [currentProject?.id, loadCanvasData, loadProjectPrompts, clearProjectPrompts]);

  // Initialize variables when current prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setVariables(currentPrompt.variables || {});
    }
  }, [currentPrompt]);

  // Auto-save when nodes or edges change (debounced) and only if changed since last save
  useEffect(() => {
    if (!currentProject) return;

    const signature = JSON.stringify({ nodes, edges });
    // Skip if nothing changed compared to last applied/saved state
    if (signature === lastSavedRef.current || signature === lastAppliedRef.current) return;

    const timeoutId = setTimeout(() => {
      saveCanvasData(currentProject.id, nodes, edges);
      lastSavedRef.current = signature;
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, currentProject?.id, saveCanvasData]);

  const handleFrameworkSelection = (framework: any) => {
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
      {/* Header */}
      <div className="h-12 flex items-center border-b bg-card px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mr-2"
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Navigation />
      </div>
      
      <div className="flex-1 flex w-full">
        {/* Left Panel */}
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-80 border-r border-border bg-card"
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
                 if (framework) handleFrameworkSelection(framework);
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

          <Tabs value={activePanel} onValueChange={(value: any) => setActivePanel(value)}>
            <div className="border-b border-border p-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="canvas" className="text-xs">
                  <Layers className="w-3 h-3 mr-1" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="prompts" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Prompts
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Knowledge
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="canvas" className="m-0 h-[calc(100vh-280px)]">
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
                      
                      <ScrollArea className="max-h-48">
                        <div className="p-3 bg-muted/50 rounded-md border">
                          <pre className="text-xs whitespace-pre-wrap font-mono">
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
            
            <TabsContent value="prompts" className="m-0 h-[calc(100vh-280px)]">
              <PromptPanel onPromptView={() => setActivePanel('canvas')} />
            </TabsContent>
            
            <TabsContent value="knowledge" className="m-0 h-[calc(100vh-280px)]">
              <KnowledgeBasePanel />
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas onSwitchToPromptTab={() => setActivePanel('prompts')} />
        </div>
      </div>
    </div>
  );
}