import type { SiteSettings, Project } from '@/types'
import { MOCK_SETTINGS, MOCK_PROJECTS } from '@/lib/utils/mock-data'

/**
 * Get site settings.
 * In Phase 3, this will query Supabase.
 * Currently returns mock data.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // TODO Phase 3: Replace with Supabase query
  // const supabase = await createClient()
  // const { data } = await supabase.from('site_settings').select('key, value')
  // ... parse and return

  return MOCK_SETTINGS
}

/**
 * Get all published projects, ordered by sort_order.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  // TODO Phase 3: Replace with Supabase query
  return MOCK_PROJECTS.filter((p) => p.status === 'published').sort(
    (a, b) => a.sort_order - b.sort_order
  )
}

/**
 * Get a single project by slug (published only, for public pages).
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // TODO Phase 3: Replace with Supabase query
  return MOCK_PROJECTS.find((p) => p.slug === slug && p.status === 'published') ?? null
}

/**
 * Get all projects for admin (includes drafts).
 */
export async function getAllProjectsForAdmin(): Promise<Project[]> {
  // TODO Phase 3: Replace with Supabase query (requires admin auth)
  return MOCK_PROJECTS.sort((a, b) => a.sort_order - b.sort_order)
}
