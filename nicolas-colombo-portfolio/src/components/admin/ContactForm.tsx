'use client'

import React, { useState } from 'react'
import type { ContactSettings } from '@/types'
import { updateSiteSettings } from '@/lib/actions/projects'
import Button from '@/components/ui/Button'
import { Mail, Instagram, Globe, Linkedin, MessageSquare } from 'lucide-react'
import { toastSuccess, toastError } from '@/components/ui/Toast'

interface ContactFormProps {
  initialContact: ContactSettings
}

export default function ContactForm({ initialContact }: ContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [contactText, setContactText] = useState(initialContact.contact_text || "Let's create something")
  const [email, setEmail] = useState(initialContact.email || '')
  const [instagram, setInstagram] = useState(initialContact.instagram_url || '')
  const [behance, setBehance] = useState(initialContact.behance_url || '')
  const [linkedin, setLinkedin] = useState(initialContact.linkedin_url || '')

  const [visibility, setVisibility] = useState({
    email: initialContact.visibility?.email ?? true,
    instagram: initialContact.visibility?.instagram ?? true,
    behance: initialContact.visibility?.behance ?? true,
    linkedin: initialContact.visibility?.linkedin ?? true,
  })

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
        visibility,
      }

      const res = await updateSiteSettings('contact', payload)
      if (!res.success) throw new Error(res.error)

      toastSuccess('Información de contacto guardada y publicada')
    } catch (err: any) {
      toastError(err.message || 'Error al guardar contacto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 bg-[#141414] border border-[#222222] p-8 rounded-lg">
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
            <span>Correo Electrónico Profesional</span>
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
          placeholder="tu-email@gmail.com"
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

      <div className="pt-6 border-t border-[#222222] flex justify-end">
        <Button variant="primary" type="submit" isLoading={loading}>
          Guardar Cambios de Contacto
        </Button>
      </div>
    </form>
  )
}
