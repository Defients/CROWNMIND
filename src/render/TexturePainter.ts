type Ctx = CanvasRenderingContext2D;

export function createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

export function clear(ctx: Ctx, size: number): void {
  ctx.clearRect(0, 0, size, size);
}

export function fillCircle(ctx: Ctx, cx: number, cy: number, r: number, color: string): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeCircle(ctx: Ctx, cx: number, cy: number, r: number, color: string, width: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function fillRect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function strokeRect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, width: number): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(x, y, w, h);
}

export function fillPolygon(ctx: Ctx, points: Array<[number, number]>, color: string): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokePolygon(ctx: Ctx, points: Array<[number, number]>, color: string, width: number): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function fillTriangle(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeLine(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, width: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function fillArc(ctx: Ctx, cx: number, cy: number, r: number, startAngle: number, endAngle: number, color: string): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.fillStyle = color;
  ctx.fill();
}

export function fillStar(ctx: Ctx, cx: number, cy: number, spikes: number, outerR: number, innerR: number, color: string): void {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerR;
    y = cy + Math.sin(rot) * outerR;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerR;
    y = cy + Math.sin(rot) * innerR;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function fillGradientCircle(ctx: Ctx, cx: number, cy: number, r: number, innerColor: string, outerColor: string): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(1, outerColor);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

export function fillGradientRect(ctx: Ctx, x: number, y: number, w: number, h: number, topColor: string, bottomColor: string): void {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

export function drawGlow(ctx: Ctx, cx: number, cy: number, r: number, color: string, intensity: number = 0.4): void {
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

export function drawShadow(ctx: Ctx, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();
}

export function drawDetailNoise(ctx: Ctx, x: number, y: number, w: number, h: number, density: number, color: string): void {
  const count = Math.floor(density);
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const size = Math.random() * 1.5 + 0.5;
    ctx.globalAlpha = Math.random() * 0.3 + 0.1;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
  }
  ctx.globalAlpha = 1;
}

export function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)$/, `${alpha})`);
}

export function rgba(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${r},${g},${b},${a})`;
}

export function hsl(h: number, s: number, l: number, a: number = 1): string {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

export function drawGrassBlades(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, baseColor: string): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const bladeH = 3 + Math.random() * 6;
    const tilt = (Math.random() - 0.5) * 4;
    ctx.globalAlpha = 0.3 + Math.random() * 0.4;
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 0.8 + Math.random() * 0.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + tilt, py - bladeH);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawPebbles(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, baseColor: string): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const r = 1 + Math.random() * 3;
    ctx.globalAlpha = 0.2 + Math.random() * 0.4;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawWaterRipples(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const r = 2 + Math.random() * 5;
    ctx.globalAlpha = 0.1 + Math.random() * 0.2;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawSandGrains(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    ctx.globalAlpha = 0.15 + Math.random() * 0.3;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, 1 + Math.random(), 1 + Math.random());
  }
  ctx.globalAlpha = 1;
}

export function drawSnowSparkles(ctx: Ctx, x: number, y: number, w: number, h: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    ctx.globalAlpha = 0.3 + Math.random() * 0.5;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(px, py, 1.5, 1.5);
    if (Math.random() < 0.3) {
      ctx.fillRect(px - 2, py, 1, 1);
      ctx.fillRect(px + 2, py, 1, 1);
      ctx.fillRect(px, py - 2, 1, 1);
      ctx.fillRect(px, py + 2, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

export function drawLeafCluster(ctx: Ctx, cx: number, cy: number, r: number, baseColor: string, density: number): void {
  for (let i = 0; i < density; i++) {
    const a = Math.random() * Math.PI * 2;
    const dist = Math.random() * r;
    const px = cx + Math.cos(a) * dist;
    const py = cy + Math.sin(a) * dist;
    const sz = 2 + Math.random() * 3;
    ctx.globalAlpha = 0.4 + Math.random() * 0.4;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(px, py, sz, sz * 0.6, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCorruptionVeins(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let cx = sx, cy = sy;
    const segments = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segments; s++) {
      cx += (Math.random() - 0.5) * 15;
      cy += (Math.random() - 0.5) * 15;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawRivets(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, spacing: number, color: string): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const count = Math.floor(len / spacing);
  const nx = dx / len;
  const ny = dy / len;
  for (let i = 0; i <= count; i++) {
    const px = x1 + nx * i * spacing;
    const py = y1 + ny * i * spacing;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(px - 0.3, py - 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBrickCourse(ctx: Ctx, x: number, y: number, w: number, brickH: number, brickW: number, baseColor: string, mortarColor: string, offset: number = 0): void {
  ctx.fillStyle = mortarColor;
  ctx.fillRect(x, y, w, brickH);
  let bx = x + offset;
  while (bx < x + w) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(bx + 1, y + 1, brickW - 2, brickH - 2);
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(bx + 1, y + brickH * 0.4, brickW - 2, 1);
    ctx.globalAlpha = 1;
    bx += brickW;
  }
}

export function drawShingles(ctx: Ctx, x: number, y: number, w: number, h: number, rows: number, cols: number, baseColor: string, shadowColor: string): void {
  const shingleW = w / cols;
  const shingleH = h / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * shingleW * 0.5;
    for (let c = -1; c < cols; c++) {
      const sx = x + c * shingleW + offset;
      const sy = y + r * shingleH;
      ctx.fillStyle = baseColor;
      ctx.fillRect(sx + 1, sy + 1, shingleW - 2, shingleH - 1);
      ctx.fillStyle = shadowColor;
      ctx.fillRect(sx + 1, sy + shingleH - 2, shingleW - 2, 1);
    }
  }
}

export function drawClothFolds(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const fx = x + (i + 0.5) * w / count;
    ctx.globalAlpha = 0.15 + Math.random() * 0.15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, y);
    ctx.quadraticCurveTo(fx + (Math.random() - 0.5) * 6, y + h * 0.5, fx + (Math.random() - 0.5) * 4, y + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawScales(ctx: Ctx, x: number, y: number, w: number, h: number, scaleSize: number, baseColor: string, highlightColor: string): void {
  const rows = Math.ceil(h / (scaleSize * 0.6));
  const cols = Math.ceil(w / scaleSize);
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * scaleSize * 0.5;
    for (let c = -1; c < cols; c++) {
      const sx = x + c * scaleSize + offset;
      const sy = y + r * scaleSize * 0.6;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.ellipse(sx, sy, scaleSize * 0.5, scaleSize * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.ellipse(sx - scaleSize * 0.15, sy - scaleSize * 0.1, scaleSize * 0.2, scaleSize * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

export function drawEyeDetail(ctx: Ctx, cx: number, cy: number, r: number, irisColor: string): void {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(10,10,10,0.95)';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSparkles(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const sz = 1 + Math.random() * 2;
    ctx.globalAlpha = 0.3 + Math.random() * 0.5;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, sz, sz);
    ctx.fillRect(px - sz, py + sz * 0.4, sz * 3, sz * 0.3);
    ctx.fillRect(px + sz * 0.4, py - sz, sz * 0.3, sz * 3);
    ctx.globalAlpha = 1;
  }
}

export function drawCracks(ctx: Ctx, cx: number, cy: number, r: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const startR = r * 0.2;
    const endR = r * (0.6 + Math.random() * 0.4);
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + Math.random() * 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * startR, cy + Math.sin(a) * startR);
    const midR = (startR + endR) / 2;
    const midA = a + (Math.random() - 0.5) * 0.5;
    ctx.lineTo(cx + Math.cos(midA) * midR, cy + Math.sin(midA) * midR);
    ctx.lineTo(cx + Math.cos(a) * endR, cy + Math.sin(a) * endR);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawEmbers(ctx: Ctx, x: number, y: number, w: number, h: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const sz = 1 + Math.random() * 2;
    const heat = Math.random();
    ctx.globalAlpha = 0.4 + Math.random() * 0.4;
    ctx.fillStyle = `rgba(255,${100 + heat * 100},${20 + heat * 40},1)`;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawWoodGrain(ctx: Ctx, x: number, y: number, w: number, h: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    const ly = y + (i + 0.5) * h / count;
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + Math.random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    for (let lx = x; lx < x + w; lx += 5) {
      ctx.lineTo(lx, ly + Math.sin(lx * 0.1 + i) * 1.5);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawChainmail(ctx: Ctx, x: number, y: number, w: number, h: number, ringSize: number, color: string): void {
  const rows = Math.ceil(h / (ringSize * 0.7));
  const cols = Math.ceil(w / ringSize);
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * ringSize * 0.5;
    for (let c = -1; c < cols; c++) {
      const rx = x + c * ringSize + offset;
      const ry = y + r * ringSize * 0.7;
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(rx, ry, ringSize * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
