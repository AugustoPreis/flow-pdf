import { z } from 'zod';

/**
 * Schema for non-negative numbers
 */
export const nonNegativeNumber = z
  .number()
  .min(0, 'Value must be non-negative');

/**
 * Schema for positive numbers
 */
export const positiveNumber = z.number().positive('Value must be positive');

/**
 * Schema for optional non-negative number
 */
export const optionalNonNegativeNumber = nonNegativeNumber.optional();

/**
 * Schema for optional positive number
 */
export const optionalPositiveNumber = positiveNumber.optional();

/**
 * Schema for padding (can be number or object)
 */
export const paddingSchema = z.union([
  nonNegativeNumber,
  z.object({
    top: optionalNonNegativeNumber,
    right: optionalNonNegativeNumber,
    bottom: optionalNonNegativeNumber,
    left: optionalNonNegativeNumber,
  }),
]);

/**
 * Schema for optional padding
 */
export const optionalPaddingSchema = paddingSchema.optional();

/**
 * Schema for width and height
 */
export const dimensionsSchema = z.object({
  width: optionalNonNegativeNumber,
  height: optionalNonNegativeNumber,
});

/**
 * Schema for spacing
 */
export const spacingSchema = z.object({
  spacing: optionalNonNegativeNumber,
});

/**
 * Schema for border
 */
export const borderSchema = z
  .object({
    width: z.number().min(0, 'Border width must be non-negative').optional(),
    color: z.string().optional(),
    radius: z.number().min(0, 'Border radius must be non-negative').optional(),
  })
  .optional();

/**
 * Schema for validating that a value is a valid node
 */
export const nodeSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.unknown()).optional(),
});

/**
 * Schema for validating children array
 */
export const childrenSchema = z.array(nodeSchema);

/**
 * Common validation utilities
 */
export const commonSchemas = {
  nonEmptyString: z.string().min(1, 'Value cannot be empty'),
  color: z.string().optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
};
