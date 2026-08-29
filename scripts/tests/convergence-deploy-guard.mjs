import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

import { assertSafeConvergenceDeploymentTarget } from '../lib/convergence-deploy-guard.mjs'

function withTemporaryRepo(run) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'convergence-deploy-guard-'))
  const repoRoot = join(temporaryRoot, 'repo')
  const outsideRoot = join(temporaryRoot, 'outside')
  mkdirSync(repoRoot)
  mkdirSync(outsideRoot)
  try {
    run({ repoRoot, outsideRoot })
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

test('accepts only static/convergence-game', () => {
  withTemporaryRepo(({ repoRoot }) => {
    const target = resolve(repoRoot, 'static/convergence-game')
    assert.equal(assertSafeConvergenceDeploymentTarget(repoRoot, target), target)
    assert.throws(
      () => assertSafeConvergenceDeploymentTarget(repoRoot, resolve(repoRoot, 'static')),
      /outside static\/convergence-game/,
    )
  })
})

for (const symlinkLocation of ['static', 'static/convergence-game']) {
  test(`rejects symbolic link at ${symlinkLocation}`, () => {
    withTemporaryRepo(({ repoRoot, outsideRoot }) => {
      const linkPath = resolve(repoRoot, symlinkLocation)
      mkdirSync(resolve(linkPath, '..'), { recursive: true })
      symlinkSync(outsideRoot, linkPath, 'dir')
      assert.throws(
        () => assertSafeConvergenceDeploymentTarget(
          repoRoot,
          resolve(repoRoot, 'static/convergence-game'),
        ),
        /symbolic link/,
      )
    })
  })
}
