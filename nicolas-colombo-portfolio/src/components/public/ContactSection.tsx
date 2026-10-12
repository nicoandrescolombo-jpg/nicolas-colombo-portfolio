import React from 'react'
import { Mail, Linkedin, Globe, Instagram, type LucideIcon } from 'lucide-react'
import type { ContactSettings } from '@/types'
import PublicContactForm from './PublicContactForm'

interface ContactSectionProps {
  settings: ContactSettings
}

interface ContactLink {
  href: string
  label: string
  displayText: string
  Icon: LucideIcon
  isVisible: boolean
}

export default function ContactSection({ settings }: ContactSectionProps) {
  if (!settings) return null

  const year = new Date().getFullYear()
  const headingText = settings.contact_text || "Let's create something"
  const targetEmail = settings.email || 'nicoandres.colombo@gmail.com'

  const links: ContactLink[] = [
    {
      href: `mailto:${targetEmail}`,
      label: `Email Nicolas Colombo`,
      displayText: targetEmail,
      Icon: Mail,
      isVisible: !!(settings.visibility?.email && targetEmail),
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
  ]

  const visibleLinks = links.filter((link) => link.isVisible)

  const bgType = settings.background_type || 'color'
  const bgUrl = settings.background_url
  const overlayOpacity = settings.background_overlay_opacity ?? 0.5

  return (
    <section
      id="contact"
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden"
    >
      {/* ── Background Media Layer (Configurable from Admin) ── */}
      {bgType === 'video' && bgUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          src={bgUrl}
          aria-hidden="true"
        />
      )}

      {bgType === 'image' && bgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Dark overlay vignette */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0A0A]/90 via-[#0A0A0A]/70 to-[#0A0A0A]/95"
        style={{
          opacity: bgType !== 'color' ? overlayOpacity : 1,
        }}
        aria-hidden="true"
      />

      {/* Subtle top indicator line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#333333] z-10"
        aria-hidden="true"
      />

      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center gap-12 relative z-10">
        {/* Editorial heading */}
        <div>
          <span className="font-ui text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3 block">
            Contacto
          </span>
          <h2 className="font-display italic text-display-xl text-[#F5F5F5] leading-[0.9] tracking-tight max-w-3xl">
            {headingText}
          </h2>
        </div>

        {/* Formulario de Consulta Directo + Guardado en Base de Datos de Clientes */}
        <PublicContactForm targetEmail={targetEmail} />

        {/* Canales y Redes Sociales */}
        {visibleLinks.length > 0 && (
          <nav aria-label="Contact links" className="pt-4">
            <ul className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-8">
              {visibleLinks.map((link) => {
                const isEmail = link.href.startsWith('mailto:')
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-label={link.label}
                      {...(!isEmail
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="font-ui text-xs uppercase tracking-wider text-[#999999] hover:text-accent flex items-center gap-2 transition-colors duration-200"
                    >
                      <link.Icon
                        size={15}
                        strokeWidth={1.5}
                        className="flex-shrink-0"
                      />
                      <span>{link.displayText}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        {/* Copyright */}
        <p className="font-ui text-xs tracking-widest text-[#555555] uppercase pt-8">
          © {year} Nicolas Colombo
        </p>
      </div>
    </section>
  )
}
