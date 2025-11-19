import { useCallback } from 'react';
import { useEditorStore, ObjBase } from '../../../../../state/useEditorStore';

export function useLayerOperations() {

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const store = useEditorStore.getState();
      const obj = store.objects.find((o) => o.id === id);
      if (obj) {
        const currentVisible = obj.visible !== false; // Default to true if undefined
        store.updateObject(id, { visible: !currentVisible });
      }
    },
    []
  );

  const handleToggleLock = useCallback(
    (id: string) => {
      const store = useEditorStore.getState();
      const obj = store.objects.find((o) => o.id === id);
      if (obj) {
        const currentLocked = obj.locked === true; // Default to false if undefined
        store.updateObject(id, { locked: !currentLocked });
      }
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      const store = useEditorStore.getState();
      store.removeObject(id);
    },
    []
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const store = useEditorStore.getState();
      store.duplicateObject(id);
    },
    []
  );

  const handleMoveLayer = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const store = useEditorStore.getState();
      const sortedObjects = [...store.objects].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedObjects.findIndex((o) => o.id === id);
      
      if (currentIndex === -1) return;
      
      if (direction === 'up' && currentIndex < sortedObjects.length - 1) {
        // Move up: swap with next object
        const nextIndex = currentIndex + 1;
        const updates = [
          { id, updates: { zIndex: sortedObjects[nextIndex].zIndex } },
          { id: sortedObjects[nextIndex].id, updates: { zIndex: sortedObjects[currentIndex].zIndex } },
        ];
        store.updateObjects(updates);
      } else if (direction === 'down' && currentIndex > 0) {
        // Move down: swap with previous object
        const prevIndex = currentIndex - 1;
        const updates = [
          { id, updates: { zIndex: sortedObjects[prevIndex].zIndex } },
          { id: sortedObjects[prevIndex].id, updates: { zIndex: sortedObjects[currentIndex].zIndex } },
        ];
        store.updateObjects(updates);
      }
    },
    []
  );

  const handleGroupSelected = useCallback(() => {
    const store = useEditorStore.getState();
    if (store.selection.length >= 2) {
      const groupId = store.groupObjects(store.selection);
      console.log('Grouped objects:', groupId);
    }
  }, []);

  const handleUngroupSelected = useCallback(() => {
    const store = useEditorStore.getState();
    if (store.selection.length > 0) {
      const firstObj = store.objects.find((o) => o.id === store.selection[0]);
      if (firstObj?.groupId) {
        store.ungroupObjects(firstObj.groupId);
        console.log('Ungrouped:', firstObj.groupId);
      }
    }
  }, []);

  return {
    handleToggleVisibility,
    handleToggleLock,
    handleDelete,
    handleDuplicate,
    handleMoveLayer,
    handleGroupSelected,
    handleUngroupSelected,
  };
}

