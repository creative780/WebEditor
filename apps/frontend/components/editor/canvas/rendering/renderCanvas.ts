/**
 * Main canvas rendering function
 * Orchestrates all drawing operations
 */

import { useEditorStore } from '../../../../state/useEditorStore';
import { drawCanvasBackground } from '../drawing/drawBackground';
import { drawObjects, type ObjectsDrawingParams } from '../drawing/drawObjects';
import { drawRulers, type RulerDrawingParams } from '../drawing/drawRulers';
import { drawMarqueeSelection } from '../drawing/drawMarquee';
import { drawTextDragPreview } from '../drawing/drawHelpers';
import { drawTextToolIndicator } from '../drawing/drawHelpers';
import { drawRotationAngle } from '../drawing/drawTransformHandles';
import { renderArtboard, type ArtboardRenderParams } from './renderArtboard';

export interface RenderCanvasParams {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  zoom: number;
  documentDpi: number;
  defaultViewScale: number;
  activeTool: string;
  isDraggingText: boolean;
  isTextDragMode: boolean;
  textDragStart: { x: number; y: number };
  textDragEnd: { x: number; y: number };
  cursorPosition: { x: number; y: number };
  showCursorIndicators: boolean;
  documentUnit: 'px' | 'mm' | 'in' | 'cm' | 'ft';
  selectedObjects: string[];
  objects: any[];
  isTransforming: boolean;
  transformHandle: string | null;
  currentRotation: number;
  isMarqueeSelecting: boolean;
  marqueeStart: { x: number; y: number };
  marqueeEnd: { x: number; y: number };
  canvasBackground: {
    type: string;
    color: string;
    opacity: number;
    gridSize: number;
  };
  isDraggingArtboard: boolean;
  hoveredHandle: string | null;
  isTextEditing: boolean;
  editingTextId: string | null;
  isDraggingObject: boolean;
  viewportCache: {
    imageData: ImageData | null;
    zoom: number;
    panX: number;
    panY: number;
    backgroundType: string;
    backgroundColor: string;
    backgroundOpacity: number;
    backgroundGridSize: number;
  };
  setViewportCache: (cache: any) => void;
}

/**
 * Render the entire canvas
 */
export function renderCanvas(params: RenderCanvasParams): void {
  const {
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
    viewportCache,
    setViewportCache,
  } = params;

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Check if we can use cached viewport
  const cacheKey = {
    zoom,
    panX: useEditorStore.getState().panX,
    panY: useEditorStore.getState().panY,
    backgroundType: canvasBackground.type,
    backgroundColor: canvasBackground.color,
    backgroundOpacity: canvasBackground.opacity,
    backgroundGridSize: canvasBackground.gridSize,
  };

  const isCacheValid =
    viewportCache.zoom === cacheKey.zoom &&
    viewportCache.panX === cacheKey.panX &&
    viewportCache.panY === cacheKey.panY &&
    viewportCache.backgroundType === cacheKey.backgroundType &&
    viewportCache.backgroundColor === cacheKey.backgroundColor &&
    viewportCache.backgroundOpacity === cacheKey.backgroundOpacity &&
    viewportCache.backgroundGridSize === cacheKey.backgroundGridSize;

  // Calculate fixed artboard dimensions
  const ARTBOARD_WIDTH = 1800; // 6 * 300
  const ARTBOARD_HEIGHT = 1200; // 4 * 300
  const BLEED_SIZE = 37.5; // 0.125 * 300
  const RULER_SIZE = 40;
  const WORKSPACE_SIZE = 100000;

  // Calculate artboard position
  const store = useEditorStore.getState();
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;
  const artboardOffsetX = canvasCenterX - ARTBOARD_WIDTH / 2;
  const artboardOffsetY = canvasCenterY - ARTBOARD_HEIGHT / 2;
  const artboardX = artboardOffsetX + store.panX;
  const artboardY = artboardOffsetY + store.panY;

  const offsetX = Math.round(artboardX);
  const offsetY = Math.round(artboardY);

  const workspaceBounds = {
    x: canvasCenterX - WORKSPACE_SIZE / 2 + store.panX,
    y: canvasCenterY - WORKSPACE_SIZE / 2 + store.panY,
  };

  // Use cached base layer if valid
  const hasCachedBase =
    isCacheValid &&
    viewportCache.imageData &&
    !isTransforming &&
    !isDraggingObject &&
    !store.panning;

  if (hasCachedBase) {
    ctx.putImageData(viewportCache.imageData, 0, 0);
  } else {
    // Draw base layer from scratch
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw workspace background (100,000 x 100,000)
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      workspaceBounds.x,
      workspaceBounds.y,
      WORKSPACE_SIZE,
      WORKSPACE_SIZE
    );
    ctx.clip();
    ctx.translate(workspaceBounds.x, workspaceBounds.y);
    drawCanvasBackground(
      ctx,
      WORKSPACE_SIZE,
      WORKSPACE_SIZE,
      canvasBackground
    );
    ctx.restore();

    // Draw workspace border
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(workspaceBounds.x) + 0.5,
      Math.round(workspaceBounds.y) + 0.5,
      WORKSPACE_SIZE,
      WORKSPACE_SIZE
    );
    ctx.restore();

    const effectiveZoom = zoom * defaultViewScale;

    // Save context for zoomed artboard and objects
    // renderArtboard will also save, so we have a proper save/restore stack
    ctx.save();

    // Render artboard (applies zoom transform, saves context internally)
    const artboardParams: ArtboardRenderParams = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      artboardX,
      artboardY,
      ARTBOARD_WIDTH,
      ARTBOARD_HEIGHT,
      BLEED_SIZE,
      effectiveZoom,
      isDraggingArtboard,
      canvasBackground,
    };

    renderArtboard(ctx, artboardParams);

    // Draw objects within the same transformation context (before restore)
    const objectsParams: ObjectsDrawingParams = {
      isTextEditing,
      editingTextId,
      hoveredHandle,
      isDraggingObject,
      documentDpi,
    };

    // Objects are drawn inside the zoom transform
    // Pass effectiveZoom for handle sizing (handles need to know the zoom level for proper sizing)
    // Object positions are already in the zoomed coordinate space, but handles need zoom for sizing
    drawObjects(ctx, 0, 0, effectiveZoom, objectsParams);

    // Restore context to reset transformations (after drawing objects)
    ctx.restore();

    // Cache the base layer (artboard + objects) for performance
    // Only cache when not transforming, dragging, or panning
    // Cache BEFORE drawing overlays to avoid including them in cache
    if (
      !isTransforming &&
      !isDraggingObject &&
      !store.panning &&
      canvasRef.current
    ) {
      // Capture image data immediately (synchronously) before overlays are drawn
      const imageData = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      
      // Update cache ref directly (no re-render triggered since it's a ref)
      setViewportCache({
        imageData,
        zoom,
        panX: store.panX,
        panY: store.panY,
        backgroundType: canvasBackground.type,
        backgroundColor: canvasBackground.color,
        backgroundOpacity: canvasBackground.opacity,
        backgroundGridSize: canvasBackground.gridSize,
      });
    }

    // Draw rotation angle display when rotating (overlay, not cached)
    if (
      isTransforming &&
      transformHandle === 'rotate' &&
      selectedObjects.length > 0
    ) {
      const selectedObj = useEditorStore
        .getState()
        .objects.find((obj) => obj.id === selectedObjects[0]);
      if (selectedObj) {
        drawRotationAngle(ctx, selectedObj, currentRotation, effectiveZoom, documentDpi);
      }
    }

    // Draw marquee selection (hide during artboard dragging) (overlay, not cached)
    if (isMarqueeSelecting && !isDraggingArtboard) {
      drawMarqueeSelection(ctx, marqueeStart, marqueeEnd, effectiveZoom);
    }
  }

  // Always draw overlays on top
  // Draw text tool indicator when text tool is active
  if (activeTool === 'text') {
    drawTextToolIndicator(ctx, canvas.width, canvas.height);
  }

  // Draw text drag preview
  if (isDraggingText && isTextDragMode) {
    drawTextDragPreview(
      ctx,
      offsetX,
      offsetY,
      zoom,
      documentDpi,
      textDragStart,
      textDragEnd
    );
  }

  // Draw rulers on sides (fixed to canvas edges)
  const rulerParams: RulerDrawingParams = {
    documentUnit,
    documentDpi,
    defaultViewScale,
    zoom,
    cursorPosition,
    showCursorIndicators,
    isTransforming,
    isDraggingObject,
    isPanning: false, // TODO: get from store
    canvasBackground,
  };

  drawRulers(
    ctx,
    canvas.width,
    canvas.height,
    offsetX,
    offsetY,
    ARTBOARD_WIDTH,
    ARTBOARD_HEIGHT,
    WORKSPACE_SIZE,
    WORKSPACE_SIZE,
    RULER_SIZE,
    rulerParams
  );
}

