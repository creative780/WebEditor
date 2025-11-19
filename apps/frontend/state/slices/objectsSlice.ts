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

      // Find the rightmost object in the duplicate chain
      // Look for objects that are duplicates (same Y position, same dimensions, or part of duplicate chain)
      const gapInDocumentUnits = 0.1;
      const yTolerance = 0.01; // Small tolerance for Y position matching
      
      // Find all potential duplicates in the chain:
      // 1. The original object itself
      // 2. Objects with IDs starting with the original ID (direct duplicates)
      // 3. Objects with same Y position and dimensions (duplicates that might have been moved)
      const potentialDuplicates = state.objects.filter((obj) => {
        if (obj.id === id) return true; // Include original
        
        const sameY = Math.abs(obj.y - object.y) < yTolerance;
        const sameDimensions = Math.abs(obj.width - object.width) < 0.01 && 
                               Math.abs(obj.height - object.height) < 0.01;
        
        // Check if it's a duplicate by ID pattern (originalId_copy_timestamp or originalId_copy_timestamp_copy_timestamp)
        const isDuplicateById = obj.id.startsWith(id + '_copy_') || 
                                (obj.id.includes('_copy_') && sameY && sameDimensions);
        
        return isDuplicateById || (sameY && sameDimensions);
      });

      // Find the rightmost object (highest x + width) in the chain
      const rightmostObject = potentialDuplicates.reduce((rightmost, obj) => {
        const rightmostRight = rightmost.x + rightmost.width;
        const objRight = obj.x + obj.width;
        return objRight > rightmostRight ? obj : rightmost;
      }, object);

      // Position new duplicate to the right of the rightmost object
      const duplicated = {
        ...object,
        id: `${id}_copy_${Date.now()}`,
        x: rightmostObject.x + rightmostObject.width + gapInDocumentUnits,
        y: object.y, // Keep same Y position
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

