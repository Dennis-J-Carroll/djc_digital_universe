import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import "../../styles/stats-counter.css";

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
        </motion.div>
    );
};

export default StatsCounter;
