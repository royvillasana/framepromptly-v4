import { Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Layers, Wrench, FileText, FolderOpen, Clock, Users, Target, Lightbulb } from 'lucide-react';

interface NodeDetailsProps {
  node: Node;
}

export function NodeDetails({ node }: NodeDetailsProps) {
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

  const renderFrameworkDetails = (data: any) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">Overview</h4>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </div>
      
      {data.characteristics && (
        <div>
          <h4 className="font-medium text-sm mb-3">Characteristics</h4>
          <div className="grid gap-3">
            {Object.entries(data.characteristics).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-xs font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.stages && (
        <div>
          <h4 className="font-medium text-sm mb-2">Stages ({data.stages.length})</h4>
          <div className="flex flex-wrap gap-1">
            {data.stages.slice(0, 5).map((stage: any, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {stage.name}
              </Badge>
            ))}
            {data.stages.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{data.stages.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStageDetails = (data: any) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">Overview</h4>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </div>
      
      {data.characteristics && (
        <div>
          <h4 className="font-medium text-sm mb-3">Stage Info</h4>
          <div className="grid gap-3">
            {data.characteristics.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Duration:</span>
                <span className="text-xs font-medium">{data.characteristics.duration}</span>
              </div>
            )}
            {data.characteristics.participants && (
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Participants:</span>
                <span className="text-xs font-medium">{data.characteristics.participants}</span>
              </div>
            )}
            {data.characteristics.deliverables && (
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Deliverables:</span>
                <span className="text-xs font-medium">{data.characteristics.deliverables}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {data.tools && (
        <div>
          <h4 className="font-medium text-sm mb-2">Available Tools ({data.tools.length})</h4>
          <div className="flex flex-wrap gap-1">
            {data.tools.slice(0, 4).map((tool: any, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tool.name}
              </Badge>
            ))}
            {data.tools.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{data.tools.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderToolDetails = (data: any) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2">Overview</h4>
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </div>
      
      {data.category && (
        <div>
          <h4 className="font-medium text-sm mb-2">Category</h4>
          <Badge variant="outline" className="text-xs">{data.category}</Badge>
        </div>
      )}
      
      {data.characteristics && (
        <div>
          <h4 className="font-medium text-sm mb-3">Tool Characteristics</h4>
          <div className="grid gap-3">
            {Object.entries(data.characteristics).map(([key, value]) => {
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
    </div>
  );

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