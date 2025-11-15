export class TextService {
  private availableFonts: string[] = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Helvetica',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
  ];

  // List available fonts
  async listFonts(): Promise<string[]> {
    return this.availableFonts;
  }

  // Calculate text metrics
  async calculateTextMetrics(
    text: string,
    fontFamily: string,
    fontSize: number
  ): Promise<{ width: number; height: number }> {
    // Simplified calculation - in production, use canvas or opentype.js
    const avgCharWidth = fontSize * 0.6;
    const width = text.length * avgCharWidth;
    const height = fontSize * 1.2;

    return { width, height };
  }

  // Validate font
  validateFont(fontFamily: string): boolean {
    return this.availableFonts.includes(fontFamily);
  }

  // Format rich text
  formatRichText(text: string, format: { bold?: boolean; italic?: boolean; underline?: boolean }): string {
    let formatted = text;
    
    if (format.bold) {
      formatted = `<strong>${formatted}</strong>`;
    }
    
    if (format.italic) {
      formatted = `<em>${formatted}</em>`;
    }
    
    if (format.underline) {
      formatted = `<u>${formatted}</u>`;
    }

    return formatted;
  }

  // Calculate text on path
  calculateTextOnPath(
    text: string,
    pathData: string,
    offset: number = 0
  ): Array<{ char: string; x: number; y: number; rotation: number }> {
    // Simplified implementation
    // In production, use proper SVG path calculations
    const chars: Array<{ char: string; x: number; y: number; rotation: number }> = [];
    const spacing = 20;

    for (let i = 0; i < text.length; i++) {
      chars.push({
        char: text[i],
        x: offset + i * spacing,
        y: 0,
        rotation: 0,
      });
    }

    return chars;
  }
}

export default new TextService();

