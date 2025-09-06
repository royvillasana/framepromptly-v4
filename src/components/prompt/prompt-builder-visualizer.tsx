import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  User, 
  Target, 
  Settings, 
  Lightbulb, 
  FileText, 
  Eye, 
  Edit3,
  ChevronDown,
  ChevronUp,
  Copy,
  Play,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getEnhancedInstructions } from '@/lib/enhanced-tool-instructions';
import { supabase } from '@/integrations/supabase/client';

interface PromptSection {
  id: string;
  type: 'role' | 'context' | 'task' | 'constraints' | 'format' | 'examples';
  title: string;
  content: string;
  source: string;
  icon: React.ReactNode;
  color: string;
  editable: boolean;
}

interface PromptBuilderVisualizerProps {
  tool?: string;
  projectContext?: any;
  qualitySettings?: any;
  aiMethodSettings?: any;
  knowledgeContext?: string | null;
  onPromptGenerated?: (prompt: string) => void;
}

export function PromptBuilderVisualizer({
  tool = "User Interviews",
  projectContext = {},
  qualitySettings = {},
  aiMethodSettings = {},
  knowledgeContext = null,
  onPromptGenerated
}: PromptBuilderVisualizerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['role', 'context']);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingSections, setEditingSections] = useState<string[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isRunningPrompt, setIsRunningPrompt] = useState(false);
  const { toast } = useToast();

  // Generate prompt sections based on inputs
  const generatePromptSections = (): PromptSection[] => {
    const sections: PromptSection[] = [];

    // Role Section
    const isResearchTool = tool.toLowerCase().includes('interview') || 
                          tool.toLowerCase().includes('survey') || 
                          tool.toLowerCase().includes('study') || 
                          tool.toLowerCase().includes('research') ||
                          tool.toLowerCase().includes('testing') ||
                          tool.toLowerCase().includes('evaluation');
    
    sections.push({
      id: 'role',
      type: 'role',
      title: 'AI Role & Expertise',
      content: `You are an expert UX ${isResearchTool ? 'researcher' : 'designer'} with extensive experience in ${tool} methodology. You have deep knowledge of user-centered design principles and best practices.`,
      source: `Tool: ${tool}`,
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      editable: true
    });

    // Context Section - Include variables that will be replaced
    const contextContent = `Working on a project with the following context:

Target Audience: [target_audience]
Project Goals: [project_goals] 
Key Constraints: [constraints]
Success Metrics: [success_metrics]
Team Composition: [team_composition]
Timeline: [timeline]

Please tailor your response specifically for [target_audience] while keeping [constraints] in mind.`;

    sections.push({
      id: 'context',
      type: 'context',
      title: 'Project Context',
      content: contextContent,
      source: 'Project Settings → Context Tab (with variable replacement)',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      editable: true
    });

    // Task Section
    const taskDescription = getTaskDescription(tool);
    sections.push({
      id: 'task',
      type: 'task',
      title: 'Specific Task',
      content: taskDescription,
      source: `Tool: ${tool}`,
      icon: <Lightbulb className="w-4 h-4" />,
      color: 'bg-green-100 border-green-300 text-green-800',
      editable: true
    });

    // Quality Constraints Section
    const qualityParts = [];
    if (qualitySettings.methodologyDepth) {
      qualityParts.push(`Methodology Depth: ${qualitySettings.methodologyDepth}`);
    }
    if (qualitySettings.outputDetail) {
      qualityParts.push(`Output Detail Level: ${qualitySettings.outputDetail}`);
    }
    if (qualitySettings.timeConstraints) {
      qualityParts.push(`Time Constraints: ${qualitySettings.timeConstraints}`);
    }

    sections.push({
      id: 'constraints',
      type: 'constraints',
      title: 'Quality & Constraints',
      content: qualityParts.length > 0
        ? `Please ensure your response meets these quality standards:\n${qualityParts.join('\n')}`
        : 'Apply standard UX methodology practices.',
      source: 'Project Settings → Quality Tab',
      icon: <Settings className="w-4 h-4" />,
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      editable: true
    });

    // Format Section
    const formatInstructions = getFormatInstructions(aiMethodSettings);
    sections.push({
      id: 'format',
      type: 'format',
      title: 'Output Format',
      content: formatInstructions,
      source: 'AI Method Settings → Prompt Structure',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      editable: true
    });

    // Knowledge Context Section (if provided)
    if (knowledgeContext) {
      sections.push({
        id: 'knowledge',
        type: 'context',
        title: 'Knowledge Context',
        content: `Additional project knowledge has been provided:\n\n${knowledgeContext}\n\nPlease integrate this information into your recommendations and ensure your response is aligned with this context.`,
        source: 'Knowledge Base / Uploaded Document / Manual Input',
        icon: <FileText className="w-4 h-4" />,
        color: 'bg-violet-100 border-violet-300 text-violet-800',
        editable: true
      });
    }

    // Examples Section (if applicable)
    const examples = getExamples(tool);
    if (examples) {
      sections.push({
        id: 'examples',
        type: 'examples',
        title: 'Examples & Guidance',
        content: examples,
        source: `${tool} Best Practices`,
        icon: <Eye className="w-4 h-4" />,
        color: 'bg-teal-100 border-teal-300 text-teal-800',
        editable: true
      });
    }

    return sections;
  };

  const getTaskDescription = (tool: string): string => {
    // Convert tool name to a format that matches the enhanced instructions
    const normalizedTool = tool.toLowerCase()
      .replace(/\s+/g, '-')
      .replace('user-interview', 'user-interviews')
      .replace('persona-creation', 'personas')
      .replace('journey-mapping', 'journey-maps');

    // Get enhanced instructions for this tool
    const instructions = getEnhancedInstructions(normalizedTool, projectContext?.industry || 'general');
    
    if (instructions && instructions.length > 0) {
      // Use the first few core instructions as the task description
      const coreInstructions = instructions.slice(0, 3).join(' ');
      return `${tool} methodology: ${coreInstructions}

Focus on [target_audience] and ensure your recommendations align with [project_goals]. Consider [constraints] when making suggestions.`;
    }

    // Fallback to generic descriptions with comprehensive tool coverage
    const tasks: Record<string, string> = {
      // Research & Discovery
      'User Interviews': `Generate a comprehensive user interview guide for [target_audience]. Include opening questions, main inquiry areas, and follow-up prompts that will help gather deep insights about user needs, behaviors, and pain points related to [project_goals]. Consider [constraints] when designing the interview approach.`,
      'Surveys': `Design comprehensive user surveys using validated question formats for [target_audience]. Include appropriate scales, skip logic, and clear instructions to gather insights about [project_goals].`,
      'Field Studies': `Plan and conduct field studies to observe [target_audience] in their natural environment. Focus on understanding context, behaviors, and pain points related to [project_goals].`,
      'Competitive Analysis': `Conduct systematic competitive analysis to understand the market landscape and identify opportunities for [project_goals]. Compare features, user experience, and positioning.`,
      'Heuristic Evaluation': `Perform heuristic evaluation using established UX principles to identify usability issues and improvement opportunities for [target_audience].`,
      
      // Analysis & Synthesis
      'Affinity Mapping': `Apply systematic thematic analysis to organize qualitative research data into meaningful clusters and themes related to [project_goals].`,
      'Personas': `Create detailed user personas for [target_audience] based on research findings. Include demographic information, goals, frustrations, behaviors, and key quotes.`,
      'Journey Maps': `Develop comprehensive user journey maps that capture [target_audience] experience across all touchpoints. Focus on emotions, pain points, and opportunities for improvement.`,
      'Empathy Maps': `Create empathy maps that capture what [target_audience] thinks, feels, sees, says, hears, and does. Focus on emotional insights and user motivations.`,
      'User Stories': `Write clear, actionable user stories from the perspective of [target_audience] that support [project_goals]. Include acceptance criteria and priority levels.`,
      
      // Ideation & Design
      'How Might We': `Frame problems as innovation opportunities using structured "How might we..." questions that address [target_audience] needs and [project_goals].`,
      'Brainstorming': `Conduct structured ideation sessions using proven creative techniques to generate solutions for [target_audience] that align with [project_goals].`,
      'Sketching': `Create rapid sketches and wireframes to explore design solutions for [target_audience]. Focus on key user flows and interface concepts.`,
      'Prototyping': `Develop interactive prototypes to test design concepts with [target_audience]. Create realistic scenarios that demonstrate key functionality.`,
      'Storyboarding': `Create visual narratives that illustrate [target_audience] interactions and experiences. Show key moments in the user journey.`,
      
      // Validation & Testing
      'Usability Testing': `Design and conduct usability tests with [target_audience] to validate design decisions. Include measurable success criteria and clear testing protocols.`,
      'A/B Testing': `Plan A/B tests to compare design alternatives for [target_audience]. Define success metrics and statistical significance requirements.`,
      'Prototype Testing': `Test interactive prototypes with [target_audience] to validate design concepts and identify improvement opportunities.`,
      
      // Strategy & Planning
      'Design Principles': `Establish design principles that guide decision-making for [target_audience] and support [project_goals]. Include rationale and application examples.`,
      'Content Strategy': `Develop content strategy that serves [target_audience] needs and supports [project_goals]. Include content types, voice, and governance.`,
      'Information Architecture': `Design information architecture that makes sense to [target_audience] and supports [project_goals]. Include navigation, categorization, and labeling.`
    };
    
    return tasks[tool] || `Apply ${tool} methodology following UX best practices and established frameworks. Focus on [target_audience] needs and ensure alignment with [project_goals]. Consider [constraints] in your recommendations.`;
  };

  const getFormatInstructions = (aiSettings: any): string => {
    const structure = aiSettings?.promptStructure || 'framework-guided';
    const creativity = aiSettings?.creativityLevel || 'balanced';
    
    const formats = {
      'framework-guided': 'Structure your response following established UX methodology frameworks. Use clear sections, actionable insights, and professional formatting.',
      'open-ended': 'Provide a flexible, exploratory response that encourages creative thinking and multiple perspectives.',
      'structured-templates': 'Use a consistent template format with predefined sections and standardized layouts.'
    };

    let baseFormat = formats[structure as keyof typeof formats];
    
    if (creativity === 'creative' || creativity === 'experimental') {
      baseFormat += ' Feel free to include innovative approaches and creative suggestions.';
    }

    return baseFormat;
  };

  const getExamples = (tool: string): string | null => {
    // Convert tool name to match enhanced instructions format
    const normalizedTool = tool.toLowerCase()
      .replace(/\s+/g, '-')
      .replace('user-interview', 'user-interviews')
      .replace('persona-creation', 'personas')
      .replace('journey-mapping', 'journey-maps');

    // Get enhanced instructions for examples
    const instructions = getEnhancedInstructions(normalizedTool, projectContext?.industry || 'general');
    
    if (instructions && instructions.length > 3) {
      // Use some methodology instructions as examples
      const methodologyInstructions = instructions
        .filter(instruction => 
          instruction.includes('Use') || 
          instruction.includes('Include') || 
          instruction.includes('Apply') ||
          instruction.includes('Example')
        )
        .slice(0, 3)
        .map((instruction, index) => `${index + 1}. ${instruction}`)
        .join('\n');
      
      if (methodologyInstructions) {
        return `Best Practices:\n${methodologyInstructions}`;
      }
    }

    // Fallback examples
    const examples = {
      'User Interview': 'Example questions:\n• "Can you walk me through your typical day?"\n• "What\'s the most frustrating part of [current process]?"\n• "If you had a magic wand, what would you change?"',
      'Persona Creation': 'Include: Name, Age, Job Title, Goals (3-4), Pain Points (3-4), Quote, Technology Comfort Level, Preferred Communication Channels',
      'Journey Mapping': 'Include: Phases, Actions, Emotions, Pain Points, Opportunities, Touchpoints, Success Metrics',
      'Empathy Mapping': 'Quadrants: Think (thoughts), Feel (emotions), See (environment), Say/Do (actions and words)',
      'Affinity Mapping': 'Process: Individual notes → Grouping → Theme labeling → Insight prioritization',
      'How Might We': 'Format: "How might we..." questions that are specific enough to guide solutions but broad enough to allow innovation',
      'Brainstorming': 'Rules: Build on ideas, defer judgment, encourage wild ideas, aim for quantity over quality',
      'Problem Statement': 'Format: "[User name] is a/an [characteristics] who needs [need] because [insight]"',
      'Usability Testing': 'Include: Task scenarios, Success criteria, Metrics to measure, Error recovery testing',
      'Surveys': 'Include: Appropriate scales, Skip logic, Pilot testing, Clear instructions'
    };
    
    return examples[tool as keyof typeof examples] || null;
  };

  const [promptSections, setPromptSections] = useState<PromptSection[]>([]);

  useEffect(() => {
    const sections = generatePromptSections();
    setPromptSections(sections);
    buildFinalPrompt(sections);
  }, [tool, projectContext, qualitySettings, aiMethodSettings, knowledgeContext]);

  const buildFinalPrompt = (sections: PromptSection[]) => {
    setIsBuilding(true);
    // Simulate building process
    setTimeout(() => {
      let prompt = sections
        .map(section => section.content)
        .join('\n\n');
      
      // Replace variables with project context values
      prompt = replaceVariablesWithContext(prompt);
      
      setFinalPrompt(prompt);
      setIsBuilding(false);
      if (onPromptGenerated) {
        onPromptGenerated(prompt);
      }
    }, 1500);
  };

  const replaceVariablesWithContext = (prompt: string): string => {
    let processedPrompt = prompt;
    
    // Replace common variables with project context, or default values if empty
    const replacements = {
      '[target_audience]': projectContext?.targetAudience || 'general users',
      '[audience]': projectContext?.targetAudience || 'general users',
      '[project_goals]': projectContext?.primaryGoals || 'improve user experience',
      '[goals]': projectContext?.primaryGoals || 'improve user experience',
      '[constraints]': projectContext?.keyConstraints || 'standard UX best practices',
      '[limitations]': projectContext?.keyConstraints || 'standard UX best practices',
      '[success_metrics]': projectContext?.successMetrics || 'user satisfaction and task completion',
      '[metrics]': projectContext?.successMetrics || 'user satisfaction and task completion',
      '[team]': projectContext?.teamComposition || 'UX team',
      '[team_composition]': projectContext?.teamComposition || 'UX team',
      '[timeline]': projectContext?.timeline || 'standard project timeline',
      '[timeframe]': projectContext?.timeline || 'standard project timeline'
    };
    
    // Apply all replacements
    Object.entries(replacements).forEach(([variable, value]) => {
      const regex = new RegExp(escapeRegExp(variable), 'gi');
      processedPrompt = processedPrompt.replace(regex, value);
    });
    
    return processedPrompt;
  };

  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard"
    });
  };

  const runPrompt = async () => {
    if (!finalPrompt.trim()) {
      toast({
        title: "No prompt to run",
        description: "Please wait for the prompt to be generated first",
        variant: "destructive"
      });
      return;
    }

    setIsRunningPrompt(true);
    setAiResponse('');

    try {
      // Use the Supabase function like the canvas workflow does
      console.log('Calling generate-ai-prompt with:', {
        promptContent: finalPrompt.substring(0, 100) + '...',
        toolName: tool
      });

      // Prepare knowledge context for the API call
      const knowledgeContextForAPI = knowledgeContext ? [{
        title: 'Additional Context',
        content: knowledgeContext
      }] : null;

      const { data: aiResult, error: aiError } = await supabase.functions.invoke('generate-ai-prompt', {
        body: {
          promptContent: finalPrompt,
          variables: {},
          projectId: 'ai-stress-test-prompt-builder', // Use stress test format to avoid auth issues
          frameworkName: 'Custom',
          stageName: 'Analysis', 
          toolName: tool,
          knowledgeContext: knowledgeContextForAPI
        }
      });

      console.log('Function response:', { aiResult, aiError });

      if (aiError) {
        console.error('Function error details:', aiError);
        throw new Error(aiError.message || `Function error: ${JSON.stringify(aiError)}`);
      }

      // Debug the response structure
      console.log('aiResult structure:', {
        keys: Object.keys(aiResult || {}),
        aiResponse: aiResult?.aiResponse,
        response: aiResult?.response,
        result: aiResult?.result,
        fullResult: aiResult
      });

      const responseText = aiResult?.aiResponse || aiResult?.response || aiResult?.result;
      if (!responseText) {
        console.error('No response text found in any expected fields:', aiResult);
        setAiResponse('No AI response received. Check console for debugging information.');
      } else {
        setAiResponse(responseText);
      }
      
      toast({
        title: "Prompt executed successfully",
        description: "AI response generated below"
      });
    } catch (error) {
      console.error('Error running prompt:', error);
      let errorMessage = 'Failed to generate AI response';
      let helpText = `📋 **How to fix this:**

1. **For Development**: Add your OpenAI API key to the Supabase environment:
   - Go to your Supabase project dashboard
   - Navigate to Settings → Edge Functions
   - Add environment variable: \`OPENAI_API_KEY=your_key_here\`

2. **Alternative**: Copy the generated prompt above and test it directly in:
   - ChatGPT (https://chat.openai.com)
   - Claude (https://claude.ai)
   - Any other AI assistant

3. **For Production**: Ensure all environment variables are configured in your deployment environment.`;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for common issues and provide helpful messages
        if (error.message.includes('OpenAI API key not configured')) {
          errorMessage = 'OpenAI API key is not configured on the server.';
        } else if (error.message.includes('Edge Function returned a non-2xx status code')) {
          errorMessage = 'Server configuration issue - likely missing OpenAI API key.';
        } else if (error.message.includes('Invalid authentication')) {
          errorMessage = 'Authentication failed. Please try logging in again.';
          helpText = 'Please refresh the page and log in again.';
        }
      }
      
      setAiResponse(`❌ **Error**: ${errorMessage}

${helpText}

🔍 **Technical Details**: 
- Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}
- Timestamp: ${new Date().toISOString()}

💡 **The generated prompt above is ready to use** - you can copy it and paste it into any AI assistant to get your UX methodology guidance!`);
      
      toast({
        title: "Error running prompt",
        description: "See response area for troubleshooting steps",
        variant: "destructive"
      });
    } finally {
      setIsRunningPrompt(false);
    }
  };

  const startEditing = (sectionId: string, currentContent: string) => {
    setEditingSections(prev => [...prev, sectionId]);
    setEditedContent(prev => ({ ...prev, [sectionId]: currentContent }));
  };

  const cancelEditing = (sectionId: string) => {
    setEditingSections(prev => prev.filter(id => id !== sectionId));
    setEditedContent(prev => {
      const newContent = { ...prev };
      delete newContent[sectionId];
      return newContent;
    });
  };

  const saveEdit = (sectionId: string) => {
    const newContent = editedContent[sectionId];
    if (newContent !== undefined) {
      // Update the section content
      setPromptSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, content: newContent }
            : section
        )
      );
      
      // Rebuild the final prompt with updated content
      const updatedSections = promptSections.map(section => 
        section.id === sectionId 
          ? { ...section, content: newContent }
          : section
      );
      buildFinalPrompt(updatedSections);
      
      // Clean up editing state
      setEditingSections(prev => prev.filter(id => id !== sectionId));
      setEditedContent(prev => {
        const newEditedContent = { ...prev };
        delete newEditedContent[sectionId];
        return newEditedContent;
      });
      
      toast({
        title: "Section Updated",
        description: "Prompt section has been updated successfully"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">AI Prompt Builder</h3>
        <p className="text-sm text-muted-foreground">
          Watch how your settings combine to create the perfect AI prompt
        </p>
      </div>

      {/* Section Builder */}
      <div className="space-y-4">
        <AnimatePresence>
          {promptSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn("border-2", section.color.split(' ')[1])}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", section.color)}>
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription className="text-xs">
                          Source: {section.source}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.editable && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => startEditing(section.id, section.content)}
                          disabled={editingSections.includes(section.id)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSection(section.id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedSections.includes(section.id) 
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0">
                        {editingSections.includes(section.id) ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editedContent[section.id] || section.content}
                              onChange={(e) => setEditedContent(prev => ({ 
                                ...prev, 
                                [section.id]: e.target.value 
                              }))}
                              className="min-h-[120px] font-mono text-sm"
                              placeholder="Edit the prompt section content..."
                            />
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => saveEdit(section.id)}
                                className="h-8"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => cancelEditing(section.id)}
                                className="h-8"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-wrap font-mono">
                              {section.content}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Arrow Indicator */}
      <div className="flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-muted-foreground"
        >
          ↓
        </motion.div>
      </div>

      {/* Final Prompt */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Generated AI Prompt</CardTitle>
                <CardDescription>
                  Ready to use with any AI model
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {finalPrompt.length} characters
              </Badge>
              <Button size="sm" variant="outline" onClick={copyPrompt}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button size="sm" onClick={runPrompt} disabled={isRunningPrompt || isBuilding}>
                <Play className="w-4 h-4 mr-2" />
                {isRunningPrompt ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isBuilding ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="ml-3 text-sm text-muted-foreground">
                  Building your prompt...
                </span>
              </div>
            ) : (
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {finalPrompt}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Response Section */}
      {(aiResponse || isRunningPrompt) && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Response</CardTitle>
                <CardDescription>
                  Generated using your configured prompt and settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isRunningPrompt ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full"
                  />
                  <span className="ml-3 text-sm text-muted-foreground">
                    Generating AI response...
                  </span>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                    {aiResponse}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{promptSections.length}</div>
          <div className="text-xs text-muted-foreground">Sections</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{finalPrompt.split(' ').length}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">
            {aiMethodSettings?.creativityLevel || 'Balanced'}
          </div>
          <div className="text-xs text-muted-foreground">Creativity</div>
        </div>
      </div>
    </div>
  );
}