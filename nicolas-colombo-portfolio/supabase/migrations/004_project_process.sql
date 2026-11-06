-- ==============================================================================
-- 004: página de proyecto con resultado final, proceso y texto
-- Correr una vez en Supabase → SQL Editor. Se puede correr de nuevo sin romper nada.
-- ==============================================================================

-- 1. Proyecto: texto largo y créditos cortos
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS body   TEXT;  -- "Sobre el proyecto"
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client TEXT;  -- cliente / canal
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS role   TEXT;  -- qué hiciste
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS year   TEXT;  -- "2024–2026"

-- 2. Media: clips de video subidos (antes solo image | gif | youtube | vimeo)
ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_media_type_check;
ALTER TABLE public.project_media
  ADD CONSTRAINT project_media_media_type_check
  CHECK (media_type IN ('image', 'gif', 'video', 'webm', 'youtube', 'vimeo'));

-- 3. Media: sección (final o proceso), epígrafe y boceto ↔ final
ALTER TABLE public.project_media ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'final';
ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_section_check;
ALTER TABLE public.project_media
  ADD CONSTRAINT project_media_section_check CHECK (section IN ('final', 'process'));
ALTER TABLE public.project_media ADD COLUMN IF NOT EXISTS caption TEXT;
-- Un boceto puede apuntar a la pieza final que salió de él
ALTER TABLE public.project_media
  ADD COLUMN IF NOT EXISTS pair_id UUID REFERENCES public.project_media(id) ON DELETE SET NULL;

-- 4. Bucket "projects": aceptar video y archivos de hasta 50 MB (tope del plan free)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/webm', 'video/mp4']
WHERE id = 'projects';
