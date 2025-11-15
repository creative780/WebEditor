# Complete Project Modularization Plan

## Overview

This document outlines the comprehensive modularization strategy for the entire codebase, with special focus on breaking down large files like `EditorCanvas.tsx` (4681 lines) into smaller, maintainable modules.

## 1. EditorCanvas.tsx Modularization (4681 lines → ~20 modules)

### Structure: `canvas/`

#### 1.1 Rendering (`canvas/rendering/`)

- `renderCanvas.ts` - Main canvas rendering orchestrator
- `renderBackground.ts` - Background rendering (grid, dots, checkerboard, solid)
- `renderArtboard.ts` - Artboard/bleed/trim rendering
- `renderGuides.ts` - Guide lines rendering
- `viewportCache.ts` - Viewport caching logic

#### 1.2 Drawing Functions (`canvas/drawing/`)

- `drawText.ts` - Text object drawing
- `drawShape.ts` - Shape object drawing (rectangle, circle, triangle, etc.)
- `drawImage.ts` - Image object drawing
- `drawPath.ts` - Path object drawing
- `drawSelection.ts` - Selection border and handles
- `drawTransformHandles.ts` - Transform handle rendering
- `drawMarquee.ts` - Marquee selection drawing

#### 1.3 Event Handlers (`canvas/events/`)

- `useMouseEvents.ts` - Mouse event handlers (down, move, up, enter, leave)
- `useTouchEvents.ts` - Touch event handlers
- `useKeyboardEvents.ts` - Keyboard event handlers (text editing)
- `useWheelEvents.ts` - Wheel/zoom event handlers

#### 1.4 Transform Logic (`canvas/transforms/`)

- `useTransform.ts` - Transform handle logic
- `transformHandles.ts` - Handle detection and interaction
- `transformCalculations.ts` - Transform calculations (resize, rotate, etc.)
- `hitDetection.ts` - Hit detection for handles and edges

#### 1.5 Hooks (`canvas/hooks/`)

- `useCanvas.ts` - Main canvas hook (state management)
- `useDrag.ts` - Object dragging logic
- `useTextEdit.ts` - Text editing logic
- `useMarquee.ts` - Marquee selection logic
- `usePan.ts` - Canvas panning logic
- `useZoom.ts` - Canvas zoom logic

#### 1.6 Components (`canvas/components/`)

- `CanvasContainer.tsx` - Main canvas container component
- `CanvasElement.tsx` - Canvas element wrapper
- `TransformHandles.tsx` - Transform handles component
- `SelectionBox.tsx` - Selection box component
- `MarqueeSelection.tsx` - Marquee selection component

#### 1.7 Utilities (`canvas/utils/`)

- `coordinateUtils.ts` - Coordinate conversion (screen ↔ artboard ↔ document)
- `cursorUtils.ts` - Cursor style calculations
- `canvasUtils.ts` - Canvas utility functions
- `geometryUtils.ts` - Geometry calculations
- `textUtils.ts` - Text measurement and wrapping

### Main File: `canvas/EditorCanvas.tsx`

- Orchestrates all modules
- Manages high-level state
- Coordinates between modules
- ~200-300 lines (down from 4681)

## 2. Other Large Files to Modularize

### 2.1 Toolbar.tsx

- Extract tool buttons into `toolbar/components/`
- Extract tool logic into `toolbar/hooks/`
- Create `toolbar/Toolbar.tsx` as orchestrator

### 2.2 Topbar.tsx

- Extract menu items into `topbar/components/`
- Extract menu logic into `topbar/hooks/`
- Create `topbar/Topbar.tsx` as orchestrator

### 2.3 LeftRail.tsx

- Extract rail items into `leftrail/components/`
- Extract rail logic into `leftrail/hooks/`
- Create `leftrail/LeftRail.tsx` as orchestrator

### 2.4 FloatingToolbar.tsx

- Extract toolbar items into `floatingtoolbar/components/`
- Extract toolbar logic into `floatingtoolbar/hooks/`
- Create `floatingtoolbar/FloatingToolbar.tsx` as orchestrator

## 3. Implementation Strategy

### Phase 1: Canvas Rendering (Priority 1)

1. Extract drawing functions
2. Extract rendering logic
3. Create rendering modules

### Phase 2: Canvas Events (Priority 2)

1. Extract event handlers
2. Create event hook modules
3. Wire up event system

### Phase 3: Canvas Transforms (Priority 3)

1. Extract transform logic
2. Extract hit detection
3. Create transform modules

### Phase 4: Canvas Hooks (Priority 4)

1. Extract state management hooks
2. Create specialized hooks
3. Wire up hook system

### Phase 5: Canvas Components (Priority 5)

1. Extract UI components
2. Create component modules
3. Wire up component system

### Phase 6: Other Files (Priority 6)

1. Modularize Toolbar
2. Modularize Topbar
3. Modularize LeftRail
4. Modularize FloatingToolbar

## 4. File Size Targets

- Individual modules: 50-300 lines
- Main orchestrator files: 200-500 lines
- Utility files: 50-200 lines
- Component files: 50-300 lines
- Hook files: 50-200 lines

## 5. Benefits

- **Maintainability**: Easier to find and fix bugs
- **Testability**: Smaller units are easier to test
- **Reusability**: Components can be reused
- **Performance**: Better code splitting and lazy loading
- **Collaboration**: Multiple developers can work simultaneously
- **Onboarding**: New developers can understand smaller files faster

## 6. Naming Conventions

- Components: PascalCase (e.g., `TransformHandles.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTransform.ts`)
- Utils: camelCase (e.g., `coordinateUtils.ts`)
- Types: PascalCase (e.g., `TransformHandle.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `ARTBOARD_WIDTH.ts`)

## 7. Export Strategy

Each module directory should have an `index.ts` barrel export:

```typescript
// canvas/rendering/index.ts
export { renderCanvas } from './renderCanvas';
export { renderBackground } from './renderBackground';
// ... etc
```

Main module should re-export:

```typescript
// canvas/index.ts
export { EditorCanvas } from './EditorCanvas';
export * from './rendering';
export * from './drawing';
export * from './events';
// ... etc
```
