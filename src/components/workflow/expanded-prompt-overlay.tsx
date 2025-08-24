import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Bot, Copy, Download, Eye, Minimize2, Send, MessageSquare, Edit3, Save, X } from 'lucide-react';
import { GeneratedPrompt, ConversationMessage, usePromptStore } from '@/stores/prompt-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { supabase } from '@/integrations/supabase/client';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { entries } = useKnowledgeStore();
  const { currentProject } = useProjectStore();
  const { expandedPromptId } = useWorkflowStore();
  
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>(() => {
    // Initialize from stored conversation (loaded from database)
    if (prompt.conversation && prompt.conversation.length > 0) {
      console.log('Loading conversation from database:', prompt.conversation.length, 'messages');
      return prompt.conversation;
    } else if (prompt.output) {
      // Create initial message from existing AI response
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

  // Function to save conversation to database (memoized to prevent infinite loops)
  const saveConversationToDatabase = useCallback(async (messages: ConversationMessage[]) => {
    if (!messages.length || !prompt.id) return;
    
    try {
      // Convert messages to serializable format for database storage
      const conversationData = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));

      // Store conversation in ai_response field as JSON for now (until migration is applied)
      const conversationJson = JSON.stringify({
        type: 'conversation',
        messages: conversationData
      });

      const { error } = await supabase
        .from('prompts')
        .update({ 
          ai_response: conversationJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id);

      if (error) {
        console.error('Error saving conversation to database:', error);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [prompt.id]);

  // Sync conversation messages with the store and debounce database saves
  useEffect(() => {
    updatePromptConversation(prompt.id, conversationMessages);
    
    // Debounce database saves to prevent excessive calls
    if (conversationMessages.length > 0 && prompt.id) {
      const saveTimer = setTimeout(() => {
        saveConversationToDatabase(conversationMessages);
      }, 1000); // Wait 1 second before saving
      
      return () => clearTimeout(saveTimer);
    }
  }, [conversationMessages, prompt.id, updatePromptConversation, saveConversationToDatabase]);
  
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
      // Call the AI conversation function
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          userMessage: userMessage.content,
          initialPrompt: currentPromptContent,
          conversationHistory: conversationMessages.filter(msg => msg.id !== 'initial'), // Exclude initial message
          projectId: currentProject?.id,
          knowledgeContext: entries.filter(entry => entry.project_id === currentProject?.id)
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate AI response');
      }

      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating follow-up response:', error);
      
      // Fallback error message
      const errorMessage: ConversationMessage = {
        id: `ai-error-${Date.now()}`,
        type: 'ai',
        content: `I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, errorMessage]);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm"
      style={{
        top: '48px', // Header height
        left: '0px', // No sidebar offset since sidebar is hidden
        width: '100vw', // Full width
        height: 'calc(100vh - 48px)',
      }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Card className="shadow-2xl border-none h-full w-full rounded-none">
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
      </motion.div>
    </motion.div>
  );

  return createPortal(overlay, document.body);
}