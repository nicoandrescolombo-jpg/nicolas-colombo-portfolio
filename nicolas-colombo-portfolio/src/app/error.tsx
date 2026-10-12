'use client'

import React from 'react'
import Button from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <span className="font-ui text-xs uppercase tracking-[0.3em] text-state-error font-medium mb-3">
        Error inesperado
      </span>
      <h1 className="font-display italic text-4xl md:text-5xl text-text-primary mb-4">
        Algo no salió como esperábamos
      </h1>
      <p className="font-body text-text-secondary max-w-md text-sm mb-8">
        Hubo un problema al cargar esta sección. Puedes intentar recargar la página.
      </p>
      <Button variant="primary" onClick={() => reset()}>
        Reintentar
      </Button>
    </div>
  )
}
