import { describe, it, expect } from '@jest/globals';
import { text, hStack, vStack } from '@/dsl';
import { VStackNode } from '@/core';

describe('vStack()', () => {
  it('should create a simple vertical stack', () => {
    const node = vStack({}, text('First'), text('Second'));

    expect(node).toBeDefined();
    expect(node.type).toBe('vStack');
    expect(node.children).toHaveLength(2);
    expect(node.children?.[0]?.type).toBe('text');
    expect(node.children?.[1]?.type).toBe('text');
  });

  it('should create an empty stack', () => {
    const node = vStack({});

    expect(node.children).toHaveLength(0);
  });

  it('should create stack with spacing', () => {
    const node = vStack({ spacing: 10 }, text('First'), text('Second'));

    expect(node.props.spacing).toBe(10);
  });

  it('should create stack with alignment', () => {
    const node = vStack({ align: 'center' }, text('Centered'));

    expect(node.props.align).toBe('center');
  });

  it('should create stack with width and height', () => {
    const node = vStack({ width: 200, height: 300 }, text('Content'));

    expect(node.props.width).toBe(200);
    expect(node.props.height).toBe(300);
  });

  it('should create stack with numeric padding', () => {
    const node = vStack({ padding: 16 }, text('Padded'));

    expect(node.props.padding).toBe(16);
  });

  it('should create stack with object padding', () => {
    const node = vStack(
      {
        padding: { top: 10, right: 20, bottom: 30, left: 40 },
      },
      text('Custom padding'),
    );

    expect(node.props.padding).toEqual({
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    });
  });

  it('should throw error for negative spacing', () => {
    expect(() => vStack({ spacing: -5 }, text('Test'))).toThrow(
      'Spacing must be non-negative',
    );
  });

  it('should throw error for negative width', () => {
    expect(() => vStack({ width: -10 }, text('Test'))).toThrow(
      'Width must be non-negative',
    );
  });

  it('should throw error for negative height', () => {
    expect(() => vStack({ height: -10 }, text('Test'))).toThrow(
      'Height must be non-negative',
    );
  });

  it('should throw error for negative padding', () => {
    expect(() => vStack({ padding: -5 }, text('Test'))).toThrow(
      'Padding must be non-negative',
    );
  });

  it('should throw error for negative padding values', () => {
    expect(() => vStack({ padding: { top: -5 } }, text('Test'))).toThrow(
      'Padding top must be non-negative',
    );

    expect(() => vStack({ padding: { right: -5 } }, text('Test'))).toThrow(
      'Padding right must be non-negative',
    );

    expect(() => vStack({ padding: { bottom: -5 } }, text('Test'))).toThrow(
      'Padding bottom must be non-negative',
    );

    expect(() => vStack({ padding: { left: -5 } }, text('Test'))).toThrow(
      'Padding left must be non-negative',
    );
  });

  it('should throw error for invalid children', () => {
    expect(() => vStack({}, null as never)).toThrow(
      'Child at index 0 is not a valid node',
    );

    expect(() => vStack({}, { invalid: 'node' } as never)).toThrow(
      'Child at index 0 is not a valid node',
    );
  });

  it('should create immutable nodes', () => {
    const node = vStack({ spacing: 10 }, text('First'), text('Second'));

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
    expect(Object.isFrozen(node.children)).toBe(true);
  });

  it('should handle nested stacks', () => {
    const node = vStack(
      {},
      text('Top'),
      vStack({ spacing: 5 }, text('Nested 1'), text('Nested 2')),
      text('Bottom'),
    );

    expect(node.children).toHaveLength(3);
    expect(node.children?.[1]?.type).toBe('vStack');
    expect((node.children?.[1] as VStackNode)?.children).toHaveLength(2);
  });

  it('should handle all alignment options', () => {
    const alignments: Array<'start' | 'center' | 'end' | 'stretch'> = [
      'start',
      'center',
      'end',
      'stretch',
    ];

    alignments.forEach((align) => {
      const node = vStack({ align }, text('Test'));
      expect(node.props.align).toBe(align);
    });
  });

  it('should handle partial padding object', () => {
    const node = vStack(
      {
        padding: { top: 10, left: 20 },
      },
      text('Partial padding'),
    );

    expect(node.props.padding).toEqual({
      top: 10,
      left: 20,
    });
  });
});

describe('hStack()', () => {
  it('should create a simple horizontal stack', () => {
    const node = hStack({}, text('Left'), text('Right'));

    expect(node).toBeDefined();
    expect(node.type).toBe('hStack');
    expect(node.children).toHaveLength(2);
  });

  it('should create an empty stack', () => {
    const node = hStack({});

    expect(node.children).toHaveLength(0);
  });

  it('should create stack with spacing', () => {
    const node = hStack({ spacing: 15 }, text('Left'), text('Right'));

    expect(node.props.spacing).toBe(15);
  });

  it('should create stack with alignment', () => {
    const node = hStack({ align: 'end' }, text('Bottom aligned'));

    expect(node.props.align).toBe('end');
  });

  it('should create stack with padding', () => {
    const node = hStack({ padding: 20 }, text('Padded'));

    expect(node.props.padding).toBe(20);
  });

  it('should throw error for negative spacing', () => {
    expect(() => hStack({ spacing: -5 }, text('Test'))).toThrow(
      'Spacing must be non-negative',
    );
  });

  it('should throw error for negative width', () => {
    expect(() => hStack({ width: -10 }, text('Test'))).toThrow(
      'Width must be non-negative',
    );
  });

  it('should throw error for invalid children', () => {
    expect(() => hStack({}, 'invalid' as never)).toThrow(
      'Child at index 0 is not a valid node',
    );
  });

  it('should create immutable nodes', () => {
    const node = hStack({ spacing: 10 }, text('Left'), text('Right'));

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
    expect(Object.isFrozen(node.children)).toBe(true);
  });

  it('should handle mixed content', () => {
    const node = hStack(
      {},
      text('Text'),
      vStack({}, text('Nested 1'), text('Nested 2')),
      text('More text'),
    );

    expect(node.children).toHaveLength(3);
    expect(node.children[0]?.type).toBe('text');
    expect(node.children[1]?.type).toBe('vStack');
    expect(node.children[2]?.type).toBe('text');
  });

  it('should handle all stack properties', () => {
    const node = hStack(
      {
        spacing: 12,
        align: 'center',
        width: 500,
        height: 100,
        padding: { top: 10, bottom: 10 },
      },
      text('Full props'),
    );

    expect(node.props.spacing).toBe(12);
    expect(node.props.align).toBe('center');
    expect(node.props.width).toBe(500);
    expect(node.props.height).toBe(100);
    expect(node.props.padding).toEqual({ top: 10, bottom: 10 });
  });
});

describe('vStack and hStack integration', () => {
  it('should create complex nested structures', () => {
    const node = vStack(
      { spacing: 20 },
      text('Header'),
      hStack(
        { spacing: 10 },
        vStack({ spacing: 5 }, text('Left 1'), text('Left 2')),
        vStack({ spacing: 5 }, text('Right 1'), text('Right 2')),
      ),
      text('Footer'),
    );

    expect(node.type).toBe('vStack');
    expect(node.children).toHaveLength(3);

    const middleRow = node.children[1] as VStackNode;
    expect(middleRow.type).toBe('hStack');
    expect(middleRow.children).toHaveLength(2);
  });

  it('should maintain immutability in nested structures', () => {
    const nested = vStack({}, text('Nested'));

    const parent = vStack({}, text('Parent'), nested);

    expect(Object.isFrozen(parent)).toBe(true);
    expect(Object.isFrozen(parent.children)).toBe(true);
    expect(Object.isFrozen(nested)).toBe(true);
  });
});
