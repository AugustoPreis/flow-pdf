import { z } from 'zod';
import type { Node } from '@/core';
import {
  optionalNonNegativeNumber,
  optionalPaddingSchema,
  commonSchemas,
} from './schemas';

/**
 * Validates width and height dimensions
 */
export function validateDimensions(
  width?: number,
  height?: number,
  context = 'Element',
): void {
  if (width !== undefined) {
    const result = optionalNonNegativeNumber.safeParse(width);

    if (!result.success) {
      throw new Error(`${context} width must be non-negative`);
    }
  }

  if (height !== undefined) {
    const result = optionalNonNegativeNumber.safeParse(height);

    if (!result.success) {
      throw new Error(`${context} height must be non-negative`);
    }
  }
}

/**
 * Validates padding (number or object)
 */
export function validatePadding(
  padding:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number }
    | undefined,
  context = 'Element',
): void {
  if (padding === undefined) return;

  const result = optionalPaddingSchema.safeParse(padding);
  if (!result.success) {
    const error = result.error.issues[0];
    const path = error?.path.join('.');
    const field = path ? ` ${path}` : '';

    throw new Error(`${context} padding${field} must be non-negative`);
  }
}

/**
 * Validates spacing
 */
export function validateSpacing(spacing?: number, context = 'Element'): void {
  if (spacing === undefined) return;

  const result = optionalNonNegativeNumber.safeParse(spacing);

  if (!result.success) {
    throw new Error(`${context} spacing must be non-negative`);
  }
}

/**
 * Validates children array
 */
export function validateChildren(children: Node[], context = 'Element'): void {
  if (!Array.isArray(children)) {
    throw new TypeError('Children must be provided as rest parameters');
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!child || typeof child !== 'object' || !('type' in child)) {
      throw new TypeError(`${context} child at index ${i} is not a valid node`);
    }
  }
}

/**
 * Validates a non-empty string
 */
export function validateNonEmptyString(value: string, fieldName: string): void {
  const result = commonSchemas.nonEmptyString.safeParse(value);

  if (!result.success) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates that a value is a string
 */
export function validateString(value: unknown, fieldName: string): void {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a string`);
  }
}

/**
 * Validates using a Zod schema and throws with a custom error message
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  errorMessage?: string,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    const error = errorMessage ?? result.error.issues[0]?.message;
    throw new Error(error);
  }

  return result.data;
}
