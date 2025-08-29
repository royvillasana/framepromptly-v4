import { create } from 'zustand';
import { UXFramework, UXStage, UXTool } from './workflow-store';
import { supabase } from '@/integrations/supabase/client';
import { getEnhancedTemplateById, getAllEnhancedTemplates, EnhancedToolPromptTemplate, validateTemplateVariables, getIndustryAdaptation } from '@/lib/tool-templates-enhanced';
import { promptQualityValidator, QualityValidationResult } from '@/lib/prompt-quality-validator';
import { getEnhancedInstructions } from '@/lib/enhanced-tool-instructions';
import { 
  enhancedContextIntegrationService, 
  IntegratedContextRequest, 
  IntegratedContextResponse 
} from '@/lib/enhanced-context-integration-service';
import { 
  DestinationType, 
  AIProviderType, 
  DestinationContext, 
  TailoredOutput 
} from '@/lib/destination-driven-tailoring';
import { destinationTailoringService } from '@/lib/destination-tailoring-service';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: string;
  framework: string;
  stage: string;
  tool: string;
  template: string;
  variables: string[];
  description: string;
  frameworkInstructions?: string;
  stageInstructions?: string;
  toolInstructions?: string;
}

export interface EnhancedPromptContext {
  industry?: string;
  customizations?: Record<string, any>;
  qualityLevel?: 'basic' | 'intermediate' | 'advanced';
  timeConstraints?: 'flexible' | 'standard' | 'tight';
  teamSize?: number;
  experience?: 'beginner' | 'intermediate' | 'expert';
}

export interface GeneratedPrompt {
  id: string;
  workflowId: string;
  projectId: string;
  content: string;
  context: {
    framework: UXFramework;
    stage: UXStage;
    tool: UXTool;
    connectedNodes?: {
      frameworks: any[];
      stages: any[];
      tools: any[];
    };
    nodeCustomizations?: Record<string, any>;
    previousOutputs?: string[];
    enhancedContext?: EnhancedPromptContext;
  };
  variables: Record<string, string>;
  output?: string;
  conversation?: ConversationMessage[];
  timestamp: number;
  qualityScore?: QualityValidationResult;
  templateVersion?: string;
  industry?: string;
  // Destination-driven tailoring properties
  destination?: {
    type: DestinationType;
    aiProvider?: AIProviderType;
    userIntent?: string;
    tailoredPrompt?: string;
    tailoredOutput?: TailoredOutput;
    displayContent?: string;
    integrationPayload?: any;
  };
}

export interface PromptState {
  prompts: GeneratedPrompt[];
  templates: PromptTemplate[];
  enhancedTemplates: EnhancedToolPromptTemplate[];
  currentPrompt: GeneratedPrompt | null;
  isGenerating: boolean;
  isValidating: boolean;
  isTailoring: boolean;
  
  // Actions
  loadProjectPrompts: (projectId: string) => Promise<void>;
  generatePrompt: (projectId: string, framework: UXFramework, stage: UXStage, tool: UXTool, connectedNodes?: any, nodeCustomizations?: Record<string, any>, previousOutputs?: string[], knowledgeContext?: string, enhancedContext?: EnhancedPromptContext) => Promise<string>;
  generateEnhancedPrompt: (templateId: string, variables: Record<string, any>, enhancedContext?: EnhancedPromptContext) => Promise<GeneratedPrompt>;
  validatePromptQuality: (promptId: string) => Promise<QualityValidationResult>;
  executePrompt: (promptId: string) => Promise<void>;
  updatePromptVariables: (promptId: string, variables: Record<string, string>) => void;
  setCurrentPrompt: (prompt: GeneratedPrompt | null) => void;
  addPromptOutput: (promptId: string, output: string) => void;
  updatePromptConversation: (promptId: string, messages: ConversationMessage[]) => void;
  addConversationMessage: (promptId: string, message: ConversationMessage) => void;
  initializeTemplates: () => void;
  initializeEnhancedTemplates: () => void;
  clearProjectPrompts: () => void;
  getEnhancedTemplate: (toolId: string) => EnhancedToolPromptTemplate | undefined;
  validateTemplateVariables: (templateId: string, variables: Record<string, any>) => { isValid: boolean; errors: string[] };
  generateEnhancedContextPrompt: (request: IntegratedContextRequest) => Promise<IntegratedContextResponse>;
  recordWorkflowOutput: (projectId: string, output: GeneratedPrompt, decisions?: any[], nextStageId?: string) => Promise<void>;
  getWorkflowAnalytics: (projectId: string) => Promise<any>;
  
  // Destination-driven tailoring actions
  tailorPromptForDestination: (promptId: string, destinationContext: DestinationContext) => Promise<{ success: boolean; errors?: string[]; clarifyingQuestions?: string[] }>;
  getSupportedDestinations: () => DestinationType[];
  getSupportedAIProviders: () => AIProviderType[];
  clearDestination: (promptId: string) => void;
}

// Framework-level instructions for prompt generation
const FRAMEWORK_INSTRUCTIONS = {
  'design-thinking': 'Focus on empathy, ideation, and experimentation. Use iterative problem-solving and user validation.',
  'double-diamond': 'Follow the divergent-convergent thinking pattern. In Discovery and Development phases, explore broadly. In Define and Deliver phases, focus and synthesize insights into actionable solutions.',
  'google-design-sprint': 'Maintain the 5-day sprint methodology focus on rapid prototyping and validation. Emphasize time-boxed activities, collaborative decision-making, and quick user feedback.',
  'human-centered-design': 'Prioritize deep user understanding and contextual research. Focus on designing solutions that fit naturally into users\' lives and address real human needs.',
  'jobs-to-be-done': 'Frame everything around the functional, emotional, and social jobs customers are trying to accomplish. Focus on outcomes rather than features.',
  'lean-ux': 'Apply lean startup principles with build-measure-learn cycles. Emphasize hypothesis-driven design, rapid experimentation, and continuous learning.',
  'agile-ux': 'Integrate UX work into agile development cycles. Focus on collaborative design, iterative delivery, and maintaining user-centricity within development constraints.',
  'heart-framework': 'Structure around Google\'s HEART metrics: Happiness, Engagement, Adoption, Retention, Task Success. Ensure all outputs are measurable and data-driven.',
  'hooked-model': 'Apply Nir Eyal\'s behavior design framework focusing on Trigger-Action-Variable Reward-Investment cycles to create habit-forming experiences.'
};

// Stage-level instructions for prompt generation  
const STAGE_INSTRUCTIONS = {
  // Design Thinking stages
  'empathize': 'Generate empathy-focused outputs that deeply understand user needs, emotions, and contexts. Use qualitative research methods and human-centered observation techniques.',
  'define': 'Synthesize research insights into clear, actionable problem statements. Create user-focused definitions that guide solution development.',
  'ideate': 'Generate diverse, creative solutions without initial constraints. Encourage quantity over quality and build on others\' ideas.',
  'prototype': 'Create tangible, testable representations of solutions. Focus on learning-oriented prototypes that validate key assumptions.',
  'test': 'Design validation methods that generate actionable insights. Focus on user behavior observation and iterative improvement.',
  
  // Double Diamond stages
  'discover': 'Explore the problem space broadly. Gather diverse perspectives and identify unexpected insights through comprehensive research.',
  'define-dd': 'Converge on a clear problem definition. Synthesize discoveries into focused opportunity areas and design challenges.',
  'develop': 'Generate and iterate on solution concepts. Create multiple approaches and refine through rapid experimentation.',
  'deliver': 'Implement and launch solutions. Focus on execution planning and post-launch optimization.',
  
  // Google Design Sprint stages
  'understand': 'Rapidly gather expert knowledge and user insights. Build shared understanding of the challenge and constraints.',
  'sketch': 'Generate individual solution concepts quickly. Focus on UI-level ideas and specific interaction patterns.',
  'decide': 'Collaboratively select the most promising concepts. Use structured decision-making to choose what to prototype.',
  'prototype-gds': 'Build a realistic facade of the solution. Create something that feels real enough for meaningful user testing.',
  'validate': 'Test with real users to gather authentic feedback. Focus on learning and next steps rather than validation.',
  
  // Human-Centered Design stages
  'hear': 'Deeply understand people and their contexts. Use immersive research methods to gather rich, contextual insights.',
  'create': 'Design solutions that fit naturally into people\'s lives. Iterate based on human feedback and real-world constraints.',
  'deliver-hcd': 'Implement solutions with ongoing user involvement. Plan for sustainable adoption and continuous improvement.',
  
  // Jobs-to-Be-Done stages
  'job-mapping': 'Map the complete customer job process. Identify all steps, needs, and contexts involved in job execution.',
  'outcomes': 'Define desired outcomes and success metrics. Focus on what customers want to accomplish, not how.',
  'solutions': 'Design solutions that help customers get their jobs done better. Focus on job-step improvements and outcome achievement.',
  
  // Lean UX stages
  'hypothesize': 'Create testable assumptions about users, problems, and solutions. Structure as measurable hypotheses.',
  'experiment': 'Design rapid tests to validate or invalidate hypotheses. Focus on learning with minimal viable experiments.',
  'learn': 'Synthesize experimental results into actionable insights. Pivot or persevere based on validated learning.',
  
  // Agile UX stages
  'plan': 'Integrate UX work into sprint planning. Create user-centered backlogs and define UX success criteria.',
  'design': 'Create designs that support development velocity. Focus on collaboration and iterative refinement.',
  'build': 'Support development with ongoing design guidance. Ensure implementation matches design intent.',
  'test-agile': 'Validate designs with users within sprint timelines. Focus on quick feedback and rapid iteration.',
  'iterate': 'Continuously improve based on user feedback and usage data. Apply learnings to future sprints.',
  
  // HEART Framework stages
  'happiness': 'Measure and improve user satisfaction and sentiment. Focus on qualitative feedback and emotional responses.',
  'engagement': 'Track and optimize user interaction patterns. Focus on meaningful usage and feature adoption.',
  'adoption': 'Measure new user acquisition and onboarding success. Focus on conversion and initial engagement.',
  'retention': 'Analyze and improve user return behavior. Focus on long-term value and continued usage.',
  'task-success': 'Measure task completion rates and efficiency. Focus on usability and user goal achievement.',
  
  // Hooked Model stages
  'trigger': 'Design cues that prompt user action. Focus on external and internal triggers that drive engagement.',
  'action': 'Simplify and optimize the target behavior. Apply Fogg behavior model: motivation, ability, trigger.',
  'variable-reward': 'Create unpredictable, satisfying rewards. Use social approval, hunt, and self rewards.',
  'investment': 'Increase user commitment through investment. Focus on stored value, content, reputation, and skills.'
};

// Tool-level instructions for prompt generation
const TOOL_INSTRUCTIONS = {
  // Research & Discovery Tools
  'user-interviews': 'Generate open-ended questions uncovering user needs, behaviors, and contexts. Focus on why questions and emotional responses.',
  'surveys': 'Design quantitative and qualitative questions that can be analyzed statistically. Ensure proper sampling and avoid leading questions.',
  'observations': 'Create structured observation protocols that capture user behavior in natural contexts. Focus on actions, not just stated preferences.',
  'contextual-inquiry': 'Design immersive research that understands work environments and natural usage contexts. Combine observation with in-the-moment questioning.',
  'empathy-maps': 'Structure user insights into Says, Thinks, Does, Feels quadrants. Include pains and gains to complete the user perspective.',
  'stakeholder-interviews': 'Gather business requirements and constraints from key stakeholders. Understand organizational context and success criteria.',
  'expert-interviews': 'Design structured interviews with domain experts and specialists. Focus on gathering specialized knowledge and insights quickly.',
  
  // Analysis & Synthesis Tools
  'affinity-mapping': 'Group related insights to identify patterns and themes. Use inductive reasoning to discover unexpected connections.',
  'personas': 'Create archetypal users based on research data. Include goals, needs, behaviors, and contexts that guide design decisions.',
  'journey-maps': 'Map the complete user experience across touchpoints and time. Include emotions, pain points, and opportunities.',
  'service-blueprints': 'Map front-stage and back-stage service delivery processes. Include people, systems, and support processes.',
  'problem-statements': 'Define clear, actionable problem definitions that guide solution development. Use point-of-view format: User + Need + Insight.',
  
  // Ideation Tools
  'brainstorming': 'Generate diverse ideas without initial judgment. Focus on quantity, build on ideas, and encourage wild concepts.',
  'scamper': 'Apply systematic creativity techniques: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse.',
  'how-might-we': 'Reframe problems as solution-oriented questions. Create multiple HMW questions to explore different solution angles.',
  'crazy-8s-sprint': 'Generate 8 ideas in 8 minutes through rapid sketching. Focus on quantity and diverse solution approaches.',
  'concept-sketches': 'Create rough visual representations of solution concepts. Focus on key interactions and user flows.',
  
  // Prototyping Tools
  'sketching': 'Create low-fidelity visual representations of ideas. Focus on communication and rapid iteration over visual polish.',
  'wireframes': 'Design structural layouts of interfaces. Focus on information hierarchy and functional requirements.',
  'mockups': 'Create detailed visual designs that represent final appearance. Include typography, colors, and visual styling.',
  'high-fidelity-prototypes': 'Build interactive prototypes that simulate real functionality. Focus on realistic user interactions.',
  'paper-prototypes': 'Create testable interfaces using paper and simple materials. Focus on rapid testing and iteration.',
  'digital-prototypes': 'Build interactive digital prototypes for realistic testing. Use appropriate fidelity for testing goals.',
  
  // Testing & Validation Tools
  'usability-tests': 'Design structured tests that evaluate interface usability. Focus on task completion, errors, and user satisfaction.',
  'a-b-tests': 'Create controlled experiments comparing solution variants. Ensure statistical significance and clear success metrics.',
  'analytics-review': 'Analyze user behavior data to understand usage patterns. Focus on actionable insights and user journey optimization.',
  'heuristic-evaluation': 'Apply usability principles to evaluate interface design. Use Nielsen\'s heuristics or relevant design principles.',
  'cognitive-walkthroughs': 'Evaluate user task flows for cognitive load and usability. Focus on new user experience and task efficiency.',
  
  // Business & Strategy Tools
  'business-model-canvas': 'Map business model components and relationships. Focus on value propositions and customer relationships.',
  'value-proposition-canvas': 'Define how products create value for customers. Map customer jobs, pains, and gains to product features.',
  'competitive-analysis': 'Analyze competitor strengths, weaknesses, and market positioning. Identify opportunities and threats.',
  'kano-model': 'Categorize features by user satisfaction impact. Identify must-haves, performance features, and delighters.',
  
  // Agile & Planning Tools
  'user-story-mapping': 'Organize user stories by user journey and priority. Create a visual backlog that maintains user perspective.',
  'sprint-planning': 'Plan UX work within agile development cycles. Balance discovery, design, and validation activities.',
  'design-studios': 'Facilitate collaborative design sessions with cross-functional teams. Generate and critique ideas together.',
  'retrospectives': 'Reflect on team process and identify improvements. Focus on actionable changes for future work.',
  
  // Measurement Tools
  'nps-surveys': 'Measure customer loyalty and satisfaction with Net Promoter Score methodology. Include follow-up questions for insights.',
  'customer-satisfaction': 'Design surveys that measure user satisfaction with specific experiences. Use appropriate rating scales.',
  'task-completion-rates': 'Measure user success in completing key tasks. Track completion rates, time, and error rates.',
  'engagement-metrics': 'Define and track user engagement indicators. Focus on meaningful interactions rather than vanity metrics.',
  
  // Jobs-to-Be-Done Tools
  'job-statements': 'Define customer jobs in functional language. Use: When [situation], I want to [motivation], so I can [expected outcome].',
  'outcome-statements': 'Define desired outcomes in measurable terms. Focus on speed, predictability, quality, and cost considerations.',
  'job-mapping': 'Map the complete process customers use to get a job done. Include job steps, needs, and emotional considerations.',
  
  // Behavioral Design Tools
  'notification-strategy': 'Design external triggers that prompt user action. Consider timing, relevance, and user preferences.',
  'onboarding-flows': 'Create user introduction experiences that drive engagement. Focus on value demonstration and habit formation.',
  'reward-systems': 'Design variable reward mechanisms that maintain user interest. Use social, material, and intrinsic rewards.',
  'habit-loops': 'Design behavioral loops that encourage repeated usage. Apply trigger-action-reward-investment patterns.'
};

// Comprehensive prompt templates for all UX frameworks
const promptTemplates: PromptTemplate[] = [
  // Design Thinking Templates
  {
    id: 'dt-empathize-interviews',
    framework: 'design-thinking',
    stage: 'empathize',
    tool: 'user-interviews',
    template: `Generate user interview questions for {{projectName}} targeting {{targetUsers}} with research goals: {{researchGoals}}.
{{#if previousOutputs}}
Previous research: {{previousOutputs}}
{{/if}}

Reference the project knowledge base to understand existing context and avoid repeating covered areas.

Create warm-up questions covering background, role, and daily routines.

Design 8-10 core questions exploring pain points, workflows, decision-making processes, and desired outcomes.

Include follow-up probes for deeper insights.

Add scenario-based questions for specific situations and task completion.

End with priority ranking and solution gap identification.

Structure as 45-60 minute session with recording setup and note-taking approach.`,
    variables: ['projectName', 'targetUsers', 'researchGoals'],
    description: 'Generate user interview questions and guide',
    frameworkInstructions: FRAMEWORK_INSTRUCTIONS['design-thinking'],
    stageInstructions: STAGE_INSTRUCTIONS['empathize'],
    toolInstructions: TOOL_INSTRUCTIONS['user-interviews']
  },
  
  {
    id: 'dt-empathize-empathy-maps',
    framework: 'design-thinking',
    stage: 'empathize',
    tool: 'empathy-maps',
    template: `Create empathy maps for {{projectName}} focusing on {{targetUser}} in scenario: {{userScenario}}.
{{#if previousOutputs}}
Research data: {{previousOutputs}}
{{/if}}

Use the project knowledge base to inform understanding of user context and existing insights.

Map user expressions including direct quotes, repeated phrases, problem descriptions, and language patterns.

Document internal thoughts covering beliefs, assumptions, concerns, and mental models.

Record observable actions including behaviors, workarounds, tools used, and process steps.

Capture emotional states identifying frustrations, satisfaction moments, anxiety triggers, and excitement drivers.

List pain points covering process breakdowns, time wasters, error-prone steps, and unmet needs.

Identify gains including desired outcomes, success metrics, and value sought.

Base all content on specific research data and real user examples.`,
    variables: ['projectName', 'targetUser', 'userScenario'],
    description: 'Create detailed user empathy maps',
    frameworkInstructions: FRAMEWORK_INSTRUCTIONS['design-thinking'],
    stageInstructions: STAGE_INSTRUCTIONS['empathize'],
    toolInstructions: TOOL_INSTRUCTIONS['empathy-maps']
  },

  {
    id: 'dt-define-personas',
    framework: 'design-thinking',
    stage: 'define',
    tool: 'personas',
    template: `Create 2-3 user personas for {{projectName}} targeting {{targetMarket}} with {{productService}} for segments: {{userSegments}}.
{{#if previousOutputs}}
Research data: {{previousOutputs}}
{{/if}}

Build demographic profiles with specific background details.

Define goals, needs, and core motivations for each persona.

Document pain points and key frustrations.

Outline behaviors, preferences, and technology comfort levels.

Specify preferred communication channels.

Write day-in-the-life scenarios showing typical usage patterns.

Include authentic quotes that capture each persona's perspective.

Ensure personas feel like real people with distinct, specific characteristics.`,
    variables: ['projectName', 'targetMarket', 'productService', 'userSegments'],
    description: 'Create detailed user personas from research',
    frameworkInstructions: FRAMEWORK_INSTRUCTIONS['design-thinking'],
    stageInstructions: STAGE_INSTRUCTIONS['define'],
    toolInstructions: TOOL_INSTRUCTIONS['personas']
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
    description: 'Design expert interviews for Design Sprint',
    frameworkInstructions: FRAMEWORK_INSTRUCTIONS['google-design-sprint'],
    stageInstructions: STAGE_INSTRUCTIONS['understand'],
    toolInstructions: TOOL_INSTRUCTIONS['expert-interviews']
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
  enhancedTemplates: [],
  currentPrompt: null,
  isGenerating: false,
  isValidating: false,
  isTailoring: false,

  loadProjectPrompts: async (projectId: string) => {
    try {
      console.log('Loading prompts for project:', projectId);
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded prompts from database:', data?.length || 0);

      // Transform database data to GeneratedPrompt format
      const transformedPrompts: GeneratedPrompt[] = (data || []).map(dbPrompt => {
        // Parse conversation history from database
        let conversation: ConversationMessage[] | undefined;
        let aiResponse = dbPrompt.ai_response;

        // Handle conversation data stored in ai_response field (temporary workaround)
        if (dbPrompt.ai_response && typeof dbPrompt.ai_response === 'string') {
          try {
            const parsedResponse = JSON.parse(dbPrompt.ai_response);
            if (parsedResponse.type === 'conversation' && Array.isArray(parsedResponse.messages)) {
              conversation = parsedResponse.messages.map((msg: any) => ({
                id: msg.id,
                type: msg.type,
                content: msg.content,
                timestamp: new Date(msg.timestamp)
              }));
              aiResponse = undefined; // Clear ai_response since it's now conversation data
            }
          } catch (e) {
            // If parsing fails, treat as regular ai_response
            aiResponse = dbPrompt.ai_response;
          }
        }

        // Handle conversation_history field (future migration)
        if (dbPrompt.conversation_history && Array.isArray(dbPrompt.conversation_history)) {
          conversation = (dbPrompt.conversation_history as any[]).map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
        }

        return {
          id: dbPrompt.id,
          workflowId: 'current-workflow',
          projectId: dbPrompt.project_id,
          content: dbPrompt.prompt_content,
          context: {
            framework: { id: dbPrompt.framework_name, name: dbPrompt.framework_name } as UXFramework,
            stage: { id: dbPrompt.stage_name, name: dbPrompt.stage_name } as UXStage,
            tool: { id: dbPrompt.tool_name, name: dbPrompt.tool_name } as UXTool,
          },
          variables: (dbPrompt.variables && typeof dbPrompt.variables === 'object' && !Array.isArray(dbPrompt.variables)) 
            ? dbPrompt.variables as Record<string, string>
            : {},
          output: aiResponse || undefined,
          conversation,
          timestamp: new Date(dbPrompt.created_at).getTime()
        };
      });

      console.log('Setting prompts in store:', transformedPrompts.length);
      set({ prompts: transformedPrompts });
    } catch (error) {
      console.error('Error loading project prompts:', error);
    }
  },

  generatePrompt: async (projectId: string, framework: UXFramework, stage: UXStage, tool: UXTool, connectedNodes?: any, nodeCustomizations?: Record<string, any>, previousOutputs?: string[], knowledgeContext?: string, enhancedContext?: EnhancedPromptContext) => {
    // Try to use enhanced template first
    const enhancedTemplate = get().enhancedTemplates.find(t => t.id === tool.id);
    
    if (enhancedTemplate) {
      // Provide meaningful defaults for enhanced template variables
      const defaultVariables: Record<string, any> = {
        projectName: 'Current Project',
        framework: framework.name,
        stage: stage.name,
        tool: tool.name,
        ...nodeCustomizations
      };

      // Add specific defaults for common template variables
      enhancedTemplate.variables.forEach(variable => {
        if (variable.required && !defaultVariables[variable.id]) {
          switch (variable.type) {
            case 'number':
              if (variable.id === 'sampleSize') {
                defaultVariables[variable.id] = 15;
              } else {
                defaultVariables[variable.id] = variable.validation?.min || 1;
              }
              break;
            case 'select':
              defaultVariables[variable.id] = variable.options?.[0] || '';
              break;
            case 'textarea':
              if (variable.id === 'dataSources') {
                defaultVariables[variable.id] = 'User interviews, surveys, analytics data, support tickets';
              } else if (variable.id === 'researchMethods') {
                defaultVariables[variable.id] = 'User interviews, behavioral analytics, survey data, usability testing';
              } else if (variable.id === 'primaryGoal') {
                defaultVariables[variable.id] = 'Complete the main task efficiently and successfully';
              } else {
                defaultVariables[variable.id] = `Default ${variable.name.toLowerCase()}`;
              }
              break;
            case 'text':
              if (variable.id === 'personaName') {
                defaultVariables[variable.id] = 'Primary User';
              } else {
                defaultVariables[variable.id] = `Default ${variable.name.toLowerCase()}`;
              }
              break;
            default:
              defaultVariables[variable.id] = `Default ${variable.name.toLowerCase()}`;
          }
        }
      });

      return get().generateEnhancedPrompt(enhancedTemplate.id, defaultVariables, enhancedContext);
    }
    
    // Fallback to legacy template system
    const template = get().templates.find(
      t => t.framework === framework.id && t.stage === stage.id && t.tool === tool.id
    );

    let processedTemplate = '';
    
    if (template) {
      // Combine instructions from framework, stage, and tool levels
      const instructions = [
        template.frameworkInstructions && `Framework Context: ${template.frameworkInstructions}`,
        template.stageInstructions && `Stage Focus: ${template.stageInstructions}`,
        template.toolInstructions && `Tool Guidance: ${template.toolInstructions}`,
      ].filter(Boolean).join('\n\n');
      
      processedTemplate = instructions ? `${instructions}\n\n${template.template}` : template.template;
      
      // Add knowledge context if provided
      if (knowledgeContext) {
        processedTemplate = `Project Knowledge Base:
${knowledgeContext}

${processedTemplate}`;
      }
    } else {
      // Fallback with general instructions
      const frameworkInstruction = FRAMEWORK_INSTRUCTIONS[framework.id] || '';
      const stageInstruction = STAGE_INSTRUCTIONS[stage.id] || '';
      const toolInstruction = TOOL_INSTRUCTIONS[tool.id] || '';
      
      const instructions = [
        frameworkInstruction && `Framework Context: ${frameworkInstruction}`,
        stageInstruction && `Stage Focus: ${stageInstruction}`,
        toolInstruction && `Tool Guidance: ${toolInstruction}`,
      ].filter(Boolean).join('\n\n');
      
      processedTemplate = `${instructions}\n\nCreate ${tool.name} deliverable for ${stage.name} stage using ${framework.name} framework. Generate actionable outputs for immediate practitioner use.`;
      
      // Add knowledge context if provided
      if (knowledgeContext) {
        processedTemplate = `Project Knowledge Base:
${knowledgeContext}

${processedTemplate}`;
      }
    }

    // Create a new generated prompt
    const prompt: GeneratedPrompt = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId: 'current-workflow',
      projectId,
      content: processedTemplate,
      context: {
        framework,
        stage,
        tool,
        connectedNodes,
        nodeCustomizations,
        previousOutputs
      },
      variables: template?.variables.reduce((acc, variable) => {
        acc[variable] = '';
        return acc;
      }, {} as Record<string, string>) || {},
      timestamp: Date.now()
    };

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('prompts')
        .insert({
          project_id: projectId,
          user_id: user.id,
          framework_name: framework.name,
          stage_name: stage.name,
          tool_name: tool.name,
          prompt_content: processedTemplate,
          variables: prompt.variables
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving prompt to database:', error);
    }

    set(state => ({
      prompts: [...state.prompts, prompt],
      currentPrompt: prompt
    }));

    return processedTemplate;
  },

  generateEnhancedPrompt: async (templateId: string, variables: Record<string, any>, enhancedContext?: EnhancedPromptContext) => {
    set({ isGenerating: true });
    
    try {
      const template = getEnhancedTemplateById(templateId);
      if (!template) {
        throw new Error(`Enhanced template ${templateId} not found`);
      }

      // Validate variables - add safety checks
      const validation = validateTemplateVariables(templateId, variables || {});
      if (!validation || !validation.isValid) {
        const errors = validation?.errors || ['Unknown validation error'];
        throw new Error(`Variable validation failed: ${errors.join(', ')}`);
      }

      // Get industry-specific adaptations if applicable
      let finalTemplate = template.template || '';
      let instructions = [...(template.instructions || [])];
      
      if (enhancedContext?.industry) {
        const industryAdaptation = getIndustryAdaptation(templateId, enhancedContext.industry);
        if (industryAdaptation) {
          finalTemplate = industryAdaptation.template || finalTemplate;
          instructions = [...instructions, ...(industryAdaptation.instructions || [])];
        }
      }

      // Apply customizations
      if (enhancedContext?.customizations && template.customizationOptions) {
        template.customizationOptions.forEach(option => {
          const value = enhancedContext.customizations![option.id];
          if (value !== undefined) {
            // Apply customization to template
            finalTemplate = finalTemplate.replace(
              new RegExp(`{{${option.id}}}`, 'g'), 
              String(value)
            );
          }
        });
      }

      // Replace template variables
      let processedTemplate = finalTemplate;
      Object.entries(variables || {}).forEach(([key, value]) => {
        if (key && value !== undefined && value !== null) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          processedTemplate = processedTemplate.replace(regex, String(value));
        }
      });

      // Add enhanced instructions
      const enhancedInstructions = getEnhancedInstructions(templateId, enhancedContext?.industry) || [];
      const instructionText = [...instructions, ...enhancedInstructions].join('\n- ');
      
      const finalPromptContent = `# Enhanced UX Tool Guidance

## Instructions
- ${instructionText}

## Template Output

${processedTemplate}`;

      // Create enhanced prompt object
      const prompt: GeneratedPrompt = {
        id: `enhanced-prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: 'current-workflow',
        projectId: 'current-project', // This should come from context
        content: finalPromptContent,
        context: {
          framework: { id: 'enhanced', name: 'Enhanced Template' } as UXFramework,
          stage: { id: 'enhanced', name: 'Enhanced Stage' } as UXStage,
          tool: { id: templateId, name: template.name } as UXTool,
          enhancedContext
        },
        variables: variables as Record<string, string>,
        timestamp: Date.now(),
        templateVersion: '2.0',
        industry: enhancedContext?.industry
      };

      // Add to prompts list
      set(state => ({
        prompts: [...state.prompts, prompt],
        currentPrompt: prompt
      }));

      return finalPromptContent;
    } catch (error) {
      console.error('Error generating enhanced prompt:', error);
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  validatePromptQuality: async (promptId: string) => {
    set({ isValidating: true });
    
    try {
      const prompt = get().prompts.find(p => p.id === promptId);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const qualityResult = await promptQualityValidator.validatePrompt(
        prompt.content,
        prompt.context.tool.id,
        prompt.industry
      );

      // Update prompt with quality score
      set(state => ({
        prompts: state.prompts.map(p => 
          p.id === promptId 
            ? { ...p, qualityScore: qualityResult }
            : p
        ),
        currentPrompt: state.currentPrompt?.id === promptId
          ? { ...state.currentPrompt, qualityScore: qualityResult }
          : state.currentPrompt
      }));

      return qualityResult;
    } catch (error) {
      console.error('Error validating prompt quality:', error);
      throw error;
    } finally {
      set({ isValidating: false });
    }
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

      // Call the AI generation service through Supabase function
      console.log('🤖 Calling AI generation service for prompt:', promptId);
      
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('generate-ai-prompt', {
        body: {
          promptContent: processedContent,
          variables: prompt.variables,
          projectId: prompt.projectId,
          frameworkName: prompt.context.framework.name,
          stageName: prompt.context.stage.name,
          toolName: prompt.context.tool.name,
          knowledgeContext: null // Could be enhanced with project knowledge later
        }
      });

      if (aiError) {
        console.error('AI generation failed:', aiError);
        throw new Error(`AI generation failed: ${aiError.message}`);
      }

      if (!aiResult?.success) {
        throw new Error(`AI generation failed: ${aiResult?.error || 'Unknown error'}`);
      }

      const aiResponse = aiResult.aiResponse;
      console.log('✅ AI response generated successfully');
      
      // Update the prompt with the AI output and save to store
      set(state => ({
        prompts: state.prompts.map(p =>
          p.id === promptId ? { 
            ...p, 
            output: {
              type: 'generated',
              content: {
                items: [], // This will be populated by destination tailoring
                rawOutput: aiResponse,
                generatedAt: new Date().toISOString(),
                model: 'gpt-4o-mini', // Default model used by the function
                tokens: aiResponse.length // Rough estimate
              },
              summary: `Generated ${prompt.context.tool.name} output`,
              metadata: {
                framework: prompt.context.framework.name,
                stage: prompt.context.stage.name,
                tool: prompt.context.tool.name,
                generatedAt: new Date().toISOString()
              }
            },
            execution: {
              status: 'completed',
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              model: 'gpt-4o-mini',
              usage: {
                promptTokens: processedContent.length, // Rough estimate
                completionTokens: aiResponse.length, // Rough estimate
                totalTokens: processedContent.length + aiResponse.length
              }
            }
          } : p
        )
      }));
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

  updatePromptConversation: (promptId, messages) => {
    set(state => ({
      prompts: state.prompts.map(p =>
        p.id === promptId ? { ...p, conversation: messages } : p
      ),
      currentPrompt: state.currentPrompt?.id === promptId 
        ? { ...state.currentPrompt, conversation: messages }
        : state.currentPrompt
    }));
  },

  addConversationMessage: (promptId, message) => {
    set(state => ({
      prompts: state.prompts.map(p =>
        p.id === promptId 
          ? { ...p, conversation: [...(p.conversation || []), message] }
          : p
      ),
      currentPrompt: state.currentPrompt?.id === promptId 
        ? { ...state.currentPrompt, conversation: [...(state.currentPrompt.conversation || []), message] }
        : state.currentPrompt
    }));
  },

  clearProjectPrompts: () => {
    console.log('Clearing project prompts');
    set({ prompts: [], currentPrompt: null });
  },

  initializeTemplates: () => set({ templates: promptTemplates }),

  initializeEnhancedTemplates: () => set({ enhancedTemplates: getAllEnhancedTemplates() }),

  getEnhancedTemplate: (toolId: string) => {
    const templates = get().enhancedTemplates;
    return templates.find(template => template.id === toolId);
  },

  validateTemplateVariables: (templateId: string, variables: Record<string, any>) => {
    return validateTemplateVariables(templateId, variables);
  },

  // Enhanced context integration methods
  generateEnhancedContextPrompt: async (request: IntegratedContextRequest) => {
    set({ isGenerating: true });
    try {
      const response = await enhancedContextIntegrationService.processIntegratedContext(request);
      
      // Create a new GeneratedPrompt from the integrated response
      const generatedPrompt: GeneratedPrompt = {
        id: `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId: 'enhanced-context',
        projectId: request.projectId,
        content: response.synthesizedPrompt,
        context: {
          framework: request.framework,
          stage: request.stage,
          tool: request.tool,
          enhancedContext: {
            industry: request.userPreferences.industryFocus,
            qualityLevel: request.userPreferences.outputDetailLevel,
            customizations: {
              accessibilityLevel: request.userPreferences.accessibilityLevel,
              includeResearchBacking: request.userPreferences.includeResearchBacking,
              communicationStyle: request.userPreferences.communicationStyle
            }
          }
        },
        variables: request.userInputs,
        timestamp: Date.now(),
        qualityScore: {
          overallScore: Math.round(response.qualityMetrics.overallQuality * 100),
          category: response.qualityMetrics.overallQuality > 0.8 ? 'excellent' :
                   response.qualityMetrics.overallQuality > 0.6 ? 'good' :
                   response.qualityMetrics.overallQuality > 0.4 ? 'fair' : 'needs_improvement',
          summary: {
            strengths: [
              response.qualityMetrics.contextRichness > 0.7 ? 'Rich contextual information' : null,
              response.qualityMetrics.variableCompleteness > 0.8 ? 'Complete variable processing' : null,
              response.qualityMetrics.accessibilityCompliance > 0.7 ? 'Strong accessibility compliance' : null,
              response.qualityMetrics.workflowConsistency > 0.7 ? 'Good workflow consistency' : null
            ].filter(Boolean) as string[],
            recommendations: response.recommendations.slice(0, 3),
            issues: response.warnings
          }
        }
      };

      // Add to store
      set(state => ({
        prompts: [generatedPrompt, ...state.prompts],
        currentPrompt: generatedPrompt,
        isGenerating: false
      }));

      return response;
    } catch (error) {
      console.error('Enhanced context prompt generation failed:', error);
      set({ isGenerating: false });
      throw error;
    }
  },

  recordWorkflowOutput: async (projectId: string, output: GeneratedPrompt, decisions: any[] = [], nextStageId?: string) => {
    try {
      await enhancedContextIntegrationService.recordWorkflowOutput(projectId, output, decisions, nextStageId);
    } catch (error) {
      console.error('Error recording workflow output:', error);
    }
  },

  getWorkflowAnalytics: async (projectId: string) => {
    try {
      return await enhancedContextIntegrationService.getWorkflowAnalytics(projectId);
    } catch (error) {
      console.error('Error getting workflow analytics:', error);
      return null;
    }
  },

  // Destination-driven tailoring methods
  tailorPromptForDestination: async (promptId: string, destinationContext: DestinationContext) => {
    console.log('💾 Store: Starting tailoring for prompt:', promptId);
    console.log('💾 Store: Destination context:', destinationContext);
    
    set({ isTailoring: true });
    
    try {
      const prompt = get().prompts.find(p => p.id === promptId);
      if (!prompt) {
        console.error('💾 Store: Prompt not found:', promptId);
        throw new Error('Prompt not found');
      }
      
      console.log('💾 Store: Found prompt:', prompt.id, prompt.content.substring(0, 100));

      // Create full context if not provided
      const fullContext = {
        ...destinationContext,
        originalPrompt: prompt.content,
        variables: prompt.variables,
        metadata: {
          ...destinationContext.metadata,
          framework: prompt.context.framework.name,
          stage: prompt.context.stage.name,
          tool: prompt.context.tool.name,
          industry: prompt.industry,
          teamSize: prompt.context.enhancedContext?.teamSize,
          timeConstraints: prompt.context.enhancedContext?.timeConstraints,
          experience: prompt.context.enhancedContext?.experience
        }
      };

      // Tailor the prompt
      console.log('💾 Store: Calling destination tailoring service with context:', fullContext);
      const tailoringResponse = await destinationTailoringService.tailorPromptForDestination({
        context: fullContext,
        enforceValidation: true,
        maxRetries: 3
      });
      console.log('💾 Store: Tailoring response:', tailoringResponse);

      if (tailoringResponse.success) {
        // Route the output to get display content and integration payload
        console.log('💾 Store: Routing output for:', tailoringResponse.expectedOutput);
        const routedOutput = destinationTailoringService.routeOutput(tailoringResponse.expectedOutput);
        console.log('💾 Store: Routed output:', routedOutput);
        
        // Update the prompt with destination information
        console.log('💾 Store: Updating prompt with destination info');
        
        const destinationInfo = {
          type: fullContext.destination,
          aiProvider: fullContext.aiProvider,
          userIntent: fullContext.userIntent,
          tailoredPrompt: tailoringResponse.tailoredPrompt,
          tailoredOutput: tailoringResponse.expectedOutput,
          displayContent: routedOutput.displayContent,
          integrationPayload: routedOutput.integrationPayload
        };
        
        console.log('💾 Store: Destination info to set:', destinationInfo);
        
        set(state => {
          const updatedPrompts = state.prompts.map(p => 
            p.id === promptId 
              ? {
                  ...p,
                  destination: destinationInfo
                }
              : p
          );
          
          const updatedPrompt = updatedPrompts.find(p => p.id === promptId);
          console.log('💾 Store: Updated prompt after setting destination:', updatedPrompt?.destination);
          
          return {
            prompts: updatedPrompts,
            currentPrompt: state.currentPrompt?.id === promptId 
              ? {
                  ...state.currentPrompt,
                  destination: destinationInfo
                }
              : state.currentPrompt
          };
        });

        return {
          success: true,
          errors: tailoringResponse.validationErrors,
          clarifyingQuestions: tailoringResponse.clarifyingQuestions
        };
      } else {
        return {
          success: false,
          errors: ['Tailoring failed'],
          clarifyingQuestions: tailoringResponse.clarifyingQuestions
        };
      }
    } catch (error) {
      console.error('Error tailoring prompt for destination:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    } finally {
      set({ isTailoring: false });
    }
  },

  getSupportedDestinations: () => {
    return destinationTailoringService.getSupportedDestinations();
  },

  getSupportedAIProviders: () => {
    return destinationTailoringService.getSupportedAIProviders();
  },

  clearDestination: (promptId: string) => {
    set(state => ({
      prompts: state.prompts.map(p => 
        p.id === promptId 
          ? { ...p, destination: undefined }
          : p
      ),
      currentPrompt: state.currentPrompt?.id === promptId 
        ? { ...state.currentPrompt, destination: undefined }
        : state.currentPrompt
    }));
  }
}));