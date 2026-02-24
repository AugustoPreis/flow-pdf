import type {
  Node,
  TextNode,
  VStackNode,
  HStackNode,
  DividerNode,
  SpacerNode,
  BoxNode,
} from '../types';
import {
  isTextNode,
  isVStackNode,
  isHStackNode,
  isDividerNode,
  isSpacerNode,
  isBoxNode,
} from '../types';

/**
 * Visitor interface for traversing nodes
 */
export interface NodeVisitor<T = void> {
  visitText?(node: TextNode): T;
  visitVStack?(node: VStackNode): T;
  visitHStack?(node: HStackNode): T;
  visitDivider?(node: DividerNode): T;
  visitSpacer?(node: SpacerNode): T;
  visitBox?(node: BoxNode): T;
}

/**
 * Visit a node using the visitor pattern
 */
export function visit<T>(node: Node, visitor: NodeVisitor<T>): T | undefined {
  if (isTextNode(node) && visitor.visitText) {
    return visitor.visitText(node);
  }

  if (isVStackNode(node) && visitor.visitVStack) {
    return visitor.visitVStack(node);
  }

  if (isHStackNode(node) && visitor.visitHStack) {
    return visitor.visitHStack(node);
  }

  if (isDividerNode(node) && visitor.visitDivider) {
    return visitor.visitDivider(node);
  }

  if (isSpacerNode(node) && visitor.visitSpacer) {
    return visitor.visitSpacer(node);
  }

  if (isBoxNode(node) && visitor.visitBox) {
    return visitor.visitBox(node);
  }

  return undefined;
}

/**
 * Traverse a node tree depth-first
 * Calls the callback for each node
 */
export function traverse(
  node: Node,
  callback: (node: Node, depth: number) => void,
  depth = 0,
): void {
  callback(node, depth);

  if (isVStackNode(node) || isHStackNode(node) || isBoxNode(node)) {
    node.children.forEach((child) => traverse(child, callback, depth + 1));
  }
}

/**
 * Map over a node tree, transforming each node
 * Returns a new tree with transformed nodes
 */
export function mapTree(node: Node, transform: (node: Node) => Node): Node {
  const transformed = transform(node);

  if (isVStackNode(transformed)) {
    return {
      ...transformed,
      children: transformed.children.map((child) => mapTree(child, transform)),
    };
  }

  if (isHStackNode(transformed)) {
    return {
      ...transformed,
      children: transformed.children.map((child) => mapTree(child, transform)),
    };
  }

  if (isBoxNode(transformed)) {
    return {
      ...transformed,
      children: transformed.children.map((child) => mapTree(child, transform)),
    };
  }

  return transformed;
}

/**
 * Filter nodes in a tree based on a predicate
 * Returns array of nodes that match the predicate
 */
export function filterTree(
  node: Node,
  predicate: (node: Node) => boolean,
): Node[] {
  const matches: Node[] = [];

  traverse(node, (n) => {
    if (predicate(n)) {
      matches.push(n);
    }
  });

  return matches;
}

/**
 * Find first node that matches predicate
 */
export function findNode(
  node: Node,
  predicate: (node: Node) => boolean,
): Node | undefined {
  if (predicate(node)) {
    return node;
  }

  if (isVStackNode(node) || isHStackNode(node) || isBoxNode(node)) {
    for (const child of node.children) {
      const found = findNode(child, predicate);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Find node by ID
 */
export function findNodeById(node: Node, id: string): Node | undefined {
  return findNode(node, (n) => n.props.id === id);
}

/**
 * Find node by test ID
 */
export function findNodeByTestId(node: Node, testId: string): Node | undefined {
  return findNode(node, (n) => n.props.testId === testId);
}

/**
 * Count total nodes in tree
 */
export function countNodes(node: Node): number {
  let count = 1; // Current node

  if (isVStackNode(node) || isHStackNode(node) || isBoxNode(node)) {
    count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
  }

  return count;
}

/**
 * Get the depth of the tree
 */
export function getTreeDepth(node: Node): number {
  const count = 1; // Current node

  if (isTextNode(node) || isDividerNode(node) || isSpacerNode(node)) {
    return count;
  }

  if (isVStackNode(node) || isHStackNode(node) || isBoxNode(node)) {
    if (node.children.length === 0) {
      return count;
    }

    return count + Math.max(...node.children.map(getTreeDepth));
  }

  return count;
}

/**
 * Get all text content from a tree
 */
export function getTextContent(node: Node): string {
  if (isTextNode(node)) {
    return node.props.content;
  }

  if (isVStackNode(node) || isHStackNode(node) || isBoxNode(node)) {
    return node.children.map(getTextContent).join(' ');
  }

  return '';
}
