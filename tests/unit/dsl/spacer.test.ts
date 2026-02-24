import { describe, it, expect } from '@jest/globals';
import { spacer, hSpacer, vSpacer, flexSpacer } from '@/dsl';

describe('spacer()', () => {
  it('should create a simple spacer', () => {
    const node = spacer();

    expect(node).toBeDefined();
    expect(node.type).toBe('spacer');
    expect(node.props).toBeDefined();
  });

  it('should create spacer with width', () => {
    const node = spacer({ width: 20 });

    expect(node.props.width).toBe(20);
  });

  it('should create spacer with height', () => {
    const node = spacer({ height: 30 });

    expect(node.props.height).toBe(30);
  });

  it('should create spacer with width and height', () => {
    const node = spacer({ width: 20, height: 10 });

    expect(node.props.width).toBe(20);
    expect(node.props.height).toBe(10);
  });

  it('should create spacer with flex', () => {
    const node = spacer({ flex: 1 });

    expect(node.props.flex).toBe(1);
  });

  it('should create spacer with all options', () => {
    const node = spacer({ width: 15, height: 25, flex: 2 });

    expect(node.props.width).toBe(15);
    expect(node.props.height).toBe(25);
    expect(node.props.flex).toBe(2);
  });

  it('should allow zero width', () => {
    const node = spacer({ width: 0 });

    expect(node.props.width).toBe(0);
  });

  it('should allow zero height', () => {
    const node = spacer({ height: 0 });

    expect(node.props.height).toBe(0);
  });

  it('should allow zero flex', () => {
    const node = spacer({ flex: 0 });

    expect(node.props.flex).toBe(0);
  });

  it('should throw error for negative width', () => {
    expect(() => spacer({ width: -1 })).toThrow(
      'Spacer width must be non-negative',
    );
  });

  it('should throw error for negative height', () => {
    expect(() => spacer({ height: -1 })).toThrow(
      'Spacer height must be non-negative',
    );
  });

  it('should throw error for negative flex', () => {
    expect(() => spacer({ flex: -1 })).toThrow(
      'Spacer flex must be non-negative',
    );
  });

  it('should create immutable nodes', () => {
    const node = spacer({ width: 10 });

    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node.props)).toBe(true);
  });
});

describe('hSpacer()', () => {
  it('should create horizontal spacer', () => {
    const node = hSpacer(20);

    expect(node.type).toBe('spacer');
    expect(node.props.width).toBe(20);
  });

  it('should create horizontal spacer with zero width', () => {
    const node = hSpacer(0);

    expect(node.props.width).toBe(0);
  });

  it('should be immutable', () => {
    const node = hSpacer(15);

    expect(Object.isFrozen(node)).toBe(true);
  });

  it('should throw error for negative width', () => {
    expect(() => hSpacer(-5)).toThrow('Spacer width must be non-negative');
  });
});

describe('vSpacer()', () => {
  it('should create vertical spacer', () => {
    const node = vSpacer(30);

    expect(node.type).toBe('spacer');
    expect(node.props.height).toBe(30);
  });

  it('should create vertical spacer with zero height', () => {
    const node = vSpacer(0);

    expect(node.props.height).toBe(0);
  });

  it('should be immutable', () => {
    const node = vSpacer(25);

    expect(Object.isFrozen(node)).toBe(true);
  });

  it('should throw error for negative height', () => {
    expect(() => vSpacer(-10)).toThrow('Spacer height must be non-negative');
  });
});

describe('flexSpacer()', () => {
  it('should create flexible spacer with default flex', () => {
    const node = flexSpacer();

    expect(node.type).toBe('spacer');
    expect(node.props.flex).toBe(1);
  });

  it('should create flexible spacer with custom flex', () => {
    const node = flexSpacer(3);

    expect(node.props.flex).toBe(3);
  });

  it('should create flexible spacer with zero flex', () => {
    const node = flexSpacer(0);

    expect(node.props.flex).toBe(0);
  });

  it('should be immutable', () => {
    const node = flexSpacer(2);

    expect(Object.isFrozen(node)).toBe(true);
  });

  it('should throw error for negative flex', () => {
    expect(() => flexSpacer(-1)).toThrow('Spacer flex must be non-negative');
  });
});

describe('spacer integration', () => {
  it('should create spacer with only width', () => {
    const node = spacer({ width: 50 });

    expect(node.props.width).toBe(50);
    expect(node.props.height).toBeUndefined();
    expect(node.props.flex).toBeUndefined();
  });

  it('should create spacer with only height', () => {
    const node = spacer({ height: 40 });

    expect(node.props.height).toBe(40);
    expect(node.props.width).toBeUndefined();
    expect(node.props.flex).toBeUndefined();
  });

  it('should create spacer with only flex', () => {
    const node = spacer({ flex: 2 });

    expect(node.props.flex).toBe(2);
    expect(node.props.width).toBeUndefined();
    expect(node.props.height).toBeUndefined();
  });

  it('should handle large dimensions', () => {
    const node = spacer({ width: 1000, height: 2000 });

    expect(node.props.width).toBe(1000);
    expect(node.props.height).toBe(2000);
  });

  it('should handle fractional flex values', () => {
    const node = spacer({ flex: 0.5 });

    expect(node.props.flex).toBe(0.5);
  });
});
