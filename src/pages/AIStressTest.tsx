import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Zap,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FileText,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { usePromptStore } from '@/stores/prompt-store';
import { useProjectStore } from '@/stores/project-store';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StressTestResult {
  timestamp: string;
  frameworks: FrameworkResult[];
  totalTools: number;
  testedTools: number;
  successfulPrompts: number;
  failedPrompts: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  errors: TestError[];
  executionTime: number;
}

interface FrameworkResult {
  id: string;
  name: string;
  description: string;
  stages: StageResult[];
  totalTools: number;
  testedTools: number;
  successfulPrompts: number;
  failedPrompts: number;
  successfulExecutions: number;
  failedExecutions: number;
  errors: TestError[];
}

interface StageResult {
  id: string;
  name: string;
  description: string;
  tools: ToolResult[];
  totalTools: number;
  testedTools: number;
  successfulPrompts: number;
  failedPrompts: number;
  successfulExecutions: number;
  failedExecutions: number;
  errors: TestError[];
}

interface ToolResult {
  id: string;
  name: string;
  description: string;
  category: string;
  characteristics: any;
  tested: boolean;
  promptGenerated: boolean;
  aiExecuted: boolean;
  generatedPrompt: string | null;
  aiResponse: string | null;
  executionTime: number;
  errors: TestError[];
}

interface TestError {
  type: string;
  message: string;
  timestamp: string;
  framework?: string;
  stage?: string;
  tool?: string;
}

const AIStressTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StressTestResult | null>(null);
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolResult | null>(null);
  
  // Test configuration
  const [useRealAI, setUseRealAI] = useState(true);
  const [aiDelayMs, setAiDelayMs] = useState(2000);
  const [testLimited, setTestLimited] = useState(false); // Test only first few tools
  
  const { frameworks, initializeFrameworks } = useWorkflowStore();
  const { executePrompt } = usePromptStore();
  const { createProject } = useProjectStore();
  const { toast } = useToast();

  useEffect(() => {
    initializeFrameworks();
  }, [initializeFrameworks]);

  const runStressTest = useCallback(async () => {
    if (!frameworks || frameworks.length === 0) {
      toast({
        title: "No frameworks loaded",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing comprehensive stress test...');

    try {
      // Try to create test project (optional - will work without authentication)
      try {
        const testProject = await createProject(
          'AI Stress Test Project',
          'Comprehensive testing of all UX frameworks, stages, and tools'
        );
        console.log('✅ Test project created:', testProject?.id);
      } catch (authError) {
        console.log('⚠️ Could not create project (not authenticated), continuing with test...');
      }

      // Dynamic import of our stress tester
      const UXToolsStressTesterModule = await import('../ai-stress-test-runner.js');
      const UXToolsStressTester = UXToolsStressTesterModule.default;
      
      // Create AI execution function that has access to React context
      const realAIExecutor = async (promptResult: any) => {
        if (!useRealAI) {
          return null; // Will use simulation
        }
        
        try {
          await new Promise(resolve => setTimeout(resolve, aiDelayMs)); // Rate limiting
          
          console.log('🤖 Calling AI with real OpenAI API...');
          
          // For stress tests, call the Edge Function directly with fetch to avoid Supabase client auth issues
          const supabaseUrl = 'https://drfaomantrtmtydbelxe.supabase.co';
          const response = await fetch(`${supabaseUrl}/functions/v1/generate-ai-prompt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZmFvbWFudHJ0bXR5ZGJlbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTczNTAsImV4cCI6MjA3MTEzMzM1MH0.6oQtHv6OcLkdHvmBPkTnTHEIuF0_GudFxhebVg9atq0',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZmFvbWFudHJ0bXR5ZGJlbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTczNTAsImV4cCI6MjA3MTEzMzM1MH0.6oQtHv6OcLkdHvmBPkTnTHEIuF0_GudFxhebVg9atq0'
            },
            body: JSON.stringify({
              promptContent: promptResult.prompt,
              variables: promptResult.variables || {},
              projectId: 'ai-stress-test-' + Date.now(), // This will trigger anonymous mode
              frameworkName: 'AI Stress Test',
              stageName: 'Validation',
              toolName: promptResult.variables?.toolName || 'Unknown Tool',
              knowledgeContext: null
            })
          });

          const aiResult = await response.json();
          const aiError = !response.ok ? { message: aiResult.error || `HTTP ${response.status}` } : null;

          if (aiError) {
            console.error('🚨 AI Executor Error:', aiError);
            return {
              success: false,
              error: aiError.message
            };
          }

          if (!aiResult?.success) {
            console.error('🚨 AI Result Error:', aiResult);
            return {
              success: false,
              error: aiResult?.error || 'Unknown error'
            };
          }

          console.log('✅ Real AI Response received:', aiResult.aiResponse?.substring(0, 100) + '...');
          return {
            success: true,
            response: aiResult.aiResponse || 'No response content'
          };
        } catch (error) {
          console.error('🚨 AI Executor Exception:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      };

      const tester = new UXToolsStressTester({
        useRealAI,
        aiDelayMs,
        simulateFailures: true,
        aiExecutor: realAIExecutor
      });
      
      // Limit frameworks for testing if requested
      let testFrameworks = frameworks;
      if (testLimited) {
        testFrameworks = frameworks.slice(0, 2); // Test only first 2 frameworks
        console.log(`🔬 Limited test mode: Testing ${testFrameworks.length} frameworks`);
      }
      
      tester.setFrameworks(testFrameworks);

      // Track progress by overriding testTool method
      let completedTools = 0;
      const totalTools = frameworks.reduce((total, framework) => 
        total + framework.stages.reduce((stageTotal, stage) => 
          stageTotal + (stage.tools?.length || 0), 0), 0);

      const originalTestTool = tester.testTool.bind(tester);
      tester.testTool = async function(framework: any, stage: any, tool: any) {
        setCurrentTest(`Testing ${framework.name} → ${stage.name} → ${tool.name}`);
        
        const result = await originalTestTool(framework, stage, tool);
        
        completedTools++;
        const newProgress = Math.floor((completedTools / totalTools) * 100);
        setProgress(newProgress);
        
        return result;
      };

      // Run comprehensive test
      const testResults = await tester.runComprehensiveTest();
      setResults(testResults);
      
      setCurrentTest('Test completed successfully!');
      setProgress(100);
      
      toast({
        title: "Stress test completed!",
        description: `Tested ${testResults.testedTools} tools across ${testResults.frameworks.length} frameworks`
      });

    } catch (error) {
      console.error('Stress test failed:', error);
      setCurrentTest(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  }, [frameworks, createProject, toast]);

  const toggleFrameworkExpansion = (frameworkId: string) => {
    setExpandedFrameworks(prev => 
      prev.includes(frameworkId) 
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-stress-test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Content copied successfully"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0;
    return ((successful / total) * 100).toFixed(1);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Stress Test</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing of all UX frameworks, stages, and tools with AI prompt generation
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={runStressTest} 
            disabled={isRunning}
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running Test...' : 'Start Stress Test'}
          </Button>
          {results && (
            <Button onClick={exportResults} variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      {/* Test Configuration */}
      {!isRunning && !results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Configure how the AI stress test should run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useRealAI"
                  checked={useRealAI}
                  onChange={(e) => setUseRealAI(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="useRealAI" className="text-sm font-medium">
                  Use Real AI (vs Simulated)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="testLimited"
                  checked={testLimited}
                  onChange={(e) => setTestLimited(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="testLimited" className="text-sm font-medium">
                  Limited Test (2 frameworks only)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="aiDelay" className="text-sm font-medium whitespace-nowrap">
                  AI Delay (ms):
                </label>
                <select
                  id="aiDelay"
                  value={aiDelayMs}
                  onChange={(e) => setAiDelayMs(Number(e.target.value))}
                  className="flex h-8 rounded-md border border-input bg-gradient-to-br from-gray-50 to-white px-2 py-1 text-xs"
                >
                  <option value="0">No delay</option>
                  <option value="1000">1 second</option>
                  <option value="2000">2 seconds</option>
                  <option value="3000">3 seconds</option>
                  <option value="5000">5 seconds</option>
                </select>
              </div>
            </div>
            
            {useRealAI && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Real AI Mode:</strong> This will make actual API calls to generate responses for all {testLimited ? '~30' : '152'} tools. 
                  {aiDelayMs > 0 && ` With ${aiDelayMs/1000}s delay, this will take approximately ${Math.ceil((testLimited ? 30 : 152) * aiDelayMs / 60000)} minutes.`}
                </p>
              </div>
            )}
            
            {!useRealAI && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Simulation Mode:</strong> This will generate prompts but use simulated AI responses for testing the UI and workflow.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Test in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTest}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {results && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.totalTools}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {results.frameworks.length} frameworks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(Number(getSuccessRate(results.successfulPrompts, results.testedTools)))}`}>
                    {getSuccessRate(results.successfulPrompts, results.testedTools)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.successfulPrompts}/{results.testedTools} prompts generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Executions</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(Number(getSuccessRate(results.successfulExecutions, results.successfulPrompts)))}`}>
                    {results.successfulExecutions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getSuccessRate(results.successfulExecutions, results.successfulPrompts)}% execution rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Execution Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(results.executionTime / 1000).toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total test duration
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Framework Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Framework Summary</CardTitle>
                <CardDescription>Performance breakdown by UX framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.frameworks.map((framework) => (
                    <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{framework.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {framework.stages.length} stages, {framework.totalTools} tools
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-semibold ${getStatusColor(Number(getSuccessRate(framework.successfulPrompts, framework.testedTools)))}`}>
                            {getSuccessRate(framework.successfulPrompts, framework.testedTools)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {framework.successfulPrompts}/{framework.testedTools}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {framework.successfulPrompts}
                          </Badge>
                          {framework.failedPrompts > 0 && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              {framework.failedPrompts}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-4">
            <ScrollArea className="h-[800px]">
              {results.frameworks.map((framework) => (
                <Card key={framework.id} className="mb-4">
                  <Collapsible>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleFrameworkExpansion(framework.id)}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 hover:bg-muted/50">
                        <div className="text-left">
                          <CardTitle className="flex items-center">
                            {expandedFrameworks.includes(framework.id) ? 
                              <ChevronDown className="w-4 h-4 mr-2" /> : 
                              <ChevronRight className="w-4 h-4 mr-2" />
                            }
                            {framework.name}
                          </CardTitle>
                          <CardDescription>{framework.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {framework.stages.length} stages
                          </Badge>
                          <Badge variant="outline">
                            {framework.totalTools} tools
                          </Badge>
                          <Badge className={getSuccessRate(framework.successfulPrompts, framework.testedTools) === '100.0' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {getSuccessRate(framework.successfulPrompts, framework.testedTools)}%
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {framework.stages.map((stage) => (
                            <Card key={stage.id} className="border-l-4 border-l-blue-500">
                              <Collapsible>
                                <CollapsibleTrigger 
                                  className="w-full"
                                  onClick={() => toggleStageExpansion(`${framework.id}-${stage.id}`)}
                                >
                                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 hover:bg-muted/50">
                                    <div className="text-left">
                                      <CardTitle className="text-lg flex items-center">
                                        {expandedStages.includes(`${framework.id}-${stage.id}`) ? 
                                          <ChevronDown className="w-4 h-4 mr-2" /> : 
                                          <ChevronRight className="w-4 h-4 mr-2" />
                                        }
                                        {stage.name}
                                      </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">
                                        {stage.totalTools} tools
                                      </Badge>
                                      <Badge className={getSuccessRate(stage.successfulPrompts, stage.testedTools) === '100.0' ? 'bg-green-500' : 'bg-yellow-500'}>
                                        {getSuccessRate(stage.successfulPrompts, stage.testedTools)}%
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    <div className="grid gap-3">
                                      {stage.tools.map((tool) => (
                                        <div 
                                          key={tool.id}
                                          className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50"
                                          onClick={() => setSelectedTool(tool)}
                                        >
                                          <div className="flex-1">
                                            <h5 className="font-medium">{tool.name}</h5>
                                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                                            <div className="flex gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                                              <Badge variant="outline" className="text-xs">{tool.characteristics?.effort || 'N/A'}</Badge>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {tool.promptGenerated ? (
                                              <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                              <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            {tool.aiExecuted && (
                                              <Zap className="w-5 h-5 text-blue-500" />
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                              {tool.executionTime}ms
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-4">
            {selectedTool ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        {selectedTool.name}
                      </CardTitle>
                      <CardDescription>{selectedTool.description}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedTool(null)}>
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="prompt">
                    <TabsList>
                      <TabsTrigger value="prompt">Generated Prompt</TabsTrigger>
                      <TabsTrigger value="response">AI Response</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="prompt">
                      <ScrollArea className="h-96 w-full rounded border p-4">
                        <pre className="text-sm whitespace-pre-wrap">
                          {selectedTool.generatedPrompt || 'No prompt generated'}
                        </pre>
                      </ScrollArea>
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => selectedTool.generatedPrompt && copyToClipboard(selectedTool.generatedPrompt)}
                          disabled={!selectedTool.generatedPrompt}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Prompt
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="response">
                      <ScrollArea className="h-96 w-full rounded border p-4">
                        <div className="text-sm whitespace-pre-wrap">
                          {selectedTool.aiResponse || 'No AI response available'}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="details">
                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Tool Characteristics</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-sm font-medium">Effort:</span>
                              <span className="text-sm ml-2">{selectedTool.characteristics?.effort || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Expertise:</span>
                              <span className="text-sm ml-2">{selectedTool.characteristics?.expertise || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Test Results</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Prompt Generated:</span>
                              {selectedTool.promptGenerated ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">AI Executed:</span>
                              {selectedTool.aiExecuted ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium">Execution Time:</span>
                              <span className="text-sm ml-2">{selectedTool.executionTime}ms</span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedTool.errors && selectedTool.errors.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                            <div className="space-y-2">
                              {selectedTool.errors.map((error, index) => (
                                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                  <div className="font-medium">{error.type}</div>
                                  <div>{error.message}</div>
                                  <div className="text-xs text-muted-foreground">{error.timestamp}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center p-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Tool</h3>
                  <p className="text-muted-foreground">
                    Click on any tool in the Frameworks tab to view its generated prompt and AI response.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4">
            {results.errors && results.errors.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {results.errors.map((error, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <Badge variant="destructive">{error.type}</Badge>
                          {error.framework && <Badge variant="outline">{error.framework}</Badge>}
                          {error.stage && <Badge variant="outline">{error.stage}</Badge>}
                          {error.tool && <Badge variant="outline">{error.tool}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{error.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{error.timestamp}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Card>
                <CardContent className="text-center p-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Errors Found</h3>
                  <p className="text-muted-foreground">
                    All tests completed successfully without any errors.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Initial State */}
      {!results && !isRunning && (
        <Card>
          <CardContent className="text-center p-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Ready to Start AI Stress Test</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This comprehensive test will evaluate all UX frameworks, stages, and tools by generating AI prompts 
                and executing them to validate the complete system functionality.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{frameworks?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Frameworks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {frameworks?.reduce((total, f) => 
                      total + f.stages.reduce((stageTotal, s) => 
                        stageTotal + (s.tools?.length || 0), 0), 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tools</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIStressTest;