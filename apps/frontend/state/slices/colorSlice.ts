import { StateCreator } from 'zustand';
import { ColorMode } from '../useEditorStore';

export interface ColorSlice {
  projectColorMode: ColorMode;
  needsColorModeConversion: boolean;
  targetColorMode: ColorMode | null;
  projectColors: string[];
  setProjectColorMode: (mode: ColorMode) => void;
  setTargetColorMode: (mode: ColorMode | null) => void;
  convertProjectToColorMode: (targetMode: ColorMode) => void;
  addProjectColor: (color: string) => void;
  removeProjectColor: (color: string) => void;
}

export const createColorSlice: StateCreator<
  ColorSlice & { objects: any[] },
  [],
  [],
  ColorSlice
> = (set, get) => ({
  projectColorMode: 'rgb',
  needsColorModeConversion: false,
  targetColorMode: null,
  projectColors: [
    '#000000',
    '#ffffff',
    '#3b82f6',
    '#ef4444',
    '#10b981',
  ],

  setProjectColorMode: (mode) =>
    set({
      projectColorMode: mode,
      needsColorModeConversion: false,
      targetColorMode: null,
    }),

  setTargetColorMode: (mode) =>
    set((state) => ({
      targetColorMode: mode,
      needsColorModeConversion:
        mode !== null && mode !== state.projectColorMode,
    })),

  convertProjectToColorMode: (targetMode) =>
    set((state) => {
      const convertedObjects = state.objects.map((obj) => {
        if (obj.type === 'text') {
          return {
            ...obj,
            color: obj.color,
            textFill: obj.textFill,
          };
        } else if (obj.type === 'shape' || obj.type === 'path') {
          return {
            ...obj,
            fill: {
              ...obj.fill,
              color: obj.fill?.color || '#000000',
            },
          };
        }
        return obj;
      });

      return {
        projectColorMode: targetMode,
        needsColorModeConversion: false,
        targetColorMode: null,
        objects: convertedObjects,
      };
    }),

  addProjectColor: (color) =>
    set((state) => ({
      projectColors: [...state.projectColors, color],
    })),

  removeProjectColor: (color) =>
    set((state) => ({
      projectColors: state.projectColors.filter((c) => c !== color),
    })),
});

