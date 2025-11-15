'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
} from 'react';
import { CheckCircle, Keyboard } from 'lucide-react';
import {
  useEditorStore,
  useSelectedObjects,
} from '../../../../state/useEditorStore';
import {
  colorManager,
  PantoneColor,
  RGBColor,
  CMYKColor,
} from '../../../../lib/colorManagement';
import { useSliderStyles } from './styles/sliderStyles';
import { ColorTabs } from './components/ColorTabs';
import { ColorPreview } from './components/ColorPreview';
import { ColorPicker } from './components/ColorPicker';
import { PantoneSelector } from './components/PantoneSelector';
import { RecentColors } from './components/RecentColors';
import { ProjectColors } from './components/ProjectColors';
import { TrendingColors } from './components/TrendingColors';
import { CMYKControls } from './components/CMYKControls';
import { RGBControls } from './components/RGBControls';
import { ColorValidation } from './components/ColorValidation';
import { useColorSync } from './hooks/useColorSync';
import { useColorValidation } from './hooks/useColorValidation';
import { useColorKeyboard } from './hooks/useColorKeyboard';

export function ColorPanel() {
  // Inject slider styles
  useSliderStyles();

  const {
    projectColors,
    addProjectColor,
    removeProjectColor,
    applyStyle,
    projectColorMode,
    needsColorModeConversion,
    setTargetColorMode,
  } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  const [activeTab, setActiveTab] = useState<'cmyk' | 'rgb' | 'pantone'>(
    projectColorMode
  );
  const [cmykValues, setCmykValues] = useState<CMYKColor>({
    c: 0,
    m: 0,
    y: 0,
    k: 0,
  });
  const [rgbValues, setRgbValues] = useState<RGBColor>({ r: 0, g: 0, b: 0 });
  const [newColor, setNewColor] = useState('#6F1414');
  const [pantoneSearch, setPantoneSearch] = useState('');
  const [selectedPantone, setSelectedPantone] = useState<PantoneColor | null>(
    null
  );
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Refs to track manual editing and prevent feedback loops
  const isManualEditingRef = useRef(false);
  const editingColorSpaceRef = useRef<'rgb' | 'cmyk' | null>(null); // Track which color space is being edited
  const lastSyncedColorRef = useRef<string | null>(null);
  const lastSelectionIdsRef = useRef<string>('');
  // Refs to store current values for synchronous access
  const cmykValuesRef = useRef<CMYKColor>({ c: 0, m: 0, y: 0, k: 0 });
  const rgbValuesRef = useRef<RGBColor>({ r: 0, g: 0, b: 0 });

  // Memoized calculations for better performance
  const currentHex = useMemo(() => {
    if (!rgbValues || typeof rgbValues.r !== 'number') {
      return '#000000';
    }
    return `#${rgbValues.r.toString(16).padStart(2, '0')}${rgbValues.g.toString(16).padStart(2, '0')}${rgbValues.b.toString(16).padStart(2, '0')}`;
  }, [rgbValues]);

  const tic = useMemo(() => {
    return Math.round(
      cmykValues.c + cmykValues.m + cmykValues.y + cmykValues.k
    );
  }, [cmykValues]);

  const luminance = useMemo(() => {
    return Math.round(
      (0.299 * rgbValues.r + 0.587 * rgbValues.g + 0.114 * rgbValues.b) / 2.55
    );
  }, [rgbValues]);

  const contrastRatio = useMemo(() => {
    return (rgbValues.r + rgbValues.g + rgbValues.b) / 3 > 128
      ? 'Dark on Light'
      : 'Light on Dark';
  }, [rgbValues]);

  // Live color analysis
  const colorAnalysis = useMemo(() => {
    const hsl = colorManager.rgbToHsl(rgbValues);
    const isWarm =
      (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360);
    const isCool = hsl.h >= 120 && hsl.h <= 240;
    const saturation = Math.round(hsl.s * 100);
    const lightness = Math.round(hsl.l * 100);

    return {
      hue: Math.round(hsl.h),
      saturation,
      lightness,
      isWarm,
      isCool,
      temperature: isWarm ? 'Warm' : isCool ? 'Cool' : 'Neutral',
      brightness: lightness > 70 ? 'Light' : lightness < 30 ? 'Dark' : 'Medium',
    };
  }, [rgbValues]);

  // Convert CMYK to RGB
  const cmykToRgb = useCallback((cmyk: CMYKColor) => {
    return colorManager.cmykToRgb(cmyk);
  }, []);

  // Convert RGB to CMYK
  const rgbToCmyk = useCallback((r: number, g: number, b: number) => {
    return colorManager.rgbToCmyk({ r, g, b });
  }, []);

  // Copy color to clipboard
  const copyColorToClipboard = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  }, []);

  const applyColorToSelection = useCallback(
    (color: string) => {
      startTransition(() => {
        selectedObjects.forEach((obj) => {
          if (obj.type === 'text') {
            applyStyle(obj.id, { color, textFill: color });
          } else if (obj.type === 'shape' || obj.type === 'path') {
            applyStyle(obj.id, {
              fill: {
                ...obj.fill,
                color,
              },
            });
          }
        });
      });
    },
    [selectedObjects, applyStyle]
  );

  const addToRecentColors = useCallback((color: string) => {
    setRecentColors((prev) => {
      const updated = [color, ...prev.filter((c) => c !== color)];
      return updated.slice(0, 8);
    });
  }, []);

  // Reset to default color
  const resetToDefault = useCallback(() => {
    const defaultColor = { r: 111, g: 20, b: 20 }; // #6F1414
    setRgbValues(defaultColor);
    const cmyk = rgbToCmyk(defaultColor.r, defaultColor.g, defaultColor.b);
    // rgbToCmyk already returns values in 0-100 range, no need to multiply
    const newCmyk = {
      c: Math.round(cmyk.c),
      m: Math.round(cmyk.m),
      y: Math.round(cmyk.y),
      k: Math.round(cmyk.k),
    };
    setCmykValues(newCmyk);

    // Update refs to keep them in sync
    rgbValuesRef.current = defaultColor;
    cmykValuesRef.current = newCmyk;

    setSelectedPantone(null);
    const defaultHex = colorManager.rgbToHex(defaultColor);

    // Defer state update to avoid updating during render
    setTimeout(() => {
      applyColorToSelection(defaultHex);
    }, 0);
  }, [rgbToCmyk, applyColorToSelection]);

  const handleCmykChange = useCallback(
    (channel: 'c' | 'm' | 'y' | 'k', value: number) => {
      isManualEditingRef.current = true;
      editingColorSpaceRef.current = 'cmyk'; // Mark that we're editing CMYK

      setCmykValues((currentCmyk) => {
        // Only update the specific channel - keep other channels independent
        const newCmyk = { ...currentCmyk, [channel]: value };
        cmykValuesRef.current = newCmyk;

        // Convert CMYK to RGB for display/application (CMYK values are in 0-100 range)
        const rgb = cmykToRgb(newCmyk);
        setRgbValues(rgb);
        rgbValuesRef.current = rgb;

        const hexColor = colorManager.rgbToHex(rgb);
        // Update lastSyncedColorRef immediately to prevent useColorSync from syncing back
        lastSyncedColorRef.current = hexColor;

        // Defer state update to avoid updating during render
        setTimeout(() => {
          applyColorToSelection(hexColor);
          if (selectedObjects.length > 0) {
            addToRecentColors(hexColor);
          }
        }, 0);

        setTimeout(() => {
          isManualEditingRef.current = false;
          editingColorSpaceRef.current = null;
        }, 300);

        return newCmyk;
      });
    },
    [
      cmykToRgb,
      selectedObjects.length,
      applyColorToSelection,
      addToRecentColors,
    ]
  );

  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b', value: number) => {
      // Don't update CMYK if we're currently editing CMYK (prevent interdependence)
      if (editingColorSpaceRef.current === 'cmyk') {
        return;
      }

      isManualEditingRef.current = true;
      editingColorSpaceRef.current = 'rgb'; // Mark that we're editing RGB

      const currentRgb = rgbValuesRef.current;
      // Only update the specific channel - keep other channels independent
      const newRgb = { ...currentRgb, [channel]: value };
      setRgbValues(newRgb);

      // Convert RGB to CMYK for display (rgbToCmyk returns values in 0-100 range)
      // Only do this if we're editing RGB, not CMYK
      const cmyk = rgbToCmyk(newRgb.r, newRgb.g, newRgb.b);
      const newCmyk = {
        c: Math.round(cmyk.c),
        m: Math.round(cmyk.m),
        y: Math.round(cmyk.y),
        k: Math.round(cmyk.k),
      };
      setCmykValues(newCmyk);

      rgbValuesRef.current = newRgb;
      cmykValuesRef.current = newCmyk;

      const hexColor = colorManager.rgbToHex(newRgb);
      // Update lastSyncedColorRef immediately to prevent useColorSync from syncing back
      lastSyncedColorRef.current = hexColor;

      // Defer state update to avoid updating during render
      setTimeout(() => {
        applyColorToSelection(hexColor);
        if (selectedObjects.length > 0) {
          addToRecentColors(hexColor);
        }
      }, 0);

      setTimeout(() => {
        isManualEditingRef.current = false;
        editingColorSpaceRef.current = null;
      }, 300);
    },
    [
      rgbToCmyk,
      selectedObjects.length,
      applyColorToSelection,
      addToRecentColors,
    ]
  );

  const handlePantoneSelect = useCallback(
    (pantone: PantoneColor) => {
      isManualEditingRef.current = true;

      setSelectedPantone(pantone);
      setRgbValues(pantone.rgb);
      const newCmyk = {
        c: pantone.cmyk.c,
        m: pantone.cmyk.m,
        y: pantone.cmyk.y,
        k: pantone.cmyk.k,
      };
      setCmykValues(newCmyk);

      rgbValuesRef.current = pantone.rgb;
      cmykValuesRef.current = newCmyk;

      lastSyncedColorRef.current = pantone.hex;

      // Defer state update to avoid updating during render
      setTimeout(() => {
        applyColorToSelection(pantone.hex);
        if (selectedObjects.length > 0) {
          addToRecentColors(pantone.hex);
        }
      }, 0);

      setTimeout(() => {
        isManualEditingRef.current = false;
      }, 300);
    },
    [selectedObjects.length, applyColorToSelection, addToRecentColors]
  );

  // Use color sync hook
  useColorSync({
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
  });

  // Use color validation hook
  const colorValidation = useColorValidation({
    rgbValues,
    isManualEditingRef,
  });

  // Use keyboard shortcuts hook
  useColorKeyboard({
    currentHex,
    onCopy: () => copyColorToClipboard(currentHex),
    onReset: resetToDefault,
    onToggleShortcuts: () => setShowKeyboardShortcuts(!showKeyboardShortcuts),
    showKeyboardShortcuts,
  });

  // Live canvas preview effect
  useEffect(() => {
    if (selectedObjects.length > 0) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.transform = 'translateZ(0)';
        setTimeout(() => {
          canvas.style.transform = '';
        }, 10);
      }
    }
  }, [currentHex, selectedObjects]);

  const handleProjectColorClick = useCallback(
    (color: string) => {
      isManualEditingRef.current = true;

      const rgb = colorManager.hexToRgb(color);
      setRgbValues(rgb);

      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      // rgbToCmyk already returns values in 0-100 range, no need to multiply
      const newCmyk = {
        c: Math.round(cmyk.c),
        m: Math.round(cmyk.m),
        y: Math.round(cmyk.y),
        k: Math.round(cmyk.k),
      };
      setCmykValues(newCmyk);

      rgbValuesRef.current = rgb;
      cmykValuesRef.current = newCmyk;

      lastSyncedColorRef.current = color;

      // Defer state update to avoid updating during render
      setTimeout(() => {
        applyColorToSelection(color);
        if (selectedObjects.length > 0) {
          addToRecentColors(color);
        }
      }, 0);

      setTimeout(() => {
        isManualEditingRef.current = false;
      }, 300);
    },
    [
      rgbToCmyk,
      applyColorToSelection,
      addToRecentColors,
      selectedObjects.length,
    ]
  );

  const handleColorPickerChange = useCallback(
    (hex: string) => {
      isManualEditingRef.current = true;

      const rgb = colorManager.hexToRgb(hex);
      setRgbValues(rgb);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      // rgbToCmyk already returns values in 0-100 range, no need to multiply
      const newCmyk = {
        c: Math.round(cmyk.c),
        m: Math.round(cmyk.m),
        y: Math.round(cmyk.y),
        k: Math.round(cmyk.k),
      };
      setCmykValues(newCmyk);

      rgbValuesRef.current = rgb;
      cmykValuesRef.current = newCmyk;

      lastSyncedColorRef.current = hex;

      // Defer state update to avoid updating during render
      setTimeout(() => {
        applyColorToSelection(hex);
        if (selectedObjects.length > 0) {
          addToRecentColors(hex);
        }
      }, 0);

      setTimeout(() => {
        isManualEditingRef.current = false;
      }, 300);
    },
    [
      rgbToCmyk,
      applyColorToSelection,
      addToRecentColors,
      selectedObjects.length,
    ]
  );

  // Get filtered Pantone colors
  const filteredPantoneColors = useMemo(() => {
    return pantoneSearch
      ? colorManager.searchPantoneColors(pantoneSearch)
      : colorManager.searchPantoneColors('').slice(0, 10);
  }, [pantoneSearch]);

  const trendingColors = useMemo(
    () => [
      { hex: '#6F1414', name: 'Signature Red' },
      { hex: '#FFD700', name: 'Gold' },
      { hex: '#4169E1', name: 'Royal Blue' },
      { hex: '#FF69B4', name: 'Hot Pink' },
      { hex: '#32CD32', name: 'Lime Green' },
      { hex: '#FF6347', name: 'Tomato' },
      { hex: '#9370DB', name: 'Medium Purple' },
      { hex: '#20B2AA', name: 'Light Sea' },
    ],
    []
  );

  // Handle tab change with color mode conversion check
  const handleTabChange = useCallback(
    (newTab: 'cmyk' | 'rgb' | 'pantone') => {
      if (newTab !== projectColorMode) {
        setTargetColorMode(newTab);
      } else {
        setActiveTab(newTab);
        setTargetColorMode(null);
      }
    },
    [projectColorMode, setTargetColorMode]
  );

  const handleAddProjectColor = useCallback(
    (hex: string) => {
      setNewColor(hex);
      if (!projectColors.includes(hex)) {
        addProjectColor(hex);
      }
    },
    [projectColors, addProjectColor]
  );

  return (
    <div className="h-full flex flex-col bg-white color-panel overflow-hidden relative">
      <ColorTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        projectColorMode={projectColorMode}
        onCopy={() => copyColorToClipboard(currentHex)}
        onReset={resetToDefault}
        onToggleShortcuts={() =>
          setShowKeyboardShortcuts(!showKeyboardShortcuts)
        }
      />

      <div
        className={`flex-1 overflow-hidden p-4 space-y-4 transition-all duration-300 color-panel min-h-0 relative ${
          needsColorModeConversion ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Keyboard Shortcuts Panel */}
        {showKeyboardShortcuts && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="w-4 h-4 text-blue-600" size={16} />
              <span className="text-xs font-semibold text-blue-800">
                Keyboard Shortcuts
              </span>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between">
                <span>Copy color:</span>
                <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                  Ctrl+C
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Reset to default:</span>
                <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                  Ctrl+R
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Toggle shortcuts:</span>
                <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                  Ctrl+H
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Copy feedback */}
        {copiedColor && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" size={16} />
              <span className="text-xs text-green-700">
                Copied {copiedColor} to clipboard
              </span>
            </div>
          </div>
        )}

        <ColorPreview
          currentHex={currentHex}
          rgbValues={rgbValues}
          cmykValues={cmykValues}
          activeTab={activeTab}
          selectedPantone={selectedPantone}
          showColorInfo={showColorInfo}
          onToggleColorInfo={() => setShowColorInfo(!showColorInfo)}
          colorAnalysis={colorAnalysis}
          luminance={luminance}
          contrastRatio={contrastRatio}
          selectedObjectsCount={selectedObjects.length}
        />

        <ColorPicker
          currentHex={currentHex}
          onColorChange={handleColorPickerChange}
        />

        {/* Color Mode Controls */}
        {activeTab === 'cmyk' && (
          <CMYKControls
            cmykValues={cmykValues}
            currentHex={currentHex}
            onCmykChange={handleCmykChange}
            tic={tic}
          />
        )}

        {activeTab === 'rgb' && (
          <RGBControls
            rgbValues={rgbValues}
            currentHex={currentHex}
            onRgbChange={handleRgbChange}
          />
        )}

        {activeTab === 'pantone' && (
          <PantoneSelector
            pantoneSearch={pantoneSearch}
            onSearchChange={setPantoneSearch}
            filteredPantoneColors={filteredPantoneColors}
            selectedPantone={selectedPantone}
            onSelectPantone={handlePantoneSelect}
          />
        )}

        <ColorValidation
          warnings={colorValidation.warnings}
          errors={colorValidation.errors}
        />

        <RecentColors
          recentColors={recentColors}
          onColorClick={handleProjectColorClick}
          onClear={() => setRecentColors([])}
        />

        <TrendingColors
          trendingColors={trendingColors}
          onColorClick={handleProjectColorClick}
        />

        <ProjectColors
          projectColors={projectColors}
          newColor={newColor}
          onColorClick={handleProjectColorClick}
          onAddColor={handleAddProjectColor}
          onRemoveColor={removeProjectColor}
        />
      </div>
    </div>
  );
}
