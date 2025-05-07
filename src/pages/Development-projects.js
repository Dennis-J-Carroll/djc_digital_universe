import React from "react"
import { Link } from "gatsby"
import { motion } from "framer-motion"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import FeatureCard from "../components/shared/feature-card"

// Project Icons
const WebIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const ApiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path>
    <path d="M2 20h20"></path>
    <path d="M14 12v.01"></path>
  </svg>
);

const MobileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12" y2="18.01"></line>
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

const DevelopmentProjects = ({ location }) => {
  // Featured projects data
  const projects = [
    {
      title: "RESTful API Framework",
      description: "A scalable API framework built with Python and FastAPI, supporting authentication, rate limiting, and database integration.",
      icon: <ApiIcon />,
      link: { url: "/python-dev/sample-api", text: "View Project →" },
      tech: ["Python", "FastAPI", "PostgreSQL", "Docker"]
    },
    {
      title: "Web Portfolio",
      description: "Modern website built with Gatsby showcasing a modern futuristic UI with animations and responsive design.",
      icon: <WebIcon />,
      link: { url: "/", text: "View Project →" },
      tech: ["React", "Gatsby", "Tailwind CSS", "Framer Motion"]
    },
    {
      title: "AI-Powered Chatbot",
      description: "Natural language processing chatbot that can answer questions and provide information from a custom knowledge base.",
      icon: <AiIcon />,
      link: { url: "/python-dev/chatbot", text: "View Project →" },
      tech: ["Python", "TensorFlow", "NLP", "Flask"]
    },
    {
      title: "Mobile Task Manager",
      description: "Cross-platform mobile application for managing tasks with cloud synchronization and offline capabilities.",
      icon: <MobileIcon />,
      link: { url: "/python-dev/mobile-app", text: "View Project →" },
      tech: ["React Native", "Firebase", "Redux", "Expo"]
    }
  ];

  return (
    <Layout location={location}>
      <div className="max-w-6xl mx-auto px-4 py-16">
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
            Exploring full-stack development with a focus on modern technologies, clean architecture, and engaging user experiences.
          </p>
        </motion.div>

        {/* Featured Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 gradient-text">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <FeatureCard
                key={index}
                title={project.title}
                description={project.description}
                icon={project.icon}
                link={project.link}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Technologies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 py-12 px-6 rounded-xl bg-black/30 backdrop-blur-md border border-teal-900/30"
        >
          <h2 className="text-2xl font-bold mb-8 gradient-text text-center">Technologies & Skills</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4">
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
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4 text-teal-500">Backend</h3>
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
                  GraphQL & REST API design
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  SQL & NoSQL Databases
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                  Authentication & Authorization
                </li>
              </ul>
            </div>
            
            <div className="p-4">
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
          transition={{ duration: 0.8, delay: 0.6 }}
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
