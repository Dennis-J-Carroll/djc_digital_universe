import React, { useState } from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ title, description, icon, link }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 128, 128, 0.3)" 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative p-6 rounded-xl overflow-hidden"
      style={{
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(25, 25, 25, 0.7)",
        borderRadius: "12px",
        border: "1px solid rgba(0, 128, 128, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-out",
      }}
    >
      {/* Card background gradient */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom right, rgba(136, 136, 136, 0.1), rgba(0, 128, 128, 0.1))",
          zIndex: 0,
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
      
      {/* Glowing border effect on hover */}
      <motion.div 
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(0, 128, 128, 0.1), rgba(136, 136, 136, 0.1), rgba(0, 128, 128, 0.1))",
          zIndex: -1,
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered ? "0 0 20px rgba(0, 128, 128, 0.4)" : "none",
        }}
        animate={{
          boxShadow: isHovered ? [
            "0 0 5px rgba(0, 128, 128, 0.2)",
            "0 0 20px rgba(0, 128, 128, 0.4)",
            "0 0 5px rgba(0, 128, 128, 0.2)"
          ] : "none"
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
      
      {/* Card content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {icon && (
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: isHovered ? 5 : 0 }}
            style={{
              width: "56px",
              height: "56px",
              marginBottom: "16px",
              color: "#008080",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: "rgba(0, 128, 128, 0.1)",
              border: "1px solid rgba(0, 128, 128, 0.2)",
              boxShadow: isHovered ? "0 0 15px rgba(0, 128, 128, 0.3)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            {icon}
          </motion.div>
        )}
        
        <motion.h3 
          animate={{ 
            color: isHovered ? "#F8F8F8" : "#ffffff",
            textShadow: isHovered ? "0 0 8px rgba(0, 128, 128, 0.7)" : "none" 
          }}
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: "12px",
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.3s ease",
          }}
        >
          {title}
        </motion.h3>
        
        <p 
          style={{
            color: "#b3b3b3",
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.6,
          }}
        >
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
            style={{
              display: "inline-block",
              color: "#008080",
              textDecoration: "none",
              fontWeight: 600,
              marginTop: "16px",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.3s ease",
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
