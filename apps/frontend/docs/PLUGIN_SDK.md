# PrintStudio Plugin SDK Documentation

## Version 1.0.0

This document provides comprehensive documentation for developing plugins for the PrintStudio Editor.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Plugin Architecture](#plugin-architecture)
3. [Plugin API](#plugin-api)
4. [Security & Permissions](#security--permissions)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Getting Started

### Plugin Manifest

Every plugin must have a manifest file (`plugin.json`) that describes the plugin:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A useful plugin",
  "author": "Your Name",
  "permissions": ["read", "write", "objects"],
  "apiVersion": "1.0.0",
  "entry": "main.js",
  "category": "tools",
  "tags": ["utility", "helper"]
}
```

### Required Fields

- `id`: Unique identifier for your plugin
- `name`: Display name
- `version`: Semantic version (e.g., "1.0.0")
- `description`: Brief description
- `author`: Plugin author name
- `permissions`: Array of required permissions
- `apiVersion`: Plugin API version (currently "1.0.0")
- `entry`: Main plugin code file or URL

### Optional Fields

- `icon`: URL to plugin icon
- `category`: Plugin category (tools, effects, automation, export, import)
- `tags`: Array of tags for discoverability
- `homepage`: Plugin homepage URL
- `repository`: Source code repository URL
- `license`: License type
- `minEditorVersion`: Minimum editor version required

---

## Plugin Architecture

### Lifecycle Hooks

Plugins can define lifecycle hooks that are called at specific times:

```javascript
// onLoad - Called when plugin is loaded
onLoad(api) {
  console.log('Plugin loaded!');
}

// onExecute - Called when plugin is executed
onExecute(api, context) {
  // Plugin logic here
  return { success: true };
}

// onUnload - Called when plugin is unloaded
onUnload(api) {
  console.log('Plugin unloaded!');
}
```

---

## Plugin API

The Plugin API provides methods to interact with the editor.

### Object Manipulation

#### `addObject(object)`

Add a new object to the canvas.

```javascript
const textObj = {
  id: 'text-' + Date.now(),
  type: 'text',
  text: 'Hello World',
  x: 100,
  y: 100,
  width: 200,
  height: 50,
  fontSize: 24,
  color: '#000000',
  // ... other properties
};

const id = api.addObject(textObj);
```

#### `updateObject(id, updates)`

Update an existing object.

```javascript
api.updateObject('text-123', {
  text: 'Updated text',
  fontSize: 32,
});
```

#### `deleteObject(id)`

Delete an object.

```javascript
api.deleteObject('text-123');
```

#### `getObject(id)`

Get an object by ID.

```javascript
const obj = api.getObject('text-123');
console.log(obj.text);
```

### Selection Management

#### `getSelection()`

Get currently selected object IDs.

```javascript
const selected = api.getSelection();
console.log('Selected:', selected);
```

#### `selectObject(id)`

Select a single object.

```javascript
api.selectObject('text-123');
```

#### `selectObjects(ids)`

Select multiple objects.

```javascript
api.selectObjects(['text-123', 'shape-456']);
```

#### `clearSelection()`

Clear the current selection.

```javascript
api.clearSelection();
```

### Canvas Access

#### `getCanvas()`

Get canvas properties.

```javascript
const canvas = api.getCanvas();
console.log('Canvas size:', canvas.width, canvas.height);
console.log('Zoom:', canvas.zoom);
```

#### `getObjects()`

Get all objects on the canvas.

```javascript
const objects = api.getObjects();
objects.forEach(obj => {
  console.log(obj.id, obj.type);
});
```

### Notifications

#### `showNotification(message, type)`

Show a notification to the user.

```javascript
api.showNotification('Operation completed!', 'success');
api.showNotification('An error occurred', 'error');
api.showNotification('Something happened', 'info');
api.showNotification('Warning message', 'warning');
```

### Utilities

#### `log(message, data)`

Log a message (for debugging).

```javascript
api.log('Processing data', { count: 10 });
```

---

## Security & Permissions

### Available Permissions

- `read`: Read canvas state and objects
- `write`: Modify objects and canvas
- `canvas`: Access canvas properties (size, zoom, pan)
- `objects`: Create, update, and delete objects
- `export`: Export designs to various formats
- `templates`: Access and apply templates
- `files`: Read and write files
- `notifications`: Show notifications to users

### Permission Scoping

Plugins must declare all required permissions in their manifest. The plugin will only have access to APIs that match its declared permissions.

### Security Validation

All plugin code is validated before execution:
- Dangerous patterns are blocked (eval, Function constructor, etc.)
- Direct API access is prevented
- Code size is limited (1MB max)

---

## Examples

### Example 1: Simple Text Adder

```javascript
// Adds a text object to the canvas
onExecute(api) {
  const textObj = {
    id: 'text-' + Date.now(),
    type: 'text',
    text: 'Hello from Plugin!',
    x: 200,
    y: 200,
    width: 300,
    height: 50,
    fontSize: 24,
    fontFamily: 'Inter',
    color: '#6F1414',
    rotation: 0,
    opacity: 1,
    zIndex: 1,
  };
  
  api.addObject(textObj);
  api.showNotification('Text added!', 'success');
  
  return { success: true };
}
```

### Example 2: Object Counter

```javascript
// Counts objects on the canvas
onExecute(api) {
  const objects = api.getObjects();
  const count = objects.length;
  
  api.showNotification(`Canvas has ${count} object(s)`, 'info');
  
  return { success: true, count };
}
```

### Example 3: Selection Duplicator

```javascript
// Duplicates selected objects
onExecute(api) {
  const selected = api.getSelection();
  
  if (selected.length === 0) {
    api.showNotification('No objects selected', 'warning');
    return { success: false };
  }
  
  selected.forEach(id => {
    const obj = api.getObject(id);
    if (obj) {
      const duplicate = {
        ...obj,
        id: obj.id + '-copy-' + Date.now(),
        x: obj.x + 20,
        y: obj.y + 20,
      };
      api.addObject(duplicate);
    }
  });
  
  api.showNotification(`Duplicated ${selected.length} object(s)`, 'success');
  
  return { success: true };
}
```

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```javascript
onExecute(api) {
  try {
    // Plugin logic
    return { success: true };
  } catch (error) {
    api.showNotification('Error: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}
```

### 2. User Feedback

Provide feedback for all operations:

```javascript
onExecute(api) {
  api.showNotification('Processing...', 'info');
  
  // Do work
  
  api.showNotification('Completed!', 'success');
}
```

### 3. Minimal Permissions

Request only the permissions you need:

```json
{
  "permissions": ["read", "write", "objects"]
}
```

### 4. Performance

- Keep execution time under 100ms when possible
- Avoid blocking operations
- Use efficient algorithms

### 5. Code Quality

- Write clean, readable code
- Add comments for complex logic
- Follow JavaScript best practices

---

## Testing

### Manual Testing

1. Install your plugin locally
2. Test all functionality
3. Verify permissions work correctly
4. Check error handling

### Validation

Before submitting, ensure:
- ✅ Manifest is valid
- ✅ All required permissions are declared
- ✅ Code passes security validation
- ✅ Error handling is implemented
- ✅ User notifications are clear

---

## Publishing

To publish your plugin:

1. Create a valid manifest
2. Upload plugin code to a hosting service
3. Submit plugin to the marketplace
4. Wait for approval

---

## Support

For questions or issues:
- Check the documentation
- Review example plugins
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** 2025

