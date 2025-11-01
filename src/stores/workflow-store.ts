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
  expandedPromptId: string | null;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  loadCanvasData: (canvasData: any) => void;
  updateNode: (id: string, data: any) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeDimensions: (id: string, dimensions: { width: number; height: number }) => void;
  addKnowledgeDocumentNode: (knowledgeEntry: any, position?: { x: number; y: number }) => void;
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
  setExpandedPromptId: (id: string | null) => void;
  initializeFrameworks: () => void;
}

import completeUXFrameworks from '@/lib/complete-ux-frameworks';

// All 9 UX frameworks with complete data  
const sampleFrameworks: UXFramework[] = completeUXFrameworks;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedFramework: null,
  selectedStage: null,
  selectedNode: null,
  nodeCustomizations: {},
  frameworks: [],
  expandedPromptId: null,

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

  addKnowledgeDocumentNode: (knowledgeEntry, position) => {
    const state = get();
    
    // Generate unique node ID
    const nodeId = `knowledge-document-${knowledgeEntry.id}-${Date.now()}`;
    
    // Calculate smart position if none provided
    const defaultPosition = position || (() => {
      // Position knowledge nodes to the left of tool nodes
      const toolNodes = state.nodes.filter(node => node.type === 'tool');
      if (toolNodes.length > 0) {
        // Find leftmost tool node and position knowledge node to its left
        const leftmostTool = toolNodes.reduce((leftmost, current) => 
          current.position.x < leftmost.position.x ? current : leftmost
        );
        return {
          x: leftmostTool.position.x - 400, // Position 400px to the left
          y: leftmostTool.position.y + (Math.random() - 0.5) * 200 // Slight vertical offset
        };
      }
      
      // Default position if no tool nodes exist
      const existingKnowledgeNodes = state.nodes.filter(node => node.type === 'knowledge-document');
      return {
        x: 100,
        y: 100 + existingKnowledgeNodes.length * 150
      };
    })();

    const knowledgeNode = {
      id: nodeId,
      type: 'knowledge-document',
      position: defaultPosition,
      data: {
        knowledgeEntry,
        size: 'preview', // Default size
        connectedTools: [],
        isEditing: false
      },
      draggable: true,
      selectable: true
    };

    // Add the node
    state.addNode(knowledgeNode);
    
    console.log('Added knowledge document node:', nodeId, knowledgeEntry.title);
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
  setExpandedPromptId: (id) => {
    console.log('[Workflow Store] setExpandedPromptId called:', id, 'Stack:', new Error().stack);
    set({ expandedPromptId: id });
  },
  
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