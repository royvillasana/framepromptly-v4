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
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <NodeResizer
        color={selected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
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
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0',
        flex: '1'
      }}>
        {children}
      </div>
    </div>
  );
};