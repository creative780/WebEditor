// Barrel export for canvas hooks
// Most hooks are in canvas/events/ directory
// This directory is reserved for future canvas-specific hooks

// Re-export event hooks for convenience
export {
  useMouseEvents,
  useMouseMove,
  useMouseUp,
  useMouseHover,
  useKeyboardEvents,
  useTouchEvents,
  useWheelEvents,
} from '../events';

