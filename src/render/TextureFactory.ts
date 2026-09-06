import { Texture, Sprite, Container } from 'pixi.js';

export class TextureFactory {
  private cache: Map<string, Texture> = new Map();

  /**
   * Register a canvas under a key. Converts to PixiJS Texture and caches.
   */
  register(key: string, canvas: HTMLCanvasElement): Texture {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const texture = Texture.from(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Get a cached texture by key, or null if not registered.
   */
  get(key: string): Texture | null {
    return this.cache.get(key) ?? null;
  }

  /**
   * Get a cached texture or throw if missing.
   */
  require(key: string): Texture {
    const tex = this.cache.get(key);
    if (!tex) throw new Error(`Texture not found: ${key}`);
    return tex;
  }

  /**
   * Create a Sprite from a cached texture.
   */
  sprite(key: string, x: number, y: number, scale: number = 1): Sprite {
    const tex = this.require(key);
    const s = new Sprite(tex);
    s.x = x;
    s.y = y;
    s.scale.set(scale);
    s.anchor.set(0.5, 0.5);
    return s;
  }

  /**
   * Check if a texture is cached.
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all cached textures (for hot reload / cleanup).
   */
  destroy(): void {
    for (const tex of this.cache.values()) {
      tex.destroy(true);
    }
    this.cache.clear();
  }
}

export const textureFactory = new TextureFactory();
