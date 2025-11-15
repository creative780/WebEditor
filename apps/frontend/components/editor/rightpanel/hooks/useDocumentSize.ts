import { useState, useCallback } from 'react';
import { useEditorStore } from '../../../../state/useEditorStore';
import { convertUnit } from '../../../../lib/units';

export function useDocumentSize() {
  const { document, setDocumentSize, setBleed, setDPI } = useEditorStore();
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [tempWidth, setTempWidth] = useState(document.width);
  const [tempHeight, setTempHeight] = useState(document.height);
  const [tempBleed, setTempBleed] = useState(document.bleed);
  const [tempDpi, setTempDpi] = useState(document.dpi);

  const handleSizeChange = useCallback(() => {
    setDocumentSize(tempWidth, tempHeight, document.unit);
    setBleed(tempBleed);
    setDPI(tempDpi);
    setIsEditingSize(false);
  }, [tempWidth, tempHeight, tempBleed, tempDpi, document.unit, setDocumentSize, setBleed, setDPI]);

  const handleCancelEdit = useCallback(() => {
    setTempWidth(document.width);
    setTempHeight(document.height);
    setTempBleed(document.bleed);
    setTempDpi(document.dpi);
    setIsEditingSize(false);
  }, [document]);

  const handleUnitChange = useCallback(
    (newUnit: 'px' | 'mm' | 'in' | 'cm' | 'ft') => {
      const dpi = document.dpi;
      let widthPx = tempWidth;
      let heightPx = tempHeight;
      let bleedPx = tempBleed;

      // Convert from current unit to pixels first
      switch (document.unit) {
        case 'px':
          widthPx = tempWidth;
          heightPx = tempHeight;
          bleedPx = tempBleed;
          break;
        case 'in':
          widthPx = tempWidth * dpi;
          heightPx = tempHeight * dpi;
          bleedPx = tempBleed * dpi;
          break;
        case 'cm':
          widthPx = tempWidth * (dpi / 2.54);
          heightPx = tempHeight * (dpi / 2.54);
          bleedPx = tempBleed * (dpi / 2.54);
          break;
        case 'mm':
          widthPx = tempWidth * (dpi / 25.4);
          heightPx = tempHeight * (dpi / 25.4);
          bleedPx = tempBleed * (dpi / 25.4);
          break;
        case 'ft':
          widthPx = tempWidth * (dpi * 12);
          heightPx = tempHeight * (dpi * 12);
          bleedPx = tempBleed * (dpi * 12);
          break;
      }

      // Convert from pixels to new unit
      let newWidth = widthPx;
      let newHeight = heightPx;
      let newBleed = bleedPx;

      switch (newUnit) {
        case 'px':
          newWidth = widthPx;
          newHeight = heightPx;
          newBleed = bleedPx;
          break;
        case 'in':
          newWidth = widthPx / dpi;
          newHeight = heightPx / dpi;
          newBleed = bleedPx / dpi;
          break;
        case 'cm':
          newWidth = widthPx / (dpi / 2.54);
          newHeight = heightPx / (dpi / 2.54);
          newBleed = bleedPx / (dpi / 2.54);
          break;
        case 'mm':
          newWidth = widthPx / (dpi / 25.4);
          newHeight = heightPx / (dpi / 25.4);
          newBleed = bleedPx / (dpi / 25.4);
          break;
        case 'ft':
          newWidth = widthPx / (dpi * 12);
          newHeight = heightPx / (dpi * 12);
          newBleed = bleedPx / (dpi * 12);
          break;
      }

      setTempWidth(newWidth);
      setTempHeight(newHeight);
      setTempBleed(newBleed);
    },
    [document, tempWidth, tempHeight, tempBleed]
  );

  return {
    isEditingSize,
    tempWidth,
    tempHeight,
    tempBleed,
    tempDpi,
    setTempWidth,
    setTempHeight,
    setTempBleed,
    setTempDpi,
    setIsEditingSize,
    handleSizeChange,
    handleCancelEdit,
    handleUnitChange,
  };
}

