import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Upload, FileText, Image, Trash2, Edit3, MousePointer2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const KnowledgeBasePanel = () => {
  const { toast } = useToast();
  const { currentProject } = useProjectStore();
  const { addKnowledgeDocumentNode } = useWorkflowStore();
  const { 
    entries, 
    isLoading, 
    error, 
    fetchEntries, 
    addTextEntry, 
    uploadFile, 
    deleteEntry,
    updateEntry,
    clearError 
  } = useKnowledgeStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  
  // Clean up content for display (remove special characters, formatting, etc.)
  const cleanContent = (content: string): string => {
    if (!content) return '';
    return content
      .replace(/[%&<>{}\\\/\[\]@#$^*+=|~`]/g, ' ') // Remove PDF/formatting characters
      .replace(/[^\w\s.,!?()-]/g, ' ') // Remove other special characters except basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s*[\d\s]*obj\s*/gi, '') // Remove PDF object references
      .replace(/endstream|endobj|stream/gi, '') // Remove PDF keywords
      .trim();
  };
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentProject?.id) {
      fetchEntries(currentProject.id);
    }
  }, [currentProject?.id, fetchEntries]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleAddTextEntry = async () => {
    if (!currentProject || !textTitle.trim() || !textContent.trim()) return;
    
    try {
      await addTextEntry(currentProject.id, textTitle.trim(), textContent.trim());
      setTextTitle('');
      setTextContent('');
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Text entry added to knowledge base"
      });
    } catch (error) {
      console.error('Error adding text entry:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!currentProject || !selectedFile) return;

    try {
      await uploadFile(currentProject.id, selectedFile, uploadTitle.trim() || undefined);
      setSelectedFile(null);
      setUploadTitle('');
      setShowUploadDialog(false);
      toast({
        title: "Success",
        description: "File uploaded and processed successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      toast({
        title: "Success",
        description: "Entry deleted from knowledge base"
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = async (id: string, title: string, content: string) => {
    try {
      await updateEntry(id, { title, content });
      setEditingEntry(null);
      toast({
        title: "Success",
        description: "Entry updated successfully"
      });
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleAddToCanvas = (entry: any) => {
    try {
      addKnowledgeDocumentNode(entry);
      toast({
        title: "Success",
        description: `${entry.title} added to workflow canvas`
      });
    } catch (error) {
      console.error('Error adding knowledge to canvas:', error);
      toast({
        title: "Error",
        description: "Failed to add knowledge document to canvas",
        variant: "destructive"
      });
    }
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

  if (!currentProject) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Select a project to manage its knowledge base
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Card className="p-6 flex-1 flex flex-col overflow-hidden">
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Project Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">
            Add context, documents, and images to enhance your project
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Text Entry</DialogTitle>
                <DialogDescription>
                  Create a new text entry to add context and information to your knowledge base.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter content"
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={handleAddTextEntry}
                  disabled={!textTitle.trim() || !textContent.trim() || isLoading}
                  className="w-full"
                >
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a document or image file to automatically process and add to your knowledge base.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="upload-title">Title (optional)</Label>
                  <Input
                    id="upload-title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Custom title (uses filename if empty)"
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
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
        {isLoading && entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading knowledge base...</p>
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No entries yet. Add some context to get started.
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <Card key={entry.id} className="p-4">
            {editingEntry === entry.id ? (
              <EditEntryForm 
                entry={entry}
                onSave={(title, content) => handleEditEntry(entry.id, title, content)}
                onCancel={() => setEditingEntry(null)}
              />
            ) : (
              <div className="space-y-3">
                {/* Content Section */}
                <div className="flex items-start gap-3">
                  {getFileIcon(entry.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{entry.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1 max-h-12 overflow-hidden">
                      <p className="break-words line-clamp-2">
                        {(() => {
                          const cleaned = cleanContent(entry.content || '');
                          return cleaned.length > 80 
                            ? `${cleaned.substring(0, 80).trim()}...`
                            : cleaned;
                        })()}
                      </p>
                    </div>
                    {entry.file_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        File: {entry.file_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons Section */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAddToCanvas(entry)}
                    className="text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <MousePointer2 className="h-3 w-3 mr-1" />
                    Add to Canvas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingEntry(entry.id)}
                    className="text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
    </div>
  );
};

interface EditEntryFormProps {
  entry: any;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

const EditEntryForm: React.FC<EditEntryFormProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);

  return (
    <div className="space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={4}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(title, content)}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};