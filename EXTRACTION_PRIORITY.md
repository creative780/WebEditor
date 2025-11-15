# EditorCanvas.tsx Extraction Priority

## File Size: 4681 lines → Target: ~20 modules (50-300 lines each)

## ✅ Completed
- `canvas/utils/coordinateUtils.ts` - Coordinate conversion
- `canvas/utils/hitDetection.ts` - Hit detection
- `canvas/utils/cursorUtils.ts` - Cursor styles
- `canvas/utils/geometryUtils.ts` - Geometry calculations
- `canvas/drawing/textUtils.ts` - Text utilities

## 🚧 Next Priority (In Order)

### 1. Drawing Functions (High Priority - Self-contained)
- [ ] `canvas/drawing/drawText.ts` - Text drawing (~500 lines)
- [ ] `canvas/drawing/drawShape.ts` - Shape drawing (~300 lines)
- [ ] `canvas/drawing/drawPath.ts` - Path drawing (~100 lines)
- [ ] `canvas/drawing/drawImage.ts` - Image drawing (if exists)
- [ ] `canvas/drawing/drawBackground.ts` - Background patterns (~200 lines)
- [ ] `canvas/drawing/drawRulers.ts` - Ruler drawing (~400 lines)
- [ ] `canvas/drawing/drawArtboard.ts` - Artboard/bleed/trim (~200 lines)
- [ ] `canvas/drawing/drawSelection.ts` - Selection border/handles (~150 lines)
- [ ] `canvas/drawing/drawMarquee.ts` - Marquee selection (~50 lines)

### 2. Event Handlers (High Priority - Critical functionality)
- [ ] `canvas/events/useMouseEvents.ts` - Mouse handlers (~800 lines)
- [ ] `canvas/events/useTouchEvents.ts` - Touch handlers (~50 lines)
- [ ] `canvas/events/useKeyboardEvents.ts` - Keyboard handlers (~100 lines)
- [ ] `canvas/events/useWheelEvents.ts` - Wheel/zoom handlers (~50 lines)

### 3. Hooks (Medium Priority - State management)
- [ ] `canvas/hooks/useCanvas.ts` - Main canvas hook (~200 lines)
- [ ] `canvas/hooks/useDrag.ts` - Drag logic (~300 lines)
- [ ] `canvas/hooks/useTransform.ts` - Transform logic (~400 lines)
- [ ] `canvas/hooks/useTextEdit.ts` - Text editing (~150 lines)
- [ ] `canvas/hooks/useMarquee.ts` - Marquee selection (~100 lines)
- [ ] `canvas/hooks/usePan.ts` - Panning logic (~100 lines)
- [ ] `canvas/hooks/useZoom.ts` - Zoom logic (~50 lines)

### 4. Rendering (Medium Priority - Orchestration)
- [ ] `canvas/rendering/renderCanvas.ts` - Main render orchestrator (~300 lines)
- [ ] `canvas/rendering/renderBackground.ts` - Background rendering (~100 lines)
- [ ] `canvas/rendering/renderArtboard.ts` - Artboard rendering (~200 lines)
- [ ] `canvas/rendering/renderRulers.ts` - Ruler rendering (~400 lines)
- [ ] `canvas/rendering/viewportCache.ts` - Caching logic (~100 lines)

### 5. Transform Logic (Low Priority - Can be extracted later)
- [ ] `canvas/transforms/transformCalculations.ts` - Transform math (~200 lines)
- [ ] `canvas/transforms/transformHandles.ts` - Handle rendering (~150 lines)

### 6. Main File (Final Step)
- [ ] `canvas/EditorCanvas.tsx` - Main orchestrator (~200-300 lines)

## Estimated Progress
- **Utilities**: 100% ✅
- **Drawing Functions**: 5% 🚧
- **Event Handlers**: 0% 📋
- **Hooks**: 0% 📋
- **Rendering**: 0% 📋
- **Transforms**: 0% 📋
- **Main File**: 0% 📋

**Overall Canvas Modularization: ~15%**

## Strategy
1. Extract drawing functions first (most self-contained)
2. Extract event handlers (critical for functionality)
3. Extract hooks (state management)
4. Extract rendering logic
5. Create main orchestrator
6. Test and verify everything works

