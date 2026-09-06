import { textureFactory } from './TextureFactory';
import {
  createCanvas, fillRect, fillCircle, fillPolygon, fillTriangle, strokeLine, strokeRect,
  drawGlow, drawShadow, drawDetailNoise, rgba,
  drawBrickCourse, drawShingles, drawWoodGrain, drawRivets, drawEmbers, drawSparkles, drawCracks, drawPebbles,
} from './TexturePainter';

const BLD_SIZE = 512;
const BASE_SIZE = 48;
const BLD_SCALE = BLD_SIZE / BASE_SIZE;

function drawTownHall(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 18, 22);

  fillRect(ctx, cx - 16, cy - 6, 32, 20, rgba(80, 70, 90, 0.95));
  fillPolygon(ctx, [
    [cx - 18, cy - 6],
    [cx + 18, cy - 6],
    [cx, cy - 22],
  ], rgba(120, 80, 180, 0.95));
  fillRect(ctx, cx - 2, cy - 26, 4, 8, rgba(100, 70, 140, 0.9));
  fillRect(ctx, cx - 6, cy - 28, 12, 4, rgba(180, 140, 60, 0.9));

  fillRect(ctx, cx - 6, cy + 2, 12, 12, rgba(40, 30, 50, 0.9));
  fillRect(ctx, cx - 4, cy + 4, 8, 8, rgba(200, 180, 100, 0.4));

  fillRect(ctx, cx - 14, cy - 2, 4, 6, rgba(200, 180, 100, 0.5));
  fillRect(ctx, cx + 10, cy - 2, 4, 6, rgba(200, 180, 100, 0.5));

  strokeRect(ctx, cx - 16, cy - 6, 32, 20, rgba(140, 100, 200, 0.6), 1);
  drawDetailNoise(ctx, cx - 16, cy - 6, 32, 20, 15, rgba(100, 80, 120, 0.3));
}

function drawWarriorGuild(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 18);

  fillRect(ctx, cx - 12, cy - 4, 24, 16, rgba(100, 60, 50, 0.95));
  fillPolygon(ctx, [
    [cx - 14, cy - 4],
    [cx + 14, cy - 4],
    [cx, cy - 16],
  ], rgba(160, 50, 50, 0.95));

  fillRect(ctx, cx - 4, cy + 2, 8, 10, rgba(50, 30, 25, 0.9));

  strokeLine(ctx, cx - 16, cy + 8, cx - 10, cy - 8, rgba(180, 180, 200, 0.8), 2);
  fillCircle(ctx, cx - 16, cy + 8, 2, rgba(140, 80, 40, 0.8));

  fillRect(ctx, cx + 8, cy - 2, 4, 4, rgba(160, 100, 60, 0.7));
  fillRect(ctx, cx + 8, cy + 2, 4, 4, rgba(160, 100, 60, 0.7));

  drawDetailNoise(ctx, cx - 12, cy - 4, 24, 16, 12, rgba(80, 50, 40, 0.3));
}

function drawRangerLodge(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(90, 70, 45, 0.95));
  fillPolygon(ctx, [
    [cx - 12, cy - 2],
    [cx + 12, cy - 2],
    [cx, cy - 14],
  ], rgba(40, 120, 60, 0.95));

  fillRect(ctx, cx - 3, cy + 2, 6, 10, rgba(50, 35, 20, 0.9));

  fillPolygon(ctx, [
    [cx + 10, cy - 8],
    [cx + 16, cy - 10],
    [cx + 14, cy - 2],
  ], rgba(200, 200, 200, 0.6));
  fillCircle(ctx, cx + 13, cy - 6, 3, rgba(220, 220, 220, 0.5));

  fillRect(ctx, cx - 14, cy - 4, 3, 8, rgba(60, 100, 50, 0.7));
  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 10, rgba(70, 50, 30, 0.3));
}

function drawZeeyaShrine(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(200, 220, 210, 0.9));
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 12, Math.PI, 0);
  ctx.fillStyle = rgba(180, 240, 220, 0.9);
  ctx.fill();

  fillRect(ctx, cx - 3, cy + 2, 6, 10, rgba(140, 200, 180, 0.7));

  drawGlow(ctx, cx, cy - 4, 10, rgba(150, 255, 200, 0.4), 0.4);
  fillCircle(ctx, cx, cy - 4, 3, rgba(200, 255, 230, 0.6));

  fillRect(ctx, cx - 12, cy + 12, 24, 3, rgba(160, 200, 190, 0.8));
  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 8, rgba(160, 200, 190, 0.3));
}

function drawMarket(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 18);

  fillRect(ctx, cx - 14, cy - 2, 28, 14, rgba(120, 100, 70, 0.9));

  fillTriangle(ctx, cx - 14, cy - 2, cx - 6, cy - 2, cx - 10, cy - 10, rgba(200, 80, 60, 0.9));
  fillTriangle(ctx, cx - 4, cy - 2, cx + 4, cy - 2, cx, cy - 10, rgba(80, 160, 200, 0.9));
  fillTriangle(ctx, cx + 6, cy - 2, cx + 14, cy - 2, cx + 10, cy - 10, rgba(200, 180, 60, 0.9));

  fillRect(ctx, cx - 12, cy + 2, 4, 8, rgba(60, 40, 20, 0.8));
  fillRect(ctx, cx - 4, cy + 2, 4, 8, rgba(60, 40, 20, 0.8));
  fillRect(ctx, cx + 4, cy + 2, 4, 8, rgba(60, 40, 20, 0.8));

  fillCircle(ctx, cx - 10, cy + 4, 2, rgba(200, 160, 60, 0.7));
  fillCircle(ctx, cx - 2, cy + 4, 2, rgba(200, 80, 60, 0.7));
  fillCircle(ctx, cx + 6, cy + 4, 2, rgba(80, 160, 200, 0.7));

  drawDetailNoise(ctx, cx - 14, cy - 2, 28, 14, 10, rgba(100, 80, 50, 0.3));
}

function drawBlacksmith(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(70, 60, 55, 0.95));
  fillPolygon(ctx, [
    [cx - 12, cy - 2],
    [cx + 12, cy - 2],
    [cx + 8, cy - 14],
    [cx - 8, cy - 14],
  ], rgba(50, 40, 35, 0.95));

  fillRect(ctx, cx - 3, cy + 2, 6, 10, rgba(30, 20, 15, 0.9));

  drawGlow(ctx, cx, cy + 6, 8, rgba(255, 120, 30, 0.5), 0.5);
  fillCircle(ctx, cx, cy + 6, 3, rgba(255, 160, 50, 0.7));
  fillCircle(ctx, cx, cy + 6, 1.5, rgba(255, 220, 100, 0.6));

  fillRect(ctx, cx + 10, cy - 8, 3, 6, rgba(80, 70, 60, 0.8));
  drawGlow(ctx, cx + 12, cy - 8, 4, rgba(200, 100, 30, 0.3), 0.3);

  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 10, rgba(50, 40, 35, 0.3));
}

function drawGuardTower(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 12);

  fillRect(ctx, cx - 6, cy - 8, 12, 22, rgba(90, 85, 80, 0.95));
  fillRect(ctx, cx - 8, cy - 12, 16, 5, rgba(70, 65, 60, 0.95));

  fillRect(ctx, cx - 4, cy - 4, 3, 4, rgba(255, 220, 100, 0.6));
  fillRect(ctx, cx + 1, cy - 4, 3, 4, rgba(255, 220, 100, 0.6));

  fillRect(ctx, cx - 8, cy - 14, 3, 4, rgba(60, 55, 50, 0.9));
  fillRect(ctx, cx + 5, cy - 14, 3, 4, rgba(60, 55, 50, 0.9));

  drawGlow(ctx, cx, cy - 10, 6, rgba(255, 200, 80, 0.3), 0.3);
  drawDetailNoise(ctx, cx - 6, cy - 8, 12, 22, 8, rgba(70, 65, 60, 0.3));
}

function drawLumberMill(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(100, 70, 40, 0.95));
  fillPolygon(ctx, [
    [cx - 12, cy - 2],
    [cx + 12, cy - 2],
    [cx, cy - 12],
  ], rgba(80, 50, 25, 0.95));

  fillRect(ctx, cx - 3, cy + 2, 6, 10, rgba(50, 30, 15, 0.9));

  fillRect(ctx, cx + 10, cy + 2, 8, 4, rgba(120, 80, 40, 0.8));
  fillRect(ctx, cx + 10, cy + 6, 8, 4, rgba(100, 65, 30, 0.8));

  ctx.beginPath();
  ctx.arc(cx - 14, cy + 8, 5, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(80, 50, 25, 0.8);
  ctx.lineWidth = 2;
  ctx.stroke();
  strokeLine(ctx, cx - 14, cy + 3, cx - 14, cy + 13, rgba(80, 50, 25, 0.7), 1);

  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 8, rgba(80, 50, 25, 0.3));
}

function drawQuarry(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(100, 100, 110, 0.9));
  fillPolygon(ctx, [
    [cx - 12, cy - 2],
    [cx + 12, cy - 2],
    [cx + 8, cy - 10],
    [cx - 8, cy - 10],
  ], rgba(80, 80, 90, 0.9));

  fillRect(ctx, cx - 14, cy + 6, 6, 6, rgba(130, 130, 140, 0.7));
  fillRect(ctx, cx + 8, cy + 6, 6, 6, rgba(130, 130, 140, 0.7));
  fillRect(ctx, cx - 14, cy + 12, 6, 2, rgba(100, 100, 110, 0.6));
  fillRect(ctx, cx + 8, cy + 12, 6, 2, rgba(100, 100, 110, 0.6));

  strokeLine(ctx, cx - 4, cy + 4, cx - 8, cy + 10, rgba(60, 60, 70, 0.7), 2);
  strokeLine(ctx, cx - 8, cy + 10, cx - 4, cy + 12, rgba(60, 60, 70, 0.7), 2);

  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 10, rgba(80, 80, 90, 0.3));
}

function drawFarm(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 8, cy - 2, 16, 12, rgba(120, 90, 50, 0.9));
  fillPolygon(ctx, [
    [cx - 10, cy - 2],
    [cx + 10, cy - 2],
    [cx, cy - 10],
  ], rgba(140, 100, 50, 0.9));

  fillRect(ctx, cx - 3, cy + 2, 6, 8, rgba(60, 40, 20, 0.9));

  for (let i = 0; i < 4; i++) {
    const fx = cx - 14 + i * 8;
    strokeLine(ctx, fx, cy + 14, fx, cy + 4, rgba(80, 140, 50, 0.6), 1.5);
    strokeLine(ctx, fx - 1, cy + 8, fx + 1, cy + 8, rgba(100, 160, 60, 0.5), 1);
  }
}

function drawManaWell(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 14);

  fillCircle(ctx, cx, cy + 4, 10, rgba(60, 40, 90, 0.9));
  fillCircle(ctx, cx, cy + 4, 7, rgba(100, 60, 160, 0.7));
  fillCircle(ctx, cx, cy + 4, 4, rgba(155, 92, 255, 0.5));

  fillPolygon(ctx, [
    [cx - 8, cy + 4],
    [cx + 8, cy + 4],
    [cx + 5, cy - 8],
    [cx - 5, cy - 8],
  ], rgba(80, 50, 120, 0.9));

  drawGlow(ctx, cx, cy + 4, 14, rgba(155, 92, 255, 0.4), 0.4);
  fillCircle(ctx, cx, cy + 4, 2, rgba(220, 180, 255, 0.6));

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    fillCircle(ctx, cx + Math.cos(a) * 9, cy + 4 + Math.sin(a) * 9, 1.5, rgba(180, 120, 255, 0.5));
  }
}

function drawWarehouse(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 16);

  fillRect(ctx, cx - 10, cy - 2, 20, 14, rgba(90, 80, 70, 0.9));
  fillPolygon(ctx, [
    [cx - 12, cy - 2],
    [cx + 12, cy - 2],
    [cx + 8, cy - 10],
    [cx - 8, cy - 10],
  ], rgba(70, 60, 50, 0.9));

  fillRect(ctx, cx - 4, cy + 2, 8, 10, rgba(40, 30, 20, 0.9));

  fillRect(ctx, cx - 14, cy + 6, 4, 6, rgba(120, 90, 50, 0.7));
  fillRect(ctx, cx + 10, cy + 6, 4, 6, rgba(120, 90, 50, 0.7));

  drawDetailNoise(ctx, cx - 10, cy - 2, 20, 14, 8, rgba(70, 60, 50, 0.3));
}

function drawHousing(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 14);

  fillRect(ctx, cx - 8, cy - 2, 16, 12, rgba(130, 100, 60, 0.9));
  fillPolygon(ctx, [
    [cx - 10, cy - 2],
    [cx + 10, cy - 2],
    [cx, cy - 10],
  ], rgba(160, 130, 70, 0.9));

  fillRect(ctx, cx - 3, cy + 2, 6, 8, rgba(60, 40, 20, 0.9));
  fillRect(ctx, cx - 7, cy - 0, 4, 4, rgba(255, 220, 100, 0.5));
  fillRect(ctx, cx + 3, cy - 0, 4, 4, rgba(255, 220, 100, 0.5));

  fillRect(ctx, cx + 6, cy - 12, 3, 4, rgba(80, 60, 40, 0.8));
  drawGlow(ctx, cx + 8, cy - 12, 3, rgba(200, 180, 100, 0.3), 0.3);
}

function drawHuntersLodge(ctx: CanvasRenderingContext2D): void {
  const cx = BASE_SIZE / 2;
  const cy = BASE_SIZE / 2;
  drawShadow(ctx, cx, cy + 16, 14);

  fillRect(ctx, cx - 9, cy - 2, 18, 12, rgba(80, 70, 45, 0.9));
  fillPolygon(ctx, [
    [cx - 11, cy - 2],
    [cx + 11, cy - 2],
    [cx, cy - 12],
  ], rgba(100, 80, 45, 0.9));

  fillRect(ctx, cx - 3, cy + 2, 6, 8, rgba(40, 30, 15, 0.9));

  strokeLine(ctx, cx - 8, cy - 8, cx - 4, cy - 6, rgba(200, 200, 200, 0.6), 1.5);
  strokeLine(ctx, cx - 8, cy - 6, cx - 4, cy - 8, rgba(200, 200, 200, 0.6), 1.5);
  strokeLine(ctx, cx + 4, cy - 8, cx + 8, cy - 6, rgba(200, 200, 200, 0.6), 1.5);
  strokeLine(ctx, cx + 4, cy - 6, cx + 8, cy - 8, rgba(200, 200, 200, 0.6), 1.5);

  drawDetailNoise(ctx, cx - 9, cy - 2, 18, 12, 8, rgba(60, 50, 30, 0.3));
}

const BUILDING_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
  TownHall: drawTownHall,
  WarriorGuild: drawWarriorGuild,
  RangerLodge: drawRangerLodge,
  ZeeyaShrine: drawZeeyaShrine,
  Market: drawMarket,
  Blacksmith: drawBlacksmith,
  GuardTower: drawGuardTower,
  LumberMill: drawLumberMill,
  Quarry: drawQuarry,
  Farm: drawFarm,
  ManaWell: drawManaWell,
  Warehouse: drawWarehouse,
  Housing: drawHousing,
  HuntersLodge: drawHuntersLodge,
};

function drawScaffold(ctx: CanvasRenderingContext2D, buildingType: string): void {
  const S = BLD_SIZE / 384;
  ctx.save();
  ctx.scale(S, S);
  const cx = 384 / 2;
  const cy = 384 / 2;

  ctx.globalAlpha = 0.5;
  fillRect(ctx, cx - 96, cy + 80, 192, 24, rgba(100, 80, 50, 0.6));
  strokeLine(ctx, cx - 80, cy + 80, cx - 80, cy - 64, rgba(120, 90, 50, 0.5), 12);
  strokeLine(ctx, cx + 80, cy + 80, cx + 80, cy - 64, rgba(120, 90, 50, 0.5), 12);
  strokeLine(ctx, cx - 80, cy - 32, cx + 80, cy - 32, rgba(120, 90, 50, 0.5), 8);
  strokeLine(ctx, cx - 80, cy + 16, cx + 80, cy + 16, rgba(120, 90, 50, 0.5), 8);
  // Cross braces
  strokeLine(ctx, cx - 80, cy + 80, cx + 80, cy - 32, rgba(100, 70, 40, 0.3), 4);
  strokeLine(ctx, cx + 80, cy + 80, cx - 80, cy - 32, rgba(100, 70, 40, 0.3), 4);

  ctx.save();
  ctx.scale(BLD_SCALE, BLD_SCALE);
  const drawer = BUILDING_DRAWERS[buildingType] ?? BUILDING_DRAWERS['WarriorGuild'];
  ctx.globalAlpha = 0.3;
  drawer(ctx);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function addBuildingDetails(ctx: CanvasRenderingContext2D, buildingType: string): void {
  const S = BLD_SIZE / 384;
  ctx.save();
  ctx.scale(S, S);
  const cx = 384 / 2;
  const cy = 384 / 2;

  if (buildingType === 'TownHall') {
    // Brick walls
    drawBrickCourse(ctx, cx - 128, cy + 16, 256, 16, 32, rgba(90, 80, 100, 0.6), rgba(60, 50, 70, 0.7), 0);
    drawBrickCourse(ctx, cx - 128, cy + 32, 256, 16, 32, rgba(90, 80, 100, 0.6), rgba(60, 50, 70, 0.7), 16);
    drawBrickCourse(ctx, cx - 128, cy + 48, 256, 16, 32, rgba(90, 80, 100, 0.6), rgba(60, 50, 70, 0.7), 0);
    // Roof shingles
    drawShingles(ctx, cx - 144, cy - 48, 288, 48, 4, 12, rgba(130, 90, 190, 0.6), rgba(80, 50, 140, 0.5));
    // Window frames with glass
    fillRect(ctx, cx - 112, cy + 0, 32, 32, rgba(40, 30, 50, 0.9));
    fillRect(ctx, cx - 108, cy + 4, 24, 24, rgba(200, 180, 100, 0.3));
    strokeLine(ctx, cx - 96, cy + 4, cx - 96, cy + 28, rgba(60, 40, 70, 0.7), 2);
    strokeLine(ctx, cx - 108, cy + 16, cx - 84, cy + 16, rgba(60, 40, 70, 0.7), 2);
    fillRect(ctx, cx + 80, cy + 0, 32, 32, rgba(40, 30, 50, 0.9));
    fillRect(ctx, cx + 84, cy + 4, 24, 24, rgba(200, 180, 100, 0.3));
    strokeLine(ctx, cx + 96, cy + 4, cx + 96, cy + 28, rgba(60, 40, 70, 0.7), 2);
    strokeLine(ctx, cx + 84, cy + 16, cx + 108, cy + 16, rgba(60, 40, 70, 0.7), 2);
    // Door grain
    drawWoodGrain(ctx, cx - 24, cy + 16, 48, 48, 6, rgba(30, 20, 40, 0.5));
    // Door hinges
    fillRect(ctx, cx - 22, cy + 20, 4, 8, rgba(160, 120, 40, 0.7));
    fillRect(ctx, cx + 18, cy + 20, 4, 8, rgba(160, 120, 40, 0.7));
    // Stone archway over door
    ctx.beginPath();
    ctx.arc(cx, cy + 16, 32, Math.PI, 0);
    ctx.strokeStyle = rgba(100, 90, 110, 0.7);
    ctx.lineWidth = 6;
    ctx.stroke();
    // Crenellations on tower
    for (let i = 0; i < 5; i++) {
      fillRect(ctx, cx - 40 + i * 20, cy - 64, 12, 12, rgba(90, 80, 100, 0.8));
    }
    // Flag pole with banner pennant
    fillRect(ctx, cx - 2, cy - 128, 4, 32, rgba(180, 140, 60, 0.9));
    fillTriangle(ctx, cx + 2, cy - 128, cx + 20, cy - 120, cx + 2, cy - 112, rgba(180, 50, 60, 0.8));
    fillTriangle(ctx, cx + 2, cy - 116, cx + 16, cy - 110, cx + 2, cy - 104, rgba(140, 40, 50, 0.7));
    drawSparkles(ctx, cx - 16, cy - 80, 32, 32, 6, rgba(200, 150, 255, 0.4));
  } else if (buildingType === 'WarriorGuild') {
    drawBrickCourse(ctx, cx - 96, cy + 8, 192, 16, 28, rgba(110, 70, 60, 0.6), rgba(80, 50, 40, 0.7), 0);
    drawBrickCourse(ctx, cx - 96, cy + 24, 192, 16, 28, rgba(110, 70, 60, 0.6), rgba(80, 50, 40, 0.7), 14);
    drawShingles(ctx, cx - 112, cy - 32, 224, 32, 3, 10, rgba(170, 60, 60, 0.6), rgba(120, 40, 40, 0.5));
    // Weapon rack detail
    strokeLine(ctx, cx - 128, cy + 64, cx - 80, cy + 16, rgba(180, 180, 200, 0.7), 4);
    strokeLine(ctx, cx - 128, cy + 64, cx - 80, cy + 16, rgba(255, 255, 255, 0.4), 2);
    fillCircle(ctx, cx - 128, cy + 64, 8, rgba(140, 80, 40, 0.8));
    drawRivets(ctx, cx - 128, cy + 64, cx - 80, cy + 16, 12, rgba(200, 160, 80, 0.6));
    // Anvil
    fillRect(ctx, cx + 64, cy + 32, 32, 16, rgba(60, 55, 50, 0.8));
    fillRect(ctx, cx + 72, cy + 48, 16, 16, rgba(40, 35, 30, 0.7));
    // Window
    fillRect(ctx, cx + 64, cy - 16, 24, 24, rgba(40, 25, 20, 0.8));
    fillRect(ctx, cx + 68, cy - 12, 16, 16, rgba(200, 160, 80, 0.3));
  } else if (buildingType === 'Blacksmith') {
    // Chimney smoke
    for (let i = 0; i < 5; i++) {
      fillCircle(ctx, cx + 80, cy - 64 - i * 16, 8 + i * 3, rgba(120, 120, 130, 0.15));
    }
    // Forge embers
    drawEmbers(ctx, cx - 16, cy + 32, 32, 32, 20);
    drawGlow(ctx, cx, cy + 40, 24, rgba(255, 120, 30, 0.5), 0.5);
    // Anvil detail
    fillRect(ctx, cx + 64, cy + 24, 40, 20, rgba(50, 45, 40, 0.9));
    fillRect(ctx, cx + 72, cy + 44, 24, 16, rgba(30, 25, 20, 0.8));
    drawRivets(ctx, cx + 64, cy + 24, cx + 104, cy + 24, 8, rgba(160, 140, 100, 0.6));
    // Wall stone texture
    drawPebbles(ctx, cx - 80, cy + 0, 160, 80, 30, rgba(60, 50, 45, 0.4));
  } else if (buildingType === 'ManaWell') {
    // Magical sparkles
    drawSparkles(ctx, cx - 40, cy - 40, 80, 80, 20, rgba(200, 150, 255, 0.6));
    // Floating runes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dist = 48 + Math.sin(i) * 8;
      fillCircle(ctx, cx + Math.cos(a) * dist, cy + 32 + Math.sin(a) * dist, 6, rgba(180, 120, 255, 0.5));
      strokeLine(ctx, cx + Math.cos(a) * dist - 3, cy + 32 + Math.sin(a) * dist - 3, cx + Math.cos(a) * dist + 3, cy + 32 + Math.sin(a) * dist + 3, rgba(220, 180, 255, 0.4), 1.5);
    }
    drawGlow(ctx, cx, cy + 32, 48, rgba(155, 92, 255, 0.4), 0.4);
  } else if (buildingType === 'ZeeyaShrine') {
    // Holy glow
    drawSparkles(ctx, cx - 32, cy - 32, 64, 64, 15, rgba(150, 255, 200, 0.5));
    // Marble veins
    drawCracks(ctx, cx, cy + 16, 80, 6, rgba(180, 240, 220, 0.3));
    // Offering bowl
    fillCircle(ctx, cx, cy + 48, 16, rgba(160, 200, 190, 0.7));
    fillCircle(ctx, cx, cy + 48, 10, rgba(200, 255, 230, 0.4));
  } else if (buildingType === 'GuardTower') {
    // Arrow slits
    fillRect(ctx, cx - 24, cy + 0, 8, 24, rgba(20, 15, 10, 0.9));
    fillRect(ctx, cx + 16, cy + 0, 8, 24, rgba(20, 15, 10, 0.9));
    // Battlement details
    drawPebbles(ctx, cx - 48, cy - 96, 96, 24, 20, rgba(80, 75, 70, 0.5));
    // Torch glow
    drawGlow(ctx, cx - 32, cy - 80, 16, rgba(255, 180, 60, 0.4), 0.4);
    drawGlow(ctx, cx + 32, cy - 80, 16, rgba(255, 180, 60, 0.4), 0.4);
    drawEmbers(ctx, cx - 40, cy - 96, 16, 16, 6);
    drawEmbers(ctx, cx + 24, cy - 96, 16, 16, 6);
  } else if (buildingType === 'Farm') {
    // Crop rows
    for (let i = 0; i < 8; i++) {
      const fx = cx - 112 + i * 28;
      strokeLine(ctx, fx, cy + 112, fx, cy + 32, rgba(80, 140, 50, 0.6), 4);
      strokeLine(ctx, fx - 3, cy + 60, fx + 3, cy + 60, rgba(100, 160, 60, 0.5), 2);
      strokeLine(ctx, fx - 3, cy + 80, fx + 3, cy + 80, rgba(100, 160, 60, 0.5), 2);
      strokeLine(ctx, fx - 3, cy + 100, fx + 3, cy + 100, rgba(100, 160, 60, 0.5), 2);
    }
    // Wood grain on barn
    drawWoodGrain(ctx, cx - 64, cy + 0, 128, 80, 8, rgba(80, 60, 30, 0.4));
  } else if (buildingType === 'LumberMill') {
    // Wood pile detail
    for (let i = 0; i < 4; i++) {
      const py = cy + 16 + i * 24;
      fillRect(ctx, cx + 64, py, 64, 20, rgba(120, 80, 40, 0.8));
      fillCircle(ctx, cx + 64, py + 10, 10, rgba(100, 65, 30, 0.7));
      fillCircle(ctx, cx + 128, py + 10, 10, rgba(100, 65, 30, 0.7));
      drawWoodGrain(ctx, cx + 64, py, 64, 20, 3, rgba(80, 50, 25, 0.5));
    }
    // Saw blade
    ctx.beginPath();
    ctx.arc(cx - 112, cy + 64, 24, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(180, 180, 200, 0.7);
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      strokeLine(ctx, cx - 112 + Math.cos(a) * 20, cy + 64 + Math.sin(a) * 20, cx - 112 + Math.cos(a) * 28, cy + 64 + Math.sin(a) * 28, rgba(200, 200, 220, 0.6), 2);
    }
  } else if (buildingType === 'Quarry') {
    // Stone blocks detail
    drawPebbles(ctx, cx - 80, cy + 32, 160, 48, 40, rgba(130, 130, 140, 0.5));
    drawCracks(ctx, cx, cy + 16, 80, 8, rgba(60, 60, 70, 0.4));
    // Mining pick
    strokeLine(ctx, cx - 32, cy + 64, cx + 16, cy + 16, rgba(100, 70, 40, 0.7), 4);
    fillTriangle(ctx, cx + 16, cy + 16, cx + 32, cy + 8, cx + 24, cy + 24, rgba(160, 160, 180, 0.7));
  } else if (buildingType === 'Market') {
    // Goods detail
    fillCircle(ctx, cx - 80, cy + 32, 10, rgba(200, 160, 60, 0.7));
    fillCircle(ctx, cx - 72, cy + 36, 8, rgba(180, 140, 40, 0.6));
    fillCircle(ctx, cx - 16, cy + 32, 10, rgba(200, 80, 60, 0.7));
    fillCircle(ctx, cx - 8, cy + 36, 8, rgba(180, 60, 40, 0.6));
    fillCircle(ctx, cx + 48, cy + 32, 10, rgba(80, 160, 200, 0.7));
    fillCircle(ctx, cx + 56, cy + 36, 8, rgba(60, 140, 180, 0.6));
    // Canvas stripes
    for (let i = 0; i < 3; i++) {
      const tx = cx - 112 + i * 80;
      strokeLine(ctx, tx, cy - 16, tx + 40, cy - 80, rgba(200, 200, 200, 0.3), 2);
    }
  } else if (buildingType === 'Housing') {
    // Window glow
    drawGlow(ctx, cx - 48, cy + 0, 16, rgba(255, 220, 100, 0.3), 0.3);
    drawGlow(ctx, cx + 48, cy + 0, 16, rgba(255, 220, 100, 0.3), 0.3);
    // Chimney smoke
    for (let i = 0; i < 3; i++) {
      fillCircle(ctx, cx + 48, cy - 96 - i * 16, 6 + i * 3, rgba(140, 140, 150, 0.12));
    }
    drawWoodGrain(ctx, cx - 24, cy + 16, 48, 64, 5, rgba(50, 35, 20, 0.4));
  } else if (buildingType === 'HuntersLodge') {
    // Trophy antlers detail
    strokeLine(ctx, cx - 64, cy - 64, cx - 96, cy - 80, rgba(200, 200, 200, 0.7), 3);
    strokeLine(ctx, cx - 64, cy - 64, cx - 96, cy - 48, rgba(200, 200, 200, 0.7), 3);
    strokeLine(ctx, cx + 64, cy - 64, cx + 96, cy - 80, rgba(200, 200, 200, 0.7), 3);
    strokeLine(ctx, cx + 64, cy - 64, cx + 96, cy - 48, rgba(200, 200, 200, 0.7), 3);
    // Wood grain
    drawWoodGrain(ctx, cx - 72, cy + 0, 144, 80, 8, rgba(60, 50, 30, 0.4));
  } else if (buildingType === 'Warehouse') {
 // Crate details
 for (let i = 0; i < 3; i++) {
   const bx = cx - 112 + i * 72;
   fillRect(ctx, bx, cy + 32, 56, 40, rgba(120, 90, 50, 0.7));
   strokeRect(ctx, bx, cy + 32, 56, 40, rgba(80, 60, 30, 0.6), 2);
   strokeLine(ctx, bx + 28, cy + 32, bx + 28, cy + 72, rgba(80, 60, 30, 0.5), 1.5);
   strokeLine(ctx, bx, cy + 52, bx + 56, cy + 52, rgba(80, 60, 30, 0.5), 1.5);
 }
 drawWoodGrain(ctx, cx - 80, cy + 0, 160, 80, 8, rgba(70, 60, 50, 0.3));
  } else if (buildingType === 'RangerLodge') {
    // Animal skin drying
    fillPolygon(ctx, [[cx + 80, cy - 64], [cx + 128, cy - 80], [cx + 120, cy - 16], [cx + 88, cy - 24]], rgba(180, 140, 100, 0.5));
    drawDetailNoise(ctx, cx + 80, cy - 80, 48, 64, 20, rgba(140, 100, 60, 0.3));
    // Bow rack
    strokeLine(ctx, cx - 96, cy - 48, cx - 64, cy - 48, rgba(120, 80, 40, 0.7), 3);
    ctx.beginPath();
    ctx.arc(cx - 80, cy - 48, 16, Math.PI * 0.2, Math.PI * 0.8);
    ctx.strokeStyle = rgba(140, 100, 50, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    // Campfire ring
    fillCircle(ctx, cx - 80, cy + 80, 12, rgba(60, 40, 20, 0.5));
    drawEmbers(ctx, cx - 88, cy + 72, 16, 16, 8);
    // Wood grain
    drawWoodGrain(ctx, cx - 80, cy + 0, 160, 80, 8, rgba(60, 50, 30, 0.4));
  }

  ctx.restore();

  // New high-res details at 512px native resolution
  const hx = BLD_SIZE / 2;
  const hy = BLD_SIZE / 2;

  if (buildingType === 'WarriorGuild') {
    // Training dummy
    fillRect(ctx, hx - 140, hy + 60, 4, 40, rgba(100, 70, 40, 0.7));
    fillCircle(ctx, hx - 138, hy + 56, 12, rgba(180, 140, 100, 0.6));
    fillCircle(ctx, hx - 138, hy + 56, 8, rgba(160, 120, 80, 0.5));
    // Visible swords on rack
    strokeLine(ctx, hx - 120, hy + 20, hx - 100, hy - 10, rgba(200, 200, 220, 0.6), 2);
    strokeLine(ctx, hx - 115, hy + 20, hx - 95, hy - 10, rgba(200, 200, 220, 0.6), 2);
    fillRect(ctx, hx - 122, hy + 18, 10, 6, rgba(120, 80, 40, 0.7));
  } else if (buildingType === 'Blacksmith') {
    // Bellows
    fillPolygon(ctx, [[hx + 80, hy + 40], [hx + 110, hy + 30], [hx + 110, hy + 50], [hx + 80, hy + 50]], rgba(80, 60, 40, 0.7));
    strokeLine(ctx, hx + 110, hy + 40, hx + 130, hy + 40, rgba(60, 45, 30, 0.6), 4);
    // Hammer on anvil
    fillRect(ctx, hx + 70, hy + 20, 24, 8, rgba(140, 140, 150, 0.8));
    strokeLine(ctx, hx + 82, hy + 24, hx + 82, hy + 40, rgba(80, 60, 40, 0.7), 3);
    // Spark particles
    drawSparkles(ctx, hx - 30, hy + 30, 60, 40, 12, rgba(255, 180, 60, 0.5));
  } else if (buildingType === 'ManaWell') {
    // Floating crystal shards
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const r = 40 + Math.sin(i * 2) * 8;
      const sx = hx + Math.cos(a) * r;
      const sy = hy + 20 + Math.sin(a) * r * 0.6;
      fillPolygon(ctx, [[sx, sy - 8], [sx + 5, sy], [sx, sy + 8], [sx - 5, sy]], rgba(180, 120, 255, 0.5));
    }
    // Runic circle on ground
    ctx.beginPath();
    ctx.arc(hx, hy + 60, 50, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(155, 92, 255, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx, hy + 60, 40, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(200, 150, 255, 0.2);
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (buildingType === 'ZeeyaShrine') {
    // Stained glass window
    fillCircle(ctx, hx, hy - 40, 20, rgba(150, 255, 200, 0.2));
    fillCircle(ctx, hx - 8, hy - 44, 8, rgba(100, 200, 255, 0.3));
    fillCircle(ctx, hx + 8, hy - 36, 8, rgba(255, 200, 100, 0.3));
    strokeLine(ctx, hx - 20, hy - 40, hx + 20, hy - 40, rgba(180, 240, 220, 0.4), 1.5);
    strokeLine(ctx, hx, hy - 60, hx, hy - 20, rgba(180, 240, 220, 0.4), 1.5);
    // Offering altar with fruit
    fillRect(ctx, hx - 16, hy + 60, 32, 8, rgba(160, 200, 190, 0.6));
    fillCircle(ctx, hx - 8, hy + 56, 5, rgba(255, 100, 80, 0.6));
    fillCircle(ctx, hx + 4, hy + 56, 5, rgba(200, 255, 100, 0.5));
    fillCircle(ctx, hx + 10, hy + 56, 4, rgba(255, 200, 80, 0.5));
  } else if (buildingType === 'GuardTower') {
    // Flag at top
    fillRect(ctx, hx - 1, hy - 150, 2, 30, rgba(180, 140, 60, 0.8));
    fillTriangle(ctx, hx + 1, hy - 150, hx + 18, hy - 142, hx + 1, hy - 134, rgba(100, 160, 220, 0.7));
    // Torch brackets with flame glow
    drawGlow(ctx, hx - 40, hy - 90, 20, rgba(255, 160, 40, 0.5), 0.5);
    drawGlow(ctx, hx + 40, hy - 90, 20, rgba(255, 160, 40, 0.5), 0.5);
    fillCircle(ctx, hx - 40, hy - 90, 4, rgba(255, 200, 80, 0.7));
    fillCircle(ctx, hx + 40, hy - 90, 4, rgba(255, 200, 80, 0.7));
  } else if (buildingType === 'Farm') {
    // Windmill blades
    ctx.save();
    ctx.translate(hx, hy - 60);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      fillPolygon(ctx, [[0, 0], [4, -30], [-4, -30]], rgba(160, 130, 80, 0.6));
    }
    ctx.restore();
    fillCircle(ctx, hx, hy - 60, 6, rgba(100, 70, 40, 0.7));
    // Fenced crop rows
    for (let i = 0; i < 6; i++) {
      const fx = hx - 120 + i * 40;
      strokeLine(ctx, fx, hy + 80, fx, hy + 120, rgba(100, 70, 40, 0.5), 2);
    }
    // Scarecrow
    fillRect(ctx, hx + 100, hy + 40, 3, 30, rgba(80, 60, 30, 0.6));
    fillCircle(ctx, hx + 101, hy + 36, 8, rgba(120, 100, 60, 0.5));
    fillRect(ctx, hx + 93, hy + 42, 18, 4, rgba(100, 80, 50, 0.5));
  } else if (buildingType === 'Market') {
    // Canvas awnings with stripes
    for (let i = 0; i < 4; i++) {
      const ax = hx - 140 + i * 70;
      fillPolygon(ctx, [[ax, hy - 20], [ax + 60, hy - 20], [ax + 55, hy - 40], [ax + 5, hy - 40]], rgba(200, 180, 140, 0.5));
      strokeLine(ctx, ax + 10, hy - 22, ax + 50, hy - 22, rgba(160, 140, 100, 0.3), 1.5);
      strokeLine(ctx, ax + 15, hy - 28, ax + 45, hy - 28, rgba(160, 140, 100, 0.3), 1.5);
    }
    // Crates with goods
    fillRect(ctx, hx - 120, hy + 50, 24, 24, rgba(120, 90, 50, 0.6));
    fillRect(ctx, hx + 100, hy + 50, 24, 24, rgba(100, 80, 40, 0.6));
    fillCircle(ctx, hx - 108, hy + 56, 5, rgba(200, 160, 60, 0.5));
    fillCircle(ctx, hx + 112, hy + 56, 5, rgba(80, 160, 200, 0.5));
  } else if (buildingType === 'LumberMill') {
    // Saw blade teeth
    ctx.beginPath();
    ctx.arc(hx - 120, hy + 60, 28, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(180, 180, 200, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x1 = hx - 120 + Math.cos(a) * 24;
      const y1 = hy + 60 + Math.sin(a) * 24;
      const x2 = hx - 120 + Math.cos(a) * 32;
      const y2 = hy + 60 + Math.sin(a) * 32;
      fillPolygon(ctx, [[x1, y1], [x2, y2], [x1 + Math.cos(a + 0.15) * 28, y1 + Math.sin(a + 0.15) * 28]], rgba(200, 200, 220, 0.5));
    }
    // Log stack with bark texture
    for (let i = 0; i < 3; i++) {
      const ly = hy + 80 + i * 16;
      fillRect(ctx, hx + 60, ly, 80, 14, rgba(100, 70, 40, 0.6));
      fillCircle(ctx, hx + 60, ly + 7, 7, rgba(80, 55, 30, 0.5));
      fillCircle(ctx, hx + 140, ly + 7, 7, rgba(80, 55, 30, 0.5));
    }
  } else if (buildingType === 'Quarry') {
    // Mine cart tracks
    strokeLine(ctx, hx - 60, hy + 80, hx + 60, hy + 80, rgba(80, 70, 60, 0.5), 3);
    strokeLine(ctx, hx - 60, hy + 88, hx + 60, hy + 88, rgba(80, 70, 60, 0.5), 3);
    for (let i = 0; i < 5; i++) {
      strokeLine(ctx, hx - 50 + i * 25, hy + 78, hx - 50 + i * 25, hy + 90, rgba(70, 60, 50, 0.4), 1.5);
    }
    // Stone blocks stacked
    for (let i = 0; i < 3; i++) {
      fillRect(ctx, hx - 100 + i * 30, hy + 40, 26, 20, rgba(130, 130, 140, 0.5));
      strokeRect(ctx, hx - 100 + i * 30, hy + 40, 26, 20, rgba(90, 90, 100, 0.4), 1.5);
    }
  } else if (buildingType === 'Warehouse') {
    // Rope ties on crates
    for (let i = 0; i < 3; i++) {
      const bx = hx - 120 + i * 80;
      strokeLine(ctx, bx + 14, hy + 40, bx + 14, hy + 80, rgba(120, 100, 70, 0.4), 2);
      strokeLine(ctx, bx, hy + 60, bx + 28, hy + 60, rgba(120, 100, 70, 0.4), 2);
    }
    // Loading ramp
    fillPolygon(ctx, [[hx + 100, hy + 60], [hx + 140, hy + 60], [hx + 140, hy + 80], [hx + 120, hy + 80]], rgba(100, 80, 50, 0.5));
  } else if (buildingType === 'Housing') {
    // Window flower boxes
    fillRect(ctx, hx - 60, hy + 10, 24, 8, rgba(80, 60, 40, 0.6));
    fillCircle(ctx, hx - 54, hy + 8, 3, rgba(255, 100, 100, 0.5));
    fillCircle(ctx, hx - 48, hy + 8, 3, rgba(255, 200, 100, 0.5));
    fillCircle(ctx, hx - 42, hy + 8, 3, rgba(200, 100, 255, 0.5));
    fillRect(ctx, hx + 40, hy + 10, 24, 8, rgba(80, 60, 40, 0.6));
    fillCircle(ctx, hx + 46, hy + 8, 3, rgba(255, 150, 100, 0.5));
    fillCircle(ctx, hx + 52, hy + 8, 3, rgba(200, 255, 100, 0.5));
  } else if (buildingType === 'HuntersLodge') {
    // Animal skin drying rack
    strokeLine(ctx, hx + 80, hy + 40, hx + 80, hy + 80, rgba(80, 60, 40, 0.6), 3);
    strokeLine(ctx, hx + 100, hy + 40, hx + 100, hy + 80, rgba(80, 60, 40, 0.6), 3);
    strokeLine(ctx, hx + 80, hy + 40, hx + 100, hy + 40, rgba(80, 60, 40, 0.6), 2);
    fillPolygon(ctx, [[hx + 82, hy + 44], [hx + 98, hy + 44], [hx + 96, hy + 70], [hx + 84, hy + 70]], rgba(160, 120, 80, 0.4));
  }
}

export function generateBuildingTexture(buildingType: string, isBuilt: boolean): string {
  const key = `building:${buildingType}:${isBuilt ? 'built' : 'unbuilt'}`;
  if (textureFactory.has(key)) return key;

  const { canvas, ctx } = createCanvas(BLD_SIZE);

  if (isBuilt) {
    // Draw base shape at 48px coordinate space, scaled 8x
    ctx.save();
    ctx.scale(BLD_SCALE, BLD_SCALE);
    const drawer = BUILDING_DRAWERS[buildingType] ?? BUILDING_DRAWERS['WarriorGuild'];
    drawer(ctx);
    ctx.restore();
    // Add fine details at 384px resolution
    addBuildingDetails(ctx, buildingType);
  } else {
    drawScaffold(ctx, buildingType);
  }

  textureFactory.register(key, canvas);
  return key;
}
