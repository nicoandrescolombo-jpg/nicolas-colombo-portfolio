'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toastSuccess, toastError } from '@/components/ui/Toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toastSuccess('¡Bienvenido, Nicolas!')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      console.error('Error logging in:', err)
      toastError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-text-primary flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#141414] border border-[#222222] p-8 rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <span className="font-ui text-[11px] uppercase tracking-[0.25em] text-accent font-medium">
            Acceso Autorizado
          </span>
          <h1 className="font-display italic text-3xl text-text-primary mt-1">
            Nicolas Colombo
          </h1>
          <p className="font-body text-xs text-text-tertiary mt-2">
            Ingresa tus credenciales de administrador
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="admin-label">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nicolascolombo.art@gmail.com"
                required
                className="admin-input pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-text-tertiary" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="admin-label">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="admin-input pl-10"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-text-tertiary" />
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" isLoading={loading} className="w-full">
              Iniciar Sesión
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="font-ui text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  )
}
