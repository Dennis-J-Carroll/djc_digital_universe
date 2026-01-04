import React, { useState } from "react";
import { motion } from "framer-motion";
import "./feature-card.css";

const FeatureCard = ({ title, description, icon, link }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ scale: 0.97 }}
      animate={{ scale: isHovered ? 1 : 0.97, y: isHovered ? -8 : 0 }}
      whileHover={{
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 128, 128, 0.3)"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="feature-card"
    >
      {/* Card background gradient */}
      <div className="feature-card-gradient" />
      
      {/* Glowing border effect on hover */}
      <motion.div 
        className={`feature-card-glow ${isHovered ? 'active pulsing' : ''}`}
      />
      
      {/* Card content */}
      <div className="feature-card-content">
        {icon && (
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: isHovered ? 5 : 0 }}
            className={`feature-card-icon ${isHovered ? 'hovered' : ''}`}
          >
            {icon}
          </motion.div>
        )}
        
        <motion.h3 
          className={`feature-card-title ${isHovered ? 'hovered' : ''}`}
        >
          {title}
        </motion.h3>
        
        <p className="feature-card-description">
          {description}
        </p>
        
        {link && (
          <motion.a 
            href={link.url} 
            className="read-more-link"
            whileHover={{ 
              x: 5,
              textShadow: "0 0 8px rgba(0, 128, 128, 0.7)"
            }}
          >
            {link.text || "View More →"}
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};

export default FeatureCard;
