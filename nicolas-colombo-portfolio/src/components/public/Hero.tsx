'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroProps {
  videoUrl: string | null;
  videoMobileUrl: string | null;
  fallbackImageUrl: string | null;
  overlayOpacity: number;
  artistName: string;
  subtitle: string;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated bouncing scroll indicator */
function ScrollIndicator() {
  return (
    <motion.a
      href="#work"
      aria-label="Scroll to work section"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
    >
      {/* Short vertical line */}
      <span className="w-px h-6 bg-[#999999]/50 group-hover:bg-[#E8FF59]/60 transition-colors duration-300" />

      {/* Bouncing chevron */}
      <motion.svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#999999] group-hover:text-[#E8FF59] transition-colors duration-300"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
      >
        <path
          d="M1 1L8 8L15 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Hero({
  videoUrl,
  videoMobileUrl,
  fallbackImageUrl,
  overlayOpacity,
  artistName,
  subtitle,
}: HeroProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Decide which video source to use
  const activeVideoUrl = isMobile ? (videoMobileUrl ?? videoUrl) : videoUrl;

  // Whether we should show the video at all
  const showVideo =
    !reducedMotion && !videoError && !!activeVideoUrl;

  // Clamp overlay opacity between 0 and 1
  const clampedOpacity = Math.min(1, Math.max(0, overlayOpacity));

  // Reload video when source changes (mobile ↔ desktop swap)
  useEffect(() => {
    if (videoRef.current && showVideo) {
      videoRef.current.load();
    }
  }, [activeVideoUrl, showVideo]);

  return (
    <section
      className="hero-section relative w-full overflow-hidden"
      style={{ height: '100svh' }}
      id="home"
      aria-label="Hero section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Background layer — fallback image always present as base            */}
      {/* ------------------------------------------------------------------ */}
      {fallbackImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${fallbackImageUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Video background                                                     */}
      {/* ------------------------------------------------------------------ */}
      {showVideo && (
        <AnimatePresence>
          <motion.video
            ref={videoRef}
            key={activeVideoUrl ?? 'video'}
            className="hero-video absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={fallbackImageUrl ?? undefined}
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <source src={activeVideoUrl!} type="video/mp4" />
          </motion.video>
        </AnimatePresence>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Dark overlay                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="hero-overlay absolute inset-0 bg-[#0A0A0A]"
        style={{ opacity: clampedOpacity }}
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Hero content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="hero-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-5"
        >
          {/* Artist name */}
          <h1
            className={cn(
              'font-display text-display-2xl text-[#F5F5F5] font-normal',
              'italic leading-none tracking-tight',
              // Responsive sizes as fallback if custom token not resolved
              'text-[clamp(3rem,10vw,8rem)]',
            )}
          >
            {artistName}
          </h1>

          {/* Thin divider */}
          <motion.span
            className="block w-12 h-px bg-[#E8FF59]/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
            aria-hidden="true"
          />

          {/* Subtitle */}
          <p
            className={cn(
              'font-ui text-sm tracking-[0.3em] uppercase text-[#999999]',
              'max-w-xs sm:max-w-none',
            )}
          >
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Scroll indicator                                                     */}
      {/* ------------------------------------------------------------------ */}
      {!reducedMotion && <ScrollIndicator />}
    </section>
  );
}
