import { TextCalculator, DefaultFontMetrics } from '@/layout';
import { text } from '@/dsl';
import type { Constraints } from '@/core';
import type { LayoutContext } from '@/layout';

describe('TextCalculator', () => {
  let calculator: TextCalculator;
  let context: LayoutContext;

  beforeEach(() => {
    calculator = new TextCalculator();
    const fontMetrics = new DefaultFontMetrics();

    context = {
      fontMetrics,
      defaultFontSize: 12,
      layoutChild: jest.fn(),
    };
  });

  describe('calculate', () => {
    it('should calculate basic text dimensions', () => {
      const node = text('Hello World');
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.x).toBe(0);
      expect(box.y).toBe(0);
    });

    it('should respect explicit width', () => {
      const node = text('Hello World', { width: 200 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(200);
    });

    it('should respect explicit height', () => {
      const node = text('Hello World', { height: 50 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.height).toBe(50);
    });

    it('should handle text wrapping', () => {
      const longText =
        'This is a very long text that should wrap into multiple lines when constrained';
      const node = text(longText);
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 100,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBeLessThanOrEqual(100);
      expect(box.height).toBeGreaterThan(12); // Should be taller due to wrapping
    });

    it('should respect custom font size', () => {
      const node = text('Hello', { style: { fontSize: 24 } });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.height).toBeGreaterThan(24); // Height based on line height
    });

    it('should constrain width to max constraint', () => {
      const node = text('Hello', { width: 1000 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 200,
        minHeight: 0,
        maxHeight: 1000,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.width).toBe(200); // Constrained to maxWidth
    });

    it('should constrain height to max constraint', () => {
      const node = text('Hello', { height: 1000 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 500,
        minHeight: 0,
        maxHeight: 100,
      };

      const box = calculator.calculate(node, constraints, context);

      expect(box.height).toBe(100); // Constrained to maxHeight
    });
  });
});
