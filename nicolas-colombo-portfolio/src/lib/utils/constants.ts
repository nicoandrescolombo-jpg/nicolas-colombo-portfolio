import type { MediaType } from '@/types'

// Storage bucket names
export const BUCKETS = {
  HERO: 'hero',
  PROJECTS: 'projects',
} as const

// Accepted file types by media type
export const ACCEPTED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  gif: ['image/gif'],
  video: ['video/mp4', 'video/webm'],
}

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,       // 10 MB
  gif: 25 * 1024 * 1024,         // 25 MB
  hero_video: 50 * 1024 * 1024,  // 50 MB
  hero_video_mobile: 25 * 1024 * 1024, // 25 MB
  cover: 5 * 1024 * 1024,        // 5 MB
} as const

// Media types that use external URLs
export const EXTERNAL_MEDIA_TYPES: MediaType[] = ['youtube', 'vimeo']

// Media types that use file uploads
export const UPLOAD_MEDIA_TYPES: MediaType[] = ['image', 'gif']

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  LOGIN: '/admin/login',
  PROJECTS: '/admin/projects',
  NEW_PROJECT: '/admin/projects/new',
  HERO: '/admin/hero',
  PROFILE: '/admin/profile',
  CONTACT: '/admin/contact',
} as const

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  PROJECT: (slug: string) => `/project/${slug}`,
} as const

// Default settings
export const DEFAULT_OVERLAY_OPACITY = 0.4

// Grid layout pattern for projects gallery
// Repeating pattern: [wide, narrow], [narrow, wide], [full]
export const GRID_PATTERN = ['wide', 'narrow', 'narrow', 'wide', 'full'] as const

// Textos por defecto del perfil público (se usan si el campo no existe en la base)
export const DEFAULT_AVAILABILITY = 'Available for studio work'
export const DEFAULT_BIO =
  'I’m a 2D animator working in traditional and digital animation, character design and motion sequences, with a focus on timing, weight and body acting. Open to studio positions and freelance work on series, short films and commercials.'
