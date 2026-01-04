import React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import SpaceBackground from "../components/shared/space-background"
import HeroText from "../components/shared/hero-text"
import FeatureCard from "../components/shared/feature-card"
import { motion } from "framer-motion"

// Modern Futuristic Icons with teal color
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);


const IndexPage = ({ location }) => {
  // Featured work data
  const featuredWork = [
    {
      title: "Development Projects",
      description: "Building innovative applications, interactive tools, and data science projects",
      icon: <CodeIcon />,
      link: { url: "/development-projects", text: "View Projects →" }
    },
    {
      title: "Stories & More",
      description: "Creative writing and other explorations",
      icon: <PenIcon />,
      link: { url: "/stories", text: "Read More →" }
    },
    {
      title: "About Me",
      description: "Learn more about my background and expertise",
      icon: <UserIcon />,
      link: { url: "/about", text: "Learn More →" }
    }
  ];

  return (
    <Layout location={location}>
      {/* Hero Section with Particle Background */}
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
        <SpaceBackground />
        <div className="min-h-screen bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90 text-white">
          <div className="home-container max-w-6xl mx-auto px-4 py-12 relative z-10">
            {/* Hero Content */}
            <div className="flex flex-col min-h-[80vh] justify-center">
              <HeroText 
                title="Welcome to My Digital Universe"
                description="Exploring Data Science, Project Development, Creative Writing, and More"
              />
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                <Link to="/development-projects" className="glow-on-hover btn">
                  Development Projects
                </Link>
                <Link to="/contact" className="glow-on-hover btn btn-secondary">
                  Contact Me
                </Link>
                <Link to="/stories" className="glow-on-hover btn">
                  Stories & More
                </Link>
              </motion.div>
              
              {/* Scroll Indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2.2 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="w-6 h-10 border-2 border-teal-500/50 rounded-full flex justify-center p-1"
                >
                  <motion.div 
                    animate={{ 
                      height: ["20%", "30%", "20%"],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-1 bg-teal-500 rounded-full"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
          
      {/* Featured Work Section */}
      <motion.section 
        className="featured-work py-32 px-8 md:px-20 lg:px-32 bg-gradient-to-b from-black via-black/95 to-gray-900/90 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text break-words">
              Featured Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredWork.map((item, index) => (
                <FeatureCard 
                  key={index}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        </motion.section>
    </Layout>
  )
}

export const Head = ({ location }) => <Seo title="Home" pathname={location.pathname} />

export default IndexPage
