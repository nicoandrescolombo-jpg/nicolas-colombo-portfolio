import { createClient } from '@/lib/supabase/client'
import type { MediaType } from '@/types'

/** Tope del bucket "projects" (plan free de Supabase) */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

export function mediaTypeFromName(name: string): MediaType {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (ext === 'gif') return 'gif'
  if (ext === 'webm' || ext === 'mp4') return 'video'
  return 'image'
}

/** Nombre de archivo apto para Storage: sin tildes, espacios ni símbolos */
export function safeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.\-_]/gi, '_')
}

/** Ancho y alto reales de una imagen o video, leídos en el navegador */
export function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const done = (size: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url)
      resolve(size)
    }
    if (file.type.startsWith('video/')) {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => done({ width: v.videoWidth, height: v.videoHeight })
      v.onerror = () => done(null)
      v.src = url
    } else {
      const img = new Image()
      img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => done(null)
      img.src = url
    }
  })
}

/**
 * Sube un archivo directo del navegador al bucket "projects" con la sesión del
 * admin. No pasa por el servidor de Next, así que no hay límite de 1 MB.
 */
export async function uploadToProjectsBucket(file: File, projectId: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`pesa ${(file.size / 1048576).toFixed(1)} MB y el máximo es 50 MB`)
  }
  const supabase = createClient()
  const path = `${projectId}/${Date.now()}-${safeFileName(file.name)}`
  const { error } = await supabase.storage.from('projects').upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    if (/mime type/i.test(error.message)) {
      throw new Error('el bucket no acepta este formato todavía: falta correr la migración 004')
    }
    if (/exceeded|too large/i.test(error.message)) {
      throw new Error('supera el tamaño máximo del bucket (corré la migración 004 para subirlo a 50 MB)')
    }
    throw new Error(error.message)
  }
  return supabase.storage.from('projects').getPublicUrl(path).data.publicUrl
}
