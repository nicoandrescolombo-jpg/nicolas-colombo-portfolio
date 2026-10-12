import React from 'react'
import type { Project } from '@/types'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (!projects || projects.length === 0) {
    return (
      <section id="work" className="py-28 px-6 lg:px-16 max-w-7xl mx-auto text-center">
        <p className="font-display italic text-2xl text-text-secondary">
          Nuevas obras y secuencias en desarrollo.
        </p>
      </section>
    )
  }

  // Asymmetric grid layout spans repeating cycle:
  // 0: 2 cols, 1: 1 col, 2: 1 col, 3: 2 cols, 4: full (3 cols)
  const getColSpan = (index: number) => {
    const mod = index % 5
    if (mod === 0) return 'md:col-span-2'
    if (mod === 1) return 'md:col-span-1'
    if (mod === 2) return 'md:col-span-1'
    if (mod === 3) return 'md:col-span-2'
    if (mod === 4) return 'md:col-span-3'
    return 'md:col-span-1'
  }

  return (
    <section id="work" className="py-28 px-6 lg:px-16 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#252525]">
        <div>
          <span className="font-ui text-xs uppercase tracking-[0.25em] text-accent font-medium">
            Selección
          </span>
          <h2 className="font-display text-4xl lg:text-5xl text-text-primary mt-2">
            Trabajos & Estudios
          </h2>
        </div>
        <p className="mt-4 md:mt-0 font-ui text-xs text-text-tertiary uppercase tracking-widest">
          {projects.length} {projects.length === 1 ? 'Proyecto' : 'Proyectos'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project, index) => (
          <div key={project.id} className={getColSpan(index)}>
            <ProjectCard project={project} priority={index < 2} />
          </div>
        ))}
      </div>
    </section>
  )
}
