-- ==============================================================================
-- RLS POLICIES & STORAGE SECURITY CONFIGURATION
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES: PROJECTS
-- Public (anonymous & authenticated) can only view published projects
CREATE POLICY "Public can view published projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (status = 'published');

-- Only authenticated users (Nicolas) can perform CRUD on projects
CREATE POLICY "Admins have full access to projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. POLICIES: PROJECT MEDIA
-- Public can view media associated with published projects
CREATE POLICY "Public can view media of published projects"
  ON public.project_media
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_media.project_id
        AND public.projects.status = 'published'
    )
  );

-- Admins have full access to media records
CREATE POLICY "Admins have full access to media"
  ON public.project_media
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. POLICIES: SITE SETTINGS
-- Public can read site settings (Hero URLs, Artist name, Contact links)
CREATE POLICY "Public can read site settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can modify site settings
CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION INSTRUCTIONS
-- In your Supabase Dashboard -> Storage:
-- Create two public buckets:
--   1. "hero"      (Public: true, max file size: 50MB, allowed MIME: video/mp4, video/webm, image/jpeg, image/png, image/webp)
--   2. "projects"  (Public: true, max file size: 25MB, allowed MIME: image/jpeg, image/png, image/webp, image/gif)
--
-- Then add the storage policies:
-- (Unauthenticated users have SELECT permission on public objects; only authenticated users have INSERT, UPDATE, DELETE permissions).
-- ==============================================================================

-- Storage RLS (run if storage schema is accessible directly):
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES 
    ('hero', 'hero', true, 52428800, ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']),
    ('projects', 'projects', true, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- If storage.buckets is restricted via SQL script, configure directly via dashboard
    NULL;
END $$;
