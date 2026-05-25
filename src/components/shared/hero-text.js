import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./shared.css";

const fullName = "Dennis J. Carroll";

const HeroText = ({ title, description }) => {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') { setFontReady(true); return; }
    if (!document.fonts?.load) { setFontReady(true); return; }
    // Load the exact weight used by .hero-letter (800) — waits for Orbitron to be ready
    document.fonts.load('800 1em Orbitron').then(() => {
      setFontReady(true);
    }).catch(() => {
      // Font failed or timed out — show anyway so name isn't invisible forever
      setFontReady(true);
    });
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
        animate={{ width: "300px", opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="hero-divider enhanced-divider"
      />
    </div>
  );
};

export default HeroText;
