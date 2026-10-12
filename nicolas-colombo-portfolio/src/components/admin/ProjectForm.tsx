'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, ProjectType, ProjectStatus, MediaType } from '@/types'
import { createProject, updateProject, addProjectMedia, deleteProjectMedia } from '@/lib/actions/projects'
import Button from '@/components/ui/Button'
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Video, Layers, Upload } from 'lucide-react'
import { toastSuccess, toastError } from '@/components/ui/Toast'

interface ProjectFormProps {
  initialProject?: Project | null
}

export default function ProjectForm({ initialProject }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!initialProject

  const [loading, setLoading] = useState(false)
  const [projectType, setProjectType] = useState<ProjectType>(
    initialProject?.project_type || 'individual'
  )
  const [status, setStatus] = useState<ProjectStatus>(
    initialProject?.status || 'draft'
  )
  const [title, setTitle] = useState(initialProject?.title || '')
  const [description, setDescription] = useState(initialProject?.description || '')
  const [coverUrl, setCoverUrl] = useState(initialProject?.cover_url || '')

  // Media items list
  const [mediaList, setMediaList] = useState(initialProject?.media || [])

  // New media inputs
  const [newMediaType, setNewMediaType] = useState<MediaType>('image')
  const [newExternalUrl, setNewExternalUrl] = useState('')
  const [newAltText, setNewAltText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toastError('El título es obligatorio')
      return
    }

    setLoading(true)
    try {
      if (isEditing && initialProject) {
        const res = await updateProject(initialProject.id, {
          title,
          description,
          project_type: projectType,
          status,
          cover_url: coverUrl,
          sort_order: initialProject.sort_order,
        })

        if (!res.success) throw new Error(res.error)
        toastSuccess('Proyecto actualizado con éxito')
      } else {
        const res = await createProject({
          title,
          slug: '',
          description,
          project_type: projectType,
          status,
          cover_url: coverUrl,
          sort_order: 0,
        })

        if (!res.success) throw new Error(res.error)
        toastSuccess('Proyecto creado con éxito')
        if (res.data?.id) {
          router.push(`/admin/projects/${res.data.id}`)
          return
        }
      }
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      toastError(err.message || 'Error al guardar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedia = async () => {
    if (!initialProject) {
      toastError('Primero guarda el proyecto para agregar archivos multimedia')
      return
    }

    if ((newMediaType === 'youtube' || newMediaType === 'vimeo') && !newExternalUrl.trim()) {
      toastError('Debes ingresar la URL del video')
      return
    }

    setLoading(true)
    try {
      const res = await addProjectMedia(initialProject.id, {
        media_type: newMediaType,
        external_url: newExternalUrl || undefined,
        alt_text: newAltText || undefined,
        sort_order: mediaList.length,
      })

      if (!res.success) throw new Error(res.error)
      toastSuccess('Medio agregado con éxito')
      setNewExternalUrl('')
      setNewAltText('')
      router.refresh()
    } catch (err: any) {
      toastError(err.message || 'Error al agregar archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!initialProject) return

    setLoading(true)
    try {
      const res = await deleteProjectMedia(mediaId, initialProject.id)
      if (!res.success) throw new Error(res.error)
      setMediaList(mediaList.filter((m) => m.id !== mediaId))
      toastSuccess('Elemento eliminado')
      router.refresh()
    } catch (err: any) {
      toastError(err.message || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#222222]">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-md hover:bg-[#181818] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-text-primary">
              {isEditing ? `Editar: ${initialProject?.title}` : 'Nuevo Proyecto'}
            </h1>
            <p className="font-body text-xs text-text-tertiary mt-1">
              Configura el tipo de obra, los contenidos audiovisuales y su visibilidad.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details */}
        <div className="bg-[#141414] border border-[#222222] p-8 rounded-lg space-y-6">
          <h2 className="font-ui text-sm uppercase tracking-wider text-accent font-medium">
            1. Información Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="admin-label">Título de la Obra *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Walk Cycle — Personaje Principal"
                required
                className="admin-input"
              />
            </div>

            <div className="space-y-2">
              <label className="admin-label">Tipo de Publicación *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="admin-input cursor-pointer"
              >
                <option value="individual">Tipo A: Proyecto Individual (Video / Imagen)</option>
                <option value="gif_sequence">Tipo B: Secuencia de GIFs (Walk cycles, estudios)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="admin-label">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del proceso de animación, software utilizado, rol artístico..."
              rows={3}
              className="admin-input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="admin-label">Estado de Publicación</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="admin-input cursor-pointer"
              >
                <option value="draft">Borrador (Oculto al público)</option>
                <option value="published">Publicado (Visible en el portafolio)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="admin-label">Portada / Thumbnail (URL opcional)</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... o ruta de almacenamiento"
                className="admin-input"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" type="submit" isLoading={loading}>
              {isEditing ? 'Guardar Cambios' : 'Crear y Continuar a Medios'}
            </Button>
          </div>
        </div>
      </form>

      {/* Media Management (Only when editing) */}
      {isEditing && (
        <div className="bg-[#141414] border border-[#222222] p-8 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-ui text-sm uppercase tracking-wider text-accent font-medium">
                2. Contenido Multimedia
              </h2>
              <p className="font-body text-xs text-text-tertiary mt-1">
                {projectType === 'gif_sequence'
                  ? 'Agrega la secuencia vertical de GIFs animados en orden cronológico.'
                  : 'Agrega el video principal de YouTube/Vimeo o la imagen final.'}
              </p>
            </div>
          </div>

          {/* Existing Media List */}
          <div className="space-y-3">
            {mediaList.length === 0 ? (
              <p className="font-body text-xs text-text-tertiary italic p-4 bg-[#101010] rounded-md border border-[#1f1f1f]">
                No hay archivos asociados aún.
              </p>
            ) : (
              mediaList.map((media, idx) => (
                <div
                  key={media.id}
                  className="p-4 bg-[#101010] border border-[#222222] rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-text-tertiary">#{idx + 1}</span>
                    <span className="font-ui text-xs px-2 py-0.5 rounded bg-white/5 uppercase text-text-secondary">
                      {media.media_type}
                    </span>
                    <span className="font-body text-xs text-text-primary truncate max-w-md">
                      {media.external_url || media.storage_path || 'Archivo cargado'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(media.id)}
                    className="p-1.5 text-state-error/70 hover:text-state-error transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Media Form */}
          <div className="p-6 bg-[#101010] border border-[#222222] rounded-lg space-y-4">
            <h3 className="font-ui text-xs uppercase tracking-wider text-text-secondary">
              Agregar Nuevo Medio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="admin-label">Tipo</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as MediaType)}
                  className="admin-input cursor-pointer"
                >
                  <option value="image">Imagen (.jpg, .png, .webp)</option>
                  <option value="gif">GIF Animado (.gif)</option>
                  <option value="youtube">Video YouTube</option>
                  <option value="vimeo">Video Vimeo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="admin-label">
                  {newMediaType === 'youtube' || newMediaType === 'vimeo'
                    ? 'URL del Video (YouTube o Vimeo)'
                    : 'Ruta o URL del Archivo'}
                </label>
                <input
                  type="text"
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  placeholder={
                    newMediaType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : newMediaType === 'vimeo'
                      ? 'https://vimeo.com/...'
                      : 'https://... o nombre del archivo'
                  }
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Texto Descriptivo / Alt Text</label>
              <input
                type="text"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                placeholder="Descripción para accesibilidad o subtítulo"
                className="admin-input"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={handleAddMedia}
                isLoading={loading}
              >
                <Plus size={16} />
                <span>Agregar a la Obra</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
