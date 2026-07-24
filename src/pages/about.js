import React from "react"
import { Link } from "gatsby"
import { motion } from "framer-motion"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import StatsCounter from "../components/shared/stats-counter"
import SkillsGrid from "../components/shared/skills-grid"
import ExperienceTimeline from "../components/shared/experience-timeline"
import "../styles/about.css"

// Minimalist SVG Icons (gray fill with black outline style)
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
    <path d="M20 12a8 8 0 1 0-16 0"></path>
    <path d="M2 12h10"></path>
    <path d="M12 2v10"></path>
  </svg>
)

// Tech Stack Icons - Minimalist style
const ReactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c0c0c0" stroke="#333" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" transform="rotate(120 12 12)" />
  </svg>
)

const GatsbyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c0c0c0" stroke="#333" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" fill="none" />
    <path d="M2 12 L12 22 L12 12 L2 12" fill="#c0c0c0" />
    <path d="M12 2 L22 12 L12 12 L12 2" fill="none" />
  </svg>
)

const TailwindIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c0c0c0" stroke="#333" strokeWidth="1.5">
    <path d="M12 6C9 6 7.5 7.5 7 10.5C8 9 9.5 8.5 11 9C12 9.5 12.5 10.5 14 11C16 11.5 18 10 19 7.5C18 9 16.5 9.5 15 9C14 8.5 13.5 7.5 12 6Z" />
    <path d="M7 12C4 12 2.5 13.5 2 16.5C3 15 4.5 14.5 6 15C7 15.5 7.5 16.5 9 17C11 17.5 13 16 14 13.5C13 15 11.5 15.5 10 15C9 14.5 8.5 13.5 7 12Z" />
  </svg>
)

const MotionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c0c0c0" stroke="#333" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" fill="none" />
    <path d="M8 8 L16 12 L8 16 Z" />
  </svg>
)


const AboutPage = ({ location }) => {
  // Stats data
  const stats = [
    { value: 26, suffix: "", label: "Interactive Apps in the Browser", icon: null },
    { value: 5, suffix: "+", label: "Years Building", icon: null },
    { value: 3, suffix: "", label: "Original Fictional Universes", icon: null },
    { value: 317, suffix: "", label: "Tests Passing in GLASSPORT", icon: null }
  ]



  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <Layout location={location}>
      <div className="about-page">
        {/* Hero Section */}
        <motion.section
          className="about-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="about-hero-content">
            <motion.div
              className="hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span>Hello, I'm</span>
            </motion.div>

            <motion.h1
              className="about-title gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Dennis J. Carroll
            </motion.h1>

            <motion.p
              className="about-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Interactive ML Tools • Bayesian Analytics • Creative Fiction
            </motion.p>

            <motion.div
              className="about-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p>
                I build interactive tools that make complex ideas intuitive. Over the past 5 years,
                I've created 26+ standalone web applications spanning neural network visualizations,
                Bayesian analytics dashboards, real-time ML training environments, and mathematical
                exploration tools — all designed to run in the browser.
              </p>
              <p style={{ marginTop: '1rem' }}>
                My current focus is at the intersection of deep learning and interpretability:
                understanding not just what neural networks learn, but how and why they learn it.
                Recent projects include an Agent Trace Viewer for SWE-agent interaction analysis
                and a Mechanistic Interpretability visualizer for transformer architectures.
              </p>
              <p style={{ marginTop: '1rem' }}>
                I'm also the author of three original fictional universes — including
                Crack in the Veil, a post-humanity sci-fi saga, and A Chronicle of Lyos,
                a fantasy world where dead gods' bloodlines still remember.
              </p>
            </motion.div>
          </div>

          {/* Floating Icons */}
          <motion.div
            className="floating-icons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="floating-icon icon-1">
              <CodeIcon />
            </div>
            <div className="floating-icon icon-2">
              <BrainIcon />
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="about-section stats-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            By the Numbers
          </motion.h2>
          <StatsCounter stats={stats} />
        </motion.section>

        {/* Skills & Technologies Section */}
        <motion.section
          className="about-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <SkillsGrid />
          </motion.div>
        </motion.section>

        {/* Experience Section */}
        <motion.section
          className="about-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <ExperienceTimeline />
          </motion.div>
        </motion.section>

        {/* Background Section */}
        <motion.section
          className="about-section background-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            My Journey
          </motion.h2>
          <motion.div className="content-card" variants={itemVariants}>
            <div className="content-grid">
              <div className="content-block">
                <h3>How I build</h3>
                <p>
                  Most of my tools run entirely in the browser — no backend, no install.
                  If an idea about neural networks or Bayesian inference can't survive
                  being made interactive, I don't trust that I understand it yet.
                  Building the visualization is how I find out.
                </p>
              </div>
              <div className="content-block">
                <h3>Why the fiction</h3>
                <p>
                  The worldbuilding is the same skill pointed elsewhere: take a system
                  with rules, push it until it breaks, write down what happens.
                  Three universes so far, each one built around a single broken premise.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Current Work Section */}
        <motion.section
          className="about-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            Current Work
          </motion.h2>
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}
            variants={itemVariants}
          >
            {[
              {
                topic: 'GLASSPORT',
                tag: 'IN THE WORKS',
                detail: 'Wire-level observability and enforcement for MCP servers: passive stdio tap, behavioral detectors, data-exfiltration scanning, and SARIF export to the GitHub Security tab. Python 3.10+, zero runtime dependencies, 317 tests.',
                link: 'https://github.com/Dennis-J-Carroll/glassport',
                linkLabel: 'View on GitHub →',
              },
              {
                topic: 'Mechanistic Interpretability',
                detail: 'Understanding how transformer attention heads and MLP blocks represent concepts',
                link: '/apps/mechmap.html',
              },
              {
                topic: 'Graph Neural Networks',
                detail: 'Extending neural architectures to non-Euclidean graph-structured data',
                link: null,
              },
              {
                topic: 'Reinforcement Learning Theory',
                detail: 'Connecting RL optimization to dynamical systems and chaos theory',
                link: '/apps/Interactive_RL_Chaos-Error_OPt.html',
              },
            ].map((item) => (
              <div
                key={item.topic}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(0,188,212,0.15)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}
              >
                <h4 style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.topic}
                  {item.tag && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: '#f5a623',
                      border: '1px solid rgba(245,166,35,0.35)',
                      borderRadius: '999px',
                      padding: '0.15rem 0.5rem'
                    }}>
                      {item.tag}
                    </span>
                  )}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: item.link ? '0.75rem' : 0 }}>
                  {item.detail}
                </p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 500 }}
                  >
                    {item.linkLabel || 'See experiment →'}
                  </a>
                )}
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* This Website Section */}
        <motion.section
          className="about-section website-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            About This Website
          </motion.h2>
          <motion.div className="website-card" variants={itemVariants}>
            <div className="tech-stack-visual">
              <div className="tech-item">
                <span className="tech-icon"><ReactIcon /></span>
                <span className="tech-name">React</span>
              </div>
              <div className="tech-connector">+</div>
              <div className="tech-item">
                <span className="tech-icon"><GatsbyIcon /></span>
                <span className="tech-name">Gatsby</span>
              </div>
              <div className="tech-connector">+</div>
              <div className="tech-item">
                <span className="tech-icon"><TailwindIcon /></span>
                <span className="tech-name">Tailwind</span>
              </div>
              <div className="tech-connector">+</div>
              <div className="tech-item">
                <span className="tech-icon"><MotionIcon /></span>
                <span className="tech-name">Framer</span>
              </div>
            </div>
            <p className="website-description">
              Gatsby and React render the shell; the experiments themselves are standalone
              static apps, so each one loads without pulling in the rest of the site.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
              <Link to="/contact" className="cta-button glow-on-hover">
                Let's Connect →
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Availability + Resume CTA */}
        <motion.section
          className="about-section"
          style={{ textAlign: 'center' }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            {/* Pulsing availability badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '999px',
              padding: '0.5rem 1.25rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '10px', height: '10px' }}>
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: '#10b981',
                  opacity: 0.75,
                  animation: 'djc-ping 1.2s cubic-bezier(0,0,0.2,1) infinite'
                }} />
                <span style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10b981'
                }} />
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Open to collaboration and interesting projects
              </span>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="/Dennis_Carroll_Resume.pdf"
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-color)',
                  color: '#0a0e14',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Resume
              </a>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  border: '1px solid rgba(120,180,255,0.3)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.2s ease, color 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(120,180,255,0.3)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </motion.section>


      </div>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo
    title="About Me"
    pathname={location.pathname}
    pageType="about"
    description="Learn more about Dennis J. Carroll - data scientist, full-stack developer, and creative problem solver. Explore my skills, experience, and the technologies I work with."
  />
)

export default AboutPage
