import {
  DividerCalculator,
  SpacerCalculator,
  BoxCalculator,
  DefaultFontMetrics,
  LayoutContext,
} from '@/layout';
import { divider, spacer, box, text } from '@/dsl';
import type { Constraints, LayoutBox } from '@/core';

describe('DividerCalculator', () => {
  let calculator: DividerCalculator;

  beforeEach(() => {
    calculator = new DividerCalculator();
  });

  describe('calculate', () => {
    it('should create horizontal divider with default settings', () => {
      const node = divider();
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      calculator = new DividerCalculator();

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.height).toBe(1); // default thickness
      expect(layoutBox.width).toBe(500); // full maxWidth
    });

    it('should create horizontal divider with custom thickness', () => {
      const node = divider({ thickness: 3 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.height).toBe(3);
    });

    it('should create horizontal divider with custom length', () => {
      const node = divider({ length: 200 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(200);
    });

    it('should create vertical divider', () => {
      const node = divider({ orientation: 'vertical', thickness: 2 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(2); // thickness
      expect(layoutBox.height).toBe(1000); // full maxHeight
    });
  });
});

describe('SpacerCalculator', () => {
  let calculator: SpacerCalculator;

  beforeEach(() => {
    calculator = new SpacerCalculator();
  });

  describe('calculate', () => {
    it('should create fixed size spacer', () => {
      const node = spacer({ width: 50, height: 30 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(50);
      expect(layoutBox.height).toBe(30);
    });

    it('should create horizontal spacer', () => {
      const node = spacer({ width: 100 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(100);
      expect(layoutBox.height).toBe(0);
    });

    it('should create vertical spacer', () => {
      const node = spacer({ height: 80 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(0);
      expect(layoutBox.height).toBe(80);
    });

    it('should create flexible spacer', () => {
      const node = spacer({ flex: 1 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      // Flexible spacer should fill available space
      expect(layoutBox.width).toBe(500);
      expect(layoutBox.height).toBe(1000);
    });

    it('should handle empty spacer', () => {
      const node = spacer();
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints);

      expect(layoutBox.width).toBe(0);
      expect(layoutBox.height).toBe(0);
    });
  });
});

describe('BoxCalculator', () => {
  let calculator: BoxCalculator;
  let context: LayoutContext;

  beforeEach(() => {
    calculator = new BoxCalculator();
    const fontMetrics = new DefaultFontMetrics();

    // Mock layoutChild to return fixed size boxes
    const mockLayoutChild = jest.fn((): LayoutBox => {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      };
    });

    context = {
      fontMetrics,
      defaultFontSize: 12,
      layoutChild: mockLayoutChild,
    };
  });

  describe('calculate', () => {
    it('should create box with explicit dimensions', () => {
      const node = box({ width: 200, height: 150 }, text('Content'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      expect(layoutBox.width).toBe(200);
      expect(layoutBox.height).toBe(150);
    });

    it('should size to content when no explicit dimensions', () => {
      const node = box({}, text('Content'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      // Should match child size (100x50)
      expect(layoutBox.width).toBe(100);
      expect(layoutBox.height).toBe(50);
    });

    it('should apply padding', () => {
      const node = box({ padding: 20 }, text('Content'));
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      // Width: child (100) + padding (20 + 20) = 140
      // Height: child (50) + padding (20 + 20) = 90
      expect(layoutBox.width).toBe(140);
      expect(layoutBox.height).toBe(90);
      expect(layoutBox.padding).toBeDefined();
    });

    it('should apply border', () => {
      const node = box(
        { border: { width: 2, color: '#000' } },
        text('Content'),
      );
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      // Width: child (100) + border (2 * 2) = 104
      // Height: child (50) + border (2 * 2) = 54
      expect(layoutBox.width).toBe(104);
      expect(layoutBox.height).toBe(54);
    });

    it('should apply both padding and border', () => {
      const node = box(
        { padding: 10, border: { width: 2, color: '#000' } },
        text('Content'),
      );
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      // Width: child (100) + padding (10 + 10) + border (2 + 2) = 124
      // Height: child (50) + padding (10 + 10) + border (2 + 2) = 74
      expect(layoutBox.width).toBe(124);
      expect(layoutBox.height).toBe(74);
    });

    it('should handle empty box', () => {
      const node = box({});
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const layoutBox = calculator.calculate(node, constraints, context);

      expect(layoutBox.width).toBe(0);
      expect(layoutBox.height).toBe(0);
    });
  });
});
