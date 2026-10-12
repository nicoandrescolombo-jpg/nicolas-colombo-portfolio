import React from 'react'
import Link from 'next/link'
import { Plus, Edit, Eye, Film, Sparkles, MoveVertical } from 'lucide-react'
import { getAllProjectsForAdmin } from '@/lib/queries/projects'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const projects = await getAllProjectsForAdmin()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <h1 className="font-display italic text-3xl text-text-primary">
            Gestión de Obras & Proyectos
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            Administra tus animaciones, secuencias de GIFs, enlaces de video y estados de publicación.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button variant="primary" size="sm" className="gap-2">
            <Plus size={16} />
            <span>Nuevo Proyecto</span>
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      <div className="bg-[#141414] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-4 bg-[#181818] border-b border-[#222222] flex items-center justify-between text-xs font-ui tracking-wider text-text-secondary uppercase">
          <span>Proyecto ({projects.length})</span>
          <div className="flex items-center gap-12">
            <span>Tipo</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
        </div>

        <div className="divide-y divide-[#222222]">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="p-4 flex items-center justify-between hover:bg-[#181818]/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-text-tertiary w-5">
                  #{idx + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg text-text-primary">
                    {project.title}
                  </h3>
                  <span className="font-ui text-xs text-text-tertiary">
                    /{project.slug}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <span className="font-ui text-xs text-text-secondary">
                  {project.project_type === 'gif_sequence' ? 'Secuencia GIFs' : 'Individual'}
                </span>

                <StatusBadge status={project.status} />

                <div className="flex items-center gap-2">
                  <Link
                    href={`/project/${project.slug}`}
                    target="_blank"
                    className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-[#252525] transition-colors"
                    title="Ver página pública"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="p-2 rounded text-accent hover:bg-accent/10 transition-colors"
                    title="Editar proyecto"
                  >
                    <Edit size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
