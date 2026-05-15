export const glossary = {
  attractor: 'A set of states toward which a dynamical system evolves over time. Fixed points, limit cycles, and strange attractors are all attractors.',
  phaseSpace: "The space of all possible states of a system. A point in phase space completely specifies the system's current state; trajectories trace how the state evolves.",
  bifurcation: "A qualitative change in a system's behavior as a parameter crosses a threshold — for example, when a stable fixed point splits into a 2-cycle.",
  universalityClass: 'A set of physically distinct systems that share identical critical exponents and scaling behavior, despite different microscopic details. Membership depends on dimension and symmetry, not atomic composition.',
  coarseGraining: 'The process of averaging out fine-scale degrees of freedom to obtain an effective description at larger scales. Core operation in Renormalization Group theory.',
  kolmogorovComplexity: 'K(x) — the length of the shortest computer program that outputs string x on a universal Turing machine. Measures the algorithmic information content of x.',
  ntk: 'Neural Tangent Kernel — the kernel governing neural network training dynamics in the infinite-width limit. Characterizes how networks learn at initialization and enables convergence analysis.',
  scalingExponent: 'The exponent β in a power law f(n) ∝ n^{-β}. Determines how fast a quantity decays or grows with scale. Universal scaling exponents are shared across systems in the same universality class.',
  renormalizationGroup: "A mathematical framework that studies how a system's effective description changes under coarse-graining. Fixed points of the RG transformation correspond to scale-invariant, universal behavior.",
  feigenbaumConstant: 'δ ≈ 4.669 — the universal ratio at which successive period-doubling bifurcations compress in parameter space. First computed by Mitchell Feigenbaum in 1978, it appears in all one-dimensional maps with a quadratic maximum.',
  nadc: 'Numerical Attractor Descent Curve — the sequence of values taken by a dynamical variable as it converges toward an attractor under iteration. NADCs follow power-law decay when the attractor is a non-trivial fixed point.',
  powerLaw: 'A relationship f(x) ∝ x^α where the scaling is identical at every scale. Power laws appear at criticality, in scale-free networks, and in neural scaling laws.',
};
