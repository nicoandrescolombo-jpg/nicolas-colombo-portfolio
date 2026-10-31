'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useReel } from './Reel';
import { typeset } from '@/lib/utils/helpers';

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
  availability: string;
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

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Portada en formato de cine: en pantallas grandes la animación queda
 * en un cuadro 2:1 con franjas negras arriba y abajo (letterbox).
 * El menú vive en la franja de arriba y la disponibilidad en la de abajo.
 */
export default function Hero({
  videoUrl,
  videoMobileUrl,
  fallbackImageUrl,
  overlayOpacity,
  artistName,
  subtitle,
  availability,
}: HeroProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reelCtx = useReel();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const activeVideoUrl = isMobile ? (videoMobileUrl ?? videoUrl) : videoUrl;
  const showVideo = !reducedMotion && !videoError && !!activeVideoUrl;
  const clampedOpacity = Math.min(1, Math.max(0, overlayOpacity));

  useEffect(() => {
    if (videoRef.current && showVideo) {
      videoRef.current.load();
    }
  }, [activeVideoUrl, showVideo]);

  return (
    <section className="hero-section" id="home" aria-label={`${artistName}, ${subtitle}`}>
      {/* Filtros de "boil": la línea del logo tiembla como un dibujo repasado a mano */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        {[3, 11, 23].map((seed, i) => (
          <filter key={seed} id={`boil-${i + 1}`} x="-2%" y="-10%" width="104%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </svg>

      {/* Cuadro de la película */}
      <div className="hero-frame">
        {fallbackImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${fallbackImageUrl})` }}
            aria-hidden="true"
          />
        )}

        {showVideo && (
          <video
            ref={videoRef}
            key={activeVideoUrl ?? 'video'}
            className="hero-video transition-opacity duration-700 ease-out"
            style={{ opacity: videoLoaded ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={fallbackImageUrl ?? undefined}
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            aria-hidden="true"
          >
            <source src={activeVideoUrl!} />
          </video>
        )}

        {/* Oscurecido general (configurable en Admin → Portada) y viñeta suave */}
        <div className="absolute inset-0 bg-black" style={{ opacity: clampedOpacity }} aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]"
          aria-hidden="true"
        />
        {/* Sin franjas (celular o tablet vertical): un degradé abajo para que se lea el texto */}
        <div
          className="md:landscape:hidden absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center">
          <h1 className="w-[min(82vw,760px)] drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] draw-on">
            <span className="sr-only">{artistName}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nicolas-colombo-wordmark.svg"
              alt=""
              width={4316}
              height={732}
              className="w-full h-auto select-none boil"
              draggable={false}
            />
          </h1>

          <div className="mt-5 sm:mt-7 flex flex-col items-center gap-8 on-twos-in [animation-delay:1.05s]">
            <p className="type-sc text-[1.15rem] sm:text-[1.3rem] text-paper/90">{subtitle}</p>

            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
              {reelCtx ? (
                <button type="button" onClick={reelCtx.open} className="btn-paper">
                  <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  Watch the reel
                </button>
              ) : (
                <button type="button" onClick={() => scrollToId('work')} className="btn-paper">
                  See the work
                </button>
              )}
              <button
                type="button"
                onClick={() => scrollToId('contact')}
                className="text-link type-sc text-[1.05rem] text-paper"
              >
                Get in touch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Franja inferior: disponibilidad y acceso al trabajo */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex items-center on-twos-in [animation-delay:1.4s]"
        style={{ height: 'max(var(--bar), 4.5rem)' }}
      >
        <div className="site-container flex items-center justify-between gap-6">
          <p className="type-body italic text-[1.05rem] text-paper/75">{typeset(availability)}</p>
          <button
            type="button"
            onClick={() => scrollToId('work')}
            className="hidden sm:inline type-sc text-[1rem] text-paper/60 hover:text-paper transition-colors"
          >
            Selected work
          </button>
        </div>
      </div>
    </section>
  );
}
