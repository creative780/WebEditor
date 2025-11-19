/**
 * Keyboard event handlers for text editing
 */

import { useCallback, useEffect } from 'react';
import { useEditorStore } from '../../../../state/useEditorStore';

export interface KeyboardEventsParams {
  isTextEditing: boolean;
  editingTextId: string | null;
  setIsTextEditing: (editing: boolean) => void;
  setEditingTextId: (id: string | null) => void;
}

/**
 * Hook for keyboard event handling (text editing)
 */
export function useKeyboardEvents(params: KeyboardEventsParams) {
  const { isTextEditing, editingTextId, setIsTextEditing, setEditingTextId } = params;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isTextEditing || !editingTextId) return;

      const objects = useEditorStore.getState().objects;
      const editingText = objects.find((obj) => obj.id === editingTextId);
      if (!editingText || editingText.type !== 'text') return;

      // Check if this is placeholder text
      const isPlaceholder = editingText.text === 'Type here...';

      switch (e.key) {
        case 'Escape':
          // Finish editing
          setIsTextEditing(false);
          setEditingTextId(null);
          break;
        case 'Enter':
          // Add new line
          e.preventDefault();
          const enterText = isPlaceholder ? '\n' : editingText.text + '\n';
          useEditorStore.getState().updateObject(editingTextId, {
            text: enterText,
          });
          break;
        case 'Backspace':
          // Handle backspace
          e.preventDefault();
          if (isPlaceholder) {
            // If placeholder, clear it completely
            useEditorStore.getState().updateObject(editingTextId, {
              text: '',
            });
          } else if (editingText.text.length > 0) {
            useEditorStore.getState().updateObject(editingTextId, {
              text: editingText.text.slice(0, -1),
            });
          }
          break;
        case 'Delete':
          // Handle delete
          e.preventDefault();
          if (isPlaceholder) {
            // If placeholder, clear it completely
            useEditorStore.getState().updateObject(editingTextId, {
              text: '',
            });
          } else if (editingText.text.length > 0) {
            useEditorStore.getState().updateObject(editingTextId, {
              text: editingText.text.slice(0, -1),
            });
          }
          break;
        default:
          // Handle regular character input
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const newText = isPlaceholder ? e.key : editingText.text + e.key;
            useEditorStore.getState().updateObject(editingTextId, {
              text: newText,
            });
          }
          break;
      }
    },
    [isTextEditing, editingTextId, setIsTextEditing, setEditingTextId]
  );

  // Attach keyboard event listener when editing text
  useEffect(() => {
    if (isTextEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isTextEditing, handleKeyDown]);

  return { handleKeyDown };
}

