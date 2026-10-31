import React from 'react'
import type { Project } from '@/types'
import ProjectCard, { type CardSize } from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
}

/**
 * Arma las filas de la grilla con un patrón que se repite:
 *   [ancho + angosto] → [angosto + ancho] → [completo]
 * Cada fila tiene siempre una pieza ancha o completa que define la altura,
 * así las piezas angostas se estiran a la misma altura sin huecos.
 * Si la última fila queda incompleta, esa pieza pasa a ocupar todo el ancho.
 */
const ROW_PATTERNS: CardSize[][] = [
  ['wide', 'narrow'],
  ['narrow', 'wide'],
  ['full'],
]

function buildRows(projects: Project[]) {
  const rows: { project: Project; size: CardSize }[][] = []
  let i = 0
  let p = 0
  while (i < projects.length) {
    const pattern = ROW_PATTERNS[p % ROW_PATTERNS.length]
    const remaining = projects.length - i
    if (remaining < pattern.length) {
      projects.slice(i).forEach((project) => rows.push([{ project, size: 'full' }]))
      break
    }
    rows.push(pattern.map((size, k) => ({ project: projects[i + k], size })))
    i += pattern.length
    p++
  }
  return rows
}

const SPAN: Record<CardSize, string> = {
  wide: 'md:col-span-2',
  narrow: 'md:col-span-1',
  full: 'md:col-span-3',
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <section id="work" className="scroll-mt-16 py-24 sm:py-32">
      <div className="site-container">
        <h2 className="type-display text-display-lg text-paper mb-10 sm:mb-14">Selected work</h2>

        {!projects || projects.length === 0 ? (
          <p className="type-body text-lead max-w-[56ch]">
            New work is being added. Get in touch if you&apos;d like to see more.
          </p>
        ) : (
          <div className="flex flex-col gap-14 sm:gap-20">
            {buildRows(projects).map((row, r) => (
              <div key={r} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-14">
                {row.map(({ project, size }, k) => (
                  <div key={project.id} className={SPAN[size]}>
                    <ProjectCard project={project} size={size} priority={r === 0 && k < 2} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
