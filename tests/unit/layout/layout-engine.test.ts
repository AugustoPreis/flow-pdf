import { LayoutEngine, createLayoutEngine } from '@/layout';
import { text, vStack, hStack, divider, spacer, box } from '@/dsl';
import type { Constraints } from '@/core';

describe('LayoutEngine', () => {
  let engine: LayoutEngine;

  beforeEach(() => {
    engine = createLayoutEngine();
  });

  describe('layout', () => {
    it('should layout a simple text node', () => {
      const root = text('Hello World');

      const layoutTree = engine.layout(root);

      expect(layoutTree.root).toBeDefined();
      expect(layoutTree.root.node).toBe(root);
      expect(layoutTree.root.box).toBeDefined();
      expect(layoutTree.root.box.width).toBeGreaterThan(0);
      expect(layoutTree.root.box.height).toBeGreaterThan(0);
      expect(layoutTree.pageSize).toBeDefined();
    });

    it('should layout a vStack with multiple children', () => {
      const root = vStack(
        { spacing: 10 },
        text('First'),
        text('Second'),
        text('Third'),
      );

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.children).toBeDefined();
      expect(layoutTree.root.children).toHaveLength(3);

      // Check that children are positioned vertically
      const children = layoutTree.root.children!;
      expect(children[0]?.box.y).toBeLessThan(children[1]?.box.y as number);
      expect(children[1]?.box.y).toBeLessThan(children[2]?.box.y as number);
    });

    it('should layout a hStack with multiple children', () => {
      const root = hStack(
        { spacing: 5 },
        text('First'),
        text('Second'),
        text('Third'),
      );

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.children).toBeDefined();
      expect(layoutTree.root.children).toHaveLength(3);

      // Check that children are positioned horizontally
      const children = layoutTree.root.children!;
      expect(children[0]?.box.x).toBeLessThan(children[1]?.box.x as number);
      expect(children[1]?.box.x).toBeLessThan(children[2]?.box.x as number);
    });

    it('should layout nested stacks', () => {
      const root = vStack(
        {},
        text('Header'),
        hStack({}, text('Left'), text('Right')),
        text('Footer'),
      );

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.children).toBeDefined();
      expect(layoutTree.root.children).toHaveLength(3);

      // Check nested hStack
      const hStackNode = layoutTree.root.children![1];
      expect(hStackNode?.children).toBeDefined();
      expect(hStackNode?.children).toHaveLength(2);
    });

    it('should layout a divider', () => {
      const root = divider({ thickness: 2 });

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.box.height).toBe(2);
      expect(layoutTree.root.box.width).toBeGreaterThan(0);
    });

    it('should layout a spacer', () => {
      const root = spacer({ width: 50, height: 30 });

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.box.width).toBe(50);
      expect(layoutTree.root.box.height).toBe(30);
    });

    it('should layout a box with children', () => {
      const root = box(
        { padding: 20, width: 200, height: 100 },
        text('Content'),
      );

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.box.width).toBe(200);
      expect(layoutTree.root.box.height).toBe(100);
      expect(layoutTree.root.box.padding).toBeDefined();
      expect(layoutTree.root.children).toHaveLength(1);
    });

    it('should respect custom constraints', () => {
      const root = text('Hello World', { width: 1000 });
      const constraints: Constraints = {
        minWidth: 0,
        maxWidth: 200,
        minHeight: 0,
        maxHeight: 500,
      };

      const layoutTree = engine.layout(root, constraints);

      // Width should be constrained to maxWidth
      expect(layoutTree.root.box.width).toBeLessThanOrEqual(200);
    });

    it('should apply padding to vStack', () => {
      const root = vStack({ padding: 20 }, text('First'), text('Second'));

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.box.padding).toBeDefined();
      expect(layoutTree.root.box.padding?.top).toBe(20);

      // Children should be offset by padding
      const firstChild = layoutTree.root.children![0];
      expect(firstChild?.box.x).toBeGreaterThan(0); // Offset by left padding
      expect(firstChild?.box.y).toBeGreaterThan(0); // Offset by top padding
    });

    it('should handle complex nested layout', () => {
      const root = vStack(
        { spacing: 10, padding: 20 },
        text('Title', { style: { fontSize: 24 } }),
        divider({ thickness: 1 }),
        box(
          { padding: 10, backgroundColor: '#f0f0f0' },
          vStack(
            { spacing: 5 },
            text('Line 1'),
            text('Line 2'),
            text('Line 3'),
          ),
        ),
        hStack(
          { spacing: 20 },
          text('Button 1'),
          spacer({ flex: 1 }),
          text('Button 2'),
        ),
      );

      const layoutTree = engine.layout(root);

      expect(layoutTree.root.children).toHaveLength(4);
      expect(layoutTree.root.box.width).toBeGreaterThan(0);
      expect(layoutTree.root.box.height).toBeGreaterThan(0);

      // Verify box has nested vStack
      const boxNode = layoutTree.root.children![2];
      expect(boxNode?.children).toHaveLength(1);
      expect(boxNode?.children?.[0]?.children).toHaveLength(3);
    });
  });

  describe('configuration', () => {
    it('should use custom default font size', () => {
      const customEngine = createLayoutEngine({
        defaultFontSize: 24,
      });

      const root = text('Hello');
      const layoutTree = customEngine.layout(root);

      // Height should be larger with bigger font size
      expect(layoutTree.root.box.height).toBeGreaterThan(24);
    });

    it('should use custom page size', () => {
      const customEngine = createLayoutEngine({
        pageSize: { width: 400, height: 600 },
      });

      const root = text('Hello');
      const layoutTree = customEngine.layout(root);

      expect(layoutTree.pageSize.width).toBe(400);
      expect(layoutTree.pageSize.height).toBe(600);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown node type', () => {
      const invalidNode = { type: 'unknown', props: {} };

      expect(() => {
        engine.layout(invalidNode as never);
      }).toThrow('No calculator registered for node type: unknown');
    });
  });
});
