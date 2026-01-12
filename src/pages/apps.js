import React from 'react';
import Layout from '../components/layout/layout';
import Seo from '../components/shared/seo';
import { motion } from 'framer-motion';

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

    // Data Science & Mathematics
    {
      title: 'Bayesian Mechanistic Interpretability',
      path: '/apps/bayes_circuts.html',
      description: 'Enhanced v2: Explore Bayesian inference for neural circuit analysis with interactive posterior distributions and validation checks.',
      category: 'Data Science',
      featured: true
    },
    {
      title: 'SNFT 5-Digit Framework',
      path: '/apps/SNFT 5-Digit Experimental Framework.html',
      description: 'Experimental framework for Stochastic Numerical Flow Transformation research with advanced plotting.',
      category: 'Data Science'
    },
    {
      title: 'The Science of Convergence',
      path: '/apps/The Science of Convergence.html',
      description: 'Interactive exploration of convergence patterns in mathematical and scientific contexts.',
      category: 'Data Science'
    },
    {
      title: 'Numerical Attractor Descent Curves',
      path: '/apps/Understanding Numerical Attractor Descent Curves.html',
      description: 'Visualize and understand attractor descent curves in dynamical systems.',
      category: 'Data Science'
    },
    {
      title: 'Matrix Visualization Lab',
      path: '/apps/linear-calculator.html',
      description: '3D linear algebra explorer with interactive matrix transformations, eigenvector visualization, and animated interpolation between transforms.',
      category: 'Math',
      featured: true
    },
    {
      title: 'Sym9 Transformation Explorer',
      path: '/apps/Sym9 Transformation Explorer.html',
      description: 'Explore symmetry group transformations with interactive visual representations.',
      category: 'Math'
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
      title: 'Python Godking Training',
      path: '/apps/python-godking-training.html',
      description: 'Advanced Python programming training with challenging exercises and concepts.',
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
    }
  ];

  const categories = ['AI/ML', 'Data Science', 'Math', 'Tools', 'Creative', 'Education'];

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

        {categories.map(category => {
          const categoryApps = interactiveApps.filter(app => app.category === category);
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
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
                      background: app.featured
                        ? 'linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(124, 77, 255, 0.1))'
                        : 'rgba(15, 20, 30, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: app.featured
                        ? '2px solid var(--primary-color)'
                        : '1px solid rgba(120, 180, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '1.5rem',
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
                    {app.featured && (
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '15px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '10px',
                        fontWeight: '600'
                      }}>
                        NEW
                      </span>
                    )}
                    <h3 style={{
                      fontSize: '1.35rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.75rem'
                    }}>
                      {app.title}
                    </h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      fontSize: '0.95rem',
                      marginBottom: '1rem'
                    }}>
                      {app.description}
                    </p>
                    <div style={{
                      color: 'var(--primary-color)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      Launch App <ExternalLinkIcon />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          );
        })}
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
