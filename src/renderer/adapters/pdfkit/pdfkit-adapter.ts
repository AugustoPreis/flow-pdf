import PDFDocument from 'pdfkit';
import type {
  RenderBackend,
  TextStyle,
  RectStyle,
  LineStyle,
  PageOptions,
} from '../../abstract';

/**
 * PDFKit adapter implementation of RenderBackend
 *
 * This adapter wraps PDFKit's API and translates abstract render commands
 * into PDFKit-specific operations. It handles:
 * - Coordinate system (top-left origin)
 * - Font management
 * - Color conversion
 * - Stream management
 */
export class PDFKitAdapter implements RenderBackend {
  private doc: PDFKit.PDFDocument;
  private chunks: Buffer[] = [];
  private isFirstPage = true;

  public constructor(options?: PDFKit.PDFDocumentOptions) {
    this.doc = new PDFDocument(options);

    // Collect chunks for finalize()
    this.doc.on('data', (chunk) => this.chunks.push(chunk));
  }

  public createPage(options?: PageOptions): this {
    // Don't add a page on first call (PDFKit creates one automatically)
    if (!this.isFirstPage) {
      const pageOptions: PDFKit.PDFDocumentOptions = {};

      if (options?.width && options?.height) {
        pageOptions.size = [options.width, options.height];
      }

      if (options?.margins) {
        pageOptions.margins = {
          top: options.margins.top ?? 0,
          bottom: options.margins.bottom ?? 0,
          left: options.margins.left ?? 0,
          right: options.margins.right ?? 0,
        };
      }

      this.doc.addPage(pageOptions);
    } else {
      this.isFirstPage = false;
    }

    return this;
  }

  public drawText(text: string, x: number, y: number, style?: TextStyle): this {
    // Apply text styling
    if (style?.fontSize) {
      this.doc.fontSize(style.fontSize);
    }

    if (style?.color) {
      this.doc.fillColor(style.color);
    }

    // Handle font weight and style
    const font = this.getFontName(style?.fontWeight, style?.fontStyle);
    if (font) {
      try {
        this.doc.font(font);
      } catch {
        // Fallback to default font if not available
        this.doc.font('Helvetica');
      }
    }

    // Draw text
    this.doc.text(text, x, y, {
      lineBreak: false,
      continued: false,
    });

    return this;
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    style?: RectStyle,
  ): this {
    const { strokeColor, strokeWidth, fillColor, borderRadius } = style ?? {};

    this.doc.save();

    if (strokeColor) this.doc.strokeColor(strokeColor);
    if (strokeWidth) this.doc.lineWidth(strokeWidth);
    if (fillColor) this.doc.fillColor(fillColor);

    // Draw rectangle
    if (borderRadius) {
      this.doc.roundedRect(x, y, width, height, borderRadius);
    } else {
      this.doc.rect(x, y, width, height);
    }

    // Fill or stroke based on what was specified
    if (fillColor && strokeColor) {
      this.doc.fillAndStroke();
    } else if (fillColor) {
      this.doc.fill();
    } else if (strokeColor) {
      this.doc.stroke();
    } else {
      this.doc.stroke(); // Default: just stroke
    }

    this.doc.restore();

    return this;
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style?: LineStyle,
  ): this {
    const { color, width, dashPattern } = style ?? {};

    this.doc.save();

    if (color) this.doc.strokeColor(color);
    if (width) this.doc.lineWidth(width);

    if (dashPattern && dashPattern.length >= 2) {
      const [dash, space] = dashPattern;

      if (dash !== undefined && space !== undefined) {
        this.doc.dash(dash, { space });
      }
    }

    this.doc.moveTo(x1, y1).lineTo(x2, y2).stroke();

    this.doc.restore();

    return this;
  }

  public finalize(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      this.doc.on('end', () => {
        resolve(Buffer.concat(this.chunks));
      });

      this.doc.on('error', reject);

      this.doc.end();
    });
  }

  /**
   * Get the underlying PDFKit document
   * Useful for advanced operations not covered by the interface
   */
  public getDocument(): PDFKit.PDFDocument {
    return this.doc;
  }

  /**
   * Helper to get the appropriate font name based on weight and style
   */
  private getFontName(
    weight?: 'normal' | 'bold',
    style?: 'normal' | 'italic',
  ): string | null {
    const isBold = weight === 'bold';
    const isItalic = style === 'italic';

    // PDFKit built-in fonts
    if (isBold && isItalic) {
      return 'Helvetica-BoldOblique';
    }

    if (isBold) {
      return 'Helvetica-Bold';
    }

    if (isItalic) {
      return 'Helvetica-Oblique';
    }

    return 'Helvetica';
  }
}
