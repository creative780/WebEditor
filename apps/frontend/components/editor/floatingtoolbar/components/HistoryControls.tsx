'use client';

import { Undo2, Redo2 } from 'lucide-react';

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: HistoryControlsProps) {
  return (
    <div className="toolbar-group">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="toolbar-btn"
        title="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="toolbar-btn"
        title="Redo"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}

