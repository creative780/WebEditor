import { StateCreator } from 'zustand';
import {
  TextObj,
  ImageObj,
  ShapeObj,
  PathObj,
} from '../useEditorStore';

export interface TemplatesSlice {
  templates: Array<{
    id: string;
    name: string;
    thumbnail: string;
    category: string;
    objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
  }>;
  availableFonts: string[];
  applyTemplate: (templateId: string) => void;
}

export const createTemplatesSlice: StateCreator<
  TemplatesSlice & { objects: (TextObj | ImageObj | ShapeObj | PathObj)[] },
  [],
  [],
  TemplatesSlice
> = (set, get) => ({
  templates: [],
  availableFonts: [
    'Inter',
    'Helvetica',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Roboto',
    'Open Sans',
  ],

  applyTemplate: (templateId) => {
    const state = get();
    const template = state.templates.find((t) => t.id === templateId);
    if (!template) return;

    set({
      objects: [...state.objects, ...template.objects],
    });
  },
});

