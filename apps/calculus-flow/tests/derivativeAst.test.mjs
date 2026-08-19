import assert from 'node:assert/strict';
import test from 'node:test';

import {
  affine,
  compose,
  differentiate,
  evaluate,
  formatLatex,
  generateChainRuleExample,
  power,
  sin,
} from '../src/lib/derivativeAst.ts';

test('differentiates a power wrapped around an affine function', () => {
  const expression = compose(power(5), affine(3, 2));
  const result = differentiate(expression);

  assert.equal(formatLatex(result), '5\\left(3x + 2\\right)^{4} \\cdot 3');
  assert.equal(evaluate(result, 2), 61440);
});

test('differentiates sine wrapped around an affine function', () => {
  const expression = compose(sin(), affine(4, 0));
  const result = differentiate(expression);

  assert.equal(formatLatex(result), '\\cos\\left(4x\\right) \\cdot 4');
  assert.ok(Math.abs(evaluate(result, 0) - 4) < 1e-12);
});

test('generated examples stay teachable and mathematically valid', () => {
  for (let seed = 0; seed < 24; seed += 1) {
    const example = generateChainRuleExample(seed);

    assert.ok(example.steps.length >= 4);
    assert.ok(Number.isFinite(evaluate(example.expression, example.sampleX)));
    assert.ok(Number.isFinite(evaluate(example.derivative, example.sampleX)));
    assert.match(example.steps.at(-1).latex, /cdot|cos|frac|e\^/);
  }
});
