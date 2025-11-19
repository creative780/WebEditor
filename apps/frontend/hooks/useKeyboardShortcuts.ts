'use client';

import { useEffect } from 'react';
import { useEditorStore } from '../state/useEditorStore';

export function useKeyboardShortcuts() {
  const {
    activeTool,
    setActiveTool,
    setActivePanel,
    addObject,
    undo,
    redo,
    duplicateObject,
    removeObject,
    selectObject,
    clearSelection,
    objects,
    selection,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActiveTool('move');
          }
          break;
        case 't':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            // Create text object
            const documentWidth = useEditorStore.getState().document.width;
            const documentHeight = useEditorStore.getState().document.height;
            
            const newText = {
              id: `text-${Date.now()}`,
              type: 'text' as const,
              text: 'Double-click to edit',
              x: documentWidth / 2 - 0.6,
              y: documentHeight / 2 - 0.25,
              width: 1.2, // Reduced width to enable wrapping after 10-15 words
              height: 0.5,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              name: 'Text',
              zIndex: Date.now(),
              fontFamily: 'Inter',
              fontSize: 200,
              fontWeight: 400,
              fontStyle: 'normal' as 'normal' | 'italic',
              textAlign: 'center' as 'left' | 'center' | 'right' | 'justify',
              verticalAlign: 'middle' as 'top' | 'middle' | 'bottom',
              lineHeight: 1.2,
              letterSpacing: 0,
              color: '#1a1a1a',
              textFill: '#1a1a1a', // Required textFill property
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              textDecoration: 'none' as 'none' | 'underline' | 'line-through',
              textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
              hyphenate: false,
              wrapMode: 'area' as 'path' | 'none' | 'area',
            };
            
            addObject(newText);
          }
          break;
        case 'r':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            // Create rectangle
            const documentWidth = useEditorStore.getState().document.width;
            const documentHeight = useEditorStore.getState().document.height;
            
            const newShape = {
              id: `shape-${Date.now()}`,
              type: 'shape' as const,
              shape: 'rectangle' as 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star',
              x: documentWidth / 2 - 1,
              y: documentHeight / 2 - 0.5,
              width: 2,
              height: 1,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              name: 'Rectangle',
              zIndex: Date.now(),
              fill: {
                type: 'solid' as const,
                color: '#6F1414',
              },
              stroke: {
                width: 1,
                color: '#5A1010',
                style: 'solid' as const,
                cap: 'butt' as const,
                join: 'miter' as const,
              },
              borderRadius: 4,
            };
            
            addObject(newShape);
          }
          break;
        case 'o':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            // Create circle
            const documentWidth = useEditorStore.getState().document.width;
            const documentHeight = useEditorStore.getState().document.height;
            
            const newShape = {
              id: `shape-${Date.now()}`,
              type: 'shape' as const,
              shape: 'circle' as 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star',
              x: documentWidth / 2 - 1,
              y: documentHeight / 2 - 1,
              width: 2,
              height: 2,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              name: 'Circle',
              zIndex: Date.now(),
              fill: {
                type: 'solid' as const,
                color: '#6F1414',
              },
              stroke: {
                width: 1,
                color: '#5A1010',
                style: 'solid' as const,
                cap: 'butt' as const,
                join: 'miter' as const,
              },
              borderRadius: 0,
            };
            
            addObject(newShape);
          }
          break;
        case 'l':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActivePanel('layers');
          }
          break;
        case 's':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActivePanel('shapes');
          }
          break;
        case 'g':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActivePanel('gradient');
          }
          break;
        case 'k':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActivePanel('color');
          }
          break;
        case 'u':
          if (!isCtrlOrCmd && !isShift) {
            e.preventDefault();
            setActivePanel('upload');
          }
          break;
      }

      // Action shortcuts
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (isShift) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'd':
            e.preventDefault();
            if (selection.length > 0) {
              duplicateObject(selection[0]);
            }
            break;
          case 'g':
            e.preventDefault();
            // Group objects (placeholder)
            console.log('Group objects');
            break;
          case 'shift':
            if (e.key === 'G') {
              e.preventDefault();
              // Ungroup objects (placeholder)
              console.log('Ungroup objects');
            }
            break;
          case ']':
            e.preventDefault();
            // Bring to front (placeholder)
            console.log('Bring to front');
            break;
          case '[':
            e.preventDefault();
            // Send to back (placeholder)
            console.log('Send to back');
            break;
        }
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection.length > 0) {
          e.preventDefault();
          selection.forEach(id => removeObject(id));
        }
      }

      // Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        setActiveTool('move');
      }

      // Arrow keys for nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selection.length > 0) {
          e.preventDefault();
          const nudgeAmount = isShift ? 10 : 1; // Shift = 10px, normal = 1px
          
          selection.forEach(id => {
            const obj = objects.find(o => o.id === id);
            if (obj) {
              let newX = obj.x;
              let newY = obj.y;
              
              switch (e.key) {
                case 'ArrowUp':
                  newY -= nudgeAmount;
                  break;
                case 'ArrowDown':
                  newY += nudgeAmount;
                  break;
                case 'ArrowLeft':
                  newX -= nudgeAmount;
                  break;
                case 'ArrowRight':
                  newX += nudgeAmount;
                  break;
              }
              
              useEditorStore.getState().applyTransform(id, { x: newX, y: newY });
            }
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, selection, objects, setActiveTool, setActivePanel, addObject, undo, redo, duplicateObject, removeObject, selectObject, clearSelection]);
}
