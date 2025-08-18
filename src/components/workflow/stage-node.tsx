import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Settings, MoreVertical } from 'lucide-react';
import { UXStage } from '@/stores/workflow-store';

interface StageNodeData {
  stage: UXStage;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface StageNodeProps {
  data: StageNodeData;
  selected?: boolean;
}

export const StageNode = memo(({ data, selected }: StageNodeProps) => {
  const { stage, isActive, isCompleted } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <Card className={`
        w-64 p-4 border transition-all duration-300 shadow-lg hover:shadow-xl
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isActive ? 'border-primary bg-primary-light' : 'border-border'}
        ${isCompleted ? 'border-success bg-success/5' : ''}
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`
              w-3 h-3 rounded-full
              ${isCompleted ? 'bg-success' : isActive ? 'bg-primary' : 'bg-muted'}
            `} />
            <h3 className="font-semibold text-sm">{stage.name}</h3>
          </div>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {stage.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tools</span>
            <Badge variant="secondary" className="text-xs">
              {stage.tools.length}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {stage.tools.slice(0, 3).map((tool) => (
              <Badge key={tool.id} variant="outline" className="text-xs">
                {tool.name}
              </Badge>
            ))}
            {stage.tools.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{stage.tools.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" className="flex-1 text-xs h-7">
            <Play className="w-3 h-3 mr-1" />
            Run Stage
          </Button>
          <Button variant="outline" size="sm" className="w-7 h-7 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </motion.div>
  );
});

StageNode.displayName = 'StageNode';