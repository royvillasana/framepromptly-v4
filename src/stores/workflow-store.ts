import { create } from 'zustand';
import { Node, Edge, Connection } from '@xyflow/react';

export interface UXFramework {
  id: string;
  name: string;
  description: string;
  stages: UXStage[];
  color: string;
}

export interface UXStage {
  id: string;
  name: string;
  description: string;
  tools: UXTool[];
  position: { x: number; y: number };
}

export interface UXTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface WorkflowState {
  // Workflow Builder State
  nodes: Node[];
  edges: Edge[];
  selectedFramework: UXFramework | null;
  selectedStage: UXStage | null;
  
  // Available Resources
  frameworks: UXFramework[];
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (id: string, data: any) => void;
  selectFramework: (framework: UXFramework) => void;
  selectStage: (stage: UXStage) => void;
  initializeFrameworks: () => void;
}

// Sample frameworks data
const sampleFrameworks: UXFramework[] = [
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    description: 'Human-centered approach to innovation',
    color: '#8B5CF6',
    stages: [
      {
        id: 'empathize',
        name: 'Empathize',
        description: 'Understand user needs',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'user-interviews', name: 'User Interviews', description: 'Conduct in-depth user interviews', category: 'Research', icon: 'MessageCircle' },
          { id: 'surveys', name: 'Surveys', description: 'Collect quantitative data', category: 'Research', icon: 'BarChart' }
        ]
      },
      {
        id: 'define',
        name: 'Define',
        description: 'Frame the problem',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'personas', name: 'Personas', description: 'Create user personas', category: 'Definition', icon: 'User' },
          { id: 'journey-maps', name: 'Journey Maps', description: 'Map user journeys', category: 'Definition', icon: 'Map' }
        ]
      },
      {
        id: 'ideate',
        name: 'Ideate',
        description: 'Generate solutions',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'brainstorming', name: 'Brainstorming', description: 'Generate creative ideas', category: 'Ideation', icon: 'Lightbulb' },
          { id: 'how-might-we', name: 'How Might We', description: 'Frame opportunity questions', category: 'Ideation', icon: 'HelpCircle' }
        ]
      },
      {
        id: 'prototype',
        name: 'Prototype',
        description: 'Build solutions',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'wireframes', name: 'Wireframes', description: 'Create low-fidelity prototypes', category: 'Prototyping', icon: 'Square' },
          { id: 'mockups', name: 'Mockups', description: 'Create high-fidelity designs', category: 'Prototyping', icon: 'Smartphone' }
        ]
      },
      {
        id: 'test',
        name: 'Test',
        description: 'Validate solutions',
        position: { x: 800, y: 0 },
        tools: [
          { id: 'usability-tests', name: 'Usability Tests', description: 'Test with real users', category: 'Testing', icon: 'Users' },
          { id: 'ab-tests', name: 'A/B Tests', description: 'Compare design variants', category: 'Testing', icon: 'ToggleLeft' }
        ]
      }
    ]
  },
  {
    id: 'double-diamond',
    name: 'Double Diamond',
    description: 'Divergent and convergent thinking process',
    color: '#06B6D4',
    stages: [
      {
        id: 'discover',
        name: 'Discover',
        description: 'Explore the problem space',
        position: { x: 0, y: 0 },
        tools: [
          { id: 'stakeholder-interviews', name: 'Stakeholder Interviews', description: 'Interview key stakeholders', category: 'Research', icon: 'MessageCircle' },
          { id: 'contextual-inquiry', name: 'Contextual Inquiry', description: 'Observe users in context', category: 'Research', icon: 'Eye' }
        ]
      },
      {
        id: 'define-dd',
        name: 'Define',
        description: 'Synthesize insights',
        position: { x: 200, y: 0 },
        tools: [
          { id: 'synthesis-workshops', name: 'Synthesis Workshops', description: 'Collaborative insight generation', category: 'Definition', icon: 'Users' },
          { id: 'problem-framing', name: 'Problem Framing', description: 'Frame the core problem', category: 'Definition', icon: 'Target' }
        ]
      },
      {
        id: 'develop',
        name: 'Develop',
        description: 'Create potential solutions',
        position: { x: 400, y: 0 },
        tools: [
          { id: 'concept-sketches', name: 'Concept Sketches', description: 'Sketch solution concepts', category: 'Development', icon: 'PenTool' },
          { id: 'prototyping-dd', name: 'Prototyping', description: 'Build testable prototypes', category: 'Development', icon: 'Box' }
        ]
      },
      {
        id: 'deliver',
        name: 'Deliver',
        description: 'Launch and iterate',
        position: { x: 600, y: 0 },
        tools: [
          { id: 'pilot-testing', name: 'Pilot Testing', description: 'Test in real environment', category: 'Delivery', icon: 'PlayCircle' },
          { id: 'implementation-plans', name: 'Implementation Plans', description: 'Plan rollout strategy', category: 'Delivery', icon: 'Calendar' }
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
  
  selectFramework: (framework) => set({ selectedFramework: framework }),
  selectStage: (stage) => set({ selectedStage: stage }),
  
  initializeFrameworks: () => set({ frameworks: sampleFrameworks })
}));