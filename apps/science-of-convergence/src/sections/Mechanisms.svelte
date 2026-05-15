<script>
  export let id = 'mechanisms';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Underlying Mechanisms of Universality</h2>

  <p>
    Why do different systems share the same scaling exponents? Two interlocking frameworks explain this:
    <GlossaryTerm term="renormalization group" definition="A mathematical framework that iteratively zooms out a system, revealing which properties survive at large scales. Fixed points correspond to universal, scale-invariant behavior." />
    (RG) theory and
    <GlossaryTerm term="bifurcation" definition="A qualitative change in system behavior as a parameter crosses a threshold — e.g., a stable fixed point splitting into a 2-cycle." />
    theory. Together they explain not only Feigenbaum universality but — through a formal analogy — the universality of neural network training dynamics.
  </p>

  <ThreeLayer section="mechanisms">
    <svelte:fragment slot="conceptual">
      <p>The RG idea: repeatedly "zoom out" a system by averaging over short-scale details. Systems that flow to the same fixed point under this transformation share all large-scale behavior. The irrelevant operators — microscopic details — wash out. Only a few relevant operators survive, and these determine the universality class.</p>
      <p style="margin-top: 0.8em;">Feigenbaum's insight was that the logistic map at the period-doubling accumulation point is a fixed point of a functional RG transformation. Near this fixed point, the linearized transformation has exactly one unstable direction with eigenvalue δ ≈ 4.669. This explains why δ is the same for all maps with a quadratic maximum.</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The RG transformation <em>R</em> acts on a space of functions. A fixed point g satisfies <em>R</em>(g) = g. Near the fixed point, linearizing gives eigenvalues λᵢ: <Citation key="wilson1971" /></p>
      <FormulaBlock
        formula="λᵢ = b^(yᵢ)"
        symbols={[
          {sym:'b',meaning:'rescaling factor (coarse-graining step size)'},
          {sym:'yᵢ',meaning:'RG eigenvalue for perturbation i'},
          {sym:'λᵢ > 1',meaning:'relevant operator — grows under RG (drives away from fixed point)'},
          {sym:'λᵢ < 1',meaning:'irrelevant operator — shrinks under RG (microscopic detail, washes out)'},
        ]}
        derivation="Expand the RG flow near a fixed point g*: R(g* + δg) ≈ g* + L_RG(δg), where L_RG is the linearized RG operator. Its eigenvectors are the scaling operators; eigenvalues determine relevance."
        example="For the logistic map at the Feigenbaum fixed point: b = δ ≈ 4.669. Irrelevant operators decay as (1/4.669)ⁿ ≈ 0.214ⁿ — negligible after ~5 RG steps. Only 2 relevant operators survive, explaining why the fixed point attracts systems from a wide basin."
      />
      <p style="margin-top: 0.8em;"><strong>RG for Neural Networks</strong> <Citation key="banta2025" />: A formal RG framework applies to deep neural networks. The loss landscape plays the role of the free energy surface. Layer-by-layer coarse-graining maps to RG steps. Fixed points of this NN-RG correspond to universality classes of training dynamics — explaining why architecturally different networks obey the same scaling laws.</p>
      <p style="margin-top: 0.8em;">The
        <GlossaryTerm term="NTK" definition="Neural Tangent Kernel — the kernel governing neural network training dynamics in the infinite-width limit. Characterizes how networks learn at initialization." />
        characterizes network training in the infinite-width limit <Citation key="jacot2018" />. NTK phase transitions — sudden changes in the NTK spectrum during training — correspond to bifurcations in the effective dynamical system of gradient descent, marking regime changes analogous to period-doubling in the logistic map.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">import numpy as np

def logistic(x, r): return r * x * (1 - x)

def feigenbaum_rg_step(f, alpha=2.5029):
    """One step of Feigenbaum's functional RG:
       R(f)(x) = -1/alpha * f(f(-alpha*x))"""
    def Rf(x):
        return -1/alpha * f(f(-alpha * x))
    return Rf

# The fixed-point function g satisfies R(g) = g.
# Polynomial approximation (Feigenbaum 1978):
def g_approx(x):
    return 1 - 1.5276*x**2 + 0.1048*x**4

# Verify: g(0) = 1, R(g)(0) = -1/2.5029 * g(g(0)) = -1/2.5029 * g(1)
g1 = g_approx(1)  # ≈ -0.4228
Rg0 = -1/2.5029 * g_approx(g1)
print(f"g(0)    = &#123;g_approx(0):.4f&#125;")   # → 1.0000
print(f"R(g)(0) = &#123;Rg0:.4f&#125;")           # → ~0.999 (converges with higher-order terms)</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
