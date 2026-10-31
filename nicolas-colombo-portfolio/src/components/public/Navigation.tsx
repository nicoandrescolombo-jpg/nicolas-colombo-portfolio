'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { useReel } from './Reel';
import TimingChart from './TimingChart';

interface NavLink {
  label: string;
  sectionId: string;
}

// "Work" no va en el menú (pedido de Nico): el reel tiene su propio botón.
const NAV_LINKS: NavLink[] = [
  { label: 'About', sectionId: 'about' },
  { label: 'Contact', sectionId: 'contact' },
];

function smoothScrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Logotipo chico: en la home aparece cuando el logo grande del hero sale de pantalla */
function Wordmark({ visible, onClick }: { visible: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Nicolás Colombo — home"
      tabIndex={visible ? 0 : -1}
      className={cn(
        'relative z-50 block transition-opacity duration-500 ease-out',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/nicolas-colombo-wordmark.svg"
        alt=""
        width={4316}
        height={732}
        className="h-[22px] sm:h-[26px] w-auto"
        draggable={false}
      />
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const reelCtx = useReel();
  const isHome = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Fondo del header y aparición del logotipo
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(!isHome || window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  // Sección activa (subrayado azul)
  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    ['home', 'work', ...NAV_LINKS.map((l) => l.sectionId)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  // Bloquear scroll y cerrar con Escape mientras el menú móvil está abierto
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      if (isHome) smoothScrollTo(sectionId);
      else router.push(`/#${sectionId}`);
    },
    [isHome, router],
  );

  const openReel = () => {
    setMenuOpen(false);
    reelCtx?.open();
  };

  const solid = scrolled || menuOpen || !isHome;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-colors duration-300',
          solid ? 'bg-black/90 backdrop-blur-md border-b border-paper/[0.08]' : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="site-container relative flex items-center justify-between h-16 sm:h-[4.5rem]">
          <Wordmark
            visible={pastHero || menuOpen}
            onClick={(e) => {
              setMenuOpen(false);
              if (isHome) {
                e.preventDefault();
                smoothScrollTo('home');
              }
            }}
          />

          {/* Escritorio */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main">
            {NAV_LINKS.map(({ label, sectionId }) => {
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={sectionId}
                  href={`/#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(sectionId);
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'type-sc text-[1.02rem] py-1.5 border-b transition-colors duration-200',
                    isActive
                      ? 'text-paper border-paper/70'
                      : 'text-paper/65 border-transparent hover:text-paper',
                  )}
                >
                  {label}
                </a>
              );
            })}
            {reelCtx && (
              <button
                type="button"
                onClick={openReel}
                className="inline-flex items-center gap-1.5 py-1.5 type-sc text-[1.02rem] text-paper border-b border-transparent hover:border-paper/70 transition-colors"
              >
                <Play size={9} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                Reel
              </button>
            )}
          </nav>

          {/* Móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden relative z-50 -mr-2 h-10 px-2 type-sc text-[1.02rem] text-paper"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>

          {/* Carta de timing: progreso de lectura, con las secciones como keys */}
          {isHome && <TimingChart visible={pastHero && !menuOpen} onNavigate={handleNavigate} />}
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-0 z-40 bg-black md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav aria-label="Main" className="site-container pt-28 flex flex-col gap-2">
              {NAV_LINKS.map(({ label, sectionId }) => (
                <a
                  key={sectionId}
                  href={`/#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    window.setTimeout(() => handleNavigate(sectionId), 220);
                  }}
                  className="type-display text-[3.5rem] leading-[1.1] text-paper"
                >
                  {label}
                </a>
              ))}
              {reelCtx && (
                <button type="button" onClick={openReel} className="btn-paper mt-8 self-start">
                  <Play size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  Watch the reel
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
