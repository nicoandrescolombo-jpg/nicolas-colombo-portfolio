import React from 'react'
import type { ContactSettings, IdentitySettings } from '@/types'
import PublicContactForm from './PublicContactForm'
import CopyEmail from './CopyEmail'
import BackToTop from './BackToTop'
import { typeset } from '@/lib/utils/helpers'

interface ContactSectionProps {
  settings: ContactSettings
  identity: IdentitySettings
}

export default function ContactSection({ settings, identity }: ContactSectionProps) {
  if (!settings) return null

  const year = new Date().getFullYear()
  const headingText = settings.contact_text || "Let's work together"
  const email = settings.email || null
  const showEmail = !!(settings.visibility?.email && email)

  const links = [
    { href: settings.linkedin_url, label: 'LinkedIn', visible: settings.visibility?.linkedin },
    { href: settings.instagram_url, label: 'Instagram', visible: settings.visibility?.instagram },
    { href: settings.behance_url, label: 'Behance', visible: settings.visibility?.behance },
    ...(settings.other_links ?? []).map((l) => ({ href: l.url, label: l.label, visible: l.visible })),
  ].filter((l): l is { href: string; label: string; visible: boolean } => !!(l.visible && l.href))

  const bgType = settings.background_type || 'color'
  const bgUrl = settings.background_url
  const overlayOpacity = settings.background_overlay_opacity ?? 0.5

  return (
    <section id="contact" className="relative scroll-mt-16 border-t border-rule overflow-hidden">
      {/* Fondo opcional (configurable en Admin → Contacto) */}
      {bgType === 'video' && bgUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden="true"
        />
      )}
      {bgType !== 'color' && bgUrl && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: Math.max(0.55, overlayOpacity) }}
          aria-hidden="true"
        />
      )}

      {/* Cartón final: centrado, como el cierre de una película */}
      <div className="relative site-container pt-28 sm:pt-36 pb-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="type-display text-display-xl text-paper max-w-[16ch]">{typeset(headingText)}</h2>

          {showEmail && (
            <div className="mt-12 sm:mt-14">
              <CopyEmail email={email!} />
            </div>
          )}

          {links.length > 0 && (
            <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link type-sc text-[1.1rem] text-paper"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-20 sm:mt-24 mx-auto w-full max-w-2xl">
          <PublicContactForm />
        </div>

        <footer className="mt-28 sm:mt-36 pt-6 border-t border-rule flex items-center justify-between gap-6 type-sc text-[0.98rem] text-lead">
          <p className="figures">© {year} {identity.artist_name}</p>
          <BackToTop />
        </footer>
      </div>
    </section>
  )
}
