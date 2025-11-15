# Frontend Structure Overview

## 📁 Essential File Structure

```
apps/frontend/
│
├── app/                          # Next.js App Router
│   ├── (editor)/editor/[designId]/page.tsx  # Main editor page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/editor/            # Main Editor Components
│   │
│   ├── EditorCanvas.tsx         # Main canvas (812 lines) ✅ MODULARIZED
│   ├── FloatingToolbar.tsx      # Floating toolbar (126 lines) ✅ MODULARIZED
│   ├── LeftRail.tsx            # Left sidebar
│   ├── RightPanel.tsx          # Right panel ✅ MODULARIZED
│   ├── Toolbar.tsx             # Top toolbar
│   ├── Topbar.tsx              # Top bar
│   │
│   ├── canvas/                 # Canvas System ✅ MODULARIZED
│   │   ├── rendering/          # renderCanvas.ts, renderArtboard.ts
│   │   ├── drawing/            # drawText.ts, drawShape.ts, drawPath.ts, etc.
│   │   ├── events/             # useMouseEvents.ts, useKeyboardEvents.ts, etc.
│   │   └── utils/              # coordinateUtils.ts, hitDetection.ts, etc.
│   │
│   └── panels/                 # Editor Panels ✅ MODULARIZED
│       ├── color/              # ColorPanel (638 lines)
│       │   ├── components/     # CMYKControls, RGBControls, PantoneSelector, etc.
│       │   └── hooks/          # useColorSync, useColorValidation
│       │
│       ├── layers/             # LayersPanel
│       │   ├── components/     # LayerItem, LayerSearch, LayerActions
│       │   └── hooks/          # useLayerOperations
│       │
│       ├── text/               # TextPanel
│       │   ├── components/     # FontSelector, TextAlignment, etc.
│       │   └── hooks/          # useTextMetrics
│       │
│       └── rightpanel/         # RightPanel
│           ├── components/     # Inspector, PreviewPanel, PanelTabs
│           └── hooks/          # useDocumentSize, usePanelSwitcher
│
├── lib/                        # Utility Libraries
│   ├── export.ts               # Export system (894 lines)
│   ├── templates.ts            # Template system (745 lines)
│   ├── colorManagement.ts     # Color utilities
│   ├── shapes.ts              # Shape generation
│   └── units.ts               # Unit conversion
│
└── state/                      # State Management ✅ MODULARIZED
    ├── useEditorStore.ts      # Main store (272 lines)
    └── slices/                 # 9 domain slices
        ├── colorSlice.ts
        ├── documentSlice.ts
        ├── objectsSlice.ts
        ├── selectionSlice.ts
        └── ... (5 more slices)
```

## 🎯 Key Modularized Components

### 1. **EditorCanvas** (4,681 → 812 lines)

- **canvas/rendering/** - Canvas rendering logic
- **canvas/drawing/** - Object drawing functions
- **canvas/events/** - Mouse, keyboard, touch, wheel events
- **canvas/utils/** - Coordinate conversion, hit detection, cursors

### 2. **FloatingToolbar** (547 → 126 lines)

- **floatingtoolbar/components/** - TextControls, ShapeControls, ZoomControls, etc.
- **floatingtoolbar/hooks/** - useFloatingToolbar, useFloatingToolbarHandlers

### 3. **ColorPanel** (638 lines)

- **panels/color/components/** - 11 color control components
- **panels/color/hooks/** - Color sync and validation hooks

### 4. **LayersPanel**

- **panels/layers/components/** - Layer UI components
- **panels/layers/hooks/** - Layer operations hook

### 5. **TextPanel**

- **panels/text/components/** - Text editing components
- **panels/text/hooks/** - Text metrics hook

### 6. **RightPanel**

- **rightpanel/components/** - Inspector, Preview, Tabs
- **rightpanel/hooks/** - Document size and panel switching

### 7. **State Management**

- **state/slices/** - 9 domain-specific slices (color, document, objects, etc.)

## 📊 File Size Summary

| File                | Lines | Status                  |
| ------------------- | ----- | ----------------------- |
| EditorCanvas.tsx    | 812   | ✅ Modularized          |
| FloatingToolbar.tsx | 126   | ✅ Modularized          |
| export.ts           | 894   | ⚠️ Large but acceptable |
| templates.ts        | 745   | ⚠️ Large but acceptable |
| ColorPanel.tsx      | 638   | ✅ Modularized          |
| useMouseEvents.ts   | 525   | ✅ Modularized          |
| All others          | <500  | ✅ Good                 |

## ✨ Modularization Benefits

- **83% reduction** in EditorCanvas.tsx (4,681 → 812 lines)
- **77% reduction** in FloatingToolbar.tsx (547 → 126 lines)
- **30+ modules** extracted
- **Clean separation** of concerns
- **Easy maintenance** and testing
- **Reusable components** and hooks
