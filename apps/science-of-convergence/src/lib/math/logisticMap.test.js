import { describe, it, expect } from 'vitest';
import { iterate, runIterations, bifurcationPoints, cobwebData, bifurcationSamples, regime } from './logisticMap.js';
import { powerLawDecay, exponentialDecay, fitPowerLaw } from './powerLaw.js';

describe('iterate', () => {
  it('maps x=0.5, r=2 to 0.5', () => {
    expect(iterate(0.5, 2)).toBeCloseTo(0.5);
  });
  it('returns 0 for x=0', () => {
    expect(iterate(0, 3)).toBe(0);
  });
  it('returns 0 for x=1', () => {
    expect(iterate(1, 3)).toBe(0);
  });
});

describe('bifurcationPoints', () => {
  it('finds r1 near 3.0', () => {
    const pts = bifurcationPoints();
    expect(pts[0]).toBeGreaterThan(2.9);
    expect(pts[0]).toBeLessThan(3.1);
  });
  it('returns at least 4 points', () => {
    expect(bifurcationPoints().length).toBeGreaterThanOrEqual(4);
  });
});

describe('cobwebData', () => {
  it('returns correct number of points', () => {
    const pts = cobwebData(0.2, 2.5, 10);
    // [x0,0] + 10 pairs of (x,fx) and (fx,fx) = 1 + 20 = 21
    expect(pts.length).toBe(21);
  });
  it('starts at [x0, 0]', () => {
    const pts = cobwebData(0.2, 2.5, 10);
    expect(pts[0]).toEqual([0.2, 0]);
  });
});

describe('runIterations', () => {
  it('converges to fixed point x*=0.6 at r=2.5', () => {
    const xs = runIterations(0.1, 2.5, 200);
    expect(xs[xs.length - 1]).toBeCloseTo(0.6, 4);
  });
  it('returns n+1 values including x0', () => {
    expect(runIterations(0.5, 2, 10).length).toBe(11);
  });
});

describe('bifurcationSamples', () => {
  it('returns 400 values by default', () => {
    expect(bifurcationSamples(3.2).length).toBe(400);
  });
  it('is not all zeros at r=4 (non-degenerate initial condition)', () => {
    const vals = bifurcationSamples(4.0);
    const nonZero = vals.filter(v => v > 0.01).length;
    expect(nonZero).toBeGreaterThan(100);
  });
  it('produces roughly 2 unique buckets for 2-cycle', () => {
    const vals = bifurcationSamples(3.2, 400, 400);
    const buckets = new Set(vals.map(v => Math.round(v * 100) / 100));
    expect(buckets.size).toBeGreaterThanOrEqual(2);
    expect(buckets.size).toBeLessThanOrEqual(4);
  });
});

describe('regime', () => {
  it('labels r<1 as collapse', () => {
    expect(regime(0.5)).toContain('collapse');
  });
  it('labels r=2 as fixed point', () => {
    expect(regime(2)).toContain('fixed point');
  });
  it('labels r=3.2 as 2-cycle', () => {
    expect(regime(3.2)).toContain('2-cycle');
  });
  it('labels r=3.5 as 4-cycle', () => {
    expect(regime(3.5)).toContain('4-cycle');
  });
  it('labels r=3.56 as period-doubling', () => {
    expect(regime(3.56)).toContain('period-doubling');
  });
  it('labels r=4 as chaotic', () => {
    expect(regime(4)).toContain('chaotic');
  });
});

describe('powerLawDecay', () => {
  it('computes A * n^(-beta)', () => {
    expect(powerLawDecay(2, 1, 1)).toBeCloseTo(0.5);
    expect(powerLawDecay(4, 2, 0.5)).toBeCloseTo(1.0);
  });
});

describe('exponentialDecay', () => {
  it('computes A * exp(-lambda*n)', () => {
    expect(exponentialDecay(0, 3, 0.1)).toBeCloseTo(3.0);
    expect(exponentialDecay(1, 1, Math.log(2))).toBeCloseTo(0.5);
  });
});

describe('fitPowerLaw', () => {
  it('recovers exact power law parameters', () => {
    const xs = [1, 2, 4, 8, 16];
    const ys = xs.map(x => 3 * Math.pow(x, -0.5));
    const { A, beta } = fitPowerLaw(xs, ys);
    expect(A).toBeCloseTo(3.0, 3);
    expect(beta).toBeCloseTo(-0.5, 3);
  });
  it('throws on fewer than 2 points', () => {
    expect(() => fitPowerLaw([1], [1])).toThrow(RangeError);
  });
  it('throws on non-positive values', () => {
    expect(() => fitPowerLaw([0, 1, 2], [1, 2, 3])).toThrow(RangeError);
    expect(() => fitPowerLaw([1, 2, 3], [0, 1, 2])).toThrow(RangeError);
  });
});
