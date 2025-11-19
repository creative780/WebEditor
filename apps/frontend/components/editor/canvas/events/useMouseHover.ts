/**
 * Mouse hover event handlers
 * Handles: cursor tracking, mouse enter/leave
 */

import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';

/**
 * Hook for mouse hover event handling
 */
export function useMouseHover(params: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setIsMouseDown: (value: boolean) => void;
  setIsDraggingObject: (value: boolean) => void;
  setIsTransforming: (value: boolean) => void;
  setTransformHandle: (handle: string | null) => void;
  setTransformEdgeSegment: (segment: any) => void;
  setIsPanning: (value: boolean) => void;
  setIsMarqueeSelecting: (value: boolean) => void;
  setIsDraggingArtboard: (value: boolean) => void;
  setHoveredHandle: (handle: string | null) => void;
  setHoveredEdgeSegment: (segment: any) => void;
  setHasMovedEnough: (value: boolean) => void;
  setCursorPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  setMousePosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  setHoveredObjectType: (type: string | null) => void;
}) {
  const {
    canvasRef,
    setIsMouseDown,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setIsPanning,
    setIsMarqueeSelecting,
    setIsDraggingArtboard,
    setHoveredHandle,
    setHoveredEdgeSegment,
    setHasMovedEnough,
    setCursorPosition,
    setMousePosition,
    setHoveredObjectType,
  } = params;

  const handleMouseEnter = useCallback(() => {
    // Ensure cursor position is initialized when mouse enters canvas
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Stop all interactions when mouse leaves canvas
    setIsMouseDown(false);
    setIsDraggingObject(false);
    setIsTransforming(false);
    setTransformHandle(null);
    setTransformEdgeSegment(null);
    setIsPanning(false);
    setIsMarqueeSelecting(false);
    setIsDraggingArtboard(false);
    setHoveredHandle(null);
    setHoveredEdgeSegment(null);
    setHoveredObjectType(null);
    setHasMovedEnough(false);
  }, [
    setIsMouseDown,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setIsPanning,
    setIsMarqueeSelecting,
    setIsDraggingArtboard,
    setHoveredHandle,
    setHoveredEdgeSegment,
    setHoveredObjectType,
    setHasMovedEnough,
  ]);

  // Global mouse move handler for live cursor tracking
  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      const isOverCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isOverCanvas) {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        const nextCursorPosition = {
          x: relativeX,
          y: relativeY,
        };

        setCursorPosition((prev) => {
          if (prev.x === nextCursorPosition.x && prev.y === nextCursorPosition.y) {
            return prev;
          }
          return nextCursorPosition;
        });

        setMousePosition((prev) => {
          if (prev.x === relativeX && prev.y === relativeY) {
            return prev;
          }
          return { x: relativeX, y: relativeY };
        });
      }
    },
    [canvasRef, setCursorPosition, setMousePosition]
  );

  // Add global mouse move listener for live cursor tracking
  useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        handleGlobalMouseMove(e);
      });
    };

    document.addEventListener('mousemove', throttledMouseMove, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
    };
  }, [handleGlobalMouseMove]);

  // Global mouse up handler to stop dragging if mouse is released outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setIsDraggingObject(false);
      setIsTransforming(false);
      setTransformHandle(null);
      setTransformEdgeSegment(null);
      setIsPanning(false);
      setIsMarqueeSelecting(false);
      setIsDraggingArtboard(false);
      setHasMovedEnough(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [
    setIsMouseDown,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setIsPanning,
    setIsMarqueeSelecting,
    setIsDraggingArtboard,
    setHasMovedEnough,
  ]);

  return {
    handleMouseEnter,
    handleMouseLeave,
  };
}

