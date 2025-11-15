# EditorCanvas.tsx Extraction Progress

## Current Status: 4136 lines → Target: ~300 lines

### ✅ Extracted (Ready to use)
- `canvas/utils/` - All utility functions
- `canvas/drawing/drawBackground.ts` - Background patterns
- `canvas/drawing/drawMarquee.ts` - Marquee selection
- `canvas/drawing/drawTransformHandles.ts` - Transform handles
- `canvas/drawing/textUtils.ts` - Text utilities (toRoman, wrapText)

### 🚧 Need to Extract (Still in EditorCanvas.tsx)

#### Drawing Functions (~1500 lines)
1. `drawTextObject()` - ~400 lines - Complex text rendering
2. `drawShapeObject()` - ~280 lines - All shape types
3. `drawPathObject()` - ~65 lines - SVG path rendering
4. `drawTextOnPath()` - ~80 lines - Text on path
5. `drawRulers()` - ~400 lines - Ruler rendering
6. `drawObjects()` - ~100 lines - Object orchestrator
7. `drawTextDragPreview()` - ~40 lines - Text drag preview
8. `drawTextToolIndicator()` - ~35 lines - Tool indicator
9. `drawRotationAngle()` - ~40 lines - Rotation display

#### Event Handlers (~1400 lines)
1. `handleMouseDown()` - ~500 lines - Mouse down logic
2. `handleMouseMove()` - ~800 lines - Mouse move logic
3. `handleMouseUp()` - ~100 lines - Mouse up logic
4. `handleMouseEnter()` - ~20 lines
5. `handleMouseLeave()` - ~20 lines
6. `handleWheelCapture()` - ~50 lines - Zoom handling
7. `handleTouchStart/Move/End()` - ~50 lines - Touch events
8. `handleKeyDown()` - ~100 lines - Keyboard events

#### Rendering Logic (~600 lines)
1. `renderCanvas()` - ~600 lines - Main render orchestrator

#### Hooks & State (~500 lines)
1. All useEffect hooks - ~300 lines
2. State management - ~200 lines

#### Main Component (~100 lines)
1. JSX return - ~100 lines

## Extraction Strategy

1. **Phase 1: Drawing Functions** (Highest priority - most self-contained)
   - Extract all draw* functions
   - Pass dependencies as parameters
   
2. **Phase 2: Event Handlers** (High priority - critical functionality)
   - Extract mouse/touch/keyboard handlers
   - Create hooks for event management
   
3. **Phase 3: Rendering** (Medium priority)
   - Extract renderCanvas logic
   - Create rendering orchestrator
   
4. **Phase 4: Hooks** (Medium priority)
   - Extract custom hooks
   - Organize state management
   
5. **Phase 5: Main File** (Final step)
   - Refactor EditorCanvas.tsx to use all modules
   - Target: ~200-300 lines

## Dependencies to Pass as Parameters

Functions need access to:
- `isTextEditing`, `editingTextId` - Text editing state
- `hoveredHandle`, `hoveredEdgeSegment` - Hover state
- `isDraggingObject`, `isTransforming`, `isPanning` - Interaction state
- `documentDpi`, `zoom`, `defaultViewScale` - View settings
- `canvasBackground` - Background config
- `cursorPosition`, `showCursorIndicators` - Cursor state
- Store functions - `useEditorStore.getState()`

## Next Steps

Starting extraction now - will extract drawing functions first, then events, then hooks, then refactor main file.

