import type { LayoutNode, LayoutTree } from '@/core';
import { TextCommand, RectCommand, LineCommand } from './commands';
import type { RenderCommand } from './commands';
import type { RenderBackend } from './abstract';

/**
 * Renderer configuration options
 */
export interface RendererOptions {
  /**
   * Whether to draw debug outlines around layout boxes
   */
  debugLayout?: boolean;

  /**
   * Default page options
   */
  pageOptions?: {
    width?: number;
    height?: number;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
}

/**
 * Renderer - converts LayoutTree to render commands
 *
 * The renderer walks the layout tree and generates render commands
 * for each node based on its type and properties. Commands are then
 * executed against the provided backend.
 */
export class Renderer {
  public constructor(private readonly options: RendererOptions = {}) {}

  /**
   * Render a layout tree to the specified backend
   */
  public async render(
    layoutTree: LayoutTree,
    backend: RenderBackend,
  ): Promise<Buffer> {
    // Create initial page
    backend.createPage(this.options.pageOptions);

    // Generate and execute commands from the root node
    const commands = this.generateCommands(layoutTree.root);
    this.executeCommands(commands, backend);

    // Finalize and return the result
    return backend.finalize();
  }

  /**
   * Generate render commands from a layout tree
   */
  public generateCommands(layoutNode: LayoutNode): RenderCommand[] {
    const commands: RenderCommand[] = [];

    // Draw debug outline if enabled
    if (this.options.debugLayout) {
      commands.push(
        new RectCommand(
          layoutNode.box.x,
          layoutNode.box.y,
          layoutNode.box.width,
          layoutNode.box.height,
          { strokeColor: '#cccccc', strokeWidth: 0.5 },
        ),
      );
    }

    // Generate commands based on node type
    const nodeType = layoutNode.node.type;
    switch (nodeType) {
      case 'text':
        commands.push(...this.renderText(layoutNode));
        break;

      case 'box':
        commands.push(...this.renderBox(layoutNode));
        break;

      case 'divider':
        commands.push(...this.renderDivider(layoutNode));
        break;

      case 'vStack':
      case 'hStack':
        commands.push(...this.renderStack(layoutNode));
        break;

      case 'spacer':
        // Spacers don't render anything
        break;

      default:
        console.warn(`Unknown node type: ${nodeType}`);
    }

    return commands;
  }

  /**
   * Execute commands against the backend
   */
  private executeCommands(
    commands: RenderCommand[],
    backend: RenderBackend,
  ): void {
    for (const command of commands) {
      command.execute(backend);
    }
  }

  /**
   * Render a text node
   */
  private renderText(layoutNode: LayoutNode): RenderCommand[] {
    const { node, box } = layoutNode;
    const props = node.props as {
      content?: string;
      style?: {
        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        fontStyle?: 'normal' | 'italic';
        color?: string;
      };
    };

    if (!props.content) {
      return [];
    }

    return [
      new TextCommand(props.content, box.x, box.y, {
        fontSize: props.style?.fontSize,
        fontWeight: props.style?.fontWeight,
        fontStyle: props.style?.fontStyle,
        color: props.style?.color,
      }),
    ];
  }

  /**
   * Render a box node (with background and border)
   */
  private renderBox(layoutNode: LayoutNode): RenderCommand[] {
    const commands: RenderCommand[] = [];
    const { box, node } = layoutNode;
    const props = node.props as {
      backgroundColor?: string;
      border?: {
        width?: number;
        color?: string;
        radius?: number;
      };
    };

    // Draw background or border if specified
    if (props.backgroundColor || props.border) {
      commands.push(
        new RectCommand(box.x, box.y, box.width, box.height, {
          fillColor: props.backgroundColor,
          strokeColor: props.border?.color,
          strokeWidth: props.border?.width,
          borderRadius: props.border?.radius,
        }),
      );
    }

    // Render children
    if (layoutNode.children) {
      for (const child of layoutNode.children) {
        commands.push(...this.generateCommands(child));
      }
    }

    return commands;
  }

  /**
   * Render a divider node
   */
  private renderDivider(layoutNode: LayoutNode): RenderCommand[] {
    const { box, node } = layoutNode;
    const props = node.props as {
      orientation?: 'horizontal' | 'vertical';
      thickness?: number;
      color?: string;
      style?: 'solid' | 'dashed' | 'dotted';
    };

    const orientation = props.orientation ?? 'horizontal';
    const thickness = props.thickness ?? 1;
    const color = props.color ?? '#000000';

    // Calculate line endpoints based on orientation
    const x1 = box.x;
    const y1 = box.y;
    const x2 = orientation === 'horizontal' ? box.x + box.width : box.x;
    const y2 = orientation === 'vertical' ? box.y + box.height : box.y;

    // Convert style to dash pattern
    let dashPattern: number[] | undefined;
    if (props.style === 'dashed') {
      dashPattern = [5, 3];
    } else if (props.style === 'dotted') {
      dashPattern = [1, 2];
    }

    return [
      new LineCommand(x1, y1, x2, y2, {
        width: thickness,
        color,
        dashPattern,
      }),
    ];
  }

  /**
   * Render a stack node (vStack or hStack)
   */
  private renderStack(layoutNode: LayoutNode): RenderCommand[] {
    const commands: RenderCommand[] = [];

    // Stacks just render their children
    if (layoutNode.children) {
      for (const child of layoutNode.children) {
        commands.push(...this.generateCommands(child));
      }
    }

    return commands;
  }
}
