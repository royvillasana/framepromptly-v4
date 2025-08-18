import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Layers, Settings, MoreVertical } from 'lucide-react';
import { UXFramework } from '@/stores/workflow-store';

interface FrameworkNodeData {
  framework: UXFramework;
  isSelected?: boolean;
}

interface FrameworkNodeProps {
  data: FrameworkNodeData;
  selected?: boolean;
}

export const FrameworkNode = memo(({ data, selected }: FrameworkNodeProps) => {
  const { framework, isSelected } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`
        w-80 p-6 border transition-all duration-300 shadow-lg hover:shadow-xl
        ${selected || isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        bg-gradient-to-br from-card to-primary-light/10
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: framework.color }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{framework.name}</h3>
              <p className="text-sm text-muted-foreground">
                {framework.stages.length} stages
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {framework.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stages</span>
            <Badge variant="secondary">
              {framework.stages.length}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {framework.stages.map((stage) => (
              <div 
                key={stage.id}
                className="p-2 bg-secondary/50 rounded-md text-xs"
              >
                <div className="font-medium">{stage.name}</div>
                <div className="text-muted-foreground">
                  {stage.tools.length} tools
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="flex-1 text-sm h-8">
            <Layers className="w-4 h-4 mr-2" />
            Use Framework
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-primary border-2 border-background"
      />
    </motion.div>
  );
});

FrameworkNode.displayName = 'FrameworkNode';