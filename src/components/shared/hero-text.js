import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./shared.css";

const HeroText = ({ title, description }) => {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullName = "Dennis J. Carroll";

  // Typing effect for the name
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullName.length) {
        setTypedText(fullName.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Start cursor blinking after typing completes
        setTimeout(() => {
          setShowCursor(false);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    if (typedText.length < fullName.length) return;

    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    const timeout = setTimeout(() => {
      clearInterval(blinkInterval);
      setShowCursor(false);
    }, 3000);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(timeout);
    };
  }, [typedText]);

  return (
    <div className="hero-text-container">
      {/* Main name display with typing animation */}
      <div className="hero-name-container">
        <motion.div
          className="hero-name-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero-name-text">
            {typedText.split("").map((char, index) => (
              <span
                key={index}
                className={`hero-letter ${char === " " ? "space" : char === "J" || char === "." ? "accent" : "primary"
                  }`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
          <motion.span
            className={`typing-cursor ${showCursor ? 'visible' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            |
          </motion.span>
        </motion.div>

        {/* Glowing underline animation */}
        <motion.div
          className="name-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: typedText.length === fullName.length ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>

      {/* Title with gradient effect - only show if title provided */}
      {title !== "" && (
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="hero-title enhanced-title"
        >
          <span className="title-line">{title || "Welcome to My Digital Universe"}</span>
        </motion.h1>
      )}

      {/* Description text with fade-in effect */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.4 }}
        className="hero-description enhanced-description"
      >
        {description || "Exploring Data Science, Project Development, Creative Writing, and More"}
      </motion.p>

      {/* Animated gradient divider */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "300px", opacity: 1 }}
        transition={{ duration: 1, delay: 2.8 }}
        className="hero-divider enhanced-divider"
      />

    </div>
  );
};

export default HeroText;
