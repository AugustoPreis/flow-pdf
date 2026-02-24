import {
  VStackCalculator,
  HStackCalculator,
  DefaultFontMetrics,
  LayoutContext,
} from '@/layout';
import { vStack, hStack, text } from '@/dsl';
import type { Constraints, LayoutBox } from '@/core';

describe('VStackCalculator', () => {
  let calculator: VStackCalculator;
  let context: LayoutContext;

  beforeEach(() => {
    calculator = new VStackCalculator();
    const fontMetrics = new DefaultFontMetrics();

    // Mock layoutChild to return fixed size boxes
    const mockLayoutChild = jest.fn((): LayoutBox => {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      };
    });

    context = {
      fontMetrics,
      defaultFontSize: 12,
      layoutChild: mockLayoutChild,
    };
  });

  describe('calculate', () => {
    it('should stack children vertically', () => {
      const node = vStack({}, text('First'), text('Second'), text('Third'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Height should be sum of children (3 * 20 = 60)
      expect(box.height).toBe(60);
      // Width should be max of children
      expect(box.width).toBe(100);
    });

    it('should apply spacing between children', () => {
      const node = vStack(
        { spacing: 10 },
        text('First'),
        text('Second'),
        text('Third'),
      );
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Height should be sum of children + spacing (3 * 20 + 2 * 10 = 80)
      expect(box.height).toBe(80);
    });

    it('should respect explicit width', () => {
      const node = vStack({ width: 300 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(300);
    });

    it('should respect explicit height', () => {
      const node = vStack({ height: 200 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.height).toBe(200);
    });

    it('should apply padding', () => {
      const node = vStack({ padding: 20 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Width: child width (100) + horizontal padding (20 + 20 = 40) = 140
      expect(box.width).toBe(140);
      // Height: children height (2 * 20 = 40) + vertical padding (20 + 20 = 40) = 80
      expect(box.height).toBe(80);
      expect(box.padding).toBeDefined();
      expect(box.padding?.top).toBe(20);
    });

    it('should handle empty children', () => {
      const node = vStack({});
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(0);
      expect(box.height).toBe(0);
    });
  });
});

describe('HStackCalculator', () => {
  let calculator: HStackCalculator;
  let context: LayoutContext;

  beforeEach(() => {
    calculator = new HStackCalculator();
    const fontMetrics = new DefaultFontMetrics();

    // Mock layoutChild to return fixed size boxes
    const mockLayoutChild = jest.fn((): LayoutBox => {
      return {
        x: 0,
        y: 0,
        width: 50,
        height: 20,
      };
    });

    context = {
      fontMetrics,
      defaultFontSize: 12,
      layoutChild: mockLayoutChild,
    };
  });

  describe('calculate', () => {
    it('should stack children horizontally', () => {
      const node = hStack({}, text('First'), text('Second'), text('Third'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Width should be sum of children (3 * 50 = 150)
      expect(box.width).toBe(150);
      // Height should be max of children
      expect(box.height).toBe(20);
    });

    it('should apply spacing between children', () => {
      const node = hStack(
        { spacing: 10 },
        text('First'),
        text('Second'),
        text('Third'),
      );
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Width should be sum of children + spacing (3 * 50 + 2 * 10 = 170)
      expect(box.width).toBe(170);
    });

    it('should respect explicit width', () => {
      const node = hStack({ width: 300 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(300);
    });

    it('should respect explicit height', () => {
      const node = hStack({ height: 100 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.height).toBe(100);
    });

    it('should apply padding', () => {
      const node = hStack({ padding: 15 }, text('First'), text('Second'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      // Width: children width (2 * 50 = 100) + horizontal padding (15 + 15 = 30) = 130
      expect(box.width).toBe(130);
      // Height: child height (20) + vertical padding (15 + 15 = 30) = 50
      expect(box.height).toBe(50);
      expect(box.padding).toBeDefined();
      expect(box.padding?.left).toBe(15);
    });

    it('should handle empty children', () => {
      const node = hStack({});
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(0);
      expect(box.height).toBe(0);
    });
  });
});
