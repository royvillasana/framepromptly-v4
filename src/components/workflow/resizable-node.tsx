import { NodeResizer } from '@xyflow/react';
import { ReactNode, useRef, useEffect, useState, useCallback } from 'react';

interface ResizableNodeProps {
  children: ReactNode;
  selected?: boolean;
  minWidth?: number;
  minHeight?: number | "auto";
  maxWidth?: number;
  maxHeight?: number;
  nodeType?: string;
}

export const ResizableNode = ({ 
  children, 
  selected = false, 
  minWidth = 280, 
  minHeight = "auto",
  maxWidth = 600,
  maxHeight = 800,
  nodeType = 'default'
}: ResizableNodeProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentDimensions, setContentDimensions] = useState<{width: number, height: number}>({
    width: 0,
    height: 0
  });
  const [isResizing, setIsResizing] = useState(false);
  const autoHeight = minHeight === "auto";
  
  // Simplified content dimension calculation - focus on maintaining proper aspect ratios
  const calculateContentDimensions = useCallback(() => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    
    // Get natural content dimensions without forcing scrollWidth/scrollHeight
    // which can cause sizing mismatches
    const rect = element.getBoundingClientRect();
    
    setContentDimensions({
      width: Math.max(rect.width, 280), // Minimum width
      height: Math.max(rect.height, 120) // Minimum height
    });
  }, []);
  
  // Calculate content-based dimensions on mount and content changes
  useEffect(() => {
    calculateContentDimensions();
    
    // Use ResizeObserver to detect content changes
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!isResizing) {
          calculateContentDimensions();
        }
      });
      
      resizeObserver.observe(contentRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [children, calculateContentDimensions, isResizing]);
  
  // Simplified minimum dimensions - focus on base dimensions for better consistency
  const getMinDimensions = () => {
    // Base minimum dimensions by node type - these should be the primary sizing
    const baseMinimums = {
      framework: { width: 320, height: 220 },
      stage: { width: 280, height: 180 },
      tool: { width: 340, height: 220 },
      prompt: { width: 400, height: 280 },
      default: { width: minWidth || 280, height: 140 }
    };
    
    const baseDims = baseMinimums[nodeType as keyof typeof baseMinimums] || baseMinimums.default;
    
    // Use base dimensions as primary sizing to avoid layout issues
    // Only grow slightly if content is significantly larger
    const finalWidth = Math.max(baseDims.width, minWidth || baseDims.width);
    const finalHeight = typeof minHeight === 'number' ? minHeight : baseDims.height;
    
    return { width: finalWidth, height: finalHeight };
  };
  
  // Enhanced maximum dimensions based on node type with generous limits
  const getMaxDimensions = () => {
    switch (nodeType) {
      case 'framework':
        return { width: 600, height: 700 };
      case 'stage':
        return { width: 500, height: 600 };
      case 'tool':
        return { width: 600, height: 650 };
      case 'prompt':
        return { width: 1000, height: 1200 }; // Very generous limits for prompt content
      default:
        return { width: maxWidth, height: maxHeight };
    }
  };
  
  const minDims = getMinDimensions();
  const maxDims = getMaxDimensions();
  const resolvedMinHeight = minDims.height;
  
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%',
        minWidth: `${minDims.width}px`,
        minHeight: `${minDims.height}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Prevent content from breaking out of node bounds
      }}
      className="resizable-node-wrapper"
    >
      <NodeResizer
        color={selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
        isVisible={selected}
        minWidth={minDims.width}
        minHeight={resolvedMinHeight}
        maxWidth={maxDims.width}
        maxHeight={maxDims.height}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => {
          setIsResizing(false);
          // Recalculate content dimensions after resize
          setTimeout(calculateContentDimensions, 100);
        }}
        handleStyle={{
          backgroundColor: '#0461C3',
          border: '2px solid #ffffff',
          borderRadius: '4px',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 6px rgba(4, 97, 195, 0.3)',
          cursor: 'nw-resize'
        }}
        lineStyle={{
          borderColor: '#0461C3',
          borderWidth: '2px',
          borderStyle: 'dashed'
        }}
        keepAspectRatio={false}
      />
      <div 
        ref={contentRef}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // No scrolling - content should fit
          position: 'relative',
          boxSizing: 'border-box'
        }}
        className="resizable-node-content"
      >
        {children}
      </div>
      
      {/* Visual indicator when node is selected but not actively resizing */}
      {selected && (
        <div 
          className="absolute inset-0 pointer-events-none border-2 rounded-md"
          style={{ 
            borderColor: 'rgba(4, 97, 195, 0.3)',
            zIndex: -1 
          }}
        />
      )}
    </div>
  );
};