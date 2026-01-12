import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Animated Stats Counter Component
 * Displays animated numbers that count up when scrolled into view
 */
const StatsCounter = ({ stats }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="stats-counter-container"
        >
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatItem
                        key={index}
                        value={stat.value}
                        label={stat.label}
                        suffix={stat.suffix || ""}
                        prefix={stat.prefix || ""}
                        delay={index * 0.2}
                        isInView={isInView}
                        icon={stat.icon}
                    />
                ))}
            </div>
            <style jsx>{`
        .stats-counter-container {
          padding: 3rem 2rem;
          background: linear-gradient(
            135deg,
            rgba(0, 188, 212, 0.05) 0%,
            rgba(124, 77, 255, 0.05) 100%
          );
          border-radius: 20px;
          border: 1px solid rgba(0, 188, 212, 0.2);
          backdrop-filter: blur(10px);
          margin: 2rem 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .stats-counter-container {
            padding: 2rem 1rem;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
      `}</style>
        </motion.div>
    );
};

const StatItem = ({ value, label, suffix, prefix, delay, isInView, icon }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const steps = 60;
        const stepValue = value / steps;
        let current = 0;

        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                current += stepValue;
                if (current >= value) {
                    setCount(value);
                    clearInterval(interval);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [isInView, value, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay }}
            className="stat-item"
        >
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-value">
                <span className="stat-prefix">{prefix}</span>
                <span className="stat-number">{count}</span>
                <span className="stat-suffix">{suffix}</span>
            </div>
            <div className="stat-label">{label}</div>
            <style jsx>{`
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(0, 188, 212, 0.1);
          transition: all 0.3s ease;
        }
        
        .stat-item:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 188, 212, 0.4);
          box-shadow: 0 10px 30px rgba(0, 188, 212, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
          color: var(--primary-color, #00bcd4);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary-color, #00bcd4), var(--secondary-color, #7c4dff));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }

        .stat-prefix, .stat-suffix {
          font-size: 1.5rem;
          opacity: 0.9;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary, #b8b8b8);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stat-value {
            font-size: 2rem;
          }
          .stat-prefix, .stat-suffix {
            font-size: 1.2rem;
          }
          .stat-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
        </motion.div>
    );
};

export default StatsCounter;
