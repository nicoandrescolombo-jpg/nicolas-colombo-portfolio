import React from 'react'
import type { ProjectMedia } from '@/types'
import { cn } from '@/lib/utils/helpers'
import { buildTracks, type Track, type TrackShot } from '@/lib/utils/songTracks'
import MediaItem from './MediaItem'
import SketchPair from './SketchPair'

/**
 * Varias canciones en un proyecto, armado como la contratapa de un disco:
 * arriba la lista de temas (cada uno lleva a su canción) y después cada
 * canción como un track: su plano más fuerte a todo el ancho, el resto en
 * dos columnas (con Sketch / Final donde hay boceto) y el animatic al pie.
 * Los clips con audio tienen su botón de sonido (es música: vale la pena).
 */

const two = (n: number) => String(n).padStart(2, '0')

function countLabel(t: Track) {
  const shots = t.shots.length
  const roughs = t.shots.filter((s) => s.kind === 'pair').length
  return [
    `${shots} ${shots === 1 ? 'shot' : 'shots'}`,
    roughs ? `${roughs} ${roughs === 1 ? 'rough' : 'roughs'}` : null,
    t.animatic ? 'animatic' : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

// El plano principal ocupa todo el ancho, pero nunca más alto que la pantalla
const LEAD_STYLE: React.CSSProperties = { maxWidth: 'calc(78vh * 16 / 9)' }

function Shot({ shot, title, lead, className }: { shot: TrackShot; title: string; lead?: boolean; className?: string }) {
  if (shot.kind === 'pair') {
    return (
      <div className={cn(lead && 'mx-auto', className)} style={lead ? LEAD_STYLE : undefined}>
        <SketchPair sketch={{ ...shot.sketch, caption: shot.label }} final={shot.final} title={title} startOnFinal />
      </div>
    )
  }
  return (
    <div className={cn(lead && 'mx-auto w-full', className)} style={lead ? LEAD_STYLE : undefined}>
      <MediaItem
        item={{ ...shot.item, caption: shot.label }}
        title={title}
        sizes={lead ? '(max-width: 1440px) 100vw, 1344px' : '(max-width: 768px) 100vw, 672px'}
      />
    </div>
  )
}

function TrackSection({ track, n, title }: { track: Track; n: number; title: string }) {
  const [lead, ...rest] = track.shots
  const name = `${title}, ${track.title}`
  return (
    <section id={`track-${track.slug}`} aria-label={track.title} className="scroll-mt-24">
      <header className="mb-6 sm:mb-8 pt-5 border-t border-rule flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
        <div className="flex items-baseline gap-4 sm:gap-6">
          <span className="figures type-body text-[1.05rem] text-lead">{two(n)}</span>
          <h3 className="type-display text-display-md text-paper">{track.title}</h3>
        </div>
        <span className="type-sc text-[1rem] text-lead">{countLabel(track)}</span>
      </header>

      {lead && <Shot shot={lead} title={name} lead />}

      {rest.length > 0 && (
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-10">
          {rest.map((s, i) => {
            const alone = rest.length % 2 === 1 && i === rest.length - 1
            return (
              <Shot
                key={s.kind === 'pair' ? s.final.id : s.item.id}
                shot={s}
                title={name}
                className={cn(alone && 'md:col-span-2 md:w-[calc(50%-1rem)] md:mx-auto')}
              />
            )
          })}
        </div>
      )}

      {track.animatic && (
        <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-4">
            <p className="type-sc text-[1.05rem] text-paper">Animatic</p>
            <p className="mt-2 type-body text-[1.05rem] leading-relaxed text-lead max-w-[36ch]">
              The whole song boarded and timed to the music before any animation.
            </p>
          </div>
          <MediaItem
            item={{ ...track.animatic, caption: null }}
            title={`${name}, animatic`}
            sizes="(max-width: 1024px) 100vw, 900px"
            className="lg:col-span-8"
          />
        </div>
      )}
    </section>
  )
}

export default function SongTracks({ media, title }: { media: ProjectMedia[]; title: string }) {
  const tracks = buildTracks(media)
  return (
    <div>
      <nav aria-label="Songs" className="mb-20 sm:mb-28">
        <p className="mb-4 type-sc text-[1.05rem] text-lead">
          {tracks.length} songs
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-rule">
          {tracks.map((t, i) => (
            <li key={t.slug} className="border-b border-rule">
              <a
                href={`#track-${t.slug}`}
                className="group flex items-baseline gap-4 py-3 text-paper/90 hover:text-paper transition-colors"
              >
                <span className="figures type-body text-[0.98rem] text-lead w-6 shrink-0">{two(i + 1)}</span>
                <span className="type-body text-[1.15rem] decoration-paper/60 decoration-1 underline-offset-[5px] group-hover:underline">
                  {t.title}
                </span>
                <span className="ml-auto type-sc text-[0.95rem] text-lead whitespace-nowrap">
                  {t.shots.length + (t.animatic ? 1 : 0)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-24 sm:gap-32">
        {tracks.map((t, i) => (
          <TrackSection key={t.slug} track={t} n={i + 1} title={title} />
        ))}
      </div>
    </div>
  )
}
