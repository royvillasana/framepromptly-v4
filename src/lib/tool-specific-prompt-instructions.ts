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
    promptTemplate: baseInstructions.core,
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
      core: `# AI Affinity Mapping Expert

You are a senior UX researcher with 15+ years of experience in qualitative data analysis and affinity mapping. You excel at identifying patterns, themes, and insights from large amounts of user research data using systematic clustering and thematic analysis methods.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to fill in ALL bracketed placeholders below with specific, relevant information from the project knowledge base. Base all clusters, themes, and insights on the research data, user feedback, and patterns documented in the Project Context.

Create an affinity map that:
- Organizes research data into meaningful, hierarchical clusters
- Reveals patterns and themes that weren't obvious in raw data
- Progresses from specific observations to strategic insights
- Connects user needs with business opportunities

---

## Quality Standards:
- **Data-Driven**: Every cluster and theme must be supported by specific data points from the Project Context
- **Hierarchical Structure**: Progress from Level 1 (specific observations) through Level 3 (strategic insights)
- **Coherent Themes**: Each cluster should have a clear, unified theme that makes logical sense
- **Actionable Insights**: Level 3 insights should directly inform product and design decisions

---

## Output Format:
Create a complete affinity map with three hierarchical levels:
- **Level 1**: Initial clusters of related data points from research
- **Level 2**: Higher-order themes that group related clusters
- **Level 3**: Strategic insights and actionable recommendations

---

# AFFINITY MAP

## LEVEL 1: INITIAL CLUSTERS

### Cluster 1: [Write cluster name based on grouping patterns in the Project Context]
- [Write data point 1 from research data in the Project Context]
- [Write data point 2 from research data in the Project Context]
- [Write data point 3 from research data in the Project Context]
- [Write data point 4 from research data in the Project Context]

### Cluster 2: [Write cluster name based on patterns in the Project Context]
- [Write data point 1 from the Project Context]
- [Write data point 2 from the Project Context]
- [Write data point 3 from the Project Context]
- [Write data point 4 from the Project Context]

[Continue with additional clusters as needed based on the research data in the Project Context]

---

## LEVEL 2: THEMES (Higher-Level Patterns)

### Theme 1: [Write theme name based on cluster patterns from the Project Context]
- **Combines clusters:** [List which clusters this combines based on the analysis above]
- **Key insight:** [Write what this pattern reveals about user needs, behaviors, or pain points from the Project Context]
- **Evidence:** [Cite specific data points from the Project Context supporting this theme]

### Theme 2: [Write theme name based on patterns in the Project Context]
- **Combines clusters:** [List which clusters based on analysis]
- **Key insight:** [Write what this reveals based on the Project Context]
- **Evidence:** [Cite supporting data from the Project Context]

### Theme 3: [Write theme name based on patterns in the Project Context]
- **Combines clusters:** [List which clusters]
- **Key insight:** [Write what this reveals about users from the Project Context]
- **Evidence:** [Cite supporting evidence from the Project Context]

---

## LEVEL 3: META-THEMES (Strategic Insights)

### Meta-Theme 1: [Write overarching theme name synthesizing themes from the Project Context]
- **Pattern:** [Describe the high-level pattern across multiple themes based on the Project Context data]
- **Business Impact:** [Describe implications for the business/product based on business goals in the Project Context]
- **Recommendation:** [Write specific actionable recommendation aligned with objectives in the Project Context]

### Meta-Theme 2: [Write overarching theme name based on the Project Context patterns]
- **Pattern:** [Describe the high-level pattern from the Project Context]
- **Business Impact:** [Describe implications based on the Project Context]
- **Recommendation:** [Write actionable recommendation based on the Project Context]

---

## KEY INSIGHTS:
1. [Write key insight 1 based on patterns and themes identified from the Project Context]
2. [Write key insight 2 based on user behaviors and needs from the Project Context]
3. [Write key insight 3 based on opportunities and challenges from the Project Context]`,

      guidance: ['Multi-level clustering', 'Pattern identification', 'Evidence-based insights', 'Strategic recommendations'],
      knowledgeIntegration: ['Insert ALL research data from knowledge base', 'Include business objectives', 'Reference user segments'],
      qualityChecks: ['Hierarchical themes', 'Evidence for each theme', 'Contradictions addressed', 'Actionable insights'],
      outputFormat: 'Complete affinity map with themes, sub-themes, and strategic insights'
    },

    'personas': {
      core: `# AI User Persona Expert

You are a senior UX researcher with 15+ years of experience in user research and persona development. You excel at synthesizing qualitative and quantitative research data into actionable user personas that drive product strategy and design decisions.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to create evidence-based personas. Fill in ALL bracketed placeholders with specific information from the research data and user insights in the Project Context. Each persona should represent a distinct user segment with unique goals, behaviors, and pain points identified in the research.

Create personas that:
- Are grounded in real research data and user insights
- Represent distinct and meaningful user segments
- Include specific, actionable details that inform design decisions
- Balance demographic information with behavioral and motivational insights

---

## Quality Standards:
- **Evidence-Based**: Every persona element must be backed by specific research findings from the Project Context
- **Distinct Segments**: Each persona should represent a meaningfully different user type with unique characteristics
- **Actionable**: Include enough detail to guide design decisions and feature prioritization
- **Realistic**: Use authentic details that reflect real users, not stereotypes

---

## Output Format:
Create 3 complete user personas following the structure below. Each persona should be comprehensive, research-backed, and immediately useful for product and design teams.

---

## PERSONA 1

**Name:** [Create a realistic full name]
**Age:** [Specific age]
**Occupation:** [Specific job title]
**Location:** [Specific city, state/country]
**Quote:** "[Write a one-sentence quote that captures their essence]"

**Goals:**
- [Write specific goal 1 based on research]
- [Write specific goal 2 based on research]
- [Write specific goal 3 based on research]

**Pain Points:**
- [Write specific pain point 1 from research]
- [Write specific pain point 2 from research]
- [Write specific pain point 3 from research]

**Behaviors:**
- [Describe specific behavior 1]
- [Describe specific behavior 2]
- [Describe specific behavior 3]

**Motivations:**
- [Describe what drives them]
- [Describe what they value most]
- [Describe what success looks like to them]

**Tech Comfort:** [State: Low, Medium, or High]

**Background:** [Write 2-3 sentences about their life context, work environment, and relevant circumstances based on the research data]

---

## PERSONA 2

[Repeat the same structure for persona 2]

---

## PERSONA 3

[Repeat the same structure for persona 3]`,

      guidance: ['Triangulation method', 'Jobs-to-be-Done framework', 'Research evidence backing', 'Validation hypotheses'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include business context and goals', 'Reference existing user segments'],
      qualityChecks: ['Evidence-based profiles', 'Testable hypotheses included', 'Comprehensive and actionable'],
      outputFormat: '2-4 complete user personas with research backing and validation criteria'
    },

    'empathy-maps': {
      core: `# AI Empathy Mapping Expert

You are a senior UX researcher with 15+ years of experience in user empathy and behavioral analysis. You excel at synthesizing user research into empathy maps that capture the full spectrum of user thoughts, feelings, actions, and environmental factors.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to fill in ALL bracketed placeholders below with specific, relevant information from the project knowledge base. Base all empathy map quadrants on user research data, behavioral observations, and direct quotes documented in the Project Context.

Create an empathy map that:
- Captures authentic user thoughts, feelings, and behaviors from research
- Reveals emotional drivers and pain points
- Distinguishes between what users say versus what they do
- Connects user experience to product opportunities

---

## Quality Standards:
- **Research-Backed**: Every entry must come from actual user research data in the Project Context
- **Authentic Voice**: Use direct quotes and specific observations, not generic statements
- **Balanced Coverage**: All six quadrants (Thinks, Feels, Says, Does, Sees, Hears) should be thoroughly populated
- **Insight-Driven**: Reveal non-obvious insights about user motivations and pain points

---

## Output Format:
Create a complete empathy map with all six quadrants filled with specific, research-based entries. Each quadrant should have 3-5 detailed entries that provide deep understanding of the user's experience.

---

# EMPATHY MAP: [Write the persona name based on the target user in the Project Context]

## THINKS:
- [Write what the user is thinking based on goals, concerns, and questions mentioned in the Project Context]
- [Write another thought based on research data in the Project Context]
- [Write another thought based on user insights in the Project Context]

## FEELS:
- [Describe their emotions (frustrated, excited, anxious, confident, etc.) based on user sentiment in the Project Context]
- [Describe another emotional state from research in the Project Context]
- [Describe another emotional state from user feedback in the Project Context]

## SAYS:
- "[Write an actual quote from user research in the Project Context]"
- "[Write another actual quote from user interviews or feedback in the Project Context]"
- "[Write another actual quote from users documented in the Project Context]"

## DOES:
- [Describe an observable action or behavior from research in the Project Context]
- [Describe another observable action or behavior documented in the Project Context]
- [Describe another user behavior pattern from the Project Context]

## SEES:
- [Describe what they encounter in their environment based on context in the Project Context]
- [Describe another thing they see - competitors, influencers, etc. - mentioned in the Project Context]
- [Describe another environmental factor from the Project Context]

## HEARS:
- [Describe what others tell them or opinions they hear based on the Project Context]
- [Describe another external influence they hear documented in the Project Context]
- [Describe another piece of feedback or advice they hear from the Project Context]

## PAINS:
- [Write a specific frustration or obstacle they face based on pain points in the Project Context]
- [Write another pain point from research in the Project Context]
- [Write another pain point from user complaints in the Project Context]

## GAINS:
- [Write a desired outcome or benefit they seek based on goals in the Project Context]
- [Write another gain they want to achieve based on needs in the Project Context]
- [Write another gain they want to achieve based on objectives in the Project Context]`,

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
      core: `# AI Wireframing Expert

You are a senior UX designer with 15+ years of experience in information architecture and interface design. You excel at creating low-fidelity wireframes that clearly communicate layout, hierarchy, and user flows while focusing on functionality over visual design.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to fill in ALL bracketed placeholders below with specific, relevant information from the project knowledge base. Base all wireframe designs on user workflows, business requirements, and technical constraints documented in the Project Context.

Create wireframes that:
- Prioritize user tasks and workflows identified in research
- Establish clear information hierarchy and navigation patterns
- Communicate functionality and interaction patterns effectively
- Balance user needs with business requirements and technical constraints

---

## Quality Standards:
- **User-Centered**: Design reflects actual user workflows and mental models from the Project Context
- **Clear Hierarchy**: Visual hierarchy clearly indicates importance and relationships between elements
- **Annotated**: Include notes explaining design decisions and interaction patterns
- **Complete Coverage**: Address all key user flows and critical screens identified in requirements

---

## Output Format:
Create low-fidelity wireframe specifications for key screens, including:
- Screen layout with element placement and sizing
- Content hierarchy and grouping
- Navigation and interaction patterns
- Annotations explaining design rationale
- User flow connections between screens

---

## WIREFRAME 1: [Write screen name based on key user workflows in the Project Context - e.g., "Home Screen"]

**Layout Description:**
[Describe the layout structure based on user needs and content hierarchy in the Project Context - e.g., "Header with logo and navigation at top, hero banner below header, 3-column grid of featured items in main content area, sidebar with filters on right, footer at bottom"]

**Key Elements:**
1. [Element name based on features in the Project Context]: [Description and function based on user needs - e.g., "Search bar: Allows users to search products by keyword"]
2. [Element name from the Project Context]: [Description and function based on requirements in the Project Context]
3. [Element name from user workflows in the Project Context]: [Description and function]
4. [Element name from the Project Context]: [Description and function]
5. [Element name based on business goals in the Project Context]: [Description and function]

**User Flow:**
- Arrives from: [Where user comes from based on user journeys in the Project Context]
- Primary goal: [What user wants to accomplish based on goals and tasks in the Project Context]
- Next step: [Where user goes next based on workflows in the Project Context]

**Annotations:**
- [Design decision and rationale based on user research or business requirements in the Project Context - e.g., "Placed CTA button above fold to increase conversions based on heatmap data"]
- [Another design decision and rationale based on insights from the Project Context]

---

## WIREFRAME 2: [Write screen name based on user workflows in the Project Context]

**Layout Description:**
[Describe the layout structure for this screen based on content and functionality in the Project Context]

**Key Elements:**
1. [Element name from the Project Context]: [Description and function based on user needs in the Project Context]
2. [Element name]: [Description and function based on requirements]
3. [Element name]: [Description and function]
4. [Element name]: [Description and function]
5. [Element name]: [Description and function]

**User Flow:**
- Arrives from: [Where user comes from based on the Project Context]
- Primary goal: [What user wants to accomplish based on the Project Context]
- Next step: [Where user goes next based on the Project Context]

**Annotations:**
- [Design decision and rationale based on the Project Context]
- [Another design decision and rationale based on the Project Context]

---

## WIREFRAME 3: [Write screen name based on key screens in the Project Context]

[Repeat same structure using information from the Project Context]

---

[Continue for all key screens identified in the Project Context]`,

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
      core: `# AI Problem Statement Expert

You are a senior UX strategist with 15+ years of experience in problem framing and design thinking. You excel at distilling complex user research into clear, actionable problem statements that drive focused solution development.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to create evidence-based problem statements. Each statement must follow the exact format below and be grounded in specific user research data and insights from the Project Context.

Create problem statements that:
- Focus on user needs rather than solutions
- Are specific enough to guide design but broad enough to allow innovation
- Are backed by research evidence and user insights
- Connect user needs to underlying motivations and constraints

---

## Quality Standards:
- **Format Compliance**: Each statement must follow the exact format: "[User name] is a/an [user characteristics] who needs [user need] because [insight]"
- **Evidence-Based**: Every element must be supported by specific research findings from the Project Context
- **User-Centered**: Focus on user needs, not business requirements or technical solutions
- **Insight-Driven**: The "because" clause should reveal a deeper insight, not just restate the need

---

## Output Format:
Create 3-5 problem statements using the exact format specified. Each statement should:
- Use a specific persona name from the Project Context
- Include relevant user characteristics
- Articulate a clear, specific need
- Provide a research-backed insight that explains why the need exists

---

## FORMAT: [User name] is a/an [user characteristics] who needs [user need] because [insight].

### PROBLEM STATEMENT 1:
[Write the complete problem statement in the exact format above, using a specific persona name and research-backed insight]

### PROBLEM STATEMENT 2:
[Write the complete problem statement in the exact format above, using a different persona if applicable]

### PROBLEM STATEMENT 3:
[Write the complete problem statement in the exact format above]

### PROBLEM STATEMENT 4: (if applicable)
[Write the complete problem statement in the exact format above]

### PROBLEM STATEMENT 5: (if applicable)
[Write the complete problem statement in the exact format above]`,

      guidance: ['Exact format enforcement', 'Specific persona names', 'Evidence-based insights', 'Supporting documentation'],
      knowledgeIntegration: ['Insert ALL user research from knowledge base', 'Include persona names and characteristics', 'Reference business objectives'],
      qualityChecks: ['Exact format followed', 'Research-backed', 'Supporting evidence included'],
      outputFormat: '3-5 problem statements with evidence and validation'
    },

    'journey-maps': {
      core: `# AI Journey Mapping Expert

You are a senior UX researcher with 15+ years of experience in customer experience mapping and service design. You excel at creating comprehensive journey maps that reveal the full user experience across all touchpoints, highlighting pain points, emotional highs and lows, and opportunities for improvement.

## Project Context:
${'{knowledgeBase}'}

---

## Instructions:
Use the Project Context above to fill in ALL bracketed placeholders below with specific, relevant information from the project knowledge base. Base all journey stages, actions, emotions, and touchpoints on user research data, behavioral patterns, and workflows documented in the Project Context.

Create a journey map that:
- Captures the complete user experience from start to finish
- Reveals emotional highs, lows, and transitions throughout the journey
- Identifies all key touchpoints and channels
- Highlights pain points and opportunities for improvement

---

## Quality Standards:
- **Comprehensive**: Cover the entire user journey from initial awareness through post-use
- **Emotionally Accurate**: Emotional states should reflect actual user sentiment from research
- **Touchpoint Complete**: Include all channels and touchpoints where users interact with the product/service
- **Opportunity-Focused**: Clearly identify specific pain points and improvement opportunities

---

## Output Format:
Create a complete user journey map with the following for each stage:
- Stage name and description
- User actions and behaviors
- Emotional state (with visualization indicators)
- Touchpoints and channels
- Pain points and frustrations
- Opportunities for improvement

---

# USER JOURNEY MAP: [Write persona name based on target users in the Project Context]

## STAGE 1: [Write stage name based on user workflows in the Project Context - e.g., "Discovery"]

**Actions:** [Describe what the user does in this stage based on behaviors in the Project Context]
**Thoughts:** [Describe what they're thinking based on goals and concerns in the Project Context]
**Feelings:** 😊/😐/😞 [Describe their emotional state (satisfied, neutral, frustrated) based on sentiment in the Project Context]
**Touchpoints:** [List where/how they interact (website, app, phone, store, etc.) based on channels in the Project Context]
**Pain Points:** [Describe problems they encounter based on frustrations documented in the Project Context]
**Opportunities:** [Describe areas for improvement based on needs and gaps in the Project Context]

## STAGE 2: [Write stage name based on user workflows in the Project Context]

**Actions:** [Describe what the user does in this stage based on the Project Context]
**Thoughts:** [Describe what they're thinking based on the Project Context]
**Feelings:** 😊/😐/😞 [Describe their emotional state based on the Project Context]
**Touchpoints:** [List where/how they interact based on the Project Context]
**Pain Points:** [Describe problems they encounter from the Project Context]
**Opportunities:** [Describe areas for improvement based on the Project Context]

## STAGE 3: [Write stage name based on user workflows in the Project Context]

**Actions:** [Describe what the user does in this stage based on the Project Context]
**Thoughts:** [Describe what they're thinking based on the Project Context]
**Feelings:** 😊/😐/😞 [Describe their emotional state based on the Project Context]
**Touchpoints:** [List where/how they interact based on the Project Context]
**Pain Points:** [Describe problems they encounter from the Project Context]
**Opportunities:** [Describe areas for improvement based on the Project Context]

## STAGE 4: [Write stage name if applicable based on the Project Context]

**Actions:** [Describe what the user does in this stage based on the Project Context]
**Thoughts:** [Describe what they're thinking based on the Project Context]
**Feelings:** 😊/😐/😞 [Describe their emotional state based on the Project Context]
**Touchpoints:** [List where/how they interact based on the Project Context]
**Pain Points:** [Describe problems they encounter from the Project Context]
**Opportunities:** [Describe areas for improvement based on the Project Context]

---

## EMOTIONAL JOURNEY CURVE:
[Describe how emotions change across stages based on sentiment and satisfaction data in the Project Context - starts frustrated, becomes excited, drops to anxious, ends satisfied, etc.]

## KEY INSIGHTS:
1. [Write key insight based on journey analysis and patterns in the Project Context]
2. [Write another key insight based on pain points and opportunities from the Project Context]
3. [Write another key insight based on user behaviors and needs in the Project Context]`,

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
      core: `You are a Jobs-to-Be-Done expert. Create 10-15 job statements for ${'{projectName}'}. ${'{projectDescription}'}

## Project Context:
${'{knowledgeBase}'}

---

## FORMAT: "When I [situation], I want to [motivation], so I can [expected outcome]"

### FUNCTIONAL JOBS (tasks to complete):

1. [Write functional job statement in exact format]
2. [Write functional job statement in exact format]
3. [Write functional job statement in exact format]
4. [Write functional job statement in exact format]
5. [Write functional job statement in exact format]

### EMOTIONAL JOBS (feelings to achieve):

1. [Write emotional job statement in exact format]
2. [Write emotional job statement in exact format]
3. [Write emotional job statement in exact format]
4. [Write emotional job statement in exact format]

### SOCIAL JOBS (how they want to be perceived):

1. [Write social job statement in exact format]
2. [Write social job statement in exact format]
3. [Write social job statement in exact format]

---

## OPPORTUNITY SCORES:

For each job above, add:
- **Importance** (1-5)
- **Current Satisfaction** (1-5)
- **Opportunity Score** = Importance + (Importance - Satisfaction)

[List all jobs with their scores]`,

      guidance: ['Three dimensions', 'Exact format', 'Solution-independent', 'Opportunity scoring'],
      knowledgeIntegration: ['Insert customer research from knowledge base', 'Include behavioral data and contexts'],
      qualityChecks: ['Format followed', 'All three dimensions', 'Solution-independent', 'Opportunity scores calculated'],
      outputFormat: '10-15 job statements across all dimensions with opportunity scores'
    },

    'outcome-statements': {
      core: `You are a Jobs-to-Be-Done expert. Create 20-30 outcome statements for ${'{projectName}'}. ${'{projectDescription}'}

## Project Context:
${'{knowledgeBase}'}

---

## FORMAT: [Direction] + [unit of measure] + [object of control] + [contextual clarifier]

**EXAMPLES:**
- "Minimize the time it takes to set up a new account for first-time use"
- "Increase the number of payment options available during checkout"
- "Minimize the likelihood that sensitive data is exposed during transmission"

---

### EFFICIENCY OUTCOMES (speed and effort):

1. [Write efficiency outcome statement in exact format - e.g., "Minimize the time it takes to..."]
2. [Write efficiency outcome statement in exact format - e.g., "Reduce the effort required to..."]
3. [Write efficiency outcome statement in exact format - e.g., "Decrease the number of steps to..."]
4. [Write efficiency outcome statement in exact format]
5. [Write efficiency outcome statement in exact format]
6. [Write efficiency outcome statement in exact format]
7. [Write efficiency outcome statement in exact format]
8. [Write efficiency outcome statement in exact format]
9. [Write efficiency outcome statement in exact format]
10. [Write efficiency outcome statement in exact format]

### EFFECTIVENESS OUTCOMES (quality and completeness):

1. [Write effectiveness outcome statement in exact format - e.g., "Increase the accuracy of..."]
2. [Write effectiveness outcome statement in exact format - e.g., "Maximize the number of..."]
3. [Write effectiveness outcome statement in exact format - e.g., "Ensure the completeness of..."]
4. [Write effectiveness outcome statement in exact format]
5. [Write effectiveness outcome statement in exact format]
6. [Write effectiveness outcome statement in exact format]
7. [Write effectiveness outcome statement in exact format]
8. [Write effectiveness outcome statement in exact format]
9. [Write effectiveness outcome statement in exact format]
10. [Write effectiveness outcome statement in exact format]

---

## OPPORTUNITY SCORES:

For each outcome statement above, add:
- **Importance** (1-5): How important is this outcome to the customer?
- **Current Satisfaction** (1-5): How satisfied are customers currently with this outcome?
- **Opportunity Score** = Importance + (Importance - Satisfaction)

[List all 20-30 outcome statements with their scores. Focus on outcomes with high opportunity scores (10 or above)]`,

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