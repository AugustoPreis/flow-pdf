/**
 * Text styling options
 */
export interface TextStyle {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  lineHeight?: number;
}

/**
 * Rectangle styling options
 */
export interface RectStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

/**
 * Line styling options
 */
export interface LineStyle {
  color?: string;
  width?: number;
  dashPattern?: number[];
}

/**
 * Page options
 */
export interface PageOptions {
  width?: number;
  height?: number;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Render backend interface
 *
 * All methods should be chainable (return this) for fluent API
 */
export interface RenderBackend {
  /**
   * Create a new page
   */
  createPage(options?: PageOptions): this;

  /**
   * Draw text at a specific position
   */
  drawText(text: string, x: number, y: number, style?: TextStyle): this;

  /**
   * Draw a rectangle
   */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    style?: RectStyle,
  ): this;

  /**
   * Draw a line
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style?: LineStyle,
  ): this;

  /**
   * Finalize the document and return the output
   * The output format depends on the backend implementation
   */
  finalize(): Promise<Buffer> | Buffer;
}
