import React from 'react'
import { cn } from '@/lib/utils/helpers'

/**
 * Marcas de encuadre de una guía de campo (field guide), muy tenues:
 * cuatro esquinas y las marcas de centro en los laterales.
 * Solo se usa donde se "inspecciona" un dibujo a su resolución real (pixel art).
 */
export default function FieldGuide({ className }: { className?: string }) {
  const corner = 'absolute w-4 h-4 border-current'
  return (
    <span className={cn('pointer-events-none absolute block text-paper/20', className)} aria-hidden="true">
      <span className={cn(corner, 'top-0 left-0 border-t border-l')} />
      <span className={cn(corner, 'top-0 right-0 border-t border-r')} />
      <span className={cn(corner, 'bottom-0 left-0 border-b border-l')} />
      <span className={cn(corner, 'bottom-0 right-0 border-b border-r')} />
      <span className="absolute left-0 top-1/2 w-2.5 h-px bg-current" />
      <span className="absolute right-0 top-1/2 w-2.5 h-px bg-current" />
      <span className="absolute top-0 left-1/2 h-2.5 w-px bg-current" />
      <span className="absolute bottom-0 left-1/2 h-2.5 w-px bg-current" />
    </span>
  )
}
