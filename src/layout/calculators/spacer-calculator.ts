import { constrainWidth, constrainHeight } from '@/core';
import type { SpacerNode, Constraints, LayoutBox } from '@/core';
import type { LayoutCalculator } from './base-calculator';

/**
 * Calculator for spacer nodes
 */
export class SpacerCalculator implements LayoutCalculator {
  public calculate(node: SpacerNode, constraints: Constraints): LayoutBox {
    const { width: explicitWidth, height: explicitHeight, flex } = node.props;

    let width: number;
    let height: number;

    if (flex !== undefined && flex > 0) {
      // Flexible spacer: grows to fill available space
      // In a real flex implementation, this would consider flex values of siblings
      // For now, we'll use available space
      width = explicitWidth ?? constraints.maxWidth;
      height = explicitHeight ?? constraints.maxHeight;
    } else {
      // Fixed spacer: uses explicit dimensions or 0
      width = explicitWidth ?? 0;
      height = explicitHeight ?? 0;
    }

    return {
      x: 0,
      y: 0,
      width: constrainWidth(width, constraints),
      height: constrainHeight(height, constraints),
    };
  }
}
