/**
 * Base error class for Flow-PDF errors
 */
export class FlowPdfError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'FlowPdfError';
    Object.setPrototypeOf(this, FlowPdfError.prototype);
  }
}

/**
 * Error thrown when document validation fails
 */
export class ValidationError extends FlowPdfError {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when layout calculation fails
 */
export class LayoutError extends FlowPdfError {
  public constructor(message: string) {
    super(message);
    this.name = 'LayoutError';
    Object.setPrototypeOf(this, LayoutError.prototype);
  }
}

/**
 * Error thrown when rendering fails
 */
export class RenderError extends FlowPdfError {
  public constructor(message: string) {
    super(message);
    this.name = 'RenderError';
    Object.setPrototypeOf(this, RenderError.prototype);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigError extends FlowPdfError {
  public constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}
