import { text, vStack, hStack, box, divider } from '@/dsl';
import { Pipeline, createPipeline } from '@/pipeline';
import { MockRenderBackend } from '@/renderer';
import type { PipelineConfig } from '@/pipeline';

describe('Pipeline Integration', () => {
  describe('Pipeline class', () => {
    it('should create a pipeline with default configuration', () => {
      const pipeline = new Pipeline();

      expect(pipeline).toBeInstanceOf(Pipeline);
      expect(pipeline.getConfig()).toBeDefined();
      expect(pipeline.getLayoutEngine()).toBeDefined();
      expect(pipeline.getRenderer()).toBeDefined();
      expect(pipeline.getBackend()).toBeDefined();
    });

    it('should create a pipeline with custom configuration', () => {
      const config: PipelineConfig = {
        pageSize: { width: 595, height: 842 },
        defaultFontSize: 14,
        debugLayout: true,
      };

      const pipeline = new Pipeline(config);

      expect(pipeline.getConfig().pageSize).toEqual({
        width: 595,
        height: 842,
      });
      expect(pipeline.getConfig().defaultFontSize).toBe(14);
      expect(pipeline.getConfig().debugLayout).toBe(true);
    });

    it('should allow custom render backend', async () => {
      const mockBackend = new MockRenderBackend();
      const config: PipelineConfig = {
        backend: mockBackend,
      };

      const pipeline = new Pipeline(config);
      const doc = text('Test');

      await pipeline.generate(doc);

      expect(mockBackend.getCallCount()).toBeGreaterThan(0);
      expect(mockBackend.getCallsByMethod('createPage').length).toBe(1);
    });
  });

  describe('createPipeline factory', () => {
    it('should create a pipeline instance', () => {
      const pipeline = createPipeline();

      expect(pipeline).toBeInstanceOf(Pipeline);
    });

    it('should create a pipeline with configuration', () => {
      const pipeline = createPipeline({
        pageSize: { width: 612, height: 792 },
      });

      expect(pipeline.getConfig().pageSize).toEqual({
        width: 612,
        height: 792,
      });
    });
  });

  describe('Pipeline.generate()', () => {
    it('should generate PDF from simple text node', async () => {
      const pipeline = new Pipeline();
      const doc = text('Hello Pipeline');

      const buffer = await pipeline.generate(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate PDF from complex document', async () => {
      const pipeline = new Pipeline();
      const doc = vStack(
        { spacing: 20, padding: 40 },
        text('Document Title', { style: { fontWeight: 'bold', fontSize: 24 } }),
        divider({ orientation: 'horizontal' }),
        hStack(
          { spacing: 10 },
          box(
            { padding: 10, backgroundColor: '#F0F0F0' },
            vStack(
              { spacing: 5 },
              text('Left Box', { style: { fontWeight: 'bold' } }),
              text('Content line 1'),
              text('Content line 2'),
            ),
          ),
          box(
            { padding: 10, backgroundColor: '#E8E8E8' },
            vStack(
              { spacing: 5 },
              text('Right Box', { style: { fontWeight: 'bold' } }),
              text('Content line 1'),
              text('Content line 2'),
            ),
          ),
        ),
        divider({ orientation: 'horizontal' }),
        text('Footer text'),
      );

      const buffer = await pipeline.generate(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      // Verify PDF signature
      expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should validate node before generating', async () => {
      const pipeline = new Pipeline();

      await expect(pipeline.generate(null as never)).rejects.toThrow(
        'cannot be null or undefined',
      );
    });

    it('should throw error for invalid node type', async () => {
      const pipeline = new Pipeline();
      const invalidNode = { invalid: 'node' } as never;

      await expect(pipeline.generate(invalidNode)).rejects.toThrow();
    });

    it('should handle layout errors gracefully', async () => {
      const pipeline = new Pipeline();
      // Test with completely invalid node
      const invalidNode = { type: 'text' } as never;

      await expect(pipeline.generate(invalidNode)).rejects.toThrow();
    });
  });

  describe('Pipeline with MockRenderBackend', () => {
    it('should record all render commands', async () => {
      const mockBackend = new MockRenderBackend();
      const pipeline = new Pipeline({ backend: mockBackend });

      const doc = vStack(
        { spacing: 10 },
        text('Line 1'),
        text('Line 2'),
        text('Line 3'),
      );

      await pipeline.generate(doc);

      const calls = mockBackend.getCalls();
      expect(calls.length).toBeGreaterThan(0);

      // Should have created a page
      const pageCreations = mockBackend.getCallsByMethod('createPage');
      expect(pageCreations.length).toBe(1);

      // Should have drawn text
      const textCalls = mockBackend.getCallsByMethod('drawText');
      expect(textCalls.length).toBeGreaterThan(0);
    });

    it('should track box rendering with rectangles', async () => {
      const mockBackend = new MockRenderBackend();
      const pipeline = new Pipeline({ backend: mockBackend });

      const doc = box(
        {
          padding: 10,
          backgroundColor: '#CCCCCC',
        },
        text('Box content'),
      );

      await pipeline.generate(doc);

      // Should have drawn rectangles (for background and border)
      const rectCalls = mockBackend.getCallsByMethod('drawRect');
      expect(rectCalls.length).toBeGreaterThan(0);

      // Should have drawn text
      const textCalls = mockBackend.getCallsByMethod('drawText');
      expect(textCalls.length).toBe(1);
    });

    it('should track divider rendering with lines', async () => {
      const mockBackend = new MockRenderBackend();
      const pipeline = new Pipeline({ backend: mockBackend });

      const doc = vStack(
        {},
        text('Above'),
        divider({ orientation: 'horizontal' }),
        text('Below'),
      );

      await pipeline.generate(doc);

      // Should have drawn a line for the divider
      const lineCalls = mockBackend.getCallsByMethod('drawLine');
      expect(lineCalls.length).toBe(1);
    });
  });

  describe('Pipeline component access', () => {
    it('should provide access to layout engine', () => {
      const pipeline = new Pipeline();
      const engine = pipeline.getLayoutEngine();

      expect(engine).toBeDefined();
      expect(typeof engine.layout).toBe('function');
    });

    it('should provide access to renderer', () => {
      const pipeline = new Pipeline();
      const renderer = pipeline.getRenderer();

      expect(renderer).toBeDefined();
      expect(typeof renderer.render).toBe('function');
    });

    it('should provide access to backend', () => {
      const pipeline = new Pipeline();
      const backend = pipeline.getBackend();

      expect(backend).toBeDefined();
      expect(typeof backend.createPage).toBe('function');
      expect(typeof backend.drawText).toBe('function');
      expect(typeof backend.finalize).toBe('function');
    });

    it('should provide access to configuration', () => {
      const config: PipelineConfig = {
        pageSize: { width: 100, height: 200 },
        defaultFontSize: 15,
        debugLayout: true,
      };

      const pipeline = new Pipeline(config);
      const retrievedConfig = pipeline.getConfig();

      expect(retrievedConfig.pageSize).toEqual({ width: 100, height: 200 });
      expect(retrievedConfig.defaultFontSize).toBe(15);
      expect(retrievedConfig.debugLayout).toBe(true);
    });
  });
});
