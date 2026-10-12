'use client';

import { useEffect, useReducer, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ScrollIndicatorProps {
  targetId: string;
}

export default function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  // Use a simple boolean state via useReducer to avoid re-render cascade
  const [isVisible, toggleHidden] = useReducer(() => false, true);
  const hasHiddenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasHiddenRef.current && window.scrollY > 80) {
        hasHiddenRef.current = true;
        toggleHidden();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Bounce animation for the chevron
  const bounceVariants = prefersReducedMotion
    ? {}
    : {
        animate: {
          y: [0, 8, 0],
          transition: {
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="scroll-indicator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <button
            onClick={handleClick}
            aria-label={`Scroll to ${targetId} section`}
            className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] rounded-sm"
          >
            {/* Vertical line */}
            <motion.span
              className="block w-px bg-gradient-to-b from-transparent via-[#555555] to-[#555555] group-hover:via-[#E8FF59] group-hover:to-[#E8FF59] transition-colors duration-300"
              style={{ height: 40 }}
              aria-hidden="true"
            />

            {/* Animated chevron */}
            <motion.span
              aria-hidden="true"
              {...(prefersReducedMotion ? {} : { animate: bounceVariants.animate })}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#555555] group-hover:text-[#E8FF59] transition-colors duration-300"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
