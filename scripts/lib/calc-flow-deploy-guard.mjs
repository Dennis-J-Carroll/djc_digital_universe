import { lstatSync } from 'node:fs'
import { resolve } from 'node:path'

const EXPECTED_DEPLOYMENT_SEGMENTS = ['static', 'apps', 'calc-flow']

function lstatIfPresent(path) {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return null
    }

    throw error
  }
}

export function assertSafeCalcFlowDeploymentTarget(repoRoot, deploymentTarget) {
  const normalizedRepoRoot = resolve(repoRoot)
  const normalizedTarget = resolve(deploymentTarget)
  const expectedTarget = resolve(normalizedRepoRoot, ...EXPECTED_DEPLOYMENT_SEGMENTS)

  if (normalizedTarget !== expectedTarget) {
    throw new Error('Refusing to deploy outside static/apps/calc-flow')
  }

  let currentPath = normalizedRepoRoot

  for (const segment of EXPECTED_DEPLOYMENT_SEGMENTS) {
    currentPath = resolve(currentPath, segment)

    const stats = lstatIfPresent(currentPath)

    if (!stats) {
      continue
    }

    if (stats.isSymbolicLink()) {
      throw new Error(`Refusing to deploy through symbolic link: ${currentPath}`)
    }

    if (!stats.isDirectory()) {
      throw new Error(`Deployment path component is not a directory: ${currentPath}`)
    }
  }

  return normalizedTarget
}
