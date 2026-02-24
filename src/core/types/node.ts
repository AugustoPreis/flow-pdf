/**
 * Base properties common to all nodes
 */
export interface BaseNodeProps {
  readonly id?: string;
  readonly testId?: string;
}

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Font style options
 */
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

/**
 * Text styling properties
 */
export interface TextStyle {
  readonly fontSize?: number;
  readonly fontWeight?: FontWeight;
  readonly fontStyle?: FontStyle;
  readonly color?: string;
  readonly align?: TextAlign;
  readonly lineHeight?: number;
}

/**
 * Properties specific to Text nodes
 */
export interface TextProps extends BaseNodeProps {
  readonly content: string;
  readonly style?: TextStyle;
  readonly width?: number;
  readonly height?: number;
}

/**
 * Stack alignment options
 */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * Properties for Stack containers (VStack, HStack)
 */
export interface StackProps extends BaseNodeProps {
  readonly spacing?: number;
  readonly align?: StackAlign;
  readonly width?: number;
  readonly height?: number;
  readonly padding?:
    | number
    | {
        readonly top?: number;
        readonly right?: number;
        readonly bottom?: number;
        readonly left?: number;
      };
}

/**
 * Text node - represents a text element
 */
export interface TextNode {
  readonly type: 'text';
  readonly props: TextProps;
}

/**
 * VStack node - represents a vertical stack container
 */
export interface VStackNode {
  readonly type: 'vStack';
  readonly props: StackProps;
  readonly children: readonly Node[];
}

/**
 * HStack node - represents a horizontal stack container
 */
export interface HStackNode {
  readonly type: 'hStack';
  readonly props: StackProps;
  readonly children: readonly Node[];
}

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Properties for Divider (separator line)
 */
export interface DividerProps extends BaseNodeProps {
  readonly orientation?: DividerOrientation;
  readonly thickness?: number;
  readonly length?: number;
  readonly color?: string;
  readonly style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Divider node - represents a separator line
 */
export interface DividerNode {
  readonly type: 'divider';
  readonly props: DividerProps;
}

/**
 * Properties for Spacer (flexible or fixed space)
 */
export interface SpacerProps extends BaseNodeProps {
  readonly width?: number;
  readonly height?: number;
  readonly flex?: number; // For flexible spacing
}

/**
 * Spacer node - represents empty space
 */
export interface SpacerNode {
  readonly type: 'spacer';
  readonly props: SpacerProps;
}

/**
 * Border style for Box
 */
export interface BorderStyle {
  readonly width?: number;
  readonly color?: string;
  readonly style?: 'solid' | 'dashed' | 'dotted';
  readonly radius?: number;
}

/**
 * Properties for Box (container with background and border)
 */
export interface BoxProps extends BaseNodeProps {
  readonly width?: number;
  readonly height?: number;
  readonly padding?:
    | number
    | {
        readonly top?: number;
        readonly right?: number;
        readonly bottom?: number;
        readonly left?: number;
      };
  readonly backgroundColor?: string;
  readonly border?: BorderStyle;
}

/**
 * Box node - represents a container with styling
 */
export interface BoxNode {
  readonly type: 'box';
  readonly props: BoxProps;
  readonly children: readonly Node[];
}

/**
 * Union type of all node types (discriminated union)
 * This enables TypeScript's type narrowing
 */
export type Node =
  | TextNode
  | VStackNode
  | HStackNode
  | DividerNode
  | SpacerNode
  | BoxNode;

/**
 * Union type of all node type strings
 */
export type NodeType = Node['type'];

/**
 * Utility type to extract props from a specific node type
 */
export type NodeProps<T extends NodeType> = Extract<Node, { type: T }>['props'];

/**
 * Type guard to check if a node is a Text node
 */
export function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

/**
 * Type guard to check if a node is a VStack node
 */
export function isVStackNode(node: Node): node is VStackNode {
  return node.type === 'vStack';
}

/**
 * Type guard to check if a node is an HStack node
 */
export function isHStackNode(node: Node): node is HStackNode {
  return node.type === 'hStack';
}

/**
 * Type guard to check if a node is a container (has children)
 */
export function isContainerNode(
  node: Node,
): node is VStackNode | HStackNode | BoxNode {
  return (
    node.type === 'vStack' || node.type === 'hStack' || node.type === 'box'
  );
}

/**
 * Type guard to check if a node is a Divider node
 */
export function isDividerNode(node: Node): node is DividerNode {
  return node.type === 'divider';
}

/**
 * Type guard to check if a node is a Spacer node
 */
export function isSpacerNode(node: Node): node is SpacerNode {
  return node.type === 'spacer';
}

/**
 * Type guard to check if a node is a Box node
 */
export function isBoxNode(node: Node): node is BoxNode {
  return node.type === 'box';
}
