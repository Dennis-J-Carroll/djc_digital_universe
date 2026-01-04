import React from "react"
import { Link } from "gatsby"
import { motion } from "framer-motion"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

// Project Icons
const WebIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
    <path d="M20 12a8 8 0 1 0-16 0"></path>
    <path d="M2 12h10"></path>
    <path d="M12 2v10"></path>
  </svg>
);

const DataIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ToolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const DevelopmentProjects = ({ location }) => {
  // All interactive HTML applications - consolidated from data science and development
  const htmlProjects = [
    // AI & Machine Learning Projects
    {
      title: "Interactive RL Chaos-Error Optimization",
      description: "Advanced reinforcement learning system exploring self-correcting AI loops with interactive visualizations and chaos theory applications.",
      filename: "Interactive_RL_Chaos-Error_OPt.html",
      icon: <AiIcon />,
      tech: ["JavaScript", "Chart.js", "AI/ML", "Reinforcement Learning"],
      category: "ai"
    },
    {
      title: "Neural Network Theory Laboratory",
      description: "Comprehensive interactive laboratory for exploring neural network architectures, training dynamics, and theoretical foundations.",
      filename: "neural_theory_lab.html",
      icon: <AiIcon />,
      tech: ["Three.js", "Chart.js", "Neural Networks", "Interactive Visualization"],
      category: "ai"
    },
    {
      title: "Question Analysis Bot",
      description: "Multi-API curiosity-driven chatbot with Firebase integration for exploring questions and generating insights.",
      filename: "Question_analysisBot.html",
      icon: <AiIcon />,
      tech: ["Firebase", "Multi-API", "JavaScript", "Real-time Database"],
      category: "ai"
    },
    {
      title: "Python Godking Training",
      description: "Advanced Python programming training interface with interactive exercises and skill development modules.",
      filename: "python-godking-training.html",
      icon: <AiIcon />,
      tech: ["Python", "Educational Tech", "Interactive Learning", "Code Training"],
      category: "ai"
    },

    // Data Science & Mathematical Analysis
    {
      title: "Numerical Attractor Descent Curves",
      description: "Mathematical exploration of universal scaling laws in dynamical systems with interactive curve analysis and visualization.",
      filename: "Understanding Numerical Attractor Descent Curves.html",
      icon: <DataIcon />,
      tech: ["Mathematical Modeling", "Chart.js", "Dynamical Systems", "Visualization"],
      category: "data"
    },
    {
      title: "SNFT 5-Digit Experimental Framework",
      description: "Statistical framework for analyzing 5-digit number patterns with advanced plotting and data analysis capabilities.",
      filename: "SNFT 5-Digit Experimental Framework.html",
      icon: <DataIcon />,
      tech: ["Plotly.js", "Statistical Analysis", "Data Visualization", "Pattern Recognition"],
      category: "data"
    },
    {
      title: "The Science of Convergence",
      description: "Research exploration into convergence patterns and mathematical principles with interactive demonstrations.",
      filename: "The Science of Convergence.html",
      icon: <DataIcon />,
      tech: ["Mathematical Research", "Convergence Analysis", "Interactive Demos"],
      category: "data"
    },
    {
      title: "Sym9 Transformation Explorer",
      description: "Advanced mathematical transformation system for exploring symmetry and numerical patterns in multi-dimensional space.",
      filename: "Sym9 Transformation Explorer.html",
      icon: <DataIcon />,
      tech: ["Mathematical Transformations", "Symmetry Analysis", "Interactive Visualization"],
      category: "data"
    },
    {
      title: "Linear Calculator",
      description: "Advanced linear algebra calculator with matrix operations, eigenvalue computation, and vector analysis.",
      filename: "linear-calculator.html",
      icon: <DataIcon />,
      tech: ["Linear Algebra", "Mathematical Computing", "Interactive Tools"],
      category: "data"
    },

    // Web Applications & Tools
    {
      title: "CLI University Interface",
      description: "Terminal-style educational interface with command line aesthetics and interactive navigation system.",
      filename: "CLI_uni.html",
      icon: <WebIcon />,
      tech: ["CSS Animations", "Terminal UI", "Interactive Design", "Educational Tools"],
      category: "web"
    },
    {
      title: "Flow Writer Tool",
      description: "Dynamic content creation and workflow management tool with real-time editing capabilities.",
      filename: "flow_writer.html",
      icon: <ToolIcon />,
      tech: ["Content Management", "Real-time Editing", "Workflow Tools", "JavaScript"],
      category: "web"
    },
    {
      title: "Sphere Chat Interface",
      description: "3D spherical chat interface with immersive user experience and innovative interaction patterns.",
      filename: "sphere-chat-interface.html",
      icon: <WebIcon />,
      tech: ["3D Interface", "Chat System", "Immersive UX", "Interactive Design"],
      category: "web"
    },
    {
      title: "Sphere Cylinder Hypersphere Visualization",
      description: "Advanced geometric visualization tool for exploring multi-dimensional shapes and mathematical concepts.",
      filename: "sphere_cylinder_hypersphere.html",
      icon: <DataIcon />,
      tech: ["3D Visualization", "Geometry", "Mathematical Modeling", "WebGL"],
      category: "web"
    },
    {
      title: "Edge AI Sandbox",
      description: "Experimental environment for testing edge AI models and exploring on-device machine learning capabilities.",
      filename: "edge-ai-sandbox.html",
      icon: <AiIcon />,
      tech: ["Edge Computing", "AI/ML", "JavaScript", "TensorFlow.js"],
      category: "ai"
    },
    {
      title: "CompTIA Study Suite",
      description: "Complete CompTIA certification preparation suite with practice exams and study materials.",
      filename: "ComTia.html",
      icon: <ToolIcon />,
      tech: ["Educational Technology", "Study Tools", "Certification Prep", "Interactive Learning"],
      category: "web"
    }
  ];

  // Group projects by category
  const categories = [
    { id: "ai", title: "AI & Machine Learning", description: "Neural networks, reinforcement learning, and intelligent systems" },
    { id: "data", title: "Data Science & Mathematics", description: "Statistical analysis, mathematical modeling, and data visualization" },
    { id: "web", title: "Web Applications & Tools", description: "Interactive interfaces, productivity tools, and educational platforms" }
  ];

  return (
    <Layout location={location}>
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Development Projects
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Exploring full-stack development, data science, AI/ML, and interactive web applications with a focus on modern technologies and engaging user experiences.
          </p>
        </motion.div>

        {/* Projects organized by category */}
        {categories.map((category, categoryIndex) => {
          const categoryProjects = htmlProjects.filter(p => p.category === category.id);

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (categoryIndex + 1) }}
              className="mb-16"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2 gradient-text">{category.title}</h2>
                <p className="text-gray-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProjects.map((project, index) => (
                  <div key={index} className="project-card bg-black/30 backdrop-blur-md border border-teal-900/30 rounded-xl p-6 hover:border-teal-500/50 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="text-teal-400 mr-3">
                        {project.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-teal-400">{project.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                    <div className="tech-tags mb-4">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="tech-tag inline-block bg-teal-500/20 text-teal-300 px-2 py-1 rounded text-xs mr-2 mb-2">{tech}</span>
                      ))}
                    </div>
                    <a
                      href={`/apps/${project.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center"
                    >
                      Launch Application →
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Technologies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 10, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16 py-12 rounded-xl bg-black/30 backdrop-blur-md border border-teal-900/30"
        >
          <h2 className="text-2xl font-bold mb-8 gradient-text text-center" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>Technologies & Skills</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Frontend</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  React & React Native
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Next.js & Gatsby
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Tailwind CSS & Styled Components
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  TypeScript
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Redux & Context API
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Backend & Data Science</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Python (Django, FastAPI, Flask)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Node.js & Express
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  TensorFlow & PyTorch
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  SQL & NoSQL Databases
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Data Analysis & Visualization
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-teal-500">DevOps & Tools</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Docker & Kubernetes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  CI/CD Pipelines
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Cloud Services (AWS, GCP)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Git & Version Control
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Testing & Performance Optimization
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center py-12"
        >
          <h2 className="text-2xl font-bold mb-4">Interested in working together?</h2>
          <p className="text-lg text-gray-400 mb-6">I'm always open to discussing new projects and opportunities.</p>
          <Link to="/contact" className="btn glow-on-hover">
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Development Projects" />

export default DevelopmentProjects
