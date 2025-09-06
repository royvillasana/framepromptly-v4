import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptBuilderVisualizer } from '@/components/prompt/prompt-builder-visualizer';
import { useProjectStore } from '@/stores/project-store';
import { motion } from 'framer-motion';
import { Brain, Settings, Wand2, ArrowLeft, Target, CheckCircle, Sliders, FileText, Upload, Edit, Database, X } from 'lucide-react';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { supabase } from '@/integrations/supabase/client';

export default function PromptBuilder() {
  const [searchParams] = useSearchParams();
  const { projects, getEnhancedSettings } = useProjectStore();
  const { entries: documents, fetchEntries: fetchDocuments } = useKnowledgeStore();
  
  // Get initial values from URL params or defaults
  const [selectedTool, setSelectedTool] = useState(
    searchParams.get('tool') || 'User Interviews'
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    searchParams.get('projectId') || (projects?.[0]?.id || '')
  );

  // Enhanced prompt state - matching ProjectSettings structure
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general');
  const [projectContext, setProjectContext] = useState({
    primaryGoals: '',
    targetAudience: '',
    keyConstraints: '',
    successMetrics: '',
    teamComposition: '',
    timeline: '',
  });
  const [qualitySettings, setQualitySettings] = useState({
    methodologyDepth: 'intermediate' as 'basic' | 'intermediate' | 'advanced',
    outputDetail: 'moderate' as 'brief' | 'moderate' | 'comprehensive',
    timeConstraints: 'standard' as 'urgent' | 'standard' | 'extended',
    industryCompliance: false,
    accessibilityFocus: false,
  });
  const [aiMethodSettings, setAiMethodSettings] = useState({
    promptStructure: 'framework-guided' as 'framework-guided' | 'open-ended' | 'structured-templates',
    creativityLevel: 'balanced' as 'conservative' | 'balanced' | 'creative' | 'experimental',
    reasoning: 'step-by-step' as 'step-by-step' | 'direct' | 'exploratory',
    adaptability: 'context-aware' as 'static' | 'context-aware' | 'dynamic-learning',
    validation: 'built-in' as 'none' | 'basic' | 'built-in' | 'comprehensive',
    personalization: 'user-preferences' as 'none' | 'basic-profile' | 'user-preferences' | 'adaptive-learning',
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Knowledge Context State
  const [contextSource, setContextSource] = useState<'none' | 'knowledge' | 'upload' | 'manual'>('none');
  const [selectedKnowledgeDoc, setSelectedKnowledgeDoc] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [manualContext, setManualContext] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);

  // Load project settings when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectSettings();
      loadKnowledgeDocuments();
    }
  }, [selectedProjectId]);

  const loadKnowledgeDocuments = async () => {
    if (selectedProjectId) {
      console.log('Loading knowledge documents for project:', selectedProjectId);
      try {
        await fetchDocuments(selectedProjectId);
        console.log('Knowledge documents loaded:', documents?.length || 0, 'entries');
      } catch (error) {
        console.error('Error loading knowledge documents:', error);
      }
    }
  };

  // Update local state when documents change
  useEffect(() => {
    setKnowledgeDocs(documents || []);
  }, [documents]);

  // Set first project as default when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const loadProjectSettings = async () => {
    try {
      const settings = await getEnhancedSettings(selectedProjectId);
      if (settings) {
        setSelectedIndustry(settings.industry || 'general');
        setProjectContext(settings.projectContext || {
          primaryGoals: '',
          targetAudience: '',
          keyConstraints: '',
          successMetrics: '',
          teamComposition: '',
          timeline: '',
        });
        setQualitySettings(settings.qualitySettings || {
          methodologyDepth: 'intermediate',
          outputDetail: 'moderate',
          timeConstraints: 'standard',
          industryCompliance: false,
          accessibilityFocus: false,
        });
        setAiMethodSettings(settings.aiMethodSettings || {
          promptStructure: 'framework-guided',
          creativityLevel: 'balanced',
          reasoning: 'step-by-step',
          adaptability: 'context-aware',
          validation: 'built-in',
          personalization: 'user-preferences',
          temperature: 0.7,
          topP: 0.9,
          topK: 50,
        });
      }
    } catch (error) {
      console.error('Failed to load project settings:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsProcessingFile(true);
    setUploadedFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProjectId);
      
      // Use the existing Supabase function for document processing
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setExtractedContent(data.content || 'No content extracted');
    } catch (error) {
      console.error('Error processing file:', error);
      setExtractedContent(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const getContextData = () => {
    switch (contextSource) {
      case 'knowledge':
        if (!documents || !selectedKnowledgeDoc) return null;
        const selectedDoc = documents.find(doc => doc.id === selectedKnowledgeDoc);
        return selectedDoc ? `**${selectedDoc.title}**\n\n${selectedDoc.content}` : null;
      case 'upload':
        return uploadedFile && extractedContent ? `**${uploadedFile.name}**\n\n${extractedContent}` : null;
      case 'manual':
        return manualContext.trim() || null;
      default:
        return null;
    }
  };

  // Comprehensive UX tools available in the system
  const sampleTools = [
    // Research & Discovery
    'User Interviews',
    'Surveys',
    'Field Studies', 
    'Diary Studies',
    'Focus Groups',
    'Card Sorting',
    'Tree Testing',
    'First Click Testing',
    'Five Second Test',
    'Competitive Analysis',
    'Heuristic Evaluation',
    'Expert Review',
    
    // Analysis & Synthesis
    'Affinity Mapping',
    'Personas',
    'User Stories',
    'Jobs to be Done',
    'Journey Maps',
    'Service Blueprints',
    'Empathy Maps',
    'Experience Maps',
    'System Maps',
    'Stakeholder Maps',
    
    // Ideation & Design
    'How Might We',
    'Brainstorming',
    'Crazy 8s',
    'Sketching',
    'Storyboarding',
    'Wireframing',
    'Prototyping',
    'Design Studio',
    'Co-design Workshops',
    
    // Validation & Testing
    'Usability Testing',
    'A/B Testing',
    'Prototype Testing',
    'Guerrilla Testing',
    'Remote Testing',
    'Accessibility Testing',
    'Performance Testing',
    'Moderated Testing',
    'Unmoderated Testing',
    
    // Strategy & Planning
    'Design Principles',
    'Problem Framing',
    'Opportunity Mapping',
    'Feature Prioritization',
    'Design System Planning',
    'Content Strategy',
    'Information Architecture'
  ];

  // Show loading state if projects haven't loaded yet
  if (!projects) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AI Prompt Builder...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Prompt Builder</h1>
                <p className="text-gray-600 mt-1">
                  Visualize and understand how your AI prompts are constructed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <CardTitle>Prompt Configuration</CardTitle>
                </div>
                <CardDescription>
                  Select your project and tool to see how the AI prompt is built
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects && projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="demo" disabled>
                            {projects === undefined ? 'Loading projects...' : 'No projects found'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tool Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tool</label>
                    <Select value={selectedTool} onValueChange={setSelectedTool}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tool" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Research & Discovery</div>
                        {sampleTools.slice(0, 12).map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1">Analysis & Synthesis</div>
                        {sampleTools.slice(12, 22).map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1">Ideation & Design</div>
                        {sampleTools.slice(22, 31).map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1">Validation & Testing</div>
                        {sampleTools.slice(31, 40).map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1">Strategy & Planning</div>
                        {sampleTools.slice(40).map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Wand2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Change the project or tool above to see how it affects the AI prompt construction
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* AI Settings Panel */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  <CardTitle>AI Configuration Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure AI context, quality, and method settings to see their impact on prompt generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="context" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="context" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Context
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Quality
                    </TabsTrigger>
                    <TabsTrigger value="ai-methods" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Methods
                    </TabsTrigger>
                  </TabsList>

                  {/* Context Tab */}
                  <TabsContent value="context" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Industry Selection */}
                      <div className="space-y-2">
                        <Label>Industry Context</Label>
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General (no specific industry)</SelectItem>
                            <SelectItem value="fintech">Financial Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="saas">SaaS/Software</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="government">Government/Public Sector</SelectItem>
                            <SelectItem value="nonprofit">Non-profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Target Audience */}
                      <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Input
                          id="targetAudience"
                          value={projectContext.targetAudience}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            targetAudience: e.target.value
                          }))}
                          placeholder="Who is your primary target audience?"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Primary Goals */}
                      <div className="space-y-2">
                        <Label htmlFor="primaryGoals">Primary Goals</Label>
                        <Textarea
                          id="primaryGoals"
                          value={projectContext.primaryGoals}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            primaryGoals: e.target.value
                          }))}
                          placeholder="What are the main objectives of this project?"
                          rows={2}
                        />
                      </div>

                      {/* Key Constraints */}
                      <div className="space-y-2">
                        <Label htmlFor="keyConstraints">Key Constraints</Label>
                        <Textarea
                          id="keyConstraints"
                          value={projectContext.keyConstraints}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            keyConstraints: e.target.value
                          }))}
                          placeholder="What are the main limitations or constraints?"
                          rows={2}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Quality Tab */}
                  <TabsContent value="quality" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Methodology Depth</Label>
                        <Select 
                          value={qualitySettings.methodologyDepth} 
                          onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => 
                            setQualitySettings(prev => ({ ...prev, methodologyDepth: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic - Simple explanations</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Balanced detail</SelectItem>
                            <SelectItem value="advanced">Advanced - Comprehensive analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Output Detail Level</Label>
                        <Select 
                          value={qualitySettings.outputDetail} 
                          onValueChange={(value: 'brief' | 'moderate' | 'comprehensive') => 
                            setQualitySettings(prev => ({ ...prev, outputDetail: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brief">Brief - Concise recommendations</SelectItem>
                            <SelectItem value="moderate">Moderate - Balanced explanations</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive - Detailed analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Time Constraints</Label>
                        <Select 
                          value={qualitySettings.timeConstraints} 
                          onValueChange={(value: 'urgent' | 'standard' | 'extended') => 
                            setQualitySettings(prev => ({ ...prev, timeConstraints: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent - Quick solutions</SelectItem>
                            <SelectItem value="standard">Standard - Balanced approach</SelectItem>
                            <SelectItem value="extended">Extended - Thorough exploration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Industry Compliance</Label>
                          <p className="text-sm text-muted-foreground">
                            Include industry-specific compliance considerations
                          </p>
                        </div>
                        <Switch
                          checked={qualitySettings.industryCompliance}
                          onCheckedChange={(checked) => 
                            setQualitySettings(prev => ({ ...prev, industryCompliance: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Accessibility Focus</Label>
                          <p className="text-sm text-muted-foreground">
                            Emphasize accessibility in recommendations
                          </p>
                        </div>
                        <Switch
                          checked={qualitySettings.accessibilityFocus}
                          onCheckedChange={(checked) => 
                            setQualitySettings(prev => ({ ...prev, accessibilityFocus: checked }))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* AI Methods Tab */}
                  <TabsContent value="ai-methods" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>AI Creativity Level</Label>
                        <Select 
                          value={aiMethodSettings.creativityLevel} 
                          onValueChange={(value: 'conservative' | 'balanced' | 'creative' | 'experimental') => 
                            setAiMethodSettings(prev => ({ ...prev, creativityLevel: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative - Safe, proven approaches</SelectItem>
                            <SelectItem value="balanced">Balanced - Mix of proven and innovative ideas</SelectItem>
                            <SelectItem value="creative">Creative - Novel and innovative suggestions</SelectItem>
                            <SelectItem value="experimental">Experimental - Cutting-edge approaches</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Reasoning Approach</Label>
                        <Select 
                          value={aiMethodSettings.reasoning} 
                          onValueChange={(value: 'step-by-step' | 'direct' | 'exploratory') => 
                            setAiMethodSettings(prev => ({ ...prev, reasoning: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="step-by-step">Step-by-Step - Detailed logical progression</SelectItem>
                            <SelectItem value="direct">Direct - Concise, straight to the point</SelectItem>
                            <SelectItem value="exploratory">Exploratory - Multiple perspectives</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Adaptability Method</Label>
                        <Select 
                          value={aiMethodSettings.adaptability} 
                          onValueChange={(value: 'static' | 'context-aware' | 'dynamic-learning') => 
                            setAiMethodSettings(prev => ({ ...prev, adaptability: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Static - Fixed responses</SelectItem>
                            <SelectItem value="context-aware">Context-Aware - Adapts to project context</SelectItem>
                            <SelectItem value="dynamic-learning">Dynamic Learning - Learns from preferences</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Validation & Quality Control</Label>
                        <Select 
                          value={aiMethodSettings.validation} 
                          onValueChange={(value: 'none' | 'basic' | 'built-in' | 'comprehensive') => 
                            setAiMethodSettings(prev => ({ ...prev, validation: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None - No validation checks</SelectItem>
                            <SelectItem value="basic">Basic - Simple relevance checks</SelectItem>
                            <SelectItem value="built-in">Built-in - Standard quality validation</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive - Extensive analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Advanced Parameters */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Advanced Parameters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Temperature */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm font-mono">{aiMethodSettings.temperature.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[aiMethodSettings.temperature]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, temperature: value }))
                            }
                            max={1.0}
                            min={0.1}
                            step={0.1}
                          />
                          <div className="text-xs text-muted-foreground">
                            Controls randomness and creativity
                          </div>
                        </div>

                        {/* Top-p */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <Label>Top-p</Label>
                            <span className="text-sm font-mono">{aiMethodSettings.topP.toFixed(2)}</span>
                          </div>
                          <Slider
                            value={[aiMethodSettings.topP]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, topP: value }))
                            }
                            max={1.0}
                            min={0.1}
                            step={0.05}
                          />
                          <div className="text-xs text-muted-foreground">
                            Controls diversity through nucleus sampling
                          </div>
                        </div>

                        {/* Top-k */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <Label>Top-k</Label>
                            <span className="text-sm font-mono">{aiMethodSettings.topK}</span>
                          </div>
                          <Slider
                            value={[aiMethodSettings.topK]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, topK: value }))
                            }
                            max={100}
                            min={10}
                            step={5}
                          />
                          <div className="text-xs text-muted-foreground">
                            Limits vocabulary consideration
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Knowledge Context Panel */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <CardTitle>Knowledge Context (Optional)</CardTitle>
                </div>
                <CardDescription>
                  Add additional context to enhance the AI prompt with specific project knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Context Source Selection */}
                <div className="space-y-3">
                  <Label>Context Source</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant={contextSource === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContextSource('none')}
                      className="justify-start"
                    >
                      <X className="w-4 h-4 mr-2" />
                      None
                    </Button>
                    <Button
                      variant={contextSource === 'knowledge' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContextSource('knowledge')}
                      className="justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Knowledge Base
                    </Button>
                    <Button
                      variant={contextSource === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContextSource('upload')}
                      className="justify-start"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                    <Button
                      variant={contextSource === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContextSource('manual')}
                      className="justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manual Input
                    </Button>
                  </div>
                </div>

                {/* Context Source Content */}
                {contextSource === 'knowledge' && (
                  <div className="space-y-2">
                    <Label>Select Knowledge Document</Label>
                    <Select value={selectedKnowledgeDoc} onValueChange={setSelectedKnowledgeDoc}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a document from your knowledge base" />
                      </SelectTrigger>
                      <SelectContent>
                        {documents && documents.length > 0 ? (
                          documents.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {documents === undefined ? 'Loading documents...' : 'No documents found in knowledge base'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedKnowledgeDoc && documents && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {documents.find(doc => doc.id === selectedKnowledgeDoc)?.content?.substring(0, 200) || 'No content preview available'}...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {contextSource === 'upload' && (
                  <div className="space-y-3">
                    <Label>Upload PDF Document</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload PDF</p>
                        <p className="text-xs text-muted-foreground">PDF files only</p>
                      </label>
                    </div>
                    
                    {isProcessingFile && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Processing PDF...</span>
                      </div>
                    )}
                    
                    {uploadedFile && extractedContent && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-1">Extracted from: {uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-4">
                          {extractedContent.substring(0, 300)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {contextSource === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="manual-context">Manual Context Input</Label>
                    <Textarea
                      id="manual-context"
                      value={manualContext}
                      onChange={(e) => setManualContext(e.target.value)}
                      placeholder="Enter additional context, requirements, or background information that should influence the AI response..."
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {manualContext.length}/2000 characters
                    </p>
                  </div>
                )}

                {contextSource !== 'none' && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      This context will be added to your AI prompt to provide more specific guidance
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visualizer */}
            <PromptBuilderVisualizer
              tool={selectedTool}
              projectContext={projectContext}
              qualitySettings={qualitySettings}
              aiMethodSettings={aiMethodSettings}
              knowledgeContext={getContextData()}
              onPromptGenerated={setGeneratedPrompt}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}