import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Zap,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import {
  PromptInput,
  PromptInputContainer,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputShortcuts
} from '@/components/ui/prompt-input';
import { useAIBuilderStore } from '@/stores/ai-builder-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';
import { createConnectedEdge } from '@/utils/edge-creation';
import { createPositionCalculator } from '@/utils/node-positioning';

interface AIBuilderNodeData {
  isGenerating?: boolean;
}

interface AIBuilderNodeProps {
  data: AIBuilderNodeData;
  selected?: boolean;
  id?: string;
}

export const AIBuilderNode = memo(({ data, selected, id }: AIBuilderNodeProps) => {
  const {
    isGenerating,
    currentPrompt,
    error,
    currentGeneration,
    showPreview,
    conversationHistory,
    generateWorkflow,
    acceptGeneration,
    rejectGeneration,
    setCurrentPrompt,
    clearError,
    clearConversation,
  } = useAIBuilderStore();

  const { frameworks, addNode, addEdge, nodes } = useWorkflowStore();
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);
  const [localPrompt, setLocalPrompt] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Sync local prompt with store
  useEffect(() => {
    setLocalPrompt(currentPrompt);
  }, [currentPrompt]);

  // Sample prompts
  const samplePrompts = [
    "Design Thinking flow for mobile app research",
    "Double Diamond process for website redesign",
    "Google Sprint for new feature validation",
    "User research workflow with interviews and personas",
    "Lean UX process for MVP validation",
    "HEART framework for measuring user experience",
    "Hooked model for habit-forming product design",
    "Jobs-to-be-Done research methodology",
    "Agile UX workflow for continuous improvement",
  ];

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isGenerating) return;

    setCurrentPrompt(value);
    await generateWorkflow(value, frameworks);
    setLocalPrompt('');
  };

  const handleAcceptGeneration = () => {
    const { nodes: generatedNodes, edges: generatedEdges } = acceptGeneration();

    if (generatedNodes.length === 0) {
      toast.error('No workflow generated');
      return;
    }

    // Find this AI Builder node's position
    const thisNode = nodes.find(n => n.id === id);
    const baseX = thisNode?.position.x || 50;
    const baseY = thisNode?.position.y || 100;

    // Create position calculator for intelligent placement
    const calculator = createPositionCalculator();

    // Calculate the bounding box of generated nodes to understand the workflow size
    const minY = Math.min(...generatedNodes.map(n => n.position.y));
    const maxY = Math.max(...generatedNodes.map(n => n.position.y));
    const workflowHeight = maxY - minY;

    // Center the workflow vertically relative to AI Builder
    const verticalOffset = -workflowHeight / 2;

    // Position nodes intelligently to avoid overlaps with existing nodes
    const adjustedNodes: typeof generatedNodes = [];

    for (let index = 0; index < generatedNodes.length; index++) {
      const node = generatedNodes[index];

      // Calculate initial preferred position (to the right of AI Builder)
      const preferredX = baseX + 600;
      const preferredY = baseY + verticalOffset + (node.position.y - minY);

      // Use position calculator to find a safe position that avoids overlaps
      // We pass all existing nodes PLUS previously adjusted nodes to avoid self-overlap
      const allExistingNodes = [...nodes, ...adjustedNodes];
      const safePosition = calculator.getNextPosition(
        node.type || 'framework',
        allExistingNodes,
        preferredX,
        preferredY
      );

      adjustedNodes.push({
        ...node,
        position: safePosition,
      });
    }

    // Find the first framework node to connect to
    const firstFrameworkNode = adjustedNodes.find(node => node.type === 'framework');

    // Add adjusted nodes to workflow
    adjustedNodes.forEach(node => addNode(node));
    generatedEdges.forEach(edge => addEdge(edge));

    // Create edge from AI Builder to first framework node
    if (firstFrameworkNode && id) {
      const connectionEdge = createConnectedEdge(id, firstFrameworkNode.id, {
        sourceHandle: 'source-1', // Use unprefixed ID for our handle
        targetHandle: `${firstFrameworkNode.id}-target-1`, // Framework nodes use prefixed IDs
        animated: true,
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
        },
      });
      addEdge(connectionEdge);
    }

    toast.success('AI-generated workflow added to canvas');
  };

  const handleRejectGeneration = () => {
    rejectGeneration();
    toast.info('AI generation discarded');
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-[600px]"
    >
      {/* Target Handle (Left side) - receives connections */}
      {id && (
        <DraggableHandle
          id="target-1"
          type="target"
          initialPosition={handlePositions['target-1'] || 'left'}
          onPositionChange={(position) => updateHandlePosition('target-1', position)}
          nodeId={id}
        />
      )}

      <Card
        className={`
          w-full max-h-[600px] overflow-auto
          bg-card/85 backdrop-blur-lg
          transition-all duration-200
          ${selected
            ? 'border-2 border-primary shadow-lg shadow-primary/20'
            : 'border-2 border-border hover:border-primary/50'
          }
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Workflow Builder</h3>
                <p className="text-xs text-muted-foreground">
                  Describe your workflow in natural language
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationHistory.length > 0 && (
                <Button
                  onClick={clearConversation}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  title="Clear conversation"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg border border-destructive/20 flex items-start gap-2"
              >
                <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">{error}</div>
                <Button
                  onClick={clearError}
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-2 w-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                Recent conversations
              </div>
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {conversationHistory.slice(-2).map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs space-y-1 p-2 bg-muted/30 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {entry.timestamp.toLocaleTimeString()}
                        </Badge>
                        <span className="text-muted-foreground truncate flex-1">
                          {entry.prompt}
                        </span>
                      </div>
                      {entry.response && (
                        <div className="text-primary font-medium flex items-center gap-1">
                          <Sparkles className="h-2 w-2" />
                          Generated {entry.response.framework.name} workflow
                        </div>
                      )}
                      {entry.error && (
                        <div className="text-destructive flex items-center gap-1">
                          <X className="h-2 w-2" />
                          {entry.error}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* Current Generation Preview */}
          <AnimatePresence>
            {showPreview && currentGeneration && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Separator />
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Generated Workflow
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {currentGeneration.framework.name}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium">Stages:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentGeneration.stages.map((stage, index) => (
                          <Badge key={index} variant="outline" className="text-[10px]">
                            {stage.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium">Tools:</span>
                      <div className="text-primary font-medium">
                        {currentGeneration.tools.length} tools included
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-background/30 p-2 rounded border">
                    <span className="font-medium">AI Reasoning:</span> {currentGeneration.reasoning}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAcceptGeneration}
                      size="sm"
                      className="h-8 text-xs flex-1"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Accept & Add to Canvas
                    </Button>
                    <Button
                      onClick={handleRejectGeneration}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Prompt Input - Hidden when preview is showing */}
          {!showPreview && (
            <div className="space-y-3">
              <PromptInput
                value={localPrompt}
                onValueChange={setLocalPrompt}
                onSubmit={handleSubmit}
                disabled={isGenerating}
                loading={isGenerating}
                placeholder="Describe your workflow... (e.g., 'Design Thinking flow for mobile app research')"
                maxHeight={120}
              >
                <PromptInputContainer className="bg-background/40 border-muted/40">
                  <PromptInputTextarea
                    onKeyDown={() => setShowShortcuts(true)}
                  />
                  <PromptInputToolbar>
                    <PromptInputTools>
                      <PromptInputModelSelect />
                    </PromptInputTools>
                    <PromptInputSubmit />
                  </PromptInputToolbar>
                </PromptInputContainer>
              </PromptInput>

              {/* Keyboard Shortcuts */}
              <AnimatePresence>
                {(showShortcuts || localPrompt.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <PromptInputShortcuts />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Suggested Prompts */}
          {conversationHistory.length === 0 && !showPreview && !localPrompt && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-xs text-muted-foreground font-medium">
                💡 Click to try these examples:
              </div>

              <div className="relative w-full overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <div className="flex gap-2 w-max">
                  {samplePrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      onClick={() => setLocalPrompt(prompt)}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-background/60 hover:bg-background/80 border-muted/40 hover:border-muted/60 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap rounded-full px-4 flex-shrink-0"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating workflow...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source Handle (Right side) - connects to generated workflow */}
      {id && (
        <DraggableHandle
          id="source-1"
          type="source"
          initialPosition={handlePositions['source-1'] || 'right'}
          onPositionChange={(position) => updateHandlePosition('source-1', position)}
          nodeId={id}
        />
      )}
    </motion.div>
  );
});

AIBuilderNode.displayName = 'AIBuilderNode';
