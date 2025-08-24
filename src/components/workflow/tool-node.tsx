import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Settings, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { UXTool, useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { supabase } from '@/integrations/supabase/client';
import { ProgressOverlay } from './progress-overlay';
import { getSmartPosition } from '@/utils/node-positioning';
import { NodeActionsMenu } from './node-actions-menu';
import { KnowledgeSelectionDialog } from './knowledge-selection-dialog';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { ResizableNode } from './resizable-node';
import { toast } from 'sonner';

interface ToolNodeData {
  tool: UXTool;
  framework?: any;
  stage?: any;
  isActive?: boolean;
  isCompleted?: boolean;
  linkedKnowledge?: string[];
}

interface ToolNodeProps {
  data: ToolNodeData;
  selected?: boolean;
  onSwitchToPromptTab?: () => void;
}

export const ToolNode = memo(({ data, selected, id }: ToolNodeProps & { id?: string }) => {
  const { generatePrompt, setCurrentPrompt } = usePromptStore();
  const { addNode, addEdge, nodes, updateNode } = useWorkflowStore();
  const { currentProject } = useProjectStore();
  const { entries, fetchEntries } = useKnowledgeStore();
  const { tool, framework, stage, isActive, isCompleted, linkedKnowledge: rawLinkedKnowledge = [], onSwitchToPromptTab } = data;
  const linkedKnowledge = Array.isArray(rawLinkedKnowledge) ? rawLinkedKnowledge : [];
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);
  
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false);
  const totalSteps = 4;

  const handleGeneratePrompt = async () => {
    if (!framework || !stage || !currentProject) {
      console.error('Missing required data for prompt generation');
      return;
    }

    // Check if tool has linked knowledge
    if (linkedKnowledge.length === 0) {
      // Check if project has any knowledge entries
      if (entries.length === 0) {
        // No knowledge in project - fetch first to be sure
        await fetchEntries(currentProject.id);
      }
      
      // Still no knowledge or no linked knowledge - show dialog
      setShowKnowledgeDialog(true);
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
      
      // Get linked knowledge content
      const knowledgeContext = entries
        .filter(entry => linkedKnowledge.includes(entry.id))
        .map(entry => `${entry.title}: ${entry.content}`)
        .join('\n\n');
        
      const promptContent = await generatePrompt(
        currentProject.id, 
        framework, 
        stage, 
        tool, 
        undefined, 
        undefined, 
        undefined,
        knowledgeContext || undefined
      );
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 4: Executing AI Request
      setCurrentStep(4);
      
      const knowledgeData = entries
        .filter(entry => linkedKnowledge.includes(entry.id))
        .map(entry => ({ id: entry.id, title: entry.title, content: entry.content }));
      
      console.log('Sending to API:', {
        promptContent: promptContent.substring(0, 200) + '...',
        knowledgeCount: knowledgeData.length,
        knowledgeData: knowledgeData.map(k => ({ title: k.title, contentLength: k.content.length }))
      });
      
      const { data, error } = await supabase.functions.invoke('generate-ai-prompt', {
        body: {
          promptContent,
          variables: {},
          projectId: currentProject.id,
          frameworkName: framework.name,
          stageName: stage.name,
          toolName: tool.name,
          knowledgeContext: knowledgeData
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        toast.error('Failed to call AI service: ' + (error.message || 'Unknown error'));
        throw error;
      }

      if (!data.success) {
        console.error('AI function returned error:', data.error);
        toast.error('AI generation failed: ' + (data.error || 'Unknown error'));
        throw new Error(data.error || 'Failed to generate AI response');
      }
      
      console.log('AI response received:', {
        promptLength: data.prompt?.length || 0,
        responseLength: data.aiResponse?.length || 0,
        hasResponse: !!data.aiResponse
      });

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
      const newPosition = getSmartPosition('prompt', nodes, { 
        sourceNodeId: id,
        workflowType: 'tool-to-prompt' 
      });
      
      // Create a new prompt node with proper positioning
      const promptNode = {
        id: `prompt-${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'prompt',
        position: newPosition,
        data: {
          prompt: generatedPrompt,
          onSwitchToPromptTab,
          sourceToolId: id,
          sourceToolName: tool.name
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
      toast.error('Prompt generation failed: ' + (error.message || 'Unknown error'));
      setShowProgress(false);
      setCurrentStep(0);
    }
  };

  const handleKnowledgeSelected = async (knowledgeIds: string[]) => {
    if (id) {
      // Update the node with linked knowledge
      updateNode(id, { linkedKnowledge: knowledgeIds });
      
      toast.success(`${knowledgeIds.length} knowledge ${knowledgeIds.length === 1 ? 'entry' : 'entries'} linked to ${tool.name}`);
      
      // Now generate the prompt
      setTimeout(() => {
        handleGeneratePrompt();
      }, 500);
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
    <ResizableNode 
      selected={selected} 
      minWidth={250} 
      minHeight={200}
      maxWidth={400}
      maxHeight={500}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={selected ? {} : { scale: 1.02 }}
      >
      {/* Draggable Connection Handles */}
      <DraggableHandle
        id="target-1"
        type="target"
        initialPosition={handlePositions['target-1'] || 'left'}
        onPositionChange={(position) => updateHandlePosition('target-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="target-2"
        type="target"
        initialPosition={handlePositions['target-2'] || 'top'}
        onPositionChange={(position) => updateHandlePosition('target-2', position)}
        nodeId={id}
      />
      
      <Card 
        className={`
          w-full h-full p-4 transition-all duration-200
          ${selected ? 'ring-2 ring-primary shadow-lg border-2 border-primary' : 'hover:shadow-md border'}
          ${isActive ? 'border-primary bg-primary/5' : ''}
          ${isCompleted ? 'border-success bg-success/5' : ''}
        `}
      >
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

          {/* Knowledge Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {linkedKnowledge.length > 0 ? (
                <>
                  <BookOpen className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {linkedKnowledge.length} knowledge {linkedKnowledge.length === 1 ? 'entry' : 'entries'} linked
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">
                    No knowledge linked - will prompt to add
                  </span>
                </>
              )}
            </div>
            {linkedKnowledge.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {entries
                  .filter(entry => linkedKnowledge.includes(entry.id))
                  .slice(0, 2)
                  .map(entry => (
                    <Badge key={entry.id} variant="outline" className="text-xs px-1 py-0 h-4">
                      {entry.title.length > 12 ? `${entry.title.substring(0, 12)}...` : entry.title}
                    </Badge>
                  ))}
                {linkedKnowledge.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    +{linkedKnowledge.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleGeneratePrompt();
              }}
              className="flex-1 h-8 text-xs"
              disabled={!framework || !stage || !currentProject || showProgress}
            >
              <Play className="w-3 h-3 mr-1" />
              {showProgress ? 'Generating...' : 'Generate Prompt'}
            </Button>
            
            {/* Debug Info in Development */}
            {process.env.NODE_ENV === 'development' && linkedKnowledge.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  const knowledgeEntries = entries.filter(entry => linkedKnowledge.includes(entry.id));
                  console.log('Debug - Linked Knowledge:', knowledgeEntries);
                  toast.success(`Debug: ${knowledgeEntries.length} knowledge entries linked`);
                }}
                title="Debug knowledge context"
              >
                🔍
              </Button>
            )}
            
            <NodeActionsMenu
              nodeId={id || ''}
              nodeType="tool"
              nodeData={data}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
      </Card>

      <DraggableHandle
        id="source-1"
        type="source"
        initialPosition={handlePositions['source-1'] || 'right'}
        onPositionChange={(position) => updateHandlePosition('source-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="source-2"
        type="source"
        initialPosition={handlePositions['source-2'] || 'bottom'}
        onPositionChange={(position) => updateHandlePosition('source-2', position)}
        nodeId={id}
      />
      </motion.div>
      
      <ProgressOverlay
        isVisible={showProgress}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onComplete={handleProgressComplete}
      />
      
      <KnowledgeSelectionDialog
        isOpen={showKnowledgeDialog}
        onClose={() => setShowKnowledgeDialog(false)}
        onKnowledgeSelected={handleKnowledgeSelected}
        toolName={tool.name}
        toolId={id}
      />
    </ResizableNode>
  );
});