'use client'

import React from 'react'
import Image from 'next/image'
import type { Project } from '@/types'

interface GifSequenceProps {
  project: Project
}

export default function GifSequence({ project }: GifSequenceProps) {
  const mediaList = project.media || []

  return (
    <div className="w-full flex flex-col items-center gap-16 md:gap-24">
      {mediaList.map((item, index) => {
        const src = item.storage_path || item.external_url

        if (!src) return null

        // Aspect ratio reservation to avoid Cumulative Layout Shift (CLS)
        const width = item.width || 1200
        const height = item.height || 800
        const aspectRatio = width / height

        return (
          <div
            key={item.id || index}
            className="w-full max-w-4xl mx-auto flex flex-col items-center"
          >
            <div
              className="relative w-full rounded-md overflow-hidden bg-[#121212] border border-[#222222]"
              style={{
                aspectRatio: `${width} / ${height}`,
              }}
            >
              <Image
                src={src}
                alt={item.alt_text || `${project.title} - Frame ${index + 1}`}
                fill
                unoptimized // Crucial for GIFs: prevents Next.js from freezing gif frames
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain w-full h-full"
              />
            </div>

            {item.alt_text && (
              <span className="mt-4 font-ui text-xs text-text-tertiary tracking-wider text-center">
                {item.alt_text}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
