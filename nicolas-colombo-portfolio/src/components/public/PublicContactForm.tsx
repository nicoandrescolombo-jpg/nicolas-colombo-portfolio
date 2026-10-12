'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { submitClientInquiry } from '@/lib/actions/projects'
import { toastSuccess, toastError } from '@/components/ui/Toast'

interface ContactFormProps {
  targetEmail: string
}

export default function PublicContactForm({ targetEmail }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('Vi tu trabajo y me interesó mucho. Me gustaría consultar por un proyecto.')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toastError('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      // 1. Guardar en la base de datos de CLIENTES
      const res = await submitClientInquiry({ name, email, message })
      if (!res.success) {
        throw new Error(res.error)
      }

      setSubmitted(true)
      toastSuccess('¡Mensaje enviado con éxito!')

      // 2. Abrir cliente de correo preparado para nicoandres.colombo@gmail.com
      const mailtoSubject = encodeURIComponent(`Nuevo contacto desde portfolio: ${name}`)
      const mailtoBody = encodeURIComponent(`Hola Nicolas,\n\n${message}\n\n---\nRemitente: ${name}\nEmail: ${email}`)
      window.location.href = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`
    } catch (err: any) {
      toastError(err.message || 'Error al enviar mensaje')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto p-8 rounded-lg bg-[#141414]/90 border border-emerald-500/30 text-center space-y-4 backdrop-blur-md"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-display italic text-2xl text-text-primary">
          ¡Gracias por tu mensaje, {name}!
        </h3>
        <p className="font-body text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
          Tus datos se registraron correctamente. Me pondré en contacto contigo a la brevedad.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setName('')
            setEmail('')
          }}
          className="font-ui text-xs text-accent hover:underline uppercase tracking-wider pt-2"
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto p-8 rounded-lg bg-[#141414]/80 border border-[#252525] space-y-5 backdrop-blur-md shadow-2xl text-left"
    >
      <div className="border-b border-[#222222] pb-4 mb-2">
        <h3 className="font-display italic text-2xl text-text-primary">
          Escríbeme directamente
        </h3>
        <p className="font-body text-xs text-text-tertiary mt-1">
          Completa el formulario y te responderé a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="admin-label">Tu Nombre *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Laura Martínez"
            className="admin-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="admin-label">Tu Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@gmail.com"
            className="admin-input"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="admin-label">Mensaje *</label>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu consulta o propuesta..."
          className="admin-input resize-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button variant="primary" type="submit" isLoading={loading} className="w-full sm:w-auto gap-2">
          <Send size={15} />
          <span>Enviar Consulta</span>
        </Button>
      </div>
    </form>
  )
}
