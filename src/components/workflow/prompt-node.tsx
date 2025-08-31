import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Copy, Download, Sparkles, Bot, Expand, Database } from 'lucide-react';
import { GeneratedPrompt, usePromptStore } from '@/stores/prompt-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useToast } from '@/hooks/use-toast';
import { NodeActionsMenu } from './node-actions-menu';
import { DraggableHandle, useDraggableHandles } from './draggable-handle';
import { ResizableNode } from './resizable-node';
import { ExpandedPromptOverlay } from './expanded-prompt-overlay';
import { formatForChatDisplay } from '@/lib/text-formatting';

/**
 * Extracts only the generated prompt content, removing knowledge base context
 * for cleaner node display while preserving full content for expanded view
 */
const extractGeneratedPromptOnly = (fullPromptContent: string): string => {
  // Check if the prompt contains knowledge base context
  const knowledgeBaseStart = fullPromptContent.indexOf('=== PROJECT KNOWLEDGE BASE ===');
  const knowledgeBaseEnd = fullPromptContent.indexOf('=== END KNOWLEDGE BASE ===');
  
  if (knowledgeBaseStart !== -1 && knowledgeBaseEnd !== -1) {
    // Extract content after the knowledge base section
    const afterKnowledgeBase = fullPromptContent.substring(
      knowledgeBaseEnd + '=== END KNOWLEDGE BASE ==='.length
    );
    
    // Clean up the extracted content (remove leading/trailing whitespace and extra line breaks)
    return afterKnowledgeBase
      .replace(/^[\s\n]*Based on the above project knowledge, generate customized instructions for:[\s\n]*/, '') // Remove the bridge text
      .replace(/^[\s\n]+/, '') // Remove leading whitespace
      .trim();
  }
  
  // If no knowledge base context, return the full content
  return fullPromptContent;
};

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
  const { expandedPromptId, setExpandedPromptId } = useWorkflowStore();
  const { prompt, isActive, onSwitchToPromptTab, sourceToolName } = data;
  const { handlePositions, updateHandlePosition } = useDraggableHandles(id);
  
  // Get the latest AI response from conversation or fallback to original output
  const latestAIResponse = prompt.conversation && prompt.conversation.length > 0 
    ? prompt.conversation.filter(msg => msg.type === 'ai').pop()?.content 
    : prompt.output;
  
  // Extract only the generated prompt content (without knowledge base) for node display
  const displayPromptContent = extractGeneratedPromptOnly(prompt.content);
  const hasKnowledgeBase = prompt.content.includes('=== PROJECT KNOWLEDGE BASE ===');
  
  const isExpanded = expandedPromptId === prompt.id;

  const handleExpand = () => {
    console.log('Expanding prompt node:', prompt.id);
    setExpandedPromptId(prompt.id);
  };

  const handleContract = () => {
    console.log('Contracting prompt node:', prompt.id);
    setExpandedPromptId(null);
  };

  const handleCopy = () => {
    const contentToCopy = latestAIResponse || displayPromptContent;
    
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: "Copied to clipboard",
      description: latestAIResponse 
        ? "AI response has been copied to your clipboard."
        : "Generated prompt has been copied to your clipboard."
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
    const hasKnowledgeBase = prompt.content.includes('=== PROJECT KNOWLEDGE BASE ===');
    const knowledgeBaseLine = hasKnowledgeBase 
      ? `Knowledge Base: Included (project-specific context integrated)\n`
      : `Knowledge Base: None\n`;
    
    const exportContent = latestAIResponse 
      ? `Generated Prompt for ${prompt.context.tool.name}\n` +
        `Framework: ${prompt.context.framework.name}\n` +
        `Stage: ${prompt.context.stage.name}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n` +
        knowledgeBaseLine + `\n` +
        `GENERATED PROMPT:\n${'-'.repeat(50)}\n${displayPromptContent}\n\n` +
        `AI RESPONSE:\n${'-'.repeat(50)}\n${latestAIResponse}`
      : `Generated Prompt for ${prompt.context.tool.name}\n` +
        `Framework: ${prompt.context.framework.name}\n` +
        `Stage: ${prompt.context.stage.name}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n` +
        knowledgeBaseLine + `\n` +
        `GENERATED PROMPT:\n${'-'.repeat(50)}\n${displayPromptContent}`;
    
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


  // Normal node state
  return (
    <>
      <ResizableNode 
        selected={selected}
        nodeType="prompt"
      >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
      {/* Draggable Connection Handles */}
      <DraggableHandle
        id="target-1"
        type="target"
        initialPosition={handlePositions['target-1'] || 'left'}
        onPositionChange={(position) => updateHandlePosition('target-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="target-2"
        type="target"
        initialPosition={handlePositions['target-2'] || 'top'}
        onPositionChange={(position) => updateHandlePosition('target-2', position)}
        nodeId={id}
      />
      
      <Card className={`
      
        w-full h-full p-6 transition-all duration-200 relative
        ${selected ? 'ring-2 ring-primary shadow-lg border-2 border-primary' : 'hover:shadow-md'}
        ${isActive ? 'border-primary bg-primary/5' : ''}
        ${latestAIResponse ? 'border-solid border-success bg-gradient-to-br from-primary/5 to-success/5' : 'border-dashed border-2'}
        shadow-xl
      `}>
        {/* Expand Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExpand}
          className="absolute top-2 right-2 w-8 h-8 p-0 z-10"
          title="Expand to full screen"
        >
          <Expand className="w-4 h-4" />
        </Button>

        <div className="space-y-3 h-full flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-10">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">AI Generated Prompt</h3>
                {latestAIResponse && <Bot className="w-6 h-6 text-success" />}
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

          {/* Framework → Stage → Tool Info */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {prompt.context.framework.name}
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {prompt.context.stage.name}
            </Badge>
            <Badge variant="default" className="text-sm px-3 py-1">
              {prompt.context.tool.name}
            </Badge>
            {hasKnowledgeBase && (
              <Badge variant="outline" className="text-sm px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                <Database className="w-3 h-3 mr-1" />
                Knowledge Base
              </Badge>
            )}
          </div>

          {/* Content Preview */}
          <div className="bg-muted/50 p-4 rounded text-sm space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Generated Prompt</span>
              {hasKnowledgeBase && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  + Project Context
                </span>
              )}
            </div>
            <div className="flex-1">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed p-2">
                {formatForChatDisplay(displayPromptContent)}
              </pre>
              {hasKnowledgeBase && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <Database className="w-3 h-3 inline mr-1" />
                  Full prompt with project knowledge base context available in expanded view
                </div>
              )}
            </div>
          </div>

          {/* AI Output Section */}
          {latestAIResponse && (
            <div className="bg-success/10 border border-success/20 p-4 rounded text-sm space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">AI Response</span>
                <Badge variant="default" className="text-sm bg-success px-3 py-1">
                  {prompt.conversation && prompt.conversation.length > 1 ? 'Updated' : 'Generated'}
                </Badge>
              </div>
              <div className="flex-1">
                <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed p-2">
                  {formatForChatDisplay(latestAIResponse)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Primary action row */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleView}
                className="flex-1 h-8 text-xs"
                title="View full prompt details"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 px-3"
                title="Copy prompt and response"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            
            {/* Secondary action row */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                className="flex-1 h-8 text-xs"
                title="Export as file"
              >
                <Download className="w-3 h-3 mr-1" />
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
        </div>
      </Card>

      <DraggableHandle
        id="source-1"
        type="source"
        initialPosition={handlePositions['source-1'] || 'right'}
        onPositionChange={(position) => updateHandlePosition('source-1', position)}
        nodeId={id}
      />
      <DraggableHandle
        id="source-2"
        type="source"
        initialPosition={handlePositions['source-2'] || 'bottom'}
        onPositionChange={(position) => updateHandlePosition('source-2', position)}
        nodeId={id}
      />
    </motion.div>
    </ResizableNode>
    
    {/* Render overlay when expanded - outside the node to prevent re-renders */}
    {isExpanded && (
      <ExpandedPromptOverlay
        prompt={prompt}
        sourceToolName={sourceToolName}
        onContract={handleContract}
        onCopy={handleCopy}
        onView={handleView}
      />
    )}
    </>
  );
});