/**
 * @fileoverview PromptPreviewPanel - Preview compiled prompt
 * Shows the full compiled prompt text with copy functionality
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Copy, Play, Code, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StructuredPrompt } from '@/types/structured-prompt';
import { compileSectionsToPrompt, countWords, estimateReadingTime } from '@/lib/structured-prompt-helpers';
import { toast } from 'sonner';

interface PromptPreviewPanelProps {
  prompt: StructuredPrompt | null;
  compiledPrompt?: string;
  onExecute?: () => void;
  className?: string;
  showMetadata?: boolean;
}

export function PromptPreviewPanel({
  prompt,
  compiledPrompt: externalCompiledPrompt,
  onExecute,
  className,
  showMetadata = true,
}: PromptPreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  if (!prompt && !externalCompiledPrompt) {
    return (
      <Card className={cn('border-2 border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Eye className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No prompt to preview
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get compiled prompt - use external if provided, otherwise compile from sections
  const compiledPrompt = externalCompiledPrompt ||
    (prompt ? compileSectionsToPrompt({
      role_section: prompt.role_section,
      context_section: prompt.context_section,
      task_section: prompt.task_section,
      constraints_section: prompt.constraints_section,
      format_section: prompt.format_section,
      examples_section: prompt.examples_section,
    }) : '');

  const wordCount = countWords(compiledPrompt);
  const readingTime = estimateReadingTime(compiledPrompt);
  const charCount = compiledPrompt.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute();
    } else {
      toast.info('Execution not configured');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Compiled Prompt Preview</CardTitle>
                <CardDescription>
                  Full prompt text ready for execution
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
              >
                {viewMode === 'formatted' ? (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Raw
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Formatted
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>

              {onExecute && (
                <Button
                  size="sm"
                  onClick={handleExecute}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Prompt
                </Button>
              )}
            </div>
          </div>

          {/* Metadata */}
          {showMetadata && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <Badge variant="secondary" className="text-xs">
                {wordCount} words
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {charCount} characters
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ~{readingTime} min read
              </Badge>
              {prompt?.run_count && prompt.run_count > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  Executed {prompt.run_count}x
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-50">
            <div className="p-4">
              {viewMode === 'formatted' ? (
                <div className="prose prose-sm max-w-none">
                  {compiledPrompt.split('\n\n---\n\n').map((section, idx) => {
                    // Parse section header
                    const lines = section.split('\n');
                    const firstLine = lines[0];
                    const isH1 = firstLine.startsWith('# ');
                    const isH2 = firstLine.startsWith('## ');

                    if (isH1 || isH2) {
                      const title = firstLine.replace(/^#+\s+/, '');
                      const content = lines.slice(1).join('\n');

                      return (
                        <div key={idx} className="mb-6 pb-6 border-b last:border-b-0">
                          <h3 className={cn(
                            'font-semibold mb-3',
                            isH1 ? 'text-lg text-purple-700' : 'text-md text-blue-700'
                          )}>
                            {title}
                          </h3>
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-white p-3 rounded border">
                            {content.trim()}
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="mb-6 pb-6 border-b last:border-b-0">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-white p-3 rounded border">
                          {section.trim()}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre className="font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {compiledPrompt}
                </pre>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
