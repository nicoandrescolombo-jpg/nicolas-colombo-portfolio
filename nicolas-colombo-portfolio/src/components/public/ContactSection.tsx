import { Mail, Linkedin, Globe, Instagram, type LucideIcon } from 'lucide-react';
import type { ContactSettings } from '@/types';

interface ContactSectionProps {
  settings: ContactSettings;
}

interface ContactLink {
  href: string;
  label: string;
  displayText: string;
  Icon: LucideIcon;
  isVisible: boolean;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  // Guard: if settings is entirely missing, render nothing
  if (!settings) return <></>;

  const year = new Date().getFullYear();
  const headingText = settings.contact_text || "Let's create something";

  const links: ContactLink[] = [
    {
      href: `mailto:${settings.email ?? ''}`,
      label: `Email Nicolas Colombo`,
      displayText: settings.email ?? '',
      Icon: Mail,
      isVisible: !!(settings.visibility?.email && settings.email),
    },
    {
      href: settings.instagram_url ?? '',
      label: 'Nicolas Colombo on Instagram',
      displayText: 'Instagram',
      Icon: Instagram,
      isVisible: !!(settings.visibility?.instagram && settings.instagram_url),
    },
    {
      href: settings.behance_url ?? '',
      label: 'Nicolas Colombo on Behance',
      displayText: 'Behance',
      Icon: Globe,
      isVisible: !!(settings.visibility?.behance && settings.behance_url),
    },
    {
      href: settings.linkedin_url ?? '',
      label: 'Nicolas Colombo on LinkedIn',
      displayText: 'LinkedIn',
      Icon: Linkedin,
      isVisible: !!(settings.visibility?.linkedin && settings.linkedin_url),
    },
  ];

  const visibleLinks = links.filter((link) => link.isVisible);

  // If there is truly no content, render nothing
  if (!headingText && visibleLinks.length === 0) return <></>;

  return (
    <section
      id="contact"
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-24 relative"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#333333]" aria-hidden="true" />

      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center gap-16">
        {/* Editorial heading */}
        <h2 className="font-display italic text-display-xl text-[#F5F5F5] leading-[0.9] tracking-tight max-w-3xl">
          {headingText}
        </h2>

        {/* Contact links */}
        {visibleLinks.length > 0 && (
          <nav aria-label="Contact links">
            <ul className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-8">
              {visibleLinks.map((link) => {
                const isEmail = link.href.startsWith('mailto:');
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-label={link.label}
                      {...(!isEmail
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="font-ui text-sm tracking-wider text-[#999999] hover:text-[#E8FF59] flex items-center gap-2 transition-colors duration-200 group"
                    >
                      <link.Icon
                        size={16}
                        strokeWidth={1.5}
                        className="flex-shrink-0 transition-colors duration-200"
                      />
                      <span>{link.displayText}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Copyright */}
        <p className="font-ui text-xs tracking-widest text-[#444444] uppercase absolute bottom-8">
          © {year} Nicolas Colombo
        </p>
      </div>
    </section>
  );
}
