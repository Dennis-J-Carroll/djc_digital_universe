import React, { useState, useMemo } from 'react';
import Layout from '../components/layout/layout';
import Seo from '../components/shared/seo';
import { motion } from 'framer-motion';

// ── Category palette ──────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  'AI/ML':        { gradient: 'linear-gradient(160deg, #2d4a6e 0%, #3d5a80 60%, #4a6d96 100%)', accent: '#98c1d9' },
  'Data Science': { gradient: 'linear-gradient(160deg, #3a3d56 0%, #4a4e69 60%, #585d7a 100%)', accent: '#c9b8a8' },
  'Math':         { gradient: 'linear-gradient(160deg, #4a3d2e 0%, #5c4d3c 60%, #6e5e4c 100%)', accent: '#d4a574' },
  'Tools':        { gradient: 'linear-gradient(160deg, #2d4a4a 0%, #3d5c5c 60%, #4a6e6e 100%)', accent: '#7fb3b3' },
  'Creative':     { gradient: 'linear-gradient(160deg, #4a2d40 0%, #5c3d52 60%, #6e4a63 100%)', accent: '#b38fa3' },
  'Education':    { gradient: 'linear-gradient(160deg, #3a4456 0%, #4a5568 60%, #586678 100%)', accent: '#a0aec0' },
};

// ── SVG Icons (viewBox 0 0 72 72) ─────────────────────────────────────────────

const NeuralNetworkIcon = ({ accent = '#98c1d9' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* connections — layer 1→2 */}
    <line x1="20" y1="16" x2="12" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="20" y1="16" x2="36" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="20" y1="16" x2="60" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="52" y1="16" x2="12" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="52" y1="16" x2="36" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="52" y1="16" x2="60" y2="36" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    {/* connections — layer 2→3 */}
    <line x1="12" y1="36" x2="20" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="12" y1="36" x2="52" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="36" y1="36" x2="20" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="36" y1="36" x2="52" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="60" y1="36" x2="20" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    <line x1="60" y1="36" x2="52" y2="56" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
    {/* nodes */}
    <circle cx="20" cy="16" r="4" fill={accent} opacity="0.9"/>
    <circle cx="52" cy="16" r="4" fill={accent} opacity="0.9"/>
    <circle cx="12" cy="36" r="4" fill={accent} opacity="0.9"/>
    <circle cx="36" cy="36" r="5" fill={accent}/>
    <circle cx="60" cy="36" r="4" fill={accent} opacity="0.9"/>
    <circle cx="20" cy="56" r="4" fill={accent} opacity="0.9"/>
    <circle cx="52" cy="56" r="4" fill={accent} opacity="0.9"/>
  </svg>
);

const DistributionFlowIcon = ({ accent = '#c9b8a8' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* distribution curve */}
    <path d="M 8 58 C 16 58 20 36 28 26 C 34 18 38 18 44 26 C 52 36 56 50 64 52"
      stroke={accent} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85"/>
    {/* dots at key curve points */}
    <circle cx="8"  cy="58" r="3" fill={accent} opacity="0.9"/>
    <circle cx="28" cy="26" r="3.5" fill={accent}/>
    <circle cx="36" cy="19" r="4" fill={accent}/>
    <circle cx="44" cy="26" r="3.5" fill={accent}/>
    <circle cx="64" cy="52" r="3" fill={accent} opacity="0.9"/>
    {/* base line */}
    <line x1="6" y1="62" x2="66" y2="62" stroke={accent} strokeWidth="1" opacity="0.3"/>
  </svg>
);

const ConvergenceSpiralIcon = ({ accent = '#d4a574' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* axes */}
    <line x1="12" y1="58" x2="64" y2="58" stroke={accent} strokeWidth="1" opacity="0.4"/>
    <line x1="12" y1="58" x2="12" y2="10" stroke={accent} strokeWidth="1" opacity="0.4"/>
    {/* convergence spiral approximated as shrinking arcs */}
    <path d="M 58 44 A 24 24 0 1 0 34 20" stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M 34 20 A 12 12 0 1 0 46 44"  stroke={accent} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M 46 44 A 6 6 0 1 0 40 38"   stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6"/>
    {/* attractor dot */}
    <circle cx="40" cy="38" r="4" fill={accent}/>
    {/* spiral start dot */}
    <circle cx="58" cy="44" r="3" fill={accent} opacity="0.7"/>
  </svg>
);

const GearMechanismIcon = ({ accent = '#7fb3b3' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* outer ring */}
    <circle cx="36" cy="36" r="26" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
    {/* tick marks around outer edge */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      const x1 = 36 + 23 * Math.cos(angle);
      const y1 = 36 + 23 * Math.sin(angle);
      const x2 = 36 + 26 * Math.cos(angle);
      const y2 = 36 + 26 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1.5" opacity="0.7"/>;
    })}
    {/* inner ring */}
    <circle cx="36" cy="36" r="16" stroke={accent} strokeWidth="1.5" opacity="0.6"/>
    {/* center bullseye */}
    <circle cx="36" cy="36" r="6" stroke={accent} strokeWidth="1.5" opacity="0.8"/>
    <circle cx="36" cy="36" r="2.5" fill={accent}/>
  </svg>
);

const WaveformPulseIcon = ({ accent = '#b38fa3' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* baseline */}
    <line x1="6" y1="44" x2="66" y2="44" stroke={accent} strokeWidth="1" opacity="0.3"/>
    {/* waveform path */}
    <path d="M 6 44 L 14 44 L 18 26 L 22 58 L 28 30 L 34 52 L 40 22 L 46 52 L 52 36 L 58 44 L 66 44"
      stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85"/>
    {/* dots at peaks */}
    <circle cx="18" cy="26" r="3" fill={accent}/>
    <circle cx="28" cy="30" r="2.5" fill={accent} opacity="0.8"/>
    <circle cx="40" cy="22" r="3.5" fill={accent}/>
    <circle cx="46" cy="52" r="2.5" fill={accent} opacity="0.8"/>
    <circle cx="22" cy="58" r="2.5" fill={accent} opacity="0.7"/>
  </svg>
);

const KnowledgeTreeIcon = ({ accent = '#a0aec0' }) => (
  <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* trunk */}
    <line x1="36" y1="60" x2="36" y2="46" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
    {/* primary branches */}
    <line x1="36" y1="46" x2="20" y2="34" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="36" y1="46" x2="52" y2="34" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/>
    {/* secondary branches left */}
    <line x1="20" y1="34" x2="12" y2="20" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="20" y1="34" x2="28" y2="20" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    {/* secondary branches right */}
    <line x1="52" y1="34" x2="44" y2="20" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="52" y1="34" x2="60" y2="20" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    {/* nodes */}
    <circle cx="36" cy="60" r="3.5" fill={accent}/>
    <circle cx="36" cy="46" r="3.5" fill={accent}/>
    <circle cx="20" cy="34" r="3" fill={accent} opacity="0.9"/>
    <circle cx="52" cy="34" r="3" fill={accent} opacity="0.9"/>
    <circle cx="12" cy="20" r="2.5" fill={accent} opacity="0.8"/>
    <circle cx="28" cy="20" r="2.5" fill={accent} opacity="0.8"/>
    <circle cx="44" cy="20" r="2.5" fill={accent} opacity="0.8"/>
    <circle cx="60" cy="20" r="2.5" fill={accent} opacity="0.8"/>
  </svg>
);

const CATEGORY_ICONS = {
  'AI/ML':        NeuralNetworkIcon,
  'Data Science': DistributionFlowIcon,
  'Math':         ConvergenceSpiralIcon,
  'Tools':        GearMechanismIcon,
  'Creative':     WaveformPulseIcon,
  'Education':    KnowledgeTreeIcon,
};

// ── Utility icons ─────────────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

const featuredProjects = [
  {
    title: "Bayesian Analysis of Airbnb Seattle Market",
    description: "Enterprise-grade hierarchical Bayesian analytics platform for Airbnb pricing analysis with uncertainty quantification and interactive Streamlit dashboard.",
    tech: ["Python", "PyMC", "Streamlit", "Bayesian Statistics"],
    github: "https://github.com/Dennis-J-Carroll/bayesian-analysis-of-airbnb-seattle-market",
    demo: "https://bayesian-analysis-dashboard.streamlit.app/"
  },
  {
    title: "Personal Portfolio Website",
    description: "This website - a modern, performant Gatsby site with React components, multiple themes, and 24+ standalone web applications.",
    tech: ["React", "Gatsby", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Dennis-J-Carroll/personal-website"
  }
];

const interactiveApps = [
    { title: 'Understanding Layer — Agent Trace Viewer', path: '/apps/understanding-layer-demo.html', description: 'Live visualization of a real gpt-4.1 SWE-agent interaction trace across 46 events. Renders the InteractionTrace schema — a unified L1/L2/L3 observability model for AI agents — with color-coded event kinds, causal parent links, fabrication detection, and annotation callouts.', category: 'AI/ML', featured: true },
    { title: 'Neural Network Theory Lab v2', path: '/apps/neural_theory_lab_v2.html', description: 'Enhanced interactive laboratory for exploring neural network architectures, training dynamics, and theoretical foundations with improved visualizations.', category: 'AI/ML', featured: true },
    { title: 'Edge AI Training Lab', path: '/apps/edge-ai-sandbox.html', description: 'Real-time neural network training with TensorFlow.js - train models in your browser with live loss curves, decision boundaries, and network visualization.', category: 'AI/ML', featured: true },
    { title: 'Interactive RL Chaos-Error Optimization', path: '/apps/Interactive_RL_Chaos-Error_OPt.html', description: 'Explore reinforcement learning with chaos theory and error optimization visualizations.', category: 'AI/ML' },
    { title: 'Edge Sentinel', path: '/apps/edge_sentinel.html', description: 'Edge computing monitoring and security dashboard for IoT and distributed systems.', category: 'AI/ML' },
    { title: 'Mech Interp Viz', path: '/apps/mechmap.html', description: 'Interactive mechanistic interpretability visualization for transformer models. Explore attention heads and MLP blocks across layers, annotate components with importance levels and tags, and export your research findings.', category: 'AI/ML', featured: true },
    { title: 'ML Fraud Detection Mastery', path: '/apps/ML_Fraud_detection.html', description: 'Advanced framework for real-time fraud detection systems covering streaming architectures, Graph Self-Attention Transformers, and production implementation.', category: 'Data Science', featured: true },
    { title: 'Bayesian Mechanistic Interpretability', path: '/apps/bayes_circuts.html', description: 'Enhanced v2: Explore Bayesian inference for neural circuit analysis with interactive posterior distributions and validation checks.', category: 'Data Science', featured: true },
    { title: 'Sym9 & SNFT Explorer', path: '/apps/sym9-snft-unified-explorer.html', description: 'Unified explorer combining Sym9 symmetry group transformations and the Stochastic Numerical Flow Transformation (SNFT) 5-Digit framework with interactive visualizations.', category: 'Data Science' },
    { title: 'Dynamical Systems Explorer', path: '/apps/dynamical-systems-explorer.html', description: 'Unified interactive exploration of universal scaling laws, numerical attractor descent curves, convergence dynamics, and the mathematics of complex systems.', category: 'Data Science', featured: true },
    { title: 'The Science of Convergence', path: '/apps/convergence/', description: 'Interactive exploration of universal scaling laws, Numerical Attractor Descent Curves (NADCs), and the mathematics of convergence in dynamical systems.', category: 'Math' },
    { title: 'Matrix Visualization Lab', path: '/apps/linear-calculator.html', description: '3D linear algebra explorer with interactive matrix transformations, eigenvector visualization, and animated interpolation between transforms.', category: 'Math', featured: true },
    { title: 'Boolean Function Explorer', path: '/apps/boolean_function.html', description: 'Interactive tool for analyzing Boolean algebra and logic gate operations.', category: 'Math' },
    { title: 'Sphere, Cylinder & Hypersphere Explorer', path: '/apps/sphere_cylinder_hypersphere.html', description: 'Interactive geometric visualization of spheres, cylinders, and hyperspheres in multiple dimensions.', category: 'Math' },
    { title: 'Voltic Pile Simulator', path: '/apps/voltic_pile.html', description: 'Interactive electrochemistry simulation exploring early battery design and electrical theory.', category: 'Math' },
    { title: 'Algebraic Flow', path: '/apps/algebraic-flow/', description: 'Interactive equation solver with Play-Doh math manipulatives, proof logging, and constellation backgrounds.', category: 'Math', featured: true },
    { title: 'Prose Trainer', path: '/apps/prose-trainer-app.html', description: 'Genre-optimized writing practice with real-time analysis of readability, sensory balance, and kinetic density. Level up your prose with targeted feedback.', category: 'Tools', featured: true },
    { title: 'Flow Writer', path: '/apps/flow_writer.html', description: 'Creative writing tool with flow state optimization and distraction-free interface.', category: 'Tools' },
    { title: 'Write Paradigm', path: '/apps/write_paradigm.html', description: 'Advanced writing assistant and content organization tool with structured composition features.', category: 'Tools' },
    { title: 'Chroma Echo Visualizer', path: '/apps/Chroma_Echo.html', description: 'Audio-reactive visual experience with chromatic wave patterns and dynamic color synthesis.', category: 'Creative' },
    { title: 'Sphere Chat Interface', path: '/apps/sphere-chat-interface.html', description: '3D spherical chat interface with immersive user experience.', category: 'Creative' },
    { title: 'Advanced Python CS', path: '/apps/Advanced_python_CS.html', description: 'Comprehensive computer science curriculum and interactive Python programming environment.', category: 'Education' },
    { title: 'CLI University', path: '/apps/CLI_uni.html', description: 'Interactive command-line interface learning environment for mastering CLI tools.', category: 'Education' },
    { title: 'CompTIA Study Guide', path: '/apps/ComTia.html', description: 'Comprehensive study materials and practice tests for CompTIA certifications.', category: 'Education' },
    { title: 'Python Function a Day', path: '/apps/python-function-a-day/', description: 'Comprehensive Python learning platform featuring 100+ functions from standard library and third-party packages. Includes interactive code playground, progress tracking, and curated learning paths.', category: 'Education', featured: true },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const AppsPage = ({ location }) => {
  const allCategories = ['All', 'AI/ML', 'Data Science', 'Math', 'Tools', 'Creative', 'Education'];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredApps = useMemo(() => {
    return interactiveApps.filter(p => {
      const matchesSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
  };

  return (
    <Layout location={location}>
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem'
          }}>
            Apps & Projects
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            {interactiveApps.length} interactive applications plus full-stack development projects.
          </p>
        </motion.div>

        {/* Featured full-stack projects */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Featured Projects
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {featuredProjects.map((project, index) => (
              <motion.div key={index} variants={itemVariants} style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', border: '2px solid var(--primary-color)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{project.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1rem' }}>{project.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {project.tech.map((tech, i) => (
                    <span key={i} style={{ background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.3)', color: 'var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>{tech}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <GithubIcon /> GitHub
                  </a>
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                      <ExternalLinkIcon /> Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search + Filter */}
        <div style={{ marginBottom: '2.5rem' }}>
          <input
            type="text"
            placeholder="Search projects, tags, technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto 1.25rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(0,188,212,0.3)', background: 'rgba(15,20,30,0.7)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s ease', background: activeFilter === cat ? 'var(--primary-color)' : 'rgba(120,180,255,0.1)', color: activeFilter === cat ? '#0a0e14' : 'var(--text-secondary)' }}
              >
                {cat}
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {filteredApps.length} project{filteredApps.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* App grid — grouped by category */}
        {['AI/ML', 'Data Science', 'Math', 'Tools', 'Creative', 'Education'].map(category => {
          const categoryApps = filteredApps.filter(app => app.category === category);
          if (categoryApps.length === 0) return null;

          const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES['Tools'];
          const CatIcon = CATEGORY_ICONS[category] || NeuralNetworkIcon;

          return (
            <motion.div key={category} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {category}
              </h2>
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {categoryApps.map(app => (
                  <motion.a
                    key={app.path}
                    variants={itemVariants}
                    href={app.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', display: 'block', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', border: app.featured ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--card-border)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease', position: 'relative' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 28px ${catStyle.accent}28`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Muted category gradient header with SVG icon */}
                    <div style={{ height: '100px', background: catStyle.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <CatIcon accent={catStyle.accent} />
                      {app.featured && (
                        <span style={{ position: 'absolute', top: '8px', right: '10px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', fontSize: '0.68rem', padding: '0.2rem 0.65rem', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.06em', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {app.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.88rem', marginBottom: '1rem' }}>
                        {app.description}
                      </p>
                      <div style={{ color: catStyle.accent, fontSize: '0.83rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Launch App <ExternalLinkIcon />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          );
        })}

        {filteredApps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No projects match your search.{' '}
            <button onClick={() => { setSearchQuery(''); setActiveFilter('All'); }} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export const Head = ({ location }) => (
  <Seo
    title="Apps & Projects"
    pathname={location.pathname}
    pageType="collection"
    description="Explore interactive web applications, AI/ML experiments, data science projects, and development tools built by Dennis J. Carroll"
  />
);

export default AppsPage;
