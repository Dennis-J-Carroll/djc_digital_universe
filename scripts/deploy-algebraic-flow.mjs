import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  rmSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertSafeAlgebraicFlowDeploymentTarget } from './lib/algebraic-flow-deploy-guard.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRoot = resolve(repoRoot, 'apps/algebraic-flow')
const buildOutput = resolve(appRoot, 'dist')
const deploymentTarget = resolve(repoRoot, 'static/apps/algebraic-flow')

assertSafeAlgebraicFlowDeploymentTarget(repoRoot, deploymentTarget)

const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const build = spawnSync(pnpmCommand, ['run', 'build'], {
  cwd: appRoot,
  stdio: 'inherit',
})

if (build.error) {
  throw build.error
}

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

if (!existsSync(buildOutput) || !lstatSync(buildOutput).isDirectory()) {
  throw new Error(`Build output is missing: ${buildOutput}`)
}

if (!existsSync(resolve(buildOutput, 'index.html'))) {
  throw new Error(`Build output has no index.html: ${buildOutput}`)
}

assertSafeAlgebraicFlowDeploymentTarget(repoRoot, deploymentTarget)

rmSync(deploymentTarget, { recursive: true, force: true })
mkdirSync(deploymentTarget, { recursive: true })
cpSync(buildOutput, deploymentTarget, { recursive: true })

console.log(`Synchronized ${buildOutput} to ${deploymentTarget}`)
