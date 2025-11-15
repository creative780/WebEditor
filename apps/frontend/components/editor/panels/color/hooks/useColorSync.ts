import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore, useSelectedObjects } from '../../../../../state/useEditorStore';
import { colorManager } from '../../../../../lib/colorManagement';
import { RGBColor, CMYKColor } from '../../../../../lib/colorManagement';

interface UseColorSyncProps {
  rgbValues: RGBColor;
  cmykValues: CMYKColor;
  setRgbValues: (rgb: RGBColor) => void;
  setCmykValues: (cmyk: CMYKColor) => void;
  rgbToCmyk: (r: number, g: number, b: number) => CMYKColor;
  isManualEditingRef: React.MutableRefObject<boolean>;
  editingColorSpaceRef: React.MutableRefObject<'rgb' | 'cmyk' | null>;
  lastSyncedColorRef: React.MutableRefObject<string | null>;
  lastSelectionIdsRef: React.MutableRefObject<string>;
  rgbValuesRef: React.MutableRefObject<RGBColor>;
  cmykValuesRef: React.MutableRefObject<CMYKColor>;
}

export function useColorSync({
  rgbValues,
  cmykValues,
  setRgbValues,
  setCmykValues,
  rgbToCmyk,
  isManualEditingRef,
  editingColorSpaceRef,
  lastSyncedColorRef,
  lastSelectionIdsRef,
  rgbValuesRef,
  cmykValuesRef,
}: UseColorSyncProps) {
  const selectedObjects = useSelectedObjects();

  // Initialize refs from state on mount
  useEffect(() => {
    if (rgbValues && typeof rgbValues.r === 'number') {
      rgbValuesRef.current = rgbValues;
    }
    if (cmykValues && typeof cmykValues.c === 'number') {
      cmykValuesRef.current = cmykValues;
    }
  }, []); // Only run on mount

  // Sync refs with state (but skip during manual editing to prevent loops)
  useEffect(() => {
    if (!isManualEditingRef.current) {
      // Sync RGB ref when state changes
      if (rgbValues && typeof rgbValues.r === 'number') {
        rgbValuesRef.current = rgbValues;
      }
      // Sync CMYK ref when state changes, but ONLY if we're not editing CMYK
      // This prevents RGB→CMYK conversion from overwriting manual CMYK edits
      if (cmykValues && typeof cmykValues.c === 'number' && editingColorSpaceRef.current !== 'cmyk') {
        cmykValuesRef.current = cmykValues;
      }
    }
  }, [rgbValues, cmykValues, isManualEditingRef, editingColorSpaceRef]);

  // Sync color values from selected objects (only when selection changes, not when color changes)
  useEffect(() => {
    // Skip sync if we're manually editing
    if (isManualEditingRef.current) {
      return;
    }

    if (selectedObjects.length > 0) {
      const firstObj = selectedObjects[0];
      let color = '#000000';

      if (firstObj.type === 'text') {
        color = firstObj.color || firstObj.textFill || '#000000';
      } else if (firstObj.type === 'shape' || firstObj.type === 'path') {
        const fill = firstObj.fill;
        if (fill && fill.type === 'solid' && fill.color) {
          color = fill.color;
        }
      }

      // Check if selection IDs changed (new selection)
      const currentSelectionIds = selectedObjects
        .map((obj) => obj.id)
        .join(',');
      const selectionChanged =
        currentSelectionIds !== lastSelectionIdsRef.current;

      // Only sync if selection changed OR if color changed externally (different from what we last synced)
      // But skip if we just synced this color (prevent feedback loop)
      const shouldSync =
        selectionChanged ||
        (color !== lastSyncedColorRef.current && !selectionChanged);

      if (shouldSync) {
        // Convert hex to RGB
        const rgb = colorManager.hexToRgb(color);
        setRgbValues(rgb);

        // Convert RGB to CMYK, but ONLY if we're not currently editing CMYK
        // This prevents overwriting manual CMYK edits
        if (editingColorSpaceRef.current !== 'cmyk') {
          const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
          // rgbToCmyk already returns values in 0-100 range, no need to multiply
          const newCmyk = {
            c: Math.round(cmyk.c),
            m: Math.round(cmyk.m),
            y: Math.round(cmyk.y),
            k: Math.round(cmyk.k),
          };
          setCmykValues(newCmyk);
          cmykValuesRef.current = newCmyk;
        }

        // Update refs to keep them in sync
        rgbValuesRef.current = rgb;

        lastSyncedColorRef.current = color;
        lastSelectionIdsRef.current = currentSelectionIds;
      }
    } else {
      // Clear refs when no selection
      lastSyncedColorRef.current = null;
      lastSelectionIdsRef.current = '';
    }
  }, [selectedObjects, rgbToCmyk, isManualEditingRef, editingColorSpaceRef, lastSyncedColorRef, lastSelectionIdsRef, setRgbValues, setCmykValues, rgbValuesRef, cmykValuesRef]);
}

