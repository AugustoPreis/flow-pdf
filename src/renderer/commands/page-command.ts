import { BaseRenderCommand } from './base-command';
import type { RenderBackend, PageOptions } from '../abstract';

/**
 * Command to create a new page
 */
export class PageCommand extends BaseRenderCommand {
  public readonly type = 'page';

  public constructor(private readonly options?: PageOptions) {
    super();
  }

  public execute(backend: RenderBackend): void {
    backend.createPage(this.options);
  }

  // Getter for inspection/testing
  public getOptions(): PageOptions | undefined {
    return this.options;
  }
}
