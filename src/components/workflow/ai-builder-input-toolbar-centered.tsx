import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { Suggestions, Suggestion } from '@/components/ui/suggestion';
import { useAIBuilderStore } from '@/stores/ai-builder-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

interface ToolbarCenteredAIBuilderProps {
  onWorkflowGenerated?: (nodes: any[], edges: any[]) => void;
}

export function ToolbarCenteredAIBuilder({ onWorkflowGenerated }: ToolbarCenteredAIBuilderProps) {
  const {
    isExpanded,
    isGenerating,
    currentPrompt,
    error,
    currentGeneration,
    showPreview,
    toggleExpanded,
    setCurrentPrompt,
    clearError,
    generateWorkflow,
    acceptGeneration,
    rejectGeneration,
  } = useAIBuilderStore();

  const { frameworks, addNode, addEdge } = useWorkflowStore();
  const [localPrompt, setLocalPrompt] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Sync local prompt with store
  useEffect(() => {
    setLocalPrompt(currentPrompt);
  }, [currentPrompt]);

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isGenerating) return;
    
    setCurrentPrompt(value);
    await generateWorkflow(value, frameworks);
    setLocalPrompt('');
  };

  const handleAcceptGeneration = () => {
    const { nodes, edges } = acceptGeneration();
    
    // Add nodes and edges to the main workflow
    nodes.forEach(node => addNode(node));
    edges.forEach(edge => addEdge(edge));
    
    onWorkflowGenerated?.(nodes, edges);
    toast.success('AI-generated workflow added to canvas');
  };

  const handleRejectGeneration = () => {
    rejectGeneration();
    toast.info('AI generation discarded');
  };

  // Sample prompts for quick start
  const samplePrompts = [
    "Design Thinking flow for mobile app research",
    "Double Diamond process for website redesign", 
    "Google Sprint for new feature validation",
    "User research workflow with interviews and personas",
    "Lean UX process for MVP validation",
    "HEART framework for measuring user experience",
    "Hooked model for habit-forming product design",
    "Jobs-to-be-Done research methodology",
    "Agile UX workflow for continuous improvement"
  ];

  return (
    <div className="relative">
      {/* AI Builder Trigger Button */}
      <Button
        onClick={toggleExpanded}
        size="sm"
        variant={isExpanded ? "default" : "outline"}
        className={`
          relative transition-all duration-300 group
          ${isExpanded 
            ? "bg-primary text-primary-foreground shadow-lg scale-105" 
            : "hover:bg-primary/10 hover:text-primary hover:scale-105"
          }
        `}
      >
        <motion.div
          animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
        </motion.div>
        AI Builder
        {isGenerating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-2"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
          </motion.div>
        )}
        
        {/* Pulse animation when not expanded */}
        {!isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-md bg-primary/20"
            animate={{ scale: [1, 1.05, 1], opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </Button>

      {/* Enhanced AI Builder Panel - Centered relative to toolbar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-full mb-3 w-[calc(100vw-2rem)] max-w-2xl min-w-96 z-50"
            style={{
              // Center relative to the toolbar's width by adjusting positioning
              // This ensures the AI Builder is centered on the toolbar, not the viewport
              left: 'calc(-270% + 0px)', // Center relative to toolbar width
              transform: 'translateY(0)', // Remove x-translation since we're using left positioning
            }}
          >
            <Card className="bg-card/85 backdrop-blur-lg border shadow-2xl">
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
                    <Button
                      onClick={toggleExpanded}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
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

                        <div className="text-xs text-muted-foreground bg-background/20 p-2 rounded border border-muted/30">
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

                {/* Enhanced Prompt Input */}
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

                {/* AI Suggestions */}
                {!showPreview && localPrompt.length < 10 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="text-xs text-muted-foreground font-medium">
                      💡 Click to try these examples:
                    </div>
                    <Suggestions className="gap-2 pb-2">
                      {samplePrompts.map((prompt, index) => (
                        <Suggestion
                          key={index}
                          suggestion={prompt}
                          onClick={(suggestion) => {
                            setLocalPrompt(suggestion);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-background/60 hover:bg-background/80 border-muted/40 hover:border-muted/60 transition-all duration-200 hover:scale-105 active:scale-95"
                        />
                      ))}
                    </Suggestions>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}