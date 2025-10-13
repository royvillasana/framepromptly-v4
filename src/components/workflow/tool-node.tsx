import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Settings, Sparkles, BookOpen, AlertCircle, Zap, Star, Cpu, Users, Palette } from 'lucide-react';
import { UXTool, useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { supabase } from '@/integrations/supabase/client';
import { ProgressOverlay } from './progress-overlay';
import { getSmartPosition } from '@/utils/node-positioning';
import { NodeActionsMenu } from './node-actions-menu';
import { KnowledgeSelectionDialog } from './knowledge-selection-dialog';
import { EnhancedPromptPanel } from './enhanced-prompt-panel';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { ResizableNode } from './resizable-node';
import { getFrameworkColors } from '@/lib/framework-colors';
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
  const { generatePrompt, setCurrentPrompt, getEnhancedTemplate, generateEnhancedPrompt } = usePromptStore();
  const { addNode, addEdge, nodes, edges, updateNode } = useWorkflowStore();
  const { currentProject, getEnhancedSettings } = useProjectStore();
  const { entries, fetchEntries } = useKnowledgeStore();
  const { tool, framework, stage, isActive, isCompleted, linkedKnowledge: rawLinkedKnowledge = [], onSwitchToPromptTab } = data;
  const linkedKnowledge = Array.isArray(rawLinkedKnowledge) ? rawLinkedKnowledge : [];
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);
  
  // Get framework colors, fallback to design-thinking if no framework
  const colors = getFrameworkColors(framework?.id || 'design-thinking');
  
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false);
  const [showEnhancedPanel, setShowEnhancedPanel] = useState(false);
  const totalSteps = 5;

  // Check if enhanced template is available
  const enhancedTemplate = getEnhancedTemplate(tool.id);

  // Check if project has enhanced settings configured
  const hasProjectEnhancedSettings = currentProject ? getEnhancedSettings(currentProject.id) !== null : false;

  const handleGeneratePrompt = async (overrideLinkedKnowledge?: string[]) => {
    console.log('[handleGeneratePrompt] Called with override:', overrideLinkedKnowledge);
    console.log('[handleGeneratePrompt] Current linkedKnowledge prop:', linkedKnowledge);

    if (!framework || !stage || !currentProject) {
      console.error('Missing required data for prompt generation');
      return;
    }

    // Use override knowledge if provided (from handleKnowledgeSelected), otherwise use prop
    const effectiveLinkedKnowledge = overrideLinkedKnowledge || linkedKnowledge;
    console.log('[handleGeneratePrompt] Effective linked knowledge:', effectiveLinkedKnowledge);

    // Get knowledge from both linked entries AND connected knowledge document nodes
    const currentEdges = useWorkflowStore.getState().edges;
    const connectedKnowledgeNodes = currentEdges
      .filter(edge => edge.target === id && edge.source.startsWith('knowledge-document-'))
      .map(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        return sourceNode?.data?.knowledgeEntry;
      })
      .filter(Boolean);

    const allLinkedKnowledge = [...effectiveLinkedKnowledge];
    const allKnowledgeEntries = [...entries.filter(entry => effectiveLinkedKnowledge.includes(entry.id))];

    // Add knowledge from connected canvas nodes
    connectedKnowledgeNodes.forEach(knowledgeEntry => {
      if (knowledgeEntry && !allLinkedKnowledge.includes(knowledgeEntry.id)) {
        allLinkedKnowledge.push(knowledgeEntry.id);
        allKnowledgeEntries.push(knowledgeEntry);
      }
    });

    console.log('[handleGeneratePrompt] All linked knowledge count:', allLinkedKnowledge.length);

    // Check if tool has any linked knowledge (traditional or canvas-connected)
    if (allLinkedKnowledge.length === 0) {
      console.log('[handleGeneratePrompt] No knowledge found, opening dialog');
      // Check if project has any knowledge entries
      if (entries.length === 0) {
        // No knowledge in project - fetch first to be sure
        await fetchEntries(currentProject.id);
      }

      // Still no knowledge or no linked knowledge - show dialog
      setShowKnowledgeDialog(true);
      return;
    }

    console.log('[handleGeneratePrompt] Knowledge found, proceeding with generation');

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

      // Get linked knowledge content from all sources
      const knowledgeContext = allKnowledgeEntries
        .map(entry => `${entry.title}: ${entry.content}`)
        .join('\n\n');

      // Get project settings for dynamic prompt customization
      const projectSettings = currentProject ? getEnhancedSettings(currentProject.id) : null;

      console.log('[Tool Node] Generating prompt with project settings:', {
        projectId: currentProject.id,
        hasSettings: !!projectSettings,
        qualityDepth: projectSettings?.qualitySettings?.methodologyDepth || 'default',
        outputDetail: projectSettings?.qualitySettings?.outputDetail || 'default'
      });

      // Generate prompt content with project settings
      const promptContent = await generatePrompt(
        currentProject.id,
        framework,
        stage,
        tool,
        undefined,
        undefined,
        undefined,
        knowledgeContext || undefined,
        undefined, // enhancedContext
        projectSettings || undefined // project settings for dynamic customization
      );

      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 4: Executing AI Request
      setCurrentStep(4);
      
      const knowledgeData = allKnowledgeEntries
        .map(entry => ({ id: entry.id, title: entry.title, content: entry.content }));
      
      console.log('Knowledge Base Integration Debug:', {
        totalEntries: entries.length,
        traditionalLinkedKnowledgeIds: linkedKnowledge,
        connectedCanvasNodesCount: connectedKnowledgeNodes.length,
        allLinkedKnowledgeIds: allLinkedKnowledge,
        finalKnowledgeCount: knowledgeData.length,
        knowledgeData: knowledgeData.map(k => ({ 
          id: k.id, 
          title: k.title, 
          contentLength: k.content.length,
          contentPreview: k.content.substring(0, 100) + '...'
        }))
      });
      
      console.log('Sending to API:', {
        promptContent: promptContent.substring(0, 200) + '...',
        knowledgeCount: knowledgeData.length,
        hasKnowledgeContext: knowledgeData.length > 0
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
      
      // Step 5: Creating Node
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 400));

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

      // Wait a brief moment for the node to be added to the canvas
      await new Promise(resolve => setTimeout(resolve, 300));
      // Progress overlay will auto-close via onComplete after 1 second

    } catch (error) {
      console.error('Error generating AI prompt:', error);
      toast.error('Prompt generation failed: ' + (error.message || 'Unknown error'));
      setShowProgress(false);
      setCurrentStep(0);
    }
  };

  const handleKnowledgeSelected = async (knowledgeIds: string[]) => {
    console.log('[handleKnowledgeSelected] Called with:', knowledgeIds);
    if (id) {
      // Close the dialog first
      console.log('[handleKnowledgeSelected] Closing dialog');
      setShowKnowledgeDialog(false);

      // Update the node with linked knowledge
      console.log('[handleKnowledgeSelected] Updating node with knowledge');
      updateNode(id, { linkedKnowledge: knowledgeIds });

      toast.success(`${knowledgeIds.length} knowledge ${knowledgeIds.length === 1 ? 'entry' : 'entries'} linked to ${tool.name}`);

      // Now generate the prompt after ensuring dialog is closed
      // Pass the knowledgeIds directly to avoid stale prop values
      console.log('[handleKnowledgeSelected] Scheduling handleGeneratePrompt in 500ms');
      setTimeout(() => {
        console.log('[handleKnowledgeSelected] Now calling handleGeneratePrompt');
        handleGeneratePrompt(knowledgeIds);
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

  const handleEnhancedGenerate = (variables: Record<string, any>, enhancedContext: any) => {
    console.log('handleEnhancedGenerate called with:');
    console.log('Tool ID:', tool.id);
    console.log('Variables:', variables);
    console.log('Enhanced Context:', enhancedContext);
    
    generateEnhancedPrompt(tool.id, variables, enhancedContext)
      .then((promptContent) => {
        toast.success('Enhanced prompt generated successfully!');
        setShowEnhancedPanel(false);
        
        // Switch to prompt tab if callback is provided
        if (onSwitchToPromptTab) {
          setTimeout(() => {
            onSwitchToPromptTab();
          }, 500);
        }
      })
      .catch((error) => {
        toast.error('Failed to generate enhanced prompt: ' + error.message);
        console.error('Enhanced prompt generation error:', error);
      });
  };

  return (
    <ResizableNode 
      selected={selected}
      nodeType="tool"
      initialWidth={300}
      initialHeight={420}
      minWidth={260}
      nodeId={id}
      maxWidth={380}
      minHeight={420}
      maxHeight={650}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
      {/* Draggable Connection Handles */}
      {id && (
        <>
          <DraggableHandle
            id={`${id}-target-1`}
            type="target"
            initialPosition={handlePositions['target-1'] || 'left'}
            onPositionChange={(position) => updateHandlePosition('target-1', position)}
            nodeId={id}
          />
          <DraggableHandle
            id={`${id}-target-2`}
            type="target"
            initialPosition={handlePositions['target-2'] || 'top'}
            onPositionChange={(position) => updateHandlePosition('target-2', position)}
            nodeId={id}
          />
        </>
      )}
      
      <Card 
        className={`w-full p-4 transition-all duration-200 flex flex-col ${selected ? 'ring-2 ring-offset-2' : ''} hover:shadow-md`}
        style={{
          backgroundColor: isActive ? colors.background.hover : colors.background.tertiary,
          borderTopWidth: '2px',
          borderRightWidth: '2px',
          borderBottomWidth: '2px',
          borderLeftWidth: '3px',
          borderTopColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderRightColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderBottomColor: selected ? colors.border.primary : isCompleted ? '#10B981' : colors.border.tertiary,
          borderLeftColor: colors.border.tertiary,
          borderStyle: 'solid',
          ...(selected && {
            '--tw-ring-color': colors.border.primary,
            '--tw-ring-offset-shadow': `0 0 0 2px ${colors.background.tertiary}`,
            '--tw-ring-shadow': `0 0 0 calc(2px + 2px) ${colors.border.primary}`
          })
        }}
      >
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 flex-shrink-0">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: colors.text.secondary }} />
                <h3 className="font-semibold text-sm" style={{ color: colors.text.secondary }}>{tool.name}</h3>
                {enhancedTemplate && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <Star className="w-2 h-2 mr-1" />
                    Enhanced
                  </Badge>
                )}
              </div>
              <div className="max-h-12 overflow-hidden">
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: colors.text.light }}>
                  {tool.description}
                </p>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <Badge 
              className="text-xs font-medium" 
              style={{ 
                backgroundColor: colors.background.secondary, 
                color: colors.text.secondary,
                borderColor: colors.border.secondary
              }}
            >
              {tool.category}
            </Badge>
            
            <div className="flex items-center gap-1">
              {isCompleted && (
                <Badge variant="default" className="text-xs bg-success">
                  Done
                </Badge>
              )}
              {isActive && (
                <Badge 
                  className="text-xs" 
                  style={{ 
                    backgroundColor: colors.background.primary, 
                    color: colors.text.primary 
                  }}
                >
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Knowledge Status */}
          <div className="flex-1 flex flex-col min-h-0 mb-3">
            <div className="flex items-center gap-2 flex-shrink-0 mb-2">
              {(() => {
                // Calculate total knowledge including canvas connections
                const connectedKnowledgeCount = edges.filter(edge => 
                  edge.target === id && edge.source.startsWith('knowledge-document-')
                ).length;
                const totalKnowledge = linkedKnowledge.length + connectedKnowledgeCount;
                
                return totalKnowledge > 0 ? (
                  <>
                    <BookOpen className="w-3 h-3" style={{ color: colors.text.secondary }} />
                    <span className="text-xs" style={{ color: colors.text.light }}>
                      {totalKnowledge} knowledge {totalKnowledge === 1 ? 'entry' : 'entries'} 
                      {connectedKnowledgeCount > 0 && (
                        <span className="text-blue-600 ml-1">
                          ({connectedKnowledgeCount} from canvas)
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-500">
                      No knowledge linked - will prompt to add
                    </span>
                  </>
                );
              })()}
            </div>
            {linkedKnowledge.length > 0 && (
              <div className="flex-grow max-h-16 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {entries
                    .filter(entry => linkedKnowledge.includes(entry.id))
                    .map(entry => (
                      <Badge 
                        key={entry.id} 
                        className="text-xs px-1 py-0 h-4 flex-shrink-0" 
                        style={{ 
                          backgroundColor: colors.background.secondary, 
                          color: colors.text.secondary, 
                          borderColor: colors.border.secondary 
                        }}
                      >
                        {entry.title.length > 10 ? `${entry.title.substring(0, 10)}...` : entry.title}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Generate Prompt Button */}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleGeneratePrompt();
              }}
              className="w-full h-8 text-xs"
              style={{
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                borderColor: colors.border.primary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.hover;
                e.currentTarget.style.color = colors.text.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.primary;
                e.currentTarget.style.color = colors.text.primary;
              }}
              disabled={!framework || !stage || !currentProject || showProgress}
            >
              <Play className="w-3 h-3 mr-1" />
              {showProgress ? 'Generating...' : 'Generate Prompt'}
            </Button>
            
            {/* Debug and Actions Row */}
            <div className="flex items-center justify-between">
              {/* Debug Info in Development */}
              {process.env.NODE_ENV === 'development' && linkedKnowledge.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    const knowledgeEntries = entries.filter(entry => linkedKnowledge.includes(entry.id));
                    console.log('Debug - Linked Knowledge:', knowledgeEntries);
                    toast.success(`Debug: ${knowledgeEntries.length} knowledge entries linked`);
                  }}
                  title="Debug knowledge context"
                >
                  🔍 Debug
                </Button>
              )}
              
              <div className="ml-auto">
                <NodeActionsMenu
                  nodeId={id || ''}
                  nodeType="tool"
                  nodeData={data}
                  position={{ x: 0, y: 0 }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {id && (
        <>
          <DraggableHandle
            id={`${id}-source-1`}
            type="source"
            initialPosition={handlePositions['source-1'] || 'right'}
            onPositionChange={(position) => updateHandlePosition('source-1', position)}
            nodeId={id}
          />
          <DraggableHandle
            id={`${id}-source-2`}
            type="source"
            initialPosition={handlePositions['source-2'] || 'bottom'}
            onPositionChange={(position) => updateHandlePosition('source-2', position)}
            nodeId={id}
          />
        </>
      )}
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
      
      {showEnhancedPanel && enhancedTemplate && (
        <EnhancedPromptPanel
          template={enhancedTemplate}
          onGenerate={handleEnhancedGenerate}
          onClose={() => setShowEnhancedPanel(false)}
        />
      )}
    </ResizableNode>
  );
});