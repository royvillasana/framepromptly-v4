import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Copy, 
  Download, 
  Edit, 
  Sparkles, 
  ChevronRight,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { usePromptStore } from '@/stores/prompt-store';
import { toast } from 'sonner';

export function PromptPanel() {
  const { 
    currentPrompt, 
    prompts, 
    isGenerating,
    updatePromptVariables, 
    executePrompt,
    setCurrentPrompt
  } = usePromptStore();
  
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);

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

  if (!currentPrompt && prompts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex items-center justify-center"
      >
        <div className="text-center p-8">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Prompts Generated</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Connect workflow nodes and click "Generate Prompt" to start creating AI prompts
          </p>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            View History
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">AI Prompt Generator</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <FileText className="w-4 h-4 mr-1" />
              History ({prompts.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r border-border overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-medium mb-3">Prompt History</h3>
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
                      <Card
                        key={prompt.id}
                        className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
                          currentPrompt?.id === prompt.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setCurrentPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {prompt.context.tool.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {prompt.context.stage.name} • {prompt.context.framework.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {prompt.output && (
                              <CheckCircle className="w-3 h-3 text-success" />
                            )}
                            <Clock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(prompt.timestamp).toLocaleString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {currentPrompt ? (
            <>
              {/* Context Info */}
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{currentPrompt.context.framework.name}</Badge>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline">{currentPrompt.context.stage.name}</Badge>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="default">{currentPrompt.context.tool.name}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentPrompt.context.tool.description}
                </p>
              </div>

              {/* Variables Section */}
              {extractVariables(currentPrompt.content).length > 0 && (
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium mb-3">Customize Variables</h3>
                  <div className="grid gap-3 max-h-40 overflow-y-auto">
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
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Generated Prompt</h3>
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
                
                <ScrollArea className="h-64 mb-4">
                  <div className="p-3 bg-muted/50 rounded-md border">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {currentPrompt.content}
                    </pre>
                  </div>
                </ScrollArea>

                {/* Output Section */}
                {currentPrompt.output && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">AI Output</h3>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                    <ScrollArea className="h-48">
                      <div className="p-3 bg-card rounded-md border">
                        <div className="text-sm whitespace-pre-wrap">
                          {currentPrompt.output}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Prompt</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a prompt from the history to view and edit
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}