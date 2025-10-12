import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeStore, KnowledgeEntry } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { getSmartPosition } from '@/utils/node-positioning';
import { 
  FileText, 
  Image, 
  Plus, 
  Upload, 
  BookOpen, 
  Link,
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onKnowledgeSelected: (knowledgeIds: string[]) => void;
  toolName: string;
  toolId?: string;
}

export const KnowledgeSelectionDialog: React.FC<KnowledgeSelectionDialogProps> = ({
  isOpen,
  onClose,
  onKnowledgeSelected,
  toolName,
  toolId
}) => {
  const { currentProject } = useProjectStore();
  const { nodes, addNode, addEdge } = useWorkflowStore();
  const { 
    entries, 
    fetchEntries, 
    addTextEntry, 
    uploadFile, 
    isLoading 
  } = useKnowledgeStore();

  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'existing' | 'create' | 'upload'>('existing');
  
  // Create new text entry states
  const [newTextTitle, setNewTextTitle] = useState('');
  const [newTextContent, setNewTextContent] = useState('');
  
  // Upload file states
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Context node states
  const [createContextNode, setCreateContextNode] = useState(false);

  useEffect(() => {
    if (isOpen && currentProject?.id) {
      fetchEntries(currentProject.id);
    }
  }, [isOpen, currentProject?.id, fetchEntries]);

  const handleKnowledgeToggle = (knowledgeId: string) => {
    setSelectedKnowledge(prev => 
      prev.includes(knowledgeId) 
        ? prev.filter(id => id !== knowledgeId)
        : [...prev, knowledgeId]
    );
  };

  const handleCreateTextEntry = async () => {
    if (!currentProject || !newTextTitle.trim() || !newTextContent.trim()) return;
    
    try {
      await addTextEntry(currentProject.id, newTextTitle.trim(), newTextContent.trim());
      setNewTextTitle('');
      setNewTextContent('');
      toast.success('Text entry created successfully');
      
      // Refresh entries to get the new one
      await fetchEntries(currentProject.id);
    } catch (error) {
      toast.error('Failed to create text entry');
      console.error('Error creating text entry:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!currentProject || !selectedFile) return;

    try {
      await uploadFile(currentProject.id, selectedFile, uploadTitle.trim() || undefined);
      setSelectedFile(null);
      setUploadTitle('');
      toast.success('File uploaded and processed successfully');
      
      // Refresh entries to get the new one
      await fetchEntries(currentProject.id);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Error uploading file:', error);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedKnowledge.length === 0) {
      toast.error('Please select at least one knowledge file to provide context');
      return;
    }

    if (createContextNode && toolId) {
      // Create a context node with the selected knowledge
      const contextNodePosition = getSmartPosition('context', nodes, { 
        sourceNodeId: toolId,
        workflowType: 'tool-to-context' 
      });

      const contextNode = {
        id: `context-${Date.now()}`,
        type: 'context',
        position: contextNodePosition,
        data: {
          knowledgeEntries: selectedKnowledge,
          toolName: toolName,
          title: `${toolName} Context`,
          isActive: true
        }
      };

      addNode(contextNode);

      // Create edge from tool to context
      const edge = {
        id: `edge-${toolId}-${contextNode.id}`,
        source: toolId,
        target: contextNode.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))' }
      };
      addEdge(edge);
    }

    onKnowledgeSelected(selectedKnowledge);
    onClose();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const hasKnowledgeEntries = entries.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Knowledge for {toolName}
          </DialogTitle>
          <DialogDescription>
            Link one or more knowledge entries to provide rich context for AI prompt generation. Selected files will be included in the generated prompt.
          </DialogDescription>
        </DialogHeader>

        {!hasKnowledgeEntries ? (
          // No knowledge entries exist
          <div className="space-y-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Knowledge Base Found</h3>
              <p className="text-muted-foreground text-sm">
                This project doesn't have any knowledge entries yet. Create some context to improve prompt generation.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Text</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div>
                  <Label htmlFor="new-text-title">Title</Label>
                  <Input
                    id="new-text-title"
                    value={newTextTitle}
                    onChange={(e) => setNewTextTitle(e.target.value)}
                    placeholder={`Context for ${toolName}`}
                  />
                </div>
                <div>
                  <Label htmlFor="new-text-content">Content</Label>
                  <Textarea
                    id="new-text-content"
                    value={newTextContent}
                    onChange={(e) => setNewTextContent(e.target.value)}
                    placeholder="Add context, requirements, examples, or any relevant information..."
                    rows={6}
                  />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTextEntry();
                  }}
                  disabled={!newTextTitle.trim() || !newTextContent.trim() || isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Knowledge Entry
                </Button>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="upload-title">Title (optional)</Label>
                  <Input
                    id="upload-title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={`Context for ${toolName}`}
                  />
                </div>
                <div>
                  <Label htmlFor="file-upload">File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, DOCX, TXT, MD, JPG, PNG
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileUpload();
                  }}
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Knowledge entries exist
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="existing">Select Existing</TabsTrigger>
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Select one or more knowledge entries to provide context for {toolName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedKnowledge(
                        selectedKnowledge.length === entries.length 
                          ? [] 
                          : entries.map(entry => entry.id)
                      )}
                      className="h-6 px-2 text-xs"
                    >
                      {selectedKnowledge.length === entries.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Badge variant="outline">
                      {selectedKnowledge.length} selected
                    </Badge>
                  </div>
                </div>

                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <Card 
                        key={entry.id} 
                        className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
                          selectedKnowledge.includes(entry.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleKnowledgeToggle(entry.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(entry.type)}
                            <input
                              type="checkbox"
                              checked={selectedKnowledge.includes(entry.id)}
                              onChange={() => handleKnowledgeToggle(entry.id)}
                              className="h-4 w-4"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{entry.title}</h4>
                            <div className="text-xs text-muted-foreground mt-1 max-h-8 overflow-hidden">
                              <p className="break-words" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {entry.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {entry.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Option to create context node */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="create-context-node"
                      checked={createContextNode}
                      onChange={(e) => setCreateContextNode(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="create-context-node" className="text-sm">
                      Create a context node for this knowledge
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will create a visual node showing the knowledge linked to {toolName}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <div>
                  <Label htmlFor="new-text-title">Title</Label>
                  <Input
                    id="new-text-title"
                    value={newTextTitle}
                    onChange={(e) => setNewTextTitle(e.target.value)}
                    placeholder={`Context for ${toolName}`}
                  />
                </div>
                <div>
                  <Label htmlFor="new-text-content">Content</Label>
                  <Textarea
                    id="new-text-content"
                    value={newTextContent}
                    onChange={(e) => setNewTextContent(e.target.value)}
                    placeholder="Add context, requirements, examples, or any relevant information..."
                    rows={6}
                  />
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTextEntry();
                  }}
                  disabled={!newTextTitle.trim() || !newTextContent.trim() || isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Knowledge Entry
                </Button>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="upload-title">Title (optional)</Label>
                  <Input
                    id="upload-title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={`Context for ${toolName}`}
                  />
                </div>
                <div>
                  <Label htmlFor="file-upload">File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, DOCX, TXT, MD, JPG, PNG
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileUpload();
                  }}
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </TabsContent>
            </Tabs>

            {hasKnowledgeEntries && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmSelection();
                  }}
                  disabled={selectedKnowledge.length === 0}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link {selectedKnowledge.length} {selectedKnowledge.length === 1 ? 'File' : 'Files'}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};