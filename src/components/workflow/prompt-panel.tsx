import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Eye,
  ArrowLeft,
  Download
} from 'lucide-react';
import { usePromptStore } from '@/stores/prompt-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

export function PromptPanel() {
  const { prompts, currentPrompt, setCurrentPrompt, executePrompt, isGenerating, updatePromptVariables } = usePromptStore();
  const { nodes } = useWorkflowStore();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [variables, setVariables] = useState<Record<string, string>>({});

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
    setViewMode('detail');
    // Initialize variables from prompt
    setVariables(prompt.variables || {});
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentPrompt(null);
  };

  const handleVariableChange = (key: string, value: string) => {
    const newVariables = { ...variables, [key]: value };
    setVariables(newVariables);
    if (currentPrompt) {
      updatePromptVariables(currentPrompt.id, newVariables);
    }
  };

  const handleExecute = async () => {
    if (!currentPrompt) return;
    
    try {
      await executePrompt(currentPrompt.id);
      toast.success('Prompt executed successfully!');
    } catch (error) {
      toast.error('Failed to execute prompt');
    }
  };

  const handleCopy = () => {
    if (!currentPrompt) return;
    
    let content = currentPrompt.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard');
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{(\w+)}}/g);
    return matches ? matches.map(match => match.slice(2, -2)) : [];
  };

  // Detail view
  if (viewMode === 'detail' && currentPrompt) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with back button */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBackToList}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-sm">Prompt Details</h3>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Context Info */}
            <div className="p-3 border border-border bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 text-sm mb-2">
                <Badge variant="outline">{currentPrompt.context.framework.name}</Badge>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <Badge variant="outline">{currentPrompt.context.stage.name}</Badge>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <Badge variant="default">{currentPrompt.context.tool.name}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(currentPrompt.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Variables Section */}
            {extractVariables(currentPrompt.content).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Customize Variables</h4>
                <div className="grid gap-3">
                  {extractVariables(currentPrompt.content).map((variable) => (
                    <div key={variable} className="space-y-1">
                      <Label className="text-xs capitalize">
                        {variable.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        placeholder={`Enter ${variable}`}
                        value={variables[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Generated Prompt</h4>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleExecute}
                    disabled={isGenerating}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {isGenerating ? 'Generating...' : 'Execute'}
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-md border max-h-64 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {currentPrompt.content}
                </pre>
              </div>
            </div>

            {/* Output Section */}
            {currentPrompt.output && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">AI Output</h4>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="p-3 bg-card rounded-md border max-h-48 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap">
                    {currentPrompt.output}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // List view
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
                    className="p-3 cursor-pointer transition-all hover:shadow-sm hover:border-primary/50"
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

                    {/* Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {prompt.content.substring(0, 100)}...
                    </p>

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