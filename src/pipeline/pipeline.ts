import { LayoutEngine } from '@/layout';
import { Renderer, PDFKitAdapter } from '@/renderer';
import { ValidationError } from '@/utils/errors';
import type { Node, Dimensions } from '@/core';
import type { LayoutEngineConfig, FontMetrics } from '@/layout';
import type { RenderBackend, RendererOptions } from '@/renderer';

/**
 * Pipeline configuration options
 */
export interface PipelineConfig {
  /**
   * Page size in points (default: Letter - 612x792)
   */
  readonly pageSize?: Dimensions;

  /**
   * Default font size in points (default: 12)
   */
  readonly defaultFontSize?: number;

  /**
   * Custom font metrics provider
   */
  readonly fontMetrics?: FontMetrics;

  /**
   * Enable debug layout visualization (default: false)
   */
  readonly debugLayout?: boolean;

  /**
   * Custom render backend (default: PDFKitAdapter)
   */
  readonly backend?: RenderBackend;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<
  Omit<PipelineConfig, 'fontMetrics' | 'backend'>
> = {
  pageSize: { width: 612, height: 792 }, // Letter size
  defaultFontSize: 12,
  debugLayout: false,
};

/**
 * Pipeline orchestrates the complete document generation flow:
 * DSL → Layout → Render
 */
export class Pipeline {
  private readonly layoutEngine: LayoutEngine;
  private readonly renderer: Renderer;
  private readonly backend: RenderBackend;
  private readonly config: PipelineConfig;

  /**
   * Create a new Pipeline instance
   */
  public constructor(config: PipelineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create layout engine with configuration
    const layoutConfig: LayoutEngineConfig = {
      pageSize: this.config.pageSize,
      defaultFontSize: this.config.defaultFontSize,
      fontMetrics: this.config.fontMetrics,
    };
    this.layoutEngine = new LayoutEngine(layoutConfig);

    // Create renderer with configuration
    const rendererOptions: RendererOptions = {
      debugLayout: this.config.debugLayout,
    };
    this.renderer = new Renderer(rendererOptions);

    // Use provided backend or create default PDFKitAdapter
    this.backend =
      this.config.backend ||
      new PDFKitAdapter({
        size: this.config.pageSize
          ? [this.config.pageSize.width, this.config.pageSize.height]
          : undefined,
      });
  }

  /**
   * Generate PDF from a document node
   */
  public async generate(root: Node): Promise<Buffer> {
    try {
      // Phase 1: Validate input
      this.validateNode(root);

      // Phase 2: Calculate layout
      const layoutTree = this.layoutEngine.layout(root);

      // Phase 3: Render to backend
      const buffer = await this.renderer.render(layoutTree, this.backend);

      return buffer;
    } catch (error) {
      // Wrap and re-throw with context
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new Error(
        `Pipeline generation failed: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * Validate document node structure
   */
  private validateNode(node: Node): void {
    if (!node) {
      throw new ValidationError(
        'Document root node cannot be null or undefined',
      );
    }

    if (!node.type) {
      throw new ValidationError('Node must have a type property');
    }

    // Additional validation can be added here
    // For MVP, basic validation is sufficient
  }

  /**
   * Get the layout engine instance
   */
  public getLayoutEngine(): LayoutEngine {
    return this.layoutEngine;
  }

  /**
   * Get the renderer instance
   */
  public getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Get the render backend instance
   */
  public getBackend(): RenderBackend {
    return this.backend;
  }

  /**
   * Get the pipeline configuration
   */
  public getConfig(): Readonly<PipelineConfig> {
    return this.config;
  }
}

/**
 * Create a new pipeline instance with the given configuration
 */
export function createPipeline(config?: PipelineConfig): Pipeline {
  return new Pipeline(config);
}
