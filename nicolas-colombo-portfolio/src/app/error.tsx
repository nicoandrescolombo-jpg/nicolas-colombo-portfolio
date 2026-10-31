'use client'

import React from 'react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center">
      <div className="site-container">
        <p className="type-sc text-[1.1rem] text-lead">Something went wrong</p>
        <h1 className="mt-3 type-display text-display-xl max-w-[16ch]">
          This page didn’t load.
        </h1>
        <p className="mt-6 type-body text-lead max-w-[48ch]">
          It’s usually temporary. Try loading it again.
        </p>
        <button type="button" onClick={() => reset()} className="btn-paper mt-10">
          Try again
        </button>
      </div>
    </main>
  )
}
