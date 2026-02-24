import type { VStackNode, StackProps, Node } from '../../core/types';
import { freezeOptions } from '../utils';

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

  if (!Array.isArray(children)) {
    throw new TypeError('Children must be provided as rest parameters');
  }

  if (spacing !== undefined && spacing < 0) {
    throw new Error('Spacing must be non-negative');
  }

  if (width !== undefined && width < 0) {
    throw new Error('Width must be non-negative');
  }

  if (height !== undefined && height < 0) {
    throw new Error('Height must be non-negative');
  }

  // Validate padding
  if (padding !== undefined) {
    if (typeof padding === 'number') {
      if (padding < 0) {
        throw new Error('Padding must be non-negative');
      }
    } else {
      if (padding.top !== undefined && padding.top < 0) {
        throw new Error('Padding top must be non-negative');
      }
      if (padding.right !== undefined && padding.right < 0) {
        throw new Error('Padding right must be non-negative');
      }
      if (padding.bottom !== undefined && padding.bottom < 0) {
        throw new Error('Padding bottom must be non-negative');
      }
      if (padding.left !== undefined && padding.left < 0) {
        throw new Error('Padding left must be non-negative');
      }
    }
  }

  // Validate children
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!child || typeof child !== 'object' || !('type' in child)) {
      throw new TypeError(`Child at index ${i} is not a valid node`);
    }
  }
}
