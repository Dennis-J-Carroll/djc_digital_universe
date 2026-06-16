# Research Section Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the already-wired Gatsby research section — single-source hub data, scale figures, heading anchors, schema coverage, reading time, an educational drawer on the Attn Flow animation, and mobile comfort throughout.

**Architecture:** Move per-paper card data into MDX frontmatter so the hub renders from a GraphQL query instead of a hardcoded array. Add a computed reading-time node field and rehype heading anchors. The Attn Flow page (`static/apps/attn_flow_web.html`) gets an additive slide-out educational drawer with no change to the simulation math. A final mobile pass verifies 360px comfort.

**Tech Stack:** Gatsby 5, gatsby-plugin-mdx, GraphQL, Jest + React Testing Library, vanilla JS/HTML/CSS (animation page).

---

## Verification model

This is a Gatsby content/UI project. Two verification styles are used:
- **Jest (TDD)** for the data-driven hub component (`src/pages/research/index.js`), mirroring `src/pages/__tests__/stories.test.js`.
- **`gatsby build` + targeted grep/visual checks** for `gatsby-node.js`, `gatsby-config.js`, MDX, and the static animation HTML, which have no unit-test harness.

Run `npm run build` from `/home/dennisjcarroll/everything-personal-website/everything-personal-website`.

---

## File Structure

- `gatsby-node.js` — schema typeDefs (Task 1), reading-time node field (Task 4).
- `src/research/{frequency-wins,steering-the-prior,frequency-direction}/index.mdx` — frontmatter card fields (Task 2), scale figures + attn-flow link (Tasks 6, 7).
- `src/pages/research/index.js` — hub, GraphQL-driven (Task 3).
- `src/pages/__tests__/research.test.js` — new hub test (Task 3).
- `src/templates/research-paper.js` — reading-time render + img/anchor CSS (Tasks 4, 5, 6).
- `gatsby-config.js` — rehype plugins (Task 5).
- `static/research/` — copied scale PNGs (Task 6).
- `static/apps/attn_flow_web.html` — educational drawer (Task 8).

---

## Task 1: Expand schema customization

**Files:**
- Modify: `gatsby-node.js:49-65`

- [ ] **Step 1: Add the new frontmatter fields to typeDefs**

Replace the `typeDefs` template string in `createSchemaCustomization` with:

```js
  const typeDefs = `
    type MdxFrontmatter {
      title: String
      date: Date @dateformat
      slug: String
      tech_stack: [String]
      complexity_level: String
      interactive_demo: Boolean
      category: String
      published: Boolean
      description: String
      status: String
      featuredImage: File @fileByRelativePath
      author: String
      modified: Date @dateformat
      series: String
      seriesNumber: Int
      seriesPrev: String
      seriesNext: String
      tags: [String]
      cardTitle: String
      cardDescription: String
      tagline: String
      highlights: [String]
      order: Int
    }
  `
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: build completes; no `Cannot query field` or null-type errors for research frontmatter.

- [ ] **Step 3: Commit**

```bash
git add gatsby-node.js
git commit -m "feat(research): cover series + card frontmatter fields in schema"
```

---

## Task 2: Move card data into paper frontmatter

**Files:**
- Modify: `src/research/frequency-wins/index.mdx` (frontmatter only)
- Modify: `src/research/steering-the-prior/index.mdx` (frontmatter only)
- Modify: `src/research/frequency-direction/index.mdx` (frontmatter only)

- [ ] **Step 1: Add card fields to frequency-wins frontmatter**

Insert these keys into the existing frontmatter block (keep all current keys):

```yaml
cardTitle: "Frequency Wins"
tagline: "Diagnosing the lesion"
order: 1
cardDescription: "Ask GPT-2 for the capital of India with worked examples in context, and the correct answer leads through layer eight — then gets overwritten by Mumbai at layer nine. A frequency prior, amplified by an identified retrieval circuit, beats in-context evidence at scale."
highlights:
  - "ICL accuracy peaks at n=1 (79%), degrades monotonically to 55% at n=5"
  - "Circuit: heads L9H8, L8H11, L10H0 do both retrieval and frequency amplification"
  - "Two failure modes: late-override (Australia, Canada) vs. early-dominance (India, Switzerland, South Africa)"
  - "Scale sweep: persistent errors dissolve at GPT-2 XL — capacity, not architecture"
```

- [ ] **Step 2: Add card fields to steering-the-prior frontmatter**

```yaml
cardTitle: "Steering the Prior"
tagline: "Why activation steering mostly fails"
order: 2
cardDescription: "Paper 1 diagnosed the lesion. This paper administered the indicated treatment and reports the trial honestly. The mechanistically-derived steering vector corrects one country in five, at triple the tolerable dose, while a black-box learned vector quietly fixes the cases the interpretable one cannot."
highlights:
  - "Difference-of-means vector at L8 resid_post: stable, real, nearly orthogonal to embeddings"
  - "Corrects Switzerland at α=3.0 — 3× outside the safe operating window"
  - "Hypothesis inverted: late-override countries resist; early-dominance partially yields"
  - "Learned vector (same norm, same hook) corrects Australia and Canada at safe doses"
```

- [ ] **Step 3: Add card fields to frequency-direction frontmatter**

```yaml
cardTitle: "Frequency in All Directions"
tagline: "Does the mechanism generalize?"
order: 3
cardDescription: "A task battery spanning languages, currencies, chemical elements, and authors — and an unplanned discovery that complicates the taxonomy. The question is now whether there is a frequency prior direction in GPT-2's residual stream at all, or only a family of mode-specific directions."
highlights:
  - "Languages and currencies replicate the inverted ICL gradient from Paper 1"
  - "New attractor class discovered: morphological/demonym (Brazil → \"Brazilian\")"
  - "Transfer test: do Paper 2 steering vectors carry over across domains?"
  - "Three attractor classes: semantic-prominence, morphological, exemplar-copy"
```

- [ ] **Step 4: Verify build passes with new frontmatter**

Run: `npm run build`
Expected: build completes; no YAML parse or schema errors.

- [ ] **Step 5: Commit**

```bash
git add src/research/frequency-wins/index.mdx src/research/steering-the-prior/index.mdx src/research/frequency-direction/index.mdx
git commit -m "content(research): move hub card data into paper frontmatter"
```

---

## Task 3: Migrate hub to GraphQL (TDD)

**Files:**
- Modify: `src/pages/research/index.js`
- Test: `src/pages/__tests__/research.test.js` (create)

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/research.test.js`:

```js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchPage from '../research';

jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Research Hub Page', () => {
  const mockLocation = { pathname: '/research' };
  const mockData = {
    allMdx: {
      nodes: [
        {
          id: '1',
          fields: { slug: '/frequency-wins/' },
          frontmatter: {
            cardTitle: 'Frequency Wins',
            title: 'Frequency Wins: long title',
            tagline: 'Diagnosing the lesion',
            cardDescription: 'Card blurb for paper one.',
            description: 'SEO description one.',
            status: 'live',
            seriesNumber: 1,
            tags: ['gpt-2'],
            highlights: ['Highlight one A', 'Highlight one B'],
          },
        },
        {
          id: '2',
          fields: { slug: '/frequency-direction/' },
          frontmatter: {
            cardTitle: 'Frequency in All Directions',
            title: 'Frequency in All Directions',
            tagline: 'Does the mechanism generalize?',
            cardDescription: 'Card blurb for paper three.',
            description: 'SEO description three.',
            status: 'coming-soon',
            seriesNumber: 3,
            tags: ['generalization'],
            highlights: ['Highlight three A'],
          },
        },
      ],
    },
  };

  it('renders without crashing', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('shows the trilogy title', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/The Frequency Prior Trilogy/i)).toBeInTheDocument();
  });

  it('renders a card per paper using cardTitle', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('Frequency Wins')).toBeInTheDocument();
    expect(screen.getByText('Frequency in All Directions')).toBeInTheDocument();
  });

  it('renders highlights from frontmatter', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('Highlight one A')).toBeInTheDocument();
  });

  it('marks the live paper with a Read paper CTA', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/Read paper/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/pages/__tests__/research.test.js`
Expected: FAIL — current `ResearchPage` ignores `data` and reads a hardcoded array (e.g. cards still render but `Highlight one A` is absent, or the component throws on `data` shape). Confirm red.

- [ ] **Step 3: Rewrite the hub to consume GraphQL data**

In `src/pages/research/index.js`:

(a) Delete the hardcoded `trilogy.papers` array. Keep the page-level header constants and the `tool` constant:

```js
const trilogyMeta = {
  title: "The Frequency Prior Trilogy",
  description: "Three papers on how GPT-2 Small encodes, amplifies, and yields to training-frequency priors — and what that reveals about the limits of mechanistic intervention.",
  model: "GPT-2 Small (124M parameters)",
  platform: "TransformerLens — all results from real-model inference",
}
```

(b) Change the component signature and derive papers from `data`:

```js
const ResearchPage = ({ data, location }) => {
  const papers = (data?.allMdx?.nodes ?? [])
    .map((node) => ({
      id: node.id,
      number: node.frontmatter.seriesNumber,
      title: node.frontmatter.cardTitle || node.frontmatter.title,
      slug: `/research${node.fields.slug}`,
      status: node.frontmatter.status || "live",
      tagline: node.frontmatter.tagline,
      description: node.frontmatter.cardDescription || node.frontmatter.description,
      highlights: node.frontmatter.highlights || [],
      tags: node.frontmatter.tags || [],
    }))
    .sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
```

(c) Replace every `trilogy.title` → `trilogyMeta.title`, `trilogy.description` → `trilogyMeta.description`, `trilogy.model` → `trilogyMeta.model`, `trilogy.platform` → `trilogyMeta.platform`.

(d) Replace `trilogy.papers.map((paper) => {` with `papers.map((paper) => {`. Inside the map, keep all existing card JSX. Change the React key from `paper.number` to `paper.id` (number may collide/undefined). The `Link to={paper.slug}` already works because `slug` is now `/research/<dir>/`.

(e) Add the page query at the bottom of the file (above `export default`):

```js
export const query = graphql`
  query {
    allMdx(
      filter: { internal: { contentFilePath: { regex: "/src/research/" } } }
      sort: { frontmatter: { order: ASC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          cardTitle
          title
          tagline
          cardDescription
          description
          status
          seriesNumber
          tags
          highlights
        }
      }
    }
  }
`
```

(f) Add `graphql` to the gatsby import at the top:

```js
import { graphql, Link } from 'gatsby'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/pages/__tests__/research.test.js`
Expected: PASS (all 5 tests green).

- [ ] **Step 5: Verify the real build renders the hub**

Run: `npm run build`
Expected: build completes; `/research` page generated with no GraphQL errors. The regex filter `/src/research/` must not pull stories/projects nodes — confirm only 3 cards by checking build output has no extra research pages.

- [ ] **Step 6: Commit**

```bash
git add src/pages/research/index.js src/pages/__tests__/research.test.js
git commit -m "feat(research): render hub from MDX frontmatter via GraphQL"
```

---

## Task 4: Computed reading-time field

**Files:**
- Modify: `gatsby-node.js` (`onCreateNode`, lines 28-40)
- Modify: `src/templates/research-paper.js` (query + meta row)

- [ ] **Step 1: Add reading-time computation to onCreateNode**

Replace the `onCreateNode` body with:

```js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: "slug",
      node,
      value,
    })

    // Reading time for research papers
    const parent = node.parent ? getNode(node.parent) : null
    if (parent && parent.sourceInstanceName === "research" && node.internal.contentFilePath) {
      const fs = require("fs")
      try {
        const raw = fs.readFileSync(node.internal.contentFilePath, "utf8")
        const body = raw.replace(/^---[\s\S]*?---/, "") // strip frontmatter
        const words = body.split(/\s+/).filter(Boolean).length
        createNodeField({
          name: "timeToRead",
          node,
          value: Math.max(1, Math.round(words / 200)),
        })
      } catch (e) {
        createNodeField({ name: "timeToRead", node, value: 1 })
      }
    }
  }
}
```

- [ ] **Step 2: Add timeToRead to the template query**

In `src/templates/research-paper.js`, extend the `fields` selection in the GraphQL query:

```js
      fields {
        slug
        timeToRead
      }
```

- [ ] **Step 3: Render reading time in the meta row**

In `src/templates/research-paper.js`, the existing `ClockIcon` import does not exist in this file — add a small inline icon and use `mdx.fields.timeToRead`. Add this constant above the component:

```js
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "0.3rem" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
```

Then inside the meta row `<div>` (after the `frontmatter.date` span, before the coming-soon span), add:

```jsx
          {mdx.fields?.timeToRead && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", display: "inline-flex", alignItems: "center" }}>
              <ClockIcon />{mdx.fields.timeToRead} min read
            </span>
          )}
```

Note: the component destructures `const { mdx } = data` already; `mdx.fields` is now available from the query.

- [ ] **Step 4: Verify build + reading time renders**

Run: `npm run build`
Expected: build completes. Then `npm run serve` and load `/research/frequency-wins/` — meta row shows "N min read" with a clock icon. (Or confirm in `public/research/frequency-wins/index.html` the string "min read" is present.)

- [ ] **Step 5: Commit**

```bash
git add gatsby-node.js src/templates/research-paper.js
git commit -m "feat(research): computed reading-time in paper meta row"
```

---

## Task 5: Heading anchor links

**Files:**
- Modify: `package.json` (deps via npm)
- Modify: `gatsby-config.js` (mdxOptions)
- Modify: `src/templates/research-paper.js` (anchor CSS)

- [ ] **Step 1: Install rehype plugins**

Run: `npm i rehype-slug rehype-autolink-headings`
Expected: both added to dependencies; lockfile updated.

- [ ] **Step 2: Add rehypePlugins to gatsby-config mdxOptions**

In `gatsby-config.js`, the `gatsby-plugin-mdx` options currently have `mdxOptions: { remarkPlugins: [require('remark-gfm')] }`. Extend to:

```js
        mdxOptions: {
          remarkPlugins: [require('remark-gfm')],
          rehypePlugins: [
            require('rehype-slug'),
            [require('rehype-autolink-headings'), { behavior: 'wrap' }],
          ],
        },
```

- [ ] **Step 3: Add anchor CSS to the template style block**

In `src/templates/research-paper.js`, inside the `<style>` block, add:

```css
        .research-content h2 a,
        .research-content h3 a {
          color: inherit;
          text-decoration: none;
          border-bottom: none;
          position: relative;
        }
        .research-content h2 a:hover::before,
        .research-content h3 a:hover::before {
          content: "#";
          position: absolute;
          left: -1.1rem;
          color: var(--primary-color);
          opacity: 0.6;
        }
```

Note: `behavior: 'wrap'` wraps the heading text in an `<a>`, so headings remain styled by the existing `h2`/`h3` rules; these rules just neutralize the link underline and add a hover `#`.

- [ ] **Step 4: Verify anchors render**

Run: `npm run build`
Expected: build completes. In `public/research/frequency-wins/index.html`, headings now have `id` attributes and wrapping anchors (grep for `<h2 id=`).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json gatsby-config.js src/templates/research-paper.js
git commit -m "feat(research): heading anchor links via rehype-slug + autolink"
```

---

## Task 6: Scale-sweep figures in Paper 1

**Files:**
- Create: `static/research/scale_headline.png`
- Create: `static/research/scale_trajectory_4sizes.png`
- Modify: `src/research/frequency-wins/index.mdx` (figure blocks)
- Modify: `src/templates/research-paper.js` (img/figure CSS)

- [ ] **Step 1: Copy the two figures into static/research**

Run:

```bash
mkdir -p static/research
cp "/home/dennisjcarroll/Desktop/research/gpt2-interpretability/new_experiments/scale_results/scale_headline.png" static/research/
cp "/home/dennisjcarroll/Desktop/research/gpt2-interpretability/new_experiments/scale_results/scale_trajectory_4sizes.png" static/research/
ls -la static/research/
```

Expected: both PNGs listed in `static/research/`.

- [ ] **Step 2: Locate the scale-sweep prose in Paper 1**

Run: `grep -n -i "scale" src/research/frequency-wins/index.mdx`
Expected: line numbers of the scale-sweep section/paragraph. Insert the figures immediately after the paragraph that introduces the scale sweep.

- [ ] **Step 3: Insert figure blocks into the MDX**

At the located scale-sweep section, add (raw HTML is valid in MDX):

```html
<figure>
  <img src="/research/scale_headline.png" alt="Capital-city accuracy across GPT-2 sizes: persistent errors at Small dissolve by XL." />
  <figcaption>Accuracy on the held-out capital-city set across the four GPT-2 sizes. The errors that persist in Small are resolved by XL — capacity, not architecture.</figcaption>
</figure>

<figure>
  <img src="/research/scale_trajectory_4sizes.png" alt="Per-country logit trajectories across GPT-2 Small, Medium, Large, and XL." />
  <figcaption>Logit-lens trajectories for the override cases across four model sizes. Late-override countries straighten out as scale increases.</figcaption>
</figure>
```

- [ ] **Step 4: Add image + figure CSS to the template**

In `src/templates/research-paper.js`, inside the `<style>` block, add:

```css
        .research-content img {
          max-width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
          border: 1px solid rgba(120, 180, 255, 0.12);
        }
        .research-content figure {
          margin: 2rem 0;
        }
        .research-content figcaption {
          margin-top: 0.6rem;
          font-size: 0.82rem;
          color: var(--text-muted, #888);
          text-align: center;
          line-height: 1.5;
        }
```

- [ ] **Step 5: Verify figures build and resolve**

Run: `npm run build`
Expected: build completes. Confirm `public/research/scale_headline.png` and `public/research/scale_trajectory_4sizes.png` exist (static files copy through), and `public/research/frequency-wins/index.html` contains both `<img src="/research/scale_`.

- [ ] **Step 6: Commit**

```bash
git add static/research/scale_headline.png static/research/scale_trajectory_4sizes.png src/research/frequency-wins/index.mdx src/templates/research-paper.js
git commit -m "content(research): show scale-sweep figures in Paper 1"
```

---

## Task 7: Paper 1 → Attn Flow link + MDX bare-`<` audit

**Files:**
- Modify: `src/research/frequency-wins/index.mdx`

- [ ] **Step 1: Audit all three papers for bare `<` followed by a letter**

Run:

```bash
grep -nE '<[a-zA-Z]' src/research/frequency-wins/index.mdx src/research/steering-the-prior/index.mdx src/research/frequency-direction/index.mdx
```

Expected: review each hit. Legitimate HTML tags (`<figure>`, `<img`, `<figcaption>`) are fine. Any bare prose like `<layer` or `<token` (no space, not a real tag) must be fixed by escaping (`&lt;`) or rewording. `p < 0.0001` (space after `<`) is safe and will not appear in this grep.

- [ ] **Step 2: Fix any real offenders found**

For each non-tag match, edit the line to escape the `<` as `&lt;` or reword. If the grep returned only real HTML tags, no change is needed — note that in the commit.

- [ ] **Step 3: Add the Attn Flow link near Paper 1's mechanism/conclusion**

Run: `grep -n -i "attn\|attention flow\|conclusion\|mechanism" src/research/frequency-wins/index.mdx` to find a natural spot (mechanism discussion or conclusion). Add an inline paragraph:

```markdown
You can watch this circuit move probability mass between *India*, *France*, and *Paris* in real time with the companion tool, [Attn Flow](/apps/attn_flow_web.html) — the same six heads, animated.
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build completes; no MDX JSX parse errors. Confirm `public/research/frequency-wins/index.html` contains `href="/apps/attn_flow_web.html"`.

- [ ] **Step 5: Commit**

```bash
git add src/research/frequency-wins/index.mdx
git commit -m "content(research): link Paper 1 to Attn Flow + MDX bare-angle audit"
```

---

## Task 8: Attn Flow educational drawer

**Files:**
- Modify: `static/apps/attn_flow_web.html`

The simulation math (`step`, `attnAngle`, `render`, `loop`, particle logic) MUST NOT change. All edits are additive: HTML for the drawer, CSS for it, and JS to toggle it and highlight the active head.

- [ ] **Step 1: Add drawer + toggle HTML**

In `static/apps/attn_flow_web.html`, immediately after `<canvas id="canvas"></canvas>` (line ~40), insert:

```html
  <button id="info-toggle" aria-label="What am I seeing?">? What am I seeing</button>
  <aside id="info-drawer" aria-hidden="true">
    <button id="info-close" aria-label="Close">✕</button>
    <h1>Attn Flow</h1>
    <p class="lede">Particles are <strong>probability mass</strong> drifting toward the tokens each attention head is reading. Brighter tokens pull harder; the bar under a token is how much attention it receives.</p>

    <h2>The vocabulary</h2>
    <dl>
      <dt>Token</dt><dd>A chunk of text GPT-2 reads — here, words like <em>India</em>, <em>France</em>, <em>Paris</em>.</dd>
      <dt>Logit</dt><dd>The raw score the model assigns each possible next token before normalizing.</dd>
      <dt>Probability</dt><dd>Logits squashed to 0–1 so they sum to one. The flowing particles stand in for where this mass is being pulled.</dd>
    </dl>

    <h2>The six heads</h2>
    <ol id="head-list">
      <li data-head="0"><strong>L7·H0</strong> — Pre-crossover. Broad context pull, no decision yet.</li>
      <li data-head="1"><strong>L8·H11</strong> — Retrieval A. The final token reaches back through <em>India</em> to <em>France</em>.</li>
      <li data-head="2"><strong>L9·H8</strong> — The override head. Attends to <em>India</em> AND <em>Paris</em> at once — frequency contamination. This is the mechanism.</li>
      <li data-head="3"><strong>L9·H0</strong> — Induction. Structural copy: <em>capital→capital</em>, <em>of→of</em>.</li>
      <li data-head="4"><strong>L10·H0</strong> — Global context. Almost everything drifts to the first token.</li>
      <li data-head="5"><strong>L11·H2</strong> — Previous-token. Clean diagonal streaming, each token to the one before it.</li>
    </ol>

    <h2>Controls</h2>
    <p class="controls">Cycle heads: <kbd>◀</kbd> <kbd>▶</kbd> or h/H · Pause: <kbd>space</kbd> · Theme: <kbd>t</kbd> · Glyph: <kbd>g</kbd> · Speed: <kbd>+</kbd>/<kbd>-</kbd> · Reset: <kbd>r</kbd>. On touch, use the buttons at the bottom.</p>

    <a class="paper-link" href="/research/frequency-wins/">Read the paper · Frequency Wins →</a>
  </aside>
```

- [ ] **Step 2: Add drawer + mobile-control CSS**

In the `<style>` block (after the existing `#nav-btns button:hover` rule), add:

```css
    /* Educational drawer */
    #info-toggle {
      position: fixed; top: 10px; left: 10px; z-index: 20;
      background: #0d0d12; border: 1px solid #00c9b1; color: #00c9b1;
      font: 12px monospace; padding: 7px 12px; cursor: pointer;
      letter-spacing: 0.5px; border-radius: 4px;
    }
    #info-toggle:hover { background: #00c9b1; color: #07070a; }

    #info-drawer {
      position: fixed; top: 0; left: 0; bottom: 0; z-index: 30;
      width: 340px; max-width: 88vw;
      background: rgba(8, 9, 14, 0.97);
      border-right: 1px solid #00c9b1;
      padding: 18px 20px 28px; overflow-y: auto;
      transform: translateX(-105%); transition: transform 0.28s ease;
      font: 13px/1.6 monospace; color: #cdd2da;
    }
    #info-drawer.open { transform: translateX(0); }
    #info-drawer h1 { color: #00c9b1; font-size: 18px; margin: 6px 0 10px; }
    #info-drawer h2 { color: #00c9b1; font-size: 13px; margin: 20px 0 8px; letter-spacing: 1px; text-transform: uppercase; opacity: 0.85; }
    #info-drawer .lede { color: #e6e9ef; margin-bottom: 4px; }
    #info-drawer dt { color: #00c9b1; margin-top: 8px; }
    #info-drawer dd { margin: 2px 0 0; padding-left: 0; color: #aab1bd; }
    #info-drawer ol { margin: 0; padding-left: 18px; }
    #info-drawer #head-list li { margin-bottom: 8px; color: #aab1bd; }
    #info-drawer #head-list li.active { color: #e6e9ef; }
    #info-drawer #head-list li.active strong { color: #00c9b1; }
    #info-drawer kbd { background: #1a1d26; border: 1px solid #333; border-radius: 3px; padding: 0 4px; color: #cdd2da; }
    #info-drawer .controls { color: #8a909b; }
    #info-drawer .paper-link {
      display: inline-block; margin-top: 18px; color: #00c9b1;
      border: 1px solid #00c9b1; padding: 7px 12px; border-radius: 4px; text-decoration: none;
    }
    #info-drawer .paper-link:hover { background: #00c9b1; color: #07070a; }
    #info-close {
      position: absolute; top: 12px; right: 12px;
      background: none; border: none; color: #666; font-size: 16px; cursor: pointer;
    }
    #info-close:hover { color: #00c9b1; }

    @media (max-width: 640px) {
      #info-drawer { width: 100%; max-width: 100%; }
      #drop-hint { display: none; }
    }
```

- [ ] **Step 3: Add toggle JS + active-head highlight**

Near the bottom of the `<script>`, after the button-controls block (after the `btn-pause` click listener, before the file-drop section), add:

```js
// ── Educational drawer ───────────────────────────────────────
const drawer  = document.getElementById("info-drawer");
const headLis = Array.from(document.querySelectorAll("#head-list li"));

function highlightHead() {
  headLis.forEach((li) =>
    li.classList.toggle("active", Number(li.dataset.head) === curHead)
  );
}

function toggleDrawer(open) {
  const show = open ?? !drawer.classList.contains("open");
  drawer.classList.toggle("open", show);
  drawer.setAttribute("aria-hidden", show ? "false" : "true");
  if (show) highlightHead();
}

document.getElementById("info-toggle").addEventListener("click", () => toggleDrawer());
document.getElementById("info-close").addEventListener("click", () => toggleDrawer(false));
headLis.forEach((li) =>
  li.addEventListener("click", () => switchHead(Number(li.dataset.head) - curHead))
);
```

- [ ] **Step 4: Hook head changes to the highlight**

The existing `switchHead(delta)` function must refresh the highlight. Append `highlightHead();` as the last line inside `switchHead`:

```js
function switchHead(delta) {
  curHead = (curHead + delta + data.heads.length) % data.heads.length;
  dens.fill(0);
  resetParticles();
  highlightHead();
}
```

Add `?` key handling to the existing `keydown` switch (new case alongside the others):

```js
    case "?": toggleDrawer(); break;
```

- [ ] **Step 5: Add touch buttons for theme + reset**

In the `#nav-btns` div HTML, add two buttons so touch users get theme + reset:

```html
  <div id="nav-btns">
    <button id="btn-prev">◀ prev head</button>
    <button id="btn-pause">pause</button>
    <button id="btn-next">next head ▶</button>
    <button id="btn-theme">theme</button>
    <button id="btn-reset">reset</button>
  </div>
```

And wire them next to the other button listeners:

```js
document.getElementById("btn-theme").addEventListener("click", () => {
  themeId = (themeId + 1) % THEME_NAMES.length;
});
document.getElementById("btn-reset").addEventListener("click", () => resetParticles());
```

- [ ] **Step 6: Verify the page loads and the sim still runs**

Run: `npm run develop` (or open the file). Load `http://localhost:8000/apps/attn_flow_web.html`.
Expected: canvas animates as before; "? What am I seeing" button top-left opens the drawer; cycling heads highlights the matching list item; paper link points to `/research/frequency-wins/`. Resize to ≤640px — drawer goes full-width, nav buttons (incl. theme/reset) are tappable.

- [ ] **Step 7: Commit**

```bash
git add static/apps/attn_flow_web.html
git commit -m "feat(attn-flow): educational drawer + touch controls + mobile layout"
```

---

## Task 9: Mobile-comfort pass + final verification

**Files:**
- Modify: `src/pages/research/index.js` (meta line stacking)

- [ ] **Step 1: Stack the hub Model · Platform meta line on narrow widths**

In `src/pages/research/index.js`, the header renders:

```jsx
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)' }}>
            Model: {trilogyMeta.model} · Platform: {trilogyMeta.platform}
          </p>
```

Replace with a flex column that stacks cleanly and never breaks mid-value:

```jsx
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span>Model: {trilogyMeta.model}</span>
            <span>Platform: {trilogyMeta.platform}</span>
          </div>
```

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 3: Visual mobile check at 360px**

Run: `npm run serve`. In a browser at 360px width, load `/research`, `/research/frequency-wins/`, and `/apps/attn_flow_web.html`.
Expected:
- Hub: cards full-width, no horizontal scroll, meta line stacked, headline wraps cleanly.
- Paper 1: figures fit within the column, tables scroll horizontally without breaking layout, series nav wraps, reading time + anchors present.
- Animation: drawer full-width, all nav buttons tappable, no keyboard required.

- [ ] **Step 4: Run the full test suite**

Run: `npx jest`
Expected: all tests pass, including the new `research.test.js`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/research/index.js
git commit -m "fix(research): stack hub meta line for mobile comfort"
```

---

## Self-Review notes

- **Spec coverage:** Hub DRY (Tasks 2-3), scale images (Task 6), anchors (Task 5), schema (Task 1), reading time (Task 4), MDX audit (Task 7), attn-flow link (Task 7), animation drawer (Task 8), mobile pass (Tasks 8-9). All nine spec items mapped.
- **cardDescription addition:** The spec said the hub queries `description`; during planning the current hub was found to use editorial card blurbs distinct from the SEO `description`. Added `cardDescription` frontmatter (schema in Task 1, content in Task 2, query in Task 3) to preserve exact current card copy — a refinement within the approved "full move" decision.
- **Type consistency:** `fields.slug` (`/frequency-wins/`) + `/research${slug}` matches gatsby-node's `pagePath`. `timeToRead` named identically in node field (Task 4 Step 1), query (Step 2), render (Step 3). `highlightHead`/`toggleDrawer`/`switchHead` consistent across Task 8.
- **No placeholders:** every code step contains complete code.
