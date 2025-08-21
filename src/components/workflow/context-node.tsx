import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Image, Eye, Link } from 'lucide-react';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { NodeActionsMenu } from './node-actions-menu';

interface ContextNodeData {
  knowledgeEntries: string[];
  toolName: string;
  title: string;
  isActive?: boolean;
}

interface ContextNodeProps {
  data: ContextNodeData;
  selected?: boolean;
}

export const ContextNode = memo(({ data, selected, id }: ContextNodeProps & { id?: string }) => {
  const { entries } = useKnowledgeStore();
  const { knowledgeEntries, toolName, title, isActive } = data;

  // Get the actual knowledge entries from the store
  const linkedEntries = entries.filter(entry => knowledgeEntries.includes(entry.id));

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-3 h-3" />;
      case 'document':
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const handleViewEntry = (entry: any) => {
    // TODO: Open knowledge entry in a modal or panel
    console.log('View knowledge entry:', entry.id);
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <Card className={`
        w-80 p-4 transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        border-2 border-dashed
      `}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Knowledge context for {toolName}
              </p>
            </div>
          </div>

          {/* Knowledge Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {linkedEntries.length} {linkedEntries.length === 1 ? 'entry' : 'entries'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Context
            </Badge>
          </div>

          {/* Knowledge Entries List */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Linked Knowledge:</h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {linkedEntries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs hover:bg-muted/50 transition-colors"
                  >
                    {getFileIcon(entry.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.title}</p>
                      <div className="text-muted-foreground max-h-4 overflow-hidden">
                        <p className="text-xs truncate">
                          {entry.content.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewEntry(entry)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
            >
              <Link className="w-3 h-3 mr-1" />
              Manage Links
            </Button>
            
            <NodeActionsMenu
              nodeId={id || ''}
              nodeType="context"
              nodeData={data}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </motion.div>
  );
});