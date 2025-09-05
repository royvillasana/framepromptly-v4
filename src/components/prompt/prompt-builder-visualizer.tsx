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
  framework?: string;
  stage?: string;
  tool?: string;
  projectContext?: any;
  qualitySettings?: any;
  aiMethodSettings?: any;
  onPromptGenerated?: (prompt: string) => void;
}

export function PromptBuilderVisualizer({
  framework = "Design Thinking",
  stage = "Empathize",
  tool = "User Interview",
  projectContext = {},
  qualitySettings = {},
  aiMethodSettings = {},
  onPromptGenerated
}: PromptBuilderVisualizerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['role', 'context']);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingSections, setEditingSections] = useState<string[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Generate prompt sections based on inputs
  const generatePromptSections = (): PromptSection[] => {
    const sections: PromptSection[] = [];

    // Role Section
    sections.push({
      id: 'role',
      type: 'role',
      title: 'AI Role & Expertise',
      content: `You are an expert UX ${tool === 'User Interview' ? 'researcher' : 'designer'} with deep knowledge of ${framework} methodology. You specialize in the ${stage} phase and have extensive experience with ${tool} techniques.`,
      source: `Framework: ${framework} → Stage: ${stage}`,
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      editable: true
    });

    // Context Section
    const contextParts = [];
    if (projectContext.targetAudience) {
      contextParts.push(`Target Audience: ${projectContext.targetAudience}`);
    }
    if (projectContext.primaryGoals) {
      contextParts.push(`Project Goals: ${projectContext.primaryGoals}`);
    }
    if (projectContext.keyConstraints) {
      contextParts.push(`Constraints: ${projectContext.keyConstraints}`);
    }

    sections.push({
      id: 'context',
      type: 'context',
      title: 'Project Context',
      content: contextParts.length > 0 
        ? `Working on a project with the following context:\n${contextParts.join('\n')}`
        : 'No specific project context provided.',
      source: 'Project Settings → Context Tab',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      editable: true
    });

    // Task Section
    const taskDescription = getTaskDescription(framework, stage, tool);
    sections.push({
      id: 'task',
      type: 'task',
      title: 'Specific Task',
      content: taskDescription,
      source: `${framework} → ${stage} → ${tool}`,
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

  const getTaskDescription = (framework: string, stage: string, tool: string): string => {
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
      return `${tool} for ${stage} phase of ${framework}: ${coreInstructions}`;
    }

    // Fallback to generic descriptions
    const tasks = {
      'User Interview': `Generate a comprehensive user interview guide for the ${stage} phase of ${framework}. Include opening questions, main inquiry areas, and follow-up prompts that will help gather deep insights about user needs, behaviors, and pain points.`,
      'Persona Creation': `Create detailed user personas based on research findings for the ${stage} phase. Include demographic information, goals, frustrations, behaviors, and key quotes that represent this user segment.`,
      'Journey Mapping': `Develop a user journey map that captures the user's experience across all touchpoints. Focus on emotions, pain points, and opportunities for improvement during the ${stage} phase.`,
      'Empathy Mapping': `Create empathy maps that capture what users think, feel, see, say, hear, and do. Focus on emotional insights and user motivations during the ${stage} phase.`,
      'Affinity Mapping': `Apply systematic thematic analysis to organize qualitative research data into meaningful clusters and themes for the ${stage} phase.`,
      'How Might We': `Frame problems as innovation opportunities using structured "How might we..." questions for the ${stage} phase.`,
      'Brainstorming': `Conduct structured ideation sessions using proven creative techniques for the ${stage} phase of ${framework}.`,
      'Problem Statement': `Define clear, actionable problem statements using user research insights for the ${stage} phase.`,
      'Usability Testing': `Design and conduct usability tests with measurable success criteria for the ${stage} phase.`,
      'Surveys': `Design comprehensive user surveys using validated question formats for the ${stage} phase.`
    };
    
    return tasks[tool as keyof typeof tasks] || `Apply ${tool} methodology appropriate for the ${stage} phase of ${framework}, following UX best practices and established frameworks.`;
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
  }, [framework, stage, tool, projectContext, qualitySettings, aiMethodSettings]);

  const buildFinalPrompt = (sections: PromptSection[]) => {
    setIsBuilding(true);
    // Simulate building process
    setTimeout(() => {
      const prompt = sections
        .map(section => section.content)
        .join('\n\n');
      setFinalPrompt(prompt);
      setIsBuilding(false);
      if (onPromptGenerated) {
        onPromptGenerated(prompt);
      }
    }, 1500);
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

  const runPrompt = () => {
    // This would integrate with an AI service
    console.log('Running prompt:', finalPrompt);
    toast({
      title: "Running Prompt",
      description: "This would send the prompt to your AI service"
    });
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
              <Button size="sm" onClick={runPrompt}>
                <Play className="w-4 h-4 mr-2" />
                Run
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