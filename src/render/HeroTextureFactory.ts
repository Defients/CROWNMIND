import { textureFactory } from './TextureFactory';
import {
  createCanvas, fillRect, fillCircle, strokeCircle, fillTriangle, strokeLine, fillPolygon, fillArc,
  drawGlow, drawShadow, drawDetailNoise, rgba,
  drawRivets, drawChainmail, drawClothFolds, drawEyeDetail, drawSparkles,
} from './TexturePainter';

const HERO_SIZE = 512;

type HeroState = 'idle' | 'moving' | 'combat' | 'fleeing';

function drawFighter(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 112);

  // Body armor
  fillRect(ctx, cx - 72, cy - 32, 144, 128, rgba(180, 50, 60, 0.9));
  fillRect(ctx, cx - 80, cy - 48, 160, 32, rgba(140, 30, 40, 0.95));
  // Chainmail under armor
  drawChainmail(ctx, cx - 68, cy - 28, 136, 120, 12, rgba(120, 30, 35, 0.5));
  // Armor plate seams
  strokeLine(ctx, cx, cy - 28, cx, cy + 90, rgba(100, 20, 25, 0.6), 2);
  strokeLine(ctx, cx - 36, cy - 28, cx - 36, cy + 90, rgba(100, 20, 25, 0.4), 1.5);
  strokeLine(ctx, cx + 36, cy - 28, cx + 36, cy + 90, rgba(100, 20, 25, 0.4), 1.5);
  // Rivets along armor edges
  drawRivets(ctx, cx - 72, cy - 32, cx + 72, cy - 32, 16, rgba(200, 160, 120, 0.8));
  drawRivets(ctx, cx - 72, cy + 96, cx + 72, cy + 96, 16, rgba(200, 160, 120, 0.8));
  drawRivets(ctx, cx - 72, cy - 32, cx - 72, cy + 96, 16, rgba(200, 160, 120, 0.8));
  drawRivets(ctx, cx + 72, cy - 32, cx + 72, cy + 96, 16, rgba(200, 160, 120, 0.8));

  // Head
  fillCircle(ctx, cx, cy - 96, 56, rgba(200, 160, 140, 0.95));
  // Helmet
  fillRect(ctx, cx - 64, cy - 112, 128, 24, rgba(120, 20, 30, 0.9));
  fillRect(ctx, cx - 56, cy - 128, 112, 20, rgba(140, 30, 40, 0.95));
  // Helmet ridge
  strokeLine(ctx, cx, cy - 128, cx, cy - 112, rgba(80, 10, 15, 0.8), 3);
  // Eyes
  drawEyeDetail(ctx, cx - 20, cy - 92, 8, rgba(80, 40, 20, 1));
  drawEyeDetail(ctx, cx + 20, cy - 92, 8, rgba(80, 40, 20, 1));
  // Mouth - expression depends on state
  if (state === 'combat') {
    fillRect(ctx, cx - 16, cy - 68, 32, 8, rgba(40, 10, 10, 0.8));
    fillRect(ctx, cx - 14, cy - 66, 6, 4, rgba(180, 160, 140, 0.6));
    fillRect(ctx, cx - 4, cy - 66, 6, 4, rgba(180, 160, 140, 0.6));
    fillRect(ctx, cx + 6, cy - 66, 6, 4, rgba(180, 160, 140, 0.6));
  } else if (state === 'fleeing') {
    fillRect(ctx, cx - 12, cy - 64, 24, 4, rgba(40, 10, 10, 0.7));
  } else {
    fillRect(ctx, cx - 10, cy - 66, 20, 3, rgba(40, 10, 10, 0.6));
  }

  // Weapon - sword
  if (state === 'combat') {
    strokeLine(ctx, cx + 64, cy - 64, cx + 176, cy - 144, rgba(200, 200, 220, 0.95), 24);
    strokeLine(ctx, cx + 64, cy - 64, cx + 176, cy - 144, rgba(255, 255, 255, 0.6), 12);
    // Blade edge highlight
    strokeLine(ctx, cx + 64, cy - 68, cx + 176, cy - 148, rgba(255, 255, 255, 0.8), 3);
    // Crossguard
    fillRect(ctx, cx + 52, cy - 80, 32, 12, rgba(180, 140, 60, 0.9));
    drawRivets(ctx, cx + 52, cy - 80, cx + 84, cy - 80, 8, rgba(220, 180, 80, 0.8));
    // Blade tip
    fillTriangle(ctx, cx + 176, cy - 152, cx + 192, cy - 144, cx + 176, cy - 136, rgba(220, 220, 240, 0.95));
    // Engraving on blade
    strokeLine(ctx, cx + 90, cy - 88, cx + 140, cy - 124, rgba(150, 120, 60, 0.6), 1.5);
    strokeLine(ctx, cx + 100, cy - 80, cx + 150, cy - 116, rgba(150, 120, 60, 0.5), 1);
  } else {
    strokeLine(ctx, cx + 80, cy - 16, cx + 112, cy - 160, rgba(200, 200, 220, 0.9), 24);
    fillTriangle(ctx, cx + 96, cy - 192, cx + 128, cy - 160, cx + 80, cy - 144, rgba(220, 220, 240, 0.9));
    // Crossguard
    fillRect(ctx, cx + 68, cy - 32, 32, 12, rgba(180, 140, 60, 0.85));
  }

  // Shoulder pauldrons
  fillCircle(ctx, cx - 80, cy - 24, 20, rgba(160, 40, 50, 0.9));
  fillCircle(ctx, cx + 80, cy - 24, 20, rgba(160, 40, 50, 0.9));
  drawRivets(ctx, cx - 96, cy - 24, cx - 64, cy - 24, 6, rgba(200, 160, 120, 0.7));
  drawRivets(ctx, cx + 64, cy - 24, cx + 96, cy - 24, 6, rgba(200, 160, 120, 0.7));

  // Belt
  fillRect(ctx, cx - 72, cy + 48, 144, 12, rgba(80, 50, 20, 0.9));
  fillRect(ctx, cx - 12, cy + 48, 24, 12, rgba(200, 160, 60, 0.8));
  drawRivets(ctx, cx - 72, cy + 54, cx + 72, cy + 54, 24, rgba(160, 120, 40, 0.7));

  // Legs
  fillRect(ctx, cx - 48, cy + 96, 40, 48, rgba(100, 20, 25, 0.9));
  fillRect(ctx, cx + 8, cy + 96, 40, 48, rgba(100, 20, 25, 0.9));
  // Knee plates
  fillCircle(ctx, cx - 28, cy + 112, 12, rgba(160, 40, 50, 0.8));
  fillCircle(ctx, cx + 28, cy + 112, 12, rgba(160, 40, 50, 0.8));

  drawDetailNoise(ctx, cx - 72, cy - 32, 144, 128, 40, rgba(140, 30, 35, 0.3));
}

function drawScout(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 96);

  // Body - leather armor
  fillRect(ctx, cx - 56, cy - 16, 112, 112, rgba(40, 180, 170, 0.9));
  drawClothFolds(ctx, cx - 56, cy - 16, 112, 112, 6, rgba(20, 120, 110, 0.5));
  // Leather straps
  strokeLine(ctx, cx - 48, cy + 20, cx + 48, cy + 20, rgba(20, 100, 90, 0.7), 4);
  strokeLine(ctx, cx - 48, cy + 50, cx + 48, cy + 50, rgba(20, 100, 90, 0.7), 4);
  drawRivets(ctx, cx - 48, cy + 20, cx + 48, cy + 20, 12, rgba(160, 120, 60, 0.7));
  drawRivets(ctx, cx - 48, cy + 50, cx + 48, cy + 50, 12, rgba(160, 120, 60, 0.7));

  // Head
  fillCircle(ctx, cx, cy - 80, 48, rgba(180, 150, 130, 0.95));
  // Hood
  fillArc(ctx, cx, cy - 112, 64, Math.PI, 0, rgba(30, 140, 130, 0.95));
  fillRect(ctx, cx - 72, cy - 128, 144, 24, rgba(20, 100, 90, 0.9));
  // Hood point
  fillTriangle(ctx, cx - 64, cy - 128, cx - 96, cy - 96, cx - 48, cy - 104, rgba(30, 140, 130, 0.85));
  // Eyes
  drawEyeDetail(ctx, cx - 16, cy - 76, 7, rgba(60, 120, 100, 1));
  drawEyeDetail(ctx, cx + 16, cy - 76, 7, rgba(60, 120, 100, 1));
  // Mouth
  fillRect(ctx, cx - 8, cy - 52, 16, 3, rgba(40, 20, 15, 0.6));

  // Daggers
  if (state === 'combat') {
    // Left dagger
    strokeLine(ctx, cx - 48, cy - 32, cx - 160, cy - 112, rgba(180, 140, 80, 0.95), 16);
    strokeLine(ctx, cx - 48, cy - 32, cx - 160, cy - 112, rgba(220, 200, 120, 0.6), 8);
    fillTriangle(ctx, cx - 160, cy - 120, cx - 144, cy - 112, cx - 160, cy - 104, rgba(200, 180, 100, 0.9));
    fillRect(ctx, cx - 56, cy - 44, 20, 8, rgba(100, 70, 30, 0.9));
    // Right dagger
    strokeLine(ctx, cx + 48, cy - 32, cx + 64, cy - 32, rgba(200, 160, 100, 0.9), 12);
    fillTriangle(ctx, cx + 64, cy - 40, cx + 96, cy - 32, cx + 64, cy - 24, rgba(200, 180, 100, 0.9));
  } else {
    // Dual daggers at belt
    strokeLine(ctx, cx + 48, cy, cx + 128, cy + 48, rgba(180, 140, 80, 0.9), 16);
    strokeLine(ctx, cx + 48, cy, cx + 128, cy - 48, rgba(180, 140, 80, 0.9), 16);
    fillTriangle(ctx, cx + 128, cy + 40, cx + 152, cy + 48, cx + 128, cy + 56, rgba(200, 180, 100, 0.9));
    fillTriangle(ctx, cx + 128, cy - 56, cx + 152, cy - 48, cx + 128, cy - 40, rgba(200, 180, 100, 0.9));
  }

  // Shoulder
  fillCircle(ctx, cx - 64, cy - 8, 16, rgba(30, 150, 140, 0.85));
  fillCircle(ctx, cx + 64, cy - 8, 16, rgba(30, 150, 140, 0.85));

  // Legs
  fillRect(ctx, cx - 40, cy + 96, 32, 48, rgba(20, 120, 110, 0.9));
  fillRect(ctx, cx + 8, cy + 96, 32, 48, rgba(20, 120, 110, 0.9));

  drawDetailNoise(ctx, cx - 56, cy - 16, 112, 112, 30, rgba(20, 120, 110, 0.3));
}

function drawAcolyte(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 96);

  // Robe
  fillPolygon(ctx, [
    [cx - 64, cy + 112],
    [cx + 64, cy + 112],
    [cx + 48, cy - 32],
    [cx - 48, cy - 32],
  ], rgba(140, 220, 200, 0.9));
  drawClothFolds(ctx, cx - 60, cy - 32, 120, 144, 8, rgba(100, 200, 180, 0.5));
  // Robe trim
  fillRect(ctx, cx - 64, cy + 104, 128, 8, rgba(180, 240, 220, 0.8));
  // Holy symbol on chest
  fillCircle(ctx, cx, cy + 16, 16, rgba(200, 255, 230, 0.7));
  strokeLine(ctx, cx, cy + 4, cx, cy + 28, rgba(255, 255, 255, 0.8), 3);
  strokeLine(ctx, cx - 10, cy + 16, cx + 10, cy + 16, rgba(255, 255, 255, 0.8), 3);

  // Head
  fillCircle(ctx, cx, cy - 80, 48, rgba(200, 180, 160, 0.95));
  // Cowl
  fillRect(ctx, cx - 56, cy - 112, 112, 16, rgba(100, 200, 180, 0.9));
  fillArc(ctx, cx, cy - 112, 56, Math.PI, 0, rgba(120, 220, 200, 0.9));
  // Eyes - serene
  drawEyeDetail(ctx, cx - 16, cy - 76, 7, rgba(100, 200, 180, 1));
  drawEyeDetail(ctx, cx + 16, cy - 76, 7, rgba(100, 200, 180, 1));
  // Mouth - calm
  fillRect(ctx, cx - 8, cy - 52, 16, 3, rgba(40, 20, 15, 0.5));

  // Staff
  strokeLine(ctx, cx - 32, cy + 16, cx - 32, cy + 160, rgba(160, 140, 100, 0.9), 8);
  fillCircle(ctx, cx - 32, cy + 8, 16, rgba(120, 80, 40, 0.8));
  // Staff crystal
  if (state === 'combat') {
    drawGlow(ctx, cx - 32, cy - 16, 64, rgba(150, 255, 200, 0.6), 0.5);
    fillCircle(ctx, cx - 32, cy - 16, 32, rgba(180, 255, 220, 0.7));
    fillCircle(ctx, cx - 32, cy - 16, 16, rgba(255, 255, 255, 0.6));
    drawSparkles(ctx, cx - 64, cy - 48, 64, 64, 15, rgba(150, 255, 200, 0.7));
    // Healing particles
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fillCircle(ctx, cx - 32 + Math.cos(a) * 48, cy - 16 + Math.sin(a) * 48, 6, rgba(180, 255, 220, 0.5));
    }
  } else {
    fillCircle(ctx, cx - 32, cy + 8, 12, rgba(150, 230, 200, 0.6));
    drawGlow(ctx, cx - 32, cy + 8, 24, rgba(150, 255, 200, 0.3), 0.3);
  }

  // Hands
  fillCircle(ctx, cx - 32, cy + 24, 10, rgba(200, 180, 160, 0.8));
  fillCircle(ctx, cx + 24, cy + 48, 10, rgba(200, 180, 160, 0.8));

  drawDetailNoise(ctx, cx - 60, cy - 32, 120, 144, 25, rgba(100, 200, 180, 0.3));
}

function drawMage(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 96);

  // Robe body
  fillRect(ctx, cx - 56, cy - 16, 112, 128, rgba(120, 60, 180, 0.9));
  fillPolygon(ctx, [
    [cx - 64, cy + 112],
    [cx + 64, cy + 112],
    [cx + 40, cy - 16],
    [cx - 40, cy - 16],
  ], rgba(100, 40, 160, 0.9));
  drawClothFolds(ctx, cx - 56, cy - 16, 112, 128, 7, rgba(80, 30, 140, 0.5));
  // Robe trim - arcane
  fillRect(ctx, cx - 64, cy + 104, 128, 8, rgba(160, 100, 220, 0.8));
  // Arcane runes on robe
  for (let i = 0; i < 3; i++) {
    const rx = cx - 32 + i * 32;
    fillCircle(ctx, rx, cy + 40, 6, rgba(200, 150, 255, 0.5));
    strokeLine(ctx, rx - 4, cy + 36, rx + 4, cy + 44, rgba(200, 150, 255, 0.4), 1.5);
  }

  // Head
  fillCircle(ctx, cx, cy - 80, 40, rgba(200, 170, 150, 0.95));
  // Hat - pointed
  fillPolygon(ctx, [
    [cx - 48, cy - 96],
    [cx + 48, cy - 96],
    [cx, cy - 192],
  ], rgba(80, 30, 140, 0.95));
  // Hat brim
  fillRect(ctx, cx - 56, cy - 100, 112, 12, rgba(60, 20, 120, 0.95));
  // Hat star
  fillCircle(ctx, cx - 16, cy - 128, 6, rgba(255, 220, 100, 0.8));
  drawSparkles(ctx, cx - 32, cy - 160, 64, 64, 10, rgba(200, 150, 255, 0.5));
  // Eyes
  drawEyeDetail(ctx, cx - 14, cy - 76, 6, rgba(120, 60, 180, 1));
  drawEyeDetail(ctx, cx + 14, cy - 76, 6, rgba(120, 60, 180, 1));
  // Beard
  fillPolygon(ctx, [
    [cx - 20, cy - 60],
    [cx + 20, cy - 60],
    [cx + 16, cy - 32],
    [cx - 16, cy - 32],
  ], rgba(180, 160, 140, 0.8));
  drawDetailNoise(ctx, cx - 20, cy - 60, 40, 28, 15, rgba(160, 140, 120, 0.5));

  // Staff with orb
  strokeLine(ctx, cx + 32, cy + 0, cx + 32, cy + 160, rgba(100, 60, 30, 0.9), 10);
  // Staff decoration
  fillRect(ctx, cx + 24, cy + 40, 16, 6, rgba(200, 160, 60, 0.7));
  fillRect(ctx, cx + 24, cy + 80, 16, 6, rgba(200, 160, 60, 0.7));

  if (state === 'combat') {
    drawGlow(ctx, cx + 32, cy - 32, 80, rgba(255, 120, 50, 0.5), 0.5);
    fillCircle(ctx, cx + 32, cy - 32, 32, rgba(255, 150, 60, 0.8));
    fillCircle(ctx, cx + 32, cy - 32, 16, rgba(255, 220, 100, 0.7));
    // Fire particles
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      fillCircle(ctx, cx + 32 + Math.cos(a) * 48, cy - 32 + Math.sin(a) * 48, 8, rgba(255, 100, 30, 0.6));
    }
    drawSparkles(ctx, cx, cy - 64, 64, 64, 15, rgba(255, 150, 60, 0.7));
  } else {
    fillCircle(ctx, cx + 32, cy + 0, 16, rgba(180, 100, 255, 0.5));
    drawGlow(ctx, cx + 32, cy + 0, 32, rgba(180, 100, 255, 0.3), 0.3);
    drawSparkles(ctx, cx + 16, cy - 16, 32, 32, 8, rgba(200, 150, 255, 0.5));
  }

  // Hands
  fillCircle(ctx, cx + 32, cy + 16, 10, rgba(200, 170, 150, 0.8));
  fillCircle(ctx, cx - 32, cy + 48, 10, rgba(200, 170, 150, 0.8));

  drawDetailNoise(ctx, cx - 56, cy - 16, 112, 128, 25, rgba(80, 30, 140, 0.3));
}

function drawArcher(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 96);

  // Body
  fillRect(ctx, cx - 56, cy - 16, 112, 112, rgba(160, 130, 220, 0.9));
  drawClothFolds(ctx, cx - 56, cy - 16, 112, 112, 5, rgba(120, 90, 180, 0.5));
  // Quiver strap
  strokeLine(ctx, cx - 40, cy - 16, cx + 40, cy + 96, rgba(100, 70, 30, 0.7), 5);
  // Belt
  fillRect(ctx, cx - 56, cy + 48, 112, 10, rgba(80, 50, 20, 0.9));

  // Head
  fillCircle(ctx, cx, cy - 80, 48, rgba(190, 160, 140, 0.95));
  // Headband
  fillRect(ctx, cx - 64, cy - 112, 128, 16, rgba(120, 90, 180, 0.9));
  fillRect(ctx, cx - 56, cy - 96, 112, 6, rgba(100, 70, 160, 0.8));
  // Eyes - focused
  drawEyeDetail(ctx, cx - 16, cy - 76, 7, rgba(120, 80, 160, 1));
  drawEyeDetail(ctx, cx + 16, cy - 76, 7, rgba(120, 80, 160, 1));
  // Mouth
  fillRect(ctx, cx - 8, cy - 52, 16, 3, rgba(40, 20, 15, 0.6));

  // Quiver with arrows
  fillRect(ctx, cx + 48, cy - 16, 20, 80, rgba(100, 70, 30, 0.85));
  for (let i = 0; i < 4; i++) {
    const ax = cx + 52 + i * 4;
    strokeLine(ctx, ax, cy - 16, ax, cy - 56, rgba(160, 120, 60, 0.8), 2);
    fillTriangle(ctx, ax - 2, cy - 56, ax + 2, cy - 56, ax, cy - 64, rgba(200, 200, 220, 0.8));
    // Fletching
    fillTriangle(ctx, ax - 3, cy - 16, ax + 3, cy - 16, ax, cy - 8, rgba(200, 80, 60, 0.7));
  }

  // Bow
  if (state === 'combat') {
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 16, 96, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.strokeStyle = rgba(180, 140, 80, 0.95);
    ctx.lineWidth = 8;
    ctx.stroke();
    // Bowstring
    strokeLine(ctx, cx - 16, cy - 96, cx - 16, cy + 16, rgba(220, 220, 240, 0.9), 2);
    // Nocked arrow
    strokeLine(ctx, cx - 16, cy - 112, cx - 16, cy + 80, rgba(200, 200, 220, 0.9), 3);
    fillTriangle(ctx, cx - 20, cy - 112, cx - 12, cy - 112, cx - 16, cy - 128, rgba(220, 220, 240, 0.9));
    // Bow grip
    fillRect(ctx, cx - 24, cy - 24, 16, 24, rgba(100, 60, 20, 0.8));
    drawRivets(ctx, cx - 24, cy - 24, cx - 24, cy, 6, rgba(160, 120, 40, 0.7));
  } else {
    ctx.beginPath();
    ctx.arc(cx + 64, cy, 80, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.strokeStyle = rgba(180, 140, 80, 0.85);
    ctx.lineWidth = 8;
    ctx.stroke();
    // Bowstring
    strokeLine(ctx, cx + 64, cy - 72, cx + 64, cy + 72, rgba(220, 220, 240, 0.6), 1.5);
  }

  // Legs
  fillRect(ctx, cx - 40, cy + 96, 32, 48, rgba(120, 90, 180, 0.9));
  fillRect(ctx, cx + 8, cy + 96, 32, 48, rgba(120, 90, 180, 0.9));

  drawDetailNoise(ctx, cx - 56, cy - 16, 112, 112, 25, rgba(120, 90, 180, 0.3));
}

function drawPaladin(ctx: CanvasRenderingContext2D, state: HeroState): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawShadow(ctx, cx, cy + 144, 112);

  // Body - golden armor
  fillRect(ctx, cx - 72, cy - 32, 144, 128, rgba(220, 180, 50, 0.9));
  fillRect(ctx, cx - 80, cy - 48, 160, 32, rgba(180, 140, 30, 0.95));
  drawChainmail(ctx, cx - 68, cy - 28, 136, 120, 12, rgba(160, 120, 20, 0.5));
  // Holy symbol on chest
  fillCircle(ctx, cx, cy + 16, 24, rgba(255, 240, 100, 0.7));
  strokeLine(ctx, cx, cy - 4, cx, cy + 36, rgba(255, 255, 200, 0.9), 4);
  strokeLine(ctx, cx - 16, cy + 16, cx + 16, cy + 16, rgba(255, 255, 200, 0.9), 4);
  drawSparkles(ctx, cx - 16, cy - 4, 32, 40, 8, rgba(255, 240, 100, 0.6));
  // Armor seams
  strokeLine(ctx, cx, cy - 28, cx, cy + 90, rgba(140, 100, 10, 0.5), 2);
  drawRivets(ctx, cx - 72, cy - 32, cx + 72, cy - 32, 16, rgba(240, 200, 80, 0.8));
  drawRivets(ctx, cx - 72, cy + 96, cx + 72, cy + 96, 16, rgba(240, 200, 80, 0.8));
  drawRivets(ctx, cx - 72, cy - 32, cx - 72, cy + 96, 16, rgba(240, 200, 80, 0.8));
  drawRivets(ctx, cx + 72, cy - 32, cx + 72, cy + 96, 16, rgba(240, 200, 80, 0.8));

  // Head
  fillCircle(ctx, cx, cy - 96, 56, rgba(210, 180, 150, 0.95));
  // Helm
  fillRect(ctx, cx - 64, cy - 112, 128, 24, rgba(160, 120, 20, 0.9));
  fillRect(ctx, cx - 56, cy - 128, 112, 20, rgba(180, 140, 30, 0.95));
  // Helm crest - golden
  fillPolygon(ctx, [
    [cx - 8, cy - 128],
    [cx + 8, cy - 128],
    [cx, cy - 152],
  ], rgba(255, 220, 80, 0.9));
  // Eyes
  drawEyeDetail(ctx, cx - 20, cy - 92, 8, rgba(160, 120, 20, 1));
  drawEyeDetail(ctx, cx + 20, cy - 92, 8, rgba(160, 120, 20, 1));
  // Mouth
  fillRect(ctx, cx - 12, cy - 66, 24, 4, rgba(40, 10, 10, 0.7));

  // Shield and sword
  if (state === 'combat') {
    // Shield
    fillRect(ctx, cx - 144, cy - 64, 32, 112, rgba(200, 170, 40, 0.9));
    fillCircle(ctx, cx - 128, cy - 16, 16, rgba(255, 240, 100, 0.7));
    strokeLine(ctx, cx - 128, cy - 32, cx - 128, cy, rgba(255, 255, 200, 0.8), 3);
    strokeLine(ctx, cx - 140, cy - 16, cx - 116, cy - 16, rgba(255, 255, 200, 0.8), 3);
    drawGlow(ctx, cx - 128, cy - 16, 32, rgba(255, 220, 80, 0.4), 0.4);
    drawRivets(ctx, cx - 144, cy - 64, cx - 144, cy + 48, 12, rgba(240, 200, 80, 0.7));
    drawRivets(ctx, cx - 112, cy - 64, cx - 112, cy + 48, 12, rgba(240, 200, 80, 0.7));
    // Sword raised
    strokeLine(ctx, cx + 64, cy - 32, cx + 144, cy - 128, rgba(200, 200, 220, 0.9), 24);
    strokeLine(ctx, cx + 64, cy - 32, cx + 144, cy - 128, rgba(255, 255, 255, 0.6), 12);
    fillTriangle(ctx, cx + 144, cy - 136, cx + 160, cy - 128, cx + 144, cy - 120, rgba(220, 220, 240, 0.95));
    // Crossguard
    fillRect(ctx, cx + 52, cy - 48, 32, 12, rgba(220, 180, 60, 0.9));
    drawRivets(ctx, cx + 52, cy - 48, cx + 84, cy - 48, 8, rgba(255, 220, 100, 0.8));
    // Holy glow on sword
    drawGlow(ctx, cx + 104, cy - 80, 24, rgba(255, 240, 100, 0.3), 0.3);
  } else {
    // Shield at side
    fillRect(ctx, cx - 128, cy - 32, 32, 96, rgba(200, 170, 40, 0.85));
    fillCircle(ctx, cx - 112, cy + 16, 16, rgba(255, 240, 100, 0.6));
    // Sword sheathed
    strokeLine(ctx, cx + 80, cy - 16, cx + 112, cy - 144, rgba(200, 200, 220, 0.85), 24);
    fillTriangle(ctx, cx + 96, cy - 176, cx + 128, cy - 144, cx + 80, cy - 128, rgba(220, 220, 240, 0.9));
  }

  // Shoulder pauldrons - golden with sun emblem
  fillCircle(ctx, cx - 80, cy - 24, 24, rgba(220, 180, 50, 0.9));
  fillCircle(ctx, cx + 80, cy - 24, 24, rgba(220, 180, 50, 0.9));
  fillCircle(ctx, cx - 80, cy - 24, 12, rgba(255, 240, 100, 0.6));
  fillCircle(ctx, cx + 80, cy - 24, 12, rgba(255, 240, 100, 0.6));
  drawRivets(ctx, cx - 100, cy - 24, cx - 60, cy - 24, 8, rgba(240, 200, 80, 0.7));
  drawRivets(ctx, cx + 60, cy - 24, cx + 100, cy - 24, 8, rgba(240, 200, 80, 0.7));

  // Belt
  fillRect(ctx, cx - 72, cy + 48, 144, 12, rgba(120, 80, 10, 0.9));
  fillRect(ctx, cx - 12, cy + 48, 24, 12, rgba(255, 220, 80, 0.8));

  // Legs
  fillRect(ctx, cx - 48, cy + 96, 40, 48, rgba(180, 140, 30, 0.9));
  fillRect(ctx, cx + 8, cy + 96, 40, 48, rgba(180, 140, 30, 0.9));
  // Knee plates
  fillCircle(ctx, cx - 28, cy + 112, 14, rgba(220, 180, 50, 0.8));
  fillCircle(ctx, cx + 28, cy + 112, 14, rgba(220, 180, 50, 0.8));

  drawDetailNoise(ctx, cx - 72, cy - 32, 144, 128, 40, rgba(160, 120, 20, 0.3));
}

const HERO_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, state: HeroState) => void> = {
  'Kiox-Bound Fighter': drawFighter,
  'Ymzo-Touched Scout': drawScout,
  'Zeeya-Warded Acolyte': drawAcolyte,
  'Astryx Mage': drawMage,
  'Kael Archer': drawArcher,
  'Vael Paladin': drawPaladin,
};

const SPEC_AURAS: Record<string, { color: string; r: number }> = {
  Berserker: { color: rgba(255, 50, 30, 0.4), r: 176 },
  Guardian: { color: rgba(50, 120, 255, 0.4), r: 176 },
  Ranger: { color: rgba(50, 200, 80, 0.35), r: 160 },
  Assassin: { color: rgba(80, 20, 100, 0.4), r: 160 },
  Priest: { color: rgba(255, 255, 200, 0.4), r: 176 },
  Druid: { color: rgba(80, 200, 60, 0.35), r: 176 },
  Pyromancer: { color: rgba(255, 120, 30, 0.4), r: 176 },
  Cryomancer: { color: rgba(80, 180, 255, 0.4), r: 176 },
  Sniper: { color: rgba(255, 200, 50, 0.35), r: 160 },
  VolleyArcher: { color: rgba(180, 140, 255, 0.35), r: 160 },
  Templar: { color: rgba(255, 220, 80, 0.4), r: 176 },
  Avenger: { color: rgba(255, 60, 60, 0.4), r: 176 },
};

function drawKynmarked(ctx: CanvasRenderingContext2D): void {
  const cx = HERO_SIZE / 2;
  const cy = HERO_SIZE / 2;
  drawGlow(ctx, cx, cy, 224, rgba(245, 200, 75, 0.5), 0.4);
  strokeCircle(ctx, cx, cy, 192, rgba(245, 200, 75, 0.6), 4);
  // Golden runes around circle
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = cx + Math.cos(a) * 192;
    const ry = cy + Math.sin(a) * 192;
    fillCircle(ctx, rx, ry, 6, rgba(245, 200, 75, 0.7));
    drawSparkles(ctx, rx - 8, ry - 8, 16, 16, 4, rgba(255, 220, 100, 0.6));
  }
}

export function generateHeroTexture(heroClass: string, stateStr: string, specialization: string | null, kynmarked: boolean): string {
  const state = (['idle', 'moving', 'combat', 'fleeing'].includes(stateStr) ? stateStr : 'idle') as HeroState;
  const key = `hero:${heroClass}:${state}${specialization ? `:spec:${specialization}` : ''}${kynmarked ? ':kyn' : ''}`;
  if (textureFactory.has(key)) return key;

  const { canvas, ctx } = createCanvas(HERO_SIZE);
  const drawer = HERO_DRAWERS[heroClass] ?? HERO_DRAWERS['Kiox-Bound Fighter'];

  if (specialization && SPEC_AURAS[specialization]) {
    const aura = SPEC_AURAS[specialization];
    drawGlow(ctx, HERO_SIZE / 2, HERO_SIZE / 2, aura.r, aura.color, 0.5);
    // Aura particles
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const dist = aura.r * (0.7 + Math.random() * 0.3);
      fillCircle(ctx, HERO_SIZE / 2 + Math.cos(a) * dist, HERO_SIZE / 2 + Math.sin(a) * dist, 3 + Math.random() * 3, aura.color);
    }
  }

  drawer(ctx, state);

  if (state === 'fleeing') {
    drawGlow(ctx, HERO_SIZE / 2, HERO_SIZE / 2, 160, rgba(255, 100, 100, 0.3), 0.3);
    // Fear sweat drops
    for (let i = 0; i < 4; i++) {
      fillCircle(ctx, HERO_SIZE / 2 + (Math.random() - 0.5) * 80, HERO_SIZE / 2 - 80 + Math.random() * 20, 4, rgba(150, 200, 255, 0.5));
    }
  }

  if (kynmarked) {
    drawKynmarked(ctx);
  }

  textureFactory.register(key, canvas);
  return key;
}

export function getHeroStateKey(heroClass: string, status: string, specialization: string | null, kynmarked: boolean): string {
  let stateStr: HeroState = 'idle';
  if (status === 'Fighting') stateStr = 'combat';
  else if (status === 'Fleeing') stateStr = 'fleeing';
  else if (status === 'Exploring' || status === 'ChasingBounty' || status === 'SquadMarching') stateStr = 'moving';

  return generateHeroTexture(heroClass, stateStr, specialization, kynmarked);
}
