'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Film, Sparkles, Mail, ExternalLink, LogOut, UserRound } from 'lucide-react'
import { ADMIN_ROUTES } from '@/lib/utils/constants'

const NAV_ITEMS = [
  { label: 'Proyectos', href: ADMIN_ROUTES.DASHBOARD, icon: Film },
  { label: 'Portada / Hero', href: ADMIN_ROUTES.HERO, icon: Sparkles },
  { label: 'Perfil y reel', href: ADMIN_ROUTES.PROFILE, icon: UserRound },
  { label: 'Contacto & Redes', href: ADMIN_ROUTES.CONTACT, icon: Mail },
  { label: 'Base de Clientes', href: '/admin/clients', icon: LayoutDashboard },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-[#111111] border-r border-[#222222] flex flex-col justify-between p-6">
      <div>
        {/* Brand / Logo */}
        <div className="mb-10 pb-6 border-b border-[#222222]">
          <Link href="/admin" className="block">
            <span className="font-ui text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Panel Privado
            </span>
            <h1 className="font-display italic text-2xl text-text-primary mt-1">
              Nicolas Colombo
            </h1>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== ADMIN_ROUTES.DASHBOARD && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md font-ui text-xs tracking-wider transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#181818]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-6 border-t border-[#222222] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-md font-ui text-xs text-text-tertiary hover:text-text-primary hover:bg-[#181818] transition-colors"
        >
          <span>Ver portafolio web</span>
          <ExternalLink size={14} />
        </Link>
      </div>
    </aside>
  )
}
