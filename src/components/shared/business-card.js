import React, { useEffect, useRef } from "react"
import { navigate } from "gatsby"
import { gsap } from "gsap"

const BusinessCard = ({ name, title, primaryAction, secondaryAction }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;

    // Setup 3D hover effect
    const handleMouseMove = (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      // Calculate rotation angle based on mouse position
      const rotateY = -1 * (e.clientX - cardCenterX) / 15;
      const rotateX = (e.clientY - cardCenterY) / 15;
      
      // Apply transform
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000,
        transformOrigin: "center center"
      });
      
      // Highlight effect for interactive elements
      const accentGlows = card.querySelectorAll('.accent-glow');
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;
      
      accentGlows.forEach(glow => {
        const glowRect = glow.getBoundingClientRect();
        const glowCenterX = glowRect.left + glowRect.width / 2 - cardRect.left;
        const glowCenterY = glowRect.top + glowRect.height / 2 - cardRect.top;
        const distance = Math.sqrt(
          Math.pow(mouseX - glowCenterX, 2) + 
          Math.pow(mouseY - glowCenterY, 2)
        );
        
        // Adjust glow based on mouse proximity
        const intensity = Math.max(0, 1 - distance / 200);
        gsap.to(glow, {
          opacity: 0.5 + intensity * 0.5,
          scale: 1 + intensity * 0.1,
          duration: 0.3
        });
      });
    };

    // Reset on mouse leave
    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out"
      });
      
      const accentGlows = card.querySelectorAll('.accent-glow');
      accentGlows.forEach(glow => {
        gsap.to(glow, {
          opacity: 0.5,
          scale: 1,
          duration: 0.5
        });
      });
    };

    // Add event listeners
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Entrance animation
    gsap.fromTo(card, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.4)" }
    );

    // Clean up
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Handle button actions
  const handlePrimaryAction = () => {
    if (primaryAction?.path) {
      navigate(primaryAction.path);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.path) {
      navigate(secondaryAction.path);
    }
  };

  return (
    <div className="business-card" ref={cardRef}>
      <div className="card-content">
        <div className="hologram-icon">
          <div className="hologram-ring"></div>
          <div className="hologram-ring"></div>
          <div className="hologram-pulse"></div>
        </div>
        <h1>{name || "Your Name"}</h1>
        <p className="title">{title || "Data Scientist • Python Developer • Creative"}</p>
        <div className="card-actions">
          <button 
            className="primary-action"
            onClick={handlePrimaryAction}
          >
            {primaryAction?.label || "View Portfolio"}
          </button>
          <button 
            className="secondary-action"
            onClick={handleSecondaryAction}
          >
            {secondaryAction?.label || "Contact"}
          </button>
        </div>
      </div>
      <div className="card-accents">
        <div className="accent-panel"></div>
        <div className="accent-panel"></div>
        <div className="accent-circuit"></div>
        <div className="accent-glow top"></div>
        <div className="accent-glow bottom"></div>
      </div>
    </div>
  );
};

export default BusinessCard;
