import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useKnowledgeStore, KnowledgeEntry } from '@/stores/knowledge-store';
import { useProjectStore, Project } from '@/stores/project-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Plus, Upload, FileText, Image, Trash2, Edit3, 
  Settings, Brain, Sparkles, Target, Users, Clock, 
  Lightbulb, CheckCircle, AlertCircle, X, Save,
  ArrowLeft, Zap, BookOpen
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { KnowledgeDocumentEditor } from './knowledge-document-editor';
import { KnowledgeDocumentList } from './knowledge-document-list';

interface ProjectKnowledgeManagerProps {
  project: Project;
  onClose: () => void;
}

export const ProjectKnowledgeManager: React.FC<ProjectKnowledgeManagerProps> = ({ project, onClose }) => {
  const { toast } = useToast();
  const { isGenerating } = usePromptStore();
  const { 
    entries, 
    isLoading, 
    error, 
    fetchEntries, 
    addTextEntry, 
    uploadFile, 
    deleteEntry,
    updateEntry,
    clearError 
  } = useKnowledgeStore();

  const [activeTab, setActiveTab] = useState('knowledge');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  
  // Document management state
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentList, setShowDocumentList] = useState(true);
  
  // Knowledge base state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Enhanced prompt state
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general');
  const [projectContext, setProjectContext] = useState({
    primaryGoals: '',
    targetAudience: '',
    keyConstraints: '',
    successMetrics: '',
    teamComposition: '',
    timeline: '',
    budget: '',
    technicalRequirements: ''
  });
  const [qualitySettings, setQualitySettings] = useState({
    methodologyDepth: 'intermediate',
    outputDetail: 'moderate',
    timeConstraints: 'standard',
    industryCompliance: false,
    accessibilityFocus: false
  });

  useEffect(() => {
    if (project?.id) {
      fetchEntries(project.id);
      
      // Load existing enhanced settings
      const { getEnhancedSettings } = useProjectStore.getState();
      const existingSettings = getEnhancedSettings(project.id);
      
      if (existingSettings) {
        setSelectedIndustry(existingSettings.industry);
        setProjectContext(existingSettings.projectContext);
        setQualitySettings(existingSettings.qualitySettings);
      }
    }
  }, [project?.id, fetchEntries]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Clean up content for display
  const cleanContent = (content: string): string => {
    if (!content) return '';
    return content
      .replace(/[%&<>{}\\[\]@#$^*+=|~`]/g, ' ')
      .replace(/[^\w\s.,!?()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s*[\d\s]*obj\s*/gi, '')
      .replace(/endstream|endobj|stream/gi, '')
      .trim();
  };

  const handleAddTextEntry = async () => {
    if (!project || !textTitle.trim() || !textContent.trim()) return;
    
    try {
      await addTextEntry(project.id, textTitle.trim(), textContent.trim());
      setTextTitle('');
      setTextContent('');
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Text entry added to knowledge base"
      });
    } catch (error) {
      console.error('Error adding text entry:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!project || !selectedFile) return;

    try {
      await uploadFile(project.id, selectedFile, uploadTitle.trim() || undefined);
      setSelectedFile(null);
      setUploadTitle('');
      setShowUploadDialog(false);
      toast({
        title: "Success",
        description: "File uploaded and processed successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      toast({
        title: "Success",
        description: "Entry deleted from knowledge base"
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = async (id: string, title: string, content: string) => {
    try {
      await updateEntry(id, { title, content });
      setEditingEntry(null);
      toast({
        title: "Success",
        description: "Entry updated successfully"
      });
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleSaveProjectContext = async () => {
    if (!project) return;

    const { saveEnhancedSettings } = useProjectStore.getState();
    
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

  // Document selection handlers
  const handleSelectDocument = (document: any) => {
    setSelectedDocument(document);
    setShowDocumentList(false);
    setActiveTab('document'); // Default to document tab when opening a document
  };

  const handleBackToDocumentList = () => {
    setSelectedDocument(null);
    setShowDocumentList(true);
  };

  const handleCreateNewDocument = () => {
    const newDocument = {
      id: `new-${Date.now()}`,
      title: 'Untitled Document',
      content: '',
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedDocument(newDocument);
    setShowDocumentList(false);
    setActiveTab('document'); // Default to document tab when creating new document
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!project) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full h-full bg-background flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Project Knowledge Manager</h2>
              </div>
              <p className="text-gray-700 mb-2">
                Manage knowledge base and enhanced prompt settings for "{project.name}"
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {entries.length} Knowledge Entries
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  <Settings className="w-3 h-3 mr-1" />
                  Enhanced Prompts Ready
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full w-10 h-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Main Document Management Interface */}
          {showDocumentList ? (
            /* Document List View - Full Width */
            <KnowledgeDocumentList 
              projectId={project.id}
              entries={entries}
              onSelectDocument={handleSelectDocument}
              onCreateNew={handleCreateNewDocument}
            />
          ) : (
            // Document Editor View with Tabs
            <div className="h-full flex flex-col">
              {/* Document Editor Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToDocumentList}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Documents
                  </Button>
                  <div className="h-6 w-px bg-gray-300" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedDocument?.title}</h4>
                    <p className="text-sm text-gray-500">
                      {selectedDocument?.id.startsWith('new-') ? 'New Document' : 'Editing Document'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Document Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-6 pt-4 border-b border-gray-100">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
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
                </div>
                
                <div className="flex-1 overflow-hidden">
                  {/* Document Editor Tab */}
                  <TabsContent value="document" className="mt-0 h-full overflow-hidden">
                    <div className="h-full overflow-y-auto scrollable-area">
                      <KnowledgeDocumentEditor 
                        projectId={project.id}
                        entries={selectedDocument ? [selectedDocument] : []}
                        selectedDocumentId={selectedDocument?.id}
                        onDocumentSaved={handleBackToDocumentList}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Context Tab */}
                  <TabsContent value="context" className="mt-0 h-full overflow-hidden">
                    <div className="h-full overflow-y-auto scrollable-area p-6">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Document Context Instructions</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Configure context settings that will enhance AI processing for this specific document.
                          </p>
                        </div>

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
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              Core Project Information
                            </CardTitle>
                            <CardDescription>
                              Define key project parameters that will be used for AI enhancement of this document
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
                    </div>
                  </TabsContent>
                  
                  {/* Quality Settings Tab */}
                  <TabsContent value="quality" className="mt-0 h-full overflow-hidden">
                    <div className="h-full overflow-y-auto scrollable-area p-6">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Document Quality Settings</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Configure quality parameters and output preferences for AI enhancement of this document
                          </p>
                        </div>

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
                                  onValueChange={(value) => setQualitySettings(prev => ({...prev, methodologyDepth: value}))}
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
                                  onValueChange={(value) => setQualitySettings(prev => ({...prev, outputDetail: value}))}
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
                                  onValueChange={(value) => setQualitySettings(prev => ({...prev, timeConstraints: value}))}
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
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* AI Methods Tab */}
                  <TabsContent value="ai-methods" className="mt-0 h-full overflow-hidden">
                    <div className="h-full overflow-y-auto scrollable-area p-6">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">AI Enhancement Methods</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Configure advanced AI prompt engineering techniques for this document
                          </p>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-600" />
                              Available AI Enhancement Methods
                            </CardTitle>
                            <CardDescription>
                              These methods will be available when generating enhanced prompts for this document
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-blue-500" />
                                  Chain of Thought
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Break down complex reasoning into step-by-step processes
                                </p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-green-500" />
                                  Few-Shot Learning
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Provide examples to guide AI output format and quality
                                </p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-orange-500" />
                                  Role-Based Prompting
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Assign specific expert roles to enhance domain knowledge
                                </p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-purple-500" />
                                  Constraint-Based
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Apply specific constraints and criteria to outputs
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-blue-900 mb-1">Smart Method Selection</h4>
                                  <p className="text-sm text-blue-700">
                                    The system will automatically recommend the most appropriate AI methods based on your 
                                    project context, industry, and task complexity when generating enhanced prompts.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-6 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            
            {/* Only show Save Configuration when document is opened */}
            {!showDocumentList && (
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveProjectContext} 
                  disabled={isGenerating}
                  className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Edit Entry Form Component
interface EditEntryFormProps {
  entry: KnowledgeEntry;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

const EditEntryForm: React.FC<EditEntryFormProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);

  return (
    <div className="space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={4}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(title, content)}>
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
};