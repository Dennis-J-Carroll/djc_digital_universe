<script>
  export let id = 'nadcs';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import PhaseSpaceExplorer from '../visualizations/PhaseSpaceExplorer.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Numerical Attractor Descent Curves</h2>

  <p>
    A <GlossaryTerm term="NADC" definition="Numerical Attractor Descent Curve — the sequence of distances ‖xₙ − x*‖ as an iterated map converges to its attractor x*." /> is the trajectory of distances from an attractor as a system converges. When the attractor is a non-trivial fixed point, these distances follow a power law — the same power law that appears in neural network training loss as a function of compute.
  </p>

  <ThreeLayer section="nadcs">
    <svelte:fragment slot="conceptual">
      <p>Consider a ball rolling into a bowl. The distance from the bottom decreases with each pass, but <em>how fast</em> it decreases reveals the geometry of the bowl. A parabolic bowl gives exponential decay. A flat-bottomed bowl gives power-law decay. The shape of convergence is informative.</p>
      <p style="margin-top: 0.8em;">NADCs make this shape explicit and comparable across systems. The same technique applied to logistic-map iterations, gradient descent on a neural loss, and temperature equilibration reveals structurally similar curves — suggesting a shared mechanism.</p>
      <p style="margin-top: 0.8em;">The phase space explorer below lets you explore this directly. Set r and click to place initial conditions. Watch how trajectories converge to the attractor at different rates.</p>
      <PhaseSpaceExplorer />
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>For the logistic map at a stable fixed point x* = 1 − 1/r (for 1 &lt; r &lt; 3), the linearized convergence rate is:</p>
      <FormulaBlock
        formula="d(n) = |xₙ − x*| ≈ C · |f'(x*)|ⁿ = C · |2 − r|ⁿ"
        symbols={[
          { sym: 'xₙ', meaning: 'state after n iterations' },
          { sym: 'x*', meaning: 'fixed point: x* = 1 − 1/r' },
          { sym: "f'(x*)", meaning: "derivative at fixed point: f'(x*) = 2 − r" },
          { sym: 'C', meaning: 'constant set by initial condition' },
        ]}
        validity="Valid for r ∈ (1, 3) where the fixed point is attracting. Near r = 3 the decay slows (|f'(x*)| → 1) and higher-order terms dominate."
        example="At r = 2.5: x* = 0.6, f'(x*) = −0.5. Starting at x₀ = 0.2, distance d(n) ≈ 0.4 × 0.5ⁿ. After 10 iterations: d(10) ≈ 3.9×10⁻⁴. Convergence is geometric (exponential), not a power law — because the fixed point is hyperbolic."
      />
      <p style="margin-top: 0.8em;">The power-law regime emerges near bifurcation points where |f'(x*)| → 1. Near r = 3, convergence slows to d(n) ∝ n⁻¹ — identical to critical slowing-down near phase transitions.</p>
      <FormulaBlock
        formula="d(n) ∝ n^(-β)"
        symbols={[
          { sym: 'β', meaning: 'scaling exponent — determined by the universality class, not the specific map' },
          { sym: 'n', meaning: 'iteration count (or compute steps, gradient steps, etc.)' },
        ]}
        validity="Valid near critical points (bifurcations, phase transitions, marginally stable attractors). Far from criticality, convergence is geometric."
        example="Critical slowing down near r = 3: the fixed point loses stability (f′(x*) → −1), so geometric convergence slows. A log-log fit of ‖xₙ − x*‖ over moderate iteration windows yields apparent β ≈ 1 — this is not a true power law but an approximation of near-geometric decay in the critical regime. A true power law (β = 1/2) appears in the center-manifold description of convergence TO the 2-cycle born at r = 3. For LLM scaling laws (Kaplan 2020): β ≈ 0.07–0.3 depending on the quantity being scaled."
      />
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">import numpy as np

def logistic(x, r): return r * x * (1 - x)

def nadc(x0, r, n_iter=200):
    """Compute NADC: distance from fixed point over iterations."""
    x_star = 1 - 1/r  # stable fixed point for 1 &lt; r &lt; 3
    xs = [x0]
    for _ in range(n_iter):
        xs.append(logistic(xs[-1], r))
    return np.array([abs(x - x_star) for x in xs])

# Compare convergence near vs far from bifurcation
r_far  = 2.0   # fast convergence, geometric
r_near = 2.98  # slow convergence, near power-law

d_far  = nadc(0.3, r_far)
d_near = nadc(0.3, r_near)

# Log-log plot reveals power-law regime
ns = np.arange(1, len(d_near))
log_ns = np.log(ns)
log_dn = np.log(d_near[1:] + 1e-15)
beta = -np.polyfit(log_ns[50:], log_dn[50:], 1)[0]
print(f"Fitted β near r=3: &#123;beta:.3f&#125;")  # → β ≈ 1.0 (log-log fit, not exact power law)</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
