'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/helpers'
import FieldGuide from './FieldGuide'

/**
 * Muestra GIFs (y otras imágenes) respetando el pixel art:
 * si la imagen es chica (≤ 400 px), la agranda en múltiplos enteros y sin
 * suavizado para que los píxeles queden nítidos; si es grande, la muestra normal.
 *
 * - variant="fill": ocupa el contenedor padre (que debe tener tamaño y position: relative)
 * - variant="frame": se dimensiona sola (para la página de cada proyecto)
 */

const SMALL = 400

interface Props {
  src: string
  alt: string
  variant?: 'fill' | 'frame'
  /** Margen interno relativo cuando se agranda pixel art (0–0.4) */
  padding?: number
  maxScale?: number
  priority?: boolean
  className?: string
}

type Size = { w: number; h: number }

export default function AnimatedImage({
  src,
  alt,
  variant = 'fill',
  padding = 0.08,
  maxScale = 10,
  priority = false,
  className,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [nat, setNat] = useState<Size | null>(null)
  const [box, setBox] = useState<Size | null>(null)

  const readNatural = useCallback(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) {
      setNat({ w: img.naturalWidth, h: img.naturalHeight })
    }
  }, [])

  // La imagen puede haber cargado antes de hidratar React
  useEffect(() => {
    readNatural()
  }, [readNatural, src])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isSmall = !!nat && nat.w <= SMALL && nat.h <= SMALL

  let imgStyle: React.CSSProperties | undefined
  let scale = 1
  if (isSmall && nat && box && box.w > 0 && box.h > 0) {
    const avW = box.w * (1 - padding * 2)
    const avH = box.h * (1 - padding * 2)
    scale = Math.max(1, Math.min(maxScale, Math.floor(Math.min(avW / nat.w, avH / nat.h))))
    imgStyle = { width: nat.w * scale, height: nat.h * scale }
  }

  // Datos reales del archivo (nombre, tamaño y escala), como en una hoja de revisión
  const fileName = (() => {
    try {
      return decodeURIComponent(new URL(src, 'https://x').pathname.split('/').pop() || '')
    } catch {
      return ''
    }
  })()
  const specs = nat ? `${nat.w} × ${nat.h} px${scale > 1 ? `, shown at ${scale}×` : ''}` : null

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={readNatural}
      draggable={false}
      style={imgStyle}
      className={cn(
        'select-none transition-opacity duration-300',
        nat ? 'opacity-100' : 'opacity-0',
        isSmall ? 'pixelated max-w-none' : 'w-full h-full object-contain',
        className,
      )}
    />
  )

  if (variant === 'fill') {
    return (
      <div ref={boxRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {img}
      </div>
    )
  }

  // variant="frame": el dibujo en un panel, con un epígrafe de datos reales debajo
  const caption =
    nat && (fileName || specs) ? (
      <p className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 type-body text-[0.95rem] text-lead">
        <span className="italic">{fileName}</span>
        <span className="figures">{specs}</span>
      </p>
    ) : null

  if (nat && !isSmall) {
    return (
      <div>
        <div
          ref={boxRef}
          className="relative mx-auto w-full"
          style={{ aspectRatio: `${nat.w} / ${nat.h}`, maxWidth: nat.w }}
        >
          {img}
        </div>
        {caption}
      </div>
    )
  }

  return (
    <div>
      <div
        ref={boxRef}
        className="relative w-full bg-graphite flex items-center justify-center overflow-hidden"
        style={{ height: 'clamp(320px, 70vh, 760px)' }}
      >
        {img}
        <FieldGuide className="inset-4 sm:inset-6" />
      </div>
      {caption}
    </div>
  )
}
