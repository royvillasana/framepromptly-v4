import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Copy, 
  Play, 
  ChevronRight, 
  FileText, 
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import { usePromptStore } from '@/stores/prompt-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

export function PromptPanel({ onPromptView }: { onPromptView?: () => void }) {
  const { prompts, currentPrompt, setCurrentPrompt, executePrompt, isGenerating } = usePromptStore();
  const { nodes } = useWorkflowStore();

  // Check if there are any prompt nodes in the canvas
  const promptNodes = nodes.filter(node => node.type === 'prompt');
  const hasPromptNodes = promptNodes.length > 0;

  const handleCopyPrompt = (prompt: any) => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard');
  };

  const handleExecutePrompt = async (promptId: string) => {
    try {
      await executePrompt(promptId);
      toast.success('Prompt executed successfully!');
    } catch (error) {
      toast.error('Failed to execute prompt');
    }
  };

  const handleViewPrompt = (prompt: any) => {
    setCurrentPrompt(prompt);
    onPromptView?.(); // Notify parent to switch tabs
  };

  if (!hasPromptNodes && prompts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No prompt nodes in canvas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate a prompt to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">
            Generated Prompts ({prompts.length})
          </h3>
        </div>
      </div>
      
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-3">
            {prompts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No prompts generated yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the "Generate Prompt" button on tool nodes
                </p>
              </div>
            ) : (
              prompts.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`p-3 cursor-pointer transition-all hover:shadow-sm hover:border-primary/50 ${
                      currentPrompt?.id === prompt.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleViewPrompt(prompt)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {prompt.context.tool.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {prompt.context.framework.name}
                          </Badge>
                          <ChevronRight className="w-2 h-2 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {prompt.context.stage.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {prompt.output && (
                          <CheckCircle className="w-3 h-3 text-success" />
                        )}
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Prompt Content Preview */}
                    <div className="bg-muted/30 p-2 rounded text-xs mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Prompt Content</span>
                      </div>
                      <div className="max-h-20 overflow-y-auto">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                          {prompt.content.length > 200 ? `${prompt.content.substring(0, 200)}...` : prompt.content}
                        </pre>
                      </div>
                      {prompt.content.length > 200 && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          +{prompt.content.length - 200} more characters
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(prompt.timestamp).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          title="Copy prompt to clipboard"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(prompt);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          title="Execute prompt with AI"
                          disabled={isGenerating}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecutePrompt(prompt.id);
                          }}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}