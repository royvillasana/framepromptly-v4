import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  X,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { getSmartPosition } from '@/utils/node-positioning';

interface ToolbarCenteredAIBuilderProps {
  onWorkflowGenerated?: (nodes: any[], edges: any[]) => void;
}

export function ToolbarCenteredAIBuilder({ onWorkflowGenerated }: ToolbarCenteredAIBuilderProps) {
  const { addNode, nodes } = useWorkflowStore();

  const handleCreateAIBuilderNode = () => {
    // Get smart position for the new AI Builder node
    const position = getSmartPosition('ai-builder', nodes);

    // Create AI Builder node
    const aiBuilderNodeId = `ai-builder-${Date.now()}`;
    const aiBuilderNode = {
      id: aiBuilderNodeId,
      type: 'ai-builder' as const,
      position,
      data: {
        isGenerating: false,
      },
    };

    addNode(aiBuilderNode);
  };

  return (
    <Button
      onClick={handleCreateAIBuilderNode}
      size="sm"
      variant="outline"
      className="relative transition-all duration-300 group hover:bg-primary/10 hover:text-primary hover:scale-105"
    >
      <motion.div
        animate={{ rotate: 0 }}
        transition={{ duration: 2, ease: "linear" }}
      >
        <Sparkles className="h-4 w-4 mr-2" />
      </motion.div>
      AI Builder

      {/* Pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-md bg-primary/20"
        animate={{ scale: [1, 1.05, 1], opacity: [0, 0.3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </Button>
  );
}