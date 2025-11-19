import { useMemo } from 'react';
import { useEditorStore } from '../../../../../state/useEditorStore';
import { TextObj } from '../../../../../state/useEditorStore';

export function useTextMetrics(textObj: TextObj | undefined) {
  const doc = useEditorStore((state) => state.document);

  const calculateTextHeight = useMemo(() => {
    if (!textObj) return () => 0.5;

    return (obj: TextObj): number => {
      // Create a temporary canvas to measure text
      const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      if (!canvas) return obj.height || 0.5;
      const ctx = canvas.getContext('2d');
      if (!ctx) return obj.height || 0.5;

      // Set font to match text object
      ctx.font = `${obj.fontStyle || 'normal'} ${obj.fontWeight || 400} ${obj.fontSize || 200}px ${obj.fontFamily || 'Inter'}`;

      const padding = obj.padding || { top: 0, right: 0, bottom: 0, left: 0 };
      const availableWidth = (obj.width || 2) - padding.left - padding.right;
      const lineHeight = obj.fontSize * (obj.lineHeight || 1.2);
      const letterSpacing = obj.letterSpacing || 0;

      // Split by newlines first
      const originalLines = obj.text?.split('\n') || [''];
      let totalLines = 0;

      // Wrap each line
      originalLines.forEach((line: string) => {
        if (!line) {
          totalLines++;
          return;
        }

        if (obj.wrapMode === 'area' || !obj.wrapMode || obj.wrapMode === undefined) {
          // Word wrap logic
          const words = line.split(' ');
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            let testWidth = 0;

            if (letterSpacing > 0) {
              for (let i = 0; i < testLine.length; i++) {
                testWidth += ctx.measureText(testLine[i]).width + letterSpacing;
              }
              testWidth -= letterSpacing;
            } else {
              testWidth = ctx.measureText(testLine).width;
            }

            if (testWidth <= availableWidth && currentLine) {
              currentLine = testLine;
            } else {
              if (currentLine) totalLines++;

              // Check if word itself is too long
              const wordWidth = letterSpacing > 0
                ? word.split('').reduce((sum, char) => sum + ctx.measureText(char).width + letterSpacing, 0) - letterSpacing
                : ctx.measureText(word).width;

              if (wordWidth > availableWidth) {
                // Break word character by character
                let charLine = '';
                for (const char of word) {
                  const testCharLine = charLine + char;
                  const charWidth = letterSpacing > 0
                    ? testCharLine.split('').reduce((sum, c) => sum + ctx.measureText(c).width + letterSpacing, 0) - letterSpacing
                    : ctx.measureText(testCharLine).width;
                  if (charWidth <= availableWidth) {
                    charLine = testCharLine;
                  } else {
                    if (charLine) totalLines++;
                    charLine = char;
                  }
                }
                currentLine = charLine;
              } else {
                currentLine = word;
              }
            }
          }
          if (currentLine) totalLines++;
        } else {
          // No wrapping - one line
          totalLines++;
        }
      });

      // Calculate total height: lines * lineHeight + padding
      const contentHeight = totalLines * lineHeight;
      const totalHeight = (contentHeight + padding.top + padding.bottom) / doc.dpi;

      // Minimum height
      return Math.max(0.3, totalHeight);
    };
  }, [textObj, doc]);

  return { calculateTextHeight };
}

