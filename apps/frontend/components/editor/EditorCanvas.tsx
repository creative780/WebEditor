'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../state/useEditorStore';
import type {
  TextObj,
  ImageObj,
  ShapeObj,
  PathObj,
} from '../../state/useEditorStore';
import { FloatingToolbar } from './FloatingToolbar';
import { ColorModeConversionCard } from './ColorModeConversionCard';
import { generateHeartPath } from '../../lib/shapes';
import {
  getClosestEdgeSegment,
  type EdgeSegment,
} from '../../lib/shapePathUtils';
import { scaleShape } from '../../lib/shapeScaling';

// Import extracted canvas modules
import { renderCanvas } from './canvas/rendering/renderCanvas';
import { getCursorStyle } from './canvas/utils/cursorUtils';
import { getTransformHandleAt } from './canvas/utils/hitDetection';
import {
  useKeyboardEvents,
  useTouchEvents,
  useWheelEvents,
  useMouseEvents,
  useMouseMove,
  useMouseUp,
  useMouseHover,
} from './canvas/events';

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get store state
  const { panX, panY, setPan } = useEditorStore();
  const [isClient, setIsClient] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // View scale factor for default 25% view (while keeping zoom value at 100%)
  const defaultViewScale = 0.25; // 25% view by default
  const [isPanning, setIsPanning] = useState(false);
  // Removed local panOffset - now using store panX/panY exclusively
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const pendingPanRef = useRef({ x: 0, y: 0 });
  const panFrameRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragUpdatesRef = useRef<Array<{
    id: string;
    updates: any;
  }> | null>(null);
  // CRITICAL: Use refs for mouse state to persist across re-renders
  const isMouseDownRef = useRef(false);
  const isDraggingObjectRef = useRef(false);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 });
  const [textDragEnd, setTextDragEnd] = useState({ x: 0, y: 0 });
  const [isTextDragMode, setIsTextDragMode] = useState(false);

  // Transform handle interaction state
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformHandle, setTransformHandle] = useState<string | null>(null); // Keep for rotation handle
  const [transformEdgeSegment, setTransformEdgeSegment] =
    useState<EdgeSegment | null>(null);
  const [transformStart, setTransformStart] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [currentRotation, setCurrentRotation] = useState(0);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [hoveredEdgeSegment, setHoveredEdgeSegment] =
    useState<EdgeSegment | null>(null);

  // Marquee selection state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

  // Viewport caching for performance - use ref to avoid triggering re-renders
  const viewportCacheRef = useRef<{
    imageData: ImageData | null;
    zoom: number;
    panX: number;
    panY: number;
    backgroundType: string;
    backgroundColor: string;
    backgroundOpacity: number;
    backgroundGridSize: number;
  }>({
    imageData: null,
    zoom: 0,
    panX: 0,
    panY: 0,
    backgroundType: '',
    backgroundColor: '',
    backgroundOpacity: 0,
    backgroundGridSize: 0,
  });

  // Wrapper function to update cache ref without triggering re-renders
  const setViewportCache = useCallback(
    (cache: typeof viewportCacheRef.current) => {
      viewportCacheRef.current = cache;
    },
    []
  );

  // Performance optimization - track if render is needed for live updates
  const [needsRender, setNeedsRender] = useState(true);

  // Subscribe to store changes for live updates
  useEffect(() => {
    // Subscribe to objects array changes - subscribeWithSelector handles reactivity
    // This ensures drag operations trigger immediate visual updates
    let previousObjects:
      | (TextObj | ImageObj | ShapeObj | PathObj)[]
      | undefined;
    let renderScheduled = false;
    let previousHistoryPast: any[] | undefined;
    let previousHistoryFuture: any[] | undefined;

    // Subscribe to history changes for immediate undo/redo rendering
    const unsubscribeHistory = useEditorStore.subscribe(
      (state) => ({ past: state.history.past, future: state.history.future }),
      (history) => {
        // Detect history changes (undo/redo operations)
        const historyChanged =
          history.past !== previousHistoryPast ||
          history.future !== previousHistoryFuture;

        if (historyChanged) {
          previousHistoryPast = history.past;
          previousHistoryFuture = history.future;

          // Immediate render for undo/redo - bypass throttling
          setNeedsRender(true);
          viewportCacheRef.current.imageData = null; // Invalidate cache

          // Cancel any pending throttled render
          if (renderScheduled) {
            renderScheduled = false;
          }
        }
      }
    );

    const unsubscribeObjects = useEditorStore.subscribe(
      (state) => state.objects,
      (objects) => {
        // Check if objects reference actually changed (immutable updates create new array)
        // This is critical for drag operations - new array reference means position changed
        if (objects !== previousObjects) {
          previousObjects = objects;

          // Throttle renders to prevent excessive re-renders (skip for history operations)
          if (!renderScheduled) {
            renderScheduled = true;
            requestAnimationFrame(() => {
              setNeedsRender(true); // Trigger render when objects change
              // force base-layer redraw (objects)
              viewportCacheRef.current.imageData = null; // Invalidate cache
              renderScheduled = false;
            });
          }
        }
      }
    );

    return () => {
      unsubscribeHistory();
      unsubscribeObjects();
    };
  }, []);

  // Subscribe to zoom changes to trigger re-render
  useEffect(() => {
    let previousZoom = useEditorStore.getState().zoom;

    const unsubscribe = useEditorStore.subscribe(
      (state) => state.zoom,
      (newZoom) => {
        console.log(
          '[ZOOM SUBSCRIPTION] Zoom changed from',
          previousZoom,
          'to',
          newZoom
        );

        // CRITICAL: Store OLD zoom before invalidating - needed for comparison in renderCanvas
        const oldZoom = viewportCacheRef.current.zoom;
        console.log('[ZOOM SUBSCRIPTION] Cache zoom before update:', oldZoom);

        // CRITICAL: Invalidate cache COMPLETELY when zoom changes - this forces full redraw
        // We need to invalidate both imageData AND reset zoom to a sentinel value
        // This ensures renderCanvas will ALWAYS detect the zoom change
        viewportCacheRef.current.imageData = null;
        viewportCacheRef.current.zoom = -1; // Sentinel value to force zoom mismatch detection

        console.log(
          '[ZOOM SUBSCRIPTION] Cache completely invalidated (imageData=null, zoom=-1), triggering render'
        );

        // Trigger render - renderCanvasCallback will use the new zoom value from store
        setNeedsRender(true);

        // Update previousZoom for next comparison
        previousZoom = newZoom;
      }
    );

    return unsubscribe;
  }, []);

  // Subscribe to pan changes to trigger re-render
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => [state.panX, state.panY],
      () => {
        setNeedsRender(true); // Trigger render when pan changes
      }
    );

    return unsubscribe;
  }, []);

  // Subscribe to selection changes to trigger re-render
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.selection,
      () => {
        setNeedsRender(true); // Trigger render when selection changes
      }
    );

    return unsubscribe;
  }, []);

  // CRITICAL: Subscribe to objects array changes to trigger re-render during drag
  // This ensures visual updates happen immediately when object positions change
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.objects,
      () => {
        // Always trigger render when objects change - critical for drag operations
        // The render function will check if we need to use cache or redraw
        setNeedsRender(true);
        // DON'T log here - this fires constantly during drag
      }
    );

    return unsubscribe;
  }, []);

  // Object dragging state
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasMovedEnough, setHasMovedEnough] = useState(false); // Track if mouse moved enough to start drag

  // Artboard dragging state
  const [isDraggingArtboard, setIsDraggingArtboard] = useState(false);
  const [artboardDragStart, setArtboardDragStart] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 }); // Track initial mouse position for threshold

  // Drag threshold constant (5 pixels)
  const DRAG_THRESHOLD = 5;

  // Live cursor tracking for ruler indicators
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursorIndicators, setShowCursorIndicators] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get store values
  const documentWidth = useEditorStore((state) => state.document.width);
  const documentHeight = useEditorStore((state) => state.document.height);
  const documentUnit = useEditorStore((state) => state.document.unit);
  const documentBleed = useEditorStore((state) => state.document.bleed);
  const documentDpi = useEditorStore((state) => state.document.dpi);
  const zoom = useEditorStore((state) => state.zoom);
  const activeTool = useEditorStore((state) => state.activeTool);
  const needsColorModeConversion = useEditorStore(
    (state) => state.needsColorModeConversion
  );
  const projectColorMode = useEditorStore((state) => state.projectColorMode);
  const targetColorMode = useEditorStore((state) => state.targetColorMode);
  const convertProjectToColorMode = useEditorStore(
    (state) => state.convertProjectToColorMode
  );
  const selectedObjects = useEditorStore((state) => state.selection);
  const objects = useEditorStore((state) => state.objects);
  const canvasBackground = useEditorStore((state) => state.canvasBackground);
  const showLeftPanel = useEditorStore((state) => state.showLeftPanel);
  const showRightPanel = useEditorStore((state) => state.showRightPanel);

  // Set client-side flag and handle resize
  useEffect(() => {
    setIsClient(true);

    // Calculate canvas size based on panel visibility
    const calculateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const leftPanelWidth = showLeftPanel ? 80 : 0; // Left panel width when visible
        const rightPanelWidth = showRightPanel ? 300 : 0; // Right panel width when visible
        const topBarHeight = 60; // Top toolbar height

        setCanvasSize({
          width: Math.max(
            rect.width - leftPanelWidth - rightPanelWidth || 1200,
            1200
          ),
          height: Math.max(rect.height - topBarHeight || 800, 800),
        });
      }
    };

    // Set initial size
    calculateCanvasSize();

    // Handle window resize
    const handleResize = () => {
      calculateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for more accurate resizing
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Recalculate canvas size when panel visibility changes
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const leftPanelWidth = showLeftPanel ? 80 : 0; // Left panel width when visible
      const rightPanelWidth = showRightPanel ? 300 : 0; // Right panel width when visible
      const topBarHeight = 60; // Top toolbar height

      setCanvasSize({
        width: Math.max(
          rect.width - leftPanelWidth - rightPanelWidth || 1200,
          1200
        ),
        height: Math.max(rect.height - topBarHeight || 800, 800),
      });
    }
  }, [showLeftPanel, showRightPanel]);

  // Note: Removed auto-centering to allow free artboard positioning
  // The artboard can now be manually positioned anywhere in the canvas
  // useEffect(() => {
  //   useEditorStore.getState().centerArtboard();
  //   }, []);

  // Cleanup animation frame on component unmount
  useEffect(() => {
    return () => {
      if (panFrameRef.current) {
        cancelAnimationFrame(panFrameRef.current);
      }
    };
  }, []);

  // Add event listener for ruler toggle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleToggleRulerIndicators = () => {
      setShowCursorIndicators((prev) => !prev);
    };

    canvas.addEventListener(
      'toggleRulerIndicators',
      handleToggleRulerIndicators
    );

    return () => {
      canvas.removeEventListener(
        'toggleRulerIndicators',
        handleToggleRulerIndicators
      );
    };
  }, []);

  // Auto-focus on selected shape - DISABLED to keep artboard fixed
  // The artboard now remains in place while shapes can move freely within it
  // useEffect(() => {
  //   // Don't auto-focus while dragging, transforming, or during other interactions
  //   if (isDraggingObject || isTransforming || isPanning || isMarqueeSelecting)
  //     return;

  //   // Only focus when there's a single selected object and canvas is ready
  //   if (selectedObjects.length !== 1 || !canvasRef.current) return;

  //   const selectedId = selectedObjects[0];
  //   const selectedObj = objects.find((obj) => obj.id === selectedId);

  //   if (!selectedObj) return;

  //   // Calculate the center of the selected object in document coordinates (inches)
  //   const objCenterX = selectedObj.x + selectedObj.width / 2;
  //   const objCenterY = selectedObj.y + selectedObj.height / 2;

  //   // Convert to pixels
  //   const objCenterXPx = objCenterX * documentDpi;
  //   const objCenterYPx = objCenterY * documentDpi;

  //   // Calculate artboard dimensions
  //   const ARTBOARD_WIDTH = 1800; // 6 * 300 DPI
  //   const ARTBOARD_HEIGHT = 1200; // 4 * 300 DPI

  //   // Get canvas center
  //   const canvasCenterX = canvasRef.current.width / 2;
  //   const canvasCenterY = canvasRef.current.height / 2;

  //   const effectiveZoom = zoom * defaultViewScale;

  //   // Calculate the pan needed to center the object in the viewport
  //   // Default artboard position (centered): artboardX = canvasCenterX - (ARTBOARD_WIDTH * effectiveZoom) / 2
  //   // Object position on canvas: artboardX + (objCenterXPx * effectiveZoom)
  //   // We want object center at canvas center: artboardX + (objCenterXPx * effectiveZoom) = canvasCenterX

  //   // The artboard rendering position is: canvasCenterX - ARTBOARD_WIDTH/2 + panX (at view scale)
  //   // We need: (canvasCenterX - ARTBOARD_WIDTH * effectiveZoom / 2 + panX * effectiveZoom) + objCenterXPx * effectiveZoom = canvasCenterX
  //   // Solving: panX * effectiveZoom = canvasCenterX - canvasCenterX + ARTBOARD_WIDTH * effectiveZoom / 2 - objCenterXPx * effectiveZoom
  //   // panX = (ARTBOARD_WIDTH / 2 - objCenterXPx * effectiveZoom) / effectiveZoom
  //   // panX = ARTBOARD_WIDTH / 2 / effectiveZoom - objCenterXPx

  //   // Actually, looking at the rendering code, artboard position is:
  //   // artboardX = canvasCenterX - ARTBOARD_WIDTH / 2 + panX (panX is in canvas pixels, not scaled)
  //   // Object renders at: artboardX + objCenterXPx * effectiveZoom
  //   // Want: artboardX + objCenterXPx * effectiveZoom = canvasCenterX
  //   // So: canvasCenterX - ARTBOARD_WIDTH / 2 + panX + objCenterXPx * effectiveZoom = canvasCenterX
  //   // panX = ARTBOARD_WIDTH / 2 - objCenterXPx * effectiveZoom

  //   const newPanX =
  //     (ARTBOARD_WIDTH * effectiveZoom) / 2 - objCenterXPx * effectiveZoom;
  //   const newPanY =
  //     (ARTBOARD_HEIGHT * effectiveZoom) / 2 - objCenterYPx * effectiveZoom;

  //   // Update pan to center the selected object
  //   setPan(newPanX, newPanY);
  // }, [
  //   selectedObjects,
  //   isDraggingObject,
  //   isTransforming,
  //   isPanning,
  //   isMarqueeSelecting,
  // ]);

  // Initialize event handler hooks
  const mouseEventsParams = {
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
  };

  const { handleMouseDown } = useMouseEvents(mouseEventsParams);

  const { handleMouseMove } = useMouseMove({
    ...mouseEventsParams,
    setCursorPosition,
    setMousePosition,
    isDraggingText,
    isTextDragMode,
    transformEdgeSegment,
  });

  const { handleMouseUp } = useMouseUp({
    ...mouseEventsParams,
    isDraggingText,
    isTextDragMode,
    dragFrameRef,
    panFrameRef,
    pendingPanRef,
  });

  const { handleMouseEnter, handleMouseLeave } = useMouseHover({
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
  });

  const { handleWheelCapture } = useWheelEvents(zoom, defaultViewScale);
  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useTouchEvents();

  useKeyboardEvents({
    isTextEditing,
    editingTextId,
    setIsTextEditing,
    setEditingTextId,
  });

  // Render canvas using extracted renderCanvas function
  const renderCanvasCallback = useCallback(() => {
    if (!canvasRef.current) return;

    renderCanvas({
      canvasRef,
      zoom,
      documentDpi,
      defaultViewScale,
      activeTool,
      isDraggingText,
      isTextDragMode,
      textDragStart,
      textDragEnd,
      cursorPosition,
      showCursorIndicators,
      documentUnit,
      selectedObjects,
      objects,
      isTransforming,
      transformHandle,
      currentRotation,
      isMarqueeSelecting,
      marqueeStart,
      marqueeEnd,
      canvasBackground,
      isDraggingArtboard,
      hoveredHandle,
      isTextEditing,
      editingTextId,
      isDraggingObject,
      viewportCache: viewportCacheRef.current,
      setViewportCache,
    });
  }, [
    zoom,
    documentDpi,
    activeTool,
    isDraggingText,
    isTextDragMode,
    textDragStart,
    textDragEnd,
    cursorPosition,
    showCursorIndicators,
    documentUnit,
    selectedObjects,
    objects,
    isTransforming,
    transformHandle,
    currentRotation,
    isMarqueeSelecting,
    marqueeStart,
    marqueeEnd,
    canvasBackground,
    isDraggingArtboard,
    hoveredHandle,
    isTextEditing,
    editingTextId,
    isDraggingObject,
    setViewportCache,
  ]);

  // Precise canvas area zoom - only in center area between bars (like Canva)
  useEffect(() => {
    const preventBrowserZoom = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Comprehensive sidebar detection - check entire hierarchy
      const isInSidebar =
        target.closest('.editor-left-panel-overlay') ||
        target.closest('.editor-right-panel') ||
        target.closest('.editor-left-rail') ||
        target.closest('.left-rail-panel') ||
        target.closest('[class*="panel"]') ||
        // Check if target or any parent has sidebar classes
        target.classList.contains('editor-right-panel') ||
        target.classList.contains('editor-left-panel-overlay');

      // If in sidebar, allow ALL default behavior (scrolling, etc.)
      if (isInSidebar) {
        return; // Don't prevent default, allow normal scrolling
      }

      // Only prevent browser zoom shortcuts (Ctrl/Cmd + wheel)
      const isZoomShortcut = (e.ctrlKey || e.metaKey) && !e.altKey;

      if (isZoomShortcut) {
        e.preventDefault();
        e.stopPropagation();
        // Force zoom reset
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';
        return;
      }

      // For canvas area: allow canvas wheel handler to manage it
      // Don't prevent default here - let canvas handler do it
      const isCanvasCenterArea =
        target.closest('.editor-canvas') ||
        target.closest('.canvas-center-area') ||
        target.tagName === 'CANVAS';

      if (!isCanvasCenterArea) {
        // Not in sidebar, not in canvas - allow default
        return;
      }

      // In canvas area: only prevent browser zoom, not panning
      // Canvas handler will handle panning/zooming
      if (e.altKey || Math.abs(e.deltaY) < 1) {
        // Allow canvas zoom handler to work
        // Canvas handler will prevent default if needed
        return;
      }

      // For normal wheel events in canvas, let the canvas handler manage it
      // The canvas handler (useWheelEvents) will prevent default for panning
      // We don't need to do anything here
    };

    const preventKeyboardZoom = (e: KeyboardEvent) => {
      // Prevent ALL keyboard zoom shortcuts completely
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' ||
          e.key === '-' ||
          e.key === '=' ||
          e.key === '0' ||
          e.key === 'Digit0')
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Force zoom reset
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';

        return false;
      }
    };

    const preventTouchZoom = (e: TouchEvent) => {
      // Prevent ALL touch zoom completely
      if (e.touches.length > 1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Force zoom reset
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';

        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      // Prevent right-click context menu everywhere
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Force zoom reset
        document.body.style.zoom = '1';
        document.documentElement.style.zoom = '1';

        return false;
      }
    };

    // Add event listeners for COMPLETE zoom control
    document.addEventListener('wheel', preventBrowserZoom, {
      passive: false,
      capture: true,
    });
    document.addEventListener('keydown', preventKeyboardZoom, {
      passive: false,
      capture: true,
    });
    document.addEventListener('touchstart', preventTouchZoom, {
      passive: false,
      capture: true,
    });
    document.addEventListener('touchmove', preventTouchZoom, {
      passive: false,
      capture: true,
    });
    document.addEventListener('touchend', preventTouchZoom, {
      passive: false,
      capture: true,
    });
    document.addEventListener('contextmenu', preventContextMenu, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener('wheel', preventBrowserZoom);
      document.removeEventListener('keydown', preventKeyboardZoom);
      document.removeEventListener('touchstart', preventTouchZoom);
      document.removeEventListener('touchmove', preventTouchZoom);
      document.removeEventListener('touchend', preventTouchZoom);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  // Render when client-side and when specific values change - optimized for live updates
  useEffect(() => {
    if (isClient && needsRender) {
      // Render immediately for live updates
      renderCanvasCallback();
      setNeedsRender(false); // Reset render flag
    }
  }, [isClient, needsRender, renderCanvasCallback]);

  // Get cursor style using extracted utility function
  const isOverArtboard = mousePosition.x >= 0 && mousePosition.y >= 0; // Simplified check
  const cursorStyle = getCursorStyle(
    activeTool,
    hoveredHandle,
    hoveredEdgeSegment,
    isOverArtboard,
    isDraggingObject,
    isTransforming,
    transformHandle,
    transformEdgeSegment
  );

  // Render canvas when needsRender flag is set (for zoom/pan/selection changes)
  useEffect(() => {
    if (isClient && needsRender) {
      console.log(
        '[RENDER EFFECT] needsRender triggered, calling renderCanvasCallback'
      );
      renderCanvasCallback();
      setNeedsRender(false); // Reset flag after rendering
    }
  }, [isClient, needsRender, renderCanvasCallback]);

  // Render canvas on mount and when dependencies change (for initial render and other changes)
  useEffect(() => {
    if (isClient) {
      renderCanvasCallback();
    }
  }, [isClient, renderCanvasCallback]);

  return (
    <div
      ref={containerRef}
      className="editor-canvas canvas-center-area relative flex items-center justify-center bg-white w-full h-full overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Floating Toolbar */}
      <FloatingToolbar />

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheelCapture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`absolute inset-0 transition-all duration-300 ${
          needsColorModeConversion ? 'blur-sm pointer-events-none' : ''
        }`}
        style={{
          width: '100%',
          height: '100%',
          cursor: cursorStyle,
          pointerEvents: needsColorModeConversion ? 'none' : 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          touchAction: 'none',
        }}
      />

      {/* Color Mode Conversion Card */}
      {needsColorModeConversion && (
        <ColorModeConversionCard
          currentMode={projectColorMode}
          targetMode={targetColorMode || 'rgb'}
          currentColorCount={objects.length}
          selectedObjectsCount={selectedObjects.length}
          onConvert={() => {
            convertProjectToColorMode(targetColorMode || 'rgb');
          }}
          onCancel={() => {
            const store = useEditorStore.getState();
            store.setTargetColorMode(null);
          }}
        />
      )}
    </div>
  );
}

export default EditorCanvas;
