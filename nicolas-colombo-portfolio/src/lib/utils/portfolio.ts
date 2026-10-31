import type { IdentitySettings, Project, ProjectMedia, ReelInfo } from '@/types'
import { getVideoEmbedUrl, getVideoThumbnail } from './helpers'

const isVideo = (m: ProjectMedia) => m.media_type === 'youtube' || m.media_type === 'vimeo'

/**
 * Decide qué video abre el botón "Watch reel":
 * 1. El link cargado en Admin → Perfil y reel.
 * 2. Si no hay, el primer proyecto con video cuyo título o slug diga "reel".
 */
export function findReel(identity: IdentitySettings, projects: Project[]): ReelInfo | null {
  const manual = identity.reel_url?.trim()
  if (manual) {
    const embedUrl = getVideoEmbedUrl(manual)
    if (embedUrl) return { url: manual, embedUrl, title: 'Reel' }
  }

  const reelProject = projects.find(
    (p) => /reel/i.test(`${p.slug} ${p.title}`) && (p.media ?? []).some(isVideo),
  )
  const media = reelProject?.media?.find(isVideo)
  if (reelProject && media?.external_url) {
    const embedUrl = getVideoEmbedUrl(media.external_url)
    if (embedUrl) return { url: media.external_url, embedUrl, title: reelProject.title }
  }

  return null
}

/**
 * Etiqueta corta del tipo de pieza, en el idioma del sitio.
 * Devuelve null cuando repetiría el título (ej. "Demoreel" → "Reel").
 */
export function projectKind(project: Project): string | null {
  const media = project.media ?? []
  if (/reel/i.test(`${project.slug} ${project.title}`)) return null
  if (project.project_type === 'gif_sequence') return 'Animation loops'
  if (media.some(isVideo)) return 'Film'
  if (media.some((m) => m.media_type === 'gif')) return 'Animation loops'
  return 'Stills'
}

/** URL pública de un archivo de media (subido o externo) */
export function mediaSrc(m: ProjectMedia | undefined | null): string | null {
  if (!m) return null
  return m.storage_path || m.external_url || null
}

/** Miniatura estática para la grilla y para Open Graph */
export function projectThumbnail(project: Project): string | null {
  if (project.cover_url) return project.cover_url
  const media = project.media ?? []
  const video = media.find(isVideo)
  if (video?.external_url) return getVideoThumbnail(video.external_url)
  const first = media.find((m) => m.media_type === 'image' || m.media_type === 'gif')
  return mediaSrc(first)
}
