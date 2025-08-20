import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Settings, Sparkles } from 'lucide-react';
import { UXTool, useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { supabase } from '@/integrations/supabase/client';
import { ProgressOverlay } from './progress-overlay';
import { getSmartPosition } from '@/utils/node-positioning';
import { NodeActionsMenu } from './node-actions-menu';

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
  const { currentProject } = useProjectStore();
  const { tool, framework, stage, isActive, isCompleted } = data;
  
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const handleGeneratePrompt = async () => {
    if (!framework || !stage || !currentProject) {
      console.error('Missing required data for prompt generation');
      return;
    }

    try {
      setShowProgress(true);
      setCurrentStep(0);

      // Step 1: Analyzing Context
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Gathering Knowledge
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 3: Generating Prompt
      setCurrentStep(3);
      const promptContent = await generatePrompt(currentProject.id, framework, stage, tool, undefined, undefined);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 4: Executing AI Request
      setCurrentStep(4);
      const { data, error } = await supabase.functions.invoke('generate-ai-prompt', {
        body: {
          promptContent,
          variables: {},
          projectId: currentProject.id,
          frameworkName: framework.name,
          stageName: stage.name,
          toolName: tool.name
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate AI response');
      }

      // Create the generated prompt object with AI response
      const generatedPrompt = {
        id: data.id,
        workflowId: `workflow-${framework.id}-${stage.id}-${tool.id}`,
        projectId: currentProject.id,
        content: data.prompt,
        context: { framework, stage, tool },
        variables: {},
        timestamp: Date.now(),
        output: data.aiResponse
      };
      
      // Set as current prompt
      setCurrentPrompt(generatedPrompt);
      
      // Get smart position for the new prompt node
      const toolNode = nodes.find(node => node.id === id);
      const newPosition = getSmartPosition('prompt', nodes, { 
        sourceNodeId: id,
        workflowType: 'tool-to-prompt' 
      });
      
      // Create a new prompt node with proper positioning
      const promptNode = {
        id: `prompt-${Date.now()}`,
        type: 'prompt',
        position: newPosition,
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
      
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      setShowProgress(false);
      setCurrentStep(0);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    setCurrentStep(0);
    
    // Switch to prompt tab if callback is provided
    if (onSwitchToPromptTab) {
      setTimeout(() => {
        onSwitchToPromptTab();
      }, 500);
    }
  };

  return (
    <>
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
              disabled={!framework || !stage || !currentProject || showProgress}
            >
              <Play className="w-3 h-3 mr-1" />
              {showProgress ? 'Generating...' : 'Generate Prompt'}
            </Button>
            
            <NodeActionsMenu
              nodeId={id || ''}
              nodeType="tool"
              nodeData={data}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-muted-foreground hover:bg-primary transition-colors"
      />
      </motion.div>
      <ProgressOverlay
        isVisible={showProgress}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onComplete={handleProgressComplete}
      />
    </>
  );
});