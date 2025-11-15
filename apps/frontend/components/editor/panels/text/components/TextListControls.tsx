'use client';

import { List, ListOrdered, Type, Square } from 'lucide-react';
import { TextObj } from '../../../../../state/useEditorStore';

interface TextListControlsProps {
  textObj: TextObj;
  onListTypeChange: (listType: 'none' | 'bullet' | 'number' | 'letter' | 'roman') => void;
  onListStyleChange: (listStyle: TextObj['listStyle']) => void;
}

export function TextListControls({
  textObj,
  onListTypeChange,
  onListStyleChange,
}: TextListControlsProps) {
  const handleListToggle = (listType: 'none' | 'bullet' | 'number' | 'letter' | 'roman') => {
    const newListType = textObj.listType === listType ? 'none' : listType;
    onListTypeChange(newListType);

    if (newListType !== 'none' && !textObj.listStyle) {
      onListStyleChange({
        bulletChar: '•',
        numberFormat: '1.',
        indentSize: 20,
      });
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Lists</div>
        <div className="flex gap-1">
          <button
            onClick={() => handleListToggle('bullet')}
            className={`btn btn-ghost flex-1 h-8 ${
              textObj.listType === 'bullet' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Bullet List"
          >
            <List className="icon-sm" />
          </button>
          <button
            onClick={() => handleListToggle('number')}
            className={`btn btn-ghost flex-1 h-8 ${
              textObj.listType === 'number' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="icon-sm" />
          </button>
          <button
            onClick={() => handleListToggle('letter')}
            className={`btn btn-ghost flex-1 h-8 ${
              textObj.listType === 'letter' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Letter List"
          >
            <Type className="icon-sm" />
          </button>
          <button
            onClick={() => handleListToggle('roman')}
            className={`btn btn-ghost flex-1 h-8 ${
              textObj.listType === 'roman' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Roman List"
          >
            <Square className="icon-sm" />
          </button>
        </div>
      </div>

      {/* List Style Options */}
      {textObj.listType && textObj.listType !== 'none' && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500 mb-2">List Style</div>

          {textObj.listType === 'bullet' && (
            <div className="mb-2">
              <label className="block text-xs text-gray-500 mb-1">Bullet Character</label>
              <input
                type="text"
                value={textObj.listStyle?.bulletChar || '•'}
                onChange={(e) =>
                  onListStyleChange({
                    ...textObj.listStyle,
                    bulletChar: e.target.value,
                  })
                }
                className="input w-full text-sm"
                maxLength={1}
              />
            </div>
          )}

          {(textObj.listType === 'number' ||
            textObj.listType === 'letter' ||
            textObj.listType === 'roman') && (
            <div className="mb-2">
              <label className="block text-xs text-gray-500 mb-1">Format</label>
              <select
                value={textObj.listStyle?.numberFormat || '1.'}
                onChange={(e) =>
                  onListStyleChange({
                    ...textObj.listStyle,
                    numberFormat: e.target.value,
                  })
                }
                className="input w-full text-sm"
              >
                <option value="1.">1.</option>
                <option value="1)">1)</option>
                <option value="(1)">(1)</option>
                <option value="a.">a.</option>
                <option value="a)">a)</option>
                <option value="i.">i.</option>
                <option value="i)">i)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Indent Size</label>
            <input
              type="range"
              min="10"
              max="50"
              value={textObj.listStyle?.indentSize || 20}
              onChange={(e) =>
                onListStyleChange({
                  ...textObj.listStyle,
                  indentSize: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {textObj.listStyle?.indentSize || 20}px
            </div>
          </div>
        </div>
      )}
    </>
  );
}

