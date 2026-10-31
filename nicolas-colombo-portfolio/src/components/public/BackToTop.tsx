'use client'

import React from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="inline-flex items-center gap-1.5 hover:text-paper transition-colors"
    >
      Back to top
      <ArrowUp size={14} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
