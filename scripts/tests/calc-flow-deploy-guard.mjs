import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

import { assertSafeCalcFlowDeploymentTarget } from '../lib/calc-flow-deploy-guard.mjs'

function withTemporaryRepo(run) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'calc-flow-deploy-guard-'))
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

test('accepts the exact in-repository deployment directory', () => {
  withTemporaryRepo(({ repoRoot }) => {
    const deploymentTarget = resolve(repoRoot, 'static/apps/calc-flow')
    mkdirSync(deploymentTarget, { recursive: true })

    assert.equal(
      assertSafeCalcFlowDeploymentTarget(repoRoot, deploymentTarget),
      deploymentTarget,
    )
  })
})

test('rejects a different lexical deployment target', () => {
  withTemporaryRepo(({ repoRoot }) => {
    assert.throws(
      () => assertSafeCalcFlowDeploymentTarget(repoRoot, resolve(repoRoot, 'static/calc-flow')),
      /outside static\/apps\/calc-flow/,
    )
  })
})

for (const symlinkLocation of ['static', 'static/apps', 'static/apps/calc-flow']) {
  test(`rejects a symbolic link at ${symlinkLocation}`, () => {
    withTemporaryRepo(({ repoRoot, outsideRoot }) => {
      const linkPath = resolve(repoRoot, symlinkLocation)
      mkdirSync(resolve(linkPath, '..'), { recursive: true })
      symlinkSync(outsideRoot, linkPath, 'dir')

      assert.throws(
        () => assertSafeCalcFlowDeploymentTarget(
          repoRoot,
          resolve(repoRoot, 'static/apps/calc-flow'),
        ),
        /symbolic link/,
      )
    })
  })
}

test('rejects a broken symbolic link in a parent component', () => {
  withTemporaryRepo(({ repoRoot, outsideRoot }) => {
    const linkPath = resolve(repoRoot, 'static/apps')
    mkdirSync(resolve(repoRoot, 'static'))
    symlinkSync(resolve(outsideRoot, 'missing'), linkPath, 'dir')

    assert.throws(
      () => assertSafeCalcFlowDeploymentTarget(
        repoRoot,
        resolve(repoRoot, 'static/apps/calc-flow'),
      ),
      /symbolic link/,
    )
  })
})
