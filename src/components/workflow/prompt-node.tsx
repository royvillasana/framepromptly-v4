import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Copy, Download, Sparkles, Bot, Expand, Database, Edit3 } from 'lucide-react';
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
  const navigate = useNavigate();
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

  const handleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Expanding prompt node:', prompt.id);
    setExpandedPromptId(prompt.id);
  };

  const handleContract = () => {
    console.log('Contracting prompt node:', prompt.id);
    setExpandedPromptId(null);
  };

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
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

    const toolName = prompt.context?.tool?.name || prompt.context?.customPrompt?.title || 'Custom Prompt';
    const frameworkName = prompt.context?.framework?.name || 'N/A';
    const stageName = prompt.context?.stage?.name || 'N/A';

    const exportContent = latestAIResponse
      ? `Generated Prompt for ${toolName}\n` +
        `Framework: ${frameworkName}\n` +
        `Stage: ${stageName}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n` +
        knowledgeBaseLine + `\n` +
        `GENERATED PROMPT:\n${'-'.repeat(50)}\n${displayPromptContent}\n\n` +
        `AI RESPONSE:\n${'-'.repeat(50)}\n${latestAIResponse}`
      : `Generated Prompt for ${toolName}\n` +
        `Framework: ${frameworkName}\n` +
        `Stage: ${stageName}\n` +
        `Generated: ${new Date(prompt.timestamp).toLocaleString()}\n` +
        knowledgeBaseLine + `\n` +
        `GENERATED PROMPT:\n${'-'.repeat(50)}\n${displayPromptContent}`;

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${toolName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditInLibrary = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (prompt.structured_prompt_id) {
      try {
        // Navigate to library editor with the structured prompt ID
        navigate(`/library/${prompt.structured_prompt_id}`);
        toast({
          title: "Opening in Library",
          description: "Edit your prompt with card-based sections."
        });
      } catch (error) {
        console.error('Navigation error:', error);
        toast({
          title: "Navigation Failed",
          description: "Could not open the library editor. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // No structured version available
      toast({
        title: "Not Available",
        description: "This prompt doesn't have a structured version yet. Only AI-generated prompts can be edited in the library.",
        variant: "destructive"
      });
    }
  };


  // Normal node state
  return (
    <>
      <ResizableNode 
        selected={selected}
        nodeType="prompt"
        initialWidth={1250}
        initialHeight="auto"
        minWidth={1250}
        maxWidth={1600}
        minHeight={300}
        maxHeight={600}
        nodeId={id}
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
        w-full p-6 transition-all duration-200 relative
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

        <div className="space-y-3 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between flex-shrink-0">
            <div className="flex-1 mr-10">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-6 h-6 text-success" />
                <h3 className="font-bold text-lg">AI Response</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sourceToolName || prompt.context?.tool?.name || prompt.context?.customPrompt?.title || 'Custom Prompt'}
                {prompt.context?.stage?.name && ` • ${prompt.context.stage.name}`}
                {prompt.timestamp && (
                  <span className="ml-2 text-xs opacity-70">
                    {new Date(prompt.timestamp).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Framework → Stage → Tool Info */}
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            {prompt.context?.framework?.name && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {prompt.context.framework.name}
              </Badge>
            )}
            {prompt.context?.stage?.name && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {prompt.context.stage.name}
              </Badge>
            )}
            {(prompt.context?.tool?.name || prompt.context?.customPrompt?.title) && (
              <Badge variant="default" className="text-sm px-3 py-1">
                {prompt.context?.tool?.name || prompt.context?.customPrompt?.title}
              </Badge>
            )}
            {hasKnowledgeBase && (
              <Badge variant="outline" className="text-sm px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
                <Database className="w-3 h-3 mr-1" />
                Knowledge Base
              </Badge>
            )}
          </div>

          {/* AI Output Section - Max Height 400px with Scrollbar */}
          {latestAIResponse ? (
            <div className="bg-success/10 border border-success/20 p-4 rounded text-sm space-y-3 flex flex-col max-h-96">
              <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                <Bot className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">AI Response</span>
                <Badge variant="default" className="text-sm bg-success px-3 py-1">
                  {prompt.conversation && prompt.conversation.length > 1 ? 'Updated' : 'Generated'}
                </Badge>
              </div>
              <div className="overflow-y-auto max-h-80">
                <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed p-2">
                  {formatForChatDisplay(latestAIResponse)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-muted/20 border border-dashed border-muted-foreground/30 p-4 rounded text-sm flex flex-col justify-center items-center max-h-96">
              <Bot className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <span className="text-muted-foreground">No AI response yet</span>
              <span className="text-xs text-muted-foreground/70 mt-1">Run the prompt to see AI output</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-3"
              title="Copy AI response"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>

            {prompt.structured_prompt_id && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditInLibrary}
                className="h-8 px-3 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                title="Edit in Library with card-based editor"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit in Library
              </Button>
            )}

            <NodeActionsMenu
              nodeId={id || ''}
              nodeType="prompt"
              nodeData={data}
              position={{ x: 0, y: 0 }}
            />
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