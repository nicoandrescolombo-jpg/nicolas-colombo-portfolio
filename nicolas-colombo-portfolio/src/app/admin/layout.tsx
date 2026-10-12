import React from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Panel de Administración | Nicolas Colombo',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-text-primary flex">
      {/* Sidebar fijo */}
      <AdminSidebar />

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#222222] px-8 flex items-center justify-between bg-[#111111]">
          <span className="font-ui text-xs tracking-widest uppercase text-text-tertiary">
            Gestor de Contenido Profesional
          </span>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-ui text-xs text-text-secondary">Nicolas Colombo (Admin)</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
