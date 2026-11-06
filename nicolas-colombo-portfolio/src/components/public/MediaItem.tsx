import React from 'react'
import Image from 'next/image'
import type { ProjectMedia } from '@/types'
import { mediaSrc } from '@/lib/utils/portfolio'
import { cn } from '@/lib/utils/helpers'
import VideoEmbed from './VideoEmbed'
import AnimatedImage from './AnimatedImage'
import LoopVideo from './LoopVideo'
import { LightboxTrigger, type LightboxItem } from './Lightbox'

/** Datos de una pieza para el visor a pantalla completa (null si no se puede ampliar) */
export function toLightboxItem(item: ProjectMedia, title: string): LightboxItem | null {
  const src = mediaSrc(item)
  if (!src || item.media_type === 'youtube' || item.media_type === 'vimeo') return null
  return {
    id: item.id,
    src,
    type: item.media_type === 'gif' ? 'gif' : item.media_type === 'image' ? 'image' : 'video',
    width: item.width,
    height: item.height,
    alt: item.alt_text || title,
    caption: item.caption,
  }
}

interface Props {
  item: ProjectMedia
  title: string
  priority?: boolean
  posterUrl?: string | null
  /** Tamaño de referencia para next/image */
  sizes?: string
  className?: string
}

export function isVisual(item: ProjectMedia) {
  return item.media_type === 'image' || item.media_type === 'gif'
}

/** Una pieza (imagen, GIF, clip o video embebido) con su epígrafe */
export default function MediaItem({
  item,
  title,
  priority = false,
  posterUrl = null,
  sizes = '(max-width: 1440px) 100vw, 1344px',
  className,
}: Props) {
  const alt = item.alt_text || title
  const caption = item.caption?.trim()
  const src = mediaSrc(item)

  let body: React.ReactNode = null

  if (item.media_type === 'youtube' || item.media_type === 'vimeo') {
    body = (
      <VideoEmbed url={item.external_url || ''} mediaType={item.media_type} title={title} posterUrl={posterUrl} />
    )
  } else if (!src) {
    return null
  } else if (item.media_type === 'video' || item.media_type === 'webm') {
    // Los clips se exportan con fondo transparente (webm con alfa): sobre el
    // negro de la página los personajes oscuros desaparecen, así que van
    // sobre papel, como en la hoja de animación.
    body = (
      <div className="bg-paper">
        <LoopVideo src={src} label={alt} width={item.width} height={item.height} />
      </div>
    )
  } else if (item.media_type === 'gif') {
    body = <AnimatedImage src={src} alt={alt} variant="frame" padding={0.06} priority={priority} />
  } else {
    const portrait = !!item.width && !!item.height && item.height > item.width
    body = (
      <div className="bg-graphite">
        <Image
          src={src}
          alt={alt}
          width={item.width || 1920}
          height={item.height || 1080}
          sizes={sizes}
          priority={priority}
          className={cn('w-full h-auto', portrait && 'max-h-[85vh] w-auto mx-auto')}
        />
      </div>
    )
  }

  const isEmbed = item.media_type === 'youtube' || item.media_type === 'vimeo'

  return (
    <figure className={className}>
      {isEmbed ? (
        body
      ) : (
        <LightboxTrigger id={item.id} label={alt}>
          {body}
        </LightboxTrigger>
      )}
      {caption && (
        <figcaption className="mt-3 type-body italic text-[0.98rem] leading-snug text-lead max-w-[60ch]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
