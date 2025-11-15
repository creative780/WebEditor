import { StateCreator } from 'zustand';
import { Unit, DocumentConfig } from '../useEditorStore';

export interface DocumentSlice {
  document: DocumentConfig;
  setDocumentSize: (width: number, height: number, unit: Unit) => void;
  setDocumentUnit: (unit: Unit) => void;
  setBleed: (bleed: number) => void;
  setDPI: (dpi: number) => void;
  setCurrentPage: (page: number) => void;
}

const initialDocument: DocumentConfig = {
  width: 6,
  height: 4,
  unit: 'in',
  bleed: 0.125,
  dpi: 300,
  pages: 1,
  currentPage: 1,
};

export const createDocumentSlice: StateCreator<DocumentSlice> = (set) => ({
  document: initialDocument,

  setDocumentSize: (width, height, unit) =>
    set((state) => ({
      document: { ...state.document, width, height, unit },
    })),

  setDocumentUnit: (unit) =>
    set((state) => ({
      document: { ...state.document, unit },
    })),

  setBleed: (bleed) =>
    set((state) => ({
      document: { ...state.document, bleed },
    })),

  setDPI: (dpi) =>
    set((state) => ({
      document: { ...state.document, dpi },
    })),

  setCurrentPage: (page) =>
    set((state) => ({
      document: { ...state.document, currentPage: page },
    })),
});

