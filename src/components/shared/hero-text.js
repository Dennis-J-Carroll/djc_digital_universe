import React from "react";
import { motion } from "framer-motion";

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
    <div className="text-center mb-16">
      {/* Main name display with letter animations */}
      <div className="mb-6 overflow-hidden">
        <div className="flex justify-center items-center space-x-1 md:space-x-2">
          {nameArray.map((letter, index) => (
            <motion.span
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className={`${letter === " " ? "w-4 md:w-6" : ""} inline-block`}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(2rem, 5vw, 5rem)",
                fontWeight: "700",
                color: letter === "J" ? "var(--accent-color)" : "var(--primary-color)",
                textShadow: letter === "J" ? "var(--accent-glow)" : "var(--neon-glow)",
              }}
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
        className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent gradient-text slide-in-left"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          backgroundImage: "linear-gradient(to right, #008080, #888888)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title || "Welcome to My Digital Universe"}
      </motion.h1>

      {/* Description text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="text-xl text-gray-400 max-w-2xl mx-auto slide-in-right"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {description || "Exploring Data Science, Project Development, Creative Writing, and More"}
      </motion.p>

      {/* Animated underline/divider */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "150px" }}
        transition={{ duration: 1, delay: 1.6 }}
        style={{ 
          height: "3px",
          background: "linear-gradient(90deg, transparent, var(--primary-color), transparent)",
          margin: "2rem auto",
          boxShadow: "var(--neon-glow)"
        }}
      />
    </div>
  );
};

export default HeroText;
