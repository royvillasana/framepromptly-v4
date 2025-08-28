/**
 * @fileoverview Tool-Specific AI Prompt Instructions System
 * Each tool has unique, contextual AI prompt instructions based on framework, stage, and tool purpose
 * This addresses the issue where all tools were using generic prompt text
 */

import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';

export interface ToolPromptContext {
  framework: UXFramework;
  stage: UXStage;
  tool: UXTool;
  projectContext?: string; // From knowledge base
}

export interface SpecificToolInstructions {
  promptTemplate: string;
  contextualGuidance: string[];
  frameworkSpecificNotes: string[];
  stageSpecificFocus: string[];
  knowledgeIntegrationInstructions: string[];
  qualityChecks: string[];
  expectedOutputFormat: string;
}

/**
 * Generate specific AI prompt instructions for each tool based on context
 */
export function generateToolSpecificInstructions(context: ToolPromptContext): SpecificToolInstructions {
  const { framework, stage, tool } = context;
  
  // Get base template for this tool type
  const baseInstructions = getBaseToolInstructions(tool.id);
  
  // Customize based on framework context
  const frameworkCustomizations = getFrameworkSpecificCustomizations(tool.id, framework.id);
  
  // Customize based on stage context
  const stageCustomizations = getStageSpecificCustomizations(tool.id, stage.id, framework.id);
  
  return {
    promptTemplate: `# AI Prompt Instructions for ${tool.name}
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
    expectedOutputFormat: baseInstructions.outputFormat
  };
}

/**
 * Base instructions for each specific tool
 */
function getBaseToolInstructions(toolId: string): any {
  const instructions: Record<string, any> = {
    
    // RESEARCH TOOLS
    'user-interviews': {
      core: `You are generating AI prompts for conducting user interviews in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that will help generate structured, insightful interview guides and analysis frameworks.`,
      guidance: [
        'Focus on open-ended questions that reveal user motivations, not just preferences',
        'Include questions that uncover mental models and decision-making processes',
        'Design questions to reveal emotional responses and pain points',
        'Create scenarios that prompt users to demonstrate behaviors rather than describe them'
      ],
      knowledgeIntegration: [
        'CRITICAL: Analyze the project knowledge base to identify specific user segments, business context, and domain expertise',
        'Use insights from the knowledge base to craft interview questions targeted to the specific industry and user types',
        'Reference existing research findings in the knowledge base to avoid redundant questions and build upon previous insights',
        'Incorporate business goals and constraints from the knowledge base into interview objectives'
      ],
      qualityChecks: [
        'Ensure questions avoid leading or biased phrasing',
        'Include validation questions to cross-check responses',
        'Plan for follow-up probes to go deeper into interesting responses'
      ],
      outputFormat: 'Structured interview guide with warm-up questions, main topics, scenario-based questions, and wrap-up items'
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
      core: `You are generating AI prompts for affinity mapping in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide systematic grouping and pattern identification from research data.`,
      guidance: [
        'Focus on identifying meaningful patterns and themes rather than superficial similarities',
        'Create frameworks for multi-level clustering and hierarchy building',
        'Include methods for handling contradictory or outlier data points',
        'Design approaches that reveal insights not obvious from individual data points'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to provide context for interpreting research findings',
        'Reference business objectives and success criteria to guide insight prioritization',
        'Incorporate existing user models and personas from the knowledge base for validation',
        'Align pattern identification with strategic goals and constraints from project documentation'
      ],
      qualityChecks: [
        'Ensure themes are supported by sufficient evidence',
        'Include methods for validating insights against multiple data sources',
        'Plan for stakeholder review and validation of identified patterns'
      ],
      outputFormat: 'Structured affinity map with hierarchical themes, supporting evidence, and actionable insights'
    },

    'personas': {
      core: `You are generating AI prompts for creating personas in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that develop research-based, actionable user archetypes.`,
      guidance: [
        'Base personas on behavioral patterns and goals rather than demographics alone',
        'Include both functional jobs-to-be-done and emotional motivations',
        'Create personas that are specific enough to guide design decisions',
        'Include context about environments, constraints, and decision-making factors'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to ground personas in specific business and user contexts',
        'Reference existing user research and analytics data from the knowledge base',
        'Incorporate business objectives to ensure personas align with strategic goals',
        'Use domain expertise from the knowledge base to add realistic details and constraints'
      ],
      qualityChecks: [
        'Ensure personas are based on real research data, not assumptions',
        'Include validation criteria and methods for testing persona accuracy',
        'Plan for regular updates based on new research findings'
      ],
      outputFormat: 'Detailed persona profiles with goals, behaviors, pain points, and contextual information'
    },

    'empathy-maps': {
      core: `You are generating AI prompts for creating empathy maps in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that systematically capture user thoughts, feelings, and experiences.`,
      guidance: [
        'Structure empathy maps to capture thinks, feels, sees, says, hears, and does',
        'Include both positive and negative aspects of the user experience',
        'Focus on specific scenarios and contexts rather than general impressions',
        'Create maps that reveal insights about user motivations and barriers'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to provide specific context for user experiences',
        'Reference user research findings and behavioral data from the knowledge base',
        'Incorporate business environment and constraints that affect user experience',
        'Align empathy mapping with specific user scenarios documented in the project'
      ],
      qualityChecks: [
        'Ensure empathy maps are grounded in observed user behavior and feedback',
        'Include validation methods to test map accuracy',
        'Plan for using empathy maps to generate actionable design insights'
      ],
      outputFormat: 'Visual empathy map with structured sections for thoughts, feelings, actions, and environmental factors'
    },

    // IDEATION TOOLS
    'brainstorming': {
      core: `You are generating AI prompts for brainstorming sessions in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that facilitate creative, productive idea generation.`,
      guidance: [
        'Structure brainstorming for divergent thinking followed by convergent evaluation',
        'Include warm-up exercises to get participants thinking creatively',
        'Design prompts that encourage building on others\' ideas',
        'Create frameworks for capturing and organizing ideas effectively'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to focus brainstorming on relevant problem areas',
        'Reference user insights and pain points from the knowledge base to guide idea generation',
        'Incorporate business constraints and opportunities to make ideas realistic',
        'Align brainstorming objectives with strategic goals from project documentation'
      ],
      qualityChecks: [
        'Ensure brainstorming produces quantity before focusing on quality',
        'Include methods for building on and combining ideas',
        'Plan for structured evaluation and prioritization of generated ideas'
      ],
      outputFormat: 'Brainstorming facilitation guide with warm-ups, structured exercises, and idea capture methods'
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
      core: `You are generating AI prompts for creating wireframes in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that guide low-fidelity structural design.`,
      guidance: [
        'Focus on information architecture and layout structure before visual details',
        'Include user flow considerations and navigation patterns',
        'Create wireframes that test core functionality and content organization',
        'Design wireframes for rapid iteration and stakeholder feedback'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to understand user workflows and information needs',
        'Reference user goals and tasks from the knowledge base to prioritize content',
        'Incorporate business requirements and constraints into structural decisions',
        'Align wireframe functionality with user scenarios documented in the project'
      ],
      qualityChecks: [
        'Ensure wireframes address core user tasks and goals',
        'Include considerations for different screen sizes and contexts',
        'Plan for user testing and iteration based on feedback'
      ],
      outputFormat: 'Wireframe specifications with layout rationale, user flow documentation, and iteration plan'
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
      core: `You are generating AI prompts for usability testing in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that design effective user testing protocols.`,
      guidance: [
        'Design tests that reveal actual user behavior rather than preferences',
        'Include both task-based testing and exploratory scenarios',
        'Create testing protocols that capture quantitative and qualitative insights',
        'Plan for identifying both usability issues and user satisfaction factors'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to design realistic testing scenarios',
        'Reference user goals and workflows from the knowledge base',
        'Incorporate business success metrics into testing objectives',
        'Align testing scenarios with real user contexts documented in the project'
      ],
      qualityChecks: [
        'Ensure testing scenarios are realistic and representative of actual use',
        'Include methods for capturing both successful task completion and failure points',
        'Plan for translating test results into actionable design recommendations'
      ],
      outputFormat: 'Complete usability testing protocol with scenarios, metrics, and analysis framework'
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
      core: `You are generating AI prompts for creating problem statements in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that articulate clear, actionable problem definitions.`,
      guidance: [
        'Structure problem statements that are specific, measurable, and user-focused',
        'Include both functional problems (what users can\'t do) and emotional problems (how they feel)',
        'Create problem statements that inspire solution thinking without prescribing solutions',
        'Frame problems in terms of user needs and business impact'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to ground problem statements in real user and business contexts',
        'Reference specific user research findings and pain points from the knowledge base',
        'Incorporate business objectives and strategic priorities into problem framing',
        'Align problem statements with organizational capabilities and constraints'
      ],
      qualityChecks: [
        'Ensure problem statements are based on evidence, not assumptions',
        'Include validation criteria for testing problem accuracy and priority',
        'Plan for iterating problem statements based on new insights'
      ],
      outputFormat: 'Structured problem statements with user impact, business relevance, and validation criteria'
    },

    'journey-maps': {
      core: `You are generating AI prompts for creating journey maps in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that visualize comprehensive user experience flows.`,
      guidance: [
        'Map complete user journeys including pre and post-interaction phases',
        'Include emotional highs and lows alongside functional touchpoints',
        'Document pain points, opportunities, and moments of truth',
        'Create maps that reveal systemic issues and improvement opportunities'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to create accurate, realistic journey maps',
        'Reference user research and behavioral data from the knowledge base',
        'Incorporate business touchpoints and organizational constraints',
        'Align journey mapping with strategic business objectives and user goals'
      ],
      qualityChecks: [
        'Ensure journey maps are based on actual user research and data',
        'Include validation methods for testing journey accuracy',
        'Plan for using journey maps to identify specific improvement opportunities'
      ],
      outputFormat: 'Visual journey map with stages, touchpoints, emotions, pain points, and opportunity identification'
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
      core: `You are generating AI prompts for creating job statements in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that articulate customer jobs in functional, emotional, and social dimensions.`,
      guidance: [
        'Structure job statements in format: "When I [situation], I want to [motivation], so I can [expected outcome]"',
        'Include functional jobs (tasks to complete), emotional jobs (feelings to achieve), and social jobs (perceptions to create)',
        'Design job statements that are stable over time and independent of solutions',
        'Create frameworks for prioritizing jobs based on importance and satisfaction'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to identify real customer jobs and contexts',
        'Reference customer research and behavioral data from the knowledge base',
        'Incorporate business objectives and market positioning into job framing',
        'Align job statements with customer success criteria and business goals'
      ],
      qualityChecks: [
        'Ensure job statements are customer-focused, not solution-focused',
        'Include validation methods for testing job accuracy with customers',
        'Plan for measuring job importance and current satisfaction levels'
      ],
      outputFormat: 'Structured job statements with functional, emotional, and social dimensions clearly defined'
    },

    'outcome-statements': {
      core: `You are generating AI prompts for creating outcome statements in a ${'{framework}'} methodology during the ${'{stage}'} phase. Create prompts that define measurable success criteria for customer jobs.`,
      guidance: [
        'Structure outcome statements as measurable success criteria for job completion',
        'Include both efficiency outcomes (time, effort) and effectiveness outcomes (quality, completeness)',
        'Design outcomes that are independent of specific solutions or implementations',
        'Create frameworks for measuring outcome importance and current satisfaction'
      ],
      knowledgeIntegration: [
        'CRITICAL: Use project knowledge to define realistic, measurable outcomes',
        'Reference customer success criteria and performance metrics from the knowledge base',
        'Incorporate business objectives and competitive positioning into outcome definition',
        'Align outcome statements with customer value propositions and business goals'
      ],
      qualityChecks: [
        'Ensure outcome statements are specific, measurable, and achievable',
        'Include methods for validating outcomes with actual customers',
        'Plan for prioritizing outcomes based on importance and opportunity'
      ],
      outputFormat: 'Structured outcome statements with measurement criteria and prioritization framework'
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