import React from "react";
import { motion } from "framer-motion";

// Inline SVGs for key technologies — matches the site's existing SVG-component pattern
const PythonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 6 4.463 6 4.463v2.137h6.08v.64H4.309S2 6.946 2 12.5s2.761 5.42 2.761 5.42H6.08v-2.61s-.067-2.76 2.72-2.76h5.2s2.64.043 2.64-2.555V5.555S17.04 2 12 2zm-1.44 1.92a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16z"/>
    <path d="M12 22c5.523 0 6-2.463 6-2.463v-2.137H11.92v-.64h7.771S22 17.054 22 11.5s-2.761-5.42-2.761-5.42H17.92v2.61s.067 2.76-2.72 2.76h-5.2S7.36 11.493 7.36 14.091v4.44S7.96 22 12 22zm1.44-1.92a1.08 1.08 0 1 1 0-2.16 1.08 1.08 0 0 1 0 2.16z"/>
  </svg>
);

const JSIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#c0c020" opacity="0.15" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <text x="5.5" y="17" fontSize="11" fontWeight="bold" fill="currentColor" fontFamily="monospace">JS</text>
  </svg>
);

const ReactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    <ellipse cx="12" cy="12" rx="10" ry="4"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
  </svg>
);

const GitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="18" cy="6" r="2.5"/>
    <circle cx="6" cy="6" r="2.5"/>
    <circle cx="6" cy="18" r="2.5"/>
    <path d="M18 8.5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3"/>
    <line x1="6" y1="8.5" x2="6" y2="15.5"/>
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.49-4.13A2.5 2.5 0 0 1 4 12a2.5 2.5 0 0 1 1.55-2.31A2.5 2.5 0 0 1 7.5 5.4 2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.49-4.13A2.5 2.5 0 0 0 20 12a2.5 2.5 0 0 0-1.55-2.31A2.5 2.5 0 0 0 16.5 5.4 2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const DataIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const WebIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ToolsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

// Letter badge for skills without an icon
const LetterBadge = ({ letter, color = "var(--primary-color)" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      borderRadius: 4,
      fontSize: "0.65rem",
      fontWeight: 700,
      fontFamily: "monospace",
      color,
      border: `1px solid ${color}`,
      opacity: 0.8,
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    {letter}
  </span>
);

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <DataIcon />,
    skills: [
      { name: "Python", icon: <PythonIcon /> },
      { name: "JavaScript", icon: <JSIcon /> },
      { name: "TypeScript", icon: <LetterBadge letter="TS" /> },
      { name: "SQL", icon: <LetterBadge letter="DB" /> },
      { name: "R", icon: <LetterBadge letter="R" /> },
    ],
  },
  {
    title: "Machine Learning & Deep Learning",
    icon: <BrainIcon />,
    skills: [
      { name: "TensorFlow", icon: <LetterBadge letter="TF" /> },
      { name: "PyTorch", icon: <LetterBadge letter="PT" /> },
      { name: "TensorFlow.js", icon: <LetterBadge letter="TF" /> },
      { name: "Scikit-learn", icon: <LetterBadge letter="SK" /> },
      { name: "Bayesian Inference", icon: <LetterBadge letter="Bₐ" /> },
      { name: "Mech. Interpretability", icon: <LetterBadge letter="MI" /> },
    ],
  },
  {
    title: "Data Science & Analytics",
    icon: <DataIcon />,
    skills: [
      { name: "NumPy", icon: <LetterBadge letter="NP" /> },
      { name: "Pandas", icon: <LetterBadge letter="PD" /> },
      { name: "PyMC", icon: <LetterBadge letter="MC" /> },
      { name: "Streamlit", icon: <LetterBadge letter="ST" /> },
      { name: "Jupyter", icon: <LetterBadge letter="Jᵤ" /> },
      { name: "Statistical Modeling", icon: <LetterBadge letter="Σ" /> },
    ],
  },
  {
    title: "Web Development",
    icon: <WebIcon />,
    skills: [
      { name: "React", icon: <ReactIcon /> },
      { name: "Gatsby", icon: <LetterBadge letter="G" /> },
      { name: "Tailwind CSS", icon: <LetterBadge letter="TW" /> },
      { name: "Three.js", icon: <LetterBadge letter="3J" /> },
      { name: "Framer Motion", icon: <LetterBadge letter="FM" /> },
      { name: "HTML5 / CSS3", icon: <WebIcon /> },
    ],
  },
  {
    title: "Tools & Infrastructure",
    icon: <ToolsIcon />,
    skills: [
      { name: "Git / GitHub", icon: <GitIcon /> },
      { name: "Docker", icon: <LetterBadge letter="DK" /> },
      { name: "AWS / Cloud", icon: <LetterBadge letter="☁" /> },
      { name: "Linux", icon: <LetterBadge letter="⌥" /> },
    ],
  },
];

const SkillTag = ({ skill, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.45rem 0.75rem",
      borderRadius: "8px",
      background: "var(--tag-bg, rgba(0,0,0,0.35))",
      border: "1px solid var(--tag-border, rgba(0,188,212,0.12))",
      transition: "border-color 0.2s ease, background 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--tag-border-hover, rgba(0,188,212,0.4))";
      e.currentTarget.style.background = "var(--tag-bg-hover, rgba(0,188,212,0.06))";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--tag-border, rgba(0,188,212,0.12))";
      e.currentTarget.style.background = "var(--tag-bg, rgba(0,0,0,0.35))";
    }}
  >
    <span style={{ color: "var(--primary-color)", flexShrink: 0 }}>{skill.icon}</span>
    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
      {skill.name}
    </span>
  </motion.div>
);

const SkillsGrid = () => {
  return (
    <section id="skills" aria-labelledby="skills-heading" style={{ padding: "3rem 0" }}>
      <motion.h2
        id="skills-heading"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Skills &amp; Technologies
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        {skillCategories.map((category, catIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIndex * 0.08, duration: 0.4 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ color: "var(--primary-color)", opacity: 0.7 }}>{category.icon}</span>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {category.title}
              </h3>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              {category.skills.map((skill, skillIndex) => (
                <SkillTag key={skill.name} skill={skill} index={skillIndex} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SkillsGrid;
