import React, { useEffect, lazy, Suspense } from "react"
import { useStaticQuery, graphql } from "gatsby"
import "../../styles/global.css"
import "../../styles/futuristic-ui.css"
import Header from "./header.js"
import Footer from "./footer.js"
import { Helmet } from "react-helmet"
import { initAllAnimations } from "../../scripts/animations"
import Navigation from "../shared/navigation-component"
import ErrorBoundary from "../shared/error-boundary"
import InteractiveCursor from "../shared/interactive-cursor"

// This ensures Tailwind styles are included
import "../../styles/tailwind.css"

// Lazy load SpaceBackground for better initial bundle size
const SpaceBackground = lazy(() => import("../shared/space-background"))

const Layout = ({ children, pageContext, location }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const siteTitle = data.site.siteMetadata?.title || "Dennis J. Carroll"

  // Determine current section based on pathname
  const getCurrentSection = () => {
    const path = location?.pathname || "";
    if (path.includes("/development-projects")) return "dev-projects";
    if (path.includes("/apps")) return "apps";
    if (path.includes("/stories")) return "stories";
    if (path.includes("/about")) return "about";
    if (path.includes("/contact")) return "contact";
    if (path.includes("/blog")) return "blog";
    return "home";
  }

  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      // Only add if no theme class exists
      const hasTheme = document.body.className.includes('-theme');
      if (!hasTheme) {
        document.body.classList.add(savedTheme + '-theme');
      }
    }

    // Initialize animations
    const cleanupAnimations = initAllAnimations();

    return () => {
      // Cleanup animations when component unmounts
      if (cleanupAnimations) cleanupAnimations();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content="A comprehensive personal website showcasing data science, project development, creative writing, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Interactive Cursor Effect */}
      <InteractiveCursor />

      <div className="site-wrapper min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Lazy load space background for better performance */}
        {getCurrentSection() !== "home" && (
          <Suspense fallback={<div className="space-background-placeholder" />}>
            <SpaceBackground />
          </Suspense>
        )}

        <Header siteTitle={siteTitle} currentSection={getCurrentSection()} />

        <ErrorBoundary>
          <main id="main-content" className="relative z-10" style={{ paddingTop: '8rem' }}>{children}</main>
        </ErrorBoundary>

        <Footer siteTitle={siteTitle} />
      </div>
    </>
  )
}

export default Layout
