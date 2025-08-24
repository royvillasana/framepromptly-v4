import { Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Layers, Wrench, FileText, FolderOpen, Clock, Users, Target, Lightbulb, Plus, BookOpen, Link2, ChevronRight, Bot } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';

interface NodeDetailsProps {
  node: Node;
}

export function NodeDetails({ node }: NodeDetailsProps) {
  const { nodes, edges, addNode, getConnectedNodes } = useWorkflowStore();
  const { prompts } = usePromptStore();
  const { entries } = useKnowledgeStore();
  
  // Get connected nodes for context
  const connectedNodes = getConnectedNodes(node.id);
  
  // Helper function to get connection path for a node
  const getConnectionPath = () => {
    const pathMap = new Map();
    
    // Special handling for prompt nodes - extract context from the prompt data
    if (node.type === 'prompt' && node.data?.prompt?.context) {
      const context = node.data.prompt.context;
      if (context.framework) {
        pathMap.set('framework', { data: context.framework, type: 'framework' });
      }
      if (context.stage) {
        pathMap.set('stage', { data: context.stage, type: 'stage' });
      }
      if (context.tool) {
        pathMap.set('tool', { data: context.tool, type: 'tool' });
      }
    } else {
      // For other nodes that contain embedded data from their connections (priority over connected nodes)
      if (node.data?.framework) {
        pathMap.set('framework', { data: node.data.framework, type: 'framework' });
      }
      if (node.data?.stage) {
        pathMap.set('stage', { data: node.data.stage, type: 'stage' });  
      }
      if (node.data?.tool) {
        pathMap.set('tool', { data: node.data.tool, type: 'tool' });
      }
      
      // Only add connected nodes if we don't already have embedded data for that type
      if (!pathMap.has('framework') && connectedNodes.frameworks.length > 0) {
        pathMap.set('framework', { data: connectedNodes.frameworks[0].data, type: 'framework' });
      }
      if (!pathMap.has('stage') && connectedNodes.stages.length > 0) {
        pathMap.set('stage', { data: connectedNodes.stages[0].data, type: 'stage' });
      }
      if (!pathMap.has('tool') && connectedNodes.tools.length > 0) {
        pathMap.set('tool', { data: connectedNodes.tools[0].data, type: 'tool' });
      }
    }
    
    // Convert to array, filter out entries without names, and sort in logical order: framework → stage → tool
    const paths = Array.from(pathMap.values())
      .filter(path => path.data?.name) // Only include entries that have a name
      .sort((a, b) => {
        const order = { framework: 0, stage: 1, tool: 2 };
        return order[a.type] - order[b.type];
      });
    
    return paths;
  };
  
  // Get linked knowledge entries for tool nodes
  const getLinkedKnowledge = () => {
    if (node.type === 'tool' && node.data?.linkedKnowledge) {
      const linkedIds = Array.isArray(node.data.linkedKnowledge) ? node.data.linkedKnowledge : [];
      return entries.filter(entry => linkedIds.includes(entry.id));
    }
    return [];
  };
  
  // Get prompts generated for this specific node
  const getNodePrompts = () => {
    return prompts.filter(prompt => {
      // Match by tool ID or node context
      if (node.type === 'tool') {
        return prompt.context?.tool?.id === node.data?.tool?.id || prompt.context?.tool?.id === node.data?.id;
      }
      return false;
    });
  };
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'framework':
        return <Sparkles className="w-4 h-4" />;
      case 'stage':
        return <Layers className="w-4 h-4" />;
      case 'tool':
        return <Wrench className="w-4 h-4" />;
      case 'prompt':
        return <FileText className="w-4 h-4" />;
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const renderFrameworkDetails = (data: any) => {
    // Framework data can be nested under data.framework (for connected nodes) or directly in data (for direct framework nodes)
    const framework = data.framework || data;
    
    const handleAddStage = (stage: any) => {
      const newNode: Node = {
        id: `stage-${stage.id}-${Date.now()}`,
        type: 'stage',
        position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
        data: stage,
      };
      addNode(newNode);
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: framework.color }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold">{framework.name}</h3>
          <p className="text-xs text-muted-foreground">{framework.description}</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Framework Characteristics</h4>
          <div className="grid grid-cols-1 gap-2">
            {framework.characteristics && Object.entries(framework.characteristics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium">{String(value)}</span>
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
            {framework.stages && framework.stages.map((stage: any) => (
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
    );
  };

  const renderStageDetails = (data: any) => {
    // Stage data can be nested under data.stage (for connected nodes) or directly in data (for direct stage nodes)
    const stage = data.stage || data;
    
    // Find tool nodes connected to this stage node via edges
    const connectedToolNodes = edges
      .filter(edge => edge.source === node.id) // Edges from this stage node
      .map(edge => nodes.find(n => n.id === edge.target)) // Get target nodes
      .filter(n => n && n.type === 'tool'); // Only tool nodes

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center bg-primary">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold">{stage.name}</h3>
          <p className="text-xs text-muted-foreground">{stage.description}</p>
        </div>
        
        {stage.characteristics && (
          <div>
            <h4 className="font-medium text-sm mb-3">Stage Information</h4>
            <div className="grid gap-3">
              {stage.characteristics.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Duration:</span>
                  <span className="text-xs font-medium">{stage.characteristics.duration}</span>
                </div>
              )}
              {stage.characteristics.participants && (
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Participants:</span>
                  <span className="text-xs font-medium">{stage.characteristics.participants}</span>
                </div>
              )}
              {stage.characteristics.deliverables && (
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Deliverables:</span>
                  <span className="text-xs font-medium">{stage.characteristics.deliverables}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-sm mb-3">Connected UX Tools ({connectedToolNodes.length})</h4>
          {connectedToolNodes.length > 0 ? (
            <div className="space-y-2">
              {connectedToolNodes.map((toolNode) => (
                <div key={toolNode.id} className="flex items-center gap-2 p-2 border rounded-md">
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{String(toolNode.data?.tool?.name || toolNode.data?.name || 'Unknown Tool')}</p>
                    <p className="text-xs text-muted-foreground">{String(toolNode.data?.tool?.description || toolNode.data?.description || 'No description')}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{String(toolNode.data?.tool?.category || toolNode.data?.category || 'Uncategorized')}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No UX tools connected to this stage yet</p>
              <p className="text-xs mt-1">
                Connect tool nodes to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderToolDetails = (data: any) => {
    // Tool data can be nested under data.tool (for connected nodes) or directly in data (for direct tool nodes)
    const tool = data.tool || data;
    
    // Count generated prompts for this specific tool
    const toolPrompts = prompts.filter(prompt => 
      prompt.context?.tool?.id === tool.id || prompt.context?.tool?.id === data.id
    );

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center bg-secondary">
            <Wrench className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="font-semibold">{tool.name}</h3>
          <p className="text-xs text-muted-foreground">{tool.description}</p>
        </div>
        
        {tool.category && (
          <div>
            <h4 className="font-medium text-sm mb-2">Category</h4>
            <Badge variant="outline" className="text-xs">{tool.category}</Badge>
          </div>
        )}
        
        {tool.characteristics && (
          <div>
            <h4 className="font-medium text-sm mb-3">Tool Characteristics</h4>
            <div className="grid gap-3">
              {Object.entries(tool.characteristics).map(([key, value]) => {
                if (key === 'resources' && Array.isArray(value)) {
                  return (
                    <div key={key}>
                      <span className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(value as string[]).map((resource, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-xs font-medium">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-sm mb-3">Generated Prompts</h4>
          {toolPrompts.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{toolPrompts.length} prompts generated</span>
              </div>
              <div className="space-y-1">
                {toolPrompts.slice(0, 3).map((prompt, index) => (
                  <div key={index} className="p-2 border rounded-md bg-muted/50">
                    <p className="text-xs font-medium mb-1">
                      Prompt {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(prompt.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {toolPrompts.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    +{toolPrompts.length - 3} more prompts
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No prompts generated yet</p>
              <p className="text-xs mt-1">
                Click on this tool to generate prompts
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromptDetails = (data: any) => {
    // Prompt data can be nested under data.prompt (for connected nodes) or directly in data
    const prompt = data.prompt || data;
    
    return (
      <div className="space-y-4">
        {prompt.content && (
        <div>
          <h4 className="font-medium text-sm mb-2">Prompt Content</h4>
          <div className="p-3 bg-muted/50 rounded-md border">
            <p className="text-xs font-mono whitespace-pre-wrap">
              {prompt.content.length > 200 
                ? `${prompt.content.substring(0, 200)}...` 
                : prompt.content}
            </p>
          </div>
        </div>
        )}
        
        {prompt.variables && Object.keys(prompt.variables).length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Variables</h4>
            <div className="space-y-2">
              {Object.entries(prompt.variables).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProjectDetails = (data: any) => {
    // Project data can be nested under data.project (for connected nodes) or directly in data
    const project = data.project || data;
    
    return (
      <div className="space-y-4">
        {project.name && (
          <div>
            <h4 className="font-medium text-sm mb-2">Project Name</h4>
            <p className="text-sm">{project.name}</p>
          </div>
        )}
        
        {project.description && (
          <div>
            <h4 className="font-medium text-sm mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        )}
      </div>
    );
  };

  const renderNodeTypeDetails = () => {
    const { data } = node;
    
    switch (node.type) {
      case 'framework':
        return renderFrameworkDetails(data);
      case 'stage':
        return renderStageDetails(data);
      case 'tool':
        return renderToolDetails(data);
      case 'prompt':
        return renderPromptDetails(data);
      case 'project':
        return renderProjectDetails(data);
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific details available for this node type.
          </div>
        );
    }
  };

  const connectionPath = getConnectionPath();
  const linkedKnowledge = getLinkedKnowledge();
  const nodePrompts = getNodePrompts();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {getNodeIcon(node.type)}
        <div>
          <h3 className="font-semibold text-sm capitalize">
            {node.data?.tool?.name || node.data?.stage?.name || node.data?.framework?.name || node.data?.name || `${node.type} Node`}
          </h3>
        </div>
      </div>

      {/* Connection Path */}
      {connectionPath.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Connection Path
            </h4>
            <div className="p-3 border border-border bg-muted/50 rounded-md">
              <div className="flex items-center flex-wrap gap-2">
                {connectionPath.map((connectedNode, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge 
                      variant={connectedNode.type === 'framework' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {connectedNode.data?.name}
                    </Badge>
                    {index < connectionPath.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Linked Knowledge Base */}
      {linkedKnowledge.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Linked Knowledge ({linkedKnowledge.length})
          </h4>
          <div className="space-y-2">
            {linkedKnowledge.map((entry) => (
              <div key={entry.id} className="p-2 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  {entry.type === 'document' ? (
                    <FileText className="w-3 h-3 text-muted-foreground" />
                  ) : entry.type === 'image' ? (
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <FileText className="w-3 h-3 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.type} • {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Prompts */}
      {nodePrompts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Generated Prompts ({nodePrompts.length})
          </h4>
          <div className="space-y-2">
            {nodePrompts.slice(0, 3).map((prompt, index) => (
              <div key={prompt.id || index} className="p-2 border rounded-md bg-primary/5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <p className="text-xs font-medium">
                    Prompt {index + 1}
                    {prompt.output && <Badge variant="default" className="ml-2 text-xs bg-success">Generated</Badge>}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(prompt.timestamp).toLocaleString()}
                </p>
                {prompt.context && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {prompt.context.framework?.name} → {prompt.context.stage?.name} → {prompt.context.tool?.name}
                  </p>
                )}
              </div>
            ))}
            {nodePrompts.length > 3 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{nodePrompts.length - 3} more prompts
              </p>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Node Type Specific Details */}
      {renderNodeTypeDetails()}

    </div>
  );
}