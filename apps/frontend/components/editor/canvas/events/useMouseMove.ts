/**
 * Mouse move event handler
 * Handles: dragging, transforming, panning, marquee selection, hover detection
 * OPTIMIZED: Throttled hover detection, cached calculations
 */

import { useCallback, useRef } from 'react';
import { useEditorStore } from '../../../../state/useEditorStore';
import type { ShapeObj } from '../../../../state/useEditorStore';
import { type EdgeSegment } from '../../../../lib/shapePathUtils';
import { scaleShape } from '../../../../lib/shapeScaling';
import {
  calculateSelectionPadding,
  getTransformHandleAt,
} from '../utils/hitDetection';
import { convertMouseToArtboard } from '../utils/mouseUtils';
import type { MouseEventsParams } from './useMouseEvents';
import { updateObjectBounds, hasObjectBoundsChanged } from '../utils/handleCache';

const DRAG_THRESHOLD = 5; // pixels
const WORKSPACE_SIZE = 100000;
const LEFT_PANEL_WIDTH = 80;
const RULER_SIZE = 40;
const WORKSPACE_GUTTER = 200;
const BOTTOM_GUTTER = 20;

// Throttle hover detection to 60fps (16ms)
const HOVER_THROTTLE_MS = 16;

function getPivotForEdgeSegment(
  shape: ShapeObj,
  segment: EdgeSegment,
  documentDpi: number,
  forceCenter = false
) {
  const left = shape.x * documentDpi;
  const top = shape.y * documentDpi;
  const width = shape.width * documentDpi;
  const height = shape.height * documentDpi;
  const right = left + width;
  const bottom = top + height;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  if (forceCenter) {
    return { x: centerX, y: centerY };
  }

  switch (segment.type) {
    case 'n':
      return { x: centerX, y: bottom };
    case 's':
      return { x: centerX, y: top };
    case 'e':
      return { x: left, y: centerY };
    case 'w':
      return { x: right, y: centerY };
    case 'ne':
      return { x: left, y: bottom };
    case 'nw':
      return { x: right, y: bottom };
    case 'se':
      return { x: left, y: top };
    case 'sw':
      return { x: right, y: top };
    default: {
      const normalX = segment.normal?.x ?? 0;
      const normalY = segment.normal?.y ?? 0;
      const normalLength = Math.hypot(normalX, normalY) || 1;
      const normalizedX = normalX / normalLength;
      const normalizedY = normalY / normalLength;

      return {
        x: centerX - normalizedX * (width / 2),
        y: centerY - normalizedY * (height / 2),
      };
    }
  }
}

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
 * Hook for mouse move event handling
 */
export function useMouseMove(params: MouseEventsParams & {
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setMousePosition: (pos: { x: number; y: number }) => void;
  isDraggingText: boolean;
  isTextDragMode: boolean;
  transformEdgeSegment: EdgeSegment | null;
  setHoveredObjectType: (type: string | null) => void;
}) {
  const {
    canvasRef,
    containerRef,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setTransformStart,
    setCurrentRotation,
    setIsMarqueeSelecting,
    setMarqueeEnd,
    setIsPanning,
    setLastPanPoint,
    setIsDraggingArtboard,
    setArtboardDragStart,
    setDragOffset,
    setNeedsRender,
    setHoveredHandle,
    setHoveredEdgeSegment,
    selectedObjects,
    zoom,
    documentDpi,
    defaultViewScale,
    isTransforming,
    transformHandle,
    transformEdgeSegment,
    transformStart,
    transformOrigin,
    isDraggingObject,
    isMouseDown,
    isMarqueeSelecting,
    marqueeStart,
    isPanning,
    lastPanPoint,
    isDraggingArtboard,
    artboardDragStart,
    dragOffset,
    initialMousePos,
    hasMovedEnough,
    isMouseDownRef,
    isDraggingObjectRef,
    dragFrameRef,
    pendingDragUpdatesRef,
    panFrameRef,
    pendingPanRef,
    setCursorPosition,
    setMousePosition,
    isDraggingText,
    isTextDragMode,
    setHoveredObjectType,
  } = params;

  // Throttle hover detection
  const hoverThrottleRef = useRef<number | null>(null);
  const lastHoverCheckRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastHoverResultRef = useRef<string | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const storeState = useEditorStore.getState();
      const { panX, panY } = storeState;

      // Convert mouse to artboard coordinates
      const coords = convertMouseToArtboard(
        e.clientX,
        e.clientY,
        rect,
        canvas.width,
        canvas.height,
        panX,
        panY,
        zoom,
        defaultViewScale,
        documentDpi
      );

      const { artboardMouseX, artboardMouseY, documentX, documentY, effectiveZoom } = coords;

      // Update cursor position for ruler indicators
      const newCursorPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setCursorPosition(newCursorPosition);
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      // Get fresh selection from store (cache at start of handler)
      const currentSelection = storeState.selection;

      // OPTIMIZED: Throttled hover detection
      const performHoverCheck = () => {
        // First, check for any object under the cursor (for text cursor detection)
        const objects = storeState.objects;
        const reversedObjects = [...objects].reverse();
        const hoveredObject = reversedObjects.find((obj) => {
          const objX = obj.x * documentDpi;
          const objY = obj.y * documentDpi;
          const objWidth = obj.width * documentDpi;
          const objHeight = obj.height * documentDpi;

          return (
            artboardMouseX >= objX &&
            artboardMouseX <= objX + objWidth &&
            artboardMouseY >= objY &&
            artboardMouseY <= objY + objHeight
          );
        });

        // Update hovered object type (for cursor styling)
        if (hoveredObject && hoveredObject.type === 'text') {
          setHoveredObjectType('text');
        } else {
          setHoveredObjectType(null);
        }

        // Then check for transform handles on selected objects
        if (!isTransforming && !isDraggingObject && currentSelection.length > 0) {
          const selectedObj = storeState.objects.find(
            (obj) => obj.id === currentSelection[0]
          );
          if (selectedObj) {
            const objX = selectedObj.x * documentDpi;
            const objY = selectedObj.y * documentDpi;
            const objWidth = selectedObj.width * documentDpi;
            const objHeight = selectedObj.height * documentDpi;

            // Update bounds cache if changed
            const bounds = { x: objX, y: objY, width: objWidth, height: objHeight };
            if (hasObjectBoundsChanged(selectedObj.id, bounds)) {
              updateObjectBounds(selectedObj.id, bounds);
            }

            // Use cached padding calculation
            const { paddingX, paddingY } = calculateSelectionPadding(
              selectedObj,
              effectiveZoom,
              selectedObj.id
            );

            // Use cached handle detection
            const handleUnderPointer = getTransformHandleAt(
              artboardMouseX,
              artboardMouseY,
              objX,
              objY,
              objWidth,
              objHeight,
              effectiveZoom,
              paddingX,
              paddingY,
              selectedObj.id
            );

            // Only update state if result changed
            if (handleUnderPointer !== lastHoverResultRef.current) {
              lastHoverResultRef.current = handleUnderPointer;
              if (handleUnderPointer) {
                setHoveredHandle(handleUnderPointer);
                setHoveredEdgeSegment(null);
              } else {
                setHoveredHandle(null);
                setHoveredEdgeSegment(null);
              }
            }
          } else {
            if (lastHoverResultRef.current !== null) {
              lastHoverResultRef.current = null;
              setHoveredHandle(null);
              setHoveredEdgeSegment(null);
            }
          }
        } else {
          if (lastHoverResultRef.current !== null) {
            lastHoverResultRef.current = null;
            setHoveredHandle(null);
            setHoveredEdgeSegment(null);
          }
        }
      };

      // Throttle hover checks
      const now = Date.now();
      const lastCheck = lastHoverCheckRef.current;
      const shouldCheck =
        !lastCheck ||
        now - lastCheck.time >= HOVER_THROTTLE_MS ||
        Math.abs(artboardMouseX - lastCheck.x) > 2 ||
        Math.abs(artboardMouseY - lastCheck.y) > 2;

      if (shouldCheck) {
        if (hoverThrottleRef.current !== null) {
          cancelAnimationFrame(hoverThrottleRef.current);
        }
        hoverThrottleRef.current = requestAnimationFrame(() => {
          performHoverCheck();
          lastHoverCheckRef.current = { x: artboardMouseX, y: artboardMouseY, time: now };
          hoverThrottleRef.current = null;
        });
      }

      // Check if mouse button is pressed
      const isMouseButtonPressed = (e.buttons & 1) === 1;

      let shouldStartDragging = false;
      if (
        isMouseButtonPressed &&
        !isDraggingObject &&
        !isDraggingArtboard &&
        !isTransforming &&
        !isPanning &&
        currentSelection.length > 0 &&
        initialMousePos &&
        (initialMousePos.x !== 0 || initialMousePos.y !== 0)
      ) {
        // Check if any selected object is locked
        const selectedObj = storeState.objects.find((obj) => obj.id === currentSelection[0]);
        if (selectedObj?.locked === true) {
          return; // Don't allow dragging locked objects
        }

        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > DRAG_THRESHOLD) {
          setIsDraggingObject(true);
          isDraggingObjectRef.current = true;
          setIsDraggingArtboard(false);
          setIsPanning(false);
          shouldStartDragging = true;
        } else {
          return;
        }
      }

      // Handle artboard dragging (smooth panning - update immediately like shape dragging)
      if (isDraggingArtboard && !isDraggingObject) {
        const currentStore = useEditorStore.getState();
        const deltaX = e.clientX - artboardDragStart.x;
        const deltaY = e.clientY - artboardDragStart.y;
        
        // Calculate new pan position directly (smooth like shape dragging)
        const nextPanX = currentStore.panX + deltaX;
        const nextPanY = currentStore.panY + deltaY;

        const { x: clampedPanX, y: clampedPanY } = clampPanToWorkspace(
          nextPanX,
          nextPanY,
          canvas.width,
          canvas.height
        );

        // Update pan immediately for smooth response (like shape dragging)
        useEditorStore.getState().setPan(clampedPanX, clampedPanY);
        setArtboardDragStart({ x: e.clientX, y: e.clientY });
        setNeedsRender(true);
        
        return;
      }

      // Handle transform operations
      // OPTIMIZED: Cache store state to avoid multiple lookups
      if (isTransforming && selectedObjects.length > 0) {
        const transformStore = useEditorStore.getState();
        const selectedObj = transformStore.objects.find((obj) => obj.id === selectedObjects[0]);
        if (selectedObj) {
          // Handle rotation
          if (transformHandle === 'rotate') {
            const centerX = transformOrigin.x + transformOrigin.width / 2;
            const centerY = transformOrigin.y + transformOrigin.height / 2;
            const centerDocX = centerX * documentDpi;
            const centerDocY = centerY * documentDpi;

            // Calculate angles from center to mouse positions
            const startAngle = Math.atan2(
              transformStart.y - centerDocY,
              transformStart.x - centerDocX
            );
            const currentAngle = Math.atan2(
              artboardMouseY - centerDocY,
              artboardMouseX - centerDocX
            );
            
            // Calculate rotation delta in degrees
            let rotationDelta = ((currentAngle - startAngle) * 180) / Math.PI;
            
            // Normalize rotation delta to [-180, 180] range to prevent jumping
            if (rotationDelta > 180) rotationDelta -= 360;
            if (rotationDelta < -180) rotationDelta += 360;
            
            // Apply rotation sensitivity to slow down rotation (0.5 = 50% speed for smoother control)
            // Lower values = slower rotation, higher values = faster rotation
            const ROTATION_SENSITIVITY = 0.5;
            rotationDelta *= ROTATION_SENSITIVITY;
            
            // Only update if there's a meaningful change (reduces jitter)
            if (Math.abs(rotationDelta) < 0.1) {
              return;
            }

            const snapIncrement = e.shiftKey ? 15 : 1;
            const newRotation = selectedObj.rotation + rotationDelta;
            const snappedRotation =
              Math.round(newRotation / snapIncrement) * snapIncrement;

            // Update rotation immediately for responsive feel
            setCurrentRotation(snappedRotation);
            transformStore.updateObject(selectedObj.id, { rotation: snappedRotation });
            setNeedsRender(true);
            
            // Update transform start partially towards current mouse position
            // This creates smooth, controlled rotation by making transformStart "lag behind"
            // Move transformStart by the sensitivity factor towards the current mouse position
            const deltaX = artboardMouseX - transformStart.x;
            const deltaY = artboardMouseY - transformStart.y;
            setTransformStart({ 
              x: transformStart.x + deltaX * ROTATION_SENSITIVITY, 
              y: transformStart.y + deltaY * ROTATION_SENSITIVITY 
            });
            return;
          }

          // Handle edge segment-based resizing for shapes
          if (transformEdgeSegment && selectedObj.type === 'shape') {
            const deltaX = artboardMouseX - transformStart.x;
            const deltaY = artboardMouseY - transformStart.y;
            const normal = transformEdgeSegment.normal;
            const dotProduct = deltaX * normal.x + deltaY * normal.y;

            const currentWidth = selectedObj.width * documentDpi;
            const currentHeight = selectedObj.height * documentDpi;
            const affectsWidth = Math.abs(normal.x) > Math.abs(normal.y);
            const baseSize = affectsWidth ? currentWidth : currentHeight;
            const safeBaseSize = Math.max(baseSize, 0.0001);

            const sensitivity = 2.0;
            const scaleChange = (dotProduct / safeBaseSize) * sensitivity;
            const scaleFactor = 1 + scaleChange;
            const clampedScaleFactor = Math.max(0.1, Math.min(10, scaleFactor));

            const pivot = getPivotForEdgeSegment(
              selectedObj,
              transformEdgeSegment,
              documentDpi,
              e.altKey
            );

            const updates = scaleShape(
              selectedObj,
              transformEdgeSegment,
              clampedScaleFactor,
              pivot
            );

            const newWidth = Math.max(0.1, updates.width || selectedObj.width);
            const newHeight = Math.max(0.1, updates.height || selectedObj.height);

            transformStore.updateObject(selectedObj.id, {
              ...updates,
              width: newWidth,
              height: newHeight,
            });
            setNeedsRender(true);

            setTransformStart({ x: artboardMouseX, y: artboardMouseY });

            // Auto-pan near viewport edges
            if (containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const edge = 24;
              let panDx = 0;
              let panDy = 0;
              if (e.clientX > containerRect.right - edge) panDx = -12;
              if (e.clientX < containerRect.left + edge) panDx = 12;
              if (e.clientY > containerRect.bottom - edge) panDy = -12;
              if (e.clientY < containerRect.top + edge) panDy = 12;
              if (panDx !== 0 || panDy !== 0) {
                const curr = useEditorStore.getState();
                curr.setPan(curr.panX + panDx, curr.panY + panDy);
              }
            }

            return;
          }

          // Handle traditional handle-based resizing
          if (transformHandle && transformHandle !== 'rotate') {
            const deltaX = artboardMouseX - transformStart.x;
            const deltaY = artboardMouseY - transformStart.y;
            const deltaDocX = deltaX / documentDpi;
            const deltaDocY = deltaY / documentDpi;

            const isShapeObject = selectedObj.type !== 'text';
            const isProportional = isShapeObject ? !e.shiftKey : e.shiftKey;

            const originLeft = transformOrigin.x;
            const originTop = transformOrigin.y;
            const originRight = originLeft + transformOrigin.width;
            const originBottom = originTop + transformOrigin.height;

            const movesLeft =
              transformHandle === 'w' ||
              transformHandle === 'nw' ||
              transformHandle === 'sw';
            const movesRight =
              transformHandle === 'e' ||
              transformHandle === 'ne' ||
              transformHandle === 'se';
            const movesTop =
              transformHandle === 'n' ||
              transformHandle === 'nw' ||
              transformHandle === 'ne';
            const movesBottom =
              transformHandle === 's' ||
              transformHandle === 'sw' ||
              transformHandle === 'se';

            let newLeft = originLeft;
            let newRight = originRight;
            let newTop = originTop;
            let newBottom = originBottom;

            if (movesLeft) {
              newLeft = originLeft + deltaDocX;
            }
            if (movesRight) {
              newRight = originRight + deltaDocX;
            }
            if (movesTop) {
              newTop = originTop + deltaDocY;
            }
            if (movesBottom) {
              newBottom = originBottom + deltaDocY;
            }

            const MIN_SIZE = 0.1;

            if (newRight - newLeft < MIN_SIZE) {
              if (movesLeft && !movesRight) {
                newLeft = newRight - MIN_SIZE;
              } else if (movesRight && !movesLeft) {
                newRight = newLeft + MIN_SIZE;
              } else {
                const centerX = (newLeft + newRight) / 2;
                newLeft = centerX - MIN_SIZE / 2;
                newRight = centerX + MIN_SIZE / 2;
              }
            }

            if (newBottom - newTop < MIN_SIZE) {
              if (movesTop && !movesBottom) {
                newTop = newBottom - MIN_SIZE;
              } else if (movesBottom && !movesTop) {
                newBottom = newTop + MIN_SIZE;
              } else {
                const centerY = (newTop + newBottom) / 2;
                newTop = centerY - MIN_SIZE / 2;
                newBottom = centerY + MIN_SIZE / 2;
              }
            }

            let newWidth = newRight - newLeft;
            let newHeight = newBottom - newTop;

            const aspect =
              transformOrigin.height === 0
                ? 1
                : transformOrigin.width / transformOrigin.height;

            if (isProportional) {
              if (movesLeft || movesRight) {
                if (movesTop || movesBottom) {
                  // Corner handle: anchor opposite corner
                  const widthOptionHeight = newWidth / aspect;
                  const heightOptionWidth = newHeight * aspect;

                  if (Math.abs(widthOptionHeight - newHeight) <
                    Math.abs(heightOptionWidth - newWidth)) {
                    newHeight = widthOptionHeight;
                  } else {
                    newWidth = heightOptionWidth;
                  }

                  if (movesLeft) {
                    newLeft = newRight - newWidth;
                  } else {
                    newRight = newLeft + newWidth;
                  }

                  if (movesTop) {
                    newTop = newBottom - newHeight;
                  } else {
                    newBottom = newTop + newHeight;
                  }
                } else {
                  // Horizontal edge with proportional scaling
                  const scale = newWidth / transformOrigin.width;
                  newWidth = transformOrigin.width * scale;
                  newHeight = transformOrigin.height * scale;
                  const centerY = transformOrigin.y + transformOrigin.height / 2;
                  newTop = centerY - newHeight / 2;
                  newBottom = centerY + newHeight / 2;
                  if (movesLeft) {
                    newLeft = newRight - newWidth;
                  } else {
                    newRight = newLeft + newWidth;
                  }
                }
              } else if (movesTop || movesBottom) {
                // Vertical edge with proportional scaling
                const scale = newHeight / transformOrigin.height;
                newHeight = transformOrigin.height * scale;
                newWidth = transformOrigin.width * scale;
                const centerX = transformOrigin.x + transformOrigin.width / 2;
                newLeft = centerX - newWidth / 2;
                newRight = centerX + newWidth / 2;
                if (movesTop) {
                  newTop = newBottom - newHeight;
                } else {
                  newBottom = newTop + newHeight;
                }
              }
            }

            newWidth = Math.max(MIN_SIZE, newRight - newLeft);
            newHeight = Math.max(MIN_SIZE, newBottom - newTop);

            if (movesLeft && !movesRight) {
              newLeft = newRight - newWidth;
            } else if (movesRight && !movesLeft) {
              newRight = newLeft + newWidth;
            } else {
              const centerX = (newLeft + newRight) / 2;
              newLeft = centerX - newWidth / 2;
              newRight = centerX + newWidth / 2;
            }

            if (movesTop && !movesBottom) {
              newTop = newBottom - newHeight;
            } else if (movesBottom && !movesTop) {
              newBottom = newTop + newHeight;
            } else {
              const centerY = (newTop + newBottom) / 2;
              newTop = centerY - newHeight / 2;
              newBottom = centerY + newHeight / 2;
            }

            const newX = newLeft;
            const newY = newTop;

            // OPTIMIZED: Batch update all selected objects (use cached store)
            const transformUpdates = selectedObjects
              .map((objId) => {
                const obj = transformStore.objects.find((o) => o.id === objId);
                if (!obj) return null;

                const relativeX = obj.x - selectedObj.x;
                const relativeY = obj.y - selectedObj.y;
                const relativeWidth = obj.width / selectedObj.width;
                const relativeHeight = obj.height / selectedObj.height;

                return {
                  id: objId,
                  updates: {
                    x: newX + relativeX,
                    y: newY + relativeY,
                    width: newWidth * relativeWidth,
                    height: newHeight * relativeHeight,
                  },
                };
              })
              .filter(
                (update): update is { id: string; updates: any } => update !== null
              );

            if (transformUpdates.length > 0) {
              pendingDragUpdatesRef.current = transformUpdates;
              if (dragFrameRef.current === null) {
                dragFrameRef.current = requestAnimationFrame(() => {
                  const updates = pendingDragUpdatesRef.current;
                  if (updates && updates.length > 0) {
                    // Use fresh store state for updates
                    useEditorStore.getState().updateObjects(updates);
                    setNeedsRender(true);
                  }
                  dragFrameRef.current = null;
                  pendingDragUpdatesRef.current = null;
                });
              }
            }

            // Auto-pan near viewport edges
            if (containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const edge = 24;
              let panDx = 0;
              let panDy = 0;
              if (e.clientX > containerRect.right - edge) panDx = -12;
              if (e.clientX < containerRect.left + edge) panDx = 12;
              if (e.clientY > containerRect.bottom - edge) panDy = -12;
              if (e.clientY < containerRect.top + edge) panDy = 12;
              if (panDx !== 0 || panDy !== 0) {
                const curr = useEditorStore.getState();
                curr.setPan(curr.panX + panDx, curr.panY + panDy);
              }
            }
          }
        }
        return;
      }

      // Continue dragging if already dragging
      const freshStore = useEditorStore.getState();
      const freshSelection = freshStore.selection;
      const shouldDrag =
        isDraggingObjectRef.current || isDraggingObject || shouldStartDragging;

      if (shouldDrag && freshSelection.length > 0) {
        const selectedObj = freshStore.objects.find(
          (obj) => obj.id === freshSelection[0]
        );

        if (!selectedObj) return;

        let validDragOffset = dragOffset;
        if (
          !dragOffset ||
          typeof dragOffset.x !== 'number' ||
          typeof dragOffset.y !== 'number' ||
          isNaN(dragOffset.x) ||
          isNaN(dragOffset.y)
        ) {
          validDragOffset = {
            x: documentX - selectedObj.x,
            y: documentY - selectedObj.y,
          };
          setDragOffset(validDragOffset);
        }

        const newX = documentX - validDragOffset.x;
        const newY = documentY - validDragOffset.y;

        const batchUpdates = freshSelection
          .map((objId) => {
            const obj = freshStore.objects.find((o) => o.id === objId);
            if (!obj) return null;

            const relX = obj.x - selectedObj.x;
            const relY = obj.y - selectedObj.y;
            const newObjX = newX + relX;
            const newObjY = newY + relY;

            const epsilon = 0.0001;
            if (
              Math.abs(obj.x - newObjX) < epsilon &&
              Math.abs(obj.y - newObjY) < epsilon
            ) {
              return null;
            }

            return {
              id: objId,
              updates: {
                x: newObjX,
                y: newObjY,
              },
            };
          })
          .filter(
            (update): update is { id: string; updates: any } => update !== null
          );

        if (batchUpdates.length > 0) {
          pendingDragUpdatesRef.current = batchUpdates;
          if (dragFrameRef.current === null) {
            dragFrameRef.current = requestAnimationFrame(() => {
              const updates = pendingDragUpdatesRef.current;
              if (updates && updates.length > 0) {
                useEditorStore.getState().updateObjects(updates);
                setNeedsRender(true);
              }
              dragFrameRef.current = null;
              pendingDragUpdatesRef.current = null;
            });
          }
        }

        return;
      }

      // Handle marquee selection
      if (isMarqueeSelecting) {
        setMarqueeEnd({ x: documentX, y: documentY });

        const objects = useEditorStore.getState().objects;
        const marqueeLeft = Math.min(marqueeStart.x, documentX);
        const marqueeRight = Math.max(marqueeStart.x, documentX);
        const marqueeTop = Math.min(marqueeStart.y, documentY);
        const marqueeBottom = Math.max(marqueeStart.y, documentY);

        const objectsInMarquee = objects.filter((obj) => {
          const objLeft = obj.x;
          const objRight = obj.x + obj.width;
          const objTop = obj.y;
          const objBottom = obj.y + obj.height;

          return (
            objLeft < marqueeRight &&
            objRight > marqueeLeft &&
            objTop < marqueeBottom &&
            objBottom > marqueeTop
          );
        });

        if (objectsInMarquee.length > 0) {
          const objectIds = objectsInMarquee.map((obj) => obj.id);
          useEditorStore.getState().selectObjects(objectIds);
        }

        return;
      }

      // Handle panning
      if (isPanning && !isDraggingObject) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;

        pendingPanRef.current = {
          x: pendingPanRef.current.x + deltaX,
          y: pendingPanRef.current.y + deltaY,
        };

        setLastPanPoint({ x: e.clientX, y: e.clientY });

        if (panFrameRef.current === null) {
          panFrameRef.current = requestAnimationFrame(() => {
            const currentStore = useEditorStore.getState();
            const { x: pdX, y: pdY } = pendingPanRef.current;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const nextPanX = currentStore.panX + pdX;
            const nextPanY = currentStore.panY + pdY;

            const { x: clampedPanX, y: clampedPanY } = clampPanToWorkspace(
              nextPanX,
              nextPanY,
              canvasWidth,
              canvasHeight
            );

            if (clampedPanX !== currentStore.panX || clampedPanY !== currentStore.panY) {
              useEditorStore.getState().setPan(clampedPanX, clampedPanY);
            }

            pendingPanRef.current = { x: 0, y: 0 };
            panFrameRef.current = null;
          });
        }
      }
    },
    [
      canvasRef,
      containerRef,
      setIsDraggingObject,
      setIsTransforming,
      setTransformHandle,
      setTransformEdgeSegment,
      setTransformStart,
      setCurrentRotation,
      setIsMarqueeSelecting,
      setMarqueeEnd,
      setIsPanning,
      setLastPanPoint,
      setIsDraggingArtboard,
      setArtboardDragStart,
      setDragOffset,
      setNeedsRender,
      setHoveredHandle,
      setHoveredEdgeSegment,
      setCursorPosition,
      setMousePosition,
      setHoveredObjectType,
      selectedObjects,
      zoom,
      documentDpi,
      defaultViewScale,
      isTransforming,
      transformHandle,
      transformEdgeSegment,
      transformStart,
      transformOrigin,
      isDraggingObject,
      isMarqueeSelecting,
      marqueeStart,
      isPanning,
      lastPanPoint,
      isDraggingArtboard,
      artboardDragStart,
      dragOffset,
      initialMousePos,
      isMouseDownRef,
      isDraggingObjectRef,
      dragFrameRef,
      pendingDragUpdatesRef,
      panFrameRef,
      pendingPanRef,
    ]
  );

  return { handleMouseMove };
}

