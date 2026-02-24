import { pdf, text, vStack, hStack, box, divider, spacer } from '@/dsl';

describe('Basic PDF Generation', () => {
  describe('pdf() function', () => {
    it('should generate a PDF buffer from a simple text node', async () => {
      const doc = text('Hello, World!');

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // PDF files start with %PDF
      expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should generate a PDF buffer from a vStack with multiple texts', async () => {
      const doc = vStack(
        { spacing: 10 },
        text('Title', { style: { fontWeight: 'bold', fontSize: 24 } }),
        text('Subtitle', { style: { fontStyle: 'italic', fontSize: 16 } }),
        text('Body text content'),
      );

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should generate a PDF buffer from nested stacks', async () => {
      const doc = vStack(
        { spacing: 20 },
        text('Header', { style: { fontWeight: 'bold', fontSize: 20 } }),
        hStack({ spacing: 10 }, text('Left column'), text('Right column')),
        text('Footer'),
      );

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with boxes', async () => {
      const doc = vStack(
        { spacing: 10 },
        box(
          { padding: 10, backgroundColor: '#F0F0F0' },
          text('Content in a box'),
        ),
        box(
          {
            padding: 15,
            backgroundColor: '#E0E0E0',
          },
          text('Box with border'),
        ),
      );

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with dividers', async () => {
      const doc = vStack(
        { spacing: 20 },
        text('Section 1', { style: { fontWeight: 'bold' } }),
        divider({ orientation: 'horizontal', thickness: 1 }),
        text('Section 2', { style: { fontWeight: 'bold' } }),
        divider({ orientation: 'horizontal', thickness: 2, color: '#999999' }),
        text('Section 3', { style: { fontWeight: 'bold' } }),
      );

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with spacers', async () => {
      const doc = vStack(
        {},
        text('Top'),
        spacer({ height: 50 }),
        text('After spacer'),
        spacer({ height: 100 }),
        text('Bottom'),
      );

      const buffer = await pdf(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('pdf() with custom configuration', () => {
    it('should generate a PDF with custom page size (A4)', async () => {
      const doc = text('A4 Document');

      const buffer = await pdf(doc, {
        pageSize: { width: 595, height: 842 },
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with custom default font size', async () => {
      const doc = vStack(
        { spacing: 10 },
        text('Default size text'),
        text('Also default size'),
      );

      const buffer = await pdf(doc, {
        defaultFontSize: 14,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a PDF with debug layout enabled', async () => {
      const doc = vStack(
        { spacing: 10 },
        box({ padding: 5 }, text('Box 1')),
        box({ padding: 5 }, text('Box 2')),
      );

      const buffer = await pdf(doc, {
        debugLayout: true,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should throw error for null root node', async () => {
      await expect(pdf(null as never)).rejects.toThrow('cannot be null');
    });

    it('should throw error for undefined root node', async () => {
      await expect(pdf(undefined as never)).rejects.toThrow('cannot be null');
    });

    it('should throw error for invalid node structure', async () => {
      const invalidNode = { invalid: 'structure' } as never;

      await expect(pdf(invalidNode)).rejects.toThrow();
    });
  });
});
