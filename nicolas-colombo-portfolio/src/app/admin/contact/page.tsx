import React from 'react'
import { getSiteSettings } from '@/lib/queries/projects'
import ContactForm from '@/components/admin/ContactForm'

export default async function AdminContactConfigPage() {
  const settings = await getSiteSettings()

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

      <ContactForm initialContact={settings.contact} />
    </div>
  )
}
