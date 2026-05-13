import React from "react";
import { motion } from "framer-motion";
import "../../styles/section-divider.css";

const SectionDivider = ({ variant = "wave", color = "primary" }) => {
    const colors = {
        primary: {
            main: "rgba(0, 188, 212, 0.3)",
            secondary: "rgba(124, 77, 255, 0.2)",
            glow: "rgba(0, 188, 212, 0.1)"
        },
        dark: {
            main: "rgba(30, 35, 45, 0.8)",
            secondary: "rgba(20, 25, 35, 0.9)",
            glow: "rgba(0, 0, 0, 0.3)"
        }
    };

    const colorSet = colors[color] || colors.primary;

    // CSS custom properties replace JS template literals in style blocks
    const cssVars = {
        "--divider-main": colorSet.main,
        "--divider-secondary": colorSet.secondary,
        "--divider-glow": colorSet.glow,
    };

    if (variant === "wave") {
        return (
            <div className="section-divider wave-divider" style={cssVars}>
                <svg
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                    className="wave-svg"
                >
                    <motion.path
                        d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z"
                        fill="url(#waveGradient)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colorSet.main} />
                            <stop offset="50%" stopColor={colorSet.secondary} />
                            <stop offset="100%" stopColor={colorSet.main} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    }

    if (variant === "glow-line") {
        return (
            <motion.div
                className="glow-line-divider"
                style={cssVars}
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        );
    }

    if (variant === "dots") {
        return (
            <motion.div
                className="dots-divider"
                style={cssVars}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                {[...Array(5)].map((_, i) => (
                    <motion.span
                        key={i}
                        className="dot"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                    />
                ))}
            </motion.div>
        );
    }

    if (variant === "gradient-fade") {
        return (
            <div className="gradient-fade-divider" style={cssVars} />
        );
    }

    return (
        <motion.div
            className="simple-divider"
            style={cssVars}
            initial={{ width: 0 }}
            whileInView={{ width: "60%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        />
    );
};

export default SectionDivider;
