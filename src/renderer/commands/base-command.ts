import type { RenderBackend } from '../abstract';

/**
 * Base interface for render commands
 *
 * Render commands encapsulate drawing operations that can be executed
 * against any RenderBackend implementation. This follows the Command Pattern,
 * allowing commands to be:
 * - Inspected and logged
 * - Batched and optimized
 * - Tested independently
 * - Executed on different backends
 */
export interface RenderCommand {
  /**
   * Execute this command against a render backend
   */
  execute(backend: RenderBackend): void;

  /**
   * Optional: command type identifier for debugging/inspection
   */
  readonly type: string;
}

/**
 * Abstract base class for render commands
 * Provides type property and enforces execute implementation
 */
export abstract class BaseRenderCommand implements RenderCommand {
  public abstract readonly type: string;

  public abstract execute(backend: RenderBackend): void;
}
