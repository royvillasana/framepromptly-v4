import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, X, FileText, Image as ImageIcon, Calendar } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';

interface KnowledgeTabPanelProps {
  onClose?: () => void;
}

export function KnowledgeTabPanel({ onClose }: KnowledgeTabPanelProps) {
  const navigate = useNavigate();
  const { currentProject } = useProjectStore();
  const { entries, fetchEntries, isLoading } = useKnowledgeStore();

  useEffect(() => {
    if (currentProject?.id) {
      fetchEntries(currentProject.id);
    }
  }, [currentProject?.id, fetchEntries]);

  const handleCreateKnowledgeBase = () => {
    if (!currentProject) return;
    navigate(`/knowledge/${currentProject.id}`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Knowledge Base
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {entries.length}
            </Badge>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={handleCreateKnowledgeBase}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Database className="w-4 h-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading && entries.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Set up a knowledge base for your project to store documents,
                context, and information that can be used throughout your workflow.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={handleCreateKnowledgeBase}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getFileIcon(entry.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {entry.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
