import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AIBuilderService, WorkflowGeneration, createAIBuilderService, convertAIGenerationToNodes } from '@/services/ai-builder';
import { Framework } from './workflow-store';

interface AIBuilderState {
  // UI State
  isExpanded: boolean;
  isGenerating: boolean;
  currentPrompt: string;
  error: string | null;
  
  // Conversation State
  conversationHistory: Array<{
    id: string;
    prompt: string;
    response: WorkflowGeneration | null;
    timestamp: Date;
    error?: string;
  }>;
  
  // Generation State
  currentGeneration: WorkflowGeneration | null;
  previewNodes: any[];
  previewEdges: any[];
  showPreview: boolean;
  
  // Service
  aiService: AIBuilderService | null;
  
  // Actions
  toggleExpanded: () => void;
  setCurrentPrompt: (prompt: string) => void;
  clearError: () => void;
  generateWorkflow: (prompt: string, frameworks: Framework[]) => Promise<void>;
  refineWorkflow: (refinementPrompt: string) => Promise<void>;
  acceptGeneration: () => { nodes: any[]; edges: any[]; framework?: Framework };
  rejectGeneration: () => void;
  showWorkflowPreview: (show: boolean) => void;
  clearConversation: () => void;
  initializeService: () => void;
}

export const useAIBuilderStore = create<AIBuilderState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isExpanded: false,
    isGenerating: false,
    currentPrompt: '',
    error: null,
    conversationHistory: [],
    currentGeneration: null,
    previewNodes: [],
    previewEdges: [],
    showPreview: false,
    aiService: null,

    // Actions
    toggleExpanded: () => {
      set((state) => ({
        isExpanded: !state.isExpanded,
        error: null, // Clear errors when toggling
      }));
    },

    setCurrentPrompt: (prompt: string) => {
      set({ currentPrompt: prompt, error: null });
    },

    clearError: () => {
      set({ error: null });
    },

    initializeService: () => {
      try {
        const service = createAIBuilderService();
        set({ aiService: service });
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to initialize AI service' 
        });
      }
    },

    generateWorkflow: async (prompt: string, frameworks: Framework[]) => {
      const { aiService } = get();
      
      if (!aiService) {
        set({ error: 'AI service not initialized. Please check your API key configuration.' });
        return;
      }

      if (!prompt.trim()) {
        set({ error: 'Please enter a prompt to generate a workflow.' });
        return;
      }

      set({
        isGenerating: true,
        error: null,
        currentPrompt: prompt,
        currentGeneration: null,
        showPreview: false,
      });

      try {
        const generation = await aiService.generateWorkflow(prompt, frameworks);
        const { nodes, edges } = convertAIGenerationToNodes(generation, frameworks);

        // Add to conversation history
        const conversationEntry = {
          id: `conversation-${Date.now()}`,
          prompt,
          response: generation,
          timestamp: new Date(),
        };

        console.log('🔍 [AI Builder Store] Setting generation state:', {
          nodesCount: nodes.length,
          edgesCount: edges.length,
          showPreview: true,
          generation: generation,
        });

        set((state) => ({
          isGenerating: false,
          currentGeneration: generation,
          previewNodes: nodes,
          previewEdges: edges,
          showPreview: true,
          conversationHistory: [...state.conversationHistory, conversationEntry],
          currentPrompt: '', // Clear input after successful generation
        }));

        console.log('🔍 [AI Builder Store] State after set:', {
          previewNodesCount: get().previewNodes.length,
          previewEdgesCount: get().previewEdges.length,
          showPreview: get().showPreview,
        });
      } catch (error) {
        console.error('Workflow generation failed:', error);
        
        const conversationEntry = {
          id: `conversation-${Date.now()}`,
          prompt,
          response: null,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        set((state) => ({
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Failed to generate workflow',
          conversationHistory: [...state.conversationHistory, conversationEntry],
        }));
      }
    },

    refineWorkflow: async (refinementPrompt: string) => {
      const { aiService, currentGeneration } = get();
      
      if (!aiService) {
        set({ error: 'AI service not initialized.' });
        return;
      }

      if (!currentGeneration) {
        set({ error: 'No workflow to refine. Please generate a workflow first.' });
        return;
      }

      if (!refinementPrompt.trim()) {
        set({ error: 'Please enter a refinement request.' });
        return;
      }

      set({
        isGenerating: true,
        error: null,
      });

      try {
        const refinedGeneration = await aiService.refineWorkflow(currentGeneration, refinementPrompt);
        const frameworks = []; // We'll need to pass frameworks from the component
        const { nodes, edges } = convertAIGenerationToNodes(refinedGeneration, frameworks);

        const conversationEntry = {
          id: `conversation-${Date.now()}`,
          prompt: `Refine: ${refinementPrompt}`,
          response: refinedGeneration,
          timestamp: new Date(),
        };

        set((state) => ({
          isGenerating: false,
          currentGeneration: refinedGeneration,
          previewNodes: nodes,
          previewEdges: edges,
          showPreview: true,
          conversationHistory: [...state.conversationHistory, conversationEntry],
          currentPrompt: '',
        }));
      } catch (error) {
        console.error('Workflow refinement failed:', error);
        
        const conversationEntry = {
          id: `conversation-${Date.now()}`,
          prompt: `Refine: ${refinementPrompt}`,
          response: null,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        set((state) => ({
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Failed to refine workflow',
          conversationHistory: [...state.conversationHistory, conversationEntry],
        }));
      }
    },

    acceptGeneration: () => {
      const { previewNodes, previewEdges, currentGeneration } = get();

      console.log('🎯 [AI Builder Store] acceptGeneration called:', {
        previewNodesCount: previewNodes.length,
        previewEdgesCount: previewEdges.length,
        hasCurrentGeneration: !!currentGeneration,
      });

      // Clear the preview and generation state
      set({
        currentGeneration: null,
        previewNodes: [],
        previewEdges: [],
        showPreview: false,
        isExpanded: false, // Collapse the AI builder after acceptance
      });

      // Return the nodes and edges to be added to the main workflow
      const result = {
        nodes: previewNodes,
        edges: previewEdges,
        framework: undefined, // Framework will be determined by convertAIGenerationToNodes
      };

      console.log('🎯 [AI Builder Store] Returning:', {
        nodesCount: result.nodes.length,
        edgesCount: result.edges.length,
      });

      return result;
    },

    rejectGeneration: () => {
      set({
        currentGeneration: null,
        previewNodes: [],
        previewEdges: [],
        showPreview: false,
      });
    },

    showWorkflowPreview: (show: boolean) => {
      set({ showPreview: show });
    },

    clearConversation: () => {
      set({
        conversationHistory: [],
        currentGeneration: null,
        previewNodes: [],
        previewEdges: [],
        showPreview: false,
        error: null,
        currentPrompt: '',
      });
    },
  }))
);

// Initialize the AI service when the store is created
useAIBuilderStore.getState().initializeService();