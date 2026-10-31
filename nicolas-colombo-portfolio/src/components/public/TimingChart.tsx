'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/helpers'

/**
 * Carta de timing (timing chart) como indicador de scroll.
 * Las secciones son las "keys" (marca larga) y entre key y key se dibujan
 * los intermedios con espaciado de slow in / slow out, como en la hoja de un animador.
 * El cabezal marca dónde está el lector. Todo en el mismo tono hueso, muy tenue.
 */

const KEYS: { id: string; label: string }[] = [
  { id: 'home', label: 'Top' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

const INBETWEENS = 7

type Key = { id: string; label: string; x: number }

function easeInOut(t: number) {
  return (1 - Math.cos(Math.PI * t)) / 2
}

export default function TimingChart({
  visible,
  onNavigate,
}: {
  visible: boolean
  onNavigate: (id: string) => void
}) {
  const [keys, setKeys] = useState<Key[]>([])
  const headRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    const measure = () => {
      const max = maxScroll()
      const found: Key[] = []
      KEYS.forEach(({ id, label }) => {
        const el = document.getElementById(id)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY
          found.push({ id, label, x: Math.min(1, Math.max(0, top / max)) })
        }
      })
      setKeys(found)
    }

    let raf = 0
    const update = () => {
      raf = 0
      if (headRef.current) {
        const p = Math.min(1, Math.max(0, window.scrollY / maxScroll()))
        headRef.current.style.left = `${p * 100}%`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    update()
    const ro = new ResizeObserver(() => {
      measure()
      update()
    })
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Intermedios entre cada par de keys
  const ticks: number[] = []
  for (let k = 0; k < keys.length - 1; k++) {
    const a = keys[k].x
    const b = keys[k + 1].x
    for (let j = 1; j <= INBETWEENS; j++) {
      ticks.push(a + (b - a) * easeInOut(j / (INBETWEENS + 1)))
    }
  }

  return (
    <div
      className={cn(
        'absolute inset-x-5 sm:inset-x-8 lg:inset-x-12 bottom-0 h-3 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <div className="relative h-full">
        {ticks.map((x, i) => (
          <span
            key={i}
            className="absolute bottom-0 w-px h-[4px] bg-paper/25"
            style={{ left: `${x * 100}%` }}
            aria-hidden="true"
          />
        ))}

        {keys.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => onNavigate(k.id)}
            tabIndex={visible ? 0 : -1}
            aria-label={`Go to ${k.label}`}
            className="group absolute bottom-0 -translate-x-1/2 h-6 w-6 flex items-end justify-center"
            style={{ left: `${k.x * 100}%` }}
          >
            <span className="absolute bottom-0 w-px h-[9px] bg-paper/60 group-hover:bg-paper transition-colors" aria-hidden="true" />
            <span className="absolute top-full mt-2 px-2 py-0.5 rounded-[2px] bg-graphite type-sc text-[0.85rem] text-paper whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              {k.label}
            </span>
          </button>
        ))}

        {/* Cabezal */}
        <span
          ref={headRef}
          className="absolute bottom-0 -translate-x-1/2 w-px h-3 bg-paper"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
