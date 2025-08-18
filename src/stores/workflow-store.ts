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
  // Workflow Builder State
  nodes: Node[];
  edges: Edge[];
  selectedFramework: UXFramework | null;
  selectedStage: UXStage | null;
  nodeCustomizations: Record<string, NodeCustomization>;
  
  // Available Resources
  frameworks: UXFramework[];
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (id: string, data: any) => void;
  updateNodeCustomization: (nodeId: string, customization: Partial<NodeCustomization>) => void;
  getConnectedNodes: (nodeId: string) => { frameworks: Node[]; stages: Node[]; tools: Node[] };
  selectFramework: (framework: UXFramework) => void;
  selectStage: (stage: UXStage) => void;
  initializeFrameworks: () => void;
}

// Complete UX frameworks data with all stages and tools
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
            id: 'empathy-maps', 
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
        description: 'Frame the problem clearly',
        position: { x: 200, y: 0 },
        characteristics: {
          duration: '2-3 weeks',
          participants: 'Designers, product managers, stakeholders',
          deliverables: 'Problem statements, user personas, journey maps',
          skills: ['analysis', 'synthesis', 'facilitation'],
          dependencies: ['empathize stage completion']
        },
        tools: [
          {
            id: 'personas',
            name: 'Personas',
            description: 'Create user personas',
            category: 'Definition',
            icon: 'User',
            characteristics: {
              effort: 'Medium',
              expertise: 'User research, storytelling',
              resources: ['user data', 'design tools'],
              output: 'User archetypes',
              when: 'After user research'
            }
          },
          {
            id: 'journey-maps',
            name: 'Journey Maps',
            description: 'Map user journeys',
            category: 'Definition',
            icon: 'Map',
            characteristics: {
              effort: 'Medium',
              expertise: 'Mapping, visualization',
              resources: ['user scenarios', 'design tools'],
              output: 'User journey visualizations',
              when: 'After personas'
            }
          },
          {
            id: 'affinity-mapping',
            name: 'Affinity Mapping',
            description: 'Group related insights',
            category: 'Analysis',
            icon: 'Grid',
            characteristics: {
              effort: 'Low',
              expertise: 'Facilitation, synthesis',
              resources: ['sticky notes', 'whiteboard'],
              output: 'Insight clusters',
              when: 'During analysis'
            }
          },
          {
            id: 'problem-statements',
            name: 'Problem Statements',
            description: 'Define core problems',
            category: 'Definition',
            icon: 'Target',
            characteristics: {
              effort: 'Low',
              expertise: 'Writing, framing',
              resources: ['research insights'],
              output: 'Clear problem definitions',
              when: 'After analysis'
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
          duration: '2-4 weeks',
          participants: 'Designers, stakeholders, users',
          deliverables: 'Idea lists, sketches, concepts',
          skills: ['creativity', 'facilitation', 'visualization'],
          dependencies: ['define stage completion']
        },
        tools: [
          {
            id: 'brainstorming',
            name: 'Brainstorming',
            description: 'Generate creative ideas',
            category: 'Ideation',
            icon: 'Lightbulb',
            characteristics: {
              effort: 'Low',
              expertise: 'Facilitation',
              resources: ['whiteboard', 'sticky notes'],
              output: 'Idea generation',
              when: 'During ideation'
            }
          },
          {
            id: 'how-might-we',
            name: 'How Might We',
            description: 'Frame opportunity questions',
            category: 'Ideation',
            icon: 'HelpCircle',
            characteristics: {
              effort: 'Low',
              expertise: 'Framing, facilitation',
              resources: ['problem statements'],
              output: 'Opportunity questions',
              when: 'Start of ideation'
            }
          },
          {
            id: 'scamper',
            name: 'SCAMPER',
            description: 'Systematic creative thinking',
            category: 'Ideation',
            icon: 'Zap',
            characteristics: {
              effort: 'Medium',
              expertise: 'Creative thinking',
              resources: ['idea prompts'],
              output: 'Idea variations',
              when: 'During ideation'
            }
          },
          {
            id: 'crazy-8s',
            name: 'Crazy 8s',
            description: 'Rapid sketching exercise',
            category: 'Ideation',
            icon: 'PenTool',
            characteristics: {
              effort: 'Medium',
              expertise: 'Sketching',
              resources: ['paper', 'pens'],
              output: 'Sketch ideas',
              when: 'During ideation'
            }
          }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build testable solutions',
        position: { x: 600, y: 0 },
        characteristics: {
          duration: '3-6 weeks',
          participants: 'Designers, developers, users',
          deliverables: 'Prototypes, wireframes, mockups',
          skills: ['design', 'development', 'testing'],
          dependencies: ['ideate stage completion']
        },
        tools: [
          {
            id: 'wireframes',
            name: 'Wireframes',
            description: 'Create low-fidelity prototypes',
            category: 'Prototyping',
            icon: 'Square',
            characteristics: {
              effort: 'Medium',
              expertise: 'Design',
              resources: ['design tools'],
              output: 'Wireframe prototypes',
              when: 'Early prototyping'
            }
          },
          {
            id: 'mockups',
            name: 'Mockups',
            description: 'Create high-fidelity designs',
            category: 'Prototyping',
            icon: 'Smartphone',
            characteristics: {
              effort: 'High',
              expertise: 'Visual design',
              resources: ['design tools'],
              output: 'High-fidelity mockups',
              when: 'Later prototyping'
            }
          },
          {
            id: 'sketching',
            name: 'Sketching',
            description: 'Quick idea visualization',
            category: 'Prototyping',
            icon: 'Edit',
            characteristics: {
              effort: 'Low',
              expertise: 'Sketching',
              resources: ['paper', 'pens'],
              output: 'Sketches',
              when: 'Early prototyping'
            }
          },
          {
            id: 'storyboards',
            name: 'Storyboards',
            description: 'Visualize user scenarios',
            category: 'Prototyping',
            icon: 'Film',
            characteristics: {
              effort: 'Medium',
              expertise: 'Storytelling',
              resources: ['storyboard templates'],
              output: 'User scenario visualizations',
              when: 'During prototyping'
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
          duration: '2-4 weeks',
          participants: 'Users, designers, researchers',
          deliverables: 'Test reports, feedback',
          skills: ['testing', 'analysis', 'communication'],
          dependencies: ['prototype stage completion']
        },
        tools: [
          {
            id: 'usability-tests',
            name: 'Usability Tests',
            description: 'Test with real users',
            category: 'Testing',
            icon: 'Users',
            characteristics: {
              effort: 'High',
              expertise: 'Testing, facilitation',
              resources: ['test scripts', 'users'],
              output: 'Usability feedback',
              when: 'During testing'
            }
          },
          {
            id: 'ab-tests',
            name: 'A/B Tests',
            description: 'Compare design variants',
            category: 'Testing',
            icon: 'ToggleLeft',
            characteristics: {
              effort: 'Medium',
              expertise: 'Experiment design',
              resources: ['variants', 'analytics tools'],
              output: 'Performance data',
              when: 'During testing'
            }
          },
          {
            id: 'analytics-review',
            name: 'Analytics Review',
            description: 'Analyze usage data',
            category: 'Testing',
            icon: 'TrendingUp',
            characteristics: {
              effort: 'Medium',
              expertise: 'Data analysis',
              resources: ['analytics platform'],
              output: 'User behavior insights',
              when: 'During testing'
            }
          },
          {
            id: 'feedback-sessions',
            name: 'Feedback Sessions',
            description: 'Gather user feedback',
            category: 'Testing',
            icon: 'MessageSquare',
            characteristics: {
              effort: 'Low',
              expertise: 'Facilitation',
              resources: ['feedback forms'],
              output: 'User feedback',
              when: 'During testing'
            }
          }
        ]
      }
    ]
  }
  // Other frameworks would follow the same pattern with characteristics added
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedFramework: null,
  selectedStage: null,
  nodeCustomizations: {},
  frameworks: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    )
  })),

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
  
  initializeFrameworks: () => set({ frameworks: sampleFrameworks })
}));
