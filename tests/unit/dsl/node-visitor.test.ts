import { describe, it, expect } from '@jest/globals';
import { text, vStack, hStack } from '@/dsl';
import {
  visit,
  traverse,
  mapTree,
  filterTree,
  findNode,
  findNodeById,
  findNodeByTestId,
  countNodes,
  getTreeDepth,
  getTextContent,
  Node,
  VStackNode,
  TextProps,
  HStackNode,
  TextNode,
} from '@/core';

describe('visit()', () => {
  it('should visit text nodes', () => {
    const node = text('Hello');
    let visited = false;

    visit(node, {
      visitText: (n) => {
        visited = true;
        expect(n.props.content).toBe('Hello');
      },
    });

    expect(visited).toBe(true);
  });

  it('should visit vStack nodes', () => {
    const node = vStack({}, text('Child'));
    let visited = false;

    visit(node, {
      visitVStack: (n) => {
        visited = true;
        expect(n.children).toHaveLength(1);
      },
    });

    expect(visited).toBe(true);
  });

  it('should visit hStack nodes', () => {
    const node = hStack({}, text('Child'));
    let visited = false;

    visit(node, {
      visitHStack: (n) => {
        visited = true;
        expect(n.children).toHaveLength(1);
      },
    });

    expect(visited).toBe(true);
  });

  it('should return visitor result', () => {
    const node = text('Hello');

    const result = visit(node, {
      visitText: (n) => n.props.content.toUpperCase(),
    });

    expect(result).toBe('HELLO');
  });

  it('should return undefined if visitor method not defined', () => {
    const node = text('Hello');

    const result = visit(node, {
      visitVStack: () => 'should not be called',
    });

    expect(result).toBeUndefined();
  });
});

describe('traverse()', () => {
  it('should traverse all nodes in a tree', () => {
    const tree = vStack({}, text('First'), text('Second'), text('Third'));

    const visited: Node[] = [];
    traverse(tree, (node) => visited.push(node));

    expect(visited).toHaveLength(4); // 1 vStack + 3 text
    expect(visited[0]?.type).toBe('vStack');
    expect(visited[1]?.type).toBe('text');
    expect(visited[2]?.type).toBe('text');
    expect(visited[3]?.type).toBe('text');
  });

  it('should provide correct depth', () => {
    const tree = vStack({}, text('Level 1'), vStack({}, text('Level 2')));

    const depths: number[] = [];
    traverse(tree, (_, depth) => depths.push(depth));

    expect(depths).toEqual([0, 1, 1, 2]);
  });

  it('should traverse deeply nested structures', () => {
    const tree = vStack({}, hStack({}, vStack({}, text('Deep'))));

    const types: string[] = [];
    traverse(tree, (node) => types.push(node.type));

    expect(types).toEqual(['vStack', 'hStack', 'vStack', 'text']);
  });

  it('should handle empty stacks', () => {
    const tree = vStack({});

    let count = 0;
    traverse(tree, () => count++);

    expect(count).toBe(1);
  });
});

describe('mapTree()', () => {
  it('should transform all text nodes', () => {
    const tree = vStack({}, text('hello'), text('world'));

    const stack = mapTree(tree, (node) => {
      if (node.type === 'text') {
        return {
          ...node,
          props: {
            ...node.props,
            content: node.props.content.toUpperCase(),
          },
        };
      }
      return node;
    }) as VStackNode;

    expect((stack?.children?.[0]?.props as TextProps)?.content).toBe('HELLO');
    expect((stack?.children?.[1]?.props as TextProps)?.content).toBe('WORLD');
  });

  it('should preserve tree structure', () => {
    const tree = vStack({}, text('First'), hStack({}, text('Nested')));

    const stack = mapTree(tree, (node) => node) as VStackNode;

    expect(stack.type).toBe('vStack');
    expect(stack.children).toHaveLength(2);
    expect(stack.children?.[1]?.type).toBe('hStack');
  });

  it('should transform nested nodes', () => {
    const tree = vStack({}, hStack({}, text('a'), text('b')), text('c'));

    const stack = mapTree(tree, (node) => {
      if (node.type === 'text') {
        return {
          ...node,
          props: {
            ...node.props,
            content: node.props.content.repeat(2),
          },
        };
      }
      return node;
    }) as VStackNode;

    const hStackNode = stack.children[0] as HStackNode;

    expect((hStackNode?.children?.[0]?.props as TextProps)?.content).toBe('aa');
    expect((hStackNode?.children?.[1]?.props as TextProps)?.content).toBe('bb');
    expect((stack?.children?.[1]?.props as TextProps)?.content).toBe('cc');
  });
});

describe('filterTree()', () => {
  it('should filter text nodes', () => {
    const tree = vStack({}, text('Keep'), text('Remove'), text('Keep'));

    const filtered = filterTree(tree, (node) => {
      return node.type === 'text' && node.props.content === 'Keep';
    });

    expect(filtered).toHaveLength(2);
    expect(filtered?.[0]?.type).toBe('text');
    expect((filtered[0]?.props as TextProps)?.content).toBe('Keep');
  });

  it('should filter by node type', () => {
    const tree = vStack(
      {},
      text('Text'),
      hStack({}, text('Nested')),
      text('More text'),
    );

    const stacks = filterTree(
      tree,
      (node) => node.type === 'vStack' || node.type === 'hStack',
    );

    expect(stacks).toHaveLength(2); // vStack and hStack
  });

  it('should return empty array if no matches', () => {
    const tree = text('Hello');

    const filtered = filterTree(tree, (node) => node.type === 'vStack');

    expect(filtered).toHaveLength(0);
  });
});

describe('findNode()', () => {
  it('should find first matching node', () => {
    const tree = vStack({}, text('First'), text('Target'), text('Last'));

    const found = findNode(
      tree,
      (node) => node.type === 'text' && node.props.content === 'Target',
    );

    expect(found).toBeDefined();
    expect((found as TextNode).props.content).toBe('Target');
  });

  it('should return undefined if not found', () => {
    const tree = vStack({}, text('First'), text('Second'));

    const found = findNode(
      tree,
      (node) =>
        node.type === 'text' && (node as TextNode).props.content === 'NotHere',
    );

    expect(found).toBeUndefined();
  });

  it('should find nested nodes', () => {
    const tree = vStack({}, hStack({}, vStack({}, text('Deep'))));

    const found = findNode(
      tree,
      (node) => node.type === 'text' && node.props.content === 'Deep',
    );

    expect(found).toBeDefined();
    expect((found as TextNode).props.content).toBe('Deep');
  });

  it('should return first match in depth-first order', () => {
    const tree = vStack({}, text('First'), vStack({}, text('First')));

    let callCount = 0;
    const found = findNode(tree, (node) => {
      if (node.type === 'text' && node.props.content === 'First') {
        callCount++;
        return true;
      }
      return false;
    });

    expect(found).toBeDefined();
    // Should stop after first match
    expect(callCount).toBe(1);
  });
});

describe('findNodeById()', () => {
  it('should find node by ID', () => {
    const tree = vStack(
      {},
      text('First', { id: 'text-1' }),
      text('Second', { id: 'text-2' }),
    );

    const found = findNodeById(tree, 'text-2');

    expect(found).toBeDefined();
    expect((found as TextNode).props.content).toBe('Second');
  });

  it('should return undefined if ID not found', () => {
    const tree = vStack({}, text('First', { id: 'text-1' }));

    const found = findNodeById(tree, 'nonexistent');

    expect(found).toBeUndefined();
  });
});

describe('findNodeByTestId()', () => {
  it('should find node by test ID', () => {
    const tree = vStack(
      {},
      text('First', { testId: 'first-text' }),
      text('Second', { testId: 'second-text' }),
    );

    const found = findNodeByTestId(tree, 'second-text');

    expect(found).toBeDefined();
    expect((found as TextNode).props.content).toBe('Second');
  });

  it('should return undefined if test ID not found', () => {
    const tree = text('Hello', { testId: 'hello' });

    const found = findNodeByTestId(tree, 'goodbye');

    expect(found).toBeUndefined();
  });
});

describe('countNodes()', () => {
  it('should count single node', () => {
    const node = text('Hello');
    expect(countNodes(node)).toBe(1);
  });

  it('should count stack with children', () => {
    const tree = vStack({}, text('First'), text('Second'), text('Third'));

    expect(countNodes(tree)).toBe(4); // 1 vStack + 3 text
  });

  it('should count nested structures', () => {
    const tree = vStack(
      {},
      text('Top'),
      hStack({}, text('Left'), text('Right')),
      text('Bottom'),
    );

    expect(countNodes(tree)).toBe(6); // 1 vStack + 1 hStack + 4 text
  });

  it('should count empty stack', () => {
    const tree = vStack({});
    expect(countNodes(tree)).toBe(1);
  });
});

describe('getTreeDepth()', () => {
  it('should return 1 for single node', () => {
    const node = text('Hello');
    expect(getTreeDepth(node)).toBe(1);
  });

  it('should return 2 for stack with children', () => {
    const tree = vStack({}, text('Child'));

    expect(getTreeDepth(tree)).toBe(2);
  });

  it('should return max depth for nested structures', () => {
    const tree = vStack(
      {},
      text('Level 1'),
      vStack({}, text('Level 2'), vStack({}, text('Level 3'))),
    );

    expect(getTreeDepth(tree)).toBe(4);
  });

  it('should return 1 for empty stack', () => {
    const tree = vStack({});
    expect(getTreeDepth(tree)).toBe(1);
  });
});

describe('getTextContent()', () => {
  it('should get content from text node', () => {
    const node = text('Hello World');
    expect(getTextContent(node)).toBe('Hello World');
  });

  it('should concatenate text from children', () => {
    const tree = vStack({}, text('Hello'), text('World'));

    expect(getTextContent(tree)).toBe('Hello World');
  });

  it('should get text from nested structures', () => {
    const tree = vStack(
      {},
      text('One'),
      hStack({}, text('Two'), text('Three')),
      text('Four'),
    );

    expect(getTextContent(tree)).toBe('One Two Three Four');
  });

  it('should return empty string for empty stack', () => {
    const tree = vStack({});
    expect(getTextContent(tree)).toBe('');
  });

  it('should handle deeply nested text', () => {
    const tree = vStack({}, vStack({}, vStack({}, text('Deep'))));

    expect(getTextContent(tree)).toBe('Deep');
  });
});
