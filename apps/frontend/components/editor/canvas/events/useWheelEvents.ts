/**
 * Wheel/zoom event handlers
 */

import { useCallback } from 'react';
import { useEditorStore } from '../../../../state/useEditorStore';

const WORKSPACE_SIZE = 100000;
const LEFT_PANEL_WIDTH = 80;
const RULER_SIZE = 40;
const WORKSPACE_GUTTER = 200;
const BOTTOM_GUTTER = 20;

function clampPanToWorkspace(
  panX: number,
  panY: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const halfWorkspace = WORKSPACE_SIZE / 2;

  const maxPanX =
    LEFT_PANEL_WIDTH - WORKSPACE_GUTTER - canvasCenterX + halfWorkspace;
  const minPanX =
    canvasWidth - RULER_SIZE + WORKSPACE_GUTTER - canvasCenterX - halfWorkspace;

  const maxPanY =
    RULER_SIZE - WORKSPACE_GUTTER - canvasCenterY + halfWorkspace;
  const minPanY =
    canvasHeight - BOTTOM_GUTTER + WORKSPACE_GUTTER - canvasCenterY - halfWorkspace;

  return {
    x: Math.max(minPanX, Math.min(maxPanX, panX)),
    y: Math.max(minPanY, Math.min(maxPanY, panY)),
  };
}

/**
 * Hook for wheel/zoom event handling
 */
export function useWheelEvents(zoom: number, defaultViewScale: number) {
  const handleWheelCapture = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      // Always prevent default to stop browser zoom
      e.preventDefault();
      e.stopPropagation();

      const store = useEditorStore.getState();
      const { panX, panY } = store;

      // Zoom when Alt key is pressed OR trackpad gesture detected (very small delta)
      if (e.altKey || Math.abs(e.deltaY) < 1) {
        const delta = e.deltaY > 0 ? -0.08 : 0.08; // Balanced delta for smooth zoom
        const newZoom = Math.max(0.25, Math.min(4, zoom + delta));

        if (Math.abs(newZoom - zoom) > 0.01) {
          // Direct update for smooth response without lag
          store.setZoom(newZoom);
        }
      } else {
        // Normal mouse wheel scrolling - pan the canvas
        // Use deltaX for horizontal scrolling (shift + wheel) and deltaY for vertical
        const panSpeed = 1.0; // Adjust this value to control scroll sensitivity

        let newPanX = panX;
        let newPanY = panY;

        // Handle horizontal scrolling (shift + wheel or horizontal wheel)
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          newPanX = panX - (e.deltaX || e.deltaY) * panSpeed;
        } else {
          // Normal vertical scrolling
          newPanY = panY - e.deltaY * panSpeed;
        }

        const canvas = e.currentTarget;
        const { x: clampedPanX, y: clampedPanY } = clampPanToWorkspace(
          newPanX,
          newPanY,
          canvas.width,
          canvas.height
        );

        // Update pan position
        if (clampedPanX !== panX || clampedPanY !== panY) {
          store.setPan(clampedPanX, clampedPanY);
        }
      }
    },
    [zoom, defaultViewScale]
  );

  return { handleWheelCapture };
}

