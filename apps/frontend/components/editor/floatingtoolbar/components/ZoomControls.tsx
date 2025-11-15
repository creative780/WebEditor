'use client';

import { ZoomIn, ZoomOut, Square } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onCenterArtboard: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onCenterArtboard,
}: ZoomControlsProps) {
  return (
    <div className="toolbar-group">
      <button
        onClick={onZoomOut}
        className="toolbar-btn"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="toolbar-text">{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} className="toolbar-btn" title="Zoom In">
        <ZoomIn size={16} />
      </button>
      <button
        onClick={onCenterArtboard}
        className="toolbar-btn"
        title="Center Artboard"
      >
        <Square size={16} />
      </button>
    </div>
  );
}

