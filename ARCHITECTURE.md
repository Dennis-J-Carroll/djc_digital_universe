# Architecture Documentation

This document provides a comprehensive overview of the technical architecture, design decisions, and implementation details of the Dennis J. Carroll personal website.

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Styling System](#styling-system)
4. [Theme System](#theme-system)
5. [Content Management](#content-management)
6. [Performance Optimizations](#performance-optimizations)
7. [SEO Implementation](#seo-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Build Process](#build-process)
10. [Design Decisions](#design-decisions)

## Overview

### Technology Stack Rationale

**Gatsby 5.14.1**: Chosen for:
- Static site generation for optimal performance
- Built-in image optimization
- GraphQL data layer
- Large plugin ecosystem
- Excellent documentation

**React 18.2.0**: Provides:
- Modern concurrent features
- Component-based architecture
- Large ecosystem
- Excellent developer experience

**Tailwind CSS 4.1.4**: Selected for:
- Utility-first approach reduces CSS bloat
- Rapid prototyping
- Consistent design system
- Purge CSS for minimal bundle size

### Architecture Principles

1. **Component Composition**: Small, focused components that compose together
2. **DRY (Don't Repeat Yourself)**: Constants and utilities centralized
3. **Separation of Concerns**: Clear boundaries between layout, content, and logic
4. **Performance First**: Lazy loading, code splitting, optimized images
5. **Accessibility**: WCAG 2.1 AA compliance from the start
6. **Progressive Enhancement**: Works without JavaScript (SSG)

## Component Architecture

### Directory Structure

```
src/components/
├── layout/           # Top-level layout components
│   ├── header.js     # Site header with navigation and theme switcher
│   ├── footer.js     # Site footer with links and newsletter
│   └── layout.js     # Main layout wrapper
├── shared/           # Reusable shared components
│   ├── seo.js        # SEO meta tags and structured data
│   ├── navigation-component.js  # Navigation with active indicator
│   ├── error-boundary.js        # Error boundary for graceful failures
│   ├── space-background.js      # Particle background effect
│   ├── feature-card.js          # Feature showcase cards
│   ├── hero-text.js             # Animated hero text
│   └── business-card.js         # Contact card component
└── data-science/     # Domain-specific components
    └── jupyter-viewer.js        # Jupyter notebook renderer
```

### Component Design Patterns

#### 1. Container/Presentational Pattern

**Layout Component** (`layout.js`):
- Container component
- Manages global state (theme, navigation)
- Handles side effects (animations, scroll listeners)
- Wraps presentational components

**Feature Card** (`feature-card.js`):
- Presentational component
- Pure function of props
- No side effects
- Reusable across pages

#### 2. Custom Hooks Pattern

**useTheme Hook** (`src/hooks/useTheme.js`):
```javascript
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Theme initialization from localStorage
  useEffect(() => { /* ... */ }, []);

  // Theme change handler
  const changeTheme = (themeId) => { /* ... */ };

  return { currentTheme, changeTheme, themes: THEMES };
};
```

Benefits:
- Encapsulates theme logic
- Reusable across components
- Testable in isolation
- Separates concerns

#### 3. Compound Component Pattern

**Navigation Component**:
- Main `<Navigation>` component
- Internal state for active indicator
- Position indicator sub-component
- Uses GSAP for smooth transitions

### Component Communication

1. **Props**: Parent to child data flow
2. **Context** (planned): Global state (theme, user preferences)
3. **Constants**: Shared configuration via `src/constants/`
4. **Events**: User interactions and animations

## Styling System

### Hybrid Approach

The project uses a strategic combination of three styling methodologies:

#### 1. Tailwind CSS (Utility-First)

**Use Cases**:
- Layout (flexbox, grid)
- Spacing (margin, padding)
- Typography (font size, weight)
- Responsive design

**Example**:
```javascript
<div className="flex items-center gap-4 p-6 rounded-lg">
  {/* Content */}
</div>
```

**Benefits**:
- Rapid development
- Consistent spacing scale
- No naming conflicts
- Automatic purging

#### 2. CSS Variables (Theme System)

**Use Cases**:
- Theme colors
- Dynamic values
- Reusable tokens

**Example**:
```css
:root {
  --primary-color: #00bcd4;
  --secondary-color: #7c4dff;
  --text-primary: #ffffff;
}

.light-theme {
  --text-primary: #0a0e14;
}
```

**Benefits**:
- Runtime theme switching
- No style recalculation
- CSS-in-CSS
- Better performance

#### 3. Inline Styles (Dynamic State)

**Use Cases**:
- Component-specific state
- Animation styles
- Conditional rendering

**Example**:
```javascript
<button style={{
  background: isActive ? 'var(--primary-color)' : 'transparent',
  transform: isHovered ? 'scale(1.1)' : 'scale(1)'
}}>
  Click
</button>
```

**Benefits**:
- Direct state coupling
- No class name generation
- Fine-grained control

### CSS Organization

```
src/styles/
├── global.css            # Base styles, resets
├── futuristic-ui.css     # Theme-specific styles
├── tailwind.css          # Tailwind imports
└── components/
    ├── feature-card.css  # Component-specific styles
    └── shared.css        # Shared component styles
```

## Theme System

### Implementation Architecture

#### 1. Theme Constants

**Location**: `src/constants/index.js`

```javascript
export const THEMES = [
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    ariaLabel: 'Switch to Dark theme'
  },
  {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    ariaLabel: 'Switch to Light theme'
  },
  {
    id: 'tokyo-afternoon',
    name: 'Tokyo',
    icon: '🌸',
    ariaLabel: 'Switch to Tokyo Afternoon theme'
  }
];
```

#### 2. Theme Hook

**Location**: `src/hooks/useTheme.js`

Responsibilities:
- Initialize theme from localStorage
- Apply theme class to document.body
- Persist theme changes
- Provide theme state to components

#### 3. Theme CSS

**Location**: `src/styles/futuristic-ui.css`

Structure:
```css
/* Base theme (dark) */
:root {
  --primary-color: #00bcd4;
  --background-primary: #0a0e14;
}

/* Light theme overrides */
.light-theme {
  --primary-color: #1976d2;
  --background-primary: #f0f0f5;
}

/* Tokyo Afternoon theme overrides */
.tokyo-afternoon-theme {
  --primary-color: #ff6b9d;
  --background-primary: #fef6e4;
}
```

#### 4. Theme Switching Flow

1. User clicks theme button in header
2. `handleThemeChange(themeId)` called
3. Remove all theme classes from body
4. Add new theme class to body
5. Save to localStorage
6. Update component state
7. Trigger scroll handler (for header background)

### Theme Considerations

**Performance**:
- CSS variables are faster than re-rendering
- No CSSOM recalculation
- Single class toggle

**Accessibility**:
- Sufficient color contrast (4.5:1)
- ARIA labels on theme buttons
- Visual feedback on selection

**User Experience**:
- Smooth transitions
- Preference persistence
- System preference detection (planned)

## Content Management

### MDX-Based System

#### Content Structure

```
src/
├── blog-posts/
│   └── hello-world/
│       └── index.mdx
└── stories/
    └── first-story/
        └── index.mdx
```

#### Frontmatter Schema

```yaml
---
title: "Post Title"        # Required: Page title
date: "2026-01-05"         # Required: Publication date
description: "Summary"     # Required: Meta description
tags: ["react", "gatsby"]  # Optional: Topic tags
featured: true             # Optional: Featured flag
---
```

#### Build-Time Processing

**Location**: `gatsby-node.js`

```javascript
exports.createPages = async ({ graphql, actions }) => {
  // 1. Query all MDX nodes
  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          fields { slug }
          internal { contentFilePath }
        }
      }
    }
  `);

  // 2. Create pages for each node
  result.data.allMdx.nodes.forEach(node => {
    actions.createPage({
      path: node.fields.slug,
      component: `${projectDetailTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: { id: node.id }
    });
  });
};
```

#### Template System

**Location**: `src/templates/project-detail.js`

Features:
- Dynamic layout based on content type
- Automatic table of contents (planned)
- Social sharing buttons
- Related content suggestions
- Reading time estimation

## Performance Optimizations

### 1. Code Splitting

**Implementation**: `gatsby-node.js`

```javascript
exports.onCreateWebpackConfig = ({ actions, stage }) => {
  if (stage === 'build-javascript') {
    actions.setWebpackConfig({
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            framerMotion: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: 'framer-motion',
              priority: 20
            },
            particles: {
              test: /[\\/]node_modules[\\/](tsparticles|react-tsparticles)[\\/]/,
              name: 'particles',
              priority: 18
            }
          }
        }
      }
    });
  }
};
```

**Result**:
- Vendor chunks loaded in parallel
- Reduced initial bundle size
- Better caching

### 2. Lazy Loading

**SpaceBackground Component**:

```javascript
// layout.js
const SpaceBackground = lazy(() => import('../shared/space-background'));

// In render:
<Suspense fallback={<div className="space-background-placeholder" />}>
  <SpaceBackground />
</Suspense>
```

**Benefits**:
- -200KB initial bundle
- Faster FCP
- Progressive enhancement

### 3. Image Optimization

**Using gatsby-plugin-image**:

```javascript
import { StaticImage } from 'gatsby-plugin-image';

<StaticImage
  src="../images/hero.png"
  alt="Hero"
  placeholder="blurred"
  layout="fullWidth"
/>
```

**Automatic Optimizations**:
- WebP generation
- Responsive sizes
- Lazy loading
- Blur-up placeholder

### 4. Web Vitals Monitoring

**Implementation**: `gatsby-browser.js`

```javascript
export const onClientEntry = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      const logVital = (metric) => {
        console.log(`[Web Vitals] ${metric.name}:`,
          Math.round(metric.value), metric.rating);
        // TODO: Send to analytics
      };

      onCLS(logVital);
      onFID(logVital);
      onFCP(logVital);
      onLCP(logVital);
      onTTFB(logVital);
    });
  }
};
```

## SEO Implementation

### JSON-LD Structured Data

**Implementation**: `src/components/shared/seo.js`

```javascript
const generateStructuredData = (pageType, pageData, site) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteMetadata.title,
    url: site.siteMetadata.siteUrl,
    author: {
      '@type': 'Person',
      name: 'Dennis J. Carroll',
      // ...
    }
  };

  switch(pageType) {
    case 'blog':
    case 'story':
      return {
        ...baseSchema,
        '@type': 'BlogPosting',
        headline: pageData?.title,
        datePublished: pageData?.date,
        // ...
      };

    case 'project':
      return {
        ...baseSchema,
        '@type': 'SoftwareApplication',
        name: pageData?.title,
        // ...
      };

    default:
      return baseSchema;
  }
};
```

### OpenGraph Implementation

**Meta Tags**:
```javascript
{
  property: `og:image`,
  content: `${siteUrl}/og-images/og-default.png`
},
{
  property: `og:image:width`,
  content: `1200`
},
{
  property: `og:image:height`,
  content: `630`
}
```

**Image Specifications**:
- Size: 1200x630px
- Format: PNG or JPG
- Max size: 8MB
- Aspect ratio: 1.91:1

### Sitemap Configuration

**Implementation**: `gatsby-config.js`

```javascript
{
  resolve: `gatsby-plugin-sitemap`,
  options: {
    output: `/`,
    query: `...GraphQL query...`,
    serialize: ({ path, allMdx }) => ({
      url: path,
      lastmod: mdxNode?.frontmatter?.date || new Date().toISOString(),
      changefreq: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1.0 : 0.7
    })
  }
}
```

## Testing Strategy

### Test Coverage Goals

| Component Type | Target Coverage | Current |
|---------------|----------------|---------|
| Critical Components | 90%+ | 50-86% |
| Pages | 75%+ | 75-94% |
| Utilities/Hooks | 80%+ | 0% |
| Overall | 80%+ | 17.22% |

### Testing Patterns

#### 1. Component Testing

```javascript
// Example: seo.test.js
describe('SEO Component', () => {
  const mockSiteData = {
    site: {
      siteMetadata: {
        title: 'Test Site',
        // ...
      }
    }
  };

  beforeEach(() => {
    useStaticQuery.mockReturnValue(mockSiteData);
  });

  it('renders without crashing with basic props', () => {
    const { container } = render(<Seo title="Test Page" />);
    expect(container).toBeTruthy();
  });
});
```

#### 2. Mock Strategy

**Gatsby Mocks**:
```javascript
jest.mock('gatsby', () => ({
  ...jest.requireActual('gatsby'),
  useStaticQuery: jest.fn(),
  graphql: jest.fn()
}));
```

**Framer Motion Mocks**:
```javascript
jest.mock("framer-motion", () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props, ref) =>
        React.createElement('div', { ref, ...props })
      )
    }
  };
});
```

## Build Process

### Build Stages

1. **Compile Gatsby Files** (~1s)
   - TypeScript/JSX compilation
   - Plugin loading

2. **GraphQL Schema Generation** (~0.2s)
   - Schema stitching
   - Type definitions

3. **Source and Transform Nodes** (~0.1s)
   - MDX file reading
   - Frontmatter parsing

4. **Create Pages** (~0.04s)
   - Dynamic page creation
   - Route generation

5. **Extract Queries** (~1.5s)
   - GraphQL query extraction
   - Query optimization

6. **Build JavaScript/CSS** (~4s)
   - Webpack bundling
   - CSS processing
   - Code splitting

7. **Build HTML** (~1.5s)
   - SSR for each page
   - Critical CSS extraction

8. **Generate Sitemap** (~0.02s)
   - XML sitemap creation

**Total Build Time**: ~13-22 seconds

### Build Optimization Opportunities

1. **Incremental Builds**: Only rebuild changed pages
2. **Parallel Processing**: Build pages concurrently
3. **Cache Invalidation**: Smart cache busting
4. **Image Optimization**: Pre-process images

## Design Decisions

### Why Not Next.js?

**Decision**: Chose Gatsby over Next.js

**Reasoning**:
- Static site generation perfect for personal portfolio
- No need for server-side rendering
- Better plugin ecosystem for static sites
- GraphQL data layer simplifies content queries
- Excellent image optimization out of the box

### Why Hybrid Styling?

**Decision**: Tailwind + CSS Variables + Inline Styles

**Reasoning**:
- Tailwind: Rapid development, consistent spacing
- CSS Variables: Runtime theme switching without JS
- Inline Styles: Direct state coupling for animations
- Each method serves a specific purpose
- Combined approach reduces overall complexity

### Why MDX?

**Decision**: MDX instead of plain Markdown

**Reasoning**:
- Embed React components in content
- Interactive examples and demos
- Consistent styling with site theme
- Type-safe component usage
- Better developer experience

### Why GSAP + Framer Motion?

**Decision**: Use both animation libraries

**Reasoning**:
- GSAP: Complex timeline animations (header, footer)
- Framer Motion: Declarative React animations (page transitions)
- Each excels in different scenarios
- Combined bundle size acceptable (~150KB)
- Better UX than single library

### Why Not TypeScript?

**Decision**: Use JavaScript instead of TypeScript

**Reasoning**:
- Personal project, rapid iteration valued
- JSDoc provides type hints where needed
- Lower cognitive overhead
- Faster builds
- Can migrate incrementally if needed

## Future Architecture Considerations

### Planned Improvements

1. **Context API**: Global theme/state management
2. **Service Worker**: Offline support with Workbox
3. **Preact**: Replace React in production (-40KB)
4. **System Theme**: Respect OS dark/light preference
5. **Content Collections**: Structured content types
6. **Search**: Client-side search with Lunr.js
7. **Analytics**: Privacy-friendly analytics (Plausible)
8. **Comments**: Staticman or utterances for blog comments

### Scalability Considerations

**Current Limits**:
- 100 pages: No issues
- 500 pages: Incremental builds needed
- 1000+ pages: Consider Next.js ISR or Gatsby Cloud

**Content Growth Strategy**:
- Implement pagination for blog/stories
- Add content filtering/search
- Consider headless CMS for non-technical contributors

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0
