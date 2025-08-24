import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, HandleType } from '@xyflow/react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

interface DraggableHandleProps {
  id: string;
  type: HandleType;
  initialPosition?: HandlePosition;
  onPositionChange?: (position: HandlePosition) => void;
  className?: string;
  nodeId?: string;
}

const positionMap: Record<HandlePosition, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

const positionOffsets: Record<HandlePosition, { x: string; y: string }> = {
  top: { x: '50%', y: '0%' },
  right: { x: '100%', y: '50%' },
  bottom: { x: '50%', y: '100%' },
  left: { x: '0%', y: '50%' },
};

export const DraggableHandle = ({
  id,
  type,
  initialPosition = 'right',
  onPositionChange,
  className,
  nodeId
}: DraggableHandleProps) => {
  const [currentPosition, setCurrentPosition] = useState<HandlePosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset;
    
    // Determine which side is closest based on drag offset
    const threshold = 30; // minimum distance to trigger position change
    let newPosition: HandlePosition = currentPosition;
    
    // Calculate which edge the handle should snap to based on drag distance
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    
    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        // Horizontal movement is greater
        newPosition = x > 0 ? 'right' : 'left';
      } else {
        // Vertical movement is greater
        newPosition = y > 0 ? 'bottom' : 'top';
      }
    }

    if (newPosition !== currentPosition) {
      setCurrentPosition(newPosition);
    }

    setDragOffset({ x, y });
  }, [currentPosition]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    onPositionChange?.(currentPosition);
  }, [currentPosition, onPositionChange]);

  const baseOffset = positionOffsets[currentPosition];
  
  // Calculate transform for centering the handle
  const getTransform = (position: HandlePosition) => {
    switch (position) {
      case 'top':
        return 'translate(-50%, -50%)';
      case 'right':
        return 'translate(-50%, -50%)';
      case 'bottom':
        return 'translate(-50%, -50%)';
      case 'left':
        return 'translate(-50%, -50%)';
      default:
        return 'translate(-50%, -50%)';
    }
  };

  return (
    <>
      <motion.div
        ref={constraintsRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          "absolute z-10 cursor-move",
          isDragging && "cursor-grabbing scale-125"
        )}
        style={{
          left: baseOffset.x,
          top: baseOffset.y,
          transform: getTransform(currentPosition),
          x: isDragging ? dragOffset.x : 0,
          y: isDragging ? dragOffset.y : 0,
        }}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.2 }}
        animate={{
          left: baseOffset.x,
          top: baseOffset.y,
          transform: getTransform(currentPosition),
          x: isDragging ? dragOffset.x : 0,
          y: isDragging ? dragOffset.y : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <Handle
          type={type}
          position={positionMap[currentPosition]}
          id={`${id}-${currentPosition}`}
          className={cn(
            "w-4 h-4 border-2 border-background transition-all duration-200",
            "hover:scale-110 active:scale-125",
            isDragging ? "bg-primary-foreground ring-2 ring-primary ring-offset-1" : "bg-primary",
            className
          )}
        />
        
        {/* Visual indicator when dragging */}
        {isDragging && (
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-primary/50 bg-primary/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
      </motion.div>
      
      {/* Position indicators when dragging */}
      {isDragging && (
        <>
          <motion.div
            className="absolute w-12 h-1 bg-primary/50 rounded-full"
            style={{
              top: '0%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: currentPosition === 'top' ? 1 : 0.3,
              scale: currentPosition === 'top' ? 1.2 : 1,
            }}
          />
          <motion.div
            className="absolute w-1 h-12 bg-primary/50 rounded-full"
            style={{
              top: '50%',
              right: '0%',
              transform: 'translate(50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: currentPosition === 'right' ? 1 : 0.3,
              scale: currentPosition === 'right' ? 1.2 : 1,
            }}
          />
          <motion.div
            className="absolute w-12 h-1 bg-primary/50 rounded-full"
            style={{
              bottom: '0%',
              left: '50%',
              transform: 'translate(-50%, 50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: currentPosition === 'bottom' ? 1 : 0.3,
              scale: currentPosition === 'bottom' ? 1.2 : 1,
            }}
          />
          <motion.div
            className="absolute w-1 h-12 bg-primary/50 rounded-full"
            style={{
              top: '50%',
              left: '0%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: currentPosition === 'left' ? 1 : 0.3,
              scale: currentPosition === 'left' ? 1.2 : 1,
            }}
          />
        </>
      )}
    </>
  );
};

// Hook for managing multiple draggable handles on a node
export const useDraggableHandles = (nodeId?: string) => {
  const [handlePositions, setHandlePositions] = useState<Record<string, HandlePosition>>({
    source: 'right',
    target: 'left'
  });

  const updateHandlePosition = useCallback((handleId: string, position: HandlePosition) => {
    setHandlePositions(prev => ({
      ...prev,
      [handleId]: position
    }));

    // Optionally save to localStorage or node data
    if (nodeId) {
      const key = `handle-positions-${nodeId}`;
      const savedPositions = { ...handlePositions, [handleId]: position };
      localStorage.setItem(key, JSON.stringify(savedPositions));
    }
  }, [handlePositions, nodeId]);

  // Load saved positions on mount
  useEffect(() => {
    if (nodeId) {
      const key = `handle-positions-${nodeId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsedPositions = JSON.parse(saved);
          setHandlePositions(parsedPositions);
        } catch (error) {
          console.warn('Failed to load handle positions:', error);
        }
      }
    }
  }, [nodeId]);

  return { handlePositions, updateHandlePosition };
};