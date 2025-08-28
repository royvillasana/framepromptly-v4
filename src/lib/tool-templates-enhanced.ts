/**
 * @fileoverview Enhanced UX tool templates with research-backed instructions
 * This replaces the basic tool templates with comprehensive, research-driven instructions
 */

import { getEnhancedInstructions } from './enhanced-tool-instructions';
import { frameworkIntegrationService } from './framework-integration-service';

export interface PromptVariable {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'multiselect';
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface CustomizationOption {
  id: string;
  label: string;
  type: 'select' | 'number' | 'checkbox' | 'text' | 'multiselect';
  options?: string[];
  default?: any;
  description: string;
  category?: 'methodology' | 'output' | 'constraints' | 'quality';
}

export interface QualityMetrics {
  completionTime: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  participantCount?: {
    min: number;
    max: number;
    recommended: number;
  };
  successCriteria: string[];
  outputQuality: {
    structure: string[];
    content: string[];
    usability: string[];
  };
}

export interface ResearchBacking {
  methodology: string[];
  bestPractices: string[];
  industryStandards: string[];
  references?: string[];
}

export interface EnhancedToolPromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'synthesis' | 'ideation' | 'validation' | 'prototyping' | 'testing' | 'design' | 'strategy';
  frameworks: string[];
  stages: string[];
  template: string;
  variables: PromptVariable[];
  instructions: string[];
  expectedOutput: string;
  qualityMetrics: QualityMetrics;
  researchBacking: ResearchBacking;
  customizationOptions?: CustomizationOption[];
  industryAdaptations?: {
    [industry: string]: {
      template: string;
      variables?: PromptVariable[];
      instructions?: string[];
      considerations: string[];
    };
  };
}

/**
 * Enhanced tool templates with comprehensive research-backed instructions
 */
export const enhancedToolPromptTemplates: EnhancedToolPromptTemplate[] = [
  // RESEARCH TOOLS
  {
    id: 'user-interviews',
    name: 'User Interview Guide',
    description: 'Generate comprehensive interview guides using funnel technique and behavioral research methods',
    category: 'research',
    frameworks: ['design-thinking', 'human-centered-design', 'double-diamond'],
    stages: ['empathize', 'discover', 'research', 'hear'],
    template: `# Research-Backed User Interview Guide: {{projectName}}

## Strategic Research Framework
**Primary Research Question:** {{primaryResearchQuestion}}
**Target User Segment:** {{targetUserSegment}}
**Interview Duration:** {{duration}} minutes
**Methodology:** Structured funnel technique with behavioral observation
**Sample Size:** {{sampleSize}} participants for thematic saturation

## Pre-Interview Protocol
### Participant Preparation
- **Recruitment Criteria:** {{recruitmentCriteria}}
- **Screening Questions:** Verify target segment alignment and availability
- **Consent & Recording:** Obtain informed consent for recording and data use
- **Environment Setup:** Ensure comfortable, distraction-free interview space

### Interviewer Preparation
- **Research Objectives Review:** {{researchObjectives}}
- **Persona Hypothesis Validation:** Test existing assumptions about user needs
- **Bias Mitigation Strategies:** Prepare neutral questioning approach

## Interview Structure (Funnel Technique)

### Phase 1: Rapport Building (5-7 minutes)
**Objective:** Establish psychological safety and participant comfort
- Tell me a bit about yourself and your role
- How long have you been in [relevant context]?
- What does a typical day look like for you?

### Phase 2: Context Exploration (8-12 minutes)
**Objective:** Understand participant's environment and background
- Walk me through how you currently [relevant process/task]
- What tools or methods do you use for [relevant activity]?
- How did you learn to do [relevant process] this way?

### Phase 3: Behavioral Deep Dive (15-20 minutes)
**Objective:** Uncover actual behaviors and mental models
**Critical Incident Questions:**
- Tell me about the last time you [relevant activity] - walk me through it step by step
- Describe a time when [process] didn't go as expected - what happened?
- What's the most frustrating part of [relevant process]? Can you give me a specific example?

**5 Whys Exploration:**
- Why is [identified issue] problematic for you?
- What makes that particularly challenging?
- How does that affect your [work/goals/outcomes]?

### Phase 4: Pain Point Analysis (10-15 minutes)
**Objective:** Identify frustrations and barriers
- If you could wave a magic wand and change one thing about [process], what would it be?
- What workarounds have you developed to deal with [identified challenges]?
- How do these challenges affect others on your team/in your organization?

### Phase 5: Aspiration Discovery (8-10 minutes)
**Objective:** Understand desired outcomes and motivations
- What would success look like for you in [relevant context]?
- How would you know if a solution was working well?
- What would need to be true for you to change your current approach?

### Phase 6: Validation & Wrap-up (5-7 minutes)
**Objective:** Validate insights and gather additional context
- Of everything we've discussed, what feels most important to you?
- Is there anything I should have asked but didn't?
- Who else should I talk to who might have a different perspective?

## Post-Interview Protocol
### Immediate Actions (within 2 hours)
- Complete behavioral observation notes
- Document environmental and contextual factors
- Rate interview quality and participant engagement
- Identify follow-up questions for future interviews

### Analysis Framework (within 48 hours)
- **Thematic Analysis:** Apply 6-phase thematic analysis methodology
- **Behavioral Mapping:** Document observed vs. stated behaviors
- **Mental Model Documentation:** Capture decision-making processes
- **Quote Collection:** Preserve authentic user language and expressions

## Research Quality Assurance
### Validity Measures
- **Triangulation:** Cross-reference with other research methods
- **Saturation Assessment:** Continue until no new themes emerge
- **Inter-rater Reliability:** Have multiple team members analyze key interviews
- **Member Checking:** Validate findings with participants when appropriate

### Success Criteria
- Uncover minimum 3-5 actionable insights per interview
- Validate or challenge existing assumptions about user needs
- Document distinct behavioral patterns across user segments
- Achieve 80%+ participant satisfaction with interview experience

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Accessibility & Inclusion Protocol
- **Language Accessibility:** Use clear, jargon-free language appropriate to participant literacy levels
- **Assistive Technology Support:** Ensure interview methods accommodate various accessibility needs
- **Cultural Sensitivity:** Adapt questioning style and topics for cultural context
- **Diverse Participation:** Ensure representative sampling across demographic dimensions`,

    variables: [
      {
        id: 'projectName',
        name: 'Project Name',
        type: 'text',
        required: true,
        description: 'Name of the project or product being researched'
      },
      {
        id: 'primaryResearchQuestion',
        name: 'Primary Research Question',
        type: 'textarea',
        required: true,
        description: 'Main question this research aims to answer'
      },
      {
        id: 'targetUserSegment',
        name: 'Target User Segment',
        type: 'text',
        required: true,
        description: 'Specific user segment to interview (be precise)'
      },
      {
        id: 'duration',
        name: 'Interview Duration',
        type: 'select',
        required: true,
        description: 'Planned duration for each interview',
        options: ['30', '45', '60', '75', '90']
      },
      {
        id: 'sampleSize',
        name: 'Target Sample Size',
        type: 'number',
        required: true,
        description: 'Number of participants to interview (5-8 recommended for thematic saturation)',
        validation: {
          min: 3,
          max: 20,
          message: 'Sample size should be between 3 and 20 participants'
        }
      },
      {
        id: 'researchObjectives',
        name: 'Research Objectives',
        type: 'textarea',
        required: true,
        description: 'List of specific objectives this research will achieve'
      },
      {
        id: 'recruitmentCriteria',
        name: 'Recruitment Criteria',
        type: 'textarea',
        required: false,
        description: 'Specific criteria for participant recruitment'
      }
    ],

    instructions: getEnhancedInstructions('user-interviews'),

    expectedOutput: `Comprehensive interview guide including:
- Structured question sequences using proven research methodologies
- Pre and post-interview protocols with quality assurance measures
- Behavioral observation frameworks and analysis guidelines
- Industry-specific adaptations and accessibility considerations
- Success criteria and validation frameworks for research quality`,

    qualityMetrics: {
      completionTime: '3-4 hours to create, 1-2 hours per interview',
      difficultyLevel: 'intermediate',
      participantCount: {
        min: 5,
        max: 12,
        recommended: 8
      },
      successCriteria: [
        'Generate 3-5 actionable insights per interview',
        'Achieve thematic saturation across participant set',
        'Validate or challenge existing user assumptions',
        'Maintain 80%+ participant satisfaction score'
      ],
      outputQuality: {
        structure: [
          'Clear interview flow from rapport to wrap-up',
          'Logical question progression using funnel technique',
          'Appropriate time allocation for each interview phase'
        ],
        content: [
          'Open-ended questions that encourage storytelling',
          'Behavioral focus over stated preferences',
          'Industry-appropriate terminology and considerations'
        ],
        usability: [
          'Easy-to-follow format for interviewer',
          'Clear instructions for each interview phase',
          'Practical post-interview analysis guidance'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Funnel technique for progressive question depth',
        'Critical incident technique for behavioral insights',
        '5 Whys methodology for root cause analysis',
        'Thematic analysis framework for systematic insight extraction'
      ],
      bestPractices: [
        'Individual interviews provide deeper insights than focus groups',
        '5-8 participants typically achieve thematic saturation',
        'Behavioral observation more reliable than self-reported behaviors',
        'Open-ended questions generate richer qualitative data'
      ],
      industryStandards: [
        'GDPR compliance for data collection and storage',
        'Accessibility standards for inclusive research participation',
        'Industry-specific regulations (HIPAA for healthcare, PCI for fintech)',
        'Ethical research guidelines from professional UX organizations'
      ]
    },

    customizationOptions: [
      {
        id: 'includeTaskScenarios',
        label: 'Include Task-Based Scenarios',
        type: 'checkbox',
        default: false,
        description: 'Add realistic task scenarios for behavioral observation',
        category: 'methodology'
      },
      {
        id: 'focusArea',
        label: 'Primary Focus Area',
        type: 'select',
        options: ['Usability', 'User Needs', 'Decision Making', 'Emotional Experience', 'Workflow Integration'],
        default: 'User Needs',
        description: 'Main area of focus for interview questions',
        category: 'output'
      },
      {
        id: 'methodologyDepth',
        label: 'Methodology Depth',
        type: 'select',
        options: ['Basic', 'Intermediate', 'Advanced'],
        default: 'Intermediate',
        description: 'Level of research methodology detail to include',
        category: 'quality'
      },
      {
        id: 'timeConstraints',
        label: 'Time Constraints',
        type: 'select',
        options: ['Flexible', 'Limited', 'Strict'],
        default: 'Flexible',
        description: 'How strict are the time constraints for this research?',
        category: 'constraints'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services context and compliance considerations',
        considerations: [
          'Address trust and security concerns explicitly',
          'Include questions about financial decision-making processes',
          'Explore regulatory compliance understanding',
          'Consider cross-device usage for financial tasks'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare context and HIPAA compliance',
        considerations: [
          'Ensure HIPAA compliance in all procedures',
          'Include caregiver relationship questions',
          'Address varying health literacy levels',
          'Explore emotional aspects with sensitivity'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce context and shopping behaviors',
        considerations: [
          'Include multichannel shopping behavior questions',
          'Explore purchase decision-making factors',
          'Ask about post-purchase experiences',
          'Consider seasonal and promotional influences'
        ]
      },
      saas: {
        template: 'Enhanced with SaaS context and B2B considerations',
        considerations: [
          'Focus on workflow integration patterns',
          'Explore team collaboration needs',
          'Ask about tool adoption challenges',
          'Consider organizational decision-making processes'
        ]
      },
      education: {
        template: 'Enhanced with educational context and learning needs',
        considerations: [
          'Consider diverse learning styles',
          'Explore motivation and engagement factors',
          'Ask about collaborative learning preferences',
          'Address institutional constraints'
        ]
      }
    }
  },

  {
    id: 'personas',
    name: 'Evidence-Based User Persona Development',
    description: 'Create research-backed user personas using triangulation methodology and behavioral data',
    category: 'synthesis',
    frameworks: ['design-thinking', 'human-centered-design', 'jobs-to-be-done'],
    stages: ['define', 'synthesize', 'persona-creation'],
    template: `# Research-Based User Persona: {{personaName}}

## Persona Development Methodology
**Data Sources:** {{dataSources}}
**Research Methods:** {{researchMethods}}
**Sample Size:** {{sampleSize}} participants
**Validation Approach:** {{validationApproach}}
**Confidence Level:** {{confidenceLevel}}%

## Persona Profile

### Core Identity
- **Name:** {{personaName}}
- **Archetype:** {{personaArchetype}}
- **Quote:** "{{personalQuote}}"
- **Photo:** Diverse representation avoiding stereotypes

### Demographics & Context
- **Age Range:** {{ageRange}}
- **Location:** {{location}}
- **Occupation:** {{occupation}}
- **Education:** {{educationLevel}}
- **Income Range:** {{incomeRange}}
- **Living Situation:** {{livingSituation}}
- **Technology Proficiency:** {{techProficiency}}

## Behavioral Profile

### Goals Hierarchy (Jobs-to-be-Done Framework)
#### Functional Jobs
**Primary Goal:** {{primaryGoal}}
**Supporting Goals:**
{{#each supportingGoals}}
- {{this}}
{{/each}}

#### Emotional Jobs
**Desired Feelings:** {{desiredFeelings}}
**Status/Identity Goals:** {{identityGoals}}

#### Social Jobs
**Social Context:** {{socialContext}}
**Influence Factors:** {{influenceFactors}}

### Behavioral Patterns
#### Daily Routines & Workflows
{{dailyRoutines}}

#### Decision-Making Process
**Information Gathering:** {{informationGathering}}
**Evaluation Criteria:** {{evaluationCriteria}}
**Decision Triggers:** {{decisionTriggers}}

#### Technology Usage Patterns
**Primary Devices:** {{primaryDevices}}
**Preferred Channels:** {{preferredChannels}}
**Usage Context:** {{usageContext}}

## Pain Points & Frustrations

### Current State Challenges
{{#each currentChallenges}}
- **{{@key}}:** {{this}}
{{/each}}

### Friction Areas
{{#each frictionAreas}}
- {{this}}
{{/each}}

### Unmet Needs
{{#each unmetNeeds}}
- {{this}}
{{/each}}

## Motivations & Drivers

### Intrinsic Motivators
{{#each intrinsicMotivators}}
- {{this}}
{{/each}}

### Extrinsic Motivators
{{#each extrinsicMotivators}}
- {{this}}
{{/each}}

### Success Criteria
**Personal Definition of Success:** {{successDefinition}}
**Key Performance Indicators:** {{personalKPIs}}

## Contextual Factors

### Environmental Constraints
{{environmentalConstraints}}

### Organizational Context (if applicable)
{{organizationalContext}}

### Social & Cultural Influences
{{socialCulturalInfluences}}

## Persona Validation Framework

### Research Evidence
**Supporting Quotes:** 
{{#each supportingQuotes}}
- "{{this}}"
{{/each}}

**Behavioral Observations:** {{behavioralObservations}}
**Quantitative Data Points:** {{quantitativeData}}

### Team Validation
**Stakeholder Feedback:** {{stakeholderFeedback}}
**User-Facing Team Validation:** {{teamValidation}}

### Ongoing Updates
**Review Schedule:** {{reviewSchedule}}
**Update Triggers:** {{updateTriggers}}

## Design Implications

### Interface Preferences
{{interfacePreferences}}

### Content Strategy
{{contentStrategy}}

### Interaction Patterns
{{interactionPatterns}}

### Accessibility Considerations
{{accessibilityConsiderations}}

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}`,

    variables: [
      {
        id: 'personaName',
        name: 'Persona Name',
        type: 'text',
        required: true,
        description: 'Memorable name that reflects the user segment'
      },
      {
        id: 'dataSources',
        name: 'Data Sources Used',
        type: 'textarea',
        required: true,
        description: 'List all research data sources used to create this persona'
      },
      {
        id: 'researchMethods',
        name: 'Research Methods',
        type: 'textarea',
        required: true,
        description: 'Research methodologies used (interviews, surveys, analytics, etc.)'
      },
      {
        id: 'sampleSize',
        name: 'Research Sample Size',
        type: 'number',
        required: true,
        description: 'Total number of users researched for this persona',
        validation: {
          min: 5,
          max: 500,
          message: 'Sample size should be between 5 and 500 participants'
        }
      },
      {
        id: 'confidenceLevel',
        name: 'Confidence Level',
        type: 'select',
        required: true,
        options: ['60', '70', '80', '90', '95'],
        description: 'Confidence level in persona accuracy based on data quality'
      },
      {
        id: 'primaryGoal',
        name: 'Primary Functional Goal',
        type: 'textarea',
        required: true,
        description: 'Main job-to-be-done this persona is trying to accomplish'
      },
      {
        id: 'personaArchetype',
        name: 'Persona Archetype',
        type: 'text',
        required: false,
        description: 'Broad category or archetype this persona represents'
      }
    ],

    instructions: getEnhancedInstructions('personas'),

    expectedOutput: `Evidence-based persona including:
- Research-backed behavioral patterns and decision-making processes
- Goals hierarchy using Jobs-to-be-Done framework
- Validation framework with supporting evidence and team buy-in
- Design implications and accessibility considerations
- Industry-specific adaptations and contextual factors`,

    qualityMetrics: {
      completionTime: '4-6 hours including research synthesis and validation',
      difficultyLevel: 'intermediate',
      participantCount: {
        min: 15,
        max: 100,
        recommended: 30
      },
      successCriteria: [
        'Create 2-3 distinct, evidence-based personas',
        'Include direct quotes and behavioral observations',
        'Validate personas with user-facing team members',
        'Define clear design implications for each persona'
      ],
      outputQuality: {
        structure: [
          'Clear persona hierarchy from demographics to implications',
          'Logical flow from goals to behaviors to design needs',
          'Comprehensive validation and evidence section'
        ],
        content: [
          'Specific, actionable behavioral insights',
          'Authentic voice through direct quotes',
          'Clear connection between research and persona attributes'
        ],
        usability: [
          'Easy reference format for design teams',
          'Clear design implications and recommendations',
          'Regular update schedule and maintenance plan'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Triangulation method combining multiple data sources',
        'Jobs-to-be-Done framework for goal hierarchy',
        'Behavioral observation over self-reported preferences',
        'Cluster analysis for user segmentation validation'
      ],
      bestPractices: [
        '3-5 personas maximum to maintain team focus',
        'Regular validation with user-facing team members',
        'Quarterly updates based on new research and analytics',
        'Focus on behaviors and goals over demographic details'
      ],
      industryStandards: [
        'Include accessibility considerations for inclusive design',
        'Comply with data privacy regulations in persona creation',
        'Follow diversity and inclusion guidelines in representation',
        'Align with business objectives and strategic goals'
      ]
    },

    customizationOptions: [
      {
        id: 'personaCount',
        label: 'Number of Personas',
        type: 'number',
        default: 3,
        description: 'How many personas should be created? (2-5 recommended)',
        category: 'output'
      },
      {
        id: 'detailLevel',
        label: 'Detail Level',
        type: 'select',
        options: ['Essential', 'Detailed', 'Comprehensive'],
        default: 'Detailed',
        description: 'Level of detail to include in persona development',
        category: 'output'
      },
      {
        id: 'validationMethod',
        label: 'Validation Method',
        type: 'select',
        options: ['Team Review', 'User Validation', 'Statistical Analysis', 'Combined'],
        default: 'Combined',
        description: 'Method for validating persona accuracy',
        category: 'quality'
      },
      {
        id: 'updateFrequency',
        label: 'Update Frequency',
        type: 'select',
        options: ['Monthly', 'Quarterly', 'Bi-annually', 'Annually'],
        default: 'Quarterly',
        description: 'How often should personas be reviewed and updated?',
        category: 'quality'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services persona attributes',
        considerations: [
          'Include financial literacy levels and investment experience',
          'Address regulatory compliance awareness and security behaviors',
          'Include income sources, financial goals, and debt management approaches',
          'Consider risk tolerance and decision-making under uncertainty'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare persona attributes',
        considerations: [
          'Include health literacy levels and caregiver relationships',
          'Address accessibility needs and assistive technology usage',
          'Include healthcare team relationships and decision-making authority',
          'Consider medical conditions and treatment complexity'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce persona attributes',
        considerations: [
          'Include shopping preferences and brand loyalty patterns',
          'Address multichannel shopping behaviors and device usage',
          'Include social influence factors and review consumption habits',
          'Consider seasonal shopping patterns and price sensitivity'
        ]
      },
      saas: {
        template: 'Enhanced with SaaS persona attributes',
        considerations: [
          'Include technical proficiency and tool adoption patterns',
          'Address team roles, decision-making authority, and budget influence',
          'Include integration requirements and workflow customization needs',
          'Consider organizational change management and training needs'
        ]
      },
      education: {
        template: 'Enhanced with educational persona attributes',
        considerations: [
          'Include learning preferences and technology comfort levels',
          'Address institutional constraints and administrative requirements',
          'Include collaboration preferences and peer interaction styles',
          'Consider motivation factors and engagement patterns'
        ]
      }
    }
  },

  {
    id: 'usability-tests',
    name: 'Comprehensive Usability Testing Plan',
    description: 'Design systematic usability testing protocols with statistical rigor and inclusive methodology',
    category: 'testing',
    frameworks: ['design-thinking', 'lean-ux', 'human-centered-design'],
    stages: ['test', 'validate', 'measure'],
    template: `# Evidence-Based Usability Testing Plan: {{projectName}}

## Testing Strategy Framework
**Testing Objective:** {{testingObjective}}
**Primary Metrics:** {{primaryMetrics}}
**Secondary Metrics:** {{secondaryMetrics}}
**Testing Method:** {{testingMethod}}
**Statistical Requirements:** 95% confidence level, 80% statistical power

## Participant Strategy

### Sample Design
**Target Sample Size:** {{sampleSize}} participants
**Recruitment Method:** {{recruitmentMethod}}
**Screening Criteria:** {{screeningCriteria}}
**Diversity Requirements:** Representative sampling across key demographic dimensions

### Participant Profiles
{{#each participantProfiles}}
**Profile {{@index}}:** {{this}}
{{/each}}

### Accessibility Inclusion
**Assistive Technology Testing:** Include users of screen readers, voice control, and other accessibility tools
**Accommodation Requirements:** Provide appropriate accommodations for diverse abilities

## Testing Methodology

### Task Design
**Task Scenarios:** {{taskScenarios}}
**Task Success Criteria:** {{successCriteria}}
**Task Completion Metrics:** Success rate, time on task, error rate, satisfaction

### Protocol Structure
#### Pre-Test Phase (5-10 minutes)
- Participant consent and setup
- Background questionnaire
- Technology setup and comfort assessment
- Think-aloud protocol explanation

#### Testing Phase ({{testingDuration}} minutes)
{{#each tasks}}
**Task {{@index}}:** {{this.description}}
**Success Criteria:** {{this.success}}
**Expected Time:** {{this.time}}
{{/each}}

#### Post-Test Phase (10-15 minutes)
- System Usability Scale (SUS) questionnaire
- Retrospective interview
- Satisfaction and preference assessment
- Additional feedback collection

## Data Collection Framework

### Quantitative Metrics
**Task Completion Rate:** Target ≥{{completionRateTarget}}%
**Time on Task:** Baseline vs. target comparison
**Error Rate:** Critical vs. non-critical error tracking
**Efficiency Ratio:** Task completion / time spent

### Qualitative Metrics
**User Satisfaction:** SUS score target ≥{{susTarget}}
**Confidence Level:** Post-task confidence rating
**Perceived Usability:** Subjective usability assessment
**Emotional Response:** Frustration and satisfaction indicators

### Observational Data
**Behavioral Patterns:** Navigation and interaction patterns
**Error Recovery:** How users handle and recover from errors
**Help-Seeking Behavior:** When and how users seek assistance
**Cognitive Load Indicators:** Signs of confusion or uncertainty

## Testing Environment

### {{testingMethod}} Setup
{{#if (eq testingMethod "Moderated In-Person")}}
**Location:** Controlled testing laboratory
**Equipment:** Recording equipment, eye-tracking (if available), multiple devices
**Recording Setup:** Video, audio, and screen recording with participant consent
**Moderator Guidelines:** Neutral facilitation, minimal intervention during tasks
{{else if (eq testingMethod "Moderated Remote")}}
**Platform:** {{remotePlatform}}
**Technology Requirements:** Reliable internet, screen sharing capability
**Recording Setup:** Platform recording with participant consent
**Moderator Guidelines:** Remote facilitation best practices
{{else if (eq testingMethod "Unmoderated Remote")}}
**Platform:** {{remotePlatform}}
**Task Instructions:** Clear, detailed self-service instructions
**Quality Assurance:** Automated quality checks and response validation
{{/if}}

## Analysis Framework

### Statistical Analysis
**Significance Testing:** Chi-square for completion rates, t-tests for time metrics
**Confidence Level:** 95% confidence intervals for key metrics
**Effect Size Calculation:** Cohen's d for meaningful differences
**Sample Size Validation:** Post-hoc power analysis

### Qualitative Analysis
**Thematic Analysis:** 6-phase systematic approach for verbal data
**Issue Severity Rating:** Critical, High, Medium, Low based on impact and frequency
**Recommendation Prioritization:** Impact vs. effort matrix for improvement suggestions

## Quality Assurance

### Pilot Testing
**Pilot Sessions:** {{pilotSessionCount}} sessions before full testing
**Protocol Refinement:** Based on pilot feedback and technical validation
**Technical Validation:** System performance and recording quality verification

### Inter-Rater Reliability
**Multiple Observer Setup:** {{observerSetup}}
**Agreement Threshold:** ≥80% inter-rater agreement on issue identification
**Consensus Protocol:** Structured discussion for disagreement resolution

## Reporting Framework

### Executive Summary
- Key findings and business implications
- Usability score and industry benchmarking
- Priority recommendations with expected impact

### Detailed Findings
- Task-by-task performance analysis
- User segment comparisons and insights
- Issue identification with supporting evidence

### Actionable Recommendations
- Prioritized improvement suggestions
- Implementation difficulty assessment
- Expected impact and success metrics

## Success Criteria & Next Steps

### Testing Success Metrics
- Complete {{sampleSize}} valid sessions with target participants
- Achieve statistical significance in primary metrics
- Identify minimum {{minIssues}} actionable usability issues
- Generate {{recommendationCount}} prioritized recommendations

### Follow-Up Protocol
**Immediate Actions:** Critical issue communication to development team
**Short-term Planning:** Iteration roadmap with timeline and ownership
**Long-term Strategy:** Ongoing testing schedule and continuous measurement

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Risk Mitigation
**Technical Risks:** Platform failures, recording issues, connectivity problems
**Participant Risks:** No-shows, inadequate screening, bias in responses
**Timeline Risks:** Extended recruitment, analysis delays, stakeholder availability`,

    variables: [
      {
        id: 'projectName',
        name: 'Project/Product Name',
        type: 'text',
        required: true,
        description: 'Name of the product or feature being tested'
      },
      {
        id: 'testingObjective',
        name: 'Primary Testing Objective',
        type: 'textarea',
        required: true,
        description: 'Main goal and research questions for this usability test'
      },
      {
        id: 'testingMethod',
        name: 'Testing Method',
        type: 'select',
        required: true,
        options: ['Moderated In-Person', 'Moderated Remote', 'Unmoderated Remote', 'Hybrid'],
        description: 'Primary testing methodology to be used'
      },
      {
        id: 'sampleSize',
        name: 'Target Sample Size',
        type: 'number',
        required: true,
        description: 'Number of participants needed (5-8 for qualitative, 30+ for quantitative)',
        validation: {
          min: 5,
          max: 100,
          message: 'Sample size should be between 5 and 100 participants'
        }
      },
      {
        id: 'primaryMetrics',
        name: 'Primary Success Metrics',
        type: 'textarea',
        required: true,
        description: 'Key metrics that will determine testing success'
      },
      {
        id: 'completionRateTarget',
        name: 'Task Completion Rate Target',
        type: 'number',
        required: true,
        description: 'Target completion rate percentage (e.g., 85)',
        validation: {
          min: 50,
          max: 100,
          message: 'Completion rate target should be between 50% and 100%'
        }
      },
      {
        id: 'susTarget',
        name: 'SUS Score Target',
        type: 'number',
        required: true,
        description: 'Target System Usability Scale score (68 is average, 80+ is excellent)',
        validation: {
          min: 0,
          max: 100,
          message: 'SUS score should be between 0 and 100'
        }
      },
      {
        id: 'testingDuration',
        name: 'Testing Session Duration',
        type: 'select',
        required: true,
        options: ['30', '45', '60', '90'],
        description: 'Duration of each testing session in minutes'
      }
    ],

    instructions: getEnhancedInstructions('usability-tests'),

    expectedOutput: `Comprehensive testing plan including:
- Statistically rigorous methodology with appropriate sample sizes
- Inclusive participant recruitment with accessibility considerations
- Structured protocol with quantitative and qualitative measurement
- Analysis framework with statistical significance testing
- Quality assurance measures and validation protocols`,

    qualityMetrics: {
      completionTime: '6-8 hours for plan creation, 2-3 hours per session',
      difficultyLevel: 'advanced',
      participantCount: {
        min: 5,
        max: 30,
        recommended: 8
      },
      successCriteria: [
        'Design statistically valid testing protocol',
        'Include comprehensive accessibility considerations',
        'Create actionable analysis and reporting framework',
        'Establish clear quality assurance measures'
      ],
      outputQuality: {
        structure: [
          'Logical flow from strategy through execution to analysis',
          'Clear separation of quantitative and qualitative measures',
          'Comprehensive risk mitigation and contingency planning'
        ],
        content: [
          'Statistically rigorous methodology and sample size calculations',
          'Inclusive design with accessibility and diversity considerations',
          'Actionable analysis framework with clear success criteria'
        ],
        usability: [
          'Easy-to-follow protocol for research team execution',
          'Clear templates and checklists for consistent implementation',
          'Practical timeline and resource requirements'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Nielsen\'s recommendation of 5 users for qualitative insights',
        'Statistical power analysis for quantitative studies',
        'Think-aloud protocol for cognitive process insight',
        'System Usability Scale (SUS) for standardized measurement'
      ],
      bestPractices: [
        'Pilot testing prevents protocol issues and improves data quality',
        'Mixed methods (quantitative + qualitative) provide comprehensive insights',
        'Task scenarios should reflect realistic user goals and contexts',
        'Accessibility testing ensures inclusive design validation'
      ],
      industryStandards: [
        'WCAG 2.1 AA compliance for accessibility testing',
        'ISO 9241-11 standard for usability measurement',
        'Statistical significance testing for reliable conclusions',
        'Ethical guidelines for user research and data privacy'
      ]
    },

    customizationOptions: [
      {
        id: 'includeAccessibilityTesting',
        label: 'Include Accessibility Testing',
        type: 'checkbox',
        default: true,
        description: 'Include participants with disabilities and assistive technology users',
        category: 'methodology'
      },
      {
        id: 'statisticalRigor',
        label: 'Statistical Rigor Level',
        type: 'select',
        options: ['Qualitative Focus', 'Mixed Methods', 'Quantitative Focus'],
        default: 'Mixed Methods',
        description: 'Balance between qualitative insights and quantitative validation',
        category: 'methodology'
      },
      {
        id: 'timelineUrgency',
        label: 'Timeline Urgency',
        type: 'select',
        options: ['Flexible', 'Standard', 'Rush'],
        default: 'Standard',
        description: 'How urgent are the testing results needed?',
        category: 'constraints'
      },
      {
        id: 'budgetLevel',
        label: 'Budget Level',
        type: 'select',
        options: ['Limited', 'Standard', 'Premium'],
        default: 'Standard',
        description: 'Available budget for testing (affects recruitment and tools)',
        category: 'constraints'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services testing considerations',
        considerations: [
          'Include testing of security features and trust indicators',
          'Test regulatory compliance interfaces for usability',
          'Consider financial decision-making complexity in task design',
          'Address privacy and security concerns in participant recruitment'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare testing considerations',
        considerations: [
          'Ensure HIPAA compliance and patient privacy protection',
          'Include accessibility testing with diverse ability levels',
          'Test clinical accuracy and safety of health information',
          'Consider caregiver and family decision-making contexts'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce testing considerations',
        considerations: [
          'Test conversion funnels and purchase completion flows',
          'Include cross-device and cross-channel testing scenarios',
          'Test product discovery and comparison features',
          'Consider seasonal and promotional influences on behavior'
        ]
      },
      saas: {
        template: 'Enhanced with SaaS testing considerations',
        considerations: [
          'Test complex workflows and multi-user collaboration',
          'Include onboarding and feature discovery testing',
          'Test integration scenarios with other business tools',
          'Consider organizational decision-making and approval processes'
        ]
      },
      education: {
        template: 'Enhanced with educational testing considerations',
        considerations: [
          'Test with diverse learning styles and accessibility needs',
          'Include collaborative features and peer interaction testing',
          'Test across different devices and learning contexts',
          'Consider institutional constraints and administrative requirements'
        ]
      }
    }
  },

  // ADDITIONAL RESEARCH TOOLS
  {
    id: 'surveys',
    name: 'Quantitative Survey Research',
    description: 'Design statistically valid surveys using psychometric principles and validated question formats',
    category: 'research',
    frameworks: ['design-thinking', 'heart-framework'],
    stages: ['empathize', 'discover', 'happiness'],
    template: `You are an expert UX researcher with advanced training in survey methodology and statistical analysis. Using the project knowledge provided: {knowledge_context}, create a comprehensive quantitative survey design that follows established psychometric principles and yields statistically significant insights.

# Quantitative Survey Design: {{projectName}}

## Research Strategy Framework
**Primary Research Objective:** {{primaryResearchObjective}}
**Target Population:** {{targetPopulation}}
**Sample Size Required:** {{sampleSize}} participants for {{confidenceLevel}}% confidence level
**Survey Distribution Method:** {{distributionMethod}}
**Expected Response Rate:** {{expectedResponseRate}}%
**Statistical Analysis Plan:** {{analysisMethod}}

## Pre-Survey Planning

### Population and Sampling Strategy
- **Target Demographics:** {{targetDemographics}}
- **Inclusion Criteria:** {{inclusionCriteria}}
- **Exclusion Criteria:** {{exclusionCriteria}}
- **Sampling Method:** {{samplingMethod}} (random, stratified, convenience, etc.)
- **Power Analysis:** Calculated sample size ensures {{statisticalPower}}% power to detect {{effectSize}} effect size

### Question Development Framework
- **Validated Instruments:** Incorporate established scales where appropriate (SUS, Net Promoter Score, etc.)
- **Question Types Balance:** {{percentClosedEnded}}% closed-ended for quantitative analysis, {{percentOpenEnded}}% open-ended for qualitative insights
- **Response Scale Selection:** Use appropriate scales (5-point Likert, semantic differential, ranking) based on measurement objectives
- **Cognitive Load Management:** Average completion time target: {{completionTimeTarget}} minutes

## Survey Structure and Design

### Section 1: Screening and Demographics
**Screening Questions:**
{{#each screeningQuestions}}
- {{this.question}} [{{this.type}}]
{{/each}}

**Demographics Collection:**
- Collect at survey end to avoid priming effects
- Include only necessary demographic variables for analysis
- Ensure inclusive language and response options

### Section 2: Main Research Questions
{{#each mainSections}}
**Section: {{this.title}}**
**Measurement Objective:** {{this.objective}}

{{#each this.questions}}
- **Question {{@index}}:** {{this.text}}
- **Scale:** {{this.scale}}
- **Required:** {{this.required}}
- **Logic:** {{this.skipLogic}}
{{/each}}
{{/each}}

### Section 3: Validation and Quality Control
- **Attention Check Questions:** Include {{attentionCheckCount}} attention checks to identify careless responding
- **Consistency Checks:** Pair related questions to validate response quality
- **Response Time Monitoring:** Flag responses completed in less than {{minimumTimeThreshold}} minutes

## Statistical Analysis Plan

### Descriptive Statistics
- **Frequency Distributions:** For all categorical variables
- **Central Tendency:** Mean, median, mode for continuous variables
- **Variability Measures:** Standard deviation, range, quartiles
- **Missing Data Analysis:** Pattern analysis and imputation strategy

### Inferential Statistics
- **Primary Comparisons:** {{primaryComparisons}}
- **Statistical Tests:** {{statisticalTests}} based on data types and distribution
- **Multiple Comparisons:** {{multipleComparisonsAdjustment}} adjustment for family-wise error rate
- **Confidence Intervals:** Report {{confidenceLevel}}% CIs for all effect estimates

### Advanced Analytics (if applicable)
- **Factor Analysis:** Explore underlying constructs in multi-item scales
- **Cluster Analysis:** Identify user segments based on response patterns
- **Regression Analysis:** Model relationships between variables
- **Structural Equation Modeling:** Test theoretical frameworks

## Quality Assurance Protocol

### Pre-Launch Testing
- **Cognitive Interviews:** Test {{cognitiveInterviewCount}} participants to identify confusion
- **Pilot Testing:** Run pilot with {{pilotSampleSize}} participants
- **Technical Validation:** Test across devices and browsers
- **Accessibility Check:** Ensure WCAG 2.1 AA compliance

### Data Quality Measures
- **Response Validation:** Real-time validation rules for data entry
- **Duplicate Detection:** IP address and email monitoring
- **Geographic Verification:** Location-based validation if relevant
- **Response Pattern Analysis:** Identify straight-lining and random responding

## Reporting and Analysis Framework

### Executive Dashboard
- **Key Performance Indicators:** {{#each kpis}}{{this}}; {{/each}}
- **Statistical Significance:** Highlight findings with p < {{alphaLevel}}
- **Effect Size Interpretation:** Include Cohen's conventions for practical significance
- **Confidence Intervals:** Visual representation of uncertainty

### Detailed Analysis Report
- **Methodology Documentation:** Complete transparency in methods and limitations
- **Assumption Testing:** Document statistical assumption verification
- **Sensitivity Analysis:** Test robustness of findings to methodological choices
- **Practical Implications:** Connect statistical findings to actionable design insights

## Ethical and Compliance Considerations

### Data Privacy and Consent
- **Informed Consent:** Clear explanation of research purpose and data use
- **Data Storage:** Secure, encrypted storage with retention schedule
- **Anonymization:** Remove or encrypt personally identifiable information
- **Compliance:** Adhere to {{regulatoryRequirements}} (GDPR, HIPAA, etc.)

### Bias Mitigation
- **Question Order Randomization:** Prevent order effects where appropriate
- **Response Option Randomization:** Minimize position bias
- **Interviewer Training:** For phone/interview-administered surveys
- **Cultural Sensitivity:** Language and cultural appropriateness review

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Success Metrics and Validation

### Response Quality Indicators
- **Completion Rate:** Target ≥{{targetCompletionRate}}%
- **Data Quality Score:** Composite measure of attention checks and consistency
- **Representativeness:** Compare sample to target population demographics
- **Reliability:** Internal consistency (Cronbach's α ≥ 0.70 for scales)

### Actionability Assessment
- **Statistical Power:** Achieved power for primary comparisons
- **Clinical/Practical Significance:** Meaningful effect sizes beyond statistical significance
- **Confidence in Findings:** Replication recommendations and confidence levels
- **Implementation Guidance:** Clear connection between findings and design decisions`,

    variables: [
      {
        id: 'projectName',
        name: 'Project Name',
        type: 'text',
        required: true,
        description: 'Name of the project or product being researched'
      },
      {
        id: 'primaryResearchObjective',
        name: 'Primary Research Objective',
        type: 'textarea',
        required: true,
        description: 'Main research question this survey aims to answer'
      },
      {
        id: 'targetPopulation',
        name: 'Target Population',
        type: 'text',
        required: true,
        description: 'Specific population to survey (be precise about demographics and characteristics)'
      },
      {
        id: 'sampleSize',
        name: 'Required Sample Size',
        type: 'number',
        required: true,
        description: 'Number of participants needed for statistical significance',
        validation: {
          min: 30,
          max: 10000,
          message: 'Sample size should be between 30 and 10,000 participants'
        }
      },
      {
        id: 'confidenceLevel',
        name: 'Confidence Level',
        type: 'select',
        required: true,
        options: ['90', '95', '99'],
        description: 'Statistical confidence level for results'
      },
      {
        id: 'distributionMethod',
        name: 'Distribution Method',
        type: 'select',
        required: true,
        options: ['Email', 'In-app', 'Website pop-up', 'Social media', 'Phone', 'Mail', 'Mixed methods'],
        description: 'Primary method for distributing the survey'
      }
    ],

    instructions: [
      'Design questions using established psychometric principles and validated question formats',
      'Balance closed-ended questions for quantitative analysis with open-ended questions for qualitative insights',
      'Use appropriate response scales (5-point Likert, semantic differential, ranking) based on measurement objectives',
      'Implement skip logic and branching to reduce survey fatigue and improve response quality',
      'Structure surveys with logical flow: general to specific, easy to difficult, engaging opening',
      'Include attention check questions to validate response quality and identify careless responding',
      'Plan for appropriate sample sizes based on population size and desired confidence levels',
      'Pre-test surveys with representative users to identify confusion and technical issues',
      'Use clear, jargon-free language appropriate to respondent education and literacy levels',
      'Plan follow-up strategies for incomplete responses while respecting user privacy preferences'
    ],

    expectedOutput: `Comprehensive survey design including:
- Statistically rigorous methodology with appropriate sample sizes and power analysis
- Psychometrically sound question development with validated instruments
- Quality assurance protocols including pilot testing and response validation
- Detailed analysis plan with appropriate statistical tests and reporting framework
- Ethical considerations and compliance requirements for data collection`,

    qualityMetrics: {
      completionTime: '4-6 hours for design, 2-4 weeks for data collection and analysis',
      difficultyLevel: 'advanced',
      participantCount: {
        min: 30,
        max: 1000,
        recommended: 200
      },
      successCriteria: [
        'Achieve target response rate and sample size for statistical power',
        'Maintain data quality with <10% careless responding',
        'Generate statistically significant insights with practical implications',
        'Create actionable findings that inform design decisions'
      ],
      outputQuality: {
        structure: [
          'Logical survey flow optimized for completion and data quality',
          'Appropriate balance of question types for comprehensive insights',
          'Clear analysis plan connecting findings to actionable recommendations'
        ],
        content: [
          'Psychometrically sound questions using validated scales where appropriate',
          'Statistical rigor in sampling, analysis, and interpretation',
          'Industry-appropriate terminology and compliance considerations'
        ],
        usability: [
          'Clear instructions and intuitive interface for participants',
          'Comprehensive analysis framework for research team implementation',
          'Practical timeline and resource requirements documentation'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Psychometric theory for reliable and valid measurement',
        'Statistical power analysis for appropriate sample sizing',
        'Survey methodology best practices from established research institutions',
        'Cognitive interviewing techniques for question validation'
      ],
      bestPractices: [
        'Pre-testing prevents response quality issues and improves completion rates',
        'Mixed question types provide both statistical rigor and qualitative depth',
        'Attention checks and validation measures ensure high-quality data',
        'Proper statistical analysis accounts for multiple comparisons and effect sizes'
      ],
      industryStandards: [
        'GDPR and data privacy compliance for international research',
        'Statistical significance testing with appropriate confidence levels',
        'Accessibility standards (WCAG 2.1 AA) for inclusive survey design',
        'Industry-specific regulations for sensitive topics (HIPAA, financial services, etc.)'
      ]
    },

    customizationOptions: [
      {
        id: 'includeLongitudinalDesign',
        label: 'Include Longitudinal Design',
        type: 'checkbox',
        default: false,
        description: 'Design for repeated measures over time to track changes',
        category: 'methodology'
      },
      {
        id: 'statisticalComplexity',
        label: 'Statistical Analysis Complexity',
        type: 'select',
        options: ['Basic Descriptive', 'Inferential Statistics', 'Advanced Multivariate'],
        default: 'Inferential Statistics',
        description: 'Level of statistical analysis planned for the data',
        category: 'output'
      },
      {
        id: 'incentiveStrategy',
        label: 'Participant Incentive Strategy',
        type: 'select',
        options: ['None', 'Small Incentive', 'Lottery', 'Donation to Charity'],
        default: 'Small Incentive',
        description: 'Strategy for encouraging participation',
        category: 'methodology'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services survey requirements',
        considerations: [
          'Include questions about financial stress and security concerns',
          'Address regulatory compliance requirements for financial data collection',
          'Use appropriate financial terminology while maintaining accessibility',
          'Consider cross-device usage patterns for financial tasks'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare survey requirements',
        considerations: [
          'Ensure HIPAA compliance and obtain appropriate consent for health-related questions',
          'Use validated health survey instruments where appropriate for benchmarking',
          'Address cultural sensitivity around health topics and privacy concerns',
          'Include caregiver and family decision-making contexts in question design'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce survey requirements',
        considerations: [
          'Include purchase intent and brand loyalty questions for business intelligence',
          'Address seasonal and promotional influences on shopping behavior',
          'Use appropriate price sensitivity measurement techniques',
          'Include multichannel shopping behavior and device usage patterns'
        ]
      }
    }
  },

  {
    id: 'observations',
    name: 'Ethnographic User Observation',
    description: 'Conduct systematic ethnographic observations to understand user behavior in natural contexts',
    category: 'research',
    frameworks: ['design-thinking', 'human-centered-design'],
    stages: ['empathize', 'hear', 'discover'],
    template: `You are an expert UX researcher specializing in ethnographic methods and naturalistic observation. Using the project knowledge provided: {knowledge_context}, design a comprehensive observation study that reveals authentic user behaviors and uncovers insights invisible in controlled research settings.

# Ethnographic Observation Study: {{projectName}}

## Research Strategy Framework
**Observation Objective:** {{observationObjective}}
**Target User Context:** {{targetContext}}
**Study Duration:** {{studyDuration}}
**Observation Method:** {{observationMethod}}
**Data Collection Approach:** {{dataCollectionApproach}}
**Analysis Framework:** Thematic analysis with behavioral coding

## Methodological Foundation

### Ethnographic Principles
- **Naturalistic Setting:** Observe users in their authentic environments without artificial constraints
- **Holistic Understanding:** Capture the complete context including social, cultural, and environmental factors
- **Minimal Intervention:** Maintain passive observer role to avoid influencing natural behaviors
- **Cultural Sensitivity:** Approach observation with respect for diverse practices and norms
- **Iterative Insight Development:** Allow insights to emerge through systematic observation and reflection

### Observer Training and Preparation
- **Bias Awareness Training:** Recognize and minimize observer bias and cultural assumptions
- **Documentation Standards:** Consistent note-taking protocols and behavioral coding systems
- **Technology Setup:** Recording equipment (with consent), observation templates, and mobile documentation tools
- **Ethical Guidelines:** Clear understanding of privacy boundaries and informed consent requirements

## Study Design and Planning

### Participant and Context Selection
**Primary User Segments:** {{primaryUserSegments}}
**Observation Locations:** {{observationLocations}}
**Time Sampling Strategy:** {{timeSamplingStrategy}}
**Social Context Considerations:** {{socialContextFactors}}

### Observation Protocol
**Session Structure:**
1. **Pre-Observation Setup (15-30 minutes):**
   - Environment familiarization and equipment setup
   - Initial context documentation (physical space, social dynamics)
   - Baseline behavioral observations before target activity begins

2. **Primary Observation Period ({{primaryObservationDuration}}):**
   - Focus on {{targetBehaviors}}
   - Document both explicit actions and implicit behaviors
   - Note environmental influences and contextual factors
   - Capture social interactions and communication patterns

3. **Post-Observation Documentation (15-20 minutes):**
   - Immediate reflection notes while observations are fresh
   - Equipment and setup documentation
   - Initial pattern identification and questions for further exploration

### Data Collection Framework

#### Behavioral Observation Categories
**Task Performance:**
- Sequence of actions and decision points
- Problem-solving strategies and workarounds
- Error patterns and recovery methods
- Efficiency indicators and time allocation

**Environmental Interaction:**
- Physical space utilization and constraints
- Tool and technology usage patterns
- Social and cultural context influences
- Interruption and distraction management

**Emotional and Cognitive Indicators:**
- Signs of frustration, confusion, or satisfaction
- Cognitive load indicators (pausing, re-reading, seeking help)
- Confidence levels and comfort with processes
- Motivation and engagement signals

#### Documentation Methods
**Field Notes Structure:**
- **Objective Observations:** What happened (factual, descriptive)
- **Behavioral Patterns:** Recurring actions and decision patterns
- **Environmental Context:** Physical, social, and cultural factors
- **Researcher Interpretations:** Initial insights and questions (clearly marked as interpretive)

**Visual Documentation:** {{visualDocumentationPlan}}
**Audio/Video Recording:** {{recordingPlan}} (with explicit consent)
**Artifact Collection:** {{artifactCollectionPlan}}

## Analysis and Synthesis Framework

### Thematic Analysis Process
**Phase 1: Data Familiarization**
- Review all observation notes and recordings systematically
- Create chronological activity maps for each observation session
- Identify immediate patterns and contradictions in behavior

**Phase 2: Initial Coding**
- Apply descriptive codes to behavioral observations
- Use both inductive (emerging from data) and deductive (theory-driven) codes
- Maintain clear distinction between observed behaviors and interpretations

**Phase 3: Pattern Identification**
- Group related codes into behavioral themes and user needs
- Map relationships between environmental factors and behavioral patterns
- Identify gaps between intended and actual user behaviors

**Phase 4: Insight Development**
- Connect behavioral patterns to broader user goals and motivations
- Identify design opportunities based on observed pain points and workarounds
- Validate insights across multiple observation sessions and contexts

### Cross-Session Analysis
**Consistency Validation:** Compare behavioral patterns across different users and contexts
**Environmental Impact Assessment:** Analyze how different contexts affect user behavior
**Segment Differentiation:** Identify behavioral differences across user segments
**Temporal Patterns:** Track how behaviors change over time or with experience level

## Quality Assurance and Validation

### Observer Reliability
**Inter-Observer Agreement:** {{interObserverSetup}} (if multiple observers)
**Agreement Threshold:** ≥80% agreement on key behavioral observations
**Calibration Sessions:** Regular alignment meetings to ensure consistent observation standards
**Blind Coding Validation:** Independent analysis of select sessions by multiple researchers

### Data Quality Measures
**Observation Completeness:** Ensure comprehensive coverage of target behaviors and contexts
**Context Documentation:** Systematic recording of environmental and social factors
**Participant Verification:** {{participantValidationPlan}} where appropriate
**Triangulation:** Cross-reference observations with other research methods

## Ethical Considerations and Privacy

### Informed Consent Process
- **Voluntary Participation:** Clear communication about right to withdraw
- **Recording Permissions:** Separate consent for audio/video documentation
- **Data Usage Transparency:** Explain how observations will be analyzed and reported
- **Privacy Protection:** Specific protocols for handling sensitive observations

### Cultural and Social Sensitivity
- **Power Dynamics:** Acknowledge researcher-participant relationship dynamics
- **Cultural Competency:** Respectful approach to diverse cultural practices
- **Vulnerable Populations:** Additional protections for children, elderly, or other vulnerable groups
- **Community Benefit:** Ensure research provides value to observed communities

## Reporting and Application Framework

### Behavioral Insights Report
**Executive Summary:**
- Key behavioral patterns and their implications for design
- Priority opportunity areas based on observed pain points
- Recommendations for immediate and long-term design improvements

**Detailed Findings:**
- Comprehensive behavioral pattern documentation with supporting evidence
- Environmental factor analysis and context-dependent behaviors
- User segment comparisons and differentiated needs
- Connection between observations and existing research findings

### Design Implications
**Immediate Opportunities:** Low-effort, high-impact improvements based on observed behaviors
**Strategic Recommendations:** Long-term design directions informed by deep behavioral insights
**Feature Requirements:** Specific functionality needs identified through behavioral observation
**Design Principles:** User behavior-informed principles for future design decisions

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Success Criteria and Validation

### Study Execution Metrics
- **Observation Coverage:** Complete {{targetObservationHours}} hours across {{targetParticipantCount}} participants
- **Context Diversity:** Observe across {{contextVarietyTarget}} different environments and situations
- **Data Quality:** Achieve comprehensive behavioral documentation with <10% missing data
- **Insight Generation:** Identify minimum {{minimumInsightTarget}} actionable design insights

### Long-term Value Assessment
- **Design Integration:** Percentage of insights that inform actual design decisions
- **Behavioral Prediction:** Accuracy of behavioral models developed from observations
- **User Experience Impact:** Measurable improvements in user experience based on applied insights
- **Research Efficiency:** Reduced need for additional research through comprehensive behavioral understanding`,

    variables: [
      {
        id: 'projectName',
        name: 'Project Name',
        type: 'text',
        required: true,
        description: 'Name of the project or product being observed'
      },
      {
        id: 'observationObjective',
        name: 'Primary Observation Objective',
        type: 'textarea',
        required: true,
        description: 'Main research question and specific behaviors to observe'
      },
      {
        id: 'targetContext',
        name: 'Target User Context',
        type: 'text',
        required: true,
        description: 'Specific environment and context where users will be observed'
      },
      {
        id: 'studyDuration',
        name: 'Study Duration',
        type: 'select',
        required: true,
        options: ['1-2 weeks', '3-4 weeks', '1-2 months', '3+ months'],
        description: 'Total duration of the observation study'
      },
      {
        id: 'observationMethod',
        name: 'Primary Observation Method',
        type: 'select',
        required: true,
        options: ['Direct observation', 'Participant observation', 'Video ethnography', 'Digital observation', 'Mixed methods'],
        description: 'Primary methodology for conducting observations'
      },
      {
        id: 'primaryObservationDuration',
        name: 'Individual Session Duration',
        type: 'select',
        required: true,
        options: ['30 minutes', '1 hour', '2 hours', 'Half day', 'Full day'],
        description: 'Duration of each observation session'
      }
    ],

    instructions: [
      'Observe users in their natural environments without artificial constraints',
      'Maintain passive observer role to avoid influencing natural behaviors',
      'Capture both explicit actions and implicit behaviors, including environmental influences',
      'Document social interactions and communication patterns that affect user experience',
      'Use systematic behavioral coding to ensure consistent and comprehensive data collection',
      'Apply thematic analysis methodology for pattern identification and insight development',
      'Ensure cultural sensitivity and respect for diverse practices and norms',
      'Triangulate observations with other research methods for comprehensive understanding',
      'Focus on behavioral patterns over individual preferences for actionable insights',
      'Connect observed behaviors to broader user goals and design implications'
    ],

    expectedOutput: `Comprehensive observation study including:
- Systematic behavioral documentation with environmental context analysis
- Thematic analysis revealing authentic user behavior patterns and needs
- Quality assurance protocols ensuring observer reliability and data validity
- Ethical framework protecting participant privacy and cultural sensitivity
- Actionable design insights connecting behavioral observations to improvement opportunities`,

    qualityMetrics: {
      completionTime: '2-4 weeks for data collection, 1-2 weeks for analysis',
      difficultyLevel: 'advanced',
      participantCount: {
        min: 5,
        max: 20,
        recommended: 8
      },
      successCriteria: [
        'Observe authentic user behaviors across diverse contexts and situations',
        'Identify behavioral patterns invisible in controlled research settings',
        'Generate actionable insights connecting behaviors to design opportunities',
        'Maintain ethical standards and cultural sensitivity throughout study'
      ],
      outputQuality: {
        structure: [
          'Systematic documentation of behavioral patterns with supporting evidence',
          'Clear distinction between observed behaviors and researcher interpretations',
          'Comprehensive context analysis including environmental and social factors'
        ],
        content: [
          'Rich behavioral insights revealing authentic user needs and pain points',
          'Evidence-based design recommendations grounded in observed behaviors',
          'Cultural and contextual sensitivity in interpretation and application'
        ],
        usability: [
          'Clear behavioral documentation enabling design team understanding and application',
          'Actionable insights with specific implementation guidance for design improvements',
          'Ethical framework ensuring respectful and responsible research practices'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Ethnographic research principles for naturalistic observation',
        'Behavioral coding systems for systematic data collection',
        'Thematic analysis methodology for pattern identification',
        'Triangulation techniques for insight validation across methods'
      ],
      bestPractices: [
        'Passive observation reveals authentic behaviors not visible in controlled settings',
        'Multiple observation sessions across contexts provide comprehensive behavioral understanding',
        'Cultural sensitivity and ethical considerations are essential for respectful research',
        'Systematic documentation enables reliable pattern identification and insight development'
      ],
      industryStandards: [
        'Informed consent protocols protecting participant privacy and autonomy',
        'Cultural competency standards for respectful cross-cultural research',
        'Data privacy regulations (GDPR, HIPAA) for sensitive observation contexts',
        'Accessibility considerations ensuring inclusive research participation'
      ]
    },

    customizationOptions: [
      {
        id: 'includeDigitalEthnography',
        label: 'Include Digital Ethnography',
        type: 'checkbox',
        default: false,
        description: 'Observe digital behaviors through screen recording and analytics',
        category: 'methodology'
      },
      {
        id: 'participationLevel',
        label: 'Observer Participation Level',
        type: 'select',
        options: ['Complete Observer', 'Observer as Participant', 'Participant as Observer'],
        default: 'Observer as Participant',
        description: 'Level of researcher participation in observed activities',
        category: 'methodology'
      },
      {
        id: 'documentationDetail',
        label: 'Documentation Detail Level',
        type: 'select',
        options: ['High-level patterns', 'Detailed behaviors', 'Micro-interaction analysis'],
        default: 'Detailed behaviors',
        description: 'Granularity of behavioral documentation and analysis',
        category: 'output'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services observation considerations',
        considerations: [
          'Observe security behaviors and trust indicators in financial contexts',
          'Document cross-device usage patterns for financial tasks and data entry',
          'Include privacy concerns and regulatory compliance awareness in behavioral analysis',
          'Observe financial decision-making processes and risk assessment behaviors'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare observation considerations',
        considerations: [
          'Ensure HIPAA compliance and patient privacy protection in clinical settings',
          'Observe care coordination behaviors and provider communication patterns',
          'Include accessibility needs and assistive technology usage in behavioral documentation',
          'Document caregiver involvement and family decision-making processes'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce observation considerations',
        considerations: [
          'Observe shopping behaviors across multiple channels and devices',
          'Document social influence factors and peer consultation patterns',
          'Include seasonal and promotional influences on shopping behavior patterns',
          'Observe post-purchase behaviors including returns and support interactions'
        ]
      }
    }
  },

  {
    id: 'empathy-maps-dt',
    name: 'Design Thinking Empathy Map',
    description: 'Create detailed empathy maps that capture user thoughts, feelings, actions, and environmental influences',
    category: 'synthesis',
    frameworks: ['design-thinking', 'human-centered-design'],
    stages: ['empathize', 'define', 'hear'],
    template: `You are an expert UX researcher and design thinking facilitator with deep expertise in empathy mapping methodology. Using the project knowledge provided: {knowledge_context}, create a comprehensive empathy map that captures authentic user perspectives and reveals underlying needs, motivations, and pain points.

# Design Thinking Empathy Map: {{personaName}}

## Empathy Map Foundation
**Target User:** {{personaName}}
**Context/Scenario:** {{targetScenario}}
**Data Sources:** {{dataSources}}
**Confidence Level:** {{confidenceLevel}}/10 based on research depth
**Last Updated:** [Current Date]
**Research Methods Used:** {{researchMethods}}

## Core Empathy Map Quadrants

### THINKS & BELIEVES
**Conscious Thoughts:**
{{#each consciousThoughts}}
- "{{this}}" [Source: {{source}}]
{{/each}}

**Beliefs & Assumptions:**
{{#each beliefsAssumptions}}
- {{this.belief}}
- *Evidence:* {{this.evidence}}
- *Confidence:* {{this.confidence}}/10
{{/each}}

**Mental Models:**
{{#each mentalModels}}
- **About {{this.topic}}:** {{this.model}}
- *Implication:* {{this.implication}}
{{/each}}

**Worries & Concerns:**
{{#each worriesConcerns}}
- {{this.worry}}
- *Impact Level:* {{this.impact}} (High/Medium/Low)
- *Frequency:* {{this.frequency}}
{{/each}}

### SEES
**Physical Environment:**
{{#each physicalEnvironment}}
- {{this.element}}: {{this.description}}
- *Influence on Experience:* {{this.influence}}
{{/each}}

**Digital Environment:**
{{#each digitalEnvironment}}
- {{this.platform}}: {{this.usage}}
- *User Perception:* {{this.perception}}
{{/each}}

**Social Environment:**
{{#each socialEnvironment}}
- **People:** {{this.people}}
- **Interactions:** {{this.interactions}}
- **Social Pressure/Support:** {{this.socialDynamics}}
{{/each}}

**Information Sources:**
{{#each informationSources}}
- {{this.source}}: {{this.trustLevel}} trust level
- *Usage Context:* {{this.context}}
{{/each}}

**Market & Competition:**
{{#each marketCompetition}}
- {{this.competitor}}: {{this.perception}}
- *Comparison Factors:* {{this.comparisonFactors}}
{{/each}}

### SAYS & DOES
**Verbal Expressions:**
{{#each verbalExpressions}}
- **Direct Quotes:** "{{this.quote}}"
- **Context:** {{this.context}}
- **Emotional Tone:** {{this.tone}}
{{/each}}

**Public Behaviors:**
{{#each publicBehaviors}}
- **Action:** {{this.action}}
- **Frequency:** {{this.frequency}}
- **Social Context:** {{this.socialContext}}
- **Motivation:** {{this.motivation}}
{{/each}}

**Social Media & Communication:**
{{#each socialMediaBehavior}}
- **Platform:** {{this.platform}}
- **Typical Content:** {{this.content}}
- **Engagement Style:** {{this.style}}
{{/each}}

**Decision-Making Behaviors:**
{{#each decisionMakingBehaviors}}
- **Decision Type:** {{this.type}}
- **Process:** {{this.process}}
- **Influencing Factors:** {{this.factors}}
{{/each}}

### HEARS
**Direct Feedback Sources:**
{{#each directFeedback}}
- **Source:** {{this.source}} ({{this.relationship}})
- **Typical Message:** {{this.message}}
- **User Response:** {{this.response}}
- **Influence Level:** {{this.influence}}/10
{{/each}}

**Indirect Information:**
{{#each indirectInformation}}
- **Channel:** {{this.channel}}
- **Content Type:** {{this.contentType}}
- **Credibility Perception:** {{this.credibility}}
- **Impact on Decisions:** {{this.impact}}
{{/each}}

**Social Influence:**
{{#each socialInfluence}}
- **Influencer Type:** {{this.type}} (peers, experts, family, etc.)
- **Influence Method:** {{this.method}}
- **Topics of Influence:** {{this.topics}}
- **Resistance/Acceptance:** {{this.acceptance}}
{{/each}}

**Industry/Market Messages:**
{{#each industryMessages}}
- **Message Source:** {{this.source}}
- **Key Themes:** {{this.themes}}
- **User Interpretation:** {{this.interpretation}}
{{/each}}

## Extended Empathy Analysis

### PAINS (Frustrations, Obstacles, Risks)
**Functional Pains:**
{{#each functionalPains}}
- **Pain Point:** {{this.pain}}
- **Intensity:** {{this.intensity}}/10
- **Frequency:** {{this.frequency}}
- **Current Workarounds:** {{this.workarounds}}
- **Ideal Solution:** {{this.idealSolution}}
{{/each}}

**Emotional Pains:**
{{#each emotionalPains}}
- **Emotional State:** {{this.emotion}}
- **Trigger:** {{this.trigger}}
- **Impact:** {{this.impact}}
- **Coping Mechanisms:** {{this.coping}}
{{/each}}

**Social Pains:**
{{#each socialPains}}
- **Social Challenge:** {{this.challenge}}
- **Social Context:** {{this.context}}
- **Embarrassment/Fear Factors:** {{this.fears}}
- **Desired Social Outcome:** {{this.desiredOutcome}}
{{/each}}

### GAINS (Wants, Needs, Hopes, Dreams)
**Functional Gains:**
{{#each functionalGains}}
- **Desired Outcome:** {{this.outcome}}
- **Success Criteria:** {{this.criteria}}
- **Current Gap:** {{this.gap}}
- **Priority Level:** {{this.priority}}/10
{{/each}}

**Emotional Gains:**
{{#each emotionalGains}}
- **Desired Feeling:** {{this.feeling}}
- **Trigger Context:** {{this.context}}
- **Personal Significance:** {{this.significance}}
- **Achievement Indicators:** {{this.indicators}}
{{/each}}

**Social Gains:**
{{#each socialGains}}
- **Social Goal:** {{this.goal}}
- **Target Audience:** {{this.audience}}
- **Status/Recognition Factors:** {{this.recognition}}
- **Community Benefits:** {{this.communityBenefit}}
{{/each}}

## Behavioral Patterns and Insights

### Decision-Making Framework
**Decision Criteria Hierarchy:**
1. **Primary:** {{primaryDecisionCriteria}}
2. **Secondary:** {{secondaryDecisionCriteria}}
3. **Tiebreakers:** {{tiebreakingCriteria}}

**Information Gathering Process:**
{{informationGatheringProcess}}

**Risk Assessment Approach:**
{{riskAssessmentApproach}}

### Emotional Journey Mapping
**Emotional States Throughout Experience:**
{{#each emotionalJourney}}
- **Phase:** {{this.phase}}
- **Dominant Emotion:** {{this.emotion}}
- **Intensity:** {{this.intensity}}/10
- **Triggers:** {{this.triggers}}
- **Duration:** {{this.duration}}
{{/each}}

**Emotional Recovery Patterns:**
{{emotionalRecoveryPatterns}}

### Behavioral Triggers and Motivators
**Positive Triggers (What Motivates Action):**
{{#each positiveTriggerts}}
- {{this.trigger}} → {{this.result}}
- *Effectiveness:* {{this.effectiveness}}/10
{{/each}}

**Negative Triggers (What Causes Avoidance):**
{{#each negativeTriggerts}}
- {{this.trigger}} → {{this.avoidance}}
- *Intensity:* {{this.intensity}}/10
{{/each}}

## Research Validation and Confidence

### Supporting Evidence
**Quantitative Data Points:**
{{#each quantitativeEvidence}}
- {{this.metric}}: {{this.value}}
- *Sample Size:* {{this.sampleSize}}
- *Confidence:* {{this.confidence}}%
{{/each}}

**Qualitative Insights:**
{{#each qualitativeInsights}}
- **Theme:** {{this.theme}}
- **Supporting Quotes:** {{this.quotes}}
- **Frequency:** {{this.frequency}} participants
{{/each}}

**Behavioral Observations:**
{{#each behavioralObservations}}
- **Observed Behavior:** {{this.behavior}}
- **Context:** {{this.context}}
- **Consistency:** {{this.consistency}}% across observations
{{/each}}

### Assumptions and Gaps
**Research Gaps:**
{{#each researchGaps}}
- **Gap Area:** {{this.area}}
- **Impact on Empathy Map:** {{this.impact}}
- **Recommended Research:** {{this.recommendation}}
{{/each}}

**Assumptions to Validate:**
{{#each assumptionsToValidate}}
- **Assumption:** {{this.assumption}}
- **Risk if Wrong:** {{this.risk}}
- **Validation Method:** {{this.method}}
{{/each}}

## Design Implications and Opportunities

### Immediate Design Opportunities
{{#each immediateOpportunities}}
- **Opportunity:** {{this.opportunity}}
- **Target Pain/Gain:** {{this.target}}
- **Estimated Impact:** {{this.impact}}/10
- **Implementation Complexity:** {{this.complexity}} (Low/Medium/High)
{{/each}}

### Long-term Strategic Opportunities
{{#each strategicOpportunities}}
- **Strategic Direction:** {{this.direction}}
- **User Value Proposition:** {{this.value}}
- **Business Alignment:** {{this.alignment}}
- **Success Metrics:** {{this.metrics}}
{{/each}}

### Experience Design Principles
Based on this empathy map, recommended design principles:
{{#each designPrinciples}}
- **Principle:** {{this.principle}}
- **Rationale:** {{this.rationale}}
- **Application Examples:** {{this.examples}}
{{/each}}

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Empathy Map Maintenance and Updates

### Review Schedule
- **Regular Review:** {{reviewFrequency}}
- **Trigger Events:** {{updateTriggers}}
- **Stakeholder Involvement:** {{stakeholderReview}}

### Version Control
- **Version:** {{currentVersion}}
- **Major Changes:** {{majorChanges}}
- **Impact Assessment:** {{impactAssessment}}

### Usage Guidelines
- **Team Access:** {{teamAccess}}
- **Reference Context:** {{referenceContext}}
- **Decision Integration:** {{decisionIntegration}}`,

    variables: [
      {
        id: 'personaName',
        name: 'Target User/Persona Name',
        type: 'text',
        required: true,
        description: 'Name or identifier for the user this empathy map represents'
      },
      {
        id: 'targetScenario',
        name: 'Target Scenario/Context',
        type: 'textarea',
        required: true,
        description: 'Specific scenario or context this empathy map addresses'
      },
      {
        id: 'dataSources',
        name: 'Research Data Sources',
        type: 'textarea',
        required: true,
        description: 'List of research sources used to create this empathy map'
      },
      {
        id: 'researchMethods',
        name: 'Research Methods Used',
        type: 'multiselect',
        required: true,
        options: ['User Interviews', 'Surveys', 'Observations', 'Analytics', 'Support Data', 'Social Media Analysis', 'Competitor Analysis'],
        description: 'Research methodologies used to gather empathy map data'
      },
      {
        id: 'confidenceLevel',
        name: 'Data Confidence Level',
        type: 'select',
        required: true,
        options: ['6', '7', '8', '9', '10'],
        description: 'Confidence level in empathy map accuracy based on data quality (1-10)'
      }
    ],

    instructions: [
      'Ground every element of the empathy map in actual research data rather than assumptions',
      'Capture authentic user voice through direct quotes and observed behaviors',
      'Distinguish between what users say publicly versus what they think privately',
      'Include emotional states and their triggers throughout different experience phases',
      'Map both functional and emotional needs, recognizing their interconnected nature',
      'Document environmental and social influences that shape user perspective and behavior',
      'Identify gaps between user intentions and actual behaviors for design insights',
      'Connect empathy map insights to specific design opportunities and recommendations',
      'Validate empathy map elements with actual users when possible',
      'Update empathy maps regularly based on new research findings and user feedback'
    ],

    expectedOutput: `Comprehensive empathy map including:
- Four core quadrants (Thinks/Believes, Sees, Says/Does, Hears) with detailed, research-backed content
- Extended analysis of pains and gains with prioritization and solution implications
- Behavioral patterns and decision-making frameworks based on authentic user insights
- Supporting evidence and validation framework demonstrating empathy map reliability
- Actionable design implications connecting user empathy to specific improvement opportunities`,

    qualityMetrics: {
      completionTime: '2-4 hours including research synthesis and validation',
      difficultyLevel: 'intermediate',
      participantCount: {
        min: 5,
        max: 20,
        recommended: 8
      },
      successCriteria: [
        'Create research-backed empathy map with authentic user voice and perspective',
        'Identify actionable insights connecting user empathy to design opportunities',
        'Validate empathy map accuracy with user-facing team members or users',
        'Generate design principles and recommendations based on deep user understanding'
      ],
      outputQuality: {
        structure: [
          'Comprehensive coverage of all empathy map quadrants with detailed insights',
          'Clear distinction between observed behaviors and underlying thoughts/feelings',
          'Logical connection between user empathy and actionable design implications'
        ],
        content: [
          'Authentic user voice preserved through direct quotes and behavioral observations',
          'Nuanced understanding of user motivations, fears, and aspirations',
          'Evidence-based insights grounded in actual research rather than assumptions'
        ],
        usability: [
          'Clear, accessible format enabling team understanding and application',
          'Actionable design opportunities with implementation guidance',
          'Regular update framework maintaining empathy map relevance and accuracy'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Design thinking empathy mapping framework with extended analysis dimensions',
        'Behavioral observation techniques for authentic user perspective capture',
        'Emotional journey mapping for understanding user experience fluctuations',
        'Evidence-based validation methods for empathy map accuracy verification'
      ],
      bestPractices: [
        'Ground empathy maps in actual research data rather than team assumptions',
        'Include both functional and emotional dimensions of user experience',
        'Validate empathy maps with users and user-facing team members regularly',
        'Connect empathy insights to specific design opportunities and business value'
      ],
      industryStandards: [
        'Design thinking methodology standards for empathy development',
        'User research ethics guidelines for respectful perspective representation',
        'Accessibility considerations ensuring inclusive empathy map development',
        'Privacy standards protecting user information in empathy documentation'
      ]
    },

    customizationOptions: [
      {
        id: 'includeCompetitorAnalysis',
        label: 'Include Competitor Analysis',
        type: 'checkbox',
        default: false,
        description: 'Include user perspectives on competitive products and services',
        category: 'output'
      },
      {
        id: 'empathyDepth',
        label: 'Empathy Analysis Depth',
        type: 'select',
        options: ['Essential', 'Detailed', 'Comprehensive'],
        default: 'Detailed',
        description: 'Level of detail and analysis depth for empathy mapping',
        category: 'output'
      },
      {
        id: 'updateFrequency',
        label: 'Empathy Map Update Frequency',
        type: 'select',
        options: ['Monthly', 'Quarterly', 'Bi-annually', 'Project-based'],
        default: 'Quarterly',
        description: 'How often should empathy maps be reviewed and updated?',
        category: 'quality'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services empathy considerations',
        considerations: [
          'Include financial stress and security anxieties in emotional analysis',
          'Address trust and credibility concerns in user perspective mapping',
          'Include regulatory compliance awareness and its emotional impact on users',
          'Consider financial literacy levels and their influence on user confidence and behavior'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare empathy considerations',
        considerations: [
          'Include health anxiety and uncertainty in emotional journey mapping',
          'Address caregiver perspectives and family decision-making dynamics',
          'Include accessibility needs and their emotional impact on user experience',
          'Consider health literacy levels and medical complexity in user perspective analysis'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce empathy considerations',
        considerations: [
          'Include purchase anxiety and buyer\'s remorse in emotional analysis',
          'Address social proof and peer influence in decision-making perspectives',
          'Include brand loyalty and switching costs in user belief systems',
          'Consider seasonal and promotional influences on user motivations and behaviors'
        ]
      }
    }
  },

  // SYNTHESIS AND ANALYSIS TOOLS
  {
    id: 'affinity-mapping',
    name: 'Affinity Mapping and Research Synthesis',
    description: 'Systematically organize and synthesize qualitative research data to identify patterns, themes, and actionable insights',
    category: 'synthesis',
    frameworks: ['design-thinking', 'double-diamond'],
    stages: ['define', 'define-dd', 'synthesize'],
    template: `You are an expert UX researcher and design strategist with extensive experience in qualitative data synthesis and pattern recognition. Using the project knowledge provided: {knowledge_context}, create a comprehensive affinity mapping process that transforms raw research data into clear, actionable insights that inform design decisions.

# Affinity Mapping and Research Synthesis: {{projectName}}

## Research Synthesis Strategy
**Research Data Sources:** {{dataSources}}
**Analysis Method:** {{analysisMethod}}
**Team Composition:** {{teamComposition}}
**Timeline:** {{synthesisTimeline}}
**Expected Insight Categories:** {{expectedCategories}}
**Stakeholder Involvement:** {{stakeholderInvolvement}}

## Pre-Synthesis Preparation

### Data Quality Assessment
- **Data Volume:** {{dataVolume}} (interviews, observations, survey responses, etc.)
- **Data Types:** {{dataTypes}} (quotes, observations, metrics, artifacts)
- **Data Consistency:** Review for completeness and quality across all sources
- **Research Coverage:** Validate representation across user segments and contexts

### Team Preparation and Training
- **Synthesis Team:** {{synthesisTeam}} participants
- **Role Assignments:** Note-taker, facilitator, time-keeper, documentation lead
- **Bias Awareness:** Training on researcher bias and assumption checking
- **Methodology Alignment:** Ensure team understanding of affinity mapping principles

### Material and Environment Setup
- **Physical Space:** Large wall space, moveable furniture, good lighting
- **Digital Tools:** {{digitalTools}} (Miro, FigJam, Mural, or physical materials)
- **Supplies:** Sticky notes, markers, dot stickers, flip chart paper, camera
- **Time Allocation:** {{sessionDuration}} hours with planned breaks

## Data Preparation and Note Creation

### Note Quality Standards
**Individual Note Characteristics:**
- **Atomic Insights:** One insight per note, specific and concrete
- **User Voice:** Preserve authentic language and direct quotes where valuable
- **Context Preservation:** Include relevant context (user segment, situation, method)
- **Actionability:** Focus on insights that can inform design decisions
- **Clarity:** Write notes that team members can understand without additional explanation

### Note Creation Process
**From Interview Data:**
{{#each interviewDataNotes}}
- **Source:** {{this.source}}
- **Key Insight:** {{this.insight}}
- **Supporting Evidence:** {{this.evidence}}
- **User Context:** {{this.context}}
{{/each}}

**From Observational Data:**
{{#each observationalNotes}}
- **Behavior Observed:** {{this.behavior}}
- **Context:** {{this.context}}
- **Frequency/Pattern:** {{this.pattern}}
- **Design Implication:** {{this.implication}}
{{/each}}

**From Survey and Analytics Data:**
{{#each quantitativeNotes}}
- **Data Point:** {{this.metric}}
- **Insight:** {{this.insight}}
- **Statistical Significance:** {{this.significance}}
- **Qualitative Context:** {{this.context}}
{{/each}}

## Affinity Mapping Process

### Phase 1: Individual Note Review ({{phase1Duration}} minutes)
- **Silent Review:** Each team member reviews all notes individually
- **Initial Grouping:** Identify obvious patterns and relationships mentally
- **Question Generation:** Note areas of confusion or contradiction
- **Bias Check:** Reflect on personal assumptions and preconceptions

### Phase 2: Collaborative Clustering ({{phase2Duration}} minutes)
**Bottom-Up Clustering:**
- Start with first note and look for related notes
- Create clusters of 3-7 related notes maximum
- Avoid forcing notes into existing clusters
- Create new clusters when notes don't fit existing patterns
- Name clusters descriptively, not prescriptively

**Cluster Validation:**
- **Coherence Check:** Ensure all notes in cluster truly relate
- **Overlap Assessment:** Identify clusters with similar themes
- **Gap Identification:** Note missing information or contradictions

### Phase 3: Theme Development ({{phase3Duration}} minutes)
**Theme Identification:**
{{#each identifiedThemes}}
- **Theme:** {{this.theme}}
- **Supporting Clusters:** {{this.clusters}}
- **Evidence Strength:** {{this.strength}}/10
- **User Impact:** {{this.impact}} (High/Medium/Low)
- **Design Opportunity:** {{this.opportunity}}
{{/each}}

**Theme Relationships:**
- **Dependencies:** Themes that build upon or require others
- **Tensions:** Conflicting themes that reveal user complexity
- **Hierarchies:** Primary themes versus supporting themes
- **Cross-cutting:** Themes that appear across multiple user segments

### Phase 4: Insight Prioritization ({{phase4Duration}} minutes)
**Impact vs. Effort Analysis:**
{{#each prioritizedInsights}}
- **Insight:** {{this.insight}}
- **User Impact:** {{this.impact}}/10
- **Implementation Effort:** {{this.effort}}/10 (1=easy, 10=very difficult)
- **Business Alignment:** {{this.alignment}}/10
- **Priority Ranking:** {{this.ranking}}
{{/each}}

**Validation Criteria:**
- **Evidence Strength:** Multiple sources supporting the insight
- **User Centrality:** Directly affects user experience and outcomes
- **Actionability:** Clear implications for design decisions
- **Strategic Alignment:** Connects to business objectives and constraints

## Advanced Analysis Techniques

### Cross-Segment Analysis
**Behavioral Patterns Across User Types:**
{{#each crossSegmentPatterns}}
- **Pattern:** {{this.pattern}}
- **Segments Affected:** {{this.segments}}
- **Variations:** {{this.variations}}
- **Design Implications:** {{this.implications}}
{{/each}}

### Journey-Based Clustering
**Experience Phase Alignment:**
{{#each journeyPhaseClusters}}
- **Journey Phase:** {{this.phase}}
- **Key Insights:** {{this.insights}}
- **Pain Points:** {{this.pains}}
- **Opportunities:** {{this.opportunities}}
{{/each}}

### Contradiction and Tension Analysis
**User Behavior Contradictions:**
{{#each contradictions}}
- **Contradiction:** {{this.contradiction}}
- **Contributing Factors:** {{this.factors}}
- **Resolution Strategy:** {{this.resolution}}
- **Design Challenge:** {{this.challenge}}
{{/each}}

## Synthesis Output Framework

### Executive Insight Summary
**Top-Level Findings (Maximum 5):**
{{#each topLevelFindings}}
1. **{{this.finding}}**
   - *Evidence:* {{this.evidence}}
   - *Impact:* {{this.impact}}
   - *Recommendation:* {{this.recommendation}}
{{/each}}

**Critical User Needs:**
{{#each criticalNeeds}}
- **Need:** {{this.need}}
- **Current Gap:** {{this.gap}}
- **User Impact:** {{this.impact}}
- **Solution Direction:** {{this.solution}}
{{/each}}

### Detailed Theme Documentation
{{#each detailedThemes}}
**Theme: {{this.name}}**
- **Description:** {{this.description}}
- **Supporting Evidence:** {{this.evidence}}
- **User Segments Affected:** {{this.segments}}
- **Frequency:** {{this.frequency}}% of participants
- **Design Implications:** {{this.implications}}
- **Success Metrics:** {{this.metrics}}
- **Implementation Considerations:** {{this.considerations}}
{{/each}}

### Design Opportunity Map
**Immediate Opportunities (0-3 months):**
{{#each immediateOpportunities}}
- {{this.opportunity}} - {{this.description}}
{{/each}}

**Medium-term Opportunities (3-12 months):**
{{#each mediumTermOpportunities}}
- {{this.opportunity}} - {{this.description}}
{{/each}}

**Strategic Opportunities (12+ months):**
{{#each strategicOpportunities}}
- {{this.opportunity}} - {{this.description}}
{{/each}}

## Quality Assurance and Validation

### Internal Validation
- **Team Consensus:** ≥80% agreement on primary themes and insights
- **Evidence Traceability:** Clear connection from insights back to source data
- **Assumption Documentation:** Explicit acknowledgment of assumptions and gaps
- **Bias Assessment:** Recognition of potential researcher and team bias

### External Validation
- **Stakeholder Review:** {{stakeholderValidationPlan}}
- **User Validation:** {{userValidationMethod}}
- **Cross-Reference Check:** {{crossReferenceMethod}}
- **Historical Consistency:** Comparison with previous research findings

### Documentation Standards
- **Version Control:** Clear versioning and change tracking
- **Source Attribution:** Traceability to original research data
- **Update Schedule:** {{updateSchedule}} for ongoing research integration
- **Access Control:** {{accessControl}} for team and stakeholder usage

## Implementation and Follow-up

### Insight Integration Strategy
- **Design Brief Integration:** How insights inform design requirements
- **Persona Updates:** Updates to existing personas based on new insights
- **Journey Map Refinement:** Integration with customer journey mapping
- **Feature Prioritization:** How insights influence product roadmap decisions

### Measurement and Validation Plan
- **Success Metrics:** {{successMetrics}}
- **Validation Method:** {{validationMethod}}
- **Timeline:** {{measurementTimeline}}
- **Responsibility:** {{measurementOwnership}}

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Affinity Mapping Best Practices Checklist

### Process Excellence
- [ ] All team members trained on methodology and bias awareness
- [ ] High-quality notes created from all data sources
- [ ] Systematic clustering process followed without forcing patterns
- [ ] Multiple rounds of review and refinement completed
- [ ] Clear documentation of methodology and assumptions

### Quality Outcomes
- [ ] Insights clearly supported by evidence from multiple sources
- [ ] Contradictions and tensions acknowledged and explored
- [ ] Actionable recommendations connected to specific insights
- [ ] Priority levels assigned based on impact and feasibility
- [ ] Stakeholder validation completed with documented feedback

### Strategic Integration
- [ ] Insights connected to business objectives and user outcomes
- [ ] Implementation roadmap created with clear timelines and ownership
- [ ] Success metrics defined and measurement plan established
- [ ] Communication plan for sharing insights across organization
- [ ] Update process established for ongoing research integration`,

    variables: [
      {
        id: 'projectName',
        name: 'Project Name',
        type: 'text',
        required: true,
        description: 'Name of the project or research initiative'
      },
      {
        id: 'dataSources',
        name: 'Research Data Sources',
        type: 'textarea',
        required: true,
        description: 'List all sources of research data to be synthesized'
      },
      {
        id: 'analysisMethod',
        name: 'Analysis Method',
        type: 'select',
        required: true,
        options: ['Collaborative Workshop', 'Individual Analysis + Review', 'Hybrid Approach', 'Digital-First Analysis'],
        description: 'Primary method for conducting affinity mapping'
      },
      {
        id: 'teamComposition',
        name: 'Synthesis Team Composition',
        type: 'text',
        required: true,
        description: 'Who will participate in the synthesis process?'
      },
      {
        id: 'synthesisTimeline',
        name: 'Synthesis Timeline',
        type: 'select',
        required: true,
        options: ['2-4 hours', '1 day', '2 days', '1 week'],
        description: 'Total time allocated for synthesis process'
      },
      {
        id: 'digitalTools',
        name: 'Digital Tools',
        type: 'select',
        required: false,
        options: ['Miro', 'FigJam', 'Mural', 'Physical materials only', 'Hybrid physical/digital'],
        description: 'Tools to be used for affinity mapping process'
      }
    ],

    instructions: [
      'Prepare high-quality individual notes that capture atomic insights from research data',
      'Use collaborative clustering approach that allows patterns to emerge naturally rather than forcing predetermined categories',
      'Apply systematic thematic analysis to identify meaningful patterns and relationships across data',
      'Prioritize insights based on user impact, evidence strength, and implementation feasibility',
      'Document contradictions and tensions that reveal user complexity and design challenges',
      'Create actionable recommendations clearly connected to specific insights and evidence',
      'Validate findings through multiple review rounds and stakeholder feedback',
      'Establish clear traceability from insights back to original research data sources',
      'Plan for ongoing integration of new research findings and insight refinement',
      'Connect synthesis outcomes to specific design decisions and business objectives'
    ],

    expectedOutput: `Comprehensive research synthesis including:
- Systematically organized themes and patterns with supporting evidence
- Prioritized actionable insights with clear implementation recommendations
- Cross-segment analysis revealing user behavior patterns and contradictions
- Quality assurance framework ensuring insight validity and team alignment
- Integration strategy connecting insights to design decisions and business outcomes`,

    qualityMetrics: {
      completionTime: '4-16 hours depending on data volume and team size',
      difficultyLevel: 'intermediate',
      participantCount: {
        min: 2,
        max: 8,
        recommended: 4
      },
      successCriteria: [
        'Generate 5-10 high-priority actionable insights supported by evidence',
        'Achieve 80%+ team consensus on primary themes and recommendations',
        'Create clear traceability from insights back to original research data',
        'Identify design opportunities with estimated impact and implementation effort'
      ],
      outputQuality: {
        structure: [
          'Logical progression from individual notes through clustering to strategic insights',
          'Clear prioritization framework balancing user impact and implementation feasibility',
          'Systematic documentation enabling ongoing refinement and validation'
        ],
        content: [
          'High-quality insights grounded in multiple sources of evidence',
          'Nuanced understanding of user complexity including contradictions and tensions',
          'Actionable recommendations with clear connection to design decisions'
        ],
        usability: [
          'Clear documentation enabling team understanding and stakeholder communication',
          'Integration framework connecting insights to design briefs and product decisions',
          'Update process maintaining insight relevance with ongoing research'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Thematic analysis methodology for systematic pattern identification',
        'Affinity diagramming techniques for collaborative insight development',
        'Grounded theory principles for allowing insights to emerge from data',
        'Multi-source triangulation for insight validation and reliability'
      ],
      bestPractices: [
        'High-quality individual notes are essential foundation for meaningful synthesis',
        'Collaborative clustering reveals patterns invisible to individual analysis',
        'Multiple review rounds improve insight quality and team alignment',
        'Clear documentation enables ongoing refinement and organizational learning'
      ],
      industryStandards: [
        'Qualitative research standards for data integrity and analysis rigor',
        'Privacy protection protocols for handling sensitive user research data',
        'Team collaboration best practices for inclusive and productive synthesis sessions',
        'Documentation standards enabling audit trails and methodology transparency'
      ]
    },

    customizationOptions: [
      {
        id: 'includeQuantitativeData',
        label: 'Include Quantitative Data Integration',
        type: 'checkbox',
        default: true,
        description: 'Integrate survey and analytics data with qualitative insights',
        category: 'methodology'
      },
      {
        id: 'analysisDepth',
        label: 'Analysis Depth Level',
        type: 'select',
        options: ['Surface Patterns', 'Deep Thematic Analysis', 'Strategic Insight Development'],
        default: 'Deep Thematic Analysis',
        description: 'Level of analytical depth for pattern identification',
        category: 'output'
      },
      {
        id: 'stakeholderInvolvement',
        label: 'Stakeholder Involvement Level',
        type: 'select',
        options: ['Core Team Only', 'Review and Feedback', 'Active Participation'],
        default: 'Review and Feedback',
        description: 'Level of stakeholder involvement in synthesis process',
        category: 'methodology'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services synthesis considerations',
        considerations: [
          'Include regulatory compliance implications in insight prioritization',
          'Address security and trust themes with specific attention to user anxiety patterns',
          'Consider financial literacy levels in user behavior pattern analysis',
          'Integrate risk management considerations into design opportunity assessment'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare synthesis considerations',
        considerations: [
          'Address clinical workflow integration in insight development',
          'Include caregiver and family decision-making patterns in analysis',
          'Consider health literacy and accessibility needs in theme development',
          'Integrate patient safety implications into design opportunity prioritization'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce synthesis considerations',
        considerations: [
          'Include conversion optimization insights in priority theme development',
          'Address multichannel behavior patterns and device usage implications',
          'Consider seasonal and promotional influences in user behavior analysis',
          'Integrate social proof and peer influence patterns into design opportunities'
        ]
      }
    }
  },

  // IDEATION AND DESIGN TOOLS  
  {
    id: 'brainstorming',
    name: 'Structured Creative Ideation',
    description: 'Facilitate systematic ideation sessions using proven creative thinking methods and collaboration frameworks',
    category: 'ideation',
    frameworks: ['design-thinking', 'lean-ux'],
    stages: ['ideate', 'hypothesize'],
    template: `You are an expert design facilitator and innovation strategist with extensive experience in creative ideation methodologies. Using the project knowledge provided: {knowledge_context}, design a comprehensive ideation session that generates creative solutions while maintaining focus on user needs and business objectives.

# Structured Creative Ideation Session: {{projectName}}

## Ideation Strategy Framework
**Session Objective:** {{sessionObjective}}
**Challenge Statement:** {{challengeStatement}}
**Target Participants:** {{targetParticipants}}
**Session Duration:** {{sessionDuration}}
**Expected Output:** {{expectedOutput}}
**Success Metrics:** {{successMetrics}}

## Pre-Session Preparation

### Challenge Framing and Context Setting
**Problem Definition:**
- **Core Challenge:** {{coreChallenge}}
- **User Context:** {{userContext}}
- **Business Context:** {{businessContext}}
- **Technical Context:** {{technicalContext}}
- **Constraints:** {{constraints}}

**Background Materials:**
- **User Research Summary:** {{researchSummary}}
- **Persona Profiles:** {{personaProfiles}}
- **Current Solution Analysis:** {{currentSolutionAnalysis}}
- **Competitive Landscape:** {{competitiveLandscape}}
- **Success Criteria:** {{successCriteria}}

### Participant Preparation and Team Composition
**Participant Roles:**
{{#each participantRoles}}
- **{{this.role}}:** {{this.expertise}} - {{this.contribution}}
{{/each}}

**Pre-Session Activities:**
- **Context Review:** Share background materials 48 hours before session
- **Individual Pre-Ideation:** {{preIdeationActivity}}
- **Bias Awareness:** Brief on common ideation pitfalls and cognitive biases
- **Tool Familiarization:** Introduction to ideation methods and digital tools

### Session Environment and Materials
**Physical/Digital Setup:**
- **Space:** {{sessionSpace}} with moveable furniture and collaboration walls
- **Digital Tools:** {{digitalTools}} (Miro, FigJam, or equivalent)
- **Physical Materials:** Sticky notes, markers, dot stickers, flip chart paper
- **Technology:** Projector/screens for shared viewing and documentation

## Ideation Session Structure

### Phase 1: Warm-up and Alignment ({{warmupDuration}} minutes)

**Energy Building Activity:**
- **Icebreaker:** {{icebreakerActivity}}
- **Creative Confidence:** Quick creative exercise to shift from critical to creative mindset
- **Team Norms:** Establish "Yes, And..." principle and judgment-free zone

**Challenge Alignment:**
- **Problem Restatement:** Collaborative refinement of challenge statement
- **Success Vision:** Shared understanding of what success looks like
- **Constraint Acknowledgment:** Clear identification of real vs. perceived constraints

### Phase 2: Divergent Thinking - Idea Generation ({{divergentDuration}} minutes)

**Individual Ideation ({{individualDuration}} minutes):**
- **Method:** {{individualMethod}} (Crazy 8s, Mind Mapping, or Brainwriting)
- **Focus:** Generate maximum quantity of ideas without self-censorship
- **Documentation:** Individual capture on sticky notes or digital canvas
- **Target:** {{individualTarget}} ideas per participant

**Collaborative Building ({{collaborativeDuration}} minutes):**
- **Idea Sharing:** Round-robin sharing without commentary or evaluation
- **"Yes, And..." Building:** Build upon others' ideas rather than critiquing
- **Cross-Pollination:** Encourage combination and variation of existing ideas
- **Silent Brainstorming:** {{silentBrainstormingDuration}} minutes of additional silent generation

**Advanced Ideation Techniques:**
{{#each advancedTechniques}}
**{{this.technique}} ({{this.duration}} minutes):**
- **Method:** {{this.method}}
- **Focus:** {{this.focus}}
- **Expected Output:** {{this.output}}
{{/each}}

### Phase 3: Idea Organization and Clustering ({{organizationDuration}} minutes)

**Affinity Clustering:**
- **Initial Grouping:** Organize similar ideas into natural clusters
- **Cluster Naming:** Descriptive titles that capture cluster essence
- **Gap Identification:** Note missing categories or under-explored areas
- **Redundancy Consolidation:** Combine truly duplicate ideas while preserving nuance

**Category Development:**
{{#each ideaCategories}}
- **Category:** {{this.name}}
- **Description:** {{this.description}}
- **Idea Count:** {{this.count}}
- **Potential Impact:** {{this.impact}}
{{/each}}

### Phase 4: Convergent Thinking - Idea Evaluation ({{convergentDuration}} minutes)

**Multi-Criteria Evaluation:**
**Criteria Weighting:**
- **User Value:** {{userValueWeight}}% - How well does this solve user problems?
- **Feasibility:** {{feasibilityWeight}}% - Can we realistically implement this?
- **Innovation:** {{innovationWeight}}% - How novel/differentiated is this approach?
- **Strategic Fit:** {{strategicFitWeight}}% - Does this align with business objectives?

**Evaluation Process:**
1. **Individual Scoring:** Each participant scores top ideas against all criteria
2. **Discussion:** Debate scores with specific rationale sharing
3. **Consensus Building:** Collaborative adjustment of scores where justified
4. **Final Ranking:** Mathematical ranking based on weighted criteria scores

**Selection Framework:**
{{#each selectionCriteria}}
- **{{this.criterion}}:** {{this.description}} (Weight: {{this.weight}}%)
{{/each}}

### Phase 5: Idea Development and Refinement ({{developmentDuration}} minutes)

**Top Idea Deep Dive (Top {{topIdeasCount}} Ideas):**
{{#each topIdeas}}
**Idea {{@index}}: {{this.name}}**
- **Core Concept:** {{this.concept}}
- **User Value Proposition:** {{this.userValue}}
- **Implementation Approach:** {{this.implementation}}
- **Success Metrics:** {{this.metrics}}
- **Risk Assessment:** {{this.risks}}
- **Next Steps:** {{this.nextSteps}}
{{/each}}

**Rapid Prototyping Planning:**
- **Prototype Scope:** {{prototypeScope}}
- **Testing Approach:** {{testingApproach}}
- **Resource Requirements:** {{resourceRequirements}}
- **Timeline:** {{prototypeTimeline}}

## Advanced Ideation Methodologies

### Design Thinking Integration
**How Might We Questions:**
{{#each howMightWeQuestions}}
- **HMW:** {{this.question}}
- **Generated Ideas:** {{this.ideaCount}}
- **Top Concepts:** {{this.topConcepts}}
{{/each}}

### SCAMPER Technique Application
**Systematic Idea Enhancement:**
- **Substitute:** {{substituteConcepts}}
- **Combine:** {{combineConcepts}}
- **Adapt:** {{adaptConcepts}}
- **Modify:** {{modifyConcepts}}
- **Put to Other Uses:** {{otherUsesConcepts}}
- **Eliminate:** {{eliminateConcepts}}
- **Reverse:** {{reverseConcepts}}

### Six Thinking Hats Method
**Perspective-Based Analysis:**
- **White Hat (Facts):** {{factualAnalysis}}
- **Red Hat (Emotions):** {{emotionalConsiderations}}
- **Black Hat (Caution):** {{riskAssessment}}
- **Yellow Hat (Benefits):** {{benefitAnalysis}}
- **Green Hat (Creativity):** {{creativeExtensions}}
- **Blue Hat (Process):** {{processReflection}}

## Quality Assurance and Bias Mitigation

### Creative Process Quality
- **Participation Balance:** Ensure equal contribution from all participants
- **Idea Diversity:** Assess variety across different solution categories
- **Building Behavior:** Monitor for supportive vs. critical interaction patterns
- **Energy Management:** Maintain creative energy throughout session duration

### Bias Recognition and Mitigation
**Common Biases to Address:**
- **Anchoring Bias:** Prevent fixation on early ideas
- **Authority Bias:** Ensure senior voices don't dominate creative space
- **Confirmation Bias:** Challenge ideas that confirm existing assumptions
- **Groupthink:** Maintain healthy dissent and alternative perspectives

**Mitigation Strategies:**
- **Anonymous Contribution:** Use silent brainstorming and anonymous idea submission
- **Role Rotation:** Rotate facilitation and perspective-taking roles
- **Devil's Advocate:** Assign someone to challenge popular ideas constructively
- **External Perspective:** Include outsiders or users in evaluation process

## Documentation and Follow-Up Framework

### Session Documentation
**Immediate Capture:**
- **All Generated Ideas:** {{totalIdeasGenerated}} ideas captured and categorized
- **Selection Rationale:** Decision reasoning for top-ranked ideas
- **Participant Feedback:** Session effectiveness and satisfaction assessment
- **Visual Documentation:** Photos/screenshots of ideation artifacts

**Structured Output:**
{{#each documentedOutputs}}
- **{{this.category}}:** {{this.content}}
- **Next Steps:** {{this.nextSteps}}
- **Owner:** {{this.owner}}
- **Timeline:** {{this.timeline}}
{{/each}}

### Implementation Planning
**Immediate Actions (Next 2 weeks):**
{{#each immediateActions}}
- {{this.action}} - Owner: {{this.owner}}, Due: {{this.dueDate}}
{{/each}}

**Short-term Development (Next 1-3 months):**
{{#each shortTermActions}}
- {{this.action}} - Owner: {{this.owner}}, Due: {{this.dueDate}}
{{/each}}

**Long-term Strategic Actions (3+ months):**
{{#each longTermActions}}
- {{this.action}} - Owner: {{this.owner}}, Due: {{this.dueDate}}
{{/each}}

### Success Measurement Framework
**Ideation Success Metrics:**
- **Quantity:** {{quantityMetric}} ideas generated
- **Quality:** {{qualityMetric}} ideas meeting evaluation criteria
- **Diversity:** {{diversityMetric}} different solution categories explored
- **Participant Satisfaction:** {{satisfactionMetric}}/10 average session rating

**Implementation Success Metrics:**
- **Conversion Rate:** {{conversionMetric}}% of top ideas moving to development
- **User Validation:** {{userValidationMetric}} user testing and feedback integration
- **Business Impact:** {{businessImpactMetric}} measurable business outcomes
- **Innovation Index:** {{innovationMetric}} novel solutions vs. incremental improvements

{{#if industrySpecific}}
## Industry-Specific Considerations
{{industrySpecific}}
{{/if}}

## Post-Session Optimization and Learning

### Session Retrospective
**What Worked Well:**
- Process elements that enhanced creativity and collaboration
- Environmental factors that supported productive ideation
- Participant behaviors that contributed to session success

**What Could Be Improved:**
- Process adjustments for future sessions
- Environmental or tool changes needed
- Participant preparation or facilitation improvements

**Learnings for Future Sessions:**
- Methodology refinements based on outcomes and feedback
- Team composition optimization for different challenge types
- Tool and environment recommendations for similar contexts

### Organizational Learning Integration
- **Best Practices Documentation:** Capture successful techniques for team knowledge base
- **Methodology Refinement:** Update standard ideation processes based on learnings
- **Team Skill Development:** Identify training needs for improved facilitation and participation
- **Innovation Culture:** Assess impact on organizational creative confidence and collaboration`,

    variables: [
      {
        id: 'projectName',
        name: 'Project Name',
        type: 'text',
        required: true,
        description: 'Name of the project or challenge being addressed'
      },
      {
        id: 'sessionObjective',
        name: 'Session Objective',
        type: 'textarea',
        required: true,
        description: 'Primary goal and expected outcomes from the ideation session'
      },
      {
        id: 'challengeStatement',
        name: 'Challenge Statement',
        type: 'textarea',
        required: true,
        description: 'Clear, specific statement of the problem or opportunity to address'
      },
      {
        id: 'targetParticipants',
        name: 'Target Participants',
        type: 'text',
        required: true,
        description: 'Who should participate and why (roles, expertise, perspectives needed)'
      },
      {
        id: 'sessionDuration',
        name: 'Session Duration',
        type: 'select',
        required: true,
        options: ['90 minutes', '2 hours', '3 hours', 'Half day', 'Full day'],
        description: 'Total time allocated for ideation session'
      },
      {
        id: 'individualMethod',
        name: 'Individual Ideation Method',
        type: 'select',
        required: true,
        options: ['Crazy 8s', 'Mind Mapping', 'Brainwriting', 'SCAMPER', 'Free Association'],
        description: 'Primary method for individual idea generation'
      }
    ],

    instructions: [
      'Structure ideation sessions to balance divergent thinking (idea generation) with convergent thinking (evaluation and selection)',
      'Use proven creative thinking methods like Crazy 8s, SCAMPER, and How Might We questions to stimulate innovation',
      'Implement "Yes, And..." principle to build upon ideas rather than immediately critiquing them',
      'Ensure diverse participation through balanced facilitation and anonymous contribution opportunities',
      'Apply systematic evaluation criteria that balance user value, feasibility, innovation, and strategic fit',
      'Document all ideas and rationale for systematic follow-up and implementation planning',
      'Address cognitive biases that can limit creative thinking through structured process and awareness',
      'Plan for immediate next steps and clear ownership of top ideas for continued development',
      'Create psychological safety that encourages wild ideas and builds creative confidence',
      'Connect ideation outcomes to user research insights and business objectives for grounded innovation'
    ],

    expectedOutput: `Structured ideation session including:
- Comprehensive session plan with proven creative thinking methodologies
- Systematic evaluation framework balancing multiple criteria and stakeholder perspectives  
- Detailed documentation of all generated ideas with clear next steps and ownership
- Quality assurance measures addressing participation balance and cognitive bias mitigation
- Implementation roadmap connecting creative concepts to user validation and business outcomes`,

    qualityMetrics: {
      completionTime: '2-8 hours depending on session scope and complexity',
      difficultyLevel: 'intermediate',
      participantCount: {
        min: 4,
        max: 12,
        recommended: 8
      },
      successCriteria: [
        'Generate 50+ ideas with diversity across multiple solution categories',
        'Achieve balanced participation from all session participants',
        'Select 3-5 top ideas with clear implementation roadmap and ownership',
        'Maintain high creative energy and psychological safety throughout session'
      ],
      outputQuality: {
        structure: [
          'Clear progression from problem framing through idea generation to systematic evaluation',
          'Balanced time allocation supporting both creative and analytical thinking phases',
          'Comprehensive documentation enabling effective follow-up and implementation'
        ],
        content: [
          'High-quality ideas demonstrating creative thinking within realistic constraints',
          'Evidence of building upon and combining concepts rather than just individual contributions',
          'Clear connection between generated solutions and underlying user needs and business objectives'
        ],
        usability: [
          'Clear next steps and ownership assignments for continued idea development',
          'Systematic evaluation framework enabling consistent decision-making',
          'Session structure and methodologies that can be replicated for future challenges'
        ]
      }
    },

    researchBacking: {
      methodology: [
        'Design thinking ideation principles for user-centered solution development',
        'IDEO methodology for balancing individual and collaborative creative processes',
        'Systematic creativity techniques including SCAMPER and Six Thinking Hats',
        'Group facilitation best practices for maximizing creative collaboration'
      ],
      bestPractices: [
        'Individual ideation before group sharing prevents groupthink and promotes diversity',
        'Structured evaluation criteria enable objective selection while maintaining creativity',
        'Time-boxed activities maintain energy and prevent over-analysis during creative phases',
        'Clear documentation and follow-up planning ensure ideas translate to implementable solutions'
      ],
      industryStandards: [
        'Innovation management frameworks for systematic creative process implementation',
        'Team collaboration guidelines ensuring inclusive participation and psychological safety',
        'Intellectual property considerations for idea documentation and development rights',
        'Project management integration for connecting creative outputs to development workflows'
      ]
    },

    customizationOptions: [
      {
        id: 'includeRemoteParticipation',
        label: 'Include Remote Participation',
        type: 'checkbox',
        default: false,
        description: 'Design session for hybrid in-person and remote participant collaboration',
        category: 'methodology'
      },
      {
        id: 'ideationIntensity',
        label: 'Ideation Intensity Level',
        type: 'select',
        options: ['Rapid Exploration', 'Thorough Development', 'Deep Innovation'],
        default: 'Thorough Development',
        description: 'Balance between idea quantity and individual concept depth',
        category: 'output'
      },
      {
        id: 'evaluationComplexity',
        label: 'Evaluation Complexity',
        type: 'select',
        options: ['Simple Voting', 'Multi-Criteria Analysis', 'Sophisticated Scoring'],
        default: 'Multi-Criteria Analysis',
        description: 'Level of systematic analysis for idea selection and prioritization',
        category: 'methodology'
      }
    ],

    industryAdaptations: {
      fintech: {
        template: 'Enhanced with financial services ideation considerations',
        considerations: [
          'Include regulatory compliance constraints and opportunities in creative parameters',
          'Focus on trust-building and security concerns as innovation opportunities',
          'Consider financial literacy levels and accessibility in solution ideation',
          'Address risk management and fraud prevention as creative challenges'
        ]
      },
      healthcare: {
        template: 'Enhanced with healthcare ideation considerations',
        considerations: [
          'Include patient safety and clinical workflow considerations in all ideation',
          'Focus on care coordination and provider communication as innovation areas',
          'Consider diverse health literacy levels and accessibility needs in solution development',
          'Address regulatory compliance (HIPAA, FDA) as design constraints and opportunities'
        ]
      },
      ecommerce: {
        template: 'Enhanced with e-commerce ideation considerations',
        considerations: [
          'Include conversion optimization and customer acquisition challenges in ideation scope',
          'Focus on personalization and customer experience differentiation opportunities',
          'Consider omnichannel and cross-device experience integration in solution ideation',
          'Address social proof and peer influence as innovation opportunities'
        ]
      }
    }
  },
  
  // SURVEYS - Quantitative Survey Research
  {
    id: 'surveys',
    name: 'Surveys',
    description: 'Design and conduct quantitative surveys using psychometric principles and statistical validation',
    category: 'research',
    frameworks: ['design-thinking'],
    stages: ['empathize'],
    variables: [
      {
        id: 'knowledge_context',
        name: 'Project Knowledge Context',
        type: 'textarea',
        required: true,
        description: 'Project knowledge file information that will be used to contextualize the survey'
      },
      {
        id: 'research_objectives',
        name: 'Research Objectives',
        type: 'textarea',
        required: true,
        description: 'What specific research questions need to be answered?'
      },
      {
        id: 'target_population',
        name: 'Target Population',
        type: 'text',
        required: true,
        description: 'Description of the target survey population'
      },
      {
        id: 'survey_length',
        name: 'Survey Length',
        type: 'select',
        required: true,
        description: 'Desired survey completion time',
        options: ['5-10 minutes', '10-15 minutes', '15-20 minutes', '20+ minutes']
      }
    ],
    instructions: `You are an expert UX researcher and survey methodologist. Using the project knowledge provided: {knowledge_context}, create a comprehensive quantitative survey following psychometric principles and 2025 best practices.

**Survey Design Framework:**
1. **Question Development** - Create questions that directly address {research_objectives}
2. **Response Scale Design** - Use validated scales (Likert, semantic differential, ranking)
3. **Bias Mitigation** - Apply randomization, balanced scales, and neutral language
4. **Accessibility** - Ensure WCAG compliance and multiple format compatibility

**Survey Structure:**
- **Introduction** (establishes trust and explains purpose)
- **Screening Questions** (qualify {target_population})
- **Core Research Questions** (address {research_objectives})
- **Demographics** (collect relevant segmentation data)
- **Thank You** (next steps and incentive information)

**Psychometric Validation:**
- Pre-test with 5-10 participants before full deployment
- Include attention check questions for data quality
- Use reverse-coded items to detect response bias
- Calculate internal consistency (Cronbach's alpha > 0.7)

**Distribution Strategy:**
- Multi-channel approach for representative sampling
- Mobile-optimized design for accessibility
- Reminder sequence for improved response rates
- Incentive structure aligned with {target_population}

**Data Analysis Plan:**
- Descriptive statistics for all variables
- Cross-tabulation by key demographics
- Statistical significance testing where appropriate
- Confidence intervals and margin of error reporting

**Target:** {survey_length} completion time with >15% response rate and representative sample of {target_population}.`,
    
    customizationOptions: [
      {
        id: 'survey_type',
        label: 'Survey Type',
        type: 'select',
        options: ['Customer satisfaction', 'Market research', 'User preferences', 'Needs assessment', 'Concept testing'],
        default: 'User preferences',
        description: 'Type of survey research being conducted',
        category: 'methodology'
      },
      {
        id: 'sample_size',
        label: 'Target Sample Size',
        type: 'number',
        default: 200,
        description: 'Desired number of completed responses',
        category: 'constraints'
      }
    ],
    
    qualityMetrics: {
      completionTime: '2-4 weeks',
      difficultyLevel: 'intermediate',
      participantCount: { min: 50, max: 1000, recommended: 200 },
      successCriteria: [
        'Response rate above 15%',
        'Representative sample achieved',
        'Data quality metrics met (attention checks passed)',
        'Statistical power adequate for analysis'
      ],
      outputQuality: {
        structure: ['Clear research questions', 'Validated scales', 'Logical flow'],
        content: ['Bias-free language', 'Actionable insights', 'Statistical rigor'],
        usability: ['Mobile optimization', 'Accessibility compliance', 'Clear instructions']
      }
    },

    industryAdaptations: {
      'healthcare': {
        additionalConsiderations: [
          'HIPAA compliance for patient data collection',
          'Medical terminology validation with clinical experts',
          'IRB approval requirements for human subjects research'
        ]
      },
      'financial': {
        additionalConsiderations: [
          'Regulatory compliance with financial data privacy',
          'Risk assessment questions for financial products',
          'Economic behavior and decision-making factors'
        ]
      }
    }
  },

  // OBSERVATIONS - Ethnographic User Observation
  {
    id: 'observations',
    name: 'Observations',
    description: 'Conduct systematic ethnographic user observations with behavioral analysis methodology',
    category: 'research',
    frameworks: ['design-thinking'],
    stages: ['empathize'],
    variables: [
      {
        id: 'knowledge_context',
        name: 'Project Knowledge Context',
        type: 'textarea',
        required: true,
        description: 'Project knowledge file information that will inform the observation focus'
      },
      {
        id: 'observation_context',
        name: 'Observation Context',
        type: 'text',
        required: true,
        description: 'Where and when will observations take place?'
      },
      {
        id: 'behavior_focus',
        name: 'Behavioral Focus',
        type: 'textarea',
        required: true,
        description: 'What specific behaviors or interactions should be observed?'
      },
      {
        id: 'observation_duration',
        name: 'Observation Duration',
        type: 'select',
        required: true,
        description: 'Total observation time per session',
        options: ['30 minutes', '1 hour', '2 hours', 'Half day', 'Full day']
      }
    ],
    instructions: `You are an expert UX ethnographer and behavioral researcher. Using the project knowledge provided: {knowledge_context}, design a comprehensive observational study following systematic ethnographic methodology and 2025 naturalistic research best practices.

**Observation Framework:**
1. **Naturalistic Setting** - Observe users in {observation_context} without interference
2. **Behavioral Mapping** - Document {behavior_focus} using structured protocols
3. **Environmental Analysis** - Record contextual factors influencing behavior
4. **Interaction Patterns** - Identify social and technological interaction dynamics

**Systematic Documentation:**
- **Behavior Coding Sheet** (predetermined categories for consistent recording)
- **Temporal Mapping** (chronological sequence of user actions)
- **Environmental Factors** (physical/digital context influencing behavior)
- **Pain Points & Workarounds** (friction moments and user adaptations)
- **Emotional Responses** (observable indicators of user sentiment)

**Ethnographic Methodology:**
- Pre-observation reconnaissance to understand context
- Unobtrusive positioning to minimize observer effect
- Continuous field notes using structured templates
- Photography/video (with consent) for behavioral analysis
- Post-observation reflection and pattern identification

**Cultural Sensitivity:**
- Respect for user privacy and cultural norms
- Informed consent for observation and documentation
- Awareness of power dynamics and observer bias
- Inclusive approach to diverse user behaviors

**Analysis Framework:**
- Thematic coding of behavioral patterns
- Frequency analysis of critical interactions
- Journey mapping from observational data
- Pain point prioritization matrix
- Recommendation development based on evidence

**Duration:** {observation_duration} per participant with minimum 5 participants for pattern validation.`,
    
    customizationOptions: [
      {
        id: 'observation_method',
        label: 'Observation Method',
        type: 'select',
        options: ['Silent observation', 'Think-aloud protocol', 'Contextual inquiry', 'Shadowing'],
        default: 'Silent observation',
        description: 'Method of conducting observations',
        category: 'methodology'
      },
      {
        id: 'recording_method',
        label: 'Recording Method',
        type: 'multiselect',
        options: ['Field notes', 'Audio recording', 'Video recording', 'Photography', 'Screen recording'],
        default: ['Field notes'],
        description: 'Methods for documenting observations',
        category: 'methodology'
      }
    ],
    
    qualityMetrics: {
      completionTime: '2-3 weeks',
      difficultyLevel: 'advanced',
      participantCount: { min: 5, max: 15, recommended: 8 },
      successCriteria: [
        'Rich behavioral data collected',
        'Patterns identified across multiple participants',
        'Environmental factors documented',
        'Actionable insights generated'
      ],
      outputQuality: {
        structure: ['Systematic documentation', 'Consistent coding', 'Temporal mapping'],
        content: ['Behavioral patterns', 'Contextual insights', 'Evidence-based recommendations'],
        usability: ['Accessible findings', 'Actionable insights', 'Visual documentation']
      }
    },

    industryAdaptations: {
      'healthcare': {
        additionalConsiderations: [
          'HIPAA compliance for patient observation',
          'Clinical workflow sensitivity',
          'Medical device interaction protocols'
        ]
      },
      'retail': {
        additionalConsiderations: [
          'Customer journey mapping focus',
          'Purchase decision observation',
          'Store environment impact analysis'
        ]
      }
    }
  },

  // EMPATHY MAPS (DESIGN THINKING)
  {
    id: 'empathy-maps-dt',
    name: 'Empathy Maps',
    description: 'Create comprehensive empathy maps using research validation and behavioral insights',
    category: 'analysis',
    frameworks: ['design-thinking'],
    stages: ['empathize'],
    variables: [
      {
        id: 'knowledge_context',
        name: 'Project Knowledge Context',
        type: 'textarea',
        required: true,
        description: 'Project knowledge file information providing user research data'
      },
      {
        id: 'target_user',
        name: 'Target User',
        type: 'text',
        required: true,
        description: 'Primary user type for empathy mapping'
      },
      {
        id: 'research_source',
        name: 'Research Source',
        type: 'textarea',
        required: true,
        description: 'What research data will inform the empathy map?'
      },
      {
        id: 'context_scenario',
        name: 'Context Scenario',
        type: 'text',
        required: true,
        description: 'Specific scenario or use case for the empathy map'
      }
    ],
    instructions: `You are an expert UX researcher and empathy mapping specialist. Using the project knowledge provided: {knowledge_context}, create a comprehensive empathy map for {target_user} based on {research_source} following research-validated methodology and 2025 best practices.

**Empathy Map Framework:**
1. **SAYS** - Direct quotes and verbal expressions from user research
2. **THINKS** - Internal thoughts, beliefs, and cognitive processes  
3. **DOES** - Observable behaviors, actions, and interactions
4. **FEELS** - Emotions, feelings, and emotional responses

**Research Integration:**
- Ground each quadrant in specific evidence from {research_source}
- Include contradictions and complexity rather than oversimplifying
- Reference direct user quotes and behavioral observations
- Connect insights to {context_scenario} for relevance

**Advanced Empathy Mapping:**
- **Pain Points** - Frustrations, obstacles, and negative experiences
- **Gain Opportunities** - Motivations, goals, and desired outcomes
- **Influences** - External factors affecting user decisions
- **User Goals** - Primary and secondary objectives in {context_scenario}

**Validation Methodology:**
- Cross-reference findings with multiple research sources
- Validate assumptions through additional user touchpoints
- Include confidence levels for each insight (high/medium/low)
- Document gaps requiring further research

**Synthesis Process:**
- Collaborative review with research team members
- Stakeholder validation sessions for accuracy
- Integration with personas and journey mapping
- Action planning based on empathy insights

**Output Format:**
- Visual empathy map with clear quadrant organization
- Supporting evidence documentation for each insight
- Priority ranking of pain points and opportunities
- Recommendations for design implications

Focus on {target_user} in {context_scenario} using validated insights from {research_source}.`,
    
    customizationOptions: [
      {
        id: 'empathy_depth',
        label: 'Empathy Depth Level',
        type: 'select',
        options: ['Basic (4 quadrants)', 'Extended (6 sections)', 'Comprehensive (8+ dimensions)'],
        default: 'Extended (6 sections)',
        description: 'Level of detail for empathy mapping',
        category: 'methodology'
      },
      {
        id: 'validation_method',
        label: 'Validation Method',
        type: 'select',
        options: ['Stakeholder review', 'User validation', 'Research triangulation', 'Team synthesis'],
        default: 'Research triangulation',
        description: 'How will the empathy map be validated?',
        category: 'quality'
      }
    ],
    
    qualityMetrics: {
      completionTime: '1-2 weeks',
      difficultyLevel: 'intermediate',
      participantCount: { min: 1, max: 3, recommended: 1 },
      successCriteria: [
        'Research-backed insights in each quadrant',
        'User quotes and evidence provided',
        'Actionable pain points identified',
        'Design opportunities highlighted'
      ],
      outputQuality: {
        structure: ['Clear quadrant organization', 'Evidence documentation', 'Priority ranking'],
        content: ['Research validation', 'User voice integration', 'Actionable insights'],
        usability: ['Visual clarity', 'Stakeholder accessibility', 'Design implications']
      }
    },

    industryAdaptations: {
      'b2b': {
        additionalConsiderations: [
          'Organizational context and stakeholder influences',
          'Business process integration requirements',
          'Decision-making hierarchy impact on user experience'
        ]
      },
      'consumer': {
        additionalConsiderations: [
          'Lifestyle and personal context factors',
          'Emotional and aspirational drivers',
          'Social influence and peer pressure dynamics'
        ]
      }
    }
  },

  // AFFINITY MAPPING
  {
    id: 'affinity-mapping',
    name: 'Affinity Mapping',
    description: 'Synthesize research insights using collaborative thematic analysis and bias mitigation techniques',
    category: 'analysis',
    frameworks: ['design-thinking'],
    stages: ['define'],
    variables: [
      {
        id: 'knowledge_context',
        name: 'Project Knowledge Context',
        type: 'textarea',
        required: true,
        description: 'Project knowledge file information containing research data to be synthesized'
      },
      {
        id: 'research_data',
        name: 'Research Data Sources',
        type: 'textarea',
        required: true,
        description: 'What research data will be analyzed (interviews, observations, surveys, etc.)?'
      },
      {
        id: 'synthesis_goal',
        name: 'Synthesis Goal',
        type: 'text',
        required: true,
        description: 'What patterns or insights are you hoping to discover?'
      },
      {
        id: 'team_size',
        name: 'Team Size',
        type: 'number',
        required: true,
        description: 'Number of people participating in affinity mapping',
        validation: { min: 2, max: 8 }
      }
    ],
    instructions: `You are an expert UX researcher and synthesis specialist. Using the project knowledge provided: {knowledge_context}, facilitate a comprehensive affinity mapping session to synthesize {research_data} and achieve {synthesis_goal} using collaborative analysis methodology and 2025 best practices for bias mitigation.

**Affinity Mapping Process:**
1. **Data Preparation** - Extract discrete insights from {research_data}
2. **Individual Clustering** - Each team member groups insights independently
3. **Collaborative Synthesis** - Merge individual clusters through discussion
4. **Theme Development** - Create meaningful labels and hierarchies
5. **Pattern Validation** - Cross-check themes against original research

**Systematic Methodology:**
- **Atomic Insights** - Break down research into specific, discrete observations
- **Silent Clustering** - Initial grouping without discussion to reduce bias
- **Collaborative Refinement** - Team discussion to merge and refine clusters
- **Hierarchical Organization** - Create super-themes and sub-themes
- **Evidence Mapping** - Link themes back to specific research evidence

**Bias Mitigation Strategies:**
- Rotate facilitation among {team_size} participants
- Use structured discussion protocols
- Include diverse perspectives in analysis
- Document dissenting viewpoints and edge cases
- Validate themes with original research participants

**Advanced Synthesis Techniques:**
- **Saturation Analysis** - Identify when new data stops producing new themes
- **Negative Case Analysis** - Explicitly look for contradictory evidence
- **Member Checking** - Validate findings with research participants
- **Triangulation** - Cross-reference themes across multiple data sources

**Documentation Framework:**
- Visual cluster maps with clear theme labels
- Supporting evidence for each theme (quotes, observations)
- Theme priority ranking based on frequency and impact
- Insight confidence levels and supporting evidence strength
- Action items and design implications for each major theme

**Workshop Structure:**
- Pre-work: Individual data review and initial insights
- Session 1: Silent clustering and individual presentations
- Session 2: Collaborative merging and theme development
- Session 3: Validation and prioritization
- Follow-up: Documentation and stakeholder communication

Target {synthesis_goal} through systematic analysis of {research_data} with {team_size} team members.`,
    
    customizationOptions: [
      {
        id: 'synthesis_method',
        label: 'Synthesis Method',
        type: 'select',
        options: ['Traditional affinity', 'Thematic analysis', 'Grounded theory', 'Framework analysis'],
        default: 'Traditional affinity',
        description: 'Methodology for insight synthesis',
        category: 'methodology'
      },
      {
        id: 'output_format',
        label: 'Output Format',
        type: 'select',
        options: ['Visual clusters', 'Hierarchical themes', 'Journey insights', 'Problem statements'],
        default: 'Hierarchical themes',
        description: 'Primary output format for synthesis results',
        category: 'output'
      }
    ],
    
    qualityMetrics: {
      completionTime: '1-2 weeks',
      difficultyLevel: 'intermediate',
      participantCount: { min: 2, max: 8, recommended: 4 },
      successCriteria: [
        'Clear thematic patterns identified',
        'Evidence-backed insights generated',
        'Team consensus on major themes',
        'Actionable design implications developed'
      ],
      outputQuality: {
        structure: ['Hierarchical theme organization', 'Evidence documentation', 'Priority ranking'],
        content: ['Research validation', 'Insight depth', 'Bias mitigation'],
        usability: ['Visual clarity', 'Stakeholder communication', 'Action orientation']
      }
    },

    industryAdaptations: {
      'enterprise': {
        additionalConsiderations: [
          'Stakeholder consensus building across departments',
          'Business requirement integration with user insights',
          'Change management implications for synthesis findings'
        ]
      },
      'startup': {
        additionalConsiderations: [
          'Resource-constrained synthesis approaches',
          'Rapid iteration and validation cycles',
          'Product-market fit implications of research themes'
        ]
      }
    }
  },

  // BRAINSTORMING
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Facilitate structured creative ideation using systematic evaluation frameworks and divergent-convergent methodology',
    category: 'ideation',
    frameworks: ['design-thinking'],
    stages: ['ideate'],
    variables: [
      {
        id: 'knowledge_context',
        name: 'Project Knowledge Context',
        type: 'textarea',
        required: true,
        description: 'Project knowledge file information that will inform ideation constraints and opportunities'
      },
      {
        id: 'challenge_statement',
        name: 'Challenge Statement',
        type: 'textarea',
        required: true,
        description: 'The specific problem or opportunity for ideation (How might we...?)'
      },
      {
        id: 'ideation_focus',
        name: 'Ideation Focus',
        type: 'select',
        required: true,
        description: 'Primary focus area for idea generation',
        options: ['Features & functionality', 'User experience improvements', 'Business model innovation', 'Technology solutions', 'Service design']
      },
      {
        id: 'session_duration',
        name: 'Session Duration',
        type: 'select',
        required: true,
        description: 'Total brainstorming session time',
        options: ['30 minutes', '1 hour', '2 hours', 'Half day workshop']
      }
    ],
    instructions: `You are an expert innovation facilitator and creative ideation specialist. Using the project knowledge provided: {knowledge_context}, design and facilitate a comprehensive brainstorming session to address {challenge_statement} with focus on {ideation_focus} using structured creative methodology and 2025 best practices for systematic innovation.

**Structured Ideation Framework:**
1. **Divergent Phase** - Generate maximum quantity without judgment
2. **Convergent Phase** - Evaluate and prioritize using systematic criteria
3. **Development Phase** - Elaborate on top concepts with feasibility analysis
4. **Validation Phase** - Assess ideas against user needs and business goals

**Session Design ({session_duration}):**
- **Warm-up** (10%) - Creative exercises to prime innovative thinking
- **Problem Reframing** (15%) - Multiple perspectives on {challenge_statement}
- **Divergent Ideation** (40%) - Rapid idea generation using multiple techniques
- **Convergent Evaluation** (25%) - Systematic assessment and clustering
- **Development Planning** (10%) - Next steps for promising concepts

**Ideation Techniques:**
- **Classic Brainstorming** - Build on others' ideas, defer judgment
- **Brainwriting** - Silent idea generation to reduce groupthink
- **SCAMPER Method** - Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
- **Worst Possible Ideas** - Generate bad ideas to stimulate creative thinking
- **Analogical Thinking** - Draw inspiration from unrelated domains

**Evaluation Framework:**
- **Feasibility** - Technical and resource constraints from {knowledge_context}
- **Desirability** - User value and problem-solution fit
- **Viability** - Business model alignment and market opportunity
- **Innovation Level** - Degree of novelty and competitive differentiation
- **Implementation Timeline** - Short-term vs. long-term opportunities

**Systematic Assessment:**
- Dot voting for initial prioritization
- Impact vs. Effort matrix plotting
- Assumption mapping for top concepts
- Risk assessment and mitigation planning
- Resource requirement estimation

**Output Deliverables:**
- Comprehensive idea inventory (100+ ideas target)
- Prioritized concept portfolio (top 10-15 ideas)
- Detailed concept descriptions for top 3-5 ideas
- Implementation roadmap with next steps
- Assumption testing plan for validation

Focus on {ideation_focus} solutions for {challenge_statement} informed by insights from {knowledge_context}.`,
    
    customizationOptions: [
      {
        id: 'facilitation_style',
        label: 'Facilitation Style',
        type: 'select',
        options: ['Structured workshop', 'Freeform session', 'Design sprint style', 'Innovation tournament'],
        default: 'Structured workshop',
        description: 'Approach to facilitating the brainstorming session',
        category: 'methodology'
      },
      {
        id: 'evaluation_criteria',
        label: 'Primary Evaluation Criteria',
        type: 'multiselect',
        options: ['User impact', 'Technical feasibility', 'Business value', 'Innovation level', 'Implementation speed'],
        default: ['User impact', 'Technical feasibility', 'Business value'],
        description: 'Criteria for assessing and prioritizing ideas',
        category: 'output'
      }
    ],
    
    qualityMetrics: {
      completionTime: '1 week',
      difficultyLevel: 'beginner',
      participantCount: { min: 4, max: 12, recommended: 6 },
      successCriteria: [
        '100+ ideas generated in divergent phase',
        'Systematic evaluation framework applied',
        'Top concepts developed with detail',
        'Clear next steps identified'
      ],
      outputQuality: {
        structure: ['Divergent-convergent flow', 'Systematic evaluation', 'Prioritized output'],
        content: ['Creative diversity', 'Feasibility assessment', 'Actionable concepts'],
        usability: ['Clear facilitation', 'Participant engagement', 'Tangible outcomes']
      }
    },

    industryAdaptations: {
      'technology': {
        additionalConsiderations: [
          'Technical architecture constraints and opportunities',
          'Platform ecosystem integration requirements',
          'Scalability and performance implications for ideas'
        ]
      },
      'healthcare': {
        additionalConsiderations: [
          'Regulatory compliance requirements for medical solutions',
          'Patient safety and clinical workflow integration',
          'Evidence-based design and clinical validation needs'
        ]
      }
    }
  }
];

/**
 * Get enhanced tool template by ID
 */
export function getEnhancedTemplateById(id: string): EnhancedToolPromptTemplate | undefined {
  return enhancedToolPromptTemplates.find(template => template.id === id);
}

/**
 * Get enhanced templates by framework and stage
 */
export function getEnhancedTemplatesByFrameworkAndStage(
  framework: string,
  stage: string
): EnhancedToolPromptTemplate[] {
  return enhancedToolPromptTemplates.filter(template => 
    template.frameworks.includes(framework) && template.stages.includes(stage)
  );
}

/**
 * Get enhanced templates by category
 */
export function getEnhancedTemplatesByCategory(
  category: EnhancedToolPromptTemplate['category']
): EnhancedToolPromptTemplate[] {
  return enhancedToolPromptTemplates.filter(template => template.category === category);
}

/**
 * Get all enhanced tool templates
 */
export function getAllEnhancedTemplates(): EnhancedToolPromptTemplate[] {
  return enhancedToolPromptTemplates;
}

/**
 * Get industry-specific adaptations for a template
 */
export function getIndustryAdaptation(
  templateId: string, 
  industry: string
): EnhancedToolPromptTemplate['industryAdaptations'] | undefined {
  const template = getEnhancedTemplateById(templateId);
  return template?.industryAdaptations?.[industry];
}

/**
 * Get customization options for a template
 */
export function getTemplateCustomizationOptions(
  templateId: string
): CustomizationOption[] {
  const template = getEnhancedTemplateById(templateId);
  return template?.customizationOptions || [];
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  templateId: string,
  variables: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const template = getEnhancedTemplateById(templateId);
  if (!template) {
    return { isValid: false, errors: ['Template not found'] };
  }

  const errors: string[] = [];

  template.variables.forEach(variable => {
    const value = variables[variable.id];

    // Check required fields
    if (variable.required && (value === undefined || value === null || value === '')) {
      errors.push(`${variable.name} is required`);
      return;
    }

    // Skip validation for empty optional fields
    if (!value && !variable.required) return;

    // Type validation
    if (variable.type === 'number' && typeof value !== 'number') {
      errors.push(`${variable.name} must be a number`);
    }

    // Validation rules
    if (variable.validation) {
      const val = variable.validation;
      if (val.min && value < val.min) {
        errors.push(val.message || `${variable.name} must be at least ${val.min}`);
      }
      if (val.max && value > val.max) {
        errors.push(val.message || `${variable.name} must be at most ${val.max}`);
      }
      if (val.pattern && typeof value === 'string' && !new RegExp(val.pattern).test(value)) {
        errors.push(val.message || `${variable.name} format is invalid`);
      }
    }

    // Options validation for select fields
    if (variable.options && !variable.options.includes(value)) {
      errors.push(`${variable.name} must be one of: ${variable.options.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}