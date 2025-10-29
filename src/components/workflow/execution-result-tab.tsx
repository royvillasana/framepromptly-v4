import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { GeneratedPrompt } from '@/stores/prompt-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatForChatDisplay } from '@/lib/text-formatting';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProjectStore } from '@/stores/project-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';

interface ExecutionResultTabProps {
  prompt: GeneratedPrompt;
  className?: string;
  onRetrySuccess?: (result: string) => void;
}

export function ExecutionResultTab({ prompt, className, onRetrySuccess }: ExecutionResultTabProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { currentProject } = useProjectStore();
  const { entries } = useKnowledgeStore();

  const hasError = !!prompt.executionError;
  const hasResult = !!prompt.executionResult;
  const resultContent = prompt.executionResult || prompt.output || '';

  const handleCopy = () => {
    const contentToCopy = hasResult ? resultContent : prompt.executionError || '';
    navigator.clipboard.writeText(contentToCopy);
    toast.success(hasResult ? 'Result copied to clipboard' : 'Error message copied to clipboard');
  };

  const handleRetry = async () => {
    if (!currentProject) return;

    setIsRetrying(true);
    try {
      const knowledgeData = entries
        .filter(entry => entry.project_id === currentProject.id)
        .map(entry => ({ id: entry.id, title: entry.title, content: entry.content }));

      const executionResponse = await supabase.functions.invoke('ai-conversation', {
        body: {
          userMessage: prompt.content,
          initialPrompt: '',
          conversationHistory: [],
          projectId: currentProject.id,
          knowledgeContext: knowledgeData,
          frameworkContext: {
            framework: prompt.context.framework.name,
            stage: prompt.context.stage.name,
            tool: prompt.context.tool.name
          },
          executeAsNewPrompt: true
        }
      });

      if (executionResponse.error) {
        throw new Error(executionResponse.error.message || 'Execution failed');
      }

      if (!executionResponse.data?.success) {
        throw new Error(executionResponse.data?.error || 'Failed to execute prompt');
      }

      const newResult = executionResponse.data.response;
      toast.success('Prompt executed successfully!');

      // Call the callback to update the parent component
      if (onRetrySuccess) {
        onRetrySuccess(newResult);
      }

    } catch (error) {
      console.error('Retry failed:', error);
      toast.error('Failed to execute prompt', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
              <h3 className="font-semibold text-lg">
                {hasError ? 'Execution Failed' : 'Execution Result'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasError
                ? 'An error occurred while executing the prompt'
                : 'The AI-generated deliverable based on your prompt'
              }
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {hasError && (
              <Button
                size="sm"
                variant="default"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Retry
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
            >
              <Copy className="w-3 h-3 mr-2" />
              Copy
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-2 mt-3">
          {hasError ? (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Execution Error
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Successfully Generated
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {hasError ? (
          // Error Display
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-destructive mb-1">Error Details</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {prompt.executionError}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-2">What you can do:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Click the "Retry" button to attempt execution again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Check your internet connection and API credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>View the prompt in the "AI Prompt" tab to verify it's correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Try regenerating the prompt with different settings</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Success Display
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="bg-background rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {formatForChatDisplay(resultContent)}
              </pre>
            </div>

            {/* Metadata Section */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-sm mb-3">Result Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Length:</dt>
                  <dd className="font-medium">{resultContent.length} characters</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Words:</dt>
                  <dd className="font-medium">{resultContent.split(/\s+/).length} words</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Generated:</dt>
                  <dd className="font-medium">{new Date(prompt.timestamp).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
