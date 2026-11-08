'use client'

import React, { useState } from 'react'
import type { ProjectMedia } from '@/types'
import { mediaSrc } from '@/lib/utils/portfolio'
import LoopVideo from './LoopVideo'
import { LightboxTrigger } from './Lightbox'

/**
 * Un boceto con la pieza final que salió de él, en el mismo cuadro.
 * El botón alterna entre los dos con un fundido en 6 pasos (no corre solo).
 */
export default function SketchPair({
  sketch,
  final,
  title,
  startOnFinal = false,
}: {
  sketch: ProjectMedia
  final: ProjectMedia
  title: string
  /** Mostrar primero el final (en vez del boceto) */
  startOnFinal?: boolean
}) {
  const [showFinal, setShowFinal] = useState(startOnFinal)
  const sketchSrc = mediaSrc(sketch)
  const finalSrc = mediaSrc(final)
  if (!sketchSrc || !finalSrc) return null

  const w = sketch.width || final.width
  const h = sketch.height || final.height
  const ratio = w && h ? `${w} / ${h}` : '16 / 9'
  const caption = sketch.caption?.trim()
  const isClip = (m: ProjectMedia) => m.media_type === 'video' || m.media_type === 'webm'
  // Clips con fondo transparente: papel en vez de negro (ver MediaItem)
  const panel = isClip(sketch) || isClip(final) ? 'bg-paper' : 'bg-graphite'

  const layer = (item: ProjectMedia, src: string, visible: boolean, label: string) => (
    <div
      className="absolute inset-0 transition-opacity duration-500 [transition-timing-function:steps(6,end)] motion-reduce:transition-none"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? undefined : 'none' }}
      aria-hidden={!visible}
    >
      {item.media_type === 'video' || item.media_type === 'webm' ? (
        <LoopVideo src={src} label={`${title}, ${label}`} className="h-full object-contain" silent={!visible} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${title}, ${label}`} loading="lazy" className="w-full h-full object-contain" />
      )}
    </div>
  )

  return (
    <figure>
      <LightboxTrigger id={showFinal ? final.id : sketch.id} label={`${title}, ${showFinal ? 'final' : 'sketch'}`}>
        <div className={`relative w-full ${panel} overflow-hidden`} style={{ aspectRatio: ratio }}>
          {layer(sketch, sketchSrc, !showFinal, 'sketch')}
          {layer(final, finalSrc, showFinal, 'final')}
        </div>
      </LightboxTrigger>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={() => setShowFinal((v) => !v)}
          aria-pressed={showFinal}
          className="type-sc text-[1rem] text-lead hover:text-paper transition-colors"
        >
          <span className={showFinal ? 'text-lead' : 'text-paper'}>Sketch</span>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className={showFinal ? 'text-paper' : 'text-lead'}>Final</span>
        </button>
        {caption && (
          <figcaption className="type-body italic text-[0.98rem] leading-snug text-lead max-w-[48ch]">
            {caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
