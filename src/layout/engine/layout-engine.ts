import type {
  Node,
  Constraints,
  LayoutBox,
  LayoutNode,
  LayoutTree,
  Dimensions,
} from '@/core';
import {
  DefaultFontMetrics,
  TextCalculator,
  VStackCalculator,
  HStackCalculator,
  DividerCalculator,
  SpacerCalculator,
  BoxCalculator,
} from '../calculators';
import type {
  LayoutCalculator,
  LayoutContext,
  FontMetrics,
} from '../calculators';

/**
 * Layout engine configuration
 */
export interface LayoutEngineConfig {
  readonly pageSize?: Dimensions;
  readonly defaultFontSize?: number;
  readonly fontMetrics?: FontMetrics;
}

/**
 * Default page size (A4 in points: 72 points per inch)
 */
const DEFAULT_PAGE_SIZE: Dimensions = {
  width: 595, // 8.27 inches
  height: 842, // 11.69 inches
};

/**
 * Layout Engine
 * Coordinates layout calculation for the entire document tree
 */
export class LayoutEngine {
  private readonly calculators: Map<string, LayoutCalculator>;
  private readonly config: Required<LayoutEngineConfig>;

  public constructor(config: LayoutEngineConfig = {}) {
    this.config = {
      pageSize: config.pageSize ?? DEFAULT_PAGE_SIZE,
      defaultFontSize: config.defaultFontSize ?? 12,
      fontMetrics: config.fontMetrics ?? new DefaultFontMetrics(),
    };

    // Initialize calculators for each node type
    this.calculators = new Map<string, LayoutCalculator>([
      ['text', new TextCalculator()],
      ['vStack', new VStackCalculator()],
      ['hStack', new HStackCalculator()],
      ['divider', new DividerCalculator()],
      ['spacer', new SpacerCalculator()],
      ['box', new BoxCalculator()],
    ]);
  }

  /**
   * Calculate layout for the entire document tree
   */
  public layout(root: Node, constraints?: Constraints): LayoutTree {
    // Use page size as default constraints
    const layoutConstraints = constraints ?? {
      minWidth: 0,
      maxWidth: this.config.pageSize.width,
      minHeight: 0,
      maxHeight: this.config.pageSize.height,
    };

    // Create layout context
    const context: LayoutContext = {
      fontMetrics: this.config.fontMetrics,
      defaultFontSize: this.config.defaultFontSize,
      layoutChild: (node: Node, childConstraints: Constraints) =>
        this.layoutNode(node, childConstraints, context),
    };

    // Layout root node
    const rootLayoutNode = this.layoutNodeWithChildren(
      root,
      layoutConstraints,
      context,
    );

    return {
      root: rootLayoutNode,
      pageSize: this.config.pageSize,
    };
  }

  /**
   * Layout a single node (internal, used by calculators)
   */
  private layoutNode(
    node: Node,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutBox {
    const calculator = this.calculators.get(node.type);

    if (!calculator) {
      throw new Error(`No calculator registered for node type: ${node.type}`);
    }

    return calculator.calculate(node, constraints, context);
  }

  /**
   * Layout a node and its children, returning a complete LayoutNode
   */
  private layoutNodeWithChildren(
    node: Node,
    constraints: Constraints,
    context: LayoutContext,
  ): LayoutNode {
    // Calculate layout box for this node
    const box = this.layoutNode(node, constraints, context);

    // Layout children if they exist
    let children: LayoutNode[] | undefined;

    if ('children' in node && Array.isArray(node.children)) {
      children = this.layoutChildren(node, node.children, box, context);
    }

    return {
      node,
      box,
      children: children ? Object.freeze(children) : undefined,
    };
  }

  /**
   * Layout all children of a container node
   */
  private layoutChildren(
    parentNode: Node,
    childNodes: readonly Node[],
    parentBox: LayoutBox,
    context: LayoutContext,
  ): LayoutNode[] {
    const layoutNodes: LayoutNode[] = [];
    let currentY = parentBox.y;
    let currentX = parentBox.x;

    // Apply padding if present
    if (parentBox.padding) {
      currentX += parentBox.padding.left;
      currentY += parentBox.padding.top;
    }

    // Determine layout direction from parent node type
    const isHorizontal = parentNode.type === 'hStack';

    let childIndex = 0;
    for (const child of childNodes) {
      // Calculate constraints for child based on remaining space
      const childConstraints: Constraints = {
        minWidth: 0,
        maxWidth: parentBox.width - (currentX - parentBox.x),
        minHeight: 0,
        maxHeight: parentBox.height - (currentY - parentBox.y),
      };

      // Layout child
      const childLayoutNode = this.layoutNodeWithChildren(
        child,
        childConstraints,
        context,
      );

      // Position child
      const positionedBox: LayoutBox = {
        ...childLayoutNode.box,
        x: currentX,
        y: currentY,
      };

      layoutNodes.push({
        ...childLayoutNode,
        box: positionedBox,
      });

      // Update position for next child
      if (isHorizontal) {
        currentX += childLayoutNode.box.width;
        // Add spacing from parent if available
        if (childIndex < childNodes.length - 1) {
          currentX += this.getSpacing(parentNode) ?? 0;
        }
      } else {
        // Vertical layout (default)
        currentY += childLayoutNode.box.height;
        // Add spacing from parent if available
        if (childIndex < childNodes.length - 1) {
          currentY += this.getSpacing(parentNode) ?? 0;
        }
      }

      childIndex++;
    }

    return layoutNodes;
  }

  /**
   * Get spacing from node props if available
   */
  private getSpacing(node: Node): number | undefined {
    if ('props' in node && node.props && typeof node.props === 'object') {
      const props = node.props as Record<string, unknown>;

      return typeof props.spacing === 'number' ? props.spacing : undefined;
    }

    return undefined;
  }

  /**
   * Register a custom calculator for a node type
   */
  public registerCalculator(
    nodeType: string,
    calculator: LayoutCalculator,
  ): void {
    this.calculators.set(nodeType, calculator);
  }
}

/**
 * Create a layout engine with default configuration
 */
export function createLayoutEngine(config?: LayoutEngineConfig): LayoutEngine {
  return new LayoutEngine(config);
}
