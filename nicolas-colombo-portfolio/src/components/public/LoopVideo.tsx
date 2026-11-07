'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/helpers'

/**
 * Clip de animación (webm/mp4 subido a Storage).
 * Se reproduce en loop y sin sonido, como un GIF. Si el clip tiene audio
 * (un lip sync, un diálogo), aparece un botón "Sound" para escucharlo; al
 * activar uno, los demás se callan. Los clips largos (un animatic) muestran
 * controles. Con "reducir movimiento" queda quieto y con controles.
 */

const LONG_CLIP_S = 30
const SOLO_EVENT = 'loopvideo:solo'

/** ¿El navegador ya sabe que el clip tiene audio? (cada uno lo expone distinto) */
function detectAudio(v: HTMLVideoElement) {
  const any = v as HTMLVideoElement & {
    mozHasAudio?: boolean
    webkitAudioDecodedByteCount?: number
    audioTracks?: { length: number }
  }
  return !!(any.mozHasAudio || (any.webkitAudioDecodedByteCount ?? 0) > 0 || (any.audioTracks && any.audioTracks.length > 0))
}

export default function LoopVideo({
  src,
  label,
  width,
  height,
  className,
  silent = false,
}: {
  src: string
  label: string
  width?: number | null
  height?: number | null
  className?: string
  /** Oculto (p. ej. la otra cara de Sketch / Final): sin sonido */
  silent?: boolean
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [muted, setMuted] = useState(true)
  const [long, setLong] = useState(false)

  // Otro clip activó el sonido: este se calla
  useEffect(() => {
    const onSolo = (e: Event) => {
      if ((e as CustomEvent).detail !== ref.current) setMuted(true)
    }
    window.addEventListener(SOLO_EVENT, onSolo)
    return () => window.removeEventListener(SOLO_EVENT, onSolo)
  }, [])

  useEffect(() => {
    if (silent) setMuted(true)
  }, [silent])

  // La duración puede haber llegado antes de hidratar React (onLoadedMetadata se pierde)
  useEffect(() => {
    const v = ref.current
    if (v && v.readyState >= 1 && v.duration > LONG_CLIP_S) setLong(true)
  }, [reduce])

  useEffect(() => {
    if (ref.current) ref.current.muted = muted
  }, [muted])

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const v = ref.current
    if (!v) return
    const next = !muted
    setMuted(next)
    if (!next) {
      window.dispatchEvent(new CustomEvent(SOLO_EVENT, { detail: v }))
      v.currentTime = 0
      v.play().catch(() => {})
    }
  }

  const showControls = !!reduce || long

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        key={reduce ? 'still' : 'loop'}
        src={src}
        autoPlay={!reduce}
        loop
        muted
        playsInline
        controls={showControls}
        preload="metadata"
        width={width || undefined}
        height={height || undefined}
        aria-label={label}
        onLoadedMetadata={(e) => setLong(e.currentTarget.duration > LONG_CLIP_S)}
        onTimeUpdate={(e) => {
          if (!hasAudio && detectAudio(e.currentTarget)) setHasAudio(true)
        }}
        onVolumeChange={(e) => {
          // Con controles nativos, el sonido se maneja desde ahí
          if (showControls) setMuted(e.currentTarget.muted)
        }}
        className={cn('block w-full h-auto', className)}
      />
      {hasAudio && !showControls && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? `Play ${label} with sound` : `Mute ${label}`}
          className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 z-10 px-2.5 py-1 bg-ink/75 type-sc text-[0.95rem] text-paper/85 hover:text-paper transition-colors"
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>
      )}
    </div>
  )
}
