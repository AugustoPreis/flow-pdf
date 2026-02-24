import type { TextNode, TextProps, TextStyle } from '@/core';

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
  if (typeof content !== 'string') {
    throw new TypeError('Text content must be a string');
  }

  if (content.length === 0) {
    throw new Error('Text content cannot be empty');
  }

  // Validate width and height if provided
  if (options?.width !== undefined && options.width < 0) {
    throw new Error('Text width must be non-negative');
  }

  if (options?.height !== undefined && options.height < 0) {
    throw new Error('Text height must be non-negative');
  }

  // Validate fontSize if provided
  if (options?.style?.fontSize !== undefined && options.style.fontSize <= 0) {
    throw new Error('Font size must be positive');
  }

  // Validate lineHeight if provided
  if (
    options?.style?.lineHeight !== undefined &&
    options.style.lineHeight <= 0
  ) {
    throw new Error('Line height must be positive');
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
