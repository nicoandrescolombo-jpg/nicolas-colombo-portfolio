import React from 'react'
import type { Metadata } from 'next'
import { getSiteSettings, getPublishedProjects } from '@/lib/queries/projects'
import { findReel, projectThumbnail } from '@/lib/utils/portfolio'
import { DEFAULT_AVAILABILITY } from '@/lib/utils/constants'
import Hero from '@/components/public/Hero'
import Navigation from '@/components/public/Navigation'
import ProjectGrid from '@/components/public/ProjectGrid'
import AboutSection from '@/components/public/AboutSection'
import ContactSection from '@/components/public/ContactSection'
import { ReelProvider } from '@/components/public/Reel'

export const dynamic = 'force-dynamic'

const loadHome = () => Promise.all([getSiteSettings(), getPublishedProjects()])

/** Imagen para cuando se comparte el link (LinkedIn, WhatsApp, mail) */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, projects] = await loadHome()
  const image =
    settings.hero.fallback_image_url ||
    projects.map(projectThumbnail).find((t): t is string => !!t) ||
    null

  if (!image) return {}
  return {
    openGraph: { images: [{ url: image }] },
    twitter: { images: [image] },
  }
}

export default async function HomePage() {
  const [settings, projects] = await loadHome()

  const identity = settings.identity
  const reel = findReel(identity, projects)

  return (
    <ReelProvider reel={reel}>
      <Navigation />

      <main>
        <Hero
          videoUrl={settings.hero.video_url}
          videoMobileUrl={settings.hero.video_mobile_url}
          fallbackImageUrl={settings.hero.fallback_image_url}
          overlayOpacity={settings.hero.overlay_opacity}
          artistName={identity.artist_name}
          subtitle={identity.subtitle}
          availability={identity.availability ?? DEFAULT_AVAILABILITY}
        />

        <ProjectGrid projects={projects} />

        <AboutSection identity={identity} />

        <ContactSection settings={settings.contact} identity={identity} />
      </main>
    </ReelProvider>
  )
}
