'use client';

import { Copy, Trash2, FolderPlus, FolderMinus } from 'lucide-react';

interface LayerActionsProps {
  selectionCount: number;
  canGroup: boolean;
  canUngroup: boolean;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicateAll: () => void;
  onDeleteAll: () => void;
}

export function LayerActions({
  selectionCount,
  canGroup,
  canUngroup,
  onGroup,
  onUngroup,
  onDuplicateAll,
  onDeleteAll,
}: LayerActionsProps) {
  if (selectionCount === 0) return null;

  return (
    <>
      {/* Group/Ungroup Actions */}
      <div className="mb-4 flex gap-2">
        {canGroup && (
          <button
            className="btn btn-primary flex-1 text-xs"
            onClick={onGroup}
          >
            <FolderPlus size={14} className="mr-1" />
            Group
          </button>
        )}
        {canUngroup && (
          <button
            className="btn btn-ghost flex-1 text-xs"
            onClick={onUngroup}
          >
            <FolderMinus size={14} className="mr-1" />
            Ungroup
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">
          {selectionCount} layer{selectionCount > 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost text-xs flex-1"
            onClick={onDuplicateAll}
          >
            <Copy className="icon-sm mr-1" />
            Duplicate
          </button>
          <button
            className="btn btn-ghost text-xs flex-1 text-red-600 hover:bg-red-50"
            onClick={onDeleteAll}
          >
            <Trash2 className="icon-sm mr-1" />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

