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
    // Site is locked to dark theme — see THEME.md for how to bring other themes back
    if (typeof window !== 'undefined') {
      document.body.classList.add('dark-theme');
    }

    // Initialize animations
    const cleanupAnimations = initAllAnimations();

    return () => {
      // Cleanup animations when component unmounts
      if (cleanupAnimations) cleanupAnimations();
    }
  }, []);

  // Homepage sections are full-bleed (each constrains its own inner content),
  // so <main> must not cage them to the global 1200px max-width.
  const isHomePage = location?.pathname === "/";

  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Fonts injected via async script in gatsby-ssr.js — no blocking link here */}
      </Helmet>

      {/* Interactive Cursor Effect */}
      <InteractiveCursor />

      <div className="site-wrapper min-h-screen text-white">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Lazy load space background for better performance — every page
            except the homepage, which mounts its own inside the hero.
            (getCurrentSection() must not gate this: it has no /research case,
            so the research page was silently losing the particle canvas.) */}
        {!isHomePage && (
          <Suspense fallback={<div className="space-background-placeholder" />}>
            <SpaceBackground />
          </Suspense>
        )}

        <Header siteTitle={siteTitle} currentSection={getCurrentSection()} />

        <ErrorBoundary>
          <main id="main-content" className={`relative z-10${isHomePage ? " home-full-bleed" : ""}`} style={{ paddingTop: '8rem' }}>{children}</main>
        </ErrorBoundary>

        <Footer siteTitle={siteTitle} />
      </div>
    </>
  )
}

export default Layout
