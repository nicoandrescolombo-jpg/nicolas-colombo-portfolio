'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, ProjectFormData, MediaFormData, SiteSettings } from '@/types'
import { generateSlug } from '@/lib/utils/helpers'

/**
 * Helper to ensure user is authenticated admin before mutations.
 */
async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autorizado. Debes iniciar sesión como administrador.')
  }
  return supabase
}

/**
 * Create a new project.
 */
export async function createProject(formData: ProjectFormData): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await checkAuth()
    const slug = formData.slug || generateSlug(formData.title)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: formData.title,
        slug,
        description: formData.description || null,
        project_type: formData.project_type,
        status: formData.status || 'draft',
        cover_url: formData.cover_url || null,
        sort_order: formData.sort_order || 0,
      })
      .select('id, slug')
      .single()

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true, data }
  } catch (err: any) {
    console.error('Error in createProject:', err)
    return { success: false, error: err.message || 'Error al crear proyecto' }
  }
}

/**
 * Update an existing project.
 */
export async function updateProject(id: string, formData: Partial<ProjectFormData>): Promise<ActionResult> {
  try {
    const supabase = await checkAuth()

    const updatePayload: any = { ...formData }
    if (formData.title && !formData.slug) {
      updatePayload.slug = generateSlug(formData.title)
    }

    const { error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin')
    if (formData.slug) {
      revalidatePath(`/project/${formData.slug}`)
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error in updateProject:', err)
    return { success: false, error: err.message || 'Error al actualizar proyecto' }
  }
}

/**
 * Delete a project and its associated media.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const supabase = await checkAuth()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteProject:', err)
    return { success: false, error: err.message || 'Error al eliminar proyecto' }
  }
}

/**
 * Add media item to a project.
 */
export async function addProjectMedia(projectId: string, mediaData: MediaFormData & { storage_path?: string }): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await checkAuth()

    const { data, error } = await supabase
      .from('project_media')
      .insert({
        project_id: projectId,
        media_type: mediaData.media_type,
        storage_path: mediaData.storage_path || null,
        external_url: mediaData.external_url || null,
        alt_text: mediaData.alt_text || null,
        width: mediaData.width || null,
        height: mediaData.height || null,
        sort_order: mediaData.sort_order || 0,
      })
      .select('id')
      .single()

    if (error) throw error

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath('/')

    return { success: true, data }
  } catch (err: any) {
    console.error('Error in addProjectMedia:', err)
    return { success: false, error: err.message || 'Error al asociar archivo' }
  }
}

/**
 * Delete a media item.
 */
export async function deleteProjectMedia(mediaId: string, projectId: string): Promise<ActionResult> {
  try {
    const supabase = await checkAuth()

    const { error } = await supabase
      .from('project_media')
      .delete()
      .eq('id', mediaId)

    if (error) throw error

    revalidatePath(`/admin/projects/${projectId}`)
    revalidatePath('/')

    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteProjectMedia:', err)
    return { success: false, error: err.message || 'Error al eliminar archivo' }
  }
}

/**
 * Update site settings (Hero or Contact).
 */
export async function updateSiteSettings(key: 'hero' | 'contact' | 'identity', value: any): Promise<ActionResult> {
  try {
    const supabase = await checkAuth()

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value })

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath(`/admin/${key}`)

    return { success: true }
  } catch (err: any) {
    console.error('Error in updateSiteSettings:', err)
    return { success: false, error: err.message || 'Error al guardar configuración' }
  }
}
