import type { Node, Constraints, LayoutBox } from '@/core';

/**
 * Layout calculator interface
 * Each node type should have a corresponding calculator
 */
export interface LayoutCalculator {
  /**
   * Calculate layout for a node within given constraints
   */
  calculate(
    node: Node,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox;
}

/**
 * Layout context - shared state during layout calculation
 */
export interface LayoutContext {
  /**
   * Font metrics for text measurement
   */
  readonly fontMetrics: FontMetrics;

  /**
   * Default font size
   */
  readonly defaultFontSize: number;

  /**
   * Calculate layout for a child node (recursive)
   */
  layoutChild(node: Node, constraints: Constraints): LayoutBox;
}

/**
 * Font metrics for text measurement
 */
export interface FontMetrics {
  /**
   * Measure text width
   */
  measureText(text: string, fontSize: number): number;

  /**
   * Get line height for a font size
   */
  getLineHeight(fontSize: number): number;

  /**
   * Break text into lines within a max width
   */
  breakLines(
    text: string,
    fontSize: number,
    maxWidth: number,
  ): readonly string[];
}

/**
 * Default font metrics implementation (simplified)
 * Uses approximate character widths
 */
export class DefaultFontMetrics implements FontMetrics {
  /**
   * Average character width as a ratio of font size
   * Assuming a monospace-like average
   */
  private readonly avgCharWidthRatio = 0.6;

  /**
   * Line height as a ratio of font size
   */
  private readonly lineHeightRatio = 1.2;

  public measureText(text: string, fontSize: number): number {
    // Simplified: assume average character width
    // In reality, this would use actual font metrics
    return text.length * fontSize * this.avgCharWidthRatio;
  }

  public getLineHeight(fontSize: number): number {
    return fontSize * this.lineHeightRatio;
  }

  public breakLines(
    text: string,
    fontSize: number,
    maxWidth: number,
  ): readonly string[] {
    if (maxWidth === Infinity) {
      return [text];
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];

    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = this.measureText(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        currentLine = word;

        // If a single word is too long, force it
        if (this.measureText(word, fontSize) > maxWidth) {
          lines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }
}
