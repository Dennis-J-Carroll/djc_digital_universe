import React from "react";
import { motion } from "framer-motion";
import "./shared.css";

const HeroText = ({ title, description }) => {
  // Animation variants for letter-by-letter animation
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
      },
    }),
  };

  const nameArray = "Dennis J. Carroll".split("");

  return (
    <div className="hero-text-container">
      {/* Main name display with letter animations */}
      <div className="hero-name-container">
        <div className="hero-name-wrapper">
          {nameArray.map((letter, index) => (
            <motion.span
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className={`hero-letter ${
                letter === " " ? "space" : letter === "J" ? "accent" : "primary"
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Title with gradient effect */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="hero-title text-4xl md:text-5xl font-bold mb-6 slide-in-left"
      >
        {title || "Welcome to My Digital Universe"}
      </motion.h1>

      {/* Description text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="hero-description text-xl max-w-2xl mx-auto slide-in-right"
      >
        {description || "Exploring Data Science, Project Development, Creative Writing, and More"}
      </motion.p>

      {/* Animated underline/divider */}
      <motion.div
        initial={{ width: 0 }}
        animate={{width: "250px" }}
        transition={{ duration: 1, delay: 1.6 }}
        className="hero-divider"
      />
    </div>
  );
};

export default HeroText;
