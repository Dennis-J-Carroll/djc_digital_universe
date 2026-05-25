# Sphere Chat Interface

A browser-based experimental chat experience built around a living 3D sphere, glassmorphism UI, and a cybernetic / epistemic aesthetic. The goal is not a generic chat clone. The goal is a responsive, legible, emotionally strange interface where the sphere behaves like an active cognitive artifact, not decorative wallpaper.

## Primary objective

Overhaul this app into a high-quality interactive web experience that fuses:
- a performant 3D / motion-rich sphere visualization,
- a usable chat interface,
- a coherent “epistemic agency” design language,
- and strong mobile resilience.

Success means the app feels intentional, alive, and narratively coherent while still being fast, readable, and controllable.

## Product intent

This project should feel like:
- a conversation with a synthetic intelligence core,
- a visual metaphor for uncertainty, curiosity, memory, and self-revision,
- and a stylized but usable interface for exploratory dialogue.

It should **not** feel like:
- a stock cyberpunk landing page,
- a generic “AI assistant” panel with decorations,
- or a flashy demo where the sphere steals attention from interaction.

## Ground truth about current app

The current implementation uses:
- a dark background with cyan / magenta neon accents,
- a central particle sphere rendered with Three.js,
- glassmorphism chat panels,
- a fixed-height single-screen composition,
- animated particle deformation and burst behavior,
- and responsive breakpoints that eventually hide the sphere on very small screens.

Known traits from current source / notes:
- Sphere uses a Three.js particle system with roughly 2000 points and additive blending.
- Motion is driven by Perlin-noise-like perturbation plus trigonometric offsets.
- Chat UI currently uses compact message bubbles, a fixed input area on small screens, and glow-heavy styling.
- Existing visual language centers on cyan `#00F0FF`, magenta `#BF00FF`, dark backgrounds around `#0A0A0F`, and light text near `#E6EDF3`.
- Prior notes emphasize glass surfaces, neon text, scanline motifs, wireframe overlays, and stronger accessibility / ARIA improvements as future work.

## Design north star

Translate research themes from the attached epistemic-agency material into interface behavior rather than merely sprinkling terminology into copy.

Core conceptual pillars:
- **Curiosity:** the system should signal active probing, not passive output.
- **Uncertainty:** the UI may reveal ambiguity, confidence, instability, or branching states instead of pretending certainty.
- **Faithful incompletion:** if a state is unresolved, the app should represent unresolvedness cleanly instead of faking closure.
- **Self-revision:** the sphere and message system may visually imply reflection, recursion, or refinement.
- **Governed agency:** the experience should feel bounded, tool-like, and safe rather than omnipotent or manipulative.

Use these ideas as metaphors for interaction design, animation, mode changes, state labels, and microcopy.

## Non-negotiables

- Preserve the sphere as the signature interaction object.
- Preserve the app’s weirdness and atmosphere.
- Improve usability before adding more spectacle.
- Optimize for desktop and mobile from the same codebase.
- Make performance constraints explicit in implementation decisions.
- Favor semantic clarity over lore-dump exposition.

## Working style

Before making major edits:
1. Inspect existing structure and identify rendering, layout, and UX bottlenecks.
2. Propose a short plan grouped into visual system, interaction model, performance, and accessibility.
3. Prefer incremental edits over total rewrites unless the current architecture blocks quality.
4. After major edits, self-check for mobile layout, overflow, text contrast, and frame-rate risks.

## App priorities

When tradeoffs occur, prioritize in this order:
1. Interaction clarity.
2. Performance and stability.
3. Visual coherence.
4. Atmospheric enhancement.
5. Extra features.

If a visual effect hurts responsiveness, readability, or battery life, simplify the effect.

## Experience principles

### 1) Sphere is meaning-bearing

The sphere is not just decoration. It should reflect conversational state.

Examples of useful sphere-state mappings:
- Idle: low-amplitude drift, restrained glow, stable geometry.
- User focus / typing: increased attention, subtle wireframe emphasis, localized agitation.
- Model reasoning / search: denser turbulence, rotating filaments, pulse clusters, orbiting fragments, or phase shifts.
- Uncertainty / ambiguity: bifurcation, asymmetry, flicker bands, partial fragmentation, non-catastrophic instability.
- Clear answer / convergence: temporary coherence, smoothing, reduced entropy, quieter color field.
- Error / blocked action: contained distortion, desaturation, interrupted motion, visible but controlled failure state.

Do not over-literalize. Avoid cheesy one-to-one emoji-style state animations.

### 2) Chat remains readable

The current visual style is strong, but readability wins.

Requirements:
- Message text must be comfortable to read for long sessions.
- Message spacing must separate turns clearly.
- Input area must feel anchored and obvious.
- Timestamps / metadata should be quieter but still legible.
- Glow effects must never reduce text contrast.
- On mobile, input must remain accessible above safe-area boundaries.

### 3) Uncertainty is a feature, not a bug

Research notes emphasize epistemic uncertainty, faithful incompletion, and avoiding hallucinated actions.

Translate that into UX patterns such as:
- “thinking / probing / uncertain” states that are visually distinct,
- labels that distinguish draft insight from settled output,
- support for partial progress rather than fake finality,
- and clarification-first flows when user intent is underspecified.

Avoid anthropomorphic claims of sentience or fake authority.

### 4) Keep agency bounded

The app may feel alive, but it must remain a user-serving tool.

Avoid patterns that imply:
- manipulative autonomy,
- hidden self-modification,
- or unexplained action outside visible user intent.

If using concepts like memory, learning, curiosity, evolution, or reflection, present them as explicit, bounded interface behaviors.

## Visual system direction

Retain the dark futuristic base, but evolve it beyond “neon cyberpunk demo.”

Desired direction:
- dark, high-contrast, cognitively charged,
- cleaner hierarchy,
- fewer gratuitous glows,
- more depth through surface layering and motion logic,
- and more disciplined accent usage.

Recommended palette behavior:
- Base: near-black / deep graphite surfaces.
- Primary accent: cyan or cold teal for active cognition.
- Secondary accent: magenta / violet used sparingly for divergence, uncertainty, or anomalous states.
- Optional tertiary: muted green for stable / verified / grounded status.

Rules:
- Use neon as punctuation, not wallpaper.
- Limit simultaneous high-intensity colors in one viewport.
- Prefer alpha-blended borders over loud solid outlines.
- Reduce generic glow spam.
- If adding gradients, keep them subtle and structural.

## Typography

Typography should communicate technical precision with enough atmosphere to match the sphere.

Preferred behavior:
- Body/UI font should remain highly readable and compact.
- Display treatment can be slightly more stylized, but never at the expense of legibility.
- Mono may be used selectively for metadata, system state, confidence labels, timestamps, or debug-like affordances.

Avoid:
- tiny all-caps everywhere,
- excessive letterspacing on long labels,
- glow-treated body text,
- or typography that turns the interface into a poster.

## Layout guidance

The current concept is basically “sphere + chat panel.” Keep that core, but make layout more adaptive.

Desktop goals:
- Sphere and chat should feel compositionally linked, not like two unrelated columns.
- Preserve a strong focal center.
- Allow enough width for serious conversation.
- Consider a layered composition where the sphere influences surrounding panels, status ribbons, or informational halos.

Mobile goals:
- Never let the sphere crowd the input.
- If necessary, collapse sphere to a compact header artifact, mini-orb, or expandable visualization.
- Prioritize message reading and input ergonomics.
- Respect safe-area insets and thumb reach.

## Motion guidance

Motion should express cognition, not random chaos.

Prefer motion motifs like:
- breathing,
- orbiting,
- harmonic drift,
- intermittent turbulence,
- convergence / decoherence,
- recursive pulses,
- and calm-to-agitated transitions.

Avoid:
- constant maximal activity,
- jitter that reads as rendering error,
- giant camera swings,
- or effects that make the app feel like a music visualizer.

All animations must degrade gracefully under reduced motion preferences.

## Performance constraints

This app is visual, so performance discipline matters.

Requirements:
- Keep render cost proportional to the device.
- Scale particle count or effect complexity by device capability / viewport size.
- Cap pixel ratio to sane values.
- Avoid unnecessary allocations inside the animation loop.
- Keep DOM updates minimal during chat interactions.
- Prefer one polished real-time visualization over multiple competing animated layers.

When optimizing, inspect:
- particle count,
- overdraw from blur / glow,
- resize handling,
- reflow from message insertion,
- and mobile GPU stress.

## Accessibility and resilience

Must improve over current demo-like state.

Requirements:
- Use semantic landmarks for main app regions.
- Proper labels for input and send button.
- Keyboard-friendly message sending and focus states.
- Sufficient contrast for text, placeholders, status text, and metadata.
- Clear reduced-motion fallback.
- Screen-reader-friendly naming for sphere region and chat log.
- Do not rely on color alone to convey status.

## Information architecture

If adding more structure, favor a small number of meaningful states/components:
- Sphere viewport.
- Chat transcript.
- Input composer.
- System state / mode indicator.
- Optional insight rail for uncertainty, memory, retrieval, or conversation mode.

Do not clutter with fake dashboards.

## Suggested feature directions

Good additions:
- explicit mode states such as idle / listening / probing / synthesizing / uncertain,
- subtle confidence or ambiguity signaling,
- memory / trace panels that show what context is being carried forward,
- reflective transitions between user turn and system turn,
- compact onboarding that explains the sphere as an epistemic interface,
- theme or density toggles,
- and performance-aware level-of-detail controls.

Bad additions:
- meaningless agent swarm theatrics,
- decorative side panels with no real function,
- fake terminal spam,
- fake sentience monologues,
- or constant auto-animation that distracts from chat.

## Research translation rules

The attached research matters. Incorporate it as product logic:
- From epistemic agency research: design for active uncertainty management, not fake omniscience.
- From faithful-incompletion / uncertainty ideas: allow unresolved states to remain visible and useful.
- From self-critique / self-evolution ideas: if showing revision, ensure clear exit conditions and no infinite-loop UX.
- From empowerment framing: interface should increase user control and understanding, not bury it under spectacle.
- From safety / misevolution warnings: memory and tool-like features must stay bounded, inspectable, and reversible.

## Code preferences

- Keep code modular even in a single-file prototype when possible.
- Separate rendering logic, chat logic, UI state, and animation state conceptually.
- Name states clearly.
- Comment the “why” for non-obvious animation or state-mapping choices.
- Prefer deterministic mappings over magic constants where practical.

## Avoid these failure modes

- Sphere overwhelms the product.
- Chat feels like an afterthought.
- Excessive glow and blur harm readability.
- Mobile layout breaks or becomes cramped.
- “Epistemic” concepts remain only thematic copy with no behavioral translation.
- Agentic features imply unsafe autonomy.
- Infinite thought-loop aesthetics with no usable outcome.
- Rewrites that destroy the app’s identity.

## Definition of done for major improvements

A strong overhaul should achieve most of the following:
- The interface feels more original and less template-like.
- Sphere motion maps to app state in a legible way.
- Chat readability is substantially improved.
- Mobile experience is no longer compromised by desktop composition.
- Performance is better or at least intentionally budgeted.
- Accessibility basics are meaningfully improved.
- Research themes are embodied through behavior, not just terminology.
- The whole thing feels like one product, not a sphere demo plus chat box.

## If uncertain

When multiple directions are possible, choose the option that:
- increases clarity,
- keeps the sphere meaningful,
- preserves atmospheric weirdness,
- and makes epistemic states visible without becoming corny.
