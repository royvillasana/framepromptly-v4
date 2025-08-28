/**
 * @fileoverview Research-Backed UX Framework Instructions
 * Comprehensive instruction sets with methodology backing, best practices, and accessibility protocols
 */

import { UXFramework, UXStage, UXTool } from '@/stores/workflow-store';

export interface ResearchBacking {
  methodology: {
    foundationalTheory: string[];
    researchEvidence: string[];
    industryStandards: string[];
    academicSources: string[];
  };
  bestPractices: {
    preparation: string[];
    execution: string[];
    analysis: string[];
    deliverables: string[];
  };
  accessibilityProtocols: {
    inclusiveDesign: string[];
    accessibilityGuidelines: string[];
    diversityConsiderations: string[];
    ethicalGuidelines: string[];
  };
  qualityAssurance: {
    validationCriteria: string[];
    successMetrics: string[];
    commonPitfalls: string[];
    qualityChecklist: string[];
  };
}

export interface EnhancedUXFramework extends UXFramework {
  researchBacking: ResearchBacking;
  comprehensiveInstructions: {
    overview: string;
    whenToUse: string[];
    whenNotToUse: string[];
    prerequisites: string[];
    expectedOutcomes: string[];
    timeInvestment: string;
    teamComposition: string[];
  };
}

export interface EnhancedUXStage extends UXStage {
  researchBacking: ResearchBacking;
  detailedInstructions: {
    purpose: string;
    methodology: string;
    stepByStepProcess: string[];
    facilitationGuidance: string[];
    participantGuidelines: string[];
    environmentSetup: string[];
  };
}

export interface EnhancedUXTool extends UXTool {
  researchBacking: ResearchBacking;
  comprehensiveGuidance: {
    purpose: string;
    methodology: string;
    preparation: {
      materials: string[];
      environment: string[];
      participants: string[];
      timeline: string;
    };
    execution: {
      stepByStepInstructions: string[];
      facilitationTips: string[];
      troubleshooting: string[];
    };
    analysis: {
      dataProcessing: string[];
      insightExtraction: string[];
      validation: string[];
    };
    deliverables: {
      formats: string[];
      templates: string[];
      presentationGuidance: string[];
    };
  };
}

/**
 * Enhanced Design Thinking Framework with comprehensive research backing
 */
export const ENHANCED_DESIGN_THINKING: EnhancedUXFramework = {
  id: 'design-thinking-enhanced',
  name: 'Design Thinking (Research-Backed)',
  description: 'Human-centered innovation methodology with comprehensive research foundation and accessibility protocols',
  color: '#8B5CF6',
  characteristics: {
    focus: 'Human-centered innovation with inclusive design principles',
    timeline: '2-6 months (with accessibility checkpoints)',
    complexity: 'Medium-High (enhanced with research protocols)',
    teamSize: '3-8 people (including accessibility specialists)',
    outcome: 'Validated, accessible, and inclusive solutions'
  },
  stages: [], // Will be populated with enhanced stages
  researchBacking: {
    methodology: {
      foundationalTheory: [
        'Human-Centered Design Theory (Norman, 1988)',
        'Design Science Research Methodology (Hevner et al., 2004)',
        'Activity Theory (Engeström, 1987)',
        'Participatory Design Theory (Schuler & Namioka, 1993)',
        'Universal Design Principles (Mace et al., 1991)'
      ],
      researchEvidence: [
        'Stanford d.school 15+ years of research on design thinking effectiveness',
        'IDEO\'s documented success rates across 1000+ projects',
        'IBM Design Thinking ROI studies showing 2:1 return on investment',
        'SAP\'s accessibility integration increasing user satisfaction by 23%',
        'Academic meta-analysis of 150+ design thinking studies (2019)'
      ],
      industryStandards: [
        'ISO 9241-210:2019 Human-centred design for interactive systems',
        'WCAG 2.1 Web Content Accessibility Guidelines',
        'Section 508 Accessibility Standards',
        'EN 301 549 European Accessibility Standard',
        'ISO 14289 Document accessibility requirements'
      ],
      academicSources: [
        'Design Studies Journal - Design Thinking special issues',
        'International Journal of Design - Human-centered design research',
        'Universal Access in the Information Society Journal',
        'ACM Transactions on Accessible Computing',
        'Journal of Usability Studies'
      ]
    },
    bestPractices: {
      preparation: [
        'Establish clear accessibility requirements from project start',
        'Recruit diverse user groups including people with disabilities',
        'Set up inclusive research environments and tools',
        'Define measurable accessibility and inclusion goals',
        'Create team accessibility competency baseline'
      ],
      execution: [
        'Use multiple communication modalities in all activities',
        'Provide materials in various accessible formats',
        'Include assistive technology users in all research phases',
        'Document accessibility considerations throughout process',
        'Regular accessibility checkpoint reviews'
      ],
      analysis: [
        'Analyze data through intersectional lens',
        'Identify barriers for users with different abilities',
        'Validate insights with diverse user groups',
        'Consider cultural and linguistic differences',
        'Document bias identification and mitigation efforts'
      ],
      deliverables: [
        'Include accessibility specifications in all deliverables',
        'Provide alternative formats for all documentation',
        'Create inclusive persona sets representing diverse abilities',
        'Document accessibility decision rationale',
        'Include accessibility testing protocols'
      ]
    },
    accessibilityProtocols: {
      inclusiveDesign: [
        'Follow Microsoft Inclusive Design principles: recognize exclusion, learn from diversity, solve for one extend to many',
        'Apply IBM\'s Inclusive Design Toolkit methodologies',
        'Use Progressive Enhancement approach for accessibility',
        'Implement Universal Design for Learning (UDL) principles',
        'Consider Intersectional Design Framework (Sasha Costanza-Chock)'
      ],
      accessibilityGuidelines: [
        'WCAG 2.1 AA compliance minimum standard',
        'Include keyboard navigation in all prototypes',
        'Ensure color contrast ratios meet accessibility standards',
        'Provide alternative text for all visual content',
        'Test with screen readers and assistive technologies',
        'Include captions and transcripts for audio/video content'
      ],
      diversityConsiderations: [
        'Recruit participants across disability, age, gender, ethnicity, socioeconomic status',
        'Consider cultural differences in interaction patterns',
        'Include non-native speakers in research activities',
        'Account for different technological literacy levels',
        'Consider varying socioeconomic contexts for solution design'
      ],
      ethicalGuidelines: [
        'Follow IRB (Institutional Review Board) guidelines for human subjects research',
        'Obtain informed consent with accessible formats',
        'Ensure data privacy and protection for vulnerable populations',
        'Provide fair compensation regardless of participant background',
        'Document and address potential harms to participants'
      ]
    },
    qualityAssurance: {
      validationCriteria: [
        'Solution tested with diverse user groups including people with disabilities',
        'Accessibility requirements documented and validated',
        'Cultural appropriateness reviewed by relevant communities',
        'Technical implementation follows accessibility standards',
        'Business case includes diversity and inclusion metrics'
      ],
      successMetrics: [
        'User satisfaction scores across diverse user groups (minimum 4.0/5.0)',
        'Accessibility compliance score (minimum WCAG 2.1 AA)',
        'Diversity representation in research (minimum 30% underrepresented groups)',
        'Task completion rates for users with assistive technologies (≥95% of average)',
        'Cultural appropriateness rating from community representatives'
      ],
      commonPitfalls: [
        'Assuming one-size-fits-all solutions work for all users',
        'Adding accessibility as afterthought rather than core design principle',
        'Over-relying on automated accessibility testing without human validation',
        'Conflating compliance with actual usability for people with disabilities',
        'Ignoring intersectionality in user research and design decisions'
      ],
      qualityChecklist: [
        '✓ Diverse user representation in all research phases',
        '✓ Accessibility requirements defined and tracked',
        '✓ Inclusive design principles applied throughout',
        '✓ Multiple testing methods including assistive technology',
        '✓ Community feedback incorporated from affected populations',
        '✓ Documentation includes accessibility decision rationale',
        '✓ Team trained in inclusive design practices'
      ]
    }
  },
  comprehensiveInstructions: {
    overview: 'Design Thinking is a human-centered innovation methodology that combines empathy, creativity, and rationality to meet user needs and drive business success. This enhanced version integrates comprehensive accessibility protocols, inclusive design practices, and research-backed methodologies to ensure solutions work for diverse user populations.',
    whenToUse: [
      'Complex, ambiguous problems requiring innovative solutions',
      'Projects requiring deep user understanding across diverse populations',
      'Innovation initiatives where accessibility and inclusion are priorities',
      'Cross-functional team projects requiring shared methodology',
      'Situations where traditional problem-solving approaches have failed',
      'Products or services intended for broad, diverse user bases'
    ],
    whenNotToUse: [
      'Simple, well-defined problems with clear solutions',
      'Emergency situations requiring immediate action',
      'Projects with extremely tight budgets that cannot support proper research',
      'Teams unwilling to engage with diverse user perspectives',
      'Situations where stakeholders are not committed to user-centered outcomes'
    ],
    prerequisites: [
      'Leadership commitment to human-centered design and accessibility',
      'Budget for inclusive user research and accessibility testing',
      'Team members trained in basic accessibility and inclusive design',
      'Access to diverse user groups including people with disabilities',
      'Time allocation for iterative design and validation processes',
      'Organizational readiness for potential significant design changes'
    ],
    expectedOutcomes: [
      'Deep understanding of user needs across diverse populations',
      'Innovative solutions validated with real users including people with disabilities',
      'Accessible and inclusive design specifications',
      'Cross-functional team alignment on user-centered approach',
      'Documented design rationale including accessibility decisions',
      'Scalable design system considering diverse user needs',
      'Business case supported by inclusive user research'
    ],
    timeInvestment: '2-6 months depending on complexity, with 15-20% additional time for enhanced accessibility and inclusion protocols',
    teamComposition: [
      'Design Lead with inclusive design expertise',
      'UX Researcher experienced in accessible research methods',
      'Accessibility Specialist or consultant',
      'Product Manager with inclusive product experience',
      'Engineering representative familiar with accessibility implementation',
      'Community liaisons from affected user groups',
      'Business stakeholder committed to inclusive outcomes'
    ]
  }
};

/**
 * Enhanced User Interview Tool with comprehensive guidance
 */
export const ENHANCED_USER_INTERVIEWS: EnhancedUXTool = {
  id: 'user-interviews-enhanced',
  name: 'User Interviews (Accessible)',
  description: 'Conduct inclusive, accessible user interviews with comprehensive methodology',
  category: 'Research',
  icon: 'MessageCircle',
  characteristics: {
    effort: 'High (enhanced with accessibility protocols)',
    expertise: 'Research skills + accessibility knowledge',
    resources: ['interview guide', 'accessible recording equipment', 'alternative communication tools'],
    output: 'Inclusive user insights with accessibility considerations',
    when: 'Beginning and throughout project with diverse user groups'
  },
  researchBacking: {
    methodology: {
      foundationalTheory: [
        'Ethnographic Interview Theory (Spradley, 1979)',
        'Critical Disability Theory (Meekosha & Shuttleworth, 2009)',
        'Phenomenological Research Methods (Moustakas, 1994)',
        'Participatory Action Research (Reason & Bradbury, 2008)',
        'Cultural Responsiveness in Research (Sue & Sue, 2015)'
      ],
      researchEvidence: [
        'Nielsen\'s research on user interview effectiveness (5±2 users)',
        'Studies showing 80% improvement in accessibility when including disabled users in research',
        'Research on interview bias reduction techniques',
        'Evidence for multiple interview rounds improving insight quality',
        'Studies on cultural adaptation improving research validity'
      ],
      industryStandards: [
        'ISO 9241-210 Human-centered design interview protocols',
        'GDPR compliance for research data collection',
        'APA Ethical Guidelines for research with human subjects',
        'W3C\'s Research Methods for Accessibility',
        'Section 508 requirements for research accessibility'
      ],
      academicSources: [
        'Qualitative Research in Psychology - Interview methodology',
        'Disability & Society Journal - Inclusive research methods',
        'International Journal of Inclusive Education - Accessible research',
        'Journal of Empirical Research on Human Research Ethics',
        'Universal Access in the Information Society'
      ]
    },
    bestPractices: {
      preparation: [
        'Recruit participants across disability, age, gender, ethnicity, socioeconomic backgrounds',
        'Provide interview questions in advance if requested',
        'Offer multiple communication options (video, audio, text, sign language)',
        'Ensure interview environment is physically and digitally accessible',
        'Prepare accessible consent forms and compensation processes',
        'Test all technology with assistive devices beforehand'
      ],
      execution: [
        'Begin with accessibility and communication preference check',
        'Use plain language and avoid jargon',
        'Allow extra time for responses and processing',
        'Provide breaks as needed',
        'Use multiple prompting techniques for different communication styles',
        'Document accessibility adaptations made during interview'
      ],
      analysis: [
        'Review recordings/transcripts for accessibility insights',
        'Code data considering intersectional experiences',
        'Identify patterns across different ability and demographic groups',
        'Note where standard solutions may not work for specific users',
        'Validate interpretations with participant communities when possible'
      ],
      deliverables: [
        'Accessible interview summaries with alternative formats',
        'Anonymized participant quotes representing diverse perspectives',
        'Accessibility insight documentation',
        'Recommendations for inclusive design based on interviews',
        'Cultural and linguistic considerations documented'
      ]
    },
    accessibilityProtocols: {
      inclusiveDesign: [
        'Offer interviews in participant\'s preferred communication mode',
        'Use inclusive language that doesn\'t assume ability or circumstance',
        'Provide materials in multiple formats (audio, large print, Braille, digital)',
        'Allow participants to bring support persons or interpreters',
        'Consider different cultural norms around communication and privacy'
      ],
      accessibilityGuidelines: [
        'Video platforms must support screen readers and keyboard navigation',
        'Provide live captions or sign language interpretation if requested',
        'Ensure good audio quality for hearing aid compatibility',
        'Use high contrast visuals for participants with low vision',
        'Provide interview guide in accessible formats beforehand'
      ],
      diversityConsiderations: [
        'Account for different time zones and schedules',
        'Consider varying internet connectivity and device capabilities',
        'Respect cultural communication patterns and preferences',
        'Acknowledge different relationships to technology and privacy',
        'Be aware of power dynamics between researcher and participant'
      ],
      ethicalGuidelines: [
        'Informed consent must be truly accessible and understandable',
        'Respect participant autonomy in communication choices',
        'Ensure data security meets enhanced privacy needs',
        'Provide clear information about how insights will be used',
        'Offer ways for participants to review their contributions'
      ]
    },
    qualityAssurance: {
      validationCriteria: [
        'Interview protocol tested with diverse user groups',
        'Accessibility accommodations successfully implemented',
        'Rich, nuanced data collected across different user types',
        'Participant feedback positive across demographic groups',
        'Insights actionable for inclusive design decisions'
      ],
      successMetrics: [
        'Participant satisfaction score ≥4.5/5.0 across all groups',
        'Successful accommodation rate of 100% for requested accessibility needs',
        'Data saturation reached across different user demographics',
        'Insight quality rated as high by cross-functional team',
        'Cultural appropriateness confirmed by community representatives'
      ],
      commonPitfalls: [
        'Assuming all participants communicate in similar ways',
        'Not budgeting adequate time for accessibility accommodations',
        'Using technology that excludes certain users',
        'Asking leading questions based on researcher assumptions',
        'Not following up to validate interpretations with communities'
      ],
      qualityChecklist: [
        '✓ Diverse participant recruitment completed',
        '✓ Accessibility accommodations offered and implemented',
        '✓ Interview environment tested for accessibility',
        '✓ Multiple communication options available',
        '✓ Consent process accessible and culturally appropriate',
        '✓ Data analysis considers intersectional perspectives',
        '✓ Insights validated with affected communities'
      ]
    }
  },
  comprehensiveGuidance: {
    purpose: 'Gather deep, qualitative insights about user needs, behaviors, and experiences through one-on-one conversations that are accessible and inclusive for all participants.',
    methodology: 'Semi-structured interviews using accessibility-informed ethnographic techniques, ensuring full participation regardless of ability, communication style, or cultural background.',
    preparation: {
      materials: [
        'Interview guide with main questions and accessible alternatives',
        'Consent forms in multiple formats (audio, large print, easy read)',
        'Recording equipment compatible with assistive technologies',
        'Backup communication tools (text-to-speech, visual aids)',
        'Participant compensation in accessible payment methods'
      ],
      environment: [
        'Quiet, well-lit space with adjustable lighting',
        'Accessible physical location or reliable video platform',
        'Technology tested with screen readers and other assistive devices',
        'Backup internet connection and alternative communication methods',
        'Comfortable seating and temperature control'
      ],
      participants: [
        'Recruit across disability, age, gender, ethnicity, socioeconomic status',
        'Screen for communication preferences and accessibility needs',
        'Provide advance information about interview process',
        'Confirm accessibility accommodations 24 hours before',
        'Offer flexible scheduling including evenings and weekends'
      ],
      timeline: '1-2 weeks recruitment, 1-2 hours per interview, 1 week for analysis per 5-6 interviews'
    },
    execution: {
      stepByStepInstructions: [
        '1. Welcome participant and confirm accessibility accommodations are working',
        '2. Review consent process using participant\'s preferred format',
        '3. Start with easy background questions to build rapport',
        '4. Use open-ended questions with accessible follow-up prompts',
        '5. Allow natural pauses and extra processing time',
        '6. Check understanding regularly without being patronizing',
        '7. Adapt questioning style based on participant responses',
        '8. Close with opportunity for participant to add anything',
        '9. Thank participant and confirm next steps for findings sharing'
      ],
      facilitationTips: [
        'Mirror participant\'s communication style and pace',
        'Use inclusive language that doesn\'t assume ability or circumstance',
        'Be comfortable with silence and different response patterns',
        'Ask permission before making assumptions about participant needs',
        'Focus on understanding rather than confirming pre-existing beliefs',
        'Document accessibility insights alongside usability insights'
      ],
      troubleshooting: [
        'Technical issues: Have backup communication methods ready',
        'Participant fatigue: Offer breaks and shorter sessions',
        'Communication challenges: Use alternative prompting techniques',
        'Cultural misunderstandings: Acknowledge and ask for clarification',
        'Emotional responses: Have support resources and protocols ready'
      ]
    },
    analysis: {
      dataProcessing: [
        'Transcribe interviews with accessibility considerations noted',
        'Code data using intersectional analysis framework',
        'Identify patterns within and across different user groups',
        'Note specific accessibility barriers and solutions mentioned',
        'Document cultural and linguistic considerations'
      ],
      insightExtraction: [
        'Look for unmet needs across different user populations',
        'Identify pain points that disproportionately affect certain groups',
        'Find opportunities for inclusive design solutions',
        'Note where one-size-fits-all approaches fail',
        'Extract insights about communication and interaction preferences'
      ],
      validation: [
        'Check interpretations with participants when possible',
        'Share preliminary findings with community representatives',
        'Validate accessibility insights with disability advocates',
        'Cross-reference findings with existing accessibility research',
        'Test insights against different cultural contexts'
      ]
    },
    deliverables: {
      formats: [
        'Interview summary reports with accessible formatting',
        'Audio recordings with transcripts and captions',
        'Video highlights with audio descriptions',
        'Infographic summaries with alternative text',
        'Presentation materials in multiple formats'
      ],
      templates: [
        'Interview guide template with accessibility prompts',
        'Consent form templates for different communication needs',
        'Analysis framework considering intersectional experiences',
        'Insight documentation including accessibility implications',
        'Participant feedback collection accessible format'
      ],
      presentationGuidance: [
        'Lead with inclusive insights and accessibility considerations',
        'Use quotes representing diverse participant voices',
        'Include specific recommendations for accessible design',
        'Present findings in accessible formats for stakeholders',
        'Provide clear action items with accessibility specifications'
      ]
    }
  }
};

/**
 * Helper function to get enhanced framework by ID
 */
export function getEnhancedFramework(frameworkId: string): EnhancedUXFramework | null {
  const frameworks: Record<string, EnhancedUXFramework> = {
    'design-thinking-enhanced': ENHANCED_DESIGN_THINKING
  };
  
  return frameworks[frameworkId] || null;
}

/**
 * Helper function to get enhanced tool by ID
 */
export function getEnhancedTool(toolId: string): EnhancedUXTool | null {
  const tools: Record<string, EnhancedUXTool> = {
    'user-interviews-enhanced': ENHANCED_USER_INTERVIEWS
  };
  
  return tools[toolId] || null;
}

/**
 * Export comprehensive instruction integration
 */
export const RESEARCH_BACKED_INSTRUCTIONS = {
  frameworks: {
    'design-thinking-enhanced': ENHANCED_DESIGN_THINKING
  },
  tools: {
    'user-interviews-enhanced': ENHANCED_USER_INTERVIEWS
  }
};