import type { VStackNode, StackProps, Node } from '../../core/types';
import { freezeOptions } from '../utils';
import {
  validateDimensions,
  validatePadding,
  validateSpacing,
  validateChildren,
} from '../validation';

/**
 * Options for vStack element
 */
export interface VStackOptions extends Omit<
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
 * Creates a vertical stack node that arranges children vertically
 */
export function vStack(
  options: VStackOptions | undefined,
  ...children: Node[]
): VStackNode {
  validateVStack(options, ...children);

  return Object.freeze({
    type: 'vStack',
    props: freezeOptions<VStackOptions | undefined>(options),
    children: Object.freeze([...children]),
  }) as VStackNode;
}

/**
 * Validates vStack options and children
 */
export function validateVStack(
  options: VStackOptions | undefined,
  ...children: Node[]
): void {
  const { spacing, width, height, padding } = options || {};

  validateSpacing(spacing, 'VStack');
  validateDimensions(width, height, 'VStack');
  validatePadding(padding, 'VStack');
  validateChildren(children, 'VStack');
}
