import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { type ReactNode, useState, useEffect } from "react";

const ScrollReveal = ({
  children,
  direction = "up", // "up", "down", "left", "right"
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  threshold?: number;
}) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  });

  // Safety timer to guarantee visibility even if iframe restrictions delay IntersectionObserver
  const [forceVisible, setForceVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const shouldBeVisible = inView || forceVisible;

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shouldBeVisible ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay: shouldBeVisible && !inView ? 0 : delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
