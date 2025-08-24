import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Bot, Copy, Download, Eye, Minimize2, Send, MessageSquare, Edit3, Save, X } from 'lucide-react';
import { GeneratedPrompt, ConversationMessage, usePromptStore } from '@/stores/prompt-store';
import { createPortal } from 'react-dom';

interface ExpandedPromptOverlayProps {
  prompt: GeneratedPrompt;
  sourceToolName?: string;
  onContract: () => void;
  onCopy: () => void;
  onView: () => void;
  onExport: () => void;
}

export function ExpandedPromptOverlay({ 
  prompt, 
  sourceToolName, 
  onContract, 
  onCopy, 
  onView, 
  onExport 
}: ExpandedPromptOverlayProps) {
  const { updatePromptConversation, addConversationMessage } = usePromptStore();
  
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>(() => {
    // Initialize from stored conversation or create initial message
    if (prompt.conversation && prompt.conversation.length > 0) {
      return prompt.conversation;
    } else if (prompt.output) {
      return [{
        id: 'initial',
        type: 'ai',
        content: prompt.output,
        timestamp: new Date(prompt.timestamp)
      }];
    }
    return [];
  });
  
  const [followUpInput, setFollowUpInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync conversation messages with the store
  useEffect(() => {
    updatePromptConversation(prompt.id, conversationMessages);
  }, [conversationMessages, prompt.id, updatePromptConversation]);
  
  // Prompt editing state
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPromptContent, setEditedPromptContent] = useState(prompt.content);
  const [currentPromptContent, setCurrentPromptContent] = useState(prompt.content);

  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || isGenerating) return;
    
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: followUpInput,
      timestamp: new Date()
    };
    
    setConversationMessages(prev => [...prev, userMessage]);
    setFollowUpInput('');
    setIsGenerating(true);
    
    try {
      // TODO: Integrate with actual AI service
      // For now, simulate AI response using the current prompt context
      setTimeout(() => {
        const aiMessage: ConversationMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `Based on your request: "${userMessage.content}" and using the current prompt context, here's my response:\n\n[Context: ${currentPromptContent.substring(0, 100)}...]\n\nI've processed your follow-up request in the context of the current prompt. This would be the actual AI response that takes into account both the original prompt and your modification request.`,
          timestamp: new Date()
        };
        
        setConversationMessages(prev => [...prev, aiMessage]);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating follow-up response:', error);
      setIsGenerating(false);
    }
  };

  const handleEditPrompt = () => {
    setIsEditingPrompt(true);
    setEditedPromptContent(currentPromptContent);
  };

  const handleSavePrompt = () => {
    setCurrentPromptContent(editedPromptContent);
    setIsEditingPrompt(false);
    
    // Clear conversation and show updated context message
    setConversationMessages([]);
    
    // Add a system message about the context change
    const contextChangeMessage: ConversationMessage = {
      id: `context-${Date.now()}`,
      type: 'ai',
      content: `I've updated my context with your edited prompt. The new prompt context is now active for our conversation. Feel free to ask me questions or request modifications based on this updated context.`,
      timestamp: new Date()
    };
    
    setTimeout(() => {
      setConversationMessages([contextChangeMessage]);
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditedPromptContent(currentPromptContent);
    setIsEditingPrompt(false);
  };

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm"
      style={{
        top: '48px', // Header height
        left: '320px', // Sidebar width
        width: 'calc(100vw - 320px)',
        height: 'calc(100vh - 48px)',
      }}
    >
      <div className="w-full h-full p-4">
        <Card className="shadow-2xl border-none h-full w-full">
          <div className="h-full flex flex-col">
            {/* Expanded Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 text-primary">✨</span>
                  <h3 className="font-bold text-xl">AI Generated Prompt</h3>
                  {prompt.output && <Bot className="w-6 h-6 text-success" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {sourceToolName || prompt.context.tool.name} • {prompt.context.stage.name}
                  {prompt.timestamp && (
                    <span className="ml-2 text-xs opacity-70">
                      {new Date(prompt.timestamp).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onContract}
                className="ml-4"
                title="Contract to normal size"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Contract
              </Button>
            </div>

            {/* Expanded Content */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              {/* Framework → Stage → Tool Info */}
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {prompt.context.framework.name}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {prompt.context.stage.name}
                </Badge>
                <Badge variant="default" className="text-sm px-3 py-1">
                  {prompt.context.tool.name}
                </Badge>
              </div>

              {/* Side-by-Side Layout - 60% AI Conversation, 40% Prompt Context */}
              <div className="flex-1 flex gap-6 min-h-0 mb-6">
                {/* Left Side - AI Conversation - 60% */}
                <div className="w-[60%] bg-success/10 border border-success/20 p-4 rounded text-sm flex flex-col min-h-0">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-4 h-4 text-success" />
                    <span className="font-semibold text-success">AI Conversation</span>
                    <Badge variant="default" className="text-sm bg-success px-3 py-1">
                      Interactive
                    </Badge>
                  </div>
                  
                  {/* Conversation Messages */}
                  <div className="flex-1 overflow-y-auto min-h-0 mb-3 space-y-3">
                    {conversationMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">No AI Response Yet</p>
                          <p className="text-xs mt-1">Generate a prompt to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      conversationMessages.map((message) => (
                        <div key={message.id} className={`p-3 rounded ${
                          message.type === 'ai' 
                            ? 'bg-background/50 border-l-2 border-success' 
                            : 'bg-primary/10 border-l-2 border-primary ml-4'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {message.type === 'ai' ? (
                              <Bot className="w-3 h-3 text-success" />
                            ) : (
                              <span className="w-3 h-3 rounded-full bg-primary" />
                            )}
                            <span className="text-xs font-medium">
                              {message.type === 'ai' ? 'AI Assistant' : 'You'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <pre className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </pre>
                        </div>
                      ))
                    )}
                    
                    {isGenerating && (
                      <div className="p-3 rounded bg-background/50 border-l-2 border-success">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-3 h-3 text-success animate-pulse" />
                          <span className="text-xs font-medium">AI Assistant</span>
                          <span className="text-xs text-muted-foreground">thinking...</span>
                        </div>
                        <div className="text-sm text-muted-foreground animate-pulse">
                          Generating response...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Follow-up Input */}
                  <div className="flex gap-2 mt-auto">
                    <Input
                      placeholder="Ask AI to modify the response..."
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
                      disabled={isGenerating}
                      className="flex-1 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendFollowUp}
                      disabled={!followUpInput.trim() || isGenerating}
                      className="px-3"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Right Side - Prompt Content - 40% */}
                <div className="w-[40%] bg-muted/50 p-4 rounded text-sm flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-muted-foreground">Prompt Content</span>
                    </div>
                    <div className="flex gap-2">
                      {isEditingPrompt ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSavePrompt}
                            className="h-6 px-2 text-xs"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditPrompt}
                          className="h-6 px-2 text-xs"
                          title="Edit prompt content"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {isEditingPrompt ? (
                      <Textarea
                        value={editedPromptContent}
                        onChange={(e) => setEditedPromptContent(e.target.value)}
                        className="w-full h-full resize-none border-none p-0 text-sm font-mono leading-relaxed bg-transparent focus:ring-0"
                        placeholder="Edit your prompt content..."
                      />
                    ) : (
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {currentPromptContent}
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Actions */}
              <div className="flex items-center gap-3 pt-4 border-t flex-shrink-0">
                <Button
                  size="default"
                  variant="outline"
                  onClick={onView}
                  className="h-10 text-sm"
                  title="View full prompt details"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                
                <Button
                  size="default"
                  variant="outline"
                  onClick={onCopy}
                  className="h-10 px-4"
                  title="Copy prompt and response"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>

                <Button
                  size="default"
                  variant="outline"
                  onClick={onExport}
                  className="h-10 px-4"
                  title="Export as file"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}