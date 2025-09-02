import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Edit3, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Save,
  X,
  BookOpen,
  Link2
} from 'lucide-react';
import { KnowledgeEntry, useKnowledgeStore } from '@/stores/knowledge-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';
import { ResizableNode } from './resizable-node';

export type KnowledgeNodeSize = 'mini' | 'preview' | 'expanded';

export interface KnowledgeDocumentNodeData {
  knowledgeEntry: KnowledgeEntry;
  size: KnowledgeNodeSize;
  isExpanded?: boolean;
  connectedTools: string[];
  previewMode?: 'summary' | 'full' | 'mini';
  isEditing?: boolean;
}

interface KnowledgeDocumentNodeProps extends NodeProps {
  data: KnowledgeDocumentNodeData;
}

export const KnowledgeDocumentNode = memo(({ data, selected, id }: KnowledgeDocumentNodeProps) => {
  const { knowledgeEntry, size = 'preview', connectedTools = [], isEditing: initialIsEditing = false } = data;
  const { updateEntry } = useKnowledgeStore();
  const { updateNode, edges } = useWorkflowStore();
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [editTitle, setEditTitle] = useState(knowledgeEntry.title);
  const [editContent, setEditContent] = useState(knowledgeEntry.content);
  const [isSaving, setIsSaving] = useState(false);

  // Count actual connections from this node
  const actualConnections = edges.filter(edge => edge.source === id).length;
  
  const handleToggleSize = useCallback(() => {
    const nextSize: KnowledgeNodeSize = 
      size === 'mini' ? 'preview' : 
      size === 'preview' ? 'expanded' : 'mini';
    
    if (id) {
      updateNode(id, { 
        data: { ...data, size: nextSize }
      });
    }
  }, [size, data, id, updateNode]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    if (id) {
      updateNode(id, { 
        data: { ...data, isEditing: true }
      });
    }
  }, [data, id, updateNode]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditTitle(knowledgeEntry.title);
    setEditContent(knowledgeEntry.content);
    if (id) {
      updateNode(id, { 
        data: { ...data, isEditing: false }
      });
    }
  }, [data, id, updateNode, knowledgeEntry]);

  const handleSave = useCallback(async () => {
    if (!editTitle.trim()) {
      toast.error('Document title cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateEntry(knowledgeEntry.id, {
        title: editTitle.trim(),
        content: editContent.trim()
      });

      // Update the node data with new values
      const updatedEntry = {
        ...knowledgeEntry,
        title: editTitle.trim(),
        content: editContent.trim()
      };

      if (id) {
        updateNode(id, { 
          data: { 
            ...data, 
            knowledgeEntry: updatedEntry,
            isEditing: false 
          }
        });
      }

      setIsEditing(false);
      toast.success('Knowledge document updated');
    } catch (error) {
      toast.error('Failed to save document');
      console.error('Error saving knowledge document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editTitle, editContent, knowledgeEntry, updateEntry, data, id, updateNode]);

  const getSizeClasses = () => {
    switch (size) {
      case 'mini':
        return 'w-32 min-h-[60px]';
      case 'preview':
        return 'w-64 min-h-[120px]';
      case 'expanded':
        return 'w-80 min-h-[200px]';
      default:
        return 'w-64 min-h-[120px]';
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getContentPreview = () => {
    switch (size) {
      case 'mini':
        return null;
      case 'preview':
        return truncateContent(knowledgeEntry.content, 100);
      case 'expanded':
        return knowledgeEntry.content;
      default:
        return truncateContent(knowledgeEntry.content, 100);
    }
  };

  const getSizeIcon = () => {
    switch (size) {
      case 'mini':
        return <Maximize2 className="w-3 h-3" />;
      case 'preview':
        return <Maximize2 className="w-3 h-3" />;
      case 'expanded':
        return <Minimize2 className="w-3 h-3" />;
      default:
        return <Maximize2 className="w-3 h-3" />;
    }
  };

  return (
    <ResizableNode selected={selected}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`
          ${getSizeClasses()} 
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          bg-gradient-to-br from-amber-50 to-orange-50 
          border-amber-200 
          hover:shadow-lg 
          transition-all duration-200
          relative
        `}>
          {/* Source Handle - Right side for connecting to tools */}
          <Handle
            type="source"
            position={Position.Right}
            style={{ 
              background: '#f59e0b',
              border: '2px solid #d97706',
              width: 12,
              height: 12
            }}
            className="!border-2 !border-amber-600"
          />

          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="p-1 rounded bg-amber-100">
                  <FileText className="w-4 h-4 text-amber-700" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-6 text-sm font-semibold bg-white/80 border-amber-300"
                      placeholder="Document title..."
                    />
                  ) : (
                    <CardTitle className="text-sm font-semibold text-amber-900 truncate">
                      {knowledgeEntry.title}
                    </CardTitle>
                  )}
                  
                  {size !== 'mini' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                        {knowledgeEntry.type}
                      </Badge>
                      {actualConnections > 0 && (
                        <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                          <Link2 className="w-3 h-3 mr-1" />
                          {actualConnections}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!isEditing && size !== 'mini' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    className="h-6 w-6 p-0 hover:bg-amber-100"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleSize}
                  className="h-6 w-6 p-0 hover:bg-amber-100"
                >
                  {getSizeIcon()}
                </Button>
              </div>
            </div>
          </CardHeader>

          {size !== 'mini' && (
            <CardContent className="px-3 pb-3 pt-0">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] text-sm bg-white/80 border-amber-300 resize-none"
                      placeholder="Document content..."
                    />
                    
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-7 px-2 text-xs hover:bg-amber-100"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-7 px-2 text-xs bg-amber-600 hover:bg-amber-700"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {getContentPreview() && (
                      <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">
                        {getContentPreview()}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          )}

          {/* Visual indicator for connections */}
          {actualConnections > 0 && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm" />
            </div>
          )}
        </Card>
      </motion.div>
    </ResizableNode>
  );
});