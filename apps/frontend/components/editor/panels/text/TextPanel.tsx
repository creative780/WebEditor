'use client';

import { useEffect } from 'react';
import { Type } from 'lucide-react';
import { useEditorStore, useSelectedObjects, TextObj } from '../../../../state/useEditorStore';
import { useTextMetrics } from './hooks/useTextMetrics';
import { TextContentEditor } from './components/TextContentEditor';
import { TextColorPicker } from './components/TextColorPicker';
import { FontSelector } from './components/FontSelector';
import { TextFormatting } from './components/TextFormatting';
import { TextAlignment } from './components/TextAlignment';
import { TextListControls } from './components/TextListControls';
import { TextPathControls } from './components/TextPathControls';

export function TextPanel() {
  const { applyStyle, addObject, document, applyTransform } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  // Get the first selected text object
  const selectedText = selectedObjects.find(
    (obj) => obj.type === 'text'
  ) as TextObj | undefined;

  const { calculateTextHeight } = useTextMetrics(selectedText);

  // Auto-adjust height when text properties change
  useEffect(() => {
    if (!selectedText || selectedText.type !== 'text') return;

    const timeoutId = setTimeout(() => {
      const freshObjects = useEditorStore.getState().objects;
      const freshTextObj = freshObjects.find(
        (obj) => obj.id === selectedText.id && obj.type === 'text'
      ) as TextObj | undefined;
      if (!freshTextObj) return;

      const requiredHeight = calculateTextHeight(freshTextObj);
      const currentHeight = freshTextObj.height || 0.5;
      const heightDiff = Math.abs(requiredHeight - currentHeight);

      if (heightDiff > 0.01) {
        applyTransform(freshTextObj.id, {
          height: requiredHeight,
        });
      }
    }, 16);

    return () => clearTimeout(timeoutId);
  }, [
    selectedText?.text,
    selectedText?.fontSize,
    selectedText?.lineHeight,
    selectedText?.width,
    selectedText?.fontFamily,
    selectedText?.wrapMode,
    selectedText?.padding,
    selectedText?.letterSpacing,
    selectedText?.id,
    calculateTextHeight,
    applyTransform,
  ]);

  // Create new text object
  const handleCreateText = () => {
    const newText: TextObj = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      x: document.width / 2 - 1,
      y: document.height / 2 - 0.25,
      width: 2,
      height: 0.5,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: 'Text',
      zIndex: Date.now(),
      fontFamily: 'Inter',
      fontSize: 200,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      letterSpacing: 0,
      color: '#1a1a1a',
      textFill: '#1a1a1a',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      textDecoration: 'none',
      textTransform: 'none',
      hyphenate: false,
      wrapMode: 'area',
    };

    addObject(newText);
    setTimeout(() => {
      useEditorStore.getState().selectObject(newText.id);
    }, 10);
  };

  if (!selectedText) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h3 className="font-semibold text-sm">TEXT EDITOR</h3>
        </div>
        <div className="panel-content">
          <div className="text-xs text-gray-400 text-center py-4 mb-4">
            Select a text object to edit, or create a new one
          </div>
          <button
            onClick={handleCreateText}
            className="btn btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
          >
            <Type className="w-4 h-4" />
            Create Text Object
          </button>
        </div>
      </div>
    );
  }

  const handleTextChange = (property: string, value: any) => {
    applyStyle(selectedText.id, { [property]: value });
  };

  const handleColorChange = (color: string) => {
    handleTextChange('textFill', color);
    handleTextChange('color', color);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="font-semibold text-sm">TEXT EDITOR</h3>
      </div>

      <div className="panel-content">
        <TextContentEditor
          value={selectedText.text || ''}
          onChange={(text) => handleTextChange('text', text)}
        />

        <TextColorPicker
          value={selectedText.textFill || selectedText.color || '#000000'}
          onChange={handleColorChange}
        />

        <FontSelector
          value={selectedText.fontFamily || 'Inter'}
          onChange={(fontFamily) => handleTextChange('fontFamily', fontFamily)}
        />

        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Font Size</label>
          <input
            type="range"
            min="12"
            max="300"
            value={selectedText.fontSize || 200}
            onChange={(e) => handleTextChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-center mt-1">
            {selectedText.fontSize || 200}px
          </div>
        </div>

        <TextFormatting
          fontWeight={selectedText.fontWeight || 400}
          fontStyle={selectedText.fontStyle || 'normal'}
          textDecoration={selectedText.textDecoration || 'none'}
          onFontWeightChange={(weight) => handleTextChange('fontWeight', weight)}
          onFontStyleChange={(style) => handleTextChange('fontStyle', style)}
          onTextDecorationChange={(decoration) =>
            handleTextChange('textDecoration', decoration)
          }
        />

        <TextAlignment
          textAlign={selectedText.textAlign || 'center'}
          verticalAlign={selectedText.verticalAlign || 'middle'}
          onTextAlignChange={(align) => handleTextChange('textAlign', align)}
          onVerticalAlignChange={(align) => handleTextChange('verticalAlign', align)}
        />

        <TextListControls
          textObj={selectedText}
          onListTypeChange={(listType) => handleTextChange('listType', listType)}
          onListStyleChange={(listStyle) => handleTextChange('listStyle', listStyle)}
        />

        <TextPathControls
          textObj={selectedText}
          onWrapModeChange={(wrapMode) => {
            handleTextChange('wrapMode', wrapMode);
            if (wrapMode === 'path' && !selectedText.pathData) {
              const centerX = selectedText.width / 2;
              const centerY = selectedText.height / 2;
              const pathData = `M 0,${centerY} Q ${centerX},0 ${selectedText.width},${centerY}`;
              handleTextChange('pathData', pathData);
              handleTextChange('pathOffset', 0);
              handleTextChange('pathReverse', false);
            }
          }}
          onPathOffsetChange={(offset) => handleTextChange('pathOffset', offset)}
          onPathReverseChange={(reverse) => handleTextChange('pathReverse', reverse)}
        />

        {/* Line Height */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Line Height</label>
          <input
            type="range"
            min="0.8"
            max="3"
            step="0.1"
            value={selectedText.lineHeight || 1.2}
            onChange={(e) => handleTextChange('lineHeight', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-center mt-1">
            {selectedText.lineHeight || 1.2}
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Letter Spacing</label>
          <input
            type="range"
            min="-2"
            max="10"
            step="0.5"
            value={selectedText.letterSpacing || 0}
            onChange={(e) => handleTextChange('letterSpacing', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-center mt-1">
            {selectedText.letterSpacing || 0}px
          </div>
        </div>

        {/* Text Transform */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Text Transform</label>
          <select
            value={selectedText.textTransform || 'none'}
            onChange={(e) => handleTextChange('textTransform', e.target.value)}
            className="input w-full text-sm"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>

        {/* Text Shadow */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Text Shadow</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="textShadowToggle"
              checked={
                selectedText.textShadow && selectedText.textShadow !== 'none'
              }
              onChange={(e) =>
                handleTextChange(
                  'textShadow',
                  e.target.checked ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
                )
              }
              className="rounded"
            />
            <label htmlFor="textShadowToggle" className="text-xs text-gray-500">
              Enable Shadow
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

