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
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for affinity mapping and research synthesis. Generate a complete AI prompt that users can copy and paste into their AI assistant to systematically analyze research data and identify meaningful patterns.

The generated prompt must:
1. Include instructions for AI to act as a research synthesis expert with pattern recognition expertise
2. Incorporate ALL project knowledge base content for contextual interpretation
3. Provide structured methodology for multi-level clustering and theme development
4. Include specific requirements for handling contradictory data and outliers
5. Request validation methods and evidence-based insight generation
6. Be comprehensive enough to generate complete affinity analysis without additional input

Template Structure for Generated Prompt:
---
# AI Research Synthesis & Affinity Mapping Expert

You are a senior UX researcher and data analysis expert with 15+ years of experience synthesizing qualitative research into actionable insights. You specialize in affinity mapping methodologies that reveal meaningful patterns and generate strategic recommendations.

## Project Context
[Insert all relevant project knowledge base content here - research data, business objectives, user segments, strategic goals, etc.]

## Your Task
Conduct comprehensive affinity mapping analysis of the provided research data using systematic clustering methodology to identify meaningful themes, patterns, and actionable insights.

### Affinity Mapping Methodology
- Apply systematic clustering to identify meaningful patterns rather than superficial similarities
- Use multi-level analysis to reveal both detailed insights and strategic themes
- Handle contradictory data thoughtfully to understand user complexity
- Generate insights that are not obvious from individual data points
- Connect patterns to business objectives and strategic opportunities

### Required Analysis Framework
Conduct complete affinity analysis including:

1. **Data Preparation & Organization**
   - Raw data review and initial categorization
   - Data point extraction and standardization
   - Source attribution and context preservation
   - Quality assessment and gap identification

2. **Level 1 Clustering: Detailed Groupings**
   - **Initial Affinity Groups**
     - Similar responses and behavioral patterns
     - Related pain points and frustrations
     - Connected needs and motivations
     - Comparable contexts and environments
   
   - **Data Point Analysis**
     - Supporting evidence for each cluster
     - Frequency and strength of patterns
     - User segment representation
     - Contradiction and outlier documentation

3. **Level 2 Clustering: Thematic Insights**
   - **Theme Development**
     - Higher-level patterns across multiple clusters
     - Cross-cutting insights and relationships
     - Behavioral themes and mental model patterns
     - System-level issues and opportunities
   
   - **Theme Validation**
     - Evidence strength assessment
     - User segment consistency analysis
     - Business relevance evaluation
     - Strategic alignment verification

4. **Level 3 Clustering: Strategic Implications**
   - **Meta-Themes & Insights**
     - Overarching patterns with business impact
     - Strategic opportunities and recommendations
     - System-wide improvements and innovations
     - Competitive advantages and differentiators

5. **Contradiction & Outlier Analysis**
   - **Conflicting Data Assessment**
     - User segment differences and preferences
     - Context-dependent behavior variations
     - Edge cases and special circumstances
     - Minority opinions with strategic value
   
   - **Complexity Understanding**
     - Multi-faceted user needs and trade-offs
     - Situational behavior variations
     - Evolution and change indicators
     - Personalization and customization opportunities

### Insight Quality Framework
Ensure insights meet criteria for:
- **Evidence-Based**: Supported by sufficient data points and user feedback
- **Actionable**: Translatable into specific design or business decisions
- **Strategic**: Aligned with business objectives and user value creation
- **Differentiated**: Reveal non-obvious patterns and opportunities
- **Validated**: Consistent across data sources and user segments

### Pattern Recognition Excellence
Apply advanced techniques for:
- Identifying subtle behavioral nuances and preferences
- Connecting seemingly unrelated data points
- Recognizing temporal patterns and user journey insights
- Detecting system-level issues affecting multiple touchpoints
- Finding opportunities for innovation and differentiation

### Validation & Quality Assurance
Include methods for:
- Cross-referencing insights against multiple data sources
- Testing theme accuracy with additional research
- Stakeholder validation and feedback integration
- Bias identification and mitigation
- Confidence level assessment for each insight

### Strategic Recommendations
Generate actionable recommendations including:
- Prioritized improvement opportunities with business impact
- Design implications and implementation approaches
- Further research needs and validation requirements
- Success metrics and measurement approaches
- Stakeholder communication and alignment strategies

### Output Requirements
Deliver comprehensive affinity analysis including:
- Visual affinity map with hierarchical clustering
- Detailed theme documentation with supporting evidence
- Strategic insights with business implications
- Actionable recommendations with implementation guidance
- Quality assessment and confidence indicators
---`,
      guidance: [
        'Generate prompts that instruct AI to identify meaningful patterns and themes rather than superficial similarities',
        'Include instructions for AI to create multi-level clustering and hierarchical theme development',
        'Ensure prompts direct AI to handle contradictory data thoughtfully to understand user complexity',
        'Generate prompts instructing AI to reveal insights not obvious from individual data points',
        'Include instructions for AI to connect patterns to business objectives and strategic opportunities',
        'Ensure prompts direct AI to provide evidence-based validation for all identified themes',
        'Generate prompts that instruct AI to generate actionable recommendations with implementation guidance'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including research data, business objectives, and strategic context',
        'Insert specific research findings, user feedback, and behavioral data from knowledge base into analysis framework',
        'Include business goals, success metrics, and strategic priorities from knowledge base in pattern interpretation',
        'Reference existing user models, personas, and segmentation from knowledge base for validation and consistency',
        'Incorporate market context, competitive landscape, and industry requirements from knowledge base in insight development',
        'Use organizational constraints, resource limitations, and implementation capabilities from knowledge base in recommendation prioritization',
        'Include previous research findings, assumptions, and hypotheses from knowledge base for comparative analysis'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive research data and project context for informed analysis',
        'Ensure the prompt provides systematic methodology for multi-level clustering and theme development',
        'Confirm the prompt specifies validation approaches and evidence requirements for insights',
        'Validate that the prompt includes strategic recommendation development with business alignment',
        'Check that the prompt generates complete affinity analysis ready for stakeholder presentation',
        'Ensure the prompt instructs AI to handle contradictions and provide confidence assessments'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates systematic affinity mapping analysis with hierarchical themes, evidence validation, and strategic recommendations'
    },

    'personas': {
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for persona development. Generate a complete AI prompt that users can copy and paste into their AI assistant (ChatGPT, Claude, etc.) to create evidence-based user personas.

The generated prompt must:
1. Include specific instructions for the AI to act as a UX research expert specializing in persona development
2. Incorporate ALL available project knowledge base content to provide context
3. Provide detailed methodology using triangulation method and Jobs-to-be-Done framework
4. Include specific output format requirements with research backing
5. Request validation criteria and supporting evidence
6. Be comprehensive enough to generate professional-quality personas without additional input

Template Structure for Generated Prompt:
---
# AI Persona Development Expert

You are a senior UX researcher and persona development expert with 15+ years of experience creating evidence-based user personas. You specialize in using the triangulation method (combining quantitative data, qualitative insights, and behavioral analytics) and Jobs-to-be-Done framework.

## Project Context
[Insert all relevant project knowledge base content here - user research, business context, industry constraints, target audience, etc.]

## Your Task
Create [number] detailed, research-backed user persona(s) for this project using the following methodology:

### Research-Based Approach
- Use triangulation method: combine the provided research data with logical behavioral inferences
- Apply Jobs-to-be-Done framework: include both functional jobs (tasks) and emotional jobs (feelings)
- Focus on behavioral patterns and goal hierarchies rather than just demographics
- Base all persona elements on evidence from the project context provided

### Required Persona Structure
For each persona, provide:

1. **Core Identity**
   - Specific name (not generic like "Tech User" - use real names like "Sarah Chen")
   - Age range and key demographics
   - Professional role and context
   - Personal quote that captures their essence

2. **Behavioral Profile**
   - Primary goals (essential needs) vs secondary goals (nice-to-haves)  
   - Functional jobs-to-be-done (tasks they need to complete)
   - Emotional jobs-to-be-done (feelings they want to achieve)
   - Decision-making patterns and criteria
   - Technology comfort level and usage patterns

3. **Context & Environment**
   - Work/life environment and constraints
   - Social influences and relationships
   - Tools and systems they currently use
   - Typical day workflow relevant to this project

4. **Pain Points & Frustrations**
   - Specific problems they face (backed by research evidence)
   - Current workarounds and adaptations
   - Emotional impact of these problems
   - Frequency and severity of issues

5. **Motivations & Success Criteria**
   - What drives their decisions
   - How they define success
   - What would make them advocate for a solution
   - Long-term aspirations relevant to the project

6. **Research Evidence**
   - Specific quotes or data points supporting persona elements
   - Research sources that informed each major persona characteristic
   - Confidence level for different persona aspects
   - Areas where additional research would be valuable

### Validation Requirements
Include for each persona:
- 3-5 testable hypotheses about their behavior
- Recommended validation methods (interviews, surveys, observation)
- Key questions to ask real users to verify persona accuracy
- Metrics that would indicate persona relevance and adoption

### Output Format
Present each persona as a comprehensive profile that a design team can immediately use for decision-making, with clear research backing for credibility.
---`,
      guidance: [
        'Generate prompts that instruct AI to use triangulation method combining quantitative data, qualitative insights, and behavioral analytics',
        'Include instructions for the AI to focus on goals hierarchy - distinguishing between primary goals (essential needs) and secondary goals (nice-to-have wants)',
        'Ensure the prompt instructs AI to include both functional jobs (tasks to accomplish) and emotional jobs (feelings to achieve)',
        'Generate prompts that direct AI to develop behavioral patterns based on observed actions rather than stated preferences',
        'Include instructions for AI to create empathy maps capturing what personas think, feel, see, say, hear, and do',
        'Ensure prompts instruct AI to include contextual factors: environmental constraints, social influences, and situational pressures',
        'Generate prompts that direct AI to validate personas against multiple data sources and provide update recommendations'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL available project knowledge base content including user research, business context, industry constraints, target audiences, and organizational factors',
        'Insert specific user quotes, behavioral data, and research findings from the knowledge base directly into the prompt context section',
        'Include industry-specific terminology, processes, and constraints from the knowledge base in the AI instructions',
        'Reference existing user segments, customer data, or market research from knowledge base to inform persona development direction',
        'Incorporate business objectives, success metrics, and strategic goals from the knowledge base into the persona requirements',
        'Use project-specific environments, tools, and workflows from knowledge base to ensure contextually accurate persona details',
        'Include domain expertise and professional requirements from knowledge base to guide realistic persona characteristics'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context from the knowledge base',
        'Ensure the prompt provides clear methodology instructions for evidence-based persona development',
        'Confirm the prompt specifies detailed output format requirements with research backing expectations',
        'Validate that the prompt includes specific validation criteria and testing recommendations',
        'Check that the prompt is complete enough to generate professional personas without additional input',
        'Ensure the prompt instructs AI to provide supporting evidence and confidence levels for persona elements'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that incorporates all project knowledge and generates research-backed personas with validation criteria'
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
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for wireframe design and development. Generate a complete AI prompt that users can copy and paste into their AI assistant to create structured, user-centered wireframes.

The generated prompt must:
1. Include instructions for AI to act as an information architecture and interaction design expert
2. Incorporate ALL project knowledge base content for accurate structural decisions
3. Provide structured methodology for low-fidelity design and layout planning
4. Include specific requirements for user flows, content hierarchy, and functionality
5. Request validation methods and iteration approaches
6. Be comprehensive enough to generate complete wireframe specifications without additional input

Template Structure for Generated Prompt:
---
# AI Wireframe Design Expert

You are a senior UX architect and interaction design expert with 15+ years of experience creating user-centered wireframes and information architectures. You specialize in translating user needs and business requirements into clear, testable design structures.

## Project Context
[Insert all relevant project knowledge base content here - user workflows, business requirements, content needs, technical constraints, etc.]

## Your Task
Create comprehensive wireframe specifications for this project using evidence-based design methodology that prioritizes user workflows and information architecture.

### Wireframe Design Methodology
- Focus on information architecture and content hierarchy before visual details
- Base layout decisions on user task flows and mental models
- Design for core functionality testing and rapid iteration
- Create structures that support both user goals and business objectives
- Plan for responsive behavior across different devices and contexts

### Required Wireframe Documentation
Create complete wireframe specifications including:

1. **Information Architecture Foundation**
   - Site/app structure and navigation hierarchy
   - Content organization and categorization
   - User flow mapping and page relationships
   - Information prioritization based on user needs

2. **For Each Key Screen/Page:**
   - **Layout Structure**
     - Grid system and spatial organization
     - Content blocks and functional areas
     - Hierarchy and visual weight distribution
     - White space and content density decisions
   
   - **Content Requirements**
     - Specific content types and elements needed
     - Content priority and prominence decisions
     - Text length estimates and content constraints
     - Image and media placement requirements
   
   - **Functional Elements**
     - Interactive components and controls
     - Form fields and input requirements
     - Navigation elements and linking
     - Feedback and status indicators
   
   - **User Flow Integration**
     - Entry points and user arrival context
     - Primary and secondary task pathways
     - Exit points and next action options
     - Error states and alternative flows

3. **Responsive Considerations**
   - Breakpoint behavior and layout adaptation
   - Content prioritization across screen sizes
   - Touch interaction and mobile optimization
   - Progressive disclosure strategies

4. **Design Rationale**
   - User research evidence supporting layout decisions
   - Business requirement alignment explanation
   - Usability principles and best practice application
   - Accessibility considerations and compliance

### Wireframe Quality Requirements
Ensure wireframes:
- Address all core user tasks identified in project research
- Reflect realistic content volumes and types
- Support efficient task completion and user goals
- Consider technical feasibility and implementation constraints
- Enable rapid prototyping and user testing
- Provide clear specifications for development

### User-Centered Design Integration
- Base layout decisions on user mental models and expectations
- Prioritize content based on user goals and task frequency
- Design navigation that matches user workflows
- Include affordances that support user success
- Plan for error prevention and recovery

### Testing and Iteration Framework
Provide approaches for:
- Low-fidelity prototype creation for user testing
- Layout effectiveness assessment with real content
- Navigation and flow validation with users
- Stakeholder review and feedback integration
- Iterative refinement based on testing results

### Technical Specifications
Include guidance for:
- Grid systems and layout constraints
- Component definitions and interaction states
- Content management and dynamic content handling
- Performance implications of layout decisions
- Development handoff requirements

### Output Requirements
Deliver wireframe specifications that include:
- Visual layout representations for all key screens
- Detailed annotations explaining design decisions
- User flow diagrams showing page relationships
- Content requirements and functional specifications
- Testing plan and iteration roadmap
---`,
      guidance: [
        'Generate prompts that instruct AI to focus on information architecture and content hierarchy before visual details',
        'Include instructions for AI to base layout decisions on user task flows and mental models',
        'Ensure prompts direct AI to consider responsive behavior and multi-device contexts',
        'Generate prompts instructing AI to create wireframes that support rapid prototyping and user testing',
        'Include instructions for AI to provide detailed design rationale based on user research evidence',
        'Ensure prompts direct AI to consider technical feasibility and implementation constraints',
        'Generate prompts that instruct AI to plan for iterative refinement and stakeholder feedback'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user workflows, business requirements, and technical constraints',
        'Insert specific user task flows, interaction patterns, and workflow requirements from knowledge base into design methodology',
        'Include content types, information needs, and content strategy from knowledge base in wireframe requirements',
        'Reference business objectives, functional requirements, and feature priorities from knowledge base in layout decisions',
        'Incorporate technical constraints, platform requirements, and development capabilities from knowledge base in design specifications',
        'Use accessibility requirements, compliance needs, and user diversity considerations from knowledge base in design approach',
        'Include brand guidelines, visual constraints, and organizational requirements from knowledge base in structural planning'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context for informed design decisions',
        'Ensure the prompt provides detailed methodology for user-centered wireframe development',
        'Confirm the prompt specifies complete documentation requirements including annotations and specifications',
        'Validate that the prompt includes testing and iteration approaches for wireframe validation',
        'Check that the prompt generates wireframe specifications ready for prototyping and development',
        'Ensure the prompt instructs AI to provide design rationale and research backing for layout decisions'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates comprehensive wireframe specifications with layout rationale, user flow integration, and testing framework'
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
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for problem statement development. Generate a complete AI prompt that users can copy and paste into their AI assistant to create clear, actionable problem statements using the specific format: [User name] is a/an [user characteristics] who needs [user need] because [insight].

The generated prompt must:
1. Include instructions for AI to act as a design thinking expert specializing in problem definition
2. Incorporate ALL project knowledge base content for contextual accuracy
3. Enforce the exact problem statement format with specific examples
4. Provide methodology for evidence-based problem framing
5. Request validation criteria and supporting research evidence
6. Be comprehensive enough to generate professional problem statements without additional input

Template Structure for Generated Prompt:
---
# AI Problem Statement Expert

You are a senior design strategist and problem definition expert with 15+ years of experience creating actionable problem statements. You specialize in translating user research into clear, inspiring problem definitions that guide solution development.

## Project Context
[Insert all relevant project knowledge base content here - user research findings, personas, pain points, business objectives, industry context, etc.]

## Your Task
Create clear, actionable problem statements using the EXACT format: [User name] is a/an [user characteristics] who needs [user need] because [insight].

### Problem Statement Methodology
- Base all elements on evidence from the provided project context
- Use specific persona names from research (not generic terms like "users")
- Ground insights in validated research findings, not assumptions
- Balance user needs with business objectives and constraints
- Include both functional needs (what they can't do) and emotional needs (how they feel)

### Required Format Structure
**EXACT FORMAT:** [User name] is a/an [user characteristics] who needs [user need] because [insight].

**Element Requirements:**
1. **User name**: Use specific, realistic names that represent actual personas (e.g., "Sarah Chen", "Marcus Rodriguez", "Elena Thompson")
2. **User characteristics**: Capture key demographics, roles, or behavioral traits that are relevant to the problem context
3. **User need**: Express as clear, actionable requirements or desired outcomes that can guide solution development  
4. **Insight**: Based on validated research findings that explain the underlying reasons for the need

### Problem Statement Examples
- "Sarah Chen is a working mother of two who needs a faster grocery shopping method because her current 2-hour weekend shopping trips conflict with family time and cause stress."
- "Marcus Rodriguez is a small business owner with limited tech skills who needs simplified financial tracking because complex accounting software overwhelms him and delays important business decisions."
- "Elena Thompson is a remote team manager who needs better visibility into project progress because unclear status updates lead to missed deadlines and client dissatisfaction."

### Quality Requirements
For each problem statement ensure:
- Follows the exact format without deviation
- Uses specific, realistic persona names
- Includes meaningful user characteristics
- States actionable, specific user needs
- Provides evidence-based insights
- Inspires solution thinking without prescribing solutions
- Balances user empathy with business alignment

### Supporting Documentation
For each problem statement, provide:
- Research evidence supporting each element
- Data points or user quotes that validate the insight
- Business impact assessment of solving this problem
- Success criteria for addressing the user need
- Prioritization rationale among multiple problems

### Validation Framework
Include methods to:
- Test problem statement accuracy with real users
- Validate problem priority through stakeholder review
- Measure problem statement effectiveness in guiding ideation
- Update statements based on new research findings

### Output Requirements
Deliver 3-5 problem statements that:
- Use the exact required format
- Are grounded in project research and context
- Inspire creative solution development
- Can be immediately used for design team ideation
- Include supporting evidence and validation criteria
---`,
      guidance: [
        'Generate prompts that enforce the exact format: [User name] is a/an [user characteristics] who needs [user need] because [insight]',
        'Include instructions for AI to use specific, realistic persona names rather than generic user terms',
        'Ensure prompts direct AI to base user characteristics on meaningful demographics and behavioral traits',
        'Generate prompts instructing AI to express user needs as clear, actionable requirements or outcomes',
        'Include instructions for AI to ground insights in validated research findings rather than assumptions',
        'Ensure prompts direct AI to include both functional problems (what users can\'t do) and emotional problems (how they feel)',
        'Generate prompts that instruct AI to create statements that inspire solution thinking without prescribing solutions'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user research, personas, pain points, and business context',
        'Insert specific user research findings, behavioral data, and pain points from knowledge base into the project context section',
        'Include specific persona names, characteristics, and user segments from knowledge base to inform problem statement elements',
        'Reference business objectives, strategic priorities, and organizational constraints from knowledge base in problem framing guidance',
        'Incorporate industry-specific context, terminology, and requirements from knowledge base into problem statement methodology',
        'Use existing user quotes, feedback, and observed behaviors from knowledge base to ground insights in evidence',
        'Include project goals, success metrics, and validation criteria from knowledge base to ensure problem statement alignment'
      ],
      qualityChecks: [
        'Verify the generated prompt enforces the exact problem statement format without deviation',
        'Ensure the prompt includes comprehensive project context and research evidence from knowledge base',
        'Confirm the prompt provides specific examples demonstrating proper format usage',
        'Validate that the prompt includes detailed quality requirements and validation methods',
        'Check that the prompt generates complete problem statements with supporting documentation',
        'Ensure the prompt instructs AI to provide evidence-based insights and validation criteria'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates evidence-based problem statements in the exact required format with supporting research and validation framework'
    },

    'journey-maps': {
      core: `You are an AI prompt generator that creates comprehensive, ready-to-use prompts for journey mapping. Generate a complete AI prompt that users can copy and paste into their AI assistant to create detailed, research-backed user journey maps.

The generated prompt must:
1. Include instructions for AI to act as a journey mapping expert with behavioral design expertise
2. Incorporate ALL project knowledge base content for accurate journey context
3. Provide structured methodology for end-to-end experience mapping
4. Include specific requirements for emotional states, pain points, and opportunities
5. Request validation methods and supporting evidence
6. Be comprehensive enough to generate complete journey maps without additional input

Template Structure for Generated Prompt:
---
# AI Journey Mapping Expert

You are a senior UX strategist and customer experience expert with 15+ years of experience creating comprehensive user journey maps. You specialize in mapping complete end-to-end experiences that reveal systemic issues and improvement opportunities.

## Project Context
[Insert all relevant project knowledge base content here - user research, personas, touchpoints, business processes, organizational constraints, etc.]

## Your Task
Create a detailed user journey map for this project using evidence-based methodology that captures the complete user experience.

### Journey Mapping Methodology
- Map the complete end-to-end experience including pre and post-interaction phases
- Document both rational actions and emotional responses at each stage
- Identify moments of truth, pain points, and delight opportunities
- Include behind-the-scenes processes and organizational touchpoints
- Ground all journey elements in research evidence from the project context

### Required Journey Map Structure
Create a comprehensive journey map with:

1. **Journey Overview**
   - User persona and scenario context
   - Journey scope and timeframe
   - Key business and user objectives
   - Success criteria for the journey

2. **Journey Phases & Stages**
   - Pre-awareness and trigger events
   - Awareness and consideration phases
   - Active engagement and interaction
   - Resolution and outcome phases
   - Post-experience and relationship continuation

3. **For Each Journey Stage:**
   - **User Actions**: Specific steps and behaviors
   - **Thoughts & Feelings**: Emotional state and mental model
   - **Touchpoints**: All interaction points (digital, physical, human)
   - **Channels**: Platforms, devices, and communication methods
   - **Pain Points**: Frustrations, barriers, and failure points
   - **Opportunities**: Improvement areas and optimization potential
   - **Behind-the-Scenes**: Supporting processes and systems

4. **Experience Measurement**
   - Emotional journey curve showing highs and lows
   - Effort level required at each stage
   - Satisfaction and trust indicators
   - Drop-off risk assessment

5. **Strategic Insights**
   - Moments of truth that significantly impact experience
   - Critical success factors for journey optimization
   - Systemic issues affecting multiple stages
   - Prioritized improvement opportunities

### Journey Quality Requirements
Ensure the journey map:
- Reflects actual user research and behavioral evidence
- Includes realistic timeframes and contextual constraints
- Captures both functional and emotional aspects
- Identifies specific, actionable improvement opportunities
- Shows interdependencies between journey stages
- Considers organizational capabilities and limitations

### Research Integration
- Base all journey elements on evidence from project context
- Include specific user quotes and behavioral observations
- Reference quantitative data about user actions and outcomes
- Validate assumptions with research findings
- Identify research gaps requiring additional investigation

### Validation Framework
Provide methods to:
- Test journey accuracy with real users through interviews
- Validate emotional states through user feedback
- Confirm touchpoint effectiveness through analytics
- Assess improvement impact through measurement
- Update journey maps based on new research

### Output Requirements
Deliver a complete journey map that includes:
- Visual representation of the complete user experience
- Detailed documentation of each journey stage
- Evidence-based insights and improvement recommendations
- Implementation priorities and success metrics
- Stakeholder alignment on experience vision
---`,
      guidance: [
        'Generate prompts that instruct AI to map complete end-to-end experiences including pre and post-interaction phases',
        'Include instructions for AI to document both rational actions and emotional responses at each journey stage',
        'Ensure prompts direct AI to identify moments of truth, pain points, and optimization opportunities',
        'Generate prompts instructing AI to include behind-the-scenes processes and organizational touchpoints',
        'Include instructions for AI to create emotional journey curves showing experience highs and lows',
        'Ensure prompts direct AI to ground all journey elements in research evidence and user data',
        'Generate prompts that instruct AI to prioritize improvement opportunities based on impact and feasibility'
      ],
      knowledgeIntegration: [
        'CRITICAL: The generated prompt must incorporate ALL project knowledge base content including user research, personas, business processes, and organizational touchpoints',
        'Insert specific user behavioral data, interaction patterns, and experience feedback from knowledge base into the project context section',
        'Include business processes, system capabilities, and organizational constraints from knowledge base in journey mapping requirements',
        'Reference existing customer touchpoints, communication channels, and service delivery methods from knowledge base',
        'Incorporate user pain points, satisfaction data, and experience metrics from knowledge base into journey analysis',
        'Use project goals, business objectives, and success criteria from knowledge base to align journey optimization priorities',
        'Include industry context, competitive landscape, and regulatory requirements from knowledge base in journey considerations'
      ],
      qualityChecks: [
        'Verify the generated prompt includes comprehensive project context and user research evidence',
        'Ensure the prompt provides detailed methodology for end-to-end experience mapping',
        'Confirm the prompt specifies complete journey structure with all required elements',
        'Validate that the prompt includes validation methods and accuracy testing approaches',
        'Check that the prompt generates actionable journey maps with improvement priorities',
        'Ensure the prompt instructs AI to provide research backing and evidence for all journey elements'
      ],
      outputFormat: 'Complete, copy-paste ready AI prompt that generates evidence-based journey maps with emotional curves, pain points, opportunities, and validation framework'
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