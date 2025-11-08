import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/stores/project-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/stores/project-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useToast } from '@/hooks/use-toast';
import { ProjectDialog } from './project-dialog';
import { ProjectShareModal } from './project-share-modal';
import { PendingInvitations } from './pending-invitations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { FolderOpen, Trash2, Calendar, Plus, Loader2, Database, Settings, Share, MoreVertical, MessageSquare, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Helper function to get the primary framework from project canvas data
const getProjectFramework = (project: Project): string | null => {
  if (!project.canvas_data?.nodes) return null;
  
  const frameworkNode = project.canvas_data.nodes.find((node: any) => 
    node.type === 'framework' && node.data?.framework
  );
  
  return frameworkNode?.data?.framework?.name || null;
};

// Helper function to get prompts count for a project
const getPromptsCount = async (projectId: string): Promise<number> => {
  try {
    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching prompts count:', error);
    return 0;
  }
};

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
  const { prompts } = usePromptStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [promptsCounts, setPromptsCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  // Load prompts counts for all projects
  useEffect(() => {
    const loadPromptsCounts = async () => {
      if (projects.length === 0) return;
      
      const counts: Record<string, number> = {};
      await Promise.all(
        projects.map(async (project) => {
          counts[project.id] = await getPromptsCount(project.id);
        })
      );
      
      setPromptsCounts(counts);
    };

    loadPromptsCounts();
  }, [projects]);

  const handleOpenProject = async (project: Project) => {
    await setCurrentProject(project);
    navigate('/workflow');
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

  const handleOpenKnowledgeManager = (project: Project) => {
    navigate(`/knowledge/${project.id}`);
  };

  const handleShareProject = (project: Project) => {
    setSelectedProject(project);
    setShareModalOpen(true);
  };

  const handleProjectSettings = (project: Project) => {
    navigate(`/project/${project.id}/settings`);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedProject(null);
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

      {/* Pending Invitations */}
      <PendingInvitations />

      {/* Current Project */}
      {currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold">Current Project</h3>
          <Card 
            className="p-4 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleOpenProject(currentProject)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <h4 className="font-semibold">{currentProject.name}</h4>
                {currentProject.description && (
                  <p className="text-sm text-muted-foreground">
                    {currentProject.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {promptsCounts[currentProject.id] || 0} prompts
                  </div>
                  {getProjectFramework(currentProject) && (
                    <Badge variant="secondary" className="text-xs py-0 px-2">
                      <Target className="w-3 h-3 mr-1" />
                      {getProjectFramework(currentProject)}
                    </Badge>
                  )}
                  {currentProject.last_opened ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last opened {formatDistanceToNow(new Date(currentProject.last_opened), { addSuffix: true })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Updated {formatDistanceToNow(new Date(currentProject.updated_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProject(currentProject);
                  }}
                  className="h-8 px-3"
                >
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Open Project
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenKnowledgeManager(currentProject);
                      }}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Knowledge
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProject(currentProject);
                      }}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectSettings(currentProject);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(currentProject.id, currentProject.name);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge variant="default">Active</Badge>
              </div>
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
        <div className="space-y-2">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div 
                className={`
                  flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer
                  ${currentProject?.id === project.id ? 'ring-2 ring-primary bg-blue-50' : 'hover:bg-gray-50'}
                `}
                onClick={() => {
                  if (currentProject?.id !== project.id) {
                    handleOpenProject(project);
                  }
                }}
              >
                {/* Left side - Project info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                      {currentProject?.id === project.id && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {promptsCounts[project.id] || 0} prompts
                      </div>
                      {getProjectFramework(project) && (
                        <Badge variant="secondary" className="text-xs py-0 px-2">
                          <Target className="w-3 h-3 mr-1" />
                          {getProjectFramework(project)}
                        </Badge>
                      )}
                      {project.last_opened ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last opened {formatDistanceToNow(new Date(project.last_opened), { addSuffix: true })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side - Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(project);
                    }}
                    disabled={currentProject?.id === project.id}
                    className="px-4"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    {currentProject?.id === project.id ? 'Current' : 'Open'}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenKnowledgeManager(project);
                        }}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Knowledge
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProject(project);
                        }}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectSettings(project);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id, project.name);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {selectedProject && (
        <ProjectShareModal
          isOpen={shareModalOpen}
          onClose={handleCloseShareModal}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          isOwner={true}
        />
      )}
    </div>
  );
}