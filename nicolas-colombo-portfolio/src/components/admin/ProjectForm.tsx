'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, ProjectType, ProjectStatus, MediaType, MediaSection, ProjectMedia } from '@/types'
import {
  createProject,
  updateProject,
  addProjectMedia,
  deleteProjectMedia,
  updateProjectMedia,
} from '@/lib/actions/projects'
import { mediaTypeFromName, readDimensions, uploadToProjectsBucket } from '@/lib/utils/upload'
import Button from '@/components/ui/Button'
import { Plus, Trash2, ArrowLeft, Upload, ChevronUp, ChevronDown } from 'lucide-react'
import { toastSuccess, toastError } from '@/components/ui/Toast'

interface ProjectFormProps {
  initialProject?: Project | null
}

export default function ProjectForm({ initialProject }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!initialProject
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>(
    initialProject?.project_type || 'individual'
  )
  const [status, setStatus] = useState<ProjectStatus>(
    initialProject?.status || 'draft'
  )
  const [title, setTitle] = useState(initialProject?.title || '')
  const [description, setDescription] = useState(initialProject?.description || '')
  const [coverUrl, setCoverUrl] = useState(initialProject?.cover_url || '')
  const [body, setBody] = useState(initialProject?.body || '')
  const [linkUrl, setLinkUrl] = useState(initialProject?.link_url || '')
  const [sortOrder, setSortOrder] = useState(initialProject?.sort_order ?? 0)

  // Media items list
  const [mediaList, setMediaList] = useState<ProjectMedia[]>(initialProject?.media || [])
  // Sección a la que van los archivos que se suben
  const [uploadSection, setUploadSection] = useState<MediaSection>('final')

  // Mantener la lista al día después de router.refresh()
  React.useEffect(() => {
    setMediaList(initialProject?.media || [])
  }, [initialProject?.media])

  // New media inputs (for YouTube / Vimeo)
  const [newMediaType, setNewMediaType] = useState<MediaType>('youtube')
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
          sort_order: sortOrder,
          body,
          link_url: linkUrl,
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
          sort_order: sortOrder,
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

  const handleAddVideoUrl = async () => {
    if (!initialProject) {
      toastError('Primero guarda el proyecto para agregar archivos multimedia')
      return
    }

    if (!newExternalUrl.trim()) {
      toastError('Debes ingresar la URL del video')
      return
    }

    setLoading(true)
    try {
      const res = await addProjectMedia(initialProject.id, {
        media_type: newMediaType,
        external_url: newExternalUrl,
        alt_text: newAltText || undefined,
        sort_order: mediaList.length,
      })

      if (!res.success) throw new Error(res.error)
      toastSuccess('Video agregado con éxito')
      setNewExternalUrl('')
      setNewAltText('')
      router.refresh()
    } catch (err: any) {
      toastError(err.message || 'Error al agregar video')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!initialProject) {
      toastError('Primero guarda el proyecto para subir archivos')
      return
    }

    setUploading(true)
    const total = files.length
    let done = 0

    let i = 0
    for (const file of Array.from(files)) {
      i++
      setUploadProgress(`Subiendo ${file.name} (${i}/${total})…`)
      try {
        // Directo del navegador a Storage (sin pasar por el servidor)
        const [url, size] = await Promise.all([
          uploadToProjectsBucket(file, initialProject.id),
          readDimensions(file),
        ])

        const mediaRes = await addProjectMedia(initialProject.id, {
          media_type: mediaTypeFromName(file.name),
          storage_path: url,
          alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          width: size?.width,
          height: size?.height,
          sort_order: mediaList.length + done,
          section: uploadSection,
        })
        if (!mediaRes.success) throw new Error(mediaRes.error)
        done++
      } catch (err: any) {
        toastError(`Error con ${file.name}: ${err.message}`)
      }
    }

    setUploading(false)
    setUploadProgress('')
    if (done > 0) toastSuccess(`${done} archivo${done > 1 ? 's' : ''} subido${done > 1 ? 's' : ''} con éxito`)
    router.refresh()
  }

  const handleMediaPatch = async (
    mediaId: string,
    patch: Parameters<typeof updateProjectMedia>[2],
  ) => {
    if (!initialProject) return
    setMediaList((list) => list.map((m) => (m.id === mediaId ? { ...m, ...patch } as ProjectMedia : m)))
    const res = await updateProjectMedia(mediaId, initialProject.id, patch)
    if (!res.success) toastError(res.error || 'No se pudo guardar el cambio')
  }

  const moveMedia = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= mediaList.length) return
    const list = [...mediaList]
    ;[list[index], list[target]] = [list[target], list[index]]
    setMediaList(list)
    await Promise.all([
      handleMediaPatch(list[index].id, { sort_order: index }),
      handleMediaPatch(list[target].id, { sort_order: target }),
    ])
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

          <div className="space-y-2">
            <label className="admin-label">Link (canal de YouTube, sitio…) — opcional</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://www.youtube.com/@..."
              className="admin-input"
            />
          </div>

          <div className="space-y-2">
            <label className="admin-label">Sobre el proyecto (texto largo, en inglés)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="El encargo, cómo lo resolviste, qué aprendiste. Separá párrafos con una línea en blanco."
              rows={8}
              className="admin-input"
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
              <label className="admin-label pt-2 block">Posición en la home (1 = primero, en el lugar grande)</label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                className="admin-input w-28"
              />
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
          <div>
            <h2 className="font-ui text-sm uppercase tracking-wider text-accent font-medium">
              2. Contenido Multimedia
            </h2>
            <p className="font-body text-xs text-text-tertiary mt-1">
              {projectType === 'gif_sequence'
                ? 'Agrega la secuencia vertical de GIFs animados en orden cronológico.'
                : 'Subí imágenes, GIFs o clips webm/mp4 (hasta 50 MB), o pegá URLs de YouTube/Vimeo.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="admin-label !mb-0">Los archivos nuevos van a:</span>
            {(['final', 'process'] as MediaSection[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setUploadSection(s)}
                className={`font-ui text-xs px-3 py-1.5 rounded border transition-colors ${
                  uploadSection === s
                    ? 'border-accent text-accent'
                    : 'border-[#333] text-text-secondary hover:text-text-primary'
                }`}
              >
                {s === 'final' ? 'Resultado final' : 'Proceso'}
              </button>
            ))}
          </div>

          {/* Drag & Drop / Multi-file upload */}
          <div
            className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFileUpload(e.dataTransfer.files)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.gif,.webm,.mp4"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Upload size={28} className="mx-auto mb-3 text-text-tertiary" />
            {uploading ? (
              <p className="font-body text-sm text-accent">{uploadProgress}</p>
            ) : (
              <>
                <p className="font-body text-sm text-text-secondary">
                  Arrastrá archivos acá o{' '}
                  <span className="text-accent underline">hacé click para seleccionar</span>
                </p>
                <p className="font-body text-xs text-text-tertiary mt-1">
                  Acepta: .png .jpg .webp .gif .webm .mp4 — podés seleccionar varios a la vez
                </p>
              </>
            )}
          </div>

          {/* Existing Media List */}
          <div className="space-y-3">
            {mediaList.length === 0 ? (
              <p className="font-body text-xs text-text-tertiary italic p-4 bg-[#101010] rounded-md border border-[#1f1f1f]">
                No hay archivos asociados aún.
              </p>
            ) : (
              mediaList.map((media, idx) => {
                const src = media.storage_path || media.external_url
                const isClip = media.media_type === 'video' || media.media_type === 'webm'
                const isEmbed = media.media_type === 'youtube' || media.media_type === 'vimeo'
                const section = media.section ?? 'final'
                return (
                  <div
                    key={media.id}
                    className="p-4 bg-[#101010] border border-[#222222] rounded-md flex gap-4"
                  >
                    <div className="w-24 h-16 shrink-0 bg-black rounded overflow-hidden flex items-center justify-center">
                      {src && !isEmbed ? (
                        isClip ? (
                          <video src={`${src}#t=1`} muted preload="metadata" className="w-full h-full object-contain bg-[#E8E2D6]" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                        )
                      ) : (
                        <span className="font-ui text-[10px] uppercase text-text-tertiary">{media.media_type}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-text-tertiary shrink-0">#{idx + 1}</span>
                        <span className="font-ui text-xs px-2 py-0.5 rounded bg-white/5 uppercase text-text-secondary shrink-0">
                          {media.media_type}
                        </span>
                        <span className="font-body text-xs text-text-primary truncate">
                          {media.alt_text || src || 'Archivo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select
                          value={section}
                          onChange={(e) => handleMediaPatch(media.id, { section: e.target.value as MediaSection })}
                          className="admin-input !py-1.5 text-xs cursor-pointer"
                        >
                          <option value="final">Resultado final</option>
                          <option value="process">Proceso</option>
                        </select>
                        {section === 'process' ? (
                          <select
                            value={media.pair_id || ''}
                            onChange={(e) => handleMediaPatch(media.id, { pair_id: e.target.value || null })}
                            className="admin-input !py-1.5 text-xs cursor-pointer md:col-span-2"
                          >
                            <option value="">Boceto de… (ninguna)</option>
                            {mediaList
                              .filter((m) => (m.section ?? 'final') === 'final')
                              .map((m) => (
                                <option key={m.id} value={m.id}>
                                  Boceto de: {m.alt_text || m.media_type}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="md:col-span-2" />
                        )}
                      </div>

                      {!isEmbed && (
                        <label className="flex items-center gap-2 font-body text-xs text-text-secondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!media.preview}
                            onChange={(e) => handleMediaPatch(media.id, { preview: e.target.checked })}
                          />
                          Vista previa en la home (se reproduce al pasar el mouse por la tarjeta)
                        </label>
                      )}

                      <input
                        type="text"
                        defaultValue={media.caption || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (media.caption || '')) {
                            handleMediaPatch(media.id, { caption: e.target.value })
                          }
                        }}
                        placeholder="Epígrafe (opcional, en inglés)"
                        className="admin-input !py-1.5 text-xs"
                      />
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button type="button" onClick={() => moveMedia(idx, -1)} disabled={idx === 0} className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30" aria-label="Subir">
                        <ChevronUp size={16} />
                      </button>
                      <button type="button" onClick={() => moveMedia(idx, 1)} disabled={idx === mediaList.length - 1} className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30" aria-label="Bajar">
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(media.id)}
                        className="p-1 text-state-error/70 hover:text-state-error transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add Media via YouTube / Vimeo URL */}
          <div className="p-6 bg-[#101010] border border-[#222222] rounded-lg space-y-4">
            <h3 className="font-ui text-xs uppercase tracking-wider text-text-secondary">
              Agregar video de YouTube o Vimeo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="admin-label">Plataforma</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as MediaType)}
                  className="admin-input cursor-pointer"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="admin-label">URL del Video</label>
                <input
                  type="text"
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  placeholder={
                    newMediaType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : 'https://vimeo.com/...'
                  }
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Alt Text (Opcional)</label>
              <input
                type="text"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                placeholder="Descripción del video"
                className="admin-input"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={handleAddVideoUrl}
                isLoading={loading}
              >
                <Plus size={16} />
                <span>Agregar video</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
