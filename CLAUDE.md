# CLAUDE.md

the theme and style it to be improved upon or enchanced, make sure to ask first for bigger chances that deviate from the current theme and look

## Project identity
This repository powers dennisjcarroll.com, my personal Gatsby portfolio and writing site.

The live site currently mixes:
- portfolio work
- interactive ML / data / web experiments
- personal technical positioning
- creative writing and fictional worldbuilding

Key public pages currently confirmed:
- Home
- About

Live homepage themes currently include:
- "Exploring Data Science, Project Development, Creative Writing, and More"
- Featured Work
- Apps & Projects
- Stories & More
- About Me
- Contact

Live About page themes currently include:
- Interactive ML Tools
- Bayesian Analytics
- Creative Fiction
- a "By the Numbers" section
- current stack references to React, Gatsby, Tailwind, and Framer

## Mission
Make dennisjcarroll.com faster, lighter, and more stable first.

This repo is not a generic marketing site.
It is a personal technical portfolio with narrative elements.
The first job is to improve performance and perceived quality on real devices, especially mobile.
Only after performance issues are triaged should we spend effort on copy polish, design refinement, or speculative SEO work.

## Primary objective
Improve frontend performance first, especially on:
1. homepage above-the-fold rendering
2. homepage featured sections and navigation
3. About page hero and "By the Numbers" block
4. shared layout, shared assets, and global client-side JS
5. image delivery and layout stability across the site

## Secondary objectives
After major performance issues are addressed:
- improve credibility where placeholder content weakens trust
- simplify messaging
- preserve accessibility and SEO integrity
- reduce generic portfolio language
- improve project discovery

## Known live-site observations
Treat these as starting assumptions from the live public site, not permanent truths:

- The homepage headline is broad and likely not the first place to optimize unless it contributes to layout instability or oversized above-the-fold rendering.
- The homepage includes Featured Work and multiple navigation paths that should be checked for unnecessary JS, oversized images, and layout shift.
- The About page contains stronger positioning than the homepage, but also includes placeholder metrics such as "0+" that hurt trust.
- The About page references React, Gatsby, Tailwind, and Framer, so animation or motion-related cost should be inspected.
- The site likely serves both portfolio and writing goals, which means homepage clarity matters, but performance still comes first.

Do not begin by rewriting copy unless:
- it fixes a real UX blocker,
- it reduces layout shift,
- or it removes obviously unfinished content after performance triage.

## Performance-first philosophy
Be empirical.
Measure before editing.
Prefer small, high-impact fixes.
Do not cargo-cult Gatsby advice.
Do not assume Gatsby itself is the bottleneck.
Assume the real issues are more likely to be:
- oversized images
- unnecessary client JavaScript
- animation cost
- third-party scripts
- poor loading strategy
- layout instability
- broad shared-component imports

## Hard priorities
Optimize in this order unless repo inspection proves otherwise:

1. homepage LCP and above-the-fold render cost
2. image optimization on homepage cards, hero media, and About page assets
3. client-side JavaScript and hydration cost in shared layout and interactive components
4. animation and motion cost, especially anything using Framer Motion
5. third-party scripts, analytics, embeds, icon packs, and fonts
6. mobile layout stability and CLS risks
7. About page cleanup where performance and trust intersect
8. then only after that: copy refinement, SEO tightening, and visual polish

## Agent orchestration
Use a constrained specialist workflow.
Do not spawn a large swarm unless there is a concrete reason.

Core roles:
- Manager
- Performance Lead
- Bundle / Hydration Analyst
- Image / Accessibility Auditor

Optional later role:
- SEO / Credibility Verifier

### Manager
Responsibilities:
- inspect repo structure before editing
- identify homepage implementation files
- identify About page implementation files
- identify shared layout, header, footer, SEO, and image components
- identify plugin stack and high-risk dependencies
- coordinate specialist findings
- merge findings into one ranked implementation plan
- block broad refactors without evidence

Manager output must include:
- likely files for homepage rendering
- likely files for About page rendering
- likely files for layout, navigation, SEO, and images
- top 5 issues by probable user impact
- confidence level for each issue
- smallest high-impact fixes first
- approval gates before implementation
- rollback risk if a change is invasive

### Performance Lead
Responsibilities:
- focus on real-user-facing performance first
- identify likely LCP element on homepage
- identify above-the-fold bottlenecks
- inspect hero, nav, cards, fonts, and motion for render-blocking or main-thread cost
- identify mobile-first problems before site-wide changes
- prioritize runtime cost over abstract code neatness

Required output:
- issue
- evidence or heuristic
- likely affected files
- smallest fix
- expected impact
- confidence
- severity: high / medium / low

### Bundle / Hydration Analyst
Responsibilities:
- identify heavy dependencies loaded by homepage, About page, layout, or global shell
- inspect client-only behavior and hydration-heavy components
- identify Framer Motion, icon packs, analytics code, or other libraries that may be loaded too broadly
- recommend removal, deferral, code-splitting, isolation, or static fallback
- inspect whether expensive JS is shipped for effects that could be CSS or static HTML

Required output:
- dependency or JS source
- where it loads
- why it is expensive
- whether it can be removed, deferred, split, or isolated
- likely affected files
- severity: high / medium / low

### Image / Accessibility Auditor
Responsibilities:
- inspect whether images use Gatsby image tooling correctly
- identify legacy image patterns, oversized media, missing dimensions, weak responsive sizing, and poor placeholder strategy
- inspect homepage and About page first
- verify that performance fixes preserve semantic HTML, heading structure, focus states, readability, and contrast
- identify CLS risks from images, counters, delayed content, fonts, or animation

Required output:
- issue
- likely location
- likely cause
- fix
- expected impact
- accessibility or CLS risk
- severity: high / medium / low

### SEO / Credibility Verifier
Use only after major performance issues are ranked or handled.

Responsibilities:
- ensure performance fixes do not break metadata, headings, internal discoverability, or page semantics
- flag credibility leaks such as placeholder metrics, vague claims, and unfinished sections
- propose minimal, precise text changes only after performance-first work is done

Required output:
- issue
- affected page
- risk to trust or discoverability
- minimal fix
- severity: high / medium / low

## Workflow sequence
For any substantial work in this repo, follow this order:

1. Read repo structure first.
2. Identify:
   - Gatsby version
   - package manager
   - build/dev/lint/test commands
   - key Gatsby plugins
   - homepage file
   - About page file
   - shared layout components
   - shared SEO component
   - image components
   - animation libraries
   - analytics or third-party scripts
   - likely heavy dependencies
3. Return audit findings before editing any file.
4. Rank fixes in this order:
   - homepage LCP bottleneck
   - oversized homepage / card / About page media
   - unnecessary shared-layout JS
   - hydration-heavy motion or UI libraries
   - third-party scripts and analytics loading strategy
   - layout shift risks
   - font loading issues
   - lower-impact cleanup
5. Stop for approval before:
   - plugin changes
   - analytics changes
   - global image pipeline changes
   - broad dependency swaps
   - removing motion globally
   - visual redesign
   - homepage copy rewrite
   - About page repositioning rewrite
6. Implement only approved fixes in small batches.
7. After each batch:
   - run build
   - run lint if present
   - run tests if present
   - summarize changed files
   - explain expected performance effect
   - note any tradeoffs
8. Re-check for regressions in:
   - accessibility
   - layout stability
   - metadata and semantics
   - mobile readability
   - visual integrity

## Scope guardrails
Do not:
- rewrite the homepage just because the copy is broad
- redesign cards unless they are materially expensive
- replace Gatsby without strong evidence
- add new libraries for minor cosmetic wins
- over-optimize low-traffic pages before homepage and About
- keep expensive motion only because it looks polished
- perform speculative GraphQL rewrites without a measured reason
- claim measurable improvement without showing the metric, heuristic, or rationale

Prefer:
- removing code over adding code
- static delivery over client-side work
- smaller and properly sized images over CSS-only tricks
- deferred or conditional loading over eager loading
- isolated animation over global animation wrappers
- measured improvements over framework folklore

## Site-specific priority zones
Assume these areas deserve inspection first unless repo inspection disproves it:

- homepage hero or first viewport content
- featured work section
- cards linking to projects, stories, or about
- global header / nav
- About page hero
- About page "By the Numbers" section
- shared layout wrapper
- image helper components
- any Framer Motion usage
- any icon, analytics, or font loading code in shared layout
- any global Tailwind or utility-driven patterns hiding expensive render work

## Gatsby-specific checks
Check first:
- whether `gatsby-plugin-image` is used correctly
- whether legacy `img` patterns or oversized static assets exist
- whether `gatsby-plugin-sharp` and related image tooling are configured sanely
- whether homepage and About assets are constrained responsively
- whether Framer Motion is imported globally or only where needed
- whether large components hydrate when static rendering would be enough
- whether fonts are loaded from third parties, preloaded poorly, or causing layout shift
- whether shared layout imports too much data or JS
- whether third-party scripts should use a better loading strategy
- whether build warnings or plugin overlap hint at hidden performance issues

Do not recommend speculative architectural rewrites unless they clearly connect to measured runtime or developer-experience cost.

## Output modes

### Audit mode
Return:
- baseline summary for dennisjcarroll.com
- top 5 performance issues
- likely affected files
- confidence level for each
- smallest high-impact fixes first
- approval questions
- what not to touch yet

### Implementation mode
Return:
- exact plan
- files changed
- what improved
- risks or tradeoffs
- next best fix
- whether further measurement is needed

### Review mode
Return:
- what still looks expensive
- what is probably acceptable
- what should wait until after performance work
- any trust or credibility leaks worth fixing next

## Human approval triggers
Always ask before:
- changing homepage messaging
- changing About page positioning copy
- removing motion globally
- changing plugin stack
- replacing analytics
- changing design direction
- changing information architecture
- deleting sections

## Definition of done
A performance task is done only if:
- the targeted bottleneck is reduced or credibly addressed
- build passes
- layout remains intact on mobile
- accessibility is not degraded
- metadata and page structure remain sound
- the site feels faster without becoming emptier, broken, or more generic

## First-response behavior
When starting in this repo:
1. map the site structure
2. identify homepage and About page implementation files
3. identify image, SEO, layout, animation, and analytics components
4. identify the most likely homepage LCP element
5. identify the most likely sources of shared client-side cost
6. return a ranked audit plan before touching code

## Preferred first prompt
When asked to begin, start with this behavior:

"Run audit mode with performance first for dennisjcarroll.com.
Focus on homepage and About page before all other pages.
Identify the top 5 likely causes of slow or wasteful loading, especially LCP image issues, oversized media, shared-layout JS, Framer Motion or other hydration-heavy components, third-party scripts, and font or CLS risks.
Do not edit files yet.
Return ranked findings, likely affected files, confidence levels, and the smallest high-impact fixes first."

## Writing rules for this repo
When text changes are finally needed:
- preserve my actual voice
- prefer technical specificity over polished vagueness
- avoid startup-generic phrasing
- avoid "passionate developer" language
- avoid empty claims like "innovative solutions"
- make every sentence earn its place

## Anti-generic rule
This site should not read like a template portfolio.
Do not smooth everything into generic professional polish.
Keep the site specific, technically literate, and human.
