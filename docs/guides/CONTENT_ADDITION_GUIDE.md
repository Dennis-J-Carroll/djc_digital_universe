# Complete Guide to Adding Content to Your Gatsby Site

## 📚 Table of Contents

1. [Overview](#overview)
2. [Adding HTML Apps](#adding-html-apps)
3. [Adding Blog Posts](#adding-blog-posts)
4. [Adding Stories](#adding-stories)
5. [Adding Research/Data Science Projects](#adding-research-projects)
6. [Quick Reference Commands](#quick-reference)

---

## 🎯 Overview

Your site supports **4 types of content**:

| Content Type | Location | Format | Use Case |
|-------------|----------|--------|----------|
| **HTML Apps** | `static/apps/` | `.html` | Standalone interactive tools |
| **Blog Posts** | `src/blog-posts/` | `.mdx` | Articles, tutorials, updates |
| **Stories** | `src/stories/` | `.mdx` | Creative writing, fiction |
| **Research** | `src/data-science-projects/` | `.mdx` | Technical papers, projects |

---

## 🔧 Adding HTML Apps

### What Are HTML Apps?

Self-contained interactive applications (like your CompTIA Study Suite, Neural Theory Lab, etc.) that:
- Work independently without React
- Can use vanilla HTML/CSS/JS or frameworks via CDN
- Are portable (can work on any server)

### Step-by-Step Process

#### **Step 1: Create Your HTML File**

Create a new file in `static/apps/`:

```bash
# Example: Creating a new calculator app
touch static/apps/my-calculator.html
```

**File Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Calculator</title>

    <!-- Option 1: Use a CSS framework via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Option 2: Inline CSS -->
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        .calculator {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h1>My Calculator</h1>
        <input type="number" id="num1" placeholder="Number 1">
        <input type="number" id="num2" placeholder="Number 2">
        <button onclick="calculate()">Calculate</button>
        <div id="result"></div>
    </div>

    <script>
        function calculate() {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            const result = num1 + num2;
            document.getElementById('result').textContent = `Result: ${result}`;
        }
    </script>
</body>
</html>
```

#### **Step 2: Test Your HTML File Locally**

Open it directly in a browser:

```bash
# Option 1: Open in default browser (macOS/Linux)
open static/apps/my-calculator.html

# Option 2: Start dev server and navigate to:
npm start
# Then visit: http://localhost:8000/apps/my-calculator.html
```

#### **Step 3: Add to Development Projects Page**

Edit `src/pages/development-projects.js`:

```javascript
const htmlProjects = [
  // ... existing projects ...

  {
    title: "My Calculator",
    description: "A simple calculator for basic arithmetic operations.",
    filename: "my-calculator.html",  // ← Must match your HTML filename!
    icon: <ToolIcon />,  // Choose: <AiIcon />, <DataIcon />, or <ToolIcon />
    tech: ["JavaScript", "HTML", "CSS", "Math"],
    category: "web"  // Choose: "ai", "data", or "web"
  }
];
```

**Category Guide:**
- `"ai"` → Shows under "AI & Machine Learning"
- `"data"` → Shows under "Data Science & Mathematics"
- `"web"` → Shows under "Web Applications & Tools"

#### **Step 4: Verify It Works**

```bash
# Restart dev server
npm start

# Visit your site
http://localhost:8000/development-projects

# Click your new app card - should open in new tab
```

### Best Practices for HTML Apps

✅ **DO:**
- Keep all dependencies in the HTML file (use CDNs)
- Test the file standalone first
- Use responsive design (`<meta name="viewport">`)
- Add clear instructions/documentation in the app

❌ **DON'T:**
- Reference external local files (they won't work in production)
- Use relative paths to assets outside `static/`
- Assume the user has the file locally

### Example: Using External Libraries

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chart Example</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Chart.js for data visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 class="text-3xl font-bold mb-4">Sales Chart</h1>
        <canvas id="myChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 3, 5],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            }
        });
    </script>
</body>
</html>
```

---

## 📝 Adding Blog Posts

### What Are Blog Posts?

Articles, tutorials, or updates written in **MDX** (Markdown + JSX). They support:
- Rich text formatting
- Images
- Code blocks with syntax highlighting
- React components

### Step-by-Step Process

#### **Step 1: Create a Folder**

Each blog post gets its own folder:

```bash
# Create a folder with a descriptive name (use kebab-case)
mkdir -p src/blog-posts/my-first-blog-post
```

#### **Step 2: Create index.mdx**

Inside that folder, create `index.mdx`:

```bash
touch src/blog-posts/my-first-blog-post/index.mdx
```

#### **Step 3: Write Your Content**

**Template:**
```mdx
---
title: "My First Blog Post"
date: "2025-12-28"
description: "An introduction to blogging on my Gatsby site"
author: "Dennis J. Carroll"
tags: ["tutorial", "blogging", "gatsby"]
featuredImage: "./featured-image.jpg"
---

# Welcome to My Blog!

This is my **first blog post** using MDX. Here's what makes it powerful:

## Code Blocks

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("World"));
```

## Images

![My Image](./my-image.jpg)

## Lists

- Easy to write
- Markdown syntax
- Full React component support

## Inline JSX

You can even use React components:

<div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
  This is a custom styled box!
</div>

## Links

[Visit my homepage](/)

## Blockquotes

> "The best way to predict the future is to create it."
> — Peter Drucker
```

#### **Step 4: Add Images (Optional)**

Place images in the same folder:

```bash
# Copy an image to the blog post folder
cp ~/Downloads/my-image.jpg src/blog-posts/my-first-blog-post/
```

Then reference it in your MDX:
```markdown
![Description](./my-image.jpg)
```

#### **Step 5: Verify It Works**

```bash
# Restart dev server
npm run clean && npm start

# Visit the blog list page (you'll need to create this or add a link)
http://localhost:8000/blog

# Or navigate via GraphQL:
http://localhost:8000/___graphql

# Run this query:
{
  allMdx(filter: { sourceInstanceName: { eq: "blog-posts" }}) {
    nodes {
      frontmatter {
        title
        date
      }
      slug
    }
  }
}
```

### Frontmatter Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `title` | ✅ Yes | Post title | `"How to Learn Gatsby"` |
| `date` | ✅ Yes | Publication date | `"2025-12-28"` |
| `description` | ✅ Yes | SEO description | `"A beginner's guide..."` |
| `author` | No | Author name | `"Dennis J. Carroll"` |
| `tags` | No | Categories/topics | `["gatsby", "tutorial"]` |
| `featuredImage` | No | Hero image | `"./hero.jpg"` |

### MDX Syntax Cheat Sheet

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

[Link text](https://example.com)
![Image alt text](./image.jpg)

- Bullet list
- Item 2
  - Nested item

1. Numbered list
2. Item 2

> Blockquote

`inline code`

```language
code block
```

---

Horizontal rule
```

---

## 📖 Adding Stories

### What Are Stories?

Creative writing, fiction, or narrative content. Identical format to blog posts but stored separately for organization.

### Step-by-Step Process

#### **Step 1: Create Story Folder**

```bash
mkdir -p src/stories/my-first-story
```

#### **Step 2: Create index.mdx**

```bash
touch src/stories/my-first-story/index.mdx
```

#### **Step 3: Write Your Story**

**Template:**
```mdx
---
title: "The Quantum Observer"
date: "2025-12-28"
description: "A short story about a scientist who discovers parallel universes"
genre: "Science Fiction"
wordCount: 2500
featuredImage: "./cover.jpg"
---

# The Quantum Observer

*A science fiction short story*

---

## Chapter 1: The Discovery

Dr. Sarah Chen stared at the monitor, her coffee growing cold in her trembling hand. The numbers didn't lie, but they couldn't be real either.

"Run it again," she whispered to herself, already knowing the result would be identical.

The quantum computer hummed in the background, its cooling systems working overtime. On the screen, the probability wave function collapsed—not into one state, but into *seventeen*.

Seventeen parallel universes. Seventeen versions of this moment. And somehow, she was seeing all of them.

## Chapter 2: The Observation

She reached for her notebook, the one she kept for "impossible findings." The pen shook as she wrote:

> **December 28, 2025, 3:47 AM**
>
> Multiverse detection confirmed. Observation causes branching, not collapse. Wheeler was wrong. Everett was right. We don't choose which universe we're in—we choose which one we *observe*.

Her phone buzzed. A text from her colleague, Dr. Patel:

*"Did you see it too?"*

She smiled. In at least one universe, she wasn't alone.

---

*To be continued...*
```

#### **Step 4: Access Your Stories**

Stories are automatically available at:
```
http://localhost:8000/stories/[folder-name]
```

Example:
```
http://localhost:8000/stories/my-first-story
```

### Story Frontmatter Options

```yaml
---
title: "Your Story Title"
date: "2025-12-28"
description: "Brief summary for SEO"
genre: "Science Fiction"  # Genre classification
wordCount: 2500  # Optional word count
featuredImage: "./cover-art.jpg"  # Optional cover image
series: "Quantum Series"  # If part of a series
seriesOrder: 1  # Position in series
status: "published"  # or "draft"
---
```

---

## 🔬 Adding Research/Data Science Projects

### What Are Research Projects?

Technical write-ups, research papers, data analysis projects, or scientific studies. Uses MDX like blog posts but designed for technical content.

### Step-by-Step Process

#### **Step 1: Create Project Folder**

```bash
mkdir -p src/data-science-projects/neural-network-analysis
```

#### **Step 2: Create index.mdx**

```bash
touch src/data-science-projects/neural-network-analysis/index.mdx
```

#### **Step 3: Write Your Research**

**Template:**
```mdx
---
title: "Deep Learning Performance Analysis"
date: "2025-12-28"
description: "Comparative analysis of CNN architectures on CIFAR-10 dataset"
category: "Machine Learning"
technologies: ["Python", "TensorFlow", "Keras", "NumPy"]
difficulty: "Advanced"
duration: "3 weeks"
repository: "https://github.com/username/project"
---

# Deep Learning Performance Analysis

**Abstract:** This study compares the performance of various Convolutional Neural Network (CNN) architectures on the CIFAR-10 dataset, analyzing accuracy, training time, and computational efficiency.

---

## 1. Introduction

Deep learning has revolutionized computer vision tasks, but choosing the right architecture remains challenging. This research compares:

- VGG-16
- ResNet-50
- EfficientNet-B0
- Custom CNN

### Research Questions

1. Which architecture provides the best accuracy-to-parameter ratio?
2. How does training time scale with model complexity?
3. What are the memory requirements for each model?

---

## 2. Methodology

### Dataset

The CIFAR-10 dataset consists of 60,000 32x32 color images across 10 classes:

- Training set: 50,000 images
- Test set: 10,000 images
- Classes: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck

### Experimental Setup

```python
import tensorflow as tf
from tensorflow.keras.datasets import cifar10
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten

# Load data
(x_train, y_train), (x_test, y_test) = cifar10.load_data()

# Normalize pixel values
x_train = x_train.astype('float32') / 255
x_test = x_test.astype('float32') / 255

# Model architecture
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    Flatten(),
    Dense(64, activation='relu'),
    Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
```

---

## 3. Results

### Performance Comparison

| Model | Accuracy | Parameters | Training Time | Memory (MB) |
|-------|----------|------------|---------------|-------------|
| VGG-16 | 89.2% | 14.7M | 45 min | 528 |
| ResNet-50 | 91.5% | 23.5M | 62 min | 680 |
| EfficientNet-B0 | 92.1% | 4.0M | 38 min | 320 |
| Custom CNN | 85.7% | 2.1M | 22 min | 180 |

### Key Findings

1. **EfficientNet-B0** achieved the best balance of accuracy and efficiency
2. **ResNet-50** had highest accuracy but required more resources
3. **Custom CNN** was fastest to train but lower accuracy

### Visualizations

![Training Accuracy](./training-accuracy-chart.png)
*Figure 1: Training accuracy over 50 epochs for each model*

![Confusion Matrix](./confusion-matrix.png)
*Figure 2: Confusion matrix for best-performing model (EfficientNet-B0)*

---

## 4. Discussion

The results demonstrate that **model complexity doesn't always correlate with performance**. EfficientNet-B0's architecture, based on neural architecture search, outperformed manually designed architectures while using fewer parameters.

### Implications

- For resource-constrained environments: Use EfficientNet or Custom CNN
- For maximum accuracy: Choose ResNet-50 or EfficientNet
- For rapid prototyping: Start with Custom CNN

### Limitations

- Only tested on CIFAR-10 (32x32 images)
- Did not evaluate on real-world datasets
- Hardware-specific results (RTX 3090 GPU)

---

## 5. Conclusion

This analysis provides clear guidance for practitioners selecting CNN architectures. **EfficientNet-B0** offers the best trade-off between accuracy, speed, and memory usage for CIFAR-10 classification.

### Future Work

- Extend to ImageNet dataset
- Test on edge devices (Raspberry Pi, mobile)
- Explore quantization and pruning techniques

---

## References

1. Simonyan, K., & Zisserman, A. (2014). Very Deep Convolutional Networks for Large-Scale Image Recognition
2. He, K., et al. (2016). Deep Residual Learning for Image Recognition
3. Tan, M., & Le, Q. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks

---

## Code & Data

- **Repository:** [GitHub Link](https://github.com/username/cnn-comparison)
- **Jupyter Notebook:** [View Analysis](./analysis.ipynb)
- **Dataset:** [CIFAR-10 Official](https://www.cs.toronto.edu/~kriz/cifar.html)

---

*Last updated: December 28, 2025*
```

### Research Frontmatter Options

```yaml
---
title: "Your Research Title"
date: "2025-12-28"
description: "Brief abstract/summary"
category: "Machine Learning"  # or "Data Analysis", "Statistics", etc.
technologies: ["Python", "TensorFlow", "Pandas"]
difficulty: "Advanced"  # Beginner, Intermediate, Advanced
duration: "3 weeks"  # How long the project took
repository: "https://github.com/user/repo"  # Optional GitHub link
published: true  # or false for drafts
arxiv: "https://arxiv.org/abs/..."  # If published on arXiv
doi: "10.1234/example"  # If peer-reviewed
---
```

---

## 📋 Quick Reference Commands

### Creating New Content

```bash
# HTML App
touch static/apps/my-app.html

# Blog Post
mkdir -p src/blog-posts/my-post && touch src/blog-posts/my-post/index.mdx

# Story
mkdir -p src/stories/my-story && touch src/stories/my-story/index.mdx

# Research Project
mkdir -p src/data-science-projects/my-research && touch src/data-science-projects/my-research/index.mdx
```

### Testing

```bash
# Clean cache and restart
npm run clean && npm start

# Build for production
npm run build

# Run tests
npm test
```

### GraphQL Queries (http://localhost:8000/___graphql)

```graphql
# Get all blog posts
{
  allMdx(filter: { sourceInstanceName: { eq: "blog-posts" }}) {
    nodes {
      frontmatter {
        title
        date
      }
      slug
    }
  }
}

# Get all stories
{
  allMdx(filter: { sourceInstanceName: { eq: "stories" }}) {
    nodes {
      frontmatter {
        title
        genre
      }
      slug
    }
  }
}

# Get all research projects
{
  allMdx(filter: { sourceInstanceName: { eq: "data-science-projects" }}) {
    nodes {
      frontmatter {
        title
        category
        technologies
      }
      slug
    }
  }
}
```

---

## 🎨 Styling Tips

### For HTML Apps

Use CSS frameworks via CDN:
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
```

### For MDX Content

Use inline JSX for custom styling:
```mdx
<div style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem',
  borderRadius: '8px',
  color: 'white',
  marginBottom: '2rem'
}}>
  Custom styled content box!
</div>
```

---

## 🚀 Best Practices Summary

### ✅ DO:

- Use descriptive folder/file names (kebab-case)
- Include all required frontmatter fields
- Test locally before committing
- Add images to the same folder as your content
- Use relative paths for images (`./image.jpg`)
- Write clear, concise descriptions
- Add code syntax highlighting

### ❌ DON'T:

- Use spaces in folder/file names
- Reference external local files in HTML apps
- Forget to restart the dev server after adding content
- Use absolute paths for images
- Skip the frontmatter block
- Mix content types (put blogs in stories folder, etc.)

---

## 🆘 Troubleshooting

### "Page not found" after adding content

```bash
# Solution: Clean cache and rebuild
npm run clean
npm start
```

### Images not showing

```markdown
# ❌ Wrong: Absolute path
![My Image](/src/blog-posts/my-post/image.jpg)

# ✅ Correct: Relative path
![My Image](./image.jpg)
```

### GraphQL query returns empty

Check that:
1. Folder is in the correct location (`src/blog-posts/`, `src/stories/`, etc.)
2. File is named `index.mdx` (not `index.md`)
3. Frontmatter block exists
4. Dev server was restarted after adding content

---

**Last Updated:** 2025-12-28

**Questions?** Check [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) or [PAGE_DELETION_GUIDE.md](PAGE_DELETION_GUIDE.md) for more information.
