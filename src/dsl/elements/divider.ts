import type { DividerNode, DividerProps, DividerOrientation } from '@/core';
import { freezeOptions } from '../utils';
import { validate, positiveNumber } from '../validation';

/**
 * Options for divider element
 */
export interface DividerOptions extends Omit<
  DividerProps,
  keyof { id?: string; testId?: string }
> {
  readonly orientation?: DividerOrientation;
  readonly thickness?: number;
  readonly length?: number;
  readonly color?: string;
  readonly style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Creates a divider node (separator line)
 */
export function divider(options?: DividerOptions): DividerNode {
  validateDivider(options);

  return Object.freeze({
    type: 'divider',
    props: freezeOptions<DividerOptions | undefined>(options),
  }) as DividerNode;
}

/**
 * Validates divider options
 */
export function validateDivider(options?: DividerOptions): void {
  const { thickness, length } = options || {};

  if (thickness !== undefined) {
    validate(positiveNumber, thickness, 'Divider thickness must be positive');
  }

  if (length !== undefined) {
    validate(positiveNumber, length, 'Divider length must be positive');
  }
}

/**
 * Helper to create a horizontal divider
 */
export function horizontalDivider(
  options?: Omit<DividerOptions, 'orientation'>,
): DividerNode {
  return divider({ ...options, orientation: 'horizontal' });
}

/**
 * Helper to create a vertical divider
 */
export function verticalDivider(
  options?: Omit<DividerOptions, 'orientation'>,
): DividerNode {
  return divider({ ...options, orientation: 'vertical' });
}
