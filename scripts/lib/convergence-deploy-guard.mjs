import { lstatSync } from 'node:fs'
import { resolve } from 'node:path'

const EXPECTED_SEGMENTS = ['static', 'convergence-game']

function lstatIfPresent(path) {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null
    throw error
  }
}

export function assertSafeConvergenceDeploymentTarget(repoRoot, deploymentTarget) {
  const normalizedRoot = resolve(repoRoot)
  const normalizedTarget = resolve(deploymentTarget)
  const expectedTarget = resolve(normalizedRoot, ...EXPECTED_SEGMENTS)
  if (normalizedTarget !== expectedTarget) {
    throw new Error('Refusing to deploy outside static/convergence-game')
  }

  let currentPath = normalizedRoot
  for (const segment of EXPECTED_SEGMENTS) {
    currentPath = resolve(currentPath, segment)
    const stats = lstatIfPresent(currentPath)
    if (!stats) continue
    if (stats.isSymbolicLink()) {
      throw new Error(`Refusing to deploy through symbolic link: ${currentPath}`)
    }
    if (!stats.isDirectory()) {
      throw new Error(`Deployment path component is not a directory: ${currentPath}`)
    }
  }
  return normalizedTarget
}
