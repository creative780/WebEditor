'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  RotateCw,
  Layers,
  Palette,
  Type,
  Image,
  Square,
} from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../state/useEditorStore';

interface Position {
  x: number;
  y: number;
}

export function ContextToolbar() {
  const selectedObjects = useSelectedObjects();
  const {
    duplicateObject,
    removeObject,
    updateObject,
    alignObjects,
    groupObjects,
    ungroupObjects,
  } = useEditorStore();

  const [position, setPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Update position when selection changes
  useEffect(() => {
    if (selectedObjects.length === 0) {
      setIsVisible(false);
      return;
    }

    // Calculate center position of selection
    const bounds = selectedObjects.reduce(
      (acc, obj) => ({
        minX: Math.min(acc.minX, obj.x),
        minY: Math.min(acc.minY, obj.y),
        maxX: Math.max(acc.maxX, obj.x + obj.width),
        maxY: Math.max(acc.maxY, obj.y + obj.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    // Position toolbar above selection
    setPosition({
      x: (bounds.minX + bounds.maxX) / 2,
      y: bounds.minY - 60, // 60px above
    });
    setIsVisible(true);
  }, [selectedObjects]);

  if (!isVisible || selectedObjects.length === 0) {
    return null;
  }

  const firstObject = selectedObjects[0];
  const isLocked = firstObject.locked;
  const isVisible = firstObject.visible !== false;
  const hasGroup = firstObject.groupId;

  const handleAction = (action: () => void) => {
    action();
  };

  const getObjectIcon = () => {
    if (selectedObjects.length > 1) return <Layers size={14} />;
    switch (firstObject.type) {
      case 'text':
        return <Type size={14} />;
      case 'image':
        return <Image size={14} />;
      case 'shape':
        return <Square size={14} />;
      default:
        return <Square size={14} />;
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl p-2 flex items-center gap-1"
      style={{
        left: position ? `${position.x}px` : 0,
        top: position ? `${position.y}px` : 0,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Object Type Indicator */}
      <div className="flex items-center gap-2 px-2 border-r border-gray-700">
        {getObjectIcon()}
        <span className="text-xs font-medium">
          {selectedObjects.length > 1
            ? `${selectedObjects.length} objects`
            : firstObject.type.charAt(0).toUpperCase() + firstObject.type.slice(1)}
        </span>
      </div>

      {/* Quick Actions */}
      <button
        className="toolbar-btn"
        onClick={() => handleAction(() => duplicateObject(firstObject.id))}
        title="Duplicate (Ctrl+D)"
      >
        <Copy size={14} />
      </button>

      <button
        className="toolbar-btn"
        onClick={() => handleAction(() => removeObject(firstObject.id))}
        title="Delete (Del)"
      >
        <Trash2 size={14} />
      </button>

      <div className="w-px h-6 bg-gray-700" />

      {/* Lock/Unlock */}
      <button
        className="toolbar-btn"
        onClick={() => handleAction(() => updateObject(firstObject.id, { locked: !isLocked }))}
        title={isLocked ? 'Unlock' : 'Lock'}
      >
        {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
      </button>

      {/* Show/Hide */}
      <button
        className="toolbar-btn"
        onClick={() => handleAction(() => updateObject(firstObject.id, { visible: !isVisible }))}
        title={isVisible ? 'Hide' : 'Show'}
      >
        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      {/* Alignment (multiple objects) */}
      {selectedObjects.length > 1 && (
        <>
          <div className="w-px h-6 bg-gray-700" />
          
          <button
            className="toolbar-btn"
            onClick={() => handleAction(() => alignObjects('left'))}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>

          <button
            className="toolbar-btn"
            onClick={() => handleAction(() => alignObjects('center'))}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>

          <button
            className="toolbar-btn"
            onClick={() => handleAction(() => alignObjects('right'))}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
        </>
      )}

      {/* Group/Ungroup */}
      {selectedObjects.length >= 2 && (
        <>
          <div className="w-px h-6 bg-gray-700" />
          
          {hasGroup ? (
            <button
              className="toolbar-btn"
              onClick={() => handleAction(() => ungroupObjects(hasGroup))}
              title="Ungroup"
            >
              <Layers size={14} />
            </button>
          ) : (
            <button
              className="toolbar-btn"
              onClick={() => handleAction(() => groupObjects(selectedObjects.map(o => o.id)))}
              title="Group (Ctrl+G)"
            >
              <Layers size={14} />
            </button>
          )}
        </>
      )}

      <style jsx>{`
        .toolbar-btn {
          @apply p-2 hover:bg-gray-800 rounded transition-colors;
        }
      `}</style>
    </div>
  );
}

