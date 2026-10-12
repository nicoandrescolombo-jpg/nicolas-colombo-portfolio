'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface NavLink {
  label: string;
  href: string;
  sectionId: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Work',    href: '#work',    sectionId: 'work'    },
  { label: 'About',   href: '#about',   sectionId: 'about'   },
  { label: 'Contact', href: '#contact', sectionId: 'contact' },
];

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    clipPath: 'inset(0% 0% 100% 0%)',
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as number[] },
  },
  open: {
    opacity: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as number[] },
  },
};

const mobileNavItemVariants = {
  closed: { opacity: 0, y: 24 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

const hamburgerTopVariants = {
  closed: { rotate: 0,   y: 0 },
  open:   { rotate: 45,  y: 6 },
};
const hamburgerBottomVariants = {
  closed: { rotate: 0,    y: 0 },
  open:   { rotate: -45, y: -6 },
};

// ---------------------------------------------------------------------------
// Smooth scroll helper
// ---------------------------------------------------------------------------

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DesktopLinksProps {
  links: NavLink[];
  activeSection: string;
}

function DesktopLinks({ links, activeSection }: DesktopLinksProps) {
  return (
    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
      {links.map(({ label, href, sectionId }) => {
        const isActive = activeSection === sectionId;
        return (
          <a
            key={sectionId}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(sectionId);
            }}
            className={cn(
              'font-ui text-sm tracking-wider transition-colors duration-200',
              'relative group',
              isActive ? 'text-[#F5F5F5]' : 'text-[#999999] hover:text-[#F5F5F5]',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
            {/* Underline indicator */}
            <span
              className={cn(
                'absolute -bottom-0.5 left-0 h-px bg-[#E8FF59]',
                'transition-all duration-300 ease-out',
                isActive ? 'w-full' : 'w-0 group-hover:w-full',
              )}
              aria-hidden="true"
            />
          </a>
        );
      })}
    </nav>
  );
}

interface MobileMenuProps {
  links: NavLink[];
  activeSection: string;
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ links, activeSection, isOpen, onClose }: MobileMenuProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center"
          variants={mobileMenuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          aria-modal="true"
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col items-center gap-10">
            {links.map(({ label, href, sectionId }, i) => {
              const isActive = activeSection === sectionId;
              return (
                <motion.a
                  key={sectionId}
                  href={href}
                  custom={i}
                  variants={mobileNavItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    // Small delay so menu closes before scroll
                    setTimeout(() => smoothScrollTo(sectionId), 350);
                  }}
                  className={cn(
                    'font-display italic text-[clamp(2.5rem,8vw,4.5rem)] leading-none',
                    'transition-colors duration-200',
                    isActive ? 'text-[#F5F5F5]' : 'text-[#555555] hover:text-[#F5F5F5]',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </motion.a>
              );
            })}
          </nav>

          {/* Accent line at bottom */}
          <motion.div
            className="absolute bottom-10 w-12 h-px bg-[#E8FF59]/40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="md:hidden relative z-50 flex flex-col justify-center items-center w-8 h-8 gap-0"
    >
      {/* Top bar */}
      <motion.span
        className="block w-6 h-px bg-[#F5F5F5] origin-center"
        variants={hamburgerTopVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        aria-hidden="true"
      />
      {/* Bottom bar */}
      <motion.span
        className="block w-6 h-px bg-[#F5F5F5] origin-center mt-1.5"
        variants={hamburgerBottomVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        aria-hidden="true"
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Navigation component
// ---------------------------------------------------------------------------

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const THRESHOLD = 80; // px from top before background appears

    const onScroll = () => {
      setScrolled(window.scrollY > THRESHOLD);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── IntersectionObserver for active section ────────────────────────────────
  useEffect(() => {
    const sectionIds = ['home', ...NAV_LINKS.map((l) => l.sectionId)];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Fixed top bar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-400 ease-in-out',
          scrolled || menuOpen
            ? 'bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/5'
            : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('home');
              }}
              aria-label="Nicolas Colombo — Back to top"
              className={cn(
                'relative z-50',
                'font-ui font-bold text-xl text-[#F5F5F5]',
                'hover:text-[#E8FF59] transition-colors duration-200',
              )}
            >
              NC
            </a>

            {/* Desktop links */}
            <DesktopLinks links={NAV_LINKS} activeSection={activeSection} />

            {/* Mobile hamburger */}
            <HamburgerButton isOpen={menuOpen} onClick={toggleMenu} />
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <MobileMenu
        links={NAV_LINKS}
        activeSection={activeSection}
        isOpen={menuOpen}
        onClose={closeMenu}
      />
    </>
  );
}
