import { StateCreator } from 'zustand';
import {
  TextObj,
  ImageObj,
  ShapeObj,
  PathObj,
  HistoryState,
} from '../useEditorStore';

export interface TransformSlice {
  applyTransform: (
    id: string,
    transform: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number;
    }
  ) => void;
  applyStyle: (id: string, style: any) => void;
  alignObjects: (
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void;
  distributeObjects: (
    distribution: 'horizontal' | 'vertical' | 'both'
  ) => void;
  alignToCanvas: (
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void;
}

export const createTransformSlice: StateCreator<
  TransformSlice & {
    objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
    selection: string[];
    document: { width: number; height: number };
    history: HistoryState;
  },
  [],
  [],
  TransformSlice
> = (set, get) => ({
  applyTransform: (id, transform) => {
    const state = get();
    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    set({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...transform } : obj
      ),
      history,
    });
  },

  applyStyle: (id, style) => {
    const state = get();
    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    set({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...style } : obj
      ),
      history,
    });
  },

  alignObjects: (alignment) => {
    const state = get();
    if (state.selection.length < 2) return;

    const selectedObjects = state.objects.filter((obj) =>
      state.selection.includes(obj.id)
    );
    if (selectedObjects.length < 2) return;

    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    const left = Math.min(...selectedObjects.map((obj) => obj.x));
    const right = Math.max(
      ...selectedObjects.map((obj) => obj.x + obj.width)
    );
    const top = Math.min(...selectedObjects.map((obj) => obj.y));
    const bottom = Math.max(
      ...selectedObjects.map((obj) => obj.y + obj.height)
    );
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    const updatedObjects = state.objects.map((obj) => {
      if (!state.selection.includes(obj.id)) return obj;

      let newX = obj.x;
      let newY = obj.y;

      switch (alignment) {
        case 'left':
          newX = left;
          break;
        case 'center':
          newX = centerX - obj.width / 2;
          break;
        case 'right':
          newX = right - obj.width;
          break;
        case 'top':
          newY = top;
          break;
        case 'middle':
          newY = centerY - obj.height / 2;
          break;
        case 'bottom':
          newY = bottom - obj.height;
          break;
      }

      return { ...obj, x: newX, y: newY };
    });

    set({ objects: updatedObjects, history });
  },

  distributeObjects: (distribution) => {
    const state = get();
    if (state.selection.length < 3) return;

    const selectedObjects = state.objects.filter((obj) =>
      state.selection.includes(obj.id)
    );
    if (selectedObjects.length < 3) return;

    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    const sortedObjects = [...selectedObjects].sort((a, b) => {
      if (distribution === 'horizontal' || distribution === 'both') {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });

    const updatedObjects = state.objects.map((obj) => {
      if (!state.selection.includes(obj.id)) return obj;

      const index = sortedObjects.findIndex((o) => o.id === obj.id);
      if (index === -1) return obj;

      let newX = obj.x;
      let newY = obj.y;

      if (distribution === 'horizontal' || distribution === 'both') {
        const totalWidth = sortedObjects.reduce((sum, o) => sum + o.width, 0);
        const totalSpace =
          sortedObjects[sortedObjects.length - 1].x +
          sortedObjects[sortedObjects.length - 1].width -
          sortedObjects[0].x;
        const spacing = (totalSpace - totalWidth) / (sortedObjects.length - 1);

        let currentX = sortedObjects[0].x;
        if (index === 0) {
          newX = currentX;
        } else {
          newX =
            currentX +
            sortedObjects
              .slice(0, index)
              .reduce((sum, o) => sum + o.width + spacing, 0);
        }
      }

      if (distribution === 'vertical' || distribution === 'both') {
        const totalHeight = sortedObjects.reduce(
          (sum, o) => sum + o.height,
          0
        );
        const totalSpace =
          sortedObjects[sortedObjects.length - 1].y +
          sortedObjects[sortedObjects.length - 1].height -
          sortedObjects[0].y;
        const spacing = (totalSpace - totalHeight) / (sortedObjects.length - 1);

        let currentY = sortedObjects[0].y;
        if (index === 0) {
          newY = currentY;
        } else {
          newY =
            currentY +
            sortedObjects
              .slice(0, index)
              .reduce((sum, o) => sum + o.height + spacing, 0);
        }
      }

      return { ...obj, x: newX, y: newY };
    });

    set({ objects: updatedObjects, history });
  },

  alignToCanvas: (alignment) => {
    const state = get();
    if (state.selection.length === 0) return;

    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    const canvasWidth = state.document.width;
    const canvasHeight = state.document.height;

    const updatedObjects = state.objects.map((obj) => {
      if (!state.selection.includes(obj.id)) return obj;

      let newX = obj.x;
      let newY = obj.y;

      switch (alignment) {
        case 'left':
          newX = 0;
          break;
        case 'center':
          newX = (canvasWidth - obj.width) / 2;
          break;
        case 'right':
          newX = canvasWidth - obj.width;
          break;
        case 'top':
          newY = 0;
          break;
        case 'middle':
          newY = (canvasHeight - obj.height) / 2;
          break;
        case 'bottom':
          newY = canvasHeight - obj.height;
          break;
      }

      return { ...obj, x: newX, y: newY };
    });

    set({ objects: updatedObjects, history });
  },
});

