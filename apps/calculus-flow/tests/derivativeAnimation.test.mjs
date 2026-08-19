import assert from 'node:assert/strict';
import test from 'node:test';

import { getDerivativeAnimationFrame } from '../src/lib/derivativeAnimation.ts';

test('clamps an early animation-frame timestamp to first calculation state', () => {
  assert.deepEqual(getDerivativeAnimationFrame(-1, 6000, 4), {
    progress: 0,
    x: 0.25,
    stepIndex: 0,
    complete: false,
  });
});
