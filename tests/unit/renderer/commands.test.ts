import {
  TextCommand,
  RectCommand,
  LineCommand,
  PageCommand,
  MockRenderBackend,
} from '@/renderer';

describe('Render Commands', () => {
  let backend: MockRenderBackend;

  beforeEach(() => {
    backend = new MockRenderBackend();
  });

  describe('TextCommand', () => {
    it('should create text command with required parameters', () => {
      const cmd = new TextCommand('Hello World', 10, 20);

      expect(cmd.type).toBe('text');
      expect(cmd.getText()).toBe('Hello World');
      expect(cmd.getX()).toBe(10);
      expect(cmd.getY()).toBe(20);
      expect(cmd.getStyle()).toBeUndefined();
    });

    it('should create text command with style', () => {
      const style = {
        fontSize: 14,
        fontWeight: 'bold' as const,
        color: '#FF0000',
      };
      const cmd = new TextCommand('Styled Text', 5, 10, style);

      expect(cmd.getStyle()).toEqual(style);
    });

    it('should execute on backend', () => {
      const cmd = new TextCommand('Test', 100, 200, { fontSize: 12 });
      cmd.execute(backend);

      const calls = backend.getCallsByMethod('drawText');
      expect(calls).toHaveLength(1);
      expect(calls[0]?.args).toEqual(['Test', 100, 200, { fontSize: 12 }]);
    });
  });

  describe('RectCommand', () => {
    it('should create rect command with dimensions', () => {
      const cmd = new RectCommand(10, 20, 100, 50);

      expect(cmd.type).toBe('rect');
      expect(cmd.getX()).toBe(10);
      expect(cmd.getY()).toBe(20);
      expect(cmd.getWidth()).toBe(100);
      expect(cmd.getHeight()).toBe(50);
      expect(cmd.getStyle()).toBeUndefined();
    });

    it('should create rect command with style', () => {
      const style = {
        fillColor: '#00FF00',
        strokeColor: '#000000',
        strokeWidth: 2,
      };
      const cmd = new RectCommand(0, 0, 50, 50, style);

      expect(cmd.getStyle()).toEqual(style);
    });

    it('should execute on backend', () => {
      const cmd = new RectCommand(5, 10, 20, 30, { fillColor: '#FFFFFF' });
      cmd.execute(backend);

      const calls = backend.getCallsByMethod('drawRect');
      expect(calls).toHaveLength(1);
      expect(calls[0]?.args).toEqual([5, 10, 20, 30, { fillColor: '#FFFFFF' }]);
    });
  });

  describe('LineCommand', () => {
    it('should create line command with coordinates', () => {
      const cmd = new LineCommand(0, 0, 100, 100);

      expect(cmd.type).toBe('line');
      expect(cmd.getX1()).toBe(0);
      expect(cmd.getY1()).toBe(0);
      expect(cmd.getX2()).toBe(100);
      expect(cmd.getY2()).toBe(100);
      expect(cmd.getStyle()).toBeUndefined();
    });

    it('should create line command with style', () => {
      const style = {
        color: '#FF0000',
        width: 3,
        dashPattern: [5, 3],
      };
      const cmd = new LineCommand(10, 20, 30, 40, style);

      expect(cmd.getStyle()).toEqual(style);
    });

    it('should execute on backend', () => {
      const cmd = new LineCommand(0, 0, 50, 50, { color: '#000000', width: 1 });
      cmd.execute(backend);

      const calls = backend.getCallsByMethod('drawLine');
      expect(calls).toHaveLength(1);
      expect(calls[0]?.args).toEqual([
        0,
        0,
        50,
        50,
        { color: '#000000', width: 1 },
      ]);
    });
  });

  describe('PageCommand', () => {
    it('should create page command without options', () => {
      const cmd = new PageCommand();

      expect(cmd.type).toBe('page');
      expect(cmd.getOptions()).toBeUndefined();
    });

    it('should create page command with options', () => {
      const options = {
        width: 612,
        height: 792,
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
      };
      const cmd = new PageCommand(options);

      expect(cmd.getOptions()).toEqual(options);
    });

    it('should execute on backend', () => {
      const options = { width: 600, height: 800 };
      const cmd = new PageCommand(options);
      cmd.execute(backend);

      const calls = backend.getCallsByMethod('createPage');
      expect(calls).toHaveLength(1);
      expect(calls[0]?.args).toEqual([options]);
    });
  });

  describe('Command execution chain', () => {
    it('should execute multiple commands in sequence', () => {
      const commands = [
        new PageCommand(),
        new TextCommand('Title', 50, 50, { fontSize: 24 }),
        new RectCommand(40, 40, 200, 40, { strokeColor: '#000000' }),
        new LineCommand(40, 100, 240, 100, { width: 1 }),
      ];

      for (const cmd of commands) {
        cmd.execute(backend);
      }

      expect(backend.getCallCount()).toBe(4);
      expect(backend.getCallsByMethod('createPage')).toHaveLength(1);
      expect(backend.getCallsByMethod('drawText')).toHaveLength(1);
      expect(backend.getCallsByMethod('drawRect')).toHaveLength(1);
      expect(backend.getCallsByMethod('drawLine')).toHaveLength(1);
    });
  });
});
