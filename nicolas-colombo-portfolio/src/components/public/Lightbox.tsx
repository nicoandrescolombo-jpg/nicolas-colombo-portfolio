'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/helpers'

/**
 * Visor a pantalla completa para las piezas de un proyecto.
 * Click en una imagen, GIF o clip → se abre en grande sobre negro.
 * Flechas (teclado o botones) o deslizar en celular para pasar; Esc o click
 * afuera para cerrar. El pixel art se agranda en múltiplos enteros y sin
 * suavizado, igual que en la página.
 */

export interface LightboxItem {
  id: string
  src: string
  type: 'image' | 'gif' | 'video'
  width?: number | null
  height?: number | null
  alt: string
  caption?: string | null
}

const Ctx = createContext<{ open: (id: string) => void } | null>(null)

export function useLightbox() {
  return useContext(Ctx)
}

const SMALL = 400

export function LightboxProvider({ items, children }: { items: LightboxItem[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null)
  const [viewport, setViewport] = useState({ w: 1280, h: 800 })
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const touchX = useRef<number | null>(null)
  const reduce = useReducedMotion()

  const open = useCallback(
    (id: string) => {
      const i = items.findIndex((it) => it.id === id)
      if (i === -1) return
      lastFocus.current = document.activeElement as HTMLElement
      setIndex(i)
    },
    [items],
  )
  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  )

  const isOpen = index !== null
  const item = isOpen ? items[index] : null

  // Teclado, scroll bloqueado y foco
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = prevOverflow
      lastFocus.current?.focus?.()
    }
  }, [isOpen, close, step])

  // Tamaño real de la pieza (para el pixel art)
  useEffect(() => {
    setNat(item?.width && item?.height ? { w: item.width, h: item.height } : null)
  }, [item])

  let pixelStyle: React.CSSProperties | undefined
  const small = !!nat && nat.w <= SMALL && nat.h <= SMALL && item?.type !== 'video'
  if (small && nat) {
    const scale = Math.max(1, Math.floor(Math.min((viewport.w * 0.9) / nat.w, (viewport.h * 0.78) / nat.h)))
    pixelStyle = { width: nat.w * scale, height: nat.h * scale }
  }

  const overlay =
    item &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.alt}
        className={cn('fixed inset-0 z-[100] bg-ink/95 flex flex-col', !reduce && 'animate-[on-twos-in_160ms_steps(4,end)]')}
        onClick={close}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || items.length < 2) return
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
          touchX.current = null
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="figures type-body text-[0.95rem] text-lead">
            {items.length > 1 ? `${index! + 1} / ${items.length}` : ''}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="p-2 -mr-2 text-lead hover:text-paper transition-colors"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-16">
          <div
            key={item.id}
            className={cn('max-w-full max-h-full flex items-center justify-center', item.type === 'video' && 'bg-paper')}
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === 'video' ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                controls
                aria-label={item.alt}
                className="block max-w-full max-h-[calc(100vh-9rem)] w-auto h-auto"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                onLoad={(e) => {
                  const img = e.currentTarget
                  if (!nat) setNat({ w: img.naturalWidth, h: img.naturalHeight })
                }}
                style={pixelStyle}
                className={cn(
                  'block select-none',
                  small ? 'pixelated max-w-none' : 'max-w-full max-h-[calc(100vh-9rem)] w-auto h-auto object-contain',
                )}
              />
            )}
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Previous"
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 p-3 text-lead hover:text-paper transition-colors"
              >
                <ChevronLeft size={28} strokeWidth={1.25} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Next"
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 p-3 text-lead hover:text-paper transition-colors"
              >
                <ChevronRight size={28} strokeWidth={1.25} />
              </button>
            </>
          )}
        </div>

        <div className="h-16 shrink-0 px-4 sm:px-6 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {item.caption && (
            <p className="type-body italic text-[0.98rem] text-lead text-center max-w-[70ch]">{item.caption}</p>
          )}
        </div>
      </div>,
      document.body,
    )

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {overlay}
    </Ctx.Provider>
  )
}

/** Envuelve una pieza para que se abra en el visor. Sin visor alrededor, no hace nada. */
export function LightboxTrigger({
  id,
  label,
  children,
  className,
}: {
  id: string
  label: string
  children: React.ReactNode
  className?: string
}) {
  const lb = useLightbox()
  if (!lb) return <>{children}</>
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View larger: ${label}`}
      onClick={() => lb.open(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          lb.open(id)
        }
      }}
      className={cn('cursor-zoom-in focus-visible:outline-offset-4', className)}
    >
      {children}
    </div>
  )
}
