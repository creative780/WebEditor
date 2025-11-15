'use client';

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  ChevronDown,
  Minus,
  Plus,
  Square,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TextControlsProps {
  selectedText: any;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
  textDecoration: string;
  textAlign: string;
  textTransform: string;
  textShadow: string;
  textStroke: string;
  textFill: string;
  showTextPanel: boolean;
  fontFamilies: string[];
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onTextStyle: (style: 'bold' | 'italic' | 'underline') => void;
  onTextColorChange: (color: string) => void;
  onTextEffect: (effect: string) => void;
  onTextTransformChange: (transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => void;
  onToggleTextPanel: () => void;
}

export function TextControls({
  selectedText,
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
  showTextPanel,
  fontFamilies,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlign,
  onTextStyle,
  onTextColorChange,
  onTextEffect,
  onTextTransformChange,
  onToggleTextPanel,
}: TextControlsProps) {
  if (!selectedText) return null;

  return (
    <>
      {/* Font Family */}
      <div className="toolbar-dropdown">
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="toolbar-select"
          title="Font Family"
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Controls */}
      <div className="toolbar-group">
        <button
          onClick={() => onFontSizeChange(Math.max(fontSize - 1, 8))}
          className="toolbar-btn"
          title="Decrease Font Size"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={fontSize}
          onChange={(e) =>
            onFontSizeChange(parseInt(e.target.value) || 200)
          }
          className="toolbar-input"
          min="8"
          max="200"
          title="Font Size"
        />
        <button
          onClick={() => onFontSizeChange(Math.min(fontSize + 1, 200))}
          className="toolbar-btn"
          title="Increase Font Size"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Text Style Buttons */}
      <div className="toolbar-group">
        <button
          onClick={() => onTextStyle('bold')}
          className={`toolbar-btn ${fontWeight === 600 ? 'active' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => onTextStyle('italic')}
          className={`toolbar-btn ${fontStyle === 'italic' ? 'active' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => onTextStyle('underline')}
          className={`toolbar-btn ${textDecoration === 'underline' ? 'active' : ''}`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="toolbar-group">
        <button
          onClick={() => onTextAlign('left')}
          className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => onTextAlign('center')}
          className={`toolbar-btn ${textAlign === 'center' ? 'active' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => onTextAlign('right')}
          className={`toolbar-btn ${textAlign === 'right' ? 'active' : ''}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={() => onTextAlign('justify')}
          className={`toolbar-btn ${textAlign === 'justify' ? 'active' : ''}`}
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      {/* Text Color */}
      <div className="floating-color-picker">
        <input
          type="color"
          value={textFill}
          onChange={(e) => onTextColorChange(e.target.value)}
          className="floating-color-input"
          title="Text Color"
        />
      </div>

      {/* Advanced Text Panel Toggle */}
      <div className="toolbar-group">
        <button
          onClick={onToggleTextPanel}
          className={`toolbar-btn ${showTextPanel ? 'active' : ''}`}
          title="Advanced Text Options"
        >
          <Type size={16} />
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Advanced Text Panel */}
      {showTextPanel && (
        <div className="advanced-text-panel">
          {/* Text Transform */}
          <div className="toolbar-control">
            <label>Transform</label>
            <select
              value={textTransform}
              onChange={(e) =>
                onTextTransformChange(
                  e.target.value as
                    | 'none'
                    | 'uppercase'
                    | 'lowercase'
                    | 'capitalize'
                )
              }
              className="toolbar-select"
            >
              <option value="none">Normal</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>

          {/* Text Effects */}
          <div className="toolbar-group">
            <button
              onClick={() => onTextEffect('outline')}
              className={`toolbar-btn ${textStroke !== 'none' ? 'active' : ''}`}
              title="Outline"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => onTextEffect('shadow')}
              className={`toolbar-btn ${textShadow !== 'none' ? 'active' : ''}`}
              title="Shadow"
            >
              <Sparkles size={16} />
            </button>
            <button
              onClick={() => onTextEffect('glow')}
              className="toolbar-btn"
              title="Glow"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

