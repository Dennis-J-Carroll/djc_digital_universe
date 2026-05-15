<script>
  export let id = 'intro';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import Citation from '../ui/Citation.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Introduction: The Convergence Thesis</h2>

  <p>
    A striking pattern appears across seemingly unrelated phenomena: the same mathematical structure governs how populations stabilize, how physical systems approach criticality, how optimization algorithms descend loss landscapes, and how language models improve with scale. This is not coincidence. It is
    <GlossaryTerm term="universality" definition="The phenomenon where systems with completely different microscopic details exhibit identical macroscopic behavior near critical points." />.
  </p>

  <p>
    This app develops one central thesis: <strong>convergence to attractors follows universal scaling laws</strong>, and this structural fact connects classical dynamical systems to modern machine learning. We trace this thread through six interconnected topics, each revealing the same underlying geometry from a different angle.
  </p>

  <ThreeLayer section="intro">
    <svelte:fragment slot="conceptual">
      <p><strong>What you will find here:</strong></p>
      <ol style="padding-left: 1.5em; line-height: 2; margin-top: 0.5em;">
        <li><strong>NADCs</strong> — how convergent trajectories are characterized by their descent curves</li>
        <li><strong>Universality</strong> — why systems in the same class share scaling exponents</li>
        <li><strong>Mathematical Forms</strong> — the four canonical representations of scaling behavior</li>
        <li><strong>Mechanisms</strong> — renormalization group theory and bifurcation as the why</li>
        <li><strong>Compression</strong> — how lawful structure enables shorter descriptions</li>
        <li><strong>Outlook</strong> — frontier questions at the boundary of classical and neural scaling</li>
      </ol>
      <p style="margin-top: 1em;">Each section supports three reading depths: Conceptual (you are here), Technical (derivations and formal definitions), and Computational (code and worked examples).</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The central mathematical object is a dynamical system <em>f: X → X</em> with an
        <GlossaryTerm term="attractor" definition="A set of states toward which a system evolves under iteration, independent of initial conditions within a basin of attraction." />
        A* ⊂ X. We study how the sequence x₀, f(x₀), f²(x₀), ... approaches A*.</p>
      <p style="margin-top: 0.8em;">When the approach is characterized by a power law ‖xₙ − A*‖ ∝ n<sup>−β</sup>, the
        <GlossaryTerm term="scaling exponent" definition="The exponent β in ‖xₙ − A*‖ ∝ n^(-β). Universal scaling exponents are shared across all systems in the same universality class." />
        β is often universal: the same for a wide basin of initial conditions and even for structurally different maps near the same
        <GlossaryTerm term="universality class" definition="A set of distinct systems sharing identical critical exponents, determined by dimension and symmetry rather than microscopic details." />.
      </p>
      <p style="margin-top: 0.8em;">The <Citation key="feigenbaum1978" /> discovery of a universal constant δ ≈ 4.669 in period-doubling cascades was the first rigorous demonstration of this universality in a concrete family of dynamical systems.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <p>Throughout this app, the logistic map <code>f(x) = r·x·(1−x)</code> serves as the primary worked example. It is simple enough to analyze by hand, rich enough to exhibit universality, period-doubling, chaos, and all major features of one-dimensional maps with a quadratic maximum.</p>
      <pre style="background: var(--formula-bg); padding: 12px; border-radius: 4px; font-size: 0.82em; overflow-x: auto; margin-top: 8px;"># All visualizations use:
# f(x, r) = r * x * (1 - x),  x in [0,1]
#
# Key parameter values:
# r = 2.0  → stable fixed point x* = 0.5
# r = 3.2  → stable 2-cycle &#123;0.513, 0.799&#125;
# r = 3.57 → onset of chaos
# r = 4.0  → fully chaotic, ergodic on [0,1]</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
