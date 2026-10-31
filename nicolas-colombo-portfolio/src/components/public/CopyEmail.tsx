'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Email grande con botón para copiarlo (los reclutadores suelen pegarlo en su ATS o en Gmail) */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <a
        href={`mailto:${email}`}
        className="text-link type-display text-paper text-[clamp(1.5rem,3.4vw,2.5rem)] leading-tight break-all"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[2px] border border-paper/25 type-sc text-[0.98rem] text-paper/90 hover:border-paper/70 transition-colors"
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check size={14} strokeWidth={1.75} aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy size={14} strokeWidth={1.5} aria-hidden="true" />
            Copy email
          </>
        )}
      </button>
    </div>
  )
}
