/**
 * Layout constraints - defines the available space for layout
 */
export interface Constraints {
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
}

/**
 * Helper to create unbounded constraints
 */
export function unbounded(): Constraints {
  return {
    minWidth: 0,
    maxWidth: Infinity,
    minHeight: 0,
    maxHeight: Infinity,
  };
}

/**
 * Helper to create tight constraints (fixed size)
 */
export function tight(width: number, height: number): Constraints {
  return {
    minWidth: width,
    maxWidth: width,
    minHeight: height,
    maxHeight: height,
  };
}

/**
 * Helper to create loose constraints (maximum size)
 */
export function loose(maxWidth: number, maxHeight: number): Constraints {
  return {
    minWidth: 0,
    maxWidth,
    minHeight: 0,
    maxHeight,
  };
}

/**
 * Helper to create constraints with only width constraint
 */
export function widthConstrained(maxWidth: number): Constraints {
  return {
    minWidth: 0,
    maxWidth,
    minHeight: 0,
    maxHeight: Infinity,
  };
}

/**
 * Helper to create constraints with only height constraint
 */
export function heightConstrained(maxHeight: number): Constraints {
  return {
    minWidth: 0,
    maxWidth: Infinity,
    minHeight: 0,
    maxHeight,
  };
}

/**
 * Check if constraints are tight (fixed size)
 */
export function isTight(constraints: Constraints): boolean {
  return (
    constraints.minWidth === constraints.maxWidth &&
    constraints.minHeight === constraints.maxHeight
  );
}

/**
 * Check if width is constrained (has finite max)
 */
export function hasFiniteWidth(constraints: Constraints): boolean {
  return isFinite(constraints.maxWidth);
}

/**
 * Check if height is constrained (has finite max)
 */
export function hasFiniteHeight(constraints: Constraints): boolean {
  return isFinite(constraints.maxHeight);
}

/**
 * Constrain a value to be within constraints
 */
export function constrainWidth(
  width: number,
  constraints: Constraints,
): number {
  return Math.max(constraints.minWidth, Math.min(width, constraints.maxWidth));
}

/**
 * Constrain a height value to be within constraints
 */
export function constrainHeight(
  height: number,
  constraints: Constraints,
): number {
  return Math.max(
    constraints.minHeight,
    Math.min(height, constraints.maxHeight),
  );
}

/**
 * Create child constraints by shrinking available space
 */
export function shrink(
  constraints: Constraints,
  width: number,
  height: number,
): Constraints {
  return {
    minWidth: Math.max(0, constraints.minWidth - width),
    maxWidth: Math.max(0, constraints.maxWidth - width),
    minHeight: Math.max(0, constraints.minHeight - height),
    maxHeight: Math.max(0, constraints.maxHeight - height),
  };
}
