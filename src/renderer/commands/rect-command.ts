import { BaseRenderCommand } from './base-command';
import type { RenderBackend, RectStyle } from '../abstract/render-backend';

/**
 * Command to draw a rectangle
 * Useful for backgrounds, borders, and debugging layout boxes
 */
export class RectCommand extends BaseRenderCommand {
  public readonly type = 'rect';

  public constructor(
    private readonly x: number,
    private readonly y: number,
    private readonly width: number,
    private readonly height: number,
    private readonly style?: RectStyle,
  ) {
    super();
  }

  public execute(backend: RenderBackend): void {
    backend.drawRect(this.x, this.y, this.width, this.height, this.style);
  }

  // Getters for inspection/testing
  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getStyle(): RectStyle | undefined {
    return this.style;
  }
}
