'use client';

interface ShapeControlsProps {
  selectedShape: any;
  borderRadius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  onBorderRadiusChange: (radius: number) => void;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export function ShapeControls({
  selectedShape,
  borderRadius,
  fillColor,
  strokeColor,
  strokeWidth,
  onBorderRadiusChange,
  onFillColorChange,
  onStrokeColorChange,
  onStrokeWidthChange,
}: ShapeControlsProps) {
  if (!selectedShape) return null;

  return (
    <div className="toolbar-group">
      {/* Corner Radius */}
      <div className="toolbar-control">
        <label className="toolbar-label">Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={borderRadius}
          onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
          className="toolbar-slider"
          title="Corner Radius"
        />
        <span className="toolbar-value">{borderRadius}px</span>
      </div>

      {/* Stroke Width */}
      <div className="toolbar-control">
        <label className="toolbar-label">Stroke</label>
        <input
          type="range"
          min="0"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          className="toolbar-slider"
          title="Stroke Width"
        />
        <span className="toolbar-value">{strokeWidth}px</span>
      </div>

      {/* Stroke Color */}
      <div className="toolbar-control">
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => onStrokeColorChange(e.target.value)}
          className="floating-color-input-small"
          title="Stroke Color"
        />
      </div>
    </div>
  );
}

