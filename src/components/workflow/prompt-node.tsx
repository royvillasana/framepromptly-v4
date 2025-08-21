import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FileText, Eye, Copy, Download, Sparkles, Bot } from 'lucide-react';
import { GeneratedPrompt, usePromptStore } from '@/stores/prompt-store';
import { useToast } from '@/hooks/use-toast';
import { NodeActionsMenu } from './node-actions-menu';

interface PromptNodeData {
  prompt: GeneratedPrompt;
  isActive?: boolean;
  sourceToolId?: string;
  sourceToolName?: string;
}

interface PromptNodeProps {
  data: PromptNodeData;
  selected?: boolean;
  onSwitchToPromptTab?: () => void;
}

export const PromptNode = memo(({ data, selected, id }: PromptNodeProps & { id?: string }) => {
  const { toast } = useToast();
  const { setCurrentPrompt } = usePromptStore();
  const { prompt, isActive, onSwitchToPromptTab, sourceToolName } = data;

  const handleCopy = () => {
    const contentToCopy = prompt.output 
      ? `Prompt:\n${prompt.content}\n\nAI Response:\n${prompt.output}`
      : prompt.content;
    
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: "Copied to clipboard",
      description: prompt.output 
        ? "Prompt and AI response have been copied to your clipboard."
        : "Prompt content has been copied to your clipboard."
    });
  };

  const handleView = () => {
    // Set this prompt as current and switch to prompt tab
    setCurrentPrompt(prompt);
    if (onSwitchToPromptTab) {
      onSwitchToPromptTab();
    }
  };

  const handleExport = () => {
    const exportContent = prompt.output 
      ? `Generated Prompt for ${prompt.context.tool.name}\n` +
        `Framework: ${prompt.context.framework.name}\n` +
        `Stage: ${prompt.context.stage.name}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n\n` +
        `PROMPT:\n${'-'.repeat(50)}\n${prompt.content}\n\n` +
        `AI RESPONSE:\n${'-'.repeat(50)}\n${prompt.output}`
      : `Generated Prompt for ${prompt.context.tool.name}\n` +
        `Framework: ${prompt.context.framework.name}\n` +
        `Stage: ${prompt.context.stage.name}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n\n` +
        `PROMPT:\n${'-'.repeat(50)}\n${prompt.content}`;
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${prompt.context.tool.name}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Connection Handles - 4 points */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <Card className={`
        w-[800px] p-6 transition-all duration-200
        ${selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        ${prompt.output ? 'border-solid border-success bg-gradient-to-br from-primary/5 to-success/5' : 'border-dashed border-2'}
        shadow-xl
      `}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">AI Generated Prompt</h3>
                {prompt.output && <Bot className="w-6 h-6 text-success" />}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sourceToolName || prompt.context.tool.name} • {prompt.context.stage.name}
                {prompt.timestamp && (
                  <span className="ml-2 text-xs opacity-70">
                    {new Date(prompt.timestamp).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Framework & Stage Info */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {prompt.context.framework.name}
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {prompt.context.stage.name}
            </Badge>
          </div>

          {/* Content Preview */}
          <div className="bg-muted/50 p-4 rounded text-sm space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Prompt Content</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </div>

          {/* AI Output Section */}
          {prompt.output && (
            <div className="bg-success/10 border border-success/20 p-4 rounded text-sm space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">AI Response</span>
                <Badge variant="default" className="text-sm bg-success px-3 py-1">
                  Generated
                </Badge>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {prompt.output}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              size="default"
              variant="outline"
              onClick={handleView}
              className="flex-1 h-10 text-sm"
              title="View full prompt details"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            <Button
              size="default"
              variant="outline"
              onClick={handleCopy}
              className="h-10 px-4"
              title="Copy prompt and response"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>

            <Button
              size="default"
              variant="outline"
              onClick={handleExport}
              className="h-10 px-4"
              title="Export as file"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <NodeActionsMenu
              nodeId={id || ''}
              nodeType="prompt"
              nodeData={data}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </motion.div>
  );
});