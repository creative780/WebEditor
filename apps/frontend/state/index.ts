// Barrel export for state management
export * from './useEditorStore';

// Re-export commonly used types and hooks
export {
  useEditorStore,
  useSelectedObjects,
} from './useEditorStore';

export type {
  ObjBase,
  TextObj,
  ImageObj,
  ShapeObj,
  PathObj,
  ColorMode,
} from './useEditorStore';

