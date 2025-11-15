import { StateCreator } from 'zustand';
import { SnapConfig, DEFAULT_SNAP_CONFIG, Guides } from '../useEditorStore';

export interface UISlice {
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
  canvasBackground: {
    type: 'solid' | 'transparent' | 'grid' | 'dots' | 'checkerboard';
    color: string;
    opacity: number;
    gridSize: number;
  };
  guides: Guides;
  snapConfig: SnapConfig;
  setActiveTool: (tool: string) => void;
  setActivePanel: (panel: string | null) => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBleed: () => void;
  toggleTrim: () => void;
  toggleSafe: () => void;
  toggleGrid: () => void;
  setCanvasBackground: (background: {
    type?: 'solid' | 'transparent' | 'grid' | 'dots' | 'checkerboard';
    color?: string;
    opacity?: number;
    gridSize?: number;
  }) => void;
  addGuide: (position: number, axis: 'x' | 'y') => void;
  removeGuide: (position: number, axis: 'x' | 'y') => void;
  clearGuides: () => void;
  setSnapConfig: (config: Partial<SnapConfig>) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  activeTool: 'move',
  activePanel: null,
  showRulers: true,
  showGuides: true,
  showBleed: true,
  showTrim: true,
  showSafe: true,
  showGrid: true,
  showLeftPanel: true,
  showRightPanel: true,
  canvasBackground: {
    type: 'grid',
    color: '#f8f9fa',
    opacity: 1,
    gridSize: 20,
  },
  guides: { x: [], y: [] },
  snapConfig: DEFAULT_SNAP_CONFIG,

  setActiveTool: (activeTool) => set({ activeTool }),

  setActivePanel: (activePanel) => set({ activePanel }),

  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),

  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  toggleLeftPanel: () =>
    set((state) => ({ showLeftPanel: !state.showLeftPanel })),

  toggleRightPanel: () =>
    set((state) => ({ showRightPanel: !state.showRightPanel })),

  toggleBleed: () => set((state) => ({ showBleed: !state.showBleed })),

  toggleTrim: () => set((state) => ({ showTrim: !state.showTrim })),

  toggleSafe: () => set((state) => ({ showSafe: !state.showSafe })),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setCanvasBackground: (background) =>
    set((state) => ({
      canvasBackground: {
        ...state.canvasBackground,
        ...background,
      },
    })),

  addGuide: (position, axis) =>
    set((state) => {
      const guides = { ...state.guides };
      if (axis === 'x') {
        guides.x = [...guides.x, position].sort((a, b) => a - b);
      } else {
        guides.y = [...guides.y, position].sort((a, b) => a - b);
      }
      return { guides };
    }),

  removeGuide: (position, axis) =>
    set((state) => {
      const guides = { ...state.guides };
      if (axis === 'x') {
        guides.x = guides.x.filter((p) => p !== position);
      } else {
        guides.y = guides.y.filter((p) => p !== position);
      }
      return { guides };
    }),

  clearGuides: () => set({ guides: { x: [], y: [] } }),

  setSnapConfig: (config) =>
    set((state) => ({
      snapConfig: { ...state.snapConfig, ...config },
    })),
});

