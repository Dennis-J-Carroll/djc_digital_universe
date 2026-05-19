import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "../../styles/stats-counter.css";

const StatsCounter = ({ stats }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

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
                        delay={index * 0.15}
                        isInView={isInView}
                        icon={stat.icon}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const StatItem = ({ value, label, suffix, prefix, delay, isInView, icon }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay }}
        className="stat-item"
    >
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-value">
            <span className="stat-prefix">{prefix}</span>
            <span className="stat-number">{value}</span>
            <span className="stat-suffix">{suffix}</span>
        </div>
        <div className="stat-label">{label}</div>
    </motion.div>
);

export default StatsCounter;
