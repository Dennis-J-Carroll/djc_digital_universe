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

      <style jsx>{`
        .hero-text-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .hero-name-container {
          position: relative;
          margin-bottom: 2rem;
        }

        .hero-name-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }

        .hero-name-text {
          display: inline-flex;
        }

        .hero-letter {
          display: inline-block;
          font-size: 4rem;
          font-weight: 800;
          font-family: 'Orbitron', 'Space Grotesk', sans-serif;
          letter-spacing: 2px;
        }

        .hero-letter.primary {
          background: linear-gradient(135deg, #00bcd4 0%, #00e5ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(0, 188, 212, 0.5);
        }

        .hero-letter.accent {
          background: linear-gradient(135deg, #7c4dff 0%, #b388ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-letter.space {
          width: 0.5em;
        }

        .typing-cursor {
          font-size: 4rem;
          font-weight: 300;
          color: var(--primary-color, #00bcd4);
          margin-left: 2px;
          opacity: 0;
          transition: opacity 0.1s;
        }

        .typing-cursor.visible {
          opacity: 1;
        }

        .name-underline {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 3px;
          background: linear-gradient(90deg, 
            rgba(0, 188, 212, 0) 0%,
            rgba(0, 188, 212, 1) 20%,
            rgba(124, 77, 255, 1) 80%,
            rgba(124, 77, 255, 0) 100%
          );
          transform-origin: center;
          border-radius: 2px;
          box-shadow: 0 0 15px rgba(0, 188, 212, 0.5);
        }

        .enhanced-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary, #ffffff);
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .title-line {
          display: inline-block;
          background: linear-gradient(135deg, 
            var(--primary-color, #00bcd4) 0%, 
            var(--secondary-color, #7c4dff) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .enhanced-description {
          font-size: 1.25rem;
          max-width: 600px;
          line-height: 1.7;
          color: var(--text-secondary, #b8b8b8);
          margin-bottom: 2rem;
        }

        .enhanced-divider {
          height: 2px;
          background: linear-gradient(90deg, 
            rgba(0, 188, 212, 0) 0%,
            rgba(0, 188, 212, 0.8) 30%,
            rgba(124, 77, 255, 0.8) 70%,
            rgba(124, 77, 255, 0) 100%
          );
          border-radius: 2px;
          box-shadow: 0 0 20px rgba(0, 188, 212, 0.3);
        }

        @media (max-width: 768px) {
          .hero-letter {
            font-size: 2.25rem;
          }

          .typing-cursor {
            font-size: 2.25rem;
          }

          .hero-name-wrapper {
            min-height: 50px;
          }

          .enhanced-title {
            font-size: 1.5rem;
          }

          .enhanced-description {
            font-size: 1rem;
          }

          .enhanced-divider {
            width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroText;
