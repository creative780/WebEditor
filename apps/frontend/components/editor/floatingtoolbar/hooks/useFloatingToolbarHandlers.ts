import { useCallback } from 'react';
import { useEditorStore, useSelectedObjects } from '../../../../state/useEditorStore';

export function useFloatingToolbarHandlers() {
  const { applyStyle, zoom, setZoom } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  const handleFontSizeChange = useCallback(
    (newSize: number) => {
      const selectedText = selectedObjects.find((obj) => obj.type === 'text');
      if (selectedText) {
        applyStyle(selectedText.id, {
          fontSize: Math.max(8, Math.min(200, newSize)),
        });
      }
    },
    [selectedObjects, applyStyle]
  );

  const handleFontFamilyChange = useCallback(
    (family: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          applyStyle(obj.id, { fontFamily: family });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleTextAlign = useCallback(
    (align: 'left' | 'center' | 'right' | 'justify') => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          applyStyle(obj.id, { textAlign: align });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleTextStyle = useCallback(
    (style: 'bold' | 'italic' | 'underline') => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          const updates: any = {};

          switch (style) {
            case 'bold':
              updates.fontWeight = obj.fontWeight === 600 ? 400 : 600;
              break;
            case 'italic':
              updates.fontStyle =
                obj.fontStyle === 'italic' ? 'normal' : 'italic';
              break;
            case 'underline':
              updates.textDecoration =
                obj.textDecoration === 'underline' ? 'none' : 'underline';
              break;
          }

          applyStyle(obj.id, updates);
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleTextColorChange = useCallback(
    (color: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          applyStyle(obj.id, { textFill: color, color: color });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleTextEffect = useCallback(
    (effect: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          const updates: any = {};

          switch (effect) {
            case 'outline':
              updates.textStroke = obj.textStroke === 'none' ? '#000000' : 'none';
              updates.textStrokeWidth = obj.textStrokeWidth || 1;
              break;
            case 'shadow':
              updates.textShadow =
                obj.textShadow === 'none'
                  ? '2px 2px 4px rgba(0,0,0,0.3)'
                  : 'none';
              break;
            case 'glow':
              updates.textShadow =
                obj.textShadow === 'none' ? '0 0 10px rgba(0,0,0,0.5)' : 'none';
              break;
          }

          applyStyle(obj.id, updates);
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleTextTransformChange = useCallback(
    (transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'text') {
          applyStyle(obj.id, { textTransform: transform });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleBorderRadiusChange = useCallback(
    (radius: number) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            borderRadius: Math.max(0, Math.min(50, radius)),
          });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleFillColorChange = useCallback(
    (color: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            fill: {
              ...obj.fill,
              color: color,
            },
          });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleStrokeColorChange = useCallback(
    (color: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            stroke: {
              ...obj.stroke,
              color: color,
            },
          });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            stroke: {
              ...obj.stroke,
              width: Math.max(0, Math.min(20, width)),
            },
          });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.15, 4);
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.15, 0.25);
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  const handleColorChange = useCallback(
    (colorValue: string) => {
      if (selectedObjects.length > 0) {
        selectedObjects.forEach((obj) => {
          if (obj.type === 'text') {
            applyStyle(obj.id, { textFill: colorValue });
          } else if (obj.type === 'shape') {
            handleFillColorChange(colorValue);
          }
        });
      }
    },
    [selectedObjects, applyStyle, handleFillColorChange]
  );

  return {
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
  };
}

