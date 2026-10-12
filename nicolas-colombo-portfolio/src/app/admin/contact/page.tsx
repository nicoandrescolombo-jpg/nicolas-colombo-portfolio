import React from 'react'
import { getSiteSettings } from '@/lib/queries/projects'
import Button from '@/components/ui/Button'
import { Mail, Instagram, Globe, Linkedin, MessageSquare } from 'lucide-react'

export default async function AdminContactConfigPage() {
  const settings = await getSiteSettings()
  const contact = settings.contact

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-[#222222]">
        <h1 className="font-display italic text-3xl text-text-primary">
          Información de Contacto & Redes
        </h1>
        <p className="font-body text-xs text-text-secondary mt-1">
          Actualiza los canales de contacto visibles en el portafolio. Si un campo queda vacío o desactivado, no generará enlaces rotos.
        </p>
      </div>

      <form className="space-y-6 bg-[#141414] border border-[#222222] p-8 rounded-lg">
        {/* Contact Invitation Text */}
        <div className="space-y-2">
          <label className="admin-label flex items-center gap-2">
            <MessageSquare size={14} className="text-accent" />
            <span>Texto de Invitación / Título de Contacto</span>
          </label>
          <input
            type="text"
            defaultValue={contact.contact_text || "Let's create something"}
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
                defaultChecked={contact.visibility.email}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="email"
            defaultValue={contact.email || 'nicolascolombo.art@gmail.com'}
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
                defaultChecked={contact.visibility.instagram}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            defaultValue={contact.instagram_url || ''}
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
                defaultChecked={contact.visibility.behance}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            defaultValue={contact.behance_url || ''}
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
                defaultChecked={contact.visibility.linkedin}
                className="accent-[#E8FF59]"
              />
              <span>Visible</span>
            </label>
          </div>
          <input
            type="url"
            defaultValue={contact.linkedin_url || ''}
            placeholder="https://linkedin.com/in/tu_perfil"
            className="admin-input"
          />
        </div>

        <div className="pt-6 border-t border-[#222222] flex justify-end">
          <Button variant="primary" type="button">
            Guardar Cambios de Contacto
          </Button>
        </div>
      </form>
    </div>
  )
}
