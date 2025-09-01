import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { KnowledgeDocumentList } from '@/components/project/knowledge-document-list';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, BookOpen, FolderOpen } from 'lucide-react';

export default function KnowledgeBase() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();
  const { entries, fetchEntries } = useKnowledgeStore();
  const [project, setProject] = useState(projects.find(p => p.id === projectId));

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
      }
    }
  }, [projects, projectId, fetchEntries]);

  const handleSelectDocument = (document: any) => {
    if (document.id.startsWith('new-')) {
      // For new documents, pass the title as a URL parameter
      navigate(`/knowledge/${projectId}/document/${document.id}?title=${encodeURIComponent(document.title)}`);
    } else {
      navigate(`/knowledge/${projectId}/document/${document.id}`);
    }
  };

  const handleCreateNew = () => {
    const newDocId = `new-${Date.now()}`;
    navigate(`/knowledge/${projectId}/document/${newDocId}?new=true`);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested project could not be found.
            </p>
            <Button onClick={handleBackToProjects}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                onClick={handleBackToProjects}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{project.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                <p className="text-gray-600 mt-1">
                  Manage documents and content for "{project.name}"
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{entries.length} Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>AI-Enhanced Editing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <KnowledgeDocumentList
              projectId={project.id}
              entries={entries}
              onSelectDocument={handleSelectDocument}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}