'use client'

import React, { useState } from 'react'
import type { HeroSettings } from '@/types'
import { updateSiteSettings } from '@/lib/actions/projects'
import Button from '@/components/ui/Button'
import { Upload, Smartphone, Monitor, Image as ImageIcon } from 'lucide-react'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

interface HeroFormProps {
  initialHero: HeroSettings
}

export default function HeroForm({ initialHero }: HeroFormProps) {
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(initialHero.video_url || '')
  const [videoMobileUrl, setVideoMobileUrl] = useState(initialHero.video_mobile_url || '')
  const [fallbackImageUrl, setFallbackImageUrl] = useState(initialHero.fallback_image_url || '')
  const [overlayOpacity, setOverlayOpacity] = useState(initialHero.overlay_opacity || 0.4)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile' | 'fallback') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${target}-${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('hero')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: publicData } = supabase.storage
        .from('hero')
        .getPublicUrl(fileName)

      const url = publicData.publicUrl

      if (target === 'desktop') setVideoUrl(url)
      if (target === 'mobile') setVideoMobileUrl(url)
      if (target === 'fallback') setFallbackImageUrl(url)

      toastSuccess(`Archivo para ${target} subido correctamente`)
    } catch (err: any) {
      console.error(err)
      toastError(err.message || 'Error al subir archivo a Storage')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: HeroSettings = {
        video_url: videoUrl || null,
        video_mobile_url: videoMobileUrl || null,
        fallback_image_url: fallbackImageUrl || null,
        overlay_opacity: overlayOpacity,
      }

      const res = await updateSiteSettings('hero', payload)
      if (!res.success) throw new Error(res.error)

      toastSuccess('Configuración de portada guardada y publicada')
    } catch (err: any) {
      toastError(err.message || 'Error al guardar portada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 bg-[#141414] border border-[#222222] p-8 rounded-lg">
      {/* Desktop Hero Video */}
      <div className="space-y-3">
        <label className="admin-label flex items-center gap-2">
          <Monitor size={15} className="text-accent" />
          <span>Video de Portada Principal (Escritorio / 16:9)</span>
        </label>
        <div className="border-2 border-dashed border-[#2b2b2b] hover:border-accent/50 transition-colors p-8 rounded-lg flex flex-col items-center justify-center text-center bg-[#101010]">
          <Upload size={32} className="text-text-tertiary mb-3" />
          <p className="font-ui text-sm text-text-primary">
            Arrastra aquí tu animación o selecciona el archivo
          </p>
          <p className="font-body text-xs text-text-tertiary mt-1">
            Formato MP4 (H.264) • Recomendado: 1920×1080 • Máximo: 50MB
          </p>
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            id="hero-desktop"
            onChange={(e) => handleFileUpload(e, 'desktop')}
          />
          <label htmlFor="hero-desktop" className="mt-4 btn-secondary cursor-pointer text-xs">
            Seleccionar Video MP4
          </label>
        </div>
        {videoUrl && (
          <div className="flex items-center justify-between p-3 bg-[#101010] rounded border border-[#222222]">
            <span className="font-mono text-xs text-accent truncate max-w-lg">{videoUrl}</span>
            <button
              type="button"
              onClick={() => setVideoUrl('')}
              className="text-xs text-state-error hover:underline ml-2"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Mobile Hero Video */}
      <div className="space-y-3 pt-6 border-t border-[#222222]">
        <label className="admin-label flex items-center gap-2">
          <Smartphone size={15} className="text-accent" />
          <span>Video para Móviles (Opcional / 9:16 Vertical)</span>
        </label>
        <div className="border-2 border-dashed border-[#2b2b2b] hover:border-accent/50 transition-colors p-8 rounded-lg flex flex-col items-center justify-center text-center bg-[#101010]">
          <Upload size={28} className="text-text-tertiary mb-2" />
          <p className="font-ui text-sm text-text-primary">
            Cargar versión vertical específica
          </p>
          <p className="font-body text-xs text-text-tertiary mt-1">
            Si no se sube, se adaptará el video de escritorio automáticamente
          </p>
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            id="hero-mobile"
            onChange={(e) => handleFileUpload(e, 'mobile')}
          />
          <label htmlFor="hero-mobile" className="mt-4 btn-secondary cursor-pointer text-xs">
            Seleccionar Video Vertical
          </label>
        </div>
        {videoMobileUrl && (
          <div className="flex items-center justify-between p-3 bg-[#101010] rounded border border-[#222222]">
            <span className="font-mono text-xs text-accent truncate max-w-lg">{videoMobileUrl}</span>
            <button
              type="button"
              onClick={() => setVideoMobileUrl('')}
              className="text-xs text-state-error hover:underline ml-2"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Fallback Poster Image */}
      <div className="space-y-3 pt-6 border-t border-[#222222]">
        <label className="admin-label flex items-center gap-2">
          <ImageIcon size={15} className="text-accent" />
          <span>Imagen de Respaldo / Poster (Fallback)</span>
        </label>
        <div className="border-2 border-dashed border-[#2b2b2b] hover:border-accent/50 transition-colors p-8 rounded-lg flex flex-col items-center justify-center text-center bg-[#101010]">
          <Upload size={28} className="text-text-tertiary mb-2" />
          <p className="font-ui text-sm text-text-primary">
            Fotograma clave estático
          </p>
          <p className="font-body text-xs text-text-tertiary mt-1">
            Se muestra mientras carga el video o si el dispositivo tiene ahorro de datos
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            id="hero-fallback"
            onChange={(e) => handleFileUpload(e, 'fallback')}
          />
          <label htmlFor="hero-fallback" className="mt-4 btn-secondary cursor-pointer text-xs">
            Seleccionar Imagen Estática
          </label>
        </div>
        {fallbackImageUrl && (
          <div className="flex items-center justify-between p-3 bg-[#101010] rounded border border-[#222222]">
            <span className="font-mono text-xs text-accent truncate max-w-lg">{fallbackImageUrl}</span>
            <button
              type="button"
              onClick={() => setFallbackImageUrl('')}
              className="text-xs text-state-error hover:underline ml-2"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Overlay Opacity Slider */}
      <div className="space-y-3 pt-6 border-t border-[#222222]">
        <div className="flex items-center justify-between">
          <label className="admin-label mb-0">
            Opacidad del Velo Oscuro ({Math.round(overlayOpacity * 100)}%)
          </label>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          value={Math.round(overlayOpacity * 100)}
          onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
          className="w-full accent-[#E8FF59] cursor-pointer"
        />
        <p className="text-xs text-text-tertiary">
          Permite asegurar la legibilidad del texto &ldquo;Nicolas Colombo — Animator 2D&rdquo; sobre cualquier fondo.
        </p>
      </div>

      <div className="pt-6 border-t border-[#222222] flex justify-end">
        <Button variant="primary" type="submit" isLoading={loading}>
          Guardar y Publicar Portada
        </Button>
      </div>
    </form>
  )
}
