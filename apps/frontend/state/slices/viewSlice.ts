import { StateCreator } from 'zustand';
import { Unit } from '../useEditorStore';

export interface ViewSlice {
  zoom: number;
  panX: number;
  panY: number;
  unit: Unit;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setUnit: (unit: Unit) => void;
  fitToScreen: () => void;
  centerArtboard: () => void;
  actualSize: () => void;
}

export const createViewSlice: StateCreator<ViewSlice> = (set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  unit: 'in',

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  setUnit: (unit) => set({ unit }),

  fitToScreen: () => set({ zoom: 1, panX: 0, panY: 0 }),

  centerArtboard: () => set({ panX: 0, panY: 0 }),

  actualSize: () => set({ zoom: 1 }),
});

