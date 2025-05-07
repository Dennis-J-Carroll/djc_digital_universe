import React, { useEffect, useRef } from "react"
import { Link } from "gatsby"
import { gsap } from "gsap"

const Footer = ({ siteTitle }) => {
  const footerRef = useRef(null);
  const circuitRef = useRef(null);

  // List of quick links for the footer
  const quickLinks = [
    { label: "Home", url: "/" },
    { label: "Data Science", url: "/data-science" },
    { label: "Python Dev", url: "/python-dev" },
    { label: "Creative", url: "/stories" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" }
  ];

  // Setup animations on mount
  useEffect(() => {
    if (!footerRef.current) return;

    // Animate the circuit lines
    if (circuitRef.current) {
      const lines = circuitRef.current.querySelectorAll('.circuit-line');
      const dots = circuitRef.current.querySelectorAll('.circuit-dot');
      
      // Animate circuit lines
      gsap.fromTo(
        lines,
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 1.5, 
          stagger: 0.1, 
          ease: "power2.inOut",
          delay: 0.5
        }
      );
      
      // Animate circuit dots
      gsap.fromTo(
        dots,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.15, 
          ease: "back.out(2)",
          delay: 0.8
        }
      );
    }

    // Interaction observer for footer animation on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              footerRef.current.querySelectorAll('.footer-section'),
              { y: 20, opacity: 0 },
              { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                stagger: 0.15, 
                ease: "power2.out" 
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(footerRef.current);

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      style={{
        background: "linear-gradient(0deg, rgba(10, 14, 20, 0.9) 0%, rgba(10, 14, 20, 0.7) 50%, rgba(10, 14, 20, 0) 100%)",
        backdropFilter: "blur(10px)",
        padding: "5rem 2rem 2rem",
        position: "relative",
        zIndex: 10,
        marginTop: "4rem",
        borderTop: "1px solid rgba(120, 180, 255, 0.1)"
      }}
    >
      {/* Circuit decoration */}
      <div 
        ref={circuitRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "hidden"
        }}
      >
        {/* Horizontal Circuit Line */}
        <div className="circuit-line" style={{
          position: "absolute",
          top: "50px",
          left: "5%",
          width: "40%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--primary-color), transparent)",
          transformOrigin: "left center"
        }} />
        
        {/* Circuit Dot */}
        <div className="circuit-dot" style={{
          position: "absolute",
          top: "50px",
          left: "35%",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--primary-color)",
          boxShadow: "0 0 8px var(--primary-glow)",
          transform: "translateX(-50%) translateY(-50%)"
        }} />
        
        {/* Horizontal Circuit Line (right) */}
        <div className="circuit-line" style={{
          position: "absolute",
          top: "120px",
          right: "5%",
          width: "30%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--secondary-color), transparent)",
          transformOrigin: "right center"
        }} />
        
        {/* Circuit Dot (right) */}
        <div className="circuit-dot" style={{
          position: "absolute",
          top: "120px",
          right: "15%",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--secondary-color)",
          boxShadow: "0 0 8px var(--secondary-glow)",
          transform: "translateX(50%) translateY(-50%)"
        }} />
        
        {/* Vertical Circuit Line */}
        <div className="circuit-line" style={{
          position: "absolute",
          top: "50px",
          left: "35%",
          width: "2px",
          height: "70px",
          background: "linear-gradient(0deg, transparent, var(--primary-color), transparent)",
          transformOrigin: "center top"
        }} />
      </div>
      
      {/* Footer content grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "3rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Brand section */}
        <div className="footer-section">
          <div style={{
            marginBottom: "1rem"
          }}>
            <Link
              to="/"
              style={{
                color: "var(--text-primary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <div style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px var(--primary-glow)"
              }}>
                <span style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "monospace"
                }}>
                  DJC
                </span>
              </div>

              <span style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                backgroundImage: "linear-gradient(90deg, var(--text-primary), var(--primary-color))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Dennis J. Carroll
              </span>
            </Link>
          </div>
          
          <p style={{
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}>
            A personal showcase of data science projects, project development, creative writing, and more. Built with Gatsby and a passion for technology.
          </p>
          
          {/* Social Links */}
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem"
          }}>
            {/* GitHub */}
            <a 
              href="https://github.com/Dennis-J-Carroll" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-secondary)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "rgba(20, 30, 40, 0.5)",
                border: "1px solid rgba(120, 180, 255, 0.2)"
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(30, 40, 60, 0.8)",
                  borderColor: "var(--primary-color)",
                  color: "var(--primary-color)",
                  y: -5,
                  duration: 0.2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(20, 30, 40, 0.5)",
                  borderColor: "rgba(120, 180, 255, 0.2)",
                  color: "var(--text-secondary)",
                  y: 0,
                  duration: 0.2
                });
              }}
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </a>

            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/in/dennisjcarroll/" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-secondary)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "rgba(20, 30, 40, 0.5)",
                border: "1px solid rgba(120, 180, 255, 0.2)"
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(30, 40, 60, 0.8)",
                  borderColor: "var(--primary-color)",
                  color: "var(--primary-color)",
                  y: -5,
                  duration: 0.2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(20, 30, 40, 0.5)",
                  borderColor: "rgba(120, 180, 255, 0.2)",
                  color: "var(--text-secondary)",
                  y: 0,
                  duration: 0.2
                });
              }}
            >
              <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            {/* Twitter/X */}
            <a 
              href="https://x.com/denniscarrollj" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-secondary)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "rgba(20, 30, 40, 0.5)",
                border: "1px solid rgba(120, 180, 255, 0.2)"
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(30, 40, 60, 0.8)",
                  borderColor: "var(--primary-color)",
                  color: "var(--primary-color)",
                  y: -5,
                  duration: 0.2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "rgba(20, 30, 40, 0.5)",
                  borderColor: "rgba(120, 180, 255, 0.2)",
                  color: "var(--text-secondary)",
                  y: 0,
                  duration: 0.2
                });
              }}
            >
              <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Quick Links section */}
        <div className="footer-section">
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            color: "var(--accent-color)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            Quick Links
          </h3>
          
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0
          }}>
            {quickLinks.map((link, index) => (
              <li key={index} style={{ marginBottom: "0.75rem" }}>
                <Link
                  to={link.url}
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.25rem 0",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      color: "var(--primary-color)",
                      paddingLeft: "0.5rem",
                      duration: 0.2
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      color: "var(--text-secondary)",
                      paddingLeft: 0,
                      duration: 0.2
                    });
                  }}
                >
                  <span style={{
                    opacity: 0.5,
                    fontSize: "0.75rem"
                  }}>
                    &gt;
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Contact section */}
        <div className="footer-section">
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            color: "var(--accent-color)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Stay Updated
          </h3>
          
          <p style={{ 
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            marginBottom: "1rem"
          }}>
            Sign up for updates on new projects and content.
          </p>
          
          {/* Newsletter Signup Form (placeholder) */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(120, 180, 255, 0.2)",
                background: "rgba(15, 20, 30, 0.6)",
                color: "var(--text-primary)",
                width: "100%",
                fontSize: "0.9rem"
              }}
            />
            <button
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "none",
                background: "var(--primary-color)",
                color: "var(--bg-dark)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "color-mix(in srgb, var(--primary-color) 80%, white)",
                  boxShadow: "0 0 15px var(--primary-glow)",
                  scale: 1.02,
                  duration: 0.2
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "none",
                  scale: 1,
                  duration: 0.2
                });
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer bottom - copyright */}
      <div style={{
        borderTop: "1px solid rgba(120, 180, 255, 0.1)",
        marginTop: "3rem",
        paddingTop: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        fontSize: "0.85rem",
        color: "var(--text-secondary)"
      }}>
        <div>
          © {currentYear} {siteTitle || "Everything"}. All rights reserved.
        </div>
        
        <div style={{
          display: "flex",
          gap: "1.5rem"
        }}>
          <Link 
            to="/privacy"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                color: "var(--primary-color)",
                duration: 0.2
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                color: "var(--text-secondary)",
                duration: 0.2
              });
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                color: "var(--primary-color)",
                duration: 0.2
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                color: "var(--text-secondary)",
                duration: 0.2
              });
            }}
          >
            Terms of Use
          </Link>
        </div>
      </div>
      
      {/* Add keyframe animation for logo glow effect */}
      <style>
        {`
          @keyframes logoGlow {
            0%, 100% { transform: rotate(-45deg) translateX(-100%); }
            50% { transform: rotate(-45deg) translateX(100%); }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
