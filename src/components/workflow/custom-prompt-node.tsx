import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, FileText, BookOpen, AlertCircle, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useProjectStore } from '@/stores/project-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useStructuredPromptStore } from '@/stores/structured-prompt-store';
import { supabase } from '@/integrations/supabase/client';
import { ProgressOverlay } from './progress-overlay';
import { getSmartPosition } from '@/utils/node-positioning';
import { createConnectedEdge } from '@/utils/edge-creation';
import { NodeActionsMenu } from './node-actions-menu';
import { KnowledgeSelectionDialog } from './knowledge-selection-dialog';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { toast } from 'sonner';
import type { StructuredPrompt } from '@/types/structured-prompt';

interface CustomPromptNodeData {
  prompt: StructuredPrompt;
  linkedKnowledge?: string[];
  isActive?: boolean;
  isCompleted?: boolean;
}

interface CustomPromptNodeProps {
  data: CustomPromptNodeData;
  selected?: boolean;
  id?: string;
}

export const CustomPromptNode = memo(({ data, selected, id }: CustomPromptNodeProps) => {
  const { addNode, addEdge, nodes, edges, updateNode } = useWorkflowStore();
  const { currentProject } = useProjectStore();
  const { entries, fetchEntries } = useKnowledgeStore();
  const { incrementRunCount } = useStructuredPromptStore();
  const { prompt, linkedKnowledge: rawLinkedKnowledge = [], isActive, isCompleted } = data;
  const linkedKnowledge = Array.isArray(rawLinkedKnowledge) ? rawLinkedKnowledge : [];
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);

  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false);
  const totalSteps = 5;

  // Get knowledge from both linked entries AND connected knowledge document nodes
  const connectedKnowledgeNodes = edges
    .filter(edge => edge.target === id && edge.source.startsWith('knowledge-document-'))
    .map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      return sourceNode?.data?.knowledgeEntry;
    })
    .filter(Boolean);

  const allLinkedKnowledge = [...linkedKnowledge];
  connectedKnowledgeNodes.forEach(knowledgeEntry => {
    if (knowledgeEntry && !allLinkedKnowledge.includes(knowledgeEntry.id)) {
      allLinkedKnowledge.push(knowledgeEntry.id);
    }
  });

  const totalKnowledgeCount = allLinkedKnowledge.length;

  const handleRunPrompt = async (overrideLinkedKnowledge?: string[]) => {
    if (!currentProject) {
      toast.error('No project selected');
      return;
    }

    // Use override knowledge if provided, otherwise use existing
    const effectiveLinkedKnowledge = overrideLinkedKnowledge || allLinkedKnowledge;

    // Get all knowledge entries
    const allKnowledgeEntries = [...entries.filter(entry => effectiveLinkedKnowledge.includes(entry.id))];

    // Add knowledge from connected canvas nodes
    connectedKnowledgeNodes.forEach(knowledgeEntry => {
      if (knowledgeEntry && !allKnowledgeEntries.find(e => e.id === knowledgeEntry.id)) {
        allKnowledgeEntries.push(knowledgeEntry);
      }
    });

    // Check if we have knowledge
    if (allKnowledgeEntries.length === 0) {
      // Check if project has any knowledge entries
      if (entries.length === 0) {
        await fetchEntries(currentProject.id);
      }

      // Show dialog to select knowledge
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

      // Step 3: Generating with AI
      setCurrentStep(3);

      // Prepare knowledge data in the same format as ToolNode
      const knowledgeData = allKnowledgeEntries
        .map(entry => ({
          id: entry.id,
          title: entry.title,
          content: entry.content
        }));

      // Format knowledge context for variable replacement
      const knowledgeBaseText = knowledgeData.length > 0
        ? knowledgeData
            .map((k) => `### ${k.title}\n\n${k.content}`)
            .join('\n\n---\n\n')
        : 'No knowledge base entries linked to this prompt.';

      const requestBody = {
        promptContent: prompt.compiled_prompt,
        variables: {
          knowledgeBase: knowledgeBaseText
        },
        projectId: currentProject.id,
        frameworkName: prompt.framework_name || 'Custom Prompt',
        stageName: prompt.stage_name || 'Library',
        toolName: prompt.tool_name || prompt.title,
        knowledgeContext: knowledgeData
      };

      console.log('[CustomPromptNode] Sending to API:', {
        promptTitle: prompt.title,
        promptContentLength: prompt.compiled_prompt.length,
        projectId: currentProject.id,
        frameworkName: requestBody.frameworkName,
        stageName: requestBody.stageName,
        toolName: requestBody.toolName,
        knowledgeCount: knowledgeData.length,
        hasKnowledgeContext: knowledgeData.length > 0,
        knowledgePreview: knowledgeData.map(k => ({
          id: k.id,
          title: k.title,
          contentLength: k.content.length
        }))
      });

      console.log('[CustomPromptNode] Request body:', requestBody);

      // Step 4: Executing AI Request
      setCurrentStep(4);

      const response = await supabase.functions.invoke('generate-ai-prompt', {
        body: requestBody
      });

      console.log('[CustomPromptNode] Full response:', response);

      const { data: aiResponse, error } = response;

      if (error) {
        console.error('Edge Function Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Response data:', aiResponse);

        // Create a result node with the prompt even if AI call failed
        const fallbackPrompt = {
          id: `fallback-${Date.now()}`,
          structured_prompt_id: prompt.id,
          workflowId: `custom-prompt-${prompt.id}`,
          projectId: currentProject.id,
          content: prompt.compiled_prompt,
          context: { customPrompt: prompt },
          variables: {},
          timestamp: Date.now(),
          output: '⚠️ AI execution failed. Please check the Edge Function logs or try again.'
        };

        const resultNode = {
          id: `prompt-${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'prompt',
          position: getSmartPosition('prompt', nodes, {
            sourceNodeId: id,
            workflowType: 'custom-prompt-to-result'
          }),
          data: {
            prompt: fallbackPrompt,
            sourceToolId: id,
            sourceToolName: prompt.title
          }
        };

        addNode(resultNode);
        addEdge(createConnectedEdge(id, resultNode.id, {
          type: 'default',
          style: { stroke: '#f59e0b', strokeWidth: 2 }
        }));

        setShowProgress(false);
        toast.error('AI call failed, but prompt was created. Check console for details.');
        return; // Don't throw, just return
      }

      if (!aiResponse?.success) {
        console.error('AI function returned error:', aiResponse?.error);
        toast.error('AI generation failed: ' + (aiResponse?.error || 'Unknown error'));
        throw new Error(aiResponse?.error || 'Failed to generate AI response');
      }

      console.log('AI response received:', {
        promptLength: aiResponse.prompt?.length || 0,
        responseLength: aiResponse.aiResponse?.length || 0,
        hasResponse: !!aiResponse.aiResponse
      });

      // Step 5: Creating Result Node
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Create the generated prompt object with AI response
      const generatedPrompt = {
        id: aiResponse.id,
        structured_prompt_id: prompt.id,
        workflowId: `custom-prompt-${prompt.id}`,
        projectId: currentProject.id,
        content: aiResponse.prompt,
        context: { customPrompt: prompt },
        variables: {},
        timestamp: Date.now(),
        output: aiResponse.aiResponse
      };

      // Create a result node
      const resultNode = {
        id: `prompt-${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'prompt',
        position: getSmartPosition('prompt', nodes, {
          sourceNodeId: id,
          workflowType: 'custom-prompt-to-result'
        }),
        data: {
          prompt: generatedPrompt,
          sourceToolId: id,
          sourceToolName: prompt.title
        }
      };

      addNode(resultNode);

      // Connect this node to the result
      addEdge(createConnectedEdge(id, resultNode.id, {
        type: 'default',
        style: { stroke: '#10b981', strokeWidth: 2 }
      }));

      // Increment run count
      await incrementRunCount(prompt.id);

      // Update node to completed state
      updateNode(id, { isCompleted: true });

      setShowProgress(false);
      toast.success('Custom prompt executed successfully');
    } catch (error) {
      console.error('Error running custom prompt:', error);
      toast.error('Failed to run custom prompt');
      setShowProgress(false);
    }
  };

  const handleKnowledgeSelected = async (selectedIds: string[]) => {
    console.log('[CustomPromptNode] Knowledge selected:', selectedIds);

    // Update node with linked knowledge
    updateNode(id, { linkedKnowledge: selectedIds });

    setShowKnowledgeDialog(false);

    // Now run the prompt with the selected knowledge
    setTimeout(() => handleRunPrompt(selectedIds), 300);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.compiled_prompt);
    toast.success('Prompt copied to clipboard');
  };

  return (
    <>
      <Card
        className={`min-w-[320px] max-w-[400px] p-4 transition-all ${
          selected ? 'ring-2 ring-primary shadow-lg' : ''
        } ${isCompleted ? 'border-green-500 border-2' : ''}`}
      >
        {/* Node Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
                {prompt.title}
              </h3>
              {prompt.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {prompt.description}
                </p>
              )}
            </div>
          </div>
          <NodeActionsMenu
            nodeId={id || ''}
            nodeType="custom-prompt"
            nodeData={data}
            position={{ x: 0, y: 0 }}
          />
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Custom Prompt
          </Badge>
          {prompt.tool_name && (
            <Badge variant="secondary" className="text-xs">
              {prompt.tool_name}
            </Badge>
          )}
          {prompt.run_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {prompt.run_count} runs
            </Badge>
          )}
        </div>

        {/* Knowledge Status */}
        <div className="mb-3">
          {totalKnowledgeCount > 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              <span>{totalKnowledgeCount} knowledge source{totalKnowledgeCount !== 1 ? 's' : ''} linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-500">
              <AlertCircle className="w-3 h-3" />
              <span>No knowledge linked</span>
            </div>
          )}
        </div>

        {/* Linked Knowledge Badges */}
        {linkedKnowledge.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {linkedKnowledge.slice(0, 3).map(knowledgeId => {
              const entry = entries.find(e => e.id === knowledgeId);
              if (!entry) return null;
              return (
                <Badge key={knowledgeId} variant="outline" className="text-xs">
                  {entry.title}
                </Badge>
              );
            })}
            {linkedKnowledge.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{linkedKnowledge.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleRunPrompt()}
            className="flex-1"
            disabled={showProgress}
          >
            <Play className="w-3 h-3 mr-1" />
            Run Prompt
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyPrompt}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.location.href = '/prompt-library';
            }}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* Draggable Handles */}
        <DraggableHandle
          type="target"
          position="left"
          onPositionChange={(pos) => updateHandlePosition('target-left', pos)}
          initialPosition={handlePositions['target-left']}
        />
        <DraggableHandle
          type="target"
          position="top"
          onPositionChange={(pos) => updateHandlePosition('target-top', pos)}
          initialPosition={handlePositions['target-top']}
        />
        <DraggableHandle
          type="source"
          position="right"
          onPositionChange={(pos) => updateHandlePosition('source-right', pos)}
          initialPosition={handlePositions['source-right']}
        />
        <DraggableHandle
          type="source"
          position="bottom"
          onPositionChange={(pos) => updateHandlePosition('source-bottom', pos)}
          initialPosition={handlePositions['source-bottom']}
        />
      </Card>

      {/* Progress Overlay */}
      {showProgress && (
        <ProgressOverlay
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={[
            'Analyzing Context',
            'Gathering Knowledge',
            'Generating with AI',
            'Executing AI Request',
            'Creating Result Node'
          ]}
        />
      )}

      {/* Knowledge Selection Dialog */}
      {showKnowledgeDialog && (
        <KnowledgeSelectionDialog
          isOpen={showKnowledgeDialog}
          onClose={() => setShowKnowledgeDialog(false)}
          onKnowledgeSelected={handleKnowledgeSelected}
          initialSelectedIds={linkedKnowledge}
          projectId={currentProject?.id}
        />
      )}
    </>
  );
});

CustomPromptNode.displayName = 'CustomPromptNode';
