import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, X, Plus } from 'lucide-react';
import { UXFramework, UXStage, UXTool, NodeCustomization } from '@/stores/workflow-store';

interface NodeCustomizationPanelProps {
  node: {
    id: string;
    type: 'framework' | 'stage' | 'tool';
    data: {
      framework?: UXFramework;
      stage?: UXStage;
      tool?: UXTool;
    };
  };
  customization?: NodeCustomization;
  onUpdate: (nodeId: string, customization: Partial<NodeCustomization>) => void;
  onClose: () => void;
}

export function NodeCustomizationPanel({ node, customization, onUpdate, onClose }: NodeCustomizationPanelProps) {
  const [properties, setProperties] = useState<Record<string, any>>(
    customization?.customProperties || {}
  );

  const handlePropertyChange = (key: string, value: any) => {
    const updated = { ...properties, [key]: value };
    setProperties(updated);
    onUpdate(node.id, {
      id: node.id,
      nodeType: node.type,
      customProperties: updated,
      connections: customization?.connections || { upstream: [], downstream: [] }
    });
  };

  const addCustomProperty = () => {
    const key = `custom_${Date.now()}`;
    handlePropertyChange(key, '');
  };

  const removeProperty = (key: string) => {
    const updated = { ...properties };
    delete updated[key];
    setProperties(updated);
    onUpdate(node.id, {
      id: node.id,
      nodeType: node.type,
      customProperties: updated,
      connections: customization?.connections || { upstream: [], downstream: [] }
    });
  };

  const getNodeTitle = () => {
    if (node.data.framework) return node.data.framework.name;
    if (node.data.stage) return node.data.stage.name;
    if (node.data.tool) return node.data.tool.name;
    return 'Node';
  };

  const getNodeCharacteristics = () => {
    if (node.data.framework) return node.data.framework.characteristics;
    if (node.data.stage) return node.data.stage.characteristics;
    if (node.data.tool) return node.data.tool.characteristics;
    return null;
  };

  const characteristics = getNodeCharacteristics();

  return (
    <Card className="w-80 p-4 border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Customize Node</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="w-6 h-6 p-0">
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Node Info */}
        <div>
          <Label className="text-xs font-medium">Node</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {node.type}
            </Badge>
            <span className="text-sm font-medium">{getNodeTitle()}</span>
          </div>
        </div>

        <Separator />

        {/* Default Characteristics */}
        {characteristics && (
          <div>
            <Label className="text-xs font-medium">Default Characteristics</Label>
            <div className="mt-2 space-y-2">
              {Object.entries(characteristics).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-medium">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Custom Properties */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Custom Properties</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addCustomProperty}
              className="h-6 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="mt-2 space-y-3">
            {Object.entries(properties).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeProperty(key)}
                    className="h-4 w-4 p-0 text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {typeof value === 'string' && value.length > 50 ? (
                  <Textarea
                    value={value}
                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                    className="text-xs"
                    rows={2}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                    className="text-xs h-7"
                    placeholder="Enter value..."
                  />
                )}
              </div>
            ))}
            
            {Object.keys(properties).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No custom properties yet. Click "Add" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Connection Info */}
        {customization?.connections && (
          <>
            <Separator />
            <div>
              <Label className="text-xs font-medium">Connections</Label>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Upstream: </span>
                  <span className="text-xs">{customization.connections.upstream.length} nodes</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Downstream: </span>
                  <span className="text-xs">{customization.connections.downstream.length} nodes</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}