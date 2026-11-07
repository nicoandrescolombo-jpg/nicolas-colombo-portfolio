'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { ProjectMedia } from '@/types'
import { cn } from '@/lib/utils/helpers'
import { mediaSrc } from '@/lib/utils/portfolio'
import { buildPixelBlocks, type PixelGroup, type PixelTile } from '@/lib/utils/pixelSheets'
import FieldGuide from './FieldGuide'
import EyeRig from './EyeRig'
import { useLightbox } from './Lightbox'

/**
 * Pixel art como hojas de personaje: cada criatura en su panel, con todas sus
 * acciones paradas sobre la misma línea de suelo y a la MISMA escala entera
 * (así se lee el tamaño real del personaje entre una acción y otra).
 * Si hay bocetos, el botón Clean / Rough cambia toda la hoja a la vez.
 */

const MAX_SCALE = 5

/** Ancho del contenedor y alto de la ventana, para elegir la escala */
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<{ w: number; vh: number } | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, vh: window.innerHeight })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

const dims = (m: ProjectMedia | null) => ({ w: m?.width || 64, h: m?.height || 64 })

/** Tamaño de la "celda" de una acción: lo que ocupe más entre el final y su boceto */
function tileBox(t: PixelTile) {
  const a = dims(t.final)
  const b = t.rough ? dims(t.rough) : a
  return { w: Math.max(a.w, b.w), h: Math.max(a.h, b.h) }
}

/** Una sola escala entera para todas las acciones de un personaje */
function groupScale(tiles: PixelTile[], size: { w: number; vh: number }) {
  const boxes = tiles.map(tileBox)
  const heights = boxes.map((b) => b.h).sort((x, y) => x - y)
  const median = heights[Math.floor(heights.length / 2)]
  const target = Math.min(size.vh * 0.6, size.w >= 1024 ? 520 : size.w >= 640 ? 380 : 260)
  const maxH = Math.max(size.vh * 0.85, 420)
  const avail = size.w
  let s = Math.floor(target / median)
  for (const b of boxes) s = Math.min(s, Math.floor(maxH / b.h))
  if (size.w >= 640) {
    for (const b of boxes) s = Math.min(s, Math.floor(avail / b.w))
    // Que la hoja entre en una fila (dos acciones) o en dos filas (tres o más),
    // para que el personaje se vea junto y no una acción por pantalla
    const gaps = (boxes.length - 1) * 56
    const rows = boxes.length <= 2 ? 1 : 2
    const totalW = boxes.reduce((sum, b) => sum + b.w, 0)
    s = Math.min(s, Math.floor((avail * rows - gaps) / totalW))
  }
  // En celular cada acción va en su fila: la que no entra baja de escala sola (ver Tile)
  return Math.max(1, Math.min(MAX_SCALE, s))
}

function RoughToggle({ rough, onChange }: { rough: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!rough)}
      aria-pressed={rough}
      className="type-sc text-[1rem] text-lead hover:text-paper transition-colors whitespace-nowrap"
    >
      <span className={rough ? 'text-lead' : 'text-paper'}>Clean</span>
      <span className="mx-2" aria-hidden="true">/</span>
      <span className={rough ? 'text-paper' : 'text-lead'}>Rough</span>
    </button>
  )
}

function Tile({
  tile,
  scale: groupScaleValue,
  maxWidth,
  showRough,
  title,
  label,
  sublabel,
}: {
  tile: PixelTile
  scale: number
  /** Ancho disponible: si la acción no entra a la escala del grupo, baja sola */
  maxWidth: number
  showRough: boolean
  title: string
  label: string | null
  sublabel?: string | null
}) {
  const lb = useLightbox()
  const box = tileBox(tile)
  const scale = Math.max(1, Math.min(groupScaleValue, Math.floor(maxWidth / box.w)))
  const hasRough = !!tile.rough
  const roughOn = showRough && hasRough
  const current = roughOn ? tile.rough! : tile.final
  const name = [title, label, roughOn ? 'rough' : null].filter(Boolean).join(', ')
  const d = dims(current)

  const layer = (m: ProjectMedia, visible: boolean, what: string) => {
    const { w, h } = dims(m)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaSrc(m)!}
        alt={visible ? [title, label, what].filter(Boolean).join(', ') : ''}
        aria-hidden={!visible}
        loading="lazy"
        decoding="async"
        draggable={false}
        width={w * scale}
        height={h * scale}
        style={{ width: w * scale, height: h * scale, opacity: visible ? 1 : 0 }}
        className="pixelated max-w-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none transition-opacity duration-300 [transition-timing-function:steps(4,end)] motion-reduce:transition-none"
      />
    )
  }

  return (
    <figure className={cn('flex flex-col items-center transition-opacity duration-300', showRough && !hasRough && 'opacity-30')}>
      <button
        type="button"
        onClick={() => lb?.open(current.id)}
        aria-label={`View larger: ${name}`}
        className={cn('relative block', lb ? 'cursor-zoom-in' : 'cursor-default')}
        style={{ width: box.w * scale, height: box.h * scale }}
      >
        {layer(tile.final, !roughOn, 'clean')}
        {tile.rough && layer(tile.rough, roughOn, 'rough')}
      </button>
      <figcaption className="mt-4 w-full border-t border-paper/15 pt-2 flex items-baseline justify-between gap-4" style={{ minWidth: 120 }}>
        <span className="type-sc text-[1.02rem] text-paper">
          {label}
          {sublabel && <span className="text-lead"> · {sublabel}</span>}
        </span>
        <span className="figures type-body text-[0.85rem] text-lead whitespace-nowrap">
          {d.w}×{d.h} · {scale}×
        </span>
      </figcaption>
    </figure>
  )
}

function SheetHeader({
  name,
  count,
  roughs,
  showRough,
  setShowRough,
}: {
  name: string | null
  count: string
  roughs: number
  showRough: boolean
  setShowRough: (v: boolean) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
      <div className="flex items-baseline gap-4">
        {name && <h3 className="type-display text-display-md text-paper">{name}</h3>}
        <span className="type-sc text-[1rem] text-lead">{count}</span>
      </div>
      {roughs > 0 && <RoughToggle rough={showRough} onChange={setShowRough} />}
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-graphite px-5 sm:px-10 pt-12 pb-8 sm:pt-16 sm:pb-10">
      <FieldGuide className="inset-3 sm:inset-5" />
      {children}
    </div>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function Sheet({ group, title }: { group: PixelGroup; title: string }) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const [showRough, setShowRough] = useState(false)
  const roughs = group.tiles.filter((t) => t.rough).length
  const scale = size ? groupScale(group.tiles, size) : 1

  return (
    <section aria-label={group.name}>
      <SheetHeader
        name={group.name}
        count={[plural(group.tiles.length, 'action', 'actions'), roughs ? plural(roughs, 'rough', 'roughs') : null].filter(Boolean).join(' · ')}
        roughs={roughs}
        showRough={showRough}
        setShowRough={setShowRough}
      />
      <Panel>
        <div ref={ref} className={cn('flex flex-wrap items-end justify-center gap-x-10 sm:gap-x-14 gap-y-12', !size && 'invisible')}>
          {group.tiles.map((t) => (
            <Tile key={t.final.id} tile={t} scale={scale} maxWidth={size?.w || 9999} showRough={showRough} title={`${title}, ${group.name}`} label={t.action || group.name} />
          ))}
        </div>
      </Panel>
    </section>
  )
}

/** Criaturas de una sola acción, juntas: cada una con su propia escala */
function Lineup({ groups, title }: { groups: PixelGroup[]; title: string }) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const [showRough, setShowRough] = useState(false)
  const roughs = groups.filter((g) => g.tiles[0].rough).length

  return (
    <section aria-label={groups.map((g) => g.name).join(', ')}>
      <SheetHeader
        name={groups.length > 1 ? 'More creatures' : groups[0].name}
        count={groups.length > 1 ? groups.map((g) => g.name).join(' · ') : groups[0].tiles[0].action || ''}
        roughs={roughs}
        showRough={showRough}
        setShowRough={setShowRough}
      />
      <Panel>
        <div ref={ref} className={cn('flex flex-wrap items-end justify-center gap-x-10 sm:gap-x-14 gap-y-12', !size && 'invisible')}>
          {groups.map((g) => (
            <Tile
              key={g.tiles[0].final.id}
              tile={g.tiles[0]}
              scale={size ? groupScale(g.tiles, size) : 1}
              maxWidth={size?.w || 9999}
              showRough={showRough}
              title={title}
              label={g.name}
              sublabel={g.tiles[0].action}
            />
          ))}
        </div>
      </Panel>
    </section>
  )
}

export default function PixelSheets({ media, title }: { media: ProjectMedia[]; title: string }) {
  const blocks = buildPixelBlocks(media)
  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {blocks.map((b, i) => {
        if (b.kind === 'eye') return <EyeRig key={`eye-${i}`} group={b.group} />
        if (b.kind === 'lineup') return <Lineup key={b.groups[0].tiles[0].final.id} groups={b.groups} title={title} />
        return <Sheet key={b.group.tiles[0].final.id} group={b.group} title={title} />
      })}
    </div>
  )
}
