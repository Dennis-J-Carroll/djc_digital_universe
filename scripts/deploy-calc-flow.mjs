import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  rmSync,
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appRoot = resolve(repoRoot, 'apps/calculus-flow')
const buildOutput = resolve(appRoot, 'dist')
const deploymentTarget = resolve(repoRoot, 'static/apps/calc-flow')
const expectedTargetPath = 'static/apps/calc-flow'

if (relative(repoRoot, deploymentTarget).split('\\').join('/') !== expectedTargetPath) {
  throw new Error(`Refusing to deploy outside ${expectedTargetPath}`)
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const build = spawnSync(npmCommand, ['run', 'build'], {
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

if (existsSync(deploymentTarget) && lstatSync(deploymentTarget).isSymbolicLink()) {
  throw new Error(`Refusing to replace symlinked deployment target: ${deploymentTarget}`)
}

rmSync(deploymentTarget, { recursive: true, force: true })
mkdirSync(deploymentTarget, { recursive: true })
cpSync(buildOutput, deploymentTarget, { recursive: true })

console.log(`Synchronized ${buildOutput} to ${deploymentTarget}`)
