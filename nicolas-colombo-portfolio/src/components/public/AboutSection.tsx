import React from 'react'
import type { IdentitySettings } from '@/types'
import { DEFAULT_BIO } from '@/lib/utils/constants'
import { typeset } from '@/lib/utils/helpers'

/**
 * "About" armado como los créditos finales de una película:
 * texto centrado y, debajo, rótulo a la izquierda (versalitas, alineado a la derecha)
 * y dato a la derecha, enfrentados sobre un eje central.
 * El rol no se repite acá: ya está debajo del logo en la portada.
 */
export default function AboutSection({ identity }: { identity: IdentitySettings }) {
  // Si el campo no existe todavía en la base, se usa el texto por defecto;
  // si Nico lo deja vacío desde el admin, el bloque desaparece.
  const bio = identity.bio ?? DEFAULT_BIO
  const credits = [
    { role: 'Based in', value: identity.location },
    { role: 'Tools', value: identity.tools },
  ].filter((c): c is { role: string; value: string } => !!c.value?.trim())

  const cv = identity.cv_url?.trim()

  return (
    <section id="about" className="scroll-mt-16 border-t border-rule py-28 sm:py-36">
      <div className="site-container flex flex-col items-center text-center">
        {/* El título no se muestra (se sobreentiende), pero queda para lectores de pantalla */}
        <h2 className="sr-only">About</h2>

        {bio.trim() && (
          <p className="type-body text-[1.35rem] sm:text-[1.55rem] leading-[1.5] text-paper/90 max-w-[40ch] whitespace-pre-line">
            {typeset(bio)}
          </p>
        )}

        {credits.length > 0 && (
          <dl className="mt-14 w-full max-w-3xl space-y-3">
            {credits.map((c) => (
              <div key={c.role} className="grid grid-cols-2 gap-6 sm:gap-10 items-baseline">
                <dt className="type-sc text-[1.05rem] text-lead text-right">{c.role}</dt>
                <dd className="type-body text-[1.1rem] text-paper text-left">{c.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {cv && (
          <a
            href={cv}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-14 text-link type-sc text-[1.1rem] text-paper"
          >
            Download CV
          </a>
        )}
      </div>
    </section>
  )
}
