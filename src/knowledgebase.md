# Project: Everything Personal Website

## UI Improvements - Featured Work Section (pages/index.js)

### Changes Made:
- Increased vertical and horizontal padding for the Featured Work section (`py-32`, `md:px-20`, `lg:px-32`) to keep headings and content away from the edges.
- Added `break-words` utility to headings and card containers to prevent text overflow and ensure proper word wrapping.
- Wrapped each `FeatureCard` in a `div` with `max-w-xl w-full mx-auto break-words p-8 md:p-10 rounded-2xl bg-gray-900/80 border border-teal-500/10 shadow-lg` to:
  - Anchor card dimensions for a uniform look in any grid.
  - Provide consistent padding and rounded corners.
  - Add a subtle border and shadow for visual separation.

### Reasoning:
- Improves readability and visual balance.
- Prevents text from running off the card or section edges.
- Ensures a consistent, modern card layout across devices and grid configurations.

## Bug Fixes - Feature Card Syntax Error (components/shared/feature-card.js)

### Issue:
- Syntax error due to an unterminated block comment (`/* ...`) inside a JS style object for the card background gradient div.
- This caused the build to fail with an 'expected }' error.

### Fix:
- Replaced the block comment with a JS line comment (`// ...`) inside the style object.
- Properly closed the style object with `}}`.

### Reasoning:
- JS objects do not support block comments; only line comments are valid.
- Ensures the file compiles and runs without syntax errors.

## UI Update - FeatureCard Visual Redesign (components/shared/feature-card.js)

### Changes Made:
- Removed visible border and grid outline from feature cards for a seamless, blended look.
- Increased card max width (`max-w-4xl`) and set `w-full` so cards expand to fill more horizontal space in the grid.
- Softened background gradients and border radii for a modern, less boxy appearance.
- Adjusted hover effect to be more subtle and less outlined.

### Reasoning:
- Creates a more immersive, modern, and visually appealing feature section.
- Allows cards to better utilize available space, especially on larger screens.
- Reduces visual clutter by removing grid outlines and hard borders.

## Bug Fix - Remove Extra Card Wrapper (pages/index.js)

### Changes Made:
- Removed the extra div with border, background, and padding classes that wrapped each FeatureCard in the featured work section grid.
- Now, only the FeatureCard component controls its own appearance and sizing.

### Reasoning:
- Prevents any grid outline, border, or background from being applied by the wrapper div.
- Ensures the visual style and expansion of the card is determined by FeatureCard, matching the intended seamless, modern look.

## Bug Fix - Prevent Card Content Clipping on Hover (components/shared/feature-card.js)

### Changes Made:
- Set the card's default scale to 0.97 and animate to scale 1 on hover, instead of scaling up from 1.0.
- Removed scale from whileHover and now control it via animate for smoothness and to avoid overflow issues.

### Reasoning:
- Prevents card content (especially text) from being cut off or clipped during the hover animation.
- Ensures a smooth, visually appealing card hover effect without layout issues.

## UI Tweak - Add Left Padding to Feature Card (components/shared/feature-card.js)

### Changes Made:
- Added 'pl-16' to the card's className to increase space between the left border and the card content.

### Reasoning:
- Improves visual balance and readability by preventing text and icons from appearing flush against the card's left edge.

# Knowledge Base

## Project: Left Margin Spacing Improvement
**Date:** Today
**Task:** Add consistent left spacing throughout the site to improve symmetry

### Issue Identified:
- Content appears too close to the left margin throughout the site
- Need to add more consistent left spacing for better symmetry

### Changes Planned:
1. Update global layout container with better left/right padding
2. Adjust page-level containers for consistent spacing
3. Ensure responsive behavior on mobile devices
4. Add padding to main content areas
5. Update feature cards and components to align properly

### Implementation Strategy:
- Use consistent padding values across the site
- Apply padding at the container level for consistency
- Ensure mobile responsiveness is maintained
- Test across different screen sizes

### Changes Implemented:

1. **Global Layout CSS (components/layout.css)**
   - Updated `--size-gutter` from `var(--space-5)` (32px) to `var(--space-6)` (64px)
   - This increases the default gutter size used throughout the site

2. **Layout Component (components/layout.js)**
   - Added increased left/right padding: `calc(var(--size-gutter) * 1.5)`
   - This provides extra horizontal spacing for all content wrapped in the Layout component

3. **Global Styles (styles/global.css)**
   - Updated main container padding from `1.5rem` to `3rem` on left/right
   - Maintained responsive behavior with `1.5rem` on mobile devices (max-width: 768px)

4. **Header Component (components/header.js)**
   - Increased horizontal padding to match layout: `calc(var(--size-gutter) * 1.5)`
   - Ensures header alignment with main content

5. **Page-Level Updates**
   - Contact page: Updated from `px-4` to `px-8 md:px-12`
   - Development Projects page: Updated from `px-4` to `px-8 md:px-12`
   - Data Science page: Added `px-8 md:px-12` to container
   - About page: Added `px-8 md:px-12` to container

6. **Feature Card Component (components/shared/feature-card.js)**
   - Removed excessive left padding (`pl-28`)
   - Changed to balanced padding (`p-10 sm:p-12`)
   - This prevents double-padding when combined with container-level spacing

### Result:
- Content now has consistent and generous left/right margins throughout the site
- Improved symmetry and visual balance
- Responsive behavior maintained for mobile devices
- Better readability with content not pressed against viewport edges

## UI Improvements - Featured Work Section (pages/index.js)

### Changes Made:
- Increased vertical and horizontal padding for the Featured Work section (`py-32`, `md:px-20`, `lg:px-32`) to keep headings and content away from the edges.
- Added `break-words` utility to headings and card containers to prevent text overflow and ensure proper word wrapping.
- Wrapped each `FeatureCard` in a `div` with `max-w-xl w-full mx-auto break-words p-8 md:p-10 rounded-2xl bg-gray-900/80 border border-teal-500/10 shadow-lg` to:
  - Anchor card dimensions for a uniform look in any grid.
  - Provide consistent padding and rounded corners.
  - Add a subtle border and shadow for visual separation.

### Reasoning:
- Improves readability and visual balance.
- Prevents text from running off the card or section edges.
- Ensures a consistent, modern card layout across devices and grid configurations.

## Bug Fixes - Feature Card Syntax Error (components/shared/feature-card.js)

### Issue:
- Syntax error due to an unterminated block comment (`/* ...`) inside a JS style object for the card background gradient div.
- This caused the build to fail with an 'expected }' error.

### Fix:
- Replaced the block comment with a JS line comment (`// ...`) inside the style object.
- Properly closed the style object with `}}`.

### Reasoning:
- JS objects do not support block comments; only line comments are valid.
- Ensures the file compiles and runs without syntax errors.

## UI Update - FeatureCard Visual Redesign (components/shared/feature-card.js)

### Changes Made:
- Removed visible border and grid outline from feature cards for a seamless, blended look.
- Increased card max width (`max-w-4xl`) and set `w-full` so cards expand to fill more horizontal space in the grid.
- Softened background gradients and border radii for a modern, less boxy appearance.
- Adjusted hover effect to be more subtle and less outlined.

### Reasoning:
- Creates a more immersive, modern, and visually appealing feature section.
- Allows cards to better utilize available space, especially on larger screens.
- Reduces visual clutter by removing grid outlines and hard borders.

## Bug Fix - Remove Extra Card Wrapper (pages/index.js)

### Changes Made:
- Removed the extra div with border, background, and padding classes that wrapped each FeatureCard in the featured work section grid.
- Now, only the FeatureCard component controls its own appearance and sizing.

### Reasoning:
- Prevents any grid outline, border, or background from being applied by the wrapper div.
- Ensures the visual style and expansion of the card is determined by FeatureCard, matching the intended seamless, modern look.

## Bug Fix - Prevent Card Content Clipping on Hover (components/shared/feature-card.js)

### Changes Made:
- Set the card's default scale to 0.97 and animate to scale 1 on hover, instead of scaling up from 1.0.
- Removed scale from whileHover and now control it via animate for smoothness and to avoid overflow issues.

### Reasoning:
- Prevents card content (especially text) from being cut off or clipped during the hover animation.
- Ensures a smooth, visually appealing card hover effect without layout issues.

## UI Tweak - Add Left Padding to Feature Card (components/shared/feature-card.js)

### Changes Made:
- Added 'pl-16' to the card's className to increase space between the left border and the card content.

### Reasoning:
- Improves visual balance and readability by preventing text and icons from appearing flush against the card's left edge.

## Project: Refactor Inline Styles to CSS Classes
**Date:** Today
**Task:** Remove inline style objects and move styling to CSS files using classes

### Changes Implemented:

1. **Feature Card Component (components/shared/feature-card.js)**
   - Created `feature-card.css` with all component-specific styles
   - Removed all inline style objects
   - Replaced with semantic CSS classes:
     - `.feature-card` - Main card container
     - `.feature-card-gradient` - Background gradient layer
     - `.feature-card-glow` - Hover glow effect
     - `.feature-card-content` - Content wrapper
     - `.feature-card-icon` - Icon container
     - `.feature-card-title` - Title styling
     - `.feature-card-description` - Description text
   - Added hover state classes with `.hovered` modifier

2. **Layout Component (components/layout.js)**
   - Added classes to `layout.css`:
     - `.layout-container` - Main layout wrapper
     - `.layout-footer` - Footer styling
   - Removed inline styles from div and footer elements

3. **Header Component (components/header.js)**
   - Added classes to `layout.css`:
     - `.site-header` - Header container
     - `.site-header-title` - Site title link
     - `.site-header-logo` - Logo image
   - Removed all inline style objects

4. **Hero Text Component (components/shared/hero-text.js)**
   - Created `shared.css` for shared component styles
   - Added hero text specific classes:
     - `.hero-text-container` - Main container
     - `.hero-name-container` - Name display wrapper
     - `.hero-letter` - Individual letter styling
     - `.hero-title` - Main title with gradient
     - `.hero-description` - Description text
     - `.hero-divider` - Animated divider line
   - Used modifier classes for letter variations (.accent, .primary, .space)

### Benefits:
- **Separation of Concerns**: Styles are now in CSS files, not JavaScript
- **Better Performance**: CSS is cached and parsed more efficiently
- **Maintainability**: Easier to update styles in one place
- **Consistency**: Uses existing CSS variables from layout.css
- **Reusability**: CSS classes can be reused across components
- **Developer Experience**: Cleaner component code, easier to read

### CSS Architecture:
- `layout.css` - Core layout components (header, footer, main container)
- `feature-card.css` - Feature card specific styles
- `shared.css` - Shared component styles (hero text, business card, etc.)
- Leverages existing CSS variables for colors, spacing, and typography 

## 2025-02-28 - Navigation, Theme, and Content Management Updates

### Changes Made:
1. **Fixed Data Science Page Background Issue**
   - Updated `pages/data-science.js` to accept and pass `location` prop to Layout component
   - This ensures the space background displays correctly on the data science page
   
2. **Theme Persistence Fix**
   - The theme system is already properly configured in `header.js`:
     - Theme preference is saved to localStorage
     - Theme persists across page refreshes and navigation
     - Light/Dark toggle works correctly
   
3. **Navigation Fix**
   - All navigation links are correctly pointing to lowercase URLs
   - The navigation indicator properly tracks the active page

### Clean and Debug Commands:
```bash
# Stop the development server
Ctrl+C

# Clean Gatsby cache and public directories
gatsby clean

# Restart the development server
gatsby develop
```

## 📚 **Comprehensive Content Management Guide**

### **Adding a Data Science Project**

1. **Create Project Directory:**
   ```
   src/data-science-projects/your-project-name/
   ```

2. **Create `index.mdx` file:**
   ```mdx
   ---
   title: "Your Project Title"
   date: "2025-02-28"
   slug: "your-project-slug"
   description: "Brief description of your data science project"
   tech_stack: ["Python", "Pandas", "Scikit-learn", "Matplotlib"]
   category: "data-science"
   complexity_level: "intermediate" # beginner/intermediate/advanced
   status: "completed" # completed/in-progress/planned
   published: true
   ---

   # Project Title

   ## Overview
   Brief introduction to your project...

   ## Dataset
   Description of the data used...

   ## Methodology
   Your approach and techniques...

   ## Results
   Key findings and visualizations...

   ## Code
   ```python
   # Your code snippets
   import pandas as pd
   # ...
   ```

   ## Conclusion
   Summary and future work...
   ```

### **Adding a Development Project**

1. **Create Project Directory:**
   ```
   src/development-projects/your-dev-project/
   ```

2. **Create `index.mdx` file:**
   ```mdx
   ---
   title: "Your Development Project"
   date: "2025-02-28"
   slug: "your-dev-project"
   description: "Brief description of your development project"
   tech_stack: ["React", "Node.js", "MongoDB", "Express"]
   category: "development"
   project_type: "web" # web/mobile/api/desktop
   status: "in-progress"
   github_url: "https://github.com/yourusername/project"
   live_url: "https://yourproject.com"
   published: true
   ---

   # Project Name

   ## Project Overview
   What the project does and why it's useful...

   ## Features
   - Feature 1
   - Feature 2
   - Feature 3

   ## Technical Stack
   Detailed explanation of technologies used...

   ## Architecture
   System design and architecture decisions...

   ## Code Examples
   ```javascript
   // Key code snippets
   const example = () => {
     // ...
   }
   ```

   ## Screenshots
   ![Screenshot](./screenshot1.png)

   ## Future Enhancements
   Planned improvements...
   ```

### **Adding a Blog Post**

1. **Create Blog Post Directory:**
   ```
   src/blog-posts/your-blog-post/
   ```

2. **Create `index.mdx` file:**
   ```mdx
   ---
   title: "Your Blog Post Title"
   date: "2025-02-28"
   slug: "your-blog-post"
   description: "Brief description for SEO and previews"
   category: "blog"
   tags: ["tutorial", "react", "web-development"]
   published: true
   author: "Dennis J. Carroll"
   ---

   # Blog Post Title

   ## Introduction
   Your opening paragraph...

   ## Main Content
   Your article content with markdown formatting...

   ### Subheadings
   Organize your content...

   ## Code Examples
   ```javascript
   // Include relevant code
   ```

   ## Conclusion
   Wrap up your thoughts...
   ```

### **Adding a Story/Creative Writing**

1. **Create Story Directory:**
   ```
   src/stories/your-story-title/
   ```

2. **Create `index.mdx` file:**
   ```mdx
   ---
   title: "Your Story Title"
   date: "2025-02-28"
   slug: "your-story"
   description: "Brief synopsis of your story"
   category: "stories"
   genre: "science-fiction" # fantasy/mystery/thriller/drama
   word_count: 2500
   published: true
   ---

   # Story Title

   *Genre: Science Fiction*

   Your story content here...

   Use markdown formatting for emphasis, *italics*, **bold**, etc.

   > "Dialogue can be formatted as blockquotes"

   Continue your narrative...
   ```

### **Adding Images/Media**

1. **For Project Images:**
   - Place images in the same directory as your `index.mdx`
   - Reference them with relative paths: `![Alt text](./image.png)`

2. **For Global Images:**
   - Place in `src/images/`
   - Import in your MDX: 
     ```mdx
     import myImage from '../images/my-image.png'
     
     <img src={myImage} alt="Description" />
     ```

### **Adding Videos**

1. **Embed YouTube/Vimeo:**
   ```mdx
   <iframe 
     width="560" 
     height="315" 
     src="https://www.youtube.com/embed/VIDEO_ID" 
     frameBorder="0" 
     allowFullScreen
   ></iframe>
   ```

2. **Local Video Files:**
   ```mdx
   <video controls width="100%">
     <source src="./video.mp4" type="video/mp4" />
     Your browser does not support the video tag.
   </video>
   ```

### **Adding Presentations**

1. **Embed Google Slides:**
   ```mdx
   <iframe 
     src="https://docs.google.com/presentation/d/e/PRESENTATION_ID/embed" 
     width="960" 
     height="569" 
     frameBorder="0"
   ></iframe>
   ```

2. **PDF Presentations:**
   - Upload PDF to project directory
   - Link to it: `[Download Presentation](./presentation.pdf)`

### **Adding Interactive Components**

1. **CodeSandbox Embeds:**
   ```mdx
   <iframe
     src="https://codesandbox.io/embed/YOUR_SANDBOX_ID"
     style={{width:'100%', height:'500px', border:0, borderRadius:'4px', overflow:'hidden'}}
     title="Your Demo"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
   ```

2. **Custom React Components in MDX:**
   ```mdx
   import MyCustomComponent from '../../components/MyCustomComponent'
   
   <MyCustomComponent prop1="value" />
   ```

### **Jupyter Notebook Integration**

1. **Convert Notebook to JSON:**
   ```bash
   jupyter nbconvert --to json your-notebook.ipynb
   ```

2. **Place in project directory and use JupyterViewer:**
   ```mdx
   import JupyterViewer from '../../components/data-science/jupyter-viewer'
   
   <JupyterViewer notebookPath="./notebook.json" />
   ```

### **SEO Best Practices**

Always include in frontmatter:
- `title`: Clear, descriptive title
- `description`: 150-160 character summary
- `slug`: URL-friendly identifier
- `date`: Publication date
- `published`: Set to `true` when ready

### **Theme Customization Options**

The site supports light/dark themes. To add custom themes:

1. **Add theme variables in `futuristic-ui.css`:**
   ```css
   body.tokyo-afternoon {
     --bg-primary: #1a1a2e;
     --bg-secondary: #16213e;
     --text-primary: #e8e8e8;
     --primary-color: #ff6b6b;
     --secondary-color: #4ecdc4;
     /* ... other variables */
   }
   ```

2. **Update theme toggle in `header.js` to include new option**

### **New Three-Theme System (Updated 2025-02-28)**

The site now supports three distinct themes:
- **🌙 Dark Theme**: Default futuristic dark mode with cyan/purple accents
- **☀️ Light Theme**: Clean light mode with adjusted contrast
- **🌸 Tokyo Afternoon**: Warm sunset theme with coral/yellow accents

#### Theme Features:
- Smooth transitions between themes
- Persistent theme selection (saved to localStorage)
- Visual indicator showing active theme
- Animated theme selector with emoji icons
- Theme-specific color adjustments for all UI elements

#### Tokyo Afternoon Theme Colors:
- Primary: Coral red (#f47068)
- Secondary: Warm yellow (#ffd93d)
- Accent: Mint green (#6bcf7f)
- Background: Deep purple-blue (#1a1a2e)
- Text: Cream white (#eeeee4)

### **Tokyo Afternoon Theme Update (2025-02-28)**
The Tokyo Afternoon theme has been completely redesigned to match the Majestika UI template:

#### New Color Scheme:
- **Background**: Light teal gradient (#e0f7fa to #80deea)
- **Primary Text**: Deep purple (#4a148c)
- **Secondary Text**: Medium purple (#6a1b9a)
- **Primary Color**: Purple (#7b1fa2)
- **Secondary Color**: Cyan (#00acc1)
- **Card Background**: White with transparency (rgba(255, 255, 255, 0.98))
- **Accent**: Bright cyan (#26c6da)

#### Key Features:
- Beautiful gradient background inspired by afternoon skies
- High contrast purple text on light backgrounds
- Clean white cards with subtle purple borders
- No space particles (replaced with subtle gradient overlay)
- Optimized for readability with improved text contrast

### **Contrast Improvements (2025-02-28)**
All themes now have improved text contrast:

#### Dark Theme:
- Heading color: Pure white (#ffffff)
- Body text: Light gray (#d0d0d0)
- Enhanced contrast for better readability

#### Light Theme:
- Heading color: Near black (#1a1a1a)
- Body text: Dark gray (#333333)
- White card backgrounds for maximum contrast

#### Tokyo Afternoon:
- Heading color: Deep purple (#4a148c)
- Body text: Medium purple (#5e35b1)
- White card backgrounds with purple accents

### **Troubleshooting**

1. **Content not showing:**
   - Ensure `published: true` in frontmatter
   - Check category matches filter in GraphQL query
   - Run `gatsby clean && gatsby develop`

2. **Images not loading:**
   - Use relative paths for MDX images
   - Ensure image file extensions are lowercase
   - Check file is in correct directory

3. **Build errors:**
   - Check for syntax errors in MDX
   - Ensure all required frontmatter fields are present
   - Verify import paths are correct

### **Deployment Checklist**

Before deploying:
1. Set all ready content to `published: true`
2. Run `gatsby build` locally to check for errors
3. Test all navigation links
4. Verify images load correctly
5. Check responsive design on mobile
6. Test theme persistence
7. Validate SEO meta tags 