/**
 * @fileoverview UX Tool Platform Optimizer
 * Provides platform-specific recommendations and enhanced prompts for UX tools
 * Optimized for Miro AI, FigJam AI, and Figma AI capabilities
 */

export type PlatformType = 'miro' | 'figjam' | 'figma';

export interface PlatformCapability {
  name: string;
  strength: 'high' | 'medium' | 'low';
  description: string;
}

export interface PlatformRecommendation {
  platform: PlatformType;
  confidence: number; // 0-100
  reasoning: string;
  capabilities: PlatformCapability[];
  alternativePlatforms?: {
    platform: PlatformType;
    useCase: string;
  }[];
}

export interface OptimizedPrompt {
  originalPrompt: string;
  optimizedPrompt: string;
  platformSpecifics: {
    platform: PlatformType;
    instructions: string[];
    specifications: string[];
    bestPractices: string[];
  };
  expectedOutputs: string[];
}

/**
 * Platform capabilities matrix for different UX tools
 */
const PLATFORM_CAPABILITIES = {
  miro: {
    // Miro AI strengths (2025)
    diagramGeneration: { strength: 'high' as const, description: 'AI-powered flowcharts, mind maps, and complex diagrams' },
    prototypeCreation: { strength: 'high' as const, description: 'Generate initial prototype flows from text prompts' },
    documentGeneration: { strength: 'high' as const, description: 'Create comprehensive documents with AI assistance' },
    imageCreation: { strength: 'high' as const, description: 'AI image generation and analysis capabilities' },
    mindMapping: { strength: 'high' as const, description: 'Advanced mind map generation with AI expansion' },
    collaboration: { strength: 'high' as const, description: 'Real-time collaborative workspaces' },
    visualMapping: { strength: 'high' as const, description: 'Complex journey and process mapping' },
    workshopFacilitation: { strength: 'medium' as const, description: 'Templates and facilitation tools' }
  },
  figjam: {
    // FigJam AI strengths (2025)
    templateGeneration: { strength: 'high' as const, description: 'Generate meeting templates and workflows from prompts' },
    stickyNoteOrganization: { strength: 'high' as const, description: 'AI-powered sticky note sorting and thematic analysis' },
    workshopFacilitation: { strength: 'high' as const, description: 'Comprehensive workshop and research facilitation' },
    collaboration: { strength: 'high' as const, description: 'Real-time team collaboration with audio and chat' },
    researchSynthesis: { strength: 'high' as const, description: 'Summarize and analyze research findings' },
    wireframing: { strength: 'medium' as const, description: 'Basic wireframing capabilities with templates' },
    projectIntegration: { strength: 'high' as const, description: 'Integration with Asana, Jira, Github' },
    personaCreation: { strength: 'medium' as const, description: 'Template-based persona development' }
  },
  figma: {
    // Figma AI strengths (2025)
    highFidelityPrototyping: { strength: 'high' as const, description: 'Figma Make: AI-powered prompt-to-prototype creation' },
    designSystemIntegration: { strength: 'high' as const, description: 'Maintain design system consistency with AI' },
    interactivePrototypes: { strength: 'high' as const, description: 'Production-ready interactive prototypes' },
    wireframing: { strength: 'high' as const, description: 'Advanced wireframing with design system integration' },
    mockupGeneration: { strength: 'high' as const, description: 'High-fidelity mockups with realistic content' },
    textGeneration: { strength: 'medium' as const, description: 'AI-powered text rewriting and content generation' },
    imageEditing: { strength: 'high' as const, description: 'Advanced image generation and editing' },
    componentCreation: { strength: 'high' as const, description: 'AI-assisted component and variant creation' }
  }
} as const;

/**
 * UX Tool to Platform mappings with recommendations
 */
const UX_TOOL_PLATFORM_MAPPING = {
  'personas': {
    primary: 'miro' as PlatformType,
    reasoning: 'Miro AI excels at creating comprehensive persona documents with AI-generated content, prototype visualization of persona scenarios, and collaborative persona workshops',
    alternatives: [
      { platform: 'figjam' as PlatformType, useCase: 'Workshop-based persona creation with team collaboration' },
      { platform: 'figma' as PlatformType, useCase: 'High-fidelity persona presentation materials' }
    ]
  },
  'wireframes': {
    primary: 'figma' as PlatformType,
    reasoning: 'Figma Make and AI features excel at creating production-ready wireframes with design system integration and interactive capabilities',
    alternatives: [
      { platform: 'miro' as PlatformType, useCase: 'Conceptual wireframes and early ideation' },
      { platform: 'figjam' as PlatformType, useCase: 'Collaborative wireframe workshops' }
    ]
  },
  'journey-maps': {
    primary: 'miro' as PlatformType,
    reasoning: 'Miro AI diagram generation and mind mapping capabilities excel at complex journey visualizations with multiple touchpoints and stages',
    alternatives: [
      { platform: 'figjam' as PlatformType, useCase: 'Research-heavy journey mapping workshops' }
    ]
  },
  'empathy-maps': {
    primary: 'figjam' as PlatformType,
    reasoning: 'FigJam AI template generation and sticky note organization excel at empathy mapping workshops and research synthesis',
    alternatives: [
      { platform: 'miro' as PlatformType, useCase: 'Comprehensive empathy documentation' }
    ]
  },
  'user-story-mapping': {
    primary: 'figjam' as PlatformType,
    reasoning: 'FigJam AI sticky note organization and project integration (Jira, Asana) make it ideal for story mapping and prioritization',
    alternatives: [
      { platform: 'miro' as PlatformType, useCase: 'Visual story mapping with complex user flows' }
    ]
  },
  'prototypes': {
    primary: 'figma' as PlatformType,
    reasoning: 'Figma Make provides the most advanced AI-powered prototype creation with production-ready interactivity',
    alternatives: [
      { platform: 'miro' as PlatformType, useCase: 'Low-fidelity conceptual prototypes and ideation' }
    ]
  },
  'digital-prototypes': {
    primary: 'figma' as PlatformType,
    reasoning: 'Figma AI and Make feature provide industry-leading interactive prototype creation with design system integration',
    alternatives: [
      { platform: 'miro' as PlatformType, useCase: 'Rapid prototype concepts and user flow visualization' }
    ]
  }
} as const;

/**
 * Enhanced prompt templates with platform-specific optimizations
 */
const OPTIMIZED_PROMPT_TEMPLATES = {
  personas: {
    miro: {
      instructions: [
        'Use Miro AI Prototype Creation to generate detailed persona profiles',
        'Leverage AI Document generation for comprehensive persona backgrounds',
        'Create persona journey visualizations using Mind Map AI features',
        'Use AI image generation for persona profile pictures and lifestyle imagery'
      ],
      specifications: [
        'Include specific birth dates (e.g., March 15, 1987) instead of age ranges',
        'Provide exact salary figures (e.g., $67,500 annually) rather than income brackets',
        'Include specific addresses or zip codes for geographic context',
        'Add precise technology usage patterns (e.g., "Uses iPhone 14 Pro, checks Instagram 8 times daily")',
        'Include actual brand preferences and shopping behaviors',
        'Specify exact family composition (e.g., "Married to Sarah, 2 children: Emma (8) and Jake (5)")'
      ],
      bestPractices: [
        'Use Miro AI to generate realistic persona quotes and frustrations',
        'Create persona empathy maps as visual companions',
        'Link personas to user journey maps for comprehensive understanding',
        'Generate persona scenarios using AI prototype features'
      ],
      promptEnhancement: (originalPrompt: string) => `
**MIRO AI OPTIMIZED PERSONA CREATION**

${originalPrompt}

**MIRO-SPECIFIC INSTRUCTIONS:**
1. Use Miro AI Document generation to create detailed persona profiles
2. Generate persona profile using AI Prototype Creation features
3. Create accompanying persona journey mind maps
4. Use AI image generation for realistic persona visuals

**REQUIRED SPECIFICATIONS:**
- Exact birth date (not age ranges): e.g., "Born: April 23, 1985"
- Specific annual income: e.g., "$72,300 annually"
- Precise location: e.g., "Lives in Apartment 4B, 1247 Oak Street, Portland, OR 97205"
- Detailed technology stack: e.g., "iPhone 13 Pro, MacBook Air M2, uses Slack, Figma, and Notion daily"
- Exact family details: e.g., "Married to Alex (34), twin daughters Maya and Zoe (6 years old)"
- Specific brand loyalties: e.g., "Exclusively shops at Target and Whole Foods, drives 2019 Honda CR-V"

**MIRO AI OUTPUTS TO GENERATE:**
1. Primary persona document with AI-generated background story
2. Visual persona journey map showing daily routines
3. Persona empathy map with AI-generated insights
4. Persona scenario prototypes for key use cases
5. AI-generated persona quotes and testimonials

**COLLABORATION SETUP:**
- Create collaborative workspace for team persona review
- Use Miro AI to generate discussion prompts for persona validation
- Set up persona presentation templates for stakeholder sharing
      `.trim()
    },
    figjam: {
      instructions: [
        'Use FigJam AI template generation for persona workshop structures',
        'Leverage sticky note organization for persona attribute clustering',
        'Utilize collaborative features for team-based persona development',
        'Apply AI summarization for persona insight synthesis'
      ],
      specifications: [
        'Create specific demographic details with exact dates and figures',
        'Include behavioral patterns with frequency measurements',
        'Add technology usage with specific app names and usage times',
        'Provide detailed job responsibilities and daily schedules'
      ],
      bestPractices: [
        'Use FigJam AI to organize persona research insights',
        'Generate persona templates that teams can collaborate on',
        'Create persona validation workshops with sticky note activities',
        'Integrate with project management tools for persona tracking'
      ],
      promptEnhancement: (originalPrompt: string) => `
**FIGJAM AI OPTIMIZED PERSONA WORKSHOP**

${originalPrompt}

**FIGJAM-SPECIFIC INSTRUCTIONS:**
1. Use FigJam AI template generation for persona workshop structure
2. Apply sticky note AI organization for persona attribute clustering
3. Leverage real-time collaboration for team persona development
4. Use AI summarization to synthesize persona insights

**REQUIRED SPECIFICATIONS:**
- Exact demographic details: "Born March 12, 1990, lives in Chicago IL, earns $58,500/year"
- Specific behavioral patterns: "Checks email 23 times/day, shops online Tuesdays"
- Detailed technology usage: "iPhone 12, uses Instagram 45min/day, LinkedIn 12min/day"
- Precise work schedule: "9-5:30 PM, Monday-Friday, WFH Tuesdays and Thursdays"

**FIGJAM AI OUTPUTS:**
1. Persona workshop template with AI-generated prompts
2. Sticky note clusters organized by AI thematic analysis
3. Persona collaboration board for team input
4. Research synthesis summary using AI capabilities

**WORKSHOP FACILITATION:**
- Generate persona research activities using AI templates
- Create collaborative validation exercises
- Use AI to synthesize team input into final personas
      `.trim()
    }
  },
  wireframes: {
    figma: {
      instructions: [
        'Use Figma Make to generate wireframes from text descriptions',
        'Leverage AI component suggestions for design system consistency',
        'Apply AI text generation for realistic wireframe content',
        'Utilize design system integration for production-ready layouts'
      ],
      specifications: [
        'Include exact pixel dimensions for all components',
        'Specify precise typography scales and spacing values',
        'Add detailed interaction specifications for each element',
        'Provide specific content requirements for each section'
      ],
      bestPractices: [
        'Start with Figma Make prompts for rapid wireframe generation',
        'Use design system components for consistency',
        'Generate realistic content with AI text features',
        'Create interactive wireframe prototypes for validation'
      ],
      promptEnhancement: (originalPrompt: string) => `
**FIGMA AI OPTIMIZED WIREFRAME CREATION**

${originalPrompt}

**FIGMA-SPECIFIC INSTRUCTIONS:**
1. Use Figma Make to generate initial wireframes from text descriptions
2. Apply design system components for consistency
3. Use AI text generation for realistic wireframe content
4. Create interactive wireframe connections

**REQUIRED SPECIFICATIONS:**
- Exact dimensions: "Header: 1440px × 72px, Main content: 1200px max-width"
- Precise spacing: "16px margins, 24px between sections, 8px component padding"
- Specific typography: "H1: 32px/40px Inter Bold, Body: 16px/24px Inter Regular"
- Detailed interactions: "Hover states for all buttons, 200ms ease transitions"

**FIGMA AI OUTPUTS:**
1. Multi-screen wireframe flow using Figma Make
2. Interactive wireframe prototype with basic navigation
3. Design system-aligned component specifications
4. Responsive wireframe variants for mobile/tablet/desktop

**PRODUCTION READINESS:**
- Generate developer handoff specifications
- Create wireframe design tokens for development
- Provide interaction and animation specifications
      `.trim()
    }
  },
  'journey-maps': {
    miro: {
      instructions: [
        'Use Miro AI Diagram generation for complex journey visualization',
        'Leverage Mind Map AI for journey touchpoint expansion',
        'Apply AI Document creation for comprehensive journey analysis',
        'Utilize collaborative features for stakeholder journey workshops'
      ],
      specifications: [
        'Map exact journey durations and timestamps',
        'Include specific touchpoint technologies and platforms',
        'Add precise emotion ratings and satisfaction scores',
        'Provide detailed action descriptions for each journey step'
      ],
      bestPractices: [
        'Create multi-layer journey maps with AI diagram generation',
        'Use mind mapping to explore journey branch scenarios',
        'Generate journey personas and scenarios',
        'Create collaborative journey validation sessions'
      ],
      promptEnhancement: (originalPrompt: string) => `
**MIRO AI OPTIMIZED JOURNEY MAPPING**

${originalPrompt}

**MIRO-SPECIFIC INSTRUCTIONS:**
1. Use Miro AI Diagram generation for comprehensive journey visualization
2. Apply Mind Map AI to explore journey touchpoints and scenarios
3. Create journey documentation using AI Document features
4. Generate journey persona connections and scenarios

**REQUIRED SPECIFICATIONS:**
- Exact journey timing: "Awareness phase: 2-3 weeks, Research: 4-7 days, Purchase: 30 minutes"
- Specific touchpoints: "Google Search → Company Website → Demo Request → Sales Call → Trial Signup"
- Precise emotion scores: "Awareness: 6/10 curiosity, Research: 4/10 frustration, Purchase: 8/10 confidence"
- Detailed actions: "Searches 'project management software', compares 3 vendors, reads 5 reviews"

**MIRO AI OUTPUTS:**
1. Comprehensive journey diagram with AI-generated insights
2. Journey touchpoint mind maps with expansion opportunities
3. Journey persona scenarios using AI prototype creation
4. Journey pain point and opportunity analysis documents

**COLLABORATIVE JOURNEY VALIDATION:**
- Create stakeholder journey review sessions
- Generate journey assumption testing workshops
- Use AI to synthesize journey feedback and improvements
      `.trim()
    }
  }
} as const;

/**
 * Get platform recommendation for a specific UX tool
 */
export function getPlatformRecommendation(toolId: string): PlatformRecommendation | null {
  const mapping = UX_TOOL_PLATFORM_MAPPING[toolId as keyof typeof UX_TOOL_PLATFORM_MAPPING];
  if (!mapping) return null;

  const platform = mapping.primary;
  const capabilities = Object.entries(PLATFORM_CAPABILITIES[platform])
    .map(([name, capability]) => ({
      name: name.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase()),
      strength: capability.strength,
      description: capability.description
    }));

  return {
    platform,
    confidence: 85, // High confidence based on 2025 platform capabilities
    reasoning: mapping.reasoning,
    capabilities,
    alternativePlatforms: mapping.alternatives
  };
}

/**
 * Generate optimized prompt for a UX tool and specific platform
 */
export function getOptimizedPrompt(toolId: string, originalPrompt: string, targetPlatform?: PlatformType): OptimizedPrompt | null {
  const recommendation = getPlatformRecommendation(toolId);
  if (!recommendation) return null;

  const platform = targetPlatform || recommendation.platform;
  const template = OPTIMIZED_PROMPT_TEMPLATES[toolId as keyof typeof OPTIMIZED_PROMPT_TEMPLATES];
  
  if (!template || !template[platform]) {
    return null;
  }

  const platformTemplate = template[platform];
  const optimizedPrompt = platformTemplate.promptEnhancement ? 
    platformTemplate.promptEnhancement(originalPrompt) : 
    originalPrompt;

  return {
    originalPrompt,
    optimizedPrompt,
    platformSpecifics: {
      platform,
      instructions: platformTemplate.instructions,
      specifications: platformTemplate.specifications,
      bestPractices: platformTemplate.bestPractices
    },
    expectedOutputs: getExpectedOutputs(toolId, platform)
  };
}

/**
 * Get expected outputs for a tool on a specific platform
 */
function getExpectedOutputs(toolId: string, platform: PlatformType): string[] {
  const outputs = {
    personas: {
      miro: [
        'AI-generated persona document with comprehensive background',
        'Visual persona journey map with daily touchpoints',
        'Persona empathy map with AI insights',
        'Interactive persona scenarios and use cases',
        'Persona validation workshop materials'
      ],
      figjam: [
        'Collaborative persona workshop template',
        'Organized persona research synthesis',
        'Team-validated persona profiles',
        'Persona attribute sticky note clusters',
        'Persona research summary document'
      ],
      figma: [
        'High-fidelity persona presentation materials',
        'Persona design system components',
        'Interactive persona profile mockups',
        'Persona-driven design specifications'
      ]
    },
    wireframes: {
      figma: [
        'Multi-screen interactive wireframe prototype',
        'Design system-aligned wireframe components',
        'Responsive wireframe variants (mobile/tablet/desktop)',
        'Developer handoff specifications',
        'Wireframe design tokens and documentation'
      ],
      miro: [
        'Conceptual wireframe flows and user journeys',
        'Wireframe ideation and exploration boards',
        'Collaborative wireframe feedback sessions',
        'Wireframe architecture documentation'
      ],
      figjam: [
        'Wireframe workshop templates and activities',
        'Collaborative wireframe iteration sessions',
        'Wireframe requirement synthesis',
        'Team-validated wireframe concepts'
      ]
    },
    'journey-maps': {
      miro: [
        'Comprehensive multi-touchpoint journey diagram',
        'Journey persona scenario connections',
        'Journey opportunity and pain point analysis',
        'Interactive journey exploration mind maps',
        'Journey validation workshop materials'
      ],
      figjam: [
        'Research-driven journey mapping workshop',
        'Journey insight synthesis and themes',
        'Collaborative journey validation session',
        'Journey improvement prioritization matrix'
      ]
    }
  } as const;

  return outputs[toolId as keyof typeof outputs]?.[platform] || [
    'Platform-optimized deliverable based on tool capabilities',
    'Collaborative validation materials',
    'Documentation and specifications'
  ];
}

/**
 * Get all supported UX tools with platform recommendations
 */
export function getAllSupportedTools(): Array<{
  toolId: string;
  recommendation: PlatformRecommendation;
}> {
  return Object.keys(UX_TOOL_PLATFORM_MAPPING).map(toolId => ({
    toolId,
    recommendation: getPlatformRecommendation(toolId)!
  }));
}

/**
 * Generate platform comparison for a specific UX tool
 */
export function getPlatformComparison(toolId: string): {
  tool: string;
  platforms: Array<{
    platform: PlatformType;
    suitability: number; // 0-100
    strengths: string[];
    limitations: string[];
  }>;
} | null {
  const recommendation = getPlatformRecommendation(toolId);
  if (!recommendation) return null;

  // Platform suitability scores based on capabilities and use cases
  const suitabilityScores = {
    personas: { miro: 90, figjam: 75, figma: 60 },
    wireframes: { figma: 95, miro: 70, figjam: 55 },
    'journey-maps': { miro: 95, figjam: 80, figma: 45 },
    'empathy-maps': { figjam: 90, miro: 80, figma: 50 },
    'user-story-mapping': { figjam: 85, miro: 75, figma: 40 }
  } as const;

  const scores = suitabilityScores[toolId as keyof typeof suitabilityScores] || 
    { miro: 70, figjam: 70, figma: 70 };

  return {
    tool: toolId,
    platforms: [
      {
        platform: 'miro',
        suitability: scores.miro,
        strengths: ['AI diagram generation', 'Document creation', 'Mind mapping', 'Prototype creation'],
        limitations: ['Less design system integration', 'Limited high-fidelity design capabilities']
      },
      {
        platform: 'figjam',
        suitability: scores.figjam,
        strengths: ['Template generation', 'Collaborative workshops', 'Research synthesis', 'Project integration'],
        limitations: ['Limited prototyping capabilities', 'Basic design features']
      },
      {
        platform: 'figma',
        suitability: scores.figma,
        strengths: ['High-fidelity design', 'Design system integration', 'Interactive prototypes', 'Production-ready output'],
        limitations: ['Limited research facilitation', 'Less collaborative workshop features']
      }
    ]
  };
}