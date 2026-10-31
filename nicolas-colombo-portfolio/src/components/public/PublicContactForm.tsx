'use client'

import React, { useState } from 'react'
import { submitClientInquiry } from '@/lib/actions/projects'
import { toastError } from '@/components/ui/Toast'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/utils/helpers'

/*
 * El formulario imita el encabezado de una hoja de exposición (X-sheet):
 * una grilla de celdas de línea fina, cada una con su rótulo en versalitas.
 */

const cell =
  'relative px-4 pt-3 pb-2 border-paper/15 transition-colors focus-within:bg-paper/[0.04]'
const label = 'block type-sc text-[0.95rem] text-lead'
const input =
  'w-full bg-transparent border-0 p-0 pt-1.5 pb-1 type-body text-paper placeholder:text-lead/60 ' +
  'focus:outline-none focus-visible:outline-none'

export default function PublicContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studio, setStudio] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toastError('Add your name, email and a message to send it.')
      return
    }

    setLoading(true)
    try {
      const fullMessage = studio.trim()
        ? `Studio / production: ${studio.trim()}\n\n${message.trim()}`
        : message.trim()
      const res = await submitClientInquiry({ name, email, message: fullMessage })
      if (!res || typeof res !== 'object') {
        throw new Error('The message could not be sent. Try again, or write to the email on the left.')
      }
      if (!res.success) {
        throw new Error(res.error || 'The message could not be sent. Try again, or write to the email on the left.')
      }
      setSentTo(email.trim())
      setName('')
      setStudio('')
      setMessage('')
    } catch (err: any) {
      toastError(err.message || 'The message could not be sent.')
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <div className="border border-paper/15 p-6 space-y-4" role="status">
        <p className="type-display text-display-md text-paper">Message sent</p>
        <p className="type-body text-lead max-w-[44ch]">
          Thanks for writing. I&apos;ll reply to <span className="text-paper">{sentTo}</span> as soon as I can.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="text-link type-sc text-[1.02rem] text-paper"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="type-body italic text-[1.15rem] text-paper/85 mb-4 text-center">Or send a message</p>

      <div className="border border-paper/15">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className={cn(cell, 'border-b sm:border-r')}>
            <label htmlFor="cf-name" className={label}>Name</label>
            <input
              id="cf-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
            />
          </div>
          <div className={cn(cell, 'border-b')}>
            <label htmlFor="cf-email" className={label}>Email</label>
            <input
              id="cf-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>
        </div>

        <div className={cn(cell, 'border-b')}>
          <label htmlFor="cf-studio" className={label}>
            Studio / production <span className="type-body italic tracking-normal text-lead/70">optional</span>
          </label>
          <input
            id="cf-studio"
            type="text"
            autoComplete="organization"
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            className={input}
          />
        </div>

        <div className={cell}>
          <label htmlFor="cf-message" className={label}>Notes</label>
          <textarea
            id="cf-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Role, project and dates"
            className={cn(input, 'resize-none leading-relaxed')}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-paper mt-6 disabled:opacity-60">
        {loading && <Spinner size={15} />}
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
