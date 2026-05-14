import React from "react";
import { motion } from "framer-motion";
import "./shared.css";

const fullName = "Dennis J. Carroll";

const HeroText = ({ title, description }) => {
  return (
    <div className="hero-text-container">
      <div className="hero-name-container">
        <div className="hero-name-wrapper">
          <span className="hero-name-text">
            {fullName.split("").map((char, index) => (
              <span
                key={index}
                className={`hero-letter ${
                  char === " " ? "space" : char === "J" || char === "." ? "accent" : "primary"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </div>

        <motion.div
          className="name-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
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
