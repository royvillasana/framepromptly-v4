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

// Comprehensive prompt templates for all UX frameworks
const promptTemplates: PromptTemplate[] = [
  // Design Thinking Templates
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

Focus on understanding user context, needs, frustrations, and desired outcomes.`,
    variables: ['projectName', 'targetUsers', 'researchGoals'],
    description: 'Generate user interview questions and guide'
  },
  
  {
    id: 'dt-empathize-empathy-maps',
    framework: 'design-thinking',
    stage: 'empathize',
    tool: 'empathy-maps',
    template: `Create detailed empathy maps for {{projectName}} to visualize user thoughts, feelings, actions, and pain points.

User Context:
- Target User: {{targetUser}}
- User Scenario: {{userScenario}}
{{#if previousOutputs}}
- Research Data: {{previousOutputs}}
{{/if}}

For each empathy map quadrant, provide:

SAYS:
- Direct quotes and defining words
- What they tell others about their experience

THINKS:
- Beliefs, thoughts, and preoccupations
- What occupies their thoughts

DOES:
- Actions and behaviors
- What they do in their environment

FEELS:
- Emotions and feelings
- What they feel and experience

Also include:
- Pain points and frustrations
- Needs and wants
- Goals and motivations

Make it specific and based on real user insights.`,
    variables: ['projectName', 'targetUser', 'userScenario'],
    description: 'Create detailed user empathy maps'
  },

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

For each persona (create 2-3), provide:
1. Demographic information and background
2. Goals, needs, and motivations
3. Pain points and frustrations
4. Behaviors and preferences
5. Technology comfort level
6. Preferred communication channels
7. A day-in-the-life scenario
8. Quote that captures their essence

Create personas that feel like real people with specific details and distinct characteristics.`,
    variables: ['projectName', 'targetMarket', 'productService', 'userSegments'],
    description: 'Create detailed user personas from research'
  },

  // Google Design Sprint Templates
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

Focus on gathering diverse perspectives quickly to build comprehensive problem understanding.`,
    variables: ['projectName', 'sprintGoal', 'targetUsers', 'businessChallenge'],
    description: 'Design expert interviews for Design Sprint'
  },

  {
    id: 'gds-sketch-crazy8s',
    framework: 'google-design-sprint',
    stage: 'sketch',
    tool: 'crazy-8s-sprint',
    template: `Facilitate a Crazy 8s sketching session for {{projectName}} to generate rapid solution ideas.

Challenge Statement:
{{challengeStatement}}

How Might We Questions:
{{#if previousOutputs}}
{{previousOutputs}}
{{/if}}

Crazy 8s Instructions:
1. Setup (5 minutes):
   - Fold paper into 8 sections
   - Set timer for 8 minutes
   - One idea per section

2. Sketching Rules:
   - Focus on UI/screen ideas
   - Don't worry about quality
   - Build on previous ideas
   - Go for volume

3. Ideas to explore:
   - Different entry points
   - Various interaction patterns
   - Alternative user flows
   - Creative solutions to {{specificProblem}}

4. Follow-up:
   - Quick idea sharing (30 seconds each)
   - Dot voting on promising concepts
   - Note interesting patterns
   - Set up for solution sketching

Generate 20+ diverse UI concepts that address the core challenge.`,
    variables: ['projectName', 'challengeStatement', 'specificProblem'],
    description: 'Facilitate rapid idea sketching session'
  },

  // Human-Centered Design Templates
  {
    id: 'hcd-hear-contextual',
    framework: 'human-centered-design',
    stage: 'hear',
    tool: 'contextual-interviews',
    template: `Design contextual interviews for {{projectName}} to understand users in their natural environment.

Research Context:
- Location: {{researchLocation}}
- User Activities: {{userActivities}}
- Research Questions: {{researchQuestions}}

Contextual Interview Plan:
1. Pre-visit preparation:
   - Site logistics and permissions
   - Equipment and materials needed
   - Safety considerations
   - Cultural sensitivity guidelines

2. Interview structure:
   - Introduction and rapport building (10 min)
   - Environment tour and observation (20 min)
   - Task demonstration and narration (30 min)
   - Reflection and deeper discussion (20 min)
   - Wrap-up and next steps (10 min)

3. Observation areas:
   - Physical environment and constraints
   - Social dynamics and interactions
   - Tools and technology usage
   - Workflow and process patterns
   - Workarounds and adaptations

4. Documentation approach:
   - Photo/video permissions
   - Note-taking strategies
   - Real-time insight capture
   - Follow-up question tracking

Focus on understanding the context that shapes user behavior and needs.`,
    variables: ['projectName', 'researchLocation', 'userActivities', 'researchQuestions'],
    description: 'Plan in-context user research'
  },

  // Jobs-to-Be-Done Templates
  {
    id: 'jtbd-mapping-steps',
    framework: 'jobs-to-be-done',
    stage: 'job-mapping',
    tool: 'job-steps',
    template: `Map the job steps for {{customerJob}} in the context of {{projectName}}.

Job Context:
- Core Functional Job: {{customerJob}}
- Job Executor: {{jobExecutor}}
- Job Context: {{jobContext}}

Job Mapping Structure:
Create a detailed map of the customer job with these elements:

1. Job Steps (8-12 main steps):
   - Define the beginning (job trigger)
   - Map the middle (execution steps)
   - Define the end (job completion)

2. For each step, identify:
   - What the customer is trying to accomplish
   - Current solutions and tools used
   - Information needed at this step
   - Success criteria for this step
   - Common failures or inefficiencies

3. Emotional job layers:
   - How customers want to feel
   - What they want to avoid feeling
   - Social perceptions and status

4. Related jobs:
   - Jobs that happen before/after
   - Competing jobs for attention
   - Supporting jobs that enable success

Focus on creating a comprehensive view of the customer's job process.`,
    variables: ['customerJob', 'projectName', 'jobExecutor', 'jobContext'],
    description: 'Map detailed customer job steps'
  },

  // Lean UX Templates
  {
    id: 'lean-hypothesize-canvas',
    framework: 'lean-ux',
    stage: 'hypothesize',
    tool: 'hypothesis-canvas',
    template: `Create hypothesis statements for {{projectName}} using the Lean UX hypothesis format.

Project Context:
- Business Goal: {{businessGoal}}
- Target User: {{targetUser}}
- User Problem: {{userProblem}}

Hypothesis Structure:
We believe that [building this feature/solution]
For [these people/personas]
Will achieve [this outcome]
We will know this is true when [we see this signal/metric]

Generate 5-7 hypotheses covering:

1. Problem Hypothesis:
   - What problem are we solving?
   - Who has this problem?
   - How do we know it's a real problem?

2. Solution Hypothesis:
   - What solution will address the problem?
   - Why will this solution work?
   - What alternatives did we consider?

3. Value Hypothesis:
   - What value will users get?
   - Why will they choose our solution?
   - What's the job-to-be-done?

4. Growth Hypothesis:
   - How will users discover our solution?
   - What will drive adoption?
   - How will it spread?

Include success metrics and validation methods for each hypothesis.`,
    variables: ['projectName', 'businessGoal', 'targetUser', 'userProblem'],
    description: 'Create testable hypothesis statements'
  },

  // Agile UX Templates
  {
    id: 'agile-plan-story-mapping',
    framework: 'agile-ux',
    stage: 'plan',
    tool: 'user-story-mapping',
    template: `Create a user story map for {{projectName}} to visualize the user journey and prioritize features.

Product Context:
- Product Vision: {{productVision}}
- Target Users: {{targetUsers}}
- Core User Journey: {{coreJourney}}

Story Mapping Structure:

1. User Activities (Top Level):
   - High-level activities users perform
   - Organized left to right in sequence
   - Represent the user's workflow

2. User Tasks (Second Level):
   - Specific tasks within each activity
   - More detailed breakdown of activities
   - Still in chronological order

3. User Stories (Bottom Levels):
   - Detailed stories for each task
   - Include acceptance criteria
   - Organized by priority/release

4. Story Details:
   - As a [user type]
   - I want [functionality]
   - So that [benefit/value]

5. Release Planning:
   - Walking skeleton (MVP)
   - Release 1, 2, 3 priorities
   - Nice-to-have features

6. Story Acceptance Criteria:
   - Given [context]
   - When [action]
   - Then [expected outcome]

Create a comprehensive story map that guides development priorities.`,
    variables: ['projectName', 'productVision', 'targetUsers', 'coreJourney'],
    description: 'Create user story map for feature prioritization'
  },

  // HEART Framework Templates
  {
    id: 'heart-happiness-nps',
    framework: 'heart-framework',
    stage: 'happiness',
    tool: 'nps-surveys',
    template: `Design NPS surveys and happiness metrics for {{projectName}}.

Measurement Context:
- Product Type: {{productType}}
- Key User Touchpoints: {{userTouchpoints}}
- Business Goals: {{businessGoals}}

NPS Survey Design:

1. Core NPS Question:
   "How likely are you to recommend {{productName}} to a friend or colleague?"
   (0-10 scale with follow-up)

2. Follow-up Questions by Score:
   
   Promoters (9-10):
   - What do you love most about {{productName}}?
   - What features are most valuable to you?
   - How has {{productName}} helped you achieve your goals?

   Passives (7-8):
   - What would make you more likely to recommend us?
   - What's missing from your experience?
   - How could we better serve your needs?

   Detractors (0-6):
   - What's your biggest frustration with {{productName}}?
   - What would need to change for you to recommend us?
   - What alternatives are you considering?

3. Additional Happiness Metrics:
   - Customer satisfaction (CSAT) scores
   - Customer effort score (CES)
   - Emotional response tracking
   - Feature satisfaction ratings

4. Implementation Plan:
   - Survey timing and triggers
   - Response rate optimization
   - Analysis and reporting cadence
   - Action planning based on results

Create a comprehensive happiness measurement system.`,
    variables: ['projectName', 'productType', 'userTouchpoints', 'businessGoals', 'productName'],
    description: 'Design NPS and happiness measurement system'
  },

  // Hooked Model Templates
  {
    id: 'hooked-trigger-notifications',
    framework: 'hooked-model',
    stage: 'trigger',
    tool: 'notification-strategy',
    template: `Design a notification strategy for {{projectName}} to create effective external triggers.

Product Context:
- App Type: {{appType}}
- User Behavior Goal: {{behaviorGoal}}
- Current User Patterns: {{userPatterns}}

Notification Strategy:

1. External Trigger Types:
   
   Paid Triggers:
   - Advertising and promotional content
   - Sponsored content and placements
   - Email marketing campaigns
   
   Earned Triggers:
   - Social media mentions and shares
   - Press coverage and reviews
   - Word-of-mouth referrals
   
   Relationship Triggers:
   - App notifications and alerts
   - Email communications
   - SMS and push notifications
   
   Owned Triggers:
   - App icons and visual cues
   - Website and landing pages
   - In-app messaging

2. Notification Framework:
   - Trigger timing and frequency
   - Personalization strategies
   - Content and messaging
   - Call-to-action design

3. Behavioral Triggers:
   - Time-based triggers (daily, weekly)
   - Activity-based triggers (milestone reached)
   - Social triggers (friend activity)
   - Location-based triggers (geofencing)

4. Optimization Approach:
   - A/B testing framework
   - Opt-out and preference management
   - Performance metrics tracking
   - User feedback integration

Design triggers that motivate action without causing notification fatigue.`,
    variables: ['projectName', 'appType', 'behaviorGoal', 'userPatterns'],
    description: 'Create comprehensive notification trigger strategy'
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