-- ==============================================================================
-- 005: link externo del proyecto y piezas de la vista previa de la home
-- Correr una vez en Supabase → SQL Editor. Se puede correr de nuevo sin romper nada.
-- ==============================================================================

-- Link que se muestra junto a la descripción (canal de YouTube, sitio, etc.)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Piezas que se reproducen en la tarjeta de la home al pasar el mouse
ALTER TABLE public.project_media ADD COLUMN IF NOT EXISTS preview BOOLEAN NOT NULL DEFAULT false;
