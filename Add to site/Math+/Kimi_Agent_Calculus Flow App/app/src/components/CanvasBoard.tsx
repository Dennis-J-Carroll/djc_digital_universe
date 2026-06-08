import { useRef, useEffect, useCallback, useState } from 'react';
import type { FunctionPreset, RiemannType } from '@/lib/mathFunctions';
import {
  createCoordSystem,
  renderRiemannSums,
  renderTangent,
  renderArea,
  renderFTC,
  renderLimits,
  mathToCanvas,
  canvasToMath,
  type CoordSystem,
} from '@/lib/canvasRenderers';
import { getFunctionRange } from '@/lib/mathFunctions';
import { useIsMobile } from '@/hooks/use-mobile';

export type CanvasMode = 'riemann' | 'tangent' | 'area' | 'ftc' | 'limits';

interface CanvasBoardProps {
  mode: CanvasMode;
  preset: FunctionPreset;
  // Riemann
  riemannN: number;
  riemannType: RiemannType;
  showOverUnder: boolean;
  // Tangent
  tangentX: number;
  showSecant: boolean;
  secantX: number;
  showNormal: boolean;
  // Area
  areaA: number;
  areaB: number;
  showAntiderivative: boolean;
  // FTC
  ftcT: number;
  // Limits
  limitX: number;
  showEpsilonDelta: boolean;
  // Callbacks
  onTangentXChange: (x: number) => void;
  onSecantXChange: (x: number) => void;
  onAreaAChange: (a: number) => void;
  onAreaBChange: (b: number) => void;
  onFtcTChange: (t: number) => void;
  onLimitXChange: (x: number) => void;
  // Readout data
  onRiemannDataChange: (data: { area: number; exactArea: number; error: number }) => void;
  onTangentDataChange: (data: { slope: number; x: number; y: number }) => void;
  onAreaDataChange: (data: { area: number }) => void;
  onFtcDataChange: (data: { accumulatedArea: number; fOfT: number }) => void;
  onLimitsDataChange: (data: { currentValue: number; distanceToLimit: number; withinEpsilon: boolean }) => void;
  // Animation
  isAnimating: boolean;
  intuitiveMode: boolean;
}

export default function CanvasBoard({
  mode,
  preset,
  riemannN,
  riemannType,
  showOverUnder,
  tangentX,
  showSecant,
  secantX,
  showNormal,
  areaA,
  areaB,
  showAntiderivative,
  ftcT,
  limitX,
  showEpsilonDelta,
  onTangentXChange,
  onAreaAChange,
  onAreaBChange,
  onFtcTChange,
  onLimitXChange,
  onRiemannDataChange,
  onTangentDataChange,
  onAreaDataChange,
  onFtcDataChange,
  onLimitsDataChange,
  isAnimating,
  onSecantXChange,
  intuitiveMode,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const trailRef = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const isMobile = useIsMobile();

  // Refs to track previous data values — prevent 60fps re-renders from identical data
  const prevRiemannRef = useRef<{ area: number; exactArea: number; error: number } | null>(null);
  const prevTangentRef = useRef<{ slope: number; x: number; y: number } | null>(null);
  const prevAreaRef = useRef<{ area: number } | null>(null);
  const prevFtcRef = useRef<{ accumulatedArea: number; fOfT: number } | null>(null);
  const prevLimitsRef = useRef<{ currentValue: number; distanceToLimit: number; withinEpsilon: boolean } | null>(null);

  // Get coord system based on current size
  const getCoordSystem = useCallback((): CoordSystem | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w === 0 || h === 0) return null;

    const domain = preset.domain;
    const xMin = domain ? domain[0] : -0.5;
    const xMax = domain ? domain[1] : 5;
    const [yMin, yMax] = getFunctionRange(preset.fn, xMin, xMax);

    return createCoordSystem(w, h, xMin, xMax, Math.max(0, yMin), yMax + 2);
  }, [preset]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w === 0 || h === 0) return;

    // Handle DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const cs = getCoordSystem();
    if (!cs) {
      ctx.restore();
      return;
    }

    switch (mode) {
      case 'riemann': {
        const data = renderRiemannSums(ctx, cs, {
          fn: preset.fn,
          preset,
          n: riemannN,
          type: riemannType,
          a: cs.xMin >= 0 ? cs.xMin : 0,
          b: cs.xMax,
          showOverUnder,
          intuitiveMode,
        });
        if (!isAnimating) {
          const p = prevRiemannRef.current;
          if (!p || data.area !== p.area || data.exactArea !== p.exactArea || data.error !== p.error) {
            prevRiemannRef.current = data;
            onRiemannDataChange(data);
          }
        }
        break;
      }
      case 'tangent': {
        const data = renderTangent(ctx, cs, {
          fn: preset.fn,
          preset,
          x: tangentX,
          showSecant,
          secantX,
          showNormal,
          intuitiveMode,
        });
        const p = prevTangentRef.current;
        if (!p || data.slope !== p.slope || data.x !== p.x || data.y !== p.y) {
          prevTangentRef.current = data;
          onTangentDataChange(data);
        }
        break;
      }
      case 'area': {
        const data = renderArea(ctx, cs, {
          fn: preset.fn,
          preset,
          a: areaA,
          b: areaB,
          showAntiderivative,
          intuitiveMode,
        });
        const p = prevAreaRef.current;
        if (!p || data.area !== p.area) {
          prevAreaRef.current = data;
          onAreaDataChange(data);
        }
        break;
      }
      case 'ftc': {
        const data = renderFTC(ctx, cs, {
          fn: preset.fn,
          preset,
          t: ftcT,
          a: cs.xMin >= 0 ? cs.xMin : 0,
          intuitiveMode,
        });
        const p = prevFtcRef.current;
        if (!p || data.accumulatedArea !== p.accumulatedArea || data.fOfT !== p.fOfT) {
          prevFtcRef.current = data;
          onFtcDataChange(data);
        }
        break;
      }
      case 'limits': {
        const data = renderLimits(ctx, cs, {
          fn: preset.fn,
          preset,
          approachX: limitX,
          limitPoint: preset.limitPoint ?? 0,
          limitValue: preset.limitValue ?? 1,
          showEpsilonDelta,
          trail: trailRef.current,
          intuitiveMode,
        });
        const p = prevLimitsRef.current;
        if (!p || data.currentValue !== p.currentValue || data.distanceToLimit !== p.distanceToLimit || data.withinEpsilon !== p.withinEpsilon) {
          prevLimitsRef.current = data;
          onLimitsDataChange(data);
        }
        break;
      }
    }

    ctx.restore();
    canvasSizeRef.current = { width: w, height: h };
  }, [
    mode, preset, riemannN, riemannType, showOverUnder,
    tangentX, showSecant, secantX, showNormal,
    areaA, areaB, showAntiderivative,
    ftcT, limitX, showEpsilonDelta,
    getCoordSystem,
    onRiemannDataChange, onTangentDataChange, onAreaDataChange,
    onFtcDataChange, onLimitsDataChange,
    isAnimating, intuitiveMode,
  ]);

  // Animation frame for smooth rendering
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render]);

  // Use ResizeObserver for reliable container size changes (mobile orientation, keyboard, etc.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      render();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [render]);

  // Fade effect on mode change
  useEffect(() => {
    setFadeState('out');
    const timer = setTimeout(() => {
      setFadeState('in');
    }, 150);
    return () => clearTimeout(timer);
  }, [mode, preset.key]);

  // Get position from mouse or touch event
  const getCanvasPosFromMouse = (e: React.MouseEvent): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const getCanvasPosFromTouch = (e: React.TouchEvent): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return [0, 0];
    return [touch.clientX - rect.left, touch.clientY - rect.top];
  };

  // Shared drag logic
  const startDrag = (px: number, _py: number) => {
    const cs = getCoordSystem();
    if (!cs) return;
    const [mx, _my] = canvasToMath(cs, px, _py);

    if (mode === 'tangent') {
      // Check if near secant point
      if (showSecant) {
        const secantY = preset.fn(secantX);
        if (!isNaN(secantY) && isFinite(secantY)) {
          const [secPx, secPy] = mathToCanvas(cs, secantX, secantY);
          const dist = Math.sqrt((px - secPx) ** 2 + (_py - secPy) ** 2);
          if (dist < 20) {
            setDragging('secantX');
            return;
          }
        }
      }
      // Fall through: drag the main tangent point
      setDragging('tangent');
      const clampedX = Math.max(cs.xMin, Math.min(cs.xMax, mx));
      onTangentXChange(clampedX);
    } else if (mode === 'area') {
      const aDist = Math.abs(mx - areaA);
      const bDist = Math.abs(mx - areaB);
      if (aDist < bDist && aDist < 0.5) {
        setDragging('areaA');
      } else if (bDist < 0.5) {
        setDragging('areaB');
      }
    } else if (mode === 'ftc') {
      setDragging('ftcT');
      const clampedT = Math.max(cs.xMin, Math.min(cs.xMax, mx));
      onFtcTChange(clampedT);
    } else if (mode === 'limits') {
      setDragging('limit');
      const clampedX = Math.max(cs.xMin, Math.min(cs.xMax, mx));
      onLimitXChange(clampedX);
      const y = preset.fn(clampedX);
      if (!isNaN(y) && isFinite(y)) {
        trailRef.current.push({ x: clampedX, y, opacity: 1 });
        if (trailRef.current.length > 50) trailRef.current.shift();
      }
    }
  };

  const doDrag = (px: number, _py: number) => {
    if (!dragging) return;
    const cs = getCoordSystem();
    if (!cs) return;
    const [mx] = canvasToMath(cs, px, _py);
    const clampedX = Math.max(cs.xMin, Math.min(cs.xMax, mx));

    if (dragging === 'tangent') {
      onTangentXChange(clampedX);
    } else if (dragging === 'areaA') {
      onAreaAChange(Math.min(clampedX, areaB - 0.1));
    } else if (dragging === 'areaB') {
      onAreaBChange(Math.max(clampedX, areaA + 0.1));
    } else if (dragging === 'ftcT') {
      onFtcTChange(clampedX);
    } else if (dragging === 'secantX') {
      onSecantXChange(clampedX);
    } else if (dragging === 'limit') {
      onLimitXChange(clampedX);
      const y = preset.fn(clampedX);
      if (!isNaN(y) && isFinite(y)) {
        trailRef.current.push({ x: clampedX, y, opacity: 1 });
        if (trailRef.current.length > 50) trailRef.current.shift();
      }
    }
  };

  const endDrag = () => {
    setDragging(null);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const [px, py] = getCanvasPosFromMouse(e);
    startDrag(px, py);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const [px, py] = getCanvasPosFromMouse(e);
    doDrag(px, py);
  };

  const handleMouseUp = () => {
    endDrag();
  };

  // Touch event handlers — NO e.preventDefault()!
  // CSS touch-action: none on .canvas-container handles scroll/zoom prevention.
  // preventDefault() would break iOS Safari click events on buttons outside canvas.
  const handleTouchStart = (e: React.TouchEvent) => {
    const [px, py] = getCanvasPosFromTouch(e);
    startDrag(px, py);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const [px, py] = getCanvasPosFromTouch(e);
    doDrag(px, py);
  };

  const handleTouchEnd = (_e: React.TouchEvent) => {
    endDrag();
  };

  // Update trail opacity
  useEffect(() => {
    if (mode !== 'limits') return;
    const interval = setInterval(() => {
      trailRef.current = trailRef.current
        .map((t) => ({ ...t, opacity: t.opacity * 0.95 }))
        .filter((t) => t.opacity > 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [mode]);

  const modeBadge = {
    riemann: 'Riemann Sum',
    tangent: 'Tangent Line',
    area: 'Area Under Curve',
    ftc: 'Fundamental Theorem',
    limits: 'Limits',
  }[mode];

  return (
    <div
      ref={containerRef}
      className="mx-auto relative canvas-container"
      style={{
        maxWidth: 900,
        width: '100%',
        aspectRatio: isMobile ? '4/3' : '16/9',
        minHeight: isMobile ? 240 : 300,
        maxHeight: isMobile ? 340 : 520,
        background: '#0c1030',
        border: '1px solid #1a2248',
        borderRadius: isMobile ? 12 : 16,
        overflow: 'hidden',
        cursor: mode === 'tangent' || mode === 'area' || mode === 'ftc' || mode === 'limits'
          ? 'crosshair'
          : 'default',
        opacity: fadeState === 'in' ? 1 : 0,
        transition: fadeState === 'in'
          ? 'opacity 200ms ease-out'
          : 'opacity 150ms ease-in',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      {/* Mode badge */}
      <div
        className="absolute top-3 left-3 font-body text-[11px] font-medium uppercase px-2 py-1"
        style={{
          background: 'rgba(34, 211, 238, 0.1)',
          color: '#22d3ee',
          borderRadius: 9999,
          border: '1px solid rgba(34, 211, 238, 0.2)',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {modeBadge}
      </div>
    </div>
  );
}
