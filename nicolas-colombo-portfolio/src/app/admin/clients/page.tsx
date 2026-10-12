import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Calendar, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils/helpers'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  let clients: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) clients = data
  } catch (err) {
    console.error('Error fetching clients:', err)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-6 border-b border-[#222222] flex items-center justify-between">
        <div>
          <h1 className="font-display italic text-3xl text-text-primary">
            Base de Clientes & Contactos
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            Personas y estudios que completaron el formulario desde el sitio público.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#262626] text-xs font-ui text-text-tertiary">
          <Users size={14} className="text-accent" />
          <span>{clients.length} contactos registrados</span>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="p-12 text-center bg-[#141414] border border-[#222222] rounded-lg">
          <Users size={32} className="text-text-tertiary mx-auto mb-3" />
          <h3 className="font-display italic text-xl text-text-primary">
            Aún no hay mensajes de clientes
          </h3>
          <p className="font-body text-xs text-text-tertiary max-w-sm mx-auto mt-1">
            Cada vez que alguien complete el formulario en la web, su nombre, email y mensaje se guardarán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-6 bg-[#141414] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202020] pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl text-text-primary">
                    {client.name}
                  </h3>
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 font-ui text-xs text-accent hover:underline"
                  >
                    <Mail size={13} />
                    <span>{client.email}</span>
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-ui text-text-tertiary">
                  <Calendar size={12} />
                  <span>{formatDate(client.created_at)}</span>
                </div>
              </div>

              <div className="pt-1 flex items-start gap-2.5">
                <MessageSquare size={14} className="text-text-tertiary mt-1 flex-shrink-0" />
                <p className="font-body text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {client.message}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`mailto:${client.email}?subject=Respuesta a tu consulta&body=Hola ${encodeURIComponent(client.name)},\n\n`}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Responder por Gmail →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
