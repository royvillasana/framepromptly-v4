import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeDocumentEditor } from '@/components/project/knowledge-document-editor';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, FileText, Target, CheckCircle, Brain, FolderOpen, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgeDocument() {
  const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, fetchProjects, saveEnhancedSettings, getEnhancedSettings } = useProjectStore();
  const { entries, fetchEntries, addTextEntry } = useKnowledgeStore();
  const [project, setProject] = useState(projects.find(p => p.id === projectId));
  const [document, setDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('document');
  const [isNewDocument] = useState(searchParams.get('new') === 'true');

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

  useEffect(() => {
    if (!projects.length) {
      fetchProjects();
    }
  }, [fetchProjects, projects.length]);

  useEffect(() => {
    if (projects.length && projectId) {
      const foundProject = projects.find(p => p.id === projectId);
      setProject(foundProject);
      
      if (foundProject) {
        fetchEntries(foundProject.id);
        
        // Load existing enhanced settings
        const existingSettings = getEnhancedSettings(foundProject.id);
        if (existingSettings) {
          setSelectedIndustry(existingSettings.industry);
          setProjectContext(existingSettings.projectContext);
          setQualitySettings(existingSettings.qualitySettings);
        }
      }
    }
  }, [projects, projectId, fetchEntries, getEnhancedSettings]);

  useEffect(() => {
    if (entries.length && documentId && !isNewDocument) {
      const foundDocument = entries.find(e => e.id === documentId);
      setDocument(foundDocument);
    } else if (isNewDocument) {
      // Create a new document structure
      setDocument({
        id: documentId,
        title: 'Untitled Document',
        content: '',
        type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [entries, documentId, isNewDocument]);

  const handleBackToKnowledgeBase = () => {
    navigate(`/knowledge/${projectId}`);
  };

  const handleDocumentSaved = () => {
    // Optionally stay on page or navigate back
    toast({
      title: "Document Saved",
      description: "Your document has been saved successfully"
    });
  };

  const handleSaveProjectContext = async () => {
    if (!project) return;

    const enhancedSettings = {
      industry: selectedIndustry,
      projectContext,
      qualitySettings
    };

    try {
      await saveEnhancedSettings(project.id, enhancedSettings);
      toast({
        title: "Project Context Saved",
        description: "Enhanced prompt settings have been saved for this project"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save enhanced prompt settings",
        variant: "destructive"
      });
    }
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
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested document could not be found.
            </p>
            <Button onClick={handleBackToKnowledgeBase}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Base
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
                onClick={handleBackToKnowledgeBase}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Knowledge Base
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{project.name}</span>
                <span className="text-sm text-gray-400">/</span>
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Knowledge Base</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
                <p className="text-gray-600 mt-1">
                  {isNewDocument ? 'Create new document' : 'Edit document'} with AI-enhanced editing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Editor with Tabs */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-fit grid-cols-4 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="document" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium py-2.5 px-3 rounded-md transition-all"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Document
                  </TabsTrigger>
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
                </TabsList>

                <Button 
                  onClick={handleSaveProjectContext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
              
              {/* Document Editor Tab */}
              <TabsContent value="document" className="mt-0">
                <div className="bg-white rounded-lg border shadow-sm">
                  <KnowledgeDocumentEditor 
                    projectId={project.id}
                    entries={document ? [document] : []}
                    selectedDocumentId={document?.id}
                    onDocumentSaved={handleDocumentSaved}
                  />
                </div>
              </TabsContent>
              
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

                  {/* Project Context Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Core Project Information</CardTitle>
                      <CardDescription>
                        Define key project parameters that will be used for AI enhancement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary-goals">Primary Goals</Label>
                          <Textarea
                            id="primary-goals"
                            value={projectContext.primaryGoals}
                            onChange={(e) => setProjectContext(prev => ({...prev, primaryGoals: e.target.value}))}
                            placeholder="What are the main objectives of this project?"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="target-audience">Target Audience</Label>
                          <Textarea
                            id="target-audience"
                            value={projectContext.targetAudience}
                            onChange={(e) => setProjectContext(prev => ({...prev, targetAudience: e.target.value}))}
                            placeholder="Who are the primary users or stakeholders?"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="key-constraints">Key Constraints</Label>
                          <Textarea
                            id="key-constraints"
                            value={projectContext.keyConstraints}
                            onChange={(e) => setProjectContext(prev => ({...prev, keyConstraints: e.target.value}))}
                            placeholder="Budget, time, technical, or resource limitations"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="success-metrics">Success Metrics</Label>
                          <Textarea
                            id="success-metrics"
                            value={projectContext.successMetrics}
                            onChange={(e) => setProjectContext(prev => ({...prev, successMetrics: e.target.value}))}
                            placeholder="How will you measure project success?"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="team-composition">Team Composition</Label>
                          <Input
                            id="team-composition"
                            value={projectContext.teamComposition}
                            onChange={(e) => setProjectContext(prev => ({...prev, teamComposition: e.target.value}))}
                            placeholder="UX researcher, designer, product manager..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeline">Project Timeline</Label>
                          <Input
                            id="timeline"
                            value={projectContext.timeline}
                            onChange={(e) => setProjectContext(prev => ({...prev, timeline: e.target.value}))}
                            placeholder="6 months, Q1 2024, etc."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Quality Settings Tab */}
              <TabsContent value="quality" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Output Quality Configuration
                    </CardTitle>
                    <CardDescription>
                      Set the depth and detail level for AI-generated content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="methodology-depth">Methodology Depth</Label>
                        <Select 
                          value={qualitySettings.methodologyDepth} 
                          onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => setQualitySettings(prev => ({...prev, methodologyDepth: value}))}
                        >
                          <SelectTrigger id="methodology-depth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic - Quick and straightforward</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Balanced depth</SelectItem>
                            <SelectItem value="advanced">Advanced - Comprehensive and detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="output-detail">Output Detail Level</Label>
                        <Select 
                          value={qualitySettings.outputDetail} 
                          onValueChange={(value: 'brief' | 'moderate' | 'comprehensive') => setQualitySettings(prev => ({...prev, outputDetail: value}))}
                        >
                          <SelectTrigger id="output-detail">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brief">Brief - Concise and focused</SelectItem>
                            <SelectItem value="moderate">Moderate - Balanced detail</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive - Detailed and thorough</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="time-constraints">Time Constraints</Label>
                        <Select 
                          value={qualitySettings.timeConstraints} 
                          onValueChange={(value: 'urgent' | 'standard' | 'extended') => setQualitySettings(prev => ({...prev, timeConstraints: value}))}
                        >
                          <SelectTrigger id="time-constraints">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent - Quick turnaround needed</SelectItem>
                            <SelectItem value="standard">Standard - Normal timeline</SelectItem>
                            <SelectItem value="extended">Extended - Ample time available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="industry-compliance"
                          checked={qualitySettings.industryCompliance}
                          onChange={(e) => setQualitySettings(prev => ({...prev, industryCompliance: e.target.checked}))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="industry-compliance">Include industry compliance considerations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="accessibility-focus"
                          checked={qualitySettings.accessibilityFocus}
                          onChange={(e) => setQualitySettings(prev => ({...prev, accessibilityFocus: e.target.checked}))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="accessibility-focus">Emphasize accessibility and inclusion</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* AI Methods Tab */}
              <TabsContent value="ai-methods" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Available AI Enhancement Methods
                    </CardTitle>
                    <CardDescription>
                      These methods will be available when generating enhanced prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Chain of Thought</h4>
                        <p className="text-sm text-muted-foreground">
                          Break down complex reasoning into step-by-step processes
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Few-Shot Learning</h4>
                        <p className="text-sm text-muted-foreground">
                          Provide examples to guide AI output format and quality
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Role-Based Prompting</h4>
                        <p className="text-sm text-muted-foreground">
                          Assign specific expert roles to enhance domain knowledge
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Constraint-Based</h4>
                        <p className="text-sm text-muted-foreground">
                          Apply specific constraints and criteria to outputs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}