'use client'

import React, { useState } from 'react'
import type { ContactSettings } from '@/types'
import { updateSiteSettings } from '@/lib/actions/projects'
import Button from '@/components/ui/Button'
import { Mail, Instagram, Globe, Linkedin, MessageSquare, Upload, Image as ImageIcon, Video } from 'lucide-react'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

interface ContactFormProps {
  initialContact: ContactSettings
}

export default function ContactForm({ initialContact }: ContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [contactText, setContactText] = useState(initialContact.contact_text || "Let's create something")
  const [email, setEmail] = useState(initialContact.email || 'nicoandres.colombo@gmail.com')
  const [instagram, setInstagram] = useState(initialContact.instagram_url || '')
  const [behance, setBehance] = useState(initialContact.behance_url || '')
  const [linkedin, setLinkedin] = useState(initialContact.linkedin_url || '')

  // Background settings
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'video'>(
    initialContact.background_type || 'color'
  )
  const [backgroundUrl, setBackgroundUrl] = useState(initialContact.background_url || '')
  const [backgroundOverlayOpacity, setBackgroundOverlayOpacity] = useState(
    initialContact.background_overlay_opacity ?? 0.5
  )

  const [visibility, setVisibility] = useState({
    email: initialContact.visibility?.email ?? true,
    instagram: initialContact.visibility?.instagram ?? true,
    behance: initialContact.visibility?.behance ?? true,
    linkedin: initialContact.visibility?.linkedin ?? true,
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `contact-bg-${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('hero')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: publicData } = supabase.storage
        .from('hero')
        .getPublicUrl(fileName)

      setBackgroundUrl(publicData.publicUrl)
      if (file.type.startsWith('video/')) {
        setBackgroundType('video')
      } else {
        setBackgroundType('image')
      }

      toastSuccess('Fondo de contacto subido correctamente')
    } catch (err: any) {
      console.error(err)
      toastError(err.message || 'Error al subir archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: ContactSettings = {
        contact_text: contactText,
        email: email || null,
        instagram_url: instagram || null,
        behance_url: behance || null,
        linkedin_url: linkedin || null,
        other_links: initialContact.other_links || [],
        background_type: backgroundType,
        background_url: backgroundUrl || null,
        background_overlay_opacity: backgroundOverlayOpacity,
        visibility,
      }

      const res = await updateSiteSettings('contact', payload)
      if (!res.success) throw new Error(res.error)

      toastSuccess('Información y fondo de contacto guardados y publicados')
    } catch (err: any) {
      toastError(err.message || 'Error al guardar contacto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 bg-[#141414] border border-[#222222] p-8 rounded-lg">
      {/* 1. Fondo de la sección de contacto */}
      <div className="space-y-4">
        <h2 className="font-ui text-sm uppercase tracking-wider text-accent font-medium flex items-center gap-2">
          <ImageIcon size={16} />
          <span>Fondo de la Sección Contacto</span>
        </h2>
        <p className="font-body text-xs text-text-tertiary">
          Personaliza el fondo de la pantalla de contacto con un video en loop, imagen o color oscuro editorial.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Tipo de Fondo</label>
            <select
              value={backgroundType}
              onChange={(e) => setBackgroundType(e.target.value as 'color' | 'image' | 'video')}
              className="admin-input cursor-pointer"
            >
              <option value="color">Color Sólido Oscuro (#0A0A0A)</option>
              <option value="image">Imagen de Fondo</option>
              <option value="video">Video en Bucle (MP4 / WebM)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="admin-label">Subir Archivo de Fondo</label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                className="hidden"
                id="contact-bg-file"
                onChange={handleFileUpload}
              />
              <label htmlFor="contact-bg-file" className="btn-secondary cursor-pointer text-xs flex items-center gap-2">
                <Upload size={14} />
                <span>Seleccionar Archivo</span>
              </label>
              {backgroundUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundUrl('')
                    setBackgroundType('color')
                  }}
                  className="text-xs text-state-error hover:underline"
                >
                  Quitar Fondo
                </button>
              )}
            </div>
            {backgroundUrl && (
              <p className="font-mono text-[11px] text-accent truncate mt-2 max-w-md">{backgroundUrl}</p>
            )}
          </div>
        </div>

        {backgroundType !== 'color' && (
          <div className="space-y-2 pt-2">
            <label className="admin-label">
              Opacidad del Velo Oscuro ({Math.round(backgroundOverlayOpacity * 100)}%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={Math.round(backgroundOverlayOpacity * 100)}
              onChange={(e) => setBackgroundOverlayOpacity(Number(e.target.value) / 100)}
              className="w-full accent-[#E8FF59] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 2. Textos e Información de Contacto */}
      <div className="space-y-6 pt-6 border-t border-[#222222]">
        <h2 className="font-ui text-sm uppercase tracking-wider text-accent font-medium">
          2. Canales de Contacto
        </h2>

        {/* Contact Invitation Text */}
        <div className="space-y-2">
          <label className="admin-label flex items-center gap-2">
            <MessageSquare size={14} className="text-accent" />
            <span>Texto de Invitación / Título de Contacto</span>
          </label>
          <input
            type="text"
            value={contactText}
            onChange={(e) => setContactText(e.target.value)}
            placeholder="Ej: Conversemos sobre tu próximo proyecto"
            className="admin-input"
          />
        </div>

        {/* Email */}
        <div className="space-y-2 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between">
            <label className="admin-label flex items-center gap-2 mb-0">
              <Mail size={14} className="text-accent" />
              <span>Correo Electrónico (nicoandres.colombo@gmail.com)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-ui text-text-tertiary cursor-pointer">
              <input
                type="checkbox"
                checked={visibility.email}
                onChange={(e) => setVisibility({ ...visibility, email: e.target.checked })}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nicoandres.colombo@gmail.com"
            className="admin-input"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between">
            <label className="admin-label flex items-center gap-2 mb-0">
              <Instagram size={14} className="text-accent" />
              <span>Instagram</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-ui text-text-tertiary cursor-pointer">
              <input
                type="checkbox"
                checked={visibility.instagram}
                onChange={(e) => setVisibility({ ...visibility, instagram: e.target.checked })}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/tu_usuario"
            className="admin-input"
          />
        </div>

        {/* Behance */}
        <div className="space-y-2 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between">
            <label className="admin-label flex items-center gap-2 mb-0">
              <Globe size={14} className="text-accent" />
              <span>Behance</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-ui text-text-tertiary cursor-pointer">
              <input
                type="checkbox"
                checked={visibility.behance}
                onChange={(e) => setVisibility({ ...visibility, behance: e.target.checked })}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            value={behance}
            onChange={(e) => setBehance(e.target.value)}
            placeholder="https://behance.net/tu_usuario"
            className="admin-input"
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between">
            <label className="admin-label flex items-center gap-2 mb-0">
              <Linkedin size={14} className="text-accent" />
              <span>LinkedIn</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-ui text-text-tertiary cursor-pointer">
              <input
                type="checkbox"
                checked={visibility.linkedin}
                onChange={(e) => setVisibility({ ...visibility, linkedin: e.target.checked })}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/tu_perfil"
            className="admin-input"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-[#222222] flex justify-end">
        <Button variant="primary" type="submit" isLoading={loading}>
          Guardar Cambios de Contacto
        </Button>
      </div>
    </form>
  )
}
