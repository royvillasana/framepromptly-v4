import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Upload, FileText, Image, Trash2, Edit3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const KnowledgeBasePanel = () => {
  const { toast } = useToast();
  const { currentProject } = useProjectStore();
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
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentProject) {
      fetchEntries(currentProject.id);
    }
  }, [currentProject, fetchEntries]);

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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Project Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">
            Add context, documents, and images to enhance your project
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Text Entry</DialogTitle>
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
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
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

      <div className="space-y-4">
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
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getFileIcon(entry.type)}
                <div className="flex-1 min-w-0">
                  {editingEntry === entry.id ? (
                    <EditEntryForm 
                      entry={entry}
                      onSave={(title, content) => handleEditEntry(entry.id, title, content)}
                      onCancel={() => setEditingEntry(null)}
                    />
                  ) : (
                    <>
                      <h4 className="font-medium truncate">{entry.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {entry.content}
                      </p>
                      {entry.file_name && (
                        <p className="text-xs text-muted-foreground mt-2">
                          File: {entry.file_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {editingEntry !== entry.id && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingEntry(entry.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
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