import React, { useState, useMemo } from 'react';
import Layout from '../components/layout/layout';
import Seo from '../components/shared/seo';
import { motion } from 'framer-motion';

const GRADIENTS = [
  'linear-gradient(135deg, rgba(0,201,177,0.25), rgba(6,182,212,0.25))',
  'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25))',
  'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(20,184,166,0.25))',
  'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(249,115,22,0.25))',
  'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.25))',
  'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
];

const getProjectGradient = (title) => {
  const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
};

const getProjectInitials = (title) =>
  title.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

// Minimalist SVG Icons
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

// Featured full-stack projects from development-projects
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
    description: "This website - a modern, performant Gatsby site with React components, multiple themes, and 20+ standalone web applications.",
    tech: ["React", "Gatsby", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Dennis-J-Carroll/personal-website"
  }
];

const AppsPage = ({ location }) => {
  // Standalone interactive HTML apps - these open in new tabs
  const interactiveApps = [
    // AI & Machine Learning
    {
      title: 'Understanding Layer — Agent Trace Viewer',
      path: '/apps/understanding-layer-demo.html',
      description: 'Live visualization of a real gpt-4.1 SWE-agent interaction trace across 46 events. Renders the InteractionTrace schema — a unified L1/L2/L3 observability model for AI agents — with color-coded event kinds, causal parent links, fabrication detection, and annotation callouts.',
      category: 'AI/ML',
      featured: true
    },
    {
      title: 'Neural Network Theory Lab v2',
      path: '/apps/neural_theory_lab_v2.html',
      description: 'Enhanced interactive laboratory for exploring neural network architectures, training dynamics, and theoretical foundations with improved visualizations.',
      category: 'AI/ML',
      featured: true
    },
    {
      title: 'Edge AI Training Lab',
      path: '/apps/edge-ai-sandbox.html',
      description: 'Real-time neural network training with TensorFlow.js - train models in your browser with live loss curves, decision boundaries, and network visualization.',
      category: 'AI/ML',
      featured: true
    },
    {
      title: 'Interactive RL Chaos-Error Optimization',
      path: '/apps/Interactive_RL_Chaos-Error_OPt.html',
      description: 'Explore reinforcement learning with chaos theory and error optimization visualizations.',
      category: 'AI/ML'
    },
    {
      title: 'Edge Sentinel',
      path: '/apps/edge_sentinel.html',
      description: 'Edge computing monitoring and security dashboard for IoT and distributed systems.',
      category: 'AI/ML'
    },
    {
      title: 'Mech Interp Viz',
      path: '/apps/mechmap.html',
      description: 'Interactive mechanistic interpretability visualization for transformer models. Explore attention heads and MLP blocks across layers, annotate components with importance levels and tags, and export your research findings.',
      category: 'AI/ML',
      featured: true
    },

    {
      title: 'ML Fraud Detection Mastery',
      path: '/apps/ML_Fraud_detection.html',
      description: 'Advanced framework for real-time fraud detection systems covering streaming architectures, Graph Self-Attention Transformers, and production implementation.',
      category: 'Data Science',
      featured: true
    },
    {
      title: 'Prose Trainer',
      path: '/apps/prose-trainer-app.html',
      description: 'Genre-optimized writing practice with real-time analysis of readability, sensory balance, and kinetic density. Level up your prose with targeted feedback.',
      category: 'Tools',
      featured: true
    },

    // Data Science & Mathematics
    {
      title: 'Bayesian Mechanistic Interpretability',
      path: '/apps/bayes_circuts.html',
      description: 'Enhanced v2: Explore Bayesian inference for neural circuit analysis with interactive posterior distributions and validation checks.',
      category: 'Data Science',
      featured: true
    },
    {
      title: 'Sym9 & SNFT Explorer',
      path: '/apps/sym9-snft-unified-explorer.html',
      description: 'Unified explorer combining Sym9 symmetry group transformations and the Stochastic Numerical Flow Transformation (SNFT) 5-Digit framework with interactive visualizations.',
      category: 'Data Science'
    },
    {
      title: 'The Science of Convergence',
      path: '/apps/The Science of Convergence.html',
      description: 'Interactive exploration of universal scaling laws, Numerical Attractor Descent Curves (NADCs), and the mathematics of convergence in dynamical systems.',
      category: 'Math'
    },
    {
      title: 'Dynamical Systems Explorer',
      path: '/apps/dynamical-systems-explorer.html',
      description: 'Unified interactive exploration of universal scaling laws, numerical attractor descent curves, convergence dynamics, and the mathematics of complex systems.',
      category: 'Data Science',
      featured: true
    },
    {
      title: 'Matrix Visualization Lab',
      path: '/apps/linear-calculator.html',
      description: '3D linear algebra explorer with interactive matrix transformations, eigenvector visualization, and animated interpolation between transforms.',
      category: 'Math',
      featured: true
    },
    {
      title: 'Boolean Function Explorer',
      path: '/apps/boolean_function.html',
      description: 'Interactive tool for analyzing Boolean algebra and logic gate operations.',
      category: 'Math'
    },
    {
      title: 'Sphere, Cylinder & Hypersphere Explorer',
      path: '/apps/sphere_cylinder_hypersphere.html',
      description: 'Interactive geometric visualization of spheres, cylinders, and hyperspheres in multiple dimensions.',
      category: 'Math'
    },
    {
      title: 'Voltic Pile Simulator',
      path: '/apps/voltic_pile.html',
      description: 'Interactive electrochemistry simulation exploring early battery design and electrical theory.',
      category: 'Math'
    },
    {
      title: 'Algebraic Flow',
      path: '/apps/algebraic-flow/',
      description: 'Interactive equation solver with Play-Doh math manipulatives, proof logging, and constellation backgrounds.',
      category: 'Math',
      featured: true
    },

    // Tools & Productivity
    {
      title: 'Flow Writer',
      path: '/apps/flow_writer.html',
      description: 'Creative writing tool with flow state optimization and distraction-free interface.',
      category: 'Tools'
    },
    {
      title: 'Write Paradigm',
      path: '/apps/write_paradigm.html',
      description: 'Advanced writing assistant and content organization tool with structured composition features.',
      category: 'Tools'
    },
    {
      title: 'Chroma Echo Visualizer',
      path: '/apps/Chroma_Echo.html',
      description: 'Audio-reactive visual experience with chromatic wave patterns and dynamic color synthesis.',
      category: 'Creative'
    },
    {
      title: 'Sphere Chat Interface',
      path: '/apps/sphere-chat-interface.html',
      description: '3D spherical chat interface with immersive user experience.',
      category: 'Creative'
    },

    // Education
    {
      title: 'Advanced Python CS',
      path: '/apps/Advanced_python_CS.html',
      description: 'Comprehensive computer science curriculum and interactive Python programming environment.',
      category: 'Education'
    },
    {
      title: 'CLI University',
      path: '/apps/CLI_uni.html',
      description: 'Interactive command-line interface learning environment for mastering CLI tools.',
      category: 'Education'
    },
    {
      title: 'CompTIA Study Guide',
      path: '/apps/ComTia.html',
      description: 'Comprehensive study materials and practice tests for CompTIA certifications.',
      category: 'Education'
    },
    {
      title: 'Python Function a Day',
      path: '/apps/python-function-a-day/',
      description: 'Comprehensive Python learning platform featuring 100+ functions from standard library and third-party packages. Includes interactive code playground, progress tracking, and curated learning paths.',
      category: 'Education',
      featured: true
    }
  ];

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
  }, [interactiveApps, searchQuery, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Layout location={location}>
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}
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
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto 2rem'
          }}>
            {interactiveApps.length} interactive applications plus full-stack development projects. From AI/ML experiments to data science pipelines.
          </p>
        </motion.div>

        {/* Featured Projects Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: 'var(--primary-color)',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '0.5rem'
          }}>
            Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
          }}>
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(124, 77, 255, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}
              >
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem'
                }}>
                  {project.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  marginBottom: '1rem'
                }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {project.tech.map((tech, i) => (
                    <span key={i} style={{
                      background: 'rgba(0, 188, 212, 0.1)',
                      border: '1px solid rgba(0, 188, 212, 0.3)',
                      color: 'var(--primary-color)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    <GithubIcon /> GitHub
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none'
                      }}
                    >
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
            style={{
              width: '100%',
              maxWidth: '600px',
              display: 'block',
              margin: '0 auto 1.25rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(0,188,212,0.3)',
              background: 'rgba(15,20,30,0.7)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  background: activeFilter === cat ? 'var(--primary-color)' : 'rgba(120,180,255,0.1)',
                  color: activeFilter === cat ? '#0a0e14' : 'var(--text-secondary)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {filteredApps.length} project{filteredApps.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* App grid — grouped by category, respecting search/filter */}
        {['AI/ML', 'Data Science', 'Math', 'Tools', 'Creative', 'Education'].map(category => {
          const categoryApps = filteredApps.filter(app => app.category === category);
          if (categoryApps.length === 0) return null;

          return (
            <motion.div
              key={category}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ marginBottom: '3rem' }}
            >
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                color: 'var(--primary-color)',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.5rem'
              }}>
                {category}
              </h2>

              <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                {categoryApps.map(app => (
                  <motion.a
                    key={app.path}
                    variants={itemVariants}
                    href={app.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                      background: 'rgba(15, 20, 30, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: app.featured
                        ? '2px solid var(--primary-color)'
                        : '1px solid rgba(120, 180, 255, 0.2)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 188, 212, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = app.featured ? 'var(--primary-color)' : 'rgba(120, 180, 255, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Gradient thumbnail */}
                    <div style={{
                      height: '80px',
                      background: getProjectGradient(app.title),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.1em',
                        fontFamily: 'monospace'
                      }}>
                        {getProjectInitials(app.title)}
                      </span>
                      {app.featured && (
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          right: '10px',
                          background: 'var(--primary-color)',
                          color: '#0a0e14',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          fontWeight: 700
                        }}>
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                      }}>
                        {app.title}
                      </h3>
                      <p style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        fontSize: '0.9rem',
                        marginBottom: '1rem'
                      }}>
                        {app.description}
                      </p>
                      <div style={{
                        color: 'var(--primary-color)',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
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
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
              style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
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
