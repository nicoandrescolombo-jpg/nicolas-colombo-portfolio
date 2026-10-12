-- ==============================================================================
-- SCRIPT COMPLETO DE BASE DE DATOS: NICOLAS COLOMBO — ANIMATOR 2D
-- Copia y pega todo este contenido en el SQL Editor de tu proyecto Supabase.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('individual', 'gif_sequence')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- 3. TABLA: PROJECT_MEDIA
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'gif', 'youtube', 'vimeo')),
  storage_path TEXT,
  external_url TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_media_project ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_sort ON public.project_media(project_id, sort_order);

-- 4. TABLA: SITE_SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TRIGGER AUTOMÁTICO DE ACTUALIZACIÓN DE FECHAS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER tr_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. VALORES INICIALES POR DEFECTO
INSERT INTO public.site_settings (key, value)
VALUES
  ('identity', '{"artist_name": "Nicolas Colombo", "subtitle": "Animator 2D"}'::jsonb),
  ('hero', '{"video_url": null, "video_mobile_url": null, "fallback_image_url": null, "overlay_opacity": 0.4}'::jsonb),
  ('contact', '{"email": "nicolascolombo.art@gmail.com", "instagram_url": null, "behance_url": null, "linkedin_url": null, "other_links": [], "contact_text": "Let''s create something", "visibility": {"email": true, "instagram": true, "behance": true, "linkedin": true}}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. ACTIVACIÓN DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE SEGURIDAD (RLS)
-- Lectura pública para proyectos publicados
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT TO public
  USING (status = 'published');

-- Control total de proyectos para el admin autenticado
DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Admins have full access to projects"
  ON public.projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Lectura pública de medios pertenecientes a proyectos publicados
DROP POLICY IF EXISTS "Public can view media of published projects" ON public.project_media;
CREATE POLICY "Public can view media of published projects"
  ON public.project_media FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_media.project_id
        AND public.projects.status = 'published'
    )
  );

-- Control total de medios para el admin autenticado
DROP POLICY IF EXISTS "Admins have full access to media" ON public.project_media;
CREATE POLICY "Admins have full access to media"
  ON public.project_media FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Lectura pública de configuración (nombre, redes, portada)
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO public
  USING (true);

-- Actualización de configuración sólo para el admin autenticado
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 9. CONFIGURACIÓN DE BUCKETS DE STORAGE (SI ES SOPORTADO VÍA SQL)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES 
    ('hero', 'hero', true, 52428800, ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']),
    ('projects', 'projects', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;


-- ==============================================================================
-- 10. TABLA: CLIENTS (BANCO DE CLIENTES / CONTACTOS)
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

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contact inquiry" ON public.clients;
CREATE POLICY "Public can submit contact inquiry"
  ON public.clients FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view client inquiries" ON public.clients;
CREATE POLICY "Admins can view client inquiries"
  ON public.clients FOR SELECT TO authenticated
  USING (true);
