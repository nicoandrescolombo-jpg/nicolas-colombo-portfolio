'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { getYoutubeThumbnail, getYoutubeId, getVimeoId } from '@/lib/utils/helpers'

interface ProjectCardProps {
  project: Project
  priority?: boolean
}

export default function ProjectCard({ project, priority = false }: ProjectCardProps) {
  // Determine media cover thumbnail
  let thumbnailSrc = project.cover_url

  if (!thumbnailSrc && project.media && project.media.length > 0) {
    const firstMedia = project.media[0]
    if (firstMedia.media_type === 'youtube' && firstMedia.external_url) {
      const ytid = getYoutubeId(firstMedia.external_url)
      if (ytid) {
        thumbnailSrc = getYoutubeThumbnail(ytid, 'hqdefault')
      }
    } else if (firstMedia.media_type === 'vimeo' && firstMedia.external_url) {
      const vmid = getVimeoId(firstMedia.external_url)
      if (vmid) {
        thumbnailSrc = `https://vumbnail.com/${vmid}.jpg`
      }
    } else if (firstMedia.storage_path) {
      thumbnailSrc = firstMedia.storage_path
    }
  }

  const isGifSequence = project.project_type === 'gif_sequence'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="project-card rounded-md overflow-hidden group flex flex-col h-full bg-[#1A1A1A] border border-[#252525] hover:border-[#383838] transition-colors duration-300"
    >
      <Link href={`/project/${project.slug}`} className="flex flex-col h-full flex-1">
        {/* Media Thumbnail Container */}
        <div className="project-card-media relative w-full aspect-[16/10] bg-[#121212] overflow-hidden">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
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

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <span className="font-ui text-xs uppercase tracking-widest text-accent font-medium flex items-center gap-1">
              Ver obra <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>

          {/* Tag badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-ui font-medium rounded bg-black/60 backdrop-blur-md text-text-secondary border border-white/5">
              {isGifSequence ? 'GIF Sequence' : 'Single Piece'}
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
