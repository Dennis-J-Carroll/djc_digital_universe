import React, { useState } from "react"
import { motion } from "framer-motion"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const ContactPage = ({ location }) => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ""
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});
  // State for loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Use relative path that works with both Netlify and Vercel
      // Netlify will rewrite this to /.netlify/functions/contact
      // Vercel will use /api/contact directly
      const endpoint = process.env.GATSBY_API_URL || '/api/contact';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formState,
          // Empty honeypot field for spam protection
          honeypot: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errors = {};
          data.errors.forEach(err => {
            errors[err.field] = err.message;
          });
          setFormErrors(errors);
        }
        
        setFormStatus({
          submitted: true,
          success: false,
          message: data.message || 'There was an error submitting the form. Please try again.'
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      setFormStatus({
        submitted: true,
        success: true,
        message: data.message || "Thanks for your message! I'll get back to you soon."
      });
      
      // Reset form after submission
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus({
        submitted: true,
        success: false,
        message: 'There was a problem connecting to the server. Please try again later.'
      });
    }
    
    setIsSubmitting(false);
  };

  // Social links data
  const socialLinks = [
    {
      name: "GitHub",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      url: "https://github.com/Dennis-J-Carroll"
    },
    {
      name: "LinkedIn",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      url: "https://www.linkedin.com/in/dennisjcarroll/"
    },
    {
      name: "Twitter",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      ),
      url: "https://twitter.com/denniscarrollj"
    },
    {
      name: "Email",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      url: "mailto:contact@denniscarroll.com"
    }
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
            Contact Me
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-teal-900/30"
          >
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            
            {formStatus.submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-teal-900/20 border border-teal-500/30 text-center"
                aria-live="polite"
                role="status"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-teal-400 font-medium text-lg">{formStatus.message}</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                aria-label="Contact form"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-black/50 border ${formErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200`}
                    aria-invalid={formErrors.name ? "true" : "false"}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-black/50 border ${formErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200`}
                    aria-invalid={formErrors.email ? "true" : "false"}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-black/50 border ${formErrors.subject ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200`}
                    aria-invalid={formErrors.subject ? "true" : "false"}
                    aria-describedby={formErrors.subject ? "subject-error" : undefined}
                  />
                  {formErrors.subject && (
                    <p id="subject-error" className="mt-1 text-sm text-red-500">{formErrors.subject}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    className={`w-full px-4 py-2 bg-black/50 border ${formErrors.message ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200`}
                    aria-invalid={formErrors.message ? "true" : "false"}
                    aria-describedby={formErrors.message ? "message-error" : undefined}
                  ></textarea>
                  {formErrors.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-500">{formErrors.message}</p>
                  )}
                </div>
                
                {/* Hidden honeypot field for spam protection */}
                <div className="hidden" aria-hidden="true">
                  <label>
                    Leave this field empty
                    <input
                      type="text"
                      name="honeypot"
                      tabIndex="-1"
                      autoComplete="off"
                    />
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="btn glow-on-hover w-full py-3 relative"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">Send Message</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </motion.div>
          
          {/* Contact Info & Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-teal-900/30 mb-8">
              <h2 className="text-2xl font-bold mb-6">Connect With Me</h2>
              
              <ul className="space-y-6">
                {socialLinks.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-300 hover:text-teal-400 transition duration-300"
                      whileHover={{ x: 5 }}
                      aria-label={`Visit my ${link.name} profile`}
                    >
                      <span className="bg-teal-900/30 p-3 rounded-full mr-4 text-teal-500">
                        {link.icon}
                      </span>
                      <span className="text-lg">{link.name}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-teal-900/30">
              <h2 className="text-2xl font-bold mb-6">Office Hours</h2>
              
              <div className="space-y-4">
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Monday - Friday:</span>
                  <span>9:00 AM - 5:00 PM EST</span>
                </p>
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Saturday:</span>
                  <span>By appointment</span>
                </p>
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Sunday:</span>
                  <span>Closed</span>
                </p>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-400">
                  Response time: <span className="text-white">Within 24-48 hours</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Contact" />

export default ContactPage
