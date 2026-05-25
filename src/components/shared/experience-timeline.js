import React from "react";
import { motion } from "framer-motion";

// Icon components — minimal, consistent with site style
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12.01"/>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const experiences = [
  {
    title: "Independent Software Developer & Data Scientist",
    company: "Self-Directed",
    location: "Remote",
    startDate: "2019",
    endDate: "Present",
    current: true,
    icon: <CodeIcon />,
    responsibilities: [
      "Built 24+ browser-based interactive applications — neural network visualizers, Bayesian analytics dashboards, mechanistic interpretability tools, generative audio/visual systems — all running in the browser with no install required.",
      "Designed and implemented ML pipelines in Python using TensorFlow, PyTorch, Scikit-learn, and PyMC; deployed interactive frontends with React, Gatsby, Three.js, and TensorFlow.js.",
      "Authored research-level interpretability tooling for transformer model analysis, including an attention-head visualizer and a structured annotation system for MLP blocks.",
      "Wrote and self-published three original fictional universes — a post-humanity sci-fi saga, a space opera, and a secondary-world fantasy — developed in parallel with technical work.",
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "React", "Three.js", "Bayesian Inference", "Gatsby"],
  },
  {
    title: "Doorman / Building Security",
    company: "Residential Building",
    location: "New York, NY",
    startDate: "2018",
    endDate: "Present",
    current: true,
    icon: <BriefcaseIcon />,
    responsibilities: [
      "Primary point of contact and access control for a high-occupancy residential building — trusted with building security, resident communication, and emergency response.",
      "Managed relationships with residents, management, vendors, and emergency services; developed strong judgment under pressure in a high-visibility, low-error-tolerance role.",
      "Applied communications degree background daily: de-escalation, conflict resolution, clear documentation, and coordination with building staff.",
    ],
    technologies: ["Security Protocols", "Communication", "Conflict Resolution", "Emergency Response"],
  },
  {
    title: "Construction & Site Work",
    company: "Various Projects",
    location: "New York Area",
    startDate: "2015",
    endDate: "2019",
    current: false,
    icon: <BriefcaseIcon />,
    responsibilities: [
      "Performed skilled labor across multiple construction sites — developed strong work ethic, spatial reasoning, and understanding of project sequencing under tight deadlines.",
      "Collaborated with crews on-site, reading plans and coordinating tasks; skills in logistics and structured problem-solving carried directly into software project work.",
    ],
    technologies: ["Project Coordination", "Site Safety", "Team Collaboration"],
  },
];

const ExperienceTimeline = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="experience" aria-labelledby="experience-heading" style={{ padding: "3rem 0" }}>
      <motion.h2
        id="experience-heading"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Experience
      </motion.h2>

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
        {/* Vertical line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "1.25rem",
            top: 0,
            bottom: 0,
            width: "1px",
            background: "linear-gradient(to bottom, var(--primary-color), transparent)",
            opacity: 0.25,
          }}
        />

        {experiences.map((exp, index) => (
          <motion.div
            key={exp.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={itemVariants}
            transition={{ delay: index * 0.1 }}
            style={{
              display: "flex",
              gap: "1.5rem",
              marginBottom: "2.5rem",
              paddingLeft: "0.5rem",
            }}
          >
            {/* Timeline dot + icon */}
            <div
              style={{
                flexShrink: 0,
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                border: `1px solid ${exp.current ? "var(--primary-color)" : "rgba(120,180,255,0.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: exp.current ? "var(--primary-color)" : "var(--text-secondary)",
                zIndex: 1,
              }}
              aria-hidden="true"
            >
              {exp.icon}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(0,188,212,0.1)",
                borderRadius: "12px",
                padding: "1.25rem 1.5rem",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,188,212,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,188,212,0.1)"; }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {exp.title}
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--primary-color)", fontWeight: 500 }}>
                    {exp.company}
                  </span>
                </div>
                {exp.current && (
                  <span style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#10b981",
                    whiteSpace: "nowrap",
                  }}>
                    Current
                  </span>
                )}
              </div>

              {/* Meta */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.9rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-secondary)", opacity: 0.75 }}>
                  <MapPinIcon /> {exp.location}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-secondary)", opacity: 0.75 }}>
                  <CalIcon /> {exp.startDate} – {exp.endDate}
                </span>
              </div>

              {/* Responsibilities */}
              <ul style={{ margin: 0, padding: 0, listStyle: "none", marginBottom: "0.9rem" }}>
                {exp.responsibilities.map((r, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.45rem", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--primary-color)", opacity: 0.7, marginTop: "0.35rem", flexShrink: 0 }}>▸</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{r}</span>
                  </li>
                ))}
              </ul>

              {/* Tech tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {exp.technologies.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      background: "rgba(0,188,212,0.07)",
                      border: "1px solid rgba(0,188,212,0.15)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceTimeline;
