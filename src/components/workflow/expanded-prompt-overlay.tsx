import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, Bot, Copy, Download, Eye, Minimize2, Send, MessageSquare, 
  Edit3, Save, X, BookmarkPlus, MoreHorizontal, RefreshCw, 
  ChevronLeft, ChevronRight, Loader2, User, Sparkles,
  Settings, Menu, PanelRightClose, PanelRightOpen, History, Clock,
  Target, Truck, Key, Play
} from 'lucide-react';
import { GeneratedPrompt, ConversationMessage, usePromptStore } from '@/stores/prompt-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { supabase } from '@/integrations/supabase/client';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getFrameworkColors, getFrameworkTailwindClasses } from '@/lib/framework-colors';
import { cn } from '@/lib/utils';
import { DestinationSelector } from './destination-selector';
import { DestinationType, DestinationContext } from '@/lib/destination-driven-tailoring';
import { DeliveryDashboard } from '@/components/delivery/delivery-dashboard';
import { OAuthConnectionManager } from '@/components/delivery/oauth-connection-manager';
import { formatForChatDisplay } from '@/lib/text-formatting';

interface SavedPromptVersion {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  conversation: ConversationMessage[];
  isActive?: boolean;
}

interface ExpandedPromptOverlayProps {
  prompt: GeneratedPrompt;
  sourceToolName?: string;
  onContract: () => void;
  onCopy: () => void;
  onView: () => void;
}

function ExpandedPromptOverlayComponent({ 
  prompt, 
  sourceToolName, 
  onContract, 
  onCopy, 
  onView 
}: ExpandedPromptOverlayProps) {
  const { 
    updatePromptConversation,
    clearDestination,
    tailorPromptForDestination
  } = usePromptStore();
  const { entries } = useKnowledgeStore();
  const { currentProject } = useProjectStore();
  const { expandedPromptId } = useWorkflowStore();
  
  // Get framework colors for theming
  const frameworkColors = getFrameworkColors(prompt.context.framework.id || 'design-thinking');
  const frameworkClasses = getFrameworkTailwindClasses(prompt.context.framework.id || 'design-thinking', 'framework');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastConversationLengthRef = useRef<number>(0);
  
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPromptPanel, setShowPromptPanel] = useState(true);
  
  // Prompt editing state
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPromptContent, setEditedPromptContent] = useState(prompt.content);
  const [currentPromptContent, setCurrentPromptContent] = useState(prompt.content);
  
  // Memoize truncated prompt content to prevent re-calculation on every render
  const displayPromptContent = useMemo(() => {
    return currentPromptContent.length > 200 
      ? `${currentPromptContent.slice(0, 200)}...`
      : currentPromptContent;
  }, [currentPromptContent]);

  // Saved prompt versions state
  const [savedPromptVersions, setSavedPromptVersions] = useState<SavedPromptVersion[]>([
    {
      id: 'original',
      title: 'Original Prompt',
      content: prompt.content,
      timestamp: new Date(prompt.timestamp),
      conversation: conversationMessages,
      isActive: true
    }
  ]);
  const [activeVersionId, setActiveVersionId] = useState('original');
  const [showDestinationSidebar, setShowDestinationSidebar] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [showDeliveryDashboard, setShowDeliveryDashboard] = useState(false);
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  
  // Multi-bubble selection state
  const [selectedBubbles, setSelectedBubbles] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  
  // Multi-bubble selection handlers
  const handleBubbleSelect = useCallback((messageId: string) => {
    setSelectedBubbles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(messageId)) {
        newSelection.delete(messageId);
      } else {
        newSelection.add(messageId);
      }
      
      // Enable selection mode when first bubble is selected
      if (newSelection.size > 0 && !isSelectionMode) {
        setIsSelectionMode(true);
      }
      // Disable selection mode when no bubbles are selected
      else if (newSelection.size === 0 && isSelectionMode) {
        setIsSelectionMode(false);
      }
      
      return newSelection;
    });
  }, [isSelectionMode]);
  
  const handleCopySelectedBubbles = useCallback(() => {
    const selectedMessages = conversationMessages.filter(msg => 
      selectedBubbles.has(msg.id) && msg.type === 'ai'
    );
    
    // Sort messages by timestamp to maintain chronological order
    selectedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const combinedContent = selectedMessages.map(msg => msg.content).join('\n\n');
    
    if (combinedContent.trim()) {
      navigator.clipboard.writeText(combinedContent);
      toast.success(`Copied ${selectedMessages.length} chat bubbles to clipboard`, {
        description: `${combinedContent.slice(0, 50)}${combinedContent.length > 50 ? '...' : ''}`
      });
      
      // Clear selection after copying
      setSelectedBubbles(new Set());
      setIsSelectionMode(false);
    }
  }, [selectedBubbles, conversationMessages]);
  
  const handleClearSelection = useCallback(() => {
    setSelectedBubbles(new Set());
    setIsSelectionMode(false);
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, scrollToBottom]);

  // Function to save conversation to database (memoized to prevent infinite loops)
  const saveConversationToDatabase = useCallback(async (messages: ConversationMessage[]) => {
    if (!messages.length || !prompt.id) {
      console.log('💾 Skipping conversation save: no messages or prompt ID', {
        messagesLength: messages.length,
        promptId: prompt.id
      });
      return;
    }
    
    console.log('💾 Saving conversation to database:', {
      promptId: prompt.id,
      messagesCount: messages.length,
      messageTypes: messages.map(m => m.type)
    });
    
    try {
      // Convert messages to serializable format for database storage
      const conversationData = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));

      console.log('💾 Conversation data to save:', conversationData.length, 'messages');

      // Use ai_response field directly since conversation_history column doesn't exist yet
      console.log('💾 Using ai_response field for conversation storage...');
      const conversationJson = JSON.stringify({
        type: 'conversation',
        messages: conversationData
      });

      const { error: saveError } = await supabase
        .from('prompts')
        .update({ 
          ai_response: conversationJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id);

      if (saveError) {
        console.error('💾 Failed to save conversation:', saveError);
        throw saveError;
      }

      console.log('💾 Conversation saved successfully to ai_response field');
    } catch (error) {
      console.error('💾 Failed to save conversation:', error);
    }
  }, [prompt.id]);

  // Function to save prompt version
  const savePromptVersion = useCallback(async () => {
    if (!currentProject || isSaving) return;
    
    setIsSaving(true);
    try {
      const versionTitle = `Version ${savedPromptVersions.length}`;
      const newVersion: SavedPromptVersion = {
        id: `version-${Date.now()}`,
        title: versionTitle,
        content: currentPromptContent,
        timestamp: new Date(),
        conversation: [...conversationMessages],
        isActive: false
      };

      // Add to saved versions
      setSavedPromptVersions(prev => {
        const updated = prev.map(v => ({ ...v, isActive: false }));
        return [...updated, { ...newVersion, isActive: true }];
      });
      
      setActiveVersionId(newVersion.id);

      // Create a library entry with the current prompt content
      const libraryPrompt = {
        title: versionTitle,
        content: currentPromptContent,
        framework: prompt.context.framework.name,
        stage: prompt.context.stage.name,
        tool: prompt.context.tool.name,
        variables: Object.keys(prompt.variables),
        description: `Saved version of ${prompt.context.tool.name} prompt`,
        project_id: currentProject.id,
        created_at: new Date().toISOString()
      };

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const promptData = {
        project_id: currentProject.id,
        user_id: user.id,
        framework_name: libraryPrompt.framework,
        stage_name: libraryPrompt.stage,
        tool_name: libraryPrompt.tool,
        prompt_content: libraryPrompt.content,
        variables: { 
          ...prompt.variables, 
          _isPromptVersion: true,
          _versionTitle: libraryPrompt.title,
          _versionDescription: libraryPrompt.description,
          _originalPromptId: prompt.id
        }
      };
      
      const { error } = await supabase
        .from('prompts')
        .insert(promptData);

      if (error) throw error;
      
      toast.success('Prompt version saved!', {
        description: `"${versionTitle}" has been saved and is now active`
      });
      
    } catch (error) {
      console.error('Failed to save prompt version:', error);
      toast.error('Failed to save prompt version', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentProject, currentPromptContent, prompt, isSaving, conversationMessages, savedPromptVersions]);

  // Function to switch to a different prompt version
  const switchToVersion = useCallback((versionId: string) => {
    const version = savedPromptVersions.find(v => v.id === versionId);
    if (!version) return;

    // Update active version
    setSavedPromptVersions(prev => 
      prev.map(v => ({ ...v, isActive: v.id === versionId }))
    );
    setActiveVersionId(versionId);

    // Update prompt content and conversation
    setCurrentPromptContent(version.content);
    setEditedPromptContent(version.content);
    setConversationMessages(version.conversation);

    toast.success(`Switched to ${version.title}`, {
      description: 'Chat history and prompt content updated'
    });
  }, [savedPromptVersions]);

  const handleClearDestination = useCallback(() => {
    clearDestination(prompt.id);
    toast.success('Destination cleared', {
      description: 'Prompt is now in default format'
    });
  }, [prompt.id, clearDestination]);

  const handleShowDestinationSelector = useCallback(() => {
    setShowDestinationSidebar(true);
  }, []);

  const handleDestinationSelect = useCallback(async (destinationContext: DestinationContext) => {
    setIsTailoring(true);
    
    try {
      console.log('🚀 Starting tailoring process for:', destinationContext);
      const result = await tailorPromptForDestination(prompt.id, destinationContext);
      console.log('📋 Tailoring result:', result);
      
      if (result.success) {
        // Wait a bit longer and try multiple times to get the updated prompt
        let attempts = 0;
        const maxAttempts = 5;
        
        const checkForUpdatedPrompt = async () => {
          attempts++;
          console.log(`🔄 Attempt ${attempts}: Checking for updated prompt`);
          
          // Get fresh prompt data directly from store
          const storeState = usePromptStore.getState();
          const updatedPrompt = storeState.prompts.find(p => p.id === prompt.id);
          console.log('🎯 Updated prompt:', updatedPrompt);
          console.log('🎯 Destination data:', updatedPrompt?.destination);
          
          if (updatedPrompt?.destination?.tailoredPrompt || attempts >= maxAttempts) {
            // We have the tailored prompt or we've tried enough times
            const tailoredPromptToUse = updatedPrompt?.destination?.tailoredPrompt;
            console.log('🎯 Tailored prompt to use:', tailoredPromptToUse?.substring(0, 100));
            
            if (tailoredPromptToUse) {
              console.log('✅ Starting AI conversation with tailored prompt');
              // Show typing indicator
            const typingIndicator: ConversationMessage = {
              id: 'tailoring-typing',
              type: 'ai',
              content: '...',
              timestamp: new Date()
            };
            
            setConversationMessages(prev => [...prev, typingIndicator]);
            
            try {
              // Call AI with the tailored prompt to get a real detailed response
              console.log('🤖 Calling supabase AI function...');
              const { data, error } = await supabase.functions.invoke('ai-conversation', {
                body: {
                  userMessage: tailoredPromptToUse,
                  initialPrompt: prompt.content, // Original prompt as context
                  conversationHistory: [], // Start fresh for tailored response
                  projectId: currentProject?.id,
                  knowledgeContext: entries.filter(entry => entry.project_id === currentProject?.id),
                  promptContext: {
                    framework: prompt.context.framework.name,
                    stage: prompt.context.stage.name,
                    tool: prompt.context.tool.name,
                    industry: prompt.industry,
                    destination: destinationContext.destination,
                    userIntent: destinationContext.userIntent
                  }
                }
              });

              console.log('🤖 AI function response:', { data, error });
              
              // Remove typing indicator
              setConversationMessages(prev => prev.filter(msg => msg.id !== 'tailoring-typing'));

              if (error) {
                console.error('🚨 AI function error:', error);
                throw new Error(error.message || 'AI response failed');
              }

              console.log('✅ AI response received, creating analyzed message bubbles...');
              
              // Create single AI response message
              const tailoredResponseMessage: ConversationMessage = {
                id: `tailored-response-${Date.now()}`,
                type: 'ai',
                content: data.response,
                timestamp: new Date()
              };
              
              setConversationMessages(prev => [...prev, tailoredResponseMessage]);
              
              console.log('💬 Tailored Response:', {
                length: data.response.length
              });
              
            } catch (aiError) {
              console.error('AI response failed:', aiError);
              
              // Remove typing indicator
              setConversationMessages(prev => prev.filter(msg => msg.id !== 'tailoring-typing'));
              
              // Show error message and retry prompt
              toast.error('Failed to generate tailored response', {
                description: 'Please try again or check your connection'
              });
            }
          } else {
            // If no tailored prompt available, show error
            toast.error('Tailoring data not available', {
              description: 'Please try the tailoring process again'
            });
          }
            
            // Auto-scroll to show the new message
            setTimeout(scrollToBottom, 100);
          } else if (attempts < maxAttempts) {
            // Try again after a short delay
            setTimeout(checkForUpdatedPrompt, 300);
          } else {
            // Max attempts reached, show error
            toast.error('Failed to retrieve tailored prompt', {
              description: 'Please try the tailoring process again'
            });
          }
        };
        
        // Start checking for updated prompt
        setTimeout(checkForUpdatedPrompt, 200);
        
        toast.success(`Generating tailored response for ${destinationContext.destination}...`);
        setShowDestinationSidebar(false);
      } else {
        toast.error('Failed to tailor prompt for destination', {
          description: result.errors?.join(', ') || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Destination tailoring failed:', error);
      toast.error('Failed to tailor prompt for destination');
    } finally {
      setIsTailoring(false);
    }
  }, [prompt.id, prompt.content, tailorPromptForDestination, setConversationMessages, scrollToBottom, currentProject?.id, entries, prompt.context, prompt.industry]);

  const handleCancelDestinationSelection = useCallback(() => {
    setShowDestinationSidebar(false);
  }, []);

  // Sync conversation messages with the store and update active version (optimized)
  useEffect(() => {
    console.log('💬 Conversation effect triggered:', {
      currentLength: conversationMessages.length,
      lastLength: lastConversationLengthRef.current,
      promptId: prompt.id,
      hasMessages: conversationMessages.length > 0
    });
    
    // Only update if conversation has actually changed
    if (lastConversationLengthRef.current !== conversationMessages.length || 
        conversationMessages.length === 0) {
      console.log('💬 Conversation changed, updating store and saving...');
      lastConversationLengthRef.current = conversationMessages.length;
      
      updatePromptConversation(prompt.id, conversationMessages);
      
      // Update active version's conversation
      setSavedPromptVersions(prev => 
        prev.map(v => 
          v.isActive 
            ? { ...v, conversation: [...conversationMessages] }
            : v
        )
      );
      
      // Debounce database saves to prevent excessive calls
      if (conversationMessages.length > 0 && prompt.id) {
        console.log('💬 Setting up database save timer for', conversationMessages.length, 'messages');
        const saveTimer = setTimeout(() => {
          console.log('💬 Timer triggered, calling saveConversationToDatabase');
          saveConversationToDatabase(conversationMessages);
        }, 1000); // Wait 1 second before saving
        
        return () => clearTimeout(saveTimer);
      } else {
        console.log('💬 Skipping database save: no messages or prompt ID');
      }
    } else {
      console.log('💬 No conversation changes detected, skipping save');
    }
  }, [conversationMessages, prompt.id, updatePromptConversation, saveConversationToDatabase]);

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
    setIsTyping(true);
    
    // Show typing indicator immediately
    const typingIndicator: ConversationMessage = {
      id: 'typing-indicator',
      type: 'ai',
      content: '...',
      timestamp: new Date()
    };
    
    setConversationMessages(prev => [...prev, typingIndicator]);
    
    try {
      // Call the AI conversation function
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          userMessage: userMessage.content,
          initialPrompt: currentPromptContent,
          conversationHistory: conversationMessages.filter(msg => msg.id !== 'initial'), // Exclude initial message
          projectId: currentProject?.id,
          knowledgeContext: entries.filter(entry => entry.project_id === currentProject?.id),
          frameworkContext: {
            framework: prompt.context.framework.name,
            stage: prompt.context.stage.name,
            tool: prompt.context.tool.name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate AI response');
      }

      // Remove typing indicator
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      
      // Create single AI response message
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, aiMessage]);
      
      console.log('💬 Follow-up Response:', {
        length: data.response.length
      });
    } catch (error) {
      console.error('Error generating follow-up response:', error);
      
      // Remove typing indicator
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      
      // Fallback error message
      const errorMessage: ConversationMessage = {
        id: `ai-error-${Date.now()}`,
        type: 'ai',
        content: `I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };
  
  const handleRegenerateMessage = async (messageId: string) => {
    const messageIndex = conversationMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    const userMessage = conversationMessages[messageIndex - 1];
    if (!userMessage || userMessage.type !== 'user') return;
    
    // Remove the AI message and regenerate
    setConversationMessages(prev => prev.filter(msg => msg.id !== messageId));
    setIsGenerating(true);
    
    // Add typing indicator
    const typingIndicator: ConversationMessage = {
      id: 'typing-indicator',
      type: 'ai',
      content: '...',
      timestamp: new Date()
    };
    
    setConversationMessages(prev => [...prev, typingIndicator]);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          userMessage: userMessage.content,
          initialPrompt: currentPromptContent,
          conversationHistory: conversationMessages.slice(0, messageIndex - 1),
          projectId: currentProject?.id,
          knowledgeContext: entries.filter(entry => entry.project_id === currentProject?.id),
          frameworkContext: {
            framework: prompt.context.framework.name,
            stage: prompt.context.stage.name,
            tool: prompt.context.tool.name
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to regenerate response');

      // Remove typing indicator
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      
      // Create single regenerated AI response
      const aiMessage: ConversationMessage = {
        id: `ai-regen-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      // Replace the message being regenerated
      setConversationMessages(prev => 
        prev.map(msg => msg.id === messageId ? aiMessage : msg)
      );
      
      console.log('💬 Regenerated Response:', {
        length: data.response.length
      });
    } catch (error) {
      console.error('Error regenerating message:', error);
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      toast.error('Failed to regenerate response', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  // Function to detect if a message contains actionable content that can be used as a prompt
  const isGeneratedPrompt = (content: string): boolean => {
    // Don't show button for very short messages or typing indicators
    if (content.length < 50 || content.trim() === '...' || content.includes('...')) {
      return false;
    }
    
    // Don't show for error messages
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('error') && lowerContent.includes('apologize')) {
      return false;
    }
    
    // Don't show for simple system/context messages
    if (content.includes("I've updated my context") || 
        content.includes("context change") ||
        lowerContent.includes("i don't") ||
        lowerContent.includes("i can't") ||
        lowerContent.includes("i cannot")) {
      return false;
    }
    
    // Show button for most substantial AI responses
    // This is more permissive - users can decide what they want to use as a prompt
    
    // Always show for content that looks like instructions or structured content
    const hasStructure = 
      content.includes('1.') || 
      content.includes('2.') || 
      content.includes('3.') ||
      content.includes('•') ||
      content.includes('*') ||
      content.includes('-') ||
      content.includes('#') ||
      content.includes('**') ||
      content.split('\n').length > 2; // Multi-line content
    
    // Show for substantial content (let users decide if they want to use it as a prompt)
    const isSubstantial = content.length > 100;
    
    // Show for most content except very basic responses
    const isBasicResponse = 
      lowerContent.includes('yes') && content.length < 100 ||
      lowerContent.includes('no') && content.length < 100 ||
      lowerContent.includes('okay') && content.length < 100 ||
      lowerContent.includes('sure') && content.length < 100;
    
    return (hasStructure || isSubstantial) && !isBasicResponse;
  };

  // Function to handle "Use Prompt" button click
  const handleUsePrompt = async (promptContent: string) => {
    if (!promptContent.trim() || isGenerating) return;
    
    const userMessage: ConversationMessage = {
      id: `prompt-execution-${Date.now()}`,
      type: 'user',
      content: promptContent, // Show the full prompt content that will be executed
      timestamp: new Date()
    };
    
    setConversationMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setIsTyping(true);
    
    // Show typing indicator immediately
    const typingIndicator: ConversationMessage = {
      id: 'typing-indicator',
      type: 'ai',
      content: '...',
      timestamp: new Date()
    };
    
    setConversationMessages(prev => [...prev, typingIndicator]);
    
    try {
      // Call the AI conversation function with the AI-generated content as a completely new prompt
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          userMessage: promptContent, // Use the AI-generated content as the new user prompt
          initialPrompt: "", // No initial prompt context - treat this as a brand new conversation
          conversationHistory: [], // Completely fresh start
          projectId: currentProject?.id,
          knowledgeContext: entries.filter(entry => entry.project_id === currentProject?.id),
          frameworkContext: {
            framework: prompt.context.framework.name,
            stage: prompt.context.stage.name,
            tool: prompt.context.tool.name
          },
          executeAsNewPrompt: true // Flag to indicate this should be treated as executing a new prompt
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to execute prompt');
      }

      // Remove typing indicator
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      
      // Create AI response message with the full response (no cropping)
      const aiMessage: ConversationMessage = {
        id: `ai-execution-response-${Date.now()}`,
        type: 'ai',
        content: data.response, // Full AI response without any cropping
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, aiMessage]);
      
      console.log('💬 Prompt Execution Response:', {
        originalPromptLength: promptContent.length,
        responseLength: data.response.length
      });
      
      toast.success('Prompt executed successfully!', {
        description: 'AI has executed the prompt and provided a new response'
      });
      
    } catch (error) {
      console.error('Error executing prompt:', error);
      
      // Remove typing indicator
      setConversationMessages(prev => prev.filter(msg => msg.id !== 'typing-indicator'));
      
      // Fallback error message
      const errorMessage: ConversationMessage = {
        id: `ai-error-${Date.now()}`,
        type: 'ai',
        content: `I apologize, but I encountered an error while executing the prompt. Please try again or modify the prompt.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setConversationMessages(prev => [...prev, errorMessage]);
      
      toast.error('Failed to execute prompt', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const handleEditPrompt = () => {
    setIsEditingPrompt(true);
    setEditedPromptContent(currentPromptContent);
  };

  const handleSavePrompt = () => {
    setCurrentPromptContent(editedPromptContent);
    setIsEditingPrompt(false);
    
    // Update the active version with the new content
    setSavedPromptVersions(prev => 
      prev.map(v => 
        v.isActive 
          ? { ...v, content: editedPromptContent, timestamp: new Date() }
          : v
      )
    );
    
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onContract();
    }
  };

  // Handle escape key and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onContract();
      }
      // Focus input on any key press (except special keys)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Ensure proper cleanup
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [onContract]);

  // Additional cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Use setTimeout to allow React to complete its own cleanup first
      setTimeout(() => {
        // Force cleanup on unmount
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        // Only remove orphaned backdrops (not managed by React)
        const existingBackdrops = document.querySelectorAll('[data-modal="expanded-prompt-overlay"]');
        existingBackdrops.forEach(backdrop => {
          // Check if the backdrop is actually orphaned (not connected to React fiber)
          if (!backdrop.closest('[data-react-root]') && backdrop.parentElement === document.body) {
            backdrop.remove();
          }
        });
      }, 0);
    };
  }, []);
  
  // Handle input submission
  const handleInputSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFollowUp();
    }
  };
  
  // Message component for better reusability (memoized to prevent re-renders)
  const MessageBubble = memo(({ message }: { message: ConversationMessage }) => {
    const isUser = message.type === 'user';
    const isTyping = message.content === '...' && message.id === 'typing-indicator';
    const isSelected = selectedBubbles.has(message.id);
    const canBeSelected = message.type === 'ai' && !isTyping;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "group flex gap-3 py-4 px-6 transition-all duration-200",
          isUser ? "justify-end" : "justify-start",
          canBeSelected && "hover:bg-muted/30 cursor-pointer",
          isSelected && "bg-primary/10 border-l-4 border-primary"
        )}
        onClick={canBeSelected ? () => handleBubbleSelect(message.id) : undefined}
      >
        {!isUser && (
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              frameworkClasses[0]
            )}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            {canBeSelected && (
              <div className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            )}
          </div>
        )}
        
        <div className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          {isTyping ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {formatForChatDisplay(message.content)}
                </pre>
              </div>
              
              {/* Message Actions */}
              <div className={cn(
                "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
                isUser ? "justify-start" : "justify-end"
              )}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyMessage(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Use Prompt Button for Generated Prompts */}
                {!isUser && isGeneratedPrompt(message.content) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUsePrompt(message.content)}
                          disabled={isGenerating}
                          className="h-6 w-6 p-0"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Use this prompt</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {!isUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegenerateMessage(message.id)}
                          disabled={isGenerating}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Regenerate response</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </motion.div>
    );
  });

  const overlay = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 bg-background/95 backdrop-blur-sm"
      data-modal="expanded-prompt-overlay"
      style={{
        top: '86px', // Precise height for Index/Library pages (p-6 = 24px*2 + ~48px content)
        left: '0px', // No sidebar offset since sidebar is hidden
        width: '100vw', // Full width
        height: 'calc(100vh - 86px)', // Account for header height
      }}
      onClick={handleBackdropClick}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex bg-background">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div 
              className={cn(
                "flex items-center justify-between p-4 border-b",
                frameworkClasses[0].replace('bg-', 'border-')
              )}
              style={{
                background: `linear-gradient(135deg, ${frameworkColors.background.primary} 0%, ${frameworkColors.background.secondary} 100%)`
              }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  frameworkClasses[0]
                )}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-white">
                    AI Chat Assistant
                  </h3>
                  <p className="text-sm text-white/80">
                    {prompt.context.framework.name} • {prompt.context.stage.name} • {prompt.context.tool.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Framework Context Badges */}
                <div className="hidden md:flex items-center gap-2">
                  <Badge variant="glass-dark">
                    {prompt.context.framework.name}
                  </Badge>
                  <Badge variant="glass-dark">
                    {prompt.context.stage.name}
                  </Badge>
                  <Badge variant="glass-dark">
                    {prompt.context.tool.name}
                  </Badge>
                </div>
                
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                {/* Toggle Prompt Panel */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPromptPanel(!showPromptPanel)}
                        className="text-white hover:bg-white/20"
                      >
                        {showPromptPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showPromptPanel ? 'Hide' : 'Show'} prompt versions
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Close Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onContract}
                  className="text-white hover:bg-white/20"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex min-h-0">

              {/* Chat Messages Area */}
              <div className={cn(
                "flex flex-col min-h-0 transition-all duration-300",
                showPromptPanel ? "flex-1" : "w-full"
              )}>
                {/* Messages Container */}
                <ScrollArea className="flex-1 px-0">
                  <div className="min-h-full flex flex-col justify-end">
                    {conversationMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full py-20">
                        <div className="text-center text-muted-foreground max-w-md">
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                            frameworkClasses[1]
                          )}>
                            <Bot className={cn("w-8 h-8", frameworkClasses[2])} />
                          </div>
                          <h4 className="font-semibold mb-2">Ready to chat!</h4>
                          <p className="text-sm leading-relaxed">
                            Your {prompt.context.tool.name} prompt is ready. Start a conversation to refine and improve it.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFollowUpInput("Can you make this more detailed?")}
                              className="text-xs"
                            >
                              Make it more detailed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFollowUpInput("Simplify this for beginners")}
                              className="text-xs"
                            >
                              Simplify for beginners
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFollowUpInput("Add more examples")}
                              className="text-xs"
                            >
                              Add examples
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {/* Initial Prompt Message */}
                        {!conversationMessages.some(msg => msg.id === 'initial') && (
                          <div className="bg-muted/50 border-b px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                frameworkClasses[0]
                              )}>
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-sm">Initial Prompt</span>
                                  <Badge variant="outline" className="text-xs">
                                    {prompt.context.tool.name}
                                  </Badge>
                                </div>
                                <div className="bg-background rounded-lg p-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                  {formatForChatDisplay(displayPromptContent)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Chat Messages */}
                        {conversationMessages.map((message) => (
                          <MessageBubble key={message.id} message={message} />
                        ))}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Floating Copy Button for Selected Bubbles */}
                <AnimatePresence>
                  {selectedBubbles.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <div className="bg-background border rounded-lg shadow-lg p-2 flex items-center gap-2">
                        <div className="text-sm text-muted-foreground px-2">
                          {selectedBubbles.size} bubble{selectedBubbles.size > 1 ? 's' : ''} selected
                        </div>
                        <Button
                          size="sm"
                          onClick={handleCopySelectedBubbles}
                          className={cn("h-8", frameworkClasses[0])}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy All
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearSelection}
                          className="h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                
                {/* Chat Input */}
                <div className="p-4 border-t bg-background">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Ask AI to refine, expand, or modify the prompt..."
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={handleInputSubmit}
                        disabled={isGenerating}
                        className="min-h-[44px] text-sm resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendFollowUp}
                      disabled={!followUpInput.trim() || isGenerating}
                      className={cn("h-11 w-11 p-0", frameworkClasses[0])}
                      title="Send message"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {/* Choose Destination Button */}
                      <Button
                        size="sm"
                        variant={prompt.destination ? "default" : "ghost"}
                        onClick={handleShowDestinationSelector}
                        disabled={isTailoring}
                        className="text-xs"
                      >
                        {isTailoring ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Target className="w-3 h-3 mr-1" />
                        )}
                        {prompt.destination 
                          ? `${prompt.destination.type}` 
                          : 'Choose Destination'
                        }
                      </Button>
                      
                      {/* Clear Destination Button (when tailored) */}
                      {prompt.destination && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearDestination}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      )}
                      
                      
                      {/* Delivery Dashboard Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDeliveryDashboard(true)}
                        className="text-xs"
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        Deliver
                      </Button>
                      
                      {/* Connection Manager Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowConnectionManager(true)}
                        className="text-xs"
                      >
                        <Key className="w-3 h-3 mr-1" />
                        Connections
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={savePromptVersion}
                        disabled={isSaving}
                        className="text-xs"
                      >
                        <BookmarkPlus className="w-3 h-3 mr-1" />
                        {isSaving ? 'Saving...' : 'Save Version'}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Press Enter to send • Shift+Enter for new line
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prompt Versions Panel */}
              <AnimatePresence>
                {showPromptPanel && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '400px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-l bg-muted/50 flex flex-col min-h-0"
                  >
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Prompt Versions</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {savedPromptVersions.length}
                        </Badge>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {savedPromptVersions.map((version) => (
                          <Card 
                            key={version.id}
                            className={cn(
                              "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                              version.isActive 
                                ? "ring-2 ring-offset-2 border-2" 
                                : "hover:border-muted-foreground/30"
                            )}
                            style={{
                              backgroundColor: version.isActive ? frameworkColors.background.tertiary : 'transparent',
                              borderColor: version.isActive ? frameworkColors.border.primary : undefined,
                              ...(version.isActive && {
                                '--tw-ring-color': frameworkColors.border.primary,
                                '--tw-ring-offset-shadow': `0 0 0 2px ${frameworkColors.background.tertiary}`,
                                '--tw-ring-shadow': `0 0 0 calc(2px + 2px) ${frameworkColors.border.primary}`
                              })
                            }}
                            onClick={() => switchToVersion(version.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: version.isActive ? frameworkColors.background.primary : '#94a3b8'
                                  }}
                                />
                                <span 
                                  className="font-medium text-sm"
                                  style={{ color: version.isActive ? frameworkColors.text.secondary : undefined }}
                                >
                                  {version.title}
                                </span>
                              </div>
                              {version.isActive && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: frameworkColors.background.primary,
                                    color: frameworkColors.text.primary
                                  }}
                                >
                                  Active
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{version.timestamp.toLocaleString()}</span>
                              {version.conversation.length > 0 && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{version.conversation.length} messages</span>
                                </>
                              )}
                            </div>
                            
                            <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {version.content.length > 120 
                                ? `${version.content.slice(0, 120)}...`
                                : version.content
                              }
                            </div>
                            
                            {version.isActive && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                {isEditingPrompt ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelEdit();
                                      }}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSavePrompt();
                                      }}
                                      className="h-6 px-2 text-xs"
                                      style={{
                                        backgroundColor: frameworkColors.background.primary,
                                        color: frameworkColors.text.primary
                                      }}
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPrompt();
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                        
                        {/* Edit Area for Active Version */}
                        {isEditingPrompt && (
                          <Card className="p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">Edit Active Prompt</span>
                            </div>
                            <Textarea
                              value={editedPromptContent}
                              onChange={(e) => setEditedPromptContent(e.target.value)}
                              className="w-full min-h-[200px] resize-none text-sm font-mono leading-relaxed"
                              placeholder="Edit your prompt content..."
                            />
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Right Sidebar for Destination Selector */}
          <AnimatePresence>
            {showDestinationSidebar && (
              <motion.div
                initial={{ x: 384, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 384, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute right-0 top-0 w-96 h-full bg-background border-l border-border shadow-xl z-[51]"
              >
                <div className="h-full flex flex-col">
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Choose Destination
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelDestinationSelection}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optimize this prompt for your target platform
                    </p>
                  </div>
                  
                  {/* Destination Selector Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <DestinationSelector
                      onDestinationSelect={handleDestinationSelect}
                      onCancel={handleCancelDestinationSelection}
                      defaultContext={{
                        originalPrompt: prompt.content,
                        variables: prompt.variables,
                        metadata: {
                          framework: prompt.context.framework.name,
                          stage: prompt.context.stage.name,
                          tool: prompt.context.tool.name,
                          industry: prompt.industry,
                          teamSize: prompt.context.enhancedContext?.teamSize,
                          timeConstraints: prompt.context.enhancedContext?.timeConstraints,
                          experience: prompt.context.enhancedContext?.experience
                        }
                      }}
                      isLoading={isTailoring}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Delivery Dashboard */}
      <AnimatePresence>
        {showDeliveryDashboard && (
          <DeliveryDashboard
            prompt={prompt}
            isOpen={showDeliveryDashboard}
            onClose={() => setShowDeliveryDashboard(false)}
          />
        )}
      </AnimatePresence>
      
      {/* OAuth Connection Manager */}
      <AnimatePresence>
        {showConnectionManager && (
          <OAuthConnectionManager
            isOpen={showConnectionManager}
            onClose={() => setShowConnectionManager(false)}
            projectId={currentProject?.id}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );

  return createPortal(overlay, document.body);
}

export const ExpandedPromptOverlay = memo(ExpandedPromptOverlayComponent);