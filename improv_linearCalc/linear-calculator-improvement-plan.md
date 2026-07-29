# Linear Calculator → Linear Algebra Learning Lab
## Incremental Improvement Outline — dennisjcarroll.com/apps/linear-calculator.html

**Audit date:** 2026-07-29
**Current state (audited live):**
- 3D/2D transformation visualizer: basis vectors e₁/e₂/e₃, transformed vectors, eigenvector overlay, grid toggle, reset view
- Matrix entry + Apply / Animate (interpolation slider t=0→1)
- Matrix Operations: Inverse, Transpose, M², Normalize
- Step-by-step decompositions with KaTeX: SVD, QR, LU
- 8 presets: Identity, Scale, Rotate X/Y/Z, Shear XY, Reflection XY, Projection XY, Stretch (Eigen Demo)
- 2×2 eigenvalue display
- Quiz engine: Easy/Medium/Hard, multiple choice, explanations, score bar

## Tightened execution brief

The original six-phase outline is useful as a backlog, but too broad for one coherent release. The first release is now defined by one learning loop:

> **Edit a matrix → see its geometry and invariants → open the linked concept → run a contrasting example → repeat.**

### Release 1 — implemented 2026-07-29

- **Executable Learn library:** 16 curriculum-ordered concepts spanning foundations, invariants, spaces, eigentheory, special matrices, and decompositions.
- **Every concept runs:** all cards include at least one matrix that loads directly into the existing visualizer.
- **Fast retrieval:** title/tag/content search, related-concept links, and compact collapsible cards.
- **Guided learning:** optional curriculum ordering plus visited-card progress stored locally.
- **Live feedback:** determinant, trace, exact numerical rank/nullity, 3×3 singular values, condition number, and correct symmetric/orthogonal/positive-definite/singular badges recompute while editing.
- **Shareable state:** applied matrices are encoded in `?m=` URLs and restored on load.
- **Tight interaction:** invalid matrix drafts are explained inline; Ctrl/Cmd+Enter applies a valid matrix.
- **Mobile-safe density:** panels and toolbars wrap without horizontal page overflow.

### Explicitly deferred

Do not widen the release until usage shows which next loop matters most. The next candidates are:

1. **Solve `Ax=b` column-picture mode** — highest-value new mental model.
2. **Determinant micro-tour** — reuse the current visualization and narrative engine.
3. **Challenge generator** — property hunts that validate against the live invariant engine.
4. **3×3 eigendecomposition** — only after a robust real/complex eigen solver is chosen.

Two-matrix mode, Jordan form, mesh transformations, badges/streak systems, and broad persistence remain backlog—not near-term scope.

**Core design thesis for every phase below:**
> Every piece of theory must be *executable*. No static textbook text — every definition, theorem, and example ships with a **"Load into Calculator →"** button that injects a real matrix (or matrix pair) into the visualizer, so the student immediately *sees* the concept.

The sections below are retained as the long-range backlog reference. Release decisions should follow the tightened brief above.

---

## PHASE 1 — Theory Library ("Learn" Panel) ⭐ highest impact, directly your request

A collapsible right-hand (or tabbed) panel: **searchable glossary + theory cards**.

### 1.1 Data model (drive everything from one JSON)
```json
{
  "id": "determinant",
  "title": "Determinant",
  "tags": ["invariants", "volume", "invertibility"],
  "definition_tex": "\\det(A) = \\sum_{\\sigma} \\mathrm{sgn}(\\sigma)\\prod_i a_{i,\\sigma(i)}",
  "intuition": "Signed volume scaling factor of the unit cube under T. det = 0 → space collapses; det < 0 → orientation flips.",
  "theorems": ["A invertible ⟺ det(A) ≠ 0", "det(AB) = det(A)·det(B)"],
  "examples": [
    {"name": "Volume ×6 scale", "matrix": [[2,0,0],[0,3,0],[0,0,1]], "note": "det = 6: cube volume grows 6×"},
    {"name": "Collapse (det = 0)", "matrix": [[1,0,0],[0,1,0],[0,0,0]], "note": "Projection: 3D → plane, volume destroyed"},
    {"name": "Mirror (det < 0)", "matrix": [[-1,0,0],[0,1,0],[0,0,1]], "note": "Reflection flips handedness"}
  ],
  "related": ["trace", "rank", "eigenvalue", "invertibility"]
}
```
Keep it as an inline `const THEORY = [...]` to stay single-file, or `theory.js` if you split.

### 1.2 Glossary seed list (~30 terms, grouped)
- **Foundations:** vector, basis, span, linear combination, linear independence, linear transformation
- **Matrix arithmetic:** transpose, trace, inverse, identity, permutation matrix, matrix powers
- **Invariants:** determinant, rank, nullity, trace, condition number
- **Spaces:** column space, null space (kernel), row space, image, rank–nullity theorem
- **Eigentheory:** eigenvalue, eigenvector, characteristic polynomial, algebraic vs geometric multiplicity, diagonalizability, similar matrices
- **Decompositions:** LU, QR (Gram–Schmidt), SVD, eigendecomposition, Cholesky, polar
- **Special matrices:** orthogonal, symmetric, positive-definite, projection, reflection, shear, rotation, singular/defective

### 1.3 UI mechanics
- Each card: KaTeX definition → 1–2 sentence intuition → "Try it" example chips → **one click injects matrix + auto-applies + (optionally) auto-animates interpolation**
- Cross-links: click "eigenvalue" inside the determinant card → jumps to that card
- Search box filtering by title + tags
- "Guided Path" toggle: orders cards as a curriculum (Transformations → Arithmetic → Determinants → Spaces → Eigentheory → Decompositions) with a progress checkmark per card visited (localStorage)

---

## PHASE 2 — Live Invariants Dashboard

Auto-recompute on every matrix edit (no button press). Small stat strip above/below "Current Matrix":

| Stat | Why it teaches |
|---|---|
| det(A) | Link to volume overlay: show unit-cube volume scaling live in the 3D view |
| tr(A) | Sum of eigenvalues — pair with eigen display |
| rank(A) / nullity | When rank < 3, *visibly collapse* space in the viz (this is your killer visual) |
| Eigenvalues (3×3, numeric) | Extend existing 2×2 logic; flag complex pairs → "rotation hidden inside" |
| Singular values σ₁≥σ₂≥σ₃ | Ties into existing SVD decomposer |
| Condition number κ = σ₁/σ₃ | Bridges to numerical linear algebra |
| Symmetric? Orthogonal? Positive-definite? | Boolean badges — pattern-recognition training |

Every stat gets a `?` tooltip that deep-links to its Phase-1 glossary card. **This is the feedback loop: student edits a number → stats change → clicks `?` → reads theory → loads the card's example → compares.**

---

## PHASE 3 — Expand the Computation Engine

### 3.1 More decompositions (you already have the step-player architecture)
1. **Eigendecomposition A = PDP⁻¹** — natural next step; you already compute eigen stuff
2. **Cholesky** (for SPD matrices — pairs with the Phase-2 PD badge)
3. **Gram–Schmidt** as its own visual process (orthogonalizing basis vectors in 3D is gorgeous)
4. **Polar decomposition** A = UP (rotation × stretch — very visual)
5. **Jordan form** for defective matrices (with a warning card: "why this matrix can't be diagonalized")

### 3.2 Operations upgrades
- **Two-matrix mode (A, B):** A+B, AB, BA — with the non-commutativity demo as a built-in example ("AB ≠ BA — click to see")
- **Scalar slider kA** — live scaling
- **Power slider Aⁿ (n = 1…20)** — shows convergence/repulsion to dominant eigenvector (stealth lesson on power iteration & PageRank)
- **Solve Ax = b mode:** user enters b vector → show x, draw b, and draw x as a *linear combination of the columns of A* (the column-picture of linear algebra — most textbooks' Chapter 1)
- **RREF with steps** — reuses your decomposition step-player

---

## PHASE 4 — Guided Lessons & Challenge Mode

### 4.1 Scripted tours (micro-lessons)
A tour = JSON list of steps: `{setMatrix, camera, caption_tex, highlight}`. Ship 5:
1. "Anatomy of a transformation" (identity → scale → rotate, one property at a time)
2. "Determinant as volume" (includes det = 0 collapse moment)
3. "Hunting eigenvectors" (stretch demo → why those vectors don't rotate)
4. "SVD in 60 seconds" (Vᵀ rotates, Σ stretches, U rotates — you have the decomposer, this just narrates it)
5. "When matrices break" (singular, defective, non-invertible)

### 4.2 Challenge/puzzle mode (quiz's bigger sibling)
- **Reverse-engineering:** "Here's the transformed cube — find the matrix" (pick from 4 candidates, then verify by loading)
- **Target tasks:** "Construct a matrix that maps [1,0,0]→[0,1,0] and collapses z" — free entry, live validation
- **Property hunts:** "Make det(A) = 0 without any zero entries" — forces real understanding
- Adaptive difficulty, streaks, badges — extend the existing quiz-score system rather than building parallel

### 4.3 Quiz content expansion
New question generators (all auto-generated like current ones):
- Identify transformation from a before/after description
- True/False property statements ("Every orthogonal matrix has det = 1" → false, ±1)
- Compute 2×2 eigenvalues / determinants
- Match matrix → geometric description

---

## PHASE 5 — UX, Sharing & Persistence

- **URL-state encoding:** `?m=1,2,0,3,-1,0,0,0,2` → shareable matrix links (huge for a learning tool — teachers/students exchange states; also lets you deep-link examples from your other site pages)
- **localStorage library:** save custom matrices with names; "My Matrices" dropdown next to presets
- **Copy buttons:** matrix as LaTeX / NumPy / SymPy — feeds your Python workflow
- **Snapshot:** export 3D canvas as PNG (for notes/READMEs)
- **Preset expansion (cheap win):** arbitrary-angle rotation, Householder reflection, 3D shear variants, permutation matrix, rank-1 matrix, companion matrix, non-uniform scale, rotation about arbitrary axis — each with an info `?` linking to glossary
- **Mobile:** collapsible panels, touch-friendly matrix cells (matching your site's existing mobile-responsive pattern)
- Keyboard shortcuts (arrows nudge selected cell, Enter applies, Space animates)

---

## PHASE 6 — Signature "Playground" Features (your style)

- **Vector field mode (2D):** draw arrows x → Ax across the plane — instantly shows eigen-directions as radial lines
- **Matrix flow animation:** A(t) continuously parameterized (e.g., rotation angle sweeping) — cube dances
- **Complex eigenvalue visualizer:** spiral trajectory of iterates Aⁿx
- **Power-iteration race:** animate Aⁿx converging to dominant eigenvector (links to PageRank card)
- **Apply-to-model:** transform a low-poly mesh instead of the cube — shear a teapot, students never forget shear
- **Compare mode:** two matrices side-by-side, same input — great for AB vs BA

---

## Recommended build order (impact ÷ effort)

| Order | Item | Effort | Impact |
|---|---|---|---|
| 1 | Phase 1 Theory Library + click-to-load | M | ★★★★★ (the exact request) |
| 2 | URL-state sharing (Phase 5) | S | ★★★★ (makes every example linkable) |
| 3 | Live invariants dashboard (Phase 2) | M | ★★★★★ (closes the learn↔play loop) |
| 4 | Eigendecomposition + Ax=b mode (Phase 3) | M | ★★★★ |
| 5 | Scripted tour #2 "Determinant as volume" (Phase 4) | S | ★★★★ (template for all tours) |
| 6 | Quiz/challenge expansion (Phase 4) | M | ★★★ |
| 7 | Vector field mode (Phase 6) | M | ★★★ |
| 8 | Remaining decompositions, persistence, polish | M–L | ★★★ |

## Architecture notes
- **Keep the single-file pattern** if the app is one HTML file now — inline `THEORY`, `TOURS`, `QUIZ_GENERATORS` as JS consts; split only if it crosses ~4–5k lines
- You already have KaTeX — all theory rendering reuses it, zero new deps
- The step-player used for LU/QR/SVD is a reusable **"narrative engine"** — tours, RREF steps, and Gram–Schmidt should all be built on it, not as new systems
- One-click example loading = one function: `loadExample(matrix, {animate: true, caption: id})` — build it in Phase 1 and every later phase consumes it
- No backend needed anywhere in this plan — fully static, GitHub-Pages-friendly
