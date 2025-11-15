'use client';

import { useFloatingToolbar } from './floatingtoolbar/hooks/useFloatingToolbar';
import { useFloatingToolbarHandlers } from './floatingtoolbar/hooks/useFloatingToolbarHandlers';
import { TextControls } from './floatingtoolbar/components/TextControls';
import { ShapeControls } from './floatingtoolbar/components/ShapeControls';
import { ZoomControls } from './floatingtoolbar/components/ZoomControls';
import { HistoryControls } from './floatingtoolbar/components/HistoryControls';
import { ColorPicker } from './floatingtoolbar/components/ColorPicker';
import { useSelectedObjects } from '../../state/useEditorStore';

export function FloatingToolbar() {
  const selectedObjects = useSelectedObjects();
  const {
    isVisible,
    showTextPanel,
    setShowTextPanel,
    selectedText,
    selectedShape,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textAlign,
    textTransform,
    textShadow,
    textStroke,
    textFill,
    borderRadius,
    fillColor,
    strokeColor,
    strokeWidth,
    fontFamilies,
    zoom,
    canUndo,
    canRedo,
    undo,
    redo,
    centerArtboard,
  } = useFloatingToolbar();

  const {
    handleFontSizeChange,
    handleFontFamilyChange,
    handleTextAlign,
    handleTextStyle,
    handleTextColorChange,
    handleTextEffect,
    handleTextTransformChange,
    handleBorderRadiusChange,
    handleFillColorChange,
    handleStrokeColorChange,
    handleStrokeWidthChange,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleColorChange,
  } = useFloatingToolbarHandlers();

  if (!isVisible) return null;

  // Determine default color for color picker
  const defaultColor = selectedShape
    ? fillColor
    : selectedText
      ? textFill
      : '#6F1414';

  return (
    <div className="floating-toolbar-modern" style={{ pointerEvents: 'auto' }}>
      {/* Text Controls */}
      <TextControls
        selectedText={selectedText}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        textDecoration={textDecoration}
        textAlign={textAlign}
        textTransform={textTransform}
        textShadow={textShadow}
        textStroke={textStroke}
        textFill={textFill}
        showTextPanel={showTextPanel}
        fontFamilies={fontFamilies}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onTextAlign={handleTextAlign}
        onTextStyle={handleTextStyle}
        onTextColorChange={handleTextColorChange}
        onTextEffect={handleTextEffect}
        onTextTransformChange={handleTextTransformChange}
        onToggleTextPanel={() => setShowTextPanel(!showTextPanel)}
      />

      {/* Color Picker - Always visible */}
      <ColorPicker
        color={defaultColor}
        onChange={handleColorChange}
        onInput={handleColorChange}
        title={selectedShape ? 'Fill Color' : 'Text Color'}
      />

      {/* Shape Controls */}
      <ShapeControls
        selectedShape={selectedShape}
        borderRadius={borderRadius}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        onBorderRadiusChange={handleBorderRadiusChange}
        onFillColorChange={handleFillColorChange}
        onStrokeColorChange={handleStrokeColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
      />

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onCenterArtboard={centerArtboard}
      />

      {/* History Controls */}
      <HistoryControls
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
  );
}
