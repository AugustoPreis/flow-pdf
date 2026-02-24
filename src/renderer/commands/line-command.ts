import { BaseRenderCommand } from './base-command';
import type { RenderBackend, LineStyle } from '../abstract';

/**
 * Command to draw a line
 * Used for dividers and separators
 */
export class LineCommand extends BaseRenderCommand {
  public readonly type = 'line';

  public constructor(
    private readonly x1: number,
    private readonly y1: number,
    private readonly x2: number,
    private readonly y2: number,
    private readonly style?: LineStyle,
  ) {
    super();
  }

  public execute(backend: RenderBackend): void {
    backend.drawLine(this.x1, this.y1, this.x2, this.y2, this.style);
  }

  // Getters for inspection/testing
  public getX1(): number {
    return this.x1;
  }

  public getY1(): number {
    return this.y1;
  }

  public getX2(): number {
    return this.x2;
  }

  public getY2(): number {
    return this.y2;
  }

  public getStyle(): LineStyle | undefined {
    return this.style;
  }
}
