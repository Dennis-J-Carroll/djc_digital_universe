# Image Optimization Guide

**Last Updated:** 2026-01-04
**Applicable to:** Gatsby 5.14.1 with gatsby-plugin-image

---

## Overview

This guide ensures all images added to the website are optimized for performance, accessibility, and SEO.

---

## Using Gatsby Image Component

**Always use GatsbyImage for all images** instead of regular `<img>` tags.

### Basic Usage

```javascript
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

// In your GraphQL query:
query {
  file(relativePath: { eq: "example.png" }) {
    childImageSharp {
      gatsbyImageData(
        width: 800
        placeholder: BLURRED
        formats: [AUTO, WEBP, AVIF]
      )
    }
  }
}

// In your component:
const MyComponent = ({ data }) => {
  const image = getImage(data.file);

  return (
    <GatsbyImage
      image={image}
      alt="Descriptive alt text for accessibility"
      loading="lazy"
    />
  );
};
```

---

## Best Practices

### 1. Image Formats
- **Use WebP with fallbacks** - Automatically handled by `formats: [AUTO, WEBP, AVIF]`
- **AVIF support** - Modern format with better compression
- **PNG for graphics** with transparency
- **JPEG for photos**
- **SVG for icons** and logos (use inline or regular `<img>`)

### 2. Lazy Loading
```javascript
<GatsbyImage
  image={image}
  alt="Description"
  loading="lazy" // Default for all below-fold images
/>

// For above-fold/hero images:
<GatsbyImage
  image={image}
  alt="Description"
  loading="eager" // Load immediately
/>
```

### 3. Responsive Images
Gatsby Image automatically generates multiple sizes. Configure with:

```javascript
gatsbyImageData(
  width: 1200
  breakpoints: [750, 1080, 1366, 1920]
  placeholder: BLURRED  // or DOMINANT_COLOR, TRACED_SVG, NONE
  quality: 90  // 1-100, default is 50
)
```

### 4. Accessibility
**Always provide descriptive alt text:**

```javascript
// ✅ Good
<GatsbyImage
  image={image}
  alt="Three developers collaborating on a laptop, reviewing code on a large monitor"
/>

// ❌ Bad
<GatsbyImage image={image} alt="Image" />
<GatsbyImage image={image} alt="" /> // Only if decorative
```

### 5. Sizing Guidelines

| Use Case | Recommended Width | Format | Quality |
|----------|------------------|--------|---------|
| Hero images | 1920px | WEBP/AVIF | 85-90 |
| Project thumbnails | 800px | WEBP | 80 |
| Blog post images | 1200px | WEBP | 85 |
| Profile photos | 400px | WEBP | 90 |
| Icons | SVG or 64px PNG | SVG preferred | N/A |

---

## Static Images (Non-GraphQL)

For images in `/static/` directory that don't need processing:

```javascript
// Use regular img tag
<img
  src="/og-images/og-default.png"
  alt="Description"
  width="1200"
  height="630"
  loading="lazy"
/>
```

**Note:** Static images bypass Gatsby optimization. Use only for:
- Open Graph images (exact dimensions required)
- Favicons
- Files that must be at specific URLs

---

## Adding Images to the Project

### Step 1: Place Image Files
```
src/
  images/
    hero-background.jpg       # General images
    projects/
      project-screenshot.png  # Organized by category
    team/
      avatar-john.jpg
```

### Step 2: Configure GraphQL Query
```javascript
export const query = graphql`
  query {
    heroImage: file(relativePath: { eq: "hero-background.jpg" }) {
      childImageSharp {
        gatsbyImageData(
          width: 1920
          placeholder: BLURRED
          formats: [AUTO, WEBP, AVIF]
        )
      }
    }
  }
`;
```

### Step 3: Use in Component
```javascript
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const HeroSection = ({ data }) => {
  const image = getImage(data.heroImage);

  return (
    <div className="hero">
      <GatsbyImage
        image={image}
        alt="Modern workspace with collaborative team"
        className="hero-background"
        loading="eager"
      />
    </div>
  );
};
```

---

## Performance Checklist

Before committing images, verify:

- [ ] Image uses GatsbyImage component (not `<img>`)
- [ ] Alt text is descriptive and meaningful
- [ ] Loading attribute set correctly (`lazy` for below-fold, `eager` for above-fold)
- [ ] Image width is appropriate for use case
- [ ] WEBP/AVIF formats enabled
- [ ] Placeholder configured (BLURRED recommended)
- [ ] Original image is reasonably sized (< 5MB)

---

## Common Patterns

### Background Images
```javascript
<div className="hero-section">
  <GatsbyImage
    image={image}
    alt=""
    className="hero-bg"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
    }}
  />
  <div className="hero-content">
    {/* Content overlays background */}
  </div>
</div>
```

### Image Galleries
```javascript
const Gallery = ({ images }) => (
  <div className="gallery-grid">
    {images.map((image, index) => (
      <GatsbyImage
        key={index}
        image={getImage(image)}
        alt={image.alt}
        className="gallery-item"
        loading="lazy"
      />
    ))}
  </div>
);
```

### Project Screenshots
```javascript
<div className="project-showcase">
  <GatsbyImage
    image={getImage(data.screenshot)}
    alt={`Screenshot of ${projectName} showing ${description}`}
    className="project-screenshot"
    loading="lazy"
    objectFit="contain" // or "cover"
  />
</div>
```

---

## Troubleshooting

### Issue: Images not loading
- Verify file path in GraphQL query matches actual file location
- Check that `gatsby-plugin-sharp` and `gatsby-plugin-image` are in gatsby-config.js
- Run `gatsby clean` to clear cache

### Issue: Images look blurry
- Increase `quality` setting in gatsbyImageData (default is 50, try 80-90)
- Ensure source image resolution is high enough
- Check that WEBP conversion isn't causing artifacts

### Issue: Slow build times
- Reduce number of breakpoints
- Lower quality setting for non-critical images
- Use DOMINANT_COLOR placeholder instead of BLURRED

---

## Resources

- [Gatsby Image Plugin Docs](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)
- [Image Optimization Techniques](https://web.dev/fast/)
- [WebP vs AVIF Comparison](https://web.dev/compress-images-avif/)
- [Accessible Images Guide](https://www.w3.org/WAI/tutorials/images/)

---

## Migration from Old `<img>` Tags

If you find images using regular `<img>` tags:

1. **Move image to src/images/**
2. **Add GraphQL query** as shown above
3. **Replace** `<img>` with `<GatsbyImage>`
4. **Add proper alt text**
5. **Set loading attribute**
6. **Test** on multiple screen sizes

Example migration:
```diff
- <img src="../images/project.png" alt="Project" />
+ <GatsbyImage
+   image={getImage(data.projectImage)}
+   alt="Interactive data visualization dashboard showing real-time analytics"
+   loading="lazy"
+ />
```

---

**Remember:** Every image impacts performance and accessibility. Take the extra minute to optimize!