// ============================================================
// Math Functions Library for Calculus Flow
// ============================================================

export type MathFunction = (x: number) => number;

export interface FunctionPreset {
  key: string;
  label: string;
  fn: MathFunction;
  derivative: MathFunction;
  antiderivative: MathFunction;
  exactIntegral: (a: number, b: number) => number;
  domain?: [number, number];
  discontinuity?: number[];
  limitPoint?: number;
  limitValue?: number;
  latex: string;
  derivativeLatex: string;
}

// ---- Function Definitions ----

// Linear: f(x) = 0.5x + 15
const linear = (x: number) => 0.5 * x + 15;
const linearDeriv = (_x: number) => 0.5;
const linearAnti = (x: number) => 0.25 * x * x + 15 * x;
const linearIntegral = (a: number, b: number) => 0.25 * (b * b - a * a) + 15 * (b - a);

// Quadratic: f(x) = 0.1*x^2 + 15
const quadratic = (x: number) => 0.1 * x * x + 15;
const quadraticDeriv = (x: number) => 0.2 * x;
const quadraticAnti = (x: number) => (0.1 / 3) * x * x * x + 15 * x;
const quadraticIntegral = (a: number, b: number) =>
  (0.1 / 3) * (b * b * b - a * a * a) + 15 * (b - a);

// Sine: f(x) = 15 + 10*sin(0.8*x)
const sineFn = (x: number) => 15 + 10 * Math.sin(x * 0.8);
const sineDeriv = (x: number) => 8 * Math.cos(x * 0.8);
const sineAnti = (x: number) => 15 * x - 12.5 * Math.cos(x * 0.8);
const sineIntegral = (a: number, b: number) =>
  15 * (b - a) - 12.5 * (Math.cos(b * 0.8) - Math.cos(a * 0.8));

// Exponential: f(x) = 5 + 2*exp(0.2*x)
const exponential = (x: number) => 5 + 2 * Math.exp(x * 0.2);
const expDeriv = (x: number) => 0.4 * Math.exp(x * 0.2);
const expAnti = (x: number) => 5 * x + 10 * Math.exp(x * 0.2);
const expIntegral = (a: number, b: number) =>
  5 * (b - a) + 10 * (Math.exp(b * 0.2) - Math.exp(a * 0.2));

// Velocity Curve: piecewise — constant 15 for x < 3, then quadratic acceleration
// Matches user's screenshots: v(4)=16, v(6)=24, v(8)=40, integral(0,9)=207
const velocityCurve = (x: number) => {
  if (x < 3) return 15;
  return 15 + (x - 3) * (x - 3);
};
const velocityDeriv = (x: number) => {
  if (x < 3) return 0;
  return 2 * (x - 3);
};
const velocityAnti = (x: number) => {
  if (x < 3) return 15 * x;
  return 15 * x + (1 / 3) * (x - 3) * (x - 3) * (x - 3);
};
const velocityIntegral = (a: number, b: number) => velocityAnti(b) - velocityAnti(a);

// Cubic: f(x) = 0.02*x^3 - 0.3*x^2 + 2*x + 10
const cubic = (x: number) => 0.02 * x * x * x - 0.3 * x * x + 2 * x + 10;
const cubicDeriv = (x: number) => 0.06 * x * x - 0.6 * x + 2;
const cubicAnti = (x: number) =>
  0.005 * x * x * x * x - 0.1 * x * x * x + x * x + 10 * x;
const cubicIntegral = (a: number, b: number) => cubicAnti(b) - cubicAnti(a);

// Semicircle: f(x) = sqrt(25 - (x-5)^2)
const semicircle = (x: number) => {
  const v = 25 - (x - 5) * (x - 5);
  return v >= 0 ? Math.sqrt(v) : NaN;
};
const semiDeriv = (x: number) => {
  const v = 25 - (x - 5) * (x - 5);
  if (v <= 0) return NaN;
  return -(x - 5) / Math.sqrt(v);
};
const semiAnti = (x: number) => {
  // Approximate using numerical integration
  let sum = 0;
  const steps = 1000;
  const a = 0;
  const dx = (x - a) / steps;
  for (let i = 0; i < steps; i++) {
    sum += semicircle(a + (i + 0.5) * dx) * dx;
  }
  return sum;
};
const semiIntegral = (a: number, b: number) => {
  // Exact: area of semicircle segment
  // Numerical for simplicity
  let sum = 0;
  const steps = 2000;
  const dx = (b - a) / steps;
  for (let i = 0; i < steps; i++) {
    sum += semicircle(a + (i + 0.5) * dx) * dx;
  }
  return sum;
};

// Rational: f(x) = (x^2 - 4) / (x - 2) = x + 2 when x != 2
const rational = (x: number) => {
  if (Math.abs(x - 2) < 0.0001) return NaN;
  return (x * x - 4) / (x - 2);
};
const rationalDeriv = (_x: number) => 1; // derivative of x+2 is 1
const rationalAnti = (x: number) => 0.5 * x * x + 2 * x;
const rationalIntegral = (a: number, b: number): number => {
  // Handle discontinuity at x=2
  if (a <= 2 && 2 <= b) {
    return rationalIntegral(a, 2 - 0.0001) + rationalIntegral(2 + 0.0001, b);
  }
  return 0.5 * (b * b - a * a) + 2 * (b - a);
};

// sin(x)/x — classic limit
const sincFn = (x: number) => {
  if (Math.abs(x) < 0.0001) return 1;
  return Math.sin(x) / x;
};
const sincDeriv = (x: number) => {
  if (Math.abs(x) < 0.0001) return 0;
  return (x * Math.cos(x) - Math.sin(x)) / (x * x);
};
const sincAnti = (x: number) => {
  // Si(x) — no closed form, numerical
  let sum = 0;
  const steps = 1000;
  const a = 0.001;
  const dx = (x - a) / steps;
  for (let i = 0; i < steps; i++) {
    sum += sincFn(a + (i + 0.5) * dx) * dx;
  }
  return sum + 0.001; // approximate
};
const sincIntegral = (a: number, b: number) => sincAnti(b) - sincAnti(a);

// (e^x - 1) / x
const expLimit = (x: number) => {
  if (Math.abs(x) < 0.0001) return 1;
  return (Math.exp(x) - 1) / x;
};
const expLimitDeriv = (x: number) => {
  if (Math.abs(x) < 0.0001) return 0.5;
  return (Math.exp(x) * x - (Math.exp(x) - 1)) / (x * x);
};
const expLimitAnti = (x: number) => {
  let sum = 0;
  const steps = 1000;
  const a = 0.001;
  const dx = Math.abs(x - a) / steps;
  const sign = x > a ? 1 : -1;
  for (let i = 0; i < steps; i++) {
    sum += expLimit(a + sign * (i + 0.5) * dx) * dx;
  }
  return sum * sign + 0.001;
};

// Polynomial for area: f(x) = 2x + 1
const polyLinear = (x: number) => 2 * x + 1;
const polyLinearDeriv = (_x: number) => 2;
const polyLinearAnti = (x: number) => x * x + x;
const polyLinearIntegral = (a: number, b: number) => (b * b - a * a) + (b - a);

// f(x) = x^2
const xSquared = (x: number) => x * x;
const xSquaredDeriv = (x: number) => 2 * x;
const xSquaredAnti = (x: number) => (1 / 3) * x * x * x;
const xSquaredIntegral = (a: number, b: number) => (1 / 3) * (b * b * b - a * a * a);

// Position/velocity pair: x(t) = t^2, v(t) = 2t
const positionFn = (x: number) => x * x;
const velocityFn = (x: number) => 2 * x;

// ---- Function Presets by Mode ----

export const FUNCTION_PRESETS: Record<string, FunctionPreset[]> = {
  riemann: [
    {
      key: 'linear',
      label: 'v(t) = 0.5t + 15',
      fn: linear,
      derivative: linearDeriv,
      antiderivative: linearAnti,
      exactIntegral: linearIntegral,
      latex: 'f(x) = 0.5x + 15',
      derivativeLatex: "f'(x) = 0.5",
    },
    {
      key: 'quadratic',
      label: 'f(x) = 0.1x² + 15',
      fn: quadratic,
      derivative: quadraticDeriv,
      antiderivative: quadraticAnti,
      exactIntegral: quadraticIntegral,
      latex: 'f(x) = 0.1x^2 + 15',
      derivativeLatex: "f'(x) = 0.2x",
    },
    {
      key: 'sine',
      label: 'f(x) = 15 + 10sin(0.8x)',
      fn: sineFn,
      derivative: sineDeriv,
      antiderivative: sineAnti,
      exactIntegral: sineIntegral,
      latex: 'f(x) = 15 + 10\\sin(0.8x)',
      derivativeLatex: "f'(x) = 8\\cos(0.8x)",
    },
    {
      key: 'exponential',
      label: 'f(x) = 5 + 2e^(0.2x)',
      fn: exponential,
      derivative: expDeriv,
      antiderivative: expAnti,
      exactIntegral: expIntegral,
      latex: 'f(x) = 5 + 2e^{0.2x}',
      derivativeLatex: "f'(x) = 0.4e^{0.2x}",
    },
    {
      key: 'velocity',
      label: 'Velocity Curve',
      fn: velocityCurve,
      derivative: velocityDeriv,
      antiderivative: velocityAnti,
      exactIntegral: velocityIntegral,
      domain: [0, 9],
      latex: 'v(t) = \\begin{cases} 15 & t < 3 \\\\ 15 + (t-3)^2 & t \\geq 3 \\end{cases}',
      derivativeLatex: "v'(t) = \\begin{cases} 0 & t < 3 \\\\ 2(t-3) & t \\geq 3 \\end{cases}",
    },
  ],
  tangent: [
    {
      key: 'parabola',
      label: 'f(x) = 0.1x² + 15',
      fn: quadratic,
      derivative: quadraticDeriv,
      antiderivative: quadraticAnti,
      exactIntegral: quadraticIntegral,
      latex: 'f(x) = 0.1x^2 + 15',
      derivativeLatex: "f'(x) = 0.2x",
    },
    {
      key: 'cubic',
      label: 'f(x) = 0.02x³ - 0.3x² + 2x + 10',
      fn: cubic,
      derivative: cubicDeriv,
      antiderivative: cubicAnti,
      exactIntegral: cubicIntegral,
      latex: 'f(x) = 0.02x^3 - 0.3x^2 + 2x + 10',
      derivativeLatex: "f'(x) = 0.06x^2 - 0.6x + 2",
    },
    {
      key: 'sine',
      label: 'f(x) = 15 + 10sin(0.8x)',
      fn: sineFn,
      derivative: sineDeriv,
      antiderivative: sineAnti,
      exactIntegral: sineIntegral,
      latex: 'f(x) = 15 + 10\\sin(0.8x)',
      derivativeLatex: "f'(x) = 8\\cos(0.8x)",
    },
    {
      key: 'exponential',
      label: 'f(x) = 5 + 2e^(0.2x)',
      fn: exponential,
      derivative: expDeriv,
      antiderivative: expAnti,
      exactIntegral: expIntegral,
      latex: 'f(x) = 5 + 2e^{0.2x}',
      derivativeLatex: "f'(x) = 0.4e^{0.2x}",
    },
    {
      key: 'rational',
      label: 'f(x) = (x²-4)/(x-2)',
      fn: rational,
      derivative: rationalDeriv,
      antiderivative: rationalAnti,
      exactIntegral: rationalIntegral,
      latex: 'f(x) = \\frac{x^2-4}{x-2}',
      derivativeLatex: "f'(x) = 1",
      discontinuity: [2],
      limitPoint: 2,
      limitValue: 4,
    },
  ],
  area: [
    {
      key: 'polynomial',
      label: 'f(x) = 2x + 1',
      fn: polyLinear,
      derivative: polyLinearDeriv,
      antiderivative: polyLinearAnti,
      exactIntegral: polyLinearIntegral,
      latex: 'f(x) = 2x + 1',
      derivativeLatex: "f'(x) = 2",
    },
    {
      key: 'quadratic',
      label: 'f(x) = x²',
      fn: xSquared,
      derivative: xSquaredDeriv,
      antiderivative: xSquaredAnti,
      exactIntegral: xSquaredIntegral,
      latex: 'f(x) = x^2',
      derivativeLatex: "f'(x) = 2x",
    },
    {
      key: 'sine',
      label: 'f(x) = 15 + 10sin(0.8x)',
      fn: sineFn,
      derivative: sineDeriv,
      antiderivative: sineAnti,
      exactIntegral: sineIntegral,
      latex: 'f(x) = 15 + 10\\sin(0.8x)',
      derivativeLatex: "f'(x) = 8\\cos(0.8x)",
    },
    {
      key: 'exponential',
      label: 'f(x) = 5 + 2e^(0.2x)',
      fn: exponential,
      derivative: expDeriv,
      antiderivative: expAnti,
      exactIntegral: expIntegral,
      latex: 'f(x) = 5 + 2e^{0.2x}',
      derivativeLatex: "f'(x) = 0.4e^{0.2x}",
    },
    {
      key: 'semicircle',
      label: 'f(x) = √(25 - (x-5)²)',
      fn: semicircle,
      derivative: semiDeriv,
      antiderivative: semiAnti,
      exactIntegral: semiIntegral,
      latex: 'f(x) = \\sqrt{25 - (x-5)^2}',
      derivativeLatex: "f'(x) = -\\frac{x-5}{\\sqrt{25-(x-5)^2}}",
      domain: [0, 10],
    },
  ],
  ftc: [
    {
      key: 'polynomial',
      label: 'f(x) = 2x, F(x) = x²',
      fn: velocityFn,
      derivative: (_x: number) => 2,
      antiderivative: positionFn,
      exactIntegral: (a: number, b: number) => b * b - a * a,
      latex: 'f(x) = 2x, \\; F(x) = x^2',
      derivativeLatex: 'F\\\'(x) = 2x = f(x)',
    },
    {
      key: 'quadratic',
      label: 'f(x) = 0.2x, F(x) = 0.1x² + 15x',
      fn: quadraticDeriv,
      derivative: (_x: number) => 0.2,
      antiderivative: quadraticAnti,
      exactIntegral: quadraticIntegral,
      latex: 'f(x) = 0.2x, \\; F(x) = 0.1x^2 + 15x',
      derivativeLatex: 'F\\\'(x) = 0.2x = f(x)',
    },
    {
      key: 'sine',
      label: 'f(x) = 8cos(0.8x), F(x) = 15x - 12.5cos(0.8x)',
      fn: sineDeriv,
      derivative: (x: number) => -6.4 * Math.sin(x * 0.8),
      antiderivative: sineAnti,
      exactIntegral: sineIntegral,
      latex: "f(x) = 8\\cos(0.8x), \\; F(x) = 15x - 12.5\\cos(0.8x)",
      derivativeLatex: "F'(x) = 15 + 10\\sin(0.8x)",
    },
  ],
  limits: [
    {
      key: 'piecewise',
      label: 'f(x) = sin(x)/x',
      fn: sincFn,
      derivative: sincDeriv,
      antiderivative: sincAnti,
      exactIntegral: sincIntegral,
      latex: 'f(x) = \\frac{\\sin x}{x}',
      derivativeLatex: "f'(x) = \\frac{x\\cos x - \\sin x}{x^2}",
      limitPoint: 0,
      limitValue: 1,
    },
    {
      key: 'rational',
      label: 'f(x) = (x²-4)/(x-2)',
      fn: rational,
      derivative: rationalDeriv,
      antiderivative: rationalAnti,
      exactIntegral: rationalIntegral,
      latex: 'f(x) = \\frac{x^2-4}{x-2}',
      derivativeLatex: "f'(x) = 1",
      discontinuity: [2],
      limitPoint: 2,
      limitValue: 4,
    },
    {
      key: 'trig',
      label: 'f(x) = (e^x - 1)/x',
      fn: expLimit,
      derivative: expLimitDeriv,
      antiderivative: expLimitAnti,
      exactIntegral: () => 0,
      latex: 'f(x) = \\frac{e^x - 1}{x}',
      derivativeLatex: "f'(x) = \\frac{xe^x - (e^x-1)}{x^2}",
      limitPoint: 0,
      limitValue: 1,
    },
    {
      key: 'infinite',
      label: 'f(x) = (1+1/x)^x',
      fn: (x: number) => Math.pow(1 + 1 / x, x),
      derivative: (_x: number) => 0,
      antiderivative: () => 0,
      exactIntegral: () => 0,
      latex: 'f(x) = \\left(1 + \\frac{1}{x}\\right)^x',
      derivativeLatex: '',
      limitPoint: 1000,
      limitValue: Math.E,
    },
  ],
};

// ---- Riemann Sum Calculations ----
export type RiemannType = 'left' | 'right' | 'midpoint' | 'trapezoid';

export function calculateRiemannSum(
  fn: MathFunction,
  a: number,
  b: number,
  n: number,
  type: RiemannType
): number {
  const dx = (b - a) / n;
  let sum = 0;

  if (type === 'left') {
    for (let i = 0; i < n; i++) {
      sum += fn(a + i * dx) * dx;
    }
  } else if (type === 'right') {
    for (let i = 1; i <= n; i++) {
      sum += fn(a + i * dx) * dx;
    }
  } else if (type === 'midpoint') {
    for (let i = 0; i < n; i++) {
      sum += fn(a + (i + 0.5) * dx) * dx;
    }
  } else if (type === 'trapezoid') {
    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx;
      const x1 = a + (i + 1) * dx;
      sum += 0.5 * (fn(x0) + fn(x1)) * dx;
    }
  }

  return sum;
}

// ---- Numerical Derivative ----
export function numericalDerivative(fn: MathFunction, x: number, h = 0.001): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

// ---- Numerical Integration ----
export function numericalIntegrate(
  fn: MathFunction,
  a: number,
  b: number,
  steps = 1000
): number {
  const dx = (b - a) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    sum += fn(a + (i + 0.5) * dx) * dx;
  }
  return sum;
}

// ---- Helper: compute Y range for function ----
export function getFunctionRange(
  fn: MathFunction,
  xMin: number,
  xMax: number,
  samples = 500
): [number, number] {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (i / samples) * (xMax - xMin);
    const y = fn(x);
    if (!isNaN(y) && isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  // Add padding
  const padding = (yMax - yMin) * 0.1;
  return [Math.max(0, yMin - padding), yMax + padding];
}

// ---- Get default function for a mode ----
export function getDefaultFunction(mode: string): FunctionPreset {
  return FUNCTION_PRESETS[mode]?.[0] ?? FUNCTION_PRESETS.riemann[0];
}

// ---- Get all presets for a mode ----
export function getFunctionPresets(mode: string): FunctionPreset[] {
  return FUNCTION_PRESETS[mode] ?? [];
}
