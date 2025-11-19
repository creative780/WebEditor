'use client';

import { useState, useMemo } from 'react';
import { useEditorStore, useSelectedObjects } from '../../../../state/useEditorStore';
import { LayerItem } from './components/LayerItem';
import { LayerSearch } from './components/LayerSearch';
import { LayerActions } from './components/LayerActions';
import { useLayerOperations } from './hooks/useLayerOperations';

export function LayersPanel() {
  const { objects, selection, selectObject } = useEditorStore();
  const selectedObjects = useSelectedObjects();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    handleToggleVisibility,
    handleToggleLock,
    handleDelete,
    handleDuplicate,
    handleMoveLayer,
    handleGroupSelected,
    handleUngroupSelected,
  } = useLayerOperations();

  // Filter objects based on search
  const filteredObjects = useMemo(() => {
    return objects.filter(
      (obj) =>
        obj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [objects, searchTerm]);

  // Sort objects by zIndex (bottom to top)
  const sortedObjects = useMemo(() => {
    return [...filteredObjects].sort((a, b) => a.zIndex - b.zIndex);
  }, [filteredObjects]);

  const canGroup = selection.length >= 2;
  const canUngroup =
    selection.length > 0 &&
    objects.find((o) => o.id === selection[0])?.groupId !== undefined;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">LAYERS</h3>
          <span className="text-xs text-gray-500">{objects.length}</span>
        </div>
      </div>

      <div className="panel-content">
        <LayerSearch value={searchTerm} onChange={setSearchTerm} />

        <LayerActions
          selectionCount={selection.length}
          canGroup={canGroup}
          canUngroup={canUngroup}
          onGroup={handleGroupSelected}
          onUngroup={handleUngroupSelected}
          onDuplicateAll={() => {}}
          onDeleteAll={() => {}}
        />

        {/* Layers List */}
        <div className="space-y-1">
          {sortedObjects.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">
              {searchTerm ? 'No layers found' : 'No layers yet'}
            </div>
          ) : (
            sortedObjects.map((obj) => {
              const isSelected = selection.includes(obj.id);
              const currentIndex = sortedObjects.findIndex((o) => o.id === obj.id);

              return (
                <LayerItem
                  key={obj.id}
                  obj={obj}
                  isSelected={isSelected}
                  onSelect={() => selectObject(obj.id)}
                  onToggleVisibility={() => handleToggleVisibility(obj.id)}
                  onToggleLock={() => handleToggleLock(obj.id)}
                  onDelete={() => handleDelete(obj.id)}
                  onDuplicate={() => handleDuplicate(obj.id)}
                  onMoveUp={() => handleMoveLayer(obj.id, 'up')}
                  onMoveDown={() => handleMoveLayer(obj.id, 'down')}
                  canMoveUp={currentIndex < sortedObjects.length - 1}
                  canMoveDown={currentIndex > 0}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

