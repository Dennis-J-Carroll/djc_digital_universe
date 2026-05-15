import { describe, it, expect } from 'vitest';
import { iterate, bifurcationPoints, cobwebData, regime } from './logisticMap.js';

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
