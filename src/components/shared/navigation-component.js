import React, { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "gatsby"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { useLocation } from "@reach/router"

// Navigation links configuration (moved outside component to prevent recreation)
const navLinks = [
  { id: "home", label: "Home", path: "/" },
  { id: "dev-projects", label: "Development Projects", path: "/development-projects" },
  { id: "stories", label: "Stories & More", path: "/stories" },
  { id: "about", label: "About", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact" }
];

const Navigation = () => {
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  // Position the indicator based on the active link (wrapped in useCallback)
  const positionIndicator = useCallback(() => {
    if (!navRef.current || !indicatorRef.current) return;

    // Find the active item based on the current location path
    const activeLink = navLinks.find(link =>
      location.pathname === link.path ||
      (link.path !== "/" && location.pathname.startsWith(link.path + "/"))
    );

    if (!activeLink) {
      // Hide indicator if no active link (e.g., 404 page)
      gsap.to(indicatorRef.current, { width: 0, duration: 0.4, ease: "power3.out" });
      return;
    }

    // Find the corresponding DOM element
    const activeItem = navRef.current.querySelector(`a[href="${activeLink.path}"]`);
    if (!activeItem) return;

    gsap.to(indicatorRef.current, {
      width: activeItem.offsetWidth - 20, // accounting for padding
      x: activeItem.offsetLeft + 10, // centering
      duration: 0.4,
      ease: "power3.out"
    });
  }, [location.pathname]); // Dependencies: location.pathname

  // Update indicator on mount and when location changes
  useEffect(() => {
    positionIndicator();

    // Handle window resize
    const handleResize = () => positionIndicator();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname, positionIndicator]); // Dependencies: location.pathname, positionIndicator

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
        aria-label="Main Navigation"
      >
        {navLinks.map(link => {
          const isActive = location.pathname === link.path || (link.path !== "/" && location.pathname.startsWith(link.path + "/"));
          return (
            <li
              key={link.id}
              data-section={link.id}
              style={{
                position: "relative",
                padding: 0,
                margin: 0
              }}
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
                  color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "1rem",
                  letterSpacing: "0.5px",
                  transition: "color 0.3s ease, font-weight 0.3s ease, transform 0.2s ease",
                  textShadow: isActive ? 'var(--neon-glow)' : 'none',
                  textDecoration: "none",
                  outline: "none"
                }}
                className="nav-link"
                aria-current={isActive ? "page" : undefined}
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
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
