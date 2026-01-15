import React, { useState } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import SpaceBackground from "../components/shared/space-background"
import HeroText from "../components/shared/hero-text"
import FeatureCard from "../components/shared/feature-card"
import { motion } from "framer-motion"

// Modern Futuristic Icons with enhanced styling

const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AppsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const IndexPage = ({ location }) => {
  // Featured work data - updated for new structure
  const featuredWork = [
    {
      title: "Apps & Projects",
      description: "Explore AI tools, interactive visualizations, data science experiments, and full-stack development projects",
      icon: <AppsIcon />,
      link: { url: "/apps", text: "Explore →" }
    },
    {
      title: "Stories & More",
      description: "Creative writing, explorations, and imaginative narratives from my digital universe",
      icon: <PenIcon />,
      link: { url: "/stories", text: "Read More →" }
    },
    {
      title: "About Me",
      description: "Learn more about my background, skills, and the technologies I work with",
      icon: <UserIcon />,
      link: { url: "/about", text: "Learn More →" }
    }
  ];

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Contact form state
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = process.env.GATSBY_API_URL || '/api/contact';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, subject: 'Contact from Homepage', honeypot: '' }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormStatus({ submitted: true, success: false, message: data.message || 'Error submitting form.' });
      } else {
        setFormStatus({ submitted: true, success: true, message: "Thanks! I'll get back to you soon." });
        setFormState({ name: "", email: "", message: "" });
      }
    } catch {
      setFormStatus({ submitted: true, success: false, message: 'Connection error. Please try again.' });
    }
    setIsSubmitting(false);
  };

  return (
    <Layout location={location}>
      {/* Hero Section with Particle Background */}
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
        <SpaceBackground />
        <div className="min-h-screen bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90 text-white w-full">
          <div className="home-container max-w-6xl mx-auto px-4 py-12 relative z-10">
            {/* Hero Content */}
            <div className="flex flex-col min-h-[80vh] justify-center">
              <HeroText
                title=""
                description="Exploring Data Science, Project Development, Creative Writing, and More"
              />

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.2 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                <Link to="/apps" className="glow-on-hover btn btn-primary-enhanced">
                  Apps & Projects
                </Link>
                <a href="#contact" className="glow-on-hover btn btn-secondary">
                  Contact Me
                </a>
                <Link to="/about" className="glow-on-hover btn btn-ghost">
                  About Me
                </Link>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 3.5 }}
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
        className="featured-work py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black via-gray-900/95 to-gray-900/90 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={containerVariants}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={cardVariants}
          >
            <motion.span
              className="inline-block text-sm uppercase tracking-widest text-teal-400 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What I Do
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Featured Work
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore my latest projects, experiments, and creative endeavors across
              data science, web development, and digital storytelling.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
          >
            {featuredWork.map((item, index) => (
              <motion.div key={index} variants={cardVariants}>
                <FeatureCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  link={item.link}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        className="contact-section py-24 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge">Contact</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Get In Touch
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Have a question, want to collaborate, or just want to say hello? I'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            className="contact-form-card max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {formStatus.submitted && formStatus.success ? (
              <div className="contact-success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>{formStatus.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="contact-form-grid">
                  <div>
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="form-textarea"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-4 text-lg"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus.submitted && !formStatus.success && (
                  <p className="form-error">{formStatus.message}</p>
                )}
              </form>
            )}
          </motion.div>
        </div>

        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-30" />
        </div>
      </motion.section>


    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo
    title="Home"
    pathname={location.pathname}
    pageType="website"
    description="Dennis J. Carroll - Data Scientist & Developer. Explore my portfolio of data science projects, web applications, and creative writing."
  />
)

export default IndexPage
