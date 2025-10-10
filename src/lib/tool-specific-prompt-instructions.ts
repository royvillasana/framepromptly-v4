/**
 * @fileoverview Tool-Specific AI Prompt Instructions System
 * Each tool has unique, contextual AI prompt instructions based on framework, stage, and tool purpose
 * Enhanced with platform-specific optimizations for Miro AI, FigJam AI, and Figma AI
 * This addresses the issue where all tools were using generic prompt text
 */

import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';
import { 
  getPlatformRecommendation, 
  getOptimizedPrompt, 
  PlatformType 
} from '@/lib/ux-tool-platform-optimizer';

export interface ToolPromptContext {
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  projectContext?: string; // From knowledge base
  preferredPlatform?: PlatformType; // Platform preference for optimizations
}

export interface SpecificToolInstructions {
  promptTemplate: string;
  contextualGuidance: string[];
  frameworkSpecificNotes: string[];
  stageSpecificFocus: string[];
  knowledgeIntegrationInstructions: string[];
  qualityChecks: string[];
  expectedOutputFormat: string;
  // Platform optimization enhancements
  platformRecommendation?: {
    recommendedPlatform: PlatformType;
    confidence: number;
    reasoning: string;
    alternativePlatforms?: { platform: PlatformType; useCase: string }[];
  };
  platformOptimizedPrompt?: string;
  platformSpecifics?: {
    platform: PlatformType;
    instructions: string[];
    specifications: string[];
    bestPractices: string[];
  };
}

/**
 * Generate specific AI prompt instructions for each tool based on context
 */
export function generateToolSpecificInstructions(context: ToolPromptContext): SpecificToolInstructions {
  const { framework, stage, tool, preferredPlatform } = context;
  
  // Get base template for this tool type
  const baseInstructions = getBaseToolInstructions(tool.id);
  
  // Customize based on framework context
  const frameworkCustomizations = getFrameworkSpecificCustomizations(tool.id, framework.id);
  
  // Customize based on stage context
  const stageCustomizations = getStageSpecificCustomizations(tool.id, stage.id, framework.id);
  
  // Get platform optimization (if supported)
  const platformRecommendation = getPlatformRecommendation(tool.id);
  const selectedPlatform = preferredPlatform || platformRecommendation?.platform;
  
  // Generate platform-optimized prompt
  let platformOptimization = null;
  if (selectedPlatform && platformRecommendation) {
    const basePrompt = `# AI Prompt Instructions for ${tool.name}
## Framework Context: ${framework.name} - ${stage.name} Stage

${baseInstructions.core}

### Framework-Specific Application in ${framework.name}:
${frameworkCustomizations.join('\n')}

### Stage-Specific Focus in ${stage.name}:
${stageCustomizations.join('\n')}

### Integration with Project Knowledge:
${baseInstructions.knowledgeIntegration.join('\n')}`;

    platformOptimization = getOptimizedPrompt(tool.id, basePrompt, selectedPlatform);
  }
  
  return {
    promptTemplate: platformOptimization?.optimizedPrompt || `# AI Prompt Instructions for ${tool.name}
## Framework Context: ${framework.name} - ${stage.name} Stage

${baseInstructions.core}

### Framework-Specific Application in ${framework.name}:
${frameworkCustomizations.join('\n')}

### Stage-Specific Focus in ${stage.name}:
${stageCustomizations.join('\n')}

### Integration with Project Knowledge:
${baseInstructions.knowledgeIntegration.join('\n')}`,
    
    contextualGuidance: baseInstructions.guidance,
    frameworkSpecificNotes: frameworkCustomizations,
    stageSpecificFocus: stageCustomizations,
    knowledgeIntegrationInstructions: baseInstructions.knowledgeIntegration,
    qualityChecks: baseInstructions.qualityChecks,
    expectedOutputFormat: baseInstructions.outputFormat,
    
    // Platform optimization enhancements
    platformRecommendation: platformRecommendation ? {
      recommendedPlatform: platformRecommendation.platform,
      confidence: platformRecommendation.confidence,
      reasoning: platformRecommendation.reasoning,
      alternativePlatforms: platformRecommendation.alternativePlatforms
    } : undefined,
    platformOptimizedPrompt: platformOptimization?.optimizedPrompt,
    platformSpecifics: platformOptimization?.platformSpecifics
  };
}

/**
 * Base instructions for each specific tool
 */
function getBaseToolInstructions(toolId: string): any {
  const instructions: Record<string, any> = {
    
    // RESEARCH TOOLS
    'user-interviews': {
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for user interview guide development. Generate a complete AI prompt that users can copy and paste into their AI assistant to create professional-quality user interview guides.

The generated prompt must:
1. Include instructions for AI to act as a senior UX researcher with interview expertise
2. Incorporate ALL project knowledge base content for contextual relevance
3. Provide structured methodology using funnel technique and 5 Whys approach
4. Include specific question types and interview flow requirements
5. Request validation methods and quality checks
6. Be comprehensive enough to generate complete interview guides without additional input

Template Structure for Generated Prompt:
---
# AI User Interview Expert

You are a senior UX researcher and user interview specialist with 15+ years of experience conducting insightful user research. You excel at designing interview guides that reveal deep user motivations, mental models, and behavioral patterns using advanced interviewing techniques.

## Project Context
[Insert all relevant project knowledge base content here - business goals, user segments, existing research, industry constraints, product context, etc.]

## Your Task
Create a comprehensive user interview guide for this project using the following research methodology:

### Interview Methodology
- Use the funnel technique: start broad, progressively narrow to specific details
- Apply the "5 Whys" technique to uncover root motivations beyond surface responses
- Include emotional archaeology questions exploring feelings and satisfaction moments
- Design task-based scenarios that prompt behavioral demonstrations
- Build in validation through prioritization and choice exercises

### Required Interview Structure
Create a complete interview guide with:

1. **Opening (5-7 minutes)**
   - Warm-up questions to build rapport
   - Context-setting questions about participant background
   - Permission and recording consent
   - Expectation setting for the session

2. **Background & Context (10-15 minutes)**
   - Current situation and environment
   - Relevant tools, processes, and workflows they use
   - Role and responsibilities in their context
   - Decision-making authority and influences

3. **Core Topic Exploration (20-30 minutes)**
   - Open-ended questions revealing mental models
   - Scenario-based questions prompting specific examples
   - Critical incident questions about memorable experiences
   - "Day in the life" walkthrough questions
   - Emotional response exploration (frustrations, satisfying moments)

4. **Task Demonstration (if applicable, 10-15 minutes)**
   - Think-aloud protocol for relevant tasks
   - Current tool/process walkthrough
   - Problem-solving behavior observation
   - Workaround identification

5. **Forward-Looking (5-10 minutes)**
   - Ideal scenario descriptions
   - Aspiration and goal exploration
   - Hypothetical solution reactions
   - Change readiness and barrier identification

6. **Validation & Wrap-up (5-10 minutes)**
   - Prioritization exercises
   - Key point confirmation
   - Additional thoughts invitation
   - Next steps and follow-up permission

### Question Quality Requirements
For each question, ensure it:
- Uses open-ended phrasing that encourages storytelling
- Avoids leading or biased language
- Includes follow-up probes for deeper exploration
- Connects to project objectives and research questions
- Reveals both functional and emotional aspects

### Interview Logistics
Include guidance for:
- Participant recruitment criteria
- Session duration and scheduling
- Recording and note-taking setup
- Moderator preparation checklist
- Post-interview synthesis approach

### Validation Framework
Provide methods to:
- Test interview guide effectiveness through pilot sessions
- Validate question comprehension and relevance
- Cross-check responses for consistency
- Identify data saturation points
- Plan follow-up validation with participants

### Output Requirements
Deliver a complete interview guide that includes:
- All questions with suggested probes
- Timing estimates for each section
- Moderator tips for difficult moments
- Note-taking templates
- Analysis framework for captured data
---`,
      guidance: [
        'Generate prompts that instruct AI to use funnel technique: broad to specific questioning progression',
        'Include instructions for AI to apply 5 Whys methodology for uncovering root motivations',
        'Ensure prompts direct AI to include emotional archaeology questions exploring feelings and satisfaction moments',
        'Generate prompts instructing AI to design task-based scenarios that reveal behavioral demonstrations',
        'Include instructions for AI to build in validation opportunities through prioritization and choice exercises',
        'Ensure prompts direct AI to create questions that reveal mental models and decision-making processes',
        'Generate prompts that instruct AI to include strategic silence and active listening guidance'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user segments, business context, existing research, and domain expertise',
        'Insert specific user pain points, behavioral patterns, and research findings from knowledge base into the project context section',
        'Include industry-specific terminology, processes, and constraints from knowledge base in the interview requirements',
        'Reference business goals, success metrics, and strategic objectives from knowledge base to align interview objectives',
        'Incorporate existing user insights and research gaps from knowledge base to focus interview areas',
        'Use organizational context, team structure, and project constraints from knowledge base to optimize interview approach',
        'Include target audience characteristics, user roles, and contextual factors from knowledge base in participant criteria'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context from knowledge base',
        'Ensure the prompt provides detailed interview methodology and question design guidance',
        'Confirm the prompt specifies complete interview structure with timing and flow requirements',
        'Validate that the prompt includes specific validation methods and quality assurance approaches',
        'Check that the prompt generates complete interview guides without requiring additional input',
        'Ensure the prompt instructs AI to provide moderator guidance and logistical considerations'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates professional user interview guides with methodology, questions, probes, timing, and validation framework'
    },

    'stakeholder-interviews': {
      core: `You are generating AI prompts for conducting stakeholder interviews in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts focused on understanding business context, constraints, and organizational dynamics.`,
      guidance: [
        'Focus on understanding business objectives, success metrics, and constraints',
        'Explore organizational dynamics and decision-making processes',
        'Uncover hidden assumptions and unstated requirements',
        'Identify potential risks, challenges, and resource limitations'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to understand the organizational hierarchy and stakeholder relationships',
        'Reference business goals and strategic objectives from the knowledge base',
        'Incorporate known constraints and requirements from previous stakeholder interactions',
        'Align interview questions with the specific business domain and industry context'
      ],
      qualityChecks: [
        'Ensure questions address both explicit and implicit stakeholder concerns',
        'Include questions about success criteria and measurement methods',
        'Plan for understanding competing priorities and trade-offs'
      ],
      outputFormat: 'Business-focused interview guide with strategic questions, constraint exploration, and success criteria discussion'
    },

    'observations': {
      core: `You are generating AI prompts for conducting user observations in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide systematic observation of user behavior in natural contexts.`,
      guidance: [
        'Focus on observing actual behaviors rather than stated intentions',
        'Design observation frameworks that capture context, environment, and constraints',
        'Include methods for documenting non-verbal cues and emotional responses',
        'Create structured approaches for identifying patterns and anomalies'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify optimal observation contexts and environments',
        'Reference known user workflows and touchpoints from the knowledge base',
        'Incorporate understanding of user roles and responsibilities from project documentation',
        'Align observation focus areas with business objectives and user goals from the knowledge base'
      ],
      qualityChecks: [
        'Ensure observation methods minimize disruption to natural behaviors',
        'Include multiple observation sessions to capture behavioral variations',
        'Plan for triangulating observations with other data sources'
      ],
      outputFormat: 'Structured observation protocol with context documentation, behavior tracking, and insight synthesis methods'
    },

    'surveys': {
      core: `You are generating AI prompts for creating surveys in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that design statistically sound surveys for quantitative insights.`,
      guidance: [
        'Design questions that can be statistically analyzed for patterns',
        'Use validated scales and measurement instruments where possible',
        'Balance closed-ended questions with strategic open-ended items',
        'Structure surveys for optimal completion rates and data quality'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify the right target audience and sampling approach',
        'Reference known user segments and demographics from the knowledge base',
        'Incorporate validated hypotheses and research questions from previous project work',
        'Align survey objectives with business metrics and success criteria from the knowledge base'
      ],
      qualityChecks: [
        'Ensure questions are unbiased and avoid leading responses',
        'Include validation questions and attention checks',
        'Test survey length and completion time for optimal response rates'
      ],
      outputFormat: 'Complete survey instrument with question logic, response validation, and analysis plan'
    },

    // ANALYSIS TOOLS
    'affinity-mapping': {
      core: `You are a UX researcher creating an affinity map from research data.

## Project Context
[Insert ALL knowledge base content - research data, interview findings, observations, user feedback, business objectives]

## Create Affinity Map

Organize the research data into themes and sub-themes.

### Level 1: Initial Clusters (Detailed Groupings)

**Cluster 1: [Name]**
- [Data point 1]
- [Data point 2]
- [Data point 3]

**Cluster 2: [Name]**
- [Data point 1]
- [Data point 2]
- [Data point 3]

**Cluster 3: [Name]**
- [Data point 1]
- [Data point 2]
- [Data point 3]

[Continue with additional clusters]

### Level 2: Themes (Higher-Level Patterns)

**Theme 1: [Name]**
- Combines clusters: [Which clusters]
- Key insight: [What this reveals]
- Evidence: [Supporting data]

**Theme 2: [Name]**
- Combines clusters: [Which clusters]
- Key insight: [What this reveals]
- Evidence: [Supporting data]

**Theme 3: [Name]**
- Combines clusters: [Which clusters]
- Key insight: [What this reveals]
- Evidence: [Supporting data]

### Level 3: Meta-Themes (Strategic Insights)

**Meta-Theme 1: [Name]**
- Overarching pattern: [Description]
- Business impact: [Implications]
- Recommendation: [What to do]

**Meta-Theme 2: [Name]**
- Overarching pattern: [Description]
- Business impact: [Implications]
- Recommendation: [What to do]

### Key Insights
1. [Insight 1]
2. [Insight 2]
3. [Insight 3]`,

      guidance: ['Multi-level clustering', 'Pattern identification', 'Evidence-based insights', 'Strategic recommendations'],
      knowledgeIntegration: ['Insert ALL research data from knowledge base', 'Include business objectives', 'Reference user segments'],
      qualityChecks: ['Hierarchical themes', 'Evidence for each theme', 'Contradictions addressed', 'Actionable insights'],
      outputFormat: 'Complete affinity map with themes, sub-themes, and strategic insights'
    },

    'personas': {
      core: `You are a senior UX researcher creating user personas.

## Project Context
[Insert ALL knowledge base content - user research, business context, target audience, pain points, behaviors, goals]

## Create 2-4 User Personas

For each persona, include:

**Name:** [Full name]
**Age:** [Age]
**Occupation:** [Job title]
**Location:** [City, State/Country]
**Quote:** "[One sentence capturing their essence]"

**Goals:**
- [Primary goal 1]
- [Primary goal 2]
- [Primary goal 3]

**Pain Points:**
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

**Behaviors:**
- [Key behavior 1]
- [Key behavior 2]
- [Key behavior 3]

**Motivations:**
- [What drives them]
- [What they value]
- [What success looks like to them]

**Tech Comfort:** [Low/Medium/High]

**Background:** [2-3 sentences about their life context, work environment, and relevant circumstances]`,

      guidance: ['Triangulation method', 'Jobs-to-be-Done framework', 'Research evidence backing', 'Validation hypotheses'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include business context and goals', 'Reference existing user segments'],
      qualityChecks: ['Evidence-based profiles', 'Testable hypotheses included', 'Comprehensive and actionable'],
      outputFormat: '2-4 complete user personas with research backing and validation criteria'
    },

    'empathy-maps': {
      core: `You are a UX researcher creating an empathy map.

## Project Context
[Insert ALL knowledge base content - user research, interviews, observations, behaviors, pain points]

## Create Empathy Map for [Persona Name]

**THINKS:**
- [Thought 1]
- [Thought 2]
- [Thought 3]

**FEELS:**
- [Emotion/feeling 1]
- [Emotion/feeling 2]
- [Emotion/feeling 3]

**SAYS:**
- "[Quote 1]"
- "[Quote 2]"
- "[Quote 3]"

**DOES:**
- [Action/behavior 1]
- [Action/behavior 2]
- [Action/behavior 3]

**SEES:**
- [What they encounter 1]
- [What they encounter 2]
- [What they encounter 3]

**HEARS:**
- [What they hear 1]
- [What they hear 2]
- [What they hear 3]

**PAINS:**
- [Pain 1]
- [Pain 2]
- [Pain 3]

**GAINS:**
- [Desired outcome 1]
- [Desired outcome 2]
- [Desired outcome 3]`,

      guidance: ['6-quadrant structure', 'Evidence-based', 'Specific scenarios', 'Research quotes'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include behavioral data and quotes'],
      qualityChecks: ['All 6 quadrants filled', 'Research-backed', 'Specific examples', 'Pains/gains identified'],
      outputFormat: 'Complete empathy map with all quadrants populated from research'
    },

    // IDEATION TOOLS
    'brainstorming': {
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for ideation and brainstorming facilitation. Generate a complete AI prompt that users can copy and paste into their AI assistant to design effective brainstorming sessions.

The generated prompt must:
1. Include instructions for AI to act as an innovation facilitation expert
2. Incorporate ALL project knowledge base content to focus ideation effectively
3. Provide structured methodology for divergent and convergent thinking
4. Include specific warm-up exercises and creative techniques
5. Request evaluation criteria and idea prioritization methods
6. Be comprehensive enough to generate complete brainstorming guides without additional input

Template Structure for Generated Prompt:
---
# AI Brainstorming Facilitation Expert

You are a senior innovation facilitator and creative thinking expert with 15+ years of experience leading productive ideation sessions. You specialize in structured brainstorming methodologies that generate high-quality, implementable ideas.

## Project Context
[Insert all relevant project knowledge base content here - user problems, business constraints, target outcomes, team dynamics, etc.]

## Your Task
Design a comprehensive brainstorming session for this project using proven facilitation methods that maximize creative output and team engagement.

### Brainstorming Methodology
- Apply divergent thinking techniques to generate maximum idea quantity
- Use convergent thinking approaches to identify most promising concepts
- Include structured warm-up exercises to prime creative thinking
- Design activities that build on and combine ideas effectively
- Create evaluation frameworks that balance creativity with feasibility

### Required Session Structure
Create a complete brainstorming guide with:

1. **Pre-Session Setup (15 minutes)**
   - Environment preparation and materials needed
   - Participant briefing and expectation setting
   - Ground rules and psychological safety guidelines
   - Technology setup for idea capture

2. **Creative Warm-Up (10-15 minutes)**
   - Ice breaker exercises to build comfort
   - Creative thinking activation activities
   - Perspective shifting exercises
   - Energy building and team alignment

3. **Problem Framing (10-15 minutes)**
   - Clear problem statement presentation
   - Context sharing from project knowledge
   - Success criteria and constraint clarification
   - "How Might We" question generation

4. **Divergent Ideation (30-45 minutes)**
   - **Individual Brainstorming (10 minutes)**
     - Silent idea generation to avoid groupthink
     - Specific prompts based on project context
     - Quantity-focused individual contribution
   
   - **Group Building (15-20 minutes)**
     - Idea sharing without judgment
     - Building on others' concepts
     - Cross-pollination between ideas
     - Wild idea encouragement
   
   - **Creative Techniques (10-15 minutes)**
     - SCAMPER method application
     - Reverse brainstorming exercises
     - Role-playing from different perspectives
     - Analogical thinking exercises

5. **Idea Organization (15-20 minutes)**
   - Idea clustering by themes or approaches
   - Similar concept grouping
   - Gap identification for additional ideation
   - Initial feasibility assessment

6. **Convergent Evaluation (20-30 minutes)**
   - Evaluation criteria establishment
   - Multi-criteria assessment approach
   - Dot voting or ranking exercises
   - Top idea selection and rationale

7. **Next Steps Planning (10 minutes)**
   - Selected idea documentation
   - Development and testing roadmap
   - Responsibility assignment
   - Follow-up session scheduling

### Facilitation Techniques
Include specific guidance for:
- Managing dominant personalities and encouraging quiet participants
- Handling idea criticism and maintaining creative flow
- Using visual tools and spatial arrangement effectively
- Capturing ideas accurately without losing momentum
- Managing time and energy throughout the session

### Idea Quality Enhancement
Provide methods to:
- Encourage wild ideas alongside practical solutions
- Build on and combine concepts for hybrid solutions
- Apply constraints creatively to spark innovation
- Connect ideas to user needs and business objectives
- Generate implementation approaches for top concepts

### Evaluation Framework
Create criteria for assessing ideas based on:
- User value and problem-solving effectiveness
- Technical feasibility and implementation complexity
- Business alignment and strategic fit
- Resource requirements and timeline implications
- Innovation potential and competitive advantage

### Output Requirements
Deliver a facilitation guide that includes:
- Complete session agenda with timing
- Specific exercises and prompts for each phase
- Materials and setup requirements
- Idea capture and documentation methods
- Follow-up activities and implementation planning
---`,
      guidance: [
        'Generate prompts that instruct AI to structure sessions with divergent thinking followed by convergent evaluation',
        'Include instructions for AI to design creative warm-up exercises that prime innovative thinking',
        'Ensure prompts direct AI to encourage building on and combining ideas for hybrid solutions',
        'Generate prompts instructing AI to provide specific facilitation techniques for managing group dynamics',
        'Include instructions for AI to create evaluation criteria that balance creativity with feasibility',
        'Ensure prompts direct AI to focus ideation on project-relevant problem areas and opportunities',
        'Generate prompts that instruct AI to provide complete session timing and materials requirements'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user problems, business constraints, and strategic objectives',
        'Insert specific user pain points, unmet needs, and opportunity areas from knowledge base into ideation focus',
        'Include business goals, resource constraints, and strategic priorities from knowledge base in evaluation criteria',
        'Reference team composition, organizational culture, and collaboration preferences from knowledge base in facilitation approach',
        'Incorporate competitive landscape, market opportunities, and innovation requirements from knowledge base in creative prompts',
        'Use project timeline, budget constraints, and implementation capabilities from knowledge base to guide idea feasibility assessment',
        'Include domain expertise, technical constraints, and regulatory requirements from knowledge base in brainstorming parameters'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context for focused ideation',
        'Ensure the prompt provides detailed facilitation methodology with specific techniques',
        'Confirm the prompt specifies complete session structure with timing and activities',
        'Validate that the prompt includes evaluation criteria and idea prioritization methods',
        'Check that the prompt generates facilitation guides ready for immediate implementation',
        'Ensure the prompt instructs AI to provide follow-up planning and implementation approaches'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates structured brainstorming facilitation guides with exercises, timing, evaluation criteria, and implementation planning'
    },

    'how-might-we': {
      core: `You are generating AI prompts for How Might We questions in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that reframe problems as opportunities for innovation.`,
      guidance: [
        'Frame problems as opportunities starting with "How might we..."',
        'Create questions that are broad enough to allow creativity but specific enough to be actionable',
        'Include multiple HMW questions to explore different angles of the same problem',
        'Design questions that inspire rather than constrain solution thinking'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify the most important problems to address',
        'Reference user pain points and unmet needs from the knowledge base',
        'Incorporate business objectives and constraints to frame realistic opportunities',
        'Align HMW questions with strategic priorities and success metrics from project documentation'
      ],
      qualityChecks: [
        'Ensure HMW questions are properly scoped - not too broad or too narrow',
        'Include multiple perspectives and stakeholder viewpoints',
        'Plan for generating multiple solution concepts from each HMW question'
      ],
      outputFormat: 'Set of well-crafted How Might We questions with explanation of problem framing and opportunity areas'
    },

    // PROTOTYPING TOOLS
    'wireframes': {
      core: `You are a UX architect creating wireframes.

## Project Context
[Insert ALL knowledge base content - user workflows, business requirements, content needs, features, technical constraints]

## Create Wireframes for Key Screens

For each screen, include:

**Screen Name:** [Name]

**Layout:**
[Text description of layout structure - e.g., "Header with logo and navigation at top, main content area in center with sidebar, footer at bottom"]

**Elements:**
- [Element 1: Description, function]
- [Element 2: Description, function]
- [Element 3: Description, function]

**User Flow:**
- [How user arrives at this screen]
- [Primary action/goal on this screen]
- [Next screen/exit]

**Annotations:**
- [Design rationale 1]
- [Design rationale 2]

[Repeat for each key screen]`,

      guidance: ['Information architecture focus', 'User task flows', 'Responsive design', 'Detailed annotations'],
      knowledgeIntegration: ['Insert ALL workflows from knowledge base', 'Include business requirements', 'Reference technical constraints'],
      qualityChecks: ['Complete screen coverage', 'Annotated decisions', 'User flows documented', 'Research-backed'],
      outputFormat: 'Wireframe specifications for key screens with annotations and user flows'
    },

    'paper-prototypes': {
      core: `You are generating AI prompts for paper prototyping in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide rapid, testable prototype creation.`,
      guidance: [
        'Focus on core interactions and user flows rather than visual polish',
        'Create prototypes that can be easily modified based on test feedback',
        'Include multiple interaction states and error conditions',
        'Design prototypes that facilitate user testing and stakeholder review'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to prioritize which features and flows to prototype',
        'Reference user scenarios and tasks from the knowledge base',
        'Incorporate business constraints and technical limitations into prototype scope',
        'Align prototype functionality with user goals and business objectives from project documentation'
      ],
      qualityChecks: [
        'Ensure prototypes are testable and interactive enough for meaningful feedback',
        'Include consideration of edge cases and error states',
        'Plan for rapid iteration based on user testing results'
      ],
      outputFormat: 'Paper prototype specifications with interaction design, testing plan, and iteration approach'
    },

    // TESTING TOOLS
    'usability-tests': {
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for usability testing design and execution. Generate a complete AI prompt that users can copy and paste into their AI assistant to create rigorous, insightful usability testing protocols.

The generated prompt must:
1. Include instructions for AI to act as a usability testing expert with statistical rigor
2. Incorporate ALL project knowledge base content for realistic testing scenarios
3. Provide structured methodology for both quantitative and qualitative measurement
4. Include specific requirements for test design, execution, and analysis
5. Request validation methods and statistical significance approaches
6. Be comprehensive enough to generate complete testing protocols without additional input

Template Structure for Generated Prompt:
---
# AI Usability Testing Expert

You are a senior UX researcher and usability testing specialist with 15+ years of experience designing and conducting rigorous user testing. You excel at creating testing protocols that reveal actionable insights about user behavior and interface effectiveness.

## Project Context
[Insert all relevant project knowledge base content here - user goals, workflows, business metrics, interface requirements, etc.]

## Your Task
Design a comprehensive usability testing protocol for this project using evidence-based methodology that captures both quantitative performance and qualitative user experience insights.

### Usability Testing Methodology
- Design tests that observe actual behavior rather than collect opinions
- Create realistic task scenarios based on authentic user workflows
- Apply statistical rigor for quantitative measurements
- Include systematic qualitative observation and analysis
- Plan for actionable findings that drive design improvements

### Required Testing Protocol
Create a complete testing plan including:

1. **Testing Strategy & Objectives**
   - Primary research questions and hypotheses
   - Success criteria and key performance indicators
   - Testing method selection (moderated, unmoderated, hybrid)
   - Timeline and resource requirements

2. **Participant Strategy**
   - **Recruitment Criteria**
     - Target user segment definitions
     - Screening questionnaire and selection criteria
     - Sample size calculation with statistical justification
     - Diversity and inclusion requirements
   
   - **Participant Management**
     - Recruitment process and timeline
     - Consent and privacy protocols
     - Compensation and logistics
     - Accessibility accommodations needed

3. **Task Design & Scenarios**
   - **Realistic Task Scenarios**
     - Context-rich scenarios based on actual user workflows
     - Primary tasks covering core functionality
     - Secondary tasks for comprehensive coverage
     - Edge cases and error recovery scenarios
   
   - **Task Success Metrics**
     - Completion rate definitions and measurement
     - Time-on-task benchmarks and targets
     - Error identification and categorization
     - Efficiency and effectiveness calculations

4. **Testing Environment & Setup**
   - **Physical/Digital Environment**
     - Testing location and equipment requirements
     - Screen recording and observation setup
     - Technology configuration and backup plans
     - Environmental factors and controls
   
   - **Moderator Protocol**
     - Pre-test setup and participant briefing
     - Think-aloud protocol guidance
     - Intervention and assistance guidelines
     - Post-test interview questions

5. **Data Collection Framework**
   - **Quantitative Measures**
     - Task completion rates and success criteria
     - Time measurements and efficiency metrics
     - Error counts and severity classifications
     - Navigation patterns and interaction analytics
   
   - **Qualitative Measures**
     - Satisfaction ratings and preference assessments
     - Mental model understanding and expectations
     - Emotional responses and frustration indicators
     - Verbalized thoughts and decision-making processes

6. **Analysis & Reporting Plan**
   - **Statistical Analysis**
     - Significance testing approaches
     - Confidence intervals and effect sizes
     - Comparative analysis methods
     - Sample size adequacy assessment
   
   - **Qualitative Analysis**
     - Thematic analysis of user feedback
     - Issue identification and severity rating
     - Pattern recognition across participants
     - Quote selection and insight synthesis

### Quality Assurance Framework
Include methods for:
- Pilot testing to validate protocol effectiveness
- Inter-rater reliability for qualitative observations
- Bias mitigation in test design and execution
- Data quality checks and validation procedures
- Reproducibility and methodology transparency

### Actionable Insights Generation
Provide frameworks for:
- Translating findings into specific design recommendations
- Prioritizing issues by severity and business impact
- Creating improvement roadmaps with implementation guidance
- Communicating results to stakeholders effectively
- Planning follow-up testing and validation studies

### Success Criteria & Validation
Define criteria for:
- Test protocol effectiveness and data quality
- Statistical significance and practical significance
- Insight actionability and implementation feasibility
- Stakeholder satisfaction with findings and recommendations
- Long-term impact measurement and tracking

### Output Requirements
Deliver a testing protocol that includes:
- Complete test plan with methodology and procedures
- Participant recruitment and management protocols
- Task scenarios with success criteria and measurements
- Data collection instruments and analysis frameworks
- Reporting templates and insight presentation formats
---`,
      guidance: [
        'Generate prompts that instruct AI to design tests revealing actual user behavior rather than stated preferences',
        'Include instructions for AI to create realistic task scenarios based on authentic user workflows',
        'Ensure prompts direct AI to apply statistical rigor for quantitative measurements and significance testing',
        'Generate prompts instructing AI to include systematic qualitative observation and thematic analysis',
        'Include instructions for AI to plan for actionable findings that drive specific design improvements',
        'Ensure prompts direct AI to consider accessibility requirements and diverse participant inclusion',
        'Generate prompts that instruct AI to provide complete testing protocols ready for immediate execution'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user workflows, business metrics, and interface requirements',
        'Insert specific user goals, task patterns, and workflow requirements from knowledge base into task scenario development',
        'Include business success criteria, performance benchmarks, and strategic objectives from knowledge base in testing goals',
        'Reference user segment characteristics, behavioral patterns, and contextual factors from knowledge base in participant strategy',
        'Incorporate technical constraints, platform requirements, and usability standards from knowledge base in testing approach',
        'Use existing performance data, user feedback, and known issues from knowledge base to inform hypothesis development',
        'Include organizational constraints, timeline requirements, and resource availability from knowledge base in protocol planning'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context for realistic testing scenarios',
        'Ensure the prompt provides rigorous methodology with statistical and qualitative analysis frameworks',
        'Confirm the prompt specifies complete protocol including participant management and data collection',
        'Validate that the prompt includes actionable insight generation and reporting approaches',
        'Check that the prompt generates testing protocols ready for immediate implementation',
        'Ensure the prompt instructs AI to provide statistical justification and quality assurance measures'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates rigorous usability testing protocols with statistical methodology, realistic scenarios, and actionable insight frameworks'
    },

    'a-b-testing': {
      core: `You are generating AI prompts for A/B testing in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that design statistically valid comparative tests.`,
      guidance: [
        'Design tests that isolate specific variables for clear causal inference',
        'Include proper statistical planning for sample sizes and significance testing',
        'Create testing frameworks that measure both behavioral and attitudinal outcomes',
        'Plan for long-term impact assessment beyond immediate test metrics'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify the most important metrics and hypotheses to test',
        'Reference user behavior patterns and business objectives from the knowledge base',
        'Incorporate existing performance baselines and success criteria from project documentation',
        'Align testing hypotheses with strategic goals and user needs from the knowledge base'
      ],
      qualityChecks: [
        'Ensure tests have sufficient statistical power to detect meaningful differences',
        'Include plans for avoiding testing biases and external confounds',
        'Plan for proper interpretation and action based on test results'
      ],
      outputFormat: 'A/B testing design with hypothesis, methodology, success metrics, and analysis plan'
    },

    // SYNTHESIS & ANALYSIS TOOLS
    'synthesis-workshops': {
      core: `You are generating AI prompts for synthesis workshops in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide collaborative analysis and insight generation from research data.`,
      guidance: [
        'Structure workshops for collaborative insight generation and pattern identification',
        'Include activities that engage multiple perspectives and expertise',
        'Design exercises that move from data to insights to actionable recommendations',
        'Create frameworks for building consensus around key findings and priorities'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to provide context for interpreting research findings',
        'Reference business objectives and constraints from the knowledge base',
        'Incorporate existing user insights and data from previous project work',
        'Align synthesis activities with strategic goals and decision-making needs'
      ],
      qualityChecks: [
        'Ensure workshops produce actionable insights rather than just data summary',
        'Include validation methods for testing insight accuracy and relevance',
        'Plan for translating insights into concrete next steps and recommendations'
      ],
      outputFormat: 'Workshop facilitation guide with structured activities, insight capture methods, and output templates'
    },

    'contextual-inquiry': {
      core: `You are generating AI prompts for contextual inquiry in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide in-context user research and environmental observation.`,
      guidance: [
        'Focus on understanding users in their natural work or life environments',
        'Include methods for capturing environmental factors that influence behavior',
        'Design inquiry approaches that reveal workflow patterns and contextual constraints',
        'Create frameworks for documenting both explicit actions and implicit adaptations'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify optimal contexts and environments for inquiry',
        'Reference known user workflows and touchpoints from the knowledge base',
        'Incorporate understanding of organizational or domain-specific constraints',
        'Align inquiry focus with business objectives and user success criteria'
      ],
      qualityChecks: [
        'Ensure inquiry methods minimize disruption to natural user behavior',
        'Include multiple observation sessions to capture behavioral variations',
        'Plan for triangulating contextual observations with other research methods'
      ],
      outputFormat: 'Contextual inquiry protocol with observation frameworks, documentation methods, and analysis techniques'
    },

    'problem-statements': {
      core: `You are a design strategist creating problem statements.

## Project Context
[Insert ALL knowledge base content - user research, personas, pain points, business objectives, insights]

## Create 3-5 Problem Statements

Use the EXACT format: **[User name] is a/an [user characteristics] who needs [user need] because [insight].**

### Examples:
- "Sarah Chen is a working mother of two who needs a faster grocery shopping method because her current 2-hour weekend shopping trips conflict with family time and cause stress."
- "Marcus Rodriguez is a small business owner with limited tech skills who needs simplified financial tracking because complex accounting software overwhelms him and delays important business decisions."

### Your Problem Statements:

1. [Statement 1]
2. [Statement 2]
3. [Statement 3]
4. [Statement 4] (if applicable)
5. [Statement 5] (if applicable)`,

      guidance: ['Exact format enforcement', 'Specific persona names', 'Evidence-based insights', 'Supporting documentation'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include persona names and characteristics', 'Reference business objectives'],
      qualityChecks: ['Exact format followed', 'Research-backed', 'Supporting evidence included'],
      outputFormat: '3-5 problem statements with evidence and validation'
    },

    'journey-maps': {
      core: `You are a UX strategist creating a user journey map.

## Project Context
[Insert ALL knowledge base content - user research, personas, touchpoints, workflows, pain points, business processes]

## Create User Journey Map for [Persona Name]

### Journey Stages

For each stage, include:

**Stage 1: [Stage Name]**
- **Actions:** [What they do]
- **Thoughts:** [What they think]
- **Feelings:** [Emotional state - frustrated/excited/anxious/satisfied]
- **Touchpoints:** [Where/how they interact]
- **Pain Points:** [Problems encountered]
- **Opportunities:** [Areas for improvement]

**Stage 2: [Stage Name]**
- **Actions:** [What they do]
- **Thoughts:** [What they think]
- **Feelings:** [Emotional state]
- **Touchpoints:** [Where/how they interact]
- **Pain Points:** [Problems encountered]
- **Opportunities:** [Areas for improvement]

**Stage 3: [Stage Name]**
- **Actions:** [What they do]
- **Thoughts:** [What they think]
- **Feelings:** [Emotional state]
- **Touchpoints:** [Where/how they interact]
- **Pain Points:** [Problems encountered]
- **Opportunities:** [Areas for improvement]

[Continue for additional stages as needed]

### Emotional Journey Curve
[Describe the emotional highs and lows across the journey]

### Key Insights
- [Insight 1]
- [Insight 2]
- [Insight 3]`,

      guidance: ['End-to-end experience', 'Emotional and rational layers', 'Pain points and opportunities', 'Research-backed'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include touchpoints and workflows', 'Reference pain points and satisfaction data'],
      qualityChecks: ['Complete journey stages', 'Emotional curve included', 'Opportunities prioritized', 'Evidence-based'],
      outputFormat: 'Complete user journey map with stages, emotions, pain points, and opportunities'
    },

    // IDEATION & CREATIVITY TOOLS
    'crazy-eights': {
      core: `You are generating AI prompts for Crazy 8s sketching in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that facilitate rapid idea generation through sketching.`,
      guidance: [
        'Structure rapid sketching sessions for maximum creative output in minimal time',
        'Include warm-up exercises to get participants comfortable with sketching',
        'Design prompts that encourage wild ideas and creative exploration',
        'Create frameworks for building on and combining sketched concepts'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to focus sketching on relevant problem areas',
        'Reference user needs and pain points from the knowledge base',
        'Incorporate business constraints and opportunities into creative prompts',
        'Align sketching objectives with strategic goals and user scenarios'
      ],
      qualityChecks: [
        'Ensure sketching produces quantity of ideas before quality evaluation',
        'Include methods for capturing and documenting sketched concepts',
        'Plan for selecting and developing the most promising sketched ideas'
      ],
      outputFormat: 'Crazy 8s facilitation guide with timing, prompts, and idea capture methods'
    },

    'scamper': {
      core: `You are generating AI prompts for SCAMPER ideation in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that systematically explore creative modifications and improvements.`,
      guidance: [
        'Apply SCAMPER checklist: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse',
        'Include specific prompts for each SCAMPER category relevant to the problem',
        'Design exercises that push beyond obvious modifications to creative breakthroughs',
        'Create frameworks for evaluating and developing SCAMPER-generated ideas'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify what elements to apply SCAMPER to',
        'Reference existing solutions and approaches from the knowledge base',
        'Incorporate user needs and business constraints to guide creative exploration',
        'Align SCAMPER activities with strategic objectives and innovation goals'
      ],
      qualityChecks: [
        'Ensure SCAMPER exploration covers multiple categories for comprehensive ideation',
        'Include methods for building on and combining SCAMPER ideas',
        'Plan for evaluating ideas against user needs and business feasibility'
      ],
      outputFormat: 'SCAMPER ideation guide with category-specific prompts and idea development framework'
    },

    'storyboarding': {
      core: `You are generating AI prompts for storyboarding in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that visualize user scenarios and solution concepts through narrative sequences.`,
      guidance: [
        'Create storyboards that show user context, interaction sequence, and outcomes',
        'Include both happy path scenarios and edge cases or problems',
        'Design storyboards that communicate user emotions and motivations',
        'Structure narratives that test solution concepts and reveal potential issues'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to create realistic user scenarios and contexts',
        'Reference user personas and journey maps from the knowledge base',
        'Incorporate business processes and constraints into storyboard narratives',
        'Align storyboard scenarios with user goals and business objectives'
      ],
      qualityChecks: [
        'Ensure storyboards are grounded in user research and realistic scenarios',
        'Include validation methods for testing storyboard accuracy with users',
        'Plan for using storyboards to identify design and implementation requirements'
      ],
      outputFormat: 'Visual storyboard sequence with narrative flow, user context, and interaction details'
    },

    // MEASUREMENT & ANALYTICS TOOLS
    'nps-surveys': {
      core: `You are generating AI prompts for Net Promoter Score surveys in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that measure user loyalty and satisfaction effectively.`,
      guidance: [
        'Design NPS surveys that capture both score and qualitative reasoning',
        'Include follow-up questions that reveal specific drivers of satisfaction/dissatisfaction',
        'Create survey timing and delivery strategies for optimal response rates',
        'Structure analysis approaches that translate NPS insights into actionable improvements'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify optimal timing and audience for NPS surveys',
        'Reference user segments and personas from the knowledge base',
        'Incorporate business objectives and success metrics into survey design',
        'Align NPS measurement with strategic goals and customer experience objectives'
      ],
      qualityChecks: [
        'Ensure NPS surveys include both quantitative scores and qualitative insights',
        'Include methods for segmenting and analyzing NPS by user types',
        'Plan for translating NPS insights into specific product and experience improvements'
      ],
      outputFormat: 'Complete NPS survey design with questions, timing strategy, and analysis framework'
    },

    'cohort-analysis': {
      core: `You are generating AI prompts for cohort analysis in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that track user behavior patterns over time by user groups.`,
      guidance: [
        'Define meaningful cohorts based on user characteristics, acquisition time, or behavior',
        'Include analysis of retention, engagement, and value metrics across cohorts',
        'Design approaches for identifying patterns and trends in cohort behavior',
        'Create frameworks for translating cohort insights into product and experience decisions'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to define relevant cohorts and success metrics',
        'Reference user segments and business objectives from the knowledge base',
        'Incorporate existing analytics and performance data from project documentation',
        'Align cohort analysis with strategic goals and user lifecycle understanding'
      ],
      qualityChecks: [
        'Ensure cohort definitions are meaningful for business decision-making',
        'Include statistical significance testing for cohort comparisons',
        'Plan for regular cohort analysis updates and trend monitoring'
      ],
      outputFormat: 'Cohort analysis framework with cohort definitions, metrics, and insight interpretation guidelines'
    },

    // DESIGN SPRINT SPECIFIC TOOLS
    'four-step-sketching': {
      core: `You are generating AI prompts for four-step sketching in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide structured ideation through progressive sketch refinement.`,
      guidance: [
        'Structure four steps: Notes, Ideas, Crazy 8s, Solution Sketch',
        'Include timing and facilitation guidance for each sketching phase',
        'Design exercises that build from broad exploration to specific solutions',
        'Create frameworks for documenting and sharing sketched concepts'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to focus sketching on priority problem areas',
        'Reference user insights and business constraints from the knowledge base',
        'Incorporate sprint goals and success criteria into sketching prompts',
        'Align sketching activities with validation and testing objectives'
      ],
      qualityChecks: [
        'Ensure sketching progression builds from broad to specific concepts',
        'Include methods for capturing key insights from each sketching phase',
        'Plan for selecting strongest concepts for further development'
      ],
      outputFormat: 'Four-step sketching facilitation guide with phase-specific instructions and output capture'
    },

    'art-museum': {
      core: `You are generating AI prompts for Art Museum critique in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that facilitate structured solution evaluation and feedback.`,
      guidance: [
        'Structure silent review process where participants examine all solutions like museum visitors',
        'Include guided evaluation criteria focused on user needs and business goals',
        'Design feedback capture methods that are constructive and actionable',
        'Create frameworks for identifying strongest elements across different solutions'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to define relevant evaluation criteria',
        'Reference user needs and success metrics from the knowledge base',
        'Incorporate business constraints and technical feasibility considerations',
        'Align evaluation criteria with sprint goals and validation objectives'
      ],
      qualityChecks: [
        'Ensure evaluation criteria are clearly defined and consistently applied',
        'Include methods for capturing both positive feedback and improvement suggestions',
        'Plan for translating Art Museum insights into solution refinement'
      ],
      outputFormat: 'Art Museum facilitation guide with evaluation criteria, feedback capture, and synthesis methods'
    },

    // JOBS-TO-BE-DONE TOOLS
    'job-statements': {
      core: `You are a Jobs-to-Be-Done expert creating job statements that articulate what customers are trying to accomplish.

## Project Context
[Insert ALL knowledge base content - customer research, behaviors, contexts, goals, pain points]

## Create 10-15 Job Statements

Use the format: **"When I [situation], I want to [motivation], so I can [expected outcome]"**

### Three Job Dimensions

**1. Functional Jobs** (tasks to complete):
- "When I'm commuting, I want to catch up on industry news, so I can stay informed"
- Focus on tangible tasks and activities

**2. Emotional Jobs** (feelings to achieve):
- "When I'm presenting to clients, I want to feel confident, so I can win their trust"
- Focus on emotional states and feelings

**3. Social Jobs** (how they want to be perceived):
- "When I share content online, I want to appear knowledgeable, so I can build my reputation"
- Focus on social perceptions and status

### Requirements
- Solution-independent (no product mentions)
- Stable over time (not trend-dependent)
- Specific situation context
- Customer perspective and language

### Prioritization
For each job, measure:
- **Importance** (1-5): How important is this job?
- **Satisfaction** (1-5): How satisfied are they with current solutions?
- **Opportunity Score** = Importance + (Importance - Satisfaction)

Prioritize jobs with highest opportunity scores.`,

      guidance: ['Three dimensions', 'Exact format', 'Solution-independent', 'Opportunity scoring'],
      knowledgeIntegration: ['Insert customer research from knowledge base', 'Include behavioral data and contexts'],
      qualityChecks: ['Format followed', 'All three dimensions', 'Solution-independent', 'Opportunity scores calculated'],
      outputFormat: '10-15 job statements across all dimensions with opportunity scores'
    },

    'outcome-statements': {
      core: `You are a Jobs-to-Be-Done expert creating outcome statements that define measurable success criteria for customer jobs.

## Project Context
[Insert ALL knowledge base content - job statements, customer goals, success criteria, metrics]

## Create 20-30 Outcome Statements

Use the format: **"[Direction] + [unit of measure] + [object of control] + [contextual clarifier]"**

### Examples
- "Minimize the time it takes to set up a new account for first-time use"
- "Increase the number of payment options available during checkout"
- "Minimize the likelihood that sensitive data is exposed during transmission"

### Two Outcome Types

**1. Efficiency Outcomes** (speed/effort):
- Minimize time to...
- Reduce effort required to...
- Decrease number of steps to...

**2. Effectiveness Outcomes** (quality/completeness):
- Increase accuracy of...
- Maximize number of...
- Ensure completeness of...

### Requirements
- Measurable and specific
- Solution-independent
- Customer perspective
- One outcome per statement

### Prioritization
For each outcome:
- **Importance** (1-5)
- **Current Satisfaction** (1-5)
- **Opportunity Score** = Importance + (Importance - Satisfaction)

Focus on outcomes with high opportunity scores.`,

      guidance: ['Exact format', 'Two types', 'Measurable', 'Opportunity scoring'],
      knowledgeIntegration: ['Insert job statements from knowledge base', 'Include customer success criteria'],
      qualityChecks: ['Format followed', 'Both types covered', 'Measurable', 'Opportunity scores calculated'],
      outputFormat: '20-30 outcome statements with opportunity scores'
    },

    // LEAN UX TOOLS
    'mvp-creation': {
      core: `You are generating AI prompts for MVP creation in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that define minimum viable products for rapid learning.`,
      guidance: [
        'Define MVPs that test specific hypotheses with minimal development effort',
        'Include clear learning objectives and success criteria for each MVP',
        'Design MVPs that provide maximum learning with minimum features',
        'Create frameworks for measuring MVP performance and user feedback'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to define MVP scope based on key hypotheses',
        'Reference user needs and business constraints from the knowledge base',
        'Incorporate technical capabilities and resource limitations into MVP planning',
        'Align MVP objectives with strategic learning goals and business validation needs'
      ],
      qualityChecks: [
        'Ensure MVPs are truly minimal while still providing meaningful user value',
        'Include clear metrics and methods for measuring MVP success',
        'Plan for rapid iteration based on MVP learning outcomes'
      ],
      outputFormat: 'MVP specification with scope definition, success criteria, and measurement plan'
    },

    'validated-learning': {
      core: `You are generating AI prompts for validated learning in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that systematically capture and apply learnings from experiments.`,
      guidance: [
        'Structure learning capture that connects hypotheses, experiments, and outcomes',
        'Include both quantitative metrics and qualitative insights in learning documentation',
        'Design frameworks for translating learning into product and strategy decisions',
        'Create approaches for building organizational learning and knowledge retention'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to contextualize learning within business and user goals',
        'Reference existing hypotheses and assumptions from the knowledge base',
        'Incorporate business objectives and success criteria into learning evaluation',
        'Align learning outcomes with strategic decisions and future experiment planning'
      ],
      qualityChecks: [
        'Ensure learning is properly validated with statistical significance and user research',
        'Include methods for distinguishing correlation from causation in learning outcomes',
        'Plan for applying validated learning to immediate product decisions and future strategy'
      ],
      outputFormat: 'Validated learning documentation with experiment results, insights, and application recommendations'
    }

    // Additional tools will be added systematically...
  };

  return instructions[toolId] || {
    core: `You are generating AI prompts for ${toolId} in a ${'{framework}'} methodology during the ${'{stage}'} phase.`,
    guidance: ['Create contextual, actionable prompts based on the tool\'s specific purpose and methodology.'],
    knowledgeIntegration: ['CRITICAL: Incorporate project knowledge base content to ensure contextually relevant outputs.'],
    qualityChecks: ['Ensure prompts are specific to the tool\'s purpose and methodology.'],
    outputFormat: 'Tool-specific output format based on best practices.'
  };
}

/**
 * Framework-specific customizations for tools
 */
function getFrameworkSpecificCustomizations(toolId: string, frameworkId: string): string[] {
  const customizations: Record<string, Record<string, string[]>> = {
    'user-interviews': {
      'design-thinking': [
        'Focus on empathetic understanding and human-centered insights',
        'Include questions about emotions, motivations, and user aspirations',
        'Explore user stories and personal experiences in detail',
        'Emphasize building empathy and understanding user needs deeply'
      ],
      'double-diamond': [
        'Structure interviews to support both problem and solution exploration',
        'Include questions that diverge and converge thinking',
        'Focus on both discovering problems and validating solutions',
        'Balance broad exploration with focused validation'
      ],
      'google-design-sprint': [
        'Keep interviews focused and time-boxed for sprint efficiency',
        'Prioritize expert insights and domain knowledge',
        'Include rapid validation questions for quick decision making',
        'Focus on actionable insights for immediate prototype development'
      ],
      'lean-ux': [
        'Design interviews to test specific hypotheses and assumptions',
        'Include questions that generate measurable learning outcomes',
        'Focus on rapid validation and iteration cycles',
        'Emphasize learning that leads to immediate product decisions'
      ]
    },
    
    'brainstorming': {
      'design-thinking': [
        'Encourage radical creativity and human-centered solutions',
        'Include exercises that build on empathy insights',
        'Focus on solutions that address deep user needs and emotions',
        'Emphasize quantity of ideas before quality evaluation'
      ],
      'google-design-sprint': [
        'Time-box brainstorming sessions for sprint efficiency',
        'Focus on solutions that can be prototyped and tested quickly',
        'Include rapid sketching and idea sharing techniques',
        'Prioritize ideas that align with sprint goals and constraints'
      ],
      'lean-ux': [
        'Generate ideas that can be quickly tested and validated',
        'Focus on minimal viable solutions and experiments',
        'Include ideation around measurement and learning approaches',
        'Emphasize solutions that generate rapid user feedback'
      ]
    }
  };

  return customizations[toolId]?.[frameworkId] || [
    `Apply ${toolId} within the ${frameworkId} methodology context`,
    `Consider the specific objectives and constraints of ${frameworkId}`,
    `Align tool usage with ${frameworkId} principles and practices`
  ];
}

/**
 * Stage-specific customizations for tools
 */
function getStageSpecificCustomizations(toolId: string, stageId: string, frameworkId: string): string[] {
  const customizations: Record<string, Record<string, string[]>> = {
    'user-interviews': {
      'empathize': [
        'Focus on deep understanding of user emotions, motivations, and contexts',
        'Ask open-ended questions that reveal personal stories and experiences',
        'Explore user pain points, frustrations, and unmet needs',
        'Include questions about user environments, relationships, and daily routines'
      ],
      'define': [
        'Focus interviews on validating and refining problem statements',
        'Ask questions that help prioritize user needs and pain points',
        'Explore user goals and success criteria in detail',
        'Include validation questions about problem severity and frequency'
      ],
      'test': [
        'Focus on user feedback about specific solutions and prototypes',
        'Ask questions about usability, desirability, and effectiveness',
        'Explore user mental models and expectations about the solution',
        'Include questions about adoption barriers and implementation concerns'
      ]
    },
    
    'brainstorming': {
      'ideate': [
        'Generate maximum quantity of creative solutions without judgment',
        'Build on problem insights from previous stages',
        'Include wild and radical ideas alongside practical ones',
        'Focus on divergent thinking and creative exploration'
      ],
      'develop': [
        'Focus brainstorming on refining and improving selected concepts',
        'Generate ideas for implementation approaches and details',
        'Include brainstorming about user experience and interaction design',
        'Emphasize practical solutions that can be developed and tested'
      ]
    }
  };

  return customizations[toolId]?.[stageId] || [
    `Apply ${toolId} specifically for the ${stageId} stage objectives`,
    `Focus on outcomes that advance the ${stageId} phase of ${frameworkId}`,
    `Consider stage-specific constraints and requirements for ${stageId}`
  ];
}

export default generateToolSpecificInstructions;