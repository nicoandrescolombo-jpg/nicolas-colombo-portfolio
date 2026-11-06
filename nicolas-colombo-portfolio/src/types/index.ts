// Application types for Nicolas Colombo Portfolio

export type ProjectType = 'individual' | 'gif_sequence'
export type ProjectStatus = 'draft' | 'published'
/** 'webm' queda por compatibilidad con filas viejas; lo nuevo se guarda como 'video' */
export type MediaType = 'image' | 'gif' | 'youtube' | 'vimeo' | 'video' | 'webm'
export type MediaSection = 'final' | 'process'

export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  project_type: ProjectType
  status: ProjectStatus
  cover_url: string | null
  sort_order: number
  /** Texto largo "About the project" (párrafos separados por línea en blanco) */
  body?: string | null
  client?: string | null
  role?: string | null
  year?: string | null
  /** Link junto a la descripción (canal de YouTube, sitio…) */
  link_url?: string | null
  created_at: string
  updated_at: string
  // Joined
  media?: ProjectMedia[]
}

export interface ProjectMedia {
  id: string
  project_id: string
  media_type: MediaType
  storage_path: string | null
  external_url: string | null
  alt_text: string | null
  width: number | null
  height: number | null
  sort_order: number
  created_at: string
  /** Si falta (base sin migrar), se toma como 'final' */
  section?: MediaSection
  caption?: string | null
  /** Para un boceto: id de la pieza final que salió de él */
  pair_id?: string | null
  /** Se reproduce en la tarjeta de la home al pasar el mouse */
  preview?: boolean
}

// Site settings stored as key/value JSON in site_settings table
export interface IdentitySettings {
  artist_name: string
  subtitle: string
  // Campos opcionales (se editan en Admin → Perfil y reel).
  // Si un campo no existe en la base, el sitio usa un valor por defecto;
  // si existe pero está vacío, ese bloque se oculta.
  availability?: string
  location?: string
  bio?: string
  tools?: string
  cv_url?: string
  reel_url?: string
}

/** Video principal que abre el botón "Watch reel" */
export interface ReelInfo {
  url: string
  embedUrl: string
  title: string
}

export interface HeroSettings {
  video_url: string | null
  video_mobile_url: string | null
  fallback_image_url: string | null
  overlay_opacity: number
}

export interface ContactLink {
  label: string
  url: string
  visible: boolean
}

export interface ContactSettings {
  email: string | null
  instagram_url: string | null
  behance_url: string | null
  linkedin_url: string | null
  other_links: ContactLink[]
  contact_text: string | null
  background_type?: 'color' | 'image' | 'video'
  background_url?: string | null
  background_overlay_opacity?: number
  visibility: {
    email: boolean
    instagram: boolean
    behance: boolean
    linkedin: boolean
  }
}

export interface ClientInquiry {
  id?: string
  name: string
  email: string
  message: string
  created_at?: string
}

export interface SiteSettings {
  identity: IdentitySettings
  hero: HeroSettings
  contact: ContactSettings
}

// Form types
export interface ProjectFormData {
  title: string
  slug: string
  description: string
  project_type: ProjectType
  status: ProjectStatus
  cover_url: string
  sort_order: number
  body?: string
  client?: string
  role?: string
  year?: string
  link_url?: string
}

export interface MediaFormData {
  media_type: MediaType
  external_url?: string
  alt_text?: string
  width?: number
  height?: number
  sort_order: number
  section?: MediaSection
  caption?: string
  pair_id?: string | null
  preview?: boolean
}

// API response types
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Grid layout types for the gallery
export type GridSpan = 'col-span-1' | 'col-span-2' | 'col-span-full'

export interface GridItem {
  project: Project
  span: GridSpan
}
