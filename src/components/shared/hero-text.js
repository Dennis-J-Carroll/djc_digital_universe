import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./shared.css";

const fullName = "Dennis J. Carroll";

// Tunable safety timeout for font loading to ensure the hero text is revealed
// even under poor network conditions or CDN outages.
const FONT_TIMEOUT_MS = 2000;

const HeroText = ({ title, description }) => {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') { setFontReady(true); return; }
    if (!document.fonts?.load) { setFontReady(true); return; }

    // Start a safety timeout to reveal the name regardless of whether the font loads
    const timeoutId = setTimeout(() => {
      setFontReady(true);
    }, FONT_TIMEOUT_MS);

    // Load the exact weight used by .hero-letter (800) — waits for Orbitron to be ready
    document.fonts.load('800 1em Orbitron')
      .then(() => {
        clearTimeout(timeoutId);
        setFontReady(true);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // Font failed — show anyway in fallback font so name isn't invisible forever
        setFontReady(true);
      });

    // Cleanup timeout on component unmount to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="hero-text-container">
      <div className="hero-name-container">
        <div className="hero-name-wrapper">
          <h1 className="hero-name-text" aria-label="Dennis J. Carroll" data-ready={fontReady ? "true" : "false"}>
            {fullName.split("").map((char, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`hero-letter ${
                  char === " " ? "space" : char === "J" || char === "." ? "accent" : "primary"
                }`}
                style={fontReady ? { animationDelay: `${index * 0.05}s` } : { animation: 'none', opacity: 0 }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        <div className="name-underline" />
      </div>

      {title !== "" && (
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hero-title enhanced-title"
        >
          <span className="title-line">{title || "Welcome to My Digital Universe"}</span>
        </motion.h1>
      )}

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hero-description enhanced-description"
      >
        {description || "Exploring Data Science, Project Development, Creative Writing, and More"}
      </motion.p>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="hero-divider enhanced-divider"
      />
    </div>
  );
};

export default HeroText;
