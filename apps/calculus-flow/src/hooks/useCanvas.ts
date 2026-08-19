import { useRef, useEffect, useCallback } from 'react';

export interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

export function useCanvas(
  renderFn: (ctx: CanvasRenderingContext2D, size: CanvasSize) => void,
  deps: React.DependencyList
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<CanvasSize>({ width: 0, height: 0, dpr: 1 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (
      canvas.width !== Math.floor(width * dpr) ||
      canvas.height !== Math.floor(height * dpr)
    ) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    sizeRef.current = { width, height, dpr };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width === 0 || height === 0) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    renderFn(ctx, { width, height, dpr });
    ctx.restore();
  }, [renderFn]);

  useEffect(() => {
    resize();
    draw();

    const handleResize = () => {
      resize();
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw when deps change
  useEffect(() => {
    resize();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { canvasRef, containerRef, sizeRef, draw, resize };
}

export function useAnimationFrame(callback: (time: number) => void) {
  const rafRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const loop = (time: number) => {
      callbackRef.current(time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return rafRef;
}
