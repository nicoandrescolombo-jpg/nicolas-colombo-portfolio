'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/helpers'
import type { PixelGroup } from '@/lib/utils/pixelSheets'
import FieldGuide from './FieldGuide'
import { useLightbox } from './Lightbox'

/**
 * El ojo: sus cinco animaciones (idle, parpadeo, mirar arriba, abajo y al
 * costado) armadas como en un juego. Mira hacia donde está el cursor, vuelve
 * al centro cuando el cursor se acerca o se va, y parpadea con un click.
 * La izquierda es la derecha espejada. No se mueve solo: solo el idle, que es
 * un loop como cualquier GIF de la página.
 *
 * Los cuadros salen de tiras PNG en /public/pixel/eye (una por animación),
 * hechas con ffmpeg a partir de los GIF originales (98 × 100 px, 80 ms por cuadro).
 */

const FW = 98
const FH = 100
const FRAME_MS = 80
const SPRITES = '/pixel/eye'

type Look = 'up' | 'down' | 'right'
type Dir = 'center' | 'up' | 'down' | 'left' | 'right'
type Anim = 'idle' | 'blink' | Look

const FRAMES: Record<Anim, number> = { idle: 8, blink: 9, up: 18, down: 17, right: 20 }
// Cuadros de cada mirada: ida, pausa (en loop) y vuelta al centro
const LOOK: Record<Look, { out: number[]; hold: number[]; back: number[] }> = {
  up: { out: [5, 6, 7], hold: [8, 9, 10, 11, 12, 13, 14, 15], back: [16, 17] },
  down: { out: [5, 6], hold: [7, 8, 9, 10, 11, 12, 13, 14, 15], back: [16] },
  right: { out: [5, 6, 7], hold: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17], back: [18, 19] },
}

const STATES: { key: Anim | 'left'; label: string; anim: Anim; frame: number; mirror?: boolean; match: RegExp }[] = [
  { key: 'idle', label: 'Idle', anim: 'idle', frame: 0, match: /idle/i },
  { key: 'blink', label: 'Blink', anim: 'blink', frame: 4, match: /blink/i },
  { key: 'up', label: 'Look up', anim: 'up', frame: 10, match: /up/i },
  { key: 'down', label: 'Look down', anim: 'down', frame: 10, match: /down/i },
  { key: 'right', label: 'Look aside', anim: 'right', frame: 12, match: /aside|side|right/i },
]

interface Pose {
  anim: Anim
  frame: number
  mirror: boolean
}

const lookOf = (d: Dir): Look | null => (d === 'center' ? null : d === 'left' ? 'right' : d)

export default function EyeRig({ group }: { group: PixelGroup }) {
  const reduce = useReducedMotion()
  const lb = useLightbox()
  const boxRef = useRef<HTMLDivElement>(null)
  const eyeRef = useRef<HTMLButtonElement>(null)
  const [scale, setScale] = useState(4)
  const [pose, setPose] = useState<Pose>({ anim: 'idle', frame: 0, mirror: false })
  const [active, setActive] = useState<Anim | 'left'>('idle')
  const [visible, setVisible] = useState(false)
  const [touch, setTouch] = useState(false)

  // Estado de la máquina (en refs: lo lee el reloj de cuadros)
  const target = useRef<Dir>('center')
  const blinkReq = useRef(false)
  const st = useRef<{ mode: 'idle' | 'out' | 'hold' | 'back' | 'blink'; dir: Dir; i: number; queue: number[] }>({
    mode: 'idle',
    dir: 'center',
    i: 0,
    queue: [],
  })

  // Escala entera según el ancho disponible
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setScale(Math.max(2, Math.min(5, Math.floor(Math.min(w * 0.55, 500) / FW))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    // Precarga de las cinco tiras
    for (const a of Object.keys(FRAMES)) new Image().src = `${SPRITES}/${a}.png`
  }, [])

  // Solo corre el reloj mientras el ojo está en pantalla
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Hacia dónde mirar: dirección del puntero respecto del centro del ojo
  const aimAt = useCallback((x: number, y: number) => {
    const el = eyeRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = x - (r.left + r.width / 2)
    const dy = y - (r.top + r.height / 2)
    if (Math.hypot(dx, dy) < r.width * 0.42) target.current = 'center'
    else if (Math.abs(dx) > Math.abs(dy)) target.current = dx > 0 ? 'right' : 'left'
    else target.current = dy > 0 ? 'down' : 'up'
  }, [])

  useEffect(() => {
    if (!visible) return
    let release: number | undefined
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      aimAt(e.clientX, e.clientY)
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      aimAt(e.clientX, e.clientY)
      window.clearTimeout(release)
      release = window.setTimeout(() => (target.current = 'center'), 1600)
    }
    const onLeave = () => (target.current = 'center')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.clearTimeout(release)
    }
  }, [visible, aimAt])

  // Reloj de cuadros (80 ms, como los GIF)
  useEffect(() => {
    if (!visible) return
    if (reduce) {
      // Sin animación: salta directo a la pose final de cada estado
      const id = window.setInterval(() => {
        const look = lookOf(target.current)
        setPose(look ? { anim: look, frame: LOOK[look].hold[0], mirror: target.current === 'left' } : { anim: 'idle', frame: 0, mirror: false })
        setActive(look ? (target.current === 'left' ? 'left' : look) : 'idle')
      }, 120)
      return () => window.clearInterval(id)
    }

    const id = window.setInterval(() => {
      const s = st.current
      const want = target.current
      const look = lookOf(s.dir)

      const startBack = (frames: number[]) => {
        s.mode = 'back'
        s.queue = frames
      }

      switch (s.mode) {
        case 'idle': {
          if (blinkReq.current) {
            blinkReq.current = false
            s.mode = 'blink'
            s.i = 0
          } else if (want !== 'center') {
            s.mode = 'out'
            s.dir = want
            s.i = 0
          } else {
            s.i = (s.i + 1) % FRAMES.idle
          }
          break
        }
        case 'blink': {
          s.i++
          if (s.i >= FRAMES.blink) {
            s.mode = 'idle'
            s.i = 0
          }
          break
        }
        case 'out': {
          const L = LOOK[look!]
          if (want !== s.dir || blinkReq.current) {
            // Se arrepiente a mitad de camino: deshace lo que hizo
            startBack(L.out.slice(0, s.i).reverse())
            break
          }
          s.i++
          if (s.i >= L.out.length) {
            s.mode = 'hold'
            s.i = 0
          }
          break
        }
        case 'hold': {
          const L = LOOK[look!]
          if (want !== s.dir || blinkReq.current) {
            startBack(L.back)
            break
          }
          s.i = (s.i + 1) % L.hold.length
          break
        }
        case 'back': {
          s.queue = s.queue.slice(1)
          if (s.queue.length === 0) {
            s.mode = 'idle'
            s.dir = 'center'
            s.i = 0
          }
          break
        }
      }

      // Qué cuadro se ve
      const l = lookOf(s.dir)
      let p: Pose
      if (s.mode === 'blink') p = { anim: 'blink', frame: s.i, mirror: false }
      else if (s.mode === 'idle' || !l) p = { anim: 'idle', frame: s.i % FRAMES.idle, mirror: false }
      else if (s.mode === 'out') p = { anim: l, frame: LOOK[l].out[Math.min(s.i, LOOK[l].out.length - 1)], mirror: s.dir === 'left' }
      else if (s.mode === 'hold') p = { anim: l, frame: LOOK[l].hold[s.i], mirror: s.dir === 'left' }
      else p = { anim: l, frame: s.queue[0] ?? LOOK[l].back[LOOK[l].back.length - 1], mirror: s.dir === 'left' }
      setPose(p)
      setActive(p.anim === 'right' && p.mirror ? 'left' : p.anim)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [visible, reduce])

  // Teclado: con el ojo enfocado, las flechas lo hacen mirar; Enter o espacio, parpadear
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
    if (map[e.key]) {
      e.preventDefault()
      target.current = target.current === map[e.key] ? 'center' : map[e.key]
    }
  }

  const sprite = (anim: Anim, frame: number, s: number, mirror = false): React.CSSProperties => ({
    width: FW * s,
    height: FH * s,
    backgroundImage: `url(${SPRITES}/${anim}.png)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${FRAMES[anim] * FW * s}px ${FH * s}px`,
    backgroundPosition: `${-frame * FW * s}px 0`,
    imageRendering: 'pixelated',
    transform: mirror ? 'scaleX(-1)' : undefined,
  })

  const idFor = (re: RegExp) => group.tiles.find((t) => re.test(t.action || ''))?.final.id

  return (
    <section aria-label={group.name}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <div className="flex items-baseline gap-4">
          <h3 className="type-display text-display-md text-paper">{group.name}</h3>
          <span className="type-sc text-[1rem] text-lead">5 loops, wired up</span>
        </div>
        <span className="type-body italic text-[0.98rem] text-lead">
          {touch ? 'Tap around it. Tap the eye to blink.' : 'It follows your cursor. Click it to blink.'}
        </span>
      </div>

      <div ref={boxRef} className="relative bg-graphite px-5 sm:px-10 pt-14 pb-8 sm:pt-20 sm:pb-10">
        <FieldGuide className="inset-3 sm:inset-5" />
        <div className="flex justify-center">
          <button
            ref={eyeRef}
            type="button"
            onClick={() => (blinkReq.current = true)}
            onKeyDown={onKey}
            aria-label="The eye. Click to blink; arrow keys make it look around."
            className="block cursor-pointer focus-visible:outline-offset-8"
            style={sprite(pose.anim, pose.frame, scale, pose.mirror)}
          />
        </div>

        {/* Los cinco estados, como en el animador de un motor de juego */}
        <ol className="mt-12 sm:mt-16 grid grid-cols-5 gap-2 sm:gap-6 max-w-3xl mx-auto">
          {STATES.map((s) => {
            const on = active === s.key || (s.key === 'right' && active === 'left')
            const id = idFor(s.match)
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => id && lb?.open(id)}
                  aria-label={`View the ${s.label.toLowerCase()} loop larger`}
                  className={cn('group w-full flex flex-col items-center', id && lb ? 'cursor-zoom-in' : 'cursor-default')}
                >
                  <span
                    aria-hidden="true"
                    className={cn('hidden sm:block transition-opacity duration-150', on ? 'opacity-100' : 'opacity-35 group-hover:opacity-70')}
                    style={sprite(s.anim, s.frame, 1)}
                  />
                  <span
                    className={cn(
                      'mt-2 w-full border-t pt-2 text-center type-sc text-[0.95rem] transition-colors',
                      on ? 'border-paper text-paper' : 'border-paper/15 text-lead',
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
