import type { BoxNode, BoxProps, Node } from '@/core';
import { freezeOptions } from '../utils';

/**
 * Options for box element
 */
export interface BoxOptions extends Omit<
  BoxProps,
  keyof { id?: string; testId?: string }
> {
  readonly width?: number;
  readonly height?: number;
  readonly padding?: BoxProps['padding'];
  readonly backgroundColor?: string;
  readonly border?: BoxProps['border'];
}

/**
 * Creates a box node (container with background and border)
 */
export function box(
  options: BoxOptions | undefined,
  ...children: Node[]
): BoxNode {
  validateBox(options, ...children);

  return Object.freeze({
    type: 'box',
    props: freezeOptions<BoxOptions | undefined>(options),
    children: Object.freeze([...children]),
  }) as BoxNode;
}

/**
 * Validates box options and children
 */
export function validateBox(
  options: BoxOptions | undefined,
  ...children: Node[]
): void {
  const { width, height, padding, border } = options || {};

  if (!Array.isArray(children)) {
    throw new TypeError('Children must be provided as rest parameters');
  }

  if (width !== undefined && width < 0) {
    throw new Error('Box width must be non-negative');
  }

  if (height !== undefined && height < 0) {
    throw new Error('Box height must be non-negative');
  }

  if (padding !== undefined) {
    if (typeof padding === 'number') {
      if (padding < 0) {
        throw new Error('Box padding must be non-negative');
      }
    } else {
      if (padding.top !== undefined && padding.top < 0) {
        throw new Error('Box padding top must be non-negative');
      }

      if (padding.right !== undefined && padding.right < 0) {
        throw new Error('Box padding right must be non-negative');
      }

      if (padding.bottom !== undefined && padding.bottom < 0) {
        throw new Error('Box padding bottom must be non-negative');
      }

      if (padding.left !== undefined && padding.left < 0) {
        throw new Error('Box padding left must be non-negative');
      }
    }
  }

  if (border) {
    if (border.width !== undefined && border.width < 0) {
      throw new Error('Border width must be non-negative');
    }

    if (border.radius !== undefined && border.radius < 0) {
      throw new Error('Border radius must be non-negative');
    }
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!child || typeof child !== 'object' || !('type' in child)) {
      throw new TypeError(`Child at index ${i} is not a valid node`);
    }
  }
}

/**
 * Helper to create a box with background color
 */
export function coloredBox(
  backgroundColor: string,
  options?: Omit<BoxOptions, 'backgroundColor'>,
  ...children: Node[]
): BoxNode {
  return box(
    {
      ...options,
      backgroundColor,
    },
    ...children,
  );
}

/**
 * Helper to create a box with border
 */
export function borderedBox(
  borderOptions: BoxProps['border'],
  options?: Omit<BoxOptions, 'border'>,
  ...children: Node[]
): BoxNode {
  return box(
    {
      ...options,
      border: borderOptions,
    },
    ...children,
  );
}

/**
 * Helper to create a padded container
 */
export function paddedBox(
  padding: number | BoxProps['padding'],
  ...children: Node[]
): BoxNode {
  return box({ padding }, ...children);
}
