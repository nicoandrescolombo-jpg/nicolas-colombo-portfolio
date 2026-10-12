'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Project, ProjectMedia } from '@/types'
import { getYoutubeThumbnail, getYoutubeId, getVimeoId } from '@/lib/utils/helpers'

interface ProjectCardProps {
  project: Project
  priority?: boolean
}

export default function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const mediaList: ProjectMedia[] = project.media || []

  // Check media categories
  const videoMedia = mediaList.find((m) => m.media_type === 'youtube' || m.media_type === 'vimeo')
  const gifMedia = mediaList.find((m) => m.media_type === 'gif')
  const allImages = mediaList.filter((m) => m.media_type === 'image' || m.media_type === 'gif')

  // Multiple images slideshow logic on hover
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isHovered && allImages.length > 1 && !videoMedia) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length)
      }, 1200) // Transition every 1.2s
    } else {
      setActiveImageIndex(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered, allImages.length, videoMedia])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setActiveImageIndex(0)
  }

  // Determine default thumbnail
  let staticThumbnail = project.cover_url

  if (!staticThumbnail && mediaList.length > 0) {
    const first = mediaList[0]
    if (first.media_type === 'youtube' && first.external_url) {
      const ytid = getYoutubeId(first.external_url)
      if (ytid) staticThumbnail = getYoutubeThumbnail(ytid, 'hqdefault')
    } else if (first.media_type === 'vimeo' && first.external_url) {
      const vmid = getVimeoId(first.external_url)
      if (vmid) staticThumbnail = `https://vumbnail.com/${vmid}.jpg`
    } else if (first.storage_path) {
      staticThumbnail = first.storage_path
    }
  }

  // Video embed preview URL for iframe autoplay (muted, loop, minimal UI)
  let videoPreviewEmbedUrl: string | null = null
  if (videoMedia?.external_url) {
    if (videoMedia.media_type === 'youtube') {
      const ytid = getYoutubeId(videoMedia.external_url)
      if (ytid) {
        videoPreviewEmbedUrl = `https://www.youtube-nocookie.com/embed/${ytid}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${ytid}&showinfo=0&rel=0`
      }
    } else if (videoMedia.media_type === 'vimeo') {
      const vmid = getVimeoId(videoMedia.external_url)
      if (vmid) {
        videoPreviewEmbedUrl = `https://player.vimeo.com/video/${vmid}?autoplay=1&muted=1&background=1&autopause=0&loop=1`
      }
    }
  }

  // GIF preview source
  const gifSource = gifMedia?.storage_path || gifMedia?.external_url || null

  const isGifSequence = project.project_type === 'gif_sequence'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="project-card rounded-md overflow-hidden group flex flex-col h-full bg-[#1A1A1A] border border-[#252525] hover:border-[#383838] transition-colors duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/project/${project.slug}`} className="flex flex-col h-full flex-1">
        {/* Media Thumbnail Container with Live Preview on Hover */}
        <div className="project-card-media relative w-full aspect-[16/10] bg-[#121212] overflow-hidden">
          {/* 1. VIDEO PREVIEW (YouTube / Vimeo) */}
          {isHovered && videoPreviewEmbedUrl ? (
            <div className="absolute inset-0 z-10 w-full h-full pointer-events-none scale-105 transition-transform duration-500">
              <iframe
                src={videoPreviewEmbedUrl}
                className="w-full h-full border-none pointer-events-none"
                allow="autoplay; encrypted-media"
                title={`${project.title} Preview`}
              />
            </div>
          ) : isHovered && gifSource ? (
            /* 2. GIF LIVE PLAYBACK PREVIEW */
            <div className="absolute inset-0 z-10 w-full h-full bg-[#121212]">
              <Image
                src={gifSource}
                alt={project.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover w-full h-full scale-105 transition-transform duration-500"
              />
            </div>
          ) : isHovered && allImages.length > 1 ? (
            /* 3. MULTI-IMAGE SLIDESHOW PREVIEW */
            <div className="absolute inset-0 z-10 w-full h-full bg-[#121212]">
              <Image
                key={activeImageIndex}
                src={allImages[activeImageIndex].storage_path || allImages[activeImageIndex].external_url || ''}
                alt={`${project.title} - ${activeImageIndex + 1}`}
                fill
                unoptimized={allImages[activeImageIndex].media_type === 'gif'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover w-full h-full transition-opacity duration-500"
              />
              {/* Pagination Dots indicator on hover */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === activeImageIndex ? 'bg-accent w-3' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : staticThumbnail ? (
            /* 4. DEFAULT STATIC THUMBNAIL */
            <Image
              src={staticThumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#161616] to-[#0d0d0d]">
              <span className="font-display italic text-3xl text-text-tertiary group-hover:text-accent transition-colors">
                {project.title.slice(0, 2).toUpperCase()}
              </span>
              <span className="mt-2 font-ui text-xs tracking-widest uppercase text-text-tertiary">
                {isGifSequence ? 'Secuencia de GIFs' : 'Animación'}
              </span>
            </div>
          )}

          {/* Hover Overlay Vignette & CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5 pointer-events-none z-20">
            <span className="font-ui text-xs uppercase tracking-widest text-accent font-medium flex items-center gap-1">
              Ver obra <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
            {videoMedia && (
              <span className="font-ui text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                Vista previa en vivo
              </span>
            )}
          </div>

          {/* Tag badge */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-ui font-medium rounded bg-black/70 backdrop-blur-md text-text-secondary border border-white/5">
              {isGifSequence ? 'GIF Sequence' : videoMedia ? 'Video' : 'Artwork'}
            </span>
          </div>
        </div>

        {/* Card Footer / Info */}
        <div className="p-5 flex flex-col justify-between flex-1 gap-2">
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-text-primary group-hover:text-accent transition-colors line-clamp-1">
              {project.title}
            </h3>
            {project.description && (
              <p className="mt-1.5 font-body text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <div className="pt-3 border-t border-[#252525]/60 flex items-center justify-between text-[11px] font-ui text-text-tertiary">
            <span>Explorar</span>
            <span className="group-hover:text-text-primary transition-colors">↗</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
