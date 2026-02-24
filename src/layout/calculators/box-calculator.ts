import type { BoxNode, Constraints, LayoutBox } from '@/core';
import { constrainWidth, constrainHeight, createPadding } from '@/core';
import { getHorizontalPadding, getVerticalPadding } from '../models/box-model';
import type { LayoutCalculator, LayoutContext } from './base-calculator';

/**
 * Calculator for box nodes
 */
export class BoxCalculator implements LayoutCalculator {
  public calculate(
    node: BoxNode,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox {
    const {
      width: explicitWidth,
      height: explicitHeight,
      padding: paddingValue,
      border,
    } = node.props;

    const padding = paddingValue ? createPadding(paddingValue) : undefined;

    // Calculate border space
    const borderWidth = border?.width ?? 0;
    const totalBorderSpace = borderWidth * 2; // border on both sides

    // Calculate available space for children
    const horizontalPadding = getHorizontalPadding(padding);
    const verticalPadding = getVerticalPadding(padding);
    const totalHorizontalSpace = horizontalPadding + totalBorderSpace;
    const totalVerticalSpace = verticalPadding + totalBorderSpace;

    const childConstraints: Constraints = {
      minWidth: Math.max(0, constraints.minWidth - totalHorizontalSpace),
      maxWidth: Math.max(0, constraints.maxWidth - totalHorizontalSpace),
      minHeight: Math.max(0, constraints.minHeight - totalVerticalSpace),
      maxHeight: Math.max(0, constraints.maxHeight - totalVerticalSpace),
    };

    // Layout children
    let maxChildWidth = 0;
    let maxChildHeight = 0;

    for (const child of node.children) {
      const childBox = context.layoutChild(child, childConstraints);

      maxChildWidth = Math.max(maxChildWidth, childBox.width);
      maxChildHeight = Math.max(maxChildHeight, childBox.height);
    }

    // Calculate final dimensions
    // If explicit dimensions are provided, use them as the total box size
    // Otherwise, size to content + padding + border
    const width =
      typeof explicitWidth !== 'undefined'
        ? constrainWidth(explicitWidth, constraints)
        : constrainWidth(maxChildWidth + totalHorizontalSpace, constraints);
    const height =
      typeof explicitHeight !== 'undefined'
        ? constrainHeight(explicitHeight, constraints)
        : constrainHeight(maxChildHeight + totalVerticalSpace, constraints);

    return {
      x: 0,
      y: 0,
      width,
      height,
      padding,
    };
  }
}
