<script>
  export let id = 'outlook';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Outlook and Open Questions</h2>

  <p>The bridge from classical dynamical systems to modern AI scaling is intellectually exciting — but it is important to distinguish what is proven from what is plausible. This section frames the frontier honestly.</p>

  <ThreeLayer section="outlook">
    <svelte:fragment slot="conceptual">
      <p><strong>What is rigorously established:</strong></p>
      <ul style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>Feigenbaum universality: proven for C² unimodal maps with a quadratic maximum <Citation key="feigenbaum1978" /></li>
        <li>RG explanation of universality in statistical mechanics: proven <Citation key="wilson1971" /></li>
        <li>Neural scaling laws: empirically robust across model families and datasets <Citation key="kaplan2020" /> <Citation key="hoffmann2022" /></li>
        <li>NTK convergence in the infinite-width limit: proven <Citation key="jacot2018" /></li>
      </ul>
      <p><strong>What is a motivated analogy (not yet proven):</strong></p>
      <ul style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>That the RG formalism for dynamical systems directly maps to neural network training</li>
        <li>That power-law scaling laws in LLMs are governed by the same universality class as classical critical phenomena</li>
        <li>That KAN-style networks discover latent dynamical laws by recovering low-K descriptions</li>
      </ul>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p><strong>Open questions at the frontier:</strong></p>
      <ol style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>What is the precise universality class of gradient descent on overparameterized models? Does it depend on architecture, data distribution, or optimizer?</li>
        <li>Do neural scaling laws break at sufficiently large scale? <Citation key="hoffmann2022" /> suggests optimal compute allocation changes — but does the power-law form persist?</li>
        <li>Can KANDy (Kolmogorov-Arnold Networks for Dynamics) reliably discover the latent generating laws of observed NADCs? Early results are promising but not yet systematically benchmarked.</li>
        <li>Is there a formal analog of the Feigenbaum fixed-point equation for the loss landscape of neural networks trained by SGD?</li>
        <li>What is the right notion of "universality class" for neural architectures — and does it predict scaling exponents a priori?</li>
      </ol>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">import numpy as np

def train_linear_regression(n_steps=2000, lr=0.01):
    """Toy model: gradient descent on 1D linear regression.
    Tests whether gradient descent produces power-law NADCs."""
    np.random.seed(42)
    X = np.random.randn(100, 1)
    y = 2*X[:,0] + 0.1*np.random.randn(100)
    w = np.array([0.0])
    losses = []
    for _ in range(n_steps):
        pred = X @ w
        loss = np.mean((pred - y)**2)
        losses.append(loss)
        grad = 2 * X.T @ (pred - y) / len(y)
        w -= lr * grad
    return np.array(losses)

losses = train_linear_regression()
ns = np.arange(1, len(losses)+1)

from scipy.optimize import curve_fit
def power_law(n, A, beta): return A * n**(-beta)
params, _ = curve_fit(power_law, ns[50:], losses[50:], p0=[1.0, 0.5])
print(f"Fitted β for gradient descent NADC: &#123;params[1]:.3f&#125;")
# For linear regression: β = 1.0 (exact, from closed-form solution)
# For nonlinear models: β depends on loss landscape geometry</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
