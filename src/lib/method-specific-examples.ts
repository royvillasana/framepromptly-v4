/**
 * @fileoverview Method-Specific Examples and Templates
 * Provides curated examples for each prompt engineering method in UX contexts
 */

import { PromptEngineeringMethod } from './prompt-engineering-methods';

export interface MethodExample {
  id: string;
  title: string;
  description: string;
  context: string;
  input: string;
  methodParameters: Record<string, any>;
  expectedOutput: string;
  notes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface MethodTemplate {
  id: string;
  name: string;
  description: string;
  method: PromptEngineeringMethod;
  template: string;
  defaultParameters: Record<string, any>;
  variables: {
    id: string;
    name: string;
    description: string;
    example: string;
  }[];
  useCase: string;
}

/**
 * Comprehensive examples for each prompt engineering method in UX contexts
 */
export const METHOD_EXAMPLES: Record<PromptEngineeringMethod, MethodExample[]> = {
  'zero-shot': [
    {
      id: 'zs-interview-guide',
      title: 'User Interview Guide Generation',
      description: 'Generate a complete user interview guide without examples',
      context: 'UX researcher needs to create interview questions for a mobile banking app',
      input: 'Create a user interview guide for understanding how people manage their finances using mobile banking apps. Focus on daily habits, pain points, and security concerns.',
      methodParameters: {
        temperature: 0.7,
        maxTokens: 1000
      },
      expectedOutput: 'Structured interview guide with warm-up, main, and follow-up questions covering financial habits, mobile app usage, and security preferences',
      notes: [
        'Works well for straightforward, well-defined tasks',
        'No examples needed - relies on clear task description',
        'Good for experienced practitioners who know what they want'
      ],
      difficulty: 'beginner',
      tags: ['research', 'interviews', 'fintech', 'mobile']
    },
    {
      id: 'zs-persona-creation',
      title: 'User Persona Development',
      description: 'Direct persona creation from research data',
      context: 'Product team has user research data and needs personas created',
      input: 'Based on our user research showing that our users are primarily 25-40 year old professionals who value efficiency and have limited time for complex processes, create 2-3 user personas for our productivity software.',
      methodParameters: {
        temperature: 0.6,
        maxTokens: 1200
      },
      expectedOutput: 'Detailed personas with demographics, goals, frustrations, and scenarios',
      notes: [
        'Requires comprehensive input description',
        'Best when research findings are clear',
        'Efficient for straightforward persona creation'
      ],
      difficulty: 'intermediate',
      tags: ['personas', 'research synthesis', 'productivity']
    }
  ],

  'few-shot': [
    {
      id: 'fs-usability-findings',
      title: 'Usability Test Findings Format',
      description: 'Generate consistent usability findings using example format',
      context: 'UX researcher needs to document usability test findings in consistent format',
      input: 'Format the following usability findings: Users struggled with navigation, checkout process had high abandonment, search functionality was unclear',
      methodParameters: {
        exampleCount: 3,
        temperature: 0.5,
        shuffleExamples: false
      },
      expectedOutput: 'Structured findings with severity, impact, recommendations, and evidence',
      notes: [
        'Excellent for maintaining consistency across findings',
        'Examples teach the desired format and level of detail',
        'Reduces variation in documentation quality'
      ],
      difficulty: 'intermediate',
      tags: ['usability testing', 'documentation', 'findings']
    },
    {
      id: 'fs-research-synthesis',
      title: 'Research Insight Synthesis',
      description: 'Synthesize user research into actionable insights using examples',
      context: 'Multiple research methods generated data that needs synthesis',
      input: 'Synthesize these research findings into key insights: Interview data shows users want faster processes, survey indicates 73% find current system confusing, analytics show high drop-off at step 3',
      methodParameters: {
        exampleCount: 4,
        temperature: 0.4,
        shuffleExamples: true
      },
      expectedOutput: 'Prioritized insights with supporting evidence and design implications',
      notes: [
        'Great for teaching synthesis patterns',
        'Examples show how to connect different data sources',
        'Maintains consistent insight quality'
      ],
      difficulty: 'advanced',
      tags: ['research synthesis', 'insights', 'data analysis']
    }
  ],

  'chain-of-thought': [
    {
      id: 'cot-ia-design',
      title: 'Information Architecture Design',
      description: 'Step-by-step reasoning through IA design decisions',
      context: 'Designing information architecture for complex e-commerce platform',
      input: 'Design the information architecture for a B2B marketplace that serves both buyers and suppliers with different needs and workflows',
      methodParameters: {
        reasoning_steps: 6,
        show_work: true,
        verify_logic: true
      },
      expectedOutput: 'Step-by-step reasoning covering user analysis, content audit, categorization strategy, navigation design, and validation approach',
      notes: [
        'Excellent for complex design problems',
        'Shows transparent reasoning process',
        'Helps validate design decisions'
      ],
      difficulty: 'advanced',
      tags: ['information architecture', 'complex systems', 'B2B']
    },
    {
      id: 'cot-accessibility-audit',
      title: 'Accessibility Audit Planning',
      description: 'Systematic reasoning through accessibility evaluation',
      context: 'Planning comprehensive accessibility audit for web application',
      input: 'Plan an accessibility audit for a healthcare patient portal that needs to meet WCAG 2.1 AA standards and serve users with diverse abilities',
      methodParameters: {
        reasoning_steps: 5,
        show_work: true,
        verify_logic: true
      },
      expectedOutput: 'Logical progression through audit planning: user needs analysis, standards review, testing methodology, tool selection, and success criteria',
      notes: [
        'Perfect for systematic evaluation tasks',
        'Ensures comprehensive coverage',
        'Documents decision rationale'
      ],
      difficulty: 'advanced',
      tags: ['accessibility', 'healthcare', 'auditing', 'WCAG']
    }
  ],

  'tree-of-thought': [
    {
      id: 'tot-feature-prioritization',
      title: 'Feature Prioritization Strategy',
      description: 'Explore multiple approaches to feature prioritization',
      context: 'Product team needs to prioritize features for next quarter with limited resources',
      input: 'Develop a feature prioritization strategy for our SaaS project management tool. We have 15 potential features, limited development resources, and need to balance user requests, business goals, and technical debt',
      methodParameters: {
        branches: 3,
        depth: 3,
        evaluation_criteria: ['user impact', 'business value', 'development effort', 'strategic alignment']
      },
      expectedOutput: 'Three distinct prioritization approaches with evaluation and recommended strategy',
      notes: [
        'Excellent for strategic decisions',
        'Explores multiple valid approaches',
        'Provides thorough evaluation framework'
      ],
      difficulty: 'advanced',
      tags: ['product strategy', 'prioritization', 'SaaS', 'decision making']
    },
    {
      id: 'tot-research-methodology',
      title: 'Research Methodology Selection',
      description: 'Compare different research approaches for complex problem',
      context: 'Understanding user behavior for fintech app requires research methodology decision',
      input: 'Choose the best research methodology to understand why users abandon our investment app during onboarding. We need insights quickly but also deep understanding of user motivations',
      methodParameters: {
        branches: 4,
        depth: 2,
        evaluation_criteria: ['speed', 'depth', 'cost', 'reliability']
      },
      expectedOutput: 'Four research approaches with comparative analysis and methodology recommendation',
      notes: [
        'Great for methodology decisions',
        'Considers multiple trade-offs',
        'Provides evidence-based recommendations'
      ],
      difficulty: 'intermediate',
      tags: ['research methodology', 'fintech', 'onboarding', 'user behavior']
    }
  ],

  'role-playing': [
    {
      id: 'rp-senior-researcher',
      title: 'Senior UX Researcher Perspective',
      description: 'Adopt the role of senior UX researcher for strategic advice',
      context: 'Team needs guidance from experienced researcher perspective',
      input: 'As a Senior UX Researcher with 12+ years experience in B2B SaaS, advise on research strategy for understanding enterprise customer needs for our new collaboration platform',
      methodParameters: {
        role: 'Senior UX Researcher',
        experience_level: '12+ years',
        industry_focus: 'B2B SaaS',
        personality_traits: ['strategic', 'methodical', 'stakeholder-focused']
      },
      expectedOutput: 'Strategic research plan with methodological recommendations based on enterprise UX expertise',
      notes: [
        'Leverages domain expertise',
        'Provides experienced perspective',
        'Considers industry-specific challenges'
      ],
      difficulty: 'intermediate',
      tags: ['research strategy', 'B2B', 'enterprise', 'collaboration']
    },
    {
      id: 'rp-accessibility-expert',
      title: 'Accessibility Specialist Consultation',
      description: 'Role-play as accessibility expert for inclusive design advice',
      context: 'Design team needs expert guidance on accessibility implementation',
      input: 'Acting as a certified accessibility consultant with expertise in WCAG and assistive technologies, review our e-learning platform design and provide recommendations for inclusive design',
      methodParameters: {
        role: 'Accessibility Consultant',
        experience_level: '8 years',
        industry_focus: 'education technology',
        personality_traits: ['detail-oriented', 'user-advocating', 'standards-focused']
      },
      expectedOutput: 'Expert accessibility review with specific WCAG recommendations and implementation guidance',
      notes: [
        'Brings specialized expertise',
        'Focuses on standards compliance',
        'Advocates for inclusive design'
      ],
      difficulty: 'advanced',
      tags: ['accessibility', 'inclusive design', 'education', 'WCAG']
    }
  ],

  'instruction-tuning': [
    {
      id: 'it-design-system',
      title: 'Design System Documentation',
      description: 'Highly structured design system component documentation',
      context: 'Design team needs consistent component documentation format',
      input: 'Document the Button component for our design system including variants, states, usage guidelines, and implementation details',
      methodParameters: {
        format_requirements: ['structured sections', 'code examples', 'usage guidelines', 'accessibility notes'],
        output_length: 'comprehensive',
        include_examples: true
      },
      expectedOutput: 'Structured component documentation with all required sections and consistent formatting',
      notes: [
        'Ensures consistent documentation',
        'Comprehensive coverage',
        'Developer-friendly format'
      ],
      difficulty: 'intermediate',
      tags: ['design system', 'documentation', 'components']
    },
    {
      id: 'it-research-protocol',
      title: 'Research Protocol Documentation',
      description: 'Detailed protocol with specific formatting requirements',
      context: 'Research team needs standardized protocol documentation',
      input: 'Create a usability testing protocol for mobile app testing including participant recruitment, testing procedures, and analysis methods',
      methodParameters: {
        format_requirements: ['numbered sections', 'time estimates', 'materials lists', 'success criteria'],
        output_length: 'detailed',
        include_examples: true
      },
      expectedOutput: 'Comprehensive testing protocol with all procedural details and requirements',
      notes: [
        'Highly structured output',
        'Consistent format across protocols',
        'Includes all necessary details'
      ],
      difficulty: 'advanced',
      tags: ['usability testing', 'protocols', 'mobile', 'procedures']
    }
  ],

  'step-by-step': [
    {
      id: 'sbs-user-testing',
      title: 'User Testing Session Setup',
      description: 'Sequential steps for setting up user testing session',
      context: 'UX researcher conducting first usability test needs step-by-step guidance',
      input: 'Provide step-by-step instructions for setting up and conducting a moderated usability testing session for a web application',
      methodParameters: {
        step_numbering: true,
        include_substeps: true,
        time_estimates: true,
        prerequisites: true
      },
      expectedOutput: 'Detailed step-by-step process from preparation through post-session activities',
      notes: [
        'Perfect for process documentation',
        'Clear sequential instructions',
        'Includes time planning'
      ],
      difficulty: 'beginner',
      tags: ['usability testing', 'process', 'moderated testing']
    },
    {
      id: 'sbs-journey-mapping',
      title: 'Customer Journey Mapping Process',
      description: 'Step-by-step journey mapping workshop facilitation',
      context: 'Service designer facilitating journey mapping workshop',
      input: 'Create step-by-step instructions for facilitating a customer journey mapping workshop with stakeholders from different departments',
      methodParameters: {
        step_numbering: true,
        include_substeps: true,
        time_estimates: true,
        prerequisites: true
      },
      expectedOutput: 'Complete workshop facilitation guide with preparation, execution, and follow-up steps',
      notes: [
        'Excellent for workshop planning',
        'Considers multi-stakeholder dynamics',
        'Includes facilitation techniques'
      ],
      difficulty: 'intermediate',
      tags: ['journey mapping', 'workshops', 'facilitation', 'service design']
    }
  ],

  'socratic': [
    {
      id: 'soc-problem-discovery',
      title: 'Problem Discovery Through Questioning',
      description: 'Guide problem discovery through strategic questioning',
      context: 'Team thinks they understand the problem but assumptions need challenging',
      input: 'Our e-commerce conversion rate is low. Guide the team to deeper problem understanding through questioning rather than immediately suggesting solutions',
      methodParameters: {
        question_depth: 4,
        focus_area: 'assumptions',
        guidance_level: 'moderate'
      },
      expectedOutput: 'Series of probing questions that lead to deeper problem understanding and challenge assumptions',
      notes: [
        'Excellent for assumption challenging',
        'Promotes critical thinking',
        'Discovers hidden problems'
      ],
      difficulty: 'advanced',
      tags: ['problem discovery', 'critical thinking', 'ecommerce', 'assumptions']
    },
    {
      id: 'soc-design-rationale',
      title: 'Design Decision Exploration',
      description: 'Question-driven exploration of design decisions',
      context: 'Design team made interface decisions that need deeper examination',
      input: 'The team decided to use a single-page checkout process. Use questioning to explore the rationale and consider alternatives',
      methodParameters: {
        question_depth: 3,
        focus_area: 'design decisions',
        guidance_level: 'substantial'
      },
      expectedOutput: 'Guided questioning sequence that examines design rationale and explores alternatives',
      notes: [
        'Great for design critique',
        'Explores decision rationale',
        'Considers alternatives systematically'
      ],
      difficulty: 'intermediate',
      tags: ['design decisions', 'checkout', 'interface design', 'rationale']
    }
  ],

  'multi-perspective': [
    {
      id: 'mp-feature-analysis',
      title: 'Multi-Stakeholder Feature Analysis',
      description: 'Analyze feature from all stakeholder perspectives',
      context: 'Proposed feature needs evaluation from multiple viewpoints',
      input: 'Analyze the proposal to add AI-powered recommendations to our e-learning platform from user, business, technical, and educational stakeholder perspectives',
      methodParameters: {
        perspectives: ['learner', 'educator', 'business', 'technical', 'compliance'],
        perspective_depth: 'detailed',
        synthesis_approach: 'integrated'
      },
      expectedOutput: 'Comprehensive analysis from each perspective with integrated recommendations',
      notes: [
        'Ensures all viewpoints considered',
        'Identifies potential conflicts early',
        'Provides balanced decision framework'
      ],
      difficulty: 'advanced',
      tags: ['feature analysis', 'stakeholders', 'AI', 'e-learning', 'multi-perspective']
    },
    {
      id: 'mp-accessibility-implementation',
      title: 'Accessibility Implementation Planning',
      description: 'Multi-perspective approach to accessibility planning',
      context: 'Organization planning accessibility improvements across teams',
      input: 'Plan accessibility improvements for our customer service portal considering perspectives of users with disabilities, customer service agents, developers, and business stakeholders',
      methodParameters: {
        perspectives: ['users with disabilities', 'agents', 'developers', 'business', 'legal'],
        perspective_depth: 'comprehensive',
        synthesis_approach: 'prioritized'
      },
      expectedOutput: 'Multi-perspective accessibility plan with prioritized recommendations',
      notes: [
        'Considers all affected parties',
        'Balances needs and constraints',
        'Creates implementable roadmap'
      ],
      difficulty: 'advanced',
      tags: ['accessibility', 'implementation', 'customer service', 'organizational']
    }
  ],

  'retrieval-augmented': [
    {
      id: 'ra-research-synthesis',
      title: 'Knowledge-Augmented Research Synthesis',
      description: 'Synthesize findings using existing knowledge base',
      context: 'Research findings need synthesis with existing organizational knowledge',
      input: 'Synthesize our latest user research findings with previous studies, industry benchmarks, and best practices in our knowledge base to create comprehensive insights',
      methodParameters: {
        knowledge_sources: ['previous research', 'industry benchmarks', 'best practices', 'competitor analysis'],
        citation_style: 'integrated',
        knowledge_weight: 0.7
      },
      expectedOutput: 'Research synthesis that integrates multiple knowledge sources with proper attribution',
      notes: [
        'Leverages organizational knowledge',
        'Provides comprehensive context',
        'Maintains source attribution'
      ],
      difficulty: 'advanced',
      tags: ['research synthesis', 'knowledge base', 'benchmarks', 'comprehensive']
    },
    {
      id: 'ra-design-patterns',
      title: 'Design Pattern Recommendations',
      description: 'Pattern recommendations based on knowledge base',
      context: 'Designer needs pattern recommendations based on design system and best practices',
      input: 'Recommend design patterns for a complex data visualization dashboard based on our design system, accessibility guidelines, and industry best practices',
      methodParameters: {
        knowledge_sources: ['design system', 'accessibility guidelines', 'industry patterns', 'user feedback'],
        citation_style: 'inline',
        knowledge_weight: 0.8
      },
      expectedOutput: 'Pattern recommendations with rationale based on existing knowledge and standards',
      notes: [
        'Leverages design knowledge',
        'Ensures consistency',
        'Evidence-based recommendations'
      ],
      difficulty: 'intermediate',
      tags: ['design patterns', 'data visualization', 'design system', 'accessibility']
    }
  ]
};

/**
 * Method-specific templates for common UX scenarios
 */
export const METHOD_TEMPLATES: Record<PromptEngineeringMethod, MethodTemplate[]> = {
  'zero-shot': [
    {
      id: 'zs-template-research-plan',
      name: 'Research Plan Template',
      description: 'Generate comprehensive research plan without examples',
      method: 'zero-shot',
      template: `Create a comprehensive user research plan for {{projectName}} targeting {{targetUsers}}.

Research Objectives: {{researchObjectives}}
Timeline: {{timeline}}
Budget Constraints: {{budgetConstraints}}

Include:
1. Research methodology selection and rationale
2. Participant recruitment strategy
3. Data collection procedures
4. Analysis approach
5. Success criteria and deliverables
6. Risk mitigation strategies

Provide specific, actionable recommendations that can be implemented immediately.`,
      defaultParameters: {
        temperature: 0.7,
        maxTokens: 1200
      },
      variables: [
        {
          id: 'projectName',
          name: 'Project Name',
          description: 'Name of the project or product',
          example: 'Mobile Banking App Redesign'
        },
        {
          id: 'targetUsers',
          name: 'Target Users',
          description: 'Primary user segments',
          example: 'Millennials and Gen Z mobile banking users'
        },
        {
          id: 'researchObjectives',
          name: 'Research Objectives',
          description: 'Key questions the research should answer',
          example: 'Understand user pain points and preferences for mobile banking'
        },
        {
          id: 'timeline',
          name: 'Timeline',
          description: 'Available time for research',
          example: '6 weeks'
        },
        {
          id: 'budgetConstraints',
          name: 'Budget Constraints',
          description: 'Budget limitations or considerations',
          example: 'Limited budget requiring remote research methods'
        }
      ],
      useCase: 'When you need a complete research plan quickly without detailed examples'
    }
  ],

  'few-shot': [
    {
      id: 'fs-template-usability-findings',
      name: 'Usability Findings Template',
      description: 'Format usability findings consistently using examples',
      method: 'few-shot',
      template: `Format the following usability findings using the established pattern:

Example 1:
Finding: Users couldn't locate the search function
Severity: High
Impact: 78% task failure rate
Evidence: 8/10 participants looked for search in header, spent avg 45 seconds
Recommendation: Move search to prominent header position with clear icon

Example 2:
Finding: Form validation errors were unclear
Severity: Medium
Impact: 40% form abandonment increase
Evidence: Users repeatedly submitted with same errors, expressed confusion
Recommendation: Implement real-time validation with specific error messages

Now format these findings: {{rawFindings}}`,
      defaultParameters: {
        exampleCount: 3,
        temperature: 0.4,
        shuffleExamples: false
      },
      variables: [
        {
          id: 'rawFindings',
          name: 'Raw Findings',
          description: 'Unformatted usability test observations',
          example: 'Navigation was confusing, users made many errors on checkout, mobile version had tap targets too small'
        }
      ],
      useCase: 'When you need consistent formatting across multiple usability findings'
    }
  ],

  'chain-of-thought': [
    {
      id: 'cot-template-ia-design',
      name: 'Information Architecture Design Template',
      description: 'Step-by-step IA design reasoning',
      method: 'chain-of-thought',
      template: `Design information architecture for {{projectName}} serving {{userTypes}}.

Let me work through this systematically:

1. **User Analysis**: First, I'll analyze the different user types and their needs
   - What are the primary goals of each user type?
   - How do their workflows differ?
   - What information do they need at each stage?

2. **Content Analysis**: Next, I'll examine the content and functionality requirements
   - What content types exist?
   - How should content be categorized?
   - What relationships exist between content pieces?

3. **Mental Model Assessment**: Then, I'll consider user mental models
   - How do users naturally categorize this information?
   - What terminology do they use?
   - Where do they expect to find specific content?

4. **Structure Design**: Based on this analysis, I'll design the structure
   - What's the optimal hierarchy?
   - How should navigation be organized?
   - What labeling system works best?

5. **Validation Planning**: Finally, I'll plan how to test and validate
   - What methods will validate the structure?
   - How will we measure success?
   - What iterations might be needed?

Content Requirements: {{contentRequirements}}
Technical Constraints: {{technicalConstraints}}`,
      defaultParameters: {
        reasoning_steps: 5,
        show_work: true,
        verify_logic: true
      },
      variables: [
        {
          id: 'projectName',
          name: 'Project Name',
          description: 'Name of the project or system',
          example: 'Healthcare Patient Portal'
        },
        {
          id: 'userTypes',
          name: 'User Types',
          description: 'Different types of users the system serves',
          example: 'Patients, caregivers, healthcare providers'
        },
        {
          id: 'contentRequirements',
          name: 'Content Requirements',
          description: 'Types of content and functionality needed',
          example: 'Appointment scheduling, medical records, test results, messaging'
        },
        {
          id: 'technicalConstraints',
          name: 'Technical Constraints',
          description: 'Technical limitations or requirements',
          example: 'Must integrate with existing EHR system, HIPAA compliance required'
        }
      ],
      useCase: 'When you need transparent reasoning for complex IA decisions'
    }
  ],

  'tree-of-thought': [
    {
      id: 'tot-template-strategy',
      name: 'Strategic Decision Template',
      description: 'Explore multiple strategic approaches',
      method: 'tree-of-thought',
      template: `Develop strategy for {{strategicChallenge}} considering {{constraints}}.

I'll explore multiple strategic approaches:

**Approach 1: {{approach1Name}}**
- Rationale: {{approach1Rationale}}
- Implementation: {{approach1Steps}}
- Pros: {{approach1Pros}}
- Cons: {{approach1Cons}}
- Risk Level: {{approach1Risk}}

**Approach 2: {{approach2Name}}**
- Rationale: {{approach2Rationale}}
- Implementation: {{approach2Steps}}
- Pros: {{approach2Pros}}
- Cons: {{approach2Cons}}
- Risk Level: {{approach2Risk}}

**Approach 3: {{approach3Name}}**
- Rationale: {{approach3Rationale}}
- Implementation: {{approach3Steps}}
- Pros: {{approach3Pros}}
- Cons: {{approach3Cons}}
- Risk Level: {{approach3Risk}}

**Evaluation Criteria**: {{evaluationCriteria}}

**Final Recommendation**: Based on the evaluation, I recommend [selected approach] because [detailed reasoning considering all criteria].`,
      defaultParameters: {
        branches: 3,
        depth: 3,
        evaluation_criteria: ['feasibility', 'impact', 'resources', 'timeline']
      },
      variables: [
        {
          id: 'strategicChallenge',
          name: 'Strategic Challenge',
          description: 'The strategic decision or challenge to address',
          example: 'Improving user onboarding completion rates'
        },
        {
          id: 'constraints',
          name: 'Constraints',
          description: 'Limitations or requirements to consider',
          example: 'Limited development resources, 3-month timeline, must work on mobile'
        },
        {
          id: 'evaluationCriteria',
          name: 'Evaluation Criteria',
          description: 'Criteria for comparing approaches',
          example: 'User impact, development effort, business value, maintainability'
        }
      ],
      useCase: 'When you need to compare multiple strategic options systematically'
    }
  ],

  'role-playing': [
    {
      id: 'rp-template-expert-review',
      name: 'Expert Review Template',
      description: 'Get expert perspective on UX challenges',
      method: 'role-playing',
      template: `I am a {{expertRole}} with {{experienceLevel}} of experience in {{domainExpertise}}.

Given my background in {{specificBackground}} and experience with {{relevantProjects}}, here's my assessment of {{challenge}}:

**Professional Assessment**:
[Analysis from expert perspective]

**Industry Context**:
[Relevant industry standards and practices]

**Recommended Approach**:
[Expert recommendations based on experience]

**Implementation Considerations**:
[Practical guidance for execution]

**Potential Pitfalls**:
[Common mistakes to avoid based on experience]

**Success Metrics**:
[How to measure success from expert perspective]

*Speaking from {{experienceLevel}} of hands-on experience in {{domainExpertise}}*`,
      defaultParameters: {
        role: 'Senior UX Researcher',
        experience_level: '10+ years',
        industry_focus: 'technology',
        personality_traits: ['analytical', 'user-focused', 'systematic']
      },
      variables: [
        {
          id: 'expertRole',
          name: 'Expert Role',
          description: 'Professional role to adopt',
          example: 'Senior UX Researcher'
        },
        {
          id: 'experienceLevel',
          name: 'Experience Level',
          description: 'Years and depth of experience',
          example: '12+ years'
        },
        {
          id: 'domainExpertise',
          name: 'Domain Expertise',
          description: 'Area of specialization',
          example: 'B2B SaaS and enterprise software'
        },
        {
          id: 'specificBackground',
          name: 'Specific Background',
          description: 'Relevant background details',
          example: 'Led research for 3 major SaaS platforms, published accessibility guidelines'
        },
        {
          id: 'relevantProjects',
          name: 'Relevant Projects',
          description: 'Similar projects or experiences',
          example: 'enterprise CRM redesign, healthcare platform research'
        },
        {
          id: 'challenge',
          name: 'Challenge',
          description: 'The UX challenge to address',
          example: 'improving complex workflow usability for enterprise users'
        }
      ],
      useCase: 'When you need domain expertise and professional perspective'
    }
  ],

  'instruction-tuning': [],
  'step-by-step': [],
  'socratic': [],
  'multi-perspective': [],
  'retrieval-augmented': []
};

/**
 * Get examples for a specific method
 */
export function getExamplesForMethod(method: PromptEngineeringMethod): MethodExample[] {
  return METHOD_EXAMPLES[method] || [];
}

/**
 * Get templates for a specific method
 */
export function getTemplatesForMethod(method: PromptEngineeringMethod): MethodTemplate[] {
  return METHOD_TEMPLATES[method] || [];
}

/**
 * Get example by ID
 */
export function getExampleById(exampleId: string): MethodExample | undefined {
  for (const methodExamples of Object.values(METHOD_EXAMPLES)) {
    const example = methodExamples.find(ex => ex.id === exampleId);
    if (example) return example;
  }
  return undefined;
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): MethodTemplate | undefined {
  for (const methodTemplates of Object.values(METHOD_TEMPLATES)) {
    const template = methodTemplates.find(t => t.id === templateId);
    if (template) return template;
  }
  return undefined;
}

/**
 * Get examples by tags
 */
export function getExamplesByTags(tags: string[]): MethodExample[] {
  const allExamples = Object.values(METHOD_EXAMPLES).flat();
  return allExamples.filter(example => 
    tags.some(tag => example.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Get examples by difficulty
 */
export function getExamplesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): MethodExample[] {
  const allExamples = Object.values(METHOD_EXAMPLES).flat();
  return allExamples.filter(example => example.difficulty === difficulty);
}

/**
 * Get recommended examples for context
 */
export function getRecommendedExamples(context: {
  userExperience?: 'beginner' | 'intermediate' | 'expert';
  domain?: string;
  taskType?: string;
}): MethodExample[] {
  const allExamples = Object.values(METHOD_EXAMPLES).flat();
  
  let filtered = allExamples;
  
  // Filter by user experience
  if (context.userExperience) {
    const difficultyMap = {
      'beginner': 'beginner',
      'intermediate': 'intermediate', 
      'expert': 'advanced'
    } as const;
    
    filtered = filtered.filter(example => 
      example.difficulty === difficultyMap[context.userExperience!] ||
      (context.userExperience === 'expert' && example.difficulty === 'intermediate')
    );
  }
  
  // Filter by domain
  if (context.domain) {
    filtered = filtered.filter(example => 
      example.tags.includes(context.domain!.toLowerCase()) ||
      example.context.toLowerCase().includes(context.domain!.toLowerCase())
    );
  }
  
  // Filter by task type
  if (context.taskType) {
    filtered = filtered.filter(example => 
      example.tags.includes(context.taskType!.toLowerCase()) ||
      example.title.toLowerCase().includes(context.taskType!.toLowerCase())
    );
  }
  
  return filtered.slice(0, 6); // Return top 6 recommendations
}