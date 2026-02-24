import type {
  Node,
  TextNode,
  VStackNode,
  HStackNode,
  BoxNode,
  DividerNode,
  SpacerNode,
} from '../types';

const elements = ['text', 'vStack', 'hStack', 'divider', 'spacer', 'box'];

/**
 * Generate a unique node ID
 */
let nodeIdCounter = 0; // Counter for generating unique node IDs
export function generateNodeId(): string {
  return `node_${++nodeIdCounter}`;
}

/**
 * Reset the node ID counter (useful for testing)
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

/**
 * Deep freeze an object to make it immutable
 */
export function deepFreeze<T>(obj: T): T {
  const propertyNames = Object.getOwnPropertyNames(obj);

  propertyNames.forEach((prop) => {
    const value = (obj as Record<string, unknown>)[prop];

    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  return Object.freeze(obj);
}

/**
 * Clone a node with new properties
 * This is useful for transformations while maintaining immutability
 */
export function cloneNode<T extends Node>(node: T, overrides?: Partial<T>): T {
  const cloned = {
    ...node,
    ...overrides,
  } as T;

  return deepFreeze(cloned);
}

/**
 * Add an ID to a node if it doesn't have one
 */
export function ensureNodeId<T extends Node>(node: T): T {
  if (node.props.id) {
    return node;
  }

  return cloneNode(node, {
    props: {
      ...node.props,
      id: generateNodeId(),
    },
  } as Partial<T>);
}

/**
 * Check if an object is a valid node
 */
export function isNode(value: unknown): value is Node {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const node = value as Record<string, unknown>;

  return typeof node.type === 'string' && typeof node.props === 'object';
}

/**
 * Validate node structure
 * Throws if node is invalid
 */
export function validateNode(node: unknown): asserts node is Node {
  if (!isNode(node)) {
    throw new Error('Invalid node structure');
  }

  if (!elements.includes(node.type)) {
    throw new Error(`Unknown node type: ${node.type}`);
  }

  if (node.type === 'text') {
    return validateTextNode(node as TextNode);
  }

  if (node.type === 'divider') {
    return validateDividerNode(node as DividerNode);
  }

  if (node.type === 'spacer') {
    return validateSpacerNode(node as SpacerNode);
  }

  if (node.type === 'vStack' || node.type === 'hStack' || node.type === 'box') {
    return validateStackNode(node as VStackNode | HStackNode | BoxNode);
  }
}

/**
 * Validate text node structure
 * Throws if text node is invalid
 */
export function validateTextNode(node: TextNode): void {
  const { content } = node.props;

  if (typeof content !== 'string') {
    throw new Error('Text node must have string content');
  }

  if (content.length === 0) {
    throw new Error('Text node content cannot be empty');
  }
}

/**
 * Validate divider node structure
 * Throws if divider node is invalid
 */
export function validateDividerNode(node: DividerNode): void {
  const { thickness, length } = node.props;

  if (thickness !== undefined && thickness <= 0) {
    throw new Error('Divider thickness must be positive');
  }

  if (length !== undefined && length <= 0) {
    throw new Error('Divider length must be positive');
  }
}

/**
 * Validate spacer node structure
 * Throws if spacer node is invalid
 */
export function validateSpacerNode(node: SpacerNode): void {
  const { width, height, flex } = node.props;

  if (width !== undefined && width < 0) {
    throw new Error('Spacer width must be non-negative');
  }

  if (height !== undefined && height < 0) {
    throw new Error('Spacer height must be non - negative');
  }

  if (flex !== undefined && flex < 0) {
    throw new Error('Spacer flex must be non-negative');
  }
}

/**
 * Validate stack node structure (vStack, hStack, box)
 * Throws if stack node is invalid
 */
export function validateStackNode(
  node: VStackNode | HStackNode | BoxNode,
): void {
  if (!Array.isArray(node.children)) {
    throw new Error('Container node must have children array');
  }

  // Recursively validate children
  node.children.forEach((child, index) => {
    try {
      validateNode(child);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `Invalid child at index ${index} in ${node.type}: ${message}`,
        { cause: error },
      );
    }
  });
}
