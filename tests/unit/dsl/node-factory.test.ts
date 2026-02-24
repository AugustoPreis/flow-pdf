import { describe, it, expect, beforeEach } from '@jest/globals';
import { text, vStack } from '@/dsl';
import {
  generateNodeId,
  resetNodeIdCounter,
  deepFreeze,
  cloneNode,
  ensureNodeId,
  isNode,
  validateNode,
} from '@/core';

describe('generateNodeId()', () => {
  beforeEach(() => {
    resetNodeIdCounter();
  });

  it('should generate unique IDs', () => {
    const id1 = generateNodeId();
    const id2 = generateNodeId();
    const id3 = generateNodeId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate IDs in sequence', () => {
    resetNodeIdCounter();
    expect(generateNodeId()).toBe('node_1');
    expect(generateNodeId()).toBe('node_2');
    expect(generateNodeId()).toBe('node_3');
  });

  it('should reset counter', () => {
    generateNodeId();
    generateNodeId();
    resetNodeIdCounter();

    expect(generateNodeId()).toBe('node_1');
  });
});

describe('deepFreeze()', () => {
  it('should freeze simple objects', () => {
    const obj = { a: 1, b: 2 };
    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it('should freeze nested objects', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };

    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.b)).toBe(true);
    expect(Object.isFrozen(frozen.b.d)).toBe(true);
  });

  it('should freeze arrays', () => {
    const obj = {
      items: [1, 2, 3],
    };

    const frozen = deepFreeze(obj);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.items)).toBe(true);
  });

  it('should handle already frozen objects', () => {
    const obj = Object.freeze({ a: 1 });

    expect(() => deepFreeze(obj)).not.toThrow();
    expect(Object.isFrozen(obj)).toBe(true);
  });
});

describe('cloneNode()', () => {
  it('should clone a text node', () => {
    const original = text('Hello');
    const cloned = cloneNode(original);

    expect(cloned).not.toBe(original);
    expect(cloned.type).toBe(original.type);
    expect(cloned.props.content).toBe(original.props.content);
  });

  it('should clone with overrides', () => {
    const original = text('Hello');
    const cloned = cloneNode(original, {
      props: {
        ...original.props,
        content: 'World',
      },
    });

    expect(cloned.props.content).toBe('World');
    expect(original.props.content).toBe('Hello');
  });

  it('should return frozen clone', () => {
    const original = text('Hello');
    const cloned = cloneNode(original);

    expect(Object.isFrozen(cloned)).toBe(true);
  });

  it('should clone stack nodes', () => {
    const original = vStack({ spacing: 10 }, text('First'), text('Second'));

    const cloned = cloneNode(original, {
      props: {
        ...original.props,
        spacing: 20,
      },
    });

    expect(cloned.props.spacing).toBe(20);
    expect(original.props.spacing).toBe(10);
  });
});

describe('ensureNodeId()', () => {
  beforeEach(() => {
    resetNodeIdCounter();
  });

  it('should add ID to node without one', () => {
    const node = text('Hello');
    const withId = ensureNodeId(node);

    expect(withId.props.id).toBeDefined();
    expect(withId.props.id).toBe('node_1');
  });

  it('should preserve existing ID', () => {
    const node = text('Hello', { id: 'custom_id' });
    const withId = ensureNodeId(node);

    expect(withId.props.id).toBe('custom_id');
  });

  it('should return same node if ID exists', () => {
    const node = text('Hello', { id: 'existing' });
    const withId = ensureNodeId(node);

    expect(withId).toBe(node);
  });
});

describe('isNode()', () => {
  it('should return true for valid text nodes', () => {
    const node = text('Hello');
    expect(isNode(node)).toBe(true);
  });

  it('should return true for valid stack nodes', () => {
    const node = vStack({}, text('Hello'));
    expect(isNode(node)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isNode(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNode(undefined)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isNode('string')).toBe(false);
    expect(isNode(123)).toBe(false);
    expect(isNode(true)).toBe(false);
  });

  it('should return false for objects without required properties', () => {
    expect(isNode({ wrong: 'structure' })).toBe(false);
    expect(isNode({ type: 'text' })).toBe(false); // Missing props
    expect(isNode({ props: {} })).toBe(false); // Missing type
  });
});

describe('validateNode()', () => {
  it('should validate text nodes without errors', () => {
    const node = text('Hello');
    expect(() => validateNode(node)).not.toThrow();
  });

  it('should validate stack nodes without errors', () => {
    const node = vStack({ spacing: 10 }, text('First'), text('Second'));

    expect(() => validateNode(node)).not.toThrow();
  });

  it('should throw for invalid node structure', () => {
    expect(() => validateNode(null as unknown)).toThrow(
      'Invalid node structure',
    );
    expect(() => validateNode({ wrong: 'structure' } as unknown)).toThrow(
      'Invalid node structure',
    );
  });

  it('should throw for unknown node type', () => {
    const invalidNode = {
      type: 'unknown',
      props: {},
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      'Unknown node type: unknown',
    );
  });

  it('should throw for text node without content', () => {
    const invalidNode = {
      type: 'text',
      props: {},
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      'Text node must have string content',
    );
  });

  it('should throw for text node with non-string content', () => {
    const invalidNode = {
      type: 'text',
      props: { content: 123 },
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      'Text node must have string content',
    );
  });

  it('should throw for text node with empty content', () => {
    const invalidNode = {
      type: 'text',
      props: { content: '' },
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      'Text node content cannot be empty',
    );
  });

  it('should throw for stack node without children', () => {
    const invalidNode = {
      type: 'vStack',
      props: {},
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      'Container node must have children array',
    );
  });

  it('should throw for stack node with invalid children', () => {
    const invalidNode = {
      type: 'vStack',
      props: {},
      children: [text('Valid'), { invalid: 'child' }],
    };

    expect(() => validateNode(invalidNode as unknown)).toThrow(
      /Invalid child at index 1/,
    );
  });

  it('should validate nested structures', () => {
    const node = vStack(
      {},
      text('Top'),
      vStack({}, text('Nested 1'), text('Nested 2')),
      text('Bottom'),
    );

    expect(() => validateNode(node)).not.toThrow();
  });

  it('should catch deeply nested invalid nodes', () => {
    const invalidNested = {
      type: 'vStack',
      props: {},
      children: [
        text('Valid'),
        {
          type: 'vStack',
          props: {},
          children: [text('Valid'), { invalid: 'deeply nested' }],
        },
      ],
    };

    expect(() => validateNode(invalidNested as unknown)).toThrow(
      /Invalid child.*vStack/,
    );
  });
});
