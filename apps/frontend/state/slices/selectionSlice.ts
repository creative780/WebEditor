import { StateCreator } from 'zustand';

export interface SelectionSlice {
  selection: string[];
  selectObject: (id: string) => void;
  selectObjects: (ids: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
}

export const createSelectionSlice: StateCreator<SelectionSlice> = (set) => ({
  selection: [],

  selectObject: (id) => set({ selection: [id] }),

  selectObjects: (ids) => set({ selection: ids }),

  clearSelection: () => set({ selection: [] }),

  toggleSelection: (id) =>
    set((state) => {
      const isSelected = state.selection.includes(id);
      if (isSelected) {
        return {
          selection: state.selection.filter((selectedId) => selectedId !== id),
        };
      } else {
        return {
          selection: [...state.selection, id],
        };
      }
    }),
});

