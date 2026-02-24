import type { LayoutBox, Padding } from '@/core';

/**
 * Box edges (for borders, margins, etc.)
 */
export interface BoxEdges {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/**
 * Content box - the inner box after padding
 */
export interface ContentBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Helper to create box edges from a single value or object
 */
export function createBoxEdges(value: number | Partial<BoxEdges>): BoxEdges {
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
 * Calculate content box from layout box and padding
 */
export function getContentBox(box: LayoutBox): ContentBox {
  const padding = box.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  return {
    x: box.x + padding.left,
    y: box.y + padding.top,
    width: box.width - padding.left - padding.right,
    height: box.height - padding.top - padding.bottom,
  };
}

/**
 * Calculate total horizontal space used by padding
 */
export function getHorizontalPadding(padding?: Padding): number {
  if (!padding) return 0;
  return padding.left + padding.right;
}

/**
 * Calculate total vertical space used by padding
 */
export function getVerticalPadding(padding?: Padding): number {
  if (!padding) return 0;
  return padding.top + padding.bottom;
}

/**
 * Check if a point is inside a box
 */
export function containsPoint(box: LayoutBox, x: number, y: number): boolean {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

/**
 * Check if two boxes intersect
 */
export function intersects(a: LayoutBox, b: LayoutBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Calculate the bounding box that contains all boxes
 */
export function boundingBox(boxes: LayoutBox[]): LayoutBox | null {
  if (boxes.length === 0) return null;

  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
