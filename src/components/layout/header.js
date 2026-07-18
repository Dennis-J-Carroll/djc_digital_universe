import React, { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "gatsby"
import { gsap } from "gsap"
import { NAV_LINKS as ALL_NAV_LINKS } from "../../constants"

// Contact is an inline section on the homepage — exclude from global nav
const NAV_LINKS = ALL_NAV_LINKS.filter(l => l.id !== 'contact');

const SOCIAL_ICONS = [
  {
    href: "https://github.com/Dennis-J-Carroll",
    label: "GitHub",
    svg: (
      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/denniscarrollj",
    label: "X (Twitter)",
    svg: (
      <svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/dennisjcarroll/",
    label: "LinkedIn",
    svg: (
      <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const Header = ({ siteTitle }) => {
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      setIsScrolled(true);
      const scrolledBg =
        currentTheme === 'light'          ? "rgba(240, 240, 245, 0.92)" :
        currentTheme === 'tokyo-afternoon'? "rgba(232, 220, 204, 0.95)" :
        currentTheme === 'retro-80s'      ? "rgba(26, 10, 40, 0.92)"   :
                                            "rgba(10, 14, 20, 0.9)";
      const scrolledBorder =
        isLightBg ? "1px solid rgba(100, 90, 70, 0.2)" : "1px solid rgba(120, 180, 255, 0.1)";
      gsap.to(headerRef.current, {
        backgroundColor: scrolledBg,
        backdropFilter: "blur(12px)",
        borderBottom: scrolledBorder,
        padding: "0.5rem 2rem",
        duration: 0.3
      });
    } else {
      setIsScrolled(false);
      gsap.to(headerRef.current, {
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0)",
        padding: "1rem 2rem",
        duration: 0.3
      });
    }
  }, [currentTheme]);

  useEffect(() => {
    if (!headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    if (typeof window !== 'undefined') {
      document.body.classList.add('dark-theme');
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (typeof window !== 'undefined') window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const isLightBg = false;

  const iconStyle = {
    color: isLightBg && isScrolled ? "var(--primary-color)" : "var(--text-secondary)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    background: isLightBg ? "rgba(200, 195, 185, 0.45)" : "rgba(15, 20, 30, 0.5)",
    backdropFilter: "blur(8px)",
    border: isLightBg ? "1px solid rgba(100, 90, 70, 0.2)" : "1px solid rgba(120, 180, 255, 0.1)",
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 200,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.3s ease",
          color: currentTheme === 'light' && isScrolled ? "var(--primary-color)" : "var(--text-primary)",
          pointerEvents: "auto"
        }}
      >
        {/* Logo */}
        <div
          ref={logoRef}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", animation: "djc-logo-float 2s ease-in-out infinite alternate" }}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div className="logo-icon" style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 15px var(--primary-glow)"
            }}>
              <div style={{
                position: "absolute",
                width: "150%",
                height: "50%",
                background: "rgba(255, 255, 255, 0.3)",
                transform: "rotate(-45deg) translateX(-100%)",
                animation: "logoGlow 3s ease-in-out infinite"
              }} />
              <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "white", fontFamily: "monospace", zIndex: 1 }}>
                DJC
              </div>
            </div>

            <span style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              letterSpacing: "0.5px",
              color: currentTheme === 'light' && isScrolled ? "var(--primary-color)" : "inherit",
              transition: "color 0.3s ease"
            }}>
              Dennis J. Carroll
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link-item"
                style={{
                  color: currentTheme === 'light' && isScrolled ? "var(--text-primary)" : "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                activeStyle={{ color: "var(--primary-color)", fontWeight: "600" }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    backgroundColor: currentTheme === 'light' ? "rgba(0,111,174,0.1)" : "rgba(0,188,212,0.1)",
                    color: "var(--primary-color)",
                    duration: 0.2
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    backgroundColor: "transparent",
                    color: currentTheme === 'light' && isScrolled ? "var(--text-primary)" : "var(--text-secondary)",
                    duration: 0.2
                  });
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop controls: socials + theme */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={iconStyle}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      backgroundColor: "rgba(30,40,60,0.6)",
                      borderColor: "rgba(120,180,255,0.3)",
                      color: "var(--primary-color)",
                      boxShadow: "0 0 10px var(--primary-glow)",
                      scale: 1.1,
                      duration: 0.2
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      backgroundColor: "rgba(15,20,30,0.5)",
                      borderColor: "rgba(120,180,255,0.1)",
                      color: currentTheme === 'light' && isScrolled ? "var(--primary-color)" : "var(--text-secondary)",
                      boxShadow: "none",
                      scale: 1,
                      duration: 0.2
                    });
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              background: isLightBg ? "rgba(200, 195, 185, 0.5)" : "rgba(15, 20, 30, 0.5)",
              border: isLightBg ? "1px solid rgba(100, 90, 70, 0.25)" : "1px solid rgba(120, 180, 255, 0.2)",
              borderRadius: "8px",
              padding: "0.4rem 0.5rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "currentColor",
              borderRadius: "2px",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
              transition: "transform 0.25s ease",
            }} />
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "currentColor",
              borderRadius: "2px",
              opacity: menuOpen ? 0 : 1,
              transition: "opacity 0.2s ease",
            }} />
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "currentColor",
              borderRadius: "2px",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              transition: "transform 0.25s ease",
            }} />
          </button>
        )}
      </header>

      {/* Mobile drawer */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: menuOpen ? "60px" : "-100vh",
            left: 0,
            width: "100%",
            zIndex: 199,
            background:
              currentTheme === 'light'           ? "rgba(240, 240, 245, 0.97)" :
              currentTheme === 'tokyo-afternoon' ? "rgba(232, 220, 204, 0.98)" :
              currentTheme === 'retro-80s'       ? "rgba(26, 10, 40, 0.97)"   :
                                                   "rgba(10, 14, 20, 0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(120, 180, 255, 0.15)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            transition: "top 0.3s ease",
            boxShadow: menuOpen ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
          }}
          aria-hidden={!menuOpen}
        >
          {/* Nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "var(--text-primary)",
                textDecoration: "none",
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "500",
                borderBottom: "1px solid rgba(120,180,255,0.08)",
              }}
              activeStyle={{ color: "var(--primary-color)", fontWeight: "700" }}
            >
              {link.label}
            </Link>
          ))}

          {/* Socials row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(120,180,255,0.1)",
          }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  onClick={() => setMenuOpen(false)}
                  style={{ ...iconStyle, width: "2.5rem", height: "2.5rem" }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close drawer on outside tap */}
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 198,
            background: "rgba(0,0,0,0.3)",
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;
