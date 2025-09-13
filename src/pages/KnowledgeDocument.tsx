import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { KnowledgeDocumentEditor } from '@/components/project/knowledge-document-editor';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, FileText, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgeDocument() {
  const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, fetchProjects } = useProjectStore();
  const { entries, fetchEntries, addTextEntry } = useKnowledgeStore();
  const [project, setProject] = useState(projects.find(p => p.id === projectId));
  const [document, setDocument] = useState<any>(null);
  const [isNewDocument] = useState(searchParams.get('new') === 'true' || (documentId && documentId.startsWith('new-')));

  useEffect(() => {
    if (!projects.length) {
      fetchProjects();
    }
  }, [fetchProjects, projects.length]);

  useEffect(() => {
    if (projects.length && projectId) {
      const foundProject = projects.find(p => p.id === projectId);
      setProject(foundProject);
      
      if (foundProject) {
        fetchEntries(foundProject.id);
        
        // Load existing enhanced settings
        const existingSettings = getEnhancedSettings(foundProject.id);
        if (existingSettings) {
          setSelectedIndustry(existingSettings.industry);
          setProjectContext(existingSettings.projectContext);
          setQualitySettings(existingSettings.qualitySettings);
        }
      }
    }
  }, [projects, projectId, fetchEntries, getEnhancedSettings]);

  useEffect(() => {
    if (entries.length && documentId && !isNewDocument) {
      const foundDocument = entries.find(e => e.id === documentId);
      setDocument(foundDocument);
    } else if (isNewDocument) {
      // Create a new document structure
      const titleFromUrl = searchParams.get('title') || 'Untitled Document';
      setDocument({
        id: documentId,
        title: titleFromUrl,
        content: '',
        type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [entries, documentId, isNewDocument]);

  const handleBackToKnowledgeBase = () => {
    navigate(`/knowledge/${projectId}`);
  };

  const handleDocumentSaved = () => {
    // Optionally stay on page or navigate back
    toast({
      title: "Document Saved",
      description: "Your document has been saved successfully"
    });
  };


  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested project could not be found.
            </p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested document could not be found.
            </p>
            <Button onClick={handleBackToKnowledgeBase}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={handleBackToKnowledgeBase}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Knowledge Base
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{project.name}</span>
                <span className="text-sm text-gray-400">/</span>
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Knowledge Base</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
                <p className="text-gray-600 mt-1">
                  {isNewDocument ? 'Create new document' : 'Edit document'} with AI-enhanced editing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Editor */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg border shadow-sm">
              <KnowledgeDocumentEditor 
                projectId={project.id}
                entries={document ? [document] : []}
                selectedDocumentId={document?.id}
                onDocumentSaved={handleDocumentSaved}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
