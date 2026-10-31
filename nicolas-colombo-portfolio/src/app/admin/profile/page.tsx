import React from 'react'
import { getSiteSettings } from '@/lib/queries/projects'
import ProfileForm from '@/components/admin/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const settings = await getSiteSettings()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-[#222222]">
        <h1 className="font-display text-3xl text-text-primary">Perfil y reel</h1>
        <p className="font-body text-xs text-text-secondary mt-1">
          Lo que ve un estudio en los primeros segundos: tu rol, si estás disponible, el reel y tu CV.
        </p>
      </div>

      <ProfileForm initialIdentity={settings.identity} />
    </div>
  )
}
