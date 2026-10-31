import React from 'react'
import type { Project } from '@/types'
import AnimatedImage from './AnimatedImage'

interface GifSequenceProps {
  project: Project
}

export default function GifSequence({ project }: GifSequenceProps) {
  const mediaList = project.media || []

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {mediaList.map((item, index) => {
        const src = item.storage_path || item.external_url
        if (!src) return null

        return (
          <figure key={item.id || index}>
            <AnimatedImage
              src={src}
              alt={item.alt_text || `${project.title}, loop ${index + 1}`}
              variant="frame"
              padding={0.06}
              priority={index === 0}
            />
            {item.alt_text && (
              <figcaption className="mt-1 type-body text-paper/85">{item.alt_text}</figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
