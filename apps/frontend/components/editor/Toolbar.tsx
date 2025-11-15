'use client';

import { useState, useEffect } from 'react';
import { 
  Undo2, 
  Redo2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  List,
  ListOrdered,
  RotateCcw
} from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../state/useEditorStore';

export function Toolbar() {
  const {
    activeTool,
    unit,
    setUnit,
    undo,
    redo,
    history,
    applyStyle,
  } = useEditorStore();

  const selectedObjects = useSelectedObjects();
  const [isVisible, setIsVisible] = useState(false);

  // Get the first selected text object for styling
  const selectedText = selectedObjects.find(obj => obj.type === 'text') as any;
  
  // Use fontSize directly from selected text, fallback to 200
  const fontSize = selectedText?.fontSize || 200;

  // Show toolbar when objects are selected
  useEffect(() => {
    setIsVisible(selectedObjects.length > 0);
  }, [selectedObjects.length]);

  const handleFontSizeChange = (newSize: number) => {
    if (selectedText) {
      applyStyle(selectedText.id, { fontSize: newSize });
    }
  };

  const handleTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    selectedObjects.forEach(obj => {
      if (obj.type === 'text') {
        applyStyle(obj.id, { textAlign: align });
      }
    });
  };

  const handleTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    selectedObjects.forEach(obj => {
      if (obj.type === 'text') {
        const updates: any = {};
        
        switch (style) {
          case 'bold':
            updates.fontWeight = obj.fontWeight === 600 ? 400 : 600;
            break;
          case 'italic':
            updates.fontStyle = obj.fontStyle === 'italic' ? 'normal' : 'italic';
            break;
          case 'underline':
            updates.textDecoration = obj.textDecoration === 'underline' ? 'none' : 'underline';
            break;
        }
        
        applyStyle(obj.id, updates);
      }
    });
  };

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  if (!isVisible) return null;

  return (
    <div className="floating-toolbar">
      {/* Font Name Selector */}
      <div className="flex items-center">
        <select 
          className="font-selector"
          value={selectedText?.fontFamily || 'Inter'}
          onChange={(e) => {
            selectedObjects.forEach(obj => {
              if (obj.type === 'text') {
                applyStyle(obj.id, { fontFamily: e.target.value });
              }
            });
          }}
        >
          <option value="Inter">Font Name</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
        </select>
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center">
        <button
          className="toolbar-btn"
          onClick={() => handleFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 200}
        >
          +
        </button>
        <input
          type="number"
          className="font-size-input"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
          min="8"
          max="200"
        />
        <button
          className="toolbar-btn"
          onClick={() => handleFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 8}
        >
          −
        </button>
      </div>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Text Color */}
      <div className="flex items-center">
        <button className="toolbar-btn text-color-btn">
          <span className="text-color-icon">Aa</span>
          <div className="text-color-underline"></div>
        </button>
      </div>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Text Style Controls */}
      <div className="flex items-center gap-1">
        <button
          className={`toolbar-btn ${selectedText?.fontWeight === 600 ? 'active' : ''}`}
          onClick={() => handleTextStyle('bold')}
          disabled={!selectedText}
        >
          <Bold className="toolbar-icon" />
        </button>
        
        <button
          className={`toolbar-btn ${selectedText?.fontStyle === 'italic' ? 'active' : ''}`}
          onClick={() => handleTextStyle('italic')}
          disabled={!selectedText}
        >
          <Italic className="toolbar-icon" />
        </button>
        
        <button
          className={`toolbar-btn ${selectedText?.textDecoration === 'underline' ? 'active' : ''}`}
          onClick={() => handleTextStyle('underline')}
          disabled={!selectedText}
        >
          <Underline className="toolbar-icon" />
        </button>
      </div>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        <button
          className={`toolbar-btn ${selectedText?.textAlign === 'left' ? 'active' : ''}`}
          onClick={() => handleTextAlign('left')}
          disabled={!selectedText}
        >
          <AlignLeft className="toolbar-icon" />
        </button>
        
        <button
          className={`toolbar-btn ${selectedText?.textAlign === 'center' ? 'active' : ''}`}
          onClick={() => handleTextAlign('center')}
          disabled={!selectedText}
        >
          <AlignCenter className="toolbar-icon" />
        </button>
        
        <button
          className={`toolbar-btn ${selectedText?.textAlign === 'right' ? 'active' : ''}`}
          onClick={() => handleTextAlign('right')}
          disabled={!selectedText}
        >
          <AlignRight className="toolbar-icon" />
        </button>
        
        <button
          className={`toolbar-btn ${selectedText?.textAlign === 'justify' ? 'active' : ''}`}
          onClick={() => handleTextAlign('justify')}
          disabled={!selectedText}
        >
          <AlignJustify className="toolbar-icon" />
        </button>
      </div>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Line Spacing */}
      <div className="flex items-center">
        <button className="toolbar-btn">
          <div className="line-spacing-icon">
            <div className="line-spacing-lines">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
            <div className="line-spacing-arrow"></div>
          </div>
        </button>
      </div>

      {/* List Controls */}
      <div className="flex items-center gap-1">
        <button className="toolbar-btn">
          <List className="toolbar-icon" />
        </button>
        
        <button className="toolbar-btn">
          <ListOrdered className="toolbar-icon" />
        </button>
      </div>

      {/* Separator */}
      <div className="toolbar-separator"></div>

      {/* Clear Formatting */}
      <div className="flex items-center">
        <button className="toolbar-btn">
          <RotateCcw className="toolbar-icon" />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          className="toolbar-btn"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo2 className="toolbar-icon" />
        </button>
        
        <button
          className="toolbar-btn"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo2 className="toolbar-icon" />
        </button>
      </div>
    </div>
  );
}
