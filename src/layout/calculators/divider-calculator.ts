import { constrainWidth, constrainHeight } from '@/core';
import type { DividerNode, Constraints, LayoutBox } from '@/core';
import type { LayoutCalculator } from './base-calculator';

/**
 * Calculator for divider nodes
 */
export class DividerCalculator implements LayoutCalculator {
  public calculate(node: DividerNode, constraints: Constraints): LayoutBox {
    const { orientation = 'horizontal', thickness = 1, length } = node.props;

    let width: number;
    let height: number;

    if (orientation === 'horizontal') {
      // Horizontal divider: full width (or specified length), thin height
      width = length ?? constraints.maxWidth;
      height = thickness;
    } else {
      // Vertical divider: thin width, full height (or specified length)
      width = thickness;
      height = length ?? constraints.maxHeight;
    }

    return {
      x: 0,
      y: 0,
      width: constrainWidth(width, constraints),
      height: constrainHeight(height, constraints),
    };
  }
}
