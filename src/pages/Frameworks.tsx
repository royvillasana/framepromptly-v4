/**
 * @fileoverview Frameworks Management Page
 * Page for managing UX frameworks, stages, tools, and their AI prompt instructions
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronDown,
  ChevronRight,
  Settings,
  Edit3,
  Save,
  X,
  Plus,
  Search,
  BookOpen,
  Target,
  Wrench,
  MessageSquare,
  Globe,
  User
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { getEnhancedInstructions } from '@/lib/enhanced-tool-instructions';
import { generateToolSpecificInstructions } from '@/lib/tool-specific-prompt-instructions';
import { getFrameworkColors, getFrameworkTailwindClasses } from '@/lib/framework-colors';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PromptInstruction {
  id: string;
  toolId: string;
  stageId: string;
  frameworkId: string;
  instruction: string;
  variables: string[];
  isCustom: boolean;
  projectId?: string;
  lastModified: Date;
  modifiedBy?: string;
}

const FrameworksPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { frameworks } = useWorkflowStore();
  const { enhancedTemplates } = usePromptStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState('');
  const [customInstructions, setCustomInstructions] = useState<Map<string, PromptInstruction>>(new Map());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load custom instructions from localStorage
    const saved = localStorage.getItem('framepromptly_custom_instructions');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCustomInstructions(new Map(data));
      } catch (error) {
        console.error('Error loading custom instructions:', error);
      }
    }
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const saveCustomInstruction = (toolId: string, stageId: string, frameworkId: string, instruction: string, scope: 'project' | 'global') => {
    const instructionId = `${frameworkId}_${stageId}_${toolId}`;
    const customInstruction: PromptInstruction = {
      id: instructionId,
      toolId,
      stageId,
      frameworkId,
      instruction,
      variables: extractVariables(instruction),
      isCustom: true,
      projectId: scope === 'project' ? 'current-project' : undefined,
      lastModified: new Date(),
      modifiedBy: user.email || 'Unknown'
    };

    const newInstructions = new Map(customInstructions);
    newInstructions.set(instructionId, customInstruction);
    setCustomInstructions(newInstructions);

    // Save to localStorage
    localStorage.setItem('framepromptly_custom_instructions', JSON.stringify(Array.from(newInstructions.entries())));
    
    toast.success(`Instruction ${scope === 'global' ? 'updated globally' : 'customized for project'}`);
    setEditingInstruction(null);
  };

  const extractVariables = (instruction: string): string[] => {
    const matches = instruction.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const getInstructionForTool = (toolId: string, stageId: string, frameworkId: string): string => {
    const instructionId = `${frameworkId}_${stageId}_${toolId}`;
    const custom = customInstructions.get(instructionId);
    
    if (custom) {
      return custom.instruction;
    }

    // Use the new tool-specific prompt system
    try {
      // Find the framework and stage context
      const framework = frameworks.find(f => f.id === frameworkId);
      const stage = framework?.stages.find(s => s.id === stageId);
      const tool = stage?.tools.find(t => t.id === toolId);

      if (framework && stage && tool) {
        // Use the imported function to generate tool-specific instructions
        const context = { framework, stage, tool };
        const specificInstructions = generateToolSpecificInstructions(context);
        
        return `# ${tool.name} - Contextual AI Prompt Instructions

## Framework: ${framework.name} | Stage: ${stage.name}

${specificInstructions.promptTemplate}

### Contextual Guidance:
${specificInstructions.contextualGuidance.map(g => `• ${g}`).join('\n')}

### Framework-Specific Notes:
${specificInstructions.frameworkSpecificNotes.map(n => `• ${n}`).join('\n')}

### Stage-Specific Focus:
${specificInstructions.stageSpecificFocus.map(f => `• ${f}`).join('\n')}

### Knowledge Integration Requirements:
${specificInstructions.knowledgeIntegrationInstructions.map(k => `• ${k}`).join('\n')}

### Quality Assurance:
${specificInstructions.qualityChecks.map(q => `• ${q}`).join('\n')}

### Expected Output:
${specificInstructions.expectedOutputFormat}

---
*These instructions are specifically tailored for ${tool.name} in the ${stage.name} stage of ${framework.name} methodology.*`;
      }
    } catch (error) {
      console.warn('Failed to generate tool-specific instructions, falling back to enhanced instructions:', error);
    }

    // Fallback to enhanced instructions
    try {
      const enhancedInstructions = getEnhancedInstructions(toolId);
      if (enhancedInstructions && enhancedInstructions.length > 0) {
        return `# AI Prompt Instructions for ${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Core Instructions:
${enhancedInstructions.slice(0, 7).map(instruction => `• ${instruction}`).join('\n')}

## Methodology Guidelines:
${enhancedInstructions.slice(7, 14).map(instruction => `• ${instruction}`).join('\n')}

## Quality Assurance:
${enhancedInstructions.slice(14, 18).map(instruction => `• ${instruction}`).join('\n')}

## AI Optimization:
${enhancedInstructions.slice(18, 22).map(instruction => `• ${instruction}`).join('\n')}

## Knowledge Integration (CRITICAL):
${enhancedInstructions.slice(22).map(instruction => `• ${instruction}`).join('\n')}

---
*Instructions are research-backed and include knowledge base integration for contextual relevance.*`;
      }
    } catch (error) {
      console.warn('Could not load enhanced instructions for tool:', toolId);
    }

    // Fallback to enhanced templates
    const template = enhancedTemplates.find(t => t.id === toolId);
    return template?.template || 'No instruction template found for this tool.';
  };

  const isCustomInstruction = (toolId: string, stageId: string, frameworkId: string): boolean => {
    const instructionId = `${frameworkId}_${stageId}_${toolId}`;
    return customInstructions.has(instructionId);
  };

  const filteredFrameworks = frameworks.filter(framework =>
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FrameworkOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFrameworks.map((framework) => {
          const frameworkClasses = getFrameworkTailwindClasses(framework.id, 'framework');
          const colors = getFrameworkColors(framework.id);
          
          return (
            <Card key={framework.id} className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${frameworkClasses[0]} border-2`} 
                  style={{ 
                    backgroundColor: colors.background.tertiary, 
                    borderColor: colors.border.secondary,
                    borderLeftWidth: '6px',
                    borderLeftColor: colors.border.primary
                  }}>
              <CardHeader className="border-b" style={{ backgroundColor: colors.background.secondary, borderBottomColor: colors.border.secondary }}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold leading-tight text-black">{framework.name}</CardTitle>
                  <Badge className="font-medium" style={{ 
                    backgroundColor: colors.background.secondary, 
                    color: colors.text.secondary, 
                    borderColor: colors.border.secondary 
                  }}>
                    {framework.stages.length} stages
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
                  {framework.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
                    <Target className="w-4 h-4" />
                    <span>Focus: {framework.characteristics.focus}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
                    <BookOpen className="w-4 h-4" />
                    <span>Timeline: {framework.characteristics.timeline}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <Badge className="text-xs font-medium" style={{ 
                      backgroundColor: colors.background.secondary, 
                      color: colors.text.secondary, 
                      borderColor: colors.border.secondary 
                    }}>
                      {framework.stages.reduce((total, stage) => total + stage.tools.length, 0)} total tools
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-medium transition-colors duration-200"
                      style={{
                        borderColor: colors.border.secondary,
                        color: colors.text.secondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.background.hover;
                        e.currentTarget.style.color = colors.text.hover;
                        e.currentTarget.style.borderColor = colors.border.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = colors.text.secondary;
                        e.currentTarget.style.borderColor = colors.border.secondary;
                      }}
                      onClick={() => {
                        setSelectedFramework(framework.id);
                        setActiveTab('instructions');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const InstructionsManagement = () => (
    <div className="space-y-4">
      {filteredFrameworks.map((framework) => {
        const frameworkClasses = getFrameworkTailwindClasses(framework.id, 'framework');
        const colors = getFrameworkColors(framework.id);
        
        return (
          <Card key={framework.id} className="overflow-hidden border-2 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                style={{ 
                  backgroundColor: colors.background.tertiary, 
                  borderColor: colors.border.secondary,
                  borderLeftWidth: '6px',
                  borderLeftColor: colors.border.primary
                }}>
            <CardHeader 
              className="cursor-pointer border-b transition-colors duration-200"
              style={{ 
                backgroundColor: colors.background.secondary, 
                borderBottomColor: colors.border.secondary 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
              }}
              onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedFramework === framework.id ? (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.text.secondary }} />
                  ) : (
                    <ChevronRight className="w-5 h-5" style={{ color: colors.text.secondary }} />
                  )}
                  <div>
                    <CardTitle data-title className="text-xl font-bold leading-tight text-black">{framework.name}</CardTitle>
                    <CardDescription data-description className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>{framework.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="font-medium" style={{ 
                    backgroundColor: colors.background.primary, 
                    color: colors.text.primary, 
                    borderColor: colors.border.primary 
                  }}>
                    {framework.stages.length} stages
                  </Badge>
                  <Badge className="font-medium" style={{ 
                    backgroundColor: colors.background.primary, 
                    color: colors.text.primary, 
                    borderColor: colors.border.primary 
                  }}>
                    {framework.stages.reduce((total, stage) => total + stage.tools.length, 0)} tools
                  </Badge>
                </div>
              </div>
            </CardHeader>
          
          {selectedFramework === framework.id && (
            <CardContent className="space-y-4 p-6">
              {framework.stages.map((stage) => {
                const stageClasses = getFrameworkTailwindClasses(framework.id, 'stage');
                
                return (
                  <div key={stage.id} className="ml-4 border rounded-lg p-5 transition-all duration-200"
                       style={{ 
                         backgroundColor: colors.background.secondary,
                         borderColor: colors.border.tertiary,
                         borderLeftWidth: '4px',
                         borderLeftColor: colors.border.secondary
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = colors.background.hover;
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = colors.background.secondary;
                       }}>
                    <div 
                      className="flex items-center justify-between cursor-pointer -m-1 p-3 rounded-md transition-colors duration-200"
                      style={{ backgroundColor: `${colors.background.secondary}80` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${colors.background.hover}80`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${colors.background.secondary}80`;
                      }}
                      onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                    >
                      <div className="flex items-center gap-3">
                        {selectedStage === stage.id ? (
                          <ChevronDown className="w-4 h-4" style={{ color: colors.text.secondary }} />
                        ) : (
                          <ChevronRight className="w-4 h-4" style={{ color: colors.text.secondary }} />
                        )}
                        <div>
                          <h3 data-stage-title className="font-semibold text-lg leading-tight text-black">{stage.name}</h3>
                          <p data-stage-description className="text-sm leading-relaxed" style={{ color: colors.text.light }}>{stage.description}</p>
                        </div>
                      </div>
                      <Badge className="font-medium" style={{ 
                        backgroundColor: colors.background.primary, 
                        color: colors.text.primary, 
                        borderColor: colors.border.primary 
                      }}>
                        {stage.tools.length} tools
                      </Badge>
                    </div>
                  
                  {selectedStage === stage.id && (
                    <div className="mt-4 space-y-3">
                      {stage.tools.map((tool) => {
                        const toolClasses = getFrameworkTailwindClasses(framework.id, 'tool');
                        
                        return (
                          <div key={tool.id} className="ml-8 border rounded-lg p-4 transition-all duration-200"
                               style={{ 
                                 backgroundColor: colors.background.tertiary,
                                 borderColor: colors.border.tertiary,
                                 borderLeftWidth: '3px',
                                 borderLeftColor: colors.border.tertiary
                               }}
                               onMouseEnter={(e) => {
                                 e.currentTarget.style.backgroundColor = colors.background.hover;
                                 e.currentTarget.style.borderLeftColor = colors.border.secondary;
                               }}
                               onMouseLeave={(e) => {
                                 e.currentTarget.style.backgroundColor = colors.background.tertiary;
                                 e.currentTarget.style.borderLeftColor = colors.border.tertiary;
                               }}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Wrench className="w-4 h-4" style={{ color: colors.text.secondary }} />
                                <div>
                                  <h4 data-tool-title className="font-medium leading-tight text-black">{tool.name}</h4>
                                  <p data-tool-description className="text-xs leading-relaxed" style={{ color: colors.text.light }}>{tool.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isCustomInstruction(tool.id, stage.id, framework.id) && (
                                  <Badge className="bg-orange-200 text-orange-800 border-orange-300 font-medium text-xs">Custom</Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    window.open(`/tool-prompt-demo?framework=${framework.id}&stage=${stage.id}&tool=${tool.id}`, '_blank');
                                  }}
                                  className="text-xs transition-colors duration-200"
                                  style={{ color: colors.text.secondary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.background.secondary;
                                    e.currentTarget.style.color = colors.text.hover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = colors.text.secondary;
                                  }}
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Compare
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingInstruction(`${framework.id}_${stage.id}_${tool.id}`);
                                    setInstructionText(getInstructionForTool(tool.id, stage.id, framework.id));
                                  }}
                                  className="transition-colors duration-200"
                                  style={{ 
                                    borderColor: colors.border.tertiary, 
                                    color: colors.text.secondary 
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.background.secondary;
                                    e.currentTarget.style.color = colors.text.hover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = colors.text.secondary;
                                  }}
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm font-medium text-slate-800">AI Prompt Instruction:</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300 font-semibold text-xs">
                                    Context-Specific
                                  </Badge>
                                  <Badge className="bg-violet-200 text-violet-800 border-violet-300 text-xs">
                                    {framework.name}
                                  </Badge>
                                  <Badge className="bg-blue-200 text-blue-800 border-blue-300 text-xs">
                                    {stage.name}
                                  </Badge>
                                </div>
                              </div>
                              
                              {editingInstruction === `${framework.id}_${stage.id}_${tool.id}` ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={instructionText}
                                    onChange={(e) => setInstructionText(e.target.value)}
                                    className="min-h-32 text-sm font-mono"
                                    placeholder="Enter the AI prompt instruction..."
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => saveCustomInstruction(tool.id, stage.id, framework.id, instructionText, 'global')}
                                    >
                                      <Globe className="w-3 h-3 mr-1" />
                                      Save Globally
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => saveCustomInstruction(tool.id, stage.id, framework.id, instructionText, 'project')}
                                    >
                                      <User className="w-3 h-3 mr-1" />
                                      Save for Project
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingInstruction(null)}
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    <strong>Variables found:</strong> {extractVariables(instructionText).join(', ') || 'None'}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <pre className="text-sm font-mono bg-white p-4 rounded-md border border-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto text-slate-700 leading-relaxed shadow-sm">
                                    {getInstructionForTool(tool.id, stage.id, framework.id)}
                                  </pre>
                                  
                                  {!isCustomInstruction(tool.id, stage.id, framework.id) && (
                                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                                      <div className="text-xs text-violet-800 font-semibold mb-1">
                                        ✨ Enhanced Tool-Specific Instructions
                                      </div>
                                      <div className="text-xs text-violet-700 leading-relaxed">
                                        This prompt is automatically generated based on the {tool.name} tool's specific purpose 
                                        within the {stage.name} stage of {framework.name} methodology, including knowledge base integration.
                                      </div>
                                    </div>
                                  )}
                                  
                                  {isCustomInstruction(tool.id, stage.id, framework.id) && (
                                    <div className="text-xs text-muted-foreground">
                                      <strong>Last modified:</strong> {customInstructions.get(`${framework.id}_${stage.id}_${tool.id}`)?.lastModified.toLocaleString()}
                                      {customInstructions.get(`${framework.id}_${stage.id}_${tool.id}`)?.modifiedBy && (
                                        <span> by {customInstructions.get(`${framework.id}_${stage.id}_${tool.id}`)?.modifiedBy}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                );
              })}
            </CardContent>
          )}
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">UX Frameworks</h1>
              <p className="text-muted-foreground mt-1">
                Manage UX methodologies, stages, tools, and AI prompt instructions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search frameworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Enhanced AI Prompts Banner - Full Width */}
          <div className="w-full bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Enhanced Tool-Specific AI Prompts</span>
            </div>
            <p className="text-xs text-blue-800">
              Each tool now generates unique, contextual AI prompt instructions based on framework methodology, 
              stage objectives, and tool-specific best practices with knowledge base integration.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Frameworks</p>
                  <p className="text-2xl font-bold">{frameworks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Stages</p>
                  <p className="text-2xl font-bold">
                    {frameworks.reduce((total, fw) => total + fw.stages.length, 0)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tools</p>
                  <p className="text-2xl font-bold">
                    {frameworks.reduce((total, fw) => 
                      total + fw.stages.reduce((stageTotal, stage) => stageTotal + stage.tools.length, 0), 0
                    )}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custom Instructions</p>
                  <p className="text-2xl font-bold">{customInstructions.size}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Framework Overview</TabsTrigger>
              <TabsTrigger value="instructions">Manage Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <FrameworkOverview />
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6">
              <InstructionsManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FrameworksPage;