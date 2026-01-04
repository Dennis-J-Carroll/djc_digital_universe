import React, { useState, useEffect, useRef, useCallback } from 'react'

// Simulation parameters
const GRID_SIZE = 80
const INITIAL_NUTRIENTS = 800
const SIMULATION_STEPS = 150
const POPULATION_SIZE = 12

// Genome class - encodes all evolvable parameters
class Genome {
  constructor(genes = null) {
    if (genes) {
      Object.assign(this, genes)
    } else {
      // Initialize with random values
      this.branchProbability = 0.05 + Math.random() * 0.15 // 0.05-0.2
      this.chemotaxisSensitivity = 0.1 + Math.random() * 0.4 // 0.1-0.5
      this.growthSpeed = 0.8 + Math.random() * 1.4 // 0.8-2.2
      this.energyEfficiency = 0.05 + Math.random() * 0.15 // 0.05-0.2
      this.anastomosisDistance = 1.5 + Math.random() * 3 // 1.5-4.5
      this.metabolismRate = 1.5 + Math.random() * 1 // 1.5-2.5
      this.branchAngleVariance = 0.3 + Math.random() * 1.2 // 0.3-1.5
    }
  }

  mutate(mutationRate = 0.1) {
    const newGenes = { ...this }
    
    if (Math.random() < mutationRate) {
      newGenes.branchProbability = Math.max(0.01, Math.min(0.3, 
        this.branchProbability + (Math.random() - 0.5) * 0.02))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.chemotaxisSensitivity = Math.max(0.05, Math.min(0.8, 
        this.chemotaxisSensitivity + (Math.random() - 0.5) * 0.05))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.growthSpeed = Math.max(0.5, Math.min(3, 
        this.growthSpeed + (Math.random() - 0.5) * 0.2))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.energyEfficiency = Math.max(0.02, Math.min(0.3, 
        this.energyEfficiency + (Math.random() - 0.5) * 0.02))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.anastomosisDistance = Math.max(1, Math.min(6, 
        this.anastomosisDistance + (Math.random() - 0.5) * 0.3))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.metabolismRate = Math.max(1, Math.min(4, 
        this.metabolismRate + (Math.random() - 0.5) * 0.2))
    }
    
    if (Math.random() < mutationRate) {
      newGenes.branchAngleVariance = Math.max(0.1, Math.min(2, 
        this.branchAngleVariance + (Math.random() - 0.5) * 0.1))
    }
    
    return new Genome(newGenes)
  }

  crossover(other) {
    const child1Genes = {}
    const child2Genes = {}
    
    Object.keys(this).forEach(key => {
      if (Math.random() < 0.5) {
        child1Genes[key] = this[key]
        child2Genes[key] = other[key]
      } else {
        child1Genes[key] = other[key]
        child2Genes[key] = this[key]
      }
    })
    
    return [new Genome(child1Genes), new Genome(child2Genes)]
  }
}

// Enhanced Hyphal tip with genome-driven behavior
class HyphalTip {
  constructor(x, y, direction = Math.random() * 2 * Math.PI, energy = 100, genome) {
    this.x = x
    this.y = y
    this.direction = direction
    this.energy = energy
    this.age = 0
    this.id = Math.random().toString(36).substr(2, 9)
    this.trail = [{x, y}]
    this.genome = genome
  }

  move(environment, tips) {
    // Genome-influenced chemotaxis
    const gradient = this.calculateGradient(environment)
    this.direction += gradient * this.genome.chemotaxisSensitivity + 
                     (Math.random() - 0.5) * 0.15
    
    // Genome-influenced movement speed
    const speed = Math.min(this.energy / 50, this.genome.growthSpeed)
    const newX = Math.max(0, Math.min(GRID_SIZE - 1, 
      this.x + Math.cos(this.direction) * speed))
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, 
      this.y + Math.sin(this.direction) * speed))
    
    // Consume nutrients with genome-influenced efficiency
    const gridX = Math.floor(newX)
    const gridY = Math.floor(newY)
    const nutrients = environment[gridY][gridX]
    
    if (nutrients > 0) {
      this.energy += nutrients * this.genome.energyEfficiency
      environment[gridY][gridX] = Math.max(0, nutrients - 5)
      this.x = newX
      this.y = newY
      this.trail.push({x: newX, y: newY})
      
      if (this.trail.length > 25) {
        this.trail.shift()
      }
    }
    
    this.age++
    this.energy -= this.genome.metabolismRate // Genome-influenced metabolism
    
    return this.shouldBranch() ? this.branch() : null
  }
  
  calculateGradient(environment) {
    const radius = 4
    let maxGradient = 0
    let bestDirection = this.direction
    
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
      const checkX = Math.floor(this.x + Math.cos(angle) * radius)
      const checkY = Math.floor(this.y + Math.sin(angle) * radius)
      
      if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE) {
        const nutrients = environment[checkY][checkX]
        if (nutrients > maxGradient) {
          maxGradient = nutrients
          bestDirection = angle
        }
      }
    }
    
    return bestDirection - this.direction
  }
  
  shouldBranch() {
    const energyThreshold = 60
    return this.energy > energyThreshold && Math.random() < this.genome.branchProbability
  }
  
  branch() {
    const branchAngle = this.direction + 
      (Math.random() - 0.5) * this.genome.branchAngleVariance
    return new HyphalTip(this.x, this.y, branchAngle, this.energy * 0.65, this.genome)
  }
  
  isAlive() {
    return this.energy > 0
  }
  
  canAnastomose(other) {
    const distance = Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
    return distance < this.genome.anastomosisDistance && this.id !== other.id
  }
}

// Individual organism (one fungal network)
class FungalOrganism {
  constructor(genome, environment) {
    this.genome = genome
    this.tips = [
      new HyphalTip(GRID_SIZE / 2, GRID_SIZE / 2, 0, 100, genome),
      new HyphalTip(GRID_SIZE / 2, GRID_SIZE / 2, Math.PI / 2, 100, genome),
      new HyphalTip(GRID_SIZE / 2, GRID_SIZE / 2, Math.PI, 100, genome),
      new HyphalTip(GRID_SIZE / 2, GRID_SIZE / 2, 3 * Math.PI / 2, 100, genome)
    ]
    this.environment = environment.map(row => [...row]) // Copy environment
    this.fitness = 0
    this.stats = {
      totalEnergy: 400,
      networkLength: 0,
      coverage: 0,
      resourcesCollected: 0,
      maxTips: 4,
      survivalTime: 0
    }
  }

  simulate() {
    let totalResourcesCollected = 0
    
    for (let step = 0; step < SIMULATION_STEPS; step++) {
      // Diffuse nutrients
      this.environment = this.diffuseNutrients(this.environment)
      
      const newTips = []
      let totalEnergy = 0
      let networkLength = 0
      const resourcesBefore = this.getTotalResources()
      
      // Update each tip
      this.tips.forEach(tip => {
        if (tip.isAlive()) {
          const newBranch = tip.move(this.environment, this.tips)
          newTips.push(tip)
          totalEnergy += tip.energy
          networkLength += tip.trail.length
          
          if (newBranch) {
            newTips.push(newBranch)
          }
        }
      })
      
      // Handle anastomosis
      for (let i = 0; i < newTips.length; i++) {
        for (let j = i + 1; j < newTips.length; j++) {
          if (newTips[i] && newTips[j] && newTips[i].canAnastomose(newTips[j])) {
            const avgEnergy = (newTips[i].energy + newTips[j].energy) / 2
            newTips[i].energy = avgEnergy * 1.15 // Anastomosis benefit
            newTips.splice(j, 1)
            break
          }
        }
      }
      
      this.tips = newTips
      
      const resourcesAfter = this.getTotalResources()
      const resourcesConsumed = resourcesBefore - resourcesAfter
      totalResourcesCollected += resourcesConsumed
      
      // Update stats
      this.stats.totalEnergy = totalEnergy
      this.stats.networkLength = networkLength
      this.stats.resourcesCollected = totalResourcesCollected
      this.stats.maxTips = Math.max(this.stats.maxTips, this.tips.length)
      
      if (this.tips.length > 0) {
        this.stats.survivalTime = step
      }
      
      // Calculate coverage
      const coveredCells = new Set()
      this.tips.forEach(tip => {
        tip.trail.forEach(point => {
          coveredCells.add(`${Math.floor(point.x)},${Math.floor(point.y)}`)
        })
      })
      this.stats.coverage = coveredCells.size
      
      // Early termination if network dies
      if (this.tips.length === 0) break
    }
    
    this.calculateFitness()
  }

  getTotalResources() {
    return this.environment.flat().reduce((sum, val) => sum + val, 0)
  }

  diffuseNutrients(environment) {
    const newEnv = environment.map(row => [...row])
    const diffusionRate = 0.08
    
    for (let y = 1; y < GRID_SIZE - 1; y++) {
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        const avg = (
          environment[y-1][x] + environment[y+1][x] + 
          environment[y][x-1] + environment[y][x+1]
        ) / 4
        
        newEnv[y][x] += (avg - environment[y][x]) * diffusionRate
      }
    }
    
    return newEnv
  }

  calculateFitness() {
    // Multi-objective fitness function
    const resourceEfficiency = this.stats.resourcesCollected / INITIAL_NUTRIENTS
    const networkEfficiency = this.stats.coverage / (GRID_SIZE * GRID_SIZE)
    const survivalScore = this.stats.survivalTime / SIMULATION_STEPS
    const connectivityScore = Math.min(this.stats.maxTips / 20, 1)
    
    this.fitness = (
      resourceEfficiency * 0.4 +
      networkEfficiency * 0.3 +
      survivalScore * 0.2 +
      connectivityScore * 0.1
    )
  }
}

// Environment generation
const createEnvironment = () => {
  const env = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))
  
  // Create diverse nutrient patches
  const patchTypes = [
    { count: 3, radius: 8, intensity: 1.2 }, // Large patches
    { count: 5, radius: 4, intensity: 0.8 }, // Medium patches
    { count: 8, radius: 2, intensity: 0.5 }  // Small patches
  ]
  
  patchTypes.forEach(patchType => {
    for (let i = 0; i < patchType.count; i++) {
      const centerX = Math.floor(Math.random() * GRID_SIZE)
      const centerY = Math.floor(Math.random() * GRID_SIZE)
      
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
          if (distance < patchType.radius) {
            env[y][x] += INITIAL_NUTRIENTS * patchType.intensity * 
                        (1 - distance / patchType.radius)
          }
        }
      }
    }
  })
  
  return env
}

// Evolution manager
class EvolutionManager {
  constructor() {
    this.generation = 0
    this.population = []
    this.bestFitnesses = []
    this.avgFitnesses = []
    this.bestGenome = null
  }

  initializePopulation() {
    this.population = []
    for (let i = 0; i < POPULATION_SIZE; i++) {
      this.population.push(new Genome())
    }
  }

  evaluateGeneration() {
    const organisms = this.population.map(genome => {
      const organism = new FungalOrganism(genome, createEnvironment())
      organism.simulate()
      return organism
    })

    // Sort by fitness
    organisms.sort((a, b) => b.fitness - a.fitness)
    
    // Track statistics
    const fitnesses = organisms.map(org => org.fitness)
    const bestFitness = Math.max(...fitnesses)
    const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length
    
    this.bestFitnesses.push(bestFitness)
    this.avgFitnesses.push(avgFitness)
    this.bestGenome = organisms[0].genome
    
    return organisms
  }

  evolveNextGeneration() {
    const organisms = this.evaluateGeneration()
    const newPopulation = []
    
    // Elitism - keep top 20%
    const eliteCount = Math.floor(POPULATION_SIZE * 0.2)
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(organisms[i].genome)
    }
    
    // Generate offspring
    while (newPopulation.length < POPULATION_SIZE) {
      // Tournament selection
      const parent1 = this.tournamentSelect(organisms)
      const parent2 = this.tournamentSelect(organisms)
      
      // Crossover
      const [child1, child2] = parent1.genome.crossover(parent2.genome)
      
      // Mutation
      newPopulation.push(child1.mutate(0.15))
      if (newPopulation.length < POPULATION_SIZE) {
        newPopulation.push(child2.mutate(0.15))
      }
    }
    
    this.population = newPopulation
    this.generation++
    
    return organisms
  }

  tournamentSelect(organisms, tournamentSize = 3) {
    const tournament = []
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(organisms[Math.floor(Math.random() * organisms.length)])
    }
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best)
  }
}

// Main component
const EvolutionaryFungalSimulator = () => {
  const canvasRef = useRef(null)
  const [evolutionManager] = useState(() => new EvolutionManager())
  
  const [isEvolving, setIsEvolving] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [showBestOrganism, setShowBestOrganism] = useState(false)
  const [populationStats, setPopulationStats] = useState(null)
  const [bestOrganism, setBestOrganism] = useState(null)
  
  useEffect(() => {
    evolutionManager.initializePopulation()
    setCurrentGeneration(evolutionManager.generation)
  }, [evolutionManager])

  const runEvolutionStep = useCallback(() => {
    evolutionManager.evolveNextGeneration()

    setCurrentGeneration(evolutionManager.generation)
    setPopulationStats({
      bestFitness: evolutionManager.bestFitnesses[evolutionManager.bestFitnesses.length - 1],
      avgFitness: evolutionManager.avgFitnesses[evolutionManager.avgFitnesses.length - 1],
      bestGenome: evolutionManager.bestGenome
    })
    
    // Create best organism for visualization
    const best = new FungalOrganism(evolutionManager.bestGenome, createEnvironment())
    best.simulate()
    setBestOrganism(best)
  }, [evolutionManager])

  const renderBestOrganism = useCallback(() => {
    if (!bestOrganism || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const scale = canvas.width / GRID_SIZE
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Render nutrients
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const nutrients = bestOrganism.environment[y][x]
        if (nutrients > 0) {
          const intensity = Math.min(nutrients / INITIAL_NUTRIENTS, 1)
          ctx.fillStyle = `rgba(34, 139, 34, ${intensity * 0.4})`
          ctx.fillRect(x * scale, y * scale, scale, scale)
        }
      }
    }
    
    // Render network
    bestOrganism.tips.forEach((tip, index) => {
      if (tip.trail.length > 1) {
        ctx.strokeStyle = `hsl(${200 + (index * 30) % 160}, 70%, 60%)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(tip.trail[0].x * scale, tip.trail[0].y * scale)
        
        tip.trail.forEach(point => {
          ctx.lineTo(point.x * scale, point.y * scale)
        })
        ctx.stroke()
        
        ctx.fillStyle = `hsl(${200 + (index * 30) % 160}, 80%, 70%)`
        ctx.beginPath()
        ctx.arc(tip.x * scale, tip.y * scale, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }, [bestOrganism])

  useEffect(() => {
    if (showBestOrganism) {
      renderBestOrganism()
    }
  }, [showBestOrganism, renderBestOrganism])

  useEffect(() => {
    let intervalId
    if (isEvolving) {
      intervalId = setInterval(() => {
        runEvolutionStep()
      }, 1000) // One generation per second
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isEvolving, runEvolutionStep])

  const resetEvolution = () => {
    setIsEvolving(false)
    evolutionManager.generation = 0
    evolutionManager.bestFitnesses = []
    evolutionManager.avgFitnesses = []
    evolutionManager.bestGenome = null
    evolutionManager.initializePopulation()
    setCurrentGeneration(0)
    setPopulationStats(null)
    setBestOrganism(null)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Evolutionary Fungal Network Simulator
        </h1>
        <p className="text-gray-300">
          Watch evolution optimize fungal foraging strategies across generations through genetic algorithms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {showBestOrganism ? `Best Network (Gen ${currentGeneration})` : 'Evolution Visualization'}
              </h3>
              <button
                onClick={() => setShowBestOrganism(!showBestOrganism)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
              >
                {showBestOrganism ? 'Hide Network' : 'Show Best'}
              </button>
            </div>
            
            {showBestOrganism ? (
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full border border-gray-600 rounded"
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 text-yellow-400 text-3xl">⚡</div>
                  <p className="text-gray-400">Evolution in progress...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Show Best" to visualize the fittest network
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls and Stats */}
        <div className="space-y-6">
          {/* Evolution Controls */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Evolution Controls</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsEvolving(!isEvolving)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                {isEvolving ? '⏸️' : '▶️'}
                {isEvolving ? 'Pause Evolution' : 'Start Evolution'}
              </button>
              
              <button
                onClick={runEvolutionStep}
                disabled={isEvolving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
              >
                ⚡ Single Generation
              </button>
              
              <button
                onClick={resetEvolution}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                🔄 Reset Evolution
              </button>
            </div>
          </div>

          {/* Evolution Statistics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Evolution Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Generation:</span>
                <span className="font-mono text-yellow-400">{currentGeneration}</span>
              </div>
              <div className="flex justify-between">
                <span>Population Size:</span>
                <span className="font-mono">{POPULATION_SIZE}</span>
              </div>
              {populationStats && (
                <>
                  <div className="flex justify-between">
                    <span>Best Fitness:</span>
                    <span className="font-mono text-green-400">
                      {populationStats.bestFitness.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Fitness:</span>
                    <span className="font-mono text-blue-400">
                      {populationStats.avgFitness.toFixed(3)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Best Genome */}
          {populationStats && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Best Genome</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Branch Prob:</span>
                  <span className="font-mono">{populationStats.bestGenome.branchProbability.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chemotaxis:</span>
                  <span className="font-mono">{populationStats.bestGenome.chemotaxisSensitivity.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Speed:</span>
                  <span className="font-mono">{populationStats.bestGenome.growthSpeed.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-mono">{populationStats.bestGenome.energyEfficiency.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anastomosis:</span>
                  <span className="font-mono">{populationStats.bestGenome.anastomosisDistance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metabolism:</span>
                  <span className="font-mono">{populationStats.bestGenome.metabolismRate.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Best Organism Stats */}
          {bestOrganism && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Best Network Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Resources Collected:</span>
                  <span className="font-mono">{Math.round(bestOrganism.stats.resourcesCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-mono">{bestOrganism.stats.coverage} cells</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Network Size:</span>
                  <span className="font-mono">{bestOrganism.stats.maxTips} tips</span>
                </div>
                <div className="flex justify-between">
                  <span>Survival Time:</span>
                  <span className="font-mono">{bestOrganism.stats.survivalTime} steps</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Fitness:</span>
                  <span className="font-mono text-green-400">{bestOrganism.fitness.toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fitness Evolution Chart */}
      {evolutionManager.bestFitnesses.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Fitness Evolution</h3>
          <div className="h-32 bg-gray-900 rounded relative overflow-hidden">
            <svg className="w-full h-full">
              {evolutionManager.bestFitnesses.map((fitness, index) => {
                const x = (index / (evolutionManager.bestFitnesses.length - 1)) * 100
                const y = 100 - (fitness * 80)
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="2"
                    fill="#10b981"
                  />
                )
              })}
              {evolutionManager.avgFitnesses.map((fitness, index) => {
                const x = (index / (evolutionManager.avgFitnesses.length - 1)) * 100
                const y = 100 - (fitness * 80)
                return (
                  <circle
                    key={`avg-${index}`}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="1.5"
                    fill="#3b82f6"
                  />
                )
              })}
            </svg>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              <span className="text-green-400">●</span> Best Fitness
              <span className="ml-3 text-blue-400">●</span> Avg Fitness
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvolutionaryFungalSimulator