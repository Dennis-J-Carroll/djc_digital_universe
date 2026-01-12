import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Animated Skill Progress Component
 * Displays skills with animated progress bars and category organization
 */
const SkillProgress = ({ categories }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="skill-progress-container">
            {categories.map((category, categoryIndex) => (
                <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: categoryIndex % 2 === 0 ? -50 : 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                    className="skill-category-card"
                >
                    <div className="category-header">
                        {category.icon && <span className="category-icon">{category.icon}</span>}
                        <h3 className="category-title">{category.name}</h3>
                    </div>

                    <div className="skills-list">
                        {category.skills.map((skill, skillIndex) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.4, delay: categoryIndex * 0.2 + skillIndex * 0.1 }}
                                className="skill-item"
                            >
                                <div className="skill-info">
                                    <span className="skill-name">{skill.name}</span>
                                    <span className="skill-level">{skill.level}%</span>
                                </div>
                                <div className="skill-bar-bg">
                                    <motion.div
                                        className="skill-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: `${skill.level}%` } : {}}
                                        transition={{
                                            duration: 1.2,
                                            delay: categoryIndex * 0.2 + skillIndex * 0.15,
                                            ease: "easeOut"
                                        }}
                                        style={{
                                            background: skill.color || 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))'
                                        }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ))}

            <style jsx>{`
        .skill-progress-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .skill-category-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 188, 212, 0.15);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .skill-category-card:hover {
          border-color: rgba(0, 188, 212, 0.4);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                      0 0 30px rgba(0, 188, 212, 0.1);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 188, 212, 0.2);
        }

        .category-icon {
          font-size: 1.5rem;
        }

        .category-title {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, var(--primary-color, #00bcd4), var(--secondary-color, #7c4dff));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .skill-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skill-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .skill-name {
          font-size: 0.95rem;
          color: var(--text-primary, #ffffff);
          font-weight: 500;
        }

        .skill-level {
          font-size: 0.85rem;
          color: var(--primary-color, #00bcd4);
          font-weight: 600;
        }

        .skill-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .skill-bar-fill {
          height: 100%;
          border-radius: 10px;
          position: relative;
          box-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
        }

        .skill-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .skill-progress-container {
            grid-template-columns: 1fr;
          }
          
          .skill-category-card {
            padding: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
};

export default SkillProgress;
