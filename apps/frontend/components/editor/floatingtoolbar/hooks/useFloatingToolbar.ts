import { useState, useEffect } from 'react';
import { useEditorStore, useSelectedObjects } from '../../../../state/useEditorStore';

export function useFloatingToolbar() {
  const {
    activeTool,
    undo,
    redo,
    history,
    applyStyle,
    zoom,
    setZoom,
    setActiveTool,
    centerArtboard,
  } = useEditorStore();

  const selectedObjects = useSelectedObjects();
  const [isVisible, setIsVisible] = useState(true);
  const [showTextPanel, setShowTextPanel] = useState(false);

  // Get selected objects by type
  const selectedText = selectedObjects.find(
    (obj) => obj.type === 'text'
  ) as any;
  const selectedShape = selectedObjects.find(
    (obj) => obj.type === 'shape'
  ) as any;

  // Text properties with defaults
  const fontSize = selectedText?.fontSize || 200;
  const fontFamily = selectedText?.fontFamily || 'Inter';
  const fontWeight = selectedText?.fontWeight || 400;
  const fontStyle = selectedText?.fontStyle || 'normal';
  const textDecoration = selectedText?.textDecoration || 'none';
  const textAlign = selectedText?.textAlign || 'left';
  const textTransform = selectedText?.textTransform || 'none';
  const textShadow = selectedText?.textShadow || 'none';
  const textStroke = selectedText?.textStroke || 'none';
  const textFill = selectedText?.textFill || '#000000';

  // Shape properties with defaults
  const borderRadius = selectedShape?.borderRadius || 0;
  const fillColor = selectedShape?.fill?.color || '#6F1414';
  const strokeColor = selectedShape?.stroke?.color || '#5A1010';
  const strokeWidth = selectedShape?.stroke?.width || 1;

  // Font families
  const fontFamilies = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
  ];

  // Always show toolbar
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return {
    isVisible,
    showTextPanel,
    setShowTextPanel,
    selectedObjects,
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
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    setZoom,
    setActiveTool,
    centerArtboard,
    applyStyle,
  };
}

