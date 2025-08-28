/**
 * @fileoverview Enhanced Context Panel
 * UI component for enhanced context integration with workflow continuity and intelligent variable processing
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Target,
  BookOpen,
  BarChart,
  Settings,
  Eye
} from 'lucide-react';

import { usePromptStore } from '@/stores/prompt-store';
import { useKnowledgeStore } from '@/stores/knowledge-store';
import { useProjectStore } from '@/stores/project-store';
import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { EnhancedToolPromptTemplate } from '@/lib/tool-templates-enhanced';
import { 
  IntegratedContextRequest, 
  IntegratedContextResponse,
  QualityMetrics 
} from '@/lib/enhanced-context-integration-service';

interface EnhancedContextPanelProps {
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  template: EnhancedToolPromptTemplate;
  userInputs: Record<string, any>;
  onGenerate: (response: IntegratedContextResponse) => void;
  onClose: () => void;
}

export const EnhancedContextPanel: React.FC<EnhancedContextPanelProps> = ({
  framework,
  stage,
  tool,
  template,
  userInputs,
  onGenerate,
  onClose
}) => {
  const { generateEnhancedContextPrompt, isGenerating } = usePromptStore();
  const { entries } = useKnowledgeStore();
  const { currentProject } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState('context-preview');
  const [contextResponse, setContextResponse] = useState<IntegratedContextResponse | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    accessibilityLevel: 'enhanced' as const,
    outputDetailLevel: 'comprehensive' as const,
    includeResearchBacking: true,
    includeExamples: true,
    communicationStyle: 'conversational' as const,
    industryFocus: 'technology'
  });

  // Generate context preview on component mount
  useEffect(() => {
    generateContextPreview();
  }, [framework, stage, tool, template, userInputs]);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure proper cleanup
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [onClose]);

  // Additional cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Use setTimeout to allow React/framer-motion to complete cleanup first
      setTimeout(() => {
        // Force cleanup only after React is done
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        // Only remove truly orphaned modal backdrops
        const existingBackdrops = document.querySelectorAll('[data-modal="enhanced-context-panel"]');
        existingBackdrops.forEach(backdrop => {
          // Only remove if it's actually orphaned
          if (backdrop.parentElement === document.body && !backdrop.querySelector('[data-react-fiber]')) {
            backdrop.remove();
          }
        });
      }, 100); // Slightly longer delay to ensure React cleanup is complete
    };
  }, []);

  const generateContextPreview = async () => {
    if (!currentProject) return;

    try {
      const request: IntegratedContextRequest = {
        projectId: currentProject.id,
        framework,
        stage,
        tool,
        template,
        userInputs,
        userPreferences
      };

      const response = await generateEnhancedContextPrompt(request);
      setContextResponse(response);
    } catch (error) {
      console.error('Error generating context preview:', error);
    }
  };

  const handleGenerate = () => {
    if (contextResponse) {
      onGenerate(contextResponse);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // Regenerate preview with new preferences
    setTimeout(generateContextPreview, 300);
  };

  const renderQualityMetrics = (metrics: QualityMetrics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(metrics.contextRichness * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Context Richness</div>
            <Progress value={metrics.contextRichness * 100} className="mt-1 h-1" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.variableCompleteness * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Variable Complete</div>
            <Progress value={metrics.variableCompleteness * 100} className="mt-1 h-1" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.accessibilityCompliance * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Accessibility</div>
            <Progress value={metrics.accessibilityCompliance * 100} className="mt-1 h-1" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(metrics.overallQuality * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Overall Quality</div>
            <Progress value={metrics.overallQuality * 100} className="mt-1 h-1" />
          </div>
        </Card>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Confidence Score</span>
        <div className="flex items-center gap-2">
          <Progress value={metrics.confidenceScore * 100} className="w-24 h-2" />
          <span className="text-sm text-muted-foreground">
            {Math.round(metrics.confidenceScore * 100)}%
          </span>
        </div>
      </div>
    </div>
  );

  const renderContextSources = (response: IntegratedContextResponse) => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Knowledge Base Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {response.processedContext.relevantKnowledge.length > 0 ? (
            <div className="space-y-2">
              {response.processedContext.relevantKnowledge.slice(0, 3).map((knowledge, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{knowledge.title}</div>
                    <div className="text-xs text-muted-foreground">{knowledge.connectionToCurrentTask}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(knowledge.relevanceScore * 100)}% relevant
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {knowledge.extractedInsights.length} insights
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No relevant knowledge base entries found</p>
              <p className="text-xs">Consider adding project documentation or research data</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Workflow Continuity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {response.workflowContinuity.previousStageOutputs.length > 0 ? (
            <div className="space-y-2">
              {response.workflowContinuity.previousStageOutputs.slice(0, 2).map((output, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-green-50 rounded">
                  <Target className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {output.context.stage.name} - {output.context.tool.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {output.content.substring(0, 120)}...
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {new Date(output.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {response.workflowContinuity.consistencyChecks.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Consistency Checks</span>
                  </div>
                  {response.workflowContinuity.consistencyChecks.slice(0, 2).map((check, index) => (
                    <div key={index} className="text-xs text-yellow-700 ml-6">
                      • {check.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No previous workflow outputs</p>
              <p className="text-xs">This appears to be the first stage in your workflow</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsAndRecommendations = (response: IntegratedContextResponse) => (
    <div className="space-y-4">
      {response.processedContext.contextualInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-purple-500" />
              Contextual Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {response.processedContext.contextualInsights.slice(0, 5).map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {response.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {response.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {response.warnings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {response.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-modal="enhanced-context-panel">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Enhanced Context Integration</h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  AI-Powered
                </Badge>
              </div>
              <p className="text-gray-700">
                {tool.name} in {stage.name} stage of {framework.name}
              </p>
              {contextResponse && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BarChart className="w-3 h-3" />
                    {Math.round(contextResponse.qualityMetrics.overallQuality * 100)}% Quality
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {contextResponse.processedContext.relevantKnowledge.length} Knowledge Items
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {contextResponse.workflowContinuity.previousStageOutputs.length} Previous Outputs
                  </Badge>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Brain className="w-12 h-12 animate-pulse text-purple-500 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Processing Enhanced Context</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing knowledge base, workflow continuity, and variable processing...
                </p>
              </div>
            </div>
          ) : contextResponse ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="context-preview">Context Preview</TabsTrigger>
                <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
                <TabsTrigger value="sources">Context Sources</TabsTrigger>
                <TabsTrigger value="insights">Insights & Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="context-preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      Generated Prompt Preview
                    </CardTitle>
                    <CardDescription>
                      Preview of the enhanced context-integrated prompt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                        {contextResponse.synthesizedPrompt}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality-metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-green-500" />
                      Quality Assessment
                    </CardTitle>
                    <CardDescription>
                      Comprehensive quality metrics for the enhanced context integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderQualityMetrics(contextResponse.qualityMetrics)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                {renderContextSources(contextResponse)}
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {renderInsightsAndRecommendations(contextResponse)}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Context Processing Failed</p>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to process enhanced context. Please check your inputs and try again.
              </p>
              <Button onClick={generateContextPreview} variant="outline">
                Retry Processing
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Powered by Enhanced Context Integration
            </div>
            {contextResponse && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                {userPreferences.outputDetailLevel} mode
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!contextResponse || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Generate Enhanced Prompt
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};