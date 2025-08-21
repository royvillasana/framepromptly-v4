import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/stores/project-store';
import { useToast } from '@/components/ui/use-toast';

interface NodeContextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeTitle: string;
}

export const NodeContextDialog: React.FC<NodeContextDialogProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeTitle
}) => {
  const { toast } = useToast();
  const { currentProject, updateProject } = useProjectStore();
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentProject && nodeId) {
      // Load existing context for this node
      const nodeContexts = currentProject.node_contexts || {};
      setContext(nodeContexts[nodeId] || '');
    }
  }, [isOpen, currentProject, nodeId]);

  const handleSave = async () => {
    if (!currentProject) return;

    setIsLoading(true);
    try {
      const nodeContexts = currentProject.node_contexts || {};
      const updatedContexts = {
        ...nodeContexts,
        [nodeId]: context.trim()
      };

      // If context is empty, remove the entry
      if (!context.trim()) {
        delete updatedContexts[nodeId];
      }

      await updateProject(currentProject.id, {
        node_contexts: updatedContexts
      });

      toast({
        title: "Success",
        description: "Node context saved successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error saving node context:', error);
      toast({
        title: "Error",
        description: "Failed to save node context",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Node Context: {nodeTitle}</DialogTitle>
          <DialogDescription>
            Add specific context and information for this workflow node to improve AI prompt generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="node-context">Context</Label>
            <Textarea
              id="node-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add specific context for this node that will be included when generating prompts..."
              rows={8}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This context will be automatically included when generating AI prompts for this specific node.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Context'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};