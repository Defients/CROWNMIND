import { textureFactory } from './TextureFactory';
import {
  createCanvas,
  fillRect,
  fillCircle,
  fillPolygon,
  drawDetailNoise,
  strokeLine,
  rgba,
  drawGrassBlades,
  drawPebbles,
  drawWaterRipples,
  drawSandGrains,
  drawSnowSparkles,
  drawLeafCluster,
  drawCorruptionVeins,
  drawSparkles,
  drawCracks,
} from './TexturePainter';
import type { TerrainType, Biome } from '../types/world';

const TILE_SIZE = 512;
const DRAW_SIZE = 256;
const TILE_SCALE = TILE_SIZE / DRAW_SIZE;

const TERRAIN_BASE: Record<TerrainType, { r: number; g: number; b: number }> = {
  grass: { r: 49, g: 66, b: 50 },
  forest: { r: 26, g: 47, b: 37 },
  stone: { r: 75, g: 80, b: 78 },
  corruption: { r: 55, g: 25, b: 43 },
  desert: { r: 95, g: 78, b: 49 },
  snow: { r: 87, g: 111, b: 125 },
  water: { r: 21, g: 51, b: 65 },
  fertile: { r: 49, g: 83, b: 48 },
};

const BIOME_TINT: Record<Biome, { r: number; g: number; b: number }> = {
  temperate: { r: 0, g: 0, b: 0 },
  arid: { r: 20, g: 10, b: -10 },
  tundra: { r: -5, g: -5, b: 15 },
};

function tint(
  base: { r: number; g: number; b: number },
  biome: Biome
): { r: number; g: number; b: number } {
  const t = BIOME_TINT[biome];
  return {
    r: Math.max(0, Math.min(255, base.r + t.r)),
    g: Math.max(0, Math.min(255, base.g + t.g)),
    b: Math.max(0, Math.min(255, base.b + t.b)),
  };
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  intensity: number
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = intensity;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGrass(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.grass, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 200, rgba(c.r + 15, c.g + 20, c.b + 10, 0.5));
  drawGrassBlades(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 120, rgba(c.r + 25, c.g + 35, c.b + 15, 0.7));
  drawGrassBlades(
    ctx,
    0,
    DRAW_SIZE * 0.3,
    DRAW_SIZE,
    DRAW_SIZE * 0.7,
    80,
    rgba(c.r + 35, c.g + 45, c.b + 20, 0.5)
  );
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * DRAW_SIZE;
    const y = Math.random() * DRAW_SIZE;
    fillCircle(ctx, x, y, 2 + Math.random() * 3, rgba(c.r + 40, c.g + 60, c.b + 20, 0.3));
  }
  // Small flowers
  for (let i = 0; i < 6; i++) {
    const fx = Math.random() * DRAW_SIZE;
    const fy = Math.random() * DRAW_SIZE;
    fillCircle(
      ctx,
      fx,
      fy,
      1.5,
      rgba(255, 200 + Math.random() * 55, 100 + Math.random() * 50, 0.4)
    );
  }
}

function drawForest(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.forest, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 150, rgba(c.r + 10, c.g + 15, c.b + 5, 0.4));
  drawGrassBlades(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 60, rgba(c.r + 20, c.g + 30, c.b + 10, 0.4));
  for (let i = 0; i < 3; i++) {
    const tx = 50 + Math.random() * (DRAW_SIZE - 100);
    const ty = 55 + Math.random() * (DRAW_SIZE - 110);
    const trunkH = 20 + Math.random() * 15;
    fillRect(ctx, tx - 4, ty + 10, 8, trunkH, rgba(60, 40, 20, 0.85));
    fillRect(ctx, tx - 3, ty + 10, 2, trunkH, rgba(80, 55, 30, 0.6));
    fillRect(ctx, tx + 1, ty + 10, 2, trunkH, rgba(40, 25, 12, 0.7));
    const canopyR = 48 + Math.random() * 22;
    // A canopy silhouette survives normal world zoom; leaf speckles alone read as grass.
    ctx.fillStyle = rgba(5, 16, 12, 0.5);
    ctx.beginPath();
    ctx.ellipse(tx + 10, ty + 20, canopyR * 0.95, canopyR * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    fillCircle(ctx, tx, ty - 5, canopyR * 0.7, rgba(c.r + 3, c.g + 16, c.b + 2, 0.95));
    fillCircle(
      ctx,
      tx - canopyR * 0.27,
      ty - 15,
      canopyR * 0.48,
      rgba(c.r + 14, c.g + 29, c.b + 9, 0.9)
    );
    fillCircle(
      ctx,
      tx + canopyR * 0.27,
      ty - 8,
      canopyR * 0.43,
      rgba(c.r + 8, c.g + 21, c.b + 5, 0.9)
    );
    drawLeafCluster(ctx, tx, ty - 5, canopyR, rgba(c.r + 5, c.g + 30, c.b + 5, 0.8), 40);
    drawLeafCluster(ctx, tx - 10, ty, canopyR * 0.7, rgba(c.r + 15, c.g + 40, c.b + 10, 0.7), 30);
    drawLeafCluster(
      ctx,
      tx + 10,
      ty + 5,
      canopyR * 0.7,
      rgba(c.r + 10, c.g + 35, c.b + 8, 0.7),
      30
    );
    drawLeafCluster(ctx, tx, ty - 15, canopyR * 0.5, rgba(c.r + 25, c.g + 50, c.b + 15, 0.6), 20);
  }
  // Fallen log
  fillRect(ctx, 20, DRAW_SIZE - 30, 60, 8, rgba(50, 35, 18, 0.5));
  fillRect(ctx, 22, DRAW_SIZE - 28, 56, 2, rgba(70, 50, 25, 0.3));
  // Fern cluster
  for (let i = 0; i < 4; i++) {
    const fx = 180 + Math.random() * 40;
    const fy = 40 + Math.random() * 40;
    strokeLine(ctx, fx, fy + 10, fx - 5, fy - 5, rgba(c.r + 30, c.g + 50, c.b + 10, 0.4), 1.5);
    strokeLine(ctx, fx, fy + 10, fx + 5, fy - 5, rgba(c.r + 30, c.g + 50, c.b + 10, 0.4), 1.5);
  }
}

function drawStone(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.stone, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 180, rgba(c.r + 15, c.g + 15, c.b + 18, 0.4));
  drawPebbles(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 60, rgba(c.r + 20, c.g + 20, c.b + 25, 0.6));
  for (let i = 0; i < 6; i++) {
    const rx = 20 + Math.random() * (DRAW_SIZE - 60);
    const ry = 20 + Math.random() * (DRAW_SIZE - 60);
    const rs = 15 + Math.random() * 25;
    fillCircle(ctx, rx, ry, rs, rgba(c.r + 20, c.g + 20, c.b + 25, 0.7));
    fillCircle(ctx, rx - 4, ry - 4, rs - 8, rgba(c.r + 35, c.g + 35, c.b + 40, 0.5));
    fillCircle(ctx, rx + 3, ry + 3, rs * 0.6, rgba(c.r - 10, c.g - 10, c.b - 8, 0.4));
    drawCracks(ctx, rx, ry, rs, 3, rgba(c.r - 20, c.g - 20, c.b - 15, 0.5));
  }
  strokeLine(
    ctx,
    0,
    DRAW_SIZE * 0.35,
    DRAW_SIZE,
    DRAW_SIZE * 0.32,
    rgba(c.r - 15, c.g - 15, c.b - 12, 0.4),
    2
  );
  strokeLine(
    ctx,
    0,
    DRAW_SIZE * 0.65,
    DRAW_SIZE,
    DRAW_SIZE * 0.68,
    rgba(c.r - 15, c.g - 15, c.b - 12, 0.3),
    1.5
  );
  // Moss patches
  for (let i = 0; i < 4; i++) {
    const mx = 20 + Math.random() * (DRAW_SIZE - 40);
    const my = 20 + Math.random() * (DRAW_SIZE - 40);
    fillCircle(ctx, mx, my, 5 + Math.random() * 8, rgba(40, 60, 30, 0.3));
  }
  // Ore vein
  strokeLine(ctx, 40, 60, 80, 120, rgba(140, 120, 80, 0.3), 2);
  strokeLine(ctx, 45, 65, 75, 115, rgba(160, 140, 100, 0.2), 1.5);
}

function drawCorruption(ctx: CanvasRenderingContext2D, _biome: Biome): void {
  const c = TERRAIN_BASE.corruption;
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 150, rgba(80, 20, 100, 0.4));
  drawCorruptionVeins(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 20, rgba(140, 40, 180, 0.5));
  for (let i = 0; i < 6; i++) {
    const x = 20 + Math.random() * (DRAW_SIZE - 40);
    const y = 20 + Math.random() * (DRAW_SIZE - 40);
    drawGlow(ctx, x, y, 15 + Math.random() * 10, rgba(180, 60, 220, 0.3), 0.3);
  }
  drawCracks(ctx, DRAW_SIZE / 2, DRAW_SIZE / 2, DRAW_SIZE * 0.4, 12, rgba(160, 50, 200, 0.4));
  fillCircle(ctx, DRAW_SIZE / 2, DRAW_SIZE / 2, 12, rgba(180, 60, 220, 0.3));
  drawSparkles(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 30, rgba(200, 80, 240, 0.6));
  // Dead tree silhouette
  strokeLine(
    ctx,
    DRAW_SIZE * 0.7,
    DRAW_SIZE - 20,
    DRAW_SIZE * 0.7,
    DRAW_SIZE * 0.5,
    rgba(30, 15, 25, 0.5),
    3
  );
  strokeLine(
    ctx,
    DRAW_SIZE * 0.7,
    DRAW_SIZE * 0.6,
    DRAW_SIZE * 0.6,
    DRAW_SIZE * 0.5,
    rgba(30, 15, 25, 0.4),
    2
  );
  strokeLine(
    ctx,
    DRAW_SIZE * 0.7,
    DRAW_SIZE * 0.55,
    DRAW_SIZE * 0.8,
    DRAW_SIZE * 0.45,
    rgba(30, 15, 25, 0.4),
    2
  );
}

function drawDesert(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.desert, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 180, rgba(c.r + 15, c.g + 10, c.b, 0.4));
  drawSandGrains(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 200, rgba(c.r + 25, c.g + 18, c.b + 5, 0.5));
  for (let i = 0; i < 5; i++) {
    const y = 20 + i * 45 + Math.random() * 20;
    strokeLine(
      ctx,
      10,
      y,
      DRAW_SIZE - 10,
      y + (Math.random() - 0.5) * 15,
      rgba(c.r + 20, c.g + 15, c.b + 5, 0.3),
      2
    );
    strokeLine(
      ctx,
      15,
      y + 8,
      DRAW_SIZE - 15,
      y + 8 + (Math.random() - 0.5) * 10,
      rgba(c.r + 30, c.g + 22, c.b + 8, 0.2),
      1.5
    );
  }
  for (let i = 0; i < 3; i++) {
    const x = 30 + Math.random() * (DRAW_SIZE - 60);
    const y = 30 + Math.random() * (DRAW_SIZE - 60);
    drawPebbles(ctx, x - 10, y - 10, 20, 20, 8, rgba(c.r + 30, c.g + 25, c.b + 10, 0.5));
  }
  // Small cactus
  for (let i = 0; i < 2; i++) {
    const cx = 40 + Math.random() * (DRAW_SIZE - 80);
    const cy = 40 + Math.random() * (DRAW_SIZE - 80);
    fillRect(ctx, cx - 3, cy - 12, 6, 24, rgba(60, 100, 40, 0.5));
    fillRect(ctx, cx - 8, cy - 6, 5, 10, rgba(60, 100, 40, 0.4));
    fillRect(ctx, cx + 3, cy - 4, 5, 8, rgba(60, 100, 40, 0.4));
  }
}

function drawSnow(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.snow, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 200, rgba(c.r + 20, c.g + 20, c.b + 25, 0.4));
  drawSnowSparkles(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 80);
  for (let i = 0; i < 5; i++) {
    const x = 20 + Math.random() * (DRAW_SIZE - 40);
    const y = 20 + Math.random() * (DRAW_SIZE - 40);
    const r = 10 + Math.random() * 15;
    fillCircle(ctx, x, y, r, rgba(255, 255, 255, 0.3));
    fillCircle(ctx, x - 3, y - 3, r * 0.6, rgba(255, 255, 255, 0.2));
  }
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * DRAW_SIZE;
    const y = Math.random() * DRAW_SIZE;
    fillCircle(ctx, x, y, 3 + Math.random() * 4, rgba(200, 210, 230, 0.4));
  }
  // Frozen puddle
  fillCircle(ctx, DRAW_SIZE * 0.3, DRAW_SIZE * 0.7, 15, rgba(180, 200, 230, 0.3));
  fillCircle(ctx, DRAW_SIZE * 0.3, DRAW_SIZE * 0.7, 10, rgba(200, 220, 240, 0.2));
  // Icicles on rock
  fillPolygon(
    ctx,
    [
      [DRAW_SIZE * 0.7, 30],
      [DRAW_SIZE * 0.7 + 4, 45],
      [DRAW_SIZE * 0.7 + 8, 30],
    ],
    rgba(200, 220, 240, 0.4)
  );
  fillPolygon(
    ctx,
    [
      [DRAW_SIZE * 0.7 + 10, 30],
      [DRAW_SIZE * 0.7 + 13, 40],
      [DRAW_SIZE * 0.7 + 16, 30],
    ],
    rgba(200, 220, 240, 0.3)
  );
}

function drawWater(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.water, biome);
  const grad = ctx.createLinearGradient(0, 0, 0, DRAW_SIZE);
  grad.addColorStop(0, rgba(c.r + 5, c.g + 15, c.b + 25, 1));
  grad.addColorStop(0.5, rgba(c.r, c.g + 10, c.b + 20, 1));
  grad.addColorStop(1, rgba(c.r - 5, c.g + 5, c.b + 15, 1));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, DRAW_SIZE, DRAW_SIZE);
  drawWaterRipples(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 40, rgba(c.r + 25, c.g + 40, c.b + 55, 0.4));
  drawWaterRipples(
    ctx,
    0,
    DRAW_SIZE * 0.3,
    DRAW_SIZE,
    DRAW_SIZE * 0.7,
    30,
    rgba(c.r + 15, c.g + 30, c.b + 45, 0.3)
  );
  for (let i = 0; i < 5; i++) {
    const y = 20 + i * 50;
    strokeLine(
      ctx,
      10,
      y,
      DRAW_SIZE - 10,
      y + (Math.random() - 0.5) * 8,
      rgba(c.r + 30, c.g + 45, c.b + 60, 0.25),
      1.5
    );
  }
  drawSparkles(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE * 0.3, 20, rgba(200, 230, 255, 0.5));
  // Reflection highlights
  for (let i = 0; i < 3; i++) {
    const rx = 30 + Math.random() * (DRAW_SIZE - 60);
    const ry = 30 + Math.random() * (DRAW_SIZE - 60);
    fillCircle(ctx, rx, ry, 4 + Math.random() * 6, rgba(220, 240, 255, 0.15));
  }
}

function drawFertile(ctx: CanvasRenderingContext2D, biome: Biome): void {
  const c = tint(TERRAIN_BASE.fertile, biome);
  fillRect(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, rgba(c.r, c.g, c.b));
  drawDetailNoise(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 200, rgba(c.r + 10, c.g + 20, c.b + 5, 0.4));
  drawGrassBlades(ctx, 0, 0, DRAW_SIZE, DRAW_SIZE, 100, rgba(c.r + 25, c.g + 40, c.b + 15, 0.6));
  for (let i = 0; i < 10; i++) {
    const x = 15 + i * 24 + Math.random() * 10;
    strokeLine(
      ctx,
      x,
      20,
      x + (Math.random() - 0.5) * 5,
      DRAW_SIZE - 20,
      rgba(c.r + 30, c.g + 50, c.b + 15, 0.5),
      2
    );
    strokeLine(ctx, x - 5, 30, x + 3, 25, rgba(c.r + 35, c.g + 55, c.b + 20, 0.4), 1.5);
    strokeLine(ctx, x + 5, 40, x + 8, 35, rgba(c.r + 35, c.g + 55, c.b + 20, 0.4), 1.5);
  }
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * DRAW_SIZE;
    const y = Math.random() * DRAW_SIZE;
    fillCircle(ctx, x, y, 3 + Math.random() * 4, rgba(c.r + 50, c.g + 80, c.b + 25, 0.4));
  }
  // Small bush
  for (let i = 0; i < 3; i++) {
    const bx = 30 + Math.random() * (DRAW_SIZE - 60);
    const by = 30 + Math.random() * (DRAW_SIZE - 60);
    drawLeafCluster(ctx, bx, by, 8, rgba(c.r + 40, c.g + 70, c.b + 20, 0.5), 10);
  }
}

const TERRAIN_DRAWERS: Record<TerrainType, (ctx: CanvasRenderingContext2D, biome: Biome) => void> =
  {
    grass: drawGrass,
    forest: drawForest,
    stone: drawStone,
    corruption: drawCorruption,
    desert: drawDesert,
    snow: drawSnow,
    water: drawWater,
    fertile: drawFertile,
  };

export function generateTerrainTextures(biome: Biome): void {
  const terrains: TerrainType[] = [
    'grass',
    'forest',
    'stone',
    'corruption',
    'desert',
    'snow',
    'water',
    'fertile',
  ];
  for (const terrain of terrains) {
    const key = `terrain:${terrain}:${biome}`;
    if (textureFactory.has(key)) continue;
    const { canvas, ctx } = createCanvas(TILE_SIZE);
    ctx.save();
    ctx.scale(TILE_SCALE, TILE_SCALE);
    TERRAIN_DRAWERS[terrain](ctx, biome);
    ctx.restore();
    textureFactory.register(key, canvas);
  }

  const fogKey = 'terrain:fog';
  if (!textureFactory.has(fogKey)) {
    const { canvas, ctx } = createCanvas(TILE_SIZE);
    fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, rgba(10, 18, 23));
    drawDetailNoise(ctx, 0, 0, TILE_SIZE, TILE_SIZE, 80, rgba(70, 91, 94, 0.12));
    textureFactory.register(fogKey, canvas);
  }

  const roadKey = 'terrain:road';
  if (!textureFactory.has(roadKey)) {
    const { canvas, ctx } = createCanvas(TILE_SIZE);
    fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, 'rgba(0,0,0,0)');
    const cx = TILE_SIZE / 2;
    fillRect(ctx, cx - 40, cx - 40, 80, 80, rgba(106, 90, 58, 0.85));
    drawDetailNoise(ctx, cx - 40, cx - 40, 80, 80, 80, rgba(120, 100, 65, 0.5));
    drawPebbles(ctx, cx - 40, cx - 40, 80, 80, 30, rgba(130, 110, 70, 0.5));
    for (let i = 0; i < 6; i++) {
      const y = cx - 35 + i * 12;
      strokeLine(
        ctx,
        cx - 40,
        y,
        cx + 40,
        y + (Math.random() - 0.5) * 4,
        rgba(90, 75, 48, 0.6),
        1.5
      );
    }
    textureFactory.register(roadKey, canvas);
  }

  const resourceKeys: Record<string, string> = {
    wood: 'resource:wood',
    stone: 'resource:stone',
    food: 'resource:food',
    mana: 'resource:mana',
  };
  for (const [res, key] of Object.entries(resourceKeys)) {
    if (textureFactory.has(key)) continue;
    const { canvas, ctx } = createCanvas(TILE_SIZE);
    const cx = TILE_SIZE / 2;
    if (res === 'wood') {
      fillRect(ctx, cx - 6, cx + 10, 12, 40, rgba(60, 40, 20, 0.85));
      fillRect(ctx, cx - 4, cx + 10, 2, 40, rgba(80, 55, 30, 0.6));
      drawLeafCluster(ctx, cx, cx - 10, 35, rgba(74, 138, 58, 0.8), 50);
      drawLeafCluster(ctx, cx - 15, cx, 25, rgba(64, 120, 50, 0.7), 35);
      drawLeafCluster(ctx, cx + 15, cx + 5, 25, rgba(84, 148, 68, 0.7), 35);
    } else if (res === 'stone') {
      drawPebbles(ctx, cx - 30, cx - 30, 60, 60, 20, rgba(138, 138, 154, 0.7));
      fillCircle(ctx, cx, cx, 25, rgba(138, 138, 154, 0.8));
      fillCircle(ctx, cx - 8, cx - 8, 15, rgba(120, 120, 136, 0.7));
      fillCircle(ctx, cx + 10, cx + 10, 15, rgba(150, 150, 166, 0.7));
      drawCracks(ctx, cx, cx, 25, 5, rgba(100, 100, 116, 0.5));
    } else if (res === 'food') {
      strokeLine(ctx, cx, cx - 40, cx, cx + 40, rgba(100, 180, 60, 0.8), 4);
      strokeLine(ctx, cx - 20, cx - 20, cx, cx - 30, rgba(120, 200, 70, 0.7), 3);
      strokeLine(ctx, cx + 20, cx - 10, cx, cx - 20, rgba(120, 200, 70, 0.7), 3);
      strokeLine(ctx, cx - 15, cx + 10, cx, cx, rgba(120, 200, 70, 0.7), 3);
      strokeLine(ctx, cx + 15, cx + 20, cx, cx + 10, rgba(120, 200, 70, 0.7), 3);
      drawLeafCluster(ctx, cx, cx - 35, 15, rgba(140, 220, 80, 0.6), 15);
    } else if (res === 'mana') {
      drawGlow(ctx, cx, cx, 30, rgba(155, 92, 255, 0.4), 0.4);
      fillCircle(ctx, cx, cx, 18, rgba(155, 92, 255, 0.7));
      fillCircle(ctx, cx, cx, 10, rgba(200, 150, 255, 0.5));
      fillCircle(ctx, cx, cx, 4, rgba(240, 200, 255, 0.6));
      strokeLine(ctx, cx, cx - 30, cx, cx + 30, rgba(155, 92, 255, 0.4), 2);
      strokeLine(ctx, cx - 30, cx, cx + 30, cx, rgba(155, 92, 255, 0.4), 2);
      strokeLine(ctx, cx - 20, cx - 20, cx + 20, cx + 20, rgba(155, 92, 255, 0.3), 1.5);
      strokeLine(ctx, cx - 20, cx + 20, cx + 20, cx - 20, rgba(155, 92, 255, 0.3), 1.5);
      drawSparkles(ctx, cx - 25, cx - 25, 50, 50, 20, rgba(200, 150, 255, 0.6));
    }
    textureFactory.register(key, canvas);
  }

  const corruptionOverlayKey = 'terrain:corruption_overlay';
  if (!textureFactory.has(corruptionOverlayKey)) {
    const { canvas, ctx } = createCanvas(TILE_SIZE);
    drawCorruptionVeins(ctx, 0, 0, TILE_SIZE, TILE_SIZE, 15, rgba(140, 40, 180, 0.35));
    drawSparkles(ctx, 0, 0, TILE_SIZE, TILE_SIZE, 20, rgba(180, 60, 220, 0.4));
    textureFactory.register(corruptionOverlayKey, canvas);
  }
}

export function getTerrainTextureKey(terrain: TerrainType, biome: Biome): string {
  return `terrain:${terrain}:${biome}`;
}
