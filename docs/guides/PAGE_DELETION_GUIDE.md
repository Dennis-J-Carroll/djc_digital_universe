# Complete Guide to Deleting Pages and Cleaning Up References

## 🎯 Overview

When you delete a page from a Gatsby site, you must also remove ALL references to that page throughout your codebase. Orphaned references can cause:
- **Build errors** (Gatsby trying to build non-existent pages)
- **404 errors** (broken links for users)
- **Test failures** (tests expecting pages that don't exist)
- **Poor user experience** (clicking dead links)

This guide shows you **step-by-step** how to find and remove every reference.

---

## 📋 Step-by-Step Process

### **Step 1: Identify What Was Deleted**

**Why**: You need to know exactly what you're looking for before you can clean it up.

**What to document**:
- Page file path (e.g., `src/pages/data-science.js`)
- Page route/URL (e.g., `/data-science`)
- Page title/name (e.g., "Data Science")

**Example from our cleanup**:
```bash
# Pages we deleted:
- src/pages/data-science.js → /data-science route
- src/pages/page-2.js → /page-2 route
- src/pages/using-ssr.js → /using-ssr route
- src/pages/using-typescript.tsx → /using-typescript route
- etc.
```

---

### **Step 2: Search Navigation Components**

**Why**: Navigation menus are the #1 place users click to access pages. Broken nav links = bad UX.

**Where to look**:
```bash
src/components/shared/navigation-component.js
src/components/layout/header.js
src/components/layout/footer.js
```

**How to search**:
```bash
# Search for the route path
grep -r "/data-science" src/components/

# Search for the page title
grep -r "Data Science" src/components/
```

**What you'll find**:
```javascript
// ❌ BEFORE - Dead link in navigation
const navItems = [
  { label: "Home", url: "/" },
  { label: "Data Science", url: "/data-science" },  // ← REMOVE THIS
  { label: "Development Projects", url: "/development-projects" }
];

// ✅ AFTER - Cleaned up
const navItems = [
  { label: "Home", url: "/" },
  { label: "Development Projects", url: "/development-projects" }
];
```

**Files we fixed**:
- [src/components/shared/navigation-component.js](src/components/shared/navigation-component.js) - Removed data-science nav item
- [src/components/layout/footer.js](src/components/layout/footer.js) - Removed from quickLinks array

---

### **Step 3: Search Layout Components**

**Why**: Layout components often have logic that checks the current route to apply styles or show/hide elements. If they reference deleted pages, they can cause errors.

**Where to look**:
```bash
src/components/layout/layout.js
src/components/layout/header.js
```

**How to search**:
```bash
# Look for route checking logic
grep -r "pathname" src/components/layout/

# Look for section checking
grep -r "getCurrentSection\|getSection" src/components/
```

**What you'll find**:
```javascript
// ❌ BEFORE - Route checking includes deleted page
const getCurrentSection = () => {
  const path = location?.pathname || "";
  if (path.includes("/data-science")) return "data-science";  // ← REMOVE THIS
  if (path.includes("/development-projects")) return "dev-projects";
  return "home";
}

// ✅ AFTER - Cleaned up
const getCurrentSection = () => {
  const path = location?.pathname || "";
  if (path.includes("/development-projects")) return "dev-projects";
  return "home";
}
```

**Files we fixed**:
- [src/components/layout/layout.js:28-37](src/components/layout/layout.js#L28-L37) - Removed data-science path check

---

### **Step 4: Search Gatsby Configuration**

**Why**: Gatsby uses `gatsby-config.js` to define data sources. If you delete a source directory but leave it in config, **builds will fail**.

**Where to look**:
```bash
gatsby-config.js
gatsby-node.js
```

**How to search**:
```bash
# Look for filesystem sources
grep -A3 "gatsby-source-filesystem" gatsby-config.js

# Look for deleted directory names
grep -r "data-science-projects" gatsby-config.js
```

**What you'll find**:
```javascript
// ❌ BEFORE - References deleted directory
{
  resolve: `gatsby-source-filesystem`,
  options: {
    name: `data-science-projects`,
    path: `${__dirname}/src/data-science-projects`,  // ← Directory doesn't exist!
  },
},

// ✅ AFTER - Removed entire block
// (just delete it entirely)
```

**Files we fixed**:
- [gatsby-config.js:27-33](gatsby-config.js#L27-L33) - Removed data-science-projects filesystem source

**Why this matters**: This was causing the build error:
```
ERROR: The path passed to gatsby-source-filesystem does not exist on your file system:
/home/dennisjcarroll/everything-personal-website/everything-personal-website/src/data-science-projects
```

---

### **Step 5: Search gatsby-node.js**

**Why**: `gatsby-node.js` programmatically creates pages. If it tries to create pages from deleted templates or data, builds will fail.

**Where to look**:
```bash
gatsby-node.js
```

**How to search**:
```bash
# Look for page creation logic
grep -A5 "createPage" gatsby-node.js

# Look for template references
grep -r "template" gatsby-node.js
```

**What you'll find**:
```javascript
// ❌ BEFORE - Creates pages from deleted source
exports.createPages = async ({ graphql, actions }) => {
  const dataScienceTemplate = path.resolve(`src/templates/data-science-detail.js`)

  // Query for data-science-projects
  const dataScienceResult = await graphql(`{
    allMdx(filter: { sourceInstanceName: { eq: "data-science-projects" }}) {
      nodes { id, slug }
    }
  }`)

  // Create pages
  dataScienceResult.data.allMdx.nodes.forEach(node => {
    actions.createPage({
      path: `/data-science/${node.slug}`,
      component: dataScienceTemplate,
      context: { id: node.id }
    })
  })
}

// ✅ AFTER - Remove the entire block
```

**Our site**: We checked and didn't have data-science page generation in gatsby-node.js

---

### **Step 6: Search All Page Files**

**Why**: Individual pages might link to deleted pages in their content or navigation.

**Where to look**:
```bash
src/pages/*.js
src/pages/*.tsx
```

**How to search**:
```bash
# Search all pages for the deleted route
grep -r "/data-science" src/pages/

# Search for Link components pointing to deleted pages
grep -r '<Link to="/data-science"' src/pages/
```

**What you'll find**:
```javascript
// ❌ BEFORE - Links to deleted page
<div className="cta-buttons">
  <Link to="/development-projects">Development Projects</Link>
  <Link to="/data-science">Data Science</Link>  // ← REMOVE THIS
  <Link to="/about">About</Link>
</div>

// ✅ AFTER - Cleaned up
<div className="cta-buttons">
  <Link to="/development-projects">Development Projects</Link>
  <Link to="/about">About</Link>
</div>
```

**Files we fixed**:
- [src/pages/index.js](src/pages/index.js) - Removed Data Science from featured work

---

### **Step 7: Search MDX/Markdown Files**

**Why**: Blog posts and content pages might have hardcoded links to deleted pages.

**Where to look**:
```bash
src/blog-posts/**/*.mdx
src/stories/**/*.mdx
src/data-science-projects/**/*.mdx (if keeping MDX but deleting the page)
```

**How to search**:
```bash
# Search for markdown links
grep -r "\[.*\](/data-science)" src/
grep -r "href.*data-science" src/
```

**What you'll find**:
```markdown
<!-- ❌ BEFORE - Link to deleted page -->
Check out my [Data Science projects](/data-science) for more info.

<!-- ✅ AFTER - Update to working page -->
Check out my [Development Projects](/development-projects) for more info.
```

---

### **Step 8: Search Test Files**

**Why**: Tests might reference deleted pages. If you don't update them, your test suite will fail.

**Where to look**:
```bash
src/**/__tests__/**/*.test.js
src/**/*.spec.js
```

**How to search**:
```bash
# Search test files for deleted page references
grep -r "data-science\|Data Science" src/**/__tests__/

# Look for navigation tests
grep -r "navigation" src/**/__tests__/
```

**What you'll find**:
```javascript
// ❌ BEFORE - Test expects deleted page
it("displays all navigation links", () => {
  render(<Navigation />)
  expect(screen.getByText("Home")).toBeInTheDocument()
  expect(screen.getByText("Data Science")).toBeInTheDocument()  // ← FAILS!
  expect(screen.getByText("About")).toBeInTheDocument()
})

// ✅ AFTER - Updated test
it("displays all navigation links", () => {
  render(<Navigation />)
  expect(screen.getByText("Home")).toBeInTheDocument()
  expect(screen.getByText("About")).toBeInTheDocument()
})

// Or add a negative test
it("does not display Data Science link", () => {
  render(<Navigation />)
  expect(screen.queryByText("Data Science")).not.toBeInTheDocument()
})
```

**Files we fixed**:
- [src/components/shared/__tests__/navigation-component.test.js](src/components/shared/__tests__/navigation-component.test.js) - Updated to expect 5 items instead of 6
- [src/pages/__tests__/index.test.js](src/pages/__tests__/index.test.js) - Removed Data Science expectations

---

### **Step 9: Search Static Files**

**Why**: Static HTML files in the `static/` folder might have hardcoded links.

**Where to look**:
```bash
static/**/*.html
```

**How to search**:
```bash
# Search for links to deleted pages
grep -r 'href="/data-science"' static/
```

**What you'll find**:
```html
<!-- ❌ BEFORE - Hardcoded link in static HTML -->
<nav>
  <a href="/">Home</a>
  <a href="/data-science">Data Science</a>
  <a href="/about">About</a>
</nav>

<!-- ✅ AFTER - Updated -->
<nav>
  <a href="/">Home</a>
  <a href="/development-projects">Development Projects</a>
  <a href="/about">About</a>
</nav>
```

---

### **Step 10: Verify with Global Search**

**Why**: This is your safety net to catch anything you missed.

**How to do it**:
```bash
# Search the entire codebase for the deleted route
grep -r "/data-science" . --exclude-dir=node_modules --exclude-dir=.cache --exclude-dir=public

# Search for the page title
grep -ri "data science" . --exclude-dir=node_modules --exclude-dir=.cache --exclude-dir=public

# Search for the filename (without extension)
grep -r "data-science\.js\|data-science\.tsx" . --exclude-dir=node_modules
```

**What to ignore**:
- `.git/` folder (old commits)
- `node_modules/` (dependencies)
- `.cache/` and `public/` (build artifacts that get regenerated)
- This very document (PAGE_DELETION_GUIDE.md)
- CLEANUP_SUMMARY.md or other documentation files

---

## ✅ Verification Checklist

After completing all steps, verify everything works:

### 1. **Build Test**
```bash
npm run clean    # Clear cache
npm run build    # Full production build
```

**What to check**:
- ✅ Build completes without errors
- ✅ No warnings about missing pages
- ✅ All expected pages generated

### 2. **Test Suite**
```bash
npm test
```

**What to check**:
- ✅ All tests pass
- ✅ No tests reference deleted pages
- ✅ Coverage reports don't include deleted files

### 3. **Development Server**
```bash
npm start
```

**What to check**:
- ✅ Server starts without errors
- ✅ Navigation doesn't show deleted pages
- ✅ No console errors in browser
- ✅ Clicking through all links works

### 4. **Manual Testing**
- Click every navigation link
- Check footer links
- Try accessing deleted routes directly (should show 404)
- Check browser console for errors

---

## 🔧 Common Patterns to Search

Use these grep patterns to find references:

```bash
# Routes
grep -r "/page-name" src/

# Components
grep -r "PageName" src/

# Titles (case-insensitive)
grep -ri "page title" src/

# Imports
grep -r "import.*from.*page-name" src/

# Links
grep -r 'to="/page-name"' src/
grep -r 'href="/page-name"' src/

# Path variables
grep -r "pages/page-name" .
```

---

## 📊 Our Real Cleanup Example

Here's what we actually did for removing the data-science page:

| Location | What We Found | What We Did |
|----------|--------------|-------------|
| `src/components/layout/footer.js:10-16` | `{ label: "Data Science", url: "/data-science" }` | Removed from quickLinks array |
| `src/components/layout/layout.js:28-37` | `if (path.includes("/data-science")) return "data-science"` | Removed path check |
| `gatsby-config.js:27-33` | `gatsby-source-filesystem` pointing to `src/data-science-projects` | Removed entire plugin config |
| `src/components/shared/navigation-component.js` | Navigation item for Data Science | Removed navigation item |
| `src/pages/index.js` | Data Science in featured work | Removed from hero section |
| `src/components/shared/__tests__/navigation-component.test.js` | Test expected "Data Science" text | Added negative assertion test |

**Result**:
- ✅ Build successful
- ✅ All 28 tests passing
- ✅ No broken links
- ✅ Clean codebase

---

## 🚨 Red Flags (Signs You Missed Something)

Watch for these warning signs:

1. **Build Errors**
   ```
   ERROR: The path passed to gatsby-source-filesystem does not exist
   ```
   → Check gatsby-config.js

2. **404 Warnings**
   ```
   warn Gatsby found links to non-existent pages: /deleted-page
   ```
   → Search for hardcoded links

3. **Test Failures**
   ```
   Unable to find element with text: "Deleted Page"
   ```
   → Update or remove the test

4. **Console Errors**
   ```
   Failed to load resource: 404 (Not Found) /deleted-page
   ```
   → Search for client-side navigation attempts

---

## 💡 Pro Tips

1. **Use VS Code Search**: `Cmd/Ctrl + Shift + F` searches the entire codebase
2. **Use Regex**: Search for variations: `data-science|datascience|data_science`
3. **Check Git History**: `git log --all --full-history --source -- "**/deleted-file.js"`
4. **Document Your Deletion**: Keep a list like this guide for future reference

---

## 🎓 Key Takeaways

1. **Deleting a page file is only 10% of the work** - the other 90% is cleaning up references
2. **Always start with navigation** - it's the most common place for links
3. **Gatsby config is critical** - wrong config = build failures
4. **Test everything** - automated tests catch what you miss manually
5. **Verify with build + tests** - if both pass, you're probably good

---

**Last Updated**: 2025-12-28 (During data-science page cleanup)

**Need Help?** Reference the [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) for our specific cleanup results.
