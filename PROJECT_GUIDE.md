# Everything Personal Website - Project Guide

> Last Updated: 2026-01-03
> Comprehensive guide for development, maintenance, and content management

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Adding Content](#adding-content)
5. [Component Documentation](#component-documentation)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Recent Cleanup](#recent-cleanup)

---

## Project Overview

**Tech Stack:**
- **Framework:** Gatsby (React-based static site generator)
- **Styling:** Tailwind CSS + Custom CSS (futuristic UI theme)
- **Animations:** Framer Motion + GSAP
- **Testing:** Jest + React Testing Library
- **Deployment:** Netlify
- **Content:** MDX (Markdown + JSX)

**Key Features:**
- Dark/Light theme switching
- Space-themed particle background
- Interactive HTML applications (14 apps in `/static/apps/`)
- Evolutionary fungal network simulator
- Responsive design with mobile support
- SEO optimization with structured data

---

## Project Structure

```
everything-personal-website/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Footer, Layout)
│   │   │   ├── header.js    # Theme switching, animations, scroll effects
│   │   │   ├── footer.js    # Site footer
│   │   │   └── layout.js    # Main layout wrapper
│   │   ├── shared/          # Reusable components
│   │   │   ├── seo.js       # SEO component with structured data
│   │   │   ├── app-layout.js
│   │   │   ├── business-card.js
│   │   │   ├── feature-card.js
│   │   │   ├── hero-text.js
│   │   │   ├── navigation-component.js
│   │   │   ├── space-background.js
│   │   │   ├── fungal-network-simulator.js  # Evolutionary AI simulation
│   │   │   └── __tests__/   # Component tests
│   │   └── data-science/
│   │       └── jupyter-viewer.js
│   ├── pages/               # Gatsby pages (auto-routing)
│   │   ├── index.js         # Home page
│   │   ├── about.js
│   │   ├── contact.js
│   │   ├── development-projects.js
│   │   ├── stories.js
│   │   ├── 404.js
│   │   └── __tests__/       # Page tests
│   ├── templates/           # Template components
│   │   ├── project-detail.js
│   │   └── using-dsg.js
│   ├── styles/              # Global styles
│   │   ├── global.css       # Base styles and resets
│   │   ├── futuristic-ui.css  # Theme styling (651 lines)
│   │   └── tailwind.css     # Tailwind imports
│   ├── scripts/             # Utility scripts
│   │   ├── animations.js    # Animation initialization
│   │   └── particles.js     # Particle effects
│   ├── blog-posts/          # MDX blog content
│   ├── stories/             # MDX story content
│   ├── images/              # Static images
│   └── knowledgebase.md     # Project knowledge base
├── static/
│   └── apps/                # Interactive HTML applications (14 total)
│       ├── Interactive_RL_Chaos-Error_OPt.html
│       ├── neural_theory_lab.html
│       ├── ComTia.html
│       └── ... (11 more apps)
├── __mocks__/               # Jest mocks
├── gatsby-config.js         # Gatsby configuration
├── gatsby-node.js           # Gatsby Node API
├── package.json             # Dependencies
├── netlify.toml             # Netlify configuration
└── README.md                # Project readme

```

### Import Paths

**Current Standard Imports:**
- Layout: `import Layout from "../components/layout/layout"`
- SEO: `import Seo from "../components/shared/seo"`
- Shared Components: `import ComponentName from "../components/shared/component-name"`

**Do NOT import from (removed):**
- `../components/seo` (old location)
- `../components/header` (old location)
- `../components/layout` (old location)

---

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start development server
gatsby develop
# Or: npm run develop

# Runs on http://localhost:8000
# GraphiQL: http://localhost:8000/__graphql
```

### Build & Deploy

```bash
# Production build
gatsby build
# Or: npm run build

# Test production build locally
gatsby serve

# Clean cache (if issues)
gatsby clean
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Adding Content

### Adding a New Page

1. **Create page file** in `/src/pages/`:
   ```jsx
   // src/pages/my-new-page.js
   import React from "react"
   import Layout from "../components/layout/layout"
   import Seo from "../components/shared/seo"

   const MyNewPage = ({ location }) => (
     <Layout location={location}>
       <div className="max-w-6xl mx-auto px-8 py-16">
         <h1 className="text-4xl font-bold gradient-text">My New Page</h1>
         {/* Your content here */}
       </div>
     </Layout>
   )

   export const Head = () => <Seo title="My New Page" />

   export default MyNewPage
   ```

2. **Page auto-routes** at `/my-new-page/`

3. **Add navigation** (if needed) in header or footer

### Adding a Blog Post or Story

1. **Create MDX file** in `/src/blog-posts/` or `/src/stories/`:
   ```mdx
   ---
   title: "My Blog Post"
   date: "2026-01-03"
   description: "A brief description"
   tags: ["tag1", "tag2"]
   ---

   # My Blog Post

   Your content here with full MDX support!
   ```

2. **Query with GraphQL** in your template

### Adding a Project Card

Edit `/src/pages/development-projects.js` and add to `htmlProjects` array:

```javascript
{
  title: "Your Project Title",
  description: "Project description",
  filename: "your-app.html",
  icon: <WebIcon />,  // or <AiIcon />, <DataIcon />, <ToolIcon />
  tech: ["Tech1", "Tech2", "Tech3"],
  category: "web"  // or "ai", "data"
}
```

Place your HTML file in `/static/apps/your-app.html`

### Adding a Shared Component

1. **Create component** in `/src/components/shared/`:
   ```jsx
   // src/components/shared/my-component.js
   import React from "react"

   const MyComponent = ({ prop1, prop2 }) => {
     return (
       <div className="my-component">
         {/* Component content */}
       </div>
     )
   }

   export default MyComponent
   ```

2. **Create CSS file** (optional):
   ```css
   /* src/components/shared/my-component.css */
   .my-component {
     /* styles */
   }
   ```

3. **Import CSS** in component if created

4. **Create test** in `__tests__/my-component.test.js`

---

## Component Documentation

### Layout Components

#### Header (`/src/components/layout/header.js`)
- Theme switching (dark/light)
- GSAP scroll animations
- Responsive navigation
- Active route highlighting

#### Footer (`/src/components/layout/footer.js`)
- Social links
- Copyright info
- Additional navigation

#### Layout (`/src/components/layout/layout.js`)
- Wraps all pages
- Imports global styles
- Manages theme state
- Renders Header, children, Footer

### Shared Components

#### SEO (`/src/components/shared/seo.js`)
- Helmet-based meta tags
- Canonical URLs
- Open Graph tags
- Structured data (JSON-LD)
- Twitter cards

#### Space Background (`/src/components/shared/space-background.js`)
- Particle effects using particles.js
- Animated star field
- Performance optimized

#### Fungal Network Simulator (`/src/components/shared/fungal-network-simulator.js`)
- Evolutionary algorithm simulation
- Genetic algorithms for fungal growth
- Canvas-based visualization
- Real-time fitness tracking

#### Feature Card (`/src/components/shared/feature-card.js`)
- Reusable project card
- Hover effects
- Icon support
- Tech tag display

---

## Testing

### Test Structure

```
src/
├── components/shared/__tests__/
│   └── navigation-component.test.js
└── pages/__tests__/
    ├── index.test.js
    ├── 404.test.js
    └── development-projects.test.js
```

### Writing Tests

```javascript
import React from "react"
import { render, screen } from "@testing-library/react"
import MyComponent from "../my-component"

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />)
    expect(screen.getByText("Expected Text")).toBeInTheDocument()
  })
})
```

### Mocks

Located in `/__mocks__/`:
- `gatsby.js` - Mocks Gatsby components (Link, StaticQuery, useStaticQuery)
- `file-mock.js` - Mocks file imports

---

## Deployment

### Netlify (Recommended)

**Automatic Deployment:**
1. Push to main branch on GitHub
2. Netlify auto-builds and deploys

**Manual Deploy:**
```bash
gatsby build
# Upload /public directory to Netlify
```

**Environment Variables:**
Set in Netlify dashboard if needed

**Configuration:**
See `netlify.toml` for build settings

---

## Troubleshooting

### Common Issues

#### 1. **Padding/Styling Not Applying**

**Issue:** Global CSS reset (`* { padding: 0; }`) overrides Tailwind classes

**Solution:** Use inline styles or increase specificity
```jsx
<div style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
```

#### 2. **Import Errors**

**Issue:** Importing from old component locations

**Solution:** Update imports to new locations:
- ❌ `import Seo from "../components/seo"`
- ✅ `import Seo from "../components/shared/seo"`

#### 3. **Gatsby Build Fails**

**Solution:**
```bash
# Clear cache
gatsby clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
gatsby build
```

#### 4. **Lock Files in Git**

**Solution:** Already handled in `.gitignore`
```
.~lock.*
*.swp
*.swo
```

#### 5. **GraphQL Errors**

**Solution:**
1. Check GraphiQL at `http://localhost:8000/___graphql`
2. Verify query syntax
3. Ensure data source exists

---

## Recent Cleanup (2026-01-03)

### Files Removed (24 total)

**Duplicate Components:**
- ❌ `/src/components/seo.js` (use `/src/components/shared/seo.js`)
- ❌ `/src/components/header.js` (use `/src/components/layout/header.js`)
- ❌ `/src/components/layout.js` (use `/src/components/layout/layout.js`)

**Unused CSS:**
- ❌ `/src/components/layout.css` (256 lines, not imported)
- ❌ `/src/components/index.module.css` (54 lines, not imported)

**Legacy Pages:**
- ❌ `/src/pages/blog.js`
- ❌ `/src/pages/data-science.js`
- ❌ `/src/pages/python-dev.js`
- ❌ `/src/pages/page-2.js`
- ❌ `/src/pages/using-ssr.js`
- ❌ `/src/pages/using-typescript.tsx`
- ❌ `/src/pages/Development-projects.js` (replaced by `development-projects.js`)

**Old Configs:**
- ❌ `vercel.json`
- ❌ `windsurf_deployment.yaml`

**Temporary Files:**
- ❌ `Look_01.png`, `Look_/Look_01.png`
- ❌ `directive.txt`, `Revamp Implementation Directive.txt`
- ❌ `cp_01/` directory
- ❌ `git_01/` directory
- ❌ `.~lock.knowledgebase.md#` (LibreOffice lock file)

### Files Added (21 total)

**Documentation:**
- ✅ `BUILD_ISSUES.md`
- ✅ `CLEANUP_SUMMARY.md`
- ✅ `CONTENT_ADDITION_GUIDE.md`
- ✅ `PAGE_DELETION_GUIDE.md`
- ✅ `PROJECT_GUIDE.md` (this file)

**Testing:**
- ✅ `__mocks__/` directory
- ✅ `jest.config.js`
- ✅ `setup-test-env.js`
- ✅ Component tests

**Components:**
- ✅ `fungal-network-simulator.js`
- ✅ `app-layout.js`
- ✅ Component CSS files

**Static Apps:**
- ✅ 14 HTML applications in `/static/apps/`

### Updated Files (17 total)

**Import Fixes:**
- ✅ `404.js` - Updated SEO import
- ✅ `using-dsg.js` - Updated SEO import
- ✅ `development-projects.js` - Fixed padding issue

**Component Updates:**
- ✅ Layout components (header, footer, layout)
- ✅ Shared components (feature-card, hero-text, navigation, space-background)

**Config Updates:**
- ✅ `gatsby-config.js`, `gatsby-node.js`, `package.json`
- ✅ `.gitignore` (added lock file patterns)

---

## CSS Architecture

### Style Loading Order

1. `global.css` - Base resets and global styles
2. `futuristic-ui.css` - Theme variables and component styles
3. `tailwind.css` - Tailwind utilities
4. Component-specific CSS (feature-card.css, shared.css)

### CSS Files

| File | Size | Purpose | Usage |
|------|------|---------|-------|
| `futuristic-ui.css` | 651 lines | Main theme | Imported in layout.js |
| `global.css` | 267 lines | Base/reset | Imported in layout.js |
| `feature-card.css` | 129 lines | Card styling | Imported in feature-card.js |
| `shared.css` | 146 lines | Shared components | Imported in hero-text.js |

### Theme System

**CSS Variables (futuristic-ui.css):**
```css
--primary-color: #591675
--secondary-color: #5ea3ac
--accent-color: #7b1fa2
--heading-color: #3a828b
```

**Dark/Light Mode:**
Managed via `data-theme` attribute on `<html>` element

---

## Quick Reference

### Useful Commands

```bash
# Development
gatsby develop              # Start dev server
gatsby clean                # Clear cache
npm test                    # Run tests

# Building
gatsby build                # Production build
gatsby serve                # Serve production build

# Git
git status                  # Check status
git add -A                  # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to remote
```

### File Locations

- **Pages:** `/src/pages/*.js`
- **Components:** `/src/components/shared/*.js`
- **Layout:** `/src/components/layout/*.js`
- **Styles:** `/src/styles/*.css`
- **Static Apps:** `/static/apps/*.html`
- **Content:** `/src/blog-posts/*.mdx`, `/src/stories/*.mdx`

### Important URLs (Dev)

- Site: `http://localhost:8000`
- GraphiQL: `http://localhost:8000/___graphql`
- 404 Debug: `http://localhost:8000/404`

---

## Next Steps

### Potential Improvements

1. **Documentation Consolidation:**
   - Consider archiving old guide files
   - Keep this `PROJECT_GUIDE.md` as single source of truth

2. **Testing Coverage:**
   - Add tests for remaining components
   - Increase coverage for complex components

3. **Performance:**
   - Lazy load heavy components
   - Optimize images
   - Consider code splitting

4. **Content:**
   - Add more blog posts
   - Expand story collection
   - Create more interactive apps

5. **SEO:**
   - Add sitemap generation
   - Implement robots.txt
   - Add structured data for projects

---

## Support & Resources

**Gatsby Documentation:** https://www.gatsbyjs.com/docs/
**React Documentation:** https://react.dev/
**Tailwind CSS:** https://tailwindcss.com/docs
**Framer Motion:** https://www.framer.com/motion/

**Project Issues:** Check `BUILD_ISSUES.md` for known issues

---

**Last Cleanup:** 2026-01-03
**Commit:** c6af810 - Major cleanup and organization of project structure
**Files Changed:** 78 files (22025 insertions, 9240 deletions)

