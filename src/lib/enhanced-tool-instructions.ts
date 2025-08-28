/**
 * @fileoverview Enhanced UX tool instructions based on 2025 best practices research
 * These instructions are designed to generate the most effective, actionable prompts for each UX tool
 */

import { generateToolSpecificInstructions, ToolPromptContext } from './tool-specific-prompt-instructions';

export interface EnhancedInstructionSet {
  core: string[];
  methodology: string[];
  industrySpecific: Record<string, string[]>;
  qualityAssurance: string[];
  aiOptimization: string[];
  knowledgeIntegration: string[];
}

/**
 * Enhanced instructions for research tools
 */
export const RESEARCH_TOOL_INSTRUCTIONS = {
  'user-interviews': {
    core: [
      'Structure interviews using the funnel technique: begin with broad open-ended questions, progressively narrow to specific details',
      'Employ the "5 Whys" technique to uncover root motivations and underlying needs beyond surface-level responses',
      'Design questions that reveal mental models: ask users to explain processes, categorize information, or describe ideal solutions',
      'Include emotional archaeology questions that explore feelings, frustrations, and satisfying moments in current experiences',
      'Build in validation opportunities by asking users to prioritize, rank, or choose between options to verify stated preferences',
      'Create task-based scenarios that prompt users to demonstrate behaviors rather than just describe them',
      'Plan for unexpected insights by including exploratory questions that can lead conversations in new directions'
    ],
    methodology: [
      'Start with 5-7 minutes of warm-up questions to establish rapport and help participants feel comfortable sharing',
      'Use active listening techniques: acknowledge responses, ask clarifying questions, and reflect back what you hear',
      'Employ the "think-aloud" protocol for task-based portions where users verbalize their thought process',
      'Practice strategic silence - allow 3-5 seconds after responses to encourage deeper sharing',
      'Use transitional phrases to guide conversation flow: "Tell me more about...", "Help me understand...", "Walk me through..."',
      'Implement the "critical incident technique" by asking about specific memorable experiences rather than general behaviors',
      'End with forward-looking questions that explore user aspirations and desired future states'
    ],
    industrySpecific: {
      fintech: [
        'Address trust and security concerns explicitly - users may be hesitant to share financial frustrations',
        'Include questions about financial decision-making processes and risk tolerance levels',
        'Explore regulatory compliance understanding and how it affects user behavior',
        'Ask about cross-device usage patterns for financial tasks and security preferences'
      ],
      healthcare: [
        'Ensure HIPAA compliance in all questioning and data collection procedures',
        'Include questions about caregiver relationships and decision-making roles',
        'Address varying health literacy levels with clear, accessible language',
        'Explore emotional aspects of healthcare experiences with sensitivity'
      ],
      ecommerce: [
        'Include questions about shopping behaviors across different channels and devices',
        'Explore purchase decision-making factors and price sensitivity patterns',
        'Ask about post-purchase experiences including returns, support, and repeat buying'
      ],
      saas: [
        'Focus on workflow integration and team collaboration patterns',
        'Explore onboarding experiences and feature adoption challenges',
        'Ask about integration needs with existing tools and systems'
      ],
      education: [
        'Consider diverse learning styles and accessibility needs',
        'Explore motivation factors and engagement patterns',
        'Ask about collaborative learning and peer interaction preferences'
      ]
    },
    qualityAssurance: [
      'Pilot test the interview guide with 1-2 practice sessions before conducting research',
      'Prepare follow-up probes for each main question to ensure comprehensive coverage',
      'Include validation questions that cross-check responses for consistency',
      'Plan for data saturation by continuing interviews until no new themes emerge'
    ],
    aiOptimization: [
      'Generate questions that encourage storytelling and narrative responses rich in contextual detail',
      'Create scenarios that prompt users to reveal implicit assumptions and mental models',
      'Include questions that explore emotional responses and satisfaction triggers',
      'Design questions that uncover workflow integration needs and organizational context'
    ],
    knowledgeIntegration: [
      'CRITICAL: Before generating any AI prompt, the system must first analyze and incorporate ALL available project knowledge base content to ensure contextually relevant and informed prompts',
      'Use project knowledge to customize interview questions to the specific domain, user types, and business context documented in the knowledge base',
      'Reference specific user insights, pain points, and behaviors mentioned in the project knowledge to create targeted and relevant interview questions',
      'Incorporate industry-specific terminology, processes, and constraints identified in the project knowledge base into the interview framework',
      'Leverage any existing user research, personas, or journey maps in the knowledge base to inform interview focus areas and avoid redundant questioning',
      'Adapt interview methodology based on organizational culture, team structure, and project constraints documented in the knowledge base',
      'Use project goals, success metrics, and business objectives from the knowledge base to align interview objectives with strategic outcomes'
    ]
  },

  'personas': {
    core: [
      'Build personas using the triangulation method: combine quantitative data, qualitative insights, and behavioral analytics',
      'Focus on goals hierarchy - distinguish between primary goals (essential needs) and secondary goals (nice-to-have wants)',
      'Include both functional jobs (tasks to accomplish) and emotional jobs (feelings to achieve) in persona development',
      'Develop behavioral patterns based on observed actions rather than stated preferences',
      'Create empathy maps that capture what personas think, feel, see, say, hear, and do in their environment',
      'Include contextual factors: environmental constraints, social influences, and situational pressures',
      'Validate personas against multiple data sources and update regularly based on new research findings'
    ],
    methodology: [
      'Use cluster analysis to identify meaningful user segments from research data',
      'Apply the "day in the life" narrative technique to understand full user context',
      'Include direct user quotes that capture authentic voice and language patterns',
      'Create persona scenarios that test different use cases and edge conditions',
      'Develop persona journey maps that show how needs and behaviors change over time',
      'Use photo selection that represents diversity and avoids stereotypical representations',
      'Include skill levels and knowledge areas relevant to product usage'
    ],
    industrySpecific: {
      fintech: [
        'Include financial literacy levels, investment experience, and risk tolerance profiles',
        'Address regulatory compliance awareness and security behavior patterns',
        'Include income sources, financial goals, and debt management approaches'
      ],
      healthcare: [
        'Include health literacy levels, caregiver relationships, and medical condition impacts',
        'Address accessibility needs and assistive technology usage patterns',
        'Include healthcare team relationships and decision-making authority levels'
      ],
      ecommerce: [
        'Include shopping preferences, brand loyalty patterns, and price sensitivity levels',
        'Address multichannel shopping behaviors and device usage patterns',
        'Include social influence factors and review/recommendation consumption habits'
      ],
      saas: [
        'Include technical proficiency levels and tool adoption patterns',
        'Address team roles, decision-making authority, and budget influence',
        'Include integration requirements and workflow customization needs'
      ],
      education: [
        'Include learning preferences, technology comfort levels, and attention patterns',
        'Address institutional constraints and administrative requirements',
        'Include collaboration preferences and peer interaction styles'
      ]
    },
    qualityAssurance: [
      'Validate personas with team members who interact with actual users regularly',
      'Test persona accuracy by having team members predict persona responses to scenarios',
      'Update personas quarterly based on new research data and behavioral analytics',
      'Avoid over-specification - include only details that impact design decisions'
    ],
    aiOptimization: [
      'Generate personas with rich contextual detail that enables accurate mental model simulation',
      'Include behavioral triggers and decision-making criteria that guide design choices',
      'Create personality dimensions that affect product interaction preferences',
      'Develop scenarios that test persona validity across different use cases and contexts'
    ],
    knowledgeIntegration: [
      'CRITICAL: Before generating persona prompts, analyze ALL project knowledge base content to ensure personas reflect documented user insights and behavioral patterns',
      'Use existing user research data from the knowledge base to ground persona characteristics in validated user behaviors and needs',
      'Reference specific user quotes, feedback, and observed behaviors documented in the project knowledge to create authentic persona details',
      'Incorporate domain-specific context, industry constraints, and organizational factors from the knowledge base into persona development',
      'Leverage any existing customer segments, user types, or market research in the knowledge base to inform persona segmentation',
      'Align persona goals and pain points with business objectives and project constraints documented in the knowledge base',
      'Use project-specific terminology, processes, and environmental factors from knowledge base to create contextually accurate personas'
    ]
  },

  'surveys': {
    core: [
      'Design questions using established psychometric principles and validated question formats',
      'Balance closed-ended questions for quantitative analysis with open-ended questions for qualitative insights',
      'Use appropriate response scales (5-point Likert, semantic differential, ranking) based on measurement objectives',
      'Implement skip logic and branching to reduce survey fatigue and improve response quality',
      'Structure surveys with logical flow: general to specific, easy to difficult, engaging opening',
      'Include attention check questions to validate response quality and identify careless responding',
      'Plan for appropriate sample sizes based on population size and desired confidence levels'
    ],
    methodology: [
      'Pre-test surveys with 5-10 representative users to identify confusion and technical issues',
      'Use randomization for question order when possible to reduce order bias effects',
      'Implement mobile-first survey design with progress indicators and save-and-continue functionality',
      'Apply clear, jargon-free language appropriate to respondent education and literacy levels',
      'Include demographic questions at the end to avoid priming effects on main survey content',
      'Use multiple recruitment channels to reduce selection bias and improve representativeness',
      'Plan follow-up strategies for incomplete responses while respecting user privacy preferences'
    ],
    industrySpecific: {
      fintech: [
        'Include questions about financial stress and security concerns that may affect honest responding',
        'Address regulatory compliance requirements for financial data collection',
        'Use appropriate financial terminology while maintaining accessibility for diverse literacy levels'
      ],
      healthcare: [
        'Ensure HIPAA compliance and obtain appropriate consent for health-related questions',
        'Use validated health survey instruments where appropriate for benchmarking',
        'Address potential cultural sensitivity around health topics and privacy concerns'
      ],
      ecommerce: [
        'Include purchase intent and brand loyalty questions for business intelligence',
        'Address seasonal and promotional influences on shopping behavior and preferences',
        'Use appropriate price sensitivity measurement techniques like Van Westendorp pricing'
      ],
      saas: [
        'Include questions about organizational decision-making processes and approval workflows',
        'Address technical requirements and integration needs for software evaluation',
        'Use appropriate business terminology while remaining accessible to different role levels'
      ],
      education: [
        'Consider institutional approval processes and parental consent for minor participants',
        'Address diverse learning styles and accessibility needs in question design',
        'Include questions about institutional constraints and administrative requirements'
      ]
    },
    qualityAssurance: [
      'Calculate appropriate sample sizes using power analysis for key comparisons and correlations',
      'Use validated survey instruments where available for benchmarking and reliability',
      'Implement data quality checks including response time analysis and consistency checking',
      'Plan for non-response bias analysis and implement appropriate weighting if needed'
    ],
    aiOptimization: [
      'Design questions that capture nuanced user preferences and behavioral drivers',
      'Include questions that reveal underlying motivations and decision-making processes',
      'Structure surveys to identify user segments and personas through statistical clustering',
      'Plan for integration with other data sources for comprehensive user understanding'
    ],
    knowledgeIntegration: [
      'CRITICAL: Before creating survey prompts, thoroughly analyze project knowledge base to inform question design and target respondent profiling',
      'Use existing user insights and pain points from the knowledge base to design survey questions that validate and expand on known user behaviors',
      'Reference specific user segments, demographics, and behavioral patterns documented in the knowledge base to create targeted survey questions',
      'Incorporate industry-specific language, processes, and context from the knowledge base to ensure survey relevance and comprehension',
      'Leverage any existing research findings or hypotheses in the knowledge base to design questions that test and validate assumptions',
      'Align survey objectives with project goals, success metrics, and business outcomes documented in the knowledge base',
      'Use project-specific constraints, resources, and timelines from knowledge base to optimize survey scope and methodology'
    ]
  },

  'usability-tests': {
    core: [
      'Define measurable success criteria that align with business objectives and user goals',
      'Create realistic task scenarios that reflect actual user workflows and contexts',
      'Design testing protocols that balance structure with flexibility for emergent insights',
      'Include both quantitative metrics (completion rates, time on task) and qualitative insights (satisfaction, frustration)',
      'Plan for testing edge cases and error recovery scenarios, not just happy path interactions',
      'Design inclusive testing protocols that accommodate different abilities and assistive technologies',
      'Plan iterative testing cycles that validate improvements and track progress over time'
    ],
    methodology: [
      'Use systematic sampling to ensure participant diversity across key user segments',
      'Conduct pilot testing sessions to refine protocols and identify potential issues',
      'Implement think-aloud protocols to understand user mental models during task completion',
      'Use behavioral observation alongside user verbal feedback to identify unconscious behaviors',
      'Plan for both moderated and unmoderated testing depending on research objectives',
      'Document environmental factors and contextual conditions that might affect user performance',
      'Create standardized data collection procedures that enable reliable cross-session comparison'
    ],
    industrySpecific: {
      fintech: [
        'Test security features and trust indicators for effectiveness and user comprehension',
        'Include testing scenarios that reflect actual financial decision-making complexity',
        'Test regulatory compliance interfaces for usability and user understanding'
      ],
      healthcare: [
        'Include accessibility testing with assistive technology users and diverse ability levels',
        'Test clinical accuracy and safety of health information presentation',
        'Include caregiver scenarios and family decision-making contexts in testing protocols'
      ],
      ecommerce: [
        'Test conversion funnels and purchase completion flows under realistic conditions',
        'Include testing across devices and contexts where actual shopping occurs',
        'Test product discovery and comparison features for effectiveness and user satisfaction'
      ],
      saas: [
        'Test complex workflows and multi-user collaboration scenarios',
        'Include testing of onboarding flows and feature discovery patterns',
        'Test integration scenarios with other tools and systems users commonly employ'
      ],
      education: [
        'Test with diverse learning styles and accessibility needs represented',
        'Include testing of collaborative features and peer interaction patterns',
        'Test across different devices and contexts where learning occurs'
      ]
    },
    qualityAssurance: [
      'Use appropriate sample sizes based on testing objectives and statistical requirements',
      'Validate testing scenarios with actual users before conducting formal usability sessions',
      'Document testing conditions and environmental factors that might affect results',
      'Plan follow-up testing to validate that identified issues have been successfully resolved'
    ],
    aiOptimization: [
      'Generate testing scenarios that reveal underlying usability issues and user mental model misalignments',
      'Create evaluation frameworks that capture both objective performance metrics and subjective user experience quality',
      'Design testing protocols that identify improvement opportunities with high user impact and feasible implementation',
      'Include predictive testing elements that anticipate future user needs and usage contexts'
    ],
    knowledgeIntegration: [
      'CRITICAL: Before designing usability test prompts, comprehensively review project knowledge base to create realistic testing scenarios and success criteria',
      'Use documented user workflows, pain points, and behavioral patterns from the knowledge base to design authentic testing tasks and scenarios',
      'Reference specific product features, functionality, and user interactions documented in the knowledge base to create targeted testing protocols',
      'Incorporate user goals, success metrics, and expected outcomes from the knowledge base into testing success criteria and evaluation frameworks',
      'Leverage any existing usability issues, user feedback, or performance data in the knowledge base to inform testing focus areas',
      'Align testing objectives with business goals, product requirements, and project constraints documented in the knowledge base',
      'Use project-specific user segments, personas, and usage contexts from knowledge base to ensure representative participant recruitment'
    ]
  },

  'observations': {
    core: [
      'Conduct ethnographic field studies in users\' natural environments to capture authentic behaviors',
      'Use systematic observation protocols including direct observation and participant shadowing techniques',
      'Document contextual factors including environmental constraints, social influences, and physical settings',
      'Capture both explicit behaviors (what users do) and implicit behaviors (habitual and unconscious actions)',
      'Record interruptions, workarounds, and superstitious behaviors that users have developed over time',
      'Use multiple documentation methods: field notes, photography, sketches, video recordings, and artifact analysis',
      'Plan for extended observation periods (days to weeks) to identify behavior patterns over time'
    ],
    methodology: [
      'Apply the "fly on the wall" approach with minimal intervention in participants\' natural activities',
      'Use structured observation frameworks with predefined categories and coding systems',
      'Implement time sampling and event sampling techniques for systematic data collection',
      'Balance passive observation with contextual inquiry moments for clarification and deeper understanding',
      'Create detailed environmental maps showing physical spaces, tools, and interaction patterns',
      'Document social dynamics and collaborative behaviors within the observed context',
      'Use mobile ethnography techniques for following users across different environments'
    ],
    industrySpecific: {
      fintech: [
        'Observe financial decision-making processes in real-world contexts and environments',
        'Document security behaviors and trust-building actions users naturally employ',
        'Capture multi-device usage patterns for financial tasks across different locations'
      ],
      healthcare: [
        'Ensure HIPAA compliance and appropriate consent for all observational activities',
        'Observe care coordination and communication patterns between patients and providers',
        'Document accessibility needs and accommodation strategies in natural healthcare settings'
      ],
      ecommerce: [
        'Observe shopping behaviors across physical and digital touchpoints in natural settings',
        'Document research and comparison behaviors that occur outside of the direct purchase flow',
        'Capture social influence factors and recommendation-seeking patterns in real contexts'
      ],
      saas: [
        'Observe workflow integration patterns and tool-switching behaviors in actual work environments',
        'Document collaborative work practices and team interaction patterns around software use',
        'Capture onboarding and learning behaviors as they naturally occur in organizational contexts'
      ],
      education: [
        'Observe learning behaviors across formal and informal educational settings',
        'Document collaborative learning patterns and peer interaction dynamics',
        'Capture accessibility adaptations and learning accommodation strategies in natural use'
      ]
    },
    qualityAssurance: [
      'Use multiple observers for complex scenarios to ensure comprehensive data capture',
      'Implement inter-observer reliability checks to validate observation accuracy',
      'Create detailed observation protocols with clear behavioral categories and definitions',
      'Plan for data saturation by continuing observations until no new behavioral patterns emerge'
    ],
    aiOptimization: [
      'Generate observation frameworks that reveal underlying user mental models and decision-making processes',
      'Create behavioral coding systems that identify patterns invisible to users themselves',
      'Design contextual analysis that connects environmental factors to user behavior variations',
      'Include predictive behavioral insights that anticipate user needs based on observed patterns'
    ],
    knowledgeIntegration: [
      'CRITICAL: Before designing observational studies, thoroughly analyze project knowledge base to identify specific behaviors, environments, and contexts to observe',
      'Use documented user personas, journeys, and pain points from knowledge base to focus observation protocols on high-impact behavioral patterns',
      'Reference existing user research and behavioral data in knowledge base to identify gaps in understanding that observation can address',
      'Incorporate project-specific environments, tools, and workflows from knowledge base to ensure observation contexts are relevant and realistic',
      'Leverage business objectives and success metrics from knowledge base to prioritize which user behaviors are most critical to observe and document',
      'Use domain expertise and industry constraints from knowledge base to design observation protocols that respect user privacy and organizational requirements',
      'Align observation objectives with project goals and strategic outcomes documented in the knowledge base to ensure actionable insights'
    ]
  },

  // NEW TOOLS FROM COMPLETE FRAMEWORKS - DESIGN THINKING
  'problem-statements': {
    core: [
      'Define clear, actionable problem statements using Point-of-View (POV) format',
      'Ground problem statements in validated user research insights rather than assumptions',
      'Frame problems from the user perspective focusing on their needs and contexts',
      'Ensure problems are specific enough to guide solution development but broad enough to allow innovation',
      'Create problem statements that inspire action and creative solution generation',
      'Balance user needs with business objectives and technical constraints in problem framing',
      'Validate problem statements with stakeholders and users before proceeding to ideation'
    ],
    methodology: [
      'Use the POV format: [User] needs [need] because [insight]',
      'Start with user research insights and synthesize into core problem themes',
      'Test problem statement clarity by having team members explain the problem back',
      'Create multiple problem statement variations to explore different angles',
      'Prioritize problem statements based on user impact and business value',
      'Refine problem statements through iterative team discussion and stakeholder feedback',
      'Document the rationale and research behind each problem statement'
    ],
    industrySpecific: {
      fintech: [
        'Frame problems around financial security, trust, and regulatory compliance needs',
        'Include financial literacy and accessibility considerations in problem statements',
        'Address multi-generational and diverse economic context needs in problem framing'
      ],
      healthcare: [
        'Frame problems around patient safety, care quality, and health outcomes',
        'Include accessibility and diverse health condition needs in problem statements',
        'Address care coordination and provider-patient communication challenges'
      ],
      ecommerce: [
        'Frame problems around customer journey, conversion, and post-purchase satisfaction',
        'Include omnichannel and cross-device experience needs in problem statements',
        'Address personalization and recommendation effectiveness challenges'
      ],
      saas: [
        'Frame problems around workflow integration, team collaboration, and organizational adoption',
        'Include user onboarding and feature discovery challenges in problem statements',
        'Address scalability and enterprise-level usage needs'
      ],
      education: [
        'Frame problems around learning effectiveness, engagement, and diverse learning styles',
        'Include accessibility and institutional constraint considerations',
        'Address collaborative learning and peer interaction needs'
      ]
    },
    qualityAssurance: [
      'Validate problem statements through user interviews and stakeholder review',
      'Test problem statement effectiveness by measuring ideation quality and quantity',
      'Ensure problem statements lead to actionable and feasible solution development',
      'Review problem statement accuracy against new user research findings'
    ],
    aiOptimization: [
      'Generate problem statements that stimulate innovative thinking while maintaining focus',
      'Create problem framing that encourages diverse solution approaches and perspectives',
      'Design problem statements that balance user empathy with strategic business alignment',
      'Include problem validation techniques that ensure continued relevance throughout development'
    ],
    knowledgeIntegration: generateKnowledgeIntegrationInstructions('problem-statements')
  },

  'crazy-eights': {
    core: [
      'Conduct rapid 8-minute sketching sessions to generate 8 different solution concepts',
      'Focus on quantity over quality to encourage divergent thinking and creative exploration',
      'Use simple sketching techniques that anyone can participate in regardless of drawing ability',
      'Create time pressure to bypass internal critics and encourage spontaneous ideation',
      'Generate diverse solution approaches by exploring different angles and perspectives',
      'Build on existing ideas while pushing for new and unexpected solution directions',
      'Use crazy 8s as a warm-up or energizer for longer ideation sessions'
    ],
    methodology: [
      'Provide each participant with paper divided into 8 sections',
      'Set strict 8-minute timer with 1-minute per idea guideline',
      'Encourage simple sketches with minimal text and maximum concept clarity',
      'Remind participants to build on previous ideas while exploring new directions',
      'Have participants share and explain their favorite concepts after completion',
      'Use dot voting or other quick selection methods to identify promising ideas',
      'Iterate with additional crazy 8s rounds to explore selected concepts further'
    ],
    industrySpecific: {
      fintech: [
        'Sketch financial interface concepts that build trust and security confidence',
        'Explore diverse ways to present financial data and decision-making tools',
        'Generate concepts for simplifying complex financial processes and regulations'
      ],
      healthcare: [
        'Sketch patient experience concepts that improve care coordination and communication',
        'Explore accessibility solutions for diverse health conditions and capabilities',
        'Generate concepts for health information presentation and patient education'
      ],
      ecommerce: [
        'Sketch shopping experience concepts across different devices and contexts',
        'Explore personalization and recommendation presentation approaches',
        'Generate concepts for social proof and community integration in shopping'
      ],
      saas: [
        'Sketch workflow integration concepts and team collaboration solutions',
        'Explore onboarding and feature discovery approach variations',
        'Generate concepts for complex software simplification and user empowerment'
      ],
      education: [
        'Sketch learning experience concepts for diverse learning styles and preferences',
        'Explore collaborative learning and peer interaction solution approaches',
        'Generate concepts for engagement and motivation in educational contexts'
      ]
    },
    qualityAssurance: [
      'Ensure all participants complete 8 concepts within the time limit',
      'Validate concept diversity by checking for different solution approaches',
      'Test concept clarity by having other participants interpret sketched ideas',
      'Measure ideation effectiveness through subsequent solution development success'
    ],
    aiOptimization: [
      'Generate crazy 8s prompts that push participants toward innovative and unexpected solutions',
      'Create time-boxed ideation that maximizes creative output while maintaining solution relevance',
      'Design sketching exercises that reveal hidden assumptions and alternative approaches',
      'Include concept evaluation techniques that identify highest-potential ideas for development'
    ],
    knowledgeIntegration: generateKnowledgeIntegrationInstructions('crazy-eights')
  },

  'scamper': {
    core: [
      'Apply systematic creativity technique using Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse',
      'Transform existing solutions and concepts through structured creative questioning',
      'Generate innovative variations by applying each SCAMPER prompt to current solutions',
      'Challenge assumptions about how solutions must work by exploring alternative approaches',
      'Create breakthrough innovations by combining SCAMPER techniques in unexpected ways',
      'Use SCAMPER to overcome creative blocks and generate fresh perspective on problems',
      'Apply SCAMPER systematically to ensure comprehensive exploration of solution space'
    ],
    methodology: [
      'Define the baseline solution or concept to be improved through SCAMPER',
      'Work through each SCAMPER prompt systematically: Substitute (what can be substituted?), Combine (what can be combined?), Adapt (what can be adapted?), Modify (what can be modified?), Put to other uses (how else can this be used?), Eliminate (what can be removed?), Reverse (what can be reversed or rearranged?)',
      'Generate multiple ideas for each SCAMPER category before moving to the next',
      'Build on ideas across categories to create hybrid solutions and novel approaches',
      'Document all ideas regardless of initial feasibility to maintain creative momentum',
      'Select most promising ideas for further development and prototyping',
      'Iterate through SCAMPER multiple times with different baseline solutions'
    ],
    industrySpecific: {
      fintech: [
        'Apply SCAMPER to financial service delivery, security measures, and user trust-building',
        'Explore alternative approaches to financial data presentation and decision support',
        'Generate innovations in financial education and literacy development'
      ],
      healthcare: [
        'Apply SCAMPER to patient care delivery, health information systems, and treatment approaches',
        'Explore alternative methods for care coordination and provider communication',
        'Generate innovations in health education and patient empowerment'
      ],
      ecommerce: [
        'Apply SCAMPER to shopping experiences, product discovery, and customer service',
        'Explore alternative approaches to personalization and recommendation systems',
        'Generate innovations in social commerce and community-driven shopping'
      ],
      saas: [
        'Apply SCAMPER to software interfaces, workflow integration, and collaboration features',
        'Explore alternative approaches to user onboarding and feature adoption',
        'Generate innovations in organizational software adoption and change management'
      ],
      education: [
        'Apply SCAMPER to learning experiences, assessment methods, and knowledge delivery',
        'Explore alternative approaches to student engagement and motivation',
        'Generate innovations in collaborative learning and peer-to-peer education'
      ]
    },
    qualityAssurance: [
      'Ensure systematic application of all SCAMPER categories to avoid idea gaps',
      'Validate idea quality through feasibility and impact assessment',
      'Test SCAMPER effectiveness by measuring breakthrough idea generation',
      'Review SCAMPER outcomes for practical implementation potential'
    ],
    aiOptimization: [
      'Generate SCAMPER applications that push beyond obvious solutions toward breakthrough innovations',
      'Create systematic creativity that reveals hidden opportunities and alternative approaches',
      'Design SCAMPER sessions that challenge fundamental assumptions about solution constraints',
      'Include innovation validation techniques that identify highest-potential breakthrough concepts'
    ],
    knowledgeIntegration: generateKnowledgeIntegrationInstructions('scamper')
  },

  'affinity-mapping': {
    core: [
      'Apply systematic thematic analysis to organize qualitative research data into meaningful clusters',
      'Use collaborative synthesis techniques that engage cross-functional team members in insight generation',
      'Implement the basic affinity process: individual idea capture, similarity grouping, and theme labeling',
      'Create hierarchical clustering that reveals both surface patterns and deeper underlying themes',
      'Use contextual filtering to reveal patterns based on user demographics, behaviors, or environmental factors',
      'Apply iterative clustering approaches to discover multiple perspectives and validate pattern recognition',
      'Transform clustered insights into actionable design recommendations and strategic opportunities'
    ],
    methodology: [
      'Begin with individual brainwriting to capture diverse perspectives before collaborative grouping',
      'Use time-boxed synthesis sessions to maintain focus and momentum throughout the clustering process',
      'Apply the "one idea per sticky note" principle to enable flexible reorganization and pattern discovery',
      'Implement silent clustering followed by collaborative discussion to reduce groupthink and bias',
      'Use dot voting and impact-effort matrices for democratic prioritization of insight clusters',
      'Create cluster labels that capture the essence of grouped insights rather than just describing contents',
      'Document outlier insights separately to preserve unique and potentially innovative observations'
    ],
    industrySpecific: {
      fintech: [
        'Cluster insights around trust, security, and regulatory compliance themes specific to financial services',
        'Group behavioral patterns related to financial decision-making complexity and risk assessment',
        'Organize insights around multi-generational financial literacy and technology adoption patterns'
      ],
      healthcare: [
        'Apply clustering that reveals care coordination and provider communication insight themes',
        'Group insights around accessibility needs and accommodation strategies across diverse health conditions',
        'Organize patterns around health literacy levels and patient advocacy relationship dynamics'
      ],
      ecommerce: [
        'Cluster insights around customer journey phases from awareness through post-purchase advocacy',
        'Group behavioral patterns related to social proof consumption and recommendation trust factors',
        'Organize insights around omnichannel shopping behaviors and cross-device experience expectations'
      ],
      saas: [
        'Apply clustering around organizational change management and team adoption insight patterns',
        'Group insights related to workflow integration challenges and collaboration tool ecosystem needs',
        'Organize patterns around user onboarding and feature discovery across different organizational roles'
      ],
      education: [
        'Cluster insights around diverse learning styles and institutional constraint impact on learning',
        'Group patterns related to collaborative learning preferences and peer interaction dynamics',
        'Organize insights around technology accessibility and digital equity in educational contexts'
      ]
    },
    qualityAssurance: [
      'Validate cluster accuracy through team consensus and stakeholder review of thematic organization',
      'Test insight cluster validity by having team members predict user responses to design concepts',
      'Update clustering based on new research data and validate pattern stability over time',
      'Create measurement frameworks to track how clustered insights inform successful design decisions'
    ],
    aiOptimization: [
      'Generate clustering approaches that reveal hidden behavioral patterns and unconscious user motivations',
      'Create synthesis frameworks that balance systematic analysis with creative insight discovery',
      'Design collaborative processes that maximize diverse perspective integration while maintaining analytical rigor',
      'Include meta-analysis elements that identify patterns across different user research studies and contexts'
    ]
  },

  'how-might-we': {
    core: [
      'Frame problems as innovation opportunities using the structured "How might we..." question format',
      'Generate questions that suggest solutions are possible while avoiding prescriptive or narrow problem statements',
      'Create appropriately scoped questions that are neither too broad nor overly specific for productive ideation',
      'Ground HMW questions in specific user research insights rather than general assumptions or business goals',
      'Use strategic question types: amplify good aspects, question assumptions, explore adjectives, identify resources',
      'Apply divergent-convergent thinking cycles with HMW as the bridge between problem definition and solution ideation',
      'Generate multiple HMW variations to explore different angles and perspectives on the same core challenge'
    ],
    methodology: [
      'Start with validated user research findings and pain points as the foundation for HMW question development',
      'Use collaborative workshops with cross-functional stakeholders to generate diverse HMW perspectives',
      'Apply the question transformation techniques: reframe complaints as opportunities, break complex problems into components',
      'Implement systematic evaluation criteria to assess HMW question quality and ideation potential',
      'Create HMW question taxonomies organized by user journey phases, user types, or problem categories',
      'Use rapid iteration cycles to refine question framing based on initial ideation session outcomes',
      'Document the rationale behind each HMW question to maintain connection to research insights'
    ],
    industrySpecific: {
      fintech: [
        'Frame questions around trust-building, security transparency, and regulatory compliance as innovation opportunities',
        'Create HMW questions that address financial literacy gaps and risk assessment complexity',
        'Generate questions that explore inclusive financial services and accessibility across diverse economic contexts'
      ],
      healthcare: [
        'Frame questions around care coordination, provider communication, and patient advocacy as innovation opportunities',
        'Create HMW questions that address health literacy diversity and caregiver relationship complexity',
        'Generate questions that explore accessibility improvements and accommodation innovation in healthcare delivery'
      ],
      ecommerce: [
        'Frame questions around conversion optimization, customer retention, and post-purchase experience as opportunities',
        'Create HMW questions that address omnichannel experience integration and cross-device behavior patterns',
        'Generate questions that explore personalization and social proof integration as competitive advantages'
      ],
      saas: [
        'Frame questions around user onboarding, feature adoption, and workflow integration as innovation opportunities',
        'Create HMW questions that address organizational change management and team collaboration enhancement',
        'Generate questions that explore integration ecosystem needs and inter-tool workflow optimization'
      ],
      education: [
        'Frame questions around engagement, motivation, and diverse learning styles as innovation opportunities',
        'Create HMW questions that address institutional constraints and administrative efficiency improvements',
        'Generate questions that explore collaborative learning and peer interaction enhancement possibilities'
      ]
    },
    qualityAssurance: [
      'Test HMW questions through rapid ideation sessions to validate their generative potential',
      'Evaluate question quality based on specificity to research insights and breadth of solution possibilities',
      'Validate HMW effectiveness by measuring the quantity and quality of ideas generated in ideation sessions',
      'Create feedback loops that refine HMW question framing based on solution feasibility and user impact'
    ],
    aiOptimization: [
      'Generate HMW questions that stimulate creative thinking while maintaining focus on validated user needs',
      'Create question framing that encourages solutions with high user impact and strategic business alignment',
      'Design HMW development processes that integrate diverse stakeholder perspectives systematically',
      'Include rapid validation techniques that test HMW effectiveness before major ideation investments'
    ]
  },

  'stakeholder-interviews': {
    core: [
      'Conduct structured interviews with key project stakeholders to gather business context and organizational insights',
      'Apply collaborative partnership approach that makes stakeholders feel heard while extracting strategic information',
      'Focus on business goals, historical context, constraints, and success metrics to align design with organizational needs',
      'Use systematic questioning techniques to uncover hidden assumptions, political dynamics, and resource constraints',
      'Document organizational knowledge, decision-making processes, and approval workflows that affect design implementation',
      'Balance stakeholder perspectives with user needs to create comprehensive understanding of design challenges',
      'Plan for early-stage and ongoing stakeholder engagement to maintain alignment throughout the design process'
    ],
    methodology: [
      'Select representative stakeholders across different organizational levels and functional areas',
      'Structure interviews to cover project origins, business objectives, constraints, and success criteria',
      'Use open-ended questions to encourage stakeholders to share their perspectives and concerns naturally',
      'Apply active listening techniques and follow-up questions to dig deeper into organizational context',
      'Document both explicit requirements and implicit expectations that stakeholders may not articulate directly',
      'Create stakeholder journey maps that show how different roles interact with and are affected by design decisions',
      'Plan condensed interview schedules to build momentum and maintain contextual understanding across sessions'
    ],
    industrySpecific: {
      fintech: [
        'Focus on regulatory compliance requirements and risk management constraints from financial stakeholders',
        'Understand security protocols and audit requirements that affect design and development processes',
        'Explore competitive landscape insights and market positioning goals from business stakeholders'
      ],
      healthcare: [
        'Address clinical workflow requirements and patient safety concerns from healthcare provider stakeholders',
        'Understand regulatory compliance needs and clinical evidence requirements from administrative stakeholders',
        'Explore care coordination and provider communication needs from operational stakeholders'
      ],
      ecommerce: [
        'Focus on conversion optimization goals and customer acquisition strategies from marketing stakeholders',
        'Understand inventory management and fulfillment constraints from operational stakeholders',
        'Explore brand positioning and competitive differentiation goals from business development stakeholders'
      ],
      saas: [
        'Address integration requirements and technical constraints from engineering and IT stakeholders',
        'Understand customer success metrics and retention goals from customer experience stakeholders',
        'Explore feature prioritization and roadmap planning from product management stakeholders'
      ],
      education: [
        'Focus on pedagogical requirements and learning outcome goals from educational stakeholders',
        'Understand institutional constraints and administrative requirements from operational stakeholders',
        'Explore accessibility compliance and inclusive design requirements from diversity and inclusion stakeholders'
      ]
    },
    qualityAssurance: [
      'Validate stakeholder input through cross-referencing with user research and market data',
      'Test stakeholder alignment by having different stakeholders review and comment on synthesized insights',
      'Create stakeholder feedback loops that maintain engagement and validate design direction throughout the process',
      'Plan follow-up sessions to clarify conflicting requirements and build consensus around design priorities'
    ],
    aiOptimization: [
      'Generate interview approaches that reveal hidden organizational dynamics and decision-making patterns',
      'Create synthesis frameworks that balance diverse stakeholder perspectives with user-centered design principles',
      'Design stakeholder engagement strategies that build buy-in and support for user-centered design approaches',
      'Include organizational change management insights that support successful design implementation and adoption'
    ]
  },

  'contextual-inquiry': {
    core: [
      'Conduct in-depth field research combining observation and interview techniques in users\' natural work environments',
      'Apply the four key principles: Context (natural environment), Partnership (user-researcher collaboration), Interpretation (shared understanding), Focus (relevant scope)',
      'Use structured 2-hour sessions that balance silent observation with contextual questioning and discussion',
      'Document both explicit task completion and implicit environmental factors that influence user behavior',
      'Capture interruptions, multitasking patterns, and social interactions that affect user experience in real contexts',
      'Create detailed workflow maps that show how users actually complete tasks versus how they think they do',
      'Plan for multiple sessions across different contexts to understand behavior variations and environmental influences'
    ],
    methodology: [
      'Structure sessions with primer, transition, contextual interview, and wrap-up phases for comprehensive data collection',
      'Use the "master-apprentice" model where users teach researchers about their work context and processes',
      'Apply strategic questioning during natural task breaks to avoid disrupting user flow and authentic behavior',
      'Document physical environment, tools, artifacts, and social dynamics that contribute to user experience',
      'Create environmental maps showing spatial relationships, tool locations, and interaction patterns in the workspace',
      'Use mobile ethnography techniques to follow users across different locations and contexts as needed',
      'Plan for immediate post-session synthesis to capture environmental nuances and contextual insights while fresh'
    ],
    industrySpecific: {
      fintech: [
        'Observe financial decision-making processes in real work environments including security and compliance behaviors',
        'Document multi-device usage patterns and security protocols users naturally employ in financial tasks',
        'Capture environmental factors that influence trust and risk assessment in actual financial contexts'
      ],
      healthcare: [
        'Ensure proper consent and HIPAA compliance for observational research in healthcare settings',
        'Observe care coordination workflows and provider communication patterns in authentic clinical environments',
        'Document accessibility accommodations and assistive technology usage in natural healthcare contexts'
      ],
      ecommerce: [
        'Observe shopping research and purchase decision-making processes across multiple touchpoints and contexts',
        'Document social influence factors and recommendation-seeking behaviors in natural shopping environments',
        'Capture cross-device and cross-channel behavior patterns in authentic retail and online contexts'
      ],
      saas: [
        'Observe workflow integration and collaboration patterns in authentic organizational work environments',
        'Document tool-switching behaviors and integration needs within actual business process contexts',
        'Capture team dynamics and collaborative work practices around software usage in natural settings'
      ],
      education: [
        'Observe learning behaviors across formal and informal educational contexts and environments',
        'Document collaborative learning patterns and peer interaction dynamics in authentic educational settings',
        'Capture accessibility accommodations and diverse learning strategies in natural academic contexts'
      ]
    },
    qualityAssurance: [
      'Validate contextual insights through follow-up interviews and member checking with observed participants',
      'Cross-reference contextual observations with other research methods to ensure comprehensive understanding',
      'Plan for data saturation by conducting inquiry sessions until no new contextual patterns emerge',
      'Create detailed documentation protocols that capture both behavioral and environmental data systematically'
    ],
    aiOptimization: [
      'Generate contextual analysis frameworks that reveal connections between environment and user behavior patterns',
      'Create observation protocols that identify contextual factors invisible to users but critical for design success',
      'Design inquiry approaches that uncover workflow integration needs and environmental constraint impacts',
      'Include predictive contextual insights that anticipate how environmental changes might affect user behavior'
    ]
  },

  'synthesis-workshops': {
    core: [
      'Facilitate collaborative analysis sessions that transform raw research data into actionable design insights',
      'Apply structured group sensemaking techniques that engage diverse stakeholders in insight generation and validation',
      'Use visual collaboration methods including affinity mapping, journey mapping, and insight clustering to organize findings',
      'Create shared understanding across cross-functional teams about user needs, pain points, and opportunity areas',
      'Generate prioritized insight hierarchies that distinguish between must-have insights and nice-to-have observations',
      'Transform individual research observations into collective team knowledge and strategic design direction',
      'Plan for iterative synthesis cycles that refine insights based on additional data and stakeholder feedback'
    ],
    methodology: [
      'Structure workshops with clear phases: data immersion, pattern identification, insight generation, and prioritization',
      'Use divergent-convergent thinking cycles that balance comprehensive exploration with focused decision-making',
      'Apply silent individual work followed by collaborative discussion to reduce groupthink and encourage diverse perspectives',
      'Implement systematic clustering techniques including contextual grouping and thematic organization methods',
      'Use dot voting, impact-effort matrices, and consensus-building techniques for democratic insight prioritization',
      'Create visual synthesis artifacts including insight maps, opportunity frameworks, and strategic recommendation summaries',
      'Plan for workshop documentation that captures both final insights and the reasoning process behind key decisions'
    ],
    industrySpecific: {
      fintech: [
        'Focus synthesis on trust-building opportunities, security transparency, and regulatory compliance innovation possibilities',
        'Prioritize insights related to financial decision-making complexity and risk communication improvements',
        'Generate synthesis around financial literacy gaps and inclusive financial service design opportunities'
      ],
      healthcare: [
        'Apply synthesis techniques to care coordination insights and provider communication improvement opportunities',
        'Focus on accessibility accommodation insights and health literacy diversity consideration in synthesis priorities',
        'Generate collaborative analysis around patient advocacy and caregiver relationship dynamic insights'
      ],
      ecommerce: [
        'Structure synthesis around customer journey insights and omnichannel experience optimization opportunities',
        'Prioritize insights related to social proof integration and personalization strategy development',
        'Focus collaborative analysis on post-purchase experience and customer retention insight generation'
      ],
      saas: [
        'Apply synthesis to workflow integration insights and organizational change management opportunity identification',
        'Focus on user onboarding and feature adoption pattern analysis in collaborative workshop settings',
        'Generate synthesis around team collaboration and integration ecosystem needs from research findings'
      ],
      education: [
        'Structure synthesis around diverse learning style insights and institutional constraint impact analysis',
        'Focus collaborative analysis on engagement and motivation factor identification from research data',
        'Apply synthesis techniques to collaborative learning and peer interaction dynamic insights'
      ]
    },
    qualityAssurance: [
      'Validate synthesis outcomes through stakeholder review and cross-functional team consensus building',
      'Test insight accuracy by having team members use synthesized insights to predict user behavior in new scenarios',
      'Create synthesis quality checks that ensure insights are grounded in research data rather than team assumptions',
      'Plan follow-up validation that tests synthesized insights against additional user research and market data'
    ],
    aiOptimization: [
      'Generate synthesis frameworks that balance systematic analysis with creative insight discovery and strategic thinking',
      'Create collaborative processes that maximize diverse perspective integration while maintaining analytical rigor and focus',
      'Design workshop structures that efficiently transform large amounts of qualitative data into actionable design direction',
      'Include meta-synthesis elements that identify patterns across multiple research studies and generate strategic recommendations'
    ]
  }
} as const;

/**
 * Enhanced instructions for design and strategy tools
 */
export const DESIGN_TOOL_INSTRUCTIONS = {
  'journey-maps': {
    core: [
      'Map the complete emotional journey alongside functional steps - emotions drive experience perception',
      'Include both digital and physical touchpoints in omnichannel experience mapping',
      'Identify moments of truth where user perception is most influenced by experience quality',
      'Document backstage processes and organizational factors that enable or hinder experience delivery',
      'Include micro-moments and transition states between major journey phases',
      'Map user goals and success criteria at each stage to understand shifting priorities',
      'Identify opportunity areas where small improvements could create disproportionate impact'
    ],
    methodology: [
      'Use workshop-based collaborative mapping with cross-functional stakeholder involvement',
      'Base journey maps on actual user research data rather than internal assumptions',
      'Create journey maps for specific user scenarios rather than generic user experiences',
      'Include service recovery scenarios and error state journey paths',
      'Document supporting evidence and data sources for each journey component',
      'Test journey map accuracy with actual users through validation interviews',
      'Create both current-state and future-state journey maps to guide improvement efforts'
    ],
    industrySpecific: {
      fintech: [
        'Include regulatory touchpoints and compliance verification steps throughout journey',
        'Map security and trust-building touchpoints across all journey phases',
        'Include financial decision-making complexity and risk assessment processes'
      ],
      healthcare: [
        'Include care coordination touchpoints and provider communication needs',
        'Map accessibility requirements and accommodation needs across journey phases',
        'Include caregiver involvement and family decision-making processes'
      ],
      ecommerce: [
        'Map pre-purchase research behaviors and social proof consultation patterns',
        'Include post-purchase experience phases: delivery, usage, support, and repurchase consideration',
        'Map cross-device and cross-channel behavior patterns throughout purchase journey'
      ],
      saas: [
        'Map organizational decision-making and approval processes throughout adoption journey',
        'Include integration and setup phases with technical implementation considerations',
        'Map user onboarding and team adoption patterns across different user roles'
      ],
      education: [
        'Map learning journey phases from awareness through mastery and application',
        'Include institutional and administrative touchpoints that affect learner experience',
        'Map collaborative learning interactions and peer-to-peer experience elements'
      ]
    },
    qualityAssurance: [
      'Validate journey maps with actual user interviews and observational research',
      'Update journey maps based on customer support data and user feedback patterns',
      'Test journey map assumptions through targeted user research and analytics validation',
      'Create measurement frameworks to track improvement in journey experience over time'
    ],
    aiOptimization: [
      'Generate journey maps that reveal underlying user mental models and decision-making processes',
      'Create emotional journey analysis that identifies satisfaction and frustration triggers',
      'Develop opportunity analysis that prioritizes improvements based on user impact and business value',
      'Include predictive elements that anticipate user needs and proactive service opportunities'
    ]
  },

  'wireframes': {
    core: [
      'Progress systematically through fidelity levels: sketches → lo-fi → mid-fi → hi-fi wireframes',
      'Establish clear content hierarchy and information prioritization before detailed layout design',
      'Include responsive behavior documentation across mobile, tablet, and desktop breakpoints',
      'Plan component reusability and design system integration from initial wireframing stages',
      'Document interaction states including hover, active, loading, and error conditions',
      'Include accessibility considerations and ARIA labeling requirements in wireframe annotations',
      'Plan user flow integration and navigation patterns that support task completion'
    ],
    methodology: [
      'Start with rapid sketching to explore multiple layout concepts before digital wireframing',
      'Use consistent annotation systems that communicate interaction behavior to developers',
      'Include user scenario walkthroughs to validate wireframe effectiveness for task completion',
      'Plan progressive enhancement that ensures core functionality across device and browser capabilities',
      'Document content requirements and copywriting needs for each interface element',
      'Include performance considerations and loading behavior in wireframe specifications',
      'Plan for internationalization and localization requirements in layout and navigation design'
    ],
    industrySpecific: {
      fintech: [
        'Include security indicators and trust elements placement throughout interface wireframes',
        'Plan for regulatory compliance information display and user consent flow integration',
        'Design financial data visualization and complex calculation interface requirements'
      ],
      healthcare: [
        'Include accessibility-first design that accommodates assistive technology usage',
        'Plan for clinical workflow integration and provider communication interface needs',
        'Design emergency and critical information presentation with appropriate visual hierarchy'
      ],
      ecommerce: [
        'Include conversion optimization elements and social proof placement in product interface design',
        'Plan for product discovery and comparison interface requirements',
        'Design checkout flow wireframes that minimize abandonment and maximize completion'
      ],
      saas: [
        'Plan for complex data visualization and dashboard layout requirements',
        'Include collaborative features and multi-user interaction patterns',
        'Design onboarding flows that accommodate different user roles and permission levels'
      ],
      education: [
        'Include interactive learning elements and progress tracking in wireframe design',
        'Plan for collaborative features and peer interaction interface requirements',
        'Design accessibility-first layouts that accommodate diverse learning needs'
      ]
    },
    qualityAssurance: [
      'Validate wireframe concepts through user testing at appropriate fidelity levels',
      'Test wireframe navigation and information architecture through task completion scenarios',
      'Plan iterative wireframe refinement based on stakeholder feedback and user testing insights',
      'Create wireframe documentation that enables accurate development implementation'
    ],
    aiOptimization: [
      'Generate wireframe concepts that prioritize user mental models and task completion efficiency',
      'Create layout designs that balance user needs with business objectives and technical constraints',
      'Design interface patterns that anticipate user needs and reduce cognitive load',
      'Include adaptive design elements that respond to user behavior and preferences'
    ]
  },

  'brainstorming': {
    core: [
      'Move beyond traditional brainstorming to structured individual-first ideation methods',
      'Use "How Might We" question framing to reframe problems as innovation opportunities',
      'Implement time-boxed exercises like Crazy 8s (8 ideas in 8 minutes) to prevent overthinking',
      'Include brainwriting techniques that give equal voice to introverted and extroverted participants',
      'Plan for both divergent thinking (idea generation) and convergent thinking (idea selection and refinement)',
      'Create psychological safety that encourages wild ideas and builds on others\' contributions',
      'Document all ideas with visual capture methods that preserve context and detail'
    ],
    methodology: [
      'Start workshops with energizing activities that shift mindset from critical to creative thinking',
      'Use the "Yes, And..." principle to build ideas rather than immediately evaluating or critiquing',
      'Implement dot voting and impact/effort matrices for systematic idea evaluation and prioritization',
      'Include diverse perspectives with representatives from different departments and user types',
      'Plan workshop flow that alternates between individual work and collaborative building',
      'Use visual collaboration tools and templates that maintain momentum and focus',
      'End workshops with clear next steps, ownership assignment, and timeline commitment'
    ],
    industrySpecific: {
      fintech: [
        'Include regulatory constraints and compliance requirements in ideation parameters',
        'Focus on trust-building and security concerns as innovation opportunities',
        'Consider financial literacy levels and accessibility in solution ideation'
      ],
      healthcare: [
        'Include patient safety and clinical workflow considerations in all ideation',
        'Focus on care coordination and provider communication as innovation areas',
        'Consider diverse health literacy levels and accessibility needs in solution development'
      ],
      ecommerce: [
        'Include conversion optimization and customer acquisition challenges in ideation scope',
        'Focus on personalization and customer experience differentiation opportunities',
        'Consider omnichannel and cross-device experience integration in solution ideation'
      ],
      saas: [
        'Include integration challenges and workflow optimization in ideation scope',
        'Focus on user onboarding and feature adoption as key innovation areas',
        'Consider organizational change management and team collaboration needs'
      ],
      education: [
        'Include diverse learning styles and accessibility needs in ideation parameters',
        'Focus on engagement and motivation as key innovation opportunities',
        'Consider institutional constraints and administrative requirements in solution development'
      ]
    },
    qualityAssurance: [
      'Validate workshop ideas through rapid prototyping and user feedback collection',
      'Plan follow-up sessions to refine and develop most promising concepts',
      'Create evaluation criteria that balance innovation potential with implementation feasibility',
      'Document ideation process and outcomes to inform future workshop improvements'
    ],
    aiOptimization: [
      'Generate ideation frameworks that stimulate creative thinking while maintaining focus on user needs',
      'Create evaluation methods that identify ideas with highest user impact and strategic alignment',
      'Design workshop structures that maximize participant engagement and creative contribution',
      'Include rapid validation techniques that test idea viability before significant resource investment'
    ]
  },

  'expert-interviews': {
    core: [
      'Conduct focused interviews with domain experts to gather specialized knowledge and industry insights',
      'Apply systematic questioning techniques to extract expert mental models and decision-making frameworks',
      'Focus on capturing tacit knowledge and professional expertise that shapes user experience in specific domains',
      'Document expert perspectives on user behavior patterns, industry constraints, and opportunity areas',
      'Balance respect for expert knowledge with critical questioning to validate assumptions and uncover biases',
      'Create knowledge maps that organize expert insights around user journey phases and design challenge areas',
      'Plan for rapid knowledge transfer sessions that efficiently capture deep domain expertise'
    ],
    methodology: [
      'Select experts based on domain relevance, user interaction experience, and diverse perspective representation',
      'Structure interviews to cover domain overview, user behavior insights, common challenges, and future trends',
      'Use problem-scenario questioning to understand how experts would approach typical user challenges',
      'Apply hypothetical situation testing to validate expert assumptions against actual user behavior patterns',
      'Document both explicit expert recommendations and implicit assumptions about user needs and behaviors',
      'Create expert consensus and disagreement maps to identify areas of uncertainty or debate in the domain',
      'Plan follow-up validation to test expert insights against actual user research and behavioral data'
    ],
    industrySpecific: {
      fintech: [
        'Interview financial advisors, compliance experts, and fintech professionals about user financial behavior patterns',
        'Focus on regulatory expertise, security best practices, and financial literacy assessment from domain experts',
        'Explore expert perspectives on trust-building, risk communication, and financial decision-making complexity'
      ],
      healthcare: [
        'Interview clinicians, health educators, and healthcare administrators about patient experience and care delivery',
        'Focus on expert knowledge about health literacy, care coordination, and patient safety considerations',
        'Explore clinical workflow expertise and provider-patient communication best practices from healthcare professionals'
      ],
      ecommerce: [
        'Interview retail experts, marketing professionals, and e-commerce specialists about consumer behavior patterns',
        'Focus on expert insights about purchase decision-making, brand loyalty, and omnichannel experience design',
        'Explore expert perspectives on conversion optimization, customer retention, and personalization strategies'
      ],
      saas: [
        'Interview software specialists, IT professionals, and business process experts about organizational software adoption',
        'Focus on expert knowledge about workflow integration, team collaboration, and enterprise software implementation',
        'Explore expert perspectives on user onboarding, feature adoption, and organizational change management'
      ],
      education: [
        'Interview educators, instructional designers, and educational technology experts about learning experience design',
        'Focus on expert insights about diverse learning styles, engagement strategies, and institutional constraints',
        'Explore expert perspectives on collaborative learning, accessibility, and educational technology implementation'
      ]
    },
    qualityAssurance: [
      'Validate expert insights through triangulation with user research data and market analysis',
      'Cross-reference expert opinions to identify consensus areas and points of professional disagreement',
      'Test expert recommendations through rapid prototyping and user validation where possible',
      'Plan for expert review of design concepts to ensure domain accuracy and professional feasibility'
    ],
    aiOptimization: [
      'Generate expert interview approaches that efficiently extract specialized domain knowledge and professional insights',
      'Create synthesis frameworks that integrate expert perspectives with user research for comprehensive understanding',
      'Design expert engagement strategies that build ongoing advisory relationships throughout the design process',
      'Include expert validation protocols that ensure design solutions meet professional standards and domain requirements'
    ]
  },

  'job-steps': {
    core: [
      'Apply Jobs-to-Be-Done methodology to break down customer job processes into discrete, actionable steps',
      'Map the complete job workflow from job triggering through job completion and success measurement',
      'Identify functional, emotional, and social dimensions of each job step to understand comprehensive user needs',
      'Document desired outcomes, success criteria, and measurement methods for each step in the customer job process',
      'Analyze job step dependencies, required resources, and potential failure points that affect job completion success',
      'Create job step hierarchies that distinguish between core job steps and supporting sub-processes',
      'Plan for job step validation through customer interviews and behavioral observation in natural contexts'
    ],
    methodology: [
      'Use systematic job interview techniques to understand how customers currently execute each job step',
      'Apply outcome-driven innovation methodology to identify underserved and overserved aspects of each job step',
      'Document job step contexts including when, where, and why customers perform each step in their workflow',
      'Create job step journey maps that show how customers move between steps and handle job step transitions',
      'Use job step prioritization methods to identify which steps are most critical for overall job success',
      'Apply job step benchmarking to understand how different customer segments approach the same job steps',
      'Plan iterative job step refinement based on additional customer research and behavioral validation'
    ],
    industrySpecific: {
      fintech: [
        'Map financial job steps including research, evaluation, decision-making, execution, and monitoring phases',
        'Focus on trust-building and security verification steps that customers require for financial job completion',
        'Document regulatory compliance and risk assessment steps that affect financial job workflow execution'
      ],
      healthcare: [
        'Map healthcare job steps including symptom recognition, care seeking, treatment, and recovery monitoring',
        'Focus on care coordination and provider communication steps required for comprehensive healthcare job completion',
        'Document accessibility accommodation and caregiver involvement steps in healthcare job processes'
      ],
      ecommerce: [
        'Map shopping job steps including need recognition, research, evaluation, purchase, and post-purchase experience',
        'Focus on social proof validation and recommendation integration steps in customer purchase job workflows',
        'Document omnichannel job steps that customers use across different touchpoints and devices'
      ],
      saas: [
        'Map software adoption job steps including evaluation, trial, implementation, training, and optimization phases',
        'Focus on integration and workflow customization steps required for successful software job completion',
        'Document organizational approval and team adoption steps in enterprise software implementation jobs'
      ],
      education: [
        'Map learning job steps including goal setting, content consumption, practice, assessment, and application phases',
        'Focus on collaborative learning and peer interaction steps that enhance educational job completion success',
        'Document accessibility accommodation and institutional navigation steps in educational job processes'
      ]
    },
    qualityAssurance: [
      'Validate job step accuracy through customer journey observation and behavioral data analysis',
      'Test job step completeness by having customers walk through the mapped process and identify missing elements',
      'Cross-reference job step maps with customer support data to identify common failure points and friction areas',
      'Plan job step iteration based on customer feedback and changing market conditions or customer needs'
    ],
    aiOptimization: [
      'Generate job step analysis that reveals hidden customer needs and underserved job outcomes',
      'Create job step optimization frameworks that identify highest-impact improvement opportunities',
      'Design job step innovation approaches that anticipate future customer job evolution and changing contexts',
      'Include predictive job step analysis that identifies emerging customer job patterns and workflow changes'
    ]
  },

  'hypothesis-canvas': {
    core: [
      'Apply structured hypothesis formation using Lean UX methodology to create testable assumptions about user needs and behaviors',
      'Use hypothesis canvas framework to organize beliefs, assumptions, and success criteria in testable formats',
      'Create specific, measurable hypotheses that can be validated through rapid experimentation and user research',
      'Balance business assumptions with user experience hypotheses to ensure comprehensive validation coverage',
      'Apply risk assessment techniques to prioritize high-risk assumptions that require immediate validation',
      'Generate hypothesis hierarchies that distinguish between foundational assumptions and tactical implementation details',
      'Plan for iterative hypothesis refinement based on experimental results and new learning from user validation'
    ],
    methodology: [
      'Structure hypotheses using the format: "We believe [assumption] will result in [outcome] as measured by [metric]"',
      'Use assumption mapping workshops to identify and prioritize team beliefs about users, market, and solution effectiveness',
      'Apply systematic bias identification techniques to recognize and address cognitive biases in hypothesis formation',
      'Create experiment design frameworks that efficiently test multiple related hypotheses through single validation efforts',
      'Use hypothesis tracking systems that document assumption validation status and learning outcomes over time',
      'Implement rapid validation cycles that test riskiest assumptions first before significant development investment',
      'Plan hypothesis evolution strategies that adapt assumptions based on validated learning and market feedback'
    ],
    industrySpecific: {
      fintech: [
        'Create hypotheses about financial decision-making behavior, trust-building, and security feature effectiveness',
        'Focus on regulatory compliance assumptions and risk communication hypothesis validation in financial contexts',
        'Generate hypotheses about financial literacy levels and inclusive financial service design effectiveness'
      ],
      healthcare: [
        'Develop hypotheses about care coordination needs, provider communication preferences, and patient engagement patterns',
        'Focus on health literacy assumptions and accessibility accommodation hypothesis validation in healthcare contexts',
        'Create hypotheses about caregiver involvement patterns and patient advocacy relationship dynamics'
      ],
      ecommerce: [
        'Generate hypotheses about purchase decision-making factors, social proof effectiveness, and conversion optimization',
        'Focus on omnichannel behavior assumptions and personalization strategy hypothesis validation',
        'Create hypotheses about post-purchase experience impact and customer retention factor effectiveness'
      ],
      saas: [
        'Develop hypotheses about workflow integration needs, feature adoption patterns, and organizational change management',
        'Focus on user onboarding assumptions and team collaboration feature hypothesis validation',
        'Create hypotheses about integration ecosystem needs and enterprise software implementation success factors'
      ],
      education: [
        'Generate hypotheses about learning engagement factors, collaborative learning effectiveness, and institutional constraints',
        'Focus on diverse learning style assumptions and accessibility feature hypothesis validation',
        'Create hypotheses about motivation factors and peer interaction enhancement strategy effectiveness'
      ]
    },
    qualityAssurance: [
      'Validate hypothesis quality through peer review and stakeholder feedback on assumption clarity and testability',
      'Test hypothesis specificity by ensuring each assumption can be validated through measurable user behavior or feedback',
      'Create hypothesis validation tracking that documents learning outcomes and assumption evolution over time',
      'Plan hypothesis review cycles that update assumptions based on market changes and new user research insights'
    ],
    aiOptimization: [
      'Generate hypothesis formation frameworks that systematically identify hidden assumptions and cognitive biases',
      'Create validation design approaches that efficiently test multiple related assumptions through integrated experiments',
      'Design hypothesis evolution strategies that adapt to validated learning while maintaining strategic focus',
      'Include predictive hypothesis elements that anticipate future user behavior changes and market evolution'
    ]
  },

  'user-story-mapping': {
    core: [
      'Apply user story mapping methodology to visualize user journey flows and feature prioritization in product development',
      'Create story map hierarchies that organize user activities, tasks, and detailed stories in logical workflow sequences',
      'Use collaborative mapping sessions to build shared understanding of user needs across product development teams',
      'Generate release planning frameworks that prioritize story implementation based on user value and business impact',
      'Document user story dependencies and workflow relationships that affect feature development and release sequencing',
      'Create story map validation processes that ensure mapped stories accurately reflect actual user behavior patterns',
      'Plan for story map evolution that adapts to user feedback, market changes, and development learning outcomes'
    ],
    methodology: [
      'Structure story maps with user activities as columns and story details organized by priority rows underneath',
      'Use persona-based mapping to ensure story maps reflect needs of specific user segments and usage contexts',
      'Apply walking skeleton approach to identify minimum viable story sets that deliver complete user value',
      'Implement story slicing techniques that break large user stories into testable, developable increments',
      'Use story estimation and velocity planning to create realistic development timelines and release planning',
      'Create story map documentation that maintains traceability from user research to implemented features',
      'Plan regular story map review sessions that incorporate user feedback and development learning into story prioritization'
    ],
    industrySpecific: {
      fintech: [
        'Map financial user stories around trust-building, security verification, and regulatory compliance user workflows',
        'Focus on financial decision-making story flows that address risk assessment and financial literacy considerations',
        'Create story maps that include multi-generational user needs and diverse financial capability requirements'
      ],
      healthcare: [
        'Map healthcare user stories around care coordination, provider communication, and patient advocacy workflows',
        'Focus on accessibility user stories that address diverse health conditions and accommodation requirements',
        'Create story maps that include caregiver roles and family decision-making dynamics in healthcare contexts'
      ],
      ecommerce: [
        'Map shopping user stories around customer journey phases from awareness through post-purchase advocacy',
        'Focus on omnichannel user stories that address cross-device and cross-touchpoint shopping behavior patterns',
        'Create story maps that include social proof and recommendation integration in purchase decision workflows'
      ],
      saas: [
        'Map software user stories around organizational adoption, workflow integration, and team collaboration requirements',
        'Focus on onboarding user stories that address diverse user roles and permission levels in enterprise contexts',
        'Create story maps that include integration and customization requirements for business process optimization'
      ],
      education: [
        'Map learning user stories around diverse learning styles, institutional constraints, and collaborative learning needs',
        'Focus on accessibility user stories that address diverse learning abilities and accommodation requirements',
        'Create story maps that include peer interaction and collaborative learning workflows in educational contexts'
      ]
    },
    qualityAssurance: [
      'Validate story map accuracy through user journey observation and customer feedback on story priority and completeness',
      'Test story map usability by having development teams use maps for sprint planning and feature development guidance',
      'Cross-reference story maps with user analytics and support data to validate story importance and user behavior patterns',
      'Plan story map maintenance that keeps maps current with user needs evolution and product development learning'
    ],
    aiOptimization: [
      'Generate story mapping approaches that efficiently translate user research insights into actionable development priorities',
      'Create story prioritization frameworks that balance user value, business impact, and development complexity considerations',
      'Design story map evolution strategies that maintain user focus while adapting to technical constraints and business goals',
      'Include predictive story planning that anticipates future user needs and market changes in story map development'
    ]
  },

  'notification-strategy': {
    core: [
      'Apply behavioral psychology principles to design notification systems that create habit-forming engagement patterns',
      'Use trigger design methodology from Hooked Model to create external triggers that prompt desired user actions',
      'Balance notification frequency and relevance to maintain user engagement without causing notification fatigue',
      'Create personalized notification strategies that adapt to individual user behavior patterns and preferences',
      'Apply progressive disclosure techniques that gradually increase notification sophistication as users develop habits',
      'Design notification content that connects external triggers to internal user motivations and desired outcomes',
      'Plan for notification strategy evolution that adapts to user lifecycle stages and changing engagement patterns'
    ],
    methodology: [
      'Use behavioral trigger taxonomy to categorize notifications by user context, timing, and motivational alignment',
      'Apply A/B testing frameworks to optimize notification timing, content, and delivery channel effectiveness',
      'Implement user segmentation strategies that customize notification approaches based on user behavior and preferences',
      'Create notification journey maps that show how trigger sequences support habit formation and user engagement',
      'Use feedback loop analysis to understand how notifications influence user behavior and long-term engagement patterns',
      'Apply ethical design principles to ensure notifications serve user needs rather than exploiting psychological vulnerabilities',
      'Plan notification analytics that measure both engagement metrics and user satisfaction with notification experience'
    ],
    industrySpecific: {
      fintech: [
        'Design financial notifications that build trust through transparency while prompting timely financial actions',
        'Focus on security and fraud alert notifications that balance user safety with notification fatigue management',
        'Create financial goal and milestone notifications that support positive financial behavior habit formation'
      ],
      healthcare: [
        'Design health reminder notifications that support medication adherence and appointment management without anxiety',
        'Focus on care coordination notifications that facilitate provider communication and patient engagement',
        'Create wellness and prevention notifications that encourage positive health behavior habit development'
      ],
      ecommerce: [
        'Design purchase and promotion notifications that enhance shopping experience without appearing manipulative',
        'Focus on personalized recommendation notifications that align with individual shopping behavior patterns',
        'Create post-purchase notifications that support customer satisfaction and encourage repeat engagement'
      ],
      saas: [
        'Design productivity and workflow notifications that support feature adoption without interrupting user focus',
        'Focus on collaboration notifications that facilitate team communication while respecting individual work patterns',
        'Create learning and onboarding notifications that guide feature discovery and skill development progressively'
      ],
      education: [
        'Design learning reminder notifications that support study habits and assignment completion without stress induction',
        'Focus on collaborative learning notifications that encourage peer interaction and group participation',
        'Create achievement and progress notifications that motivate continued learning engagement and skill development'
      ]
    },
    qualityAssurance: [
      'Validate notification effectiveness through user engagement metrics and satisfaction feedback collection',
      'Test notification strategy impact on long-term user retention and habit formation success',
      'Monitor notification unsubscribe rates and user feedback to identify notification fatigue and optimization opportunities',
      'Plan notification strategy iteration based on user behavior data and changing engagement pattern analysis'
    ],
    aiOptimization: [
      'Generate notification strategies that balance user engagement with ethical design principles and user wellbeing',
      'Create personalization frameworks that adapt notification approaches to individual user psychology and preferences',
      'Design habit formation approaches that use notifications to support positive user behavior change and goal achievement',
      'Include predictive notification timing that anticipates optimal user receptivity and contextual appropriateness'
    ]
  }
} as const;

/**
 * Get enhanced instructions for a specific tool using the new tool-specific system
 * @deprecated Use getToolSpecificInstructions instead for context-aware prompts
 */
export function getEnhancedInstructions(toolId: string, industry?: string): string[] {
  // For backwards compatibility, create a mock context
  const mockContext: ToolPromptContext = {
    framework: { id: 'generic', name: 'Generic Framework' } as any,
    stage: { id: 'generic', name: 'Generic Stage' } as any,
    tool: { id: toolId, name: toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) } as any
  };

  try {
    const specificInstructions = generateToolSpecificInstructions(mockContext);
    return [
      specificInstructions.promptTemplate,
      ...specificInstructions.contextualGuidance,
      ...specificInstructions.knowledgeIntegrationInstructions
    ];
  } catch (error) {
    console.warn('Falling back to legacy instructions for tool:', toolId);
    
    const toolCategory = getToolCategory(toolId);
    const instructions = getInstructionSet(toolCategory, toolId);
    
    if (!instructions) {
      return ['Generate comprehensive, actionable guidance for this UX tool'];
    }

    const allInstructions = [
      ...instructions.core,
      ...instructions.methodology,
      ...instructions.qualityAssurance,
      ...instructions.aiOptimization,
      ...(instructions.knowledgeIntegration || generateKnowledgeIntegrationInstructions(toolId))
    ];

    // Add industry-specific instructions if available
    if (industry && instructions.industrySpecific[industry]) {
      allInstructions.push(...instructions.industrySpecific[industry]);
    }

    return allInstructions;
  }
}

/**
 * Get tool category based on tool ID
 */
function getToolCategory(toolId: string): 'research' | 'design' | 'testing' | 'ideation' {
  if (toolId.includes('interview') || toolId.includes('persona') || toolId.includes('survey') || toolId.includes('observation')) {
    return 'research';
  }
  if (toolId.includes('journey') || toolId.includes('wireframe') || toolId.includes('map')) {
    return 'design';
  }
  if (toolId.includes('testing') || toolId.includes('usability') || toolId.includes('test')) {
    return 'testing';
  }
  return 'ideation';
}

/**
 * Get instruction set based on category and tool ID
 */
function getInstructionSet(category: string, toolId: string): EnhancedInstructionSet | null {
  // Normalize tool ID for lookup
  const normalizedToolId = normalizeToolId(toolId);
  
  switch (category) {
    case 'research':
      return RESEARCH_TOOL_INSTRUCTIONS[normalizedToolId as keyof typeof RESEARCH_TOOL_INSTRUCTIONS] || null;
    case 'design':
      return DESIGN_TOOL_INSTRUCTIONS[normalizedToolId as keyof typeof DESIGN_TOOL_INSTRUCTIONS] || null;
    case 'testing':
      return RESEARCH_TOOL_INSTRUCTIONS[normalizedToolId as keyof typeof RESEARCH_TOOL_INSTRUCTIONS] || null;
    case 'ideation':
      return DESIGN_TOOL_INSTRUCTIONS[normalizedToolId as keyof typeof DESIGN_TOOL_INSTRUCTIONS] || null;
    default:
      return null;
  }
}

/**
 * Normalize tool ID for consistent lookup
 */
function normalizeToolId(toolId: string): string {
  // Handle common variations
  const normalizations: Record<string, string> = {
    'user-interviews': 'user-interviews',
    'empathy-maps': 'personas',
    'empathy-maps-dt': 'personas',
    'empathy-map': 'personas',
    'affinity-mapping': 'affinity-mapping',
    'journey-maps': 'journey-maps',
    'customer-journey-mapping': 'journey-maps',
    'usability-tests': 'usability-tests',
    'usability-testing': 'usability-tests',
    'wireframing': 'wireframes',
    'wire-frames': 'wireframes',
    'idea-generation': 'brainstorming',
    'ideation': 'brainstorming',
    'observations': 'observations',
    'how-might-we': 'how-might-we',
    'stakeholder-interviews': 'stakeholder-interviews',
    'contextual-inquiry': 'contextual-inquiry',
    'synthesis-workshops': 'synthesis-workshops',
    'expert-interviews': 'expert-interviews',
    'job-steps': 'job-steps',
    'hypothesis-canvas': 'hypothesis-canvas',
    'user-story-mapping': 'user-story-mapping',
    'notification-strategy': 'notification-strategy',
    'surveys-heart': 'surveys'
  };

  return normalizations[toolId] || toolId;
}

/**
 * Generate standard knowledge integration instructions for any UX tool
 */
function generateKnowledgeIntegrationInstructions(toolType: string): string[] {
  const baseInstructions = [
    'CRITICAL: Before generating any AI prompt, the system must first analyze and incorporate ALL available project knowledge base content to ensure contextually relevant and informed outputs',
    'Use project knowledge to customize all tool guidance to the specific domain, user types, business context, and organizational constraints documented in the knowledge base',
    'Reference specific user insights, pain points, behaviors, and feedback mentioned in the project knowledge to create targeted and relevant tool applications',
    'Incorporate industry-specific terminology, processes, regulations, and constraints identified in the project knowledge base into all tool methodologies',
    'Leverage any existing research, data, personas, journey maps, or previous tool outputs in the knowledge base to inform current tool application and avoid redundancy',
    'Adapt tool methodology and focus based on organizational culture, team structure, resource constraints, and project timelines documented in the knowledge base',
    'Align all tool outputs with project goals, success metrics, business objectives, and strategic outcomes documented in the knowledge base'
  ];

  return baseInstructions;
}