import type { Metadata } from 'next'
import { Instrument_Serif, Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Nicolas Colombo — Animator 2D',
    template: '%s | Nicolas Colombo',
  },
  description:
    'Portfolio profesional de Nicolas Colombo, animador 2D. Proyectos de animación, walk cycles y secuencias de movimiento.',
  keywords: ['animación 2D', 'animator', 'portafolio', 'walk cycle', 'Nicolas Colombo'],
  authors: [{ name: 'Nicolas Colombo' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Nicolas Colombo — Animator 2D',
    title: 'Nicolas Colombo — Animator 2D',
    description: 'Portfolio profesional de animación 2D.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nicolas Colombo — Animator 2D',
    description: 'Portfolio profesional de animación 2D.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`
        ${instrumentSerif.variable}
        ${spaceGrotesk.variable}
        ${inter.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <body className="bg-bg-primary text-text-primary font-body antialiased selection:bg-accent selection:text-bg-primary">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F5F5F5',
              border: '1px solid #333333',
              borderRadius: '6px',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#44FF88', secondary: '#1A1A1A' },
            },
            error: {
              iconTheme: { primary: '#FF4444', secondary: '#1A1A1A' },
            },
          }}
        />
      </body>
    </html>
  )
}
