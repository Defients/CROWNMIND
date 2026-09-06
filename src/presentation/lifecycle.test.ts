import { afterEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  init: vi.fn(),
  destroy: vi.fn(),
  scene: vi.fn(),
  removeTicker: vi.fn(),
}));

vi.mock('pixi.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('pixi.js')>();
  return {
    ...original,
    Application: class {
      init = harness.init;
      destroy = harness.destroy;
      canvas = { setAttribute: vi.fn(), tabIndex: -1 };
      ticker = { remove: harness.removeTicker };
    },
  };
});
vi.mock('../render/SceneManager', () => ({
  SceneManager: class {
    constructor() {
      harness.scene();
    }
  },
}));

import { PixiApp } from '../render/PixiApp';

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('renderer initialization ownership', () => {
  const container = () =>
    ({ clientWidth: 800, clientHeight: 600, appendChild: vi.fn() }) as unknown as HTMLDivElement;
  function environment() {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }), devicePixelRatio: 1 });
  }
  it('disposes an asynchronously initialized application after cancellation without attaching its canvas', async () => {
    environment();
    let resolve!: () => void;
    harness.init.mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        })
    );
    const app = new PixiApp(),
      host = container(),
      pending = app.init(host);
    app.destroy();
    app.destroy();
    resolve();
    await pending;
    expect(host.appendChild).not.toHaveBeenCalled();
    expect(harness.scene).not.toHaveBeenCalled();
    expect(harness.destroy).toHaveBeenCalledExactlyOnceWith(true, { children: true });
  });
  it('can clean up a GPU application when scene setup fails before initialized is set', async () => {
    environment();
    harness.init.mockResolvedValueOnce(undefined);
    harness.scene.mockImplementationOnce(() => {
      throw new Error('scene setup failed');
    });
    const app = new PixiApp();
    await expect(app.init(container())).rejects.toThrow('scene setup failed');
    app.destroy();
    app.destroy();
    expect(harness.removeTicker).toHaveBeenCalledOnce();
    expect(harness.destroy).toHaveBeenCalledExactlyOnceWith(true, { children: true });
  });
});
