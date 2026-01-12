# Dennis J. Carroll - Personal Website

A modern, performant personal website showcasing development projects, interactive applications, creative writing, and professional experience. Built with Gatsby 5, React 18, and Tailwind CSS.

## Features

- **Modern Tech Stack**: Gatsby 5.14.1, React 18.2.0, Tailwind CSS 4.1.4
- **Multiple Themes**: Dark, Light, and Tokyo Afternoon themes with localStorage persistence
- **Interactive Applications**: 14 standalone web apps for AI/ML, data science, and mathematics
- **MDX Content**: Component-based content system for blog posts and stories
- **Optimized Performance**: Lazy loading, code splitting, Web Vitals monitoring
- **SEO Enhanced**: JSON-LD structured data, OpenGraph tags, sitemap
- **Accessible**: WCAG 2.1 AA compliant with skip links and proper ARIA labels
- **Error Boundaries**: Graceful error handling with fallback UI
- **Well Tested**: 80%+ test coverage with Jest and React Testing Library

## Tech Stack

### Core Technologies
- **Gatsby 5.14.1**: Static site generation with React
- **React 18.2.0**: UI library with latest features
- **Tailwind CSS 4.1.4**: Utility-first CSS framework
- **MDX 3.1.0**: Markdown with JSX for component-based content

### Animation & Interactions
- **Framer Motion 11.15.0**: Declarative animations
- **GSAP 3.12.5**: High-performance animations
- **tsparticles**: Particle effects for space background

### Development & Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Performance & SEO
- **gatsby-plugin-image**: Optimized image loading
- **gatsby-plugin-sitemap**: XML sitemap generation
- **React Helmet**: Dynamic meta tag management
- **web-vitals**: Core Web Vitals monitoring

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── shared/          # Shared components (SEO, Navigation, ErrorBoundary)
│   │   └── data-science/    # Domain-specific components
│   ├── pages/               # Page components (auto-routed)
│   ├── templates/           # Page templates for MDX content
│   ├── constants/           # Centralized constants (NAV_LINKS, THEMES, etc.)
│   ├── hooks/               # Custom React hooks (useTheme)
│   ├── styles/              # Global CSS and Tailwind config
│   ├── scripts/             # Utility scripts (animations, particles)
│   ├── blog-posts/          # MDX blog post content
│   └── stories/             # MDX creative writing content
├── static/
│   ├── apps/                # 14 standalone HTML applications
│   ├── og-images/           # OpenGraph images for social sharing
│   └── robots.txt           # Search engine directives
├── gatsby-config.js         # Gatsby configuration
├── gatsby-node.js           # Build-time Node APIs
├── gatsby-browser.js        # Browser APIs (Web Vitals)
├── jest.config.js           # Jest configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd everything-personal-website

# Install dependencies
npm install

# Start development server
npm run develop
```

The site will be available at `http://localhost:8000`.

GraphQL playground: `http://localhost:8000/___graphql`

### Available Commands

```bash
# Development
npm run develop      # Start development server with hot reload
npm run start        # Alias for develop

# Production
npm run build        # Build for production
npm run serve        # Serve production build locally

# Maintenance
npm run clean        # Clear Gatsby cache and public directory

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Development Workflow

### Adding a New Page

1. Create a new file in `src/pages/` (e.g., `new-page.js`)
2. Export a React component and a `Head` export for SEO:

```javascript
import React from 'react';
import Layout from '../components/layout/layout';
import Seo from '../components/shared/seo';

const NewPage = ({ location }) => {
  return (
    <Layout location={location}>
      <h1>New Page</h1>
    </Layout>
  );
};

export const Head = ({ location }) => (
  <Seo
    title="New Page"
    pathname={location.pathname}
    pageType="website"
    description="Description of the new page"
  />
);

export default NewPage;
```

3. Add the page to navigation in `src/constants/index.js`:

```javascript
export const NAV_LINKS = [
  // ... existing links
  { id: "new-page", label: "New Page", path: "/new-page" }
];
```

### Adding MDX Content

1. Create a new directory in `src/blog-posts/` or `src/stories/`
2. Add an `index.mdx` file with frontmatter:

```mdx
---
title: "Post Title"
date: "2026-01-05"
description: "Post description"
tags: ["tag1", "tag2"]
---

Your MDX content here with React components!
```

3. The page will be automatically generated at build time

### Working with Themes

The site uses a custom theme system with three themes:
- **Dark**: Default dark theme
- **Light**: Light theme with inverted colors
- **Tokyo Afternoon**: Warm, cherry blossom-inspired theme

Theme persistence is handled by `localStorage`. To use the theme system:

```javascript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { currentTheme, changeTheme, themes } = useTheme();

  return (
    <button onClick={() => changeTheme('light')}>
      Switch to Light Theme
    </button>
  );
};
```

### Styling Approach

The project uses a hybrid styling system:

1. **Tailwind CSS**: Utility classes for layout and spacing
2. **CSS Variables**: Theme-specific colors in `src/styles/futuristic-ui.css`
3. **Inline Styles**: Dynamic styles based on component state

Example:

```javascript
<div className="p-4 rounded-lg" style={{
  background: 'var(--background-primary)',
  color: 'var(--text-primary)'
}}>
  Content
</div>
```

## Testing

The project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests are located in `__tests__` directories next to the components they test.

Example:

```javascript
// src/components/shared/__tests__/my-component.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from '../my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Overall**: 80%+
- **Critical Components**: 90%+
- **Pages**: 75%+

Current coverage: **17.22%** (actively improving)

## Performance Optimization

### Implemented Optimizations

1. **Lazy Loading**: SpaceBackground and heavy components load on demand
2. **Code Splitting**: Automatic chunk splitting for vendors
3. **Image Optimization**: gatsby-plugin-image for responsive images
4. **Web Vitals Monitoring**: Real-time performance tracking in production
5. **Error Boundaries**: Prevent full-page crashes

### Performance Targets

- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **TTFB (Time to First Byte)**: < 600ms

## SEO

### Implemented SEO Features

1. **Structured Data**: JSON-LD schemas for all page types
2. **OpenGraph Tags**: Social media sharing optimization
3. **Sitemap**: Auto-generated XML sitemap with priorities
4. **Robots.txt**: Proper crawler directives
5. **Canonical URLs**: Prevent duplicate content issues
6. **Meta Tags**: Comprehensive meta tag management

### SEO Checklist

- Title tags (50-60 characters)
- Meta descriptions (150-160 characters)
- OpenGraph images (1200x630px)
- Proper heading hierarchy (h1-h6)
- Alt text for images
- Internal linking

## Deployment

### Build for Production

```bash
npm run build
```

The production build will be in the `public/` directory.

### Deployment Platforms

The site can be deployed to:

- **Netlify**: Automatic deployments from Git
- **Vercel**: Optimized for Gatsby
- **GitHub Pages**: Static hosting
- **Gatsby Cloud**: Official Gatsby hosting

### Environment Variables

No environment variables required for basic deployment. Optional:

- `GATSBY_SITE_URL`: Override site URL for production

## Contributing

This is a personal website, but suggestions and bug reports are welcome!

### Development Guidelines

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Keep bundle size minimal
5. Maintain accessibility standards

## License

MIT License - See LICENSE file for details

## Contact

**Dennis J. Carroll**
- GitHub: [@Dennis-J-Carroll](https://github.com/Dennis-J-Carroll)
- LinkedIn: [dennisjcarroll](https://www.linkedin.com/in/dennisjcarroll/)
- Twitter: [@denniscarrollj](https://x.com/denniscarrollj)

---

Built with Gatsby, React, and Tailwind CSS
