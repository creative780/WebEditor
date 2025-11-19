# Shape Handles Logic - Complete Analysis & Optimization Opportunities

## Overview
This document provides a comprehensive analysis of all locations where shape handles logic is applied in the codebase, along with identified optimization opportunities.

---

## Core Files & Locations

### 1. Main Canvas Component
**File:** `apps/frontend/components/editor/EditorCanvas.tsx`

**Lines:** 65-81, 470-525, 576-635, 792-803

**Responsibilities:**
- Manages transform state (isTransforming, transformHandle, transformEdgeSegment)
- Coordinates event handlers
- Renders canvas with transform handles
- Updates cursor style based on handle hover state

**Key State Variables:**
- `isTransforming` - Whether a transform operation is active
- `transformHandle` - Which handle is being used ('nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'rotate')
- `transformEdgeSegment` - Edge segment for shape-based resizing
- `hoveredHandle` - Handle currently under cursor
- `transformStart` - Starting position for transform
- `transformOrigin` - Original object bounds before transform

---

### 2. Hit Detection Utilities
**File:** `apps/frontend/components/editor/canvas/utils/hitDetection.ts`

**Lines:** 48-137

**Responsibilities:**
- Detects which transform handle is under the cursor
- Calculates selection padding based on object type and zoom
- Handles rotation handle detection
- Border hit detection for edge handles

**Key Functions:**
- `getTransformHandleAt()` - Main hit detection function (lines 53-137)
- `calculateSelectionPadding()` - Calculates padding for selection bounds (lines 31-46)

**Optimization Issues:**
- Multiple distance calculations per frame during hover
- No caching of handle positions
- Recalculates padding on every call
- Border hit detection runs even when not needed

---

### 3. Handle Metrics Utilities
**File:** `apps/frontend/components/editor/canvas/utils/handleMetrics.ts`

**Lines:** 1-70

**Responsibilities:**
- Provides zoom-aware handle sizing functions
- Calculates handle radii, line widths, offsets
- Handles rotation handle metrics

**Key Functions:**
- `getHandleRadius()` - Base handle radius
- `getHoverHandleRadius()` - Hovered handle radius
- `getRotationHandleOffset()` - Rotation handle position
- `getHandleHitRadius()` - Hit detection radius
- `getSelectionBasePadding()` - Selection padding calculation

**Optimization Issues:**
- Multiple function calls for related metrics (could be batched)
- No memoization of zoom-based calculations
- Each metric function recalculates from scratch

---

### 4. Transform Handles Drawing
**File:** `apps/frontend/components/editor/canvas/drawing/drawTransformHandles.ts`

**Lines:** 1-226

**Responsibilities:**
- Draws all 8 corner/edge handles + rotation handle
- Handles hover state visualization
- Draws rotation angle display
- Draws handle shadows and styling

**Key Functions:**
- `drawTransformHandles()` - Main drawing function (lines 21-174)
- `drawRotationAngle()` - Rotation angle display (lines 179-224)

**Optimization Issues:**
- Redraws all handles every frame even if only hover state changed
- No handle position caching
- Multiple canvas operations per handle (shadow, fill, stroke)
- Rotation icon redrawn every frame

---

### 5. Mouse Event Handlers

#### 5.1 Mouse Down Handler
**File:** `apps/frontend/components/editor/canvas/events/useMouseEvents.ts`

**Lines:** 143-493

**Responsibilities:**
- Detects handle clicks
- Initiates transform operations
- Sets up transform state

**Key Logic:**
- Handle detection on click (lines 181-224)
- Transform initialization (lines 212-223, 300-310)

**Optimization Issues:**
- Duplicate handle detection (already done in hover)
- Recalculates padding and handle positions
- No early exit for non-handle clicks

---

#### 5.2 Mouse Move Handler
**File:** `apps/frontend/components/editor/canvas/events/useMouseMove.ts`

**Lines:** 163-842

**Responsibilities:**
- Handles transform operations (resize, rotate)
- Updates hover state
- Manages multi-object transforms
- Handles edge segment-based resizing

**Key Logic Sections:**
- Hover detection (lines 199-241)
- Rotation transform (lines 296-351)
- Edge segment resizing (lines 354-414)
- Handle-based resizing (lines 417-637)

**Optimization Issues:**
- **CRITICAL:** Hover detection runs every mousemove even when not needed (lines 199-241)
- Transform calculations run every frame without throttling
- Multiple store lookups per frame
- No debouncing of hover state updates
- Complex transform calculations repeated unnecessarily
- Multi-object transform calculations could be optimized

---

#### 5.3 Mouse Hover Handler
**File:** `apps/frontend/components/editor/canvas/events/useMouseHover.ts`

**Lines:** 1-167

**Responsibilities:**
- Handles mouse enter/leave
- Global mouse tracking
- State cleanup on mouse leave

**Optimization Issues:**
- Global mouse move listener always active
- No throttling on cursor position updates

---

#### 5.4 Mouse Up Handler
**File:** `apps/frontend/components/editor/canvas/events/useMouseUp.ts`

**Lines:** 1-138

**Responsibilities:**
- Cleans up transform state
- Resets interaction flags
- Cancels animation frames

**Optimization Issues:**
- Multiple state updates could be batched

---

### 6. Cursor Utilities
**File:** `apps/frontend/components/editor/canvas/utils/cursorUtils.ts`

**Lines:** 1-145

**Responsibilities:**
- Determines cursor style based on handle type
- Handles edge segment cursors
- Tool-based cursor selection

**Key Function:**
- `getCursorStyle()` - Main cursor determination (lines 36-144)

**Optimization Issues:**
- Called on every render
- No memoization of cursor style
- Multiple switch statements

---

### 7. Canvas Rendering
**File:** `apps/frontend/components/editor/canvas/rendering/renderCanvas.ts`

**Lines:** 64-331

**Responsibilities:**
- Orchestrates canvas rendering
- Draws transform handles via drawObjects
- Handles rotation angle display
- Manages viewport caching

**Key Logic:**
- Rotation angle display (lines 264-275)
- Viewport caching (lines 102-261)

**Optimization Issues:**
- Handles redrawn even when object hasn't changed
- No separate layer for handles (redraws entire canvas)

---

### 8. Object Drawing
**File:** `apps/frontend/components/editor/canvas/drawing/drawObjects.ts`

**Lines:** 1-122

**Responsibilities:**
- Draws all objects
- Passes hover state to shape/text drawing functions
- Applies transformations

**Key Logic:**
- Object iteration and drawing (lines 32-119)
- Hover handle propagation (lines 91-105)

**Optimization Issues:**
- Iterates all objects even when only selection changed
- No early exit for non-selected objects

---

### 9. Shape Drawing
**File:** `apps/frontend/components/editor/canvas/drawing/drawShape.ts`

**Responsibilities:**
- Draws shape objects
- Calls drawTransformHandles for selected shapes

**Optimization Issues:**
- Handle drawing happens inside shape drawing (could be separated)

---

### 10. Text Drawing
**File:** `apps/frontend/components/editor/canvas/drawing/drawText.ts`

**Responsibilities:**
- Draws text objects
- Calls drawTransformHandles for selected text

**Optimization Issues:**
- Handle drawing happens inside text drawing (could be separated)

---

## Optimization Opportunities

### High Priority Optimizations

#### 1. **Throttle/Debounce Hover Detection**
**Location:** `useMouseMove.ts` lines 199-241

**Issue:** Hover detection runs on every mousemove event, even when not hovering over selected objects.

**Solution:**
- Only run hover detection when mouse is over canvas and selection exists
- Throttle hover state updates (e.g., every 16ms)
- Cache last hover result and only recalculate if mouse moved significantly

**Impact:** Reduces unnecessary calculations by ~80-90% during normal mouse movement

---

#### 2. **Memoize Handle Positions**
**Location:** Multiple files (hitDetection.ts, drawTransformHandles.ts)

**Issue:** Handle positions recalculated every frame even when object hasn't moved.

**Solution:**
- Cache handle positions based on object bounds + zoom
- Only recalculate when object bounds or zoom changes
- Store in a Map keyed by objectId + zoom level

**Impact:** Eliminates redundant position calculations

---

#### 3. **Batch Handle Metrics Calculations**
**Location:** `handleMetrics.ts`

**Issue:** Multiple function calls for related metrics (radius, line width, offset) recalculate from same zoom value.

**Solution:**
- Create a single function that returns all metrics at once
- Memoize results based on zoom level
- Use a metrics cache with zoom as key

**Impact:** Reduces function call overhead and duplicate calculations

---

#### 4. **Separate Handle Layer from Object Layer**
**Location:** `renderCanvas.ts`, `drawObjects.ts`

**Issue:** Handles redrawn even when only object content changed.

**Solution:**
- Draw handles in a separate canvas layer
- Only redraw handle layer when selection/hover changes
- Use compositing to combine layers

**Impact:** Reduces redraw operations significantly

---

#### 5. **Optimize Transform Calculations**
**Location:** `useMouseMove.ts` lines 290-637

**Issue:** Complex transform calculations run every frame without optimization.

**Solution:**
- Use requestAnimationFrame for transform updates
- Batch multiple object updates
- Cache intermediate calculations
- Early exit for zero deltas

**Impact:** Smoother transforms, reduced CPU usage

---

### Medium Priority Optimizations

#### 6. **Cache Selection Padding**
**Location:** `hitDetection.ts` lines 31-46

**Issue:** Padding recalculated on every hit test.

**Solution:**
- Cache padding per object + zoom combination
- Invalidate cache when object properties change

**Impact:** Reduces redundant calculations

---

#### 7. **Optimize Cursor Style Calculation**
**Location:** `cursorUtils.ts` lines 36-144

**Issue:** Cursor style recalculated on every render.

**Solution:**
- Memoize cursor style based on inputs
- Only recalculate when relevant state changes

**Impact:** Reduces function call overhead

---

#### 8. **Early Exit in Hit Detection**
**Location:** `hitDetection.ts` lines 53-137

**Issue:** All handle checks run even when clearly not over object.

**Solution:**
- Quick bounding box check first
- Only run detailed checks if within bounds
- Check rotation handle first (most common interaction)

**Impact:** Faster hit detection for most cases

---

#### 9. **Reduce Store Lookups**
**Location:** Multiple files (useMouseMove.ts, useMouseEvents.ts)

**Issue:** Multiple `useEditorStore.getState()` calls per frame.

**Solution:**
- Cache store state at start of event handler
- Use selectors to get only needed values
- Batch store updates

**Impact:** Reduces store access overhead

---

#### 10. **Optimize Multi-Object Transforms**
**Location:** `useMouseMove.ts` lines 582-620

**Issue:** Relative position calculations for each object in selection.

**Solution:**
- Cache relative positions at transform start
- Only recalculate when selection changes
- Use transform matrix for batch updates

**Impact:** Faster multi-object transforms

---

### Low Priority Optimizations

#### 11. **Reduce Canvas Operations in Handle Drawing**
**Location:** `drawTransformHandles.ts` lines 51-77

**Issue:** Multiple save/restore and drawing operations per handle.

**Solution:**
- Batch similar operations
- Use path objects for handle shapes
- Reduce shadow operations

**Impact:** Slightly faster handle rendering

---

#### 12. **Memoize Rotation Calculations**
**Location:** `useMouseMove.ts` lines 296-351

**Issue:** Angle calculations repeated with same inputs.

**Solution:**
- Cache angle calculations
- Use lookup table for common angles

**Impact:** Minor performance improvement

---

#### 13. **Optimize Edge Segment Detection**
**Location:** `useMouseMove.ts` lines 354-414

**Issue:** Complex edge segment calculations every frame.

**Solution:**
- Cache edge segments per shape
- Only recalculate when shape geometry changes

**Impact:** Faster edge-based resizing

---

## Performance Metrics to Track

1. **Hover Detection Calls per Second** - Should be < 60 when not over objects
2. **Handle Position Calculations** - Should be cached, not recalculated every frame
3. **Transform Update Frequency** - Should match display refresh rate (60fps)
4. **Canvas Redraws** - Should only happen when necessary
5. **Store Lookups per Frame** - Should be minimized

---

## Recommended Implementation Order

1. **Phase 1 (Quick Wins):**
   - Throttle hover detection
   - Cache handle positions
   - Batch handle metrics

2. **Phase 2 (Medium Impact):**
   - Separate handle layer
   - Optimize transform calculations
   - Cache selection padding

3. **Phase 3 (Polish):**
   - Optimize cursor calculations
   - Reduce canvas operations
   - Fine-tune multi-object transforms

---

## Files Summary

| File | Lines | Primary Responsibility | Optimization Priority |
|------|-------|----------------------|----------------------|
| `EditorCanvas.tsx` | 65-81, 470-635 | State management, coordination | Medium |
| `hitDetection.ts` | 48-137 | Handle hit testing | High |
| `handleMetrics.ts` | 1-70 | Handle sizing calculations | High |
| `drawTransformHandles.ts` | 1-226 | Handle rendering | Medium |
| `useMouseMove.ts` | 163-842 | Transform operations | High |
| `useMouseEvents.ts` | 143-493 | Mouse down handling | Medium |
| `useMouseHover.ts` | 1-167 | Hover state management | Low |
| `useMouseUp.ts` | 1-138 | Cleanup | Low |
| `cursorUtils.ts` | 1-145 | Cursor style | Medium |
| `renderCanvas.ts` | 64-331 | Canvas orchestration | Medium |
| `drawObjects.ts` | 1-122 | Object drawing | Low |
| `drawShape.ts` | Various | Shape rendering | Low |
| `drawText.ts` | Various | Text rendering | Low |

---

## Notes

- Most optimization opportunities are in the event handlers (useMouseMove, useMouseEvents)
- Hover detection is the biggest performance bottleneck
- Handle position caching would provide significant benefits
- Consider using Web Workers for complex transform calculations if needed
- Profile before and after optimizations to measure impact

