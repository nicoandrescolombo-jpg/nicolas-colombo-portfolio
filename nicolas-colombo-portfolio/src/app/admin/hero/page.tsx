import React from 'react'
import { getSiteSettings } from '@/lib/queries/projects'
import Button from '@/components/ui/Button'
import { Sparkles, Upload, Smartphone, Monitor, Image as ImageIcon } from 'lucide-react'

export default async function AdminHeroConfigPage() {
  const settings = await getSiteSettings()
  const hero = settings.hero

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-[#222222]">
        <h1 className="font-display italic text-3xl text-text-primary">
          Configuración de Portada (Hero)
        </h1>
        <p className="font-body text-xs text-text-secondary mt-1">
          Administra el video de animación a pantalla completa, la versión móvil vertical y la imagen estática de respaldo.
        </p>
      </div>

      <form className="space-y-8 bg-[#141414] border border-[#222222] p-8 rounded-lg">
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
            <input type="file" accept="video/mp4,video/webm" className="hidden" id="hero-desktop" />
            <label htmlFor="hero-desktop" className="mt-4 btn-secondary cursor-pointer text-xs">
              Seleccionar Video MP4
            </label>
          </div>
          {hero.video_url && (
            <p className="font-mono text-xs text-accent">Archivo actual configurado</p>
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
            <input type="file" accept="video/mp4,video/webm" className="hidden" id="hero-mobile" />
            <label htmlFor="hero-mobile" className="mt-4 btn-secondary cursor-pointer text-xs">
              Seleccionar Video Vertical
            </label>
          </div>
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
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="hero-fallback" />
            <label htmlFor="hero-fallback" className="mt-4 btn-secondary cursor-pointer text-xs">
              Seleccionar Imagen Estática
            </label>
          </div>
        </div>

        {/* Overlay Opacity Slider */}
        <div className="space-y-3 pt-6 border-t border-[#222222]">
          <label className="admin-label">
            Opacidad del Velo Oscuro ({Math.round(hero.overlay_opacity * 100)}%)
          </label>
          <input
            type="range"
            min="10"
            max="80"
            defaultValue={hero.overlay_opacity * 100}
            className="w-full accent-[#E8FF59] cursor-pointer"
          />
          <p className="text-xs text-text-tertiary">
            Permite asegurar la legibilidad del texto &ldquo;Nicolas Colombo — Animator 2D&rdquo; sobre cualquier fondo.
          </p>
        </div>

        <div className="pt-6 border-t border-[#222222] flex justify-end">
          <Button variant="primary" type="button">
            Guardar y Publicar Portada
          </Button>
        </div>
      </form>
    </div>
  )
}
