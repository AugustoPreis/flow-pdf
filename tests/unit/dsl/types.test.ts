import { describe, it, expect } from '@jest/globals';
import {
  point,
  dimensions,
  layoutBox,
  createPadding,
  contentWidth,
  contentHeight,
  innerPosition,
  unbounded,
  tight,
  loose,
  widthConstrained,
  heightConstrained,
  isTight,
  hasFiniteWidth,
  hasFiniteHeight,
  constrainWidth,
  constrainHeight,
  shrink,
} from '@/core';

describe('Point helpers', () => {
  it('should create a point', () => {
    const p = point(10, 20);

    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });
});

describe('Dimensions helpers', () => {
  it('should create dimensions', () => {
    const d = dimensions(100, 50);

    expect(d.width).toBe(100);
    expect(d.height).toBe(50);
  });
});

describe('LayoutBox helpers', () => {
  it('should create a layout box', () => {
    const box = layoutBox(10, 20, 100, 50);

    expect(box.x).toBe(10);
    expect(box.y).toBe(20);
    expect(box.width).toBe(100);
    expect(box.height).toBe(50);
  });

  it('should create a layout box with padding', () => {
    const padding = { top: 5, right: 10, bottom: 5, left: 10 };
    const box = layoutBox(0, 0, 100, 100, padding);

    expect(box.padding).toEqual(padding);
  });
});

describe('createPadding()', () => {
  it('should create uniform padding from number', () => {
    const padding = createPadding(10);

    expect(padding).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    });
  });

  it('should create padding from partial object', () => {
    const padding = createPadding({ top: 10, left: 20 });

    expect(padding).toEqual({
      top: 10,
      right: 0,
      bottom: 0,
      left: 20,
    });
  });

  it('should create padding from full object', () => {
    const padding = createPadding({
      top: 5,
      right: 10,
      bottom: 15,
      left: 20,
    });

    expect(padding).toEqual({
      top: 5,
      right: 10,
      bottom: 15,
      left: 20,
    });
  });

  it('should default missing values to 0', () => {
    const padding = createPadding({});

    expect(padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
});

describe('contentWidth()', () => {
  it('should return full width when no padding', () => {
    const box = layoutBox(0, 0, 100, 100);
    expect(contentWidth(box)).toBe(100);
  });

  it('should subtract horizontal padding', () => {
    const box = layoutBox(0, 0, 100, 100, {
      top: 0,
      right: 10,
      bottom: 0,
      left: 20,
    });

    expect(contentWidth(box)).toBe(70); // 100 - 10 - 20
  });

  it('should not return negative values', () => {
    const box = layoutBox(0, 0, 10, 10, {
      top: 0,
      right: 50,
      bottom: 0,
      left: 50,
    });

    expect(contentWidth(box)).toBe(0);
  });
});

describe('contentHeight()', () => {
  it('should return full height when no padding', () => {
    const box = layoutBox(0, 0, 100, 100);
    expect(contentHeight(box)).toBe(100);
  });

  it('should subtract vertical padding', () => {
    const box = layoutBox(0, 0, 100, 100, {
      top: 10,
      right: 0,
      bottom: 20,
      left: 0,
    });

    expect(contentHeight(box)).toBe(70); // 100 - 10 - 20
  });

  it('should not return negative values', () => {
    const box = layoutBox(0, 0, 10, 10, {
      top: 50,
      right: 0,
      bottom: 50,
      left: 0,
    });

    expect(contentHeight(box)).toBe(0);
  });
});

describe('innerPosition()', () => {
  it('should return same position when no padding', () => {
    const box = layoutBox(10, 20, 100, 100);
    const inner = innerPosition(box);

    expect(inner).toEqual({ x: 10, y: 20 });
  });

  it('should add padding to position', () => {
    const box = layoutBox(10, 20, 100, 100, {
      top: 5,
      right: 0,
      bottom: 0,
      left: 15,
    });

    const inner = innerPosition(box);

    expect(inner).toEqual({ x: 25, y: 25 }); // 10 + 15, 20 + 5
  });
});

describe('Constraints - unbounded()', () => {
  it('should create unbounded constraints', () => {
    const constraints = unbounded();

    expect(constraints.minWidth).toBe(0);
    expect(constraints.maxWidth).toBe(Infinity);
    expect(constraints.minHeight).toBe(0);
    expect(constraints.maxHeight).toBe(Infinity);
  });
});

describe('Constraints - tight()', () => {
  it('should create tight constraints', () => {
    const constraints = tight(100, 50);

    expect(constraints.minWidth).toBe(100);
    expect(constraints.maxWidth).toBe(100);
    expect(constraints.minHeight).toBe(50);
    expect(constraints.maxHeight).toBe(50);
  });
});

describe('Constraints - loose()', () => {
  it('should create loose constraints', () => {
    const constraints = loose(200, 300);

    expect(constraints.minWidth).toBe(0);
    expect(constraints.maxWidth).toBe(200);
    expect(constraints.minHeight).toBe(0);
    expect(constraints.maxHeight).toBe(300);
  });
});

describe('Constraints - widthConstrained()', () => {
  it('should create width-only constraints', () => {
    const constraints = widthConstrained(150);

    expect(constraints.minWidth).toBe(0);
    expect(constraints.maxWidth).toBe(150);
    expect(constraints.minHeight).toBe(0);
    expect(constraints.maxHeight).toBe(Infinity);
  });
});

describe('Constraints - heightConstrained()', () => {
  it('should create height-only constraints', () => {
    const constraints = heightConstrained(250);

    expect(constraints.minWidth).toBe(0);
    expect(constraints.maxWidth).toBe(Infinity);
    expect(constraints.minHeight).toBe(0);
    expect(constraints.maxHeight).toBe(250);
  });
});

describe('isTight()', () => {
  it('should return true for tight constraints', () => {
    const constraints = tight(100, 100);
    expect(isTight(constraints)).toBe(true);
  });

  it('should return false for loose constraints', () => {
    const constraints = loose(100, 100);
    expect(isTight(constraints)).toBe(false);
  });

  it('should return false for partially tight constraints', () => {
    const constraints = {
      minWidth: 100,
      maxWidth: 100,
      minHeight: 0,
      maxHeight: 100,
    };

    expect(isTight(constraints)).toBe(false);
  });
});

describe('hasFiniteWidth()', () => {
  it('should return true for finite width', () => {
    const constraints = loose(100, 100);
    expect(hasFiniteWidth(constraints)).toBe(true);
  });

  it('should return false for infinite width', () => {
    const constraints = unbounded();
    expect(hasFiniteWidth(constraints)).toBe(false);
  });
});

describe('hasFiniteHeight()', () => {
  it('should return true for finite height', () => {
    const constraints = loose(100, 100);
    expect(hasFiniteHeight(constraints)).toBe(true);
  });

  it('should return false for infinite height', () => {
    const constraints = unbounded();
    expect(hasFiniteHeight(constraints)).toBe(false);
  });
});

describe('constrainWidth()', () => {
  it('should constrain to max width', () => {
    const constraints = loose(100, 100);
    expect(constrainWidth(150, constraints)).toBe(100);
  });

  it('should constrain to min width', () => {
    const constraints = {
      minWidth: 50,
      maxWidth: 100,
      minHeight: 0,
      maxHeight: 100,
    };
    expect(constrainWidth(30, constraints)).toBe(50);
  });

  it('should allow value within bounds', () => {
    const constraints = loose(100, 100);
    expect(constrainWidth(75, constraints)).toBe(75);
  });
});

describe('constrainHeight()', () => {
  it('should constrain to max height', () => {
    const constraints = loose(100, 100);
    expect(constrainHeight(150, constraints)).toBe(100);
  });

  it('should constrain to min height', () => {
    const constraints = {
      minWidth: 0,
      maxWidth: 100,
      minHeight: 50,
      maxHeight: 100,
    };
    expect(constrainHeight(30, constraints)).toBe(50);
  });

  it('should allow value within bounds', () => {
    const constraints = loose(100, 100);
    expect(constrainHeight(75, constraints)).toBe(75);
  });
});

describe('shrink()', () => {
  it('should shrink constraints by given dimensions', () => {
    const constraints = loose(200, 300);
    const shrunk = shrink(constraints, 50, 100);

    expect(shrunk.maxWidth).toBe(150);
    expect(shrunk.maxHeight).toBe(200);
  });

  it('should not create negative constraints', () => {
    const constraints = loose(100, 100);
    const shrunk = shrink(constraints, 150, 150);

    expect(shrunk.maxWidth).toBe(0);
    expect(shrunk.maxHeight).toBe(0);
  });

  it('should shrink min constraints', () => {
    const constraints = {
      minWidth: 100,
      maxWidth: 200,
      minHeight: 100,
      maxHeight: 200,
    };

    const shrunk = shrink(constraints, 50, 50);

    expect(shrunk.minWidth).toBe(50);
    expect(shrunk.maxWidth).toBe(150);
    expect(shrunk.minHeight).toBe(50);
    expect(shrunk.maxHeight).toBe(150);
  });

  it('should handle infinite max constraints', () => {
    const constraints = unbounded();
    const shrunk = shrink(constraints, 50, 100);

    expect(shrunk.maxWidth).toBe(Infinity);
    expect(shrunk.maxHeight).toBe(Infinity);
  });
});
