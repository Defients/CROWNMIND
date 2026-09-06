import { textureFactory } from './TextureFactory';
import {
  createCanvas, fillRect, fillCircle, fillPolygon, fillTriangle, strokeLine, strokeRect,
  drawGlow, drawShadow, drawDetailNoise, rgba,
  drawWoodGrain, drawShingles, drawEmbers, drawSparkles, drawCracks, drawPebbles,
} from './TexturePainter';

const FACTION_SCALE = 8;
const BASE_SIZE = 48;
const FACTION_SIZE = 384;

const DISPOSITION_BORDERS: Record<string, string> = {
  friendly: rgba(50, 230, 100, 0.7),
  neutral: rgba(255, 180, 50, 0.7),
  hostile: rgba(255, 80, 80, 0.7),
};

function drawVillage(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 14, 18);

  fillRect(ctx, cx - 14, cy - 2, 10, 12, rgba(130, 100, 60, 0.9));
  fillPolygon(ctx, [[cx - 15, cy - 2], [cx - 9, cy - 2], [cx - 12, cy - 8]], rgba(150, 110, 60, 0.9));

  fillRect(ctx, cx + 4, cy - 2, 10, 12, rgba(120, 90, 55, 0.9));
  fillPolygon(ctx, [[cx + 3, cy - 2], [cx + 9, cy - 2], [cx + 6, cy - 8]], rgba(140, 100, 55, 0.9));

  fillRect(ctx, cx - 2, cy + 2, 4, 8, rgba(80, 60, 35, 0.8));

  drawGlow(ctx, cx - 10, cy - 6, 3, rgba(255, 200, 100, 0.4), 0.4);
  drawGlow(ctx, cx + 8, cy - 6, 3, rgba(255, 200, 100, 0.4), 0.4);
  drawDetailNoise(ctx, cx - 14, cy - 2, 28, 14, 8, rgba(100, 75, 40, 0.3));
}

function drawBanditCamp(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 14, 16);

  fillPolygon(ctx, [
    [cx - 14, cy + 12],
    [cx - 10, cy - 4],
    [cx - 6, cy - 4],
    [cx - 2, cy + 12],
  ], rgba(80, 50, 30, 0.9));

  fillPolygon(ctx, [
    [cx + 2, cy + 12],
    [cx + 6, cy - 4],
    [cx + 10, cy - 4],
    [cx + 14, cy + 12],
  ], rgba(70, 45, 25, 0.9));

  fillTriangle(ctx, cx - 10, cy - 6, cx - 8, cy - 10, cx - 6, cy - 6, rgba(200, 200, 200, 0.6));
  fillTriangle(ctx, cx + 6, cy - 6, cx + 8, cy - 10, cx + 10, cy - 6, rgba(200, 200, 200, 0.6));

  fillCircle(ctx, cx, cy + 6, 4, rgba(255, 120, 40, 0.7));
  drawGlow(ctx, cx, cy + 6, 6, rgba(255, 100, 30, 0.4), 0.4);

  drawDetailNoise(ctx, cx - 14, cy - 4, 28, 16, 8, rgba(60, 35, 20, 0.3));
}

function drawAncientRuin(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 14, 16);

  fillRect(ctx, cx - 14, cy - 8, 5, 20, rgba(120, 115, 130, 0.85));
  fillRect(ctx, cx - 12, cy - 12, 3, 6, rgba(100, 95, 110, 0.8));

  fillRect(ctx, cx + 9, cy - 4, 5, 16, rgba(110, 105, 120, 0.8));

  fillRect(ctx, cx - 4, cy + 4, 8, 8, rgba(90, 85, 100, 0.7));

  drawGlow(ctx, cx, cy, 8, rgba(100, 150, 255, 0.3), 0.3);
  fillCircle(ctx, cx, cy, 2, rgba(150, 200, 255, 0.5));

  strokeLine(ctx, cx - 12, cy - 8, cx - 12, cy + 12, rgba(80, 180, 255, 0.4), 1);
  drawDetailNoise(ctx, cx - 14, cy - 12, 28, 26, 10, rgba(80, 75, 90, 0.3));
}

function drawWanderingTrader(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 14, 16);

  fillRect(ctx, cx - 12, cy + 2, 24, 8, rgba(100, 70, 40, 0.9));

  fillPolygon(ctx, [
    [cx - 14, cy + 2],
    [cx + 14, cy + 2],
    [cx + 10, cy - 8],
    [cx - 10, cy - 8],
  ], rgba(180, 120, 50, 0.9));

  fillRect(ctx, cx - 8, cy - 6, 4, 3, rgba(200, 80, 60, 0.7));
  fillRect(ctx, cx - 2, cy - 6, 4, 3, rgba(80, 160, 200, 0.7));
  fillRect(ctx, cx + 4, cy - 6, 4, 3, rgba(200, 180, 60, 0.7));

  fillCircle(ctx, cx - 14, cy + 10, 4, rgba(60, 45, 25, 0.8));
  fillCircle(ctx, cx + 14, cy + 10, 4, rgba(60, 45, 25, 0.8));
  fillCircle(ctx, cx - 14, cy + 10, 2, rgba(100, 80, 50, 0.6));
  fillCircle(ctx, cx + 14, cy + 10, 2, rgba(100, 80, 50, 0.6));

  drawDetailNoise(ctx, cx - 12, cy + 2, 24, 8, 6, rgba(80, 55, 30, 0.3));
}

function drawMercenaryCamp(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 14, 16);

  fillPolygon(ctx, [
    [cx - 12, cy + 12],
    [cx - 10, cy - 6],
    [cx - 4, cy - 6],
    [cx - 2, cy + 12],
  ], rgba(90, 90, 100, 0.9));

  fillRect(ctx, cx + 2, cy - 4, 10, 16, rgba(80, 80, 90, 0.9));
  fillPolygon(ctx, [[cx + 1, cy - 4], [cx + 13, cy - 4], [cx + 7, cy - 10]], rgba(70, 70, 80, 0.9));

  fillRect(ctx, cx - 8, cy, 3, 8, rgba(160, 160, 170, 0.7));
  fillRect(ctx, cx - 4, cy, 3, 8, rgba(140, 140, 150, 0.7));

  strokeLine(ctx, cx + 6, cy - 2, cx + 6, cy - 12, rgba(180, 180, 190, 0.7), 2);
  fillTriangle(ctx, cx + 4, cy - 12, cx + 8, cy - 12, cx + 6, cy - 16, rgba(200, 200, 210, 0.7));

  drawDetailNoise(ctx, cx - 12, cy - 6, 24, 18, 8, rgba(60, 60, 70, 0.3));
}

const FACTION_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
  village: drawVillage,
  banditCamp: drawBanditCamp,
  ancientRuin: drawAncientRuin,
  wanderingTrader: drawWanderingTrader,
  mercenaryCamp: drawMercenaryCamp,
};

function addFactionDetails(ctx: CanvasRenderingContext2D, factionType: string): void {
  const cx = FACTION_SIZE / 2;
  const cy = FACTION_SIZE / 2;

  if (factionType === 'village') {
    // Thatched roof detail
    drawShingles(ctx, cx - 120, cy - 64, 80, 64, 3, 8, rgba(150, 110, 60, 0.5), rgba(120, 90, 50, 0.4));
    drawShingles(ctx, cx + 40, cy - 64, 80, 64, 3, 8, rgba(140, 100, 55, 0.5), rgba(110, 80, 45, 0.4));
    // Window glow
    drawGlow(ctx, cx - 80, cy - 48, 16, rgba(255, 200, 100, 0.4), 0.4);
    drawGlow(ctx, cx + 64, cy - 48, 16, rgba(255, 200, 100, 0.4), 0.4);
    // Wood grain on doors
    drawWoodGrain(ctx, cx - 16, cy + 16, 32, 64, 4, rgba(60, 40, 20, 0.4));
    // Path stones
    drawPebbles(ctx, cx - 40, cy + 80, 80, 32, 15, rgba(120, 100, 70, 0.3));
  } else if (factionType === 'banditCamp') {
    // Campfire embers
    drawEmbers(ctx, cx - 32, cy + 32, 64, 48, 20);
    drawGlow(ctx, cx, cy + 48, 32, rgba(255, 100, 30, 0.4), 0.4);
    // Tent fabric texture
    drawWoodGrain(ctx, cx - 112, cy - 32, 96, 96, 6, rgba(60, 35, 20, 0.3));
    drawWoodGrain(ctx, cx + 16, cy - 32, 96, 96, 6, rgba(50, 30, 18, 0.3));
    // Smoke
    for (let i = 0; i < 4; i++) {
      fillCircle(ctx, cx + (Math.random() - 0.5) * 32, cy - 48 - i * 20, 8 + i * 4, rgba(100, 80, 60, 0.1));
    }
  } else if (factionType === 'ancientRuin') {
    // Stone pillar cracks
    drawCracks(ctx, cx - 96, cy, 64, 8, rgba(80, 75, 90, 0.4));
    drawCracks(ctx, cx + 64, cy, 48, 8, rgba(80, 75, 90, 0.4));
    // Moss/age details
    drawPebbles(ctx, cx - 112, cy - 96, 224, 192, 40, rgba(80, 100, 70, 0.2));
    // Arcane glow
    drawSparkles(ctx, cx - 32, cy - 32, 64, 64, 15, rgba(100, 150, 255, 0.4));
    drawGlow(ctx, cx, cy, 32, rgba(100, 150, 255, 0.3), 0.3);
    // Rune stones
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      fillCircle(ctx, cx + Math.cos(a) * 80, cy + Math.sin(a) * 80, 8, rgba(120, 160, 220, 0.4));
    }
  } else if (factionType === 'wanderingTrader') {
    // Wagon wood grain
    drawWoodGrain(ctx, cx - 96, cy + 16, 192, 64, 6, rgba(80, 55, 30, 0.4));
    // Canvas stripes
    for (let i = 0; i < 4; i++) {
      strokeLine(ctx, cx - 112 + i * 56, cy - 64, cx - 96 + i * 56, cy + 16, rgba(200, 180, 140, 0.3), 3);
    }
    // Goods detail - colorful wares
    fillCircle(ctx, cx - 64, cy - 48, 12, rgba(200, 80, 60, 0.6));
    fillCircle(ctx, cx - 48, cy - 44, 10, rgba(80, 160, 200, 0.6));
    fillCircle(ctx, cx - 16, cy - 48, 12, rgba(200, 180, 60, 0.6));
    fillCircle(ctx, cx + 16, cy - 44, 10, rgba(180, 100, 200, 0.6));
    // Wheel spokes
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      strokeLine(ctx, cx - 112, cy + 80, cx - 112 + Math.cos(a) * 28, cy + 80 + Math.sin(a) * 28, rgba(80, 60, 35, 0.5), 3);
      strokeLine(ctx, cx + 112, cy + 80, cx + 112 + Math.cos(a) * 28, cy + 80 + Math.sin(a) * 28, rgba(80, 60, 35, 0.5), 3);
    }
  } else if (factionType === 'mercenaryCamp') {
    // Weapon rack
    strokeLine(ctx, cx - 64, cy - 16, cx - 64, cy + 96, rgba(180, 180, 190, 0.6), 4);
    strokeLine(ctx, cx - 80, cy + 16, cx - 48, cy + 16, rgba(140, 140, 150, 0.5), 3);
    strokeLine(ctx, cx - 80, cy + 48, cx - 48, cy + 48, rgba(140, 140, 150, 0.5), 3);
    // Swords hanging
    strokeLine(ctx, cx - 72, cy + 16, cx - 72, cy + 48, rgba(200, 200, 220, 0.5), 3);
    strokeLine(ctx, cx - 56, cy + 16, cx - 56, cy + 48, rgba(200, 200, 220, 0.5), 3);
    // Tent fabric
    drawWoodGrain(ctx, cx - 96, cy - 48, 80, 96, 5, rgba(60, 60, 70, 0.3));
    drawWoodGrain(ctx, cx + 16, cy - 32, 80, 128, 5, rgba(50, 50, 60, 0.3));
    // Fire pit
    drawEmbers(ctx, cx + 32, cy + 64, 32, 24, 10);
    drawGlow(ctx, cx + 48, cy + 72, 16, rgba(255, 120, 40, 0.3), 0.3);
  }
}

export function generateFactionTexture(factionType: string, disposition: string): string {
  const key = `faction:${factionType}:${disposition}`;
  if (textureFactory.has(key)) return key;

  const { canvas, ctx } = createCanvas(FACTION_SIZE);

  ctx.save();
  ctx.scale(FACTION_SCALE, FACTION_SCALE);
  const drawer = FACTION_DRAWERS[factionType] ?? FACTION_DRAWERS.village;
  drawer(ctx);
  ctx.restore();

  addFactionDetails(ctx, factionType);

  const borderColor = DISPOSITION_BORDERS[disposition] ?? DISPOSITION_BORDERS.neutral;
  strokeRect(ctx, 16, 16, FACTION_SIZE - 32, FACTION_SIZE - 32, borderColor, 4);

  textureFactory.register(key, canvas);
  return key;
}
