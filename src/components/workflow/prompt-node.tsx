import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FileText, Eye, Copy, Download } from 'lucide-react';
import { GeneratedPrompt } from '@/stores/prompt-store';
import { useToast } from '@/hooks/use-toast';
import { NodeActionsMenu } from './node-actions-menu';

interface PromptNodeData {
  prompt: GeneratedPrompt;
  isActive?: boolean;
}

interface PromptNodeProps {
  data: PromptNodeData;
  selected?: boolean;
}

export const PromptNode = memo(({ data, selected, id }: PromptNodeProps & { id?: string }) => {
  const { toast } = useToast();
  const { prompt, isActive } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Copied to clipboard",
      description: "Prompt content has been copied to your clipboard."
    });
  };

  const handleView = () => {
    // This would open the prompt panel or modal to view/edit the prompt
    console.log('View prompt:', prompt.id);
  };

  const handleExport = () => {
    const blob = new Blob([prompt.content], { type: 'text/plain' });
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
        w-96 p-4 transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        border-dashed border-2
      `}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Generated Prompt</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {prompt.context.tool.name} • {prompt.context.stage.name}
              </p>
            </div>
          </div>

          {/* Framework & Stage Info */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {prompt.context.framework.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {prompt.context.stage.name}
            </Badge>
          </div>

          {/* Content Preview */}
          <div className="bg-muted/50 p-2 rounded text-xs">
            <p className="line-clamp-3 text-muted-foreground">
              {prompt.content.substring(0, 120)}...
            </p>
          </div>

          {/* Status */}
          {prompt.output && (
            <Badge variant="default" className="text-xs bg-success">
              Executed
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleView}
              className="flex-1 h-7 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="w-7 h-7 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="w-7 h-7 p-0"
            >
              <Download className="w-3 h-3" />
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