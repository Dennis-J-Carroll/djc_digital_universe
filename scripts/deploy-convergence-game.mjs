import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertSafeConvergenceDeploymentTarget } from './lib/convergence-deploy-guard.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRoot = resolve(repoRoot, 'apps/convergence-game')
const buildOutput = resolve(appRoot, 'dist')
const deploymentTarget = resolve(repoRoot, 'static/convergence-game')

assertSafeConvergenceDeploymentTarget(repoRoot, deploymentTarget)

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const build = spawnSync(npmCommand, ['run', 'build'], {
  cwd: appRoot,
  stdio: 'inherit',
})

if (build.error) throw build.error
if (build.status !== 0) process.exit(build.status ?? 1)
if (!existsSync(buildOutput) || !lstatSync(buildOutput).isDirectory()) {
  throw new Error(`Build output is missing: ${buildOutput}`)
}

for (const requiredFile of ['index.html', 'convergence.js', 'convergence.css']) {
  if (!existsSync(resolve(buildOutput, requiredFile))) {
    throw new Error(`Build output has no ${requiredFile}: ${buildOutput}`)
  }
}

assertSafeConvergenceDeploymentTarget(repoRoot, deploymentTarget)
rmSync(deploymentTarget, { recursive: true, force: true })
mkdirSync(deploymentTarget, { recursive: true })
cpSync(buildOutput, deploymentTarget, { recursive: true })

console.log(`Synchronized ${buildOutput} to ${deploymentTarget}`)
