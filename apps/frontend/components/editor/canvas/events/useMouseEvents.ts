/**
 * Mouse event handlers for canvas interactions
 * Handles: clicking, dragging, transforming, panning, marquee selection
 */

import { useCallback, useRef } from 'react';
import { useEditorStore } from '../../../../state/useEditorStore';
import { type EdgeSegment } from '../../../../lib/shapePathUtils';
import { scaleShape } from '../../../../lib/shapeScaling';
import {
  calculateSelectionPadding,
  getTransformHandleAt,
} from '../utils/hitDetection';
import { convertMouseToArtboard, isPointInArtboard } from '../utils/mouseUtils';
import { updateObjectBounds, hasObjectBoundsChanged } from '../utils/handleCache';

export interface MouseEventsParams {
  // Canvas refs
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  
  // State setters
  setIsMouseDown: (value: boolean) => void;
  setIsDraggingObject: (value: boolean) => void;
  setIsTransforming: (value: boolean) => void;
  setTransformHandle: (handle: string | null) => void;
  setTransformEdgeSegment: (segment: EdgeSegment | null) => void;
  setTransformStart: (pos: { x: number; y: number }) => void;
  setTransformOrigin: (origin: { x: number; y: number; width: number; height: number }) => void;
  setCurrentRotation: (rotation: number) => void;
  setIsMarqueeSelecting: (value: boolean) => void;
  setMarqueeStart: (pos: { x: number; y: number }) => void;
  setMarqueeEnd: (pos: { x: number; y: number }) => void;
  setIsPanning: (value: boolean) => void;
  setLastPanPoint: (pos: { x: number; y: number }) => void;
  setIsDraggingArtboard: (value: boolean) => void;
  setArtboardDragStart: (pos: { x: number; y: number }) => void;
  setIsTextEditing: (value: boolean) => void;
  setEditingTextId: (id: string | null) => void;
  setDragStart: (pos: { x: number; y: number }) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setInitialMousePos: (pos: { x: number; y: number }) => void;
  setHasMovedEnough: (value: boolean) => void;
  setNeedsRender: (value: boolean) => void;
  setHoveredHandle: (handle: string | null) => void;
  setHoveredEdgeSegment: (segment: EdgeSegment | null) => void;
  
  // State values
  selectedObjects: string[];
  activeTool: string;
  zoom: number;
  documentDpi: number;
  defaultViewScale: number;
  isTransforming: boolean;
  transformHandle: string | null;
  transformEdgeSegment: EdgeSegment | null;
  transformStart: { x: number; y: number };
  transformOrigin: { x: number; y: number; width: number; height: number };
  isDraggingObject: boolean;
  isMouseDown: boolean;
  isMarqueeSelecting: boolean;
  marqueeStart: { x: number; y: number };
  isPanning: boolean;
  lastPanPoint: { x: number; y: number };
  isDraggingArtboard: boolean;
  artboardDragStart: { x: number; y: number };
  dragStart: { x: number; y: number };
  dragOffset: { x: number; y: number } | null;
  initialMousePos: { x: number; y: number };
  hasMovedEnough: boolean;
  
  // Refs
  isMouseDownRef: React.MutableRefObject<boolean>;
  isDraggingObjectRef: React.MutableRefObject<boolean>;
  dragFrameRef: React.MutableRefObject<number | null>;
  pendingDragUpdatesRef: React.MutableRefObject<Array<{ id: string; updates: any }> | null>;
  panFrameRef: React.MutableRefObject<number | null>;
  pendingPanRef: React.MutableRefObject<{ x: number; y: number }>;
}

/**
 * Hook for mouse event handling
 */
export function useMouseEvents(params: MouseEventsParams) {
  const {
    canvasRef,
    containerRef,
    setIsMouseDown,
    setIsDraggingObject,
    setIsTransforming,
    setTransformHandle,
    setTransformEdgeSegment,
    setTransformStart,
    setTransformOrigin,
    setCurrentRotation,
    setIsMarqueeSelecting,
    setMarqueeStart,
    setMarqueeEnd,
    setIsPanning,
    setLastPanPoint,
    setIsDraggingArtboard,
    setArtboardDragStart,
    setIsTextEditing,
    setEditingTextId,
    setDragStart,
    setDragOffset,
    setInitialMousePos,
    setHasMovedEnough,
    setNeedsRender,
    setHoveredHandle,
    setHoveredEdgeSegment,
    selectedObjects,
    activeTool,
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
    dragStart,
    dragOffset,
    initialMousePos,
    hasMovedEnough,
    isMouseDownRef,
    isDraggingObjectRef,
    dragFrameRef,
    pendingDragUpdatesRef,
    panFrameRef,
    pendingPanRef,
  } = params;

  const DRAG_THRESHOLD = 5; // pixels

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Prevent middle mouse button default behavior (browser scrolling)
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Set mouse down state - update both state and ref
      setIsMouseDown(true);
      isMouseDownRef.current = true;
      setHasMovedEnough(false);
      setInitialMousePos({ x: e.clientX, y: e.clientY });

      const rect = canvas.getBoundingClientRect();
      const store = useEditorStore.getState();
      const { panX, panY } = store;

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

      // Check for transform handle clicks first
      if (selectedObjects.length > 0) {
        const selectedObj = store.objects.find((obj) => obj.id === selectedObjects[0]);
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

          if (handleUnderPointer) {
            // Don't allow transforming locked objects
            if (selectedObj.locked === true) {
              return;
            }
            setIsTransforming(true);
            setTransformHandle(handleUnderPointer);
            setTransformEdgeSegment(null);
            setTransformStart({ x: artboardMouseX, y: artboardMouseY });
            setTransformOrigin({
              x: selectedObj.x,
              y: selectedObj.y,
              width: selectedObj.width,
              height: selectedObj.height,
            });
            return;
          }

        }
      }

      // Check if clicking on artboard area
      const isOverArtboard = isPointInArtboard(artboardMouseX, artboardMouseY);

      // Check for object clicks
      const objects = store.objects;
      const reversedObjects = [...objects].reverse();
      const clickedObject = reversedObjects.find((obj) => {
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

      if (clickedObject) {
        const objX = clickedObject.x * documentDpi;
        const objY = clickedObject.y * documentDpi;
        const objWidth = clickedObject.width * documentDpi;
        const objHeight = clickedObject.height * documentDpi;

        // Update bounds cache if changed
        const bounds = { x: objX, y: objY, width: objWidth, height: objHeight };
        if (hasObjectBoundsChanged(clickedObject.id, bounds)) {
          updateObjectBounds(clickedObject.id, bounds);
        }

        // Use cached padding calculation
        const { paddingX, paddingY } = calculateSelectionPadding(
          clickedObject,
          effectiveZoom,
          clickedObject.id
        );

        // Use cached handle detection
        const clickedHandle = getTransformHandleAt(
          artboardMouseX,
          artboardMouseY,
          objX,
          objY,
          objWidth,
          objHeight,
          effectiveZoom,
          paddingX,
          paddingY,
          clickedObject.id
        );

        // Handle text editing - allow single click to start/switch editing (always, even if already selected)
        if (clickedObject.type === 'text' && !clickedHandle) {
          // Always enter edit mode when clicking on text object (not on handles)
          // This works for:
          // - Clicking on a text object that's not currently being edited
          // - Clicking on a text object that's already being edited (refocus)
          // - Clicking on a different text object while one is being edited (switch focus)
          setIsTextEditing(true);
          setEditingTextId(clickedObject.id);
          store.selectObject(clickedObject.id);
          setIsMouseDown(false);
          isMouseDownRef.current = false;
          setNeedsRender(true);
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Single click to select
        store.selectObject(clickedObject.id);
        setNeedsRender(true);

        if (!clickedHandle) {
          // Don't set up drag for locked objects or text objects (text objects should enter edit mode instead)
          if (clickedObject.locked !== true && clickedObject.type !== 'text') {
            setDragStart({ x: e.clientX, y: e.clientY });
            setDragOffset({
              x: documentX - clickedObject.x,
              y: documentY - clickedObject.y,
            });
            setInitialMousePos({ x: e.clientX, y: e.clientY });
            setIsMouseDown(true);
            setHasMovedEnough(false);
            setIsDraggingArtboard(false);
            setIsPanning(false);
          }
        } else {
          // Don't allow transforming locked objects
          if (clickedObject.locked === true) {
            return;
          }
          setIsTransforming(true);
          setTransformHandle(clickedHandle);
          setTransformStart({ x: artboardMouseX, y: artboardMouseY });
          setTransformOrigin({
            x: clickedObject.x,
            y: clickedObject.y,
            width: clickedObject.width,
            height: clickedObject.height,
          });
        }

        return;
      }

      // Create shape when shape tool is active
      const shapeTools = [
        'rectangle',
        'circle',
        'triangle',
        'arrow',
        'star',
        'line',
        'polygon',
        'heart',
        'gear',
        'callout',
      ];

      if (!clickedObject && shapeTools.includes(activeTool)) {
        const DEFAULT_W_IN = 0.5; // 0.5 inches = 150px at 300 DPI (reasonable default size)
        const DEFAULT_H_IN = 0.5; // 0.5 inches = 150px at 300 DPI

        const newShape = {
          id: `shape-${Date.now()}`,
          type: 'shape' as const,
          shape: activeTool as any,
          x: Math.max(0, documentX - DEFAULT_W_IN / 2),
          y: Math.max(0, documentY - DEFAULT_H_IN / 2),
          width: DEFAULT_W_IN,
          height: DEFAULT_H_IN,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          name: 'Shape',
          zIndex: Date.now(),
          fill: { type: 'solid' as const, color: '#FF5555' },
          stroke: {
            width: 1,
            color: '#111111',
            style: 'solid' as const,
            cap: 'butt' as const,
            join: 'miter' as const,
          },
          effects: {},
        };

        store.addObject(newShape);
        store.selectObject(newShape.id);

        setDragStart({ x: e.clientX, y: e.clientY });
        setDragOffset({
          x: documentX - newShape.x,
          y: documentY - newShape.y,
        });
        setIsMouseDown(true);
        setInitialMousePos({ x: e.clientX, y: e.clientY });
        setIsDraggingArtboard(false);
        setIsPanning(false);
        store.setActiveTool('move');
        return;
      }

      // Create text when text tool is active
      if (activeTool === 'text' && !clickedObject) {
        const newText = {
          id: `text-${Date.now()}`,
          type: 'text' as const,
          text: 'Type here...',
          x: documentX,
          y: documentY,
          width: 1.2, // Reduced width to enable wrapping after 10-15 words
          height: 1,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          name: 'Text',
          zIndex: Date.now(),
          fontFamily: 'Inter',
          fontSize: 200,
          fontWeight: 400,
          fontStyle: 'normal' as const,
          textAlign: 'left' as 'left' | 'center' | 'right' | 'justify',
          verticalAlign: 'top' as 'top' | 'middle' | 'bottom',
          lineHeight: 1.2,
          letterSpacing: 0,
          color: '#000000',
          textFill: '#000000',
          backgroundColor: 'transparent',
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          textShadow: 'none',
          textStroke: 'none',
          textStrokeWidth: 0,
          wrapMode: 'area' as 'path' | 'none' | 'area', // Enable text wrapping
        };

        store.addObject(newText);
        store.selectObject(newText.id);
        setIsTextEditing(true);
        setEditingTextId(newText.id);
        store.setActiveTool('move');
        return;
      }

      // Exit text editing mode when clicking on empty space (not on any object)
      if (!clickedObject) {
        setIsTextEditing(false);
        setEditingTextId(null);
      }

      // Artboard dragging logic (panning the canvas)
      // Allow panning by holding left mouse button anywhere on canvas when no object is clicked
      const isAltMode = e.altKey && !clickedObject;
      // Panning works anywhere on canvas when clicking empty space (not just on artboard)
      const isLeftClickOnEmptySpace =
        e.button === 0 &&
        !clickedObject &&
        activeTool !== 'text';

      // Start artboard dragging (panning) when:
      // 1. Alt key is pressed, OR
      // 2. Left click on empty space (anywhere on canvas, not just artboard)
      const shouldStartArtboardDrag =
        (isLeftClickOnEmptySpace || isAltMode) &&
        !clickedObject;

      if (shouldStartArtboardDrag) {
        setIsDraggingArtboard(true);
        setArtboardDragStart({ x: e.clientX, y: e.clientY });
        setIsMouseDown(true);

        if (!e.altKey && !clickedObject) {
          store.clearSelection();
        }

        return;
      }

      // Start marquee selection (only when over artboard and not starting artboard drag)
      // Note: This won't run if shouldStartArtboardDrag is true, so panning takes priority
      if (
        activeTool !== 'text' &&
        !clickedObject &&
        isOverArtboard &&
        !isDraggingArtboard
      ) {
        setIsMarqueeSelecting(true);
        setMarqueeStart({ x: documentX, y: documentY });
        setMarqueeEnd({ x: documentX, y: documentY });

        if (!e.ctrlKey && !e.metaKey) {
          store.clearSelection();
        }

        return;
      }

      // Start panning (fallback for any other case)
      if (!clickedObject && !isMarqueeSelecting && !isDraggingArtboard) {
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    },
    [
      canvasRef,
      setIsMouseDown,
      isMouseDownRef,
      setHasMovedEnough,
      setInitialMousePos,
      setIsTransforming,
      setTransformHandle,
      setTransformEdgeSegment,
      setTransformStart,
      setTransformOrigin,
      setIsMarqueeSelecting,
      setMarqueeStart,
      setMarqueeEnd,
      setIsPanning,
      setLastPanPoint,
      setIsDraggingArtboard,
      setArtboardDragStart,
      setIsTextEditing,
      setEditingTextId,
      setDragStart,
      setDragOffset,
      setNeedsRender,
      selectedObjects,
      activeTool,
      zoom,
      documentDpi,
      defaultViewScale,
    ]
  );

  // Note: handleMouseMove and handleMouseUp are very large functions
  // They will be extracted in separate files due to size constraints
  // For now, we'll return handleMouseDown and create separate hooks for Move/Up

  return {
    handleMouseDown,
  };
}

