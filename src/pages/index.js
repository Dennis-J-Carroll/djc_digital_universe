import React, { useState, lazy, Suspense } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import HeroText from "../components/shared/hero-text"
import FeatureCard from "../components/shared/feature-card"
import { motion } from "framer-motion"

const SpaceBackground = lazy(() => import("../components/shared/space-background"))

// App preview icons — abstract hints of each app's aesthetic
const HypersphereIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.85"/>
    <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    <ellipse cx="16" cy="16" rx="6" ry="12" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
    <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
  </svg>
);

const ChromaEchoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="2.5" fill="#00f0ff" opacity="0.9"/>
    <circle cx="7"  cy="10" r="1.5" fill="#ff4da6" opacity="0.8"/>
    <circle cx="25" cy="9"  r="1.5" fill="#00f0ff" opacity="0.75"/>
    <circle cx="24" cy="24" r="2"   fill="#7c4dff" opacity="0.85"/>
    <circle cx="9"  cy="23" r="1.5" fill="#ff4da6" opacity="0.7"/>
    <circle cx="20" cy="6"  r="1"   fill="#00f0ff" opacity="0.6"/>
    <circle cx="5"  cy="18" r="1"   fill="#ff4da6" opacity="0.5"/>
    <circle cx="28" cy="18" r="1.5" fill="#7c4dff" opacity="0.65"/>
    <line x1="16" y1="16" x2="7"  y2="10" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3"/>
    <line x1="16" y1="16" x2="25" y2="9"  stroke="#ff4da6" strokeWidth="0.5" opacity="0.3"/>
    <line x1="16" y1="16" x2="24" y2="24" stroke="#7c4dff" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

const FrequencyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3"  y="14" width="3" height="6"  fill="currentColor" opacity="0.5"/>
    <rect x="8"  y="9"  width="3" height="16" fill="currentColor" opacity="0.7"/>
    <rect x="13" y="4"  width="3" height="26" fill="currentColor" opacity="0.95"/>
    <rect x="18" y="10" width="3" height="14" fill="currentColor" opacity="0.75"/>
    <rect x="23" y="13" width="3" height="8"  fill="currentColor" opacity="0.55"/>
    <rect x="28" y="15" width="1.5" height="4" fill="currentColor" opacity="0.35"/>
  </svg>
);

const MechInterpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0,1,2,3].flatMap(i => [0,1,2,3].map(j => (
      <circle key={`${i}-${j}`}
        cx={4 + i * 8} cy={4 + j * 8} r="1.8"
        fill="currentColor"
        opacity={i === j || i + j === 3 ? 0.9 : 0.18}
      />
    )))}
    <line x1="4"  y1="4"  x2="12" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    <line x1="28" y1="4"  x2="20" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    <line x1="4"  y1="28" x2="12" y2="20" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    <line x1="28" y1="28" x2="20" y2="20" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
  </svg>
);

const IndexPage = ({ location }) => {
  // Three highest-quality standalone apps — direct launch links
  const featuredWork = [
    {
      title: "Hypersphere Explorer",
      description: "Live Three.js visualization of spheres, cylinders, and 4D hyperspheres with KaTeX math that updates in real time as you drag sliders. Three guided tours walk through Archimedes' 2:3 ratio, 4D slicing, and the curse of dimensionality.",
      icon: <HypersphereIcon />,
      link: { url: "/apps/sphere_cylinder_hypersphere.html", text: "Launch →" }
    },
    {
      title: "Chroma Echo",
      description: "Audio-reactive particle canvas where mic input drives burst patterns and a built-in keyboard (A–K) plays synth tones that spawn particles mapped to pitch. Five choreography patterns — firework, vortex, spiral, rain, shockwave — fire from a single keystroke.",
      icon: <ChromaEchoIcon />,
      link: { url: "/apps/Chroma_Echo.html", text: "Launch →" }
    },
    {
      title: "Mech Interp Viz",
      description: "Research-grade mechanistic interpretability workspace for transformer models. Visualize attention heads and MLP blocks across every layer, annotate components with importance levels and tags, and export findings as structured data.",
      icon: <MechInterpIcon />,
      link: { url: "/apps/mechmap.html", text: "Launch →" }
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

  const encode = (data) =>
    Object.keys(data)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
      .join("&");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...formState }),
      });
      if (response.ok) {
        setFormStatus({ submitted: true, success: true, message: "Thanks! I'll get back to you soon." });
        setFormState({ name: "", email: "", message: "" });
      } else {
        setFormStatus({ submitted: true, success: false, message: "Something went wrong. Try again or email denniscarrollj@gmail.com directly." });
      }
    } catch {
      setFormStatus({ submitted: true, success: false, message: "Connection error. Please try again." });
    }
    setIsSubmitting(false);
  };

  return (
    <Layout location={location}>
      {/* Hero Section with Particle Background */}
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
        <Suspense fallback={null}>
          <SpaceBackground />
        </Suspense>
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
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                <Link to="/apps" className="glow-on-hover btn btn-primary-enhanced">
                  Apps & Projects
                </Link>
                <Link to="/research" className="glow-on-hover btn btn-secondary">
                  Research
                </Link>
                <a
                  href="#contact"
                  className="glow-on-hover btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
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
                transition={{ duration: 1, delay: 0.8 }}
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

      {/* Research Pointer Section */}
      <motion.section
        className="research-pointer py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-gray-900/90 to-black relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={containerVariants}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
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
              Research
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Latest Research
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Mechanistic interpretability papers, traced from attention heads down to SAE features.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center"
            variants={containerVariants}
          >
            <motion.div className="w-full max-w-2xl" variants={cardVariants}>
              <FeatureCard
                title="The Frequency Prior Series"
                description="How GPT-2 encodes and yields to training-frequency priors — traced from attention heads down to SAE features. Every result from real-model inference, now explorable in an interactive companion app."
                icon={<FrequencyIcon />}
                links={[
                  { url: "/research", text: "Read the Research →", internal: true, primary: true },
                  { url: "/apps/frequency-prior-explorer/", text: "Launch the Explorer", internal: false }
                ]}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

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
              Live Apps
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Featured Apps
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Three standalone interactive apps — open them in any browser, no install required.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
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

      {/* Research Pointer Section */}
      <motion.section
        className="research-pointer py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-gray-900/90 to-black relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.span
            className="inline-block text-sm uppercase tracking-widest text-teal-400 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Research
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            The Frequency Prior Series
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Mechanistic interpretability papers on how GPT-2 encodes and yields to
            training-frequency priors — traced from attention heads down to SAE features.
            Every result from real-model inference, now explorable in an interactive companion app.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/research" className="glow-on-hover btn btn-primary-enhanced">
              Read the Research →
            </Link>
            <a href="/apps/frequency-prior-explorer/" className="glow-on-hover btn btn-secondary">
              Launch the Explorer
            </a>
          </div>
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
              <div className="contact-success" role="alert" aria-live="polite">
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
                  <p className="form-error" role="alert" aria-live="assertive">{formStatus.message}</p>
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
