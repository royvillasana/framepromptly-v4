import { Framework, Stage, Tool } from '@/stores/workflow-store';
import { supabase } from '@/integrations/supabase/client';

// Type for AI workflow generation response
export interface WorkflowGeneration {
  framework: {
    name: string;
    description: string;
  };
  stages: Array<{
    name: string;
    description: string;
    duration: string;
    participants: string;
    deliverables: string;
  }>;
  tools: Array<{
    name: string;
    description: string;
    category: string;
    effort: string;
    expertise: string;
    resources: string;
    output: string;
    stageName: string; // Which stage this tool belongs to
  }>;
  reasoning: string;
}

export interface AIBuilderService {
  generateWorkflow(prompt: string, availableFrameworks: Framework[]): Promise<WorkflowGeneration>;
  refineWorkflow(workflow: any, refinementPrompt: string): Promise<WorkflowGeneration>;
}

export class SupabaseAIWorkflowBuilder implements AIBuilderService {
  async generateWorkflow(prompt: string, availableFrameworks: Framework[]): Promise<WorkflowGeneration> {
    try {
      console.log('Calling Supabase Edge Function for AI workflow generation...');

      const { data, error } = await supabase.functions.invoke('ai-workflow-generator', {
        body: {
          prompt,
          availableFrameworks,
          type: 'generate'
        }
      });

      if (error) {
        console.error('Supabase function error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          details: error
        });
        throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
      }

      console.log('Edge Function response:', { success: data?.success, hasError: !!data?.error, data });

      if (!data?.success) {
        console.error('AI workflow generation failed:', data?.error);
        throw new Error(data?.error || 'Failed to generate workflow. Please try again.');
      }

      console.log('Workflow generation successful');
      return data.data;
    } catch (error) {
      console.error('AI workflow generation failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate workflow. Please try again.');
    }
  }

  async refineWorkflow(workflow: any, refinementPrompt: string): Promise<WorkflowGeneration> {
    try {
      console.log('Calling Supabase Edge Function to refine workflow...');

      const { data, error } = await supabase.functions.invoke('ai-workflow-generator', {
        body: {
          prompt: refinementPrompt,
          workflow,
          type: 'refine'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to refine workflow. Please try again.');
      }

      if (!data?.success) {
        console.error('AI workflow refinement failed:', data?.error);
        throw new Error(data?.error || 'Failed to refine workflow. Please try again.');
      }

      console.log('Workflow refinement successful');
      return data.data;
    } catch (error) {
      console.error('AI workflow refinement failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to refine workflow. Please try again.');
    }
  }
}

// Mock AI builder service for demo/development
class MockAIWorkflowBuilder implements AIBuilderService {
  async generateWorkflow(prompt: string, availableFrameworks: Framework[]): Promise<WorkflowGeneration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock response based on the prompt
    const framework = availableFrameworks[0] || {
      name: 'Design Thinking',
      description: 'A human-centered approach to innovation'
    };
    
    return {
      framework: {
        name: framework.name,
        description: framework.description,
      },
      stages: [
        {
          name: 'Empathize',
          description: 'Understand the user and their needs',
          duration: '1-2 weeks',
          participants: 'UX Researcher, Product Manager',
          deliverables: 'User research insights, empathy maps',
        },
        {
          name: 'Define',
          description: 'Frame the right problems to solve',
          duration: '3-5 days',
          participants: 'UX Designer, Product Manager',
          deliverables: 'Problem statement, user personas',
        },
      ],
      tools: [
        {
          name: 'User Interviews',
          description: 'Conduct one-on-one interviews with users',
          category: 'Research',
          effort: 'High',
          expertise: 'Medium',
          resources: 'Interview guide, recording tools',
          output: 'Interview transcripts and insights',
          stageName: 'Empathize',
        },
        {
          name: 'Persona Creation',
          description: 'Create detailed user personas',
          category: 'Synthesis',
          effort: 'Medium',
          expertise: 'Medium',
          resources: 'Research data, persona template',
          output: 'User personas document',
          stageName: 'Define',
        },
      ],
      reasoning: `Generated a ${framework.name} workflow based on your request: "${prompt}". This includes foundational research and synthesis stages with essential UX tools.`,
    };
  }

  async refineWorkflow(workflow: any, refinementPrompt: string): Promise<WorkflowGeneration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      ...workflow,
      reasoning: `Refined the workflow based on: "${refinementPrompt}". This is a mock refinement for demonstration purposes.`,
    };
  }
}

// Factory function to create AI builder service
export function createAIBuilderService(): AIBuilderService {
  // Use Supabase function for AI workflow generation
  console.log('Using Supabase AI workflow builder service');
  return new SupabaseAIWorkflowBuilder();
}

// Utility function to convert AI generation to workflow nodes
export function convertAIGenerationToNodes(generation: WorkflowGeneration, availableFrameworks: Framework[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Find matching framework or create a basic one
  let framework = availableFrameworks.find(f => 
    f.name.toLowerCase().includes(generation.framework.name.toLowerCase()) ||
    generation.framework.name.toLowerCase().includes(f.name.toLowerCase())
  );

  if (!framework) {
    // Create a basic framework structure if no match found
    framework = {
      id: 'ai-generated',
      name: generation.framework.name,
      description: generation.framework.description,
      color: '#6366f1',
      stages: generation.stages.map((stage, index) => ({
        id: `stage-${index}`,
        name: stage.name,
        description: stage.description,
        duration: stage.duration,
        participants: stage.participants,
        deliverables: stage.deliverables,
        tools: generation.tools
          .filter(tool => tool.stageName === stage.name)
          .map((tool, toolIndex) => ({
            id: `tool-${index}-${toolIndex}`,
            name: tool.name,
            description: tool.description,
            category: tool.category,
            effort: tool.effort,
            expertise: tool.expertise,
            resources: tool.resources,
            output: tool.output,
          }))
      })),
      characteristics: {
        timeframe: 'Variable',
        complexity: 'Medium',
        teamSize: '3-5 people',
        focus: 'User-centered design'
      }
    };
  }

  // Create framework node
  const frameworkNode = {
    id: `framework-ai-${Date.now()}`,
    type: 'framework',
    position: { x: 100, y: 100 },
    data: { framework, isSelected: true },
  };
  nodes.push(frameworkNode);

  // Create stage and tool nodes
  let yOffset = 200;
  generation.stages.forEach((aiStage, stageIndex) => {
    // Get tools for this stage
    const stageTools = generation.tools.filter(tool => tool.stageName === aiStage.name);
    
    const stageNode = {
      id: `stage-ai-${Date.now()}-${stageIndex}`,
      type: 'stage',
      position: { x: 300 + stageIndex * 250, y: yOffset },
      data: {
        stage: {
          id: `ai-stage-${stageIndex}`,
          name: aiStage.name,
          description: aiStage.description,
          tools: stageTools.map((tool, toolIndex) => ({
            id: `ai-tool-${stageIndex}-${toolIndex}`,
            name: tool.name,
            description: tool.description,
            category: tool.category,
            icon: '🔧', // Default icon for AI-generated tools
            characteristics: {
              effort: tool.effort,
              expertise: tool.expertise,
              resources: Array.isArray(tool.resources) ? tool.resources : [tool.resources],
              output: tool.output,
              when: 'During ' + aiStage.name + ' stage',
            }
          })),
          position: { x: 300 + stageIndex * 250, y: yOffset },
          characteristics: {
            duration: aiStage.duration,
            participants: aiStage.participants,
            deliverables: aiStage.deliverables,
            skills: ['UX Research', 'Design Thinking'],
            dependencies: stageIndex > 0 ? [generation.stages[stageIndex - 1].name] : [],
          },
        },
        framework,
        isActive: true,
      },
    };
    nodes.push(stageNode);

    // Create edge from framework to stage
    edges.push({
      id: `edge-${frameworkNode.id}-${stageNode.id}`,
      source: frameworkNode.id,
      target: stageNode.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'white', strokeWidth: 2 },
    });
  });

  return { nodes, edges, framework };
}