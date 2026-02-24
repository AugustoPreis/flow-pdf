import { Pipeline } from '@/pipeline';
import type { PipelineConfig } from '@/pipeline';
import type { Node, Dimensions } from '@/core';
import type { FontMetrics } from '@/layout';

/**
 * PDF generation configuration options
 */
export interface PdfConfig {
  /**
   * Page size in points
   *
   * Common sizes:
   * - Letter: { width: 612, height: 792 }
   * - A4: { width: 595, height: 842 }
   * - Legal: { width: 612, height: 1008 }
   *
   * Default: Letter (612x792)
   */
  readonly pageSize?: Dimensions;

  /**
   * Default font size in points (default: 12)
   */
  readonly defaultFontSize?: number;

  /**
   * Custom font metrics provider for text measurement
   */
  readonly fontMetrics?: FontMetrics;

  /**
   * Enable debug layout visualization (default: false)
   *
   * When enabled, draws gray outlines around all layout boxes
   * to help visualize the document structure.
   */
  readonly debugLayout?: boolean;
}

/**
 * Generate a PDF document from a declarative node structure
 *
 * This is the main entry point for the Flow-PDF library. It takes a document
 * structure created using DSL functions (like `vStack`, `text`, `box`, etc.)
 * and generates a PDF buffer.
 */
export async function pdf(root: Node, config?: PdfConfig): Promise<Buffer> {
  // Convert PdfConfig to PipelineConfig
  const pipelineConfig: PipelineConfig = config
    ? {
        pageSize: config.pageSize,
        defaultFontSize: config.defaultFontSize,
        fontMetrics: config.fontMetrics,
        debugLayout: config.debugLayout,
      }
    : {};

  // Create pipeline and generate PDF
  const pipeline = new Pipeline(pipelineConfig);
  return pipeline.generate(root);
}
