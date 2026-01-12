import React from "react";
import { motion } from "framer-motion";

/**
 * Section Divider Component
 * Creates smooth visual transitions between page sections
 */
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

    if (variant === "wave") {
        return (
            <div className="section-divider wave-divider">
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
                <style jsx>{`
          .wave-divider {
            width: 100%;
            overflow: hidden;
            line-height: 0;
            margin: -1px 0;
          }
          .wave-svg {
            width: 100%;
            height: 80px;
          }
        `}</style>
            </div>
        );
    }

    if (variant === "glow-line") {
        return (
            <motion.div
                className="glow-line-divider"
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <style jsx>{`
          .glow-line-divider {
            width: 100%;
            height: 1px;
            margin: 4rem 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              ${colorSet.main} 20%,
              ${colorSet.secondary} 50%,
              ${colorSet.main} 80%,
              transparent 100%
            );
            box-shadow: 0 0 20px ${colorSet.glow}, 0 0 40px ${colorSet.glow};
          }
        `}</style>
            </motion.div>
        );
    }

    if (variant === "dots") {
        return (
            <motion.div
                className="dots-divider"
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
                <style jsx>{`
          .dots-divider {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            padding: 3rem 0;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${colorSet.main}, ${colorSet.secondary});
            box-shadow: 0 0 10px ${colorSet.glow};
          }
          .dot:nth-child(3) {
            width: 12px;
            height: 12px;
          }
        `}</style>
            </motion.div>
        );
    }

    if (variant === "gradient-fade") {
        return (
            <div className="gradient-fade-divider">
                <style jsx>{`
          .gradient-fade-divider {
            width: 100%;
            height: 120px;
            background: linear-gradient(
              to bottom,
              transparent 0%,
              ${colorSet.glow} 50%,
              transparent 100%
            );
            position: relative;
          }
          .gradient-fade-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 10%;
            right: 10%;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              ${colorSet.main},
              ${colorSet.secondary},
              ${colorSet.main},
              transparent
            );
            transform: translateY(-50%);
          }
        `}</style>
            </div>
        );
    }

    // Default: simple line
    return (
        <motion.div
            className="simple-divider"
            initial={{ width: 0 }}
            whileInView={{ width: "60%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <style jsx>{`
        .simple-divider {
          height: 2px;
          margin: 3rem auto;
          background: linear-gradient(
            90deg,
            ${colorSet.main},
            ${colorSet.secondary},
            ${colorSet.main}
          );
          border-radius: 1px;
          box-shadow: 0 0 15px ${colorSet.glow};
        }
      `}</style>
        </motion.div>
    );
};

export default SectionDivider;
