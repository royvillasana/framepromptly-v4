import { create } from 'zustand';
import { UXFramework, UXStage, UXTool } from './workflow-store';

export interface PromptTemplate {
  id: string;
  framework: string;
  stage: string;
  tool: string;
  template: string;
  variables: string[];
  description: string;
}

export interface GeneratedPrompt {
  id: string;
  workflowId: string;
  content: string;
  context: {
    framework: UXFramework;
    stage: UXStage;
    tool: UXTool;
    previousOutputs?: string[];
  };
  variables: Record<string, string>;
  output?: string;
  timestamp: number;
}

export interface PromptState {
  prompts: GeneratedPrompt[];
  templates: PromptTemplate[];
  currentPrompt: GeneratedPrompt | null;
  isGenerating: boolean;
  
  // Actions
  generatePrompt: (framework: UXFramework, stage: UXStage, tool: UXTool, previousOutputs?: string[]) => string;
  executePrompt: (promptId: string) => Promise<void>;
  updatePromptVariables: (promptId: string, variables: Record<string, string>) => void;
  setCurrentPrompt: (prompt: GeneratedPrompt | null) => void;
  addPromptOutput: (promptId: string, output: string) => void;
  initializeTemplates: () => void;
}

// Comprehensive prompt templates for UX frameworks
const promptTemplates: PromptTemplate[] = [
  // Design Thinking - Empathize
  {
    id: 'dt-empathize-interviews',
    framework: 'design-thinking',
    stage: 'empathize',
    tool: 'user-interviews',
    template: `As a UX researcher conducting user interviews for {{projectName}}, create a comprehensive interview guide to understand user needs, pain points, and behaviors.

Context:
- Project: {{projectName}}
- Target Users: {{targetUsers}}
- Research Goals: {{researchGoals}}
{{#if previousOutputs}}
- Previous Research Insights: {{previousOutputs}}
{{/if}}

Generate:
1. 10-15 open-ended interview questions organized by theme
2. Follow-up probes for deeper insights
3. Scenarios or tasks to discuss with users
4. Questions to uncover emotional responses and motivations
5. Practical considerations for conducting the interviews

Focus on understanding user context, needs, frustrations, and desired outcomes. Ensure questions are neutral and encourage storytelling.`,
    variables: ['projectName', 'targetUsers', 'researchGoals'],
    description: 'Generate user interview questions and guide'
  },
  
  // Design Thinking - Define
  {
    id: 'dt-define-personas',
    framework: 'design-thinking',
    stage: 'define',
    tool: 'personas',
    template: `Based on user research findings, create detailed user personas for {{projectName}}.

Research Data:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Additional Context:
- Target Market: {{targetMarket}}
- Product/Service: {{productService}}
- Key User Segments: {{userSegments}}

For each persona, provide:
1. Demographic information and background
2. Goals, needs, and motivations
3. Pain points and frustrations
4. Behaviors and preferences
5. Technology comfort level
6. Preferred communication channels
7. A day-in-the-life scenario
8. Quote that captures their essence

Create 2-3 primary personas with distinct characteristics and needs. Make them feel like real people with specific details.`,
    variables: ['projectName', 'targetMarket', 'productService', 'userSegments'],
    description: 'Create detailed user personas from research'
  },

  // Design Thinking - Ideate
  {
    id: 'dt-ideate-brainstorm',
    framework: 'design-thinking',
    stage: 'ideate',
    tool: 'brainstorming',
    template: `Facilitate a creative ideation session for {{projectName}} to generate innovative solutions.

Problem Statement:
{{problemStatement}}

User Insights:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Constraints:
- Timeline: {{timeline}}
- Budget: {{budget}}
- Technical Limitations: {{techConstraints}}

Generate:
1. 20+ diverse solution ideas using different ideation techniques:
   - Direct solutions
   - Analogical thinking (how do other industries solve this?)
   - Reverse thinking (what would make this problem worse?)
   - Technology-enabled solutions
   - Low-tech alternatives

2. For each idea, provide:
   - Brief description
   - Key benefits
   - Implementation complexity (Low/Medium/High)
   - Potential impact (Low/Medium/High)

3. Suggest criteria for evaluating and prioritizing ideas

Focus on quantity over quality at first, encourage wild ideas, and build on others' suggestions.`,
    variables: ['projectName', 'problemStatement', 'timeline', 'budget', 'techConstraints'],
    description: 'Generate creative solution ideas'
  },

  // Design Thinking - Prototype
  {
    id: 'dt-prototype-wireframes',
    framework: 'design-thinking',
    stage: 'prototype',
    tool: 'wireframes',
    template: `Create wireframes for {{projectName}} based on the selected solution concept.

Solution Concept:
{{solutionConcept}}

User Personas:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Requirements:
- Platform: {{platform}}
- Key Features: {{keyFeatures}}
- User Goals: {{userGoals}}

Wireframe Specifications:
1. Information architecture and site map
2. Key user flows (3-5 primary tasks)
3. Low-fidelity wireframes for:
   - Landing/home page
   - Core feature screens
   - Navigation system
   - Form/input screens
   - Error states

4. For each wireframe, include:
   - Layout and content hierarchy
   - Navigation elements
   - Interactive components
   - Content areas and placeholders
   - Notes on functionality

5. Design rationale explaining how wireframes address user needs

Focus on functionality and user flow rather than visual design. Ensure wireframes support user goals and business objectives.`,
    variables: ['projectName', 'solutionConcept', 'platform', 'keyFeatures', 'userGoals'],
    description: 'Create wireframes for solution concept'
  },

  // Design Thinking - Test
  {
    id: 'dt-test-usability',
    framework: 'design-thinking',
    stage: 'test',
    tool: 'usability-tests',
    template: `Design a usability testing plan for {{projectName}} prototype validation.

Prototype Details:
{{prototypeDetails}}

Previous Design Work:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Testing Parameters:
- Participant Profile: {{participantProfile}}
- Testing Environment: {{testingEnvironment}}
- Timeline: {{testingTimeline}}

Create:
1. Testing objectives and key questions
2. Task scenarios (5-7 realistic tasks)
3. Success criteria and metrics
4. Pre-test questionnaire
5. Think-aloud protocol instructions
6. Post-test interview questions
7. Observation sheet template
8. Analysis plan for findings

For each task:
- Clear scenario context
- Specific goal to accomplish
- Success/failure criteria
- Expected completion time
- Potential pain points to watch for

Include both quantitative measures (task completion, time, errors) and qualitative insights (satisfaction, confusion points).`,
    variables: ['projectName', 'prototypeDetails', 'participantProfile', 'testingEnvironment', 'testingTimeline'],
    description: 'Design usability testing plan'
  },

  // Double Diamond - Discover
  {
    id: 'dd-discover-stakeholder',
    framework: 'double-diamond',
    stage: 'discover',
    tool: 'stakeholder-interviews',
    template: `Plan stakeholder interviews to understand the business context and constraints for {{projectName}}.

Project Overview:
- Business Domain: {{businessDomain}}
- Project Scope: {{projectScope}}
- Key Stakeholders: {{keyStakeholders}}

{{#if previousOutputs}}
Existing Research:
{{previousOutputs}}
{{/if}}

Design stakeholder interview strategy:
1. Stakeholder mapping and interview priorities
2. Customized question sets for different stakeholder types:
   - Business leaders/decision makers
   - Product managers
   - Technical teams
   - Customer support
   - Sales/marketing

3. Key topics to explore:
   - Business goals and success metrics
   - Current processes and pain points
   - Technical constraints and opportunities
   - Budget and timeline expectations
   - Organizational dynamics and politics
   - Customer feedback and market insights

4. Interview logistics and documentation plan
5. Synthesis approach for consolidating insights

Focus on understanding business context, constraints, and success criteria from multiple perspectives.`,
    variables: ['projectName', 'businessDomain', 'projectScope', 'keyStakeholders'],
    description: 'Plan comprehensive stakeholder interviews'
  },

  // Double Diamond - Define
  {
    id: 'dd-define-synthesis',
    framework: 'double-diamond',
    stage: 'define-dd',
    tool: 'synthesis-workshops',
    template: `Facilitate a synthesis workshop to define the core problem for {{projectName}}.

Research Inputs:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Workshop Details:
- Participants: {{workshopParticipants}}
- Duration: {{workshopDuration}}
- Expected Outcomes: {{expectedOutcomes}}

Workshop Agenda:
1. Research findings presentation (30 min)
2. Insights clustering activity (45 min)
3. Problem statement drafting (60 min)
4. Opportunity identification (45 min)
5. Success criteria definition (30 min)

Workshop Activities:
1. Affinity mapping of research insights
2. How Might We question generation
3. Problem statement mad libs
4. Impact vs. effort prioritization
5. Success metrics definition

Deliverables:
- Consolidated insights themes
- Prioritized problem statements
- Opportunity areas ranking
- Design principles
- Success criteria and KPIs

Design activities that engage all participants and build consensus around the core problem to solve.`,
    variables: ['projectName', 'workshopParticipants', 'workshopDuration', 'expectedOutcomes'],
    description: 'Facilitate problem definition workshop'
  },

  // Google Design Sprint - Understand
  {
    id: 'gds-understand-expert',
    framework: 'google-design-sprint',
    stage: 'understand',
    tool: 'expert-interviews',
    template: `Design expert interviews for the Google Design Sprint understanding phase for {{projectName}}.

Sprint Context:
- Sprint Goal: {{sprintGoal}}
- Target Users: {{targetUsers}}
- Business Challenge: {{businessChallenge}}

{{#if previousOutputs}}
Background Research:
{{previousOutputs}}
{{/if}}

Expert Interview Plan:
1. Expert identification and recruitment:
   - Internal experts (product, engineering, customer support)
   - External experts (industry, users, competitors)
   - Subject matter specialists

2. Interview structure (15-20 minutes each):
   - Expert background and perspective
   - Problem understanding and insights
   - Current solutions and alternatives
   - Opportunities and barriers
   - Key success factors

3. Lightning talks format:
   - 5-minute expert presentations
   - Key insights capture
   - Questions and clarifications
   - Insight prioritization

4. Documentation approach:
   - Insight capture templates
   - How Might We note generation
   - Key themes identification

Focus on gathering diverse perspectives quickly to build comprehensive problem understanding in the sprint timeframe.`,
    variables: ['projectName', 'sprintGoal', 'targetUsers', 'businessChallenge'],
    description: 'Design expert interviews for Design Sprint'
  }
];

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  templates: [],
  currentPrompt: null,
  isGenerating: false,

  generatePrompt: (framework, stage, tool, previousOutputs = []) => {
    const template = get().templates.find(
      t => t.framework === framework.id && t.stage === stage.id && t.tool === tool.id
    );

    if (!template) {
      return `Create a comprehensive ${tool.name} for the ${stage.name} stage of ${framework.name}.

Context: This is part of a ${framework.description} workflow.
Stage Description: ${stage.description}
Tool Description: ${tool.description}

${previousOutputs.length > 0 ? `Previous Outputs: ${previousOutputs.join('\n\n')}` : ''}

Please provide detailed, actionable guidance for implementing this UX tool in the current project context.`;
    }

    const prompt: GeneratedPrompt = {
      id: `prompt-${Date.now()}`,
      workflowId: `workflow-${framework.id}-${stage.id}-${tool.id}`,
      content: template.template,
      context: {
        framework,
        stage,
        tool,
        previousOutputs
      },
      variables: {},
      timestamp: Date.now()
    };

    set(state => ({
      prompts: [...state.prompts, prompt],
      currentPrompt: prompt
    }));

    return template.template;
  },

  executePrompt: async (promptId: string) => {
    set({ isGenerating: true });
    
    try {
      const prompt = get().prompts.find(p => p.id === promptId);
      if (!prompt) return;

      // Replace variables in template
      let processedContent = prompt.content;
      Object.entries(prompt.variables).forEach(([key, value]) => {
        processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Handle conditional blocks
      if (prompt.context.previousOutputs && prompt.context.previousOutputs.length > 0) {
        processedContent = processedContent.replace(
          /{{#if previousOutputs}}(.*?){{\/if}}/gs,
          (match, content) => content.replace('{{previousOutputs}}', prompt.context.previousOutputs!.join('\n\n'))
        );
      } else {
        processedContent = processedContent.replace(/{{#if previousOutputs}}(.*?){{\/if}}/gs, '');
      }

      // Here you would integrate with your AI service
      // For now, we'll simulate the response
      const simulatedOutput = `Generated output for ${prompt.context.tool.name} in ${prompt.context.stage.name} stage:\n\n${processedContent}`;
      
      get().addPromptOutput(promptId, simulatedOutput);
    } catch (error) {
      console.error('Error executing prompt:', error);
    } finally {
      set({ isGenerating: false });
    }
  },

  updatePromptVariables: (promptId, variables) => {
    set(state => ({
      prompts: state.prompts.map(p =>
        p.id === promptId ? { ...p, variables: { ...p.variables, ...variables } } : p
      )
    }));
  },

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  addPromptOutput: (promptId, output) => {
    set(state => ({
      prompts: state.prompts.map(p =>
        p.id === promptId ? { ...p, output } : p
      )
    }));
  },

  initializeTemplates: () => set({ templates: promptTemplates })
}));