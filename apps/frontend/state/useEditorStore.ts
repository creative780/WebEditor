/**
 * Editor state management with Zustand
 * Single source of truth for all editor objects and interactions
 * Now modularized with slices for better organization
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useMemo } from 'react';
import { Unit } from '../lib/units';
import { SnapConfig, DEFAULT_SNAP_CONFIG } from '../lib/snap';
import { createColorSlice, ColorSlice } from './slices/colorSlice';
import { createSelectionSlice, SelectionSlice } from './slices/selectionSlice';
import { createDocumentSlice, DocumentSlice } from './slices/documentSlice';
import { createObjectsSlice, ObjectsSlice } from './slices/objectsSlice';
import { createViewSlice, ViewSlice } from './slices/viewSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createTransformSlice, TransformSlice } from './slices/transformSlice';
import { createHistorySlice, HistorySlice } from './slices/historySlice';
import { createTemplatesSlice, TemplatesSlice } from './slices/templatesSlice';

// Export interfaces
export interface ObjBase {
  id: string;
  type: 'text' | 'image' | 'shape' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  zIndex: number;
  groupId?: string | null;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn';
  effects?: {
    dropShadow?: {
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
      opacity: number;
    };
    innerGlow?: {
      blur: number;
      color: string;
      opacity: number;
    };
    outerGlow?: {
      blur: number;
      color: string;
      opacity: number;
    };
  };
}

export interface TextObj extends ObjBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textFill: string;
  backgroundColor?: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;
  textStroke?: string;
  textStrokeWidth?: number;
  listType?: 'none' | 'bullet' | 'number' | 'letter' | 'roman';
  listStyle?: {
    bulletChar?: string;
    numberFormat?: string;
    indentSize?: number;
  };
  hyphenate?: boolean;
  wrapMode?: 'none' | 'area' | 'path';
  pathData?: string;
  pathOffset?: number;
  pathReverse?: boolean;
}

export interface ImageObj extends ObjBase {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
  originalDPI?: number;
  filename?: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  };
}

export interface ShapeObj extends ObjBase {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star';
  fill?: {
    type: 'solid' | 'gradient' | 'pattern';
    color?: string;
    gradient?: Gradient;
    pattern?: string;
  };
  stroke?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
    cap: 'butt' | 'round' | 'square';
    join: 'miter' | 'round' | 'bevel';
  };
  borderRadius?: number;
  points?: Array<{ x: number; y: number }>;
}

export interface PathObj extends ObjBase {
  type: 'path';
  pathData: string;
  fill?: ShapeObj['fill'];
  stroke?: ShapeObj['stroke'];
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic' | 'diamond' | 'reflected' | 'multi';
  angle?: number;
  centerX?: number;
  centerY?: number;
  stops: Array<{
    position: number;
    color: string;
    opacity?: number;
  }>;
}

export interface DocumentConfig {
  width: number;
  height: number;
  unit: Unit;
  bleed: number;
  dpi: number;
  pages: number;
  currentPage: number;
}

export interface Guides {
  x: number[];
  y: number[];
}

export interface HistoryState {
  past: EditorState[];
  future: EditorState[];
  maxSize: number;
}

export type ColorMode = 'rgb' | 'cmyk' | 'pantone';

export interface EditorState {
  document: DocumentConfig;
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
  selection: string[];
  guides: Guides;
  snapConfig: SnapConfig;
  zoom: number;
  panX: number;
  panY: number;
  unit: Unit;
  projectColorMode: ColorMode;
  needsColorModeConversion: boolean;
  targetColorMode: ColorMode | null;
  canvasBackground: {
    type: 'solid' | 'transparent' | 'grid' | 'dots' | 'checkerboard';
    color: string;
    opacity: number;
    gridSize: number;
  };
  activeTool: string;
  activePanel: string | null;
  showRulers: boolean;
  showGuides: boolean;
  showBleed: boolean;
  showTrim: boolean;
  showSafe: boolean;
  showGrid: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  history: HistoryState;
  projectColors: string[];
  availableFonts: string[];
  templates: Array<{
    id: string;
    name: string;
    thumbnail: string;
    category: string;
    objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
  }>;
}

// Combined store type
type EditorStore = ColorSlice &
  SelectionSlice &
  DocumentSlice &
  ObjectsSlice &
  ViewSlice &
  UISlice &
  TransformSlice &
  HistorySlice &
  TemplatesSlice;

// Create the store with all slices
export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((...args) => ({
    ...createColorSlice(...args),
    ...createSelectionSlice(...args),
    ...createDocumentSlice(...args),
    ...createObjectsSlice(...args),
    ...createViewSlice(...args),
    ...createUISlice(...args),
    ...createTransformSlice(...args),
    ...createHistorySlice(...args),
    ...createTemplatesSlice(...args),
  }))
);

// Selectors for common use cases
export const useSelectedObjects = () => {
  const objects = useEditorStore((state) => state.objects);
  const selection = useEditorStore((state) => state.selection);

  return useMemo(() => {
    return objects.filter((obj) => selection.includes(obj.id));
  }, [objects, selection]);
};

export const useObjectById = (id: string) =>
  useEditorStore((state) => state.objects.find((obj) => obj.id === id));

export const useDocumentBounds = () =>
  useEditorStore((state) => ({
    width: state.document.width,
    height: state.document.height,
    unit: state.document.unit,
    bleed: state.document.bleed,
  }));
