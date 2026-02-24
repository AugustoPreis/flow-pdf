import { BaseRenderCommand } from './base-command';
import type { RenderBackend, TextStyle } from '../abstract/render-backend';

/**
 * Command to draw text at a specific position
 */
export class TextCommand extends BaseRenderCommand {
  public readonly type = 'text';

  public constructor(
    private readonly text: string,
    private readonly x: number,
    private readonly y: number,
    private readonly style?: TextStyle,
  ) {
    super();
  }

  public execute(backend: RenderBackend): void {
    backend.drawText(this.text, this.x, this.y, this.style);
  }

  // Getters for inspection/testing
  public getText(): string {
    return this.text;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getStyle(): TextStyle | undefined {
    return this.style;
  }
}
