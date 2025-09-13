import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, ThumbsUp, ThumbsDown, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAIBuilderStore } from '@/stores/ai-builder-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

interface AIBuilderInputProps {
  onWorkflowGenerated?: (nodes: any[], edges: any[]) => void;
}

export function AIBuilderInput({ onWorkflowGenerated }: AIBuilderInputProps) {
  const {
    isExpanded,
    isGenerating,
    currentPrompt,
    error,
    currentGeneration,
    showPreview,
    conversationHistory,
    toggleExpanded,
    setCurrentPrompt,
    clearError,
    generateWorkflow,
    acceptGeneration,
    rejectGeneration,
    clearConversation,
  } = useAIBuilderStore();

  const { frameworks, addNode, addEdge } = useWorkflowStore();
  const [localPrompt, setLocalPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local prompt with store
  useEffect(() => {
    setLocalPrompt(currentPrompt);
  }, [currentPrompt]);

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!localPrompt.trim() || isGenerating) return;
    
    setCurrentPrompt(localPrompt);
    await generateWorkflow(localPrompt, frameworks);
    setLocalPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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

  return (
    <div className="relative">
      {/* AI Builder Trigger Button */}
      <Button
        onClick={toggleExpanded}
        size="sm"
        variant={isExpanded ? "default" : "outline"}
        className={`
          relative transition-all duration-200
          ${isExpanded 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "hover:bg-primary/10 hover:text-primary"
          }
        `}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        AI Builder
        {isGenerating && (
          <Loader2 className="h-3 w-3 ml-1 animate-spin" />
        )}
      </Button>

      {/* Expanded AI Builder Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-2 left-0 w-96 max-w-[90vw] z-50"
          >
            <Card className="bg-card/95 backdrop-blur-sm border shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    AI Workflow Builder
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {conversationHistory.length > 0 && (
                      <Button
                        onClick={clearConversation}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        title="Clear conversation"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      onClick={toggleExpanded}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 text-destructive text-xs p-2 rounded border border-destructive/20"
                  >
                    {error}
                    <Button
                      onClick={clearError}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </motion.div>
                )}

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-hidden">
                    <ScrollArea className="max-h-32">
                      {conversationHistory.slice(-2).map((entry) => (
                        <div key={entry.id} className="text-xs space-y-1 pb-2">
                          <div className="text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {entry.timestamp.toLocaleTimeString()}
                            </Badge>
                            <span className="ml-2">{entry.prompt}</span>
                          </div>
                          {entry.response && (
                            <div className="text-primary font-medium">
                              ✓ Generated {entry.response.framework.name} workflow
                            </div>
                          )}
                          {entry.error && (
                            <div className="text-destructive">
                              ✗ {entry.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {/* Current Generation Preview */}
                {showPreview && currentGeneration && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Separator />
                    <div className="bg-primary/5 border border-primary/10 rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Generated Workflow</h4>
                        <Badge variant="secondary" className="text-xs">
                          {currentGeneration.framework.name}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Stages:</span>
                          <span className="ml-2">
                            {currentGeneration.stages.map(s => s.name).join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tools:</span>
                          <span className="ml-2 text-primary">
                            {currentGeneration.tools.length} tools
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {currentGeneration.reasoning}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleAcceptGeneration}
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={handleRejectGeneration}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={localPrompt}
                      onChange={(e) => setLocalPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe your workflow... (e.g., 'Create a Design Thinking flow for mobile app research with user interviews and persona creation')"
                      className="min-h-[60px] max-h-24 text-sm resize-none pr-10"
                      disabled={isGenerating}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!localPrompt.trim() || isGenerating}
                      className="absolute bottom-2 right-2 h-6 w-6 p-0"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </form>

                {/* Sample Prompts */}
                {conversationHistory.length === 0 && !showPreview && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Try these examples:</div>
                    <div className="space-y-1">
                      {[
                        "Design Thinking flow for mobile app research",
                        "Double Diamond process for website redesign",
                        "Google Sprint for new feature validation"
                      ].map((example, index) => (
                        <Button
                          key={index}
                          onClick={() => setLocalPrompt(example)}
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs justify-start font-normal text-muted-foreground hover:text-foreground"
                        >
                          "{example}"
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}