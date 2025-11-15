/**
 * Layout Suggestions Service
 * Auto-layout algorithms and golden ratio application
 */

export interface LayoutSuggestion {
  type: 'alignment' | 'spacing' | 'proportion' | 'balance' | 'hierarchy';
  title: string;
  description: string;
  before: any;
  after: any;
  confidence: number;
}

export class LayoutSuggestionsService {
  /**
   * Analyze layout and suggest improvements
   */
  analyzeLayout(objects: any[], canvas: { width: number; height: number }): LayoutSuggestion[] {
    const suggestions: LayoutSuggestion[] = [];

    // Check alignment
    const alignmentSuggestion = this.suggestAlignment(objects);
    if (alignmentSuggestion) suggestions.push(alignmentSuggestion);

    // Check spacing
    const spacingSuggestion = this.suggestSpacing(objects);
    if (spacingSuggestion) suggestions.push(spacingSuggestion);

    // Check golden ratio
    const proportionSuggestion = this.suggestGoldenRatio(objects, canvas);
    if (proportionSuggestion) suggestions.push(proportionSuggestion);

    // Check balance
    const balanceSuggestion = this.suggestBalance(objects, canvas);
    if (balanceSuggestion) suggestions.push(balanceSuggestion);

    return suggestions;
  }

  /**
   * Apply golden ratio to layout
   */
  applyGoldenRatio(objects: any[], canvas: { width: number; height: number }): any[] {
    const GOLDEN_RATIO = 1.618;
    const adjusted = [...objects];

    // Apply golden ratio to major elements
    adjusted.forEach(obj => {
      if (obj.width && obj.height) {
        const currentRatio = obj.width / obj.height;
        if (Math.abs(currentRatio - GOLDEN_RATIO) > 0.2) {
          // Adjust to golden ratio
          obj.width = obj.height * GOLDEN_RATIO;
        }
      }
    });

    // Position elements using golden ratio
    const goldenPointX = canvas.width / GOLDEN_RATIO;
    const goldenPointY = canvas.height / GOLDEN_RATIO;

    // Place key elements near golden points
    if (adjusted.length > 0) {
      const primary = adjusted[0];
      primary.x = goldenPointX - primary.width / 2;
      primary.y = goldenPointY - primary.height / 2;
    }

    return adjusted;
  }

  /**
   * Auto-align objects
   */
  autoAlign(objects: any[]): any[] {
    const aligned = [...objects];
    
    // Find common X positions
    const xPositions = aligned.map(obj => obj.x);
    const mostCommonX = this.getMostFrequent(xPositions);

    // Align objects close to common X
    aligned.forEach(obj => {
      if (Math.abs(obj.x - mostCommonX) < 10) {
        obj.x = mostCommonX;
      }
    });

    return aligned;
  }

  /**
   * Distribute spacing evenly
   */
  distributeSpacing(objects: any[], direction: 'horizontal' | 'vertical'): any[] {
    const distributed = [...objects].sort((a, b) => 
      direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    if (distributed.length < 3) return distributed;

    const first = distributed[0];
    const last = distributed[distributed.length - 1];
    
    const totalSpace = direction === 'horizontal'
      ? (last.x - first.x - first.width)
      : (last.y - first.y - first.height);
    
    const spacing = totalSpace / (distributed.length - 1);

    // Apply even spacing
    let currentPos = direction === 'horizontal' ? first.x + first.width : first.y + first.height;
    
    for (let i = 1; i < distributed.length - 1; i++) {
      if (direction === 'horizontal') {
        distributed[i].x = currentPos + spacing;
        currentPos = distributed[i].x + distributed[i].width;
      } else {
        distributed[i].y = currentPos + spacing;
        currentPos = distributed[i].y + distributed[i].height;
      }
    }

    return distributed;
  }

  // Private helper methods
  private suggestAlignment(objects: any[]): LayoutSuggestion | null {
    const tolerance = 5;
    let misaligned = 0;

    const xPositions = objects.map(obj => obj.x);
    const mostCommonX = this.getMostFrequent(xPositions);

    objects.forEach(obj => {
      if (Math.abs(obj.x - mostCommonX) > tolerance) {
        misaligned++;
      }
    });

    if (misaligned > objects.length * 0.3) {
      return {
        type: 'alignment',
        title: 'Improve Alignment',
        description: `${misaligned} objects could be better aligned`,
        before: { misalignedCount: misaligned },
        after: { alignedToGrid: true },
        confidence: 80
      };
    }

    return null;
  }

  private suggestSpacing(objects: any[]): LayoutSuggestion | null {
    if (objects.length < 2) return null;

    const distances: number[] = [];
    
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const dist = Math.sqrt(
          Math.pow(objects[i].x - objects[j].x, 2) + 
          Math.pow(objects[i].y - objects[j].y, 2)
        );
        distances.push(dist);
      }
    }

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;

    if (variance > avgDistance * 0.5) {
      return {
        type: 'spacing',
        title: 'Even Out Spacing',
        description: 'Objects have inconsistent spacing',
        before: { variance: variance.toFixed(2) },
        after: { evenSpacing: true },
        confidence: 75
      };
    }

    return null;
  }

  private suggestGoldenRatio(objects: any[], canvas: any): LayoutSuggestion | null {
    const GOLDEN_RATIO = 1.618;
    let needsAdjustment = false;

    objects.forEach(obj => {
      if (obj.width && obj.height) {
        const ratio = obj.width / obj.height;
        if (Math.abs(ratio - GOLDEN_RATIO) > 0.3) {
          needsAdjustment = true;
        }
      }
    });

    if (needsAdjustment) {
      return {
        type: 'proportion',
        title: 'Apply Golden Ratio',
        description: 'Adjust proportions using golden ratio for natural harmony',
        before: { usingGoldenRatio: false },
        after: { usingGoldenRatio: true },
        confidence: 70
      };
    }

    return null;
  }

  private suggestBalance(objects: any[], canvas: any): LayoutSuggestion | null {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let leftWeight = 0;
    let rightWeight = 0;

    objects.forEach(obj => {
      const weight = obj.width * obj.height;
      const objCenterX = obj.x + obj.width / 2;
      
      if (objCenterX < centerX) leftWeight += weight;
      else rightWeight += weight;
    });

    const balance = Math.min(leftWeight, rightWeight) / Math.max(leftWeight, rightWeight);

    if (balance < 0.6) {
      return {
        type: 'balance',
        title: 'Improve Visual Balance',
        description: 'Design is weighted to one side',
        before: { balance: balance.toFixed(2) },
        after: { balanced: true },
        confidence: 70
      };
    }

    return null;
  }

  private getMostFrequent(arr: number[]): number {
    const counts = new Map<number, number>();
    arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    
    let max = 0;
    let mostFrequent = arr[0];
    
    counts.forEach((count, val) => {
      if (count > max) {
        max = count;
        mostFrequent = val;
      }
    });
    
    return mostFrequent;
  }
}

export const layoutSuggestionsService = new LayoutSuggestionsService();

