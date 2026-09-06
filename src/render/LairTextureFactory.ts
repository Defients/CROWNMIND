import { textureFactory } from './TextureFactory';
import {
  createCanvas, fillRect, fillCircle, fillPolygon, fillTriangle, strokeLine, strokeCircle,
  drawGlow, drawShadow, drawDetailNoise, rgba,
  drawScales, drawCracks, drawEmbers, drawSparkles, drawPebbles,
} from './TexturePainter';

const LAIR_SCALE = 8;
const BASE_LAIR = 48;
const LAIR_SIZE = 384;
const BASE_MONSTER = 48;
const MONSTER_SIZE = 384;
const BASE_SPIRE = 64;
const SPIRE_SIZE = 512;

function drawLowLair(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_LAIR / 2;
  const cy = BASE_LAIR / 2;
  drawShadow(ctx, cx, cy + 16, 20);

  fillPolygon(ctx, [
    [cx - 18, cy + 12],
    [cx - 14, cy - 4],
    [cx - 8, cy - 10],
    [cx, cy - 14],
    [cx + 8, cy - 8],
    [cx + 14, cy - 2],
    [cx + 18, cy + 12],
  ], rgba(60, 45, 30, 0.9));

  fillPolygon(ctx, [
    [cx - 6, cy + 12],
    [cx - 4, cy + 2],
    [cx + 4, cy + 2],
    [cx + 6, cy + 12],
  ], rgba(15, 10, 5, 0.95));

  for (let i = 0; i < 5; i++) {
    const rx = cx - 12 + Math.random() * 24;
    const ry = cy - 6 + Math.random() * 12;
    strokeLine(ctx, rx, ry, rx + (Math.random() - 0.5) * 8, ry - 6 - Math.random() * 4, rgba(80, 60, 35, 0.6), 1.5);
  }

  drawDetailNoise(ctx, cx - 18, cy - 14, 36, 28, 15, rgba(50, 35, 20, 0.3));
}

function drawMediumLair(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_LAIR / 2;
  const cy = BASE_LAIR / 2;
  drawShadow(ctx, cx, cy + 16, 20);

  fillPolygon(ctx, [
    [cx - 16, cy + 14],
    [cx - 18, cy - 2],
    [cx - 10, cy - 14],
    [cx, cy - 18],
    [cx + 10, cy - 12],
    [cx + 18, cy - 2],
    [cx + 16, cy + 14],
  ], rgba(80, 35, 30, 0.9));

  fillTriangle(ctx, cx - 12, cy - 4, cx - 8, cy - 16, cx - 6, cy - 4, rgba(140, 50, 40, 0.8));
  fillTriangle(ctx, cx - 2, cy - 8, cx + 2, cy - 22, cx + 6, cy - 8, rgba(140, 50, 40, 0.8));
  fillTriangle(ctx, cx + 8, cy - 4, cx + 12, cy - 14, cx + 14, cy - 4, rgba(140, 50, 40, 0.8));

  fillPolygon(ctx, [
    [cx - 5, cy + 14],
    [cx - 3, cy + 4],
    [cx + 3, cy + 4],
    [cx + 5, cy + 14],
  ], rgba(15, 5, 5, 0.95));

  drawGlow(ctx, cx, cy + 8, 6, rgba(255, 80, 50, 0.3), 0.3);
  drawDetailNoise(ctx, cx - 18, cy - 18, 36, 32, 12, rgba(60, 25, 20, 0.3));
}

function drawHighLair(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_LAIR / 2;
  const cy = BASE_LAIR / 2;
  drawShadow(ctx, cx, cy + 16, 22);

  fillCircle(ctx, cx, cy + 4, 16, rgba(50, 20, 60, 0.9));
  fillCircle(ctx, cx, cy + 4, 12, rgba(30, 10, 40, 0.9));

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r1 = 14;
    const r2 = 20 + Math.random() * 4;
    strokeLine(ctx, cx + Math.cos(a) * r1, cy + 4 + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + 4 + Math.sin(a) * r2, rgba(120, 40, 160, 0.7), 2);
  }

  drawGlow(ctx, cx, cy + 4, 14, rgba(180, 60, 220, 0.4), 0.4);
  fillCircle(ctx, cx, cy + 4, 5, rgba(200, 80, 240, 0.6));
  fillCircle(ctx, cx, cy + 4, 2, rgba(255, 200, 255, 0.5));

  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * 6;
    fillCircle(ctx, cx + Math.cos(a) * r, cy + 4 + Math.sin(a) * r, 1.5, rgba(160, 60, 200, 0.5));
  }

  drawDetailNoise(ctx, cx - 16, cy - 12, 32, 32, 15, rgba(40, 15, 50, 0.3));
}

function drawSpire(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SPIRE / 2;
  const cy = BASE_SPIRE / 2;
  drawShadow(ctx, cx, cy + 24, 28);

  fillPolygon(ctx, [
    [cx - 16, cy + 20],
    [cx - 14, cy - 10],
    [cx - 8, cy - 24],
    [cx, cy - 30],
    [cx + 8, cy - 24],
    [cx + 14, cy - 10],
    [cx + 16, cy + 20],
  ], rgba(30, 15, 25, 0.95));

  fillPolygon(ctx, [
    [cx - 10, cy + 20],
    [cx - 8, cy - 6],
    [cx + 8, cy - 6],
    [cx + 10, cy + 20],
  ], rgba(15, 5, 10, 0.9));

  fillCircle(ctx, cx, cy - 18, 5, rgba(255, 60, 80, 0.8));
  drawGlow(ctx, cx, cy - 18, 14, rgba(255, 50, 70, 0.5), 0.5);
  fillCircle(ctx, cx, cy - 18, 2, rgba(255, 200, 200, 0.6));

  for (let i = 0; i < 3; i++) {
    const y = cy - 10 + i * 12;
    strokeLine(ctx, cx - 12, y, cx + 12, y, rgba(80, 30, 50, 0.5), 1);
  }

  strokeCircle(ctx, cx, cy, 28, rgba(255, 50, 70, 0.2), 2);
  drawDetailNoise(ctx, cx - 16, cy - 30, 32, 50, 20, rgba(20, 10, 15, 0.3));
}

function drawUndiscoveredLair(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_LAIR / 2;
  const cy = BASE_LAIR / 2;
  drawGlow(ctx, cx, cy, 18, rgba(40, 20, 60, 0.4), 0.4);
  fillCircle(ctx, cx, cy, 10, rgba(20, 10, 30, 0.6));
  drawDetailNoise(ctx, cx - 14, cy - 14, 28, 28, 20, rgba(30, 15, 45, 0.3));
}

function drawDestroyedLair(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_LAIR / 2;
  const cy = BASE_LAIR / 2;
  fillRect(ctx, cx - 14, cy + 6, 28, 8, rgba(40, 35, 30, 0.6));
  fillPolygon(ctx, [
    [cx - 10, cy + 14],
    [cx - 6, cy + 6],
    [cx - 2, cy + 10],
    [cx + 2, cy + 4],
    [cx + 8, cy + 8],
    [cx + 12, cy + 14],
  ], rgba(50, 45, 38, 0.5));
  drawGlow(ctx, cx, cy + 8, 10, rgba(60, 50, 40, 0.2), 0.2);
}

const LAIR_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
  low: drawLowLair,
  medium: drawMediumLair,
  high: drawHighLair,
};

function addLairDetails(ctx: CanvasRenderingContext2D, threatLevel: string, isSpire: boolean): void {
  const cx = isSpire ? SPIRE_SIZE / 2 : LAIR_SIZE / 2;
  const cy = isSpire ? SPIRE_SIZE / 2 : LAIR_SIZE / 2;

  if (threatLevel === 'low' && !isSpire) {
    // Sticks and bones scattered around
    for (let i = 0; i < 8; i++) {
      const x = cx - 120 + Math.random() * 240;
      const y = cy + 40 + Math.random() * 80;
      strokeLine(ctx, x, y, x + (Math.random() - 0.5) * 20, y - 8 - Math.random() * 8, rgba(80, 60, 35, 0.5), 2);
    }
    drawPebbles(ctx, cx - 120, cy - 40, 240, 160, 30, rgba(60, 45, 30, 0.4));
  } else if (threatLevel === 'medium' && !isSpire) {
    // Bone fragments
    for (let i = 0; i < 6; i++) {
      const x = cx - 100 + Math.random() * 200;
      const y = cy + 40 + Math.random() * 60;
      fillRect(ctx, x, y, 8, 3, rgba(200, 190, 170, 0.4));
      fillCircle(ctx, x + 4, y + 1, 2, rgba(180, 170, 150, 0.3));
    }
    // Ember glow at entrance
    drawEmbers(ctx, cx - 24, cy + 16, 48, 32, 12);
    drawGlow(ctx, cx, cy + 24, 24, rgba(255, 80, 50, 0.3), 0.3);
  } else if (threatLevel === 'high' && !isSpire) {
    // Arcane crystals
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dist = 80 + Math.random() * 20;
      const x = cx + Math.cos(a) * dist;
      const y = cy + 32 + Math.sin(a) * dist;
      fillPolygon(ctx, [[x - 6, y + 8], [x - 3, y - 8], [x + 3, y - 8], [x + 6, y + 8]], rgba(160, 60, 200, 0.6));
      drawSparkles(ctx, x - 8, y - 8, 16, 16, 4, rgba(200, 100, 240, 0.5));
    }
    // Dark energy swirl
    drawGlow(ctx, cx, cy + 32, 48, rgba(180, 60, 220, 0.3), 0.3);
    drawSparkles(ctx, cx - 32, cy, 64, 64, 15, rgba(200, 80, 240, 0.5));
  }

  if (isSpire) {
    // Dark tower details - cracks and dark energy
    drawCracks(ctx, cx, cy, 80, 10, rgba(60, 20, 30, 0.4));
    // Window glow
    drawGlow(ctx, cx, cy - 144, 48, rgba(255, 60, 80, 0.5), 0.5);
    drawEmbers(ctx, cx - 24, cy - 160, 48, 32, 15);
    // Floating dark particles
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const dist = 120 + Math.sin(i * 2) * 20;
      fillCircle(ctx, cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, 4, rgba(255, 50, 70, 0.4));
    }
    drawSparkles(ctx, cx - 64, cy - 64, 128, 128, 20, rgba(255, 50, 70, 0.4));
    // Base rubble
    drawPebbles(ctx, cx - 80, cy + 120, 160, 40, 30, rgba(30, 15, 20, 0.5));
  }
}

export function generateLairTexture(lairName: string, threatLevel: string, isDiscovered: boolean, isDestroyed: boolean): string {
  const isSpire = lairName === 'The Veylthyr Spire';
  const state = isDestroyed ? 'destroyed' : isDiscovered ? 'discovered' : 'undiscovered';
  const key = `lair:${isSpire ? 'spire' : threatLevel}:${state}`;
  if (textureFactory.has(key)) return key;

  if (isSpire) {
    const { canvas, ctx } = createCanvas(SPIRE_SIZE);
    if (isDestroyed) {
      ctx.save();
      ctx.scale(LAIR_SCALE, LAIR_SCALE);
      drawDestroyedLair(ctx);
      ctx.restore();
    } else {
      ctx.save();
      ctx.scale(LAIR_SCALE, LAIR_SCALE);
      drawSpire(ctx);
      ctx.restore();
      addLairDetails(ctx, threatLevel, true);
    }
    textureFactory.register(key, canvas);
    return key;
  }

  const { canvas, ctx } = createCanvas(LAIR_SIZE);
  if (isDestroyed) {
    ctx.save();
    ctx.scale(LAIR_SCALE, LAIR_SCALE);
    drawDestroyedLair(ctx);
    ctx.restore();
  } else if (!isDiscovered) {
    ctx.save();
    ctx.scale(LAIR_SCALE, LAIR_SCALE);
    drawUndiscoveredLair(ctx);
    ctx.restore();
  } else {
    ctx.save();
    ctx.scale(LAIR_SCALE, LAIR_SCALE);
    const drawer = LAIR_DRAWERS[threatLevel] ?? LAIR_DRAWERS.low;
    drawer(ctx);
    ctx.restore();
    addLairDetails(ctx, threatLevel, false);
  }
  textureFactory.register(key, canvas);
  return key;
}

function drawGnarlImp(ctx: CanvasRenderingContext2D, raiding: boolean): void {
  const cx = BASE_MONSTER / 2;
  const cy = BASE_MONSTER / 2;
  drawShadow(ctx, cx, cy + 14, 10);

  if (raiding) drawGlow(ctx, cx, cy, 18, rgba(255, 60, 60, 0.3), 0.3);

  fillCircle(ctx, cx, cy, 10, rgba(140, 60, 40, 0.9));
  fillCircle(ctx, cx - 3, cy - 2, 2, rgba(255, 200, 50, 0.8));
  fillCircle(ctx, cx + 3, cy - 2, 2, rgba(255, 200, 50, 0.8));
  fillCircle(ctx, cx, cy + 3, 2, rgba(20, 5, 5, 0.8));

  fillTriangle(ctx, cx - 5, cy - 8, cx - 3, cy - 12, cx - 1, cy - 8, rgba(100, 40, 30, 0.8));
  fillTriangle(ctx, cx + 1, cy - 8, cx + 3, cy - 12, cx + 5, cy - 8, rgba(100, 40, 30, 0.8));

  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i - 1.5) * 0.4;
    const r1 = 9;
    const r2 = 14;
    strokeLine(ctx, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, rgba(120, 50, 35, 0.7), 2);
  }
}

function drawFangling(ctx: CanvasRenderingContext2D, raiding: boolean): void {
  const cx = BASE_MONSTER / 2;
  const cy = BASE_MONSTER / 2;
  drawShadow(ctx, cx, cy + 14, 10);

  if (raiding) drawGlow(ctx, cx, cy, 18, rgba(255, 60, 60, 0.3), 0.3);

  fillCircle(ctx, cx, cy, 9, rgba(60, 100, 40, 0.9));
  fillCircle(ctx, cx - 3, cy - 2, 2, rgba(255, 100, 50, 0.8));
  fillCircle(ctx, cx + 3, cy - 2, 2, rgba(255, 100, 50, 0.8));

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r1 = 8;
    const r2 = 13;
    strokeLine(ctx, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, rgba(80, 140, 50, 0.7), 2);
  }

  fillTriangle(ctx, cx - 3, cy + 3, cx - 1, cy + 7, cx + 1, cy + 3, rgba(20, 5, 5, 0.8));
  fillTriangle(ctx, cx + 1, cy + 3, cx + 3, cy + 7, cx + 5, cy + 3, rgba(20, 5, 5, 0.8));
}

function drawDalyzeCrawler(ctx: CanvasRenderingContext2D, raiding: boolean): void {
  const cx = BASE_MONSTER / 2;
  const cy = BASE_MONSTER / 2;
  drawShadow(ctx, cx, cy + 14, 12);

  if (raiding) drawGlow(ctx, cx, cy, 20, rgba(255, 60, 60, 0.3), 0.3);

  fillCircle(ctx, cx, cy, 8, rgba(50, 20, 60, 0.9));
  fillCircle(ctx, cx, cy, 5, rgba(30, 10, 40, 0.9));

  fillCircle(ctx, cx - 2, cy - 1, 1.5, rgba(255, 80, 80, 0.8));
  fillCircle(ctx, cx + 2, cy - 1, 1.5, rgba(255, 80, 80, 0.8));

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r1 = 7;
    const r2 = 15;
    strokeLine(ctx, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, rgba(80, 30, 100, 0.7), 1.5);
    fillCircle(ctx, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, 1.5, rgba(100, 40, 120, 0.6));
  }
}

function drawVeylthyrHusk(ctx: CanvasRenderingContext2D, raiding: boolean): void {
  const cx = BASE_MONSTER / 2;
  const cy = BASE_MONSTER / 2;
  drawShadow(ctx, cx, cy + 14, 12);

  if (raiding) drawGlow(ctx, cx, cy, 22, rgba(255, 60, 60, 0.4), 0.4);

  fillPolygon(ctx, [
    [cx - 8, cy + 10],
    [cx - 7, cy - 6],
    [cx - 4, cy - 10],
    [cx + 4, cy - 10],
    [cx + 7, cy - 6],
    [cx + 8, cy + 10],
  ], rgba(20, 10, 15, 0.95));

  fillRect(ctx, cx - 5, cy - 4, 10, 8, rgba(40, 15, 20, 0.9));

  drawGlow(ctx, cx, cy, 6, rgba(255, 40, 60, 0.5), 0.5);
  fillCircle(ctx, cx, cy, 2.5, rgba(255, 60, 80, 0.7));

  fillRect(ctx, cx - 3, cy - 8, 2, 3, rgba(255, 50, 60, 0.6));
  fillRect(ctx, cx + 1, cy - 8, 2, 3, rgba(255, 50, 60, 0.6));

  strokeLine(ctx, cx - 8, cy - 6, cx - 14, cy + 2, rgba(30, 15, 20, 0.8), 2);
  strokeLine(ctx, cx + 8, cy - 6, cx + 14, cy + 2, rgba(30, 15, 20, 0.8), 2);
}

const MONSTER_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, raiding: boolean) => void> = {
  'Gnarl Imp': drawGnarlImp,
  'Fangling': drawFangling,
  'Dalyze Crawler': drawDalyzeCrawler,
  'Veylthyr Husk': drawVeylthyrHusk,
};

function addMonsterDetails(ctx: CanvasRenderingContext2D, monsterType: string): void {
  const cx = MONSTER_SIZE / 2;
  const cy = MONSTER_SIZE / 2;

  if (monsterType === 'Gnarl Imp') {
    // Skin texture - scales
    drawScales(ctx, cx - 64, cy - 64, 128, 128, 12, rgba(120, 50, 30, 0.4), rgba(160, 80, 50, 0.3));
    // Fangs detail
    fillTriangle(ctx, cx - 16, cy + 8, cx - 10, cy + 24, cx - 6, cy + 8, rgba(240, 230, 210, 0.7));
    fillTriangle(ctx, cx + 6, cy + 8, cx + 10, cy + 24, cx + 16, cy + 8, rgba(240, 230, 210, 0.7));
    // Eye iris
    fillCircle(ctx, cx - 20, cy - 12, 6, rgba(180, 140, 40, 0.6));
    fillCircle(ctx, cx + 20, cy - 12, 6, rgba(180, 140, 40, 0.6));
  } else if (monsterType === 'Fangling') {
    // Leaf-like scales
    drawScales(ctx, cx - 56, cy - 56, 112, 112, 10, rgba(40, 80, 30, 0.4), rgba(60, 120, 50, 0.3));
    // Thorns
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const x = cx + Math.cos(a) * 72;
      const y = cy + Math.sin(a) * 72;
      fillTriangle(ctx, x, y, x + Math.cos(a) * 12, y + Math.sin(a) * 12, x + Math.cos(a + 0.3) * 8, y + Math.sin(a + 0.3) * 8, rgba(60, 100, 40, 0.6));
    }
  } else if (monsterType === 'Dalyze Crawler') {
    // Carapace plates
    drawScales(ctx, cx - 48, cy - 48, 96, 96, 8, rgba(40, 15, 50, 0.5), rgba(60, 25, 70, 0.4));
    // Glowing eyes
    drawGlow(ctx, cx - 12, cy - 4, 12, rgba(255, 80, 80, 0.5), 0.5);
    drawGlow(ctx, cx + 12, cy - 4, 12, rgba(255, 80, 80, 0.5), 0.5);
    // Leg joints
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fillCircle(ctx, cx + Math.cos(a) * 56, cy + Math.sin(a) * 56, 6, rgba(80, 30, 100, 0.5));
    }
  } else if (monsterType === 'Veylthyr Husk') {
    // Dark armor plates
    drawScales(ctx, cx - 56, cy - 56, 112, 112, 10, rgba(15, 5, 10, 0.5), rgba(30, 10, 15, 0.4));
    // Glowing core
    drawGlow(ctx, cx, cy, 32, rgba(255, 40, 60, 0.5), 0.5);
    drawSparkles(ctx, cx - 16, cy - 16, 32, 32, 8, rgba(255, 60, 80, 0.5));
    // Cracks in husk
    drawCracks(ctx, cx, cy, 48, 8, rgba(255, 40, 60, 0.3));
  }
}

export function generateMonsterTexture(monsterType: string, status: string): string {
  const raiding = status === 'raiding';
  const key = `monster:${monsterType}:${raiding ? 'raiding' : 'normal'}`;
  if (textureFactory.has(key)) return key;

  const { canvas, ctx } = createCanvas(MONSTER_SIZE);
  ctx.save();
  ctx.scale(LAIR_SCALE, LAIR_SCALE);
  const drawer = MONSTER_DRAWERS[monsterType] ?? MONSTER_DRAWERS['Gnarl Imp'];
  drawer(ctx, raiding);
  ctx.restore();
  addMonsterDetails(ctx, monsterType);
  textureFactory.register(key, canvas);
  return key;
}
