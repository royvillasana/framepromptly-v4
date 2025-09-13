import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  Database,
  Layers,
  Sparkles,
  BookOpen,
  Settings,
  Share,
  Copy,
  Download,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectStore } from '@/stores/project-store';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectSidebarProps {
  activePanel: 'canvas' | 'prompts' | 'knowledge';
  onPanelChange: (panel: 'canvas' | 'prompts' | 'knowledge') => void;
  children: React.ReactNode;
}

export function ProjectSidebar({ activePanel, onPanelChange, children }: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentProject, setCurrentProject } = useProjectStore();

  if (!currentProject) return null;

  const handleBackToProjects = () => {
    setCurrentProject(null);
  };

  const handleProjectAction = (action: string) => {
    switch (action) {
      case 'edit':
        toast.info('Edit project functionality coming soon');
        break;
      case 'duplicate':
        toast.info('Duplicate project functionality coming soon');
        break;
      case 'share':
        toast.info('Share project functionality coming soon');
        break;
      case 'export':
        toast.info('Export project functionality coming soon');
        break;
      case 'delete':
        toast.info('Delete project functionality coming soon');
        break;
      default:
        break;
    }
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 320 }}
        animate={{ width: 60 }}
        transition={{ duration: 0.3 }}
        className="border-r border-border bg-card flex-shrink-0 flex flex-col"
      >
        {/* Collapsed Header */}
        <div className="p-3 border-b border-border flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProjects}
            className="w-8 h-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Collapsed Tabs */}
        <div className="flex flex-col gap-1 p-2">
          <Button
            variant={activePanel === 'canvas' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPanelChange('canvas')}
            className="w-8 h-8 p-0"
          >
            <Layers className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'prompts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPanelChange('prompts')}
            className="w-8 h-8 p-0"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'knowledge' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPanelChange('knowledge')}
            className="w-8 h-8 p-0"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 60 }}
      animate={{ width: 320 }}
      transition={{ duration: 0.3 }}
      className="w-80 border-r border-border bg-card flex-shrink-0 flex flex-col"
    >
      {/* Header with collapse button */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProjects}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>

        {/* Project Title with Dropdown */}
        <div className="space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white text-sm font-medium">
                    {currentProject.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm truncate">{currentProject.name}</h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentProject.description || 'No description'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => handleProjectAction('edit')}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleProjectAction('duplicate')}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleProjectAction('share')}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleProjectAction('export')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleProjectAction('delete')} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(currentProject.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>Updated {formatDate(currentProject.updated_at)}</span>
          </div>
          {currentProject.description && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{currentProject.description}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs">
            <Database className="w-3 h-3 text-blue-500" />
            <span className="text-muted-foreground">Knowledge</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-muted-foreground">Prompts</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Layers className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Canvas</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activePanel} onValueChange={(value: any) => onPanelChange(value)}>
        <div className="border-b border-border p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="canvas" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="prompts" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Knowledge
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </Tabs>
    </motion.div>
  );
}