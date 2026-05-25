# Website Improvement Implementation Plan
## dennisjcarroll.com — Detailed Technical Recommendations

---

## Executive Summary

This document provides detailed, actionable implementation guidance for improving **dennisjcarroll.com** across SEO, content, UX, technical architecture, and accessibility. The site is built with **Gatsby + React + Tailwind CSS + Framer Motion** and scores well on performance (~263ms load time) and mobile responsiveness. These recommendations target the remaining gaps to maximize recruiter visibility, search discoverability, and professional credibility.

**Current Scorecard:**
| Category | Score |
|----------|-------|
| Content & Completeness | 7.5/10 |
| UX & Navigation | 9.0/10 |
| Technical & SEO | 8.0/10 |
| Accessibility | 7.5/10 |
| Mobile Responsiveness | 8.5/10 |

---

## Priority Matrix

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| **High** | Add H1 to homepage | SEO + Accessibility | Low |
| **High** | Add Skills/Tech Stack section | Job search visibility | Medium |
| **Medium** | Add Work Experience section | Professional credibility | Medium |
| **Medium** | Align stats numbers | Consistency/trust | Low |
| **Medium** | Add JSON-LD structured data (Person schema) | SEO discoverability | Low |
| **Low** | Fix `/apps-projects/` 404 redirect | URL consistency | Low |
| **Low** | Add alt text to Kings Blood character portraits | Accessibility | Low |

---

## TABLE OF CONTENTS

1. [HIGH PRIORITY: Add H1 to Homepage](#1-high-priority-add-h1-to-homepage)
2. [HIGH PRIORITY: Add Skills/Tech Stack Section](#2-high-priority-add-skillstech-stack-section)
3. [MEDIUM PRIORITY: Add Work Experience Section](#3-medium-priority-add-work-experience-section)
4. [MEDIUM PRIORITY: Align Stats Numbers](#4-medium-priority-align-stats-numbers)
5. [MEDIUM PRIORITY: Add JSON-LD Structured Data](#5-medium-priority-add-json-ld-structured-data)
6. [LOW PRIORITY: Fix /apps-projects/ 404](#6-low-priority-fix-apps-projects-404)
7. [LOW PRIORITY: Add Alt Text to Kings Blood Portraits](#7-low-priority-add-alt-text-to-kings-blood-portraits)

---

## 1. HIGH PRIORITY: Add H1 to Homepage

### Problem
Your name "Dennis J. Carroll" on the homepage is rendered as individual `<span>` elements for the letter-by-letter animation. There is no `<h1>` tag on the page, which is the single most important on-page SEO signal. Search engines and screen readers have no clear document title.

### Current Structure (Inferred)
```jsx
// Current - no H1 wrapper
<div className="hero-name">
  {'Dennis J. Carroll'.split('').map((char, i) => (
    <span key={i} className="animated-letter">{char}</span>
  ))}
</div>
```

### Solution: Wrap the Animated Name in `<h1>`

The animation can be fully preserved. Simply wrap the container in an `<h1>` tag:

```jsx
// Fix - wrap in h1, keep animation intact
<h1 className="hero-name">
  {'Dennis J. Carroll'.split('').map((char, i) => (
    <span key={i} className="animated-letter" aria-hidden="true">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))}
</h1>
```

### Gatsby/React Implementation Details

#### Option A: Minimal Change (Recommended)
If you're using Framer Motion for the letter animation, update the component:

```jsx
// src/components/HeroName.jsx (or similar)
import { motion } from 'framer-motion';

const HeroName = () => {
  const name = "Dennis J. Carroll";
  const letters = name.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.h1
      className="text-5xl md:text-7xl font-bold tracking-tight"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Dennis J. Carroll"
    >
      {letters.map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default HeroName;
```

#### Option B: Visually Hidden H1 (If Design Requires)
If the animated design absolutely cannot use `<h1>` as the visual element:

```jsx
<>
  {/* Visually hidden H1 for SEO/accessibility */}
  <h1 className="sr-only">Dennis J. Carroll</h1>

  {/* Visual animated name - purely decorative */}
  <div className="hero-name" aria-hidden="true">
    {'Dennis J. Carroll'.split('').map((char, i) => (
      <span key={i} className="animated-letter">{char}</span>
    ))}
  </div>
</>
```

Add this to your global CSS:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Accessibility Considerations
- **Option A** is preferred — the `<h1>` is visible and provides a proper document heading hierarchy
- Use `aria-label` on the `<h1>` to ensure screen readers announce the full name, not individual letters
- Set `aria-hidden="true"` on individual letter spans to prevent "D... e... n..." letter-by-letter reading
- Ensure the `<h1>` is the **only** h1 on the homepage (heading hierarchy rule)

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/index.jsx` (or `src/components/Hero.jsx`) | Wrap animated name in `<h1>` |
| `src/styles/global.css` | Add `.sr-only` utility if using Option B |

### Validation Checklist
- [ ] View page source — confirm `<h1>` appears in raw HTML (not just React DOM)
- [ ] Run Lighthouse audit — "Heading elements are not in a sequentially-descending order" should pass
- [ ] WAVE accessibility tool — no "Missing first-level heading" error
- [ ] Screen reader test (NVDA/VoiceOver) — announces "Dennis J. Carroll" as a unit

---

## 2. HIGH PRIORITY: Add Skills/Tech Stack Section

### Problem
The About page has a tech stack visual, but it only covers the **website's build stack** (React + Gatsby + Tailwind + Framer). There is no comprehensive skills grid listing Python, TensorFlow, PyTorch, SQL, Bayesian inference, etc. Recruiters scan for keyword hits — right now they must read bio paragraphs to find your technical skills.

### Recommended Approach: Multi-Category Skills Grid

Create a visually appealing, icon-rich skills section that organizes skills into logical categories.

### Placement Options

| Option | Location | Pros | Cons |
|--------|----------|------|------|
| **A** | About page (below bio) | Contextual, natural flow | Only on one page |
| **B** | Homepage (new section) | Maximum visibility | Adds scroll length |
| **C** | Both pages | Best of both | More maintenance |

**Recommendation: Option A (About page)** — Add a comprehensive "Skills & Technologies" section between the "By the Numbers" stats and the "My Journey" narrative.

### Proposed Structure

```
Skills & Technologies
|
+-- Programming Languages
|   +-- Python (primary)
|   +-- JavaScript / TypeScript
|   +-- SQL
|   +-- R
|
+-- Machine Learning & Deep Learning
|   +-- TensorFlow / TensorFlow.js
|   +-- PyTorch
|   +-- Scikit-learn
|   +-- XGBoost / LightGBM
|   +-- Mechanistic Interpretability
|
+-- Data Science & Analytics
|   +-- Bayesian Inference (PyMC)
|   +-- Pandas / NumPy
|   +-- Streamlit
|   +-- Jupyter
|   +-- Statistical Modeling
|
+-- Web Development
|   +-- React / Gatsby
|   +-- Tailwind CSS
|   +-- Three.js / WebGL
|   +-- HTML5 / CSS3
|
+-- Tools & Infrastructure
|   +-- Git / GitHub
|   +-- Docker
|   +-- AWS / Cloud
|   +-- Linux
```

### React Component Implementation

```jsx
// src/components/SkillsGrid.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Import or define SVG icons for each skill
// You can use: simple-icons, react-icons, or custom SVGs
import {
  SiPython, SiTensorflow, SiPytorch, SiReact, SiGatsby,
  SiTailwindcss, SiJavascript, SiGit, SiDocker, SiAwsamplify,
  SiSqlite, SiNumpy, SiPandas, SiJupyter, SiFramer,
  SiScikitlearn, SiLinux, SiHtml5, SiCss3, SiThreedotjs
} from 'react-icons/si';

const skillCategories = [
  {
    title: "Programming Languages",
    skills: [
      { name: "Python", icon: SiPython, level: "Expert" },
      { name: "JavaScript", icon: SiJavascript, level: "Advanced" },
      { name: "SQL", icon: SiSqlite, level: "Advanced" },
      { name: "HTML5", icon: SiHtml5, level: "Advanced" },
      { name: "CSS3", icon: SiCss3, level: "Advanced" },
    ]
  },
  {
    title: "Machine Learning & Deep Learning",
    skills: [
      { name: "TensorFlow", icon: SiTensorflow, level: "Advanced" },
      { name: "PyTorch", icon: SiPytorch, level: "Advanced" },
      { name: "TensorFlow.js", icon: SiTensorflow, level: "Advanced" },
      { name: "Scikit-learn", icon: SiScikitlearn, level: "Advanced" },
      { name: "Mechanistic Interpretability", icon: null, level: "Advanced", custom: true },
      { name: "Bayesian Inference", icon: null, level: "Expert", custom: true },
    ]
  },
  {
    title: "Data Science & Analytics",
    skills: [
      { name: "NumPy", icon: SiNumpy, level: "Expert" },
      { name: "Pandas", icon: SiPandas, level: "Expert" },
      { name: "Streamlit", icon: null, level: "Advanced", custom: true },
      { name: "Jupyter", icon: SiJupyter, level: "Advanced" },
      { name: "Statistical Modeling", icon: null, level: "Expert", custom: true },
    ]
  },
  {
    title: "Web Development",
    skills: [
      { name: "React", icon: SiReact, level: "Advanced" },
      { name: "Gatsby", icon: SiGatsby, level: "Advanced" },
      { name: "Tailwind CSS", icon: SiTailwindcss, level: "Advanced" },
      { name: "Framer Motion", icon: SiFramer, level: "Advanced" },
      { name: "Three.js", icon: SiThreedotjs, level: "Advanced" },
    ]
  },
  {
    title: "Tools & Infrastructure",
    skills: [
      { name: "Git", icon: SiGit, level: "Advanced" },
      { name: "Docker", icon: SiDocker, level: "Intermediate" },
      { name: "AWS", icon: SiAwsamplify, level: "Intermediate" },
      { name: "Linux", icon: SiLinux, level: "Intermediate" },
    ]
  }
];

const SkillCard = ({ skill, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="flex items-center gap-3 px-4 py-3 rounded-lg 
               bg-white/5 dark:bg-gray-800/50 
               border border-gray-200 dark:border-gray-700
               hover:border-blue-500 dark:hover:border-blue-400
               hover:bg-white/10 dark:hover:bg-gray-700/50
               transition-all duration-200 group"
  >
    {skill.icon ? (
      <skill.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 
                             group-hover:text-blue-500 transition-colors" />
    ) : skill.custom ? (
      <span className="w-6 h-6 flex items-center justify-center 
                       text-xs font-bold text-gray-500 dark:text-gray-400
                       bg-gray-200 dark:bg-gray-700 rounded">
        {skill.name.charAt(0)}
      </span>
    ) : null}
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {skill.name}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-500">
        {skill.level}
      </span>
    </div>
  </motion.div>
);

const SkillsGrid = () => {
  return (
    <section id="skills" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Skills & Technologies
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive toolkit spanning data science, machine learning,
            and full-stack web development.
          </p>
        </motion.div>

        <div className="space-y-10">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 
                             flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {category.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {category.skills.map((skill, skillIndex) => (
                  <SkillCard
                    key={skill.name}
                    skill={skill}
                    index={skillIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsGrid;
```

### Icon Sources

| Source | Installation | Notes |
|--------|-------------|-------|
| **react-icons** (recommended) | `npm install react-icons` | Includes Simple Icons, Font Awesome, Devicons — one import |
| **simple-icons** (SVG) | Download from simpleicons.org | Direct SVG control, no dependency |
| **Custom SVG** | Manual | Full control, matches your design language |

For icons not in standard libraries (e.g., "Bayesian Inference", "Streamlit", "Mechanistic Interpretability"):
- Use a styled initial letter badge
- Create a custom SVG icon
- Use a generic "code" or "brain" icon as a visual placeholder

### Integration into About Page

```jsx
// In src/pages/about.jsx (or similar)
import SkillsGrid from '../components/SkillsGrid';

// Add between stats section and "My Journey" section:
<StatsSection />
<SkillsGrid />  {/* NEW */}
<MyJourneySection />
```

### Alternative: Compact "Tag Cloud" Style

If the full grid feels too heavy, use a compact tag-based layout:

```jsx
const SkillsTags = () => (
  <section className="py-12">
    <h2 className="text-2xl font-bold mb-6">Core Technologies</h2>
    <div className="flex flex-wrap gap-2">
      {[
        "Python", "TensorFlow", "PyTorch", "SQL", "Bayesian Inference",
        "React", "Gatsby", "Tailwind CSS", "Framer Motion", "Three.js",
        "Pandas", "NumPy", "Streamlit", "TensorFlow.js", "Git",
        "Mechanistic Interpretability", "Docker", "AWS", "JavaScript", "Scikit-learn"
      ].map(skill => (
        <span
          key={skill}
          className="px-3 py-1.5 text-sm rounded-full
                     bg-blue-50 dark:bg-blue-900/30
                     text-blue-700 dark:text-blue-300
                     border border-blue-200 dark:border-blue-800
                     hover:bg-blue-100 dark:hover:bg-blue-800/50
                     transition-colors"
        >
          {skill}
        </span>
      ))}
    </div>
  </section>
);
```

### Files to Create/Modify
| Action | File |
|--------|------|
| **Create** | `src/components/SkillsGrid.jsx` |
| **Create** | `src/data/skills.js` (optional: externalize skill data) |
| **Modify** | `src/pages/about.jsx` — import and insert `<SkillsGrid />` |
| **Install** | `npm install react-icons` (if not already installed) |

### Validation Checklist
- [ ] All 20+ skills render correctly with icons
- [ ] Dark mode theme compatibility
- [ ] Mobile responsive (2-5 columns based on breakpoint)
- [ ] Framer Motion animations trigger on scroll
- [ ] Keyword scan: "Python", "TensorFlow", "PyTorch", "Bayesian" visible in page source

---

## 3. MEDIUM PRIORITY: Add Work Experience Section

### Problem
There is no Work Experience section. While projects demonstrate capability, employers and recruiters also look for **professional history** — company names, titles, dates, and brief responsibilities. This adds credibility and shows reliability.

### Recommended Approach: Compact Timeline

Even 2-3 entries with 2-3 lines each significantly improves professional credibility.

### Section Design: Timeline Layout

```
Work Experience
|
+-- [Role Title]
|   [Company Name] | [Location/Remote]
|   [Start Date] - [End Date]
|   - Brief responsibility or achievement
|   - Key technology or outcome
|
+-- [Role Title]
|   [Company Name] | [Location/Remote]
|   [Start Date] - [Present]
|   - Brief responsibility or achievement
```

### React Component Implementation

```jsx
// src/components/ExperienceTimeline.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar } from 'react-icons/fi'; // or react-icons/lu

const experiences = [
  {
    title: "Data Scientist / ML Engineer",
    company: "[Your Company or Freelance]",
    location: "Remote",
    startDate: "2021",
    endDate: "Present",
    current: true,
    responsibilities: [
      "Designed and deployed 24+ interactive web-based ML visualization tools using TensorFlow.js, Three.js, and React",
      "Built enterprise-grade Bayesian analytics dashboards with PyMC and Streamlit for market analysis",
      "Developed research-grade mechanistic interpretability tools for transformer model analysis"
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "React", "Bayesian Inference"]
  },
  {
    title: "[Previous Role Title]",
    company: "[Previous Company]",
    location: "[Location]",
    startDate: "[Start]",
    endDate: "[End]",
    current: false,
    responsibilities: [
      "[Key responsibility or achievement]",
      "[Technology or outcome focus]"
    ],
    technologies: ["[Tech1]", "[Tech2]"]
  }
];

const ExperienceTimeline = () => {
  return (
    <section id="experience" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Work Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Professional history in data science, machine learning, and software development.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 
                          bg-gray-200 dark:bg-gray-700 md:-translate-x-px"></div>

          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative flex items-start mb-12 
                          ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full 
                              bg-blue-500 border-4 border-white dark:border-gray-900
                              md:-translate-x-2 mt-1.5 z-10"></div>

              {/* Content card */}
              <div className={`ml-12 md:ml-0 md:w-5/12 
                               ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 
                                border border-gray-200 dark:border-gray-700
                                shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 
                                      text-sm mt-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{exp.company}</span>
                      </div>
                    </div>
                    {exp.current && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full
                                       bg-green-100 text-green-700 dark:bg-green-900/30 
                                       dark:text-green-400">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 
                                  dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>

                  {/* Responsibilities */}
                  <ul className="space-y-2 mb-4">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 
                                             flex items-start gap-2">
                        <span className="text-blue-500 mt-1.5">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs rounded-md
                                   bg-gray-100 dark:bg-gray-700
                                   text-gray-600 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceTimeline;
```

### Placement

Add the Experience section to the **About page**, between the new Skills section and the "My Journey" section:

```
By the Numbers (stats)
Skills & Technologies (new)
Work Experience (new) ← HERE
My Journey / The Mission
Currently Exploring
About This Website
```

### Content Guidelines

| Element | Best Practice |
|---------|--------------|
| **Job titles** | Use industry-standard titles ("ML Engineer", "Data Scientist") |
| **Companies** | Include even if freelance/contract — note "Freelance" or "Independent" |
| **Dates** | Use "YYYY - YYYY" format; "Present" for current role |
| **Responsibilities** | Lead with outcomes/impact, not just tasks |
| **Technologies** | List 5-7 most relevant skills per role |

### Files to Create/Modify
| Action | File |
|--------|------|
| **Create** | `src/components/ExperienceTimeline.jsx` |
| **Create** | `src/data/experience.js` (externalize experience data) |
| **Modify** | `src/pages/about.jsx` — insert `<ExperienceTimeline />` after SkillsGrid |

### Validation Checklist
- [ ] Timeline renders correctly on mobile (single column, left-aligned)
- [ ] Timeline alternates sides on desktop (MD breakpoint+)
- [ ] "Current" badge visible on present role
- [ ] All dates display correctly
- [ ] Technology tags are clickable/hoverable (optional enhancement)

---

## 4. MEDIUM PRIORITY: Align Stats Numbers

### Problem
The About page bio states **"24+ standalone web applications"** while the "By the Numbers" stats show **"15+ Projects Completed"**. This inconsistency can confuse visitors and reduce trust.

### Current Stats (About Page)
| Stat | Current Value | Location |
|------|--------------|----------|
| Projects Completed | 15+ | Stats grid |
| Years Experience | 5+ | Stats grid |
| Technologies | 10+ | Stats grid |
| Interactive Apps Built | 24+ | Stats grid |

### Bio Statement
> "Over the past 5 years, I've created **24+ standalone web applications**..."

### Options for Resolution

| Option | Approach | Rationale |
|--------|----------|-----------|
| **A (Recommended)** | Change "15+ Projects Completed" to "25+ Projects Completed" | Aligns with bio; "projects" encompasses apps + other work |
| B | Change bio to "15+ projects" | Undercounts the apps; weakens the bio |
| C | Add clarifying subtitle | "15+ Major Projects / 24+ Interactive Apps Built" |
| D | Keep both but clarify distinction | Separate "Projects" (major) from "Apps" (interactive demos) |

### Recommended Fix: Option A + Clarification

Update the stats to be consistent and add descriptive context:

```jsx
const stats = [
  {
    value: "25+",
    label: "Projects Completed",
    sublabel: "Including 24+ interactive web apps"
  },
  {
    value: "5+",
    label: "Years Experience",
    sublabel: "In data science & ML engineering"
  },
  {
    value: "20+",
    label: "Technologies",
    sublabel: "Python, TensorFlow, PyTorch, React, etc."
  },
  {
    value: "24+",
    label: "Interactive Apps Built",
    sublabel: "Browser-based, no install required"
  }
];
```

### Quick Component Update

```jsx
// In your StatsSection component
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {stats.map((stat, index) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 
                 border border-gray-200 dark:border-gray-700"
    >
      <div className="text-4xl md:text-5xl font-bold text-blue-600 
                      dark:text-blue-400 mb-1">
        {stat.value}
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white 
                      uppercase tracking-wide">
        {stat.label}
      </div>
      {stat.sublabel && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {stat.sublabel}
        </div>
      )}
    </motion.div>
  ))}
</div>
```

### Files to Modify
| File | Change |
|------|--------|
| `src/components/StatsSection.jsx` (or inline in About page) | Update stat values and add sublabels |
| `src/pages/about.jsx` | Verify bio text matches updated stats |

### Validation Checklist
- [ ] "25+" or "24+" used consistently across bio and stats
- [ ] No contradictory numbers remain on the page
- [ ] Sublabels render correctly on mobile

---

## 5. MEDIUM PRIORITY: Add JSON-LD Structured Data

### Problem
No structured data is present on the site. Adding JSON-LD `Person` schema helps search engines understand who you are, improving rich snippet eligibility, Google Knowledge Panel appearance, and discoverability when people search your name.

### Schema Type: Person

The `Person` schema is ideal for a personal portfolio. It tells search engines:
- Your name, job title, and expertise
- Links to social profiles (GitHub, LinkedIn, X)
- Your website URL
- Your bio/description

### JSON-LD Implementation

Add this to the `<head>` of all major pages (Home, About):

```html
<!-- In your Gatsby layout or page components -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dennis J. Carroll",
  "alternateName": "Dennis Carroll",
  "url": "https://dennisjcarroll.com",
  "image": "https://dennisjcarroll.com/og-image.jpg",
  "jobTitle": "Data Scientist & Machine Learning Engineer",
  "description": "Interactive ML Tools, Bayesian Analytics, Creative Fiction. Building interactive tools that make complex ideas intuitive.",
  "sameAs": [
    "https://github.com/Dennis-J-Carroll",
    "https://www.linkedin.com/in/dennisjcarroll/",
    "https://x.com/denniscarrollj"
  ],
  "knowsAbout": [
    "Data Science",
    "Machine Learning",
    "Deep Learning",
    "Bayesian Inference",
    "Mechanistic Interpretability",
    "TensorFlow",
    "PyTorch",
    "Python",
    "React",
    "Interactive Data Visualization"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "Independent / Freelance"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://dennisjcarroll.com"
  }
}
</script>
```

### Gatsby Implementation: gatsby-plugin-schema-snapshot or Manual

#### Option A: Using react-helmet (Most Common in Gatsby)

```jsx
// src/components/Seo.jsx (or in your layout)
import React from 'react';
import { Helmet } from 'react-helmet';

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dennis J. Carroll",
  "url": "https://dennisjcarroll.com",
  "image": "https://dennisjcarroll.com/og-image.jpg",
  "jobTitle": "Data Scientist & Machine Learning Engineer",
  "description": "Interactive ML Tools, Bayesian Analytics, Creative Fiction...",
  "sameAs": [
    "https://github.com/Dennis-J-Carroll",
    "https://www.linkedin.com/in/dennisjcarroll/",
    "https://x.com/denniscarrollj"
  ],
  "knowsAbout": [
    "Data Science",
    "Machine Learning",
    "Deep Learning",
    "Bayesian Inference",
    "TensorFlow",
    "PyTorch",
    "Python",
    "React"
  ]
};

const Seo = ({ title, description, pathname }) => {
  const canonical = `https://dennisjcarroll.com${pathname || ''}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph (existing — keep this) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />

      {/* NEW: JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
    </Helmet>
  );
};

export default Seo;
```

#### Option B: Page-Specific Schema

For the Apps page, also add `SoftwareApplication` schema for featured projects:

```jsx
// On Apps page — add alongside Person schema
const appSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "SoftwareApplication",
      "name": "Hypersphere Explorer",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Any",
      "url": "https://dennisjcarroll.com/apps/sphere_cylinder_hypersphere.html",
      "description": "Three.js visualization of spheres, cylinders, and 4D hyperspheres",
      "author": {
        "@type": "Person",
        "name": "Dennis J. Carroll"
      }
    },
    // ... more apps
  ]
};
```

### Bonus: Add Meta Keywords Tag

While less impactful today, the recommendations note the absence of `<meta name="keywords">`:

```jsx
<Helmet>
  <meta name="keywords" content="Dennis Carroll, data scientist, machine learning engineer, Python, TensorFlow, PyTorch, Bayesian inference, deep learning, interactive visualization, React, Gatsby, portfolio" />
</Helmet>
```

### Files to Modify
| File | Change |
|------|--------|
| `src/components/Seo.jsx` | Add JSON-LD `<script>` tag |
| `src/pages/index.jsx` | Ensure `<Seo />` component is rendered |
| `src/pages/about.jsx` | Ensure `<Seo />` component is rendered |

### Validation Checklist
- [ ] Google Rich Results Test: [search.google.com/test/rich-results](https://search.google.com/test/rich-results) — paste your URL, confirm "Person" schema detected
- [ ] Schema.org Validator: [validator.schema.org](https://validator.schema.org) — no errors or warnings
- [ ] View page source — confirm `<script type="application/ld+json">` appears in `<head>`

---

## 6. LOW PRIORITY: Fix /apps-projects/ 404

### Problem
The URL `/apps-projects/` returns a 404 error. The actual page lives at `/apps/`. While internal links are correct, direct URL entry or external bookmarks may use the wrong path.

### Solution: Gatsby Redirect

#### Option A: gatsby-plugin-client-side-redirect (Recommended)

```bash
npm install gatsby-plugin-client-side-redirect
```

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-client-side-redirect',
      options: {
        redirects: [
          {
            fromPath: '/apps-projects',
            toPath: '/apps',
            isPermanent: true, // 301 redirect
          },
          {
            fromPath: '/apps-projects/*',
            toPath: '/apps/*',
            isPermanent: true,
          },
        ],
      },
    },
  ],
};
```

#### Option B: CreateRedirect API (Gatsby Node)

```js
// gatsby-node.js
exports.createPages = ({ actions }) => {
  const { createRedirect } = actions;

  createRedirect({
    fromPath: '/apps-projects',
    toPath: '/apps',
    isPermanent: true,
    redirectInBrowser: true,
  });

  createRedirect({
    fromPath: '/apps-projects/*',
    toPath: '/apps/*',
    isPermanent: true,
    redirectInBrowser: true,
  });
};
```

#### Option C: Netlify/_redirects (If Hosting on Netlify)

If deployed on Netlify, add a `_redirects` file to your `static/` folder:

```
# static/_redirects
/apps-projects  /apps  301
/apps-projects/*  /apps/:splat  301
```

Or in `netlify.toml`:
```toml
[[redirects]]
  from = "/apps-projects"
  to = "/apps"
  status = 301

[[redirects]]
  from = "/apps-projects/*"
  to = "/apps/:splat"
  status = 301
```

### Files to Create/Modify
| Action | File |
|--------|------|
| **Choose one approach** | A: `gatsby-config.js` / B: `gatsby-node.js` / C: `static/_redirects` |
| **Install** (if Option A) | `npm install gatsby-plugin-client-side-redirect` |

### Validation Checklist
- [ ] Visit `https://dennisjcarroll.com/apps-projects/` — should redirect to `/apps/`
- [ ] Check network tab — response should be 301 (permanent redirect)
- [ ] Test with trailing slash variations: `/apps-projects`, `/apps-projects/`

---

## 7. LOW PRIORITY: Add Alt Text to Kings Blood Character Portraits

### Problem
The Kings Blood page (`/kings-blood.html`) contains character portraits (Maviic Akkar, Lathios, Creedies "The Bull") that likely lack descriptive `alt` text, reducing accessibility for screen reader users.

### Current Page Structure
The Kings Blood page has:
- Character portraits with names: "Maviic Akkar", "Lathios", "Creedies 'The Bull'"
- Subtitles: "The She-Wolf", "Military genius", "The Usurper"
- Descriptive taglines for each

### Implementation

Ensure all `<img>` tags for characters have descriptive alt text:

```html
<!-- BEFORE (problematic) -->
<img src="/images/characters/maviic-akkar.jpg" />

<!-- AFTER (accessible) -->
<img
  src="/images/characters/maviic-akkar.jpg"
  alt="Portrait of Maviic Akkar, called 'The She-Wolf', wearing the Alpha's pelt by right. Character from Kings Blood: A Chronicle of Lyos."
/>
```

### Character Alt Text Suggestions

| Character | Alt Text |
|-----------|----------|
| **Maviic Akkar** | `Portrait of Maviic Akkar, "The She-Wolf" of House Akkarii, who wears the Alpha's pelt by right. A character from Kings Blood: A Chronicle of Lyos.` |
| **Lathios** | `Portrait of Lathios of Jandell Command, a military genius of freed lineage who earned every banner he carries. A character from Kings Blood: A Chronicle of Lyos.` |
| **Creedies "The Bull"** | `Portrait of Creedies "The Bull" of House Hjar, the Usurper who has sat twenty years on a throne carved from another's bones. A character from Kings Blood: A Chronicle of Lyos.` |

### Implementation Notes

Since the Kings Blood page appears to be a standalone HTML file (not React), simply update the `<img>` tags directly:

```html
<!-- In kings-blood.html — update each character portrait -->
<div class="character-card">
  <img
    src="images/maviic-akkar.jpg"
    alt="Portrait of Maviic Akkar, 'The She-Wolf' of House Akkarii, who wears the Alpha's pelt by right. A character from Kings Blood: A Chronicle of Lyos."
    loading="lazy"
    width="400"
    height="500"
  />
  <h3>Maviic Akkar</h3>
  <p>"The She-Wolf" — wears the Alpha's pelt by right</p>
</div>
```

### Additional Accessibility Enhancements

```html
<!-- Wrap character cards in a list for screen reader context -->
<ul class="characters-grid" role="list">
  <li class="character-card">
    <article aria-labelledby="char-maviic">
      <img ... alt="..." />
      <h3 id="char-maviic">Maviic Akkar</h3>
      <p>...</p>
    </article>
  </li>
  <!-- ... -->
</ul>
```

### Files to Modify
| File | Change |
|------|--------|
| `/kings-blood.html` | Add `alt` text to all character portrait `<img>` tags |

### Validation Checklist
- [ ] WAVE accessibility tool — no "Missing alternative text" errors on Kings Blood page
- [ ] Screen reader (NVDA/VoiceOver) — character portraits announced with context
- [ ] `loading="lazy"` added for performance (if not present)

---

## Implementation Order

### Phase 1: Quick Wins (1-2 hours)
1. **Fix stats numbers** (#4) — edit a few lines
2. **Add H1 to homepage** (#1) — wrap existing element
3. **Add meta keywords** (#5) — one line in SEO component
4. **Add alt text to Kings Blood** (#7) — edit HTML file

### Phase 2: Content Sections (2-4 hours)
5. **Add JSON-LD structured data** (#5) — add to SEO component
6. **Add Skills/Tech Stack section** (#2) — new component + icons
7. **Add Work Experience section** (#3) — new component + data

### Phase 3: Infrastructure (30 min)
8. **Fix /apps-projects/ redirect** (#6) — config change

---

## Dependencies to Install

```bash
# For icons (if not already installed)
npm install react-icons

# For client-side redirects (Option A for #6)
npm install gatsby-plugin-client-side-redirect

# For Framer Motion animations (likely already installed)
npm install framer-motion
```

---

## Testing & Validation Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Google Lighthouse | Chrome DevTools | Performance, Accessibility, SEO, Best Practices |
| Google Rich Results Test | search.google.com/test/rich-results | Validate JSON-LD schema |
| Schema.org Validator | validator.schema.org | Structured data validation |
| WAVE | wave.webaim.org | Accessibility audit |
| PageSpeed Insights | pagespeed.web.dev | Performance + SEO scoring |
| W3C HTML Validator | validator.w3.org | Markup validation |

---

## Files Summary

### New Files
| File | Description |
|------|-------------|
| `src/components/SkillsGrid.jsx` | Skills/tech stack grid component |
| `src/components/ExperienceTimeline.jsx` | Work experience timeline component |
| `src/data/skills.js` | (Optional) Externalized skills data |
| `src/data/experience.js` | (Optional) Externalized experience data |
| `static/_redirects` | (If using Netlify) URL redirects |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/index.jsx` | Wrap hero name in `<h1>` |
| `src/pages/about.jsx` | Insert `<SkillsGrid />` and `<ExperienceTimeline />` |
| `src/components/Seo.jsx` | Add JSON-LD script + meta keywords |
| `src/components/StatsSection.jsx` | Update stat values |
| `gatsby-config.js` | (Optional) Add redirect plugin |
| `gatsby-node.js` | (Optional) Add createRedirect calls |
| `kings-blood.html` | Add alt text to character portraits |
| `src/styles/global.css` | (If Option B for H1) Add `.sr-only` class |

---

## Expected Impact

After implementing all recommendations, expect:

| Metric | Current | Expected |
|--------|---------|----------|
| SEO Score (Lighthouse) | ~80 | ~95+ |
| Accessibility Score | ~75 | ~90+ |
| Rich Snippets | None | Person schema eligible |
| Recruiter Keyword Scan | Poor (buried in paragraphs) | Excellent (dedicated grid) |
| Professional Credibility | Good (projects only) | Strong (projects + experience) |
| Data Consistency | Conflicting (15 vs 24) | Aligned |

---

*Document generated for dennisjcarroll.com improvement planning.*
*Last updated: 2026-05-25*
