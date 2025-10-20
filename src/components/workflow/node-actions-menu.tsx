import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Copy, 
  Link, 
  Trash2, 
  Edit3,
  Database,
  Save,
  X
} from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useToast } from '@/components/ui/use-toast';
import { getSmartPosition } from '@/utils/node-positioning';

interface NodeActionsMenuProps {
  nodeId: string;
  nodeType: string;
  nodeData: any;
  position: { x: number; y: number };
}

export function NodeActionsMenu({ nodeId, nodeType, nodeData, position }: NodeActionsMenuProps) {
  const { toast } = useToast();
  const { nodes, addNode, setNodes } = useWorkflowStore();
  const { entries } = useKnowledgeStore();
  const { currentProject } = useProjectStore();
  
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [modifyData, setModifyData] = useState({
    name: getNodeName(nodeData, nodeType),
    description: getNodeDescription(nodeData, nodeType),
    customProperties: {}
  });

  function getNodeName(data: any, type: string): string {
    switch (type) {
      case 'framework': return data.framework?.name || 'Framework';
      case 'stage': return data.stage?.name || 'Stage';
      case 'tool': return data.tool?.name || 'Tool';
      case 'prompt': return data.prompt?.context?.tool?.name || 'Generated Prompt';
      case 'custom-prompt': return data.prompt?.title || 'Custom Prompt';
      default: return 'Node';
    }
  }

  function getNodeDescription(data: any, type: string): string {
    switch (type) {
      case 'framework': return data.framework?.description || '';
      case 'stage': return data.stage?.description || '';
      case 'tool': return data.tool?.description || '';
      case 'prompt': return 'AI-generated prompt for ' + (data.prompt?.context?.tool?.name || 'workflow');
      case 'custom-prompt': return data.prompt?.description || 'Custom prompt from library';
      default: return '';
    }
  }

  const handleDuplicate = () => {
    const newPosition = getSmartPosition(nodeType, nodes, { 
      sourceNodeId: nodeId,
      workflowType: 'duplicate' 
    });

    const duplicatedNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: {
        x: newPosition.x + 20, // Slight offset from smart position
        y: newPosition.y + 20
      },
      data: { 
        ...nodeData,
        // Add duplicate indicator
        isDuplicate: true,
        originalId: nodeId
      }
    };

    addNode(duplicatedNode);
    
    toast({
      title: "Node Duplicated",
      description: `${getNodeName(nodeData, nodeType)} has been duplicated`
    });
  };

  const handleDelete = () => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    
    toast({
      title: "Node Deleted",
      description: `${getNodeName(nodeData, nodeType)} has been removed from workflow`
    });
  };

  const handleModify = () => {
    // Update the node with modified data
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? {
            ...node,
            data: {
              ...node.data,
              customName: modifyData.name,
              customDescription: modifyData.description,
              customProperties: modifyData.customProperties,
              isModified: true
            }
          }
        : node
    ));

    setShowModifyDialog(false);
    
    toast({
      title: "Node Modified",
      description: "Node properties have been updated"
    });
  };

  const handleLinkToKnowledge = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    // Update node with knowledge base link
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? {
            ...node,
            data: {
              ...node.data,
              linkedKnowledge: entry,
              hasKnowledgeLink: true
            }
          }
        : node
    ));

    setShowLinkDialog(false);
    
    toast({
      title: "Knowledge Linked",
      description: `Linked to: ${entry.title}`
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowModifyDialog(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Modify Node
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Node
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowLinkDialog(true)}>
            <Link className="w-4 h-4 mr-2" />
            Link to Knowledge
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modify Node Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}</DialogTitle>
            <DialogDescription>
              Update the properties and configuration of this workflow node.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="node-name">Name</Label>
              <Input
                id="node-name"
                value={modifyData.name}
                onChange={(e) => setModifyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter node name"
              />
            </div>
            
            <div>
              <Label htmlFor="node-description">Description</Label>
              <Textarea
                id="node-description"
                value={modifyData.description}
                onChange={(e) => setModifyData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter node description"
                rows={3}
              />
            </div>

            {nodeData?.hasKnowledgeLink && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Linked Knowledge</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {nodeData.linkedKnowledge?.title}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleModify}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link to Knowledge Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Knowledge Base</DialogTitle>
            <DialogDescription>
              Connect this node to knowledge entries to provide context for AI prompt generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a knowledge base entry to link with this node. This will provide additional context for AI prompt generation.
            </p>
            
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No knowledge base entries found. Add some content to your project's knowledge base first.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleLinkToKnowledge(entry.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{entry.title}</h4>
                        <div className="text-xs text-muted-foreground mt-1 max-h-8 overflow-hidden">
                          <p className="break-words" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {entry.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {entry.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}