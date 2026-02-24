/**
 * Flow-PDF - Declarative PDF Generation Library
 *
 * A TypeScript library for generating PDFs using a declarative,
 * functional API inspired by React.
 *
 * NOTE: This module exports only the public API for the library. Internal utilities and types
 * are not exposed here and should be imported from their respective modules within the 'core' directory.
 *
 * @packageDocumentation
 */

export {
  pdf,
  text,
  bold,
  italic,
  fontSize,
  vStack,
  hStack,
  divider,
  horizontalDivider,
  verticalDivider,
  spacer,
  hSpacer,
  vSpacer,
  flexSpacer,
  box,
  coloredBox,
  borderedBox,
  paddedBox,
  type PdfConfig,
  type TextOptions,
  type VStackOptions,
  type HStackOptions,
  type DividerOptions,
  type SpacerOptions,
  type BoxOptions,
} from './dsl';

export {
  isTextNode,
  isVStackNode,
  isHStackNode,
  isContainerNode,
  isDividerNode,
  isSpacerNode,
  isBoxNode,
  type Node,
  type TextNode,
  type VStackNode,
  type HStackNode,
  type DividerNode,
  type SpacerNode,
  type BoxNode,
  type TextStyle,
  type TextProps,
  type StackProps,
  type StackAlign,
  type TextAlign,
  type FontWeight,
  type FontStyle,
  type DividerOrientation,
  type DividerProps,
  type SpacerProps,
  type BoxProps,
  type BorderStyle,
} from './core';

export {
  LayoutEngine,
  createLayoutEngine,
  type LayoutEngineConfig,
  type LayoutCalculator,
  type LayoutContext,
  type FontMetrics,
} from './layout';

export {
  Renderer,
  PDFKitAdapter,
  MockRenderBackend,
  TextCommand,
  RectCommand,
  LineCommand,
  PageCommand,
  type RenderBackend,
  type TextStyle as RenderTextStyle,
  type RectStyle,
  type LineStyle,
  type PageOptions,
  type RenderCommand,
  type RendererOptions,
} from './renderer';

export { Pipeline, createPipeline, type PipelineConfig } from './pipeline';

export {
  FlowPdfError,
  ValidationError,
  LayoutError,
  RenderError,
  ConfigError,
} from './utils/errors';
