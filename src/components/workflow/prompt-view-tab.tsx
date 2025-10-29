import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, FileText, BookOpen } from 'lucide-react';
import { GeneratedPrompt } from '@/stores/prompt-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PromptViewTabProps {
  prompt: GeneratedPrompt;
  className?: string;
}

export function PromptViewTab({ prompt, className }: PromptViewTabProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('AI Prompt copied to clipboard');
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">AI-Generated Prompt</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This is the meta-prompt that was generated to create your deliverable
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            <Copy className="w-3 h-3 mr-2" />
            Copy Prompt
          </Button>
        </div>

        {/* Context Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            {prompt.context.framework.name}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {prompt.context.stage.name}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {prompt.context.tool.name}
          </Badge>
        </div>
      </div>

      {/* Prompt Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
              {prompt.content}
            </pre>
          </div>

          {/* Metadata Section */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm mb-3">Prompt Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Length:</dt>
                <dd className="font-medium">{prompt.content.length} characters</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Words:</dt>
                <dd className="font-medium">{prompt.content.split(/\s+/).length} words</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Generated:</dt>
                <dd className="font-medium">{new Date(prompt.timestamp).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
