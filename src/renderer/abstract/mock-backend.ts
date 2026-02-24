import type {
  RenderBackend,
  TextStyle,
  RectStyle,
  LineStyle,
  PageOptions,
} from './render-backend';

/**
 * Call record for tracking method calls
 */
export interface CallRecord {
  method: string;
  args: unknown[];
}

/**
 * Mock render backend for testing
 * Records all method calls for inspection
 */
export class MockRenderBackend implements RenderBackend {
  private calls: CallRecord[] = [];

  public createPage(options?: PageOptions): this {
    this.calls.push({ method: 'createPage', args: [options] });
    return this;
  }

  public drawText(text: string, x: number, y: number, style?: TextStyle): this {
    this.calls.push({ method: 'drawText', args: [text, x, y, style] });
    return this;
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    style?: RectStyle,
  ): this {
    this.calls.push({ method: 'drawRect', args: [x, y, width, height, style] });
    return this;
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style?: LineStyle,
  ): this {
    this.calls.push({ method: 'drawLine', args: [x1, y1, x2, y2, style] });
    return this;
  }

  public finalize(): Buffer {
    this.calls.push({ method: 'finalize', args: [] });
    return Buffer.from('mock-pdf-content');
  }

  // Testing utilities
  public getCalls(): CallRecord[] {
    return [...this.calls];
  }

  public getCallCount(): number {
    return this.calls.length;
  }

  public getLastCall(): CallRecord | undefined {
    return this.calls[this.calls.length - 1];
  }

  public getCallsByMethod(method: string): CallRecord[] {
    return this.calls.filter((call) => call.method === method);
  }

  public reset(): void {
    this.calls = [];
  }
}
