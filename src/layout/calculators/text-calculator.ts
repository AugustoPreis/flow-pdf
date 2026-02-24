/**
 * Text Calculator - Layout calculation for text nodes
 */

import { constrainWidth, constrainHeight } from '@/core';
import type { TextNode, Constraints, LayoutBox } from '@/core';
import type { LayoutCalculator, LayoutContext } from './base-calculator';

/**
 * Calculator for text nodes
 */
export class TextCalculator implements LayoutCalculator {
  public calculate(
    node: TextNode,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox {
    const {
      content,
      style,
      width: explicitWidth,
      height: explicitHeight,
    } = node.props;
    const fontSize = style?.fontSize ?? context.defaultFontSize;

    // If explicit dimensions are provided, use them
    if (explicitWidth !== undefined && explicitHeight !== undefined) {
      return {
        x: 0,
        y: 0,
        width: constrainWidth(explicitWidth, constraints),
        height: constrainHeight(explicitHeight, constraints),
      };
    }

    // Break text into lines based on constraints
    const maxWidth = explicitWidth ?? constraints.maxWidth;
    const lines = context.fontMetrics.breakLines(content, fontSize, maxWidth);

    // Calculate dimensions
    const lineHeight = context.fontMetrics.getLineHeight(fontSize);
    const width =
      explicitWidth ?? this.calculateTextWidth(lines, fontSize, context);
    const height = explicitHeight ?? lines.length * lineHeight;

    return {
      x: 0,
      y: 0,
      width: constrainWidth(width, constraints),
      height: constrainHeight(height, constraints),
    };
  }

  /**
   * Calculate the maximum text width from lines
   */
  private calculateTextWidth(
    lines: readonly string[],
    fontSize: number,
    context: LayoutContext,
  ): number {
    if (lines.length === 0) return 0;

    return Math.max(
      ...lines.map((line) => context.fontMetrics.measureText(line, fontSize)),
    );
  }
}
