import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import { getProjectBySlug, getPublishedProjects, getSiteSettings } from '@/lib/queries/projects'
import { findReel, projectKind, projectThumbnail } from '@/lib/utils/portfolio'
import { typeset } from '@/lib/utils/helpers'
import Navigation from '@/components/public/Navigation'
import VideoEmbed from '@/components/public/VideoEmbed'
import GifSequence from '@/components/public/GifSequence'
import AnimatedImage from '@/components/public/AnimatedImage'
import { ReelProvider } from '@/components/public/Reel'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project not found' }
  }

  const image = projectThumbnail(project)
  return {
    title: project.title,
    description: project.description || `${project.title}: 2D animation by Nicolás Colombo.`,
    ...(image ? { openGraph: { images: [{ url: image }] }, twitter: { images: [image] } } : {}),
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const [project, settings, projects] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
    getPublishedProjects(),
  ])

  if (!project) {
    notFound()
  }

  const isGifSequence = project.project_type === 'gif_sequence'
  const mediaList = project.media || []
  const reel = findReel(settings.identity, projects)
  const kind = projectKind(project)

  // Siguiente proyecto (vuelve al primero al llegar al final)
  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null

  return (
    <ReelProvider reel={reel}>
      <Navigation />

      <main className="pt-28 sm:pt-36 pb-10">
        <div className="site-container">
          <Link
            href="/#work"
            className="inline-flex items-center gap-1 -ml-1 type-sc text-[1.02rem] text-lead hover:text-paper transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            All work
          </Link>

          <header className="mt-8 sm:mt-10 mb-12 sm:mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
            <div className="lg:col-span-7">
              <h1 className="type-display text-display-xl text-paper">{typeset(project.title)}</h1>
              {kind && <p className="mt-3 type-sc text-[1.1rem] text-lead">{kind}</p>}
            </div>
            {project.description && (
              <p className="lg:col-span-5 type-body text-[1.2rem] leading-relaxed text-paper/85 max-w-[52ch] whitespace-pre-line">
                {typeset(project.description)}
              </p>
            )}
          </header>

          <section>
            {isGifSequence ? (
              <GifSequence project={project} />
            ) : (
              <div className="flex flex-col gap-6 sm:gap-8">
                {mediaList.map((item, i) => {
                  if (item.media_type === 'youtube' || item.media_type === 'vimeo') {
                    return (
                      <VideoEmbed
                        key={item.id}
                        url={item.external_url || ''}
                        mediaType={item.media_type}
                        title={project.title}
                        posterUrl={i === 0 ? project.cover_url : null}
                      />
                    )
                  }

                  const src = item.storage_path || item.external_url
                  if (!src) return null

                  if (item.media_type === 'gif') {
                    return (
                      <AnimatedImage
                        key={item.id}
                        src={src}
                        alt={item.alt_text || project.title}
                        variant="frame"
                        padding={0.06}
                        priority={i === 0}
                      />
                    )
                  }

                  return (
                    <figure key={item.id} className="bg-graphite">
                      <Image
                        src={src}
                        alt={item.alt_text || project.title}
                        width={item.width || 1920}
                        height={item.height || 1080}
                        sizes="(max-width: 1440px) 100vw, 1344px"
                        className="w-full h-auto"
                        priority={i === 0}
                      />
                    </figure>
                  )
                })}
              </div>
            )}
          </section>

          <footer className="mt-24 sm:mt-32 pt-8 border-t border-rule grid grid-cols-1 sm:grid-cols-2 gap-10">
            {next && next.slug !== project.slug ? (
              <Link href={`/project/${next.slug}`} className="group block">
                <span className="block type-sc text-[1.02rem] text-lead">Next project</span>
                <span className="mt-1 block type-display text-display-md text-paper decoration-paper/60 decoration-1 underline-offset-[8px] group-hover:underline">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            <div className="sm:text-right">
              <span className="block type-sc text-[1.02rem] text-lead">Contact</span>
              <Link
                href="/#contact"
                className="mt-1 inline-block type-display text-display-md text-paper decoration-paper/60 decoration-1 underline-offset-[8px] hover:underline"
              >
                Get in touch
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </ReelProvider>
  )
}
