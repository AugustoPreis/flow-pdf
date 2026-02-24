import { describe, it, expect } from '@jest/globals';
import { text, box, coloredBox, borderedBox, paddedBox, vStack } from '@/dsl';

describe('box()', () => {
  it('should create a simple box', () => {
    const node = box({}, text('Content'));

    expect(node).toBeDefined();
    expect(node.type).toBe('box');
    expect(node.children).toHaveLength(1);
    expect(node.children[0]?.type).toBe('text');
  });

  it('should create an empty box', () => {
    const node = box({});

    expect(node.children).toHaveLength(0);
  });

  it('should create box with width', () => {
    const node = box({ width: 200 }, text('Content'));

    expect(node.props.width).toBe(200);
  });

  it('should create box with height', () => {
    const node = box({ height: 150 }, text('Content'));

    expect(node.props.height).toBe(150);
  });

  it('should create box with width and height', () => {
    const node = box({ width: 200, height: 100 }, text('Content'));

    expect(node.props.width).toBe(200);
    expect(node.props.height).toBe(100);
  });

  it('should create box with numeric padding', () => {
    const node = box({ padding: 16 }, text('Padded'));

    expect(node.props.padding).toBe(16);
  });

  it('should create box with object padding', () => {
    const node = box(
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

  it('should create box with background color', () => {
    const node = box({ backgroundColor: '#f0f0f0' }, text('Colored'));

    expect(node.props.backgroundColor).toBe('#f0f0f0');
  });

  it('should create box with border', () => {
    const node = box(
      {
        border: {
          width: 2,
          color: '#333333',
          style: 'solid',
        },
      },
      text('Bordered'),
    );

    expect(node.props.border).toEqual({
      width: 2,
      color: '#333333',
      style: 'solid',
    });
  });

  it('should create box with border radius', () => {
    const node = box(
      {
        border: {
          width: 1,
          radius: 8,
        },
      },
      text('Rounded'),
    );

    expect(node.props.border?.radius).toBe(8);
  });

  it('should create box with all options', () => {
    const node = box(
      {
        width: 300,
        height: 200,
        padding: 20,
        backgroundColor: '#ffffff',
        border: {
          width: 2,
          color: '#000000',
          style: 'solid',
          radius: 10,
        },
      },
      text('Full options'),
    );

    expect(node.props.width).toBe(300);
    expect(node.props.height).toBe(200);
    expect(node.props.padding).toBe(20);
    expect(node.props.backgroundColor).toBe('#ffffff');
    expect(node.props.border).toBeDefined();
  });

  it('should throw error for negative width', () => {
    expect(() => box({ width: -10 }, text('Test'))).toThrow(
      'Box width must be non-negative',
    );
  });

  it('should throw error for negative height', () => {
    expect(() => box({ height: -10 }, text('Test'))).toThrow(
      'Box height must be non-negative',
    );
  });

  it('should throw error for negative padding', () => {
    expect(() => box({ padding: -5 }, text('Test'))).toThrow(
      'Box padding must be non-negative',
    );
  });

  it('should throw error for negative padding values', () => {
    expect(() => box({ padding: { top: -5 } }, text('Test'))).toThrow(
      'Box padding top must be non-negative',
    );

    expect(() => box({ padding: { right: -5 } }, text('Test'))).toThrow(
      'Box padding right must be non-negative',
    );

    expect(() => box({ padding: { bottom: -5 } }, text('Test'))).toThrow(
      'Box padding bottom must be non-negative',
    );

    expect(() => box({ padding: { left: -5 } }, text('Test'))).toThrow(
      'Box padding left must be non-negative',
    );
  });

  it('should throw error for negative border width', () => {
    expect(() => box({ border: { width: -1 } }, text('Test'))).toThrow(
      'Border width must be non-negative',
    );
  });

  it('should throw error for negative border radius', () => {
    expect(() => box({ border: { radius: -5 } }, text('Test'))).toThrow(
      'Border radius must be non-negative',
    );
  });

  it('should throw error for invalid children', () => {
    expect(() => box({}, null as never)).toThrow(
      'Child at index 0 is not a valid node',
    );

    expect(() => box({}, { invalid: 'node' } as never)).toThrow(
      'Child at index 0 is not a valid node',
    );
  });

  it('should create immutable nodes', () => {
    const node = box({ padding: 10 }, text('Content'));

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
    expect(Object.isFrozen(node.children)).toBe(true);
  });

  it('should handle multiple children', () => {
    const node = box({}, text('First'), text('Second'), text('Third'));

    expect(node.children).toHaveLength(3);
  });

  it('should handle nested boxes', () => {
    const node = box(
      { padding: 10 },
      text('Outer'),
      box({ padding: 5 }, text('Inner')),
    );

    expect(node.children).toHaveLength(2);
    expect(node.children[1]?.type).toBe('box');
  });

  it('should handle mixed content', () => {
    const node = box(
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

  it('should allow zero padding', () => {
    const node = box({ padding: 0 }, text('No padding'));

    expect(node.props.padding).toBe(0);
  });

  it('should allow zero border width', () => {
    const node = box({ border: { width: 0 } }, text('No border'));

    expect(node.props.border?.width).toBe(0);
  });

  it('should allow zero border radius', () => {
    const node = box({ border: { radius: 0 } }, text('Sharp corners'));

    expect(node.props.border?.radius).toBe(0);
  });

  it('should handle partial padding object', () => {
    const node = box(
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

  it('should handle all border styles', () => {
    const styles: Array<'solid' | 'dashed' | 'dotted'> = [
      'solid',
      'dashed',
      'dotted',
    ];

    styles.forEach((style) => {
      const node = box({ border: { style } }, text('Test'));
      expect(node.props.border?.style).toBe(style);
    });
  });
});

describe('coloredBox()', () => {
  it('should create box with background color', () => {
    const node = coloredBox('#ff0000', {}, text('Red background'));

    expect(node.type).toBe('box');
    expect(node.props.backgroundColor).toBe('#ff0000');
  });

  it('should create colored box with additional options', () => {
    const node = coloredBox('#0000ff', { padding: 15 }, text('Blue padded'));

    expect(node.props.backgroundColor).toBe('#0000ff');
    expect(node.props.padding).toBe(15);
  });

  it('should be immutable', () => {
    const node = coloredBox('#00ff00', {}, text('Green'));

    expect(Object.isFrozen(node)).toBe(true);
  });
});

describe('borderedBox()', () => {
  it('should create box with border', () => {
    const node = borderedBox(
      { width: 2, color: '#000000' },
      {},
      text('Bordered'),
    );

    expect(node.type).toBe('box');
    expect(node.props.border).toEqual({ width: 2, color: '#000000' });
  });

  it('should create bordered box with additional options', () => {
    const node = borderedBox(
      { width: 1, style: 'dashed' },
      { padding: 10 },
      text('Dashed border'),
    );

    expect(node.props.border?.style).toBe('dashed');
    expect(node.props.padding).toBe(10);
  });

  it('should be immutable', () => {
    const node = borderedBox({ width: 1 }, {}, text('Border'));

    expect(Object.isFrozen(node)).toBe(true);
  });
});

describe('paddedBox()', () => {
  it('should create box with numeric padding', () => {
    const node = paddedBox(20, text('Padded'));

    expect(node.type).toBe('box');
    expect(node.props.padding).toBe(20);
  });

  it('should create box with object padding', () => {
    const node = paddedBox({ top: 10, bottom: 10 }, text('Custom padded'));

    expect(node.props.padding).toEqual({ top: 10, bottom: 10 });
  });

  it('should handle multiple children', () => {
    const node = paddedBox(15, text('First'), text('Second'));

    expect(node.props.padding).toBe(15);
    expect(node.children).toHaveLength(2);
  });

  it('should be immutable', () => {
    const node = paddedBox(12, text('Padded'));

    expect(Object.isFrozen(node)).toBe(true);
  });
});

describe('box integration', () => {
  it('should create complex nested structure', () => {
    const node = box(
      {
        backgroundColor: '#f5f5f5',
        padding: 20,
        border: { width: 1, color: '#cccccc' },
      },
      text('Header'),
      box({ padding: 10 }, text('Content 1'), text('Content 2')),
      text('Footer'),
    );

    expect(node.type).toBe('box');
    expect(node.children).toHaveLength(3);
    expect(node.children[1]?.type).toBe('box');
  });

  it('should maintain immutability in nested structures', () => {
    const nested = box({ padding: 5 }, text('Nested'));

    const parent = box({ padding: 10 }, text('Parent'), nested);

    expect(Object.isFrozen(parent)).toBe(true);
    expect(Object.isFrozen(parent.children)).toBe(true);
    expect(Object.isFrozen(nested)).toBe(true);
  });
});
