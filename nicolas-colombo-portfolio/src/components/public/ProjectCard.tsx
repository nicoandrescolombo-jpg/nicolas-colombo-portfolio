'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project, ProjectMedia } from '@/types'
import { cn, getVideoEmbedUrl, typeset } from '@/lib/utils/helpers'
import { mediaSrc, projectKind, projectThumbnail } from '@/lib/utils/portfolio'
import AnimatedImage from './AnimatedImage'

export type CardSize = 'wide' | 'narrow' | 'full'

interface ProjectCardProps {
  project: Project
  size: CardSize
  priority?: boolean
}

const isVideo = (m: ProjectMedia) => m.media_type === 'youtube' || m.media_type === 'vimeo'

export default function ProjectCard({ project, size, priority = false }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const [slide, setSlide] = useState(0)

  const media = project.media ?? []
  const videoMedia = media.find(isVideo)
  const gifMedia = media.find((m) => m.media_type === 'gif')
  const stills = media.filter((m) => m.media_type === 'image')

  // Solo hay vista previa con mouse (en celulares el toque abre el proyecto)
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  const showVideoPreview = canHover && isHovered && !!videoMedia?.external_url
  const videoPreviewUrl = videoMedia?.external_url
    ? getVideoEmbedUrl(videoMedia.external_url, { autoplay: true, muted: true, background: true })
    : null

  // Varias imágenes fijas: se pasan solas mientras el mouse está encima
  useEffect(() => {
    if (!(canHover && isHovered && stills.length > 1 && !videoMedia)) {
      setSlide(0)
      return
    }
    const id = window.setInterval(() => setSlide((s) => (s + 1) % stills.length), 1100)
    return () => window.clearInterval(id)
  }, [canHover, isHovered, stills.length, videoMedia])

  const cover = project.cover_url
  const gifSrc = mediaSrc(gifMedia)
  const thumb = projectThumbnail(project)
  // Si no hay portada y el proyecto es de GIFs, la grilla muestra el GIF animado
  const showGif = !cover && !videoMedia && !!gifSrc
  const kind = projectKind(project)

  const mediaBox = cn(
    'relative w-full overflow-hidden bg-graphite',
    size === 'full' && 'aspect-video md:aspect-cinema',
    size === 'wide' && 'aspect-video',
    size === 'narrow' && 'aspect-video md:aspect-auto md:flex-1 md:min-h-0',
  )

  const sizes =
    size === 'full'
      ? '(max-width: 768px) 100vw, 1360px'
      : size === 'wide'
        ? '(max-width: 768px) 100vw, 900px'
        : '(max-width: 768px) 100vw, 450px'

  return (
    <Link
      href={`/project/${project.slug}`}
      className="group flex flex-col h-full focus-visible:outline-offset-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={mediaBox}>
        {showGif ? (
          <AnimatedImage src={gifSrc!} alt={project.title} variant="fill" priority={priority} />
        ) : thumb ? (
          <Image
            src={stills.length > 1 && slide > 0 ? mediaSrc(stills[slide]) ?? thumb : thumb}
            alt={project.title}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={/\.gif($|\?)/i.test(thumb)}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-5">
            <span className="type-display text-3xl text-lead">{project.title}</span>
          </div>
        )}

        {/* Vista previa en vivo del video al pasar el mouse */}
        {showVideoPreview && videoPreviewUrl && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-black">
            <iframe
              src={videoPreviewUrl}
              title={`${project.title} preview`}
              allow="autoplay; encrypted-media"
              tabIndex={-1}
              className="absolute top-1/2 left-1/2 w-[110%] h-[110%] -translate-x-1/2 -translate-y-1/2 border-0"
            />
          </div>
        )}
      </div>

      <div className="pt-4 flex items-baseline justify-between gap-4">
        <h3 className="type-display text-[1.45rem] leading-tight text-paper decoration-paper/60 decoration-1 underline-offset-[6px] group-hover:underline">
          {typeset(project.title)}
        </h3>
        {kind && <span className="type-sc text-[1rem] text-lead shrink-0">{kind}</span>}
      </div>
    </Link>
  )
}
