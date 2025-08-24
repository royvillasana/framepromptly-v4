import { create } from 'zustand';
import { Node, Edge, Connection } from '@xyflow/react';

export interface UXFramework {
  id: string;
  name: string;
  description: string;
  stages: UXStage[];
  color: string;
  characteristics: {
    focus: string;
    timeline: string;
    complexity: string;
    teamSize: string;
    outcome: string;
  };
}

export interface UXStage {
  id: string;
  name: string;
  description: string;
  tools: UXTool[];
  position: { x: number; y: number };
  characteristics: {
    duration: string;
    participants: string;
    deliverables: string;
    skills: string[];
    dependencies: string[];
  };
}

export interface UXTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  characteristics: {
    effort: string;
    expertise: string;
    resources: string[];
    output: string;
    when: string;
  };
}

export interface NodeCustomization {
  id: string;
  nodeType: 'framework' | 'stage' | 'tool';
  customProperties: Record<string, any>;
  connections: {
    upstream: string[];
    downstream: string[];
  };
}

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedFramework: UXFramework | null;
  selectedStage: UXStage | null;
  selectedNode: Node | null;
  nodeCustomizations: Record<string, NodeCustomization>;
  frameworks: UXFramework[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  loadCanvasData: (canvasData: any) => void;
  updateNode: (id: string, data: any) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeDimensions: (id: string, dimensions: { width: number; height: number }) => void;
  saveWorkflowToStorage: () => void;
  loadWorkflowFromStorage: () => void;
  updateNodeCustomization: (nodeId: string, customization: Partial<NodeCustomization>) => void;
  getConnectedNodes: (nodeId: string) => {
    frameworks: Node[];
    stages: Node[];
    tools: Node[];
  };
  selectFramework: (framework: UXFramework) => void;
  selectStage: (stage: UXStage) => void;
  selectNode: (node: Node | null) => void;
  initializeFrameworks: () => void;
}

// All 9 UX frameworks with complete data
const sampleFrameworks: UXFramework[] = [
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    description: 'Human-centered approach to innovation',
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
        description: 'Understand user needs and context',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Researchers, designers, stakeholders',
          deliverables: 'User insights, empathy maps, personas',
          skills: ['user research', 'interviewing', 'observation'],
          dependencies: ['stakeholder buy-in', 'user access']
        },
        tools: [
          { 
            id: 'user-interviews', 
            name: 'User Interviews', 
            description: 'Conduct in-depth user interviews', 
            category: 'Research', 
            icon: 'MessageCircle',
            characteristics: {
              effort: 'High',
              expertise: 'Research skills',
              resources: ['interview guide', 'recording equipment'],
              output: 'User insights and quotes',
              when: 'Beginning of project'
            }
          },
          { 
            id: 'surveys', 
            name: 'Surveys', 
            description: 'Collect quantitative data', 
            category: 'Research', 
            icon: 'BarChart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Survey design',
              resources: ['survey platform', 'user database'],
              output: 'Quantitative insights',
              when: 'Early research phase'
            }
          },
          { 
            id: 'observations', 
            name: 'Observations', 
            description: 'Observe users in their environment', 
            category: 'Research', 
            icon: 'Eye',
            characteristics: {
              effort: 'High',
              expertise: 'Observational skills',
              resources: ['field access', 'observation protocols'],
              output: 'Behavioral insights',
              when: 'Context exploration'
            }
          },
          { 
            id: 'empathy-maps-dt', 
            name: 'Empathy Maps', 
            description: 'Visualize user thoughts and feelings', 
            category: 'Analysis', 
            icon: 'Heart',
            characteristics: {
              effort: 'Low',
              expertise: 'Synthesis skills',
              resources: ['research data', 'workshop materials'],
              output: 'User empathy visualization',
              when: 'After research collection'
            }
          }
        ]
      },
      {
        id: 'define',
        name: 'Define',
        description: 'Synthesize observations into problem statements',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '1-2 weeks',
          participants: 'Design team, researchers',
          deliverables: 'Problem statements, personas, POV statements',
          skills: ['synthesis', 'problem framing', 'storytelling'],
          dependencies: ['research insights', 'stakeholder alignment']
        },
        tools: [
          { 
            id: 'affinity-mapping', 
            name: 'Affinity Mapping', 
            description: 'Group insights to find patterns', 
            category: 'Analysis', 
            icon: 'Grid3X3',
            characteristics: {
              effort: 'Medium',
              expertise: 'Synthesis skills',
              resources: ['sticky notes', 'wall space', 'research data'],
              output: 'Insight clusters and themes',
              when: 'After research collection'
            }
          },
          { 
            id: 'personas', 
            name: 'Personas', 
            description: 'Create user archetypes', 
            category: 'Analysis', 
            icon: 'User',
            characteristics: {
              effort: 'Medium',
              expertise: 'User modeling',
              resources: ['research data', 'design tools'],
              output: 'User persona documents',
              when: 'After pattern identification'
            }
          }
        ]
      },
      {
        id: 'ideate',
        name: 'Ideate',
        description: 'Generate creative solutions',
        position: { x: 400, y: 0 },
        characteristics: {
          duration: '1-3 weeks',
          participants: 'Multidisciplinary team',
          deliverables: 'Solution concepts, feature ideas',
          skills: ['creative thinking', 'brainstorming', 'facilitation'],
          dependencies: ['clear problem definition', 'diverse perspectives']
        },
        tools: [
          { 
            id: 'brainstorming', 
            name: 'Brainstorming', 
            description: 'Generate ideas rapidly', 
            category: 'Ideation', 
            icon: 'Lightbulb',
            characteristics: {
              effort: 'Low',
              expertise: 'Facilitation',
              resources: ['workshop space', 'sticky notes'],
              output: 'Raw ideas and concepts',
              when: 'Divergent thinking phase'
            }
          },
          { 
            id: 'how-might-we', 
            name: 'How Might We', 
            description: 'Frame problems as opportunities', 
            category: 'Ideation', 
            icon: 'HelpCircle',
            characteristics: {
              effort: 'Low',
              expertise: 'Problem reframing',
              resources: ['problem statements', 'facilitation materials'],
              output: 'Opportunity statements',
              when: 'Problem to solution transition'
            }
          }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build testable representations',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Designers, developers',
          deliverables: 'Prototypes, mockups, wireframes',
          skills: ['prototyping', 'design tools', 'technical skills'],
          dependencies: ['selected concepts', 'technical constraints']
        },
        tools: [
          { 
            id: 'wireframes', 
            name: 'Wireframes', 
            description: 'Low-fidelity layout structures', 
            category: 'Prototyping', 
            icon: 'Layout',
            characteristics: {
              effort: 'Medium',
              expertise: 'Information architecture',
              resources: ['wireframing tools', 'content inventory'],
              output: 'Structural layouts',
              when: 'Information architecture phase'
            }
          }
        ]
      },
      {
        id: 'test',
        name: 'Test',
        description: 'Validate solutions with users',
        position: { x: 800, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Researchers, designers, users',
          deliverables: 'Test results, insights, recommendations',
          skills: ['usability testing', 'data analysis', 'facilitation'],
          dependencies: ['testable prototypes', 'user access']
        },
        tools: [
          { 
            id: 'usability-tests', 
            name: 'Usability Tests', 
            description: 'Test prototype with users', 
            category: 'Testing', 
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Usability testing',
              resources: ['testing lab', 'recording equipment', 'participants'],
              output: 'Usability findings',
              when: 'Prototype validation'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'double-diamond',
    name: 'Double Diamond',
    description: 'Divergent and convergent thinking process',
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
        description: 'Explore and understand the problem space',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '3-6 weeks',
          participants: 'Researchers, stakeholders, users',
          deliverables: 'Research insights, opportunity areas',
          skills: ['research', 'stakeholder management', 'observation'],
          dependencies: ['project brief', 'stakeholder access']
        },
        tools: [
          { 
            id: 'stakeholder-interviews', 
            name: 'Stakeholder Interviews', 
            description: 'Understand business context', 
            category: 'Research', 
            icon: 'Users',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview skills',
              resources: ['interview guides', 'stakeholder access'],
              output: 'Business requirements',
              when: 'Project initiation'
            }
          },
          { 
            id: 'contextual-inquiry', 
            name: 'Contextual Inquiry', 
            description: 'Observe users in context', 
            category: 'Research', 
            icon: 'Search',
            characteristics: {
              effort: 'High',
              expertise: 'Ethnographic research',
              resources: ['field access', 'observation protocols'],
              output: 'Contextual insights',
              when: 'Problem exploration'
            }
          }
        ]
      },
      {
        id: 'define-dd',
        name: 'Define',
        description: 'Synthesize insights into focused brief',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Design team, stakeholders',
          deliverables: 'Design brief, problem definition',
          skills: ['synthesis', 'problem definition', 'prioritization'],
          dependencies: ['research insights', 'stakeholder alignment']
        },
        tools: [
          { 
            id: 'synthesis-workshops', 
            name: 'Synthesis Workshops', 
            description: 'Collaborative insight analysis', 
            category: 'Analysis', 
            icon: 'Target',
            characteristics: {
              effort: 'High',
              expertise: 'Workshop facilitation',
              resources: ['workshop space', 'research data'],
              output: 'Key insights and themes',
              when: 'After research phase'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'google-design-sprint',
    name: 'Google Design Sprint',
    description: '5-day process for rapid prototyping and testing',
    color: '#F59E0B',
    characteristics: {
      focus: 'Rapid validation',
      timeline: '1 week',
      complexity: 'Low-Medium',
      teamSize: '5-7 people',
      outcome: 'Validated prototype'
    },
    stages: [
      {
        id: 'understand',
        name: 'Understand',
        description: 'Map the problem and pick target',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1 day',
          participants: 'Sprint team, subject experts',
          deliverables: 'Problem map, target selection',
          skills: ['facilitation', 'problem mapping', 'prioritization'],
          dependencies: ['defined challenge', 'committed team']
        },
        tools: [
          { 
            id: 'expert-interviews', 
            name: 'Expert Interviews', 
            description: 'Learn from domain experts', 
            category: 'Research', 
            icon: 'GraduationCap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Interview facilitation',
              resources: ['expert access', 'interview structure'],
              output: 'Expert insights',
              when: 'Monday morning'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'human-centered-design',
    name: 'Human-Centered Design',
    description: 'IDEO methodology focused on human needs',
    color: '#10B981',
    characteristics: {
      focus: 'Human needs and experiences',
      timeline: '3-9 months',
      complexity: 'Medium-High',
      teamSize: '4-12 people',
      outcome: 'Impactful solutions'
    },
    stages: [
      {
        id: 'hear',
        name: 'Hear',
        description: 'Understand people and context',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '4-8 weeks',
          participants: 'Researchers, community members',
          deliverables: 'Deep user insights, stories',
          skills: ['empathy', 'listening', 'cultural sensitivity'],
          dependencies: ['community access', 'trust building']
        },
        tools: [
          { 
            id: 'empathy-map', 
            name: 'Empathy Map', 
            description: 'Visualize user thoughts and feelings', 
            category: 'Research', 
            icon: 'Heart',
            characteristics: {
              effort: 'Medium',
              expertise: 'Empathy building',
              resources: ['user research', 'mapping template'],
              output: 'Empathy visualization',
              when: 'User understanding'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'jobs-to-be-done',
    name: 'Jobs-to-Be-Done',
    description: 'Focus on customer jobs and outcomes',
    color: '#8B5CF6',
    characteristics: {
      focus: 'Customer jobs and outcomes',
      timeline: '2-4 months',
      complexity: 'Medium',
      teamSize: '3-6 people',
      outcome: 'Job-focused solutions'
    },
    stages: [
      {
        id: 'job-mapping',
        name: 'Job Mapping',
        description: 'Map customer job steps',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Researchers, product team',
          deliverables: 'Job maps, job statements',
          skills: ['job analysis', 'process mapping', 'customer research'],
          dependencies: ['customer access', 'job definition']
        },
        tools: [
          { 
            id: 'job-steps', 
            name: 'Job Steps', 
            description: 'Break down customer job process', 
            category: 'Analysis', 
            icon: 'List',
            characteristics: {
              effort: 'Medium',
              expertise: 'Process analysis',
              resources: ['customer interviews', 'observation data'],
              output: 'Detailed job breakdown',
              when: 'Job understanding'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'lean-ux',
    name: 'Lean UX',
    description: 'Hypothesis-driven design approach',
    color: '#06B6D4',
    characteristics: {
      focus: 'Rapid experimentation',
      timeline: '1-3 months',
      complexity: 'Low-Medium',
      teamSize: '3-8 people',
      outcome: 'Validated learning'
    },
    stages: [
      {
        id: 'hypothesize',
        name: 'Hypothesize',
        description: 'Form testable assumptions',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1-2 weeks',
          participants: 'Product team, stakeholders',
          deliverables: 'Hypothesis statements, assumptions',
          skills: ['hypothesis formation', 'assumption mapping', 'risk assessment'],
          dependencies: ['problem understanding', 'team alignment']
        },
        tools: [
          { 
            id: 'hypothesis-canvas', 
            name: 'Hypothesis Canvas', 
            description: 'Structure testable assumptions', 
            category: 'Strategy', 
            icon: 'TestTube2',
            characteristics: {
              effort: 'Low',
              expertise: 'Hypothesis design',
              resources: ['canvas template', 'team workshop'],
              output: 'Structured hypotheses',
              when: 'Project initiation'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'agile-ux',
    name: 'Agile UX',
    description: 'Iterative design within agile development',
    color: '#84CC16',
    characteristics: {
      focus: 'Continuous iteration',
      timeline: 'Ongoing sprints',
      complexity: 'Medium',
      teamSize: '5-12 people',
      outcome: 'Evolving product'
    },
    stages: [
      {
        id: 'plan',
        name: 'Plan',
        description: 'Plan design work for sprint',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '1-2 days',
          participants: 'UX team, product owner, scrum master',
          deliverables: 'Sprint UX goals, task breakdown',
          skills: ['sprint planning', 'task estimation', 'prioritization'],
          dependencies: ['product backlog', 'sprint goals']
        },
        tools: [
          { 
            id: 'user-story-mapping', 
            name: 'User Story Mapping', 
            description: 'Map user journey to features', 
            category: 'Planning', 
            icon: 'MapPin',
            characteristics: {
              effort: 'Medium',
              expertise: 'Story mapping',
              resources: ['user stories', 'mapping space'],
              output: 'Story map',
              when: 'Sprint planning'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'heart-framework',
    name: 'HEART Framework',
    description: 'Google framework for measuring user experience',
    color: '#EC4899',
    characteristics: {
      focus: 'UX measurement and metrics',
      timeline: '2-6 months',
      complexity: 'Medium-High',
      teamSize: '4-8 people',
      outcome: 'Data-driven UX insights'
    },
    stages: [
      {
        id: 'happiness',
        name: 'Happiness',
        description: 'Measure user satisfaction and delight',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'UX researchers, data analysts',
          deliverables: 'Satisfaction metrics, user sentiment',
          skills: ['survey design', 'sentiment analysis', 'data interpretation'],
          dependencies: ['user access', 'measurement tools']
        },
        tools: [
          { 
            id: 'surveys-heart', 
            name: 'Surveys', 
            description: 'Measure user satisfaction', 
            category: 'Measurement', 
            icon: 'ClipboardList',
            characteristics: {
              effort: 'Medium',
              expertise: 'Survey design',
              resources: ['survey platform', 'user base'],
              output: 'Satisfaction scores',
              when: 'Regular intervals'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'hooked-model',
    name: 'Hooked Model',
    description: 'Build habit-forming products',
    color: '#F97316',
    characteristics: {
      focus: 'Habit formation and engagement',
      timeline: '3-6 months',
      complexity: 'Medium-High',
      teamSize: '4-10 people',
      outcome: 'Habit-forming products'
    },
    stages: [
      {
        id: 'trigger',
        name: 'Trigger',
        description: 'Create external and internal triggers',
        position: { x: 0, y: 0 },
        characteristics: {
          duration: '2-4 weeks',
          participants: 'Product designers, marketing team',
          deliverables: 'Trigger strategies, notification systems',
          skills: ['trigger design', 'psychology', 'notification strategy'],
          dependencies: ['user behavior analysis', 'communication channels']
        },
        tools: [
          { 
            id: 'notification-strategy', 
            name: 'Notification Strategy', 
            description: 'Design trigger notifications', 
            category: 'Engagement', 
            icon: 'Bell',
            characteristics: {
              effort: 'Medium',
              expertise: 'Engagement design',
              resources: ['notification platform', 'user preferences'],
              output: 'Trigger system',
              when: 'Habit initiation'
            }
          }
        ]
      }
    ]
  }
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedFramework: null,
  selectedStage: null,
  selectedNode: null,
  nodeCustomizations: {},
  frameworks: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => {
    set((state) => {
      // Check if node with this ID already exists
      const existingNodeIndex = state.nodes.findIndex(n => n.id === node.id);
      
      let updatedNodes;
      if (existingNodeIndex >= 0) {
        // Replace existing node
        updatedNodes = [...state.nodes];
        updatedNodes[existingNodeIndex] = node;
        console.log('Replacing existing node:', node.id);
      } else {
        // Add new node
        updatedNodes = [...state.nodes, node];
        console.log('Adding new node:', node.id);
      }
      
      // Auto-save to localStorage
      localStorage.setItem('workflow-nodes', JSON.stringify(updatedNodes));
      localStorage.setItem('workflow-edges', JSON.stringify(state.edges));
      
      return { nodes: updatedNodes };
    });
  },
  
  addEdge: (edge) => {
    set((state) => {
      const updatedEdges = [...state.edges, edge];
      
      // Auto-save to localStorage
      localStorage.setItem('workflow-nodes', JSON.stringify(state.nodes));
      localStorage.setItem('workflow-edges', JSON.stringify(updatedEdges));
      
      return { edges: updatedEdges };
    });
  },

  loadCanvasData: (canvasData: any) => {
    if (canvasData && canvasData.nodes && canvasData.edges) {
      set({ 
        nodes: canvasData.nodes || [], 
        edges: canvasData.edges || [] 
      });
    }
  },
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),

  updateNodePosition: (id, position) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node => 
        node.id === id ? { ...node, position } : node
      );
      
      // Auto-save to localStorage
      localStorage.setItem('workflow-nodes', JSON.stringify(updatedNodes));
      localStorage.setItem('workflow-edges', JSON.stringify(state.edges));
      
      return { nodes: updatedNodes };
    });
  },

  updateNodeDimensions: (id, dimensions) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node => 
        node.id === id ? { ...node, width: dimensions.width, height: dimensions.height } : node
      );
      
      // Auto-save to localStorage
      localStorage.setItem('workflow-nodes', JSON.stringify(updatedNodes));
      localStorage.setItem('workflow-edges', JSON.stringify(state.edges));
      
      return { nodes: updatedNodes };
    });
  },

  saveWorkflowToStorage: () => {
    const state = get();
    localStorage.setItem('workflow-nodes', JSON.stringify(state.nodes));
    localStorage.setItem('workflow-edges', JSON.stringify(state.edges));
  },

  loadWorkflowFromStorage: () => {
    try {
      const savedNodes = localStorage.getItem('workflow-nodes');
      const savedEdges = localStorage.getItem('workflow-edges');
      
      if (savedNodes && savedEdges) {
        set({
          nodes: JSON.parse(savedNodes),
          edges: JSON.parse(savedEdges)
        });
      }
    } catch (error) {
      console.error('Failed to load workflow from storage:', error);
    }
  },

  updateNodeCustomization: (nodeId, customization) => set((state) => ({
    nodeCustomizations: {
      ...state.nodeCustomizations,
      [nodeId]: {
        ...state.nodeCustomizations[nodeId],
        ...customization
      }
    }
  })),

  getConnectedNodes: (nodeId) => {
    const state = get();
    const connectedEdges = state.edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
    
    const connectedNodeIds = connectedEdges.map(edge => 
      edge.source === nodeId ? edge.target : edge.source
    );
    
    const connectedNodes = state.nodes.filter(node => 
      connectedNodeIds.includes(node.id)
    );

    return {
      frameworks: connectedNodes.filter(node => node.type === 'framework'),
      stages: connectedNodes.filter(node => node.type === 'stage'),
      tools: connectedNodes.filter(node => node.type === 'tool')
    };
  },
  
  selectFramework: (framework) => set({ selectedFramework: framework }),
  selectStage: (stage) => set({ selectedStage: stage }),
  selectNode: (node) => set({ selectedNode: node }),
  
  initializeFrameworks: () => set({ frameworks: sampleFrameworks }),

  // Load workflow from storage on initialization
  ...((() => {
    try {
      const savedNodes = localStorage.getItem('workflow-nodes');
      const savedEdges = localStorage.getItem('workflow-edges');
      
      if (savedNodes && savedEdges) {
        return {
          nodes: JSON.parse(savedNodes),
          edges: JSON.parse(savedEdges)
        };
      }
    } catch (error) {
      console.error('Failed to load workflow from storage:', error);
    }
    return {};
  })())
}));