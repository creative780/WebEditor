/**
 * Text utility functions for measurement and wrapping
 */

/**
 * Convert number to Roman numerals
 */
export function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [
    'M',
    'CM',
    'D',
    'CD',
    'C',
    'XC',
    'L',
    'XL',
    'X',
    'IX',
    'V',
    'IV',
    'I',
  ];
  let result = '';

  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }

  return result.toLowerCase();
}

/**
 * Wrap text within available width
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  letterSpacing: number
): string[] {
  const words = text.split(' ');
  const wrappedLines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    let testWidth = 0;

    // Calculate width with letter spacing
    if (letterSpacing > 0) {
      for (let i = 0; i < testLine.length; i++) {
        testWidth += ctx.measureText(testLine[i]).width + letterSpacing;
      }
      testWidth -= letterSpacing; // Remove last spacing
    } else {
      testWidth = ctx.measureText(testLine).width;
    }

    if (testWidth <= maxWidth && currentLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
      // Check if single word is too long - break it
      if (letterSpacing > 0) {
        let wordWidth = 0;
        for (let i = 0; i < word.length; i++) {
          wordWidth += ctx.measureText(word[i]).width + letterSpacing;
        }
        wordWidth -= letterSpacing;
        if (wordWidth > maxWidth) {
          // Word is too long, break it character by character
          let charLine = '';
          for (const char of word) {
            const testCharLine = charLine + char;
            let charLineWidth = 0;
            for (let i = 0; i < testCharLine.length; i++) {
              charLineWidth +=
                ctx.measureText(testCharLine[i]).width + letterSpacing;
            }
            charLineWidth -= letterSpacing;
            if (charLineWidth <= maxWidth) {
              charLine = testCharLine;
            } else {
              if (charLine) wrappedLines.push(charLine);
              charLine = char;
            }
          }
          currentLine = charLine;
        } else {
          currentLine = word;
        }
      } else {
        const wordWidth = ctx.measureText(word).width;
        if (wordWidth > maxWidth) {
          // Word is too long, break it character by character
          let charLine = '';
          for (const char of word) {
            const testCharLine = charLine + char;
            const charLineWidth = ctx.measureText(testCharLine).width;
            if (charLineWidth <= maxWidth) {
              charLine = testCharLine;
            } else {
              if (charLine) wrappedLines.push(charLine);
              charLine = char;
            }
          }
          currentLine = charLine;
        } else {
          currentLine = word;
        }
      }
    }
  }

  if (currentLine) {
    wrappedLines.push(currentLine);
  }

  return wrappedLines.length > 0 ? wrappedLines : [''];
}

