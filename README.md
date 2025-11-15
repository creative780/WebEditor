# Web-to-Print Editor

A professional web-based design editor for creating print-ready designs. Create business cards, flyers, posters, and more with professional color management, templates, and export capabilities.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [For Developers](#for-developers)

---

## Overview

A web-based design editor built specifically for creating print-ready designs. Works entirely in your browser with no software installation required.

**What You Can Create:** Business cards, flyers, brochures, posters, labels, and any print design with exact dimensions and print specifications.

**Key Benefits:**

- No software installation required
- Print-ready features (CMYK colors, bleed areas, DPI settings)
- Template library
- Professional design tools

---

## Features

### Design Tools

- **10 Shape Tools** - Rectangle, circle, polygon, star, arrow, callout, line, heart, gear
- **Text Editor** - Font selection, formatting, alignment
- **Image Support** - Upload and place images
- **Transform Tools** - Move, resize, rotate, align objects

### Color Management

- **RGB Colors** - Web colors with sliders (0-255)
- **CMYK Colors** - Print colors with independent sliders (0-100%)
- **Pantone Colors** - Industry-standard color matching
- **Color Picker** - Visual color selection
- **Gradients** - Multi-color gradients
- **Color Harmony** - Color scheme suggestions

### Professional Features

- **Unit Conversion** - px, in, cm, mm, ft
- **DPI Settings** - 72-600 DPI for print quality
- **Bleed Areas** - Professional printing support
- **Crop Marks** - Automatic generation for exports
- **Print Validation** - Color compatibility checking

### Export & Templates

- **Export Formats** - PDF, PNG, JPG, SVG
- **Quality Presets** - 72-600 DPI options
- **Template Library** - Browse and use templates
- **Save Templates** - Create reusable templates (stored locally)
- **Export History** - Track exports (last 50)

### Layer Management

- Layer organization, show/hide, lock, reorder, search

---

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd web-to-print-monorepo
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp apps/backend/env.example apps/backend/.env
   cp apps/frontend/env.example apps/frontend/.env.local
   ```

3. **Start services:**

   ```bash
   docker compose up -d postgres redis minio
   ```

4. **Run the application:**

   ```bash
   npm run dev
   ```

5. **Access:**
   - Frontend: http://localhost:3000
   - Editor: http://localhost:3000/editor/sample-design
   - Backend API: http://localhost:8000

---

## Usage

### Creating a Design

1. Open the editor at http://localhost:3000/editor/sample-design
2. **Add shapes:** Click shape tools in left sidebar, click canvas to place
3. **Add text:** Click text tool, click canvas, type your text
4. **Customize:** Select objects and use right panel to change colors, size, position
5. **Save:** Designs auto-save to browser local storage

### Editor Interface

**Left Sidebar:** Shape tools, text tool, selection tool

**Right Panel Tabs:**

- Preview, Quality, Templates, Alignment, Background
- Text, Shapes, Colors, Layers, Export, Collaboration

**Top Toolbar:** Undo/redo, zoom controls, view options

**Floating Toolbar:** Appears on object selection - delete, duplicate, alignment tools

### Working with Colors

- **RGB:** Use RGB sliders (0-255) for screen colors
- **CMYK:** Use CMYK sliders (0-100%) for print colors - sliders work independently
- **Pantone:** Browse Pantone colors in Colors tab
- **Color Picker:** Click color swatch for visual selection

### Exporting

1. Click "Export" tab in right panel
2. Choose format (PDF/PNG/JPG/SVG)
3. Select quality (72-600 DPI)
4. Configure options (bleed, crop marks, transparency)
5. Click "Export [FORMAT]" - file downloads automatically

### Templates

**Browse:** Click "Templates" tab → browse by category → click "Use Template"

**Create:** Design → "Templates" tab → "Save as Template" → fill name/category/industry → "Create Template"

### Keyboard Shortcuts

- `Ctrl+Z` - Undo | `Ctrl+Y` - Redo | `Ctrl+C` - Copy | `Ctrl+V` - Paste
- `Ctrl+D` - Duplicate | `Delete` - Delete | `Ctrl+A` - Select all
- `Ctrl++` - Zoom in | `Ctrl+-` - Zoom out | `Ctrl+0` - Fit to screen
- `Space+Drag` - Pan canvas | `Shift+Drag` - Constrain proportions

---

## Project Structure

```
web-to-print-monorepo/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Django application
├── packages/              # Shared code
│   ├── ui/               # UI components
│   ├── types/            # Type definitions
│   └── config/           # Configurations
└── docker-compose.yml    # Services config
```

**Key Frontend Files:**

- `components/editor/EditorCanvas.tsx` - Main canvas
- `components/editor/panels/` - Color, Layers, Text, Export panels
- `lib/export.ts` - Export functionality
- `lib/templates.ts` - Template system
- `state/useEditorStore.ts` - State management

---

## API Documentation

### Main Endpoints

**Designs:**

- `POST /api/designs` - Create design
- `GET /api/designs` - List designs
- `GET /api/designs/:id` - Get design
- `PUT /api/designs/:id` - Update design
- `DELETE /api/designs/:id` - Delete design

**Objects:**

- `POST /api/designs/:id/objects` - Add object
- `PUT /api/designs/:id/objects/:objId` - Update object
- `DELETE /api/designs/:id/objects/:objId` - Remove object

**Export:**

- `POST /api/export/pdf` - Export as PDF
- `POST /api/export/png` - Export as PNG
- `POST /api/export/jpg` - Export as JPG
- `POST /api/export/svg` - Export as SVG

**Templates:**

- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

**Collaboration:**

- `POST /api/collaboration/share` - Share design
- `GET /api/collaboration/:id/comments` - Get comments
- `POST /api/collaboration/:id/comments` - Add comment

**Note:** Collaboration backend exists but requires WebSocket setup for real-time features.

---

## Troubleshooting

### Application Won't Start

- Check Node.js version: `node --version` (should be 18+)
- Ensure dependencies installed: `npm install`
- Check port 3000 availability

### Database Connection Error

- Verify Docker is running
- Start services: `docker compose up -d postgres redis minio`
- Wait 30 seconds for services to start
- Check status: `docker compose ps`

### Designs Not Saving

- Check browser console (F12) for errors
- Verify backend running: http://localhost:8000
- Check browser local storage capacity

### Export Not Working

- Check browser download settings
- Verify backend export service running
- Try different export format

### Colors Look Wrong

- RGB vs CMYK: CMYK looks different on screen (normal)
- Use Pantone for exact color matching
- Check monitor calibration

---

## For Developers

### Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS, Zustand
- **Backend:** Django 5, PostgreSQL, Redis, MinIO
- **Real-Time:** Socket.IO (WebSocket)

### Development Setup

```bash
# Install dependencies
npm install

# Start services
docker compose up -d postgres redis minio

# Run migrations
cd apps/backend && python manage.py migrate

# Start dev servers
npm run dev
# Or individually:
cd apps/frontend && npm run dev
cd apps/backend && python manage.py runserver
```

### Available Scripts

**Root:**

- `npm run dev` - Start frontend and backend
- `npm run build` - Build all apps
- `npm run lint` - Lint code
- `npm run typecheck` - Type check

**Frontend:**

- `npm run dev` - Dev server
- `npm run build` - Production build
- `npm run start` - Production server

**Backend:**

- `python manage.py runserver` - Start server
- `python manage.py migrate` - Run migrations
- `python manage.py test` - Run tests

### Code Structure

- **Components** - `components/` - Reusable UI components
- **Hooks** - `hooks/` - Custom React hooks
- **Utilities** - `lib/` - Helper functions
- **State** - `state/` - Zustand state management
- **Services** - `src/services/` - Backend business logic

### Contributing

1. Create feature branch from `develop`
2. Make changes
3. Run `npm run lint` and `npm run typecheck`
4. Run tests: `npm test`
5. Submit pull request

---

## Additional Resources

**Documentation:**

- `apps/frontend/STRUCTURE.md` - Frontend structure
- `apps/backend/README.md` - Backend API docs
- `process.md` - Implementation details

**External:**

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Django Docs](https://docs.djangoproject.com)

---

**Version:** 1.0.0 | **Status:** Production Ready | **Last Updated:** October 2025
