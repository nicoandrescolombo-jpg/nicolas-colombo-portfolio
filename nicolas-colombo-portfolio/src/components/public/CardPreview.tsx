'use client'

import React, { useEffect, useState } from 'react'
import type { ProjectMedia } from '@/types'
import { mediaSrc } from '@/lib/utils/portfolio'

/**
 * Vista previa de la tarjeta de la home: reproduce, una tras otra, las piezas
 * marcadas como "vista previa" mientras el mouse está encima.
 * Un clip pasa al siguiente cuando termina; un GIF, después de `gifMs`.
 */
export default function CardPreview({ items, gifMs = 3200 }: { items: ProjectMedia[]; gifMs?: number }) {
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState(0)
  const item = items[index % items.length]
  const src = mediaSrc(item)
  const isClip = item?.media_type === 'video' || item?.media_type === 'webm'

  const next = () => {
    setIndex((i) => (i + 1) % items.length)
    setRound((r) => r + 1)
  }

  // GIF: no avisa cuándo termina, se le da un tiempo fijo
  useEffect(() => {
    if (!item || isClip) return
    const id = window.setTimeout(next, gifMs)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, isClip, gifMs])

  if (!src) return null

  return (
    <div className={`absolute inset-0 z-10 pointer-events-none ${isClip ? 'bg-paper' : 'bg-black'}`}>
      {isClip ? (
        <video
          key={round}
          src={src}
          autoPlay
          muted
          playsInline
          onEnded={items.length > 1 ? next : undefined}
          loop={items.length === 1}
          className="w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={round} src={src} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  )
}
