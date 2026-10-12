import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getProjectBySlug, getPublishedProjects } from '@/lib/queries/projects'
import Navigation from '@/components/public/Navigation'
import VideoEmbed from '@/components/public/VideoEmbed'
import GifSequence from '@/components/public/GifSequence'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    }
  }

  return {
    title: `${project.title} — Nicolas Colombo`,
    description: project.description || `Obra de animación 2D: ${project.title}`,
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const isGifSequence = project.project_type === 'gif_sequence'
  const mediaList = project.media || []

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navigation />

      <main className="pt-32 pb-24 px-6 lg:px-16 max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
          >
            ← Volver a la galería
          </Link>
        </div>

        {/* Project Header */}
        <header className="mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-ui text-xs uppercase tracking-widest text-accent font-medium">
              {isGifSequence ? 'Secuencia de Movimiento' : 'Pieza Individual'}
            </span>
          </div>

          <h1 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-text-primary">
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-6 font-body text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              {project.description}
            </p>
          )}
        </header>

        {/* Content Showcase */}
        <section className="mt-12">
          {isGifSequence ? (
            <GifSequence project={project} />
          ) : (
            <div className="space-y-12">
              {mediaList.map((item) => {
                if (item.media_type === 'youtube' || item.media_type === 'vimeo') {
                  return (
                    <div key={item.id} className="rounded-lg overflow-hidden border border-[#252525]">
                      <VideoEmbed
                        url={item.external_url || ''}
                        mediaType={item.media_type}
                        title={project.title}
                      />
                    </div>
                  )
                }

                if (item.media_type === 'image' || item.media_type === 'gif') {
                  const src = item.storage_path || item.external_url
                  if (!src) return null

                  return (
                    <div
                      key={item.id}
                      className="relative w-full rounded-lg overflow-hidden bg-[#141414] border border-[#252525]"
                    >
                      <Image
                        src={src}
                        alt={item.alt_text || project.title}
                        width={item.width || 1920}
                        height={item.height || 1080}
                        unoptimized={item.media_type === 'gif'}
                        className="w-full h-auto object-contain"
                        priority
                      />
                    </div>
                  )
                }

                return null
              })}
            </div>
          )}
        </section>

        {/* Bottom Navigation */}
        <footer className="mt-24 pt-12 border-t border-[#252525] flex justify-between items-center">
          <Link
            href="/#work"
            className="font-ui text-xs uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
          >
            ← Volver a proyectos
          </Link>
          <Link
            href="/#contact"
            className="font-ui text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Contactar al artista →
          </Link>
        </footer>
      </main>
    </div>
  )
}
