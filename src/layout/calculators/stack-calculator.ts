import { constrainWidth, constrainHeight, createPadding } from '@/core';
import type { VStackNode, HStackNode, Constraints, LayoutBox } from '@/core';
import { getHorizontalPadding, getVerticalPadding } from '../models/box-model';
import type { LayoutCalculator, LayoutContext } from './base-calculator';

/**
 * Calculator for vertical stack nodes
 */
export class VStackCalculator implements LayoutCalculator {
  public calculate(
    node: VStackNode,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox {
    const {
      spacing = 0,
      width: explicitWidth,
      height: explicitHeight,
      padding: paddingValue,
    } = node.props;

    const padding = paddingValue ? createPadding(paddingValue) : undefined;

    // Calculate available space for children
    const horizontalPadding = getHorizontalPadding(padding);
    const verticalPadding = getVerticalPadding(padding);

    const childConstraints: Constraints = {
      minWidth: Math.max(0, constraints.minWidth - horizontalPadding),
      maxWidth: Math.max(0, constraints.maxWidth - horizontalPadding),
      minHeight: 0,
      maxHeight: Infinity, // Children can determine their own height
    };

    // Layout children
    let maxChildWidth = 0;
    let totalHeight = 0;
    const childBoxes: LayoutBox[] = [];

    for (const child of node.children) {
      const childBox = context.layoutChild(child, childConstraints);

      childBoxes.push(childBox);
      maxChildWidth = Math.max(maxChildWidth, childBox.width);
      totalHeight += childBox.height;

      // Add spacing between children (not after last child)
      if (childBoxes.length < node.children.length) {
        totalHeight += spacing;
      }
    }

    // Calculate final dimensions
    const contentWidth = explicitWidth ?? maxChildWidth;
    const contentHeight = explicitHeight ?? totalHeight;

    const width = constrainWidth(contentWidth + horizontalPadding, constraints);
    const height = constrainHeight(
      contentHeight + verticalPadding,
      constraints,
    );

    return {
      x: 0,
      y: 0,
      width,
      height,
      padding,
    };
  }
}

/**
 * Calculator for horizontal stack nodes
 */
export class HStackCalculator implements LayoutCalculator {
  public calculate(
    node: HStackNode,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox {
    const {
      spacing = 0,
      width: explicitWidth,
      height: explicitHeight,
      padding: paddingValue,
    } = node.props;
    const padding = paddingValue ? createPadding(paddingValue) : undefined;

    // Calculate available space for children
    const horizontalPadding = getHorizontalPadding(padding);
    const verticalPadding = getVerticalPadding(padding);

    // For horizontal stacks, we need to distribute width among children
    // Simplified: each child gets equal share of available width
    const availableWidth = Math.max(
      0,
      constraints.maxWidth - horizontalPadding,
    );
    const totalSpacing = Math.max(0, (node.children.length - 1) * spacing);
    const childMaxWidth =
      node.children.length > 0
        ? (availableWidth - totalSpacing) / node.children.length
        : availableWidth;

    const childConstraints: Constraints = {
      minWidth: 0,
      maxWidth: childMaxWidth,
      minHeight: Math.max(0, constraints.minHeight - verticalPadding),
      maxHeight: Math.max(0, constraints.maxHeight - verticalPadding),
    };

    // Layout children
    let totalWidth = 0;
    let maxChildHeight = 0;

    const childBoxes: LayoutBox[] = [];

    for (const child of node.children) {
      const childBox = context.layoutChild(child, childConstraints);

      childBoxes.push(childBox);
      totalWidth += childBox.width;
      maxChildHeight = Math.max(maxChildHeight, childBox.height);

      // Add spacing between children (not after last child)
      if (childBoxes.length < node.children.length) {
        totalWidth += spacing;
      }
    }

    // Calculate final dimensions
    const contentWidth = explicitWidth ?? totalWidth;
    const contentHeight = explicitHeight ?? maxChildHeight;

    const width = constrainWidth(contentWidth + horizontalPadding, constraints);
    const height = constrainHeight(
      contentHeight + verticalPadding,
      constraints,
    );

    return {
      x: 0,
      y: 0,
      width,
      height,
      padding,
    };
  }
}
