import type { ProjectMedia } from '@/types'
import { mediaSrc } from './portfolio'
import { splitCaption } from './pixelSheets'

/**
 * Proyectos de varias canciones (videoclips infantiles): cada canción es un
 * "track", como en la contratapa de un disco.
 *
 * El epígrafe dice canción y plano: "Los Pollitos · Dance". Las piezas seguidas
 * con la misma canción forman un track, en el orden del admin.
 * - Un boceto con pair_id va junto a su final (botón Sketch / Final).
 * - Una pieza de proceso sin pareja (el animatic) va al pie del track.
 */

export type TrackShot =
  | { kind: 'shot'; item: ProjectMedia; label: string | null }
  | { kind: 'pair'; sketch: ProjectMedia; final: ProjectMedia; label: string | null }

export interface Track {
  title: string
  slug: string
  shots: TrackShot[]
  animatic: ProjectMedia | null
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** ¿Los epígrafes de este proyecto están escritos como "Canción · Plano"? */
export function isTrackProject(media: ProjectMedia[]): boolean {
  const finals = media.filter((m) => m.section !== 'process')
  if (finals.length < 4) return false
  const grouped = finals.filter((m) => splitCaption(m.caption).action)
  const groups = new Set(grouped.map((m) => splitCaption(m.caption).group))
  return grouped.length >= finals.length * 0.6 && groups.size >= 2
}

export function buildTracks(media: ProjectMedia[]): Track[] {
  const visible = media.filter((m) => mediaSrc(m))
  const byId = new Map(visible.map((m) => [m.id, m]))
  const sketchOf = new Map<string, ProjectMedia>()
  for (const m of visible) {
    if (m.pair_id && byId.has(m.pair_id) && !sketchOf.has(m.pair_id)) sketchOf.set(m.pair_id, m)
  }
  const isSketch = new Set([...sketchOf.values()].map((m) => m.id))

  const tracks: Track[] = []
  for (const m of visible) {
    if (isSketch.has(m.id)) continue
    const { group, action } = splitCaption(m.caption)
    const title = group || 'More'
    let track = tracks[tracks.length - 1]
    if (!track || track.title !== title) {
      track = { title, slug: slugify(title), shots: [], animatic: null }
      tracks.push(track)
    }
    if (m.section === 'process') {
      if (!track.animatic) track.animatic = m
      else track.shots.push({ kind: 'shot', item: m, label: action })
      continue
    }
    const sketch = sketchOf.get(m.id)
    track.shots.push(sketch ? { kind: 'pair', sketch, final: m, label: action } : { kind: 'shot', item: m, label: action })
  }
  return tracks
}

/** Orden del visor: final, su boceto, …, y el animatic al final de cada track */
export function trackLightboxOrder(media: ProjectMedia[]): ProjectMedia[] {
  return buildTracks(media).flatMap((t) => [
    ...t.shots.flatMap((s) => (s.kind === 'pair' ? [s.final, s.sketch] : [s.item])),
    ...(t.animatic ? [t.animatic] : []),
  ])
}
