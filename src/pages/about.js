import React from "react"
import { motion } from "framer-motion"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import StatsCounter from "../components/shared/stats-counter"
import SkillProgress from "../components/shared/skill-progress"

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
    { value: 15, suffix: "+", label: "Projects Completed", icon: null },
    { value: 5, suffix: "+", label: "Years Experience", icon: null },
    { value: 10, suffix: "+", label: "Technologies", icon: null },
    { value: 100, suffix: "%", label: "Passion", icon: null }
  ]

  // Skills data with categories
  const skillCategories = [
    {
      name: "Data Science & AI",
      icon: null,
      skills: [
        { name: "Python", level: 95, color: "linear-gradient(90deg, #3776ab, #ffd43b)" },
        { name: "Machine Learning", level: 85 },
        { name: "TensorFlow / PyTorch", level: 80 },
        { name: "Data Visualization", level: 90 },
        { name: "Pandas & NumPy", level: 92 }
      ]
    },
    {
      name: "Web Development",
      icon: null,
      skills: [
        { name: "React & Gatsby", level: 88, color: "linear-gradient(90deg, #61dafb, #663399)" },
        { name: "JavaScript / TypeScript", level: 90 },
        { name: "HTML & CSS", level: 95 },
        { name: "Node.js", level: 82 },
        { name: "Tailwind CSS", level: 88 }
      ]
    },
    {
      name: "Tools & DevOps",
      icon: null,
      skills: [
        { name: "Git & GitHub", level: 92 },
        { name: "Docker", level: 75 },
        { name: "Cloud Services", level: 78 },
        { name: "CI/CD Pipelines", level: 80 },
        { name: "Database Design", level: 85 }
      ]
    }
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
              Data Scientist • Full-Stack Developer • Creative Technologist
            </motion.p>

            <motion.div
              className="about-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p>
                I'm a passionate technologist with a deep interest in data science,
                project development, and creative expression. My background spans multiple
                disciplines, allowing me to approach problems from unique perspectives
                and build innovative solutions.
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
            <motion.div
              className="floating-icon icon-1"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <CodeIcon />
            </motion.div>
            <motion.div
              className="floating-icon icon-2"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <BrainIcon />
            </motion.div>
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
                <h3>The Mission</h3>
                <p>
                  With expertise in Python programming and data analysis, I enjoy tackling
                  complex problems and turning data into actionable insights. My goal is to
                  bridge the gap between technical complexity and practical solutions.
                </p>
              </div>
              <div className="content-block">
                <h3>The Passion</h3>
                <p>
                  When I'm not coding, you might find me writing creative fiction or
                  exploring new technological frontiers. I believe that creativity and
                  technical skills complement each other beautifully.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Skills Section */}
        <motion.section
          className="about-section skills-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            Skills & Expertise
          </motion.h2>
          <SkillProgress categories={skillCategories} />
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
              This website serves as a portfolio of my work in data science and project
              development, as well as a platform for sharing my creative writing. Built
              with modern web technologies, it showcases both my technical abilities and
              my creative interests.
            </p>
            <motion.a
              href="/contact"
              className="cta-button glow-on-hover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Connect →
            </motion.a>
          </motion.div>
        </motion.section>

        <style jsx>{`
          .about-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 2rem 4rem 2rem;
          }

          .about-hero {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            position: relative;
            padding: 4rem 2rem;
          }

          .about-hero-content {
            position: relative;
            z-index: 2;
          }

          .hero-badge {
            display: inline-block;
            background: rgba(0, 188, 212, 0.1);
            border: 1px solid rgba(0, 188, 212, 0.3);
            padding: 0.5rem 1.25rem;
            border-radius: 50px;
            font-size: 1rem;
            color: var(--primary-color, #00bcd4);
            margin-bottom: 1.5rem;
          }

          .about-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.1;
          }

          .about-subtitle {
            font-size: 1.25rem;
            color: var(--text-secondary, #b8b8b8);
            margin-bottom: 2rem;
            font-weight: 400;
          }

          .about-description {
            max-width: 650px;
            margin: 0 auto;
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--text-secondary, #b8b8b8);
          }

          .floating-icons {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: hidden;
          }

          .floating-icon {
            position: absolute;
            padding: 1rem;
            background: rgba(0, 188, 212, 0.1);
            border-radius: 16px;
            border: 1px solid rgba(0, 188, 212, 0.2);
            color: var(--primary-color, #00bcd4);
          }

          .icon-1 { top: 15%; left: 10%; }
          .icon-2 { top: 25%; right: 15%; }
          .icon-3 { bottom: 20%; left: 20%; }

          .about-section {
            margin-bottom: 5rem;
          }

          .section-title {
            font-size: 2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 2.5rem;
            background: linear-gradient(135deg, var(--primary-color, #00bcd4), var(--secondary-color, #7c4dff));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .content-card {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(0, 188, 212, 0.15);
            border-radius: 24px;
            padding: 3rem;
            backdrop-filter: blur(10px);
          }

          .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2.5rem;
          }

          .content-block h3 {
            font-size: 1.25rem;
            color: var(--text-primary, #ffffff);
            margin-bottom: 1rem;
            font-weight: 600;
          }

          .content-block p {
            color: var(--text-secondary, #b8b8b8);
            line-height: 1.8;
          }

          .website-card {
            background: linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(124, 77, 255, 0.05) 100%);
            border: 1px solid rgba(0, 188, 212, 0.2);
            border-radius: 24px;
            padding: 3rem;
            text-align: center;
          }

          .tech-stack-visual {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .tech-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            border: 1px solid rgba(0, 188, 212, 0.1);
          }

          .tech-icon {
            font-size: 2rem;
          }

          .tech-name {
            font-size: 0.9rem;
            color: var(--text-secondary, #b8b8b8);
            font-weight: 500;
          }

          .tech-connector {
            font-size: 1.5rem;
            color: var(--primary-color, #00bcd4);
            font-weight: 300;
          }

          .website-description {
            color: var(--text-secondary, #b8b8b8);
            line-height: 1.8;
            max-width: 650px;
            margin: 0 auto 2rem auto;
            font-size: 1.05rem;
          }

          .cta-button {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: linear-gradient(135deg, var(--primary-color, #00bcd4), var(--secondary-color, #7c4dff));
            color: white;
            font-weight: 600;
            border-radius: 50px;
            text-decoration: none;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 188, 212, 0.3);
          }

          @media (max-width: 768px) {
            .about-page {
              padding: 1rem 1rem 3rem 1rem;
            }

            .about-hero {
              min-height: 50vh;
              padding: 2rem 1rem;
            }

            .about-title {
              font-size: 2.25rem;
            }

            .about-subtitle {
              font-size: 1rem;
            }

            .floating-icons {
              display: none;
            }

            .content-card,
            .website-card {
              padding: 1.5rem;
            }

            .tech-stack-visual {
              gap: 0.5rem;
            }

            .tech-item {
              padding: 0.75rem 1rem;
            }

            .section-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
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
