/**
 * animations.js - Handles animations and effects for the personal website
 * Note: Fade-in animations have been migrated to use framer-motion's whileInView
 * instead of the custom IntersectionObserver implementation
 */

// Glow on hover effect for buttons and other elements
export const initGlowEffects = () => {
  if (typeof window !== 'undefined') {
    const glowElements = document.querySelectorAll('.glow-on-hover');
    
    glowElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        // Add custom glow effect logic if needed beyond CSS
      });
      
      element.addEventListener('mouseleave', () => {
        // Cleanup or reset effects
      });
    });
  }
};

// Initialize all animations - call this from a layout component
export const initAllAnimations = () => {
  initGlowEffects();
  
  // Return cleanup function for React useEffect
  return () => {
    // Add cleanup logic here if needed
  };
};

// Note: For components previously using .fade-in-section, 
// use framer-motion's whileInView prop instead:
/*
  Example usage with framer-motion:
  
  import { motion } from "framer-motion";
  
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration: 0.6 }}
  >
    Your content here
  </motion.div>
*/
