/**
 * @fileoverview Demo page showing tool-specific prompt instructions
 * This demonstrates how each tool now has unique, contextual AI prompts
 * based on framework, stage, and tool-specific context
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { generateToolSpecificInstructions, ToolPromptContext } from '@/lib/tool-specific-prompt-instructions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CheckCircle, Wrench, Target, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ToolPromptDemo: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [comparisonPrompts, setComparisonPrompts] = useState<Array<{
    context: string;
    prompt: string;
  }>>([]);

  const { frameworks } = useWorkflowStore();
  const { toast } = useToast();

  const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework);
  const selectedStageData = selectedFrameworkData?.stages.find(s => s.id === selectedStage);
  const selectedToolData = selectedStageData?.tools.find(t => t.id === selectedTool);

  const generatePrompt = () => {
    if (!selectedFrameworkData || !selectedStageData || !selectedToolData) return;

    setIsGenerating(true);
    
    try {
      const context: ToolPromptContext = {
        framework: selectedFrameworkData,
        stage: selectedStageData,
        tool: selectedToolData
      };

      const instructions = generateToolSpecificInstructions(context);
      
      const fullPrompt = `# ${selectedToolData.name} - Contextual AI Prompt Instructions

## Framework: ${selectedFrameworkData.name} | Stage: ${selectedStageData.name}

${instructions.promptTemplate}

### Contextual Guidance:
${instructions.contextualGuidance.map(g => `• ${g}`).join('\n')}

### Framework-Specific Notes:
${instructions.frameworkSpecificNotes.map(n => `• ${n}`).join('\n')}

### Stage-Specific Focus:
${instructions.stageSpecificFocus.map(f => `• ${f}`).join('\n')}

### Knowledge Integration Requirements:
${instructions.knowledgeIntegrationInstructions.map(k => `• ${k}`).join('\n')}

### Quality Assurance:
${instructions.qualityChecks.map(q => `• ${q}`).join('\n')}

### Expected Output:
${instructions.expectedOutputFormat}

---
*These instructions are specifically tailored for ${selectedToolData.name} in the ${selectedStageData.name} stage of ${selectedFrameworkData.name} methodology.*`;

      setGeneratedPrompt(fullPrompt);
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate tool-specific prompt instructions.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComparison = () => {
    if (!selectedToolData) return;

    setIsGenerating(true);
    const comparisons: Array<{context: string, prompt: string}> = [];

    try {
      // Generate prompts for the same tool in different frameworks/stages
      const testCombinations = [
        { frameworkId: 'design-thinking', stageId: 'empathize', label: 'Design Thinking - Empathize' },
        { frameworkId: 'design-thinking', stageId: 'test', label: 'Design Thinking - Test' },
        { frameworkId: 'google-design-sprint', stageId: 'understand', label: 'Google Sprint - Understand' },
        { frameworkId: 'lean-ux', stageId: 'experiment', label: 'Lean UX - Experiment' }
      ];

      testCombinations.forEach(combo => {
        const framework = frameworks.find(f => f.id === combo.frameworkId);
        const stage = framework?.stages.find(s => s.id === combo.stageId);
        const tool = stage?.tools.find(t => t.id === selectedTool);

        if (framework && stage && tool) {
          const context: ToolPromptContext = { framework, stage, tool };
          const instructions = generateToolSpecificInstructions(context);
          
          comparisons.push({
            context: combo.label,
            prompt: instructions.promptTemplate
          });
        }
      });

      setComparisonPrompts(comparisons);
      
    } catch (error) {
      console.error('Error generating comparisons:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Prompt instructions copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tool-Specific Prompt Instructions Demo</h1>
          <p className="text-muted-foreground mt-2">
            Each UX tool now generates unique, contextual AI prompts based on framework and stage
          </p>
        </div>

        {/* Selection Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Select Context
            </CardTitle>
            <CardDescription>
              Choose a framework, stage, and tool to see context-specific AI prompt instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Framework</label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select 
                  value={selectedStage} 
                  onValueChange={setSelectedStage}
                  disabled={!selectedFrameworkData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFrameworkData?.stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tool</label>
                <Select 
                  value={selectedTool} 
                  onValueChange={setSelectedTool}
                  disabled={!selectedStageData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStageData?.tools.map(tool => (
                      <SelectItem key={tool.id} value={tool.id}>
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Button 
                  onClick={generatePrompt}
                  disabled={!selectedTool || isGenerating}
                  className="w-full"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {generatedPrompt && (
          <Tabs defaultValue="full-prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="full-prompt">Full Prompt Instructions</TabsTrigger>
              <TabsTrigger value="comparison">Context Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="full-prompt">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Generated Instructions
                      </CardTitle>
                      <CardDescription>
                        Context-specific AI prompt instructions for {selectedToolData?.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedFrameworkData?.name}</Badge>
                      <Badge variant="outline">{selectedStageData?.name}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full">
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border">
                      {generatedPrompt}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Context Comparison</CardTitle>
                      <CardDescription>
                        See how the same tool generates different prompts in different contexts
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={generateComparison}
                      disabled={!selectedTool || isGenerating}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Generate Comparison
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {comparisonPrompts.length > 0 ? (
                    <div className="space-y-4">
                      {comparisonPrompts.map((comparison, index) => (
                        <Card key={index} className="bg-gray-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {comparison.context}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                              {comparison.prompt}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Success!</span>
                          </div>
                          <p className="text-green-700 mt-1">
                            Each context generates unique, tailored prompt instructions. 
                            Notice how the same tool ({selectedToolData?.name}) produces different 
                            guidance based on the framework and stage context.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Click "Generate Comparison" to see how the same tool produces 
                      different prompts in different contexts
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Benefits Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🎯 Tool-Specific Prompt System Benefits</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">✅ What's Been Fixed:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Each tool now has unique, context-specific prompts</li>
                  <li>• Framework context influences prompt generation</li>
                  <li>• Stage context determines focus areas</li>
                  <li>• Knowledge base integration is tool-specific</li>
                  <li>• No more generic prompts across different tools</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🚀 Key Improvements:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 67 unique tools with contextual instructions</li>
                  <li>• Framework-specific customizations</li>
                  <li>• Stage-specific focus areas</li>
                  <li>• Quality assurance guidelines</li>
                  <li>• Expected output specifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolPromptDemo;