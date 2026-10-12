import React from 'react'
import Button from '@/components/ui/Button'
import { Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
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
            Ingresa con tus credenciales de Supabase Auth
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="admin-label">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
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
                placeholder="••••••••••••"
                required
                className="admin-input pl-10"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-text-tertiary" />
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" className="w-full">
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
