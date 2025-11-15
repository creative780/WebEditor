# 📖 Phase 4 User Guide - How to Use New Features

## 🎯 Where to Find Everything

### Right Panel - New Tabs Added!

```
┌─────────────────────────────────────┐
│  Preview | Quality | Templates | ... │  ← Existing tabs
│  ... | Layers | EXPORT | COLLAB      │  ← NEW TABS! 🆕
└─────────────────────────────────────┘
```

Look for these two new tabs in the right panel:
- **Export** (Download icon) - Export your design
- **Collab** (Users icon) - Collaboration features

---

## 🎨 HOW TO USE: Export System

### Step-by-Step Export

1. **Open the Export Tab**
   ```
   Right Panel → Click "Export" tab
   ```

2. **Choose Your Format**
   - Click one of the 4 format boxes:
     - 📄 PDF - Print-ready
     - 🖼️ PNG - High quality
     - 🖼️ JPG - Compressed
     - 💻 SVG - Vector

3. **Select Quality**
   - Click one of the quality options:
     - Low (72 DPI) - Web
     - Medium (150 DPI) - Screen
     - High (300 DPI) - Print ⭐ Recommended
     - Ultra (600 DPI) - Large format

4. **Configure Settings**
   
   **For PDF**:
   - ✓ Include Bleed (adds 0.125" bleed area)
   - ✓ Crop Marks (cutting guidelines)

   **For PNG/SVG**:
   - ✓ Transparent (remove background)
   - Choose background color if not transparent

5. **Click "Export PDF/PNG/JPG/SVG" Button**
   - File downloads automatically!
   - Success message appears in green
   - Added to export history

6. **View Export History**
   - Click "Export History" 
   - See last 50 exports
   - Shows filename, date, format
   - Click "Clear" to remove history

### Export Info Box
The blue info box shows:
- Size (e.g., 6" × 4")
- Resolution (e.g., 300 DPI)
- Objects count
- Color mode (RGB/CMYK)

---

## 📚 HOW TO USE: Templates

### Save Your Design as Template

1. **Create Your Design**
   - Add shapes, text, images
   - Style them as desired

2. **Click Templates Tab**
   ```
   Right Panel → Click "Templates"
   ```

3. **Click "Save as Template" Button**
   - Big blue button at the top
   - Disabled if no objects on canvas

4. **Fill Out the Dialog**
   - **Template Name**: e.g., "My Business Card"
   - **Description**: What it's for
   - **Category**: Choose from dropdown
     - Business Cards
     - Flyers
     - Brochures
     - Posters
     - etc.
   - **Industry**: Choose from dropdown
     - Restaurant
     - Real Estate
     - Medical
     - etc.

5. **Click "Create Template"**
   - Template saved to your custom templates
   - Appears immediately in templates list
   - Searchable and filterable

### Using Your Custom Templates

1. Your custom templates appear with the built-in templates
2. Use filters to find them:
   - Industry dropdown
   - Category dropdown
   - Search box
3. Click template card to view details
4. Shows: Name, description, tags, rating

### Template Features

**Search**: Type in search box to find templates  
**Filter by Industry**: Dropdown menu  
**Filter by Category**: Dropdown menu  
**Sort**: By popularity, newest, or name  

---

## 👥 HOW TO USE: Collaboration

### Accessing Collaboration

```
Right Panel → Click "Collab" tab → Choose sub-tab
```

Three sub-tabs:
1. **Users** (👥 icon)
2. **Comments** (💬 icon)
3. **Versions** (🕐 icon)

---

### USERS TAB: Manage Collaborators

**Invite Someone**:
1. Click "Invite User" button (dashed border)
2. Enter email address
3. User added with default "Editor" role
4. User appears in list with colored avatar

**Change Permissions**:
1. Find user in list
2. Click dropdown on right (shows current role)
3. Select new role:
   - Owner - Full control (cannot be changed)
   - Editor - Can edit design
   - Viewer - Read-only access

**View Active Users**:
- Shows user name and email
- Colored circular avatar
- Permission level displayed

**Real-Time Features Box**:
Shows what's enabled:
- Live cursor tracking
- Instant updates
- Conflict resolution
- Presence indicators

---

### COMMENTS TAB: Feedback System

**Add a Comment**:
1. Type in the text area
2. Click "Add Comment" button
3. Comment appears below with:
   - Your name
   - Timestamp
   - Comment text

**Resolve a Comment**:
1. Find comment in list
2. Click ✓ (checkmark) icon
3. Comment marked as resolved
4. Shows "Resolved" badge
5. Text struck through

**Delete a Comment**:
1. Find comment in list
2. Click × (X) icon
3. Comment removed immediately

**Comment Features**:
- Threaded replies (nested)
- Timestamps (date & time)
- Resolution status
- User attribution

---

### VERSIONS TAB: Version Control

**Save a Version**:
1. Click "Save Version" button (blue)
2. Enter description (e.g., "Updated colors")
3. Click OK
4. Version saved with:
   - Version number (auto-incremented)
   - Your name
   - Timestamp
   - Description
   - "Current" badge

**View Version History**:
- All versions listed newest first
- Current version has blue badge
- Shows: Version #, creator, date, description

**Restore a Version**:
1. Find version in list (not current)
2. Click "Restore This Version"
3. Design reverts to that snapshot

---

## 🚀 Quick Start

### First Time Setup

1. **Frontend** (already running):
   ```
   http://localhost:3000/editor/sample-design
   ```

2. **Backend** (if not running):
   ```bash
   cd apps/backend
   npm install
   npm run dev
   ```

3. **Database** (run migration):
   ```bash
   psql -U postgres -d printstudio -f src/migrations/004_phase4_tables.sql
   ```

### Try It Out!

1. ✅ **Export Test**:
   - Add a circle to canvas
   - Export → PNG → High → Export PNG
   - File downloads!

2. ✅ **Template Test**:
   - Add shapes to canvas
   - Templates → Save as Template
   - Enter name → Create
   - Appears in list!

3. ✅ **Collaboration Test**:
   - Collab → Users → Invite User
   - Enter email → User added!

---

## 💡 Tips & Tricks

### Export Tips
- Use **High (300 DPI)** for professional printing
- Use **PNG with transparency** for web graphics
- Use **PDF with bleed** for print shops
- Check export history to re-download

### Template Tips
- Use descriptive names
- Add relevant tags
- Choose correct industry/category
- Create versions before major changes

### Collaboration Tips
- Set proper permissions (Viewer for clients)
- Use comments for feedback
- Save versions before major changes
- Resolve comments when addressed

---

## 🎊 You're All Set!

All Phase 4 features are:
- ✅ Fully implemented
- ✅ Integrated in UI
- ✅ Accessible via tabs
- ✅ Backend API ready
- ✅ Database tables created
- ✅ Zero build errors

**Start using them now!** 🚀

---

*Need help? Check PHASE_4_IMPLEMENTATION_GUIDE.md for technical details*

