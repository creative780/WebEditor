'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';
import { GradientConfig } from '../panels/GradientEditor';
import { PanelTabs, PanelTab } from './components/PanelTabs';
import { PanelContent } from './components/PanelContent';
import { Inspector } from './components/Inspector';
import { PreviewPanel } from './components/PreviewPanel';
import { useDocumentSize } from './hooks/useDocumentSize';

export function RightPanel() {
  const {
    document,
    setCurrentPage,
    applyTransform,
    unit,
    applyStyle,
    projectColorMode,
    needsColorModeConversion,
  } = useEditorStore();
  const selectedObjects = useSelectedObjects();
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [isBrushCardOpen, setIsBrushCardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('preview');
  const brushCardRef = useRef<HTMLDivElement>(null);

  // Gradient state
  const [gradient, setGradient] = useState<GradientConfig>({
    type: 'linear',
    angle: 0,
    stops: [
      { id: 'stop-1', position: 0, color: '#FF0000' },
      { id: 'stop-2', position: 1, color: '#0000FF' },
    ],
  });

  const {
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
  } = useDocumentSize();

  // Handle gradient change
  const handleGradientChange = useCallback(
    (newGradient: GradientConfig) => {
      setGradient(newGradient);
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            fill: {
              type: 'gradient',
              gradient: newGradient,
            },
          });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  // Handle color select from harmony/palette
  const handleColorSelect = useCallback(
    (color: string) => {
      selectedObjects.forEach((obj) => {
        if (obj.type === 'shape') {
          applyStyle(obj.id, {
            fill: {
              type: 'solid',
              color,
            },
          });
        } else if (obj.type === 'text') {
          applyStyle(obj.id, { color, textFill: color });
        }
      });
    },
    [selectedObjects, applyStyle]
  );

  const handlePageClick = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleOrientationChange = useCallback(
    (orientation: 'landscape' | 'portrait') => {
      const currentWidth = document.width;
      const currentHeight = document.height;

      if (orientation === 'landscape') {
        if (currentWidth < currentHeight) {
          useEditorStore.getState().setDocumentSize(
            currentHeight,
            currentWidth,
            document.unit
          );
        }
      } else {
        if (currentWidth > currentHeight) {
          useEditorStore.getState().setDocumentSize(
            currentHeight,
            currentWidth,
            document.unit
          );
        }
      }
    },
    [document]
  );

  const handleObjectPositionChange = useCallback(
    (axis: 'x' | 'y', value: number) => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return;

      const newPosition = { ...selectedObject, [axis]: value };
      selectedObjects.forEach((obj) => {
        applyTransform(obj.id, {
          x: newPosition.x,
          y: newPosition.y,
        });
      });
    },
    [selectedObjects, applyTransform]
  );

  const handleObjectSizeChange = useCallback(
    (axis: 'width' | 'height', value: number) => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return;

      const newSize = { ...selectedObject, [axis]: value };
      selectedObjects.forEach((obj) => {
        applyTransform(obj.id, {
          width: newSize.width,
          height: newSize.height,
        });
      });
    },
    [selectedObjects, applyTransform]
  );

  const handleObjectRotationChange = useCallback(
    (value: number) => {
      selectedObjects.forEach((obj) => {
        applyTransform(obj.id, { rotation: value });
      });
    },
    [selectedObjects, applyTransform]
  );

  // Click outside to close brush card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brushCardRef.current &&
        !brushCardRef.current.contains(event.target as Node)
      ) {
        setIsBrushCardOpen(false);
      }
    };

    if (isBrushCardOpen) {
      window.document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBrushCardOpen]);

  return (
    <div className="editor-right-panel bg-white flex flex-col h-full">
      <Inspector
        unit={unit}
        onPositionChange={handleObjectPositionChange}
        onSizeChange={handleObjectSizeChange}
        onRotationChange={handleObjectRotationChange}
      />

      <PanelTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 min-h-0">
        {activeTab === 'preview' ? (
          <PreviewPanel
            document={document}
            currentSide={currentSide}
            onSideChange={setCurrentSide}
            onPageClick={handlePageClick}
            onOrientationChange={handleOrientationChange}
            isEditingSize={isEditingSize}
            tempWidth={tempWidth}
            tempHeight={tempHeight}
            tempBleed={tempBleed}
            tempDpi={tempDpi}
            onSizeChange={handleSizeChange}
            onCancelEdit={handleCancelEdit}
            onUnitChange={handleUnitChange}
            onWidthChange={setTempWidth}
            onHeightChange={setTempHeight}
            onBleedChange={setTempBleed}
            onDpiChange={setTempDpi}
            onStartEditingSize={() => setIsEditingSize(true)}
            isBrushCardOpen={isBrushCardOpen}
            onBrushClick={() => setIsBrushCardOpen(!isBrushCardOpen)}
            brushCardRef={brushCardRef}
            projectColorMode={projectColorMode}
            needsColorModeConversion={needsColorModeConversion}
          />
        ) : (
          <PanelContent
            activeTab={activeTab}
            gradient={gradient}
            onGradientChange={handleGradientChange}
            onColorSelect={handleColorSelect}
          />
        )}
      </div>
    </div>
  );
}

