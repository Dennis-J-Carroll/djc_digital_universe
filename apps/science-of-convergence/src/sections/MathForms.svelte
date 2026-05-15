<script>
  export let id = 'math-forms';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Mathematical Forms of Scaling</h2>
  <p>Four canonical mathematical forms describe convergent and scaling behavior. Each is a different face of the same geometric reality.</p>

  <ThreeLayer section="math-forms">
    <svelte:fragment slot="conceptual">
      <p>A <GlossaryTerm term="power law" definition="A scale-free relationship f(x) ∝ xᵅ — the same structure at every scale. Zooming in or out leaves the pattern unchanged." /> is scale-free: zoom in or out and the structure looks the same. Exponential laws have a characteristic scale. Critical phenomena and universal behavior are almost always described by power laws, never exponentials.</p>
      <p style="margin-top: 0.8em;">The four forms below — power-law decay, exponential decay, the neural scaling law, and Kolmogorov complexity — are all instances of the same idea: how much information remains as you accumulate more observations, steps, or parameters.</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <FormulaBlock
        formula="f(n) = A · n^(-β)   (power-law decay)"
        symbols={[{sym:'A',meaning:'amplitude (set by initial conditions)'},{sym:'β',meaning:'decay exponent (universal, positive for convergence)'},{sym:'n',meaning:'step count'}]}
        derivation="Arises near marginally stable fixed points where the linearized eigenvalue |λ| = 1. The iterates satisfy xₙ₊₁ − x* ≈ (xₙ − x*)(1 + γ(xₙ − x*)), which integrates to a power law."
        example="NADC for logistic map near r = 3: d(n) ≈ 3.0 · n⁻¹. After 100 iterations: d(100) ≈ 0.03. After 1000: d(1000) ≈ 0.003. Much slower than exponential decay."
      />
      <FormulaBlock
        formula="f(n) = A · e^(-λn)   (exponential decay)"
        symbols={[{sym:'λ',meaning:"decay rate (= −log|f'(x*)|, positive for attracting fixed point)"},{sym:'A',meaning:'amplitude'}]}
        derivation="Arises when the fixed point is hyperbolic: |f'(x*)| &lt; 1. The linearization xₙ₊₁ − x* ≈ f'(x*)(xₙ − x*) gives geometric convergence dₙ = |f'(x*)|ⁿ d₀ = e^(n log|f'(x*)|) d₀."
        example="Logistic map at r = 2.5: f'(x*) = −0.5, λ = log 2 ≈ 0.693. After 10 steps: d(10) ≈ d₀ × 0.5¹⁰ ≈ 10⁻³ d₀. Exponentially fast — a hallmark of hyperbolic attractors."
      />
      <FormulaBlock
        formula="L(C) ∝ C^(-α)   (neural scaling law)"
        symbols={[{sym:'L',meaning:'validation loss'},{sym:'C',meaning:'training compute (FLOPs)'},{sym:'α',meaning:'compute scaling exponent ≈ 0.05–0.1 for language models'}]}
        derivation="Empirically observed by Kaplan et al. (2020). Theoretically motivated by the universality of gradient descent dynamics near loss minima — analogous to critical slowing-down."
        example="Doubling compute C reduces loss by factor 2^(-0.076) ≈ 0.949 — a 5.1% improvement per doubling. Requires ~1000× compute increase for a 50% loss reduction."
      />
      <FormulaBlock
        formula="K(x) = min&#123; |p| : U(p) = x &#125;"
        symbols={[{sym:'K(x)',meaning:'Kolmogorov complexity of string x'},{sym:'p',meaning:'a program for universal Turing machine U'},{sym:'|p|',meaning:'length of program p in bits'}]}
        derivation="Defined by Kolmogorov (1965). K(x) is uncomputable in general (by reduction from the halting problem), but upper bounds are computable via any lossless compressor. Invariance theorem: K_U(x) and K_V(x) differ by at most a constant depending on U and V."
        example="String '010101...01' (100 reps): K ≈ log₂(100) ≈ 7 bits. Random string of 800 bits: K ≈ 800 bits. Power-law sequence dₙ = n⁻¹ to n=1000: K ≈ O(log 1000) ≈ 10 bits — highly compressible."
      />
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">import numpy as np
from scipy.optimize import curve_fit

def power_law(n, A, beta): return A * n**(-beta)
def exp_decay(n, A, lam): return A * np.exp(-lam * n)

ns = np.arange(1, 201)
d = 3.0 * ns**(-1.0) + 0.001*np.random.randn(200)

p_pow, _ = curve_fit(power_law, ns, d, p0=[3.0, 1.0])
p_exp, _ = curve_fit(exp_decay, ns, d, p0=[3.0, 0.1])

print(f"Power law fit:  A=&#123;p_pow[0]:.3f&#125;, β=&#123;p_pow[1]:.3f&#125;")
print(f"Exp decay fit:  A=&#123;p_exp[0]:.3f&#125;, λ=&#123;p_exp[1]:.3f&#125;")

# Distinguish models:
# Power law → linear residuals on log-log plot
# Exponential → linear residuals on semi-log plot</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
