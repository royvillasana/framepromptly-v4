import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Settings, Sparkles } from 'lucide-react';
import { UXTool, useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';

interface ToolNodeData {
  tool: UXTool;
  framework?: any;
  stage?: any;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface ToolNodeProps {
  data: ToolNodeData;
  selected?: boolean;
  onSwitchToPromptTab?: () => void;
}

export const ToolNode = memo(({ data, selected, id, onSwitchToPromptTab }: ToolNodeProps & { id?: string; onSwitchToPromptTab?: () => void }) => {
  const { generatePrompt, setCurrentPrompt } = usePromptStore();
  const { addNode, addEdge, nodes } = useWorkflowStore();
  const { tool, framework, stage, isActive, isCompleted } = data;

  const handleGeneratePrompt = () => {
    if (framework && stage) {
      const prompt = generatePrompt(framework, stage, tool, undefined, undefined);
      
      // Create the generated prompt object
      const generatedPrompt = {
        id: `prompt-${Date.now()}`,
        workflowId: `workflow-${framework.id}-${stage.id}-${tool.id}`,
        content: prompt,
        context: { framework, stage, tool },
        variables: {},
        timestamp: Date.now()
      };
      
      // Set as current prompt
      setCurrentPrompt(generatedPrompt);
      
      // Get the current tool node position
      const toolNode = nodes.find(node => node.id === id);
      const baseX = toolNode ? toolNode.position.x + 350 : 1200;
      const baseY = toolNode ? toolNode.position.y : 200;
      
      // Create a new prompt node
      const promptNode = {
        id: `prompt-${Date.now()}`,
        type: 'prompt',
        position: { x: baseX, y: baseY },
        data: {
          prompt: generatedPrompt
        }
      };
      
      addNode(promptNode);
      
      // Create edge from tool to prompt
      if (id) {
        const edge = {
          id: `edge-${id}-${promptNode.id}`,
          source: id,
          target: promptNode.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))' }
        };
        addEdge(edge);
      }
      
      // Switch to prompt tab if callback is provided
      if (onSwitchToPromptTab) {
        onSwitchToPromptTab();
      }
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-muted-foreground hover:bg-primary transition-colors"
      />
      
      <Card className={`
        w-64 p-4 transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        ${isCompleted ? 'border-success bg-success/5' : ''}
      `}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{tool.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {tool.category}
            </Badge>
            
            <div className="flex items-center gap-1">
              {isCompleted && (
                <Badge variant="default" className="text-xs bg-success">
                  Done
                </Badge>
              )}
              {isActive && (
                <Badge variant="default" className="text-xs bg-primary">
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleGeneratePrompt}
              className="flex-1 h-8 text-xs"
              disabled={!framework || !stage}
            >
              <Play className="w-3 h-3 mr-1" />
              Generate Prompt
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