import type { ProjectMedia } from '@/types'
import { mediaSrc } from './portfolio'

/**
 * Arma las "hojas de personaje" de un proyecto de pixel art.
 *
 * El epígrafe de cada pieza dice a qué grupo pertenece y qué acción es:
 *   "The Brute · Idle"   → grupo "The Brute", acción "Idle"
 *   "Skull"              → grupo propio, sin acción
 * Las piezas seguidas con el mismo grupo van en la misma hoja, en el orden del admin.
 * Un boceto (pair_id → su final) no se muestra suelto: va como "rough" del final.
 * El grupo que se llama "The Eye" se muestra como el ojo interactivo.
 */

export interface PixelTile {
  final: ProjectMedia
  rough: ProjectMedia | null
  action: string | null
}

export interface PixelGroup {
  name: string
  tiles: PixelTile[]
}

export type PixelBlock =
  | { kind: 'sheet'; group: PixelGroup }
  | { kind: 'eye'; group: PixelGroup }
  /** Varios personajes de una sola acción, juntos en una misma hoja */
  | { kind: 'lineup'; groups: PixelGroup[] }

const SEP = /\s+[·|]\s+/

export function splitCaption(caption: string | null | undefined): { group: string | null; action: string | null } {
  const text = caption?.trim()
  if (!text) return { group: null, action: null }
  const parts = text.split(SEP)
  if (parts.length === 1) return { group: parts[0], action: null }
  return { group: parts[0], action: parts.slice(1).join(' · ') }
}

export const isEyeGroup = (name: string) => /^(the\s+)?eye$/i.test(name.trim())

export function buildPixelBlocks(media: ProjectMedia[]): PixelBlock[] {
  const visible = media.filter((m) => mediaSrc(m))
  const byId = new Map(visible.map((m) => [m.id, m]))
  const roughOf = new Map<string, ProjectMedia>()
  for (const m of visible) {
    if (m.pair_id && byId.has(m.pair_id) && !roughOf.has(m.pair_id)) roughOf.set(m.pair_id, m)
  }
  const isRough = new Set([...roughOf.values()].map((m) => m.id))

  const groups: PixelGroup[] = []
  for (const m of visible) {
    if (isRough.has(m.id)) continue
    const { group, action } = splitCaption(m.caption)
    const name = group || m.alt_text || ''
    const tile: PixelTile = { final: m, rough: roughOf.get(m.id) || null, action }
    const last = groups[groups.length - 1]
    if (group && last && last.name === group) last.tiles.push(tile)
    else groups.push({ name, tiles: [tile] })
  }

  const blocks: PixelBlock[] = []
  for (const g of groups) {
    if (isEyeGroup(g.name)) {
      blocks.push({ kind: 'eye', group: g })
      continue
    }
    if (g.tiles.length === 1) {
      const last = blocks[blocks.length - 1]
      if (last?.kind === 'lineup') last.groups.push(g)
      else blocks.push({ kind: 'lineup', groups: [g] })
      continue
    }
    blocks.push({ kind: 'sheet', group: g })
  }
  return blocks
}

/** Orden de las piezas en el visor: cada final seguido de su boceto */
export function pixelLightboxOrder(media: ProjectMedia[]): ProjectMedia[] {
  return buildPixelBlocks(media).flatMap((b) => {
    const groups = b.kind === 'lineup' ? b.groups : [b.group]
    return groups.flatMap((g) => g.tiles.flatMap((t) => (t.rough ? [t.final, t.rough] : [t.final])))
  })
}
