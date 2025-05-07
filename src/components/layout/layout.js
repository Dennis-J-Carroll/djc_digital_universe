import React, { useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"
import "../../styles/global.css"
import "../../styles/futuristic-ui.css"
import Header from "./header.js"
import Footer from "./footer.js"
import { Helmet } from "react-helmet"
import SpaceBackground from "../shared/space-background"
import { initAllAnimations } from "../../scripts/animations"
import Navigation from "../shared/navigation-component"

// This ensures Tailwind styles are included
import "../../styles/tailwind.css"

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
    if (path.includes("/data-science")) return "data-science";
    if (path.includes("/Development-projects")) return "dev-projects";
    if (path.includes("/stories")) return "stories";
    if (path.includes("/about")) return "about";
    if (path.includes("/contact")) return "contact";
    if (path.includes("/blog")) return "blog";
    return "home";
  }

  useEffect(() => {
    // Initialize the default theme
    document.body.classList.add('dark-theme');
    
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

      <div className="site-wrapper min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Add the space background to all pages */}
        {getCurrentSection() !== "home" && <SpaceBackground />}
        
        <Header siteTitle={siteTitle} currentSection={getCurrentSection()} />
        
        {/* Main Navigation */}
        <div className="navigation-container py-4 mt-20 sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-teal-900/30">
          <Navigation currentSection={getCurrentSection()} />
        </div>
        
        <main className="relative z-10">{children}</main>
        
        <Footer siteTitle={siteTitle} />
      </div>
    </>
  )
}

export default Layout
