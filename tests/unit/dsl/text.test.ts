import { describe, it, expect } from '@jest/globals';
import { text, bold, italic, fontSize } from '@/dsl';

describe('text()', () => {
  it('should create a simple text node', () => {
    const node = text('Hello World');

    expect(node).toBeDefined();
    expect(node.type).toBe('text');
    expect(node.props.content).toBe('Hello World');
  });

  it('should create text with custom font size', () => {
    const node = text('Hello', {
      style: { fontSize: 16 },
    });

    expect(node.props.style?.fontSize).toBe(16);
  });

  it('should create text with bold font weight', () => {
    const node = text('Bold text', {
      style: { fontWeight: 'bold' },
    });

    expect(node.props.style?.fontWeight).toBe('bold');
  });

  it('should create text with italic style', () => {
    const node = text('Italic text', {
      style: { fontStyle: 'italic' },
    });

    expect(node.props.style?.fontStyle).toBe('italic');
  });

  it('should create text with color', () => {
    const node = text('Colored text', {
      style: { color: '#FF0000' },
    });

    expect(node.props.style?.color).toBe('#FF0000');
  });

  it('should create text with alignment', () => {
    const node = text('Centered text', {
      style: { align: 'center' },
    });

    expect(node.props.style?.align).toBe('center');
  });

  it('should create text with width and height', () => {
    const node = text('Sized text', {
      width: 200,
      height: 50,
    });

    expect(node.props.width).toBe(200);
    expect(node.props.height).toBe(50);
  });

  it('should throw error for non-string content', () => {
    expect(() => text(123 as never)).toThrow('Text content must be a string');
  });

  it('should throw error for empty content', () => {
    expect(() => text('')).toThrow('Text content cannot be empty');
  });

  it('should throw error for negative width', () => {
    expect(() => text('Hello', { width: -10 })).toThrow(
      'Text width must be non-negative',
    );
  });

  it('should throw error for negative height', () => {
    expect(() => text('Hello', { height: -10 })).toThrow(
      'Text height must be non-negative',
    );
  });

  it('should throw error for zero or negative font size', () => {
    expect(() => text('Hello', { style: { fontSize: 0 } })).toThrow(
      'Font size must be positive',
    );
    expect(() => text('Hello', { style: { fontSize: -5 } })).toThrow(
      'Font size must be positive',
    );
  });

  it('should throw error for zero or negative line height', () => {
    expect(() => text('Hello', { style: { lineHeight: 0 } })).toThrow(
      'Line height must be positive',
    );
    expect(() => text('Hello', { style: { lineHeight: -2 } })).toThrow(
      'Line height must be positive',
    );
  });

  it('should create immutable nodes', () => {
    const node = text('Hello');

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
  });

  it('should allow multiple style properties', () => {
    const node = text('Styled text', {
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#0000FF',
        align: 'right',
        lineHeight: 1.5,
      },
    });

    expect(node.props.style?.fontSize).toBe(18);
    expect(node.props.style?.fontWeight).toBe('bold');
    expect(node.props.style?.fontStyle).toBe('italic');
    expect(node.props.style?.color).toBe('#0000FF');
    expect(node.props.style?.align).toBe('right');
    expect(node.props.style?.lineHeight).toBe(1.5);
  });
});

describe('bold()', () => {
  it('should create bold text', () => {
    const node = bold('Bold text');

    expect(node.props.content).toBe('Bold text');
    expect(node.props.style?.fontWeight).toBe('bold');
  });

  it('should preserve other style properties', () => {
    const node = bold('Bold red text', {
      style: { color: '#FF0000' },
    });

    expect(node.props.style?.fontWeight).toBe('bold');
    expect(node.props.style?.color).toBe('#FF0000');
  });
});

describe('italic()', () => {
  it('should create italic text', () => {
    const node = italic('Italic text');

    expect(node.props.content).toBe('Italic text');
    expect(node.props.style?.fontStyle).toBe('italic');
  });

  it('should preserve other style properties', () => {
    const node = italic('Italic blue text', {
      style: { color: '#0000FF' },
    });

    expect(node.props.style?.fontStyle).toBe('italic');
    expect(node.props.style?.color).toBe('#0000FF');
  });
});

describe('fontSize()', () => {
  it('should create text with custom font size', () => {
    const node = fontSize(24, 'Large text');

    expect(node.props.content).toBe('Large text');
    expect(node.props.style?.fontSize).toBe(24);
  });

  it('should preserve other style properties', () => {
    const node = fontSize(16, 'Sized bold text', {
      style: { fontWeight: 'bold' },
    });

    expect(node.props.style?.fontSize).toBe(16);
    expect(node.props.style?.fontWeight).toBe('bold');
  });
});
