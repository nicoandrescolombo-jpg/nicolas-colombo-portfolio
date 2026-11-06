'use client'

import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { LightboxTrigger, useLightbox } from './Lightbox'

/**
 * Pasaje del resultado final al proceso: un fundido encadenado, como en una
 * moviola, que lleva el cuadro terminado de vuelta a su primer boceto.
 *
 * Lo maneja el scroll (no corre solo) y avanza "en dos": 12 pasos, igual que
 * la entrada del logo. Con "reducir movimiento" se muestran los dos cuadros
 * uno al lado del otro.
 */

const STEPS = 12

interface Frame {
  src: string
  width?: number | null
  height?: number | null
  /** id de la pieza, para abrirla en el visor */
  id?: string
}

export default function ProcessDissolve({
  final,
  sketch,
  title,
}: {
  final: Frame
  sketch: Frame
  title: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const lightbox = useLightbox()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Quieto al entrar, funde en el tramo del medio, quieto al salir
  const raw = useTransform(scrollYProgress, [0.2, 0.75], [0, 1], { clamp: true })
  const stepped = useTransform(raw, (v) => Math.round(v * STEPS) / STEPS)
  const finalLabel = useTransform(stepped, (v) => 1 - v)
  // Contador de cuadros, como en la ventanita de la moviola
  const frame = useTransform(stepped, (v) => String(Math.round(v * STEPS) * 2 + 1).padStart(2, '0'))

  const ratio = final.width && final.height ? `${final.width} / ${final.height}` : '16 / 9'

  if (reduce) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { f: final, label: 'Final frame' },
          { f: sketch, label: 'First sketch' },
        ].map(({ f, label }) => (
          <figure key={label}>
            <LightboxTrigger id={f.id || ''} label={`${title}, ${label.toLowerCase()}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={`${title}, ${label.toLowerCase()}`} className="w-full h-auto bg-graphite" />
            </LightboxTrigger>
            <figcaption className="mt-2 type-sc text-[1rem] text-lead">{label}</figcaption>
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative h-[230vh]">
      <div className="sticky top-0 h-screen flex flex-col justify-center py-[10vh]">
        <div
          className={`relative mx-auto w-full max-h-full ${lightbox ? 'cursor-zoom-in' : ''}`}
          style={{ aspectRatio: ratio, maxWidth: `calc(76vh * ${ratio})` }}
          onClick={() => {
            // Abre el cuadro que más se ve en ese momento del fundido
            const id = stepped.get() >= 0.5 ? sketch.id : final.id
            if (lightbox && id) lightbox.open(id)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={final.src}
            alt={`${title}, final frame`}
            className="absolute inset-0 w-full h-full object-contain bg-graphite"
            loading="lazy"
          />
          <motion.img
            src={sketch.src}
            alt={`${title}, first sketch`}
            style={{ opacity: stepped }}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-6 type-sc text-[1rem] text-lead">
          <span className="relative">
            <motion.span style={{ opacity: finalLabel }} className="text-paper">
              Final frame
            </motion.span>
            <motion.span style={{ opacity: stepped }} className="absolute left-0 top-0 whitespace-nowrap text-paper">
              First sketch
            </motion.span>
          </span>
          <span className="figures" aria-hidden="true">
            dissolve · frame <motion.span>{frame}</motion.span> / {STEPS * 2 + 1}
          </span>
        </div>
      </div>
    </div>
  )
}
