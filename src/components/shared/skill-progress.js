import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "../../styles/skill-progress.css";

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
        </div>
    );
};

export default SkillProgress;
