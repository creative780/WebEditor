import { useEffect, useState } from 'react';
import { colorManager } from '../../../../../lib/colorManagement';
import { RGBColor } from '../../../../../lib/colorManagement';

interface ColorValidationState {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

interface UseColorValidationProps {
  rgbValues: RGBColor;
  isManualEditingRef: React.MutableRefObject<boolean>;
}

export function useColorValidation({
  rgbValues,
  isManualEditingRef,
}: UseColorValidationProps) {
  const [colorValidation, setColorValidation] = useState<ColorValidationState>({
    isValid: true,
    warnings: [],
    errors: [],
  });

  // Update color validation when values change
  useEffect(() => {
    // Skip if manually editing to prevent loops
    if (isManualEditingRef.current) {
      return;
    }

    if (rgbValues && typeof rgbValues.r === 'number') {
      const validation = colorManager.validateColorForPrint(rgbValues, 'sRGB');
      setColorValidation(validation);
    }
  }, [rgbValues, isManualEditingRef]);

  return colorValidation;
}

