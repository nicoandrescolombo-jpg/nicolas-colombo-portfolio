'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReelInfo } from '@/types'

interface ReelContextValue {
  reel: ReelInfo
  open: () => void
}

const ReelContext = createContext<ReelContextValue | null>(null)

/** Devuelve null si la página no tiene reel: los botones se ocultan solos. */
export function useReel() {
  return useContext(ReelContext)
}

export function ReelProvider({
  reel,
  children,
}: {
  reel: ReelInfo | null
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  if (!reel) return <>{children}</>

  return (
    <ReelContext.Provider value={{ reel, open }}>
      {children}
      <ReelLightbox reel={reel} isOpen={isOpen} onClose={close} />
    </ReelContext.Provider>
  )
}

function ReelLightbox({
  reel,
  isOpen,
  onClose,
}: {
  reel: ReelInfo
  isOpen: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => closeRef.current?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnFocusRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reel"
          role="dialog"
          aria-modal="true"
          aria-label={reel.title}
          className="fixed inset-0 z-[70] bg-black flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="site-container flex items-center justify-between h-16 sm:h-20 shrink-0">
            <p className="type-sc text-[1.02rem] text-lead">{reel.title}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 h-10 pl-3 pr-2 -mr-2 type-sc text-[1.02rem] text-paper hover:text-white rounded-[2px]"
            >
              Close
              <X size={18} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>

          {/* Clic en el fondo cierra; clic en el video no */}
          <div
            className="flex-1 min-h-0 flex items-center justify-center px-4 pb-6 sm:px-8 sm:pb-10"
            onClick={onClose}
          >
            <div
              className="relative w-full bg-graphite"
              style={{
                aspectRatio: '16 / 9',
                maxWidth: 'min(100%, calc((100svh - 9rem) * 16 / 9))',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={reel.embedUrl}
                title={reel.title}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
