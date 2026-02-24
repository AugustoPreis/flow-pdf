import type { TextNode, TextProps, TextStyle } from '@/core';
import {
  validateString,
  validateNonEmptyString,
  validateDimensions,
  validate,
  positiveNumber,
} from '../validation';

/**
 * Options for text element (excluding content)
 */
export interface TextOptions extends Omit<TextProps, 'content'> {
  readonly style?: TextStyle;
}

/**
 * Creates a text node
 */
export function text(content: string, options?: TextOptions): TextNode {
  validateText(content, options);

  return Object.freeze({
    type: 'text',
    props: Object.freeze({ content, ...options }),
  }) as TextNode;
}

/**
 * Validates text content and options
 */
export function validateText(content: string, options?: TextOptions): void {
  validateString(content, 'Text content');
  validateNonEmptyString(content, 'Text content');

  // Validate width and height if provided
  validateDimensions(options?.width, options?.height, 'Text');

  // Validate fontSize if provided
  if (options?.style?.fontSize !== undefined) {
    validate(positiveNumber, options.style.fontSize, 'Font size must be positive');
  }

  // Validate lineHeight if provided
  if (options?.style?.lineHeight !== undefined) {
    validate(positiveNumber, options.style.lineHeight, 'Line height must be positive');
  }
}

/**
 * Helper to create bold text
 */
export function bold(content: string, options?: TextOptions): TextNode {
  return text(content, {
    ...options,
    style: {
      ...options?.style,
      fontWeight: 'bold',
    },
  });
}

/**
 * Helper to create italic text
 */
export function italic(content: string, options?: TextOptions): TextNode {
  return text(content, {
    ...options,
    style: {
      ...options?.style,
      fontStyle: 'italic',
    },
  });
}

/**
 * Helper to create text with custom font size
 */
export function fontSize(
  size: number,
  content: string,
  options?: TextOptions,
): TextNode {
  return text(content, {
    ...options,
    style: {
      ...options?.style,
      fontSize: size,
    },
  });
}
