import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import type { ProjectMedia } from '@/types'
import { getProjectBySlug, getPublishedProjects, getSiteSettings } from '@/lib/queries/projects'
import { createClient } from '@/lib/supabase/server'
import { findReel, mediaSrc, projectKind, projectThumbnail } from '@/lib/utils/portfolio'
import { cn, typeset } from '@/lib/utils/helpers'
import Navigation from '@/components/public/Navigation'
import GifSequence from '@/components/public/GifSequence'
import MediaItem, { isVisual } from '@/components/public/MediaItem'
import ProcessDissolve from '@/components/public/ProcessDissolve'
import SketchPair from '@/components/public/SketchPair'
import { ReelProvider } from '@/components/public/Reel'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

/** El admin logueado puede ver borradores en su URL real */
async function isAdmin() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return !!data.user
  } catch {
    return false
  }
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

/** Ancho de cada pieza final en la grilla: las anchas y la primera ocupan toda la fila */
function finalSpan(item: ProjectMedia, index: number) {
  if (index === 0) return 'md:col-span-2'
  if (item.media_type === 'youtube' || item.media_type === 'vimeo') return 'md:col-span-2'
  if (item.width && item.height && item.width / item.height > 2.2) return 'md:col-span-2'
  return ''
}

function SectionHead({ number, label, note }: { number: string; label: string; note?: string }) {
  return (
    <div className="mb-8 sm:mb-10 pt-6 border-t border-rule flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
      <h2 className="type-sc text-[1.15rem] text-paper">
        <span className="figures text-lead mr-3">{number}</span>
        {label}
      </h2>
      {note && <p className="type-body italic text-[1rem] text-lead">{note}</p>}
    </div>
  )
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const admin = await isAdmin()
  const [project, settings, projects] = await Promise.all([
    getProjectBySlug(slug, { includeDrafts: admin }),
    getSiteSettings(),
    getPublishedProjects(),
  ])

  if (!project) {
    notFound()
  }

  const mediaList = project.media || []
  const finals = mediaList.filter((m) => (m.section ?? 'final') === 'final')
  const process = mediaList.filter((m) => m.section === 'process')
  const byId = new Map(mediaList.map((m) => [m.id, m]))

  // El primer boceto con su final (ambos imágenes) abre el proceso con el fundido
  const lead = process.find((m) => {
    const f = m.pair_id ? byId.get(m.pair_id) : null
    return isVisual(m) && f && isVisual(f) && mediaSrc(m) && mediaSrc(f)
  })
  const leadFinal = lead?.pair_id ? byId.get(lead.pair_id) : undefined
  const restProcess = process.filter((m) => m !== lead)

  const reel = findReel(settings.identity, projects)
  const kind = projectKind(project)
  const credits = [
    { role: 'Client', value: project.client },
    { role: 'Role', value: project.role },
    { role: 'Year', value: project.year },
  ].filter((c) => c.value?.trim())
  const paragraphs = (project.body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const hasProcess = process.length > 0
  const hasNotes = paragraphs.length > 0

  // Siguiente proyecto (vuelve al primero al llegar al final)
  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null

  return (
    <ReelProvider reel={reel}>
      <Navigation />

      <main className="pt-28 sm:pt-36 pb-10">
        <div className="site-container">
          {project.status === 'draft' && (
            <p className="mb-6 type-sc text-[1rem] text-lead">Draft · only you can see this page</p>
          )}

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
            <div className="lg:col-span-5">
              {project.description && (
                <p className="type-body text-[1.2rem] leading-relaxed text-paper/85 max-w-[52ch] whitespace-pre-line">
                  {typeset(project.description)}
                </p>
              )}
              {credits.length > 0 && (
                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                  {credits.map((c) => (
                    <React.Fragment key={c.role}>
                      <dt className="type-sc text-[1rem] text-lead">{c.role}</dt>
                      <dd className="type-body text-[1.05rem] text-paper/90">{c.value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              )}
            </div>
          </header>

          {/* I. Resultado final */}
          <section aria-label="Final work">
            {(hasProcess || hasNotes) && <SectionHead number="I" label="Final work" />}
            {project.project_type === 'gif_sequence' ? (
              <GifSequence project={{ ...project, media: finals }} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {finals.map((item, i) => (
                  <MediaItem
                    key={item.id}
                    item={item}
                    title={project.title}
                    priority={i === 0}
                    posterUrl={i === 0 ? project.cover_url : null}
                    sizes={finalSpan(item, i) ? '(max-width: 1440px) 100vw, 1344px' : '(max-width: 768px) 100vw, 672px'}
                    className={finalSpan(item, i)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* II. Proceso */}
          {hasProcess && (
            <section aria-label="Process" className="mt-24 sm:mt-32">
              <SectionHead number="II" label="Process" note="Sketches, roughs and tests behind the final work" />

              {lead && leadFinal && (
                <div className="mb-16 sm:mb-24">
                  <ProcessDissolve
                    title={project.title}
                    final={{ src: mediaSrc(leadFinal)!, width: leadFinal.width, height: leadFinal.height }}
                    sketch={{ src: mediaSrc(lead)!, width: lead.width, height: lead.height }}
                  />
                  {lead.caption && (
                    <p className="type-body italic text-[0.98rem] text-lead max-w-[60ch]">
                      {lead.caption}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
                {restProcess.map((item) => {
                  const pair = item.pair_id ? byId.get(item.pair_id) : undefined
                  if (pair) {
                    return <SketchPair key={item.id} sketch={item} final={pair} title={project.title} />
                  }
                  return (
                    <MediaItem
                      key={item.id}
                      item={item}
                      title={project.title}
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* III. Sobre el proyecto */}
          {hasNotes && (
            <section aria-label="About the project" className="mt-24 sm:mt-32">
              <SectionHead number={hasProcess ? 'III' : 'II'} label="About the project" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-start-4 lg:col-span-7 space-y-5">
                  {paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={cn(
                        'type-body leading-relaxed text-paper/90 max-w-[62ch] whitespace-pre-line',
                        i === 0 ? 'text-[1.3rem]' : 'text-[1.15rem]',
                      )}
                    >
                      {typeset(p)}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

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
