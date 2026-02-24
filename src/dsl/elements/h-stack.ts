import type { HStackNode, StackProps, Node } from '@/core';
import { freezeOptions } from '../utils';
import {
  validateDimensions,
  validatePadding,
  validateSpacing,
  validateChildren,
} from '../validation';

/**
 * Options for hStack element
 */
export interface HStackOptions extends Omit<
  StackProps,
  keyof { id?: string; testId?: string }
> {
  readonly spacing?: number;
  readonly align?: StackProps['align'];
  readonly width?: number;
  readonly height?: number;
  readonly padding?: StackProps['padding'];
}

/**
 * Creates a horizontal stack node that arranges children horizontally
 */
export function hStack(
  options: HStackOptions | undefined,
  ...children: Node[]
): HStackNode {
  validateHStack(options, ...children);

  return Object.freeze({
    type: 'hStack',
    props: freezeOptions<HStackOptions | undefined>(options),
    children: Object.freeze([...children]),
  }) as HStackNode;
}

/**
 * Validates hStack options and children
 */
export function validateHStack(
  options: HStackOptions | undefined,
  ...children: Node[]
): void {
  const { spacing, width, height, padding } = options || {};

  validateSpacing(spacing, 'HStack');
  validateDimensions(width, height, 'HStack');
  validatePadding(padding, 'HStack');
  validateChildren(children, 'HStack');
}
