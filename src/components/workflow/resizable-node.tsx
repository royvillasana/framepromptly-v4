import { NodeResizer } from '@xyflow/react';
import { ReactNode } from 'react';

interface ResizableNodeProps {
  children: ReactNode;
  selected?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const ResizableNode = ({ 
  children, 
  selected = false, 
  minWidth = 200, 
  minHeight = 100,
  maxWidth = 1000,
  maxHeight = 800 
}: ResizableNodeProps) => {
  return (
    <>
      <NodeResizer
        color={selected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        handleClassName="w-4 h-4 border-2 border-primary bg-background hover:bg-primary hover:border-primary-foreground transition-colors rounded-sm shadow-md"
        lineClassName="border-2 border-primary"
        shouldResize={(event, params) => {
          // Allow resize from all directions
          return true;
        }}
      />
      {children}
    </>
  );
};