"use client";

// Reusable motion primitives for the "live" UI pass. Bold but on-brand.
// Built on framer-motion (already a dependency).

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + slide-up on scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 48,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Plain layout passthrough for a list/grid. Keeps the original container element
 * (and its grid/flex className) so layout is untouched; each <StaggerItem> reveals
 * itself on scroll-into-view. This is robust for async-loaded lists.
 */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * A card/list item that fades + slides + scales in when it scrolls into view,
 * independent of its parent (works even when the list loads asynchronously).
 * `hover` adds a lift/scale on hover.
 */
export function StaggerItem({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={hover ? { y: -8, scale: 1.03 } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Count-up number animation when scrolled into view. */
export function AnimatedNumber({
  value,
  className,
  duration = 1.2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const target = Number.isFinite(value) ? value : 0;

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}
