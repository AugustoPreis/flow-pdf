import { describe, it, expect } from '@jest/globals';
import { divider, horizontalDivider, verticalDivider } from '@/dsl';

describe('divider()', () => {
  it('should create a simple divider', () => {
    const node = divider();

    expect(node).toBeDefined();
    expect(node.type).toBe('divider');
    expect(node.props).toBeDefined();
  });

  it('should create divider with thickness', () => {
    const node = divider({ thickness: 2 });

    expect(node.props.thickness).toBe(2);
  });

  it('should create divider with color', () => {
    const node = divider({ color: '#cccccc' });

    expect(node.props.color).toBe('#cccccc');
  });

  it('should create divider with length', () => {
    const node = divider({ length: 100 });

    expect(node.props.length).toBe(100);
  });

  it('should create divider with style', () => {
    const node = divider({ style: 'dashed' });

    expect(node.props.style).toBe('dashed');
  });

  it('should create divider with orientation', () => {
    const node = divider({ orientation: 'vertical' });

    expect(node.props.orientation).toBe('vertical');
  });

  it('should create divider with all options', () => {
    const node = divider({
      orientation: 'horizontal',
      thickness: 3,
      length: 200,
      color: '#333333',
      style: 'solid',
    });

    expect(node.props.orientation).toBe('horizontal');
    expect(node.props.thickness).toBe(3);
    expect(node.props.length).toBe(200);
    expect(node.props.color).toBe('#333333');
    expect(node.props.style).toBe('solid');
  });

  it('should throw error for negative thickness', () => {
    expect(() => divider({ thickness: -1 })).toThrow(
      'Divider thickness must be positive',
    );
  });

  it('should throw error for zero thickness', () => {
    expect(() => divider({ thickness: 0 })).toThrow(
      'Divider thickness must be positive',
    );
  });

  it('should throw error for negative length', () => {
    expect(() => divider({ length: -1 })).toThrow(
      'Divider length must be positive',
    );
  });

  it('should throw error for zero length', () => {
    expect(() => divider({ length: 0 })).toThrow(
      'Divider length must be positive',
    );
  });

  it('should create immutable nodes', () => {
    const node = divider({ thickness: 2 });

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
  });

  it('should handle all style options', () => {
    const styles: Array<'solid' | 'dashed' | 'dotted'> = [
      'solid',
      'dashed',
      'dotted',
    ];

    styles.forEach((style) => {
      const node = divider({ style });
      expect(node.props.style).toBe(style);
    });
  });

  it('should handle both orientations', () => {
    const horizontal = divider({ orientation: 'horizontal' });
    const vertical = divider({ orientation: 'vertical' });

    expect(horizontal.props.orientation).toBe('horizontal');
    expect(vertical.props.orientation).toBe('vertical');
  });
});

describe('horizontalDivider()', () => {
  it('should create horizontal divider', () => {
    const node = horizontalDivider();

    expect(node.type).toBe('divider');
    expect(node.props.orientation).toBe('horizontal');
  });

  it('should create horizontal divider with options', () => {
    const node = horizontalDivider({
      thickness: 2,
      color: '#000000',
    });

    expect(node.props.orientation).toBe('horizontal');
    expect(node.props.thickness).toBe(2);
    expect(node.props.color).toBe('#000000');
  });

  it('should be immutable', () => {
    const node = horizontalDivider();

    expect(Object.isFrozen(node)).toBe(true);
  });
});

describe('verticalDivider()', () => {
  it('should create vertical divider', () => {
    const node = verticalDivider();

    expect(node.type).toBe('divider');
    expect(node.props.orientation).toBe('vertical');
  });

  it('should create vertical divider with options', () => {
    const node = verticalDivider({
      thickness: 3,
      length: 50,
      style: 'dotted',
    });

    expect(node.props.orientation).toBe('vertical');
    expect(node.props.thickness).toBe(3);
    expect(node.props.length).toBe(50);
    expect(node.props.style).toBe('dotted');
  });

  it('should be immutable', () => {
    const node = verticalDivider();

    expect(Object.isFrozen(node)).toBe(true);
  });
});
