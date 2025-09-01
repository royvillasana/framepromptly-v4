import { NodeResizer } from '@xyflow/react';
import { ReactNode } from 'react';

interface ResizableNodeProps {
  children: ReactNode;
  selected?: boolean;
  minWidth?: number;
  minHeight?: number | "auto";
  maxWidth?: number;
  maxHeight?: number;
  nodeType?: string;
  initialWidth?: number;
  initialHeight?: number | "auto";
  nodeId?: string;
}

export const ResizableNode = ({ 
  children, 
  selected = false, 
  minWidth, 
  minHeight,
  maxWidth,
  maxHeight,
  nodeType = 'default',
  initialWidth,
  initialHeight,
  nodeId
}: ResizableNodeProps) => {
  // Get node type specific dimensions
  const getNodeDimensions = () => {
    const defaults = {
      framework: { 
        minWidth: minWidth || 280, 
        maxWidth: maxWidth || 400,
        minHeight: typeof minHeight === 'number' ? minHeight : 450,
        maxHeight: maxHeight || 700
      },
      stage: { 
        minWidth: minWidth || 240, 
        maxWidth: maxWidth || 350,
        minHeight: typeof minHeight === 'number' ? minHeight : 380,
        maxHeight: maxHeight || 550
      },
      tool: { 
        minWidth: minWidth || 260, 
        maxWidth: maxWidth || 380,
        minHeight: typeof minHeight === 'number' ? minHeight : 420,
        maxHeight: maxHeight || 650
      },
      prompt: { 
        minWidth: minWidth || 1250, 
        maxWidth: maxWidth || 1600,
        minHeight: typeof minHeight === 'number' ? minHeight : 300,
        maxHeight: maxHeight || 600
      },
      default: { 
        minWidth: minWidth || 280, 
        maxWidth: maxWidth || 600,
        minHeight: typeof minHeight === 'number' ? minHeight : 200,
        maxHeight: maxHeight || 800
      }
    };
    
    return defaults[nodeType as keyof typeof defaults] || defaults.default;
  };

  const dimensions = getNodeDimensions();
  
  return (
    <>
      <NodeResizer
        color={selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
        isVisible={selected}
        minWidth={dimensions.minWidth}
        minHeight={dimensions.minHeight}
        maxWidth={dimensions.maxWidth}
        maxHeight={dimensions.maxHeight}
        handleStyle={{
          backgroundColor: 'hsl(var(--primary))',
          border: '2px solid white',
          borderRadius: '4px',
          width: '8px',
          height: '8px'
        }}
        lineStyle={{
          borderColor: 'hsl(var(--primary))',
          borderWidth: '1px',
          borderStyle: 'dashed'
        }}
      />
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="resizable-node-content"
      >
        {children}
      </div>
    </>
  );
};