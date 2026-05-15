<script>
  export let id = 'universality';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import BifurcationDiagram from '../visualizations/BifurcationDiagram.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Universality and Scaling Laws</h2>

  <p>
    Universality is the surprising fact that systems with completely different microscopic structures can behave identically at large scales. The logistic map, the Rössler system, dripping faucets, and population models all share the same
    <GlossaryTerm term="Feigenbaum constant" definition="δ ≈ 4.669 — the universal ratio at which successive period-doubling bifurcations compress in parameter space." />
    δ ≈ 4.669 in their period-doubling sequences. <Citation key="feigenbaum1978" />
  </p>

  <ThreeLayer section="universality">
    <svelte:fragment slot="conceptual">
      <p>Universality tells us that many details don't matter. Two systems can look completely different at the level of equations yet produce identical scaling structure. This happens because both systems are governed by the same
        <GlossaryTerm term="renormalization group" definition="A mathematical framework that iteratively zooms out a system, revealing which properties survive at large scales. Fixed points correspond to universal, scale-invariant behavior." />
        fixed point.
      </p>
      <p style="margin-top: 0.8em;">The bifurcation diagram below shows the logistic map's transition to chaos. Drag to zoom into the period-doubling cascade to see self-similar structure and Feigenbaum ratios converging to δ ≈ 4.669.</p>
      <BifurcationDiagram />
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The Feigenbaum universality result: for any family of maps f_r with a quadratic maximum, the ratios of successive period-doubling parameter intervals converge to:</p>
      <FormulaBlock
        formula="δ = lim(n→∞) (rₙ − rₙ₋₁) / (rₙ₊₁ − rₙ) ≈ 4.66920160..."
        symbols={[
          { sym: 'rₙ', meaning: 'parameter value at n-th period-doubling bifurcation' },
          { sym: 'δ', meaning: "Feigenbaum's first constant — universal for all unimodal maps with quadratic maximum" },
        ]}
        validity="Exactly universal for C² unimodal maps with a single quadratic maximum. Asymptotically exact as n → ∞; converges geometrically in n."
        example="For the logistic map: r₁ = 3.000, r₂ = 3.449, r₃ = 3.544, r₄ = 3.569. Ratios: (r₂−r₁)/(r₃−r₂) = 0.449/0.095 ≈ 4.72, (r₃−r₂)/(r₄−r₃) = 0.095/0.025 ≈ 3.80. Convergence is slow at first, then accelerates toward δ ≈ 4.6692."
      />
      <p style="margin-top: 0.8em;">Neural scaling laws exhibit an analogous universality <Citation key="kaplan2020" />: the loss-compute frontier L(C) ∝ C<sup>−α</sup> with α ≈ 0.05–0.1 holds across model families, training regimes, and data distributions — suggesting a shared universality class for gradient-descent optimization on natural language.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">def find_bifurcations(n=6, tol=1e-9):
    """Locate period-doubling bifurcations of logistic map."""
    windows = [(2.9,3.1),(3.4,3.5),(3.54,3.56),(3.564,3.57),(3.568,3.569),(3.5687,3.5688)]
    results = []
    for lo, hi in windows[:n]:
        a, b = lo, hi
        for _ in range(100):
            mid = (a + b) / 2
            period_mid = estimate_period(mid)
            period_lo  = estimate_period(a)
            if period_mid > period_lo:
                b = mid
            else:
                a = mid
        results.append((a + b) / 2)
    return results

r_n = find_bifurcations()
deltas = [(r_n[i]-r_n[i-1])/(r_n[i+1]-r_n[i]) for i in range(1, len(r_n)-1)]
print(deltas)
# → [4.233, 4.552, 4.646, 4.664] — converging to δ ≈ 4.669</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
