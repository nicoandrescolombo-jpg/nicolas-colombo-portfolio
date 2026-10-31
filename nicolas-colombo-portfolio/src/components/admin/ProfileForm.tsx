'use client'

import React, { useState } from 'react'
import type { IdentitySettings } from '@/types'
import { updateSiteSettings } from '@/lib/actions/projects'
import { getVideoEmbedUrl } from '@/lib/utils/helpers'
import { DEFAULT_AVAILABILITY, DEFAULT_BIO } from '@/lib/utils/constants'
import Button from '@/components/ui/Button'
import { toastSuccess, toastError } from '@/components/ui/Toast'

interface ProfileFormProps {
  initialIdentity: IdentitySettings
}


function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 font-body text-xs text-text-tertiary leading-relaxed">{hint}</p>}
    </div>
  )
}

export default function ProfileForm({ initialIdentity }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [artistName, setArtistName] = useState(initialIdentity.artist_name || '')
  const [subtitle, setSubtitle] = useState(initialIdentity.subtitle || '')
  const [availability, setAvailability] = useState(initialIdentity.availability ?? DEFAULT_AVAILABILITY)
  const [location, setLocation] = useState(initialIdentity.location ?? '')
  const [bio, setBio] = useState(initialIdentity.bio ?? DEFAULT_BIO)
  const [tools, setTools] = useState(initialIdentity.tools ?? '')
  const [cvUrl, setCvUrl] = useState(initialIdentity.cv_url ?? '')
  const [reelUrl, setReelUrl] = useState(initialIdentity.reel_url ?? '')

  const reelInvalid = reelUrl.trim() !== '' && !getVideoEmbedUrl(reelUrl.trim())

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reelInvalid) {
      toastError('El link del reel tiene que ser de YouTube o Vimeo')
      return
    }
    setLoading(true)
    try {
      const payload: IdentitySettings = {
        artist_name: artistName.trim() || 'Nicolás Colombo',
        subtitle: subtitle.trim(),
        availability: availability.trim(),
        location: location.trim(),
        bio: bio.trim(),
        tools: tools.trim(),
        cv_url: cvUrl.trim(),
        reel_url: reelUrl.trim(),
      }
      const res = await updateSiteSettings('identity', payload)
      if (!res.success) throw new Error(res.error)
      toastSuccess('Perfil guardado y publicado')
    } catch (err: any) {
      toastError(err.message || 'No se pudo guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-10 bg-[#141414] border border-[#222222] p-8 rounded-lg">
      <section className="space-y-5">
        <h2 className="font-ui text-sm font-semibold text-text-primary">Portada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nombre" hint="Se usa en el título de la pestaña y en el pie de página.">
            <input className="admin-input" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
          </Field>
          <Field label="Rol (debajo del logo)" hint='En inglés: "2D Animator", "2D Character Animator"…'>
            <input className="admin-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </Field>
        </div>
        <Field
          label="Disponibilidad"
          hint="Aparece abajo a la izquierda en la portada, con un punto rojo. Dejalo vacío para ocultarlo."
        >
          <input
            className="admin-input"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Available for studio work"
          />
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="font-ui text-sm font-semibold text-text-primary">Reel</h2>
        <Field
          label="Link del reel (YouTube o Vimeo)"
          hint='Lo abre el botón "Watch reel". Si lo dejás vacío, se usa el primer proyecto con video que tenga "reel" en el nombre.'
        >
          <input
            className="admin-input"
            value={reelUrl}
            onChange={(e) => setReelUrl(e.target.value)}
            placeholder="https://vimeo.com/123456789"
          />
          {reelInvalid && (
            <p className="mt-1.5 font-body text-xs text-state-error">No reconozco ese link como YouTube o Vimeo.</p>
          )}
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="font-ui text-sm font-semibold text-text-primary">Sección About</h2>
        <Field label="Bio" hint="2 o 3 oraciones, en inglés. Dejala vacía para ocultarla.">
          <textarea
            className="admin-input resize-y min-h-[8rem]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Ubicación" hint='Ej: "Buenos Aires, Argentina (GMT−3) · Remote". Vacío = se oculta.'>
            <input className="admin-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Herramientas" hint='Ej: "Toon Boom Harmony, Moho, Blender". Vacío = se oculta.'>
            <input className="admin-input" value={tools} onChange={(e) => setTools(e.target.value)} />
          </Field>
        </div>
        <Field
          label="Link al CV (PDF)"
          hint="Subí el PDF a Google Drive o Dropbox, compartilo como público y pegá el link. Vacío = no aparece el botón."
        >
          <input
            className="admin-input"
            value={cvUrl}
            onChange={(e) => setCvUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
          />
        </Field>
      </section>

      <div className="pt-2 flex justify-end">
        <Button variant="primary" type="submit" isLoading={loading}>
          Guardar perfil
        </Button>
      </div>
    </form>
  )
}
