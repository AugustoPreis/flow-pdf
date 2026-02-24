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
} from './dsl';

export type {
  TextOptions,
  VStackOptions,
  HStackOptions,
  DividerOptions,
  SpacerOptions,
  BoxOptions,
} from './dsl';

export type {
  Node,
  TextNode,
  VStackNode,
  HStackNode,
  DividerNode,
  SpacerNode,
  BoxNode,
  TextStyle,
  TextProps,
  StackProps,
  StackAlign,
  TextAlign,
  FontWeight,
  FontStyle,
  DividerOrientation,
  DividerProps,
  SpacerProps,
  BoxProps,
  BorderStyle,
} from './core';

export {
  isTextNode,
  isVStackNode,
  isHStackNode,
  isContainerNode,
  isDividerNode,
  isSpacerNode,
  isBoxNode,
} from './core/types';

export { LayoutEngine, createLayoutEngine } from './layout';

export type {
  LayoutEngineConfig,
  LayoutCalculator,
  LayoutContext,
  FontMetrics,
} from './layout';

export {
  Renderer,
  PDFKitAdapter,
  MockRenderBackend,
  TextCommand,
  RectCommand,
  LineCommand,
  PageCommand,
} from './renderer';

export type {
  RenderBackend,
  TextStyle as RenderTextStyle,
  RectStyle,
  LineStyle,
  PageOptions,
  RenderCommand,
  RendererOptions,
} from './renderer';
