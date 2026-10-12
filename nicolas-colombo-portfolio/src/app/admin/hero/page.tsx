import React from 'react'
import { getSiteSettings } from '@/lib/queries/projects'
import HeroForm from '@/components/admin/HeroForm'

export default async function AdminHeroConfigPage() {
  const settings = await getSiteSettings()

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

      <HeroForm initialHero={settings.hero} />
    </div>
  )
}
