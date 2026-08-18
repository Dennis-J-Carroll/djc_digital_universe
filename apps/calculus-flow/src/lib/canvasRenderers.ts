// ============================================================
// Canvas Renderers for Calculus Flow
// ============================================================

import type { MathFunction, FunctionPreset, RiemannType } from './mathFunctions';
import { calculateRiemannSum, getFunctionRange } from './mathFunctions';

// ---- Coordinate Transformations ----
export interface CoordSystem {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  paddingLeft: number;
  paddingBottom: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
}

export function createCoordSystem(
  canvasWidth: number,
  canvasHeight: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  paddingLeft = 60,
  paddingBottom = 30
): CoordSystem {
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    paddingLeft,
    paddingBottom,
    width: canvasWidth - paddingLeft,
    height: canvasHeight - paddingBottom,
    canvasWidth,
    canvasHeight,
  };
}

export function mathToCanvas(cs: CoordSystem, x: number, y: number): [number, number] {
  const px = cs.paddingLeft + ((x - cs.xMin) / (cs.xMax - cs.xMin)) * cs.width;
  const py = cs.height - ((y - cs.yMin) / (cs.yMax - cs.yMin)) * cs.height;
  return [px, py];
}

export function canvasToMath(cs: CoordSystem, px: number, py: number): [number, number] {
  const x = cs.xMin + ((px - cs.paddingLeft) / cs.width) * (cs.xMax - cs.xMin);
  const y = cs.yMin + ((cs.height - py) / cs.height) * (cs.yMax - cs.yMin);
  return [x, y];
}

// ---- Intuitive Mode Tooltip Drawing ----

export function drawTip(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  text: string,
  align: 'left' | 'center' | 'right' = 'left'
): void {
  ctx.save();
  ctx.font = '11px "JetBrains Mono", monospace';
  const paddingX = 6;
  const paddingY = 4;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const boxW = textW + paddingX * 2;
  const boxH = 14 + paddingY * 2;
  const radius = 6;

  let bx = px;
  if (align === 'left') bx = px + 8;
  else if (align === 'right') bx = px - boxW - 8;
  else bx = px - boxW / 2;

  const by = py - boxH / 2;

  // Background
  ctx.fillStyle = 'rgba(10, 14, 39, 0.85)';
  ctx.beginPath();
  ctx.moveTo(bx + radius, by);
  ctx.lineTo(bx + boxW - radius, by);
  ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + radius);
  ctx.lineTo(bx + boxW, by + boxH - radius);
  ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - radius, by + boxH);
  ctx.lineTo(bx + radius, by + boxH);
  ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - radius);
  ctx.lineTo(bx, by + radius);
  ctx.quadraticCurveTo(bx, by, bx + radius, by);
  ctx.closePath();
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#94a3b8';
  ctx.textBaseline = 'middle';
  if (align === 'left') ctx.textAlign = 'left';
  else if (align === 'right') ctx.textAlign = 'right';
  else ctx.textAlign = 'center';
  ctx.fillText(text, align === 'center' ? px : (align === 'left' ? bx + paddingX : bx + boxW - paddingX), by + boxH / 2);
  ctx.restore();
}

// ---- Common Drawing Functions ----

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  // Background
  ctx.fillStyle = '#0c1030';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial gradient
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width * 0.7
  );
  gradient.addColorStop(0, 'rgba(17, 24, 53, 0.3)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(ctx: CanvasRenderingContext2D, cs: CoordSystem): void {
  ctx.save();

  // Grid lines at integer values
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);

  // Vertical grid lines
  const xStart = Math.ceil(cs.xMin);
  const xEnd = Math.floor(cs.xMax);
  for (let x = xStart; x <= xEnd; x++) {
    const [px, _py] = mathToCanvas(cs, x, cs.yMin);
    const [_px2, pyTop] = mathToCanvas(cs, x, cs.yMax);
    ctx.beginPath();
    ctx.moveTo(px, pyTop);
    ctx.lineTo(px, _py);
    ctx.stroke();
  }

  // Horizontal grid lines
  const yStart = Math.ceil(cs.yMin);
  const yEnd = Math.floor(cs.yMax);
  for (let y = yStart; y <= yEnd; y++) {
    const [_px, py] = mathToCanvas(cs, cs.xMin, y);
    const [pxRight, _py2] = mathToCanvas(cs, cs.xMax, y);
    ctx.beginPath();
    ctx.moveTo(cs.paddingLeft, py);
    ctx.lineTo(pxRight, py);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawAxes(ctx: CanvasRenderingContext2D, cs: CoordSystem): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // X-axis
  const [xLeft, yAxisY] = mathToCanvas(cs, cs.xMin, 0);
  const [xRight, _y2] = mathToCanvas(cs, cs.xMax, 0);
  if (0 >= cs.yMin && 0 <= cs.yMax) {
    ctx.beginPath();
    ctx.moveTo(xLeft, yAxisY);
    ctx.lineTo(xRight, yAxisY);
    ctx.stroke();
  }

  // Y-axis
  const [yAxisX, yBottom] = mathToCanvas(cs, 0, cs.yMin);
  const [_x2, yTop] = mathToCanvas(cs, 0, cs.yMax);
  if (0 >= cs.xMin && 0 <= cs.xMax) {
    ctx.beginPath();
    ctx.moveTo(yAxisX, yBottom);
    ctx.lineTo(yAxisX, yTop);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawAxisLabels(ctx: CanvasRenderingContext2D, cs: CoordSystem): void {
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // X-axis labels
  const xStart = Math.ceil(cs.xMin);
  const xEnd = Math.floor(cs.xMax);
  for (let x = xStart; x <= xEnd; x++) {
    const [px, py] = mathToCanvas(cs, x, cs.yMin);
    ctx.fillText(x.toString(), px, py + 4);
  }

  // Y-axis labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yStart = Math.ceil(cs.yMin);
  const yEnd = Math.floor(cs.yMax);
  for (let y = yStart; y <= yEnd; y += Math.max(1, Math.floor((cs.yMax - cs.yMin) / 8))) {
    const [, py] = mathToCanvas(cs, cs.xMin, y);
    ctx.fillText(y.toString(), cs.paddingLeft - 6, py);
  }

  ctx.restore();
}

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  fn: MathFunction,
  color = '#22d3ee',
  lineWidth = 2,
  glow = true,
  samples = 500
): void {
  ctx.save();

  if (glow) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(34, 211, 238, 0.3)';
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  let firstPoint = true;
  for (let i = 0; i <= samples; i++) {
    const x = cs.xMin + (i / samples) * (cs.xMax - cs.xMin);
    const y = fn(x);
    if (!isNaN(y) && isFinite(y)) {
      const [px, py] = mathToCanvas(cs, x, y);
      if (firstPoint) {
        ctx.moveTo(px, py);
        firstPoint = false;
      } else {
        ctx.lineTo(px, py);
      }
    } else {
      firstPoint = true;
    }
  }
  ctx.stroke();
  ctx.restore();
}

// ---- Riemann Sums Renderer ----
export interface RiemannParams {
  fn: MathFunction;
  preset: FunctionPreset;
  n: number;
  type: RiemannType;
  a: number;
  b: number;
  showOverUnder: boolean;
  intuitiveMode?: boolean;
}

export function renderRiemannSums(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  params: RiemannParams
): { area: number; exactArea: number; error: number } {
  const { fn, preset, n, type, a, b, showOverUnder, intuitiveMode } = params;

  clearCanvas(ctx, cs.canvasWidth, cs.canvasHeight);
  drawGrid(ctx, cs);
  drawAxes(ctx, cs);
  drawAxisLabels(ctx, cs);

  const dx = (b - a) / n;
  const area = calculateRiemannSum(fn, a, b, n, type);
  const exactArea = preset.exactIntegral(a, b);
  const error = Math.abs(((area - exactArea) / exactArea) * 100);

  // Draw rectangles
  for (let i = 0; i < n; i++) {
    let x0: number, x1: number, h: number;

    if (type === 'left') {
      x0 = a + i * dx;
      x1 = a + (i + 1) * dx;
      h = fn(x0);
    } else if (type === 'right') {
      x0 = a + i * dx;
      x1 = a + (i + 1) * dx;
      h = fn(x1);
    } else if (type === 'midpoint') {
      x0 = a + i * dx;
      x1 = a + (i + 1) * dx;
      h = fn(x0 + dx / 2);
    } else {
      // trapezoid
      x0 = a + i * dx;
      x1 = a + (i + 1) * dx;
      h = (fn(x0) + fn(x1)) / 2;
    }

    if (isNaN(h) || !isFinite(h)) continue;

    const [px0, pyBase] = mathToCanvas(cs, x0, 0);
    const [px1, _py2] = mathToCanvas(cs, x1, 0);
    const [_px3, pyTop] = mathToCanvas(cs, x0, h);

    const rectWidth = px1 - px0;
    const rectHeight = pyBase - pyTop;

    // Determine fill color
    let fillColor: string;
    let strokeColor: string;

    if (showOverUnder) {
      const midX = x0 + dx / 2;
      const trueY = fn(midX);
      const isOver = type === 'left' ? h > trueY : type === 'right' ? h > trueY : false;
      fillColor = isOver ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)';
      strokeColor = isOver ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)';
    } else {
      if (type === 'left') {
        fillColor = 'rgba(34, 211, 238, 0.12)';
        strokeColor = 'rgba(34, 211, 238, 0.3)';
      } else if (type === 'right') {
        fillColor = 'rgba(139, 92, 246, 0.12)';
        strokeColor = 'rgba(139, 92, 246, 0.3)';
      } else if (type === 'midpoint') {
        fillColor = 'rgba(20, 184, 166, 0.12)';
        strokeColor = 'rgba(20, 184, 166, 0.3)';
      } else {
        fillColor = 'rgba(245, 158, 11, 0.12)';
        strokeColor = 'rgba(245, 158, 11, 0.3)';
      }
    }

    if (type === 'trapezoid') {
      const h0 = fn(x0);
      const h1 = fn(x1);
      const [_px0, py0] = mathToCanvas(cs, x0, h0);
      const [_px1, py1] = mathToCanvas(cs, x1, h1);

      ctx.save();
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px0, pyBase);
      ctx.lineTo(px0, py0);
      ctx.lineTo(px1, py1);
      ctx.lineTo(px1, pyBase);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.fillRect(px0, pyTop, rectWidth, rectHeight);
      ctx.strokeRect(px0, pyTop, rectWidth, rectHeight);

      // Dotted line from top of rectangle to curve
      ctx.strokeStyle = strokeColor;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(px0 + rectWidth / 2, pyTop);
      ctx.lineTo(px0 + rectWidth / 2, pyTop + rectHeight);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Draw the function curve on top
  drawCurve(ctx, cs, fn, '#22d3ee', 2, true, 500);

  // Intuitive mode tips
  if (intuitiveMode && n > 0) {
    const dx = (b - a) / n;
    const firstX = a + dx / 2;
    const firstY = fn(firstX);
    const [tipPx, tipPy] = mathToCanvas(cs, firstX, firstY * 0.6);
    drawTip(ctx, tipPx, tipPy, '\u2190 each bar = one area estimate');

    const [centerPx, centerPy] = mathToCanvas(cs, (a + b) / 2, cs.yMin + (cs.yMax - cs.yMin) * 0.15);
    drawTip(ctx, centerPx, centerPy, '\u2191 more bars \u2192 closer to true integral', 'center');
  }

  return { area, exactArea, error };
}

// ---- Tangent Line Renderer ----
export interface TangentParams {
  fn: MathFunction;
  preset: FunctionPreset;
  x: number;
  showSecant: boolean;
  secantX: number;
  showNormal: boolean;
  intuitiveMode?: boolean;
}

export function renderTangent(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  params: TangentParams
): { slope: number; derivative: number; x: number; y: number } {
  const { fn, preset, x, showSecant, secantX, showNormal, intuitiveMode } = params;

  clearCanvas(ctx, cs.canvasWidth, cs.canvasHeight);
  drawGrid(ctx, cs);
  drawAxes(ctx, cs);
  drawAxisLabels(ctx, cs);

  // Draw the function curve
  drawCurve(ctx, cs, fn, '#22d3ee', 2, true, 500);

  const y = fn(x);
  const slope = preset.derivative(x);

  if (isNaN(y) || !isFinite(y)) {
    return { slope: 0, derivative: 0, x, y: 0 };
  }

  const [px, py] = mathToCanvas(cs, x, y);

  // Draw tangent line extending across the visible area
  const tangentXMin = cs.xMin - 1;
  const tangentXMax = cs.xMax + 1;
  const tangentYAtMin = y + slope * (tangentXMin - x);
  const tangentYAtMax = y + slope * (tangentXMax - x);

  const [tPx0, tPy0] = mathToCanvas(cs, tangentXMin, tangentYAtMin);
  const [tPx1, tPy1] = mathToCanvas(cs, tangentXMax, tangentYAtMax);

  ctx.save();
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(tPx0, tPy0);
  ctx.lineTo(tPx1, tPy1);
  ctx.stroke();
  ctx.restore();

  // Draw slope triangle
  const triDx = 1.5;
  const triDy = slope * triDx;
  const [triPx, triPy] = mathToCanvas(cs, x - triDx / 2, y - triDy / 2);
  const [triPx2, triPy2] = mathToCanvas(cs, x + triDx / 2, y + triDy / 2);
  const [triPx3, triPy3] = mathToCanvas(cs, x + triDx / 2, y - triDy / 2);

  ctx.save();
  ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(triPx, triPy);
  ctx.lineTo(triPx2, triPy2);
  ctx.lineTo(triPx3, triPy3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#f59e0b';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Δx', (triPx3 + triPx2) / 2, triPy3 - 4);

  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'left';
  ctx.fillText('Δy', triPx2 + 4, (triPy2 + triPy3) / 2);
  ctx.restore();

  // Normal line
  if (showNormal && slope !== 0) {
    const normalSlope = -1 / slope;
    const normalYAtMin = y + normalSlope * (tangentXMin - x);
    const normalYAtMax = y + normalSlope * (tangentXMax - x);
    const [nPx0, nPy0] = mathToCanvas(cs, tangentXMin, normalYAtMin);
    const [nPx1, nPy1] = mathToCanvas(cs, tangentXMax, normalYAtMax);

    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(nPx0, nPy0);
    ctx.lineTo(nPx1, nPy1);
    ctx.stroke();
    ctx.restore();
  }

  // Secant line
  if (showSecant) {
    const secantY = fn(secantX);
    if (!isNaN(secantY) && isFinite(secantY)) {
      const secantSlope = (secantY - y) / (secantX - x);
      const secYAtMin = y + secantSlope * (tangentXMin - x);
      const secYAtMax = y + secantSlope * (tangentXMax - x);
      const [sPx0, sPy0] = mathToCanvas(cs, tangentXMin, secYAtMin);
      const [sPx1, sPy1] = mathToCanvas(cs, tangentXMax, secYAtMax);

      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(sPx0, sPy0);
      ctx.lineTo(sPx1, sPy1);
      ctx.stroke();
      ctx.restore();

      // Secant point
      const [spx, spy] = mathToCanvas(cs, secantX, secantY);
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(spx, spy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw the draggable point
  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Intuitive mode tips
  if (intuitiveMode) {
    // Tangent line midpoint
    const midTangentX = (cs.xMin + cs.xMax) / 2;
    const midTangentY = y + slope * (midTangentX - x);
    const [ttPx, ttPy] = mathToCanvas(cs, midTangentX, midTangentY);
    drawTip(ctx, ttPx, ttPy - 15, '\u2190 tangent: slope = f\u2032(x) at this point');

    // Draggable dot
    drawTip(ctx, px, py - 18, '\u2190 drag the dot along the curve');
  }

  return { slope, derivative: slope, x, y };
}

// ---- Area Under Curve Renderer ----
export interface AreaParams {
  fn: MathFunction;
  preset: FunctionPreset;
  a: number;
  b: number;
  showAntiderivative: boolean;
  intuitiveMode?: boolean;
}

export function renderArea(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  params: AreaParams
): { area: number } {
  const { fn, preset, a, b, showAntiderivative, intuitiveMode } = params;

  clearCanvas(ctx, cs.canvasWidth, cs.canvasHeight);
  drawGrid(ctx, cs);
  drawAxes(ctx, cs);
  drawAxisLabels(ctx, cs);

  // Fill area under curve
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  const [startPx, startPy] = mathToCanvas(cs, a, 0);
  ctx.moveTo(startPx, startPy);

  const samples = 500;
  for (let i = 0; i <= samples; i++) {
    const t = a + (i / samples) * (b - a);
    const y = fn(t);
    if (!isNaN(y) && isFinite(y)) {
      const [px, py] = mathToCanvas(cs, t, y);
      ctx.lineTo(px, py);
    }
  }

  const [endPx, endPy] = mathToCanvas(cs, b, 0);
  ctx.lineTo(endPx, endPy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Draw antiderivative overlay if requested
  if (showAntiderivative) {
    drawCurve(ctx, cs, preset.antiderivative, 'rgba(139, 92, 246, 0.4)', 1.5, false, 500);
  }

  // Draw the function curve
  drawCurve(ctx, cs, fn, '#22d3ee', 2, true, 500);

  // Draw bound handles
  const handleHeight = 24;
  const handleWidth = 10;

  // Left bound handle (a)
  const [aPx, aPy] = mathToCanvas(cs, a, 0);
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5;
  const cornerRadius = 4;
  const hx = aPx - handleWidth / 2;
  const hy = aPy - handleHeight / 2;
  ctx.beginPath();
  ctx.moveTo(hx + cornerRadius, hy);
  ctx.lineTo(hx + handleWidth - cornerRadius, hy);
  ctx.quadraticCurveTo(hx + handleWidth, hy, hx + handleWidth, hy + cornerRadius);
  ctx.lineTo(hx + handleWidth, hy + handleHeight - cornerRadius);
  ctx.quadraticCurveTo(hx + handleWidth, hy + handleHeight, hx + handleWidth - cornerRadius, hy + handleHeight);
  ctx.lineTo(hx + cornerRadius, hy + handleHeight);
  ctx.quadraticCurveTo(hx, hy + handleHeight, hx, hy + handleHeight - cornerRadius);
  ctx.lineTo(hx, hy + cornerRadius);
  ctx.quadraticCurveTo(hx, hy, hx + cornerRadius, hy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('a', aPx, aPy - handleHeight / 2 - 10);
  ctx.restore();

  // Right bound handle (b)
  const [bPx, bPy] = mathToCanvas(cs, b, 0);
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5;
  const hx2 = bPx - handleWidth / 2;
  const hy2 = bPy - handleHeight / 2;
  ctx.beginPath();
  ctx.moveTo(hx2 + cornerRadius, hy2);
  ctx.lineTo(hx2 + handleWidth - cornerRadius, hy2);
  ctx.quadraticCurveTo(hx2 + handleWidth, hy2, hx2 + handleWidth, hy2 + cornerRadius);
  ctx.lineTo(hx2 + handleWidth, hy2 + handleHeight - cornerRadius);
  ctx.quadraticCurveTo(hx2 + handleWidth, hy2 + handleHeight, hx2 + handleWidth - cornerRadius, hy2 + handleHeight);
  ctx.lineTo(hx2 + cornerRadius, hy2 + handleHeight);
  ctx.quadraticCurveTo(hx2, hy2 + handleHeight, hx2, hy2 + handleHeight - cornerRadius);
  ctx.lineTo(hx2, hy2 + cornerRadius);
  ctx.quadraticCurveTo(hx2, hy2, hx2 + cornerRadius, hy2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('b', bPx, bPy - handleHeight / 2 - 10);
  ctx.restore();

  // Vertical bound lines
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(aPx, aPy - handleHeight / 2);
  ctx.lineTo(aPx, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bPx, bPy - handleHeight / 2);
  ctx.lineTo(bPx, 0);
  ctx.stroke();
  ctx.restore();

  // Intuitive mode tips
  if (intuitiveMode) {
    const midX = (a + b) / 2;
    const midY = fn(midX) * 0.5;
    const [tipPx, tipPy] = mathToCanvas(cs, midX, midY);
    drawTip(ctx, tipPx, tipPy, '\u2191 shaded area = \u222bf(x)dx from a to b', 'center');

    const [aTipPx, aTipPy] = mathToCanvas(cs, a, 0);
    drawTip(ctx, aTipPx, aTipPy - 20, '\u2190 drag to change lower bound');
  }

  const area = preset.exactIntegral(a, b);
  return { area };
}

// ---- Fundamental Theorem Renderer ----
export interface FTCParams {
  fn: MathFunction;
  preset: FunctionPreset;
  t: number;
  a: number;
  intuitiveMode?: boolean;
}

export function renderFTC(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  params: FTCParams
): { accumulatedArea: number; fOfT: number } {
  const { fn, preset, t, a, intuitiveMode } = params;

  // Split canvas into upper and lower halves
  const midY = cs.canvasHeight / 2;
  const upperCs: CoordSystem = {
    ...cs,
    canvasHeight: midY,
    height: midY - cs.paddingBottom / 2,
  };
  const lowerCs: CoordSystem = {
    ...cs,
    canvasHeight: midY,
    height: midY - cs.paddingBottom / 2,
    paddingBottom: cs.paddingBottom / 2,
  };

  // Compute antiderivative y-range for lower half
  const [antiYMin, antiYMax] = getFunctionRange(preset.antiderivative, cs.xMin, cs.xMax);
  const lowerCsAdjusted: CoordSystem = {
    ...lowerCs,
    yMin: Math.max(0, antiYMin),
    yMax: antiYMax + 2,
  };

  clearCanvas(ctx, cs.canvasWidth, cs.canvasHeight);

  // Draw divider line
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(cs.canvasWidth, midY);
  ctx.stroke();
  ctx.restore();

  // ---- Upper half: f(x) with accumulated area ----
  drawGrid(ctx, upperCs);
  drawAxes(ctx, upperCs);
  drawAxisLabels(ctx, upperCs);

  // Fill accumulated area from a to t
  if (t > a) {
    ctx.save();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const [startPx, startPy] = mathToCanvas(upperCs, a, 0);
    ctx.moveTo(startPx, startPy);

    const samples = 300;
    for (let i = 0; i <= samples; i++) {
      const x = a + (i / samples) * Math.min(t - a, cs.xMax - a);
      if (x > t) break;
      const y = fn(x);
      if (!isNaN(y) && isFinite(y)) {
        const [px, py] = mathToCanvas(upperCs, x, y);
        ctx.lineTo(px, py);
      }
    }

    const [endPx, endPy] = mathToCanvas(upperCs, Math.min(t, cs.xMax), 0);
    ctx.lineTo(endPx, endPy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // f(x) curve in upper half
  drawCurve(ctx, upperCs, fn, '#22d3ee', 2, true, 500);

  // Movable point t on upper curve
  const fOfT = fn(t);
  const [tPx, tPy] = mathToCanvas(upperCs, t, fOfT);

  // Vertical dashed line at t across both halves
  ctx.save();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tPx, 0);
  ctx.lineTo(tPx, cs.canvasHeight);
  ctx.stroke();
  ctx.restore();

  // Dot on upper curve
  ctx.save();
  ctx.fillStyle = '#22d3ee';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
  ctx.beginPath();
  ctx.arc(tPx, tPy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ---- Lower half: F(x) antiderivative ----
  const lowerOffsetY = midY;

  // Draw lower grid and axes
  ctx.save();
  ctx.translate(0, lowerOffsetY);

  const lowerCsShifted: CoordSystem = {
    ...lowerCsAdjusted,
    canvasHeight: midY,
    height: midY - cs.paddingBottom / 2,
    paddingBottom: cs.paddingBottom / 2,
  };

  drawGrid(ctx, lowerCsShifted);
  drawAxes(ctx, lowerCsShifted);
  drawAxisLabels(ctx, lowerCsShifted);

  // Antiderivative curve
  drawCurve(ctx, lowerCsShifted, preset.antiderivative, '#8b5cf6', 2, true, 500);

  // Dot on antiderivative at t
  const fAntiT = preset.antiderivative(t);
  const [antiPx, antiPy] = mathToCanvas(lowerCsShifted, t, fAntiT);

  ctx.fillStyle = '#8b5cf6';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
  ctx.beginPath();
  ctx.arc(antiPx, antiPy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Vertical connector between dots
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(tPx, tPy + 6);
  ctx.lineTo(antiPx, antiPy + lowerOffsetY - 6);
  ctx.stroke();
  ctx.restore();

  // Labels
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('f(x)', cs.paddingLeft + 4, 14);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('F(x)', cs.paddingLeft + 4, midY + 14);
  ctx.restore();

  // Intuitive mode tips
  if (intuitiveMode) {
    const [tip1Px, tip1Py] = mathToCanvas(upperCs, cs.xMin + (cs.xMax - cs.xMin) * 0.15, cs.yMax - 2);
    drawTip(ctx, tip1Px, tip1Py, "\u2190 drag the point to accumulate area");

    const [tip2Px, tip2Py] = mathToCanvas(lowerCsAdjusted, cs.xMin + (cs.xMax - cs.xMin) * 0.15, antiYMax);
    drawTip(ctx, tip2Px, tip2Py, "\u2190 F\u2032(t) = f(t): that's the theorem");
  }

  const accumulatedArea = preset.exactIntegral(a, t);
  return { accumulatedArea, fOfT };
}

// ---- Limits Renderer ----
export interface LimitsParams {
  fn: MathFunction;
  preset: FunctionPreset;
  approachX: number;
  limitPoint: number;
  limitValue: number;
  showEpsilonDelta: boolean;
  trail: { x: number; y: number; opacity: number }[];
  intuitiveMode?: boolean;
}

export function renderLimits(
  ctx: CanvasRenderingContext2D,
  cs: CoordSystem,
  params: LimitsParams
): { currentValue: number; distanceToLimit: number; withinEpsilon: boolean } {
  const { fn, approachX, limitPoint, limitValue, showEpsilonDelta, trail, intuitiveMode } = params;

  clearCanvas(ctx, cs.canvasWidth, cs.canvasHeight);
  drawGrid(ctx, cs);
  drawAxes(ctx, cs);
  drawAxisLabels(ctx, cs);

  // Draw the function curve
  drawCurve(ctx, cs, fn, '#22d3ee', 2, true, 500);

  // Epsilon-delta bands
  const epsilon = 0.5;
  const delta = 0.3;

  if (showEpsilonDelta && Math.abs(approachX - limitPoint) < 1.5) {
    // Horizontal epsilon band around limit value
    const [, ePyTop] = mathToCanvas(cs, cs.xMin, limitValue + epsilon);
    const [_ePx2, ePyBottom] = mathToCanvas(cs, cs.xMin, limitValue - epsilon);

    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.fillRect(cs.paddingLeft, ePyTop, cs.width, ePyBottom - ePyTop);
    ctx.strokeRect(cs.paddingLeft, ePyTop, cs.width, ePyBottom - ePyTop);
    ctx.restore();

    // Vertical delta band around limit point
    const [dPxLeft, _dPy1] = mathToCanvas(cs, limitPoint - delta, cs.yMin);
    const [dPxRight, _dPy2] = mathToCanvas(cs, limitPoint + delta, cs.yMin);

    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.fillRect(dPxLeft, 0, dPxRight - dPxLeft, cs.height);
    ctx.strokeRect(dPxLeft, 0, dPxRight - dPxLeft, cs.height);
    ctx.restore();
  }

  // Limit point marker (dashed vertical line)
  if (limitPoint <= cs.xMax) {
    const [lpPx, _lpPy] = mathToCanvas(cs, limitPoint, cs.yMin);
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(lpPx, 0);
    ctx.lineTo(lpPx, cs.height);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`x → ${limitPoint}`, lpPx, 12);
    ctx.restore();

    // Open circle at limit point (hole)
    const limitY = fn(limitPoint);
    if (isNaN(limitY) || !isFinite(limitY)) {
      const [holePx, holePy] = mathToCanvas(cs, limitPoint, limitValue);
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(holePx, holePy, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Trail effect
  for (const point of trail) {
    const [tx, ty] = mathToCanvas(cs, point.x, point.y);
    ctx.save();
    ctx.fillStyle = `rgba(34, 211, 238, ${point.opacity * 0.5})`;
    ctx.beginPath();
    ctx.arc(tx, ty, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Current approach point
  const currentY = fn(approachX);
  const isDefined = !isNaN(currentY) && isFinite(currentY);

  if (isDefined) {
    const [apPx, apPy] = mathToCanvas(cs, approachX, currentY);

    ctx.save();
    ctx.fillStyle = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
    ctx.beginPath();
    ctx.arc(apPx, apPy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Dotted line from point to x-axis
  if (isDefined) {
    const [apPx, apPy] = mathToCanvas(cs, approachX, currentY);
    const [_bx, byBase] = mathToCanvas(cs, approachX, cs.yMin);
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(apPx, apPy + 8);
    ctx.lineTo(apPx, byBase);
    ctx.stroke();
    ctx.restore();
  }

  // Intuitive mode tips
  if (intuitiveMode) {
    const [apPx, apPy] = mathToCanvas(cs, approachX, currentY);
    drawTip(ctx, apPx, apPy - 18, '\u2190 drag toward the dashed line');

    if (!isDefined && limitPoint <= cs.xMax) {
      const [holePx, holePy] = mathToCanvas(cs, limitPoint, limitValue);
      drawTip(ctx, holePx, holePy - 18, '\u2190 undefined here, but limit exists');
    }
  }

  const distanceToLimit = Math.abs(currentY - limitValue);
  const withinEpsilon = distanceToLimit < epsilon;

  return {
    currentValue: isDefined ? currentY : limitValue,
    distanceToLimit,
    withinEpsilon,
  };
}
