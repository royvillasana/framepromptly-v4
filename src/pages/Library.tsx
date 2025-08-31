import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Navigation } from '@/components/ui/navigation';
import { BookmarkPlus, Search, Filter, Copy, Trash2, Edit, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandedPromptOverlay } from '@/components/workflow/expanded-prompt-overlay';
import { GeneratedPrompt } from '@/stores/prompt-store';
import type { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';

interface LibraryPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  framework: string;
  stage: string;
  tool: string;
  variables: string[];
  created_at: string;
  updated_at: string;
  ai_response?: string;
  isVersion?: boolean;
  versionTitle?: string;
  originalPromptId?: string;
}

export default function Library() {
  const [libraryPrompts, setLibraryPrompts] = useState<LibraryPrompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<LibraryPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [showVersionsOnly, setShowVersionsOnly] = useState<boolean>(false);
  const [expandedPrompt, setExpandedPrompt] = useState<GeneratedPrompt | null>(null);

  const loadLibraryPrompts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Load prompts that are marked as library prompts
      const { data, error } = await supabase
        .from('prompts')
        .select('*, ai_response')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter and transform library prompts and prompt versions
      console.log('All prompts loaded:', data?.length || 0);
      const libraryData: LibraryPrompt[] = (data || [])
        .filter(prompt => {
          const variables = prompt.variables as any;
          const isLibraryPrompt = variables && variables._isLibraryPrompt === true;
          const isPromptVersion = variables && variables._isPromptVersion === true;
          if (isLibraryPrompt || isPromptVersion) {
            console.log('Found library prompt or version:', prompt.tool_name, variables);
          }
          return isLibraryPrompt || isPromptVersion;
        })
        .map(prompt => {
          const variables = prompt.variables as any;
          const isPromptVersion = variables && variables._isPromptVersion === true;
          
          return {
            id: prompt.id,
            title: isPromptVersion 
              ? (variables._versionTitle || `Version - ${prompt.tool_name}`)
              : (variables._libraryTitle || `${prompt.tool_name} - ${prompt.stage_name}`),
            description: isPromptVersion 
              ? (variables._versionDescription || `Prompt version for ${prompt.tool_name}`)
              : (variables._libraryDescription || `Generated prompt for ${prompt.tool_name}`),
            content: prompt.prompt_content,
            framework: prompt.framework_name,
            stage: prompt.stage_name,
            tool: prompt.tool_name,
            variables: Object.keys(variables).filter(key => !key.startsWith('_')),
            created_at: prompt.created_at,
            updated_at: prompt.updated_at,
            ai_response: prompt.ai_response,
            isVersion: isPromptVersion,
            versionTitle: variables._versionTitle,
            originalPromptId: variables._originalPromptId
          };
        });

      console.log('Library prompts found:', libraryData.length);
      setLibraryPrompts(libraryData);
      setFilteredPrompts(libraryData);
    } catch (error) {
      console.error('Error loading library prompts:', error);
      toast.error('Failed to load library prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryPrompts();
  }, []);

  // Filter prompts based on search query and filters
  useEffect(() => {
    let filtered = libraryPrompts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.framework.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Framework filter
    if (selectedFramework !== 'all') {
      filtered = filtered.filter(prompt => prompt.framework === selectedFramework);
    }

    // Stage filter
    if (selectedStage !== 'all') {
      filtered = filtered.filter(prompt => prompt.stage === selectedStage);
    }

    // Version filter
    if (showVersionsOnly) {
      filtered = filtered.filter(prompt => prompt.isVersion === true);
    }

    setFilteredPrompts(filtered);
  }, [searchQuery, selectedFramework, selectedStage, showVersionsOnly, libraryPrompts]);

  const handleCopyPrompt = (prompt: LibraryPrompt) => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard');
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt from your library?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      toast.success('Prompt deleted from library');
      loadLibraryPrompts(); // Reload the list
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  const uniqueFrameworks = [...new Set(libraryPrompts.map(p => p.framework))];
  const uniqueStages = [...new Set(libraryPrompts.map(p => p.stage))];

  // Convert LibraryPrompt to GeneratedPrompt format for the expanded overlay
  const convertToGeneratedPrompt = (libraryPrompt: LibraryPrompt): GeneratedPrompt => {
    let conversation: any[] = [];
    let output: string | undefined = undefined;

    // Parse AI response if it exists
    if (libraryPrompt.ai_response) {
      console.log('Raw AI response from library:', {
        type: typeof libraryPrompt.ai_response,
        sample: libraryPrompt.ai_response.substring(0, 200) + '...',
        isJSON: libraryPrompt.ai_response.trim().startsWith('{') || libraryPrompt.ai_response.trim().startsWith('[')
      });

      try {
        // Try parsing as JSON first (for structured conversation data)
        const parsedResponse = JSON.parse(libraryPrompt.ai_response);
        console.log('Parsed AI response structure:', {
          type: typeof parsedResponse,
          hasType: 'type' in parsedResponse,
          hasMessages: 'messages' in parsedResponse,
          keys: typeof parsedResponse === 'object' ? Object.keys(parsedResponse) : [],
          isArray: Array.isArray(parsedResponse)
        });
        
        if (parsedResponse.type === 'conversation' && Array.isArray(parsedResponse.messages)) {
          // Convert stored conversation back to ConversationMessage format
          conversation = parsedResponse.messages.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: msg.type || 'ai',
            content: msg.content || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          console.log('Converted conversation messages:', conversation.length);
        } else if (Array.isArray(parsedResponse)) {
          // If it's just an array of messages (alternative format)
          conversation = parsedResponse.map((msg: any, index: number) => ({
            id: msg.id || `msg-${Date.now()}-${index}`,
            type: msg.type || (index % 2 === 0 ? 'user' : 'ai'),
            content: msg.content || (typeof msg === 'string' ? msg : JSON.stringify(msg)),
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(Date.now() - (parsedResponse.length - index) * 1000)
          }));
          console.log('Converted array to conversation:', conversation.length);
        } else if (typeof parsedResponse === 'string') {
          // Simple string response
          output = parsedResponse;
          console.log('Using parsed string as output');
        } else if (parsedResponse && typeof parsedResponse === 'object') {
          // If it's an object but not a conversation, try to extract meaningful content
          if (parsedResponse.content) {
            output = parsedResponse.content;
          } else if (parsedResponse.response) {
            output = parsedResponse.response;
          } else if (parsedResponse.text) {
            output = parsedResponse.text;
          } else {
            output = JSON.stringify(parsedResponse, null, 2);
          }
          console.log('Using object content as output');
        }
      } catch (error) {
        // If parsing fails, treat as plain text output (most common case)
        output = libraryPrompt.ai_response;
        console.log('Using AI response as plain text output (parse error):', error);
      }
    }

    console.log('Converting library prompt to generated prompt:', {
      hasAiResponse: !!libraryPrompt.ai_response,
      hasConversation: conversation.length > 0,
      hasOutput: !!output,
      responseLength: libraryPrompt.ai_response?.length || 0,
      conversationSample: conversation.length > 0 ? conversation[0] : null
    });

    // If we have a conversation but no user message with the original prompt, add it
    // This ensures the conversation shows the full context when opened from library
    if (conversation.length > 0) {
      const hasOriginalPrompt = conversation.some(msg => 
        msg.type === 'user' && (
          msg.content === libraryPrompt.content ||
          msg.content.includes(libraryPrompt.content.substring(0, Math.min(50, libraryPrompt.content.length))) ||
          libraryPrompt.content.includes(msg.content.substring(0, Math.min(50, msg.content.length)))
        )
      );
      
      if (!hasOriginalPrompt) {
        const userMessage = {
          id: 'library-user-msg',
          type: 'user' as const,
          content: libraryPrompt.content,
          timestamp: new Date(libraryPrompt.created_at)
        };
        conversation.unshift(userMessage);
        console.log('Added original prompt as user message to conversation');
      } else {
        console.log('Original prompt already found in conversation');
      }
    }
    
    // If we have no conversation but have output, create a simple conversation
    if (conversation.length === 0 && output) {
      conversation = [
        {
          id: 'library-user-msg',
          type: 'user' as const,
          content: libraryPrompt.content,
          timestamp: new Date(libraryPrompt.created_at)
        },
        {
          id: 'library-ai-msg',
          type: 'ai' as const,
          content: output,
          timestamp: new Date(libraryPrompt.updated_at || libraryPrompt.created_at)
        }
      ];
      output = undefined; // Clear output since it's now in conversation
      console.log('Created conversation from output');
    }

    return {
      id: libraryPrompt.id,
      workflowId: 'library-prompt',
      projectId: 'library',
      content: libraryPrompt.content,
      context: {
        framework: { 
          id: libraryPrompt.framework.toLowerCase().replace(/\s+/g, '-'), 
          name: libraryPrompt.framework 
        } as UXFramework,
        stage: { 
          id: libraryPrompt.stage.toLowerCase().replace(/\s+/g, '-'), 
          name: libraryPrompt.stage 
        } as UXStage,
        tool: { 
          id: libraryPrompt.tool.toLowerCase().replace(/\s+/g, '-'), 
          name: libraryPrompt.tool 
        } as UXTool,
      },
      variables: libraryPrompt.variables.reduce((acc, variable) => {
        acc[variable] = '';
        return acc;
      }, {} as Record<string, string>),
      timestamp: new Date(libraryPrompt.created_at).getTime(),
      conversation: conversation.length > 0 ? conversation : undefined,
      output: output
    };
  };

  const handleExpandPrompt = (libraryPrompt: LibraryPrompt) => {
    const generatedPrompt = convertToGeneratedPrompt(libraryPrompt);
    setExpandedPrompt(generatedPrompt);
  };

  const handleContractPrompt = () => {
    setExpandedPrompt(null);
  };

  const handleCopyFromExpanded = () => {
    if (expandedPrompt) {
      navigator.clipboard.writeText(expandedPrompt.content);
      toast.success('Prompt copied to clipboard');
    }
  };

  const handleViewFromExpanded = () => {
    // Could implement a detailed view modal here
    toast.info('View details functionality');
  };

  const handleExportFromExpanded = () => {
    if (expandedPrompt) {
      const dataStr = JSON.stringify(expandedPrompt, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-${expandedPrompt.context.tool.name}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Prompt exported successfully');
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 p-6 overflow-hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto h-full flex flex-col"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <BookmarkPlus className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Prompt Library</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLibraryPrompts}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <p className="text-muted-foreground">
              Manage and reuse your saved prompts across different projects and workflows.
            </p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {uniqueFrameworks.map(framework => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {uniqueStages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Version filter checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-versions" 
                  checked={showVersionsOnly}
                  onCheckedChange={(checked) => setShowVersionsOnly(checked as boolean)}
                />
                <label 
                  htmlFor="show-versions" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show versions only
                </label>
              </div>
            </div>
          </Card>

          {/* Prompts Grid */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your prompt library...</p>
                </div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookmarkPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedFramework !== 'all' || selectedStage !== 'all' 
                      ? 'Try adjusting your search criteria'
                      : 'Save prompts from the workflow builder to see them here'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full w-full">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6 px-1">
                  {filteredPrompts.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => handleExpandPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">
                                {prompt.title}
                              </h3>
                              {prompt.isVersion && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                  Version
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {prompt.description}
                            </p>
                          </div>
                          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                        </div>

                        {/* Framework, Stage, Tool badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {prompt.framework}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {prompt.stage}
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            {prompt.tool}
                          </Badge>
                        </div>

                        {/* Content preview */}
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted/50 p-2 rounded">
                            {prompt.content}
                          </p>
                        </div>

                        {/* Variables */}
                        {prompt.variables.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-1">Variables:</p>
                            <div className="flex flex-wrap gap-1">
                              {prompt.variables.slice(0, 3).map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                              {prompt.variables.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prompt.variables.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-muted-foreground">
                            {new Date(prompt.created_at).toLocaleDateString()}
                          </span>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPrompt(prompt);
                              }}
                              className="h-8 w-8 p-0"
                              title="Copy prompt"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePrompt(prompt.id);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete prompt"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" className="w-3 border-l border-l-transparent p-[2px]" />
              </ScrollArea>
            )}
          </div>
        </motion.div>
      </div>

      {/* Expanded Prompt Overlay */}
      <AnimatePresence>
        {expandedPrompt && (
          <ExpandedPromptOverlay
            prompt={expandedPrompt}
            sourceToolName={expandedPrompt.context.tool.name}
            onContract={handleContractPrompt}
            onCopy={handleCopyFromExpanded}
            onView={handleViewFromExpanded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}