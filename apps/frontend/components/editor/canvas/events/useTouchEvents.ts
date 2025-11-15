/**
 * Touch event handlers for trackpad gesture prevention
 */

import { useCallback } from 'react';

/**
 * Hook for touch event handling
 */
export function useTouchEvents() {
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length > 1) {
        // Multi-touch gesture (pinch zoom) - prevent browser zoom
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length > 1) {
        // Multi-touch gesture (pinch zoom) - prevent browser zoom
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length > 1) {
        // Multi-touch gesture (pinch zoom) - prevent browser zoom
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

