import React, { useState } from "react"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"
import { motion } from "framer-motion"

export const Head = () => <Seo title="Contact" description="Get in touch with Dennis Carroll" />

export default function ContactPage({ location }) {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const endpoint = process.env.GATSBY_API_URL || '/api/contact'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, subject: 'Contact Page', honeypot: '' }),
      })
      const data = await response.json()
      if (!response.ok) {
        setFormStatus({ submitted: true, success: false, message: data.message || 'Error submitting form.' })
      } else {
        setFormStatus({ submitted: true, success: true, message: "Thanks! I'll get back to you soon." })
        setFormState({ name: "", email: "", message: "" })
      }
    } catch {
      setFormStatus({ submitted: true, success: false, message: 'Connection error. Please try again.' })
    }
    setIsSubmitting(false)
  }

  return (
    <Layout location={location}>
      <motion.section
        className="contact-section py-24 px-4 relative overflow-hidden min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            animate={{ opacity: 1, y: 0 }}
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

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-30" />
        </div>
      </motion.section>
    </Layout>
  )
}
