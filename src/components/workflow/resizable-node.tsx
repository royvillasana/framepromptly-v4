import { NodeResizer } from '@xyflow/react';
import { ReactNode } from 'react';

interface ResizableNodeProps {
  children: ReactNode;
  selected?: boolean;
  minWidth?: number;
  minHeight?: number | "auto";
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
  // Handle auto minHeight by not constraining height when auto
  const shouldConstrainHeight = minHeight !== "auto";
  const resolvedMinHeight = minHeight === "auto" ? 50 : minHeight;
  
  return (
    <div style={{ 
      width: '100%', 
      height: shouldConstrainHeight ? '100%' : 'auto',
      minHeight: shouldConstrainHeight ? undefined : 'auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <NodeResizer
        color={selected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
        isVisible={selected && shouldConstrainHeight}
        minWidth={minWidth}
        minHeight={resolvedMinHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        handleStyle={{
          backgroundColor: 'hsl(var(--background))',
          border: '2px solid hsl(var(--primary))',
          borderRadius: '2px',
          width: '8px',
          height: '8px'
        }}
        lineStyle={{
          borderColor: 'hsl(var(--primary))',
          borderWidth: '2px'
        }}
        keepAspectRatio={false}
      />
      <div style={{ 
        width: '100%', 
        height: shouldConstrainHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: shouldConstrainHeight ? '0' : 'auto',
        flex: shouldConstrainHeight ? '1' : 'none'
      }}>
        {children}
      </div>
    </div>
  );
};