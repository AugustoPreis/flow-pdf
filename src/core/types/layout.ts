import type { Node } from './node';

/**
 * 2D Point in space
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * 2D Dimensions
 */
export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * Padding values for a box
 */
export interface Padding {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/**
 * Layout box - represents the computed layout for a node
 * Contains position and dimensions after layout calculation
 */
export interface LayoutBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly padding?: Padding;
}

/**
 * Layout node - combines an AST node with its computed layout
 */
export interface LayoutNode {
  readonly node: Node;
  readonly box: LayoutBox;
  readonly children?: readonly LayoutNode[];
}

/**
 * Layout tree - the result of layout calculation
 */
export interface LayoutTree {
  readonly root: LayoutNode;
  readonly pageSize: Dimensions;
}

/**
 * Helper to create a point
 */
export function point(x: number, y: number): Point {
  return { x, y };
}

/**
 * Helper to create dimensions
 */
export function dimensions(width: number, height: number): Dimensions {
  return { width, height };
}

/**
 * Helper to create a layout box
 */
export function layoutBox(
  x: number,
  y: number,
  width: number,
  height: number,
  padding?: Padding,
): LayoutBox {
  return { x, y, width, height, padding };
}

/**
 * Helper to create padding from a single value or object
 */
export function createPadding(value: number | Partial<Padding>): Padding {
  if (typeof value === 'number') {
    return {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
  }

  return {
    top: value.top ?? 0,
    right: value.right ?? 0,
    bottom: value.bottom ?? 0,
    left: value.left ?? 0,
  };
}

/**
 * Calculate the content width (width minus horizontal padding)
 */
export function contentWidth(box: LayoutBox): number {
  if (!box.padding) return box.width;

  return Math.max(0, box.width - box.padding.left - box.padding.right);
}

/**
 * Calculate the content height (height minus vertical padding)
 */
export function contentHeight(box: LayoutBox): number {
  if (!box.padding) return box.height;

  return Math.max(0, box.height - box.padding.top - box.padding.bottom);
}

/**
 * Calculate the inner position (position plus padding)
 */
export function innerPosition(box: LayoutBox): Point {
  if (!box.padding) {
    return {
      x: box.x,
      y: box.y,
    };
  }

  return {
    x: box.x + box.padding.left,
    y: box.y + box.padding.top,
  };
}
