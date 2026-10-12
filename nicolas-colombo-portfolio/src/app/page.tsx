import React from 'react'
import { getSiteSettings, getPublishedProjects } from '@/lib/queries/projects'
import Hero from '@/components/public/Hero'
import Navigation from '@/components/public/Navigation'
import ProjectGrid from '@/components/public/ProjectGrid'
import ContactSection from '@/components/public/ContactSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
  ])

  return (
    <main id="home" className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent selection:text-bg-primary">
      {/* Fixed Navigation */}
      <Navigation />

      {/* Hero: 100svh Animated Fullscreen Experience */}
      <Hero
        videoUrl={settings.hero.video_url}
        videoMobileUrl={settings.hero.video_mobile_url}
        fallbackImageUrl={settings.hero.fallback_image_url}
        overlayOpacity={settings.hero.overlay_opacity}
        artistName={settings.identity.artist_name}
        subtitle={settings.identity.subtitle}
      />

      {/* Gallery Section */}
      <ProjectGrid projects={projects} />

      {/* About Section - Brief, Editorial Artist Statement */}
      <section id="about" className="py-24 px-6 lg:px-16 border-t border-[#252525] bg-[#0E0E0E]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start justify-between">
          <div>
            <span className="font-ui text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Sobre el artista
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-text-primary mt-3">
              {settings.identity.artist_name}
            </h2>
            <p className="font-ui text-sm text-text-secondary mt-1 tracking-wider uppercase">
              {settings.identity.subtitle}
            </p>
          </div>
          <div className="md:max-w-md font-body text-text-secondary text-sm md:text-base leading-relaxed space-y-4">
            <p>
              Especializado en animación 2D tradicional y digital, diseño de personajes y secuencias de movimiento con énfasis en timing, peso y actuación corporal.
            </p>
            <p className="text-text-tertiary text-xs">
              Disponible para proyectos comerciales, cortometrajes, series y colaboraciones internacionales.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection settings={settings.contact} />
    </main>
  )
}
