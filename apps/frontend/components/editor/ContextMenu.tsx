'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Layers,
  Folder,
  FolderMinus,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Settings,
} from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../state/useEditorStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const selectedObjects = useSelectedObjects();
  const {
    duplicateObject,
    removeObject,
    updateObject,
    alignObjects,
    groupObjects,
    ungroupObjects,
    applyTransform,
  } = useEditorStore();

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const hasSelection = selectedObjects.length > 0;
  const firstObject = selectedObjects[0];
  const isLocked = firstObject?.locked;
  const isVisible = firstObject?.visible !== false;
  const hasGroup = firstObject?.groupId;
  const multipleSelected = selectedObjects.length > 1;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-300 py-2 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {hasSelection ? (
        <>
          {/* Basic Actions */}
          <MenuItem
            icon={<Copy size={16} />}
            label="Duplicate"
            shortcut="Ctrl+D"
            onClick={() => handleAction(() => duplicateObject(firstObject.id))}
          />
          <MenuItem
            icon={<Trash2 size={16} />}
            label="Delete"
            shortcut="Del"
            onClick={() => handleAction(() => removeObject(firstObject.id))}
            danger
          />

          <MenuDivider />

          {/* Lock/Visibility */}
          <MenuItem
            icon={isLocked ? <Unlock size={16} /> : <Lock size={16} />}
            label={isLocked ? 'Unlock' : 'Lock'}
            onClick={() => handleAction(() => updateObject(firstObject.id, { locked: !isLocked }))}
          />
          <MenuItem
            icon={isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            label={isVisible ? 'Hide' : 'Show'}
            onClick={() => handleAction(() => updateObject(firstObject.id, { visible: !isVisible }))}
          />

          <MenuDivider />

          {/* Transform Actions */}
          <MenuItem
            icon={<FlipHorizontal size={16} />}
            label="Flip Horizontal"
            onClick={() => handleAction(() => {
              // Flip by negating width
              applyTransform(firstObject.id, {
                width: -firstObject.width,
              });
            })}
          />
          <MenuItem
            icon={<FlipVertical size={16} />}
            label="Flip Vertical"
            onClick={() => handleAction(() => {
              // Flip by negating height
              applyTransform(firstObject.id, {
                height: -firstObject.height,
              });
            })}
          />
          <MenuItem
            icon={<RotateCw size={16} />}
            label="Rotate 90°"
            onClick={() => handleAction(() => {
              applyTransform(firstObject.id, {
                rotation: (firstObject.rotation + 90) % 360,
              });
            })}
          />

          {multipleSelected && (
            <>
              <MenuDivider />

              {/* Alignment */}
              <MenuSubheading>Align</MenuSubheading>
              <MenuItem
                icon={<AlignLeft size={16} />}
                label="Align Left"
                onClick={() => handleAction(() => alignObjects('left'))}
              />
              <MenuItem
                icon={<AlignCenter size={16} />}
                label="Align Center"
                onClick={() => handleAction(() => alignObjects('center'))}
              />
              <MenuItem
                icon={<AlignRight size={16} />}
                label="Align Right"
                onClick={() => handleAction(() => alignObjects('right'))}
              />
              <MenuItem
                icon={<AlignVerticalJustifyStart size={16} />}
                label="Align Top"
                onClick={() => handleAction(() => alignObjects('top'))}
              />
              <MenuItem
                icon={<AlignVerticalJustifyCenter size={16} />}
                label="Align Middle"
                onClick={() => handleAction(() => alignObjects('middle'))}
              />
              <MenuItem
                icon={<AlignVerticalJustifyEnd size={16} />}
                label="Align Bottom"
                onClick={() => handleAction(() => alignObjects('bottom'))}
              />
            </>
          )}

          {multipleSelected && (
            <>
              <MenuDivider />

              {/* Grouping */}
              {hasGroup ? (
                <MenuItem
                  icon={<FolderMinus size={16} />}
                  label="Ungroup"
                  shortcut="Ctrl+Shift+G"
                  onClick={() => handleAction(() => ungroupObjects(hasGroup))}
                />
              ) : (
                <MenuItem
                  icon={<Folder size={16} />}
                  label="Group"
                  shortcut="Ctrl+G"
                  onClick={() => handleAction(() => groupObjects(selectedObjects.map(o => o.id)))}
                />
              )}
            </>
          )}

          <MenuDivider />

          {/* Arrange */}
          <MenuSubheading>Arrange</MenuSubheading>
          <MenuItem
            icon={<MoveUp size={16} />}
            label="Bring Forward"
            shortcut="Ctrl+]"
            onClick={() => handleAction(() => {
              updateObject(firstObject.id, { zIndex: firstObject.zIndex + 1 });
            })}
          />
          <MenuItem
            icon={<MoveDown size={16} />}
            label="Send Backward"
            shortcut="Ctrl+["
            onClick={() => handleAction(() => {
              updateObject(firstObject.id, { zIndex: firstObject.zIndex - 1 });
            })}
          />
        </>
      ) : (
        <>
          {/* Canvas Actions */}
          <MenuItem
            icon={<Layers size={16} />}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={() => handleAction(() => {})}
            disabled
          />
          <MenuItem
            icon={<Settings size={16} />}
            label="Canvas Settings"
            onClick={() => handleAction(() => {})}
          />
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {shortcut && (
        <span className="text-xs text-gray-400 font-mono">{shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-gray-200 my-2" />;
}

function MenuSubheading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

