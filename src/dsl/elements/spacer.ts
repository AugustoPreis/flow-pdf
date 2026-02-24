import type { SpacerNode, SpacerProps } from '@/core';
import { freezeOptions } from '../utils';
import { validateDimensions, validate, nonNegativeNumber } from '../validation';

/**
 * Options for spacer element
 */
export interface SpacerOptions extends Omit<
  SpacerProps,
  keyof { id?: string; testId?: string }
> {
  readonly width?: number;
  readonly height?: number;
  readonly flex?: number;
}

/**
 * Creates a spacer node (empty space)
 */
export function spacer(options?: SpacerOptions): SpacerNode {
  validateSpacer(options);

  return Object.freeze({
    type: 'spacer',
    props: freezeOptions<SpacerOptions | undefined>(options),
  }) as SpacerNode;
}

/**
 * Validates spacer options
 */
export function validateSpacer(options?: SpacerOptions): void {
  const { width, height, flex } = options || {};

  validateDimensions(width, height, 'Spacer');

  if (flex !== undefined) {
    validate(nonNegativeNumber, flex, 'Spacer flex must be non-negative');
  }
}

/**
 * Helper to create a horizontal spacer
 */
export function hSpacer(width: number): SpacerNode {
  return spacer({ width });
}

/**
 * Helper to create a vertical spacer
 */
export function vSpacer(height: number): SpacerNode {
  return spacer({ height });
}

/**
 * Helper to create a flexible spacer that grows to fill space
 */
export function flexSpacer(flex = 1): SpacerNode {
  return spacer({ flex });
}
