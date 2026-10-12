import { createClient as createServerSupabase } from '@/lib/supabase/server'
import type { Project, SiteSettings, ProjectMedia } from '@/types'
import { MOCK_SETTINGS, MOCK_PROJECTS } from '@/lib/utils/mock-data'

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )
}

/**
 * Get site settings from Supabase, or fallback to mock data if not connected.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return MOCK_SETTINGS
  }

  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error || !data || data.length === 0) {
      console.warn('Could not fetch settings from Supabase, using defaults:', error?.message)
      return MOCK_SETTINGS
    }

    const settingsMap = data.reduce((acc: any, row: any) => {
      acc[row.key] = row.value
      return acc
    }, {})

    return {
      identity: settingsMap.identity || MOCK_SETTINGS.identity,
      hero: settingsMap.hero || MOCK_SETTINGS.hero,
      contact: settingsMap.contact || MOCK_SETTINGS.contact,
    }
  } catch (err) {
    console.error('Error fetching site settings:', err)
    return MOCK_SETTINGS
  }
}

/**
 * Get all published projects with their ordered media from Supabase.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROJECTS.filter((p) => p.status === 'published').sort(
      (a, b) => a.sort_order - b.sort_order
    )
  }

  try {
    const supabase = await createServerSupabase()
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        media:project_media(*)
      `)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error || !projects) {
      console.warn('Error fetching projects from Supabase:', error?.message)
      return MOCK_PROJECTS
    }

    // Sort media within each project by sort_order
    return projects.map((p: any) => ({
      ...p,
      media: (p.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }))
  } catch (err) {
    console.error('Error fetching published projects:', err)
    return MOCK_PROJECTS
  }
}

/**
 * Get a single project by slug with its media.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROJECTS.find((p) => p.slug === slug && p.status === 'published') ?? null
  }

  try {
    const supabase = await createServerSupabase()
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        media:project_media(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !project) {
      return null
    }

    return {
      ...project,
      media: (project.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }
  } catch (err) {
    console.error('Error fetching project by slug:', err)
    return null
  }
}

/**
 * Get all projects for admin (including drafts and sort orders).
 */
export async function getAllProjectsForAdmin(): Promise<Project[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROJECTS.sort((a, b) => a.sort_order - b.sort_order)
  }

  try {
    const supabase = await createServerSupabase()
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        media:project_media(*)
      `)
      .order('sort_order', { ascending: true })

    if (error || !projects) {
      return MOCK_PROJECTS
    }

    return projects.map((p: any) => ({
      ...p,
      media: (p.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }))
  } catch (err) {
    console.error('Error fetching admin projects:', err)
    return MOCK_PROJECTS
  }
}

/**
 * Get single project by ID for admin editing.
 */
export async function getProjectById(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROJECTS.find((p) => p.id === id) ?? null
  }

  try {
    const supabase = await createServerSupabase()
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        media:project_media(*)
      `)
      .eq('id', id)
      .single()

    if (error || !project) {
      return null
    }

    return {
      ...project,
      media: (project.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }
  } catch (err) {
    console.error('Error fetching project by id:', err)
    return null
  }
}
