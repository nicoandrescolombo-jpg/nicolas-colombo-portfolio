-- ==============================================================================
-- TABLA DE CLIENTES / MENSAJES DE CONTACTO (CLIENT INQUIRIES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 1. Cualquier visitante público puede ENVIAR un mensaje (INSERT)
DROP POLICY IF EXISTS "Public can submit contact inquiry" ON public.clients;
CREATE POLICY "Public can submit contact inquiry"
  ON public.clients
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. Solo el administrador autenticado puede VER los clientes y mensajes guardados (SELECT)
DROP POLICY IF EXISTS "Admins can view client inquiries" ON public.clients;
CREATE POLICY "Admins can view client inquiries"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Solo el administrador puede gestionar o eliminar registros
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
CREATE POLICY "Admins can manage clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
