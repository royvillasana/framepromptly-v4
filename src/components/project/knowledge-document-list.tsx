import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useKnowledgeStore, KnowledgeEntry } from '@/stores/knowledge-store';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Trash2, Edit3, Calendar, Clock, 
  Search, Filter, SortAsc, Eye, MoreVertical,
  BookOpen, Database, Sparkles, AlertCircle
} from 'lucide-react';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'document' | 'image';
  created_at: string;
  updated_at: string;
  wordCount: number;
  lastModified: string;
}

interface KnowledgeDocumentListProps {
  projectId: string;
  entries: KnowledgeEntry[];
  onSelectDocument: (document: KnowledgeDocument) => void;
  onCreateNew: () => void;
}

export const KnowledgeDocumentList: React.FC<KnowledgeDocumentListProps> = ({
  projectId,
  entries,
  onSelectDocument,
  onCreateNew
}) => {
  const { toast } = useToast();
  const { deleteEntry } = useKnowledgeStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'updated' | 'created' | 'size'>('updated');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'document' | 'image'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');

  // Convert entries to documents with additional metadata
  const documents: KnowledgeDocument[] = entries.map(entry => ({
    id: entry.id,
    title: entry.title,
    content: entry.content,
    type: entry.type,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
    wordCount: entry.content?.split(/\s+/).filter(word => word.length > 0).length || 0,
    lastModified: new Date(entry.updated_at).toLocaleDateString()
  }));

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'size':
          return b.wordCount - a.wordCount;
        default:
          return 0;
      }
    });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'image':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'image':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the new document",
        variant: "destructive"
      });
      return;
    }

    // Create a new document with the title
    const newDocument: KnowledgeDocument = {
      id: `new-${Date.now()}`,
      title: newDocumentTitle.trim(),
      content: '',
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      wordCount: 0,
      lastModified: new Date().toLocaleDateString()
    };

    onSelectDocument(newDocument);
    setShowCreateDialog(false);
    setNewDocumentTitle('');
  };

  const handleDeleteDocument = async (documentId: string, documentTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${documentTitle}"?`)) {
      return;
    }

    try {
      await deleteEntry(documentId);
      toast({
        title: "Document Deleted",
        description: `"${documentTitle}" has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Knowledge Base Documents
            </h3>
            <p className="text-gray-600 mt-1">
              Manage your project knowledge documents and content
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Create New Document
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Document Title
                  </label>
                  <Input
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateDocument()}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateDocument} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Document
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateDialog(false);
                    setNewDocumentTitle('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'title' ? 'updated' : 'title')}
              className="flex items-center gap-2"
            >
              <SortAsc className="w-4 h-4" />
              {sortBy === 'title' ? 'A-Z' : 'Recent'}
            </Button>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="text">Text Only</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <BookOpen className="w-3 h-3 mr-1" />
            {filteredDocuments.length} Documents
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <FileText className="w-3 h-3 mr-1" />
            {filteredDocuments.reduce((sum, doc) => sum + doc.wordCount, 0)} Words
          </Badge>
        </div>
      </div>

      {/* Document Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {documents.length === 0 ? 'No Documents Yet' : 'No Matching Documents'}
            </h3>
            <p className="text-gray-500 mb-4">
              {documents.length === 0 
                ? 'Create your first knowledge base document to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {documents.length === 0 && (
              <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredDocuments.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200">
                    {/* Left side - Document info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0">
                        {getDocumentIcon(document.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{document.title}</h4>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(document.type)}`}>
                            {document.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {document.content || 'No content yet...'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Modified {document.lastModified}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.ceil(document.wordCount / 200)} min read</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{document.wordCount} words</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => onSelectDocument(document)}
                        className="px-4 bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Open Document
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(document.id, document.title);
                        }}
                        className="w-10 h-10 p-0 hover:bg-red-100 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};