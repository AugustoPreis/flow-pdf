import { Renderer, MockRenderBackend } from '@/renderer';
import { text, vStack, box, divider, spacer } from '@/dsl';
import { createLayoutEngine } from '@/layout';

describe('Renderer', () => {
  let backend: MockRenderBackend;
  let renderer: Renderer;

  beforeEach(() => {
    backend = new MockRenderBackend();
    renderer = new Renderer();
  });

  describe('Text rendering', () => {
    it('should render simple text node', async () => {
      const node = text('Hello World');
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const textCalls = backend.getCallsByMethod('drawText');
      expect(textCalls).toHaveLength(1);
      expect(textCalls[0]?.args[0]).toBe('Hello World');
    });

    it('should render text with style', async () => {
      const node = text('Bold Text', {
        style: { fontSize: 18, fontWeight: 'bold', color: '#FF0000' },
      });
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const textCalls = backend.getCallsByMethod('drawText');
      expect(textCalls).toHaveLength(1);
      expect(textCalls[0]?.args[3]).toEqual({
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: undefined,
        color: '#FF0000',
      });
    });
  });

  describe('Stack rendering', () => {
    it('should render vStack with multiple text children', async () => {
      const node = vStack(
        { spacing: 10 },
        text('First'),
        text('Second'),
        text('Third'),
      );
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const textCalls = backend.getCallsByMethod('drawText');
      expect(textCalls).toHaveLength(3);
      expect(textCalls[0]?.args[0]).toBe('First');
      expect(textCalls[1]?.args[0]).toBe('Second');
      expect(textCalls[2]?.args[0]).toBe('Third');
    });

    it('should render nested stacks', async () => {
      const node = vStack(
        {},
        text('Top'),
        vStack({}, text('Nested 1'), text('Nested 2')),
        text('Bottom'),
      );
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const textCalls = backend.getCallsByMethod('drawText');
      expect(textCalls).toHaveLength(4);
    });
  });

  describe('Box rendering', () => {
    it('should render box with background color', async () => {
      const node = box({ backgroundColor: '#EEEEEE' }, text('Content'));
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const rectCalls = backend.getCallsByMethod('drawRect');
      expect(rectCalls).toHaveLength(1);
      expect(rectCalls[0]?.args[4]).toMatchObject({
        fillColor: '#EEEEEE',
      });

      const textCalls = backend.getCallsByMethod('drawText');
      expect(textCalls).toHaveLength(1);
    });

    it('should render box with border', async () => {
      const node = box(
        {
          border: { width: 2, color: '#000000', radius: 5 },
        },
        text('Bordered'),
      );
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const rectCalls = backend.getCallsByMethod('drawRect');
      expect(rectCalls).toHaveLength(1);
      expect(rectCalls[0]?.args[4]).toMatchObject({
        strokeColor: '#000000',
        strokeWidth: 2,
        borderRadius: 5,
      });
    });
  });

  describe('Divider rendering', () => {
    it('should render horizontal divider', async () => {
      const node = divider({ orientation: 'horizontal', thickness: 1 });
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const lineCalls = backend.getCallsByMethod('drawLine');
      expect(lineCalls).toHaveLength(1);
      // Should draw horizontal line (x2 > x1, y2 == y1)
      const [x1, y1, x2, y2] =
        (lineCalls[0]?.args.slice(0, 4) as number[]) || [];
      expect(x2).toBeGreaterThan(x1 as number);
      expect(y2).toBe(y1);
    });

    it('should render vertical divider', async () => {
      const node = divider({ orientation: 'vertical', thickness: 2 });
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const lineCalls = backend.getCallsByMethod('drawLine');
      expect(lineCalls).toHaveLength(1);
      // Should draw vertical line (x2 == x1, y2 > y1)
      const [x1, y1, x2, y2] =
        (lineCalls[0]?.args.slice(0, 4) as number[]) || [];
      expect(x2).toBe(x1);
      expect(y2).toBeGreaterThan(y1 as number);
    });
  });

  describe('Spacer rendering', () => {
    it('should not render spacer (invisible)', async () => {
      const node = spacer({ height: 20 });
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      // Spacer should not produce any draw calls (only createPage)
      expect(backend.getCallsByMethod('drawText')).toHaveLength(0);
      expect(backend.getCallsByMethod('drawRect')).toHaveLength(0);
      expect(backend.getCallsByMethod('drawLine')).toHaveLength(0);
    });
  });

  describe('Complex layouts', () => {
    it('should render complex nested layout', async () => {
      const node = vStack(
        { spacing: 10 },
        text('Header', { style: { fontSize: 20, fontWeight: 'bold' } }),
        divider({ orientation: 'horizontal' }),
        box(
          { padding: 10, backgroundColor: '#F5F5F5' },
          vStack({}, text('Line 1'), text('Line 2'), text('Line 3')),
        ),
        spacer({ height: 20 }),
        text('Footer'),
      );

      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      expect(backend.getCallsByMethod('drawText').length).toBeGreaterThan(0);
      expect(backend.getCallsByMethod('drawRect').length).toBeGreaterThan(0);
      expect(backend.getCallsByMethod('drawLine').length).toBeGreaterThan(0);
    });
  });

  describe('Debug mode', () => {
    it('should draw debug outlines when enabled', async () => {
      renderer = new Renderer({ debugLayout: true });
      const node = vStack({}, text('Test'), text('Debug'));

      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      // Should have debug rect for vStack and 2 text nodes
      const rectCalls = backend.getCallsByMethod('drawRect');
      expect(rectCalls.length).toBeGreaterThanOrEqual(3);
    });

    it('should not draw debug outlines when disabled', async () => {
      renderer = new Renderer({ debugLayout: false });
      const node = vStack({}, text('Test'));

      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      await renderer.render(layoutTree, backend);

      const rectCalls = backend.getCallsByMethod('drawRect');
      expect(rectCalls).toHaveLength(0);
    });
  });

  describe('Command generation', () => {
    it('should generate commands without executing them', () => {
      const node = text('Test');
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      const commands = renderer.generateCommands(layoutTree.root);

      expect(commands.length).toBeGreaterThan(0);
      expect(commands[0]?.type).toBe('text');

      // Backend should not have been called
      expect(backend.getCallCount()).toBe(0);
    });
  });

  describe('Backend finalization', () => {
    it('should call finalize and return buffer', async () => {
      const node = text('Final Test');
      const engine = createLayoutEngine();
      const layoutTree = engine.layout(node);

      const result = await renderer.render(layoutTree, backend);

      expect(Buffer.isBuffer(result)).toBe(true);
      const finalizeCalls = backend.getCallsByMethod('finalize');
      expect(finalizeCalls).toHaveLength(1);
    });
  });
});
