import type { BoxNode, BoxProps, Node } from '@/core';
import { freezeOptions } from '../utils';
import {
  validateDimensions,
  validatePadding,
  validateChildren,
  validate,
  borderSchema,
} from '../validation';

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

  validateDimensions(width, height, 'Box');
  validatePadding(padding, 'Box');
  validate(borderSchema, border);
  validateChildren(children, 'Box');
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
