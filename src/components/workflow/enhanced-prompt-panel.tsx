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
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Star, Clock, Users, Lightbulb, Target, Brain, Zap } from 'lucide-react';
import { usePromptStore } from '@/stores/prompt-store';
import { EnhancedToolPromptTemplate } from '@/lib/tool-templates-enhanced';
import { PromptEngineeringPanel } from './prompt-engineering-panel';
import { PromptEngineeringMethod } from '@/lib/prompt-engineering-methods';
import { MethodValidationResult } from '@/lib/advanced-prompt-validator';

interface EnhancedPromptPanelProps {
  template: EnhancedToolPromptTemplate;
  onGenerate: (variables: Record<string, any>, enhancedContext: any) => void;
  onClose: () => void;
}

export const EnhancedPromptPanel: React.FC<EnhancedPromptPanelProps> = ({
  template,
  onGenerate,
  onClose
}) => {
  const { isGenerating, currentPrompt } = usePromptStore();
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('configure');
  const [showPromptEngineering, setShowPromptEngineering] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  // Initialize variables with defaults
  useEffect(() => {
    const defaultVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        defaultVariables[variable.id] = variable.defaultValue;
      } else if (variable.required) {
        // For required fields, provide meaningful defaults based on type
        switch (variable.type) {
          case 'number':
            // Provide meaningful defaults for specific number fields
            if (variable.id === 'sampleSize') {
              defaultVariables[variable.id] = 15; // Good default for research sample size
            } else {
              defaultVariables[variable.id] = variable.validation?.min || 1;
            }
            break;
          case 'select':
            defaultVariables[variable.id] = variable.options?.[0] || '';
            break;
          case 'textarea':
            // Provide contextual placeholder for textarea fields
            if (variable.id === 'dataSources') {
              defaultVariables[variable.id] = 'User interviews, surveys, analytics data, support tickets';
            } else if (variable.id === 'teamComposition') {
              defaultVariables[variable.id] = 'UX researcher, product manager, designer';
            } else if (variable.id === 'researchMethods') {
              defaultVariables[variable.id] = 'User interviews, behavioral analytics, survey data, usability testing';
            } else if (variable.id === 'primaryGoal') {
              defaultVariables[variable.id] = 'Complete the main task efficiently and successfully';
            } else {
              defaultVariables[variable.id] = `Please specify ${variable.name.toLowerCase()}`;
            }
            break;
          case 'text':
            // Provide contextual placeholder for text fields
            if (variable.id === 'projectName') {
              defaultVariables[variable.id] = 'Project Name';
            } else if (variable.id === 'personaName') {
              defaultVariables[variable.id] = 'Primary User';
            } else {
              defaultVariables[variable.id] = `Please specify ${variable.name.toLowerCase()}`;
            }
            break;
          default:
            defaultVariables[variable.id] = `Please specify ${variable.name.toLowerCase()}`;
        }
      } else {
        defaultVariables[variable.id] = variable.type === 'number' ? 0 : '';
      }
    });
    setVariables(defaultVariables);

    // Initialize customizations with defaults
    const defaultCustomizations: Record<string, any> = {};
    template.customizationOptions?.forEach(option => {
      if (option.default !== undefined) {
        defaultCustomizations[option.id] = option.default;
      }
    });
    setCustomizations(defaultCustomizations);

    // Research-backed context can be added here if needed
  }, [template]);

  // Cleanup effect to ensure portal is properly removed on unmount
  useEffect(() => {
    return () => {
      // Use setTimeout to allow React/framer-motion to complete cleanup first
      setTimeout(() => {
        // Force cleanup only after React is done
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        // Only remove truly orphaned modal backdrops
        const existingBackdrops = document.querySelectorAll('[data-modal="enhanced-prompt-panel"]');
        existingBackdrops.forEach(backdrop => {
          // Only remove if it's actually orphaned
          if (backdrop.parentElement === document.body && !backdrop.querySelector('[data-react-fiber]')) {
            backdrop.remove();
          }
        });
      }, 100); // Slightly longer delay to ensure React cleanup is complete
    };
  }, []);

  const handleVariableChange = (variableId: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [variableId]: value
    }));
  };

  const handleCustomizationChange = (customizationId: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [customizationId]: value
    }));
  };

  const validateForm = () => {
    const { validateTemplateVariables } = usePromptStore.getState();
    const validation = validateTemplateVariables(template.id, variables);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleGenerate = () => {
    console.log('Enhanced Prompt Panel - Generate clicked');
    console.log('Variables:', variables);
    console.log('Template variables:', template.variables);
    
    if (!validateForm()) {
      console.log('Validation failed:', validationErrors);
      return;
    }

    const enhancedContext = {
      industry: selectedIndustry === 'general' ? undefined : selectedIndustry,
      customizations,
      qualityLevel: customizations.methodologyDepth?.toLowerCase() || 'intermediate',
      timeConstraints: customizations.timeConstraints?.toLowerCase() || 'standard',
    };

    console.log('Enhanced context:', enhancedContext);

    // First generate the base prompt
    const basePromptContent = processTemplateVariables(template.template, variables);
    setGeneratedPrompt(basePromptContent);
    
    onGenerate(variables, enhancedContext);
    setActiveTab('preview');
  };

  const processTemplateVariables = (template: string, vars: Record<string, any>): string => {
    let processed = template;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    return processed;
  };

  const handlePromptEngineeringApply = (
    processedPrompt: string, 
    method: PromptEngineeringMethod, 
    validation?: MethodValidationResult
  ) => {
    setGeneratedPrompt(processedPrompt);
    setShowPromptEngineering(false);
    
    // Update the enhanced context with the applied method
    const enhancedContext = {
      industry: selectedIndustry === 'general' ? undefined : selectedIndustry,
      customizations: {
        ...customizations,
        promptEngineeringMethod: method,
        methodValidation: validation
      },
      qualityLevel: customizations.methodologyDepth?.toLowerCase() || 'intermediate',
      timeConstraints: customizations.timeConstraints?.toLowerCase() || 'standard',
    };

    // Call the parent's onGenerate with the processed prompt
    onGenerate(variables, enhancedContext);
    setActiveTab('preview');
  };

  const renderVariableInput = (variable: any) => {
    const value = variables[variable.id] || '';

    switch (variable.type) {
      case 'textarea':
        return (
          <Textarea
            id={variable.id}
            value={value}
            onChange={(e) => handleVariableChange(variable.id, e.target.value)}
            placeholder={variable.description}
            className="min-h-24 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleVariableChange(variable.id, v)}>
            <SelectTrigger 
              id={variable.id}
              className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {variable.options?.map((option: string) => (
                <SelectItem key={option} value={option} className="text-base py-3">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            id={variable.id}
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.id, parseInt(e.target.value) || 0)}
            placeholder={variable.description}
            min={variable.validation?.min}
            max={variable.validation?.max}
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={variable.id}
              checked={value}
              onCheckedChange={(checked) => handleVariableChange(variable.id, checked)}
              className="w-5 h-5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor={variable.id} className="text-sm text-gray-700 font-normal">
              {variable.description}
            </Label>
          </div>
        );
      
      default:
        return (
          <Input
            id={variable.id}
            value={value}
            onChange={(e) => handleVariableChange(variable.id, e.target.value)}
            placeholder={variable.description}
            className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
          />
        );
    }
  };

  const renderCustomizationOption = (option: any) => {
    const value = customizations[option.id];

    switch (option.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleCustomizationChange(option.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={value}
            onCheckedChange={(checked) => handleCustomizationChange(option.id, checked)}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomizationChange(option.id, parseInt(e.target.value) || option.default)}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
          />
        );
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  // Handle escape key and focus management with proper cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Focus trap - focus the modal when it opens
    const modalElement = document.querySelector('[data-modal="enhanced-prompt-panel"]') as HTMLElement;
    if (modalElement) {
      modalElement.focus();
    }
    
    // Cleanup function to ensure proper removal
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure body scrolling is restored
      document.body.style.overflow = '';
      // Remove any potential focus traps
      document.body.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed z-50 bg-background/95 backdrop-blur-sm"
      style={{
        top: '86px', // Same as expanded prompt overlay
        left: '0px',
        width: '100vw', // Full width
        height: 'calc(100vh - 86px)', // Account for header height
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full h-full bg-background flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-modal="enhanced-prompt-panel"
        tabIndex={-1}
      >
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{template.name}</h2>
              <p className="text-gray-700 text-base leading-relaxed mb-4 max-w-3xl">{template.description}</p>
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1"
                >
                  {template.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 font-medium px-3 py-1 bg-white"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {template.qualityMetrics.completionTime}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    template.qualityMetrics.difficultyLevel === 'advanced' 
                      ? 'border-red-300 text-red-800 bg-red-50 font-medium px-3 py-1' :
                    template.qualityMetrics.difficultyLevel === 'intermediate' 
                      ? 'border-amber-300 text-amber-800 bg-amber-50 font-medium px-3 py-1' :
                      'border-emerald-300 text-emerald-800 bg-emerald-50 font-medium px-3 py-1'
                  }
                >
                  {template.qualityMetrics.difficultyLevel.charAt(0).toUpperCase() + template.qualityMetrics.difficultyLevel.slice(1)}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full w-10 h-10 p-0 flex-shrink-0"
            >
              <span className="sr-only">Close dialog</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-shrink-0 px-6 sm:px-8 pt-6 pb-2 border-b border-gray-100">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="configure" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium py-2.5 px-3 rounded-md transition-all"
                >
                  <span className="hidden sm:inline">Configure</span>
                  <span className="sm:hidden">Setup</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customize" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium py-2.5 px-3 rounded-md transition-all"
                >
                  <span className="hidden sm:inline">Customize</span>
                  <span className="sm:hidden">Custom</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quality" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium py-2.5 px-3 rounded-md transition-all"
                >
                  Quality
                </TabsTrigger>
                <TabsTrigger 
                  value="engineering" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium py-2.5 px-3 rounded-md transition-all col-span-2 sm:col-span-1"
                >
                  <span className="hidden lg:inline">AI Methods</span>
                  <span className="lg:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium py-2.5 px-3 rounded-md transition-all sm:col-span-3 lg:col-span-1"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-6 sm:px-8 py-6">

              <TabsContent value="configure" className="space-y-8 mt-0">
                {/* Industry Selection */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Industry Context
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      Select your industry to get specialized adaptations and domain-specific considerations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Choose your industry context (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General (no industry specific)</SelectItem>
                        <SelectItem value="fintech">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS/Software</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Template Variables */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Template Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      Configure the core parameters and variables for this UX methodology
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-6">
                    {template.variables.map(variable => (
                      <div key={variable.id} className="space-y-3">
                        <Label 
                          htmlFor={variable.id} 
                          className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                        >
                          {variable.name}
                          {variable.required && <span className="text-red-600 text-base">*</span>}
                        </Label>
                        <div className="space-y-2">
                          {renderVariableInput(variable)}
                          <p className="text-sm text-gray-600 leading-relaxed pl-1">{variable.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Validation Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              </TabsContent>

              <TabsContent value="customize" className="space-y-8 mt-0">
                {/* Customization Options */}
              {template.customizationOptions && template.customizationOptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Customizations</CardTitle>
                    <CardDescription>
                      Fine-tune the template to match your specific needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {template.customizationOptions.map(option => (
                      <div key={option.id} className="space-y-2">
                        <Label htmlFor={option.id} className="flex items-center gap-2">
                          {option.label}
                          <Badge variant="outline" className="text-xs">
                            {option.category}
                          </Badge>
                        </Label>
                        {renderCustomizationOption(option)}
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Industry Adaptations */}
              {selectedIndustry !== 'general' && template.industryAdaptations?.[selectedIndustry] && (
                <Card>
                  <CardHeader>
                    <CardTitle>Industry-Specific Adaptations</CardTitle>
                    <CardDescription>
                      Specialized considerations for {selectedIndustry}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {template.industryAdaptations[selectedIndustry].considerations.map((consideration, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{consideration}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              </TabsContent>

              <TabsContent value="quality" className="space-y-8 mt-0">
              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Standards</CardTitle>
                  <CardDescription>
                    Expected quality outcomes and success criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Success Criteria
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {template.qualityMetrics.successCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participant Guidelines
                      </h4>
                      {template.qualityMetrics.participantCount && (
                        <div className="text-sm">
                          <p><strong>Recommended:</strong> {template.qualityMetrics.participantCount.recommended} participants</p>
                          <p><strong>Range:</strong> {template.qualityMetrics.participantCount.min}-{template.qualityMetrics.participantCount.max}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Research Backing */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Foundation</CardTitle>
                  <CardDescription>
                    Methodological backing and industry standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="methodology">
                      <AccordionTrigger>Methodology</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1">
                          {template.researchBacking.methodology.map((method, index) => (
                            <li key={index} className="text-sm">• {method}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="best-practices">
                      <AccordionTrigger>Best Practices</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1">
                          {template.researchBacking.bestPractices.map((practice, index) => (
                            <li key={index} className="text-sm">• {practice}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="standards">
                      <AccordionTrigger>Industry Standards</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1">
                          {template.researchBacking.industryStandards.map((standard, index) => (
                            <li key={index} className="text-sm">• {standard}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              </TabsContent>

              <TabsContent value="engineering" className="space-y-8 mt-0">
              {/* AI Methods Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Advanced AI Methods
                  </CardTitle>
                  <CardDescription>
                    Apply sophisticated prompt engineering techniques for enhanced AI interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {showPromptEngineering ? 
                        'Configure advanced prompt engineering methods' : 
                        'Enhance your prompts with AI-powered engineering techniques'
                      }
                    </div>
                    <Button
                      onClick={() => setShowPromptEngineering(!showPromptEngineering)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      {showPromptEngineering ? 'Hide Methods' : 'Open AI Methods'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Method Preview */}
              {generatedPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Enhanced Prompt</CardTitle>
                    <CardDescription>
                      Preview of your prompt enhanced with AI engineering methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                        {generatedPrompt}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                      <Badge variant="outline">
                        {generatedPrompt.length} characters
                      </Badge>
                      <Badge variant="outline">
                        {generatedPrompt.split(/\s+/).length} words
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-8 mt-0">
              {currentPrompt?.qualityScore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Quality Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Overall Quality Score</span>
                          <span className="font-bold text-lg">
                            {currentPrompt.qualityScore.overallScore}/100
                          </span>
                        </div>
                        <Progress value={currentPrompt.qualityScore.overallScore} className="h-2" />
                        <Badge variant={
                          currentPrompt.qualityScore.category === 'excellent' ? 'default' :
                          currentPrompt.qualityScore.category === 'good' ? 'secondary' :
                          currentPrompt.qualityScore.category === 'fair' ? 'outline' : 'destructive'
                        } className="mt-2">
                          {currentPrompt.qualityScore.category}
                        </Badge>
                      </div>

                      {currentPrompt.qualityScore.summary.strengths.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {currentPrompt.qualityScore.summary.strengths.map((strength, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentPrompt.qualityScore.summary.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {currentPrompt.qualityScore.summary.recommendations.slice(0, 5).map((rec, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <Lightbulb className="w-3 h-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Content Preview */}
              {currentPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {currentPrompt.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Prompt Engineering Panel */}
        {showPromptEngineering && (
          <PromptEngineeringPanel
            basePrompt={generatedPrompt || processTemplateVariables(template.template, variables)}
            variables={variables}
            context={{
              taskComplexity: customizations.methodologyDepth?.toLowerCase() === 'advanced' ? 'complex' : 
                           customizations.methodologyDepth?.toLowerCase() === 'basic' ? 'simple' : 'moderate',
              domainSpecific: selectedIndustry !== 'general',
              targetAudience: 'practitioners' as const,
              outputLength: customizations.outputDetail?.toLowerCase() as 'brief' | 'moderate' | 'comprehensive' || 'moderate',
              userExperience: 'intermediate' as const
            }}
            onMethodApply={handlePromptEngineeringApply}
            onClose={() => setShowPromptEngineering(false)}
          />
        )}

        <div className="flex-shrink-0 p-6 sm:p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="order-2 sm:order-1 h-11 px-6 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 font-medium"
            >
              Cancel
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              {activeTab !== 'configure' && (
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('configure')}
                  className="h-11 px-6 text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400 font-medium"
                >
                  Back to Configure
                </Button>
              )}
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || validationErrors.length > 0}
                className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Enhanced Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};