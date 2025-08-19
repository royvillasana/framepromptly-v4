import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FolderOpen, Settings, Layers, Calendar } from 'lucide-react';
import { Project } from '@/stores/project-store';
import { formatDistanceToNow } from 'date-fns';

interface ProjectNodeData {
  project: Project;
  isActive?: boolean;
}

interface ProjectNodeProps {
  data: ProjectNodeData;
  selected?: boolean;
}

export const ProjectNode = memo(({ data, selected }: ProjectNodeProps) => {
  const { project, isActive } = data;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`
        w-80 p-4 transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        border-2 border-dashed
      `}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">{project.name}</h3>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Project Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {project.canvas_data?.nodes?.length || 0} nodes
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              Project
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              Open Project
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-muted-foreground hover:bg-primary transition-colors"
      />
    </motion.div>
  );
});