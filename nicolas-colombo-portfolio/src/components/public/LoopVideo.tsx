'use client'

import React from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/helpers'

/**
 * Clip corto de animación (webm/mp4 subido a Storage).
 * Se reproduce en loop y sin sonido, como un GIF; con "reducir movimiento"
 * activado queda quieto y con controles para que lo arranque quien mira.
 */
export default function LoopVideo({
  src,
  label,
  width,
  height,
  className,
}: {
  src: string
  label: string
  width?: number | null
  height?: number | null
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <video
      key={reduce ? 'still' : 'loop'}
      src={src}
      autoPlay={!reduce}
      loop
      muted
      playsInline
      controls={!!reduce}
      preload="metadata"
      width={width || undefined}
      height={height || undefined}
      aria-label={label}
      className={cn('block w-full h-auto', className)}
    />
  )
}
