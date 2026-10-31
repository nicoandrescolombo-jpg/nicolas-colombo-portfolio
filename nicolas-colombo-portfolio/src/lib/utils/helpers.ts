import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a URL-safe slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Format a date string for display */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

/** Extract YouTube video ID from various URL formats */
export function getYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** Extract Vimeo video ID from URL */
export function getVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/)(\d+)/)
  return match ? match[1] : null
}

/** Get YouTube thumbnail URL */
export function getYoutubeThumbnail(
  videoId: string,
  quality: 'hqdefault' | 'maxresdefault' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Build an embeddable player URL from a YouTube or Vimeo link.
 * Supports unlisted Vimeo links (vimeo.com/123456/abcdef → ?h=abcdef).
 */
export function getVideoEmbedUrl(
  url: string,
  opts: { autoplay?: boolean; muted?: boolean; background?: boolean } = {},
): string | null {
  const { autoplay = true, muted = false, background = false } = opts

  const yt = getYoutubeId(url)
  if (yt && /youtu\.?be/.test(url)) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    })
    if (background) {
      params.set('controls', '0')
      params.set('loop', '1')
      params.set('playlist', yt)
    }
    return `https://www.youtube-nocookie.com/embed/${yt}?${params.toString()}`
  }

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/)
  if (vm) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      muted: muted ? '1' : '0',
      title: '0',
      byline: '0',
      portrait: '0',
      dnt: '1',
    })
    if (vm[2]) params.set('h', vm[2])
    if (background) {
      params.set('background', '1')
      params.set('loop', '1')
    }
    return `https://player.vimeo.com/video/${vm[1]}?${params.toString()}`
  }

  return null
}

/** Static thumbnail for a YouTube or Vimeo link */
export function getVideoThumbnail(url: string): string | null {
  const yt = getYoutubeId(url)
  if (yt && /youtu\.?be/.test(url)) return getYoutubeThumbnail(yt, 'hqdefault')
  const vm = getVimeoId(url)
  if (vm) return `https://vumbnail.com/${vm}.jpg`
  return null
}

/**
 * Composición tipográfica de textos que vienen de la base:
 * apóstrofos y comillas curvas, raya y puntos suspensivos.
 */
export function typeset(text: string): string {
  return text
    .replace(/(\w)'(\w)/g, '$1\u2019$2')
    .replace(/(^|[\s(\[{—–-])"(?=\S)/g, '$1\u201C')
    .replace(/"/g, '\u201D')
    .replace(/(^|[\s(\[{—–-])'(?=\S)/g, '$1\u2018')
    .replace(/'/g, '\u2019')
    .replace(/\s--\s/g, ' \u2014 ')
    .replace(/\.\.\./g, '\u2026')
}

/** Truncate text with ellipsis */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
