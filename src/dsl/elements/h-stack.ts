import type { HStackNode, StackProps, Node } from '@/core';
import { freezeOptions } from '../utils';

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
  if (!Array.isArray(children)) {
    throw new TypeError('Children must be provided as rest parameters');
  }

  if (options) {
    if (options.spacing !== undefined && options.spacing < 0) {
      throw new Error('Spacing must be non-negative');
    }

    if (options.width !== undefined && options.width < 0) {
      throw new Error('Width must be non-negative');
    }

    if (options.height !== undefined && options.height < 0) {
      throw new Error('Height must be non-negative');
    }

    if (options.padding !== undefined) {
      if (typeof options.padding === 'number') {
        if (options.padding < 0) {
          throw new Error('Padding must be non-negative');
        }
      } else {
        if (options.padding.top !== undefined && options.padding.top < 0) {
          throw new Error('Padding top must be non-negative');
        }

        if (options.padding.right !== undefined && options.padding.right < 0) {
          throw new Error('Padding right must be non-negative');
        }

        if (
          options.padding.bottom !== undefined &&
          options.padding.bottom < 0
        ) {
          throw new Error('Padding bottom must be non-negative');
        }

        if (options.padding.left !== undefined && options.padding.left < 0) {
          throw new Error('Padding left must be non-negative');
        }
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
