import { StateCreator } from 'zustand';
import {
  TextObj,
  ImageObj,
  ShapeObj,
  PathObj,
  ObjBase,
  HistoryState,
} from '../useEditorStore';

export interface ObjectsSlice {
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
  history: HistoryState;
  addObject: (object: TextObj | ImageObj | ShapeObj | PathObj) => void;
  removeObject: (id: string) => void;
  updateObject: (
    id: string,
    updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>
  ) => void;
  updateObjects: (updates: Array<{
    id: string;
    updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>;
  }>) => void;
  duplicateObject: (id: string) => void;
  reorderObjects: (ids: string[]) => void;
  groupObjects: (ids: string[]) => string;
  ungroupObjects: (groupId: string) => void;
  setBlendMode: (id: string, blendMode: ObjBase['blendMode']) => void;
  setEffects: (id: string, effects: ObjBase['effects']) => void;
}

const initialHistory: HistoryState = {
  past: [],
  future: [],
  maxSize: 50,
};

export const createObjectsSlice: StateCreator<
  ObjectsSlice & { selection: string[] },
  [],
  [],
  ObjectsSlice
> = (set, get) => ({
  objects: [],
  history: initialHistory,

  addObject: (object) => {
    const state = get();
    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    set((state) => ({
      objects: [...state.objects, object],
      history,
    }));
  },

  removeObject: (id) => {
    const state = get();
    const newPast = [...state.history.past, state];
    const history =
      newPast.length > state.history.maxSize
        ? { ...state.history, past: newPast.slice(1), future: [] }
        : { ...state.history, past: newPast, future: [] };

    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selection: state.selection.filter((selectedId) => selectedId !== id),
      history,
    }));
  },

  updateObject: (id, updates) =>
    set((state) => {
      const objIndex = state.objects.findIndex((obj) => obj.id === id);
      if (objIndex === -1) return state;

      const obj = state.objects[objIndex];
      const hasChanges = Object.keys(updates).some((key) => {
        const typedKey = key as keyof typeof updates;
        const currentValue = (obj as any)[typedKey];
        const newValue = updates[typedKey];

        if (
          typeof currentValue === 'object' &&
          currentValue !== null &&
          typeof newValue === 'object' &&
          newValue !== null
        ) {
          return JSON.stringify(currentValue) !== JSON.stringify(newValue);
        }

        return currentValue !== newValue;
      });

      if (!hasChanges) return state;

      const newPast = [...state.history.past, state];
      const history =
        newPast.length > state.history.maxSize
          ? { ...state.history, past: newPast.slice(1), future: [] }
          : { ...state.history, past: newPast, future: [] };

      const updatedObj = { ...obj, ...updates } as
        | TextObj
        | ImageObj
        | ShapeObj
        | PathObj;

      const updatedObjects = [
        ...state.objects.slice(0, objIndex),
        updatedObj,
        ...state.objects.slice(objIndex + 1),
      ];

      return { objects: updatedObjects, history };
    }),

  updateObjects: (updates) =>
    set((state) => {
      if (updates.length === 0) return state;

      const updatesMap = new Map(updates.map((u) => [u.id, u.updates]));

      const updatedObjects = state.objects.map((obj) => {
        const objectUpdates = updatesMap.get(obj.id);
        if (objectUpdates) {
          return { ...obj, ...objectUpdates } as
            | TextObj
            | ImageObj
            | ShapeObj
            | PathObj;
        }
        return obj;
      });

      return { objects: updatedObjects };
    }),

  duplicateObject: (id) =>
    set((state) => {
      const object = state.objects.find((obj) => obj.id === id);
      if (!object) return state;

      const newPast = [...state.history.past, state];
      const history =
        newPast.length > state.history.maxSize
          ? { ...state.history, past: newPast.slice(1), future: [] }
          : { ...state.history, past: newPast, future: [] };

      const duplicated = {
        ...object,
        id: `${id}_copy_${Date.now()}`,
        x: object.x + 10,
        y: object.y + 10,
      } as typeof object;

      return {
        objects: [...state.objects, duplicated],
        history,
      };
    }),

  reorderObjects: (ids) =>
    set((state) => {
      const newPast = [...state.history.past, state];
      const history =
        newPast.length > state.history.maxSize
          ? { ...state.history, past: newPast.slice(1), future: [] }
          : { ...state.history, past: newPast, future: [] };

      const reorderedObjects = ids
        .map((id) => state.objects.find((obj) => obj.id === id))
        .filter(Boolean) as (TextObj | ImageObj | ShapeObj | PathObj)[];

      const remainingObjects = state.objects.filter(
        (obj) => !ids.includes(obj.id)
      );

      return {
        objects: [...remainingObjects, ...reorderedObjects],
        history,
      };
    }),

  groupObjects: (ids) => {
    const groupId = `group-${Date.now()}`;

    set((state) => ({
      objects: state.objects.map((obj) =>
        ids.includes(obj.id) ? { ...obj, groupId } : obj
      ),
    }));

    return groupId;
  },

  ungroupObjects: (groupId) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.groupId === groupId ? { ...obj, groupId: null } : obj
      ),
    })),

  setBlendMode: (id, blendMode) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, blendMode } : obj
      ),
    })),

  setEffects: (id, effects) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, effects } : obj
      ),
    })),
});

