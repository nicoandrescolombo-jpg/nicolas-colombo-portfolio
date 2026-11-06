import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft, ArrowUpRight } from 'lucide-react'
import type { ProjectMedia } from '@/types'
import { getProjectBySlug, getPublishedProjects, getSiteSettings } from '@/lib/queries/projects'
import { createClient } from '@/lib/supabase/server'
import { findReel, mediaSrc, projectKind, projectThumbnail } from '@/lib/utils/portfolio'
import { cn, typeset } from '@/lib/utils/helpers'
import Navigation from '@/components/public/Navigation'
import GifSequence from '@/components/public/GifSequence'
import MediaItem, { isVisual, toLightboxItem } from '@/components/public/MediaItem'
import { LightboxProvider, type LightboxItem } from '@/components/public/Lightbox'
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

/** Texto del link según adónde apunta */
function linkLabel(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (/youtube\.com|youtu\.be/.test(host)) return 'YouTube channel'
    if (/instagram\.com/.test(host)) return 'Instagram'
    if (/vimeo\.com/.test(host)) return 'Vimeo'
    return host
  } catch {
    return url
  }
}

/**
 * La página es un solo recorrido, en el orden del admin:
 * - un boceto con su final se muestra junto (fundido con el scroll si ambos
 *   son imágenes, botón Sketch / Final si hay un clip) y el final no se repite;
 * - el resto va en una grilla de dos columnas; ocupan toda la fila la primera
 *   pieza, las muy anchas, las verticales y la que queda sola al final de un grupo.
 */
type Block =
  | { kind: 'media'; item: ProjectMedia; span: 'full' | 'half' | 'center' }
  | { kind: 'dissolve'; sketch: ProjectMedia; final: ProjectMedia }
  | { kind: 'pair'; sketch: ProjectMedia; final: ProjectMedia }

function buildBlocks(media: ProjectMedia[]): Block[] {
  const byId = new Map(media.map((m) => [m.id, m]))
  const shownInPair = new Set(
    media.filter((m) => m.pair_id && byId.has(m.pair_id)).map((m) => m.pair_id as string),
  )

  const blocks: Block[] = []
  for (const item of media) {
    if (shownInPair.has(item.id)) continue
    const final = item.pair_id ? byId.get(item.pair_id) : undefined
    if (final && mediaSrc(item) && mediaSrc(final)) {
      blocks.push({ kind: isVisual(item) && isVisual(final) ? 'dissolve' : 'pair', sketch: item, final })
      continue
    }
    const ratio = item.width && item.height ? item.width / item.height : 16 / 9
    const full =
      blocks.length === 0 ||
      item.media_type === 'youtube' ||
      item.media_type === 'vimeo' ||
      ratio > 2.2 ||
      ratio < 1
    blocks.push({ kind: 'media', item, span: full ? 'full' : 'half' })
  }

  // Una pieza de media fila que queda sola al final de su grupo va centrada
  let run: Extract<Block, { kind: 'media' }>[] = []
  const closeRun = () => {
    if (run.length % 2 === 1) run[run.length - 1].span = 'center'
    run = []
  }
  for (const b of blocks) {
    if (b.kind === 'media' && b.span === 'half') run.push(b)
    else closeRun()
  }
  closeRun()

  return blocks
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
  const blocks = buildBlocks(mediaList)
  // Piezas del visor, en el orden en que aparecen en la página
  const ordered: ProjectMedia[] =
    project.project_type === 'gif_sequence'
      ? mediaList
      : blocks.flatMap((b) =>
          b.kind === 'media' ? [b.item] : b.kind === 'dissolve' ? [b.final, b.sketch] : [b.sketch, b.final],
        )
  const lightboxItems = ordered
    .map((m) => toLightboxItem(m, project.title))
    .filter((x): x is LightboxItem => !!x)
  const reel = findReel(settings.identity, projects)
  const kind = projectKind(project)
  const link = project.link_url?.trim()
  const paragraphs = (project.body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

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
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 type-sc text-[1.05rem] text-paper decoration-paper/60 decoration-1 underline-offset-[6px] hover:underline"
                >
                  {linkLabel(link)}
                  <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </a>
              )}
            </div>
          </header>

          <LightboxProvider items={lightboxItems}>
          <section aria-label="Work">
            {project.project_type === 'gif_sequence' ? (
              <GifSequence project={project} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-12">
                {blocks.map((b, i) => {
                  if (b.kind === 'dissolve') {
                    return (
                      <div key={b.sketch.id} className="md:col-span-2 my-8 sm:my-16">
                        <ProcessDissolve
                          title={project.title}
                          final={{ id: b.final.id, src: mediaSrc(b.final)!, width: b.final.width, height: b.final.height }}
                          sketch={{ id: b.sketch.id, src: mediaSrc(b.sketch)!, width: b.sketch.width, height: b.sketch.height }}
                        />
                        {b.sketch.caption && (
                          <p className="type-body italic text-[0.98rem] text-lead max-w-[60ch]">{b.sketch.caption}</p>
                        )}
                      </div>
                    )
                  }
                  if (b.kind === 'pair') {
                    return (
                      <div key={b.sketch.id} className="md:col-span-2">
                        <SketchPair sketch={b.sketch} final={b.final} title={project.title} />
                      </div>
                    )
                  }
                  const half = b.span === 'half'
                  return (
                    <MediaItem
                      key={b.item.id}
                      item={b.item}
                      title={project.title}
                      priority={i === 0}
                      posterUrl={i === 0 ? project.cover_url : null}
                      sizes={half ? '(max-width: 768px) 100vw, 672px' : '(max-width: 1440px) 100vw, 1344px'}
                      className={cn(
                        b.span === 'full' && 'md:col-span-2',
                        b.span === 'center' && 'md:col-span-2 md:w-[calc(50%-1rem)] md:mx-auto',
                      )}
                    />
                  )
                })}
              </div>
            )}
          </section>
          </LightboxProvider>

          {paragraphs.length > 0 && (
            <section aria-label="About the project" className="mt-24 sm:mt-32">
              <div className="mb-8 sm:mb-10 pt-6 border-t border-rule">
                <h2 className="type-sc text-[1.15rem] text-paper">About the project</h2>
              </div>
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
