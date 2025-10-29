import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectStore } from '@/stores/project-store';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, CheckCircle, Brain, Settings, Save, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ProjectInvitations } from './project-invitations';

export function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { projects, fetchProjects, saveEnhancedSettings, getEnhancedSettings } = useProjectStore();
  const [project, setProject] = useState(projects.find(p => p.id === projectId));
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'context');

  // Enhanced prompt state
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

  useEffect(() => {
    if (!projects.length) {
      fetchProjects();
    }
    
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      loadEnhancedSettings();
    }
  }, [projectId, projects, fetchProjects]);

  // Handle hash fragment scrolling
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Small delay to ensure the component has rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    // Handle initial load and navigation
    handleHashScroll();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [activeTab]); // Re-run when tab changes to handle cross-tab navigation

  const loadEnhancedSettings = async () => {
    if (!projectId) return;
    
    try {
      const settings = await getEnhancedSettings(projectId);
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
      console.error('Failed to load enhanced settings:', error);
    }
  };

  // Calculate dynamic ranges based on AI method settings
  const calculateDynamicRanges = () => {
    const { creativityLevel, adaptability, validation, personalization } = aiMethodSettings;
    
    // Base ranges
    let tempRange = { min: 0.1, max: 2.0, recommended: { min: 0.3, max: 1.0 } };
    let topPRange = { min: 0.1, max: 1.0, recommended: { min: 0.7, max: 0.95 } };
    let topKRange = { min: 1, max: 100, recommended: { min: 20, max: 80 } };

    // Adjust based on creativity level (practical ranges for UX applications)
    switch (creativityLevel) {
      case 'conservative':
        // Safe, proven approaches - controlled exploration
        tempRange = { min: 0.6, max: 0.9, recommended: { min: 0.7, max: 0.8 } };
        topPRange = { min: 0.8, max: 0.95, recommended: { min: 0.85, max: 0.9 } };
        topKRange = { min: 40, max: 80, recommended: { min: 50, max: 65 } };
        break;
      case 'balanced':
        // Mix of proven and innovative ideas - industry standard
        tempRange = { min: 0.3, max: 0.8, recommended: { min: 0.5, max: 0.7 } };
        topPRange = { min: 0.6, max: 0.9, recommended: { min: 0.7, max: 0.85 } };
        topKRange = { min: 25, max: 60, recommended: { min: 35, max: 50 } };
        break;
      case 'creative':
        // Novel and innovative suggestions - enhanced diversity
        tempRange = { min: 0.5, max: 1.0, recommended: { min: 0.6, max: 0.8 } };
        topPRange = { min: 0.7, max: 0.95, recommended: { min: 0.8, max: 0.9 } };
        topKRange = { min: 40, max: 70, recommended: { min: 45, max: 60 } };
        break;
      case 'experimental':
        // Cutting-edge, untested approaches - focused on accuracy and consistency
        tempRange = { min: 0.1, max: 0.5, recommended: { min: 0.2, max: 0.4 } };
        topPRange = { min: 0.3, max: 0.7, recommended: { min: 0.5, max: 0.6 } };
        topKRange = { min: 10, max: 30, recommended: { min: 15, max: 25 } };
        break;
    }

    // Adjust based on adaptability method
    if (adaptability === 'static') {
      // Static responses prefer lower ranges for consistency
      tempRange.recommended.max = Math.min(tempRange.recommended.max, 0.7);
      topPRange.recommended.max = Math.min(topPRange.recommended.max, 0.8);
    } else if (adaptability === 'dynamic-learning') {
      // Dynamic learning benefits from higher variability
      tempRange.recommended.min = Math.max(tempRange.recommended.min, 0.6);
      topPRange.recommended.min = Math.max(topPRange.recommended.min, 0.8);
    }

    // Adjust based on validation level
    if (validation === 'comprehensive') {
      // Comprehensive validation can handle higher creativity
      tempRange.max = Math.max(tempRange.max, 1.5);
      topKRange.max = Math.max(topKRange.max, 90);
    } else if (validation === 'none') {
      // No validation requires more conservative settings
      tempRange.recommended.max = Math.min(tempRange.recommended.max, 0.8);
      topPRange.recommended.max = Math.min(topPRange.recommended.max, 0.85);
    }

    // Adjust based on personalization level
    if (personalization === 'adaptive-learning') {
      // Adaptive learning benefits from higher diversity
      tempRange.recommended.min = Math.max(tempRange.recommended.min, 0.6);
      topKRange.recommended.min = Math.max(topKRange.recommended.min, 40);
    }

    return { tempRange, topPRange, topKRange };
  };

  const dynamicRanges = calculateDynamicRanges();

  const handleSaveProjectSettings = async () => {
    if (!project) return;

    const enhancedSettings = {
      industry: selectedIndustry,
      projectContext,
      qualitySettings,
      aiMethodSettings
    };

    try {
      await saveEnhancedSettings(project.id, enhancedSettings);
      toast({
        title: "Settings Saved",
        description: "Project settings have been saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project settings",
        variant: "destructive"
      });
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested project could not be found.
            </p>
            <Button onClick={handleBackToProjects}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={handleBackToProjects}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name} Settings</h1>
                <p className="text-gray-600 mt-1">
                  Configure AI context, quality settings, and methods for this project
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('tab', value);
                return newParams;
              });
            }} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-fit grid-cols-4 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="context"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium py-2.5 px-3 rounded-md transition-all"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Context
                  </TabsTrigger>
                  <TabsTrigger
                    value="quality"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium py-2.5 px-3 rounded-md transition-all"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quality
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai-methods"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium py-2.5 px-3 rounded-md transition-all"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Methods
                  </TabsTrigger>
                  <TabsTrigger
                    value="team"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium py-2.5 px-3 rounded-md transition-all"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </TabsTrigger>
                </TabsList>

                <Button 
                  onClick={handleSaveProjectSettings}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
              
              {/* Context Tab */}
              <TabsContent value="context" className="mt-0">
                <div className="space-y-6">
                  {/* Industry Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Industry Context
                      </CardTitle>
                      <CardDescription>
                        Select your industry to get specialized adaptations and domain-specific considerations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your industry context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General (no industry specific)</SelectItem>
                          <SelectItem value="fintech">Financial Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS/Software</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="government">Government/Public Sector</SelectItem>
                          <SelectItem value="nonprofit">Non-profit</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Project Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Context</CardTitle>
                      <CardDescription>
                        Provide context about your project to improve AI recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primaryGoals">Primary Goals</Label>
                        <Textarea
                          id="primaryGoals"
                          value={projectContext.primaryGoals}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            primaryGoals: e.target.value
                          }))}
                          placeholder="What are the main objectives of this project?"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Input
                          id="targetAudience"
                          value={projectContext.targetAudience}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            targetAudience: e.target.value
                          }))}
                          placeholder="Who is your primary target audience?"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="keyConstraints">Key Constraints</Label>
                        <Textarea
                          id="keyConstraints"
                          value={projectContext.keyConstraints}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            keyConstraints: e.target.value
                          }))}
                          placeholder="What are the main limitations or constraints?"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="successMetrics">Success Metrics</Label>
                        <Input
                          id="successMetrics"
                          value={projectContext.successMetrics}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            successMetrics: e.target.value
                          }))}
                          placeholder="How will you measure success?"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="teamComposition">Team Composition</Label>
                        <Input
                          id="teamComposition"
                          value={projectContext.teamComposition}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            teamComposition: e.target.value
                          }))}
                          placeholder="Who is on your team?"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          value={projectContext.timeline}
                          onChange={(e) => setProjectContext(prev => ({
                            ...prev,
                            timeline: e.target.value
                          }))}
                          placeholder="What's your project timeline?"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Quality Tab */}
              <TabsContent value="quality" className="mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Quality Preferences
                      </CardTitle>
                      <CardDescription>
                        Configure how detailed and comprehensive you want the AI outputs to be
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* AI Methods Tab */}
              <TabsContent value="ai-methods" className="mt-0">
                <div className="space-y-6">
                  {/* Prompt Structure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Prompt Structure Method
                      </CardTitle>
                      <CardDescription>
                        Choose how AI structures and organizes prompts for your UX tools
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                          className={`
                            relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                            ${aiMethodSettings.promptStructure === 'framework-guided' 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => setAiMethodSettings(prev => ({ ...prev, promptStructure: 'framework-guided' }))}
                        >
                          {aiMethodSettings.promptStructure === 'framework-guided' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-semibold text-lg mb-2">Framework-Guided</h3>
                          <p className="text-sm text-muted-foreground">
                            Follows UX methodology structure with stage-based organization and systematic progression through design thinking processes.
                          </p>
                        </div>

                        <div 
                          className={`
                            relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                            ${aiMethodSettings.promptStructure === 'open-ended' 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => setAiMethodSettings(prev => ({ ...prev, promptStructure: 'open-ended' }))}
                        >
                          {aiMethodSettings.promptStructure === 'open-ended' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-semibold text-lg mb-2">Open-Ended</h3>
                          <p className="text-sm text-muted-foreground">
                            Flexible, exploratory prompts that encourage creative thinking and allow for diverse approaches to problem-solving.
                          </p>
                        </div>

                        <div 
                          className={`
                            relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                            ${aiMethodSettings.promptStructure === 'structured-templates' 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => setAiMethodSettings(prev => ({ ...prev, promptStructure: 'structured-templates' }))}
                        >
                          {aiMethodSettings.promptStructure === 'structured-templates' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-semibold text-lg mb-2">Structured Templates</h3>
                          <p className="text-sm text-muted-foreground">
                            Consistent format patterns with predefined sections and standardized layouts for predictable, professional outputs.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Creativity Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Creativity Level</CardTitle>
                      <CardDescription>
                        Control how creative and experimental the AI suggestions should be
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <SelectItem value="experimental">Experimental - Cutting-edge, untested approaches</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Reasoning Approach */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Reasoning Approach</CardTitle>
                      <CardDescription>
                        How AI should structure its reasoning and explanation process
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <SelectItem value="exploratory">Exploratory - Multiple perspectives and options</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Adaptability */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Adaptability Method</CardTitle>
                      <CardDescription>
                        How AI adapts to your context and learns from interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <SelectItem value="static">Static - Fixed responses regardless of context</SelectItem>
                          <SelectItem value="context-aware">Context-Aware - Adapts to project and industry context</SelectItem>
                          <SelectItem value="dynamic-learning">Dynamic Learning - Learns from your preferences over time</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Validation Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Validation & Quality Control</CardTitle>
                      <CardDescription>
                        How AI validates and ensures quality of generated prompts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <SelectItem value="comprehensive">Comprehensive - Extensive quality analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Personalization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalization Level</CardTitle>
                      <CardDescription>
                        How much AI personalizes responses to your specific style and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={aiMethodSettings.personalization} 
                        onValueChange={(value: 'none' | 'basic-profile' | 'user-preferences' | 'adaptive-learning') => 
                          setAiMethodSettings(prev => ({ ...prev, personalization: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None - Generic responses for all users</SelectItem>
                          <SelectItem value="basic-profile">Basic Profile - Uses industry and role information</SelectItem>
                          <SelectItem value="user-preferences">User Preferences - Adapts to your stated preferences</SelectItem>
                          <SelectItem value="adaptive-learning">Adaptive Learning - Learns your style from interactions</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Advanced Parameters */}
                  <Card id="advanced-generation-parameters">
                    <CardHeader>
                      <CardTitle>Advanced Generation Parameters</CardTitle>
                      <CardDescription>
                        Fine-tune AI text generation behavior with advanced sampling parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Temperature Parameter */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Temperature</Label>
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {aiMethodSettings.temperature.toFixed(2)}
                          </span>
                        </div>
                        <div className="px-3 relative">
                          <Slider
                            value={[aiMethodSettings.temperature]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, temperature: value }))
                            }
                            max={dynamicRanges.tempRange.max}
                            min={dynamicRanges.tempRange.min}
                            step={0.1}
                            className="w-full"
                          />
                          {/* Recommended range indicator */}
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 bg-blue-200/50 h-2 rounded pointer-events-none"
                            style={{
                              left: `${((dynamicRanges.tempRange.recommended.min - dynamicRanges.tempRange.min) / (dynamicRanges.tempRange.max - dynamicRanges.tempRange.min)) * 100}%`,
                              width: `${((dynamicRanges.tempRange.recommended.max - dynamicRanges.tempRange.recommended.min) / (dynamicRanges.tempRange.max - dynamicRanges.tempRange.min)) * 100}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dynamicRanges.tempRange.min} (Very focused)</span>
                          <span className="text-blue-600 font-medium">
                            Recommended: {dynamicRanges.tempRange.recommended.min}-{dynamicRanges.tempRange.recommended.max}
                          </span>
                          <span>{dynamicRanges.tempRange.max} (Very creative)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Controls randomness in text generation. Recent research (2024-2025) shows: 
                          <strong> Lower values (0.2-0.5)</strong> = focused, factual responses ideal for technical tasks.
                          <strong> Moderate values (0.6-0.8)</strong> = balanced creativity and coherence.
                          <strong> Higher values (0.8-1.2)</strong> = creative outputs for storytelling and ideation.
                        </p>
                      </div>

                      {/* Top-p Parameter */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Top-p (Nucleus Sampling)</Label>
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {aiMethodSettings.topP.toFixed(2)}
                          </span>
                        </div>
                        <div className="px-3 relative">
                          <Slider
                            value={[aiMethodSettings.topP]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, topP: value }))
                            }
                            max={dynamicRanges.topPRange.max}
                            min={dynamicRanges.topPRange.min}
                            step={0.05}
                            className="w-full"
                          />
                          {/* Recommended range indicator */}
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 bg-blue-200/50 h-2 rounded pointer-events-none"
                            style={{
                              left: `${((dynamicRanges.topPRange.recommended.min - dynamicRanges.topPRange.min) / (dynamicRanges.topPRange.max - dynamicRanges.topPRange.min)) * 100}%`,
                              width: `${((dynamicRanges.topPRange.recommended.max - dynamicRanges.topPRange.recommended.min) / (dynamicRanges.topPRange.max - dynamicRanges.topPRange.min)) * 100}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dynamicRanges.topPRange.min} (Very focused)</span>
                          <span className="text-blue-600 font-medium">
                            Recommended: {dynamicRanges.topPRange.recommended.min.toFixed(2)}-{dynamicRanges.topPRange.recommended.max.toFixed(2)}
                          </span>
                          <span>{dynamicRanges.topPRange.max} (Very diverse)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Controls diversity by limiting tokens to cumulative probability ≤ p (nucleus sampling). 
                          <strong> Lower values (0.3-0.7)</strong> = restrictive, predictable outputs for precision tasks.
                          <strong> Standard range (0.85-0.95)</strong> = optimal balance of diversity and coherence.
                          <strong> Higher values (0.95+)</strong> = maximum diversity, may reduce coherence.
                        </p>
                      </div>

                      {/* Top-k Parameter */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Top-k (Token Limit)</Label>
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {aiMethodSettings.topK}
                          </span>
                        </div>
                        <div className="px-3 relative">
                          <Slider
                            value={[aiMethodSettings.topK]}
                            onValueChange={([value]) => 
                              setAiMethodSettings(prev => ({ ...prev, topK: value }))
                            }
                            max={dynamicRanges.topKRange.max}
                            min={dynamicRanges.topKRange.min}
                            step={1}
                            className="w-full"
                          />
                          {/* Recommended range indicator */}
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 bg-blue-200/50 h-2 rounded pointer-events-none"
                            style={{
                              left: `${((dynamicRanges.topKRange.recommended.min - dynamicRanges.topKRange.min) / (dynamicRanges.topKRange.max - dynamicRanges.topKRange.min)) * 100}%`,
                              width: `${((dynamicRanges.topKRange.recommended.max - dynamicRanges.topKRange.recommended.min) / (dynamicRanges.topKRange.max - dynamicRanges.topKRange.min)) * 100}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dynamicRanges.topKRange.min} (Most focused)</span>
                          <span className="text-blue-600 font-medium">
                            Recommended: {dynamicRanges.topKRange.recommended.min}-{dynamicRanges.topKRange.recommended.max}
                          </span>
                          <span>{dynamicRanges.topKRange.max} (Most diverse)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Limits token selection to the k most probable options at each step. 
                          <strong> Lower values (5-20)</strong> = focused, consistent outputs for technical tasks.
                          <strong> Moderate values (40-60)</strong> = balanced vocabulary diversity.
                          <strong> Higher values (70-100)</strong> = maximum vocabulary variety for creative tasks.
                        </p>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm text-blue-800">
                              <strong>Dynamic Recommendation:</strong> Based on your current settings 
                              ({aiMethodSettings.creativityLevel}, {aiMethodSettings.adaptability}, {aiMethodSettings.validation}), 
                              the optimal ranges are: Temperature {dynamicRanges.tempRange.recommended.min}-{dynamicRanges.tempRange.recommended.max}, 
                              Top-p {dynamicRanges.topPRange.recommended.min.toFixed(2)}-{dynamicRanges.topPRange.recommended.max.toFixed(2)}, 
                              and Top-k {dynamicRanges.topKRange.recommended.min}-{dynamicRanges.topKRange.recommended.max}. 
                              These ranges will update automatically as you change your AI method preferences above.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="mt-0">
                <ProjectInvitations 
                  projectId={projectId || ''} 
                  projectName={project?.name || 'Project'} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}