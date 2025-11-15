/**
 * Mouse up event handler
 * Handles cleanup and state reset
 */

import { useCallback } from 'react';
import type { MouseEventsParams } from './useMouseEvents';

/**
 * Hook for mouse up event handling
 */
export function useMouseUp(params: MouseEventsParams & {
  isDraggingText: boolean;
  isTextDragMode: boolean;
  dragFrameRef: React.MutableRefObject<number | null>;
  panFrameRef: React.MutableRefObject<number | null>;
  pendingPanRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const {
    setIsMouseDown,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setIsMarqueeSelecting,
    setIsPanning,
    setIsDraggingArtboard,
    setHasMovedEnough,
    isDraggingObjectRef,
    isMouseDownRef,
    dragFrameRef,
    panFrameRef,
    pendingPanRef,
    isTransforming,
    isDraggingObject,
    isMarqueeSelecting,
    isDraggingArtboard,
    isPanning,
    isDraggingText,
    isTextDragMode,
  } = params;

  const handleMouseUp = useCallback(
    (e?: React.MouseEvent<HTMLCanvasElement>) => {
      // Handle end of transform operation
      if (isTransforming) {
        setIsTransforming(false);
        setTransformHandle(null);
        setTransformEdgeSegment(null);
        setIsMouseDown(false);
        setHasMovedEnough(false);
        return;
      }

      // Handle end of object dragging
      if (isDraggingObject || isDraggingObjectRef.current) {
        setIsDraggingObject(false);
        isDraggingObjectRef.current = false;
        if (dragFrameRef.current) {
          cancelAnimationFrame(dragFrameRef.current);
          dragFrameRef.current = null;
        }
        setIsMouseDown(false);
        isMouseDownRef.current = false;
        setHasMovedEnough(false);
        return;
      }

      // Handle end of marquee selection
      if (isMarqueeSelecting) {
        setIsMarqueeSelecting(false);
        setIsMouseDown(false);
        setHasMovedEnough(false);
        return;
      }

      // Handle end of artboard dragging
      if (isDraggingArtboard) {
        setIsDraggingArtboard(false);
        setIsMouseDown(false);
        setHasMovedEnough(false);
        return;
      }

      // Handle end of panning
      if (isPanning) {
        setIsPanning(false);
        setIsMouseDown(false);
        setHasMovedEnough(false);

        if (panFrameRef.current) {
          cancelAnimationFrame(panFrameRef.current);
          panFrameRef.current = null;
        }
        pendingPanRef.current = { x: 0, y: 0 };

        return;
      }

      // Reset all mouse states
      setIsMouseDown(false);
      isMouseDownRef.current = false;
      setIsDraggingObject(false);
      isDraggingObjectRef.current = false;
      setIsTransforming(false);
      setTransformHandle(null);
      setTransformEdgeSegment(null);
      setIsMarqueeSelecting(false);
      setIsDraggingArtboard(false);
      setHasMovedEnough(false);
      setIsPanning(false);
    },
    [
      isTransforming,
      isDraggingObject,
      isMarqueeSelecting,
      isDraggingArtboard,
      isPanning,
      setIsMouseDown,
      setIsDraggingObject,
      setIsTransforming,
      setTransformHandle,
      setTransformEdgeSegment,
      setIsMarqueeSelecting,
      setIsPanning,
      setIsDraggingArtboard,
      setHasMovedEnough,
      isDraggingObjectRef,
      isMouseDownRef,
      dragFrameRef,
      panFrameRef,
      pendingPanRef,
    ]
  );

  return { handleMouseUp };
}

