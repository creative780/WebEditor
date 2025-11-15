'use client';

import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { ObjBase } from '../../../../../state/useEditorStore';

interface LayerItemProps {
  obj: ObjBase;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function LayerItem({
  obj,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: LayerItemProps) {
  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'text':
        return 'T';
      case 'image':
        return '🖼️';
      case 'shape':
        return '⬜';
      case 'path':
        return '📐';
      default:
        return '?';
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
        isSelected
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {/* Object Icon */}
      <div className="w-6 h-6 flex items-center justify-center text-xs font-semibold">
        {getObjectIcon(obj.type)}
      </div>

      {/* Object Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {obj.name ||
            `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} ${obj.id.slice(-4)}`}
        </div>
        <div className="text-xs text-gray-500">
          {obj.type} • {Math.round(obj.width * 100) / 100} ×{' '}
          {Math.round(obj.height * 100) / 100}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Layer Order Controls */}
        <div className="flex flex-col">
          <button
            className="p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            title="Bring forward"
            disabled={!canMoveUp}
          >
            <ChevronUp className="icon-xs" />
          </button>
          <button
            className="p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            title="Send backward"
            disabled={!canMoveDown}
          >
            <ChevronDown className="icon-xs" />
          </button>
        </div>

        {/* Visibility Toggle */}
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          title={obj.visible ? 'Hide layer' : 'Show layer'}
        >
          {obj.visible ? (
            <Eye className="icon-sm" />
          ) : (
            <EyeOff className="icon-sm text-gray-400" />
          )}
        </button>

        {/* Lock Toggle */}
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          title={obj.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {obj.locked ? (
            <Lock className="icon-sm" />
          ) : (
            <Unlock className="icon-sm text-gray-400" />
          )}
        </button>

        {/* Duplicate */}
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate layer"
        >
          <Copy className="icon-sm" />
        </button>

        {/* Delete */}
        <button
          className="p-1 hover:bg-red-100 rounded text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete layer"
        >
          <Trash2 className="icon-sm" />
        </button>
      </div>
    </div>
  );
}

