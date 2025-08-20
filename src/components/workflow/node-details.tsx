import { Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Layers, Wrench, FileText, FolderOpen, Clock, Users, Target, Lightbulb, Plus } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';

interface NodeDetailsProps {
  node: Node;
}

export function NodeDetails({ node }: NodeDetailsProps) {
  const { nodes, addNode } = useWorkflowStore();
  const { prompts } = usePromptStore();
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
    const framework = data;
    
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
            {Object.entries(framework.characteristics).map(([key, value]) => (
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
            {framework.stages.map((stage: any) => (
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
    const stage = data;
    
    // Find tool nodes in canvas that belong to this stage
    const stageToolNodes = nodes.filter(n => 
      n.type === 'tool' && 
      stage.tools && 
      stage.tools.some((tool: any) => tool.id === n.data?.id)
    );

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
          <h4 className="font-medium text-sm mb-3">UX Tools in Canvas ({stageToolNodes.length})</h4>
          {stageToolNodes.length > 0 ? (
            <div className="space-y-2">
              {stageToolNodes.map((toolNode) => (
                <div key={toolNode.id} className="flex items-center gap-2 p-2 border rounded-md">
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{String(toolNode.data?.name || 'Unknown Tool')}</p>
                    <p className="text-xs text-muted-foreground">{String(toolNode.data?.description || 'No description')}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{String(toolNode.data?.category || 'Uncategorized')}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No UX tools from this stage in canvas yet</p>
              {stage.tools && (
                <p className="text-xs mt-1">
                  {stage.tools.length} tools available in this stage
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderToolDetails = (data: any) => {
    const tool = data;
    
    // Count generated prompts for this specific tool
    const toolPrompts = prompts.filter(prompt => 
      prompt.context?.tool?.id === tool.id
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

  const renderPromptDetails = (data: any) => (
    <div className="space-y-4">
      {data.content && (
        <div>
          <h4 className="font-medium text-sm mb-2">Prompt Content</h4>
          <div className="p-3 bg-muted/50 rounded-md border">
            <p className="text-xs font-mono whitespace-pre-wrap">
              {data.content.length > 200 
                ? `${data.content.substring(0, 200)}...` 
                : data.content}
            </p>
          </div>
        </div>
      )}
      
      {data.variables && Object.keys(data.variables).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Variables</h4>
          <div className="space-y-2">
            {Object.entries(data.variables).map(([key, value]) => (
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

  const renderProjectDetails = (data: any) => (
    <div className="space-y-4">
      {data.name && (
        <div>
          <h4 className="font-medium text-sm mb-2">Project Name</h4>
          <p className="text-sm">{data.name}</p>
        </div>
      )}
      
      {data.description && (
        <div>
          <h4 className="font-medium text-sm mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
      )}
    </div>
  );

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {getNodeIcon(node.type)}
        <div>
          <h3 className="font-semibold text-sm capitalize">
            {node.data?.name ? String(node.data.name) : `${node.type} Node`}
          </h3>
          <p className="text-xs text-muted-foreground">ID: {node.id}</p>
        </div>
      </div>

      <Separator />

      {/* Node Type Specific Details */}
      {renderNodeTypeDetails()}

      <Separator />

      {/* Technical Details */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Technical Info</h4>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="text-xs capitalize">{node.type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position:</span>
            <span>x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}</span>
          </div>
          {node.data?.color && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded border" 
                  style={{ backgroundColor: String(node.data.color) }} 
                />
                <span className="font-mono">{String(node.data.color)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}