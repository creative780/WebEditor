import { StateCreator } from 'zustand';
import { HistoryState, EditorState } from '../useEditorStore';

export interface HistorySlice {
  history: HistoryState;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

const initialHistory: HistoryState = {
  past: [],
  future: [],
  maxSize: 50,
};

export const createHistorySlice: StateCreator<
  HistorySlice & EditorState,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  history: initialHistory,

  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);

    set({
      ...previous,
      history: {
        ...state.history,
        past: newPast,
        future: [state, ...state.history.future],
      },
    });
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    const newPast = [...state.history.past, state];
    const finalPast =
      newPast.length > state.history.maxSize
        ? newPast.slice(-state.history.maxSize)
        : newPast;

    set({
      ...next,
      history: {
        ...state.history,
        past: finalPast,
        future: newFuture,
      },
    });
  },

  saveHistory: () => {
    const state = get();
    const newPast = [...state.history.past, state];
    if (newPast.length > state.history.maxSize) {
      newPast.shift();
    }

    set({
      history: {
        ...state.history,
        past: newPast,
        future: [],
      },
    });
  },
});

