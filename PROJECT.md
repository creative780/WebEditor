# Web-to-Print Editor - Project Documentation

## Overview

A professional web-based design editor for creating print-ready designs with canvas-based editing, real-time collaboration, and print-ready export capabilities.

---

## Functionalities

### Canvas Editor

- **Canvas Rendering** - HTML5 Canvas-based visual editor
  - File: `apps/frontend/components/editor/EditorCanvas.tsx`
  - Modules: `components/editor/canvas/rendering/`, `components/editor/canvas/drawing/`
- **Object Management** - Create, update, delete, transform design objects
  - Types: TextObj, ShapeObj, ImageObj, PathObj
  - File: `apps/frontend/state/slices/objectsSlice.ts`
- **Selection System** - Single and multi-object selection
  - File: `apps/frontend/state/slices/selectionSlice.ts`
- **Transform Operations** - Move, resize, rotate, align, distribute
  - File: `apps/frontend/state/slices/transformSlice.ts`
  - Backend: `apps/backend/src/services/design/TransformService.ts`

### Design Tools

- **Shape Tools** - 10 shapes: rectangle, circle, ellipse, polygon, star, arrow, callout, line, heart, gear
  - Files: `apps/frontend/lib/shapes.ts`, `apps/backend/src/services/shapes/ShapeService.ts`
- **Text Editor** - Rich text with fonts, sizes, alignment, formatting
  - Files: `apps/frontend/components/editor/panels/text/`, `apps/backend/src/services/text/TextService.ts`
- **Image Support** - Upload, crop, apply filters
  - Files: `apps/frontend/components/editor/panels/UploadsPanel.tsx`
- **Path Tools** - SVG path editing and manipulation
  - Files: `apps/frontend/lib/shapePathUtils.ts`

### Color Management

- **RGB Colors** - Screen colors (0-255 per channel)
  - Files: `apps/frontend/components/editor/panels/color/components/RGBControls.tsx`
- **CMYK Colors** - Print colors (0-100% per channel, independent sliders)
  - Files: `apps/frontend/components/editor/panels/color/components/CMYKControls.tsx`
  - Conversion: `apps/frontend/lib/colorManagement.ts`, `apps/backend/src/services/color/ColorConversion.ts`
- **Pantone Colors** - Industry-standard color matching
  - Files: `apps/frontend/components/editor/panels/color/components/PantoneSelector.tsx`
  - Backend: `apps/backend/src/services/color/PantoneService.ts`
- **Gradients** - Linear, radial, conic, multi-color gradients
  - Files: `apps/frontend/components/editor/panels/GradientEditor.tsx`
- **Color Conversion** - RGB ↔ CMYK conversion
  - Files: `apps/frontend/lib/colorManagement.ts`, `apps/backend/src/services/color/ColorConversion.ts`

### Export System

- **Export Formats** - PDF, PNG, JPG, SVG
  - Files: `apps/frontend/lib/export.ts`, `apps/backend/src/services/export/ExportService.ts`
- **Quality Presets** - 72 (web), 150 (draft), 300 (print), 600 (high-res) DPI
  - Files: `apps/frontend/lib/export.ts`
- **Print Features** - Bleed areas, crop marks, transparency support
  - Files: `apps/frontend/lib/export.ts`

### Template System

- **Template Management** - Browse, create, save, delete templates
  - Files: `apps/frontend/lib/templates.ts`, `apps/frontend/state/slices/templatesSlice.ts`
  - Backend: `apps/backend/src/services/templates/TemplateService.ts`, `apps/backend/src/routes/templates.ts`
- **Template Storage** - Local storage (browser) and backend API
  - Files: `apps/frontend/lib/templates.ts`, `apps/backend/src/services/templates/TemplateService.ts`

### Layer Management

- **Layer Operations** - Show/hide, lock, reorder, search, filter
  - Files: `apps/frontend/components/editor/panels/layers/LayersPanel.tsx`
- **Z-Index Management** - Layer ordering and stacking
  - Files: `apps/frontend/state/slices/objectsSlice.ts`

### Real-Time Collaboration

- **WebSocket Sync** - Real-time object synchronization
  - Files: `apps/backend/src/services/realtime/SocketService.ts`, `apps/backend/src/services/collaboration/CollaborationService.ts`
- **Live Updates** - Object create, update, delete, transform events
  - Files: `apps/backend/src/services/realtime/SocketService.ts`
- **Cursor Tracking** - Multi-user cursor positions
  - Files: `apps/frontend/components/CursorKit.tsx`, `apps/backend/src/services/collaboration/CollaborationService.ts`
- **State Synchronization** - Full state sync on connect, incremental updates
  - Files: `apps/backend/src/services/realtime/SocketService.ts`

### Document Management

- **Document Configuration** - Width, height, unit, DPI, bleed settings
  - Files: `apps/frontend/state/slices/documentSlice.ts`, `apps/backend/src/services/design/DesignService.ts`
- **Unit Conversion** - px, in, cm, mm, ft with automatic conversion
  - Files: `apps/frontend/lib/units.ts`
- **View Controls** - Zoom, pan, fit to screen, rulers, guides, grid
  - Files: `apps/frontend/state/slices/viewSlice.ts`

### History & Undo/Redo

- **History Management** - Undo/redo with state snapshots
  - Files: `apps/frontend/state/slices/historySlice.ts`
- **Auto-save** - Automatic design persistence
  - Files: `apps/frontend/hooks/useDesignPersistence.ts`, `apps/frontend/lib/autoSave.ts`

### Keyboard Shortcuts

- **Shortcuts** - Undo/redo, copy/paste, duplicate, delete, select all, zoom, pan
  - Files: `apps/frontend/hooks/useKeyboardShortcuts.ts`, `apps/frontend/lib/keyboardShortcuts.ts`

### Additional Features

- **Boolean Operations** - Union, subtract, intersect, exclude for shapes
  - Files: `apps/frontend/lib/booleanOperations.ts`, `apps/backend/src/services/shapes/BooleanService.ts`
- **Snap System** - Object snapping to guides, grid, other objects
  - Files: `apps/frontend/lib/snap.ts`

---

## File Structure

### Frontend Core Files

```
apps/frontend/
├── app/(editor)/editor/[designId]/page.tsx  # Main editor page
│
├── components/editor/
│   ├── EditorCanvas.tsx                     # Main canvas component
│   ├── RightPanel.tsx                       # Right property panel
│   ├── LeftRail.tsx                         # Left tool palette
│   ├── Toolbar.tsx                          # Top toolbar
│   ├── FloatingToolbar.tsx                  # Context floating toolbar
│   ├── ContextMenu.tsx                      # Context menu
│   │
│   ├── canvas/
│   │   ├── rendering/
│   │   │   ├── renderCanvas.ts              # Main render loop
│   │   │   └── renderArtboard.ts            # Artboard rendering
│   │   ├── drawing/
│   │   │   ├── drawText.ts                  # Text rendering
│   │   │   ├── drawShape.ts                 # Shape rendering
│   │   │   ├── drawPath.ts                  # Path rendering
│   │   │   ├── drawRulers.ts                # Rulers and guides
│   │   │   └── drawTransformHandles.ts      # Transform handles
│   │   ├── events/
│   │   │   ├── useMouseEvents.ts            # Mouse event handlers
│   │   │   ├── useKeyboardEvents.ts         # Keyboard handlers
│   │   │   ├── useTouchEvents.ts            # Touch gesture handlers
│   │   │   └── useWheelEvents.ts            # Zoom/pan wheel
│   │   └── utils/
│   │       ├── coordinateUtils.ts           # Coordinate conversion
│   │       ├── hitDetection.ts              # Object hit testing
│   │       └── cursorUtils.ts               # Cursor management
│   │
│   ├── panels/
│   │   ├── color/
│   │   │   ├── ColorPanel.tsx               # Main color panel
│   │   │   ├── components/
│   │   │   │   ├── RGBControls.tsx          # RGB color controls
│   │   │   │   ├── CMYKControls.tsx         # CMYK color controls
│   │   │   │   └── PantoneSelector.tsx      # Pantone color picker
│   │   │   └── hooks/
│   │   │       └── useColorSync.ts          # Color synchronization
│   │   ├── layers/
│   │   │   ├── LayersPanel.tsx              # Layers panel
│   │   │   └── components/
│   │   │       ├── LayerItem.tsx            # Layer list item
│   │   │       └── LayerSearch.tsx          # Layer search
│   │   ├── text/
│   │   │   ├── TextPanel.tsx                # Text panel
│   │   │   └── components/
│   │   │       ├── FontSelector.tsx         # Font selection
│   │   │       └── TextAlignment.tsx        # Text alignment
│   │   ├── ShapesPanel.tsx                  # Shapes panel
│   │   ├── ExportPanel.tsx                  # Export panel
│   │   └── TemplatesPanel.tsx               # Templates panel
│   │
│   └── rightpanel/
│       └── components/
│           └── Inspector.tsx                # Property inspector
│
├── state/
│   ├── useEditorStore.ts                    # Main Zustand store
│   └── slices/
│       ├── colorSlice.ts                    # Color state
│       ├── documentSlice.ts                 # Document state
│       ├── objectsSlice.ts                  # Objects state
│       ├── selectionSlice.ts                # Selection state
│       ├── viewSlice.ts                     # View state
│       ├── transformSlice.ts                # Transform state
│       ├── historySlice.ts                  # History state
│       ├── templatesSlice.ts                # Templates state
│       └── uiSlice.ts                       # UI state
│
├── lib/
│   ├── export.ts                            # Export system
│   ├── templates.ts                         # Template management
│   ├── colorManagement.ts                   # Color conversion
│   ├── shapes.ts                            # Shape generation
│   ├── units.ts                             # Unit conversion
│   ├── snap.ts                              # Snap system
│   ├── keyboardShortcuts.ts                 # Keyboard shortcuts
│   └── autoSave.ts                          # Auto-save
│
└── hooks/
    ├── useDesignPersistence.ts              # Design persistence
    └── useKeyboardShortcuts.ts              # Keyboard shortcuts
```

### Backend Core Files

```
apps/backend/
├── src/
│   ├── server.ts                            # Express server entry
│   │
│   ├── routes/
│   │   ├── designs.ts                       # Design endpoints
│   │   ├── exports.ts                       # Export endpoints
│   │   ├── templates.ts                     # Template endpoints
│   │   ├── collaboration.ts                 # Collaboration endpoints
│   │   ├── colors.ts                        # Color endpoints
│   │   ├── shapes.ts                        # Shape endpoints
│   │   ├── text.ts                          # Text endpoints
│   │   └── layers.ts                        # Layer endpoints
│   │
│   ├── services/
│   │   ├── design/
│   │   │   ├── DesignService.ts             # Design CRUD operations
│   │   │   └── TransformService.ts          # Transform operations
│   │   ├── realtime/
│   │   │   └── SocketService.ts             # WebSocket service
│   │   ├── collaboration/
│   │   │   └── CollaborationService.ts      # Multi-user collaboration
│   │   ├── export/
│   │   │   └── ExportService.ts             # Server-side export
│   │   ├── color/
│   │   │   ├── ColorService.ts              # Color operations
│   │   │   ├── ColorConversion.ts           # RGB ↔ CMYK conversion
│   │   │   └── PantoneService.ts            # Pantone color service
│   │   ├── shapes/
│   │   │   ├── ShapeService.ts              # Shape generation
│   │   │   └── BooleanService.ts            # Boolean operations
│   │   ├── text/
│   │   │   └── TextService.ts               # Text processing
│   │   ├── templates/
│   │   │   └── TemplateService.ts           # Template management
│   │   └── layers/
│   │       └── LayerService.ts              # Layer operations
│   │
│   ├── models/
│   │   ├── Design.ts                        # Design model
│   │   └── DesignObject.ts                  # Design object model
│   │
│   └── config/
│       ├── database.ts                      # Database config
│       └── redis.ts                         # Redis config
```

---

## Technology Stack

**Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS, Zustand, HTML5 Canvas, Socket.IO Client

**Backend:** Node.js 18+, Express.js, TypeScript, PostgreSQL 15+, Redis 7+, MinIO, Socket.IO Server

**Development:** npm, Docker Compose, ESLint, Prettier
