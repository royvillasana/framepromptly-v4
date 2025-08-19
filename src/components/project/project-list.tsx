import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/stores/project-store';
import { useToast } from '@/hooks/use-toast';
import { ProjectDialog } from './project-dialog';
import { motion } from 'framer-motion';
import { FolderOpen, Trash2, Calendar, Layers, Plus, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ProjectList() {
  const { 
    projects, 
    currentProject, 
    isLoading, 
    error, 
    fetchProjects, 
    setCurrentProject, 
    deleteProject 
  } = useProjectStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenProject = (project: any) => {
    setCurrentProject(project);
    toast({
      title: "Project Opened",
      description: `Now working on "${project.name}"`
    });
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await deleteProject(projectId);
        toast({
          title: "Project Deleted",
          description: `"${projectName}" has been deleted`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-sm mb-4">{error}</p>
        <Button onClick={fetchProjects} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <p className="text-muted-foreground">
            Manage your UX workflow projects and canvases
          </p>
        </div>
        <ProjectDialog />
      </div>

      {/* Current Project */}
      {currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold">Current Project</h3>
          <Card className="p-4 border-primary bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold">{currentProject.name}</h4>
                {currentProject.description && (
                  <p className="text-sm text-muted-foreground">
                    {currentProject.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {currentProject.canvas_data?.nodes?.length || 0} nodes
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated {formatDistanceToNow(new Date(currentProject.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start building UX workflows
            </p>
            <ProjectDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </ProjectDialog>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                p-4 hover:shadow-md transition-all duration-200 cursor-pointer
                ${currentProject?.id === project.id ? 'ring-2 ring-primary' : ''}
              `}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold truncate">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {project.canvas_data?.nodes?.length || 0} nodes
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenProject(project)}
                      disabled={currentProject?.id === project.id}
                      className="flex-1"
                    >
                      <FolderOpen className="w-3 h-3 mr-1" />
                      {currentProject?.id === project.id ? 'Current' : 'Open'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}