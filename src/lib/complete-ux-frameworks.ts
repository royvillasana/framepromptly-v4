/**
 * @fileoverview Complete UX Framework Definitions with All Accurate Stages and Tools
 * Based on 2024 research and official methodologies
 */

import { UXFramework } from '@/stores/workflow-store';

// Complete and accurate UX frameworks with all stages and comprehensive tools
export const completeUXFrameworks: UXFramework[] = [
  // 1. DESIGN THINKING - Complete with all 5 stages
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    description: 'Human-centered approach to innovation with 5 stages of problem-solving',
    color: '#8B5CF6',
    characteristics: {
      focus: 'Human-centered innovation',
      timeline: '2-6 months',
      complexity: 'Medium',
      teamSize: '3-8 people',
      outcome: 'Validated solutions'
    },
    stages: [
      {
        id: 'empathize',
        name: 'Empathize',
        description: 'Understand user needs and context through deep research',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Researchers, designers, stakeholders',
          deliverables: 'User insights, empathy maps, personas',
          skills: ['user research', 'interviewing', 'observation', 'empathy building'],
          dependencies: ['stakeholder buy-in', 'user access', 'research plan']
        },
        tools: [
          {
            id: 'user-interviews',
            name: 'User Interviews',
            description: 'Conduct in-depth user interviews to understand needs and motivations',
            category: 'Research',
            icon: 'MessageCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Research skills',
              resources: ['interview guide', 'recording equipment', 'transcription tools'],
              output: 'User insights and quotes',
              when: 'Beginning of project'
            }
          },
          {
            id: 'observations',
            name: 'Field Observations',
            description: 'Observe users in their natural environment and context',
            category: 'Research',
            icon: 'Eye',
            characteristics: {
              effort: 'High',
              expertise: 'Ethnographic research',
              resources: ['observation protocols', 'field access', 'documentation tools'],
              output: 'Behavioral insights and contextual understanding',
              when: 'Context exploration phase'
            }
          },
          {
            id: 'empathy-maps',
            name: 'Empathy Maps',
            description: 'Visualize user thoughts, feelings, actions, and motivations',
            category: 'Analysis',
            icon: 'Heart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Synthesis skills',
              resources: ['research data', 'mapping templates', 'workshop materials'],
              output: 'User empathy visualization',
              when: 'After research data collection'
            }
          },
          {
            id: 'stakeholder-interviews',
            name: 'Stakeholder Interviews',
            description: 'Understand business context and organizational constraints',
            category: 'Research',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview facilitation',
              resources: ['interview guides', 'stakeholder mapping'],
              output: 'Business context and requirements',
              when: 'Project initiation and throughout'
            }
          },
          {
            id: 'surveys',
            name: 'User Surveys',
            description: 'Collect quantitative data on user behaviors and preferences',
            category: 'Research',
            icon: 'BarChart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Survey design and analysis',
              resources: ['survey platform', 'user database', 'analysis tools'],
              output: 'Quantitative user insights',
              when: 'Broad user understanding needed'
            }
          }
        ]
      },
      {
        id: 'define',
        name: 'Define',
        description: 'Synthesize observations into clear problem statements and user needs',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '1-2 weeks',
          participants: 'Design team, researchers, key stakeholders',
          deliverables: 'Problem statements, personas, POV statements, user needs',
          skills: ['synthesis', 'problem framing', 'storytelling', 'prioritization'],
          dependencies: ['research insights', 'stakeholder alignment', 'data analysis']
        },
        tools: [
          {
            id: 'affinity-mapping',
            name: 'Affinity Mapping',
            description: 'Group related insights to identify patterns and themes',
            category: 'Analysis',
            icon: 'Grid3X3',
            characteristics: {
              effort: 'Medium',
              expertise: 'Synthesis and pattern recognition',
              resources: ['sticky notes', 'wall space', 'research data', 'facilitation materials'],
              output: 'Insight clusters and key themes',
              when: 'After research data collection'
            }
          },
          {
            id: 'personas',
            name: 'User Personas',
            description: 'Create detailed user archetypes based on research insights',
            category: 'Analysis',
            icon: 'User',
            characteristics: {
              effort: 'Medium',
              expertise: 'User modeling and storytelling',
              resources: ['research data', 'design tools', 'persona templates'],
              output: 'Detailed user persona documents',
              when: 'After insight synthesis'
            }
          },
          {
            id: 'problem-statements',
            name: 'Problem Statements',
            description: 'Define clear, actionable problem statements using POV format',
            category: 'Strategy',
            icon: 'Target',
            characteristics: {
              effort: 'Low',
              expertise: 'Problem framing and communication',
              resources: ['synthesis insights', 'POV templates'],
              output: 'Clear problem definitions',
              when: 'After user need identification'
            }
          },
          {
            id: 'journey-maps',
            name: 'User Journey Maps',
            description: 'Map the complete user experience across touchpoints and time',
            category: 'Analysis',
            icon: 'Route',
            characteristics: {
              effort: 'High',
              expertise: 'Journey mapping and visualization',
              resources: ['user research', 'journey templates', 'collaboration tools'],
              output: 'Comprehensive user journey visualization',
              when: 'Understanding user experience flow'
            }
          }
        ]
      },
      {
        id: 'ideate',
        name: 'Ideate',
        description: 'Generate creative solutions through divergent thinking and ideation',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '1-3 weeks',
          participants: 'Multidisciplinary team, stakeholders, external experts',
          deliverables: 'Solution concepts, feature ideas, creative alternatives',
          skills: ['creative thinking', 'brainstorming', 'facilitation', 'idea evaluation'],
          dependencies: ['clear problem definition', 'diverse team perspectives', 'ideation space']
        },
        tools: [
          {
            id: 'brainstorming',
            name: 'Brainstorming Sessions',
            description: 'Generate diverse ideas rapidly through structured group ideation',
            category: 'Ideation',
            icon: 'Lightbulb',
            characteristics: {
              effort: 'Low',
              expertise: 'Facilitation and creative thinking',
              resources: ['workshop space', 'ideation materials', 'timer'],
              output: 'Raw ideas and solution concepts',
              when: 'Divergent thinking phase'
            }
          },
          {
            id: 'how-might-we',
            name: 'How Might We Questions',
            description: 'Reframe problems as actionable opportunities for innovation',
            category: 'Ideation',
            icon: 'HelpCircle',
            characteristics: {
              effort: 'Low',
              expertise: 'Problem reframing and question design',
              resources: ['problem statements', 'HMW templates'],
              output: 'Opportunity-focused questions',
              when: 'Problem to solution transition'
            }
          },
          {
            id: 'crazy-eights',
            name: 'Crazy Eights',
            description: 'Rapid sketching exercise to generate 8 ideas in 8 minutes',
            category: 'Ideation',
            icon: 'Zap',
            characteristics: {
              effort: 'Low',
              expertise: 'Sketching and rapid ideation',
              resources: ['paper', 'pens', 'timer'],
              output: 'Quick visual solution concepts',
              when: 'Need for rapid idea generation'
            }
          },
          {
            id: 'scamper',
            name: 'SCAMPER Technique',
            description: 'Systematic creativity using Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse',
            category: 'Ideation',
            icon: 'Shuffle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Creative thinking frameworks',
              resources: ['SCAMPER templates', 'existing solutions for reference'],
              output: 'Systematically generated solution variations',
              when: 'Need for structured creative exploration'
            }
          },
          {
            id: 'storyboarding',
            name: 'Solution Storyboarding',
            description: 'Create visual narratives showing solution concepts in use',
            category: 'Ideation',
            icon: 'BookOpen',
            characteristics: {
              effort: 'Medium',
              expertise: 'Visual storytelling and communication',
              resources: ['drawing materials', 'storyboard templates'],
              output: 'Visual solution narratives',
              when: 'Communicating complex solution concepts'
            }
          }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build testable representations of solutions for validation',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Designers, developers, product managers',
          deliverables: 'Prototypes, mockups, wireframes, interactive demos',
          skills: ['prototyping', 'design tools', 'technical skills', 'user flow design'],
          dependencies: ['selected concepts', 'technical constraints', 'testing plan']
        },
        tools: [
          {
            id: 'wireframes',
            name: 'Wireframes',
            description: 'Create low-fidelity structural layouts and information architecture',
            category: 'Prototyping',
            icon: 'Layout',
            characteristics: {
              effort: 'Medium',
              expertise: 'Information architecture and layout design',
              resources: ['wireframing tools', 'content inventory', 'user flow maps'],
              output: 'Structural interface layouts',
              when: 'Information architecture definition'
            }
          },
          {
            id: 'paper-prototypes',
            name: 'Paper Prototypes',
            description: 'Create rapid, low-cost prototypes using paper and simple materials',
            category: 'Prototyping',
            icon: 'FileText',
            characteristics: {
              effort: 'Low',
              expertise: 'Basic design and construction skills',
              resources: ['paper', 'scissors', 'tape', 'markers'],
              output: 'Tangible, testable solution representations',
              when: 'Early concept validation'
            }
          },
          {
            id: 'digital-prototypes',
            name: 'Digital Prototypes',
            description: 'Build interactive digital prototypes for realistic user testing',
            category: 'Prototyping',
            icon: 'Smartphone',
            characteristics: {
              effort: 'High',
              expertise: 'Digital design and prototyping tools',
              resources: ['design software', 'prototyping platforms', 'device testing'],
              output: 'Interactive digital experiences',
              when: 'Detailed interaction testing needed'
            }
          },
          {
            id: 'service-blueprints',
            name: 'Service Blueprints',
            description: 'Map front-stage and back-stage service delivery processes',
            category: 'Prototyping',
            icon: 'Map',
            characteristics: {
              effort: 'High',
              expertise: 'Service design and process mapping',
              resources: ['service mapping tools', 'stakeholder input', 'process documentation'],
              output: 'Comprehensive service delivery maps',
              when: 'Service experience design'
            }
          }
        ]
      },
      {
        id: 'test',
        name: 'Test',
        description: 'Validate solutions with users and gather feedback for iteration',
        position: { x: 800, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Researchers, designers, users, stakeholders',
          deliverables: 'Test results, insights, recommendations, iteration plan',
          skills: ['usability testing', 'data analysis', 'facilitation', 'insight synthesis'],
          dependencies: ['testable prototypes', 'user access', 'testing environment']
        },
        tools: [
          {
            id: 'usability-tests',
            name: 'Usability Testing',
            description: 'Test prototypes with users to evaluate usability and effectiveness',
            category: 'Testing',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Usability testing and research facilitation',
              resources: ['testing lab', 'recording equipment', 'test participants', 'analysis tools'],
              output: 'Usability findings and recommendations',
              when: 'Prototype validation phase'
            }
          },
          {
            id: 'a-b-testing',
            name: 'A/B Testing',
            description: 'Compare different solution variants to identify optimal approaches',
            category: 'Testing',
            icon: 'GitBranch',
            characteristics: {
              effort: 'Medium',
              expertise: 'Experimental design and statistical analysis',
              resources: ['testing platforms', 'traffic splitting tools', 'analytics'],
              output: 'Statistically validated design decisions',
              when: 'Comparing solution alternatives'
            }
          },
          {
            id: 'feedback-sessions',
            name: 'User Feedback Sessions',
            description: 'Gather qualitative feedback through structured user discussions',
            category: 'Testing',
            icon: 'MessageSquare',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview facilitation and feedback synthesis',
              resources: ['session space', 'recording equipment', 'discussion guides'],
              output: 'Qualitative user feedback and insights',
              when: 'Need for detailed user opinions'
            }
          },
          {
            id: 'analytics-review',
            name: 'Analytics Review',
            description: 'Analyze user behavior data to understand solution performance',
            category: 'Testing',
            icon: 'BarChart3',
            characteristics: {
              effort: 'Medium',
              expertise: 'Data analysis and interpretation',
              resources: ['analytics tools', 'tracking implementation', 'reporting dashboards'],
              output: 'Behavioral insights and performance metrics',
              when: 'Quantitative performance evaluation'
            }
          }
        ]
      }
    ]
  },

  // 2. DOUBLE DIAMOND - Complete with all 4 stages (Discover, Define, Develop, Deliver)
  {
    id: 'double-diamond',
    name: 'Double Diamond',
    description: 'British Design Council\'s 4-stage divergent-convergent thinking process',
    color: '#EF4444',
    characteristics: {
      focus: 'Problem and solution exploration',
      timeline: '3-6 months',
      complexity: 'Medium-High',
      teamSize: '4-10 people',
      outcome: 'Well-defined solutions'
    },
    stages: [
      {
        id: 'discover',
        name: 'Discover',
        description: 'Explore and understand the problem space broadly (Divergent)',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '3-6 weeks',
          participants: 'Researchers, stakeholders, users, domain experts',
          deliverables: 'Research insights, opportunity areas, problem understanding',
          skills: ['research', 'stakeholder management', 'observation', 'data collection'],
          dependencies: ['project brief', 'stakeholder access', 'research resources']
        },
        tools: [
          {
            id: 'stakeholder-interviews',
            name: 'Stakeholder Interviews',
            description: 'Understand business context and organizational constraints',
            category: 'Research',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview facilitation and stakeholder management',
              resources: ['interview guides', 'stakeholder mapping', 'scheduling tools'],
              output: 'Business context and stakeholder perspectives',
              when: 'Project initiation phase'
            }
          },
          {
            id: 'contextual-inquiry',
            name: 'Contextual Inquiry',
            description: 'Observe users in their natural environment and context',
            category: 'Research',
            icon: 'Search',
            characteristics: {
              effort: 'High',
              expertise: 'Ethnographic research and observation',
              resources: ['field access', 'observation protocols', 'documentation tools'],
              output: 'Contextual user insights and environmental understanding',
              when: 'Problem space exploration'
            }
          },
          {
            id: 'desk-research',
            name: 'Desk Research',
            description: 'Gather existing knowledge through secondary research and analysis',
            category: 'Research',
            icon: 'BookOpen',
            characteristics: {
              effort: 'Medium',
              expertise: 'Research and information synthesis',
              resources: ['research databases', 'analysis tools', 'documentation systems'],
              output: 'Market insights and existing knowledge compilation',
              when: 'Foundation building phase'
            }
          },
          {
            id: 'expert-interviews',
            name: 'Expert Interviews',
            description: 'Learn from domain specialists and industry experts',
            category: 'Research',
            icon: 'GraduationCap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Expert interview facilitation',
              resources: ['expert network access', 'structured interview guides'],
              output: 'Specialized domain knowledge and insights',
              when: 'Domain understanding needed'
            }
          }
        ]
      },
      {
        id: 'define-dd',
        name: 'Define',
        description: 'Synthesize insights into focused design brief (Convergent)',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Design team, key stakeholders, decision makers',
          deliverables: 'Design brief, focused problem definition, success criteria',
          skills: ['synthesis', 'problem definition', 'prioritization', 'strategic thinking'],
          dependencies: ['research insights', 'stakeholder alignment', 'organizational buy-in']
        },
        tools: [
          {
            id: 'synthesis-workshops',
            name: 'Synthesis Workshops',
            description: 'Collaborative sessions to analyze and synthesize research findings',
            category: 'Analysis',
            icon: 'Target',
            characteristics: {
              effort: 'High',
              expertise: 'Workshop facilitation and synthesis',
              resources: ['workshop space', 'research data', 'facilitation materials', 'collaboration tools'],
              output: 'Key insights, themes, and opportunity areas',
              when: 'After comprehensive research phase'
            }
          },
          {
            id: 'opportunity-mapping',
            name: 'Opportunity Mapping',
            description: 'Identify and prioritize design opportunities from research insights',
            category: 'Strategy',
            icon: 'MapPin',
            characteristics: {
              effort: 'Medium',
              expertise: 'Strategic thinking and opportunity assessment',
              resources: ['synthesis insights', 'prioritization frameworks', 'stakeholder input'],
              output: 'Prioritized opportunity areas and focus selection',
              when: 'Strategic direction setting'
            }
          },
          {
            id: 'design-principles',
            name: 'Design Principles',
            description: 'Define guiding principles that will inform solution development',
            category: 'Strategy',
            icon: 'Compass',
            characteristics: {
              effort: 'Medium',
              expertise: 'Strategic design thinking and principle formulation',
              resources: ['synthesis insights', 'organizational values', 'stakeholder alignment'],
              output: 'Clear design principles and guidelines',
              when: 'Solution direction guidance needed'
            }
          }
        ]
      },
      {
        id: 'develop',
        name: 'Develop',
        description: 'Generate and iterate on solution concepts (Divergent)',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '4-8 weeks',
          participants: 'Designers, developers, product managers, users',
          deliverables: 'Solution concepts, prototypes, tested alternatives',
          skills: ['ideation', 'prototyping', 'iteration', 'user feedback integration'],
          dependencies: ['design brief', 'technical resources', 'user access for testing']
        },
        tools: [
          {
            id: 'co-design-workshops',
            name: 'Co-Design Workshops',
            description: 'Collaborative design sessions with users and stakeholders',
            category: 'Ideation',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Workshop facilitation and collaborative design',
              resources: ['workshop space', 'design materials', 'diverse participants'],
              output: 'User-informed solution concepts and feedback',
              when: 'Solution co-creation needed'
            }
          },
          {
            id: 'rapid-prototyping',
            name: 'Rapid Prototyping',
            description: 'Quick creation of testable solution representations',
            category: 'Prototyping',
            icon: 'Zap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Rapid prototyping techniques and tools',
              resources: ['prototyping materials', 'design tools', 'testing resources'],
              output: 'Fast iteration cycles and testable prototypes',
              when: 'Quick validation of multiple concepts'
            }
          },
          {
            id: 'concept-testing',
            name: 'Concept Testing',
            description: 'Test early solution concepts with target users',
            category: 'Testing',
            icon: 'TestTube',
            characteristics: {
              effort: 'Medium',
              expertise: 'Concept testing and user research',
              resources: ['test participants', 'concept materials', 'feedback tools'],
              output: 'Concept validation and improvement insights',
              when: 'Early solution validation'
            }
          }
        ]
      },
      {
        id: 'deliver',
        name: 'Deliver',
        description: 'Implement and launch solutions with optimization (Convergent)',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '4-8 weeks',
          participants: 'Full delivery team, stakeholders, end users',
          deliverables: 'Final solution, launch plan, success metrics, iteration roadmap',
          skills: ['implementation', 'project management', 'launch coordination', 'performance monitoring'],
          dependencies: ['validated solution', 'implementation resources', 'launch readiness']
        },
        tools: [
          {
            id: 'implementation-planning',
            name: 'Implementation Planning',
            description: 'Create detailed plans for solution rollout and launch',
            category: 'Planning',
            icon: 'Calendar',
            characteristics: {
              effort: 'High',
              expertise: 'Project management and implementation planning',
              resources: ['planning tools', 'resource allocation', 'timeline management'],
              output: 'Comprehensive implementation and launch plans',
              when: 'Solution launch preparation'
            }
          },
          {
            id: 'pilot-testing',
            name: 'Pilot Testing',
            description: 'Small-scale testing to validate solution before full launch',
            category: 'Testing',
            icon: 'PlayCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Pilot program management and evaluation',
              resources: ['pilot environment', 'test users', 'measurement tools'],
              output: 'Pilot results and optimization recommendations',
              when: 'Pre-launch validation'
            }
          },
          {
            id: 'performance-monitoring',
            name: 'Performance Monitoring',
            description: 'Track solution performance and user adoption post-launch',
            category: 'Measurement',
            icon: 'Activity',
            characteristics: {
              effort: 'Medium',
              expertise: 'Analytics and performance measurement',
              resources: ['monitoring tools', 'analytics platforms', 'reporting systems'],
              output: 'Performance insights and optimization opportunities',
              when: 'Post-launch optimization'
            }
          }
        ]
      }
    ]
  },

  // 3. GOOGLE DESIGN SPRINT - Complete with all 5 stages (Understand, Sketch, Decide, Prototype, Validate)
  {
    id: 'google-design-sprint',
    name: 'Google Design Sprint',
    description: 'Google Ventures 5-day rapid prototyping and validation process',
    color: '#F59E0B',
    characteristics: {
      focus: 'Rapid validation and decision making',
      timeline: '1 week (5 days)',
      complexity: 'Low-Medium',
      teamSize: '5-7 people',
      outcome: 'Validated prototype and clear next steps'
    },
    stages: [
      {
        id: 'understand',
        name: 'Understand (Monday)',
        description: 'Map the problem and pick target for the week',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Sprint team, subject matter experts, decider',
          deliverables: 'Problem map, target selection, long-term goal',
          skills: ['facilitation', 'problem mapping', 'prioritization', 'expert interviewing'],
          dependencies: ['defined challenge', 'committed sprint team', 'expert access']
        },
        tools: [
          {
            id: 'expert-interviews-sprint',
            name: 'Expert Interviews',
            description: 'Lightning talks with domain experts to build understanding',
            category: 'Research',
            icon: 'GraduationCap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview facilitation and expert coordination',
              resources: ['expert access', 'structured interview format', 'note-taking system'],
              output: 'Expert insights and domain knowledge',
              when: 'Monday morning sprint session'
            }
          },
          {
            id: 'problem-mapping-sprint',
            name: 'Problem Mapping',
            description: 'Visual map of the problem space and user journey',
            category: 'Analysis',
            icon: 'Map',
            characteristics: {
              effort: 'Low',
              expertise: 'Visual mapping and process documentation',
              resources: ['whiteboard', 'sticky notes', 'markers'],
              output: 'Visual problem space map',
              when: 'Monday sprint session'
            }
          },
          {
            id: 'target-selection',
            name: 'Target Selection',
            description: 'Choose specific target customer and moment to focus on',
            category: 'Strategy',
            icon: 'Target',
            characteristics: {
              effort: 'Low',
              expertise: 'Strategic decision making and prioritization',
              resources: ['problem map', 'team discussion', 'decision framework'],
              output: 'Focused target selection for sprint week',
              when: 'Monday afternoon decision'
            }
          }
        ]
      },
      {
        id: 'sketch',
        name: 'Sketch (Tuesday)',
        description: 'Generate solution ideas through individual sketching',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Sprint team members working individually',
          deliverables: 'Solution sketches, detailed concepts, crazy 8s variations',
          skills: ['sketching', 'creative thinking', 'solution development', 'visual communication'],
          dependencies: ['clear problem understanding', 'target selection', 'inspiration research']
        },
        tools: [
          {
            id: 'four-step-sketching',
            name: 'Four-Step Sketching',
            description: 'Structured sketching process: Notes, Ideas, Crazy 8s, Solution Sketch',
            category: 'Ideation',
            icon: 'PenTool',
            characteristics: {
              effort: 'Medium',
              expertise: 'Sketching and visual ideation',
              resources: ['paper', 'pens', 'timer', 'reference materials'],
              output: 'Detailed solution sketches and concepts',
              when: 'Tuesday structured sketching sessions'
            }
          },
          {
            id: 'crazy-8s-sprint',
            name: 'Crazy 8s',
            description: 'Rapid sketching exercise - 8 variations in 8 minutes',
            category: 'Ideation',
            icon: 'Zap',
            characteristics: {
              effort: 'Low',
              expertise: 'Rapid ideation and sketching',
              resources: ['paper', 'pens', 'timer'],
              output: 'Multiple quick solution variations',
              when: 'Tuesday afternoon ideation'
            }
          },
          {
            id: 'solution-sketching',
            name: 'Solution Sketching',
            description: 'Detailed three-panel solution sketch with key interactions',
            category: 'Ideation',
            icon: 'FileText',
            characteristics: {
              effort: 'Medium',
              expertise: 'Detailed sketching and interaction design',
              resources: ['large paper', 'detailed drawing tools', 'reference materials'],
              output: 'Comprehensive solution concept sketches',
              when: 'Tuesday final sketching session'
            }
          }
        ]
      },
      {
        id: 'decide',
        name: 'Decide (Wednesday)',
        description: 'Make decisions on best solutions and create storyboard',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Full sprint team with decider having final say',
          deliverables: 'Selected solution, detailed storyboard, prototype plan',
          skills: ['decision making', 'storyboarding', 'conflict resolution', 'planning'],
          dependencies: ['solution sketches', 'decider availability', 'evaluation criteria']
        },
        tools: [
          {
            id: 'art-museum',
            name: 'Art Museum',
            description: 'Display all solution sketches for team review and discussion',
            category: 'Evaluation',
            icon: 'Image',
            characteristics: {
              effort: 'Low',
              expertise: 'Presentation and discussion facilitation',
              resources: ['wall space', 'sketches display', 'review materials'],
              output: 'Comprehensive solution overview and initial reactions',
              when: 'Wednesday morning review'
            }
          },
          {
            id: 'heat-map-voting',
            name: 'Heat Map Voting',
            description: 'Team members place dots on interesting parts of solutions',
            category: 'Evaluation',
            icon: 'MousePointer',
            characteristics: {
              effort: 'Low',
              expertise: 'Voting facilitation and preference collection',
              resources: ['dot stickers', 'solution sketches', 'voting guidelines'],
              output: 'Visual representation of team interest and preferences',
              when: 'Wednesday solution evaluation'
            }
          },
          {
            id: 'speed-critique',
            name: 'Speed Critique',
            description: 'Quick 3-minute discussions of each solution concept',
            category: 'Evaluation',
            icon: 'MessageCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Critique facilitation and time management',
              resources: ['timer', 'discussion framework', 'note-taking system'],
              output: 'Structured feedback on each solution concept',
              when: 'Wednesday solution review'
            }
          },
          {
            id: 'straw-poll-vote',
            name: 'Straw Poll Vote',
            description: 'Each team member votes for their preferred solution',
            category: 'Evaluation',
            icon: 'Vote',
            characteristics: {
              effort: 'Low',
              expertise: 'Voting coordination and preference aggregation',
              resources: ['voting materials', 'preference collection system'],
              output: 'Team preference ranking and discussion points',
              when: 'Wednesday decision process'
            }
          },
          {
            id: 'supervote',
            name: 'Supervote',
            description: 'Decider makes final selection with special supervote',
            category: 'Decision',
            icon: 'Crown',
            characteristics: {
              effort: 'Low',
              expertise: 'Decision making and rationale communication',
              resources: ['decision framework', 'selection materials'],
              output: 'Final solution selection and decision rationale',
              when: 'Wednesday final decision'
            }
          },
          {
            id: 'storyboarding',
            name: 'Storyboarding',
            description: 'Create step-by-step storyboard for prototype creation',
            category: 'Planning',
            icon: 'BookOpen',
            characteristics: {
              effort: 'Medium',
              expertise: 'Storyboarding and flow design',
              resources: ['storyboard template', 'selected solution', 'flow planning materials'],
              output: 'Detailed prototype storyboard and user flow',
              when: 'Wednesday afternoon planning'
            }
          }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype (Thursday)',
        description: 'Build realistic prototype of selected solution',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Makers (designers/developers), decider for key decisions',
          deliverables: 'High-fidelity prototype, test script, interview guide',
          skills: ['rapid prototyping', 'design tools', 'content creation', 'user flow implementation'],
          dependencies: ['storyboard', 'prototyping tools', 'content and assets', 'technical setup']
        },
        tools: [
          {
            id: 'facade-prototyping',
            name: 'Facade Prototyping',
            description: 'Create realistic-looking prototype that simulates final experience',
            category: 'Prototyping',
            icon: 'Smartphone',
            characteristics: {
              effort: 'High',
              expertise: 'Rapid prototyping and design tool proficiency',
              resources: ['design tools', 'prototyping software', 'content materials', 'technical setup'],
              output: 'High-fidelity interactive prototype',
              when: 'Thursday full-day build session'
            }
          },
          {
            id: 'content-creation',
            name: 'Content Creation',
            description: 'Create realistic content and copy for prototype',
            category: 'Content',
            icon: 'Type',
            characteristics: {
              effort: 'Medium',
              expertise: 'Content writing and realistic data creation',
              resources: ['content templates', 'realistic data sources', 'writing tools'],
              output: 'Realistic prototype content and copy',
              when: 'Thursday prototype building'
            }
          },
          {
            id: 'interview-script',
            name: 'Interview Script',
            description: 'Create script and guide for Friday user testing',
            category: 'Planning',
            icon: 'Script',
            characteristics: {
              effort: 'Low',
              expertise: 'User testing and interview design',
              resources: ['interview templates', 'testing objectives', 'question frameworks'],
              output: 'Complete user testing script and guide',
              when: 'Thursday end-of-day preparation'
            }
          }
        ]
      },
      {
        id: 'validate',
        name: 'Validate (Friday)',
        description: 'Test prototype with real users and gather feedback',
        position: { x: 800, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Sprint team, 5 target users, facilitator',
          deliverables: 'User feedback, testing insights, next steps recommendations',
          skills: ['user testing', 'interview facilitation', 'observation', 'insight synthesis'],
          dependencies: ['working prototype', 'recruited test users', 'testing setup', 'observation tools']
        },
        tools: [
          {
            id: 'five-act-interview',
            name: 'Five-Act Interview',
            description: 'Structured user testing format: Welcome, Context, Introduce, Tasks, Debrief',
            category: 'Testing',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'User testing facilitation and interview skills',
              resources: ['testing environment', 'prototype setup', 'observation tools', 'recording equipment'],
              output: 'Structured user feedback and behavioral observations',
              when: 'Friday testing sessions'
            }
          },
          {
            id: 'observation-capture',
            name: 'Observation Capture',
            description: 'Systematic capture of user behavior and feedback during testing',
            category: 'Research',
            icon: 'Eye',
            characteristics: {
              effort: 'Medium',
              expertise: 'User observation and note-taking',
              resources: ['observation templates', 'note-taking tools', 'behavior tracking systems'],
              output: 'Detailed user behavior observations and quotes',
              when: 'Friday during user testing'
            }
          },
          {
            id: 'five-whys-validation',
            name: 'Five Whys Validation',
            description: 'Deep diving into user responses to understand root motivations',
            category: 'Research',
            icon: 'HelpCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Deep questioning and insight extraction',
              resources: ['questioning frameworks', 'follow-up protocols'],
              output: 'Deep user insights and root cause understanding',
              when: 'Friday user interview deep dives'
            }
          },
          {
            id: 'pattern-identification',
            name: 'Pattern Identification',
            description: 'Identify patterns across user testing sessions for actionable insights',
            category: 'Analysis',
            icon: 'TrendingUp',
            characteristics: {
              effort: 'Medium',
              expertise: 'Pattern recognition and insight synthesis',
              resources: ['analysis tools', 'pattern templates', 'synthesis materials'],
              output: 'Key patterns and actionable next steps',
              when: 'Friday afternoon synthesis'
            }
          },
          {
            id: 'next-steps-planning',
            name: 'Next Steps Planning',
            description: 'Define clear next steps based on sprint learnings',
            category: 'Planning',
            icon: 'ArrowRight',
            characteristics: {
              effort: 'Low',
              expertise: 'Strategic planning and decision making',
              resources: ['planning templates', 'decision frameworks'],
              output: 'Clear next steps and future direction',
              when: 'Friday wrap-up session'
            }
          }
        ]
      }
    ]
  },

  // 4. HUMAN-CENTERED DESIGN - Complete with all 3 stages (Hear, Create, Deliver)
  {
    id: 'human-centered-design',
    name: 'Human-Centered Design',
    description: 'IDEO methodology focused on deep human understanding and impactful solutions',
    color: '#10B981',
    characteristics: {
      focus: 'Human needs and experiences',
      timeline: '3-9 months',
      complexity: 'Medium-High',
      teamSize: '4-12 people',
      outcome: 'Impactful, human-centered solutions'
    },
    stages: [
      {
        id: 'hear',
        name: 'Hear',
        description: 'Understand people and their context through deep empathy and research',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '4-8 weeks',
          participants: 'Researchers, community members, local partners',
          deliverables: 'Deep user insights, stories, cultural understanding',
          skills: ['empathy', 'listening', 'cultural sensitivity', 'community engagement'],
          dependencies: ['community access', 'trust building', 'local partnerships']
        },
        tools: [
          {
            id: 'immersion',
            name: 'Immersion',
            description: 'Spend extended time in the community to understand context deeply',
            category: 'Research',
            icon: 'Heart',
            characteristics: {
              effort: 'High',
              expertise: 'Cultural sensitivity and community engagement',
              resources: ['time commitment', 'local access', 'community trust'],
              output: 'Deep contextual understanding and authentic relationships',
              when: 'Beginning of HCD process'
            }
          },
          {
            id: 'individual-interviews-hcd',
            name: 'Individual Interviews',
            description: 'One-on-one conversations to understand personal experiences and needs',
            category: 'Research',
            icon: 'MessageCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Empathetic interviewing and active listening',
              resources: ['interview guides', 'translation support', 'safe spaces'],
              output: 'Personal stories and individual perspectives',
              when: 'Deep understanding phase'
            }
          },
          {
            id: 'group-interviews',
            name: 'Group Interviews',
            description: 'Facilitated discussions with multiple community members',
            category: 'Research',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Group facilitation and community dynamics',
              resources: ['meeting spaces', 'facilitation materials', 'cultural protocols'],
              output: 'Community perspectives and group dynamics insights',
              when: 'Community understanding phase'
            }
          },
          {
            id: 'self-documentation',
            name: 'Self-Documentation',
            description: 'Tools for community members to document their own experiences',
            category: 'Research',
            icon: 'Camera',
            characteristics: {
              effort: 'Medium',
              expertise: 'Tool design and community training',
              resources: ['documentation tools', 'training materials', 'ongoing support'],
              output: 'Authentic self-reported experiences and perspectives',
              when: 'Empowering community voice'
            }
          },
          {
            id: 'guided-tours',
            name: 'Guided Tours',
            description: 'Community members show researchers their environment and daily routines',
            category: 'Research',
            icon: 'Map',
            characteristics: {
              effort: 'Medium',
              expertise: 'Observational skills and environmental analysis',
              resources: ['time allocation', 'documentation tools', 'respectful protocols'],
              output: 'Environmental insights and spatial understanding',
              when: 'Context exploration phase'
            }
          }
        ]
      },
      {
        id: 'create',
        name: 'Create',
        description: 'Turn insights into innovative solutions through collaborative ideation',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '3-6 weeks',
          participants: 'Design team, community representatives, stakeholders',
          deliverables: 'Solution concepts, prototypes, tested ideas',
          skills: ['ideation', 'co-creation', 'prototyping', 'iteration'],
          dependencies: ['synthesized insights', 'community partnership', 'creative resources']
        },
        tools: [
          {
            id: 'downloadable-insights',
            name: 'Downloadable Insights',
            description: 'Extract key insights and patterns from research for ideation',
            category: 'Analysis',
            icon: 'Download',
            characteristics: {
              effort: 'Medium',
              expertise: 'Insight synthesis and pattern recognition',
              resources: ['analysis tools', 'synthesis frameworks', 'collaborative spaces'],
              output: 'Clear, actionable insights and opportunity areas',
              when: 'Transition from research to ideation'
            }
          },
          {
            id: 'brainstorm-solutions',
            name: 'Brainstorm Solutions',
            description: 'Generate diverse solution ideas based on insights',
            category: 'Ideation',
            icon: 'Lightbulb',
            characteristics: {
              effort: 'Medium',
              expertise: 'Creative facilitation and solution development',
              resources: ['ideation materials', 'diverse perspectives', 'creative environments'],
              output: 'Wide range of potential solution concepts',
              when: 'Solution generation phase'
            }
          },
          {
            id: 'bundle-ideas',
            name: 'Bundle Ideas',
            description: 'Group related ideas into coherent solution concepts',
            category: 'Analysis',
            icon: 'Package',
            characteristics: {
              effort: 'Low',
              expertise: 'Categorization and conceptual thinking',
              resources: ['idea organization tools', 'grouping materials'],
              output: 'Organized solution concepts and themes',
              when: 'Idea synthesis and organization'
            }
          },
          {
            id: 'make-prototypes',
            name: 'Make Prototypes',
            description: 'Create tangible representations of solution concepts',
            category: 'Prototyping',
            icon: 'Wrench',
            characteristics: {
              effort: 'High',
              expertise: 'Prototyping and making skills',
              resources: ['prototyping materials', 'making tools', 'testing environments'],
              output: 'Testable prototypes and tangible concepts',
              when: 'Solution development and testing'
            }
          },
          {
            id: 'get-feedback',
            name: 'Get Feedback',
            description: 'Test prototypes with community members and gather input',
            category: 'Testing',
            icon: 'MessageSquare',
            characteristics: {
              effort: 'Medium',
              expertise: 'Feedback facilitation and community engagement',
              resources: ['feedback tools', 'community access', 'testing protocols'],
              output: 'Community feedback and solution validation',
              when: 'Prototype testing and refinement'
            }
          }
        ]
      },
      {
        id: 'deliver',
        name: 'Deliver',
        description: 'Implement solutions with financial sustainability and long-term impact',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '6-12 weeks',
          participants: 'Implementation team, community, local organizations',
          deliverables: 'Launched solution, sustainability plan, impact measurement',
          skills: ['implementation', 'business planning', 'community mobilization', 'impact measurement'],
          dependencies: ['validated solution', 'implementation resources', 'community buy-in']
        },
        tools: [
          {
            id: 'revenue-streams',
            name: 'Revenue Streams',
            description: 'Develop sustainable business models and funding approaches',
            category: 'Business',
            icon: 'DollarSign',
            characteristics: {
              effort: 'High',
              expertise: 'Business model development and financial planning',
              resources: ['financial modeling tools', 'market research', 'stakeholder input'],
              output: 'Viable business model and revenue strategy',
              when: 'Sustainability planning phase'
            }
          },
          {
            id: 'capabilities-assessment',
            name: 'Capabilities Assessment',
            description: 'Evaluate organizational capacity for solution delivery',
            category: 'Analysis',
            icon: 'CheckCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Organizational assessment and capacity building',
              resources: ['assessment frameworks', 'organizational analysis tools'],
              output: 'Capacity assessment and development plan',
              when: 'Implementation planning phase'
            }
          },
          {
            id: 'implementation-timeline',
            name: 'Implementation Timeline',
            description: 'Create detailed timeline for solution rollout and scaling',
            category: 'Planning',
            icon: 'Calendar',
            characteristics: {
              effort: 'Medium',
              expertise: 'Project planning and timeline management',
              resources: ['planning tools', 'resource allocation', 'stakeholder coordination'],
              output: 'Detailed implementation plan and timeline',
              when: 'Launch preparation phase'
            }
          },
          {
            id: 'pilot-implementation',
            name: 'Pilot Implementation',
            description: 'Launch small-scale version to test and refine before full rollout',
            category: 'Implementation',
            icon: 'PlayCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Pilot program management and evaluation',
              resources: ['pilot resources', 'monitoring systems', 'feedback mechanisms'],
              output: 'Pilot results and refinement recommendations',
              when: 'Initial solution launch'
            }
          },
          {
            id: 'impact-measurement',
            name: 'Impact Measurement',
            description: 'Track and measure solution impact on target community',
            category: 'Measurement',
            icon: 'BarChart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Impact assessment and data analysis',
              resources: ['measurement tools', 'data collection systems', 'analysis capabilities'],
              output: 'Impact metrics and success indicators',
              when: 'Post-launch evaluation and iteration'
            }
          }
        ]
      }
    ]
  },

  // 5. JOBS-TO-BE-DONE - Complete with all 3 stages (Job Mapping, Outcomes, Solutions)
  {
    id: 'jobs-to-be-done',
    name: 'Jobs-to-Be-Done',
    description: 'Clayton Christensen methodology focusing on customer job completion',
    color: '#8B5CF6',
    characteristics: {
      focus: 'Customer job completion and outcomes',
      timeline: '2-4 months',
      complexity: 'Medium',
      teamSize: '3-6 people',
      outcome: 'Job-centered solutions and innovations'
    },
    stages: [
      {
        id: 'job-mapping',
        name: 'Job Mapping',
        description: 'Map the complete customer job process and context',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Researchers, product team, customer representatives',
          deliverables: 'Job maps, job statements, customer journey analysis',
          skills: ['job analysis', 'process mapping', 'customer research', 'journey mapping'],
          dependencies: ['customer access', 'job definition', 'research resources']
        },
        tools: [
          {
            id: 'job-steps',
            name: 'Job Steps Analysis',
            description: 'Break down customer job into discrete, sequential steps',
            category: 'Analysis',
            icon: 'List',
            characteristics: {
              effort: 'High',
              expertise: 'Process analysis and customer job understanding',
              resources: ['customer interviews', 'observation data', 'analysis frameworks'],
              output: 'Detailed job step documentation and process maps',
              when: 'Initial job understanding phase'
            }
          },
          {
            id: 'job-statements',
            name: 'Job Statements',
            description: 'Define customer jobs in functional language and context',
            category: 'Definition',
            icon: 'FileText',
            characteristics: {
              effort: 'Medium',
              expertise: 'Job definition and functional language development',
              resources: ['customer research', 'job statement templates', 'validation methods'],
              output: 'Clear, functional job statements and definitions',
              when: 'Job definition and validation phase'
            }
          },
          {
            id: 'job-context-analysis',
            name: 'Job Context Analysis',
            description: 'Understand when, where, and why customers perform jobs',
            category: 'Research',
            icon: 'MapPin',
            characteristics: {
              effort: 'Medium',
              expertise: 'Contextual analysis and situational research',
              resources: ['contextual inquiry', 'environmental mapping', 'situational data'],
              output: 'Comprehensive job context understanding',
              when: 'Environmental and situational analysis'
            }
          },
          {
            id: 'emotional-job-mapping',
            name: 'Emotional Job Mapping',
            description: 'Map emotional and social dimensions of customer jobs',
            category: 'Analysis',
            icon: 'Heart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Emotional analysis and social dynamics understanding',
              resources: ['emotional research methods', 'social mapping tools'],
              output: 'Emotional and social job dimension maps',
              when: 'Comprehensive job understanding phase'
            }
          }
        ]
      },
      {
        id: 'outcomes',
        name: 'Outcomes',
        description: 'Define desired outcomes and success metrics for each job step',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Product team, customers, outcome measurement specialists',
          deliverables: 'Outcome statements, success metrics, opportunity areas',
          skills: ['outcome definition', 'metrics development', 'opportunity assessment'],
          dependencies: ['job map completion', 'customer validation', 'measurement capabilities']
        },
        tools: [
          {
            id: 'outcome-statements',
            name: 'Outcome Statements',
            description: 'Define measurable desired outcomes for each job step',
            category: 'Definition',
            icon: 'Target',
            characteristics: {
              effort: 'High',
              expertise: 'Outcome definition and measurement design',
              resources: ['outcome frameworks', 'customer input', 'measurement tools'],
              output: 'Clear, measurable outcome statements',
              when: 'Outcome definition phase'
            }
          },
          {
            id: 'opportunity-scoring',
            name: 'Opportunity Scoring',
            description: 'Score outcomes based on importance and satisfaction gaps',
            category: 'Analysis',
            icon: 'TrendingUp',
            characteristics: {
              effort: 'Medium',
              expertise: 'Quantitative analysis and opportunity assessment',
              resources: ['scoring frameworks', 'customer surveys', 'analysis tools'],
              output: 'Prioritized opportunity areas and innovation targets',
              when: 'Opportunity identification and prioritization'
            }
          },
          {
            id: 'underserved-outcomes',
            name: 'Underserved Outcomes',
            description: 'Identify outcomes that are important but poorly satisfied',
            category: 'Analysis',
            icon: 'AlertTriangle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Gap analysis and innovation opportunity identification',
              resources: ['satisfaction measurement', 'importance rating', 'gap analysis tools'],
              output: 'Underserved outcome identification and innovation opportunities',
              when: 'Innovation opportunity discovery'
            }
          },
          {
            id: 'outcome-validation',
            name: 'Outcome Validation',
            description: 'Validate outcome importance and current satisfaction with customers',
            category: 'Research',
            icon: 'CheckCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Customer research and validation methods',
              resources: ['validation surveys', 'customer interviews', 'statistical analysis'],
              output: 'Validated outcome importance and satisfaction data',
              when: 'Outcome validation and confirmation'
            }
          }
        ]
      },
      {
        id: 'solutions',
        name: 'Solutions',
        description: 'Design solutions that help customers achieve desired outcomes',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '3-6 weeks',
          participants: 'Product team, designers, developers, customers',
          deliverables: 'Solution concepts, job-centered designs, validation results',
          skills: ['solution design', 'job-centered innovation', 'outcome optimization'],
          dependencies: ['outcome priorities', 'solution resources', 'validation capabilities']
        },
        tools: [
          {
            id: 'solution-ideation',
            name: 'Job-Centered Solution Ideation',
            description: 'Generate solutions focused on helping customers get jobs done better',
            category: 'Ideation',
            icon: 'Lightbulb',
            characteristics: {
              effort: 'Medium',
              expertise: 'Job-centered thinking and solution development',
              resources: ['ideation frameworks', 'job insights', 'creative tools'],
              output: 'Job-focused solution concepts and ideas',
              when: 'Solution generation phase'
            }
          },
          {
            id: 'outcome-driven-features',
            name: 'Outcome-Driven Features',
            description: 'Design features that directly address underserved outcomes',
            category: 'Design',
            icon: 'Settings',
            characteristics: {
              effort: 'High',
              expertise: 'Feature design and outcome optimization',
              resources: ['design tools', 'outcome data', 'development resources'],
              output: 'Features designed to improve specific outcomes',
              when: 'Feature definition and design'
            }
          },
          {
            id: 'job-story-creation',
            name: 'Job Story Creation',
            description: 'Create job stories that guide solution development',
            category: 'Planning',
            icon: 'BookOpen',
            characteristics: {
              effort: 'Medium',
              expertise: 'Job story development and narrative design',
              resources: ['story templates', 'job context data', 'outcome information'],
              output: 'Compelling job stories and development guidance',
              when: 'Solution planning and development guidance'
            }
          },
          {
            id: 'solution-validation',
            name: 'Job-Centered Solution Validation',
            description: 'Test solutions against job completion effectiveness',
            category: 'Testing',
            icon: 'TestTube',
            characteristics: {
              effort: 'High',
              expertise: 'Job-centered testing and outcome measurement',
              resources: ['testing environments', 'outcome metrics', 'customer access'],
              output: 'Solution effectiveness and job completion improvement data',
              when: 'Solution testing and optimization'
            }
          }
        ]
      }
    ]
  },

  // 6. LEAN UX - Complete with all 3 stages (Hypothesize, Experiment, Learn)
  {
    id: 'lean-ux',
    name: 'Lean UX',
    description: 'Jeff Gothelf methodology combining Lean Startup principles with UX design',
    color: '#06B6D4',
    characteristics: {
      focus: 'Rapid experimentation and validated learning',
      timeline: '2-4 months (iterative cycles)',
      complexity: 'Medium',
      teamSize: '3-8 people',
      outcome: 'Validated design decisions and user insights'
    },
    stages: [
      {
        id: 'hypothesize',
        name: 'Hypothesize',
        description: 'Form testable assumptions about users, business, and solutions',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1-2 weeks',
          participants: 'Product team, stakeholders, domain experts',
          deliverables: 'Hypothesis statements, assumptions map, experiment plan',
          skills: ['hypothesis formation', 'assumption mapping', 'risk assessment', 'experiment design'],
          dependencies: ['problem understanding', 'team alignment', 'baseline metrics']
        },
        tools: [
          {
            id: 'hypothesis-canvas',
            name: 'Hypothesis Canvas',
            description: 'Structure testable assumptions using problem/solution/outcome format',
            category: 'Strategy',
            icon: 'TestTube2',
            characteristics: {
              effort: 'Medium',
              expertise: 'Hypothesis formation and structured thinking',
              resources: ['hypothesis templates', 'team collaboration tools', 'assumption frameworks'],
              output: 'Clear, testable hypothesis statements',
              when: 'Beginning of each iteration cycle'
            }
          },
          {
            id: 'assumption-mapping',
            name: 'Assumption Mapping',
            description: 'Map and prioritize assumptions based on risk and knowledge',
            category: 'Analysis',
            icon: 'Map',
            characteristics: {
              effort: 'Medium',
              expertise: 'Risk assessment and assumption analysis',
              resources: ['mapping tools', 'prioritization frameworks', 'team input'],
              output: 'Prioritized assumption map and testing roadmap',
              when: 'Hypothesis prioritization phase'
            }
          },
          {
            id: 'proto-personas',
            name: 'Proto-Personas',
            description: 'Create provisional personas based on assumptions to be validated',
            category: 'Research',
            icon: 'UserCircle',
            characteristics: {
              effort: 'Low',
              expertise: 'User modeling and persona creation',
              resources: ['persona templates', 'assumption data', 'team knowledge'],
              output: 'Provisional user personas for testing',
              when: 'User assumption definition'
            }
          },
          {
            id: 'problem-statements-lean',
            name: 'Problem Statements',
            description: 'Define clear problem statements based on assumptions',
            category: 'Strategy',
            icon: 'Target',
            characteristics: {
              effort: 'Low',
              expertise: 'Problem definition and strategic thinking',
              resources: ['problem templates', 'user assumptions', 'business context'],
              output: 'Clear problem definitions for validation',
              when: 'Problem assumption formulation'
            }
          }
        ]
      },
      {
        id: 'experiment',
        name: 'Experiment',
        description: 'Design and run experiments to test hypotheses rapidly',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Design team, developers, researchers, test users',
          deliverables: 'MVPs, prototypes, experiment results, user feedback',
          skills: ['experiment design', 'rapid prototyping', 'user testing', 'data collection'],
          dependencies: ['clear hypotheses', 'testing resources', 'user access', 'measurement tools']
        },
        tools: [
          {
            id: 'mvp-creation',
            name: 'MVP Creation',
            description: 'Build minimum viable products to test core assumptions',
            category: 'Prototyping',
            icon: 'Rocket',
            characteristics: {
              effort: 'High',
              expertise: 'Rapid development and MVP design',
              resources: ['development tools', 'prototyping resources', 'testing environments'],
              output: 'Functional MVPs for user testing',
              when: 'Solution hypothesis testing'
            }
          },
          {
            id: 'split-testing',
            name: 'A/B Split Testing',
            description: 'Test different variations to validate design decisions',
            category: 'Testing',
            icon: 'GitBranch',
            characteristics: {
              effort: 'Medium',
              expertise: 'Experimental design and statistical analysis',
              resources: ['testing platforms', 'traffic splitting', 'analytics tools'],
              output: 'Statistically significant test results',
              when: 'Comparative hypothesis testing'
            }
          },
          {
            id: 'fake-door-testing',
            name: 'Fake Door Testing',
            description: 'Test feature demand before building full functionality',
            category: 'Testing',
            icon: 'DoorOpen',
            characteristics: {
              effort: 'Low',
              expertise: 'Demand testing and user behavior analysis',
              resources: ['landing page tools', 'analytics tracking', 'user communication'],
              output: 'Feature demand validation and user interest metrics',
              when: 'Feature demand hypothesis testing'
            }
          },
          {
            id: 'usability-testing-lean',
            name: 'Rapid Usability Testing',
            description: 'Quick usability tests with minimal setup and maximum learning',
            category: 'Testing',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Rapid testing and insight extraction',
              resources: ['testing tools', 'user access', 'observation methods'],
              output: 'Quick usability insights and behavior observations',
              when: 'Usability hypothesis validation'
            }
          },
          {
            id: 'wizard-of-oz',
            name: 'Wizard of Oz Testing',
            description: 'Simulate functionality manually to test user behavior',
            category: 'Testing',
            icon: 'Wand2',
            characteristics: {
              effort: 'Medium',
              expertise: 'Service simulation and user interaction design',
              resources: ['manual process setup', 'user interaction tools', 'backend simulation'],
              output: 'User behavior insights without full development',
              when: 'Complex functionality hypothesis testing'
            }
          }
        ]
      },
      {
        id: 'learn',
        name: 'Learn',
        description: 'Analyze results and apply learnings to inform next iteration',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '1-2 weeks',
          participants: 'Full team, stakeholders, data analysts',
          deliverables: 'Learning synthesis, validated insights, next iteration plan',
          skills: ['data analysis', 'insight synthesis', 'decision making', 'iteration planning'],
          dependencies: ['experiment completion', 'data collection', 'analysis tools', 'team reflection']
        },
        tools: [
          {
            id: 'learning-synthesis',
            name: 'Learning Synthesis',
            description: 'Synthesize experiment results into actionable insights',
            category: 'Analysis',
            icon: 'Brain',
            characteristics: {
              effort: 'High',
              expertise: 'Data analysis and insight synthesis',
              resources: ['analysis tools', 'synthesis frameworks', 'collaboration spaces'],
              output: 'Clear learning statements and validated insights',
              when: 'Post-experiment analysis phase'
            }
          },
          {
            id: 'validated-learning',
            name: 'Validated Learning',
            description: 'Document what was learned and what assumptions were validated',
            category: 'Documentation',
            icon: 'CheckCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Learning documentation and knowledge capture',
              resources: ['documentation tools', 'learning templates', 'validation criteria'],
              output: 'Documented validated learning and assumption updates',
              when: 'Learning capture and documentation'
            }
          },
          {
            id: 'pivot-or-persevere',
            name: 'Pivot or Persevere Decision',
            description: 'Decide whether to continue current direction or pivot based on learning',
            category: 'Strategy',
            icon: 'RotateCcw',
            characteristics: {
              effort: 'Medium',
              expertise: 'Strategic decision making and direction setting',
              resources: ['decision frameworks', 'learning analysis', 'stakeholder input'],
              output: 'Clear strategic direction and rationale',
              when: 'Strategic direction assessment'
            }
          },
          {
            id: 'next-iteration-planning',
            name: 'Next Iteration Planning',
            description: 'Plan next cycle based on validated learning and new hypotheses',
            category: 'Planning',
            icon: 'RefreshCw',
            characteristics: {
              effort: 'Medium',
              expertise: 'Iterative planning and hypothesis evolution',
              resources: ['planning tools', 'learning insights', 'team coordination'],
              output: 'Next iteration plan and updated hypotheses',
              when: 'Cycle transition and planning'
            }
          },
          {
            id: 'metrics-review',
            name: 'Metrics Review',
            description: 'Review key metrics and success criteria based on learning',
            category: 'Measurement',
            icon: 'BarChart3',
            characteristics: {
              effort: 'Medium',
              expertise: 'Metrics analysis and performance assessment',
              resources: ['analytics tools', 'measurement frameworks', 'performance data'],
              output: 'Metrics insights and measurement plan updates',
              when: 'Performance assessment and metrics evolution'
            }
          }
        ]
      }
    ]
  },

  // 7. AGILE UX - Complete with all 5 stages (Plan, Design, Build, Test, Iterate)
  {
    id: 'agile-ux',
    name: 'Agile UX',
    description: 'UX methodology integrated with Agile development processes',
    color: '#8B5CF6',
    characteristics: {
      focus: 'Continuous UX improvement in Agile sprints',
      timeline: 'Ongoing (2-week sprint cycles)',
      complexity: 'Medium-High',
      teamSize: '4-12 people',
      outcome: 'Continuously improved user experience'
    },
    stages: [
      {
        id: 'plan',
        name: 'Plan',
        description: 'Plan UX work within sprint cycles and align with development',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1-2 days',
          participants: 'UX team, product owner, scrum master, developers',
          deliverables: 'Sprint UX goals, task breakdown, design requirements',
          skills: ['sprint planning', 'task estimation', 'prioritization', 'team coordination'],
          dependencies: ['product backlog', 'sprint goals', 'team capacity', 'user research insights']
        },
        tools: [
          {
            id: 'user-story-mapping',
            name: 'User Story Mapping',
            description: 'Map user journey to features and development tasks',
            category: 'Planning',
            icon: 'MapPin',
            characteristics: {
              effort: 'High',
              expertise: 'Story mapping and journey visualization',
              resources: ['mapping tools', 'user journey data', 'feature requirements'],
              output: 'Visual user story maps and feature prioritization',
              when: 'Sprint and release planning'
            }
          },
          {
            id: 'design-debt-tracking',
            name: 'Design Debt Tracking',
            description: 'Track and prioritize UX improvements and design technical debt',
            category: 'Planning',
            icon: 'AlertCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design quality assessment and debt management',
              resources: ['tracking tools', 'design audits', 'prioritization frameworks'],
              output: 'Design debt backlog and improvement roadmap',
              when: 'Continuous design quality management'
            }
          },
          {
            id: 'ux-sprint-goals',
            name: 'UX Sprint Goals',
            description: 'Define specific UX objectives for each sprint cycle',
            category: 'Planning',
            icon: 'Target',
            characteristics: {
              effort: 'Low',
              expertise: 'Goal setting and UX strategy alignment',
              resources: ['goal templates', 'success metrics', 'team input'],
              output: 'Clear UX objectives and success criteria for sprint',
              when: 'Sprint planning and goal setting'
            }
          },
          {
            id: 'design-system-planning',
            name: 'Design System Planning',
            description: 'Plan design system contributions and updates for sprint',
            category: 'Planning',
            icon: 'Package',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design system management and component planning',
              resources: ['design system tools', 'component libraries', 'usage analytics'],
              output: 'Design system roadmap and component development plan',
              when: 'Design system evolution and maintenance'
            }
          }
        ]
      },
      {
        id: 'design',
        name: 'Design',
        description: 'Create designs that integrate with development workflow',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '3-8 days (parallel to development)',
          participants: 'UX designers, UI designers, developers, product owner',
          deliverables: 'Designs, prototypes, specifications, design system updates',
          skills: ['rapid design', 'design systems', 'developer collaboration', 'specification creation'],
          dependencies: ['design requirements', 'technical constraints', 'design system', 'user research']
        },
        tools: [
          {
            id: 'design-sprints-micro',
            name: 'Micro Design Sprints',
            description: 'Shortened design sprints focused on specific features or problems',
            category: 'Design',
            icon: 'Zap',
            characteristics: {
              effort: 'High',
              expertise: 'Rapid design thinking and sprint facilitation',
              resources: ['sprint materials', 'time-boxed sessions', 'cross-functional team'],
              output: 'Quick design solutions and validated concepts',
              when: 'Feature design and problem solving'
            }
          },
          {
            id: 'component-design',
            name: 'Component Design',
            description: 'Design reusable components for design system and development',
            category: 'Design',
            icon: 'Puzzle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Component thinking and design system development',
              resources: ['design tools', 'component libraries', 'developer collaboration'],
              output: 'Reusable design components and specifications',
              when: 'Design system building and feature development'
            }
          },
          {
            id: 'collaborative-design',
            name: 'Collaborative Design Sessions',
            description: 'Real-time design sessions with developers and stakeholders',
            category: 'Design',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Collaborative design and facilitation',
              resources: ['collaborative tools', 'shared design spaces', 'real-time communication'],
              output: 'Collaboratively created designs and shared understanding',
              when: 'Cross-functional design and problem solving'
            }
          },
          {
            id: 'responsive-design',
            name: 'Responsive Design',
            description: 'Design adaptive experiences across devices and screen sizes',
            category: 'Design',
            icon: 'Monitor',
            characteristics: {
              effort: 'High',
              expertise: 'Responsive design and multi-device thinking',
              resources: ['design tools', 'device testing', 'responsive frameworks'],
              output: 'Multi-device design solutions and specifications',
              when: 'Cross-platform feature development'
            }
          }
        ]
      },
      {
        id: 'build',
        name: 'Build',
        description: 'Collaborate with development during implementation phase',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '5-10 days (parallel to design)',
          participants: 'Developers, UX designers, QA testers',
          deliverables: 'Implemented features, design QA, developer guidance',
          skills: ['design QA', 'developer collaboration', 'implementation guidance', 'design handoff'],
          dependencies: ['finalized designs', 'developer resources', 'technical specifications']
        },
        tools: [
          {
            id: 'design-handoff',
            name: 'Design Handoff',
            description: 'Systematic transfer of designs to development with specifications',
            category: 'Collaboration',
            icon: 'ArrowRight',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design specification and developer communication',
              resources: ['handoff tools', 'specification templates', 'design assets'],
              output: 'Complete design specifications and developer resources',
              when: 'Design to development transition'
            }
          },
          {
            id: 'design-qa',
            name: 'Design QA',
            description: 'Quality assurance review of implemented designs',
            category: 'Quality',
            icon: 'CheckSquare',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design quality assessment and feedback',
              resources: ['QA tools', 'design comparison', 'testing devices'],
              output: 'Design implementation feedback and improvement recommendations',
              when: 'Implementation review and quality assurance'
            }
          },
          {
            id: 'developer-pairing',
            name: 'Developer Pairing',
            description: 'Work directly with developers during complex implementation',
            category: 'Collaboration',
            icon: 'Code',
            characteristics: {
              effort: 'High',
              expertise: 'Technical collaboration and problem solving',
              resources: ['development environment access', 'pairing tools', 'shared workspace'],
              output: 'High-quality implementation and shared technical understanding',
              when: 'Complex feature implementation'
            }
          },
          {
            id: 'implementation-documentation',
            name: 'Implementation Documentation',
            description: 'Document design decisions and implementation guidance',
            category: 'Documentation',
            icon: 'FileText',
            characteristics: {
              effort: 'Low',
              expertise: 'Technical writing and design documentation',
              resources: ['documentation tools', 'design rationale', 'implementation notes'],
              output: 'Implementation guides and design decision records',
              when: 'Knowledge capture and team learning'
            }
          }
        ]
      },
      {
        id: 'test',
        name: 'Test',
        description: 'Test implemented features with users and stakeholders',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '2-5 days',
          participants: 'UX researchers, users, QA testers, stakeholders',
          deliverables: 'Test results, user feedback, improvement recommendations',
          skills: ['rapid testing', 'feedback collection', 'usability assessment', 'data analysis'],
          dependencies: ['implemented features', 'test users', 'testing environment', 'measurement tools']
        },
        tools: [
          {
            id: 'guerrilla-testing',
            name: 'Guerrilla Testing',
            description: 'Quick, informal usability testing with minimal setup',
            category: 'Testing',
            icon: 'Zap',
            characteristics: {
              effort: 'Low',
              expertise: 'Rapid testing and informal research',
              resources: ['mobile testing setup', 'quick access to users', 'simple recording'],
              output: 'Quick usability insights and immediate feedback',
              when: 'Fast feedback and early validation'
            }
          },
          {
            id: 'stakeholder-review',
            name: 'Stakeholder Review',
            description: 'Structured review sessions with key stakeholders',
            category: 'Testing',
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Stakeholder management and presentation',
              resources: ['presentation tools', 'demo environment', 'feedback collection'],
              output: 'Stakeholder feedback and approval or change requests',
              when: 'Stakeholder validation and buy-in'
            }
          },
          {
            id: 'analytics-review',
            name: 'Analytics Review',
            description: 'Review user behavior analytics for implemented features',
            category: 'Measurement',
            icon: 'BarChart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Analytics interpretation and behavioral analysis',
              resources: ['analytics tools', 'data dashboards', 'reporting systems'],
              output: 'User behavior insights and performance metrics',
              when: 'Post-implementation performance assessment'
            }
          },
          {
            id: 'accessibility-testing',
            name: 'Accessibility Testing',
            description: 'Test features for accessibility compliance and usability',
            category: 'Testing',
            icon: 'Eye',
            characteristics: {
              effort: 'Medium',
              expertise: 'Accessibility standards and assistive technology',
              resources: ['accessibility tools', 'screen readers', 'testing guidelines'],
              output: 'Accessibility assessment and compliance recommendations',
              when: 'Inclusive design validation'
            }
          }
        ]
      },
      {
        id: 'iterate',
        name: 'Iterate',
        description: 'Apply learnings and continuously improve based on feedback',
        position: { x: 800, y: 0 },
        characteristics: {
          duration: '1-3 days',
          participants: 'Full team, stakeholders, product owner',
          deliverables: 'Iteration plan, backlog updates, improvement roadmap',
          skills: ['retrospective analysis', 'continuous improvement', 'backlog management', 'team learning'],
          dependencies: ['test results', 'team feedback', 'stakeholder input', 'iteration capacity']
        },
        tools: [
          {
            id: 'sprint-retrospective',
            name: 'UX Sprint Retrospective',
            description: 'Reflect on UX work and identify improvements for next sprint',
            category: 'Process',
            icon: 'RotateCcw',
            characteristics: {
              effort: 'Medium',
              expertise: 'Retrospective facilitation and team improvement',
              resources: ['retrospective formats', 'feedback tools', 'improvement frameworks'],
              output: 'Process improvements and team learning outcomes',
              when: 'End of sprint reflection and planning'
            }
          },
          {
            id: 'backlog-refinement',
            name: 'UX Backlog Refinement',
            description: 'Update UX backlog based on learnings and new priorities',
            category: 'Planning',
            icon: 'List',
            characteristics: {
              effort: 'Medium',
              expertise: 'Backlog management and UX prioritization',
              resources: ['backlog tools', 'prioritization criteria', 'team input'],
              output: 'Refined UX backlog and updated priorities',
              when: 'Continuous backlog maintenance and planning'
            }
          },
          {
            id: 'continuous-research',
            name: 'Continuous Research Planning',
            description: 'Plan ongoing research based on sprint learnings and gaps',
            category: 'Research',
            icon: 'Search',
            characteristics: {
              effort: 'Low',
              expertise: 'Research planning and gap analysis',
              resources: ['research tools', 'knowledge gaps assessment', 'user access'],
              output: 'Research plan and continuous learning strategy',
              when: 'Ongoing research planning and execution'
            }
          },
          {
            id: 'design-system-updates',
            name: 'Design System Updates',
            description: 'Update design system based on sprint learnings and new patterns',
            category: 'Design',
            icon: 'RefreshCw',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design system evolution and pattern recognition',
              resources: ['design system tools', 'pattern libraries', 'usage data'],
              output: 'Updated design system and improved patterns',
              when: 'Design system maintenance and evolution'
            }
          }
        ]
      }
    ]
  },

  // 8. HEART FRAMEWORK - Complete with all 5 stages (Happiness, Engagement, Adoption, Retention, Task Success)
  {
    id: 'heart-framework',
    name: 'HEART Framework',
    description: 'Google UX measurement framework for comprehensive user experience metrics',
    color: '#EF4444',
    characteristics: {
      focus: 'UX measurement and metrics-driven improvement',
      timeline: '2-6 months (ongoing measurement)',
      complexity: 'Medium-High',
      teamSize: '3-8 people',
      outcome: 'Data-driven UX insights and continuous improvement'
    },
    stages: [
      {
        id: 'happiness',
        name: 'Happiness',
        description: 'Measure user satisfaction, attitudes, and perceived quality of experience',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks setup + ongoing',
          participants: 'UX researchers, data analysts, product team',
          deliverables: 'Satisfaction metrics, user sentiment data, happiness trends',
          skills: ['survey design', 'sentiment analysis', 'data interpretation', 'user feedback collection'],
          dependencies: ['user access', 'measurement tools', 'baseline data']
        },
        tools: [
          {
            id: 'nps-surveys',
            name: 'Net Promoter Score (NPS)',
            description: 'Measure user loyalty and likelihood to recommend',
            category: 'Measurement',
            icon: 'Heart',
            characteristics: {
              effort: 'Low',
              expertise: 'Survey design and NPS analysis',
              resources: ['survey tools', 'user contact list', 'analysis platforms'],
              output: 'NPS scores and user loyalty insights',
              when: 'Regular intervals and post-experience'
            }
          },
          {
            id: 'satisfaction-surveys',
            name: 'User Satisfaction Surveys',
            description: 'Detailed surveys to understand user satisfaction drivers',
            category: 'Measurement',
            icon: 'ClipboardList',
            characteristics: {
              effort: 'Medium',
              expertise: 'Survey methodology and satisfaction measurement',
              resources: ['survey platforms', 'question libraries', 'statistical analysis tools'],
              output: 'Comprehensive satisfaction data and improvement areas',
              when: 'Post-interaction and periodic assessment'
            }
          },
          {
            id: 'sentiment-analysis',
            name: 'Sentiment Analysis',
            description: 'Analyze user reviews, feedback, and social mentions for sentiment',
            category: 'Analysis',
            icon: 'MessageCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Text analysis and sentiment interpretation',
              resources: ['sentiment analysis tools', 'text data sources', 'natural language processing'],
              output: 'Sentiment trends and emotional response insights',
              when: 'Continuous monitoring and analysis'
            }
          },
          {
            id: 'app-store-ratings',
            name: 'App Store Ratings Analysis',
            description: 'Monitor and analyze app store ratings and reviews',
            category: 'Measurement',
            icon: 'Star',
            characteristics: {
              effort: 'Low',
              expertise: 'Rating analysis and review interpretation',
              resources: ['app store analytics', 'review monitoring tools'],
              output: 'Rating trends and user feedback insights',
              when: 'Continuous monitoring and regular reporting'
            }
          }
        ]
      },
      {
        id: 'engagement',
        name: 'Engagement',
        description: 'Measure user activity levels and depth of product interaction',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '1-2 weeks setup + ongoing',
          participants: 'Data analysts, product managers, UX team',
          deliverables: 'Engagement metrics, usage patterns, activity trends',
          skills: ['analytics setup', 'user behavior analysis', 'engagement measurement'],
          dependencies: ['analytics tools', 'tracking implementation', 'user activity data']
        },
        tools: [
          {
            id: 'session-analytics',
            name: 'Session Analytics',
            description: 'Track session length, frequency, and user activity patterns',
            category: 'Analytics',
            icon: 'Clock',
            characteristics: {
              effort: 'Medium',
              expertise: 'Analytics setup and session analysis',
              resources: ['analytics platforms', 'tracking implementation', 'data visualization'],
              output: 'Session insights and usage pattern analysis',
              when: 'Continuous tracking and regular analysis'
            }
          },
          {
            id: 'feature-usage-tracking',
            name: 'Feature Usage Tracking',
            description: 'Measure which features users engage with most frequently',
            category: 'Analytics',
            icon: 'BarChart3',
            characteristics: {
              effort: 'High',
              expertise: 'Feature tracking and usage analysis',
              resources: ['event tracking tools', 'feature instrumentation', 'analytics dashboards'],
              output: 'Feature popularity and usage insights',
              when: 'Feature release and ongoing optimization'
            }
          },
          {
            id: 'user-flow-analysis',
            name: 'User Flow Analysis',
            description: 'Analyze common user paths and navigation patterns',
            category: 'Analytics',
            icon: 'GitBranch',
            characteristics: {
              effort: 'Medium',
              expertise: 'Flow analysis and path visualization',
              resources: ['user flow tools', 'path analysis software', 'funnel tracking'],
              output: 'User journey insights and navigation optimization opportunities',
              when: 'User journey optimization and flow improvement'
            }
          },
          {
            id: 'content-engagement',
            name: 'Content Engagement Metrics',
            description: 'Track user interaction with content, uploads, shares, and contributions',
            category: 'Analytics',
            icon: 'Share2',
            characteristics: {
              effort: 'Medium',
              expertise: 'Content analytics and engagement measurement',
              resources: ['content tracking tools', 'social analytics', 'interaction monitoring'],
              output: 'Content performance and user contribution insights',
              when: 'Content strategy optimization and community building'
            }
          }
        ]
      },
      {
        id: 'adoption',
        name: 'Adoption',
        description: 'Measure new user acquisition and feature adoption rates',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '1-2 weeks setup + ongoing',
          participants: 'Product managers, marketing team, data analysts',
          deliverables: 'Adoption metrics, conversion rates, onboarding effectiveness',
          skills: ['conversion tracking', 'cohort analysis', 'adoption measurement'],
          dependencies: ['user acquisition data', 'conversion tracking', 'feature usage analytics']
        },
        tools: [
          {
            id: 'new-user-onboarding',
            name: 'New User Onboarding Metrics',
            description: 'Track how effectively new users complete initial setup and first use',
            category: 'Analytics',
            icon: 'UserPlus',
            characteristics: {
              effort: 'High',
              expertise: 'Onboarding analysis and conversion tracking',
              resources: ['funnel tracking', 'onboarding analytics', 'user journey mapping'],
              output: 'Onboarding success rates and improvement opportunities',
              when: 'Onboarding optimization and new user experience improvement'
            }
          },
          {
            id: 'feature-adoption-rates',
            name: 'Feature Adoption Rates',
            description: 'Measure percentage of users who adopt new features',
            category: 'Analytics',
            icon: 'TrendingUp',
            characteristics: {
              effort: 'Medium',
              expertise: 'Feature adoption analysis and trend tracking',
              resources: ['feature tracking', 'adoption analytics', 'cohort analysis tools'],
              output: 'Feature adoption insights and launch effectiveness',
              when: 'Feature launch and adoption improvement'
            }
          },
          {
            id: 'conversion-funnels',
            name: 'Conversion Funnels',
            description: 'Track user progression through key conversion paths',
            category: 'Analytics',
            icon: 'Filter',
            characteristics: {
              effort: 'High',
              expertise: 'Funnel analysis and conversion optimization',
              resources: ['funnel tracking tools', 'conversion analytics', 'A/B testing platforms'],
              output: 'Conversion insights and optimization opportunities',
              when: 'Conversion optimization and user journey improvement'
            }
          },
          {
            id: 'time-to-value',
            name: 'Time to Value',
            description: 'Measure how quickly users reach their first meaningful interaction',
            category: 'Analytics',
            icon: 'Zap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Value measurement and time-based analysis',
              resources: ['event tracking', 'time analysis tools', 'user journey analytics'],
              output: 'Time to value insights and onboarding optimization',
              when: 'User experience optimization and value delivery improvement'
            }
          }
        ]
      },
      {
        id: 'retention',
        name: 'Retention',
        description: 'Measure user return rates and long-term engagement patterns',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '1-2 weeks setup + ongoing',
          participants: 'Data analysts, product team, customer success',
          deliverables: 'Retention metrics, churn analysis, loyalty insights',
          skills: ['cohort analysis', 'churn prediction', 'loyalty measurement'],
          dependencies: ['user tracking', 'longitudinal data', 'segmentation capabilities']
        },
        tools: [
          {
            id: 'cohort-analysis',
            name: 'Cohort Analysis',
            description: 'Track user retention patterns across different time periods and user groups',
            category: 'Analytics',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Cohort analysis and retention modeling',
              resources: ['cohort analysis tools', 'longitudinal data', 'segmentation platforms'],
              output: 'Retention patterns and user lifecycle insights',
              when: 'Retention optimization and user lifecycle management'
            }
          },
          {
            id: 'churn-analysis',
            name: 'Churn Analysis',
            description: 'Identify patterns and predictors of user churn',
            category: 'Analytics',
            icon: 'UserMinus',
            characteristics: {
              effort: 'High',
              expertise: 'Churn modeling and predictive analysis',
              resources: ['churn analysis tools', 'machine learning platforms', 'user behavior data'],
              output: 'Churn insights and retention improvement strategies',
              when: 'Churn prevention and retention strategy development'
            }
          },
          {
            id: 'repeat-usage-tracking',
            name: 'Repeat Usage Tracking',
            description: 'Monitor frequency of user returns and usage consistency',
            category: 'Analytics',
            icon: 'RefreshCw',
            characteristics: {
              effort: 'Medium',
              expertise: 'Usage pattern analysis and frequency tracking',
              resources: ['usage analytics', 'frequency tracking tools', 'user behavior platforms'],
              output: 'Usage consistency insights and engagement patterns',
              when: 'Engagement optimization and habit formation analysis'
            }
          },
          {
            id: 'lifecycle-value',
            name: 'Customer Lifecycle Value',
            description: 'Calculate long-term value and engagement over user lifecycle',
            category: 'Analytics',
            icon: 'DollarSign',
            characteristics: {
              effort: 'High',
              expertise: 'Lifecycle analysis and value calculation',
              resources: ['value tracking tools', 'lifecycle analytics', 'business intelligence platforms'],
              output: 'Lifecycle value insights and retention ROI',
              when: 'Business value optimization and retention investment prioritization'
            }
          }
        ]
      },
      {
        id: 'task-success',
        name: 'Task Success',
        description: 'Measure user effectiveness, efficiency, and error rates in completing key tasks',
        position: { x: 800, y: 0 },
        characteristics: {
          duration: '2-4 weeks setup + ongoing',
          participants: 'UX researchers, data analysts, product team',
          deliverables: 'Task completion metrics, efficiency data, error analysis',
          skills: ['task analysis', 'efficiency measurement', 'error tracking'],
          dependencies: ['task definition', 'completion tracking', 'error monitoring']
        },
        tools: [
          {
            id: 'task-completion-rates',
            name: 'Task Completion Rates',
            description: 'Track percentage of users who successfully complete key tasks',
            category: 'Analytics',
            icon: 'CheckCircle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Task tracking and success measurement',
              resources: ['task tracking tools', 'completion analytics', 'goal funnel analysis'],
              output: 'Task success insights and completion optimization opportunities',
              when: 'Task optimization and user flow improvement'
            }
          },
          {
            id: 'task-efficiency',
            name: 'Task Efficiency Metrics',
            description: 'Measure time-to-completion and steps required for key tasks',
            category: 'Analytics',
            icon: 'Clock',
            characteristics: {
              effort: 'High',
              expertise: 'Efficiency measurement and time analysis',
              resources: ['time tracking tools', 'task analytics', 'efficiency benchmarking'],
              output: 'Efficiency insights and task optimization opportunities',
              when: 'User experience optimization and workflow improvement'
            }
          },
          {
            id: 'error-tracking',
            name: 'Error Tracking',
            description: 'Monitor user errors, failed attempts, and recovery patterns',
            category: 'Analytics',
            icon: 'AlertTriangle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Error analysis and failure pattern recognition',
              resources: ['error tracking tools', 'failure analytics', 'recovery monitoring'],
              output: 'Error insights and user experience improvement recommendations',
              when: 'Error reduction and user experience quality improvement'
            }
          },
          {
            id: 'usability-benchmarking',
            name: 'Usability Benchmarking',
            description: 'Compare task performance against benchmarks and competitors',
            category: 'Analytics',
            icon: 'BarChart',
            characteristics: {
              effort: 'High',
              expertise: 'Benchmarking analysis and competitive comparison',
              resources: ['benchmarking tools', 'competitive data', 'performance comparison platforms'],
              output: 'Performance benchmarks and competitive positioning insights',
              when: 'Competitive analysis and performance optimization'
            }
          }
        ]
      }
    ]
  },

  // 9. HOOKED MODEL - Complete with all 4 stages (Trigger, Action, Variable Reward, Investment)
  {
    id: 'hooked-model',
    name: 'Hooked Model',
    description: 'Nir Eyal methodology for creating habit-forming products through behavioral loops',
    color: '#10B981',
    characteristics: {
      focus: 'Habit formation and user retention through behavioral design',
      timeline: '3-6 months (iterative cycles)',
      complexity: 'Medium-High',
      teamSize: '4-8 people',
      outcome: 'Habit-forming product experiences and increased user retention'
    },
    stages: [
      {
        id: 'trigger',
        name: 'Trigger',
        description: 'Create external and internal triggers that prompt user action',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Product designers, marketers, behavioral specialists',
          deliverables: 'Trigger strategies, notification systems, internal trigger identification',
          skills: ['trigger design', 'behavioral psychology', 'notification strategy', 'user psychology'],
          dependencies: ['user behavior analysis', 'communication channels', 'trigger platforms']
        },
        tools: [
          {
            id: 'external-triggers',
            name: 'External Triggers',
            description: 'Design paid, earned, relationship, and owned triggers to prompt action',
            category: 'Engagement',
            icon: 'Bell',
            characteristics: {
              effort: 'High',
              expertise: 'Trigger design and multi-channel engagement',
              resources: ['notification platforms', 'marketing channels', 'communication tools'],
              output: 'Comprehensive external trigger strategy and implementation',
              when: 'User acquisition and re-engagement campaigns'
            }
          },
          {
            id: 'internal-trigger-mapping',
            name: 'Internal Trigger Mapping',
            description: 'Identify emotional states and contexts that naturally prompt product use',
            category: 'Research',
            icon: 'Heart',
            characteristics: {
              effort: 'High',
              expertise: 'Behavioral psychology and emotional trigger identification',
              resources: ['user research', 'behavioral analysis tools', 'emotional mapping'],
              output: 'Internal trigger insights and emotional context understanding',
              when: 'User psychology research and habit formation analysis'
            }
          },
          {
            id: 'notification-strategy',
            name: 'Notification Strategy',
            description: 'Design contextual and timely notifications that enhance rather than annoy',
            category: 'Engagement',
            icon: 'MessageSquare',
            characteristics: {
              effort: 'High',
              expertise: 'Notification design and user experience optimization',
              resources: ['push notification systems', 'personalization tools', 'timing optimization'],
              output: 'Effective notification strategy and delivery optimization',
              when: 'User engagement and retention optimization'
            }
          },
          {
            id: 'contextual-triggers',
            name: 'Contextual Triggers',
            description: 'Create location, time, and situation-based triggers',
            category: 'Engagement',
            icon: 'MapPin',
            characteristics: {
              effort: 'Medium',
              expertise: 'Context awareness and environmental trigger design',
              resources: ['location services', 'context detection', 'environmental data'],
              output: 'Contextual trigger strategy and implementation',
              when: 'Context-aware engagement and personalized experiences'
            }
          }
        ]
      },
      {
        id: 'action',
        name: 'Action',
        description: 'Design simple actions users can take in anticipation of reward',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'UX designers, product managers, developers',
          deliverables: 'Simplified user actions, reduced friction, clear action paths',
          skills: ['interaction design', 'friction reduction', 'motivation design', 'ability optimization'],
          dependencies: ['trigger implementation', 'user flow analysis', 'technical capabilities']
        },
        tools: [
          {
            id: 'fogg-behavior-model',
            name: 'Fogg Behavior Model (B=MAP)',
            description: 'Apply Behavior = Motivation × Ability × Prompt model to optimize actions',
            category: 'Design',
            icon: 'Zap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Behavioral model application and action optimization',
              resources: ['behavior analysis tools', 'motivation research', 'ability assessment'],
              output: 'Optimized user actions and behavior design',
              when: 'Action design and user behavior optimization'
            }
          },
          {
            id: 'friction-reduction',
            name: 'Friction Reduction',
            description: 'Identify and eliminate barriers to action completion',
            category: 'Optimization',
            icon: 'Minimize2',
            characteristics: {
              effort: 'High',
              expertise: 'User experience optimization and barrier identification',
              resources: ['user testing', 'analytics tools', 'conversion optimization'],
              output: 'Reduced friction and improved action completion rates',
              when: 'User experience optimization and conversion improvement'
            }
          },
          {
            id: 'micro-commitments',
            name: 'Micro-Commitments',
            description: 'Design small, easy actions that build toward larger commitments',
            category: 'Design',
            icon: 'ChevronRight',
            characteristics: {
              effort: 'Medium',
              expertise: 'Progressive engagement design and commitment escalation',
              resources: ['engagement design tools', 'user journey mapping', 'progression frameworks'],
              output: 'Progressive action design and commitment building strategy',
              when: 'User onboarding and engagement progression'
            }
          },
          {
            id: 'ability-enhancement',
            name: 'Ability Enhancement',
            description: 'Increase user ability through simplification, guidance, and skill building',
            category: 'Design',
            icon: 'TrendingUp',
            characteristics: {
              effort: 'High',
              expertise: 'Skill building design and user empowerment',
              resources: ['educational design tools', 'guidance systems', 'skill tracking'],
              output: 'Enhanced user capability and action success rates',
              when: 'User empowerment and skill development'
            }
          }
        ]
      },
      {
        id: 'variable-reward',
        name: 'Variable Reward',
        description: 'Provide unpredictable rewards that satisfy user needs and create anticipation',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '3-4 weeks',
          participants: 'Game designers, product managers, behavioral specialists',
          deliverables: 'Reward systems, variable reinforcement patterns, satisfaction mechanisms',
          skills: ['reward design', 'variable reinforcement', 'satisfaction psychology', 'gamification'],
          dependencies: ['user motivation research', 'reward platforms', 'content systems']
        },
        tools: [
          {
            id: 'rewards-of-tribe',
            name: 'Rewards of the Tribe',
            description: 'Design social rewards based on connection, acceptance, and community',
            category: 'Engagement',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Social reward design and community building',
              resources: ['social features', 'community platforms', 'social recognition systems'],
              output: 'Social reward systems and community engagement',
              when: 'Community building and social engagement'
            }
          },
          {
            id: 'rewards-of-hunt',
            name: 'Rewards of the Hunt',
            description: 'Create discovery rewards through search, exploration, and acquisition',
            category: 'Engagement',
            icon: 'Search',
            characteristics: {
              effort: 'Medium',
              expertise: 'Discovery design and exploration rewards',
              resources: ['content systems', 'discovery algorithms', 'exploration features'],
              output: 'Discovery reward systems and exploration engagement',
              when: 'Content discovery and exploration features'
            }
          },
          {
            id: 'rewards-of-self',
            name: 'Rewards of the Self',
            description: 'Design mastery and self-actualization rewards through achievement',
            category: 'Engagement',
            icon: 'Award',
            characteristics: {
              effort: 'High',
              expertise: 'Achievement design and personal growth rewards',
              resources: ['progression systems', 'skill tracking', 'achievement platforms'],
              output: 'Personal achievement systems and mastery rewards',
              when: 'Skill development and personal growth features'
            }
          },
          {
            id: 'variable-ratio-scheduling',
            name: 'Variable Ratio Scheduling',
            description: 'Implement unpredictable reward timing for maximum engagement',
            category: 'Psychology',
            icon: 'Shuffle',
            characteristics: {
              effort: 'Medium',
              expertise: 'Behavioral psychology and reinforcement scheduling',
              resources: ['randomization systems', 'reward timing algorithms', 'engagement analytics'],
              output: 'Optimized reward timing and variable reinforcement',
              when: 'Engagement optimization and habit formation'
            }
          }
        ]
      },
      {
        id: 'investment',
        name: 'Investment',
        description: 'Enable user investment that increases future reward likelihood and switching costs',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Product designers, developers, data specialists',
          deliverables: 'Investment mechanisms, user data collection, preference systems',
          skills: ['investment design', 'data collection', 'personalization', 'switching cost creation'],
          dependencies: ['user data systems', 'personalization platforms', 'content creation tools']
        },
        tools: [
          {
            id: 'data-investment',
            name: 'Data Investment',
            description: 'Collect user data and preferences that improve future experiences',
            category: 'Personalization',
            icon: 'Database',
            characteristics: {
              effort: 'High',
              expertise: 'Data collection design and personalization systems',
              resources: ['data platforms', 'preference systems', 'machine learning tools'],
              output: 'User data collection and personalization improvement',
              when: 'Personalization and user experience customization'
            }
          },
          {
            id: 'content-investment',
            name: 'Content Investment',
            description: 'Enable users to create content that increases product value',
            category: 'Content',
            icon: 'Edit',
            characteristics: {
              effort: 'High',
              expertise: 'Content creation design and user-generated content systems',
              resources: ['content platforms', 'creation tools', 'publishing systems'],
              output: 'User content creation and platform value increase',
              when: 'User-generated content and community building'
            }
          },
          {
            id: 'social-investment',
            name: 'Social Investment',
            description: 'Build social connections and reputation that increase switching costs',
            category: 'Social',
            icon: 'Network',
            characteristics: {
              effort: 'High',
              expertise: 'Social system design and network effect creation',
              resources: ['social platforms', 'connection systems', 'reputation tracking'],
              output: 'Social investment systems and network effects',
              when: 'Social network building and community engagement'
            }
          },
          {
            id: 'skill-investment',
            name: 'Skill Investment',
            description: 'Help users develop skills and expertise that increase product value',
            category: 'Education',
            icon: 'BookOpen',
            characteristics: {
              effort: 'Medium',
              expertise: 'Skill building design and progress tracking',
              resources: ['learning systems', 'skill tracking', 'progress visualization'],
              output: 'User skill development and expertise building',
              when: 'User education and capability building'
            }
          }
        ]
      }
    ]
  }
];

export default completeUXFrameworks;