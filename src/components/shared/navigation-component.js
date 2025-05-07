import React, { useEffect, useRef, useState } from "react"
import { Link, navigate } from "gatsby"
import { motion } from "framer-motion"
import { gsap } from "gsap"

const Navigation = ({ currentSection = "home" }) => {
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Updated navigation links configuration
  const navLinks = [
    { id: "home", label: "Home", path: "/" },
    { id: "data-science", label: "Data Science", path: "/data-science" },
    { id: "dev-projects", label: "Development Projects", path: "/Development-projects" },
    { id: "stories", label: "Stories & More", path: "/stories" },
    { id: "about", label: "About", path: "/about" },
    { id: "contact", label: "Contact", path: "/contact" }
  ];

  // Position the indicator based on the active link
  const positionIndicator = () => {
    if (!navRef.current || !indicatorRef.current) return;
    
    const activeItem = navRef.current.querySelector(`li[data-section="${currentSection}"]`);
    if (!activeItem) return;

    gsap.to(indicatorRef.current, {
      width: activeItem.offsetWidth - 20, // accounting for padding
      x: activeItem.offsetLeft + 10, // centering
      duration: 0.4,
      ease: "power3.out"
    });
  };

  // Update indicator on mount and when section changes
  useEffect(() => {
    positionIndicator();
    
    // Handle window resize
    const handleResize = () => positionIndicator();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSection]);

  return (
    <nav 
      className="futuristic-navigation"
      ref={navRef}
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "1rem 0",
      }}
    >
      <motion.div 
        className="nav-indicator" 
        ref={indicatorRef}
        style={{ 
          position: 'absolute',
          bottom: '8px',
          height: '3px',
          background: 'var(--primary-color)',
          borderRadius: '1px',
          zIndex: 1,
          boxShadow: 'var(--neon-glow)'
        }}
        layoutId="navIndicator"
      />
      
      <ul 
        style={{
          display: "flex",
          listStyle: "none",
          margin: 0,
          padding: 0,
          gap: "1rem"
        }}
        role="menubar"
        aria-label="Main Navigation"
      >
        {navLinks.map(link => (
          <li 
            key={link.id}
            data-section={link.id}
            style={{
              position: "relative",
              padding: 0,
              margin: 0
            }}
            role="none"
          >
            <Link
              to={link.path}
              onMouseEnter={() => setHoveredItem(link.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onFocus={() => setHoveredItem(link.id)}
              onBlur={() => setHoveredItem(null)}
              style={{
                position: "relative",
                display: "block",
                padding: "0.5rem 1rem",
                color: currentSection === link.id ? 'var(--primary-color)' : 'var(--text-primary)',
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: currentSection === link.id ? 600 : 400,
                fontSize: "1rem",
                letterSpacing: "0.5px",
                transition: "color 0.3s ease, font-weight 0.3s ease, transform 0.2s ease",
                textShadow: currentSection === link.id ? 'var(--neon-glow)' : 'none',
                textDecoration: "none",
                outline: "none"
              }}
              className="nav-link"
              role="menuitem"
              aria-current={currentSection === link.id ? "page" : undefined}
            >
              {/* Hover/Focus glow effect */}
              {hoveredItem === link.id && (
                <motion.div
                  layoutId="hoverGlow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle, rgba(0,128,128,0.1) 0%, rgba(0,0,0,0) 70%)",
                    borderRadius: "4px",
                    pointerEvents: "none",
                    zIndex: -1
                  }}
                />
              )}
              
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
