import { useCallback } from 'react';
import { useEditorStore, ObjBase } from '../../../../../state/useEditorStore';

export function useLayerOperations() {
  const {
    objects,
    selection,
    removeObject,
    duplicateObject,
    selectObject,
    updateObject,
    groupObjects,
    ungroupObjects,
  } = useEditorStore();

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const obj = objects.find((o) => o.id === id);
      if (obj) {
        updateObject(id, { visible: !obj.visible });
      }
    },
    [objects, updateObject]
  );

  const handleToggleLock = useCallback(
    (id: string) => {
      const obj = objects.find((o) => o.id === id);
      if (obj) {
        updateObject(id, { locked: !obj.locked });
      }
    },
    [objects, updateObject]
  );

  const handleDelete = useCallback(
    (id: string) => {
      removeObject(id);
    },
    [removeObject]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateObject(id);
    },
    [duplicateObject]
  );

  const handleMoveLayer = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const obj = objects.find((o) => o.id === id);
      if (!obj) return;

      const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedObjects.findIndex((o) => o.id === id);

      if (direction === 'up' && currentIndex < sortedObjects.length - 1) {
        const nextObj = sortedObjects[currentIndex + 1];
        const tempZIndex = obj.zIndex;
        updateObject(id, { zIndex: nextObj.zIndex });
        updateObject(nextObj.id, { zIndex: tempZIndex });
      } else if (direction === 'down' && currentIndex > 0) {
        const prevObj = sortedObjects[currentIndex - 1];
        const tempZIndex = obj.zIndex;
        updateObject(id, { zIndex: prevObj.zIndex });
        updateObject(prevObj.id, { zIndex: tempZIndex });
      }
    },
    [objects, updateObject]
  );

  const handleGroupSelected = useCallback(() => {
    if (selection.length >= 2) {
      const groupId = groupObjects(selection);
      console.log('Grouped objects:', groupId);
    }
  }, [selection, groupObjects]);

  const handleUngroupSelected = useCallback(() => {
    if (selection.length > 0) {
      const firstObj = objects.find((o) => o.id === selection[0]);
      if (firstObj?.groupId) {
        ungroupObjects(firstObj.groupId);
        console.log('Ungrouped:', firstObj.groupId);
      }
    }
  }, [selection, objects, ungroupObjects]);

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

