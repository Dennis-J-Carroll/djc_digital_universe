/**
 * Power-law decay: f(n) = A * n^(-beta)
 */
export function powerLawDecay(n, A, beta) {
  return A * Math.pow(n, -beta);
}

/**
 * Exponential decay: f(n) = A * exp(-lambda * n)
 */
export function exponentialDecay(n, A, lambda) {
  return A * Math.exp(-lambda * n);
}

/**
 * Fit power law y = A * x^beta via log-log linear regression.
 * Returns { A, beta } where beta is the signed exponent.
 */
export function fitPowerLaw(xs, ys) {
  const n = xs.length;
  if (n < 2) throw new RangeError('fitPowerLaw requires at least 2 points');
  if (xs.some(x => x <= 0) || ys.some(y => y <= 0)) throw new RangeError('fitPowerLaw requires all positive values');
  const logX = xs.map(Math.log);
  const logY = ys.map(Math.log);
  const sumX = logX.reduce((a, b) => a + b, 0);
  const sumY = logY.reduce((a, b) => a + b, 0);
  const sumXY = logX.reduce((s, x, i) => s + x * logY[i], 0);
  const sumX2 = logX.reduce((s, x) => s + x * x, 0);
  const beta = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const A = Math.exp((sumY - beta * sumX) / n);
  return { A, beta };
}
