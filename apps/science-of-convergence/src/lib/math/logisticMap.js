/** x_{n+1} = r * x * (1 - x) */
export function iterate(x, r) {
  return r * x * (1 - x);
}

/**
 * Run n iterations from x0 under parameter r.
 * Returns array of x values (including x0).
 */
export function runIterations(x0, r, n) {
  const xs = [x0];
  for (let i = 0; i < n; i++) {
    xs.push(iterate(xs[xs.length - 1], r));
  }
  return xs;
}

/**
 * Count distinct attractor points after warmup.
 * Uses tolerance 1e-5 to bucket values.
 */
function attractorPeriod(r, warmup = 2000, sample = 200) {
  let x = 0.31415;
  for (let i = 0; i < warmup; i++) x = iterate(x, r);
  const vals = new Set();
  for (let i = 0; i < sample; i++) {
    x = iterate(x, r);
    vals.add(Math.round(x * 1e5) / 1e5);
  }
  return vals.size;
}

/**
 * Find the first N period-doubling bifurcation r values.
 * Uses hardcoded search windows for reliability.
 */
export function bifurcationPoints(count = 4) {
  const results = [];
  const windows = [[2.9, 3.1], [3.4, 3.5], [3.54, 3.56], [3.564, 3.57]];
  let targetPeriod = 1;

  for (let k = 0; k < count; k++) {
    targetPeriod *= 2;
    const [lo, hi] = windows[k];
    let a = lo, b = hi;
    for (let iter = 0; iter < 60; iter++) {
      const mid = (a + b) / 2;
      if (attractorPeriod(mid) >= targetPeriod) {
        b = mid;
      } else {
        a = mid;
      }
    }
    results.push((a + b) / 2);
  }
  return results;
}

/**
 * Generate cobweb diagram points for plotting.
 * Returns array of [x, y] pairs starting at [x0, 0].
 * Pattern: vertical lines to curve, horizontal lines to diagonal.
 */
export function cobwebData(x0, r, steps = 60) {
  const pts = [[x0, 0]];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    const fx = iterate(x, r);
    pts.push([x, fx]);    // vertical: up to curve
    pts.push([fx, fx]);   // horizontal: across to diagonal
    x = fx;
  }
  return pts;
}

/**
 * Collect attractor x-values for bifurcation diagram.
 * Discards warmup, returns plotted values.
 */
export function bifurcationSamples(r, warmup = 400, samples = 400) {
  let x = 0.31415;
  for (let i = 0; i < warmup; i++) x = iterate(x, r);
  const out = [];
  for (let i = 0; i < samples; i++) {
    x = iterate(x, r);
    out.push(x);
  }
  return out;
}

/**
 * Return human-readable regime label for given r.
 */
export function regime(r) {
  if (r < 1) return 'collapse to 0';
  if (r < 3) {
    const xstar = 1 - 1 / r;
    return `stable fixed point (x* ≈ ${xstar.toFixed(3)})`;
  }
  if (r < 3.44949) return 'stable 2-cycle';
  if (r < 3.54409) return 'stable 4-cycle';
  if (r < 3.56995) return 'period-doubling cascade';
  return 'chaotic regime';
}
