import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  Lightbulb, 
  Settings, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ChevronRight,
  Info,
  Star,
  Activity
} from 'lucide-react';
import { 
  PromptEngineeringMethod, 
  PromptMethodConfig,
  PromptExecutionContext,
  promptMethodProcessor 
} from '@/lib/prompt-engineering-methods';
import { advancedPromptValidator, MethodValidationResult } from '@/lib/advanced-prompt-validator';
import { templateVariableValidator } from '@/lib/template-variable-validator';

interface PromptEngineeringPanelProps {
  basePrompt: string;
  variables: Record<string, any>;
  context?: {
    taskComplexity: 'simple' | 'moderate' | 'complex';
    domainSpecific: boolean;
    targetAudience: 'practitioners' | 'stakeholders' | 'mixed';
    outputLength: 'brief' | 'moderate' | 'comprehensive';
    userExperience: 'beginner' | 'intermediate' | 'expert';
  };
  onMethodApply: (processedPrompt: string, method: PromptEngineeringMethod, validation?: MethodValidationResult) => void;
  onClose: () => void;
}

export const PromptEngineeringPanel: React.FC<PromptEngineeringPanelProps> = ({
  basePrompt,
  variables,
  context,
  onMethodApply,
  onClose
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PromptEngineeringMethod>('zero-shot');
  const [methodParameters, setMethodParameters] = useState<Record<string, any>>({});
  const [processedPrompt, setProcessedPrompt] = useState<string>('');
  const [validation, setValidation] = useState<MethodValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('method-selection');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get method configuration
  const methodConfig = promptMethodProcessor.getMethodConfig(selectedMethod);
  const allMethods = promptMethodProcessor.getAllMethods();

  // Initialize method parameters when method changes
  useEffect(() => {
    if (methodConfig) {
      const defaultParams: Record<string, any> = {};
      Object.entries(methodConfig.parameters).forEach(([key, config]) => {
        defaultParams[key] = config.default;
      });
      setMethodParameters(defaultParams);
    }
  }, [selectedMethod, methodConfig]);

  // Get method recommendations
  const recommendations = context ? 
    advancedPromptValidator.recommendOptimalMethod(basePrompt, {
      complexity: context.taskComplexity,
      requiresExamples: context.taskComplexity !== 'simple',
      needsMultiplePerspectives: context.targetAudience === 'mixed',
      domainExpertise: context.domainSpecific,
      stepByStepNeeded: context.taskComplexity === 'complex',
      hasKnowledgeBase: Object.keys(variables).length > 3
    }) : null;

  const processPrompt = async () => {
    if (!methodConfig) return;

    setIsProcessing(true);
    try {
      const executionContext: PromptExecutionContext = {
        method: selectedMethod,
        parameters: methodParameters,
        basePrompt,
        variables,
        context: JSON.stringify(context),
        systemRole: methodParameters.role || undefined,
        constraints: methodParameters.constraints ? methodParameters.constraints.split('\n') : undefined
      };

      const processed = promptMethodProcessor.processPrompt(executionContext);
      setProcessedPrompt(processed);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePrompt = async () => {
    if (!processedPrompt) return;

    setIsValidating(true);
    try {
      const validationResult = await advancedPromptValidator.validateAdvancedPrompt(
        processedPrompt,
        selectedMethod,
        context
      );
      setValidation(validationResult);
    } catch (error) {
      console.error('Error validating prompt:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const applyMethod = () => {
    if (processedPrompt) {
      onMethodApply(processedPrompt, selectedMethod, validation || undefined);
    }
  };

  const renderMethodCard = (method: PromptMethodConfig) => {
    const isRecommended = recommendations?.primaryRecommendation === method.id;
    const isAlternative = recommendations?.alternatives.includes(method.id);
    
    return (
      <Card 
        key={method.id}
        className={`cursor-pointer transition-all duration-200 ${
          selectedMethod === method.id 
            ? 'ring-2 ring-primary border-primary' 
            : 'hover:border-primary/50'
        } ${isRecommended ? 'border-green-500 bg-green-50' : ''}`}
        onClick={() => setSelectedMethod(method.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {method.name}
              {isRecommended && (
                <Badge className="bg-green-500 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              )}
              {isAlternative && (
                <Badge variant="secondary" className="text-xs">
                  Alternative
                </Badge>
              )}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                method.complexity === 'basic' ? 'border-green-200 text-green-700' :
                method.complexity === 'intermediate' ? 'border-yellow-200 text-yellow-700' :
                'border-red-200 text-red-700'
              }`}
            >
              {method.complexity}
            </Badge>
          </div>
          <CardDescription className="text-xs text-gray-600">
            {method.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-2">
            {method.bestFor.slice(0, 3).map((use, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {use}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {method.category}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderParameterInput = (paramKey: string, paramConfig: any) => {
    const value = methodParameters[paramKey];

    switch (paramConfig.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => setMethodParameters(prev => ({
              ...prev,
              [paramKey]: parseFloat(e.target.value) || 0
            }))}
            placeholder={String(paramConfig.default)}
          />
        );
      
      case 'boolean':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={(checked) => setMethodParameters(prev => ({
              ...prev,
              [paramKey]: checked
            }))}
          />
        );
      
      case 'array':
        return (
          <Textarea
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) => setMethodParameters(prev => ({
              ...prev,
              [paramKey]: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="Enter comma-separated values"
            rows={2}
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setMethodParameters(prev => ({
              ...prev,
              [paramKey]: e.target.value
            }))}
            placeholder={String(paramConfig.default || '')}
          />
        );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Focus trap - focus the modal when it opens
    const modalElement = document.querySelector('[data-modal="prompt-engineering-panel"]') as HTMLElement;
    if (modalElement) {
      modalElement.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure proper cleanup
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      document.body.focus();
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
        const existingBackdrops = document.querySelectorAll('[data-modal="prompt-engineering-panel"]');
        existingBackdrops.forEach(backdrop => {
          // Only remove if it's actually orphaned
          if (backdrop.parentElement === document.body && !backdrop.querySelector('[data-react-fiber]')) {
            backdrop.remove();
          }
        });
      }, 100); // Slightly longer delay to ensure React cleanup is complete
    };
  }, []);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-modal="prompt-engineering-panel"
        tabIndex={-1}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                Advanced Prompt Engineering
              </h2>
              <p className="text-gray-600 mt-1">
                Apply sophisticated prompt engineering methods for enhanced AI interactions
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="method-selection">Method Selection</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="method-selection" className="space-y-6">
              {/* Recommendations */}
              {recommendations && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendation:</strong> {recommendations.reasoning}
                  </AlertDescription>
                </Alert>
              )}

              {/* Method Categories */}
              <div className="space-y-4">
                {['reasoning', 'instruction', 'context', 'creative'].map(category => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg capitalize mb-3 flex items-center gap-2">
                      {category === 'reasoning' && <Brain className="w-5 h-5" />}
                      {category === 'instruction' && <Target className="w-5 h-5" />}
                      {category === 'context' && <Info className="w-5 h-5" />}
                      {category === 'creative' && <Lightbulb className="w-5 h-5" />}
                      {category} Methods
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allMethods
                        .filter(method => method.category === category)
                        .map(renderMethodCard)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              {methodConfig && (
                <>
                  {/* Method Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {methodConfig.name} Configuration
                      </CardTitle>
                      <CardDescription>{methodConfig.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{methodConfig.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline"
                            className={
                              methodConfig.complexity === 'basic' ? 'border-green-200 text-green-700' :
                              methodConfig.complexity === 'intermediate' ? 'border-yellow-200 text-yellow-700' :
                              'border-red-200 text-red-700'
                            }
                          >
                            {methodConfig.complexity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parameters */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Method Parameters</CardTitle>
                      <CardDescription>
                        Configure specific parameters for {methodConfig.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(methodConfig.parameters).map(([paramKey, paramConfig]) => (
                        <div key={paramKey} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            {paramKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {paramConfig.required && <span className="text-red-500">*</span>}
                          </Label>
                          {renderParameterInput(paramKey, paramConfig)}
                          <p className="text-sm text-gray-500">{paramConfig.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Best Practices */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Best Practices</CardTitle>
                      <CardDescription>
                        Recommended use cases and guidelines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Best For:</h4>
                          <div className="flex flex-wrap gap-2">
                            {methodConfig.bestFor.map((use, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {use}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {methodConfig.examples && methodConfig.examples.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Example Use Case:</h4>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <p><strong>Context:</strong> {methodConfig.examples[0].context}</p>
                              <p><strong>Input:</strong> {methodConfig.examples[0].input}</p>
                              <p><strong>Expected Output:</strong> {methodConfig.examples[0].output}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {/* Processing Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Processing</CardTitle>
                  <CardDescription>
                    Generate the processed prompt using {methodConfig?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      onClick={processPrompt} 
                      disabled={isProcessing || !methodConfig}
                      className="flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Process Prompt'}
                    </Button>
                    {processedPrompt && (
                      <Button 
                        variant="outline" 
                        onClick={validatePrompt}
                        disabled={isValidating}
                      >
                        {isValidating ? 'Validating...' : 'Validate Quality'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Processed Prompt */}
              {processedPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Processed Prompt</CardTitle>
                    <CardDescription>
                      Enhanced prompt using {methodConfig?.name} methodology
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {processedPrompt}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="outline">
                        {processedPrompt.length} characters
                      </Badge>
                      <Badge variant="outline">
                        {processedPrompt.split(/\s+/).length} words
                      </Badge>
                      <Badge variant="outline">
                        {methodConfig?.name}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              {validation ? (
                <>
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Quality Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Overall Quality Score</span>
                            <span className="font-bold text-lg">
                              {validation.overallScore}/100
                            </span>
                          </div>
                          <Progress value={validation.overallScore} className="h-3" />
                          <Badge 
                            variant={
                              validation.category === 'excellent' ? 'default' :
                              validation.category === 'good' ? 'secondary' :
                              validation.category === 'fair' ? 'outline' : 'destructive'
                            }
                            className="mt-2"
                          >
                            {validation.category.toUpperCase()}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Method Effectiveness</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={validation.methodSpecific.methodEffectiveness} className="flex-1 h-2" />
                              <span>{validation.methodSpecific.methodEffectiveness}%</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Coherence</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={validation.methodSpecific.coherenceScore} className="flex-1 h-2" />
                              <span>{validation.methodSpecific.coherenceScore}%</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Complexity Handling</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={validation.methodSpecific.complexityHandling} className="flex-1 h-2" />
                              <span>{validation.methodSpecific.complexityHandling}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    {validation.summary.strengths.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {validation.summary.strengths.map((strength, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Improvements */}
                    {validation.summary.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-blue-700 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Improvements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {validation.summary.recommendations.slice(0, 5).map((rec, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <ChevronRight className="w-3 h-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Critical Issues */}
                  {validation.summary.criticalIssues.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Critical Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {validation.summary.criticalIssues.map((issue, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-red-700">
                              <AlertCircle className="w-3 h-3" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Process and validate a prompt to see quality assessment</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'method-selection' && (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('method-selection')}
              >
                Back to Selection
              </Button>
            )}
            <Button 
              onClick={applyMethod} 
              disabled={!processedPrompt}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply Method
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};