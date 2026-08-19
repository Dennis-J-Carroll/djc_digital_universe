export interface DerivativeAnimationFrame {
  progress: number;
  x: number;
  stepIndex: number;
  complete: boolean;
}

export function getDerivativeAnimationFrame(
  elapsedMs: number,
  durationMs: number,
  stepCount: number,
): DerivativeAnimationFrame {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);

  return {
    progress,
    x: 0.25 + progress * 2.25,
    stepIndex: Math.min(stepCount - 1, Math.floor(progress * stepCount)),
    complete: progress >= 1,
  };
}
